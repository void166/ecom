import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({ where: { slug: 'northstar' }, update: {}, create: { name: 'Northstar Supply', slug: 'northstar' } });
  const permissionKeys = ['products:read', 'products:write', 'inventory:read', 'inventory:write', 'orders:read', 'orders:write', 'customers:read', 'customers:write', 'analytics:read', 'metadata:write', 'staff:write', 'audit:read'];
  for (const key of permissionKeys) await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  const adminRole = await prisma.role.upsert({ where: { name: 'administrator' }, update: {}, create: { name: 'administrator', description: 'Full back-office access' } });
  await prisma.role.upsert({ where: { name: 'customer' }, update: {}, create: { name: 'customer', description: 'Storefront customer' } });
  const permissions = await prisma.permission.findMany();
  for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } }, update: {}, create: { roleId: adminRole.id, permissionId: permission.id } });
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  const admin = await prisma.user.upsert({ where: { tenantId_email: { tenantId: tenant.id, email: 'admin@example.com' } }, update: {}, create: { tenantId: tenant.id, email: 'admin@example.com', passwordHash, firstName: 'Store', lastName: 'Admin' } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { tenantId_slug: { tenantId: tenant.id, slug: 'essentials' } }, update: {}, create: { tenantId: tenant.id, name: 'Everyday Essentials', slug: 'essentials', description: 'Quietly useful objects, made to last.', position: 1 } }),
    prisma.category.upsert({ where: { tenantId_slug: { tenantId: tenant.id, slug: 'workspace' } }, update: {}, create: { tenantId: tenant.id, name: 'Workspace', slug: 'workspace', description: 'Considered tools for focused work.', position: 2 } }),
    prisma.category.upsert({ where: { tenantId_slug: { tenantId: tenant.id, slug: 'travel' } }, update: {}, create: { tenantId: tenant.id, name: 'Travel', slug: 'travel', description: 'Refined companions for moving well.', position: 3 } }),
  ]);
  const products = [
    { name: 'Merino Field Tote', slug: 'merino-field-tote', description: 'A softly structured everyday carry in weather-resistant recycled wool.', categoryId: categories[0].id, featured: true, sku: 'NST-TOTE-OAT', variant: 'Oat / One size', priceMinor: 18900000, stock: 24 },
    { name: 'Arc Desk Lamp', slug: 'arc-desk-lamp', description: 'Warm, flicker-free light with a compact sculptural silhouette.', categoryId: categories[1].id, featured: true, sku: 'NST-LAMP-BLK', variant: 'Black', priceMinor: 26900000, stock: 12 },
    { name: 'Transit Weekender', slug: 'transit-weekender', description: 'A calm, capable weekender with a separate shoe compartment.', categoryId: categories[2].id, featured: true, sku: 'NST-WKND-OLV', variant: 'Olive / 38L', priceMinor: 34900000, stock: 8 },
    { name: 'Stoneware Carafe', slug: 'stoneware-carafe', description: 'Hand-finished stoneware for water, wine, or a single branch.', categoryId: categories[0].id, featured: false, sku: 'NST-CRF-CRM', variant: 'Cream / 1.2L', priceMinor: 12900000, stock: 32 },
  ];
  for (const item of products) {
    if (await prisma.product.findUnique({ where: { tenantId_slug: { tenantId: tenant.id, slug: item.slug } } })) continue;
    await prisma.product.create({ data: { tenantId: tenant.id, name: item.name, slug: item.slug, description: item.description, categoryId: item.categoryId, status: 'ACTIVE', featured: item.featured, seo: { create: { title: `${item.name} — Northstar Supply`, description: item.description } }, variants: { create: { name: item.variant, sku: item.sku, priceMinor: item.priceMinor, currency: 'MNT', attributes: {}, inventory: { create: { onHand: item.stock, reorderAt: 5, movements: { create: { type: 'RECEIPT', quantity: item.stock, note: 'Seed inventory' } } } } } } } });
  }
  console.log('Seed complete. Development admin: admin@example.com / ChangeMe123!');
}

main().finally(() => prisma.$disconnect());
