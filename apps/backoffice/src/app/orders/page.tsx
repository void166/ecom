'use client';
import { useQuery } from '@tanstack/react-query';
import { Badge, formatMoney } from '@commerce/ui';
import type { OrderSummary } from '@commerce/shared-types';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
type Page = { items: OrderSummary[]; meta: { total: number } };
const colors: Record<string, string> = { PAID: 'bg-emerald-50 text-emerald-700', FULFILLED: 'bg-blue-50 text-blue-700', PENDING_PAYMENT: 'bg-amber-50 text-amber-700', CANCELLED: 'bg-red-50 text-red-700' };
export default function OrdersPage() { const query = useQuery({ queryKey: ['orders'], queryFn: () => api<Page>('/admin/orders?pageSize=50') }); return <><PageHeader title="Orders" description="Manage payment, processing, and fulfillment state transitions."/><QueryBoundary pending={query.isPending} error={query.error} empty={query.data?.items.length === 0}>{query.data && <DataTable rows={query.data.items} columns={[{ key: 'number', label: 'Order', render: (row) => <span className="font-semibold">{row.number}</span> }, { key: 'date', label: 'Placed', render: (row) => new Date(row.createdAt).toLocaleDateString() }, { key: 'customer', label: 'Customer', render: (row) => <div><p>{row.customer.firstName} {row.customer.lastName}</p><p className="text-xs text-neutral-500">{row.customer.email}</p></div> }, { key: 'status', label: 'Status', render: (row) => <Badge className={colors[row.status]}>{row.status.replaceAll('_', ' ')}</Badge> }, { key: 'total', label: 'Total', render: (row) => <span className="font-semibold">{formatMoney(row.totalMinor, row.currency)}</span> }]}/>}</QueryBoundary></>; }
