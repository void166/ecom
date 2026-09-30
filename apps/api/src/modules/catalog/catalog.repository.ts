import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogQueryDto } from './catalog.dto';

export const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { where: { active: true }, include: { inventory: true } },
  media: { orderBy: { position: 'asc' as const } },
  seo: true,
};

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}
  async list(tenantId: string, query: CatalogQueryDto, publicOnly: boolean) {
    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(publicOnly ? { status: ProductStatus.ACTIVE } : query.status ? { status: query.status } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }, { variants: { some: { sku: { contains: query.search, mode: 'insensitive' } } } }] } : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput = query.sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: productInclude, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.product.count({ where }),
    ]);
    const withAvailability = items.map((product) => ({ ...product, variants: product.variants.map((variant) => ({ ...variant, inventory: variant.inventory ? { ...variant.inventory, available: variant.inventory.onHand - variant.inventory.reserved } : null })) }));
    if (query.sort === 'price-asc' || query.sort === 'price-desc') withAvailability.sort((a, b) => ((a.variants[0]?.priceMinor ?? 0) - (b.variants[0]?.priceMinor ?? 0)) * (query.sort === 'price-asc' ? 1 : -1));
    return { items: withAvailability, total };
  }
  findBySlug(tenantId: string, slug: string, publicOnly = true) { return this.prisma.product.findFirst({ where: { tenantId, slug, ...(publicOnly ? { status: ProductStatus.ACTIVE } : {}) }, include: productInclude }); }
}
