
import { shopProducts } from '../../../mocks/shopProducts';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  addedItems: Set<string>;
  onAddToCart: (product: typeof shopProducts[0]) => void;
  onQuickView: (product: typeof shopProducts[0]) => void;
}

export default function FeaturedProducts({ addedItems, onAddToCart, onQuickView }: FeaturedProductsProps) {
  const featured = shopProducts.filter((p) => p.featured);

  return (
    <section className="py-14 bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-yellow-400 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <span className="ml-2 px-3 py-0.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
            Staff Picks
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              added={addedItems.has(product.id)}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
