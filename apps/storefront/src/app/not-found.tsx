import Link from 'next/link';
import { Button, StatePanel } from '@commerce/ui';
export default function NotFound() { return <div className="mx-auto max-w-3xl px-5 py-24"><StatePanel kind="empty" title="This page has moved" message="The object or page you're looking for is no longer here."/><Button asChild className="mx-auto mt-6 flex w-fit"><Link href="/products">Explore the collection</Link></Button></div>; }
