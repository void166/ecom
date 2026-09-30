'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@commerce/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
export default function LoginPage() { const router = useRouter(); const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) }); const submit = form.handleSubmit(async (values) => { try { const session = await api<{ accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(values) }); localStorage.setItem('commerce-access-token', session.accessToken); localStorage.setItem('commerce-refresh-token', session.refreshToken); router.push('/account'); } catch (error) { form.setError('root', { message: error instanceof Error ? error.message : 'Sign in failed' }); } }); return <div className="mx-auto max-w-md px-5 py-20"><h1 className="display text-5xl">Welcome back</h1><p className="mt-3 text-neutral-500">Sign in to see your orders and account.</p><form onSubmit={submit} className="mt-9 grid gap-5"><label><span className="mb-2 block text-sm font-semibold">Email</span><input {...form.register('email')} className="h-12 w-full rounded-lg border px-4"/></label><label><span className="mb-2 block text-sm font-semibold">Password</span><input {...form.register('password')} type="password" className="h-12 w-full rounded-lg border px-4"/></label>{form.formState.errors.root && <p className="text-sm text-red-700">{form.formState.errors.root.message}</p>}<Button type="submit" size="lg">Sign in</Button></form><p className="mt-6 text-center text-sm">New here? <Link href="/register" className="font-semibold underline">Create an account</Link></p></div>; }
