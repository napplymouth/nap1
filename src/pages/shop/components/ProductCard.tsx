import { useState } from 'react';
import { Link } from 'react-router-dom';
import { shopProducts } from '../../../mocks/shopProducts';
import { useWishlist } from '../../../contexts/WishlistContext';
import BackInStockAlert from '../../../components/feature/BackInStockAlert';

interface ProductCardProps {
  product: typeof shopProducts[0];
  added: boolean;
  onAddToCart: (product: typeof shopProducts[0]) => void;
  onQuickView: (product: typeof shopProducts[0]) => void;
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-yellow-400 text-gray-900',
  'Sale': 'bg-pink-500 text-white',
  'New': 'bg-green-500 text-white',
  'Bundle Deal': 'bg-orange-500 text-white',
};

export default function ProductCard({ product, added, onAddToCart, onQuickView }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [showAlert, setShowAlert] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      badge: product.badge,
      rating: product.rating,
      reviews: product.reviews,
      originalPrice: product.originalPrice,
    });
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      data-product-shop
    >
      {/* Image */}
      <Link to={`/shop/${product.id}`} className="relative w-full h-56 bg-gray-50 overflow-hidden flex-shrink-0 group block">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
        />
        {/* Out of Stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-gray-900/80 text-white text-xs font-bold rounded-full tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-0.5 text-xs font-bold rounded-full ${badgeColors[product.badge] ?? 'bg-gray-200 text-gray-800'}`}
          >
            {product.badge}
          </span>
        )}
        {product.originalPrice && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-white text-pink-600 text-xs font-bold rounded-full shadow">
            Save £{(product.originalPrice - product.price).toFixed(2)}
          </span>
        )}

        {/* Wishlist button on image */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer z-10 ${
            wishlisted
              ? 'bg-pink-500 text-white scale-110'
              : 'bg-white text-gray-400 hover:text-pink-500 hover:scale-110'
          } ${product.originalPrice ? 'top-10' : 'top-3'}`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <i className={wishlisted ? 'ri-heart-fill text-sm' : 'ri-heart-line text-sm'} />
        </button>

        {/* Quick View overlay */}
        {product.inStock && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-eye-line" />
              </div>
              Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {product.category}
        </span>
        <Link to={`/shop/${product.id}`} className="text-base font-bold text-gray-900 mb-1 leading-snug hover:text-yellow-600 transition-colors cursor-pointer">
          {product.name}
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 flex items-center justify-center">
              <i
                className={`ri-star-fill text-xs ${
                  i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'
                }`}
              />
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-black ${product.inStock ? 'text-gray-900' : 'text-gray-400'}`}>
              £{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                £{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <button
                  onClick={() => onQuickView(product)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-yellow-400 text-gray-500 hover:text-gray-900 transition-all cursor-pointer flex-shrink-0"
                  title="Quick View"
                >
                  <i className="ri-eye-line text-sm" />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    added
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={added ? 'ri-check-line' : 'ri-shopping-cart-line'} />
                  </div>
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAlert(true)}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-gray-900 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border border-gray-200"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-bell-line" />
                </div>
                Notify Me
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Back in Stock Modal */}
      {showAlert && (
        <BackInStockAlert
          productId={product.id}
          productName={product.name}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
