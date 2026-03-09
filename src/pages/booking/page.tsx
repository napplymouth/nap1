import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { usePageMeta } from '../../hooks/usePageMeta';

// ─── EmailJS config ───────────────────────────────────────────────────────────
// To activate confirmation emails:
// 1. Create a free account at https://www.emailjs.com
// 2. Add an Email Service (Gmail, Outlook, etc.) → copy the Service ID
// 3. Create an Email Template with these variables:
//      {{to_name}}  {{to_email}}  {{session_type}}  {{date}}  {{time}}  {{location}}
// 4. Copy your Public Key from Account → API Keys
// 5. Replace the three placeholder strings below with your real values
const EMAILJS_SERVICE_ID = 'service_icxspv9';
const EMAILJS_TEMPLATE_ID = 'template_28e5wew';
const EMAILJS_PUBLIC_KEY = 'QSaCAiPb9EOuVSVSi';

// ─── 24-Hour Reminder Email Setup ────────────────────────────────────────────
// IMPORTANT: EmailJS cannot natively schedule emails. To send reminders 24 hours
// before the session, you need to set up automation using Make.com or Zapier.
//
// STEP 1: Create a new EmailJS template for reminders
// - Go to EmailJS → Email Templates → Create New Template
// - Template ID example: template_reminder_24h
// - Subject: "Reminder: Your Naloxone Training Session Tomorrow"
// - Body variables: {{to_name}} {{session_type}} {{date}} {{time}} {{location}} {{manage_url}}
// - Save and copy the Template ID below
//
// STEP 2: Set up Make.com or Zapier automation (free tier works)
// - Trigger: Check the Readdy form endpoint daily for bookings happening in 24 hours
// - Action: Send email via EmailJS using the reminder template
// - Filter: Only send if booking date = tomorrow
//
// STEP 3: Replace 'YOUR_REMINDER_TEMPLATE_ID' below with your actual template ID
const EMAILJS_REMINDER_TEMPLATE_ID = 'YOUR_REMINDER_TEMPLATE_ID';
const REMINDER_FORM_URL = 'https://readdy.ai/api/form/d6gjii0ns5ko4e6bne8g';
// ─────────────────────────────────────────────────────────────────────────────

const APPOINTMENTS_API = 'https://readdy.ai/api/public/calendar/appointments/f8279a7a-d235-4eb6-8767-d6df940d0739.de2ad2079adfe189d216fd904f778574d01d029bcb5d9d6371374bcf2bfe75f4';
const FORM_SUBMIT_URL = 'https://readdy.ai/api/form/d6ghumvh0gm41geor8u0';

