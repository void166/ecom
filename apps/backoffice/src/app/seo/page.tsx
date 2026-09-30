'use client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@commerce/ui';
import type { ProductSummary } from '@commerce/shared-types';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
type Page = { items: ProductSummary[]; meta: { total: number } };
export default function SeoPage() { const query = useQuery({ queryKey: ['seo-products'], queryFn: () => api<Page>('/admin/products?pageSize=100') }); return <><PageHeader title="SEO metadata" description="Titles, descriptions, indexing, and canonical controls consumed by the storefront."/><QueryBoundary pending={query.isPending} error={query.error} empty={query.data?.items.length === 0}>{query.data && <DataTable rows={query.data.items} columns={[{ key: 'page', label: 'Product page', render: (row) => <div><p className="font-semibold">{row.name}</p><p className="text-xs text-neutral-500">/products/{row.slug}</p></div> }, { key: 'title', label: 'SEO title', render: (row) => row.seo?.title ?? <span className="text-neutral-400">Uses product name</span> }, { key: 'description', label: 'Description', render: (row) => <span className="line-clamp-2 max-w-md text-neutral-600">{row.seo?.description ?? row.description ?? '—'}</span> }, { key: 'index', label: 'Indexing', render: (row) => <Badge className={row.seo?.noIndex ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>{row.seo?.noIndex ? 'No index' : 'Index'}</Badge> }]}/>}</QueryBoundary></>; }
