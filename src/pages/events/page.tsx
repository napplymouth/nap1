
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../../components/feature/SiteNav';
import { usePageMeta } from '../../hooks/usePageMeta';
import supabase from '../../lib/supabase';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  total_spots: number;
  spots_remaining: number;
  created_at: string;
}

type FilterType = 'all' | 'upcoming' | 'this-month';

const CATEGORY_COLOURS: Record<string, { bg: string; text: string; dot: string }> = {
  Training: { bg: 'bg-yellow-400', text: 'text-gray-900', dot: 'bg-yellow-400' },
  Outreach: { bg: 'bg-pink-500', text: 'text-white', dot: 'bg-pink-500' },
  Awareness: { bg: 'bg-lime-400', text: 'text-gray-900', dot: 'bg-lime-400' },
  Community: { bg: 'bg-blue-500', text: 'text-white', dot: 'bg-blue-500' },
  Default: { bg: 'bg-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' },
};

function getCategoryFromName(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('training') || lower.includes('p2p') || lower.includes('peer')) return 'Training';
  if (lower.includes('outreach')) return 'Outreach';
  if (lower.includes('awareness') || lower.includes('harm reduction')) return 'Awareness';
  if (lower.includes('community') || lower.includes('event') || lower.includes('session')) return 'Community';
  return 'Default';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('en-GB', { day: 'numeric' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    year: d.toLocaleDateString('en-GB', { year: 'numeric' }),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
  };
}

function isSameMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

function spotsLabel(remaining: number, total: number) {
  if (remaining === 0) return { label: 'Fully Booked', colour: 'text-red-500 bg-red-50' };
  if (remaining <= Math.ceil(total * 0.2)) return { label: `${remaining} spots left`, colour: 'text-orange-600 bg-orange-50' };
  return { label: `${remaining} spots available`, colour: 'text-green-700 bg-green-50' };
}

