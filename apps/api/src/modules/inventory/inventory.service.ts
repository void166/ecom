import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pageResult } from '../../common/page';
import { AdjustStockDto, InventoryQueryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}
  async list(tenantId: string, query: InventoryQueryDto) {
    const where = { variant: { product: { tenantId }, ...(query.search ? { OR: [{ sku: { contains: query.search, mode: 'insensitive' as const } }, { product: { name: { contains: query.search, mode: 'insensitive' as const } } }] } : {}) } };
    const [all, total] = await this.prisma.$transaction([this.prisma.inventory.findMany({ where, include: { variant: { include: { product: { select: { id: true, name: true, slug: true } } } } }, orderBy: { updatedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.prisma.inventory.count({ where })]);
    const items = all.map((item) => ({ ...item, available: item.onHand - item.reserved, lowStock: item.onHand - item.reserved <= (query.lowStockAt ?? item.reorderAt) }));
    return pageResult(items, total, query.page, query.pageSize);
  }
  async adjust(tenantId: string, variantId: string, dto: AdjustStockDto, actorId: string) {
    if (!dto.quantity) throw new BadRequestException('Quantity must not be zero');
    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, product: { tenantId } }, include: { inventory: true } });
    if (!variant?.inventory) throw new NotFoundException('Inventory not found');
    return this.prisma.$transaction(async (tx) => {
      const nextOnHand = variant.inventory!.onHand + dto.quantity;
      if (nextOnHand < variant.inventory!.reserved || nextOnHand < 0) throw new BadRequestException('Adjustment would reduce inventory below reserved quantity');
      const inventory = await tx.inventory.update({ where: { id: variant.inventory!.id }, data: { onHand: { increment: dto.quantity }, version: { increment: 1 }, movements: { create: { type: dto.type, quantity: dto.quantity, note: dto.note, reference: dto.reference, createdById: actorId } } } });
      await tx.auditLog.create({ data: { tenantId, actorId, action: 'inventory.adjusted', entityType: 'ProductVariant', entityId: variantId, before: { onHand: variant.inventory!.onHand }, after: { onHand: inventory.onHand, quantity: dto.quantity } } });
      return { ...inventory, available: inventory.onHand - inventory.reserved };
    });
  }
}
