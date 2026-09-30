import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';

export class CheckoutAddressDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsString() @Length(2, 2) countryCode = 'MN';
}

export class CheckoutDto {
  @IsString() cartId: string;
  @IsEmail() email: string;
  @ValidateNested() @Type(() => CheckoutAddressDto) shippingAddress: CheckoutAddressDto;
  @IsString() @Length(12, 120) idempotencyKey: string;
  @IsOptional() @IsString() paymentProvider = 'manual';
}

export class OrdersQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() search?: string;
}

export class UpdateOrderStatusDto { @IsEnum(OrderStatus) status: OrderStatus; }

export class PaymentWebhookDto {
  @IsString() eventId: string;
  @IsString() paymentId: string;
  @IsString() status: 'captured' | 'failed';
  @IsOptional() @IsString() providerRef?: string;
}
