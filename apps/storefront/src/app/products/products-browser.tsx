'use client';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { StatePanel } from '@commerce/ui';
import { ProductCard } from '@/components/product-card';
import { catalogApi } from '@/lib/api';

export function ProductsBrowser({ category }: { category?: string }) {
  const [search, setSearch] = useState(''); const [sort, setSort] = useState('newest'); const deferredSearch = useDeferredValue(search);
  const params = new URLSearchParams({ pageSize: '40', sort }); if (deferredSearch) params.set('search', deferredSearch); if (category) params.set('category', category);
  const products = useQuery({ queryKey: ['products', params.toString()], queryFn: () => catalogApi.products(params.toString()) });
  return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><header className="border-b border-black/10 pb-10"><p className="text-xs font-bold uppercase tracking-[.22em] text-neutral-500">Collection</p><h1 className="display mt-3 text-6xl">{category ? category.replaceAll('-', ' ') : 'All objects'}</h1><p className="mt-5 max-w-lg text-neutral-600">Useful, beautiful pieces selected for the way they feel, function, and age.</p></header><div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between"><label className="flex max-w-sm flex-1 items-center gap-3 border-b border-neutral-400 pb-2"><Search className="size-4"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search the collection"/></label><div className="flex items-center gap-2"><SlidersHorizontal className="size-4"/><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent text-sm font-semibold outline-none"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select></div></div>{products.isPending ? <StatePanel kind="loading" title="Loading collection" message="Finding the right pieces…"/> : products.isError ? <StatePanel kind="error" title="We couldn't load the collection" message="Check that the API is running, then try again."/> : products.data.items.length === 0 ? <StatePanel kind="empty" title="No objects found" message="Try a broader search or another category."/> : <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">{products.data.items.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div>}</div>;
}
