import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';
import SiteNav from '../../components/feature/SiteNav';

export default function AboutPage() {
  usePageMeta({
    title: 'About Naloxone Advocates Plymouth CIC | Peer-Led Harm Reduction',
    description: 'Learn about Naloxone Advocates Plymouth CIC — a grassroots, peer-led harm reduction organisation saving lives through naloxone training and community support across Plymouth and Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/about`,
    ogTitle: 'About Naloxone Advocates Plymouth CIC',
    ogDescription: 'Founded by people with lived experience, we provide naloxone training and kits across Plymouth and Devon. Stigma-free, peer-led harm reduction.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/about#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/about`,
          "name": "About Naloxone Advocates Plymouth CIC | Peer-Led Harm Reduction",
          "description": "Learn about Naloxone Advocates Plymouth CIC — a grassroots, peer-led harm reduction organisation saving lives through naloxone training and community support in Plymouth and Devon.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "About Us", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/about` }
            ]
          }
        },
        {
          "@type": "NGO",
          "name": "Naloxone Advocates Plymouth CIC",
          "url": import.meta.env.VITE_SITE_URL || 'https://example.com',
          "logo": "https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg",
          "foundingDate": "2024",
          "description": "Grassroots, peer-led harm reduction organisation providing free naloxone training and kits across Plymouth and Devon.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Hyde Park House, Mutley Plain",
            "addressLocality": "Plymouth",
            "addressRegion": "Devon",
            "postalCode": "PL4 6LF",
            "addressCountry": "GB"
          },
          "telephone": "+447561349137",
          "email": "napplymouth66@gmail.com"
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-about';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-about')?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-400 to-lime-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About Naloxone Advocates Plymouth CIC
            </h1>
            <p className="text-2xl text-white font-semibold max-w-3xl mx-auto">
              A grassroots, peer-led organisation saving lives through harm reduction and community action
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">Our Story</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Born from Lived Experience</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Naloxone Advocates Plymouth CIC was founded in <strong>2024</strong> by people with <strong>lived experience of drug use and addiction</strong>. We understand the challenges, the stigma, and the barriers that prevent people from accessing life-saving support.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our organisation emerged from a simple truth: <strong>people who use drugs deserve dignity, respect, and the chance to stay alive</strong>. We believe that harm reduction is healthcare, and that every life has value.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Since our founding, we've been dedicated to training people, distributing naloxone kits, and building a compassionate community across Plymouth and Devon that saves lives every day.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20community%20health%20advocates%20and%20peer%20support%20workers%20standing%20together%20outdoors%20in%20Plymouth%20Devon%20UK%2C%20warm%20supportive%20atmosphere%2C%20natural%20daylight%2C%20people%20of%20different%20ages%20and%20backgrounds%20united%20for%20harm%20reduction%20cause%2C%20documentary%20style%20photography%2C%20authentic%20and%20hopeful%20mood&width=800&height=600&seq=2&orientation=landscape" 
                  alt="Naloxone Advocates team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-20 bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission &amp; Values</h2>
            <p className="text-xl text-yellow-400 font-semibold max-w-3xl mx-auto">
              Everything we do is guided by compassion, dignity, and the belief that harm reduction saves lives
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-heart-fill text-white text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Compassion First</h3>
              <p className="text-gray-700 text-center leading-relaxed">We approach every person with empathy, understanding, and zero judgement. Everyone deserves support and respect.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-fill text-gray-900 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Peer-Led Approach</h3>
              <p className="text-gray-700 text-center leading-relaxed">Our team includes people with lived experience who understand the realities of drug use and can connect authentically.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-shield-check-fill text-gray-900 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Evidence-Based</h3>
              <p className="text-gray-700 text-center leading-relaxed">We use proven harm reduction strategies backed by research and best practices from around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">What We Do</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Services &amp; Programs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: 'ri-graduation-cap-fill', color: 'bg-blue-500', title: 'Naloxone Training', text: "Training sessions teaching people how to recognise an overdose and administer naloxone safely. We've trained over 500 people across Plymouth and Devon." },
              { icon: 'ri-hand-heart-fill', color: 'bg-pink-500', title: 'Peer-to-Peer Project', text: 'Our P2P program connects people with lived experience to provide support, training, and outreach in a stigma-free environment.' },
              { icon: 'ri-medicine-bottle-fill', color: 'bg-yellow-400', title: 'Naloxone Distribution', text: 'We distribute naloxone kits to trained individuals, ensuring life-saving medication is available where it\'s needed most.' },
              { icon: 'ri-map-pin-user-fill', color: 'bg-lime-400', title: 'Community Outreach', text: 'Our outreach team connects with people on the streets, at events, and in community spaces to provide information and support.' },
              { icon: 'ri-book-open-fill', color: 'bg-pink-500', title: 'Education & Awareness', text: 'We work to reduce stigma and increase understanding of harm reduction through workshops, campaigns, and community events.' },
              { icon: 'ri-user-heart-fill', color: 'bg-blue-500', title: 'Peer Support Network', text: 'We facilitate connections between people with lived experience, creating a supportive community where everyone belongs.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <i className={`${item.icon} text-white text-3xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-20 bg-gradient-to-br from-pink-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Impact in Numbers</h2>
            <p className="text-xl text-yellow-400 font-semibold">Real lives saved, real communities strengthened</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'People Trained', color: 'text-blue-500' },
              { value: '1,200+', label: 'Kits Distributed', color: 'text-pink-500' },
              { value: '150+', label: 'Lives Saved', color: 'text-yellow-500' },
              { value: '50+', label: 'Volunteers', color: 'text-lime-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 text-center shadow-xl">
                <div className={`text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-lg text-gray-700 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">Our Team</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet the People Behind the Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our team includes peer trainers, outreach workers, and volunteers—all united by a commitment to saving lives</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { initials: '', name: 'Sarah Johnson', role: 'Founder & Lead Trainer', roleColor: 'text-pink-500', bio: "Sarah founded Naloxone Advocates after losing a close friend to overdose. Her lived experience drives the organisation's compassionate approach.", gradient: 'from-blue-500 to-pink-500' },
              { initials: '', name: 'Marcus Thompson', role: 'Outreach Coordinator', roleColor: 'text-blue-500', bio: 'Marcus leads our street outreach program, connecting with people who use drugs and ensuring they have access to naloxone and support.', gradient: 'from-yellow-400 to-lime-400' },
              { initials: '', name: 'Emma Davies', role: 'P2P Project Manager', roleColor: 'text-lime-500', bio: 'Emma manages our Peer-to-Peer project, training and supporting peer trainers who share their lived experience with the community.', gradient: 'from-pink-500 to-blue-500' },
            ].map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all">
                <div className={`w-32 h-32 bg-gradient-to-br ${member.gradient} rounded-full mx-auto mb-6 flex items-center justify-center`}>
                  <i className="ri-user-fill text-white text-5xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className={`${member.roleColor} font-semibold mb-4`}>{member.role}</div>
                <p className="text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials from Partners & Participants */}
      <section className="py-20 bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-yellow-400 font-semibold max-w-2xl mx-auto">
              Feedback from training participants, community partners, and the people we serve
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Large featured testimonial */}
            <div className="md:row-span-2 bg-white rounded-3xl p-10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-6">
                  <i className="ri-star-fill text-yellow-400 text-xl"></i>
                  <i className="ri-star-fill text-yellow-400 text-xl"></i>
                  <i className="ri-star-fill text-yellow-400 text-xl"></i>
                  <i className="ri-star-fill text-yellow-400 text-xl"></i>
                  <i className="ri-star-fill text-yellow-400 text-xl"></i>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  "Partnering with Naloxone Advocates Plymouth has been transformative for our service. Their organisational training equipped our entire team — from reception staff to senior managers — with the skills and confidence to respond to an overdose. The peer-led approach is what sets them apart. Their trainers speak from real experience, and that authenticity resonates with everyone in the room. We&apos;ve since made naloxone training a standard part of our staff induction."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-lg">JW</span>
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900 text-lg">James W.</div>
                  <div className="text-sm text-pink-500 font-semibold">Hostel Manager, Plymouth</div>
                </div>
              </div>
            </div>

            {/* Smaller testimonials */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex gap-1 mb-4">
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "I attended the P2P session expecting to learn about naloxone. What I didn&apos;t expect was to find a community that truly understands. The trainers made me feel safe, heard, and valued. For the first time, my past felt like a strength."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">MR</span>
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Michelle R.</div>
                  <div className="text-sm text-gray-500">P2P Participant</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex gap-1 mb-4">
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
                <i className="ri-star-fill text-yellow-400 text-lg"></i>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "As a pharmacist, I see the impact of opioid misuse daily. Naloxone Advocates are doing vital, life-saving work on the ground. Their training is clinically sound, compassionate, and reaches people that traditional services often miss."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold">NL</span>
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Neil L.</div>
                  <div className="text-sm text-gray-500">Community Pharmacist, Plymouth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Join Our Mission</h2>
          <p className="text-xl text-white font-semibold mb-10">Whether you want training, to volunteer, or to support our work—we'd love to hear from you</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/training" className="bg-pink-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-pink-600 transition-all shadow-xl whitespace-nowrap">Get Training <i className="ri-arrow-right-line ml-2"></i></Link>
            <Link to="/volunteer" className="bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-xl whitespace-nowrap">Volunteer <i className="ri-arrow-right-line ml-2"></i></Link>
            <Link to="/contact" className="bg-gray-900 text-yellow-400 px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-800 transition-all shadow-xl whitespace-nowrap">Contact Us <i className="ri-arrow-right-line ml-2"></i></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
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
              <p className="text-gray-400 text-sm leading-relaxed">A grassroots, peer-led harm reduction organisation dedicated to saving lives through naloxone training and community support.</p>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training &amp; P2P</Link></li>
                <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Get Help</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="font-semibold text-white">Emergency: 999</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
                <p className="mt-4">
                  <strong className="text-white">Address:</strong><br />
                  Hyde Park House<br />
                  Mutley Plain<br />
                  Plymouth, PL4 6LF
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved.</p>
            <p className="mt-2"><a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Powered by Readdy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
