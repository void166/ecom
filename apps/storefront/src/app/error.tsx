'use client';
import { Button, StatePanel } from '@commerce/ui';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="mx-auto max-w-3xl px-5 py-24"><StatePanel kind="error" title="Something went off course" message="The page could not be loaded. Your cart and account are safe."/><Button onClick={reset} className="mx-auto mt-6 flex">Try again</Button></div>; }
