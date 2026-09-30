import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';

export class CatalogQueryDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsString() sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
}

export class CreateVariantDto {
  @IsString() @Length(1, 100) name: string;
  @IsString() @Length(1, 80) sku: string;
  @IsInt() @Min(0) priceMinor: number;
  @IsOptional() @IsInt() @Min(0) compareAtMinor?: number;
  @IsOptional() @IsString() @Length(3, 3) currency = 'MNT';
  @IsOptional() @IsObject() attributes: Record<string, string> = {};
  @IsOptional() @IsInt() @Min(0) initialStock = 0;
}

export class CreateProductDto {
  @IsString() @Length(1, 160) name: string;
  @IsString() @Length(1, 180) slug: string;
  @IsOptional() @IsString() @Length(0, 5000) description?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsEnum(ProductStatus) status: ProductStatus = ProductStatus.DRAFT;
  @IsOptional() @IsBoolean() featured = false;
  @ValidateNested({ each: true }) @Type(() => CreateVariantDto) variants: CreateVariantDto[];
}

export class CreateCategoryDto {
  @IsString() @Length(1, 120) name: string;
  @IsString() @Length(1, 140) slug: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() parentId?: string;
}

export class SeoDto {
  @IsOptional() @IsString() @Length(0, 70) title?: string;
  @IsOptional() @IsString() @Length(0, 170) description?: string;
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsBoolean() noIndex = false;
}
