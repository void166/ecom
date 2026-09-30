import { BadRequestException } from '@nestjs/common';
import { assertOrderTransition } from './order-state';

describe('order state transitions', () => {
  it('allows a paid order to enter processing', () => {
    expect(() => assertOrderTransition('PAID', 'PROCESSING')).not.toThrow();
  });

  it('prevents terminal fulfilled orders from being cancelled', () => {
    expect(() => assertOrderTransition('FULFILLED', 'CANCELLED')).toThrow(BadRequestException);
  });

  it('prevents skipping payment', () => {
    expect(() => assertOrderTransition('PENDING_PAYMENT', 'FULFILLED')).toThrow(
      'Order cannot transition from PENDING_PAYMENT to FULFILLED',
    );
  });
});
