import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import CartSidebar from '../../components/feature/CartSidebar';
import BookingCalendar from '../../components/feature/BookingCalendar';
import { usePageMeta } from '../../hooks/usePageMeta';
import SiteNav from '../../components/feature/SiteNav';
import supabase from '../../lib/supabase';

interface CartItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  price: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

const upcomingTrainingSessions = [
  { id: '1', name: 'Community Training', date: '15 Feb 2025', time: '10:00 AM', location: 'Plymouth Community Centre', price: 'No Cost' },
  { id: '2', name: 'Peer-to-Peer (P2P)', date: '22 Feb 2025', time: '2:00 PM', location: 'Devonport Guildhall', price: 'No Cost' },
  { id: '3', name: 'Organisational Training', date: '1 Mar 2025', time: '9:00 AM', location: 'Your Workplace', price: 'No Cost' },
  { id: '4', name: 'Community Training', date: '8 Mar 2025', time: '11:00 AM', location: 'Stonehouse Community Hub', price: 'No Cost' },
  { id: '5', name: 'Evening P2P Session', date: '15 Mar 2025', time: '6:00 PM', location: 'Plymouth Central Library', price: 'No Cost' },
];

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Plymouth Council Partners with Naloxone Advocates for City-Wide Training',
    excerpt: 'A new partnership will see naloxone training offered at all community centres across Plymouth, making life-saving skills more accessible than ever.',
    date: '28 Jan 2025',
    category: 'Partnership',
    image: 'https://readdy.ai/api/search-image?query=community%20partnership%20meeting%20in%20modern%20council%20building%2C%20diverse%20group%20of%20professionals%20and%20community%20workers%20shaking%20hands%2C%20bright%20natural%20lighting%2C%20official%20setting%20with%20warm%20atmosphere%2C%20documentary%20photography%20style&width=600&height=400&seq=news1&orientation=landscape'
  },
  {
    id: '2',
    title: '150 Lives Saved: Celebrating Our Community Impact',
    excerpt: 'We are proud to announce that naloxone distributed through our program has now been used to reverse over 150 overdoses in Plymouth and Devon.',
    date: '20 Jan 2025',
    category: 'Milestone',
    image: 'https://readdy.ai/api/search-image?query=celebration%20event%20with%20community%20health%20workers%2C%20people%20holding%20certificates%20and%20smiling%2C%20colorful%20balloons%20and%20banners%2C%20warm%20supportive%20atmosphere%2C%20bright%20indoor%20lighting%2C%20documentary%20photography&width=600&height=400&seq=news2&orientation=landscape'
  },
  {
    id: '3',
    title: 'New Peer Trainer Programme Launches This Spring',
    excerpt: 'Applications are now open for our expanded Peer Trainer programme. Share your lived experience and help save lives in your community.',
    date: '15 Jan 2025',
    category: 'Programme',
    image: 'https://readdy.ai/api/search-image?query=training%20workshop%20with%20diverse%20participants%20learning%20together%2C%20instructor%20demonstrating%20to%20engaged%20audience%2C%20bright%20modern%20classroom%20setting%2C%20supportive%20educational%20environment%2C%20natural%20lighting&width=600&height=400&seq=news3&orientation=landscape'
  },
  {
    id: '4',
    title: 'Harm Reduction Week: Events Across Devon',
    excerpt: 'Join us for a week of awareness events, training sessions, and community gatherings as we mark International Harm Reduction Day.',
    date: '8 Jan 2025',
    category: 'Events',
    image: 'https://readdy.ai/api/search-image?query=outdoor%20community%20awareness%20event%20with%20information%20stalls%20and%20banners%2C%20people%20gathering%20and%20talking%2C%20colorful%20promotional%20materials%2C%20sunny%20day%20in%20UK%20town%20square%2C%20documentary%20photography%20style&width=600&height=400&seq=news4&orientation=landscape'
  }
];

const TIMESLOTS_API = 'https://readdy.ai/api/public/calendar/timeslots/f8279a7a-d235-4eb6-8767-d6df940d0739.de2ad2079adfe189d216fd904f778574d01d029bcb5d9d6371374bcf2bfe75f4';
const APPOINTMENTS_API = 'https://readdy.ai/api/public/calendar/appointments/f8279a7a-d235-4eb6-8767-d6df940d0739.de2ad2079adfe189d216fd904f778574d01d029bcb5d9d6371374bcf2bfe75f4';
const FORM_SUBMIT_URL = 'https://readdy.ai/api/form/d6g0jvqau1b90a40487g';

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

