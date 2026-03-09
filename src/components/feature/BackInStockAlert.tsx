
import { useState } from 'react';
import supabase from '../../lib/supabase';

interface BackInStockAlertProps {
  productId: string;
  productName: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function BackInStockAlert({ productId, productName, onClose, inline = false }: BackInStockAlertProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');

    // Save to Supabase
    const { error } = await supabase.from('back_in_stock_alerts').insert([
      { product_id: productId, product_name: productName, email: email.trim().toLowerCase() },
    ]);

    if (error) {
      if (error.code === '23505') {
        setStatus('duplicate');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
        setStatus('error');
      }
      return;
    }

    // Also submit to form endpoint
    try {
      const formData = new URLSearchParams();
      formData.append('email', email.trim().toLowerCase());
      formData.append('product_id', productId);
      formData.append('product_name', productName);
      await fetch('https://readdy.ai/api/form/d6hclecbcbcsu13rg5eg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (_) {
      // non-blocking
    }

    setStatus('success');
  };

  if (inline) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full flex-shrink-0">
            <i className="ri-notification-3-line text-yellow-600 text-base" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Out of Stock</p>
            <p className="text-xs text-gray-500">Get notified when this item is available again</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-semibold">You&apos;re on the list! We&apos;ll email you when it&apos;s back.</p>
          </div>
        ) : status === 'duplicate' ? (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-700 font-semibold">You&apos;re already signed up for this alert!</p>
          </div>
        ) : (
          <form data-readdy-form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {status === 'loading' ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <i className="ri-bell-line" />
              )}
              Notify Me
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
        )}
      </div>
    );
  }

  // Modal version
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-lg" />
          </button>
        )}

        <div className="w-14 h-14 flex items-center justify-center bg-yellow-100 rounded-2xl mb-5 mx-auto">
          <i className="ri-notification-3-line text-yellow-600 text-2xl" />
        </div>

        <h2 className="text-xl font-black text-gray-900 text-center mb-1">Back in Stock Alert</h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          <strong className="text-gray-700">{productName}</strong> is currently out of stock.
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we&apos;ll notify you the moment it&apos;s available again.
        </p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
              <i className="ri-check-line text-green-600 text-3xl" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">You&apos;re on the list!</p>
            <p className="text-sm text-gray-500 mb-5">We&apos;ll send you an email as soon as this item is back in stock.</p>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Done
              </button>
            )}
          </div>
        ) : status === 'duplicate' ? (
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full mx-auto mb-4">
              <i className="ri-information-line text-yellow-600 text-3xl" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Already signed up!</p>
            <p className="text-sm text-gray-500 mb-5">You&apos;re already on the alert list for this product.</p>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Got it
              </button>
            )}
          </div>
        ) : (
          <form data-readdy-form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-yellow-400"
                autoFocus
              />
              {status === 'error' && (
                <p className="text-xs text-red-500 mt-1.5">{errorMsg}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-base hover:bg-yellow-500 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><i className="ri-loader-4-line animate-spin" /> Signing up...</>
              ) : (
                <><i className="ri-bell-line" /> Notify Me When Available</>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">We&apos;ll only email you about this product. No spam.</p>
          </form>
        )}
      </div>
    </div>
  );
}
