import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { OrderStatus, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { pageResult } from '../../common/page';
import { CheckoutDto, OrdersQueryDto, PaymentWebhookDto } from './orders.dto';
import { assertOrderTransition } from './order-state';
import { PAYMENT_PROVIDER, type PaymentProvider } from './payment.provider';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider, @InjectQueue('order-events') private readonly queue: Queue) {}

  async checkout(dto: CheckoutDto) {
    const existing = await this.prisma.order.findFirst({ where: { idempotencyKey: dto.idempotencyKey }, include: { payments: true } });
    if (existing) return existing;
    let order;
    try {
      order = await this.prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findFirst({ where: { id: dto.cartId, status: 'ACTIVE' }, include: { items: { include: { variant: { include: { product: true, inventory: true } } } } } });
        if (!cart?.items.length) throw new BadRequestException('Cart is empty or unavailable');
        const priced = cart.items.map((item) => {
          const available = (item.variant.inventory?.onHand ?? 0) - (item.variant.inventory?.reserved ?? 0);
          if (!item.variant.active || item.variant.product.status !== 'ACTIVE' || available < item.quantity) throw new ConflictException(`${item.variant.sku} is no longer available in the requested quantity`);
          return { item, unitPriceMinor: item.variant.priceMinor, totalMinor: item.variant.priceMinor * item.quantity };
        });
        const currencies = new Set(priced.map(({ item }) => item.variant.currency));
        if (currencies.size !== 1) throw new BadRequestException('A cart cannot contain multiple currencies');
        const subtotalMinor = priced.reduce((sum, line) => sum + line.totalMinor, 0);
        const email = dto.email.toLowerCase();
        const customer = await tx.customer.upsert({ where: { tenantId_email: { tenantId: cart.tenantId, email } }, create: { tenantId: cart.tenantId, email, firstName: dto.shippingAddress.firstName, lastName: dto.shippingAddress.lastName, phone: dto.shippingAddress.phone, tags: [] }, update: { firstName: dto.shippingAddress.firstName, lastName: dto.shippingAddress.lastName, phone: dto.shippingAddress.phone } });
        const count = await tx.order.count({ where: { tenantId: cart.tenantId } });
        const created = await tx.order.create({ data: { tenantId: cart.tenantId, customerId: customer.id, cartId: cart.id, number: `ORD-${new Date().getUTCFullYear()}-${String(count + 1).padStart(6, '0')}`, currency: [...currencies][0]!, subtotalMinor, totalMinor: subtotalMinor, shippingAddress: { ...dto.shippingAddress }, idempotencyKey: dto.idempotencyKey, items: { create: priced.map(({ item, unitPriceMinor, totalMinor }) => ({ variantId: item.variantId, productName: item.variant.product.name, variantName: item.variant.name, sku: item.variant.sku, quantity: item.quantity, unitPriceMinor, totalMinor })) } }, include: { items: true } });
        for (const { item } of priced) {
          await tx.inventory.update({ where: { variantId: item.variantId }, data: { reserved: { increment: item.quantity }, version: { increment: 1 }, movements: { create: { type: 'RESERVATION', quantity: item.quantity, reference: created.id } } } });
        }
        await tx.cart.update({ where: { id: cart.id }, data: { status: 'CONVERTED' } });
        return created;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new ConflictException('Inventory changed during checkout; please retry');
      throw error;
    }
    const intent = await this.payments.createIntent({ orderId: order.id, amountMinor: order.totalMinor, currency: order.currency, idempotencyKey: dto.idempotencyKey });
    const payment = await this.prisma.payment.create({ data: { orderId: order.id, provider: intent.provider, providerRef: intent.reference, idempotencyKey: dto.idempotencyKey, amountMinor: order.totalMinor, currency: order.currency } });
    await this.queue.add('order.created', { orderId: order.id }, { jobId: `order-created-${order.id}`, attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
    return { ...order, payment, paymentIntent: intent };
  }

  async list(tenantId: string, query: OrdersQueryDto) {
    const where: Prisma.OrderWhereInput = { tenantId, ...(query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ number: { contains: query.search, mode: 'insensitive' } }, { customer: { email: { contains: query.search, mode: 'insensitive' } } }] } : {}) };
    const [items, total] = await this.prisma.$transaction([this.prisma.order.findMany({ where, include: { customer: true, items: true, payments: true }, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.prisma.order.count({ where })]);
    return pageResult(items, total, query.page, query.pageSize);
  }
  async get(tenantId: string, id: string) { const order = await this.prisma.order.findFirst({ where: { id, tenantId }, include: { customer: true, items: true, payments: true } }); if (!order) throw new NotFoundException('Order not found'); return order; }
  customerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, payments: { select: { status: true, provider: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async customerOrder(customerId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: { items: true, payments: { select: { status: true, provider: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
  async updateStatus(tenantId: string, id: string, status: OrderStatus, actorId: string) { const order = await this.get(tenantId, id); assertOrderTransition(order.status, status); return this.prisma.$transaction(async (tx) => { const updated = await tx.order.update({ where: { id }, data: { status } }); await tx.auditLog.create({ data: { tenantId, actorId, action: 'order.status_changed', entityType: 'Order', entityId: id, before: { status: order.status }, after: { status } } }); return updated; }); }

  async webhook(raw: Buffer, signature: string, dto: PaymentWebhookDto) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) throw new Error('PAYMENT_WEBHOOK_SECRET is not configured');
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    const received = Buffer.from(signature, 'utf8'); const expectedBuffer = Buffer.from(expected, 'utf8');
    if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) throw new BadRequestException('Invalid webhook signature');
    const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId }, include: { order: true } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (await this.prisma.paymentEvent.findUnique({ where: { providerEventId: dto.eventId } })) return { duplicate: true };
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentEvent.create({ data: { paymentId: payment.id, providerEventId: dto.eventId, type: dto.status, payload: dto as never, processedAt: new Date() } });
      if (dto.status === 'captured') {
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'CAPTURED', providerRef: dto.providerRef ?? payment.providerRef } });
        await tx.order.update({ where: { id: payment.orderId }, data: { status: 'PAID', paymentStatus: 'CAPTURED' } });
        for (const item of await tx.orderItem.findMany({ where: { orderId: payment.orderId } })) await tx.inventory.update({ where: { variantId: item.variantId }, data: { onHand: { decrement: item.quantity }, reserved: { decrement: item.quantity }, movements: { create: { type: 'SALE', quantity: -item.quantity, reference: payment.orderId } } } });
      } else await tx.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    });
    return { processed: true };
  }
}
