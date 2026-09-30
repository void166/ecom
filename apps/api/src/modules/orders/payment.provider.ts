import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
export type PaymentRequest = { orderId: string; amountMinor: number; currency: string; idempotencyKey: string };
export type PaymentIntent = { provider: string; reference: string; status: 'pending'; instructions: string };
export interface PaymentProvider { createIntent(request: PaymentRequest): Promise<PaymentIntent>; verifyWebhook(rawBody: Buffer, signature: string): boolean; }

@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  async createIntent(request: PaymentRequest): Promise<PaymentIntent> {
    return { provider: 'manual', reference: `dev_${request.orderId}_${randomUUID()}`, status: 'pending', instructions: 'Development provider only. Use the signed webhook endpoint to simulate settlement.' };
  }
  verifyWebhook(): boolean { return false; }
}
