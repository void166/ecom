export type ApiSuccess<T> = { data: T; meta?: PaginationMeta };
export type ApiError = {
  error: { code: string; message: string; details?: Record<string, unknown>; requestId?: string };
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  featured: boolean;
  category?: { id: string; name: string; slug: string } | null;
  variants: ProductVariant[];
  seo?: SeoMetadata | null;
  createdAt: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceMinor: number;
  compareAtMinor: number | null;
  currency: string;
  attributes: Record<string, string>;
  inventory?: { onHand: number; reserved: number; available: number } | null;
};

export type SeoMetadata = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

export type Cart = {
  id: string;
  currency: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    variant: ProductVariant & { product: Pick<ProductSummary, 'id' | 'name' | 'slug'> };
  }>;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
};

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderSummary = {
  id: string;
  number: string;
  status: OrderStatus;
  paymentStatus: string;
  totalMinor: number;
  currency: string;
  customer: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
};

export type DashboardMetrics = {
  revenueMinor: number;
  orders: number;
  customers: number;
  averageOrderMinor: number;
  lowStockVariants: number;
  revenueSeries: Array<{ date: string; revenueMinor: number; orders: number }>;
};
