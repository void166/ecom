import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ManualPaymentProvider, PAYMENT_PROVIDER } from './payment.provider';

@Module({
  imports: [BullModule.registerQueue({ name: 'order-events' })],
  controllers: [OrdersController],
  providers: [OrdersService, ManualPaymentProvider, { provide: PAYMENT_PROVIDER, useExisting: ManualPaymentProvider }],
  exports: [OrdersService],
})
export class OrdersModule {}
