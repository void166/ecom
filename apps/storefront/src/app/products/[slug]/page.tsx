import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, RotateCcw, Truck } from 'lucide-react';
import { formatMoney } from '@commerce/ui';
import { catalogApi } from '@/lib/api';
import { AddToCart } from '@/components/add-to-cart';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { try { const product = await catalogApi.product((await params).slug); return { title: product.seo?.title ?? product.name, description: product.seo?.description ?? product.description, robots: product.seo?.noIndex ? { index: false } : undefined, alternates: product.seo?.canonicalUrl ? { canonical: product.seo.canonicalUrl } : undefined }; } catch { return { title: 'Product' }; } }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  let product; try { product = await catalogApi.product((await params).slug); } catch { notFound(); }
  const variant = product.variants[0]; if (!variant) notFound(); const available = variant.inventory?.available ?? 0;
  return <div className="mx-auto grid max-w-7xl gap-12 px-5 py-10 md:grid-cols-[1.2fr_.8fr] lg:gap-20 lg:px-8"><div className="grid gap-4 sm:grid-cols-2"><div className="product-art relative aspect-[4/5] sm:col-span-2"><div className="absolute inset-x-[30%] bottom-[10%] top-[15%] rounded-[45%_45%_30%_30%] bg-black/15 shadow-2xl"/></div><div className="aspect-square bg-[#d9d7cf]"/><div className="aspect-square bg-[#c5c9be]"/></div><div className="md:sticky md:top-28 md:self-start"><p className="text-xs font-bold uppercase tracking-[.2em] text-neutral-500">{product.category?.name}</p><h1 className="display mt-4 text-5xl leading-none">{product.name}</h1><p className="mt-5 text-lg font-semibold">{formatMoney(variant.priceMinor, variant.currency)}</p><p className="mt-7 leading-7 text-neutral-600">{product.description}</p><div className="my-8 border-y border-black/10 py-5"><p className="text-sm font-semibold">{variant.name}</p><p className="mt-1 text-xs text-neutral-500">{available > 0 ? `${available} available` : 'Currently unavailable'}</p></div><AddToCart variantId={variant.id} available={available}/><div className="mt-8 grid gap-4 border-t border-black/10 pt-6 text-sm"><p className="flex gap-3"><Truck className="size-5"/> Complimentary delivery over ₮250,000</p><p className="flex gap-3"><RotateCcw className="size-5"/> 30-day considered returns</p><p className="flex gap-3"><Check className="size-5"/> Two-year maker guarantee</p></div></div></div>;
}
