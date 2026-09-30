import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCartDto { @IsOptional() @IsString() anonymousId?: string; }
export class AddCartItemDto { @IsString() variantId: string; @IsInt() @Min(1) @Max(99) quantity: number; }
export class UpdateCartItemDto { @IsInt() @Min(0) @Max(99) quantity: number; }
