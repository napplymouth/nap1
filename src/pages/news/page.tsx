import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';
import { newsItems, categoryColors, categoryIcons } from '../../mocks/newsArticles';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: 'Milestone' | 'Partnership' | 'Programme' | 'Events' | 'Story';
  image: string;
  featured?: boolean;
  readTime?: string;
}

interface CommunityStory {
  id: string;
  name: string;
  role: string;
  quote: string;
  detail: string;
  avatar: string;
  tag: string;
}

interface Milestone {
  id: string;
  number: string;
  label: string;
  date: string;
  icon: string;
}

const communityStories: CommunityStory[] = [
  {
    id: '1',
    name: 'Marcus T.',
    role: 'Peer Trainer, Devonport',
    quote: 'I used to feel like I had nothing to offer. Now I train others every week. This programme gave me back my confidence and my community.',
    detail: 'Marcus completed his peer trainer certification in September 2024 and has since trained over 40 people in his neighbourhood.',
    avatar: 'https://readdy.ai/api/search-image?query=confident%20Black%20British%20man%20in%20his%2030s%2C%20warm%20smile%2C%20community%20setting%2C%20natural%20light%20portrait%2C%20documentary%20photography%20style%2C%20Plymouth%20UK&width=200&height=200&seq=avatar1&orientation=squarish',
    tag: 'Peer Trainer'
  },
  {
    id: '2',
    name: 'Sarah K.',
    role: 'Community Member, Stonehouse',
    quote: 'Three weeks after my training, I used my kit on my neighbour. The paramedics said I saved his life. I still can\'t believe it.',
    detail: 'Sarah attended a drop-in session at Stonehouse Community Hub in October 2024. She now volunteers at monthly awareness events.',
    avatar: 'https://readdy.ai/api/search-image?query=friendly%20white%20British%20woman%20in%20her%2040s%2C%20warm%20smile%2C%20outdoor%20community%20setting%2C%20natural%20light%20portrait%2C%20documentary%20photography%2C%20Plymouth%20UK&width=200&height=200&seq=avatar2&orientation=squarish',
    tag: 'Life-Saver'
  },
  {
    id: '3',
    name: 'Dev P.',
    role: 'Outreach Volunteer, City Centre',
    quote: 'People are surprised when I hand them a kit and say there\'s no cost. That moment of disbelief — then relief — never gets old.',
    detail: 'Dev joined as an outreach volunteer in July 2024 and has distributed over 200 naloxone kits across Plymouth city centre.',
    avatar: 'https://readdy.ai/api/search-image?query=South%20Asian%20British%20man%20in%20his%2020s%2C%20friendly%20smile%2C%20outdoor%20urban%20setting%2C%20natural%20light%20portrait%2C%20documentary%20photography%2C%20Plymouth%20UK%20community&width=200&height=200&seq=avatar3&orientation=squarish',
    tag: 'Outreach Volunteer'
  },
  {
    id: '4',
    name: 'Lynne M.',
    role: 'Family Member, Plympton',
    quote: 'My son uses drugs. I used to live in fear. Now I carry naloxone and I know what to do. That knowledge is everything.',
    detail: 'Lynne attended a family-focused training session in August 2024. She now advocates for naloxone access in her local community.',
    avatar: 'https://readdy.ai/api/search-image?query=white%20British%20woman%20in%20her%2050s%2C%20compassionate%20expression%2C%20indoor%20community%20setting%2C%20natural%20light%20portrait%2C%20documentary%20photography%2C%20Plymouth%20UK&width=200&height=200&seq=avatar4&orientation=squarish',
    tag: 'Family Advocate'
  },
];

