'use client';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, CardContent, StatePanel, formatMoney } from '@commerce/ui';
import Link from 'next/link';
import { api } from '@/lib/api';
type CustomerOrder = { id: string; number: string; status: string; totalMinor: number; currency: string; createdAt: string; items: Array<{ id: string; productName: string; variantName: string; quantity: number }> };
export default function AccountOrdersPage() {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('commerce-access-token');
  const orders = useQuery({ queryKey: ['my-orders'], enabled: Boolean(token), queryFn: () => api<CustomerOrder[]>('/orders/me', { headers: { authorization: `Bearer ${token}` } }) });
  return <div className="mx-auto max-w-5xl px-5 py-14"><h1 className="display mb-10 text-5xl">Your orders</h1>{!token ? <StatePanel kind="denied" title="Sign in to view orders" message="Your purchase history is private to your account."/> : orders.isPending ? <StatePanel kind="loading" title="Loading orders" message="Checking your order history…"/> : orders.isError ? <StatePanel kind="error" title="Orders could not be loaded" message={orders.error.message}/> : !orders.data.length ? <StatePanel kind="empty" title="No orders yet" message="Your first order will appear here after checkout."/> : <div className="grid gap-4">{orders.data.map((order) => <Card key={order.id}><CardContent className="grid gap-5 pt-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-3"><Link href={`/account/orders/${order.id}`} className="font-bold hover:underline">{order.number}</Link><Badge>{order.status.replaceAll('_', ' ')}</Badge></div><p className="mt-2 text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p></div><p className="font-bold">{formatMoney(order.totalMinor, order.currency)}</p></CardContent></Card>)}</div>}</div>;
}
