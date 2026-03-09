import { useState, useEffect, useRef, FormEvent } from 'react';
import { useCart } from '../../contexts/CartContext';
import supabase from '../../lib/supabase';
import { usePageMeta } from '../../hooks/usePageMeta';

declare global {
  interface Window {
    paypal?: any;
    REACT_APP_NAVIGATE: (path: string) => void;
  }
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

export default function CheckoutPage() {
  usePageMeta({
    title: 'Checkout | Plymouth Naloxone Training',
    description: 'Complete your order for awareness products supporting harm reduction in Plymouth and Devon.',
    keywords: 'checkout, order, naloxone merchandise',
  });

  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [orderComplete, setOrderComplete] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
  });

  // Load PayPal SDK
  useEffect(() => {
    if (document.getElementById('paypal-sdk')) {
      setPaypalLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=GBP`;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError('Failed to load PayPal. Please refresh and try again.');
    document.body.appendChild(script);
  }, []);

  // Render PayPal buttons when on payment step
  useEffect(() => {
    if (step !== 'payment' || !paypalLoaded || !paypalRef.current || paypalRendered.current) return;
    if (!window.paypal) return;

    paypalRendered.current = true;

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        height: 48,
      },
      createOrder: async () => {
        try {
          setIsProcessing(true);
          setPaypalError('');

          const { data, error } = await supabase.functions.invoke('paypal-create-order', {
            body: {
              items: items.map((item) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              customer: {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
              },
              shipping: {
                line1: formData.addressLine1,
                line2: formData.addressLine2,
                city: formData.city,
                county: formData.county,
                postcode: formData.postcode,
              },
            },
          });

          setIsProcessing(false);

          if (error) {
            console.error('Create order error:', error);
            setPaypalError('Failed to create PayPal order. Please try again.');
            throw new Error(error.message);
          }

          if (!data?.orderID) {
            setPaypalError('Invalid response from payment server. Please try again.');
            throw new Error('No orderID returned');
          }

          return data.orderID;
        } catch (err) {
          setIsProcessing(false);
          console.error('PayPal create order error:', err);
          throw err;
        }
      },
      onApprove: async (data: any) => {
        try {
          setIsProcessing(true);
          setPaypalError('');

          const { data: captureData, error } = await supabase.functions.invoke('paypal-capture-order', {
            body: {
              orderID: data.orderID,
            },
          });

          if (error) {
            console.error('Capture order error:', error);
            setPaypalError('Payment capture failed. Please contact us if you were charged.');
            setIsProcessing(false);
            return;
          }

          if (!captureData?.success) {
            setPaypalError(captureData?.error || 'Payment verification failed. Please contact us.');
            setIsProcessing(false);
            return;
          }

          // Payment successful
          clearCart();
          setIsProcessing(false);
          setOrderComplete(true);
        } catch (err) {
          console.error('PayPal capture error:', err);
          setPaypalError('Payment processing failed. Please contact us if you were charged.');
          setIsProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setPaypalError('Payment failed. Please try again or contact us.');
        setIsProcessing(false);
      },
      onCancel: () => {
        setPaypalError('Payment was cancelled. You can try again below.');
        setIsProcessing(false);
      },
    }).render(paypalRef.current);
  }, [step, paypalLoaded, items, totalPrice, formData, clearCart]);

  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    paypalRendered.current = false;
    setPaypalError('');
    setStep('payment');
  };

  // ── Empty cart ──
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 bg-gray-100 rounded-full">
            <i className="ri-shopping-cart-line text-5xl text-gray-300"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products before checking out.</p>
          <a
            href="/shop"
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer inline-block"
          >
            Browse Shop
          </a>
        </div>
      </div>
    );
  }

  // ── Order complete ──
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
              <i className="ri-check-line text-5xl text-green-600"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
            <p className="text-gray-500 mb-8">
              Thank you, <strong>{formData.fullName}</strong>! Your order has been confirmed and paid via PayPal.
              A confirmation will be sent to <strong>{formData.email}</strong>.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total Paid</span>
                <span className="text-green-600">£{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/shop"
                className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer inline-block"
              >
                Continue Shopping
              </a>
              <a
                href="/"
                className="px-8 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer inline-block"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`flex items-center gap-2 text-sm font-bold ${step === 'details' ? 'text-gray-900' : 'text-green-600'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black ${step === 'details' ? 'bg-yellow-400 text-gray-900' : 'bg-green-500 text-white'}`}>
              {step === 'payment' ? <i className="ri-check-line"></i> : '1'}
            </div>
            Delivery Details
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 text-sm font-bold ${step === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black ${step === 'payment' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            Pay with PayPal
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Form or PayPal */}
          <div className="lg:col-span-2">

            {/* ── STEP 1: Delivery Details ── */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="ri-map-pin-line text-yellow-500"></i>
                  Delivery Information
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                        placeholder="07123 456789"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                      placeholder="123 High Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                      placeholder="Flat 4B (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Town/City <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                        placeholder="Plymouth"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">County <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.county}
                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                        placeholder="Devon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Postcode <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.postcode}
                        onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm"
                        placeholder="PL1 2AB"
                        maxLength={8}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Payment
                  <i className="ri-arrow-right-line"></i>
                </button>
              </form>
            )}

            {/* ── STEP 2: PayPal Payment ── */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <i className="ri-paypal-line text-yellow-500"></i>
                    Pay with PayPal
                  </h2>
                  <button
                    onClick={() => { setStep('details'); paypalRendered.current = false; }}
                    className="text-sm text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 cursor-pointer"
                    disabled={isProcessing}
                  >
                    <i className="ri-arrow-left-line"></i>
                    Edit Details
                  </button>
                </div>

                {/* Delivery summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">Delivering to:</p>
                  <p>{formData.fullName} · {formData.email}</p>
                  <p>{formData.addressLine1}{formData.addressLine2 ? `, ${formData.addressLine2}` : ''}, {formData.city}, {formData.postcode}</p>
                </div>

                {isProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                    <i className="ri-loader-4-line animate-spin text-blue-500 text-xl flex-shrink-0"></i>
                    <p className="text-sm text-blue-700 font-medium">Processing your payment securely...</p>
                  </div>
                )}

                {paypalError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <i className="ri-error-warning-line text-red-500 text-xl flex-shrink-0 mt-0.5"></i>
                    <p className="text-sm text-red-700">{paypalError}</p>
                  </div>
                )}

                {!paypalLoaded ? (
                  <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span className="text-sm font-medium">Loading PayPal...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      Click the button below to pay <strong className="text-gray-900">£{totalPrice.toFixed(2)}</strong> securely via PayPal.
                      You can use your PayPal account or pay as a guest with a card.
                    </p>
                    <div ref={paypalRef} className="min-h-[50px]"></div>
                    <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
                      <i className="ri-shield-check-line text-green-500"></i>
                      Secured by PayPal · Your payment details are never stored on our site
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-4 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">£{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-5 bg-yellow-50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <i className="ri-heart-line text-yellow-500 flex-shrink-0 mt-0.5"></i>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    All proceeds fund naloxone training across Plymouth and Devon. Thank you for your support.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}