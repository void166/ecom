'use client';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, formatMoney } from '@commerce/ui';
import type { DashboardMetrics } from '@commerce/shared-types';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { QueryBoundary } from '@/components/query-boundary';
export default function AnalyticsPage() { const query = useQuery({ queryKey: ['analytics'], queryFn: () => api<DashboardMetrics>('/admin/analytics/dashboard') }); return <><PageHeader title="Analytics" description="First-party revenue and order reporting from captured transactions."/><QueryBoundary pending={query.isPending} error={query.error}>{query.data && <Card><CardContent className="pt-6"><h2 className="font-bold">Daily orders and revenue</h2><p className="mt-1 text-sm text-neutral-500">Last 30 calendar days</p><div className="mt-7 h-[420px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={query.data.revenueSeries}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11 }}/><YAxis yAxisId="left" hide/><YAxis yAxisId="right" orientation="right" allowDecimals={false}/><Tooltip formatter={(value, name) => name === 'revenueMinor' ? formatMoney(Number(value)) : value}/><Bar yAxisId="left" dataKey="revenueMinor" fill="#14532d" radius={[4,4,0,0]}/><Bar yAxisId="right" dataKey="orders" fill="#bbf7d0" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></CardContent></Card>}</QueryBoundary></>; }
