import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { AdminShell } from '@/components/admin-shell';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Dashboard', template: '%s — Northstar Ops' }, robots: { index: false, follow: false } };
export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body><Providers><AdminShell>{children}</AdminShell></Providers></body></html>; }
