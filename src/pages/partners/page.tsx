import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';

const leadFunders = [
  {
    name: 'NHS Devon Integrated Care Board',
    tag: 'Health Funder',
    tagColor: 'bg-blue-100 text-blue-700',
    icon: 'ri-hospital-fill',
    iconBg: 'bg-blue-500',
    website: 'https://www.devonics.nhs.uk',
    since: '2022',
    description:
      'NHS Devon ICB is our primary health funder, enabling us to deliver naloxone training and distribution programmes across the whole of Devon. Their investment has been instrumental in scaling our community reach and ensuring that life-saving naloxone kits are available to those who need them most.',
    impact: '400+ kits funded',
    impactIcon: 'ri-medicine-bottle-fill',
    quote:
      '"Naloxone Advocates Plymouth are a vital part of our harm reduction strategy across Devon. Their peer-led approach reaches communities that statutory services often cannot."',
    quoteAuthor: 'NHS Devon ICB Representative',
    image:
      'https://readdy.ai/api/search-image?query=modern%20NHS%20hospital%20building%20exterior%20in%20Devon%20England%2C%20clean%20professional%20architecture%2C%20blue%20sky%2C%20well%20maintained%20grounds%2C%20health%20service%20building%2C%20documentary%20photography%2C%20bright%20natural%20daylight%2C%20wide%20angle%20shot&width=800&height=500&seq=partner_nhs1&orientation=landscape',
  },
  {
    name: 'Plymouth City Council',
    tag: 'Local Authority',
    tagColor: 'bg-pink-100 text-pink-700',
    icon: 'ri-government-fill',
    iconBg: 'bg-pink-500',
    website: 'https://www.plymouth.gov.uk',
    since: '2021',
    description:
      'Plymouth City Council has been a cornerstone partner since our founding, providing funding for community outreach and engagement initiatives across Plymouth. Their support has allowed us to establish outreach points in community centres, libraries, and public spaces throughout the city.',
    impact: '12 outreach points',
    impactIcon: 'ri-map-pin-fill',
    quote:
      '"This partnership is saving lives in Plymouth. We are proud to support Naloxone Advocates Plymouth in their vital harm reduction work across our communities."',
    quoteAuthor: 'Plymouth City Council, Public Health Team',
    image:
      'https://readdy.ai/api/search-image?query=Plymouth%20City%20Council%20civic%20centre%20building%20exterior%2C%20grand%20civic%20architecture%2C%20Plymouth%20UK%2C%20official%20government%20building%2C%20bright%20daylight%2C%20wide%20angle%20documentary%20photography%2C%20clean%20and%20professional&width=800&height=500&seq=partner_pcc1&orientation=landscape',
  },
  {
    name: 'National Lottery Community Fund',
    tag: 'Grant Funder',
    tagColor: 'bg-lime-100 text-lime-700',
    icon: 'ri-funds-fill',
    iconBg: 'bg-lime-500',
    website: 'https://www.tnlcommunityfund.org.uk',
    since: '2023',
    description:
      'The National Lottery Community Fund awarded us a significant grant to develop and expand our Peer Trainer programme. This funding has enabled us to recruit, train, and support people with lived experience of drug use to become qualified peer trainers — multiplying our reach across Plymouth and Devon.',
    impact: '25 peer trainers trained',
    impactIcon: 'ri-user-star-fill',
    quote:
      '"This project demonstrates exactly the kind of community-led, people-powered change that the National Lottery Community Fund exists to support."',
    quoteAuthor: 'National Lottery Community Fund',
    image:
      'https://readdy.ai/api/search-image?query=community%20grant%20funding%20celebration%20event%2C%20diverse%20group%20of%20community%20workers%20and%20volunteers%20receiving%20award%2C%20bright%20indoor%20event%20space%2C%20warm%20celebratory%20atmosphere%2C%20documentary%20photography%2C%20UK%20charity%20sector&width=800&height=500&seq=partner_nlcf1&orientation=landscape',
  },
];

