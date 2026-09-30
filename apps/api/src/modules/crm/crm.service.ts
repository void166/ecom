import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { pageResult } from '../../common/page';
import { AddInteractionDto, CustomerQueryDto } from './crm.dto';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}
  async list(tenantId: string, query: CustomerQueryDto) {
    const where: Prisma.CustomerWhereInput = { tenantId, ...(query.tag ? { tags: { has: query.tag } } : {}), ...(query.search ? { OR: [{ email: { contains: query.search, mode: 'insensitive' } }, { firstName: { contains: query.search, mode: 'insensitive' } }, { lastName: { contains: query.search, mode: 'insensitive' } }] } : {}) };
    const [items, total] = await this.prisma.$transaction([this.prisma.customer.findMany({ where, include: { _count: { select: { orders: true } }, orders: { where: { paymentStatus: 'CAPTURED' }, select: { totalMinor: true } } }, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.prisma.customer.count({ where })]);
    return pageResult(items.map(({ orders, ...customer }) => ({ ...customer, lifetimeSpendMinor: orders.reduce((sum, order) => sum + order.totalMinor, 0) })), total, query.page, query.pageSize);
  }
  async detail(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id, tenantId }, include: { addresses: true, orders: { orderBy: { createdAt: 'desc' }, include: { items: true } }, notes: { orderBy: { createdAt: 'desc' } }, interactions: { orderBy: { occurredAt: 'desc' } }, segments: { include: { segment: true } } } });
    if (!customer) throw new NotFoundException('Customer not found');
    return { ...customer, lifetimeSpendMinor: customer.orders.filter((order) => order.paymentStatus === 'CAPTURED').reduce((sum, order) => sum + order.totalMinor, 0) };
  }
  async note(tenantId: string, customerId: string, authorId: string, body: string) { await this.assertCustomer(tenantId, customerId); return this.prisma.customerNote.create({ data: { customerId, authorId, body } }); }
  async interaction(tenantId: string, customerId: string, dto: AddInteractionDto) { await this.assertCustomer(tenantId, customerId); return this.prisma.customerInteraction.create({ data: { customerId, ...dto } }); }
  private async assertCustomer(tenantId: string, id: string) { if (!(await this.prisma.customer.count({ where: { id, tenantId } }))) throw new NotFoundException('Customer not found'); }
}
