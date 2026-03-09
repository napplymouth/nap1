import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { shopProducts } from '../../../mocks/shopProducts';
import SiteNav from '../../../components/feature/SiteNav';
import CartSidebar from '../../../components/feature/CartSidebar';
import BackInStockAlert from '../../../components/feature/BackInStockAlert';
import supabase from '../../../lib/supabase';

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

const productDetails: Record<string, { highlights: string[]; materials: string; shipping: string }> = {
  'prod-001': {
    highlights: ['100% organic cotton', 'Unisex relaxed fit', 'Machine washable at 30°C', 'Printed with eco-friendly inks', 'Available in sizes XS–XXL', 'Chest print with awareness message'],
    materials: '100% GOTS-certified organic cotton, 180gsm',
    shipping: 'Dispatched within 2–3 working days. Free UK delivery on orders over £25.',
  },
  'prod-002': {
    highlights: ['Soft brushed fleece interior', 'Embroidered chest logo', 'Kangaroo front pocket', 'Ribbed cuffs and hem', 'Unisex relaxed fit', 'Available in sizes XS–XXL'],
    materials: '80% organic cotton, 20% recycled polyester, 320gsm',
    shipping: 'Dispatched within 2–3 working days. Free UK delivery on orders over £25.',
  },
  'prod-003': {
    highlights: ['Natural undyed canvas', 'Reinforced stitched handles', '10kg load capacity', 'Screen-printed design', 'Folds flat for storage', 'Approx. 38cm × 42cm'],
    materials: '100% natural cotton canvas, 340gsm',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-004': {
    highlights: ['Hard enamel finish', 'Gold-plated metal base', 'Butterfly clasp fastening', '25mm diameter', 'Individually bagged', 'Suitable for bags, jackets & lanyards'],
    materials: 'Zinc alloy with hard enamel fill, gold plating',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-005': {
    highlights: ['12-page printed guide', 'A5 format, full colour', 'Laminated cover', 'Includes 2 A3 posters', '10 information leaflets', 'Ideal for community training sessions'],
    materials: 'FSC-certified paper, soy-based inks',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-006': {
    highlights: ['Set of 3 wristbands', 'Embossed awareness text', 'Soft silicone material', 'One size fits most adults', 'Yellow, pink & blue', 'Great for events and fundraisers'],
    materials: '100% medical-grade silicone',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-007': {
    highlights: ['12 stickers per sheet', 'Waterproof vinyl', 'UV-resistant print', 'Dishwasher safe', 'Suitable for indoor & outdoor use', 'Various sizes on each sheet'],
    materials: 'Premium vinyl with UV laminate coating',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-008': {
    highlights: ['A3 full-colour print', 'Gloss finish', 'Ready to frame or pin', 'Suitable for public display', 'Ideal for GP surgeries, pharmacies & community centres', 'Bulk discounts available'],
    materials: 'Gloss coated 170gsm paper',
    shipping: 'Dispatched within 1–2 working days. Free UK delivery on orders over £25.',
  },
  'prod-009': {
    highlights: ['1× Awareness T-Shirt', '1× Canvas Tote Bag', '1× Enamel Pin Badge', '1× Wristband Set (3 bands)', 'Save £5 vs buying separately', 'Presented in a branded gift bag'],
    materials: 'Mixed materials — see individual items',
    shipping: 'Dispatched within 2–3 working days. Free UK delivery included.',
  },
  'prod-010': {
    highlights: ['1× Training Resource Pack', '5× Community Awareness Posters', '3× Sticker Sheets', 'Ideal for workshops & events', 'Save £4.51 vs buying separately', 'Bulk educator pricing available'],
    materials: 'FSC-certified paper, vinyl stickers',
    shipping: 'Dispatched within 2–3 working days. Free UK delivery included.',
  },
};

const reviews = [
  { name: 'Sarah M.', rating: 5, date: '12 Jan 2025', comment: 'Brilliant quality and such a great cause. The t-shirt fits perfectly and the print is really crisp. Will definitely be ordering again!' },
  { name: 'James T.', rating: 5, date: '3 Feb 2025', comment: 'Ordered for our whole team at the community centre. Everyone loves them. Fast delivery and great packaging too.' },
  { name: 'Priya K.', rating: 4, date: '28 Jan 2025', comment: 'Really happy with my purchase. Lovely soft fabric and the awareness message is clear and impactful. Slightly longer delivery than expected but worth the wait.' },
  { name: 'Dan W.', rating: 5, date: '19 Feb 2025', comment: 'Bought as a gift for a colleague who does harm reduction work. She absolutely loved it. Great product for a brilliant cause.' },
];

