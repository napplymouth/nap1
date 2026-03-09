import { useState, useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { shopProducts } from '../../../mocks/shopProducts';
import BackInStockAlert from '../../../components/feature/BackInStockAlert';

interface ProductQuickViewProps {
  product: typeof shopProducts[0] | null;
  onClose: () => void;
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-yellow-400 text-gray-900',
  'Sale': 'bg-pink-500 text-white',
  'New': 'bg-green-500 text-white',
  'Bundle Deal': 'bg-orange-500 text-white',
};

const sizeOptions: Record<string, string[]> = {
  Apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Accessories: [],
  Resources: [],
  Bundles: ['S/M', 'L/XL'],
};

const productDetails: Record<string, { highlights: string[]; materials: string }> = {
  'prod-001': {
    highlights: ['100% organic cotton', 'Unisex fit', 'Machine washable at 30°C', 'Printed with eco-friendly inks', 'Available in sizes XS–XXL'],
    materials: '100% GOTS-certified organic cotton, 180gsm',
  },
  'prod-002': {
    highlights: ['Soft brushed fleece interior', 'Embroidered chest logo', 'Kangaroo front pocket', 'Ribbed cuffs and hem', 'Unisex relaxed fit'],
    materials: '80% organic cotton, 20% recycled polyester, 320gsm',
  },
  'prod-003': {
    highlights: ['Natural undyed canvas', 'Reinforced stitched handles', '10kg load capacity', 'Screen-printed design', 'Folds flat for storage'],
    materials: '100% natural cotton canvas, 340gsm',
  },
  'prod-004': {
    highlights: ['Hard enamel finish', 'Gold-plated metal base', 'Butterfly clasp fastening', '25mm diameter', 'Individually bagged'],
    materials: 'Zinc alloy with hard enamel fill, gold plating',
  },
  'prod-005': {
    highlights: ['12-page printed guide', 'A5 format, full colour', 'Laminated cover', 'Includes 2 A3 posters', '10 information leaflets'],
    materials: 'FSC-certified paper, soy-based inks',
  },
  'prod-006': {
    highlights: ['Set of 3 wristbands', 'Embossed awareness text', 'Soft silicone material', 'One size fits most adults', 'Yellow, pink & blue'],
    materials: '100% medical-grade silicone',
  },
  'prod-007': {
    highlights: ['12 stickers per sheet', 'Waterproof vinyl', 'UV-resistant print', 'Dishwasher safe', 'Suitable for indoor & outdoor use'],
    materials: 'Premium vinyl with UV laminate coating',
  },
  'prod-008': {
    highlights: ['A3 full-colour print', 'Gloss finish', 'Ready to frame or pin', 'Suitable for public display', 'Bulk discounts available'],
    materials: 'Gloss coated 170gsm paper',
  },
  'prod-009': {
    highlights: ['1× Awareness T-Shirt', '1× Canvas Tote Bag', '1× Enamel Pin Badge', '1× Wristband Set (3 bands)', 'Save £5 vs buying separately'],
    materials: 'Mixed materials — see individual items',
  },
  'prod-010': {
    highlights: ['1× Training Resource Pack', '5× Community Awareness Posters', '3× Sticker Sheets', 'Ideal for workshops & events', 'Save £4.51 vs buying separately'],
    materials: 'FSC-certified paper, vinyl stickers',
  },
};

export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'materials'>('details');
  const [showStockAlert, setShowStockAlert] = useState(false);

  const sizes = product ? (sizeOptions[product.category] ?? []) : [];
  const details = product ? (productDetails[product.id] ?? { highlights: [], materials: '' }) : { highlights: [], materials: '' };

  useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setQuantity(1);
      setAdded(false);
      setActiveTab('details');
    }
  }, [product]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
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

  const needsSize = sizes.length > 0;
  const canAdd = !needsSize || selectedSize !== null;

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart({
      id: product.id + (selectedSize ? `-${selectedSize}` : ''),
      name: product.name + (selectedSize ? ` (${selectedSize})` : ''),
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-gray-600 text-lg" />
        </button>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-16 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            wishlisted
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-400 hover:text-pink-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <i className={wishlisted ? 'ri-heart-fill text-base' : 'ri-heart-line text-base'} />
        </button>

        <div className="flex flex-col md:flex-row overflow-y-auto">
          {/* Image */}
          <div className="relative w-full md:w-80 flex-shrink-0 bg-gray-50">
            <div className="w-full h-72 md:h-full min-h-72">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover object-top ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
              />
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-4 py-2 bg-gray-900/80 text-white text-sm font-bold rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
            {product.badge && (
              <span className={`absolute top-4 left-4 px-2.5 py-0.5 text-xs font-bold rounded-full ${badgeColors[product.badge] ?? 'bg-gray-200 text-gray-800'}`}>
                {product.badge}
              </span>
            )}
            {product.originalPrice && (
              <span className="absolute top-4 right-12 px-2 py-0.5 bg-white text-pink-600 text-xs font-bold rounded-full shadow">
                Save £{(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            {/* Category + Name */}
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {product.category}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-star-fill text-sm ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                </div>
              ))}
              <span className="text-sm text-gray-500 ml-1 font-medium">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className={`text-3xl font-black ${product.inStock ? 'text-gray-900' : 'text-gray-400'}`}>£{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {product.description}
            </p>

            {product.inStock ? (
              <>
                {/* Size Selector */}
                {needsSize && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-800">Size</span>
                      {!selectedSize && (
                        <span className="text-xs text-pink-500 font-medium">Please select a size</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                            selectedSize === size
                              ? 'border-yellow-400 bg-yellow-400 text-gray-900'
                              : 'border-gray-200 text-gray-700 hover:border-yellow-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-5">
                  <span className="text-sm font-bold text-gray-800 block mb-2">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-yellow-400 transition-colors cursor-pointer"
                    >
                      <i className="ri-subtract-line text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-base font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-yellow-400 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  className={`w-full py-3.5 rounded-xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer mb-3 ${
                    added
                      ? 'bg-green-500 text-white'
                      : canAdd
                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={added ? 'ri-check-line text-lg' : 'ri-shopping-cart-line text-lg'} />
                  </div>
                  {added ? 'Added to Cart!' : canAdd ? `Add to Cart — £${(product.price * quantity).toFixed(2)}` : 'Select a Size First'}
                </button>
              </>
            ) : (
              /* Out of Stock — inline alert signup */
              <BackInStockAlert
                productId={product.id}
                productName={product.name}
                inline
              />
            )}

            {/* Save to Wishlist inline button */}
            <button
              onClick={handleWishlist}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer mb-4 mt-3 ${
                wishlisted
                  ? 'border-pink-400 bg-pink-50 text-pink-600'
                  : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={wishlisted ? 'ri-heart-fill text-sm' : 'ri-heart-line text-sm'} />
              </div>
              {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Tabs: Details / Materials */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
                {(['details', 'materials'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${
                      activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' ? 'Product Details' : 'Materials'}
                  </button>
                ))}
              </div>

              {activeTab === 'details' && (
                <ul className="space-y-2">
                  {details.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-check-line text-yellow-500 text-sm" />
                      </div>
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'materials' && (
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-lg flex-shrink-0">
                    <i className="ri-leaf-line text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Composition</p>
                    <p className="text-sm text-gray-600">{details.materials}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back in Stock modal (triggered from card) */}
      {showStockAlert && (
        <BackInStockAlert
          productId={product.id}
          productName={product.name}
          onClose={() => setShowStockAlert(false)}
        />
      )}
    </div>
  );
}