const galleryImages = [
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/67a3bbd7b80b424059ef25b0b86e1b3d.jpeg',
    alt: 'Real naloxone training session with community participants',
    tag: 'Community Training',
    caption: 'Live naloxone training session — participants learning overdose response',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/fd39ae49d33e19cbaa13fc55cf81f69c.jpeg',
    alt: 'Naloxone training session participants',
    tag: 'Community Training',
    caption: 'Naloxone training session in Plymouth',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/7ac6d78b83a2689caa69566d51eccf8b.jpeg',
    alt: 'Naloxone training group session',
    tag: 'Community Training',
    caption: 'Community naloxone training group',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/be6c1d445df4018d4d99ed99ecd19109.jpeg',
    alt: 'Training participants holding naloxone kits after completing training',
    tag: 'Community Training',
    caption: 'Participants proudly holding their naloxone kits after training',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/7836fdacd3bfb94dbb86fff7caaa0dfa.jpeg',
    alt: 'Two participants with naloxone kits at a warm welcome community venue',
    tag: 'Community Training',
    caption: 'Participants with their naloxone kits — a warm welcome venue',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/3fb7ff7aa3a2f0e737b610666e577deb.png',
    alt: 'Prenoxad injectable naloxone kit — yellow box',
    tag: 'Naloxone Kit',
    caption: 'Prenoxad injectable naloxone — available through our programme',
  },
  {
    src: 'https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e72e179575c97a920ea1ea7eea6cfc3e.png',
    alt: 'Inside the injectable naloxone kit — Prenoxad syringe',
    tag: 'Naloxone Kit',
    caption: 'Inside the kit — injectable Prenoxad syringe ready for use',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=naloxone%20training%20workshop%20in%20community%20hall%2C%20diverse%20group%20of%20adults%20sitting%20in%20circle%20listening%20to%20peer%20trainer%2C%20educational%20posters%20on%20walls%2C%20warm%20natural%20lighting%2C%20documentary%20photography%2C%20inclusive%20supportive%20atmosphere%2C%20Plymouth%20UK%20community%20setting&width=800&height=600&seq=gal1&orientation=landscape',
    alt: 'Community naloxone training session in Plymouth',
    tag: 'Community Training',
    caption: 'Peer-led naloxone training session, Plymouth Community Centre',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=outreach%20volunteer%20handing%20out%20naloxone%20kits%20on%20Plymouth%20city%20street%2C%20friendly%20interaction%20with%20community%20members%2C%20bright%20daytime%20outdoor%20setting%2C%20harm%20reduction%20outreach%2C%20documentary%20photography%20style%2C%20warm%20and%20approachable&width=400&height=300&seq=gal2&orientation=landscape',
    alt: 'Street outreach distributing naloxone kits',
    tag: 'Outreach',
    caption: 'Street outreach, Plymouth city centre',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=peer%20to%20peer%20naloxone%20training%20small%20group%20session%2C%20people%20with%20lived%20experience%20sharing%20stories%2C%20intimate%20supportive%20setting%2C%20community%20room%20with%20soft%20lighting%2C%20harm%20reduction%20education%2C%20documentary%20photography%2C%20empowering%20atmosphere&width=400&height=300&seq=gal3&orientation=landscape',
    alt: 'Peer-to-peer training session',
    tag: 'P2P Session',
    caption: 'Peer-to-Peer training, Devonport',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=community%20health%20awareness%20event%20outdoors%20in%20Plymouth%2C%20information%20stalls%20with%20harm%20reduction%20leaflets%20and%20naloxone%20kits%20on%20table%2C%20volunteers%20in%20branded%20t-shirts%2C%20sunny%20day%2C%20people%20browsing%20information%2C%20documentary%20photography&width=400&height=300&seq=gal4&orientation=landscape',
    alt: 'Community awareness event',
    tag: 'Community Event',
    caption: 'Harm Reduction Awareness Day',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=naloxone%20training%20certificate%20presentation%20ceremony%2C%20trainer%20handing%20certificate%20to%20smiling%20participant%2C%20warm%20indoor%20lighting%2C%20community%20hall%20setting%2C%20proud%20moment%2C%20documentary%20photography%2C%20inclusive%20and%20celebratory%20atmosphere&width=400&height=300&seq=gal5&orientation=landscape',
    alt: 'Certificate presentation after training',
    tag: 'Certification',
    caption: 'Participants receiving certificates',
  },
  {
    src: 'https://readdy.ai/api/search-image?query=large%20group%20photo%20of%20naloxone%20advocates%20volunteers%20and%20community%20members%20outside%20Plymouth%20building%2C%20diverse%20group%20smiling%20together%2C%20team%20photo%2C%20bright%20natural%20daylight%2C%20community%20organisation%2C%20documentary%20photography%2C%20warm%20and%20proud%20atmosphere&width=800&height=300&seq=gal6&orientation=landscape',
    alt: 'Naloxone Advocates Plymouth team and volunteers',
    tag: 'Our Team',
    caption: 'Naloxone Advocates Plymouth — volunteers and community partners',
  },
];

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
}