export default function EventsPage() {
  usePageMeta({
    title: 'Community Events & Outreach Sessions | Naloxone Advocates Plymouth',
    description: 'Browse upcoming community events, naloxone training sessions, and outreach activities run by Naloxone Advocates Plymouth across Plymouth and Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/events`,
    ogTitle: 'Events Calendar — Naloxone Advocates Plymouth',
    ogDescription: 'Find upcoming naloxone training, outreach sessions, and community events near you in Plymouth and Devon.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/events#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/events`,
          "name": "Community Events & Outreach Sessions | Naloxone Advocates Plymouth",
          "description": "Browse upcoming community events, naloxone training sessions, and outreach activities run by Naloxone Advocates Plymouth across Plymouth and Devon.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Events", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/events` }
            ]
          }
        },
        {
          "@type": "EventSeries",
          "name": "Naloxone Advocates Plymouth — Community Events",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/events`,
          "description": "Ongoing series of free naloxone training sessions, outreach days, and community awareness events across Plymouth and Devon.",
          "organizer": {
            "@type": "NGO",
            "name": "Naloxone Advocates Plymouth CIC",
            "url": import.meta.env.VITE_SITE_URL || 'https://example.com'
          },
          "location": {
            "@type": "Place",
            "name": "Plymouth and Devon",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Plymouth",
              "addressRegion": "Devon",
              "addressCountry": "GB"
            }
          },
          "isAccessibleForFree": true
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-events';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-events')?.remove(); };
  }, []);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    const matchesSearch =
      search.trim() === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(search.toLowerCase());

    if (filter === 'upcoming') return matchesSearch && isUpcoming(e.date);
    if (filter === 'this-month') return matchesSearch && isSameMonth(e.date) && isUpcoming(e.date);
    return matchesSearch;
  });

  const upcomingCount = events.filter((e) => isUpcoming(e.date)).length;
  const thisMonthCount = events.filter((e) => isSameMonth(e.date) && isUpcoming(e.date)).length;

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900 pt-8 pb-20">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=vibrant%20community%20event%20outdoors%20in%20Plymouth%20UK%2C%20people%20gathered%20at%20information%20stalls%20with%20colourful%20banners%20and%20tents%2C%20sunny%20day%2C%20harm%20reduction%20awareness%20event%2C%20volunteers%20in%20branded%20t-shirts%2C%20lively%20community%20atmosphere%2C%20wide%20angle%20documentary%20photography%2C%20warm%20golden%20light%2C%20diverse%20crowd%20of%20people%20engaging%20with%20health%20information&width=1440&height=600&seq=eventshero1&orientation=landscape"
            alt="Community events"
            className="w-full h-full object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/50 to-gray-900/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
          <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 text-sm">
            <i className="ri-calendar-event-fill mr-2" />
            Community Calendar
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Events &amp; Outreach Sessions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Find upcoming training sessions, community outreach days, and awareness events across Plymouth and Devon.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: 'ri-calendar-check-fill', value: `${upcomingCount}`, label: 'Upcoming Events', colour: 'bg-yellow-400 text-gray-900' },
              { icon: 'ri-map-pin-fill', value: 'Plymouth', label: '& Devon', colour: 'bg-pink-500 text-white' },
              { icon: 'ri-price-tag-3-fill', value: 'Free', label: 'All Events', colour: 'bg-lime-400 text-gray-900' },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 ${s.colour} px-6 py-3 rounded-full font-bold shadow-lg`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${s.icon} text-lg`} />
                </div>
                <span className="text-lg">{s.value}</span>
                <span className="font-medium opacity-80 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Tab filters */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1">
            {([
              { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
              { key: 'this-month', label: `This Month (${thisMonthCount})` },
              { key: 'all', label: 'All Events' },
            ] as { key: FilterType; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  filter === f.key
                    ? 'bg-gray-900 text-yellow-400 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
              <i className="ri-search-line text-gray-400 text-base" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events or locations…"
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-full text-sm focus:border-yellow-400 focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <i className="ri-close-line text-base" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16 bg-gray-50 min-h-96">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium">Loading events…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-calendar-2-line text-gray-400 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-700">No events found</h3>
              <p className="text-gray-500 max-w-sm">
                {search ? 'Try a different search term.' : 'Check back soon — new events are added regularly.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-pink-500 font-semibold hover:underline cursor-pointer">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Showing <strong className="text-gray-800">{filtered.length}</strong> event{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => {
                  const { day, month, weekday } = formatShortDate(event.date);
                  const category = getCategoryFromName(event.name);
                  const colours = CATEGORY_COLOURS[category] || CATEGORY_COLOURS.Default;
                  const spots = spotsLabel(event.spots_remaining ?? event.total_spots, event.total_spots);
                  const past = !isUpcoming(event.date);

                  return (
                    <article
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`bg-white rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-yellow-400 overflow-hidden ${past ? 'opacity-60' : ''}`}
                    >
                      {/* Date banner */}
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={`https://readdy.ai/api/search-image?query=community%20event%20in%20Plymouth%20UK%2C%20people%20gathering%20outdoors%20for%20harm%20reduction%20awareness%2C%20colourful%20banners%2C%20warm%20sunny%20day%2C%20documentary%20photography%2C%20vibrant%20and%20welcoming%20atmosphere%2C%20diverse%20community%20members%2C%20health%20outreach%20stalls&width=600&height=300&seq=evcard${event.id.slice(0, 6)}&orientation=landscape`}
                          alt={event.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {past && (
                          <div className="absolute top-3 right-3 bg-gray-700/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Past Event
                          </div>
                        )}
                        {/* Date badge */}
                        <div className="absolute bottom-3 left-4 bg-white rounded-2xl px-4 py-2 shadow-lg text-center min-w-14">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{weekday}</div>
                          <div className="text-2xl font-black text-gray-900 leading-none">{day}</div>
                          <div className="text-xs font-bold text-pink-500 uppercase">{month}</div>
                        </div>
                        {/* Category badge */}
                        <div className={`absolute bottom-3 right-4 ${colours.bg} ${colours.text} text-xs font-bold px-3 py-1.5 rounded-full`}>
                          {category}
                        </div>
                      </div>

                      <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                          {event.name}
                        </h2>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                              <i className="ri-time-line text-pink-500" />
                            </div>
                            <span>{event.time || 'Time TBC'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-map-pin-line text-pink-500" />
                            </div>
                            <span className="line-clamp-1">{event.location || 'Location TBC'}</span>
                          </div>
                          {event.total_spots > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                <i className="ri-group-line text-pink-500" />
                              </div>
                              <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${spots.colour}`}>
                                {spots.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs font-bold text-lime-600 bg-lime-50 px-3 py-1 rounded-full">
                            <i className="ri-price-tag-3-line mr-1" />Free
                          </span>
                          <span className="text-sm font-semibold text-pink-500 group-hover:text-pink-600 flex items-center gap-1">
                            View details <i className="ri-arrow-right-line" />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Want to Host or Suggest an Event?
          </h2>
          <p className="text-lg text-gray-800 mb-8 max-w-xl mx-auto">
            We're always looking for community venues and partners to help us reach more people across Plymouth and Devon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gray-900 text-yellow-400 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap"
            >
              <i className="ri-mail-send-line mr-2" />Get in Touch
            </Link>
            <Link
              to="/booking"
              className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
            >
              <i className="ri-calendar-check-line mr-2" />Book Training
            </Link>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/training" className="hover:text-white transition-colors">Training</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={`https://readdy.ai/api/search-image?query=community%20event%20in%20Plymouth%20UK%2C%20people%20gathering%20outdoors%20for%20harm%20reduction%20awareness%2C%20colourful%20banners%2C%20warm%20sunny%20day%2C%20documentary%20photography%2C%20vibrant%20and%20welcoming%20atmosphere%2C%20diverse%20community%20members%2C%20health%20outreach%20stalls&width=600&height=300&seq=evmodal${selectedEvent.id.slice(0, 6)}&orientation=landscape`}
                alt={selectedEvent.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-white text-xl" />
              </button>
              <div className="absolute bottom-4 left-5">
                <span className={`${CATEGORY_COLOURS[getCategoryFromName(selectedEvent.name)]?.bg || 'bg-gray-200'} ${CATEGORY_COLOURS[getCategoryFromName(selectedEvent.name)]?.text || 'text-gray-700'} text-xs font-bold px-3 py-1.5 rounded-full`}>
                  {getCategoryFromName(selectedEvent.name)}
                </span>
              </div>
            </div>

            <div className="p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 leading-snug">{selectedEvent.name}</h2>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-calendar-fill text-gray-900 text-base" />
                  </div>
                  <span className="font-semibold">{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-fill text-white text-base" />
                  </div>
                  <span>{selectedEvent.time || 'Time to be confirmed'}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-fill text-gray-900 text-base" />
                  </div>
                  <span>{selectedEvent.location || 'Location to be confirmed'}</span>
                </div>
                {selectedEvent.total_spots > 0 && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-group-fill text-white text-base" />
                    </div>
                    <span>
                      <strong>{selectedEvent.spots_remaining ?? selectedEvent.total_spots}</strong> of{' '}
                      <strong>{selectedEvent.total_spots}</strong> spots remaining
                    </span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 rounded-2xl p-4">
                  {selectedEvent.description}
                </p>
              )}

              <div className="flex gap-3">
                <Link
                  to="/booking"
                  className="flex-1 bg-pink-500 text-white py-3 rounded-full font-bold text-center hover:bg-pink-600 transition-all whitespace-nowrap"
                  onClick={() => setSelectedEvent(null)}
                >
                  <i className="ri-calendar-check-line mr-2" />Book a Place
                </Link>
                <Link
                  to="/contact"
                  className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-full font-bold text-center hover:bg-gray-200 transition-all whitespace-nowrap"
                  onClick={() => setSelectedEvent(null)}
                >
                  <i className="ri-question-line mr-2" />Enquire
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
