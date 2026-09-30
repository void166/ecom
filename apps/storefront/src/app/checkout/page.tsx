'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, StatePanel } from '@commerce/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';

const schema = z.object({ email: z.string().email(), firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().optional(), line1: z.string().min(3), city: z.string().min(2), postalCode: z.string().optional(), countryCode: z.string().length(2) });
type FormValues = z.infer<typeof schema>;
export default function CheckoutPage() {
  const router = useRouter(); const cartId = typeof window === 'undefined' ? null : localStorage.getItem('commerce-cart-id');
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { countryCode: 'MN' } });
  const checkout = useMutation({ mutationFn: (values: FormValues) => api<{ id: string; number: string }>('/checkout', { method: 'POST', body: JSON.stringify({ cartId, email: values.email, shippingAddress: values, idempotencyKey: crypto.randomUUID() }) }), onSuccess: (order) => { localStorage.removeItem('commerce-cart-id'); router.push(`/checkout/success?order=${order.number}`); } });
  if (!cartId) return <div className="mx-auto max-w-3xl px-5 py-20"><StatePanel kind="empty" title="There is nothing to check out" message="Add an item to your bag first."/></div>;
  const fields: Array<[keyof FormValues, string, string?]> = [['email', 'Email', 'email'], ['firstName', 'First name'], ['lastName', 'Last name'], ['phone', 'Phone', 'tel'], ['line1', 'Street address'], ['city', 'City'], ['postalCode', 'Postal code'], ['countryCode', 'Country code']];
  return <div className="mx-auto max-w-3xl px-5 py-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-neutral-500">Secure checkout</p><h1 className="display mt-3 text-5xl">Delivery details</h1><form onSubmit={form.handleSubmit((values) => checkout.mutate(values))} className="mt-10 grid gap-5 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-10">{fields.map(([name, label, type]) => <label key={name} className={name === 'email' || name === 'line1' ? 'sm:col-span-2' : ''}><span className="mb-2 block text-sm font-semibold">{label}</span><input {...form.register(name)} type={type} className="h-12 w-full rounded-lg border border-neutral-300 px-4 outline-none focus:border-black"/>{form.formState.errors[name] && <span className="mt-1 block text-xs text-red-600">{form.formState.errors[name]?.message}</span>}</label>)}<div className="mt-3 border-t border-black/10 pt-6 sm:col-span-2"><Button type="submit" size="lg" className="w-full" disabled={checkout.isPending}>{checkout.isPending ? 'Creating your order…' : 'Place order'}</Button><p className="mt-3 text-center text-xs text-neutral-500">Payments use a development-only provider until a verified provider is configured.</p>{checkout.isError && <p className="mt-3 text-center text-sm text-red-700">{checkout.error.message}</p>}</div></form></div>;
}
