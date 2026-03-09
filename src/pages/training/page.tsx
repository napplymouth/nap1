
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BookingCalendar from '../../components/feature/BookingCalendar';
import { usePageMeta } from '../../hooks/usePageMeta';
import SiteNav from '../../components/feature/SiteNav';

const TIMESLOTS_API = 'https://readdy.ai/api/public/calendar/timeslots/f8279a7a-d235-4eb6-8767-d6df940d0739.de2ad2079adfe189d216fd904f778574d01d029bcb5d9d6371374bcf2bfe75f4';
const APPOINTMENTS_API = 'https://readdy.ai/api/public/calendar/appointments/f8279a7a-d235-4eb6-8767-d6df940d0739.de2ad2079adfe189d216fd904f778574d01d029bcb5d9d6371374bcf2bfe75f4';
const BOOKING_FORM_SUBMIT_URL = 'https://readdy.ai/api/form/d6g0jvqau1b90a40487g';
const NEWSLETTER_SUBMIT_URL = 'https://readdy.ai/api/form/d6j84qfgl4s4nd8dlpu0';

const calendarTexts = {
  stepDateTitle: 'Select Date',
  stepTimeTitle: 'Select Time',
  stepFormTitle: 'Your Details',
  prevMonth: 'Previous',
  nextMonth: 'Next',
  selectTime: 'Choose a time slot',
  modifyTime: 'Change time',
  nameLabel: 'Full Name',
  namePlaceholder: 'Enter your full name',
  phoneLabel: 'Phone Number',
  phonePlaceholder: '07xxx xxxxxx',
  notesLabel: 'Additional Notes',
  notesPlaceholder: 'Any accessibility needs or questions?',
  submitButton: 'Confirm Booking',
  submitting: 'Booking...',
  successMessage: 'Booking Confirmed!',
  successSub: 'We\'ll send you a confirmation shortly. See you at the session!',
  bookAnother: 'Book Another Session',
  noSlots: 'No available slots for this period.',
  selectedDate: 'Date',
  selectedTime: 'Time',
  back: 'Back',
  required: '*',
  dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      const body = new URLSearchParams();
      body.append('email', email.trim());
      body.append('firstName', firstName.trim());
      const res = await fetch(NEWSLETTER_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
        setFirstName('');
      } else {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left — colour panel */}
            <div className="relative bg-gradient-to-br from-rose-600 to-rose-800 p-10 flex flex-col justify-center min-h-[420px]">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6">
                  <i className="ri-mail-heart-line text-gray-900 text-3xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
                  Not Ready to Book Yet?
                </h2>
                <p className="text-rose-100 text-base leading-relaxed mb-6">
                  That's completely okay. Stay connected and we'll send you:
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: 'ri-calendar-event-line', text: 'Upcoming family training dates' },
                    { icon: 'ri-book-open-line', text: 'Harm reduction tips & guides' },
                    { icon: 'ri-heart-pulse-line', text: 'Support resources for families' },
                    { icon: 'ri-news-line', text: 'News from Naloxone Advocates Plymouth' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${item.icon} text-yellow-400 text-sm`}></i>
                      </div>
                      <span className="text-white/90 text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-rose-200 text-xs mt-6">
                  No spam. Unsubscribe any time. We respect your privacy.
                </p>
              </div>
            </div>

            {/* Right — form panel */}
            <div className="p-10 flex flex-col justify-center">
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <i className="ri-checkbox-circle-fill text-green-600 text-4xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">You're subscribed!</h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Thank you for signing up. We'll be in touch with training dates and family support resources.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-rose-600 font-semibold text-sm hover:underline cursor-pointer"
                  >
                    Subscribe another email
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Stay in the Loop</h3>
                  <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                    Join our mailing list and we'll let you know when new family sessions are available near you.
                  </p>
                  <form
                    data-readdy-form
                    id="training-newsletter-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="newsletter-firstname" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        First Name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="newsletter-firstname"
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="newsletter-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                      />
                    </div>
                    {errorMsg && (
                      <p className="text-red-500 text-sm">{errorMsg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md whitespace-nowrap cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin"></i>
                          Subscribing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-mail-send-line"></i>
                          Subscribe to Updates
                        </span>
                      )}
                    </button>
                  </form>
                  <p className="text-gray-400 text-xs mt-4 text-center">
                    We'll only ever send you relevant, helpful content. No spam, ever.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TrainingPage() {
  usePageMeta({
    title: 'Naloxone Training Plymouth & Devon | Book a Session Today',
    description: 'Book naloxone training in Plymouth and Devon. Community, Peer-to-Peer and Organisational sessions available at no cost. Learn overdose prevention and receive a naloxone kit. No experience needed.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/training`,
    ogTitle: 'Naloxone Training Plymouth — Book Your Session',
    ogDescription: '90-minute naloxone training sessions in Plymouth and Devon. Peer-led, stigma-free. Kit included. Book online today.',
  });

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/training#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/training`,
          "name": "Free Naloxone Training & P2P Project Plymouth | Naloxone Advocates",
          "description": "Book free naloxone training in Plymouth and Devon. Community, Peer-to-Peer and Organisational sessions available. Learn overdose prevention and receive a free naloxone kit.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Training & P2P", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/training` }
            ]
          }
        },
        {
          "@type": "Course",
          "name": "Naloxone Training — Community Session",
          "description": "90-minute naloxone training covering overdose recognition, naloxone administration, recovery position and aftercare. Kit included at no cost.",
          "provider": {
            "@type": "NGO",
            "name": "Naloxone Advocates Plymouth CIC",
            "url": import.meta.env.VITE_SITE_URL || 'https://example.com'
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          },
          "courseMode": "onsite",
          "educationalLevel": "Beginner",
          "inLanguage": "en-GB"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Do I need any medical experience?",
              "acceptedAnswer": { "@type": "Answer", "text": "No! Our training is designed for everyone, regardless of background. We'll teach you everything you need to know." }
            },
            {
              "@type": "Question",
              "name": "Is there any cost for the training?",
              "acceptedAnswer": { "@type": "Answer", "text": "No, there is no cost at all. This includes the training session, your naloxone kit, and certificate of completion." }
            },
            {
              "@type": "Question",
              "name": "How long does naloxone last?",
              "acceptedAnswer": { "@type": "Answer", "text": "Naloxone kits typically last 2-3 years. We'll provide information on checking expiry dates and getting replacements." }
            },
            {
              "@type": "Question",
              "name": "Can I get in trouble for using naloxone?",
              "acceptedAnswer": { "@type": "Answer", "text": "No. Good Samaritan laws protect people who respond to overdoses in good faith. We'll cover the legal aspects in training." }
            },
            {
              "@type": "Question",
              "name": "Can I become a peer trainer?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes! If you have lived experience and want to help train others, we'd love to hear from you. Contact us to learn about our peer trainer programme." }
            }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-training';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-training')?.remove(); };
  }, []);

  const galleryImages = [
    {
      src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/67a3bbd7b80b424059ef25b0b86e1b3d.jpeg',
      caption: 'NAP team out in the community',
    },
    {
      src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/fd39ae49d33e19cbaa13fc55cf81f69c.jpeg',
      caption: 'Naloxone Advocates Plymouth in action',
    },
    {
      src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/7ac6d78b83a2689caa69566d51eccf8b.jpeg',
      caption: 'Ask us about Naloxone — outreach session',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-pink-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Naloxone Training & P2P Project
            </h1>
            <p className="text-2xl text-yellow-400 font-semibold max-w-3xl mx-auto mb-8">
              Life-saving training delivered by people with lived experience — at no cost to you
            </p>
            <Link to="/contact" className="inline-block bg-yellow-400 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-yellow-500 transition-all shadow-xl whitespace-nowrap">
              Book Your Training Now
            </Link>
          </div>
        </div>
      </section>

      {/* What is Naloxone */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
                What is Naloxone?
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The Life-Saving Medication Everyone Should Know About
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                <strong className="text-blue-500">Naloxone (also known as Narcan)</strong> is a medication that rapidly reverses opioid overdose. It works by blocking the effects of opioids on the brain and restoring breathing within 2-3 minutes.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Naloxone is <strong className="text-blue-500">safe, easy to use, and has no potential for abuse</strong>. It only works if opioids are present in the body, so there's no harm in administering it if you're unsure.
              </p>
              <div className="bg-yellow-400 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <i className="ri-information-fill text-gray-900 text-3xl flex-shrink-0"></i>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Important to Know</h3>
                    <p className="text-gray-800">
                      Naloxone is a temporary measure. Always call 999 first — professional medical help is essential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl w-full h-80">
                <img
                  src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/10f0dec747be5904612f1e23bddbdfc7.png"
                  alt="Take-home naloxone kit — yellow box with Pebble nasal spray device"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-20 bg-lime-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Training Programmes
            </h2>
            <p className="text-xl text-gray-900 font-semibold max-w-3xl mx-auto">
              Choose the training that's right for you — all sessions include a naloxone kit at no cost
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Community Training */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Community Training</h3>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-blue-500">No Cost</span>
                <div className="text-gray-600">90 minutes</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Recognising overdose signs', 'How to administer naloxone', 'Recovery position & aftercare', 'Free naloxone kit provided', 'Certificate of completion', 'Open to everyone'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1 flex-shrink-0"></i>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#book-session" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer">
                Book This Training
              </a>
            </div>

            {/* P2P Training - Featured */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl ring-4 ring-pink-500 transform md:scale-105">
              <div className="bg-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-hand-heart-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Peer-to-Peer (P2P)</h3>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-pink-500">No Cost</span>
                <div className="text-gray-600">2 hours</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['All community training content', 'Lived-experience led sessions', 'Stigma-free environment', 'Peer support network access', 'Ongoing community connection', 'Outreach opportunities'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1 flex-shrink-0"></i>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#book-session" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer">
                Book This Training
              </a>
            </div>

            {/* Organisational Training */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-building-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Organisational</h3>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-blue-500">No Cost</span>
                <div className="text-gray-600">Flexible duration</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Tailored for workplaces', 'Group sessions available', 'Policy guidance included', 'Kits for all participants', 'Flexible scheduling', 'On-site or virtual options'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1 flex-shrink-0"></i>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#book-session" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer">
                Book This Training
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAMILY & CARERS TRAINING SECTION ===== */}
      <section id="family-carers-training" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-5 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-heart-line text-lg"></i>
              For Families &amp; Carers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Naloxone Training for Families &amp; Loved Ones
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              If someone you love uses opioids, this session is designed specifically for you. No medical background needed — just the willingness to be prepared.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="rounded-3xl overflow-hidden shadow-2xl w-full h-80">
                <img
                  src="https://readdy.ai/api/search-image?query=caring%20family%20member%20sitting%20with%20loved%20one%20at%20kitchen%20table%2C%20warm%20home%20environment%2C%20supportive%20conversation%20between%20adult%20family%20members%2C%20soft%20natural%20window%20light%2C%20genuine%20emotional%20connection%2C%20documentary%20photography%20style%2C%20warm%20tones%2C%20cosy%20domestic%20setting%2C%20two%20people%20talking%20compassionately&width=800&height=600&seq=family-carer-training-hero-01&orientation=landscape"
                  alt="Family member learning naloxone training in a supportive home environment"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-5">You Shouldn't Have to Face This Alone</h3>
              <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                Families and carers of people who use opioids are often the first on the scene in an overdose emergency — yet most have never received any training. Our <strong className="text-rose-600">Family &amp; Carers Naloxone Session</strong> changes that.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                Delivered in a <strong>compassionate, stigma-free environment</strong>, this session gives you the practical skills and emotional confidence to respond if the worst happens — while also connecting you with ongoing family support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#book-session" className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-rose-700 transition-all shadow-lg whitespace-nowrap cursor-pointer">
                  <i className="ri-calendar-line"></i>
                  Book a Family Session
                </a>
                <a href="/resources/family-support-guide" className="inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-700 border-2 border-rose-200 px-8 py-4 rounded-full font-bold text-base hover:bg-rose-100 transition-all whitespace-nowrap cursor-pointer">
                  <i className="ri-book-open-line"></i>
                  Family Support Guide
                </a>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-10 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Who Is This Session For?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'ri-parent-line', label: 'Parents', desc: 'of someone who uses opioids or is in recovery' },
                { icon: 'ri-user-heart-line', label: 'Partners & Spouses', desc: 'living with or supporting a loved one' },
                { icon: 'ri-group-2-line', label: 'Siblings & Family', desc: 'who want to be prepared at home' },
                { icon: 'ri-home-heart-line', label: 'Carers & Support Workers', desc: 'providing informal care in the community' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className={`${item.icon} text-white text-2xl`}></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2">{item.label}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-9 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-7 flex items-center gap-3">
                <i className="ri-graduation-cap-line text-yellow-400 text-3xl"></i>
                What You'll Learn
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: 'ri-eye-line', text: 'Recognising the signs of an opioid overdose' },
                  { icon: 'ri-phone-line', text: 'When and how to call 999 — what to say' },
                  { icon: 'ri-medicine-bottle-line', text: 'How to administer naloxone nasal spray step by step' },
                  { icon: 'ri-user-received-line', text: 'Placing someone in the recovery position safely' },
                  { icon: 'ri-time-line', text: 'What to do while waiting for the ambulance' },
                  { icon: 'ri-heart-pulse-line', text: 'Aftercare and emotional support for yourself' },
                  { icon: 'ri-shield-check-line', text: 'Your legal rights when responding to an overdose' },
                  { icon: 'ri-refresh-line', text: 'When and how to give a second dose of naloxone' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className={`${item.icon} text-yellow-400 text-base`}></i>
                    </div>
                    <span className="text-white/90 text-sm leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="ri-information-line text-rose-600 text-2xl"></i>
                  Session Details
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: 'ri-time-line', label: 'Duration', value: '90 minutes' },
                    { icon: 'ri-money-pound-circle-line', label: 'Cost', value: 'Completely free' },
                    { icon: 'ri-map-pin-line', label: 'Location', value: 'Plymouth & Devon — or we can come to you' },
                    { icon: 'ri-group-line', label: 'Group size', value: 'Small groups (max 8) for a personal experience' },
                    { icon: 'ri-gift-line', label: 'What you receive', value: 'Free naloxone kit + certificate of completion' },
                    { icon: 'ri-translate-2', label: 'Language', value: 'English — interpreters available on request' },
                  ].map((detail, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${detail.icon} text-rose-600 text-base`}></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{detail.label}</div>
                        <div className="text-gray-900 font-semibold text-sm">{detail.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-400 rounded-3xl p-7">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-chat-heart-line text-yellow-400 text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">More Than Just Skills</h4>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      Our family sessions also include space to talk about the emotional impact of loving someone who uses drugs. You'll leave with practical skills <em>and</em> a sense of community — because you deserve support too.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">What Families Say</h3>
            <div className="grid md:grid-cols-3 gap-7">
              {[
                { quote: "I was terrified walking in — I thought people would judge me for having a son who uses heroin. Instead I found the most understanding group of people I've ever met. I left with a naloxone kit and, for the first time in years, I felt like I could actually do something to help him.", name: 'Linda T.', role: 'Mother, Plymouth', initials: 'LT', color: 'bg-rose-500', border: 'border-rose-400' },
                { quote: "My partner has been on methadone for two years. I always worried about what I'd do in an emergency. This session gave me the confidence I desperately needed. The trainers were brilliant — they understood exactly what families go through.", name: 'David M.', role: 'Partner, Devonport', initials: 'DM', color: 'bg-amber-500', border: 'border-amber-400' },
                { quote: "I'm a carer for my brother who has struggled with addiction for over a decade. This training was the most practical and compassionate thing I've done for both of us. I now carry naloxone everywhere. I only wish I'd done it sooner.", name: 'Fiona R.', role: 'Sibling & Carer, Stonehouse', initials: 'FR', color: 'bg-teal-600', border: 'border-teal-400' },
              ].map((t, i) => (
                <div key={i} className={`bg-white rounded-3xl p-8 shadow-lg border-l-4 ${t.border} hover:shadow-xl transition-shadow`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => <i key={s} className="ri-star-fill text-yellow-400 text-base"></i>)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${t.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{t.initials}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-rose-600 to-rose-800 rounded-3xl p-10 text-center text-white shadow-2xl">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="ri-heart-fill text-gray-900 text-3xl"></i>
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Be Prepared for Your Loved One?</h3>
            <p className="text-rose-100 text-lg mb-8 max-w-2xl mx-auto">
              Book a free family naloxone session today. It takes 90 minutes and could save a life — the life of someone you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book-session" className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl whitespace-nowrap cursor-pointer">
                <i className="ri-calendar-check-line text-xl"></i>
                Book a Family Session
              </a>
              <a href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/20 text-white border-2 border-white/40 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-all whitespace-nowrap cursor-pointer">
                <i className="ri-question-line text-xl"></i>
                Ask Us a Question
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END FAMILY & CARERS TRAINING SECTION ===== */}

      {/* Book Your Session - Calendar */}
      <section id="book-session" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">Book Now</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book Your Training Session</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pick a date and time that works for you. All sessions are at no cost to you.
            </p>
          </div>
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <BookingCalendar
              timeslotsApi={TIMESLOTS_API}
              appointmentsApi={APPOINTMENTS_API}
              texts={calendarTexts}
              formSubmitUrl={BOOKING_FORM_SUBMIT_URL}
            />
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-6">Training Content</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Skills</h3>
              <ul className="space-y-4">
                {[
                  { n: '1', title: 'Recognising Overdose', desc: 'Learn the signs of opioid overdose and how to assess the situation quickly' },
                  { n: '2', title: 'Calling for Help', desc: 'When and how to call 999, and what information to provide' },
                  { n: '3', title: 'Administering Naloxone', desc: 'Step-by-step guidance on using naloxone nasal spray safely' },
                  { n: '4', title: 'Recovery Position', desc: 'How to position someone safely while waiting for emergency services' },
                  { n: '5', title: 'Aftercare', desc: 'What to do after naloxone is administered and how to support recovery' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-gray-900">{item.n}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-800">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-blue-500 rounded-3xl p-8 shadow-xl text-white">
              <h3 className="text-2xl font-bold mb-6">Additional Topics</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Understanding Opioids', desc: 'Types of opioids and how they affect the body' },
                  { title: 'Harm Reduction Principles', desc: 'Evidence-based approaches to reducing drug-related harm' },
                  { title: 'Reducing Stigma', desc: 'Language and attitudes that support people who use drugs' },
                  { title: 'Legal Considerations', desc: 'Your rights and protections when responding to overdose' },
                  { title: 'Support Resources', desc: 'Where to find ongoing support and additional help' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <i className="ri-checkbox-circle-fill text-yellow-400 text-2xl flex-shrink-0"></i>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-white/90">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* P2P Project Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl w-full h-80">
                <img
                  src="https://readdy.ai/api/search-image?query=harm%20reduction%20outreach%20worker%20handing%20naloxone%20kit%20to%20community%20member%20in%20urban%20setting%2C%20peer%20support%20worker%20in%20casual%20clothing%20giving%20take-home%20naloxone%20to%20person%2C%20warm%20natural%20lighting%2C%20candid%20documentary%20style%20photography%2C%20community%20health%20worker%2C%20street%20outreach%2C%20genuine%20human%20connection%2C%20soft%20background%20bokeh&width=800&height=600&seq=p2p-outreach-community-01&orientation=landscape"
                  alt="Peer-to-peer naloxone outreach — community worker sharing naloxone kit"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">Our P2P Project</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Peer-to-Peer: Lived Experience Leading the Way</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our <strong className="text-blue-500">Peer-to-Peer (P2P) project</strong> is at the heart of what we do. It's built on the belief that people with lived experience of drug use are best placed to support others in their community.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                P2P training sessions are delivered by <strong className="text-blue-500">peer trainers who understand the challenges</strong> faced by people who use drugs. This creates a stigma-free, non-judgemental space where everyone feels welcome.
              </p>
              <div className="bg-yellow-400 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 text-xl mb-3">Why P2P Works</h3>
                <ul className="space-y-2">
                  {['Builds trust through shared experience', 'Reduces stigma and shame', 'Creates lasting community connections', 'Empowers people to help themselves and others'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <i className="ri-check-line text-gray-900 text-xl flex-shrink-0"></i>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/contact" className="inline-block bg-blue-500 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap">
                Join Our P2P Program
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">FAQs</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: 'Do I need any medical experience?', a: 'No! Our training is designed for everyone, regardless of background. We\'ll teach you everything you need to know.' },
              { q: 'Is there any cost for the training?', a: 'No, there is absolutely no cost. This includes the training session, your naloxone kit, and certificate of completion.' },
              { q: 'How long does naloxone last?', a: 'Naloxone kits typically last 2-3 years. We\'ll provide information on checking expiry dates and getting replacements.' },
              { q: 'Can I get in trouble for using naloxone?', a: 'No. Good Samaritan laws protect people who respond to overdoses in good faith. We\'ll cover the legal aspects in training.' },
              { q: 'What if I use naloxone and it doesn\'t work?', a: 'You can give a second dose after 2-3 minutes if needed. Always call 999 first — naloxone is temporary and professional help is essential.' },
              { q: 'Can I become a peer trainer?', a: 'Yes! If you have lived experience and want to help train others, we\'d love to hear from you. Contact us to learn about our peer trainer programme.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-700 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">What People Say</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Hear from Our Training Participants</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real feedback from people who attended our naloxone training sessions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "I attended the community session expecting a lecture, but it was nothing like that. The trainers shared their own stories, which made everything feel real and relatable. I left with a naloxone kit and genuine confidence that I could use it if I ever needed to.", name: 'Angela M.', role: 'Community Training Participant', initials: 'AM', bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-400' },
              { quote: "As a hostel manager, I brought my whole team to the organisational training. Within two months, one of our night staff used naloxone to save a resident's life. This training should be mandatory for anyone working in frontline services.", name: 'James W.', role: 'Hostel Manager, Plymouth', initials: 'JW', bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
              { quote: "I was terrified walking in — I thought people would judge me for having a family member who uses drugs. Instead, I found the most welcoming, understanding group of people. The peer trainers really get it because they've lived it themselves.", name: 'Robert C.', role: 'Family Member', initials: 'RC', bg: 'bg-lime-400', text: 'text-gray-900', border: 'border-lime-400' },
              { quote: "I'm a GP practice nurse and I was genuinely impressed by the quality of this training. It's evidence-based, delivered with real empathy, and fills a critical gap. I now refer patients and their families to Naloxone Advocates regularly.", name: 'Karen P.', role: 'GP Practice Nurse, Devonport', initials: 'KP', bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-400' },
              { quote: "The P2P session changed my life. I went from feeling ashamed of my past to realising my experience could actually help save someone. I'm now training to become a peer trainer myself. This organisation gave me my purpose back.", name: 'Sarah H.', role: 'P2P Training Participant', initials: 'SH', bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-400' },
              { quote: "We run a drop-in centre in Stonehouse and partnered with Naloxone Advocates to train our volunteers. The session was brilliant — clear, hands-on, and completely non-judgemental. Our team now feels prepared and confident to respond.", name: 'Tom B.', role: 'Drop-in Centre Coordinator', initials: 'TB', bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
            ].map((t, i) => (
              <div key={i} className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border-l-4 ${t.border}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => <i key={s} className="ri-star-fill text-yellow-400 text-lg"></i>)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${t.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`${t.text} font-bold`}>{t.initials}</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">Our Work</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Training in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real moments from our community outreach and naloxone training sessions across Plymouth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-3xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                style={{ height: '340px' }}
                onClick={() => setLightboxImg(img.src)}
              >
                <img src={img.src} alt={img.caption} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <div className="w-full p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-semibold text-base">{img.caption}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all cursor-pointer" onClick={() => setLightboxImg(null)}>
            <i className="ri-close-line"></i>
          </button>
          <img src={lightboxImg} alt="Training photo" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Newsletter Subscription */}
      <NewsletterSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Learn How to Save a Life?
          </h2>
          <p className="text-xl text-white font-semibold mb-10">
            Book your naloxone training today — it could make all the difference
          </p>
          <Link to="/contact" className="inline-block bg-pink-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-pink-600 transition-all shadow-xl whitespace-nowrap">
            Book Your Training Now <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
