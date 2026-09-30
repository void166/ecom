import type { ApiSuccess, Cart, ProductSummary } from '@commerce/shared-types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error { constructor(message: string, readonly status: number) { super(message); } }

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } });
  const body = (await response.json()) as ApiSuccess<T> | { error?: { message?: string } };
  if (!response.ok) throw new ApiClientError('error' in body ? body.error?.message ?? 'Request failed' : 'Request failed', response.status);
  return (body as ApiSuccess<T>).data;
}

export type ProductPage = { items: ProductSummary[]; meta: { page: number; pageSize: number; total: number; pageCount: number } };
export const catalogApi = {
  products: (search = '') => api<ProductPage>(`/catalog/products${search ? `?${search}` : ''}`, { next: { revalidate: 60 } }),
  product: (slug: string) => api<ProductSummary>(`/catalog/products/${slug}`, { next: { revalidate: 60 } }),
  cart: (id: string) => api<Cart>(`/carts/${id}`, { cache: 'no-store' }),
};
