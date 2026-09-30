'use client';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, formatMoney } from '@commerce/ui';
import { Plus } from 'lucide-react';
import type { ProductSummary } from '@commerce/shared-types';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
type Page = { items: ProductSummary[]; meta: { total: number } };
export default function ProductsPage() { const query = useQuery({ queryKey: ['admin-products'], queryFn: () => api<Page>('/admin/products?pageSize=50') }); return <><PageHeader title="Products" description={`${query.data?.meta.total ?? 0} products across the live and draft catalog.`} actions={<Button><Plus className="mr-2 size-4"/> Add product</Button>}/><QueryBoundary pending={query.isPending} error={query.error} empty={query.data?.items.length === 0}>{query.data && <DataTable rows={query.data.items} columns={[{ key: 'product', label: 'Product', render: (row) => <div className="flex items-center gap-3"><div className="size-11 rounded-lg bg-gradient-to-br from-stone-200 to-stone-400"/><div><p className="font-semibold">{row.name}</p><p className="text-xs text-neutral-500">{row.variants[0]?.sku}</p></div></div> }, { key: 'category', label: 'Category', render: (row) => row.category?.name ?? 'Uncategorized' }, { key: 'status', label: 'Status', render: (row) => <Badge className={row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : ''}>{row.status}</Badge> }, { key: 'stock', label: 'Available', render: (row) => row.variants.reduce((sum, variant) => sum + (variant.inventory?.available ?? 0), 0) }, { key: 'price', label: 'Price', render: (row) => row.variants[0] ? formatMoney(row.variants[0].priceMinor, row.variants[0].currency) : '—' }]}/>}</QueryBoundary></>; }
