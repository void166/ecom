'use client';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f6f1]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        <Link href="/" className="display text-2xl font-bold">Northstar</Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/products">Shop</Link><Link href="/categories/essentials">Essentials</Link><Link href="/categories/workspace">Workspace</Link><Link href="/about">Our story</Link>
        </nav>
        <div className="flex items-center gap-4"><Link href="/products" aria-label="Search"><Search className="size-5" /></Link><Link href="/account" aria-label="Account" className="hidden sm:block"><UserRound className="size-5" /></Link><Link href="/cart" aria-label="Cart"><ShoppingBag className="size-5" /></Link></div>
      </div>
      {open && <nav className="grid gap-4 border-t border-black/10 px-5 py-6 text-lg md:hidden"><Link onClick={() => setOpen(false)} href="/products">Shop all</Link><Link onClick={() => setOpen(false)} href="/categories/essentials">Essentials</Link><Link onClick={() => setOpen(false)} href="/categories/workspace">Workspace</Link><Link onClick={() => setOpen(false)} href="/account">Account</Link></nav>}
    </header>
  );
}
