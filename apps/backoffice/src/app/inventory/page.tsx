'use client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@commerce/ui';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
type Stock = { id: string; onHand: number; reserved: number; available: number; reorderAt: number; lowStock: boolean; updatedAt: string; variant: { id: string; name: string; sku: string; product: { name: string } } }; type Page = { items: Stock[]; meta: { total: number } };
export default function InventoryPage() { const query = useQuery({ queryKey: ['inventory'], queryFn: () => api<Page>('/admin/inventory?pageSize=50') }); return <><PageHeader title="Inventory" description="On-hand stock, active reservations, and replenishment signals."/><QueryBoundary pending={query.isPending} error={query.error} empty={query.data?.items.length === 0}>{query.data && <DataTable rows={query.data.items} columns={[{ key: 'item', label: 'Variant', render: (row) => <div><p className="font-semibold">{row.variant.product.name}</p><p className="text-xs text-neutral-500">{row.variant.name} · {row.variant.sku}</p></div> }, { key: 'onhand', label: 'On hand', render: (row) => row.onHand }, { key: 'reserved', label: 'Reserved', render: (row) => row.reserved }, { key: 'available', label: 'Available', render: (row) => <span className="font-bold">{row.available}</span> }, { key: 'state', label: 'Status', render: (row) => <Badge className={row.lowStock ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}>{row.lowStock ? 'Low stock' : 'Healthy'}</Badge> }]}/>}</QueryBoundary></>; }
