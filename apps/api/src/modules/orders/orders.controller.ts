import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, RequirePermissions, type AuthUser } from '../../common/auth.decorators';
import { CheckoutDto, OrdersQueryDto, PaymentWebhookDto, UpdateOrderStatusDto } from './orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Public() @Post('checkout') checkout(@Body() dto: CheckoutDto) { return this.orders.checkout(dto); }
  @Public() @Post('payments/webhooks/manual') webhook(@Req() request: Request, @Headers('x-payment-signature') signature: string, @Body() dto: PaymentWebhookDto) { return this.orders.webhook(Buffer.from(JSON.stringify(request.body)), signature ?? '', dto); }
  @Get('orders/me') myOrders(@CurrentUser() user: AuthUser) {
    if (!user.customerId) return [];
    return this.orders.customerOrders(user.customerId);
  }
  @Get('orders/me/:id') myOrder(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    if (!user.customerId) return this.orders.customerOrder('__missing__', id);
    return this.orders.customerOrder(user.customerId, id);
  }
  @RequirePermissions('orders:read') @Get('admin/orders') list(@CurrentUser() user: AuthUser, @Query() query: OrdersQueryDto) { return this.orders.list(user.tenantId, query); }
  @RequirePermissions('orders:read') @Get('admin/orders/:id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.orders.get(user.tenantId, id); }
  @RequirePermissions('orders:write') @Patch('admin/orders/:id/status') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) { return this.orders.updateStatus(user.tenantId, id, dto.status, user.sub); }
}
