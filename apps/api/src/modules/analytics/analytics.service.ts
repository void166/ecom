import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}
  async dashboard(tenantId: string) {
    const since = new Date(); since.setUTCDate(since.getUTCDate() - 29); since.setUTCHours(0, 0, 0, 0);
    const [orders, customers, lowStock] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where: { tenantId, paymentStatus: 'CAPTURED', createdAt: { gte: since } }, select: { totalMinor: true, createdAt: true } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.inventory.findMany({ where: { variant: { product: { tenantId } } }, select: { onHand: true, reserved: true, reorderAt: true } }),
    ]);
    const revenueMinor = orders.reduce((sum, order) => sum + order.totalMinor, 0);
    const byDay = new Map<string, { revenueMinor: number; orders: number }>();
    for (let index = 0; index < 30; index++) { const day = new Date(since); day.setUTCDate(day.getUTCDate() + index); byDay.set(day.toISOString().slice(0, 10), { revenueMinor: 0, orders: 0 }); }
    for (const order of orders) { const day = order.createdAt.toISOString().slice(0, 10); const value = byDay.get(day); if (value) { value.revenueMinor += order.totalMinor; value.orders += 1; } }
    return { revenueMinor, orders: orders.length, customers, averageOrderMinor: orders.length ? Math.round(revenueMinor / orders.length) : 0, lowStockVariants: lowStock.filter((stock) => stock.onHand - stock.reserved <= stock.reorderAt).length, revenueSeries: [...byDay.entries()].map(([date, value]) => ({ date, ...value })) };
  }
  auditLogs(tenantId: string) { return this.prisma.auditLog.findMany({ where: { tenantId }, include: { actor: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }); }
}