const trainingSpotlights = [
  {
    id: '1',
    title: 'Devonport Community Hub — February Session',
    date: '22 Feb 2025',
    attendees: 18,
    trainer: 'Marcus T. & Jade R.',
    highlight: '3 participants signed up as future peer trainers on the day',
    image: 'https://readdy.ai/api/search-image?query=naloxone%20training%20session%20in%20Devonport%20community%20hall%20Plymouth%2C%20diverse%20group%20of%20adults%20engaged%20in%20learning%2C%20trainer%20demonstrating%20nasal%20spray%20technique%2C%20warm%20indoor%20lighting%2C%20documentary%20photography%2C%20inclusive%20atmosphere&width=800&height=450&seq=spotlight1&orientation=landscape',
  },
  {
    id: '2',
    title: 'Stonehouse Drop-In — January Session',
    date: '18 Jan 2025',
    attendees: 24,
    trainer: 'Sarah K. & Tom B.',
    highlight: 'Highest single-session attendance in 2025 so far',
    image: 'https://readdy.ai/api/search-image?query=busy%20community%20drop-in%20naloxone%20training%20session%20in%20Stonehouse%20Plymouth%2C%20many%20participants%20seated%20in%20rows%2C%20engaged%20and%20attentive%2C%20educational%20setting%2C%20documentary%20photography%2C%20warm%20and%20welcoming%20atmosphere&width=800&height=450&seq=spotlight2&orientation=landscape',
  },
];

const milestones: Milestone[] = [
  { id: '1', number: '150+', label: 'Lives Saved', date: 'Jan 2025', icon: 'ri-heart-pulse-fill' },
  { id: '2', number: '500+', label: 'People Trained', date: 'Dec 2024', icon: 'ri-team-fill' },
  { id: '3', number: '1,200+', label: 'Kits Distributed', date: 'Dec 2024', icon: 'ri-medicine-bottle-fill' },
  { id: '4', number: '2022', label: 'CIC Founded', date: 'Mar 2022', icon: 'ri-flag-fill' },
  { id: '5', number: '25+', label: 'Partner Organisations', date: 'Nov 2024', icon: 'ri-building-fill' },
  { id: '6', number: '40+', label: 'Peer Trainers', date: 'Oct 2024', icon: 'ri-user-voice-fill' },
];

const categories = ['All', 'Milestone', 'Partnership', 'Programme', 'Events', 'Story'] as const;

const authorAvatars: Record<string, string> = {
  'Emma Richardson': 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20confident%20British%20woman%20in%20her%20late%2030s%20with%20warm%20smile%2C%20short%20brown%20hair%2C%20wearing%20a%20teal%20blouse%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-emma&orientation=squarish',
  'Marcus Thompson': 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20friendly%20Black%20British%20man%20in%20his%20early%2040s%20with%20a%20warm%20genuine%20smile%2C%20short%20hair%2C%20wearing%20a%20dark%20navy%20shirt%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-marcus&orientation=squarish',
  'Priya Nair': 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20South%20Asian%20British%20woman%20in%20her%20early%2030s%20with%20long%20dark%20hair%2C%20bright%20confident%20smile%2C%20wearing%20a%20coral%20top%2C%20clean%20white%20background%2C%20soft%20studio%20lighting%2C%20high%20quality%20portrait%20photography%2C%20sharp%20focus&width=200&height=200&seq=author-priya&orientation=squarish',
};

