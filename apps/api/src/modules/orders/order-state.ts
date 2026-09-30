import { BadRequestException } from '@nestjs/common';
import type { OrderStatus } from '@prisma/client';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['FULFILLED', 'CANCELLED', 'REFUNDED'],
  FULFILLED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!transitions[from].includes(to)) throw new BadRequestException(`Order cannot transition from ${from} to ${to}`);
}
