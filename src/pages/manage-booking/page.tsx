
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

const CANCEL_FORM_URL = 'https://readdy.ai/api/form/d6gjdi37ks76vrd3kueg';
const RESCHEDULE_FORM_URL = 'https://readdy.ai/api/form/d6gjdij7ks76vrd3kuf0';

type Mode = 'lookup' | 'cancel' | 'reschedule' | 'cancel-success' | 'reschedule-success';

const SESSION_TYPES = [
  { value: 'community', label: 'Community Training' },
  { value: 'p2p', label: 'Peer-to-Peer (P2P)' },
  { value: 'organisational', label: 'Organisational Training' },
];

const PREFERRED_TIMES = [
  'Morning (9am – 12pm)',
  'Afternoon (12pm – 4pm)',
  'Evening (4pm – 7pm)',
  'Any time',
];

export default function ManageBookingPage() {
  usePageMeta({
    title: 'Manage Your Booking | Naloxone Advocates Plymouth',
    description: 'Cancel or reschedule your naloxone training session with Naloxone Advocates Plymouth. Easy self-service booking management.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/manage-booking`,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('lookup');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lookup form
  const [lookupData, setLookupData] = useState({ name: '', email: '', date: '' });

  // Cancel form
  const [cancelData, setCancelData] = useState({ reason: '', other_reason: '' });

  // Reschedule form
  const [rescheduleData, setRescheduleData] = useState({
    new_date_preference: '',
    preferred_time: '',
    session_type: 'community',
    notes: '',
  });

  const validateLookup = () => {
    const e: Record<string, string> = {};
    if (!lookupData.name.trim()) e.name = 'Full name is required';
    if (!lookupData.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupData.email)) e.email = 'Please enter a valid email';
    if (!lookupData.date.trim()) e.date = 'Booking date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLookup = (action: 'cancel' | 'reschedule') => {
    if (!validateLookup()) return;
    setMode(action);
    setErrors({});
  };

  const handleCancel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cancelData.reason) {
      setErrors({ reason: 'Please select a reason' });
      return;
    }
    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append('name', lookupData.name);
      params.append('email', lookupData.email);
      params.append('booking_date', lookupData.date);
      params.append('reason', cancelData.reason);
      params.append('other_reason', cancelData.other_reason || '');
      const response = await fetch(CANCEL_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setMode('cancel-success');
    } catch (error) {
      console.error('Cancel request failed:', error);
      setErrors({ submit: 'Failed to cancel booking. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!rescheduleData.new_date_preference.trim())
      errs.new_date_preference = 'Please provide a preferred date';
    if (!rescheduleData.preferred_time) errs.preferred_time = 'Please select a preferred time';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append('name', lookupData.name);
      params.append('email', lookupData.email);
      params.append('original_booking_date', lookupData.date);
      params.append('new_date_preference', rescheduleData.new_date_preference);
      params.append('preferred_time', rescheduleData.preferred_time);
      params.append(
        'session_type',
        SESSION_TYPES.find(s => s.value === rescheduleData.session_type)?.label || ''
      );
      params.append('notes', rescheduleData.notes || '');
      const response = await fetch(RESCHEDULE_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setMode('reschedule-success');
    } catch (error) {
      console.error('Reschedule request failed:', error);
      setErrors({ submit: 'Failed to submit reschedule request. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
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
              <Link to="/" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Home
              </Link>
              <Link to="/about" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                About Us
              </Link>
              <Link to="/training" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Training &amp; P2P
              </Link>
              <Link to="/get-naloxone" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Get Naloxone
              </Link>
              <Link to="/volunteer" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Volunteer
              </Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Resources
              </Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">
                Contact
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/members/login"
                className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-user-fill"></i> Members
              </Link>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900 text-2xl cursor-pointer"
            >
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <Link to="/" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Home
              </Link>
              <Link to="/about" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                About Us
              </Link>
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Training &amp; P2P
              </Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Get Naloxone
              </Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Volunteer
              </Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Resources
              </Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Contact
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-lime-400 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="ri-calendar-2-fill text-pink-500 text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Manage Your Booking</h1>
          <p className="text-lg text-gray-800 font-medium max-w-xl mx-auto">
            Need to cancel or reschedule your training session? We&apos;re here to help — just fill in your
            details below.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* ── LOOKUP STEP ── */}
        {mode === 'lookup' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Find Your Booking</h2>
              <p className="text-gray-500 text-sm">Enter the details you used when you booked your session.</p>
            </div>

            <div className="px-8 pb-8 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={lookupData.name}
                  onChange={e => {
                    setLookupData(p => ({ ...p, name: e.target.value }));
                    setErrors(p => ({ ...p, name: '' }));
                  }}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                    errors.name ? 'border-red-400' : 'border-gray-200 focus:border-pink-500'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-pink-500">*</span>
                </label>
                <input
                  type="email"
                  value={lookupData.email}
                  onChange={e => {
                    setLookupData(p => ({ ...p, email: e.target.value }));
                    setErrors(p => ({ ...p, email: '' }));
                  }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                    errors.email ? 'border-red-400' : 'border-gray-200 focus:border-pink-500'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Booking Date <span className="text-pink-500">*</span>
                </label>
                <input
                  type="date"
                  value={lookupData.date}
                  onChange={e => {
                    setLookupData(p => ({ ...p, date: e.target.value }));
                    setErrors(p => ({ ...p, date: '' }));
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                    errors.date ? 'border-red-400' : 'border-gray-200 focus:border-pink-500'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleLookup('reschedule')}
                  className="flex items-center justify-center gap-2 py-4 rounded-full font-bold text-base bg-lime-400 text-gray-900 hover:bg-lime-500 transition-all shadow-md whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-calendar-line text-lg"></i>
                  Reschedule Session
                </button>
                <button
                  type="button"
                  onClick={() => handleLookup('cancel')}
                  className="flex items-center justify-center gap-2 py-4 rounded-full font-bold text-base bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-md whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-close-circle-line text-lg"></i>
                  Cancel Booking
                </button>
              </div>
            </div>

            {/* Info box */}
            <div className="mx-8 mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-yellow-600 text-lg"></i>
              </div>
              <p className="text-sm text-yellow-800">
                Can&apos;t find your booking? Email us at{' '}
                <a
                  href="mailto:napplymouth66@gmail.com"
                  className="font-bold underline hover:text-yellow-900 cursor-pointer"
                >
                  napplymouth66@gmail.com
                </a>{' '}
                or call{' '}
                <a href="tel:07561349137" className="font-bold underline hover:text-yellow-900 cursor-pointer">
                  07561 349 137
                </a>{' '}
                and we&apos;ll sort it for you.
              </p>
            </div>
          </div>
        )}

        {/* ── CANCEL STEP ── */}
        {mode === 'cancel' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Back */}
            <div className="px-8 pt-6">
              <button
                onClick={() => {
                  setMode('lookup');
                  setErrors({});
                }}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i> Back
              </button>
            </div>

            {/* Booking summary */}
            <div className="mx-8 mt-4 bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-fill text-white text-lg"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900">{lookupData.name}</p>
                <p className="text-sm text-gray-600">{lookupData.email}</p>
                <p className="text-sm text-pink-600 font-semibold mt-1">
                  Booking date:{' '}
                  {new Date(lookupData.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="px-8 pt-6 pb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Cancel Your Booking</h2>
              <p className="text-gray-500 text-sm">We&apos;re sorry to see you go. Please let us know why you&apos;re cancelling.</p>
            </div>

            <form
              id="cancel-booking-form"
              data-readdy-form
              onSubmit={handleCancel}
              className="px-8 pb-8 space-y-5 mt-4"
            >
              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason for cancellation <span className="text-pink-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    'I can no longer attend on this date',
                    'I have a personal emergency',
                    'I found another training provider',
                    'I no longer need the training',
                    'Other',
                  ].map(r => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        cancelData.reason === r ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={cancelData.reason === r}
                        onChange={() => {
                          setCancelData(p => ({ ...p, reason: r }));
                          setErrors(p => ({ ...p, reason: '' }));
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          cancelData.reason === r ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                        }`}
                      >
                        {cancelData.reason === r && <i className="ri-check-line text-white text-xs"></i>}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">{r}</span>
                    </label>
                  ))}
                </div>
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
              </div>

              {/* Other reason */}
              {cancelData.reason === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Please tell us more
                  </label>
                  <textarea
                    name="other_reason"
                    rows={3}
                    maxLength={500}
                    value={cancelData.other_reason}
                    onChange={e => setCancelData(p => ({ ...p, other_reason: e.target.value }))}
                    placeholder="Please describe your reason..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {cancelData.other_reason.length}/500
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-alert-line text-yellow-600 text-lg"></i>
                </div>
                <p className="text-sm text-yellow-800">
                  Cancelling your booking means your slot will be released. You&apos;re always welcome to
                  rebook a new session at any time — all training is completely free.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('lookup');
                    setErrors({});
                  }}
                  className="py-4 rounded-full font-bold text-base border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all whitespace-nowrap cursor-pointer"
                >
                  Keep My Booking
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`py-4 rounded-full font-bold text-base transition-all whitespace-nowrap cursor-pointer shadow-md ${
                    submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-close-circle-fill"></i> Confirm Cancellation
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── RESCHEDULE STEP ── */}
        {mode === 'reschedule' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Back */}
            <div className="px-8 pt-6">
              <button
                onClick={() => {
                  setMode('lookup');
                  setErrors({});
                }}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i> Back
              </button>
            </div>

            {/* Booking summary */}
            <div className="mx-8 mt-4 bg-lime-50 border border-lime-200 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-fill text-gray-900 text-lg"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900">{lookupData.name}</p>
                <p className="text-sm text-gray-600">{lookupData.email}</p>
                <p className="text-sm text-lime-700 font-semibold mt-1">
                  Current booking:{' '}
                  {new Date(lookupData.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="px-8 pt-6 pb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Reschedule Your Session</h2>
              <p className="text-gray-500 text-sm">
                Tell us your preferred new date and we&apos;ll confirm availability with you.
              </p>
            </div>

            <form
              id="reschedule-booking-form"
              data-readdy-form
              onSubmit={handleReschedule}
              className="px-8 pb-8 space-y-5 mt-4"
            >
              {/* New date preference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Preferred New Date <span className="text-pink-500">*</span>
                </label>
                <input
                  type="date"
                  name="new_date_preference"
                  value={rescheduleData.new_date_preference}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    setRescheduleData(p => ({ ...p, new_date_preference: e.target.value }));
                    setErrors(p => ({ ...p, new_date_preference: '' }));
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                    errors.new_date_preference ? 'border-red-400' : 'border-gray-200 focus:border-lime-400'
                  }`}
                />
                {errors.new_date_preference && (
                  <p className="text-red-5 0 text-xs mt-1">{errors.new_date_preference}</p>
                )}
              </div>

              {/* Preferred time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preferred Time of Day <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PREFERRED_TIMES.map(t => (
                    <label
                      key={t}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        rescheduleData.preferred_time === t ? 'border-lime-400 bg-lime-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferred_time"
                        value={t}
                        checked={rescheduleData.preferred_time === t}
                        onChange={() => {
                          setRescheduleData(p => ({ ...p, preferred_time: t }));
                          setErrors(p => ({ ...p, preferred_time: '' }));
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          rescheduleData.preferred_time === t ? 'border-lime-500 bg-lime-400' : 'border-gray-300'
                        }`}
                      >
                        {rescheduleData.preferred_time === t && (
                          <i className="ri-check-line text-gray-900 text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">{t}</span>
                    </label>
                  ))}
                </div>
                {errors.preferred_time && <p className="text-red-500 text-xs mt-1">{errors.preferred_time}</p>}
              </div>

              {/* Session type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Session Type</label>
                <div className="space-y-2">
                  {SESSION_TYPES.map(s => (
                    <label
                      key={s.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        rescheduleData.session_type === s.value ? 'border-lime-400 bg-lime-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="session_type"
                        value={s.value}
                        checked={rescheduleData.session_type === s.value}
                        onChange={() => setRescheduleData(p => ({ ...p, session_type: s.value }))}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          rescheduleData.session_type === s.value ? 'border-lime-500 bg-lime-400' : 'border-gray-300'
                        }`}
                      >
                        {rescheduleData.session_type === s.value && (
                          <i className="ri-check-line text-gray-900 text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={500}
                  value={rescheduleData.notes}
                  onChange={e => setRescheduleData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any accessibility needs or other information..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{rescheduleData.notes.length}/500</p>
              </div>

              {/* Info */}
              <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 flex gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-lime-700 text-lg"></i>
                </div>
                <p className="text-sm text-lime-800">
                  We&apos;ll check availability for your preferred date and contact you within 24 hours
                  to confirm your new slot.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-full font-bold text-base transition-all whitespace-nowrap cursor-pointer shadow-md ${
                  submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-lime-400 text-gray-900 hover:bg-lime-500'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-calendar-check-fill text-lg"></i> Request Reschedule
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── CANCEL SUCCESS ── */}
        {mode === 'cancel-success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-checkbox-circle-fill text-pink-500 text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Cancelled</h2>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              Your booking has been cancelled. A confirmation has been sent to <strong>{lookupData.email}</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              We hope to see you at a future session — all our training is free and you&apos;re always
              welcome back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/training"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-all shadow-md whitespace-nowrap"
              >
                <i className="ri-calendar-line"></i> Book a New Session
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold hover:border-gray-400 transition-all whitespace-nowrap"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* ── RESCHEDULE SUCCESS ── */}
        {mode === 'reschedule-success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-calendar-check-fill text-lime-600 text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Reschedule Requested!</h2>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              We&apos;ve received your reschedule request and will be in touch at <strong>{lookupData.email}</strong> within 24
              hours to confirm your new slot.
            </p>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              In the meantime, if you need to speak to us urgently, call{' '}
              <a href="tel:07561349137" className="font-bold text-pink-500 hover:text-pink-600 cursor-pointer">
                07561 349 137
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/training"
                className="inline-flex items-center justify-center gap-2 bg-lime-400 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-lime-5 00 transition-all shadow-md whitespace-nowrap"
              >
                <i className="ri-calendar-line"></i> View Training Info
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold hover:border-gray-400 transition-all whitespace-nowrap"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Help strip */}
        {(mode === 'lookup' || mode === 'cancel' || mode === 'reschedule') && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-customer-service-2-fill text-gray-900 text-xl"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900">Need help?</p>
                <p className="text-sm text-gray-500">Our team is happy to assist you directly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="tel:07561349137"
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
              >
                <i className="ri-phone-fill"></i> Call Us
              </a>
              <a
                href="mailto:napplymouth66@gmail.com"
                className="flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-pink-600 transition-all whitespace-nowrap cursor-pointer"
              >
                <i className="ri-mail-fill"></i> Email Us
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-8">
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
