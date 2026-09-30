'use client';
import Link from 'next/link';
import { Button, StatePanel } from '@commerce/ui';
import type { ReactNode } from 'react';
export function QueryBoundary({ pending, error, empty, children }: { pending: boolean; error: Error | null; empty?: boolean; children: ReactNode }) { if (pending) return <StatePanel kind="loading" title="Loading data" message="Fetching the latest records…"/>; if (error && 'status' in error && error.status === 401) return <div><StatePanel kind="denied" title="Authentication required" message="Sign in with a staff account to access this area."/><Button asChild className="mx-auto mt-5 flex w-fit"><Link href="/login">Staff sign in</Link></Button></div>; if (error) return <StatePanel kind="error" title="Data could not be loaded" message={error.message}/>; if (empty) return <StatePanel kind="empty" title="No records yet" message="Create the first record or adjust your filters."/>; return children; }
