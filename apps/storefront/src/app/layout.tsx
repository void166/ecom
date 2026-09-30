import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = { title: { default: 'Northstar Supply', template: '%s — Northstar Supply' }, description: 'Considered objects for everyday rituals.', metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000') };
export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body><Providers><SiteHeader /><main>{children}</main><SiteFooter /></Providers></body></html>; }
