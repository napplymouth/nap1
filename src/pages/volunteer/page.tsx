
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function VolunteerPage() {
  usePageMeta({
    title: 'Volunteer with Naloxone Advocates Plymouth | Join Our Team',
    description: 'Volunteer with Naloxone Advocates Plymouth CIC. Peer trainers, outreach volunteers, events coordinators and more. Make a real difference in harm reduction across Plymouth and Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/volunteer`,
    ogTitle: 'Volunteer with Naloxone Advocates Plymouth',
    ogDescription: 'Join our peer-led harm reduction team. Roles include Peer Trainer, Outreach Volunteer, Peer Support Worker and more. Full training provided.',
  });

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roles: [] as string[],
    experience: '',
    availability: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/volunteer#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/volunteer`,
          "name": "Volunteer with Naloxone Advocates Plymouth | Join Our Team",
          "description": "Volunteer with Naloxone Advocates Plymouth CIC. Peer trainers, outreach volunteers, events coordinators and more. Make a real difference in harm reduction across Plymouth and Devon.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Volunteer", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/volunteer` }
            ]
          }
        },
        {
          "@type": "VolunteerAction",
          "name": "Volunteer with Naloxone Advocates Plymouth",
          "description": "Join our peer-led harm reduction team as a volunteer. Roles include Peer Trainer, Outreach Volunteer, Peer Support Worker, Events Coordinator, Content Creator, and Admin Support.",
          "agent": {
            "@type": "NGO",
            "name": "Naloxone Advocates Plymouth CIC",
            "url": import.meta.env.VITE_SITE_URL || 'https://example.com'
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Do I need previous experience to volunteer?",
              "acceptedAnswer": { "@type": "Answer", "text": "No! We provide full training for all roles. Whether you have lived experience or are completely new to harm reduction, you're welcome here." }
            },
            {
              "@type": "Question",
              "name": "How much time do I need to commit as a volunteer?",
              "acceptedAnswer": { "@type": "Answer", "text": "It varies by role, but most positions require 2-8 hours per month. We're flexible and work around your schedule." }
            },
            {
              "@type": "Question",
              "name": "Will I be working alone as a volunteer?",
              "acceptedAnswer": { "@type": "Answer", "text": "Never! You'll always have support from experienced team members. We work in pairs for outreach and provide ongoing supervision for all volunteers." }
            },
            {
              "@type": "Question",
              "name": "Can I volunteer if I'm in recovery?",
              "acceptedAnswer": { "@type": "Answer", "text": "We welcome volunteers in recovery! We'll discuss your situation individually to ensure volunteering supports your wellbeing and recovery journey." }
            }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-volunteer';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-volunteer')?.remove(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.motivation.length > 500) return;
    setSubmitting(true);

    const params = new URLSearchParams();
    params.append('name', formData.name);
    params.append('email', formData.email);
    params.append('phone', formData.phone);
    params.append('roles', formData.roles.join(', '));
    params.append('experience', formData.experience);
    params.append('availability', formData.availability);
    params.append('motivation', formData.motivation);

    try {
      await fetch('https://readdy.ai/api/form/d6g1e2iau1b90a4048rg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      navigate('/thank-you?type=volunteer');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitting(false);
    }
  };

  const toggleRole = (value: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(value)
        ? prev.roles.filter(r => r !== value)
        : [...prev.roles, value]
    }));
  };

  const roles = [
    {
      icon: 'ri-presentation-fill',
      title: 'Peer Trainer',
      color: 'bg-blue-500',
      description: 'Lead naloxone training sessions in the community. Share your lived experience to help others learn life-saving skills.',
      commitment: '4-8 hours per month',
      requirements: ['Complete our trainer programme', 'Lived experience preferred', 'Good communication skills', 'Reliable and punctual']
    },
    {
      icon: 'ri-team-fill',
      title: 'Outreach Volunteer',
      color: 'bg-pink-500',
      description: 'Connect with people in the community, distribute naloxone kits, and raise awareness at events and public spaces.',
      commitment: '3-6 hours per month',
      requirements: ['Non-judgmental approach', 'Comfortable talking to strangers', 'Empathy and patience', 'Flexible availability']
    },
    {
      icon: 'ri-customer-service-2-fill',
      title: 'Peer Support Worker',
      color: 'bg-lime-500',
      description: 'Provide one-to-one support, signposting, and a listening ear to people affected by drug use.',
      commitment: '4-6 hours per month',
      requirements: ['Lived experience essential', 'Active listening skills', 'Boundaries awareness', 'Completed peer support training']
    },
    {
      icon: 'ri-calendar-event-fill',
      title: 'Events Coordinator',
      color: 'bg-yellow-400',
      description: 'Help organize community events, awareness campaigns, and fundraising activities.',
      commitment: '2-5 hours per month',
      requirements: ['Organizational skills', 'Creative thinking', 'Team player', 'Event planning experience helpful']
    },
    {
      icon: 'ri-article-fill',
      title: 'Content Creator',
      color: 'bg-purple-500',
      description: 'Create social media content, write blog posts, design posters, and help spread our message online.',
      commitment: '2-4 hours per month',
      requirements: ['Writing or design skills', 'Social media savvy', 'Understanding of harm reduction', 'Creative mindset']
    },
    {
      icon: 'ri-settings-3-fill',
      title: 'Admin Support',
      color: 'bg-teal-500',
      description: 'Help with behind-the-scenes tasks like data entry, scheduling, emails, and general administration.',
      commitment: '3-5 hours per month',
      requirements: ['Computer literacy', 'Attention to detail', 'Reliable', 'Can work independently']
    }
  ];

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
              <Link to="/get-naloxone" className="text-gray-900 font-semibold hover:text-pink-5 transition-colors whitespace-nowrap">Get Naloxone</Link>
              <Link to="/volunteer" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Volunteer</Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Resources</Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Contact</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/members/login" className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2">
                <i className="ri-user-fill"></i> Members
              </Link>
              <Link to="/get-naloxone" className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap">
                Get Naloxone Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-500 to-purple-600 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
            Join Our Team
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Volunteer With Us
          </h1>
          <p className="text-xl text-white/90 font-semibold max-w-3xl mx-auto mb-8">
            Be part of a grassroots movement saving lives. Whether you have lived experience or just want to help, there's a place for you here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#signup" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-all shadow-xl whitespace-nowrap">
              Sign Up Now <i className="ri-arrow-down-line ml-2"></i>
            </a>
            <Link to="/volunteers/login" className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-all whitespace-nowrap flex items-center gap-2">
              <i className="ri-login-box-line"></i>
              Already Registered? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Make a Difference
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Volunteer With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a supportive, peer-led community where your contribution directly saves lives
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-fill text-blue-500 text-3xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Save Lives</h3>
              <p className="text-white/90 text-sm">
                Your work directly prevents overdose deaths and supports people in crisis
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-group-fill text-pink-500 text-3xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Build Community</h3>
              <p className="text-white/90 text-sm">
                Connect with like-minded people who understand and support each other
              </p>
            </div>

            <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-lightbulb-fill text-lime-500 text-3xl"></i>
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">Learn Skills</h3>
              <p className="text-gray-800 text-sm">
                Gain training, experience, and confidence in harm reduction and peer support
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-star-fill text-yellow-500 text-3xl"></i>
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">Make Impact</h3>
              <p className="text-gray-800 text-sm">
                Be part of real change in Plymouth and Devon's harm reduction landscape
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Roles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Find Your Role
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Volunteer Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a role that fits your skills, interests, and availability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className={`${role.color} p-6 text-center`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${role.icon} ${role.color.replace('bg-', 'text-')} text-4xl`}></i>
                  </div>
                  <h3 className="text-white font-bold text-2xl">{role.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {role.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-time-fill text-pink-500"></i>
                      <span className="font-bold text-gray-900 text-sm">Time Commitment:</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-6">{role.commitment}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-checkbox-circle-fill text-lime-500"></i>
                      <span className="font-bold text-gray-900 text-sm">What You'll Need:</span>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {role.requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Support for Volunteers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Provide
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-book-open-fill text-yellow-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-xl mb-2">Full Training</h3>
                  <p className="text-gray-800">
                    Comprehensive training in naloxone administration, harm reduction principles, safeguarding, and peer support techniques
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-fill text-pink-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Ongoing Support</h3>
                  <p className="text-white/90">
                    Regular supervision, peer support meetings, and access to experienced team members whenever you need guidance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-text-fill text-blue-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">References &amp; Certificates</h3>
                  <p className="text-white/90">
                    Receive certificates for completed training and volunteer references for future opportunities
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-lime-500 to-green-500 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-money-pound-circle-fill text-lime-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-xl mb-2">Expenses Covered</h3>
                  <p className="text-gray-800">
                    Travel expenses reimbursed and refreshments provided at training sessions and events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Real Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hear From Our Volunteers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Sarah</h4>
                  <p className="text-gray-600 text-sm">Peer Trainer</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Volunteering here gave me purpose. I've been in recovery for 3 years and being able to share my experience to help others stay safe is incredibly rewarding."
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400"></i>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Marcus</h4>
                  <p className="text-gray-600 text-sm">Outreach Volunteer</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "I lost my brother to an overdose. Now I hand out naloxone kits and talk to people about harm reduction. It's my way of making sure others don't lose someone they love."
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400"></i>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-2xl">
                  J
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Jess</h4>
                  <p className="text-gray-600 text-sm">Admin Support</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "I don't have lived experience but wanted to help. The admin role lets me contribute behind the scenes. The team is so welcoming and the work is genuinely life-saving."
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400"></i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section id="signup" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Ready to Join?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Volunteer Sign-Up
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Fill out the form below and we'll be in touch within 48 hours
            </p>
            <Link
              to="/volunteers/login"
              className="inline-flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-colors text-lg"
            >
              <i className="ri-login-box-line"></i>
              Already registered? Sign in to your dashboard
            </Link>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-8 md:p-12 shadow-2xl">
            <form
              id="volunteer-signup-form"
              data-readdy-form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm"
                  placeholder="07xxx xxxxxx"
                />
              </div>

              {/* Role Selection — multi-select checkboxes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Which role(s) interest you? * <span className="font-normal text-gray-700">(select all that apply)</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: 'Peer Trainer', icon: 'ri-presentation-fill', color: 'text-blue-600' },
                    { value: 'Outreach Volunteer', icon: 'ri-team-fill', color: 'text-pink-600' },
                    { value: 'Peer Support Worker', icon: 'ri-customer-service-2-fill', color: 'text-lime-700' },
                    { value: 'Events Coordinator', icon: 'ri-calendar-event-fill', color: 'text-yellow-600' },
                    { value: 'Content Creator', icon: 'ri-article-fill', color: 'text-purple-600' },
                    { value: 'Admin Support', icon: 'ri-settings-3-fill', color: 'text-teal-600' },
                  ].map((role) => {
                    const selected = formData.roles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          selected
                            ? 'bg-white border-pink-500 shadow-md'
                            : 'bg-white/70 border-white hover:border-pink-300 hover:bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${selected ? 'opacity-100' : 'opacity-60'}`}>
                          <i className={`${role.icon} ${role.color} text-xl`}></i>
                        </div>
                        <span className={`text-sm font-semibold ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {role.value}
                        </span>
                        {selected && (
                          <div className="ml-auto w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-white text-xs"></i>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {formData.roles.length === 0 && (
                  <p className="text-xs text-gray-700 mt-2">Please select at least one role</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Do you have lived experience? *</label>
                <select
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm cursor-pointer"
                >
                  <option value="">Please select</option>
                  <option value="Yes - Personal experience with substance use">Yes - Personal experience with substance use</option>
                  <option value="Yes - Family/friend affected">Yes - Family/friend affected</option>
                  <option value="No lived experience">No lived experience</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Your Availability *</label>
                <select
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm cursor-pointer"
                >
                  <option value="">Select your availability</option>
                  <option value="Weekday Mornings">Weekday Mornings</option>
                  <option value="Weekday Afternoons">Weekday Afternoons</option>
                  <option value="Weekday Evenings">Weekday Evenings</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Flexible - Various times">Flexible - Various times</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Why do you want to volunteer with us? *</label>
                <textarea
                  name="motivation"
                  required
                  rows={5}
                  maxLength={500}
                  value={formData.motivation}
                  onChange={(e) => {
                    setFormData({ ...formData, motivation: e.target.value });
                    setCharCount(e.target.value.length);
                  }}
                  className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl focus:border-pink-500 focus:outline-none transition-colors text-sm resize-none"
                  placeholder="Tell us what motivates you to join our team..."
                ></textarea>
                <p className={`text-xs mt-1 ${charCount > 480 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                  {charCount}/500 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || formData.roles.length === 0}
                className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-xl whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span><i className="ri-loader-4-line animate-spin mr-2"></i>Submitting...</span>
                ) : (
                  <span>Submit Application <i className="ri-send-plane-fill ml-2"></i></span>
                )}
              </button>

              <p className="text-xs text-gray-700 text-center">
                We'll contact you within 48 hours to discuss next steps
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              Got Questions?
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Volunteer FAQs
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Do I need previous experience?
              </h3>
              <p className="text-gray-600 pl-8">
                No! We provide full training for all roles. Whether you have lived experience or are completely new to harm reduction, you're welcome here.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                How much time do I need to commit?
              </h3>
              <p className="text-gray-600 pl-8">
                It varies by role, but most positions require 2-8 hours per month. We're flexible and work around your schedule.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Will I be working alone?
              </h3>
              <p className="text-gray-600 pl-8">
                Never! You'll always have support from experienced team members. We work in pairs for outreach and provide ongoing supervision for all volunteers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                What if I'm in recovery?
              </h3>
              <p className="text-gray-600 pl-8">
                We welcome volunteers in recovery! We'll discuss your situation individually to ensure volunteering supports your wellbeing and recovery journey.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Can I volunteer if I'm under 18?
              </h3>
              <p className="text-gray-600 pl-8">
                Volunteers must be 18 or over for most roles due to safeguarding requirements. However, we have youth engagement opportunities - contact us to discuss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-white/90 font-semibold mb-10">
            Get in touch and we'll answer any questions you have about volunteering
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-block bg-yellow-400 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-yellow-500 transition-all shadow-xl whitespace-nowrap">
              Contact Us <i className="ri-mail-line ml-2"></i>
            </Link>
            <a href="tel:07561349137" className="inline-block bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white/30 transition-all whitespace-nowrap">
              Call: 07561 349 137
            </a>
          </div>
        </div>
      </section>

      {/* Application Process Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-500 text-white px-6 py-2 rounded-full font-bold mb-6">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Application Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Here's what happens after you submit your volunteer application
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-lime-400 to-yellow-400 transform -translate-x-1/2"></div>

            <div className="space-y-12">
              {[
                {
                  step: '1',
                  title: 'Submit Application',
                  description: 'Fill out the volunteer sign-up form below with your details, role preferences, and motivation. Takes about 5 minutes.',
                  icon: 'ri-file-edit-fill',
                  color: 'bg-pink-500',
                  align: 'left',
                },
                {
                  step: '2',
                  title: 'Admin Review',
                  description: 'Our team reviews your application to ensure we can match you with the right role and provide appropriate support.',
                  icon: 'ri-search-eye-fill',
                  color: 'bg-lime-500',
                  align: 'right',
                },
                {
                  step: '3',
                  title: 'Approval Email',
                  description: "You'll receive an email notification once your application is approved — usually within 48 hours.",
                  icon: 'ri-mail-check-fill',
                  color: 'bg-yellow-400',
                  align: 'left',
                },
                {
                  step: '4',
                  title: 'Access Dashboard',
                  description: 'Sign in to your volunteer dashboard to log hours, register for events, access resources, and start making a difference!',
                  icon: 'ri-dashboard-fill',
                  color: 'bg-purple-500',
                  align: 'right',
                },
              ].map((item, index) => (
                <div key={index} className={`relative flex items-center ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  {/* Step Number Circle */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-gray-100 rounded-full items-center justify-center z-10 shadow-lg">
                    <span className="text-2xl font-bold text-gray-900">{item.step}</span>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${item.align === 'right' ? 'md:ml-auto' : ''}`}>
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <i className={`${item.icon} text-white text-2xl`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="md:hidden text-lg font-bold text-gray-400">Step {item.step}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-lime-50 border border-lime-200 rounded-2xl p-6 inline-block">
              <div className="flex items-center gap-3">
                <i className="ri-time-fill text-lime-600 text-3xl"></i>
                <div className="text-left">
                  <p className="font-bold text-lime-900 text-lg">Average approval time: 24-48 hours</p>
                  <p className="text-sm text-lime-700">We'll keep you updated every step of the way</p>
                </div>
              </div>
            </div>
          </div>
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
            </div>

            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training &amp; P2P</Link></li>
                <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition-colors">Volunteer</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Get Help</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="font-semibold text-white">Emergency: 999</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
              </div>
            </div>

            <div>
              <h3 className="text-lime-400 font-bold text-lg mb-4">Location</h3>
              <p className="text-gray-400 text-sm">
                Hyde Park House<br />
                Mutley Plain<br />
                Plymouth, PL4 6LF<br />
                Devon, United Kingdom
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved.</p>
              <p className="mt-2">
                <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Powered by Readdy</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