type Product = typeof shopProducts[0];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(shopProducts);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping'>('details');
  const [activeImage, setActiveImage] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  usePageMeta({
    title: product ? `${product.name} | Awareness Shop | Plymouth Naloxone` : 'Product | Awareness Shop',
    description: product ? product.description : 'Shop awareness merchandise to support naloxone training in Plymouth.',
    keywords: 'naloxone merchandise, awareness products, harm reduction shop, Plymouth',
  });

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);
      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          originalPrice: p.original_price ?? null,
          image: p.image || '',
          category: p.category,
          featured: p.featured,
          badge: p.badge ?? null,
          rating: p.rating ?? 5.0,
          reviews: p.reviews ?? 0,
          inStock: p.in_stock,
        }));
        setAllProducts(mapped);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const found = allProducts.find((p) => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedSize(null);
      setQuantity(1);
      setAdded(false);
      setActiveImage(0);
    }
  }, [id, allProducts]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SiteNav onCartOpen={() => setCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
            <i className="ri-store-2-line text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Product not found.</p>
          <Link to="/shop" className="px-5 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const sizes = sizeOptions[product.category] ?? [];
  const needsSize = sizes.length > 0;
  const canAdd = !needsSize || selectedSize !== null;
  const details = productDetails[product.id] ?? { highlights: [], materials: '', shipping: '' };
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

  // Related products (same category, excluding current)
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!canAdd) return;
    addToCart({
      id: product.id + (selectedSize ? `-${selectedSize}` : ''),
      name: product.name + (selectedSize ? ` (${selectedSize})` : ''),
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const thumbnails = [product.image, product.image, product.image];

  return (
    <div className="min-h-screen bg-white">
      <SiteNav onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors cursor-pointer">Home</Link>
          <i className="ri-arrow-right-s-line" />
          <Link to="/shop" className="hover:text-gray-700 transition-colors cursor-pointer">Shop</Link>
          <i className="ri-arrow-right-s-line" />
          <span
            className="hover:text-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/shop?category=${product.category}`)}
          >
            {product.category}
          </span>
          <i className="ri-arrow-right-s-line" />
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left — Images */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative w-full h-[480px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={thumbnails[activeImage]}
                alt={product.name}
                className={`w-full h-full object-cover object-top ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-5 py-2.5 bg-gray-900/80 text-white text-base font-bold rounded-full tracking-wide">
                    Out of Stock
                  </span>
                </div>
              )}
              {product.badge && (
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full ${badgeColors[product.badge] ?? 'bg-gray-200 text-gray-800'}`}>
                  {product.badge}
                </span>
              )}
              {product.originalPrice && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-white text-pink-600 text-xs font-bold rounded-full shadow">
                  Save £{(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
              {/* Wishlist floating button on image */}
              <button
                onClick={handleWishlist}
                className={`absolute bottom-4 right-4 w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 cursor-pointer ${
                  wishlisted
                    ? 'bg-pink-500 text-white scale-110'
                    : 'bg-white text-gray-400 hover:text-pink-500 hover:scale-110'
                }`}
                title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <i className={wishlisted ? 'ri-heart-fill text-lg' : 'ri-heart-line text-lg'} />
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {thumbnails.map((thumb, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${activeImage === i ? 'border-yellow-400' : 'border-gray-200 hover:border-yellow-300'}`}
                >
                  <img src={thumb} alt={`View ${i + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{product.category}</span>

            {/* Name */}
            <h1 className="text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-star-fill text-sm ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className={`text-4xl font-black ${product.inStock ? 'text-gray-900' : 'text-gray-400'}`}>£{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-sm font-bold rounded-full">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6 text-base">{product.description}</p>

            {product.inStock ? (
              <>
                {/* Size Selector */}
                {needsSize && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-800">Select Size</span>
                      {!selectedSize && (
                        <span className="text-xs text-pink-500 font-semibold flex items-center gap-1">
                          <i className="ri-information-line" /> Required
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                            selectedSize === size
                              ? 'border-yellow-400 bg-yellow-400 text-gray-900'
                              : 'border-gray-200 text-gray-700 hover:border-yellow-300 bg-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <span className="text-sm font-bold text-gray-800 block mb-3">Quantity</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <i className="ri-subtract-line text-gray-600" />
                      </button>
                      <span className="w-12 text-center text-base font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <i className="ri-add-line text-gray-600" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Total: <strong className="text-gray-900">£{(product.price * quantity).toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                    className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
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
                    {added ? 'Added to Cart!' : canAdd ? 'Add to Cart' : 'Select a Size First'}
                  </button>
                  <Link
                    to="/checkout"
                    className="px-6 py-4 rounded-xl text-base font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-flashlight-line text-lg" />
                    </div>
                    Buy Now
                  </Link>
                </div>

                {/* Wishlist button */}
                <button
                  onClick={handleWishlist}
                  className={`w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer mb-6 ${
                    wishlisted
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={wishlisted ? 'ri-heart-fill text-base' : 'ri-heart-line text-base'} />
                  </div>
                  {wishlisted ? '♥ Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </>
            ) : (
              /* Out of Stock — inline alert + wishlist */
              <div className="mb-6">
                <BackInStockAlert
                  productId={product.id}
                  productName={product.name}
                  inline
                />
                <button
                  onClick={handleWishlist}
                  className={`w-full mt-3 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                    wishlisted
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={wishlisted ? 'ri-heart-fill text-base' : 'ri-heart-line text-base'} />
                  </div>
                  {wishlisted ? '♥ Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </div>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: 'ri-truck-line', text: 'Free UK delivery over £25' },
                { icon: 'ri-heart-line', text: '100% funds naloxone training' },
                { icon: 'ri-shield-check-line', text: 'Secure & encrypted checkout' },
                { icon: 'ri-refresh-line', text: '30-day easy returns' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${t.icon} text-yellow-500`} />
                  </div>
                  {t.text}
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-400 font-medium">Share:</span>
              {['ri-facebook-fill', 'ri-twitter-x-fill', 'ri-whatsapp-line', 'ri-link'].map((icon) => (
                <button key={icon} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                  <i className={`${icon} text-sm`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tab Nav */}
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit mb-8 shadow-sm">
            {(['details', 'materials', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${
                  activeTab === tab ? 'bg-yellow-400 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'details' ? 'Product Details' : tab === 'materials' ? 'Materials' : 'Shipping & Returns'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {details.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-lg flex-shrink-0">
                    <i className="ri-check-line text-yellow-600 text-sm" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{h}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="max-w-lg bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl flex-shrink-0">
                <i className="ri-leaf-line text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 mb-1">Composition & Sustainability</p>
                <p className="text-sm text-gray-600 leading-relaxed">{details.materials}</p>
                <p className="text-xs text-gray-400 mt-3">We are committed to using sustainable and ethically sourced materials wherever possible.</p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-lg space-y-4">
              {[
                { icon: 'ri-truck-line', title: 'Delivery', text: details.shipping },
                { icon: 'ri-refresh-line', title: 'Returns', text: 'We accept returns within 30 days of delivery. Items must be unworn and in original condition. Contact us to arrange a return.' },
                { icon: 'ri-customer-service-2-line', title: 'Questions?', text: 'Get in touch via our contact page and we\'ll be happy to help with any queries about your order.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-xl flex-shrink-0">
                    <i className={`${item.icon} text-yellow-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-star-fill text-sm ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.rating} out of 5</span>
              <span className="text-sm text-gray-400">· {product.reviews} reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-full flex-shrink-0">
                    <span className="text-sm font-black text-gray-900">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="w-3.5 h-3.5 flex items-center justify-center">
                      <i className={`ri-star-fill text-xs ${j < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-product-shop>
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/shop/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
                >
                  <div className="relative w-full h-48 bg-gray-50 overflow-hidden flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                    {p.badge && (
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-xs font-bold rounded-full ${badgeColors[p.badge] ?? 'bg-gray-200 text-gray-800'}`}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{p.category}</span>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{p.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-base font-black text-gray-900">£{p.price.toFixed(2)}</span>
                      <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                        View <i className="ri-arrow-right-line" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-12 bg-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xl font-black text-gray-900">Every purchase funds life-saving training.</p>
            <p className="text-gray-700 text-sm mt-1">100% of proceeds go directly to naloxone training in Plymouth & Devon.</p>
          </div>
          <Link
            to="/shop"
            className="px-6 py-3 bg-gray-900 text-yellow-400 font-bold rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-store-2-line" />
            </div>
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
