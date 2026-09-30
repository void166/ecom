'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge, formatMoney } from '@commerce/ui';
import { api } from '@/lib/api';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
type Customer = { id: string; firstName: string; lastName: string; email: string; tags: string[]; lifetimeSpendMinor: number; createdAt: string; _count: { orders: number } }; type Page = { items: Customer[]; meta: { total: number } };
export default function CustomersPage() { const query = useQuery({ queryKey: ['customers'], queryFn: () => api<Page>('/admin/customers?pageSize=50') }); return <><PageHeader title="Customers / CRM" description="Profiles synchronized from storefront accounts and orders."/><QueryBoundary pending={query.isPending} error={query.error} empty={query.data?.items.length === 0}>{query.data && <DataTable rows={query.data.items} columns={[{ key: 'customer', label: 'Customer', render: (row) => <Link href={`/customers/${row.id}`} className="font-semibold text-emerald-800 hover:underline">{row.firstName} {row.lastName}<span className="block text-xs font-normal text-neutral-500">{row.email}</span></Link> }, { key: 'joined', label: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString() }, { key: 'orders', label: 'Orders', render: (row) => row._count.orders }, { key: 'spend', label: 'Lifetime spend', render: (row) => <span className="font-semibold">{formatMoney(row.lifetimeSpendMinor)}</span> }, { key: 'tags', label: 'Segments', render: (row) => <div className="flex gap-1">{row.tags.length ? row.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : <span className="text-neutral-400">—</span>}</div> }]}/>}</QueryBoundary></>; }