export default function HomePage() {
  usePageMeta({
    title: 'Plymouth Naloxone Training & Harm Reduction | Naloxone Advocates Plymouth CIC',
    description: 'Naloxone training and overdose prevention in Plymouth and Devon. Peer-led harm reduction organisation providing life-saving naloxone kits and community support. Book your training today.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/`,
    ogTitle: 'Naloxone Advocates Plymouth CIC — Naloxone Training',
    ogDescription: 'Grassroots harm reduction organisation providing naloxone training and kits across Plymouth and Devon. Peer-led, stigma-free support.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/#website`,
          "url": import.meta.env.VITE_SITE_URL || 'https://example.com',
          "name": "Naloxone Advocates Plymouth CIC",
          "description": "Free naloxone training and overdose prevention in Plymouth and Devon.",
          "inLanguage": "en-GB",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/?s={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": ["NGO", "LocalBusiness"],
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/#organization`,
          "name": "Naloxone Advocates Plymouth CIC",
          "url": import.meta.env.VITE_SITE_URL || 'https://example.com',
          "logo": "https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg",
          "image": "https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg",
          "description": "Grassroots, peer-led harm reduction organisation providing free naloxone training and kits across Plymouth and Devon.",
          "foundingDate": "2024",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Hyde Park House, Mutley Plain",
            "addressLocality": "Plymouth",
            "addressRegion": "Devon",
            "postalCode": "PL4 6LF",
            "addressCountry": "GB"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 50.3755,
            "longitude": -4.1427
          },
          "telephone": "+447561349137",
          "email": "napplymouth66@gmail.com",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
              "opens": "09:00",
              "closes": "17:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Saturday"],
              "opens": "10:00",
              "closes": "14:00"
            }
          ],
          "sameAs": [
            "https://www.facebook.com/napplymouth",
            "https://www.instagram.com/napplymouth"
          ],
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": "Plymouth and Devon, UK"
          }
        },
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/`,
          "name": "Plymouth Naloxone Training & Harm Reduction | Naloxone Advocates Plymouth CIC",
          "description": "Naloxone training and overdose prevention in Plymouth and Devon. Peer-led harm reduction organisation providing life-saving naloxone kits and community support.",
          "inLanguage": "en-GB",
          "isPartOf": { "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/#website` },
          "about": { "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/#organization` },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' }
            ]
          }
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-home';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-home')?.remove(); };
  }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [footerEmail, setFooterEmail] = useState('');
  const [footerNewsletterStatus, setFooterNewsletterStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const { addToCart: addItemToCart, items: cartItems } = useCart();

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('events')
        .select('id, title, description, event_date, location, event_type')
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);
      if (data) setUpcomingEvents(data);
    };
    fetchUpcomingEvents();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterStatus('submitting');
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await fetch('https://readdy.ai/api/form/d6g1d80r225iqdhs0i00', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      navigate('/thank-you?type=newsletter');
    } catch {
      setNewsletterStatus('error');
    }
  };

  const handleFooterNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFooterNewsletterStatus('submitting');
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await fetch('https://readdy.ai/api/form/d6g1d80r225iqdhs0i00', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      navigate('/thank-you?type=newsletter');
    } catch {
      setFooterNewsletterStatus('error');
    }
  };

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const eventTypeColor: Record<string, string> = {
    training: 'bg-blue-500 text-white',
    outreach: 'bg-pink-500 text-white',
    awareness: 'bg-yellow-400 text-gray-900',
    community: 'bg-lime-400 text-gray-900',
    fundraising: 'bg-orange-400 text-white',
  };

  const eventTypeIcon: Record<string, string> = {
    training: 'ri-graduation-cap-fill',
    outreach: 'ri-map-pin-user-fill',
    awareness: 'ri-megaphone-fill',
    community: 'ri-team-fill',
    fundraising: 'ri-heart-fill',
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteNav transparent onCartOpen={() => setIsCartOpen(true)} />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            {/* Left Content */}
            <div className="md:col-span-3 bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-12 shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Saving Lives<br />Through<br />Community Action
              </h1>
              <p className="text-xl text-gray-800 mb-8 font-semibold">
                Naloxone training and kits for Plymouth and Devon communities
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/training" className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
                  Book Training <i className="ri-arrow-right-line ml-2"></i>
                </Link>
                <Link to="/get-naloxone" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
                  Request Naloxone Kit <i className="ri-arrow-right-line ml-2"></i>
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="md:col-span-2">
              <div className="bg-blue-500 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-full h-56 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    <img 
                      src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/10f0dec747be5904612f1e23bddbdfc7.png" 
                      alt="Naloxone take-home kit — yellow box with Pebble nasal spray"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="mt-5 text-center">
                    <p className="text-white font-bold text-base leading-snug">Your Free Naloxone Kit</p>
                    <p className="text-blue-100 text-sm mt-1">Pebble nasal spray — included with every training</p>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-medicine-bottle-fill text-white text-2xl"></i>
                    </div>
                    <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-team-fill text-gray-900 text-2xl"></i>
                    </div>
                    <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-heart-pulse-fill text-white text-2xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-blue-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="border-b md:border-b-0 md:border-r border-white/30 pb-8 md:pb-0">
              <div className="text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-xl text-yellow-400 font-semibold">People Trained</div>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-white/30 pb-8 md:pb-0">
              <div className="text-5xl font-bold text-white mb-2">1,200+</div>
              <div className="text-xl text-yellow-400 font-semibold">Naloxone Kits Distributed</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-xl text-yellow-400 font-semibold">Lives Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Banner Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Our Story
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See Us in Action
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Watch how our community training sessions are saving lives across Plymouth and Devon
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400/30" style={{ paddingBottom: '56.25%' }}>
              {/* Placeholder background image */}
              <img
                src="https://readdy.ai/api/search-image?query=naloxone%20training%20community%20session%20documentary%20film%20still%2C%20group%20of%20people%20in%20community%20hall%20learning%20overdose%20response%2C%20cinematic%20wide%20angle%20shot%2C%20warm%20golden%20hour%20lighting%2C%20documentary%20film%20aesthetic%2C%20Plymouth%20UK%20harm%20reduction%2C%20emotional%20and%20powerful%20scene&width=1280&height=720&seq=videobanner1&orientation=landscape"
                alt="Video coming soon - Naloxone Advocates Plymouth"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Play button & coming soon message */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl mb-6 cursor-pointer hover:scale-110 transition-transform">
                  <i className="ri-play-fill text-gray-900 text-5xl ml-2"></i>
                </div>
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-5 max-w-lg">
                  <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
                    <i className="ri-time-line"></i> Coming Soon
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Our Video is on Its Way</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We're putting together a short film about our community's work. Check back soon — or follow us on social media for the premiere announcement.
                  </p>
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                <i className="ri-film-line mr-1"></i> Video Coming Soon
              </div>
            </div>

            {/* Below video row */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <i className="ri-notification-3-line text-yellow-400 text-base"></i>
                </div>
                <span>Want to be notified when it's live? Subscribe to our newsletter below.</span>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/napplymouth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm hover:text-pink-600 transition-colors cursor-pointer"
                >
                  <i className="ri-facebook-fill"></i> Follow for Updates
                </a>
                <a
                  href="https://www.instagram.com/napplymouth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-colors cursor-pointer"
                >
                  <i className="ri-instagram-fill"></i> Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Training Sessions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Book Now
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upcoming Training Sessions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a session that works for you and add it to your booking cart
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrainingSessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-gray-50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {session.name}
                  </span>
                  <span className="bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                    {session.price}
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-calendar-fill text-pink-500 text-xl"></i>
                    </div>
                    <span className="ml-2 font-semibold">{session.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-time-fill text-pink-500 text-xl"></i>
                    </div>
                    <span className="ml-2">{session.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-map-pin-fill text-pink-500 text-xl"></i>
                    </div>
                    <span className="ml-2 text-sm">{session.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => addItemToCart(session)}
                  disabled={cartItems.some(item => item.id === session.id)}
                  className={`w-full py-3 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                    cartItems.some(item => item.id === session.id)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  }`}
                >
                  {cartItems.some(item => item.id === session.id) ? (
                    <><i className="ri-check-line mr-2"></i>Added to Cart</>
                  ) : (
                    <><i className="ri-shopping-cart-2-line mr-2"></i>Add to Cart</>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/training" className="inline-block bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap">
              View All Training Options <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>

          {/* Booking Calendar Section */}
          <section id="book-session-home" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
                  Schedule Your Session
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Book Your Training
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Pick a date and time that works for you. All sessions are at no cost to you.
                </p>
              </div>

              <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <BookingCalendar
                  timeslotsApi={TIMESLOTS_API}
                  appointmentsApi={APPOINTMENTS_API}
                  formSubmitUrl={FORM_SUBMIT_URL}
                  texts={calendarTexts}
                />
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
            Who We Are
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                A Grassroots Movement for Harm Reduction
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Naloxone Advocates Plymouth CIC is a <strong className="text-blue-500">community-led organisation</strong> dedicated to reducing drug-related deaths through education, training, and direct action.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We are a <strong className="text-blue-500">peer-led, lived-experience team</strong> who understand the challenges faced by people who use drugs. Our approach is rooted in compassion, dignity, and the belief that every life matters.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Through our <strong className="text-blue-500">Peer-to-Peer (P2P) project</strong>, we provide free naloxone training and kits across Plymouth and Devon, creating a safer community for everyone.
              </p>
              <Link to="/about" className="inline-block bg-lime-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-500 transition-all shadow-lg whitespace-nowrap">
                Read Our Story
              </Link>
            </div>
            <div className="relative">
              <div className="bg-yellow-400 rounded-3xl p-8 transform rotate-3 absolute inset-0"></div>
              <div className="bg-white border-4 border-pink-500 rounded-3xl p-8 relative shadow-xl">
                <blockquote className="text-2xl text-gray-800 italic leading-relaxed mb-6">
                  "This organisation saved my life. The training was non-judgemental, practical, and gave me the confidence to help others in my community."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">JM</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-gray-900 text-lg">Community Member</div>
                    <div className="text-gray-700 text-sm">Plymouth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-20 bg-lime-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            Naloxone Training Programmes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Community Training
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Learn to recognise overdose signs</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">How to administer naloxone safely</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Naloxone kit provided at no cost</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Certificate of completion</span>
                </li>
              </ul>
              <Link to="/training" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap">
                Learn More
              </Link>
            </div>

            {/* Card 2 - Featured */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl ring-4 ring-pink-500 transform md:scale-105">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-hand-heart-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Peer-to-Peer (P2P)
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Lived-experience led training</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Stigma-free, supportive environment</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Ongoing peer support network</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Community outreach opportunities</span>
                </li>
              </ul>
              <Link to="/training" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap">
                Learn More
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-building-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Organisational Training
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Tailored for workplaces & services</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Group sessions available</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Policy guidance included</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-pink-500 text-xl mr-3 mt-1"></i>
                  <span className="text-gray-700">Flexible scheduling options</span>
                </li>
              </ul>
              <Link to="/training" className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Get Naloxone Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
            How to Get Naloxone
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div className="bg-blue-500 rounded-3xl p-10 shadow-xl">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
                <span className="text-blue-500 font-bold text-4xl">1</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Book Training</h3>
              <p className="text-white text-lg mb-6 leading-relaxed">
                Attend one of our naloxone training sessions. Learn how to recognise an opioid overdose and administer naloxone safely and confidently.
              </p>
              <Link to="/training" className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-center hover:bg-yellow-500 transition-all whitespace-nowrap">
                Book Training
              </Link>
            </div>

            <div className="hidden md:flex justify-center">
              <i className="ri-arrow-right-line text-gray-400 text-6xl"></i>
            </div>

            <div className="md:hidden flex justify-center py-4">
              <i className="ri-arrow-down-line text-gray-400 text-6xl"></i>
            </div>

            <div className="bg-pink-500 rounded-3xl p-10 shadow-xl">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
                <span className="text-pink-500 font-bold text-4xl">2</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Get Your Kit</h3>
              <p className="text-white text-lg mb-6 leading-relaxed">
                Receive your free naloxone kit at the end of training. You'll have everything you need to respond to an overdose emergency.
              </p>
              <Link to="/get-naloxone" className="inline-block bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-center hover:bg-blue-600 transition-all whitespace-nowrap">
                Get Your Kit
              </Link>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="bg-yellow-400 rounded-3xl p-8 shadow-xl text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="ri-alarm-warning-fill text-red-600 text-5xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">In an Emergency</h3>
            <p className="text-lg text-gray-800 font-semibold">
              Always call 999 first. Naloxone is a temporary measure - professional medical help is essential.
            </p>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-20 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
            Join Our Community
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <i className="ri-user-voice-fill text-gray-900 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Peer Trainer</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Share your lived experience and help train others in your community. Full training and ongoing support provided.
              </p>
              <Link to="/volunteer" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                Learn More <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mb-4">
                <i className="ri-map-pin-user-fill text-gray-900 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Outreach Volunteer</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Help us reach people in the community who need naloxone. Distribute kits and information at events and on the streets.
              </p>
              <Link to="/volunteer" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                Learn More <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                <i className="ri-calendar-event-fill text-gray-900 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Event Support</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Help at community events, awareness campaigns, and fundraising activities. Flexible commitment options available.
              </p>
              <Link to="/volunteer" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                Learn More <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <i className="ri-computer-fill text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Behind the Scenes</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Support with admin, social media, design, or other skills. Work remotely or in-person based on your availability.
              </p>
              <Link to="/volunteer" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                Learn More <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link to="/volunteer" className="inline-block bg-yellow-400 text-gray-900 px-12 py-5 rounded-full font-bold text-xl hover:bg-yellow-500 transition-all shadow-xl whitespace-nowrap">
              <i className="ri-heart-fill mr-2"></i>
              Sign Up to Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
            Resources
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            Download Our Harm Reduction Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-yellow-400 flex items-center justify-center">
                <i className="ri-file-text-fill text-gray-900 text-6xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Overdose Response Guide</h3>
                <p className="text-gray-600 text-sm mb-4">Step-by-step instructions for responding to an opioid overdose</p>
                <a href="#" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>Download PDF
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-blue-500 flex items-center justify-center">
                <i className="ri-first-aid-kit-fill text-white text-6xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Naloxone Administration</h3>
                <p className="text-gray-600 text-sm mb-4">Visual guide to administering naloxone nasal spray</p>
                <a href="#" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>Download PDF
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-pink-500 flex items-center justify-center">
                <i className="ri-heart-pulse-fill text-white text-6xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Harm Reduction Poster</h3>
                <p className="text-gray-600 text-sm mb-4">Community awareness poster for public spaces</p>
                <a href="#" className="text-blue-500 font-bold hover:text-blue-600 transition-colors inline-flex items-center whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>Download PDF
                </a>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/resources" className="inline-block bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap">
              View All Resources <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Latest Updates
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              News & Announcements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay informed about our latest initiatives, events, and community impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Featured News */}
            <div className="md:row-span-2 bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl overflow-hidden shadow-xl group">
              <div className="h-64 overflow-hidden">
                <img 
                  src={newsItems[0].image}
                  alt={newsItems[0].title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {newsItems[0].category}
                  </span>
                  <span className="text-gray-800 text-sm font-semibold">
                    <i className="ri-calendar-line mr-1"></i>{newsItems[0].date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {newsItems[0].title}
                </h3>
                <p className="text-gray-800 leading-relaxed mb-6">
                  {newsItems[0].excerpt}
                </p>
                <a href="#" className="inline-flex items-center text-gray-900 font-bold hover:text-pink-600 transition-colors cursor-pointer">
                  Read Full Story <i className="ri-arrow-right-line ml-2"></i>
                </a>
              </div>
            </div>

            {/* Other News Items */}
            {newsItems.slice(1).map((news) => (
              <div key={news.id} className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 h-40 sm:h-auto overflow-hidden flex-shrink-0">
                    <img 
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {news.category}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {news.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {news.excerpt}
                    </p>
                    <a href="#" className="inline-flex items-center text-pink-500 font-semibold text-sm hover:text-pink-600 transition-colors cursor-pointer">
                      Read More <i className="ri-arrow-right-s-line ml-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/news" className="inline-block bg-yellow-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg whitespace-nowrap">
              View All News <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
                What's On
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Upcoming Community Events
              </h2>
              <p className="text-xl text-gray-600 mt-3 max-w-xl">
                Join us at our next outreach sessions, awareness days, and community gatherings across Plymouth and Devon.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-gray-900 text-yellow-400 px-7 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap self-start md:self-auto"
            >
              View All Events <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-event-line text-yellow-500 text-3xl"></i>
              </div>
              <p className="text-gray-500 text-lg font-medium">No upcoming events scheduled right now.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon — new events are added regularly.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, idx) => {
                const typeKey = (event.event_type || '').toLowerCase();
                const badgeClass = eventTypeColor[typeKey] || 'bg-gray-200 text-gray-700';
                const iconClass = eventTypeIcon[typeKey] || 'ri-calendar-event-fill';
                const accentColors = ['border-yellow-400', 'border-pink-500', 'border-lime-400'];
                const iconBg = ['bg-yellow-400', 'bg-pink-500', 'bg-lime-400'];
                const iconText = ['text-gray-900', 'text-white', 'text-gray-900'];
                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-3xl p-7 shadow-lg hover:shadow-xl transition-all border-t-4 ${accentColors[idx % 3]} flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 ${iconBg[idx % 3]} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <i className={`${iconClass} ${iconText[idx % 3]} text-xl`}></i>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${badgeClass}`}>
                        {event.event_type || 'Event'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className="ri-calendar-fill text-pink-500 text-base"></i>
                        </div>
                        <span className="font-semibold">{formatEventDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className="ri-time-fill text-pink-500 text-base"></i>
                        </div>
                        <span>{formatEventTime(event.event_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className="ri-map-pin-fill text-pink-500 text-base"></i>
                          </div>
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/events"
                      className="mt-5 w-full text-center bg-gray-50 hover:bg-yellow-400 text-gray-700 hover:text-gray-900 py-3 rounded-full font-bold text-sm transition-all border border-gray-200 hover:border-yellow-400 whitespace-nowrap cursor-pointer"
                    >
                      View Details <i className="ri-arrow-right-line ml-1"></i>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/events"
              className="inline-block bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
            >
              See Full Events Calendar <i className="ri-calendar-2-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials / Impact Stories Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Real Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lives Changed by Our Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from the people whose lives have been touched by naloxone training and harm reduction support across Plymouth and Devon.
            </p>
          </div>

          {/* Featured large quote */}
          <div className="relative bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-10 md:p-14 mb-10 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <i className="ri-double-quotes-l text-gray-900/30 text-7xl leading-none"></i>
              </div>
              <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed mb-8">
                "I used naloxone on my son last year. Without the training I got from Naloxone Advocates Plymouth, I wouldn't have known what to do. He's alive today because of this organisation. I can't put into words what that means."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-lg">DH</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 text-lg">Deborah H.</div>
                  <div className="text-gray-700 text-sm">Parent, Plymouth</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of testimonials */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                quote: "The training was completely non-judgemental. As someone with lived experience of addiction, I've faced a lot of stigma from services. NAP treated me with dignity and respect from the moment I walked in.",
                name: "Marcus T.",
                role: "Peer Trainer, Devonport",
                initials: "MT",
                color: "bg-blue-500",
                accent: "border-blue-500",
              },
              {
                quote: "I work in a homeless shelter and we've now had three overdose reversals using naloxone from NAP's training. Every single member of our staff has been trained. It should be mandatory everywhere.",
                name: "Priya S.",
                role: "Support Worker, Plymouth",
                initials: "PS",
                color: "bg-lime-500",
                accent: "border-lime-400",
              },
              {
                quote: "My friend collapsed at a festival. I'd done the P2P training just two weeks before. I gave him naloxone and he came round before the ambulance arrived. The paramedics said I saved his life.",
                name: "Ryan C.",
                role: "Community Member, Exeter",
                initials: "RC",
                color: "bg-pink-500",
                accent: "border-pink-500",
              },
              {
                quote: "As a GP, I refer patients to NAP regularly. The quality of their training is outstanding — practical, compassionate, and genuinely life-saving. They fill a gap that the NHS simply can't.",
                name: "Dr. Fiona M.",
                role: "GP, Plymouth",
                initials: "FM",
                color: "bg-yellow-500",
                accent: "border-yellow-400",
              },
              {
                quote: "I became a volunteer peer trainer after NAP helped me through a really dark time. Now I get to give back and help others in my community. It's given me purpose and confidence I never thought I'd have.",
                name: "Leanne B.",
                role: "Volunteer Peer Trainer",
                initials: "LB",
                color: "bg-blue-500",
                accent: "border-blue-500",
              },
              {
                quote: "We hosted a training session at our community centre and 24 people attended. The trainer was brilliant — warm, knowledgeable, and made everyone feel safe. We're booking another session already.",
                name: "Tony W.",
                role: "Community Centre Manager, Stonehouse",
                initials: "TW",
                color: "bg-pink-500",
                accent: "border-pink-500",
              },
            ].map((t) => (
              <div
                key={t.name}
                className={`bg-gray-50 rounded-3xl p-7 shadow-md hover:shadow-xl transition-all border-t-4 ${t.accent} flex flex-col`}
              >
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <i className="ri-double-quotes-l text-gray-300 text-4xl leading-none"></i>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm flex-1 mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center flex-shrink-0`}>
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

          {/* Impact numbers strip */}
          <div className="bg-gray-900 rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">The numbers behind the stories</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { number: "150+", label: "Overdoses Reversed", icon: "ri-heart-pulse-fill", color: "text-yellow-400" },
                { number: "500+", label: "People Trained", icon: "ri-graduation-cap-fill", color: "text-pink-400" },
                { number: "98%", label: "Would Recommend Us", icon: "ri-star-fill", color: "text-lime-400" },
                { number: "4.9★", label: "Average Rating", icon: "ri-award-fill", color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <i className={`${stat.icon} ${stat.color} text-3xl`}></i>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Funders Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Our Partners & Funders
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Supported By Amazing Organisations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our life-saving work is made possible through the generous support of these organisations and funders
            </p>
          </div>

          {/* Tier 1 — Lead Funders */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Lead Funders</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'NHS Devon Integrated Care Board',
                  description: 'Funding naloxone distribution and community training programmes across Devon',
                  icon: 'ri-hospital-fill',
                  color: 'bg-blue-500',
                  tag: 'Health Funder',
                  tagColor: 'bg-blue-100 text-blue-700',
                },
                {
                  name: 'Plymouth City Council',
                  description: 'Supporting harm reduction outreach and community engagement initiatives in Plymouth',
                  icon: 'ri-government-fill',
                  color: 'bg-pink-500',
                  tag: 'Local Authority',
                  tagColor: 'bg-pink-100 text-pink-700',
                },
                {
                  name: 'National Lottery Community Fund',
                  description: 'Enabling peer trainer development and the expansion of our P2P programme',
                  icon: 'ri-funds-fill',
                  color: 'bg-lime-500',
                  tag: 'Grant Funder',
                  tagColor: 'bg-lime-100 text-lime-700',
                },
              ].map((partner) => (
                <div key={partner.name} className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400 group">
                  <div className={`w-16 h-16 ${partner.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <i className={`${partner.icon} text-white text-3xl`}></i>
                  </div>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${partner.tagColor}`}>
                    {partner.tag}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{partner.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{partner.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2 — Community Partners */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Community Partners</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Harbour Drug & Alcohol Service', icon: 'ri-heart-pulse-fill', color: 'bg-yellow-400', textColor: 'text-gray-900' },
                { name: 'St Luke\'s Hospice Plymouth', icon: 'ri-home-heart-fill', color: 'bg-pink-500', textColor: 'text-white' },
                { name: 'Shelter Devon', icon: 'ri-home-fill', color: 'bg-blue-500', textColor: 'text-white' },
                { name: 'Devon & Cornwall Police', icon: 'ri-shield-fill', color: 'bg-lime-500', textColor: 'text-white' },
                { name: 'University Hospitals Plymouth', icon: 'ri-hospital-line', color: 'bg-pink-400', textColor: 'text-white' },
                { name: 'Plymouth Community Homes', icon: 'ri-building-fill', color: 'bg-yellow-500', textColor: 'text-white' },
                { name: 'Addaction Devon', icon: 'ri-user-heart-fill', color: 'bg-blue-400', textColor: 'text-white' },
                { name: 'The Nelson Trust', icon: 'ri-hand-heart-fill', color: 'bg-lime-400', textColor: 'text-gray-900' },
              ].map((partner) => (
                <div key={partner.name} className="bg-gray-50 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all text-center group hover:-translate-y-1 cursor-default">
                  <div className={`w-12 h-12 ${partner.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <i className={`${partner.icon} ${partner.textColor} text-xl`}></i>
                  </div>
                  <p className="text-gray-800 font-semibold text-sm leading-tight">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Become a Partner CTA */}
          <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-10 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/70 text-gray-900 px-5 py-2 rounded-full font-bold mb-5 text-sm">
                  <i className="ri-handshake-fill text-pink-500"></i>
                  Partner With Us
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  Want to Support Our Work?
                </h3>
                <p className="text-gray-800 leading-relaxed mb-2">
                  Whether you're a local business, NHS service, charity, or community organisation — there are many ways to partner with Naloxone Advocates Plymouth.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  From funding training sessions to hosting outreach events, your support directly saves lives in Plymouth and Devon.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-md flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-funds-fill text-gray-900 text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Fund a Training Session</h4>
                    <p className="text-gray-600 text-sm">Sponsor a free community training session in your area</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-md flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-fill text-gray-900 text-lg"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Host an Outreach Point</h4>
                    <p className="text-gray-600 text-sm">Become a naloxone kit collection point in your community</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/partners"
                    className="flex-1 bg-gray-900 text-yellow-400 px-6 py-4 rounded-full font-bold text-center hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap"
                  >
                    Meet Our Partners <i className="ri-arrow-right-line ml-1"></i>
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 bg-pink-500 text-white px-6 py-4 rounded-full font-bold text-center hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
                  >
                    Get in Touch <i className="ri-arrow-right-line ml-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 via-lime-300 to-lime-400 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/15 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-400/20 rounded-full"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-block bg-white/80 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 shadow-sm">
              <i className="ri-mail-send-fill text-pink-500 text-lg"></i>
              Stay Informed
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Get Training Updates<br />Straight to Your Inbox
            </h2>
            <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              Be the first to hear about new training sessions, harm reduction resources, and community events across Plymouth and Devon.
            </p>
          </div>

          {/* Benefits row */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { icon: 'ri-calendar-event-fill', text: 'New session dates' },
              { icon: 'ri-file-download-fill', text: 'Free resources' },
              { icon: 'ri-megaphone-fill', text: 'Community news' },
              { icon: 'ri-heart-fill', text: 'Impact stories' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 bg-white/70 px-5 py-2 rounded-full shadow-sm">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-pink-500 text-base`}></i>
                </div>
                <span className="text-gray-900 font-semibold text-sm whitespace-nowrap">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Subscribe to our newsletter</h3>
            <form
              id="newsletter-signup-form"
              data-readdy-form
              onSubmit={handleNewsletterSubmit}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="e.g. Sarah"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="e.g. Jones"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-pink-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">I am interested in… <span className="text-gray-400 font-normal">(optional)</span></label>
                <select
                  name="interest"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm bg-white cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="Community Training">Community Training</option>
                  <option value="Peer-to-Peer (P2P)">Peer-to-Peer (P2P)</option>
                  <option value="Organisational Training">Organisational Training</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="General Updates">General Updates</option>
                </select>
              </div>
              {newsletterStatus === 'error' && (
                <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={newsletterStatus === 'submitting'}
                className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {newsletterStatus === 'submitting' ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i>Subscribing…</>
                ) : (
                  <><i className="ri-mail-send-fill mr-2"></i>Subscribe Now</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                No spam, ever. Unsubscribe at any time. We respect your privacy.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              In Action
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Training Sessions &amp; Community Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A glimpse into our work across Plymouth and Devon — real people, real training, real impact.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Real training photo - large featured */}
            <div
              className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '420px' }}
              onClick={() => setGalleryOpen({ open: true, index: 0 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/67a3bbd7b80b424059ef25b0b86e1b3d.jpeg"
                alt="Real naloxone training session with community participants"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-sm">Live naloxone training session — participants learning overdose response</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
              </div>
            </div>

            {/* Image 2 - fd39ae */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 1 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/fd39ae49d33e19cbaa13fc55cf81f69c.jpeg"
                alt="Naloxone training session participants"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-xs">Naloxone training session in Plymouth</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 3 - 7ac6d78b */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 2 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/7ac6d78b83a2689caa69566d51eccf8b.jpeg"
                alt="Naloxone training group session"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-xs">Community naloxone training group</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 4 - be6c1d */}
            <div
              className="col-span-2 relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 3 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/be6c1d445df4018d4d99ed99ecd19109.jpeg"
                alt="Training participants holding naloxone kits after completing training"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-sm">Participants proudly holding their naloxone kits after training</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
              </div>
            </div>

            {/* Image 5 - NEW 7836fdac */}
            <div
              className="col-span-2 relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 4 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/7836fdacd3bfb94dbb86fff7caaa0dfa.jpeg"
                alt="Two participants with naloxone kits at a warm welcome community venue"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-sm">Participants with their naloxone kits — a warm welcome venue</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
              </div>
            </div>

            {/* Image 6 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 5 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=naloxone%20training%20workshop%20in%20community%20hall%2C%20diverse%20group%20of%20adults%20sitting%20in%20circle%20listening%20to%20peer%20trainer%2C%20educational%20posters%20on%20walls%2C%20warm%20natural%20lighting%2C%20documentary%20photography%2C%20inclusive%20supportive%20atmosphere%2C%20Plymouth%20UK%20community%20setting&width=800&height=600&seq=gal1&orientation=landscape"
                alt="Community naloxone training session in Plymouth"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Community Training</span>
                  <p className="text-white font-semibold text-sm">Peer-led naloxone training session, Plymouth Community Centre</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
              </div>
            </div>

            {/* Image 7 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 6 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=outreach%20volunteer%20handing%20out%20naloxone%20kits%20on%20Plymouth%20city%20street%2C%20friendly%20interaction%20with%20community%20members%2C%20bright%20daytime%20outdoor%20setting%2C%20harm%20reduction%20outreach%2C%20documentary%20photography%20style%2C%20warm%20and%20approachable&width=400&height=300&seq=gal2&orientation=landscape"
                alt="Street outreach distributing naloxone kits"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Outreach</span>
                  <p className="text-white font-semibold text-xs">Street outreach, Plymouth city centre</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 8 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 7 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=peer%20to%20peer%20naloxone%20training%20small%20group%20session%2C%20people%20with%20lived%20experience%20sharing%20stories%2C%20intimate%20supportive%20setting%2C%20community%20room%20with%20soft%20lighting%2C%20harm%20reduction%20education%2C%20documentary%20photography%2C%20empowering%20atmosphere&width=400&height=300&seq=gal3&orientation=landscape"
                alt="Peer-to-peer training session"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">P2P Session</span>
                  <p className="text-white font-semibold text-xs">Peer-to-Peer training, Devonport</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 9 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 8 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=community%20health%20awareness%20event%20outdoors%20in%20Plymouth%2C%20information%20stalls%20with%20harm%20reduction%20leaflets%20and%20naloxone%20kits%20on%20table%2C%20volunteers%20in%20branded%20t-shirts%2C%20sunny%20day%2C%20people%20browsing%20information%2C%20documentary%20photography&width=400&height=300&seq=gal4&orientation=landscape"
                alt="Community awareness event"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Community Event</span>
                  <p className="text-white font-semibold text-xs">Harm Reduction Awareness Day</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 10 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 9 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=naloxone%20training%20certificate%20presentation%20ceremony%2C%20trainer%20handing%20certificate%20to%20smiling%20participant%2C%20warm%20indoor%20lighting%2C%20community%20hall%20setting%2C%20proud%20moment%2C%20documentary%20photography%2C%20inclusive%20and%20celebratory%20atmosphere&width=400&height=300&seq=gal5&orientation=landscape"
                alt="Certificate presentation after training"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Certification</span>
                  <p className="text-white font-semibold text-xs">Participants receiving certificates</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 11 - wide */}
            <div
              className="col-span-2 relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 10 })}
            >
              <img
                src="https://readdy.ai/api/search-image?query=large%20group%20photo%20of%20naloxone%20advocates%20volunteers%20and%20community%20members%20outside%20Plymouth%20building%2C%20diverse%20group%20smiling%20together%2C%20team%20photo%2C%20bright%20natural%20daylight%2C%20community%20organisation%2C%20documentary%20photography%2C%20warm%20and%20proud%20atmosphere&width=800&height=300&seq=gal6&orientation=landscape"
                alt="Naloxone Advocates Plymouth team and volunteers"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Our Team</span>
                  <p className="text-white font-semibold text-sm">Naloxone Advocates Plymouth — volunteers and community partners</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-lg"></i>
              </div>
            </div>

            {/* Image 12 - Injectable kit box (Prenoxad) */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 5 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/3fb7ff7aa3a2f0e737b610666e577deb.png"
                alt="Prenoxad injectable naloxone kit — yellow box"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Naloxone Kit</span>
                  <p className="text-white font-semibold text-xs">Prenoxad injectable naloxone — available through our programme</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>

            {/* Image 13 - Inside the kit (syringe) */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: '200px' }}
              onClick={() => setGalleryOpen({ open: true, index: 6 })}
            >
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e72e179575c97a920ea1ea7eea6cfc3e.png"
                alt="Inside the injectable naloxone kit — Prenoxad syringe"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">Naloxone Kit</span>
                  <p className="text-white font-semibold text-xs">Inside the kit — injectable Prenoxad syringe ready for use</p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="ri-zoom-in-line text-gray-900 text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {galleryOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setGalleryOpen({ open: false, index: 0 })}>
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer z-10"
            onClick={() => setGalleryOpen({ open: false, index: 0 })}
          >
            <i className="ri-close-line text-white text-2xl"></i>
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); setGalleryOpen(prev => ({ ...prev, index: (prev.index - 1 + galleryImages.length) % galleryImages.length })); }}
          >
            <i className="ri-arrow-left-line text-white text-2xl"></i>
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); setGalleryOpen(prev => ({ ...prev, index: (prev.index + 1) % galleryImages.length })); }}
          >
            <i className="ri-arrow-right-line text-white text-2xl"></i>
          </button>
          <div className="max-w-4xl w-full mx-8" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: '75vh' }}>
              <img
                src={galleryImages[galleryOpen.index].src}
                alt={galleryImages[galleryOpen.index].alt}
                className="w-full h-full object-cover object-top"
                style={{ maxHeight: '65vh' }}
              />
            </div>
            <div className="mt-4 text-center">
              <span className="inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold mr-3">
                {galleryImages[galleryOpen.index].tag}
              </span>
              <span className="text-white text-sm">{galleryImages[galleryOpen.index].caption}</span>
              <p className="text-gray-400 text-xs mt-2">{galleryOpen.index + 1} / {galleryImages.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white font-semibold mb-10">
            Join us in saving lives and building a safer, more compassionate community
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <Link to="/training" className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
              Get Trained <i className="ri-arrow-right-line ml-2"></i>
            </Link>
            <Link to="/contact" className="bg-white text-blue-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center whitespace-nowrap">
              Contact Us <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
          <div className="flex justify-center gap-6">
            <a href="tel:07561349137" className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <i className="ri-phone-fill text-blue-500 text-2xl"></i>
            </a>
            <a href="mailto:napplymouth66@gmail.com" className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <i className="ri-mail-fill text-blue-500 text-2xl"></i>
            </a>
            <a href="#" className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <i className="ri-facebook-fill text-blue-500 text-2xl"></i>
            </a>
            <a href="#" className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <i className="ri-instagram-fill text-blue-500 text-2xl"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div>
              <div className="mb-4">
                <img
                  src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                  alt="Naloxone Advocates Plymouth"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                A grassroots, peer-led harm reduction organisation dedicated to saving lives through naloxone training and community support.
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/napplymouth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-facebook-fill text-gray-900 text-xl"></i>
                </a>
                <a href="https://www.instagram.com/napplymouth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-instagram-fill text-white text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-twitter-fill text-white text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-linkedin-fill text-gray-900 text-xl"></i>
                </a>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training & P2P</Link></li>
                <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">News</Link></li>
                <li>
                  <a
                    href="https://www.justgiving.com/naloxoneadvocatesplymouth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Donate
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Get Help</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="font-semibold text-white">Emergency: 999</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
                <Link to="/get-naloxone" className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all whitespace-nowrap">
                  Crisis Resources
                </Link>
              </div>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-lime-400 font-bold text-lg mb-4">Stay Connected</h3>
              <p className="text-gray-400 text-sm mb-4">Get updates on training sessions and harm reduction news</p>
              <form
                id="footer-newsletter-form"
                data-readdy-form
                onSubmit={handleFooterNewsletterSubmit}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full bg-transparent border-b-2 border-pink-400 text-white placeholder-gray-500 px-2 py-2 focus:outline-none focus:border-yellow-400 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={footerNewsletterStatus === 'submitting'}
                  className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <i className={footerNewsletterStatus === 'submitting' ? 'ri-loader-4-line animate-spin' : 'ri-arrow-right-line'}></i>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="bg-yellow-400 rounded-2xl py-6 mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                NALOXONE SAVES LIVES
              </h2>
            </div>
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
              <p className="mt-2">
                <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Powered by Readdy
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
