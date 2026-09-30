import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const cartInclude = { items: { include: { variant: { include: { product: { select: { id: true, name: true, slug: true } }, inventory: true } } } } };

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
  async create(anonymousId?: string) { const tenant = await this.prisma.tenant.findFirst(); if (!tenant) throw new BadRequestException('Store not initialized'); return this.present(await this.prisma.cart.create({ data: { tenantId: tenant.id, anonymousId }, include: cartInclude })); }
  async get(id: string) { const cart = await this.prisma.cart.findFirst({ where: { id, status: 'ACTIVE' }, include: cartInclude }); if (!cart) throw new NotFoundException('Cart not found'); return this.present(cart); }
  async add(id: string, variantId: string, quantity: number) {
    const cart = await this.prisma.cart.findFirst({ where: { id, status: 'ACTIVE' } });
    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, active: true, product: { tenantId: cart?.tenantId, status: 'ACTIVE' } }, include: { inventory: true } });
    if (!cart) throw new NotFoundException('Cart not found');
    if (!variant) throw new NotFoundException('Product variant not found');
    const existing = await this.prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: id, variantId } } });
    const requested = (existing?.quantity ?? 0) + quantity;
    if (!variant.inventory || variant.inventory.onHand - variant.inventory.reserved < requested) throw new BadRequestException('Requested quantity is not available');
    await this.prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: id, variantId } }, create: { cartId: id, variantId, quantity, unitPriceMinor: variant.priceMinor }, update: { quantity: requested, unitPriceMinor: variant.priceMinor } });
    return this.get(id);
  }
  async update(id: string, itemId: string, quantity: number) { const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId: id }, include: { variant: { include: { inventory: true } } } }); if (!item) throw new NotFoundException('Cart item not found'); if (quantity === 0) await this.prisma.cartItem.delete({ where: { id: itemId } }); else { if (!item.variant.inventory || item.variant.inventory.onHand - item.variant.inventory.reserved < quantity) throw new BadRequestException('Requested quantity is not available'); await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity, unitPriceMinor: item.variant.priceMinor } }); } return this.get(id); }
  async remove(id: string, itemId: string) { const result = await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: id } }); if (!result.count) throw new NotFoundException('Cart item not found'); return this.get(id); }
  private present(cart: Awaited<ReturnType<PrismaService['cart']['findFirstOrThrow']>> | any) { const items = cart.items.map((item: any) => ({ ...item, lineTotalMinor: item.unitPriceMinor * item.quantity, variant: { ...item.variant, inventory: item.variant.inventory ? { ...item.variant.inventory, available: item.variant.inventory.onHand - item.variant.inventory.reserved } : null } })); const subtotalMinor = items.reduce((sum: number, item: any) => sum + item.lineTotalMinor, 0); return { ...cart, items, subtotalMinor, discountMinor: 0, totalMinor: subtotalMinor }; }
}