const communityPartners = [
  {
    name: 'Harbour Drug & Alcohol Service',
    icon: 'ri-heart-pulse-fill',
    iconBg: 'bg-yellow-400',
    iconColor: 'text-gray-900',
    category: 'Drug & Alcohol Service',
    description:
      'Harbour provides specialist drug and alcohol treatment services across Plymouth. We work closely with their team to ensure clients have access to naloxone training and kits as part of their recovery journey.',
    website: 'https://www.harbourcentre.org.uk',
    partnershipType: 'Referral & Training Partner',
  },
  {
    name: "St Luke's Hospice Plymouth",
    icon: 'ri-home-heart-fill',
    iconBg: 'bg-pink-500',
    iconColor: 'text-white',
    category: 'Palliative Care',
    description:
      "St Luke's Hospice supports our work by hosting training sessions at their facilities and helping us reach patients and families who may benefit from naloxone access and harm reduction education.",
    website: 'https://www.stlukes-hospice.org.uk',
    partnershipType: 'Venue & Outreach Partner',
  },
  {
    name: 'Shelter Devon',
    icon: 'ri-home-fill',
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    category: 'Housing & Homelessness',
    description:
      'Shelter Devon works with people facing homelessness and housing insecurity — a community disproportionately affected by drug-related harm. Our partnership ensures naloxone is available at their drop-in centres and outreach points.',
    website: 'https://www.shelter.org.uk',
    partnershipType: 'Outreach Distribution Partner',
  },
  {
    name: 'Devon & Cornwall Police',
    icon: 'ri-shield-fill',
    iconBg: 'bg-lime-500',
    iconColor: 'text-white',
    category: 'Law Enforcement',
    description:
      'Devon & Cornwall Police support our harm reduction approach and have worked with us to ensure officers are aware of naloxone and can signpost people to our services. A progressive partnership built on shared commitment to saving lives.',
    website: 'https://www.devon-cornwall.police.uk',
    partnershipType: 'Awareness & Signposting Partner',
  },
  {
    name: 'University Hospitals Plymouth',
    icon: 'ri-hospital-line',
    iconBg: 'bg-pink-400',
    iconColor: 'text-white',
    category: 'NHS Trust',
    description:
      'University Hospitals Plymouth NHS Trust collaborates with us to ensure patients discharged after overdose events are connected with our training and support services, reducing the risk of repeat incidents.',
    website: 'https://www.plymouthhospitals.nhs.uk',
    partnershipType: 'Clinical Pathway Partner',
  },
  {
    name: 'Plymouth Community Homes',
    icon: 'ri-building-fill',
    iconBg: 'bg-yellow-500',
    iconColor: 'text-white',
    category: 'Social Housing',
    description:
      'Plymouth Community Homes hosts naloxone kits and information at their housing offices and community spaces, ensuring residents in social housing have easy access to life-saving resources.',
    website: 'https://www.plymouthcommunityhomes.co.uk',
    partnershipType: 'Community Distribution Partner',
  },
  {
    name: 'Addaction Devon',
    icon: 'ri-user-heart-fill',
    iconBg: 'bg-blue-400',
    iconColor: 'text-white',
    category: 'Drug & Alcohol Recovery',
    description:
      'Addaction Devon (now We Are With You) provides drug and alcohol recovery services across Devon. Our partnership ensures their service users receive naloxone training and kits as a standard part of their care.',
    website: 'https://www.wearewithyou.org.uk',
    partnershipType: 'Referral & Training Partner',
  },
  {
    name: 'The Nelson Trust',
    icon: 'ri-hand-heart-fill',
    iconBg: 'bg-lime-400',
    iconColor: 'text-gray-900',
    category: 'Rehabilitation',
    description:
      'The Nelson Trust supports people affected by substance use, offending, and trauma. We partner with them to deliver naloxone training within their programmes, reaching people at critical points in their recovery.',
    website: 'https://www.nelsontrust.com',
    partnershipType: 'Programme Delivery Partner',
  },
];

