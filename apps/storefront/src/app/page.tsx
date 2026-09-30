import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@commerce/ui';
import { catalogApi } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import type { ProductSummary } from '@commerce/shared-types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: ProductSummary[] = []; let unavailable = false;
  try { products = (await catalogApi.products('pageSize=4')).items; } catch { unavailable = true; }
  return <>
    <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-2 lg:px-8">
      <div className="rise"><p className="mb-6 text-xs font-bold uppercase tracking-[.25em] text-neutral-500">Autumn / Winter 2026</p><h1 className="display max-w-xl text-6xl leading-[.92] sm:text-7xl lg:text-8xl">Objects that earn their place.</h1><p className="mt-8 max-w-md text-lg leading-8 text-neutral-600">An edited collection of enduring, tactile goods for the home, the desk, and the road.</p><Button asChild size="lg" className="mt-9"><Link href="/products">Explore the collection <ArrowRight className="ml-3 size-4" /></Link></Button></div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#b8b5a8]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,#ebe8dd_0,transparent_30%),linear-gradient(145deg,#d8d2c3,#8f9786)]"/><div className="absolute bottom-[8%] left-[24%] h-[68%] w-[55%] rounded-[48%_48%_25%_25%] bg-[#36382f]/75 shadow-2xl"/><p className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[.2em] text-white">The Field Collection</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="mb-10 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-neutral-500">Curated for now</p><h2 className="display mt-3 text-4xl sm:text-5xl">New and noteworthy</h2></div><Link href="/products" className="hidden items-center gap-2 text-sm font-semibold sm:flex">Shop all <ArrowRight className="size-4"/></Link></div>{unavailable ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">The catalog service is currently unavailable. Start the API to view live products.</div> : products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-7">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div> : <div className="rounded-xl border border-dashed p-12 text-center text-neutral-500">The collection is being prepared.</div>}</section>
    <section className="bg-[#dce1d5]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 lg:px-8"><p className="display text-5xl leading-tight">Buy less.<br/>Choose well.<br/>Keep it longer.</p><div className="max-w-lg self-end"><p className="text-lg leading-8 text-neutral-700">We work with independent makers who share our belief that good design should be useful, responsible, and quietly beautiful.</p><Link href="/about" className="mt-7 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-bold">Read our approach <ArrowRight className="size-4"/></Link></div></div></section>
  </>;
}
