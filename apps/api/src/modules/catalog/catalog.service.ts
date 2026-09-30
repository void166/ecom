import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pageResult } from '../../common/page';
import { CatalogQueryDto, CreateCategoryDto, CreateProductDto, SeoDto } from './catalog.dto';
import { CatalogRepository } from './catalog.repository';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService, private readonly repository: CatalogRepository) {}
  async list(tenantId: string, query: CatalogQueryDto, publicOnly = true) { const result = await this.repository.list(tenantId, query, publicOnly); return pageResult(result.items, result.total, query.page, query.pageSize); }
  async detail(tenantId: string, slug: string, publicOnly = true) {
    const product = await this.repository.findBySlug(tenantId, slug, publicOnly);
    if (!product) throw new NotFoundException('Product not found');
    return {
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        inventory: variant.inventory
          ? { ...variant.inventory, available: variant.inventory.onHand - variant.inventory.reserved }
          : null,
      })),
    };
  }
  categories(tenantId: string) { return this.prisma.category.findMany({ where: { tenantId, active: true }, include: { seo: true, _count: { select: { products: true } } }, orderBy: [{ position: 'asc' }, { name: 'asc' }] }); }
  async createCategory(tenantId: string, dto: CreateCategoryDto) { try { return await this.prisma.category.create({ data: { tenantId, ...dto } }); } catch { throw new ConflictException('Category slug must be unique'); } }
  async create(tenantId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.$transaction(async (tx) => tx.product.create({ data: { tenantId, name: dto.name, slug: dto.slug, description: dto.description, categoryId: dto.categoryId, status: dto.status, featured: dto.featured, variants: { create: dto.variants.map(({ initialStock, ...variant }) => ({ ...variant, inventory: { create: { onHand: initialStock, movements: initialStock ? { create: { type: 'RECEIPT', quantity: initialStock, note: 'Initial inventory' } } : undefined } } })) } }, include: { variants: { include: { inventory: true } }, category: true } }));
    } catch { throw new ConflictException('Product slug and variant SKU must be unique'); }
  }
  async updateSeo(tenantId: string, productId: string, dto: SeoDto) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.seoMetadata.upsert({ where: { productId }, create: { productId, ...dto }, update: dto });
  }
}
