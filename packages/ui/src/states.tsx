import { AlertCircle, Inbox, LoaderCircle, LockKeyhole } from 'lucide-react';

const icons = { loading: LoaderCircle, empty: Inbox, error: AlertCircle, denied: LockKeyhole } as const;

export function StatePanel({ kind, title, message }: { kind: keyof typeof icons; title: string; message: string }) {
  const Icon = icons[kind];
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
      <Icon className={kind === 'loading' ? 'mb-4 size-7 animate-spin' : 'mb-4 size-7'} />
      <h2 className="font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>
    </div>
  );
}