const partnershipOptions = [
  {
    icon: 'ri-funds-fill',
    iconBg: 'bg-pink-500',
    title: 'Fund a Training Session',
    description: 'Sponsor a community naloxone training session in your area. From £150 per session, your funding directly pays for trainer time, naloxone kits, and venue costs.',
    cta: 'Discuss Funding',
  },
  {
    icon: 'ri-map-pin-fill',
    iconBg: 'bg-blue-500',
    title: 'Host an Outreach Point',
    description: 'Become a naloxone kit collection point in your community. We provide the kits, signage, and training for your staff — you provide the space.',
    cta: 'Become a Host',
  },
  {
    icon: 'ri-team-fill',
    iconBg: 'bg-lime-500',
    title: 'Refer Your Clients',
    description: 'If you work with people who use drugs or are at risk, refer them to our training sessions. We make it easy with flexible scheduling and stigma-free sessions.',
    cta: 'Set Up Referrals',
  },
  {
    icon: 'ri-megaphone-fill',
    iconBg: 'bg-yellow-500',
    title: 'Raise Awareness',
    description: 'Share our resources with your networks, promote our training sessions, or co-host awareness events. Every share helps us reach more people who need us.',
    cta: 'Get Resources',
  },
];

export default function PartnersPage() {
  usePageMeta({
    title: 'Our Partners & Funders | Naloxone Advocates Plymouth CIC',
    description: 'Meet the organisations and funders who make our life-saving naloxone training possible in Plymouth and Devon. NHS Devon ICB, Plymouth City Council, National Lottery Community Fund and more.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/partners`,
    ogTitle: 'Our Partners & Funders — Naloxone Advocates Plymouth',
    ogDescription: 'The organisations and funders behind our naloxone training and harm reduction work across Plymouth and Devon.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/partners#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/partners`,
          "name": "Our Partners & Funders | Naloxone Advocates Plymouth CIC",
          "description": "Meet the organisations and funders who make our life-saving naloxone training possible in Plymouth and Devon.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Partners", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/partners` }
            ]
          }
        },
        {
          "@type": "ItemList",
          "name": "Naloxone Advocates Plymouth — Partners & Funders",
          "description": "Lead funders and community partners supporting naloxone training and harm reduction in Plymouth and Devon.",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "NHS Devon Integrated Care Board", "url": "https://www.devonics.nhs.uk" },
            { "@type": "ListItem", "position": 2, "name": "Plymouth City Council", "url": "https://www.plymouth.gov.uk" },
            { "@type": "ListItem", "position": 3, "name": "National Lottery Community Fund", "url": "https://www.tnlcommunityfund.org.uk" }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-partners';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-partners')?.remove(); };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'funders' | 'partners'>('funders');

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
              <Link to="/training" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Training & P2P</Link>
              <Link to="/get-naloxone" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Get Naloxone</Link>
              <Link to="/volunteer" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Volunteer</Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Resources</Link>
              <Link to="/news" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">News</Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Contact</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/members/login" className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2">
                <i className="ri-user-fill"></i> Members
              </Link>
              <Link to="/get-naloxone" className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap">
                Get Naloxone Now
              </Link>
            </div>
            <button
              className="md:hidden text-gray-900 text-2xl cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <Link to="/" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Home</Link>
              <Link to="/about" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">About Us</Link>
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Training & P2P</Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Get Naloxone</Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Volunteer</Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Resources</Link>
              <Link to="/news" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">News</Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Contact</Link>
              <Link to="/members/login" className="block text-gray-900 font-bold hover:text-pink-500 transition-colors">Members Area</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900 py-24">
        <img
          src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20professional%20organisations%20and%20community%20workers%20collaborating%20around%20a%20table%2C%20partnership%20meeting%2C%20warm%20natural%20lighting%2C%20modern%20meeting%20room%2C%20documentary%20photography%2C%20inclusive%20and%20professional%20atmosphere%2C%20UK%20charity%20sector&width=1400&height=600&seq=partners_hero1&orientation=landscape"
          alt="Our partners and funders"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 text-sm">
            Our Partners & Funders
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Together We Save Lives
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Our life-saving work across Plymouth and Devon is only possible because of the incredible organisations and funders who believe in our mission. Meet the people behind the work.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">3</div>
              <div className="text-gray-300 text-sm font-semibold mt-1">Lead Funders</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 text-center">
              <div className="text-3xl font-bold text-lime-400">8</div>
              <div className="text-gray-300 text-sm font-semibold mt-1">Community Partners</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 text-center">
              <div className="text-3xl font-bold text-pink-400">150+</div>
              <div className="text-gray-300 text-sm font-semibold mt-1">Lives Saved Together</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 w-fit">
            <button
              onClick={() => setActiveTab('funders')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'funders'
                  ? 'bg-gray-900 text-yellow-400'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-funds-fill mr-2"></i>Lead Funders
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'partners'
                  ? 'bg-gray-900 text-yellow-400'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-handshake-fill mr-2"></i>Community Partners
            </button>
          </div>
        </div>
      </section>

      {/* Lead Funders */}
      {activeTab === 'funders' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-4">
                Lead Funders
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Organisations Funding Our Work</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These organisations provide the core funding that makes our naloxone training and distribution possible across Plymouth and Devon.
              </p>
            </div>

            <div className="space-y-16">
              {leadFunders.map((funder, idx) => (
                <div
                  key={funder.name}
                  className={`grid md:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Image side */}
                  <div className={`${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ height: '320px' }}>
                      <img
                        src={funder.image}
                        alt={funder.name}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-5 left-5">
                        <span className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full ${funder.tagColor}`}>
                          {funder.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className={`${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-14 h-14 ${funder.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <i className={`${funder.icon} text-white text-2xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{funder.name}</h3>
                        <p className="text-gray-500 text-sm">Partner since {funder.since}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-5">{funder.description}</p>

                    {/* Impact badge */}
                    <div className="inline-flex items-center gap-3 bg-lime-50 border border-lime-200 rounded-2xl px-5 py-3 mb-5">
                      <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${funder.impactIcon} text-gray-900 text-base`}></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Impact</div>
                        <div className="text-gray-900 font-bold text-sm">{funder.impact}</div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="border-l-4 border-yellow-400 pl-5 mb-6">
                      <p className="text-gray-700 italic text-sm leading-relaxed">{funder.quote}</p>
                      <footer className="text-gray-500 text-xs font-semibold mt-2">— {funder.quoteAuthor}</footer>
                    </blockquote>

                    <a
                      href={funder.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 bg-gray-900 text-yellow-400 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-external-link-line"></i> Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Partners */}
      {activeTab === 'partners' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-4">
                Community Partners
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Community Network</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These organisations work alongside us every day — referring clients, hosting outreach points, and helping us reach the people who need naloxone most.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {communityPartners.map((partner) => (
                <div
                  key={partner.name}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400 group"
                >
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-14 h-14 ${partner.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${partner.icon} ${partner.iconColor} text-2xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{partner.name}</h3>
                      </div>
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {partner.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{partner.description}</p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5">
                      <i className="ri-links-fill text-yellow-600 text-sm"></i>
                      <span className="text-yellow-800 text-xs font-semibold">{partner.partnershipType}</span>
                    </div>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-external-link-line"></i> Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partnership Opportunities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-4">
              Get Involved
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Become a Partner</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're an NHS service, local authority, charity, business, or community group — there are many ways to partner with us and help save lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {partnershipOptions.map((option) => (
              <div
                key={option.title}
                className="bg-gray-50 rounded-3xl p-7 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400 group"
              >
                <div className={`w-14 h-14 ${option.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                  <i className={`${option.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{option.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{option.description}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-pink-500 font-bold text-sm hover:text-pink-600 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {option.cta} <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-10 shadow-xl text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Partner With Us?</h3>
            <p className="text-gray-800 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Get in touch with our partnerships team to discuss how your organisation can support our life-saving work across Plymouth and Devon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
              >
                Contact Our Team <i className="ri-arrow-right-line ml-2"></i>
              </Link>
              <a
                href="mailto:napplymouth66@gmail.com"
                className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap"
              >
                <i className="ri-mail-fill mr-2"></i> Email Us Directly
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
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
              </div>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training & P2P</Link></li>
                <li><Link to="/partners" className="text-gray-400 hover:text-white transition-colors">Our Partners</Link></li>
                <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">News</Link></li>
                <li><a href="https://www.justgiving.com/naloxoneadvocatesplymouth" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Donate</a></li>
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
              <h3 className="text-lime-400 font-bold text-lg mb-4">Partner With Us</h3>
              <p className="text-gray-400 text-sm mb-4">Interested in supporting our work? We'd love to hear from you.</p>
              <Link to="/contact" className="inline-block bg-pink-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-600 transition-all whitespace-nowrap">
                Get in Touch
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
              <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
