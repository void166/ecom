import { ProductsBrowser } from '@/app/products/products-browser';
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <ProductsBrowser category={slug}/>; }
