import { useState, useMemo, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { shopProducts as mockProducts } from '../../mocks/shopProducts';
import supabase from '../../lib/supabase';
import { usePageMeta } from '../../hooks/usePageMeta';
import FeaturedProducts from './components/FeaturedProducts';
import ShopFilters from './components/ShopFilters';
import ProductCard from './components/ProductCard';
import ProductQuickView from './components/ProductQuickView';

const trustBadges = [
  { icon: 'ri-truck-line', label: 'Free UK Delivery', sub: 'On orders over £25' },
  { icon: 'ri-heart-line', label: '100% Goes to Charity', sub: 'All proceeds fund training' },
  { icon: 'ri-shield-check-line', label: 'Secure Checkout', sub: 'Safe & encrypted payments' },
  { icon: 'ri-refresh-line', label: 'Easy Returns', sub: '30-day return policy' },
];

export default function ShopPage() {
  usePageMeta({
    title: 'Shop Awareness Products | Plymouth Naloxone Training',
    description: 'Support our harm reduction mission by purchasing awareness merchandise including t-shirts, tote bags, pin badges, and training resources. All proceeds support naloxone training in Plymouth, Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/shop`,
    ogTitle: 'Shop Awareness Products — Naloxone Advocates Plymouth',
    ogDescription: 'Buy awareness merchandise and support naloxone training in Plymouth and Devon. All proceeds fund life-saving harm reduction work.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/shop#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/shop`,
          "name": "Shop Awareness Products | Naloxone Advocates Plymouth",
          "description": "Support our harm reduction mission by purchasing awareness merchandise. All proceeds fund naloxone training in Plymouth and Devon.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/shop` }
            ]
          }
        },
        {
          "@type": "Store",
          "name": "Naloxone Advocates Plymouth — Awareness Shop",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/shop`,
          "description": "Awareness merchandise supporting naloxone training and harm reduction across Plymouth and Devon. All proceeds go directly to our community programmes.",
          "currenciesAccepted": "GBP",
          "paymentAccepted": "Credit Card, Debit Card, PayPal",
          "priceRange": "£",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Plymouth",
            "addressRegion": "Devon",
            "addressCountry": "GB"
          }
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-shop';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-shop')?.remove(); };
  }, []);

  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState<typeof mockProducts[0] | null>(null);
  const [allProducts, setAllProducts] = useState(mockProducts);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map DB shape to the shape components expect
        const mapped = data.map((p: any) => ({
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
        setAllProducts(mapped as typeof mockProducts);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...allProducts]
      : allProducts.filter((p) => p.category === activeCategory);

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') list.sort((a, b) => b.reviews - a.reviews);

    return list;
  }, [activeCategory, sortBy, allProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Quick View Popup */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gray-900 py-24">
        <img
          src="https://readdy.ai/api/search-image?query=A%20vibrant%20flat%20lay%20photograph%20of%20colorful%20awareness%20merchandise%20including%20yellow%20t-shirts%20tote%20bags%20pin%20badges%20and%20wristbands%20arranged%20artistically%20on%20a%20dark%20charcoal%20background%20with%20soft%20dramatic%20studio%20lighting%20creating%20depth%20and%20texture%20professional%20ecommerce%20hero%20banner%20photography%20with%20warm%20yellow%20and%20pink%20accent%20colors&width=1440&height=500&seq=shophero01&orientation=landscape"
          alt="Shop hero background"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Awareness Shop
            </span>
            <h1 className="text-5xl font-black text-white mb-4 leading-tight">
              Wear the Change.<br />
              <span className="text-yellow-400">Save a Life.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Every item you buy directly funds naloxone training across Plymouth and Devon. Spread awareness, support your community.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#all-products"
                className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                Our Mission
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-yellow-50 rounded-lg flex-shrink-0">
                  <i className={`${badge.icon} text-yellow-500 text-xl`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{badge.label}</p>
                  <p className="text-xs text-gray-400">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts
        addedItems={addedItems}
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      {/* Filters + All Products */}
      <div id="all-products">
        <ShopFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={filteredProducts.length}
        />

        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                  <i className="ri-store-2-line text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No products in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    added={addedItems.has(product.id)}
                    onAddToCart={handleAddToCart}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Impact Banner */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                Your Impact
              </span>
              <h2 className="text-3xl font-black mb-4 leading-tight">
                Every Purchase Makes a <span className="text-yellow-400">Real Difference</span>
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                All proceeds from our shop go directly towards funding naloxone training sessions, purchasing training supplies, and expanding our harm reduction programmes across the community.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '2,400+', label: 'People Trained' },
                  { value: '£18k+', label: 'Raised via Shop' },
                  { value: '47', label: 'Lives Saved' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-yellow-400">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=A%20warm%20and%20uplifting%20photograph%20of%20a%20diverse%20community%20group%20of%20people%20wearing%20yellow%20awareness%20t-shirts%20at%20an%20outdoor%20harm%20reduction%20training%20event%20in%20Plymouth%20Devon%20UK%20smiling%20and%20engaged%20with%20educational%20materials%20on%20a%20bright%20sunny%20day%20with%20a%20natural%20park%20background&width=700&height=500&seq=shopimpact01&orientation=landscape"
                alt="Community impact"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
