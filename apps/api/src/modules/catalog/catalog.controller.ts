import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, RequirePermissions, type AuthUser } from '../../common/auth.decorators';
import { CatalogQueryDto, CreateCategoryDto, CreateProductDto, SeoDto } from './catalog.dto';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService, private readonly prisma: PrismaService) {}
  private async tenantId() { const tenant = await this.prisma.tenant.findFirst({ select: { id: true } }); if (!tenant) throw new Error('Store not initialized'); return tenant.id; }

  @Public() @Get('catalog/products') async products(@Query() query: CatalogQueryDto) { return this.catalog.list(await this.tenantId(), query, true); }
  @Public() @Get('catalog/products/:slug') async product(@Param('slug') slug: string) { return this.catalog.detail(await this.tenantId(), slug, true); }
  @Public() @Get('catalog/categories') async categories() { return this.catalog.categories(await this.tenantId()); }

  @RequirePermissions('products:read') @Get('admin/products') adminProducts(@CurrentUser() user: AuthUser, @Query() query: CatalogQueryDto) { return this.catalog.list(user.tenantId, query, false); }
  @RequirePermissions('products:write') @Post('admin/products') createProduct(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) { return this.catalog.create(user.tenantId, dto); }
  @RequirePermissions('products:write') @Post('admin/categories') createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) { return this.catalog.createCategory(user.tenantId, dto); }
  @RequirePermissions('metadata:write') @Put('admin/products/:id/seo') seo(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SeoDto) { return this.catalog.updateSeo(user.tenantId, id, dto); }
}
