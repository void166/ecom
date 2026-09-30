import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';

export class InventoryQueryDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsInt() @Min(0) lowStockAt?: number;
}

export class AdjustStockDto {
  @IsEnum(StockMovementType) type: StockMovementType;
  @IsInt() quantity: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() reference?: string;
}