const SESSION_TYPES: Record<string, { label: string; duration: string; icon: string; color: string }> = {
  community: { label: 'Community Training', duration: '90 minutes', icon: 'ri-team-fill', color: 'bg-yellow-400 text-gray-900' },
  p2p: { label: 'Peer-to-Peer (P2P)', duration: '2 hours', icon: 'ri-hand-heart-fill', color: 'bg-pink-500 text-white' },
  organisational: { label: 'Organisational', duration: 'Flexible', icon: 'ri-building-fill', color: 'bg-lime-400 text-gray-900' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookingCartPage() {
  usePageMeta({
    title: 'Complete Your Booking | Naloxone Advocates Plymouth',
    description: 'Review and confirm your free naloxone training session booking with Naloxone Advocates Plymouth.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/booking`,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    session_type: 'community',
    notes: '',
    accessibility: '',
  });

  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('start') || '';
  const endTime = searchParams.get('end') || '';
  const emailParam = searchParams.get('email') || '';

  useEffect(() => {
    if (!date || !startTime) {
      navigate('/training#book-session');
    }
  }, [date, startTime, navigate]);

  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const sessionInfo = SESSION_TYPES[formData.session_type] || SESSION_TYPES.community;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Submit to form endpoint
      const params = new URLSearchParams();
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('phone', formData.phone);
      params.append('session_type', sessionInfo.label);
      params.append('date', date);
      params.append('time', `${startTime} - ${endTime}`);
      params.append('notes', formData.notes || '');
      params.append('accessibility', formData.accessibility || '');

      await fetch(FORM_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      // 2. Book the calendar slot
      await fetch(APPOINTMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time: startTime,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      // 3. Send confirmation email via EmailJS (only if credentials are configured)
      if (
        EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
        EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
        EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
      ) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_name: formData.name,
            to_email: formData.email,
            session_type: sessionInfo.label,
            duration: sessionInfo.duration,
            date: formatDate(date),
            time: `${startTime} – ${endTime}`,
            location: 'Hyde Park House, Mutley Plain, Plymouth PL4 6LF',
            notes: formData.notes || 'None',
            accessibility: formData.accessibility || 'None',
            reschedule_url: 'https://naloxoneadvocatesplymouth.co.uk/manage-booking',
            cancel_url: 'https://naloxoneadvocatesplymouth.co.uk/manage-booking',
          },
          EMAILJS_PUBLIC_KEY,
        );
      }

      // 4. Store booking data for 24-hour reminder automation
      // This data will be used by Make.com/Zapier to trigger reminder emails
      try {
        const reminderParams = new URLSearchParams();
        reminderParams.append('name', formData.name);
        reminderParams.append('email', formData.email);
        reminderParams.append('session_type', sessionInfo.label);
        reminderParams.append('date', date);
        reminderParams.append('time', startTime);
        reminderParams.append('formatted_date', formatDate(date));
        reminderParams.append('manage_url', 'https://naloxoneadvocatesplymouth.co.uk/manage-booking');

        await fetch(REMINDER_FORM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: reminderParams.toString(),
        });

        // Optional: Send reminder email immediately (for testing purposes)
        // In production, this should be triggered by Make.com/Zapier 24 hours before
        if (
          EMAILJS_REMINDER_TEMPLATE_ID !== 'YOUR_REMINDER_TEMPLATE_ID' &&
          EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
          EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
        ) {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_REMINDER_TEMPLATE_ID,
            {
              to_name: formData.name,
              to_email: formData.email,
              session_type: sessionInfo.label,
              date: formatDate(date),
              time: `${startTime} – ${endTime}`,
              location: 'Hyde Park House, Mutley Plain, Plymouth PL4 6LF',
              manage_url: 'https://naloxoneadvocatesplymouth.co.uk/manage-booking',
            },
            EMAILJS_PUBLIC_KEY,
          );
        }
      } catch (reminderError) {
        // Reminder setup failed, but don't block the booking confirmation
        console.warn('Reminder email setup failed:', reminderError);
      }

      navigate('/thank-you?type=training');
    } catch {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-yellow-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                alt="Naloxone Advocates Plymouth"
                className="h-16 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Home</Link>
              <Link to="/about" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">About Us</Link>
              <Link to="/training" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Training &amp; P2P</Link>
              <Link to="/get-naloxone" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Get Naloxone</Link>
              <Link to="/volunteer" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Volunteer</Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Resources</Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Contact</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/members/login" className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2">
                <i className="ri-user-fill"></i> Members
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-900 text-2xl cursor-pointer">
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <Link to="/" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Home</Link>
              <Link to="/about" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">About Us</Link>
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Training &amp; P2P</Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Get Naloxone</Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Volunteer</Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Resources</Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Contact</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { label: 'Choose Date & Time', icon: 'ri-calendar-check-fill', done: true },
              { label: 'Your Details', icon: 'ri-user-fill', done: false, active: true },
              { label: 'Confirmed', icon: 'ri-checkbox-circle-fill', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                  step.done ? 'bg-lime-400 text-gray-900' : step.active ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.done ? <i className="ri-check-line"></i> : <i className={step.icon}></i>}
                </div>
                <span className={`text-sm font-semibold hidden sm:inline whitespace-nowrap ${step.active ? 'text-gray-900' : step.done ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {i < 2 && <div className="w-6 sm:w-12 h-0.5 bg-gray-200 mx-1 flex-shrink-0"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/training#book-session" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold cursor-pointer">
            <i className="ri-arrow-left-line"></i> Back to Training
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-2">Complete Your Booking</h1>
          <p className="text-gray-500 text-lg">Review your session and fill in your details below.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <form
              id="booking-cart-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Session Type Selector */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-award-fill text-gray-900 text-sm"></i>
                  </div>
                  Session Type
                </h2>
                <div className="grid gap-3">
                  {Object.entries(SESSION_TYPES).map(([key, info]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.session_type === key
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="session_type"
                        value={key}
                        checked={formData.session_type === key}
                        onChange={() => handleChange('session_type', key)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${info.color}`}>
                        <i className={`${info.icon} text-lg`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{info.label}</div>
                        <div className="text-xs text-gray-500">{info.duration} &bull; Free</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.session_type === key ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                      }`}>
                        {formData.session_type === key && <i className="ri-check-line text-white text-xs"></i>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-fill text-white text-sm"></i>
                  </div>
                  Your Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="07xxx xxxxxx"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-pink-500'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-chat-3-fill text-gray-900 text-sm"></i>
                  </div>
                  Additional Information <span className="text-gray-400 font-normal text-sm">(optional)</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Accessibility Needs</label>
                    <input
                      type="text"
                      name="accessibility"
                      value={formData.accessibility}
                      onChange={(e) => handleChange('accessibility', e.target.value)}
                      placeholder="e.g. wheelchair access, BSL interpreter..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes or Questions</label>
                    <textarea
                      name="notes"
                      rows={3}
                      maxLength={500}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Anything else you'd like us to know?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm resize-none"
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1 text-right">{formData.notes.length}/500</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all whitespace-nowrap cursor-pointer shadow-lg ${
                  submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirming your booking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-checkbox-circle-fill text-xl"></i>
                    Confirm Booking — It&apos;s Free!
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                By confirming, you agree to receive a confirmation email. No payment required — all sessions are completely free.
              </p>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Session Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              <div className="bg-gradient-to-r from-yellow-400 to-lime-400 px-6 py-4">
                <h3 className="font-bold text-gray-900 text-lg">Your Booking Summary</h3>
              </div>
              <div className="p-6 space-y-5">
                {/* Session Type */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${sessionInfo.color}`}>
                    <i className={`${sessionInfo.icon} text-lg`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Session</p>
                    <p className="font-bold text-gray-900">{sessionInfo.label}</p>
                    <p className="text-sm text-gray-500">{sessionInfo.duration}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-calendar-fill text-pink-500 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Date</p>
                    <p className="font-bold text-gray-900">{formatDate(date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-fill text-lime-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Time</p>
                    <p className="font-bold text-gray-900">{startTime} – {endTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-fill text-yellow-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Location</p>
                    <p className="font-bold text-gray-900">Hyde Park House</p>
                    <p className="text-sm text-gray-500">Mutley Plain, Plymouth PL4 6LF</p>
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-lg">Total Cost</span>
                  <span className="text-2xl font-black text-lime-600">FREE</span>
                </div>

                {/* Included */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">What&apos;s included</p>
                  {[
                    'Training session',
                    'Free naloxone kit',
                    'Certificate of completion',
                    'Ongoing peer support',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <i className="ri-checkbox-circle-fill text-lime-500 text-base"></i>
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Change slot link */}
                <Link
                  to="/training#book-session"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-500 transition-all text-sm font-semibold cursor-pointer"
                >
                  <i className="ri-edit-line"></i> Change date or time
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="space-y-3">
                {[
                  { icon: 'ri-shield-check-fill', color: 'text-lime-500', text: 'Completely free — no hidden costs' },
                  { icon: 'ri-lock-fill', color: 'text-pink-500', text: 'Your details are kept private' },
                  { icon: 'ri-heart-fill', color: 'text-red-400', text: 'Peer-led, stigma-free sessions' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <i className={`${badge.icon} ${badge.color} text-lg`}></i>
                    </div>
                    <span className="text-sm text-gray-600">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-400 rounded-2xl py-5 mb-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">NALOXONE SAVES LIVES</h2>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
