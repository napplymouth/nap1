
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

const NUDGE_DELAY_MS = 45000; // show after 45s of inactivity
const NUDGE_DISMISS_KEY = 'wishlist_nudge_dismissed_at';
const NUDGE_COOLDOWN_MS = 1000 * 60 * 60 * 4; // 4 hours between nudges

export default function WishlistNudge() {
  const { items: wishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [visible, setVisible] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (wishlistItems.length === 0) {
      setVisible(false);
      return;
    }

    // Check cooldown
    const lastDismissed = localStorage.getItem(NUDGE_DISMISS_KEY);
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10);
      if (elapsed < NUDGE_COOLDOWN_MS) return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, NUDGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [wishlistItems]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(NUDGE_DISMISS_KEY, String(Date.now()));
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  if (!visible || wishlistItems.length === 0) return null;

  const preview = wishlistItems.slice(0, 3);

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full flex-shrink-0">
              <i className="ri-heart-fill text-white text-base" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">You might also like…</p>
              <p className="text-white/80 text-xs mt-0.5">
                {wishlistItems.length} item{wishlistItems.length > 1 ? 's' : ''} saved in your wishlist
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        {/* Product previews */}
        <div className="px-4 pt-4 pb-2 space-y-3">
          {preview.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Link to={`/shop/${item.id}`} onClick={handleDismiss} className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/shop/${item.id}`}
                  onClick={handleDismiss}
                  className="text-sm font-semibold text-gray-900 truncate block hover:text-pink-500 transition-colors cursor-pointer"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500 font-medium">£{item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  addedIds.has(item.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                }`}
              >
                {addedIds.has(item.id) ? (
                  <span className="flex items-center gap-1">
                    <i className="ri-check-line" /> Added
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          ))}

          {wishlistItems.length > 3 && (
            <p className="text-xs text-gray-400 text-center pb-1">
              +{wishlistItems.length - 3} more saved item{wishlistItems.length - 3 > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4 pt-2 flex gap-2">
          <Link
            to="/checkout"
            onClick={handleDismiss}
            className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl text-center hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
          >
            <i className="ri-shopping-cart-2-line" />
            Go to Checkout
          </Link>
          <Link
            to="/shop"
            onClick={handleDismiss}
            className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
          >
            Shop
          </Link>
        </div>

        {/* Dismiss link */}
        <div className="px-4 pb-3 text-center">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer underline underline-offset-2"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
