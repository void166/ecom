'use client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@commerce/ui';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';

export function AddToCart({ variantId, available }: { variantId: string; available: number }) {
  const [quantity, setQuantity] = useState(1);
  const mutation = useMutation({ mutationFn: async () => { let cartId = localStorage.getItem('commerce-cart-id'); if (!cartId) { const cart = await api<{ id: string }>('/carts', { method: 'POST', body: '{}' }); cartId = cart.id; localStorage.setItem('commerce-cart-id', cartId); } if (!cartId) throw new Error('Cart could not be created'); return api(`/carts/${cartId}/items`, { method: 'POST', body: JSON.stringify({ variantId, quantity }) }); } });
  return <div><div className="mb-4 flex items-center gap-4"><span className="text-sm font-semibold">Quantity</span><div className="flex items-center rounded-full border border-neutral-300"><button className="p-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="size-3"/></button><span className="w-8 text-center text-sm">{quantity}</span><button className="p-3" onClick={() => setQuantity(Math.min(available, quantity + 1))}><Plus className="size-3"/></button></div></div><Button className="w-full" size="lg" onClick={() => mutation.mutate()} disabled={!available || mutation.isPending}>{mutation.isSuccess ? <><Check className="mr-2 size-4"/> Added to bag</> : <><ShoppingBag className="mr-2 size-4"/> {mutation.isPending ? 'Adding…' : available ? 'Add to bag' : 'Out of stock'}</>}</Button>{mutation.isError && <p className="mt-3 text-sm text-red-700">{mutation.error.message}</p>}</div>;
}
