import type { Metadata } from 'next';
import { ProductsBrowser } from './products-browser';
export const metadata: Metadata = { title: 'Shop', description: 'Explore the complete Northstar collection.' };
export default function ProductsPage() { return <ProductsBrowser />; }
