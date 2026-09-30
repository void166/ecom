import Link from 'next/link';
import type { ProductSummary } from '@commerce/shared-types';
import { formatMoney } from '@commerce/ui';
import { Heart } from 'lucide-react';

export function ProductCard({ product, index = 0 }: { product: ProductSummary; index?: number }) {
  const variant = product.variants[0];
  return <article className="group rise" style={{ animationDelay: `${index * 55}ms` }}><Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-[#ddd9cd]"><div className="product-art absolute inset-0 transition duration-700 group-hover:scale-105"><div className="absolute inset-x-[22%] bottom-[12%] top-[18%] rounded-[45%_45%_35%_35%] bg-black/15 shadow-2xl" /></div>{product.featured && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">Featured</span>}<button aria-label="Add to wishlist" className="absolute right-4 top-4 rounded-full bg-white/90 p-2 opacity-0 transition group-hover:opacity-100"><Heart className="size-4" /></button></Link><div className="mt-4 flex justify-between gap-3"><div><Link href={`/products/${product.slug}`} className="font-semibold">{product.name}</Link><p className="mt-1 text-sm text-neutral-500">{variant?.name}</p></div><p className="text-sm font-semibold">{variant ? formatMoney(variant.priceMinor, variant.currency) : 'Unavailable'}</p></div></article>;
}
