'use client';
import { Button, StatePanel } from '@commerce/ui';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div><StatePanel kind="error" title="Dashboard error" message="This view could not be loaded."/><Button onClick={reset} className="mx-auto mt-5 flex">Retry</Button></div>; }