export default function NewsPage() {
  usePageMeta({
    title: 'News & Updates | Naloxone Advocates Plymouth CIC',
    description: 'Latest news, events, community stories and milestones from Naloxone Advocates Plymouth. Stay informed about our harm reduction work, training sessions, and community impact across Plymouth and Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/news`,
    ogTitle: 'News & Updates — Naloxone Advocates Plymouth',
    ogDescription: 'Latest updates from our harm reduction work in Plymouth and Devon. Training milestones, community stories, events, and life-saving impact.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/news#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/news`,
          "name": "News & Updates | Naloxone Advocates Plymouth CIC",
          "description": "Latest news, events, community stories and milestones from Naloxone Advocates Plymouth CIC.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "News", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/news` }
            ]
          }
        },
        {
          "@type": "Blog",
          "name": "Naloxone Advocates Plymouth — News & Updates",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/news`,
          "description": "Community stories, training milestones, events and harm reduction news from Plymouth and Devon.",
          "publisher": {
            "@type": "NGO",
            "name": "Naloxone Advocates Plymouth CIC",
            "url": import.meta.env.VITE_SITE_URL || 'https://example.com'
          }
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-news';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-news')?.remove(); };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('All');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [activeSpotlight, setActiveSpotlight] = useState(0);

  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  const uniqueAuthors = ['All', ...Array.from(new Set(newsItems.map(item => item.author)))];

  const filteredNews = regularNews.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const authorMatch = selectedAuthor === 'All' || item.author === selectedAuthor;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = !q || item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
    return categoryMatch && authorMatch && searchMatch;
  });

  const hasActiveFilters = selectedCategory !== 'All' || selectedAuthor !== 'All' || searchQuery.trim() !== '';

  const clearAll = () => {
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setSearchQuery('');
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
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Home</Link>
              <Link to="/about" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">About Us</Link>
              <Link to="/training" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Training & P2P</Link>
              <Link to="/get-naloxone" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Get Naloxone</Link>
              <Link to="/emergency" className="text-red-600 font-bold hover:text-red-700 transition-colors whitespace-nowrap flex items-center gap-1">
                <i className="ri-alarm-warning-fill"></i> Emergency
              </Link>
              <Link to="/volunteer" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Volunteer</Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Resources</Link>
              <Link to="/news" className="text-pink-500 font-bold whitespace-nowrap">News</Link>
              <Link to="/partners" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Partners</Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Contact</Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900 text-2xl cursor-pointer">
                <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <Link to="/" className="block text-gray-900 font-semibold hover:text-pink-500">Home</Link>
              <Link to="/about" className="block text-gray-900 font-semibold hover:text-pink-500">About Us</Link>
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500">Training & P2P</Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500">Get Naloxone</Link>
              <Link to="/emergency" className="block text-red-600 font-bold">In an Emergency</Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500">Volunteer</Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500">Resources</Link>
              <Link to="/news" className="block text-pink-500 font-bold">News</Link>
              <Link to="/partners" className="block text-gray-900 font-semibold hover:text-pink-500">Partners</Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500">Contact</Link>
              <Link to="/members/login" className="block text-gray-900 font-bold hover:text-pink-500">Members Area</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-yellow-400 via-lime-300 to-lime-400 py-20 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/15 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pink-400/20 rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block bg-white/80 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 shadow-sm">
              <i className="ri-newspaper-fill mr-2"></i>Latest Updates
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              News & Community Stories
            </h1>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Training milestones, community events, and the real stories of people whose lives have been changed by naloxone across Plymouth and Devon.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-500 text-lg"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by keyword…"
                  className="w-full pl-11 pr-10 py-3.5 rounded-full bg-white/90 text-gray-900 placeholder-gray-400 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <i className="ri-close-circle-fill text-lg"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {(['Milestone', 'Events', 'Story', 'Programme'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center gap-2 bg-white/70 hover:bg-white text-gray-900 px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <i className={`${categoryIcons[cat]} text-pink-500`}></i> {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestone Strip */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center">
              <i className="ri-trophy-fill text-white text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Key Milestones</h2>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 shadow-lg min-w-[170px] text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className={`${milestone.icon} text-gray-900 text-xl`}></i>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{milestone.number}</div>
                  <div className="text-sm font-semibold text-yellow-400 mb-1">{milestone.label}</div>
                  <div className="text-xs text-gray-400">{milestone.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredNews && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-sm">
                <i className="ri-star-fill mr-2"></i>Featured Story
              </span>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-80 md:h-auto overflow-hidden">
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`${categoryColors[featuredNews.category]} px-4 py-1 rounded-full text-sm font-bold`}>
                      {featuredNews.category}
                    </span>
                    <span className="text-gray-400 text-sm"><i className="ri-calendar-line mr-1"></i>{featuredNews.date}</span>
                    {featuredNews.readTime && (
                      <span className="text-gray-400 text-sm"><i className="ri-time-line mr-1"></i>{featuredNews.readTime}</span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredNews.title}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {featuredNews.excerpt}
                  </p>
                  <Link to={`/news/${featuredNews.id}`} className="inline-flex items-center text-pink-500 font-bold text-base hover:text-pink-600 transition-colors cursor-pointer">
                    Read Full Story <i className="ri-arrow-right-line ml-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Training Spotlight */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-3">
                <i className="ri-flashlight-fill"></i> Training Spotlight
              </div>
              <h2 className="text-3xl font-bold text-white">Recent Training Events</h2>
              <p className="text-gray-400 mt-1">A closer look at our latest sessions across Plymouth and Devon</p>
            </div>
            <div className="hidden md:flex gap-2">
              {trainingSpotlights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSpotlight(i)}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${activeSpotlight === i ? 'bg-yellow-400 w-8' : 'bg-gray-600 hover:bg-gray-400'}`}
                ></button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {trainingSpotlights.map((spotlight, i) => (
              <div
                key={spotlight.id}
                className={`bg-gray-800 rounded-3xl overflow-hidden shadow-xl transition-all cursor-pointer ${activeSpotlight === i ? 'ring-2 ring-yellow-400' : 'opacity-70 hover:opacity-90'}`}
                onClick={() => setActiveSpotlight(i)}
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={spotlight.image}
                    alt={spotlight.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                      <i className="ri-calendar-event-fill mr-1"></i>{spotlight.date}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{spotlight.title}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{spotlight.attendees}</div>
                      <div className="text-xs text-gray-400 mt-1">Attendees</div>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-3 text-center">
                      <div className="text-sm font-bold text-lime-400 leading-tight">{spotlight.trainer}</div>
                      <div className="text-xs text-gray-400 mt-1">Trainers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-star-fill text-yellow-400 text-base"></i>
                    </div>
                    <p className="text-yellow-300 text-sm font-medium">{spotlight.highlight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/training" className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition-all whitespace-nowrap">
              <i className="ri-calendar-check-fill"></i> Book a Training Session
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-400 text-white px-5 py-2 rounded-full font-bold text-sm mb-4">
              <i className="ri-heart-fill"></i> Community Stories
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Real People. Real Impact.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Behind every naloxone kit is a person with a story. Here are some of the voices from our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {communityStories.map((story) => (
              <div
                key={story.id}
                className={`rounded-3xl border-2 transition-all cursor-pointer overflow-hidden ${activeStory === story.id ? 'border-orange-400 shadow-xl' : 'border-gray-100 shadow-md hover:shadow-lg hover:border-orange-200'}`}
                onClick={() => setActiveStory(activeStory === story.id ? null : story.id)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-orange-200">
                      <img src={story.avatar} alt={story.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900">{story.name}</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">{story.tag}</span>
                      </div>
                      <p className="text-gray-500 text-sm">{story.role}</p>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <i className={`${activeStory === story.id ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-400 text-xl`}></i>
                    </div>
                  </div>

                  <blockquote className="mt-4 pl-4 border-l-4 border-orange-400">
                    <p className="text-gray-700 italic leading-relaxed">"{story.quote}"</p>
                  </blockquote>

                  {activeStory === story.id && (
                    <div className="mt-4 bg-orange-50 rounded-2xl p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{story.detail}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Share Your Story</h3>
            <p className="text-white/90 mb-5 max-w-xl mx-auto">
              Have you used naloxone, attended training, or been impacted by our work? We'd love to hear from you.
            </p>
            <Link to="/contact" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all whitespace-nowrap">
              Get in Touch <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <i className={categoryIcons[category]}></i>
                {category}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <i className="ri-user-line"></i> Filter by Author
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Author Pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {uniqueAuthors.map((author) => (
              <button
                key={author}
                onClick={() => setSelectedAuthor(author)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer border-2 ${
                  selectedAuthor === author
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 shadow-sm'
                }`}
              >
                {author === 'All' ? (
                  <>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-team-fill text-base"></i>
                    </div>
                    All Authors
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      <img
                        src={authorAvatars[author]}
                        alt={author}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    {author}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              <span className="text-sm text-gray-500">
                Showing <strong className="text-gray-900">{filteredNews.length}</strong> article{filteredNews.length !== 1 ? 's' : ''}
                {searchQuery.trim() && <> matching <strong className="text-gray-900">"{searchQuery.trim()}"</strong></>}
                {selectedAuthor !== 'All' && <> by <strong className="text-gray-900">{selectedAuthor}</strong></>}
                {selectedCategory !== 'All' && <> in <strong className="text-pink-500">{selectedCategory}</strong></>}
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-700 underline cursor-pointer whitespace-nowrap transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-search-line text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery.trim() ? `No results for "${searchQuery.trim()}"` : 'No news in this category yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery.trim() ? 'Try a different keyword or clear your search' : 'Check back soon for updates'}
              </p>
              <button
                onClick={clearAll}
                className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer"
              >
                View All News
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((news) => (
                <div key={news.id} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    {news.category === 'Story' && (
                      <div className="absolute top-3 left-3 bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <i className="ri-heart-fill"></i> Community Story
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`${categoryColors[news.category]} px-3 py-1 rounded-full text-xs font-bold`}>
                        {news.category}
                      </span>
                      <span className="text-gray-400 text-xs"><i className="ri-calendar-line mr-1"></i>{news.date}</span>
                      {news.readTime && (
                        <span className="text-gray-400 text-xs"><i className="ri-time-line mr-1"></i>{news.readTime}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                      {news.excerpt}
                    </p>
                    <Link to={`/news/${news.id}`} className="inline-flex items-center text-pink-500 font-semibold text-sm hover:text-pink-600 transition-colors cursor-pointer">
                      Read More <i className="ri-arrow-right-s-line ml-1"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 via-lime-300 to-lime-400 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/15 rounded-full"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 shadow-sm">
            <i className="ri-mail-send-fill text-pink-500 text-lg"></i>
            Stay Updated
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Never Miss an Update
          </h2>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed mb-8">
            Subscribe to our newsletter and be the first to hear about new training sessions, community stories, and milestones.
          </p>
          <Link
            to="/#newsletter-signup-form"
            className="inline-block bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
          >
            <i className="ri-mail-add-fill mr-2"></i>Subscribe Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-capsule-fill text-gray-900 text-lg"></i>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-white text-sm tracking-tight">NALOXONE</span>
                  <span className="font-bold text-pink-400 text-xs tracking-widest uppercase">Advocates Plymouth</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                A grassroots, peer-led harm reduction organisation dedicated to saving lives through naloxone training and community support.
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/napplymouth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-facebook-fill text-gray-900 text-2xl"></i>
                </a>
                <a href="https://www.instagram.com/napplymouth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <i className="ri-instagram-fill text-white text-2xl"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training & P2P</Link></li>
                <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">News</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Get Help</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="font-semibold text-white">Emergency: 999</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
                <Link to="/get-naloxone" className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all mt-4 whitespace-nowrap">
                  Crisis Resources
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lime-400 font-bold text-lg mb-4">Stay Connected</h3>
              <p className="text-gray-400 text-sm mb-4">Get updates on training sessions and harm reduction news</p>
              <Link
                to="/#newsletter-signup-form"
                className="inline-block bg-pink-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-600 transition-all whitespace-nowrap"
              >
                <i className="ri-mail-add-fill mr-2"></i>Subscribe
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="bg-yellow-400 rounded-2xl py-6 mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                NALOXONE SAVES LIVES
              </h2>
            </div>
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
