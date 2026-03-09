import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

interface FormConfig {
  heading: string;
  subheading: string;
  steps: { icon: string; title: string; description: string }[];
  secondaryCta: { label: string; to: string };
}

const formConfigs: Record<string, FormConfig> = {
  volunteer: {
    heading: 'Thank You for Volunteering!',
    subheading: 'Your application has been received. We\'re thrilled you want to join our team.',
    steps: [
      {
        icon: 'ri-file-search-fill',
        title: 'We review your application',
        description: 'Our team carefully reads every application to find the best role match for you.',
      },
      {
        icon: 'ri-phone-fill',
        title: 'We\'ll contact you within 48 hours',
        description: 'Expect a call or email from us to discuss your interests and next steps.',
      },
      {
        icon: 'ri-team-fill',
        title: 'Welcome to the team!',
        description: 'You\'ll be invited to an induction session and paired with an experienced volunteer.',
      },
    ],
    secondaryCta: { label: 'Learn About Volunteering', to: '/volunteer' },
  },
  contact: {
    heading: 'Message Received!',
    subheading: 'Thank you for getting in touch. We\'ll get back to you as soon as possible.',
    steps: [
      {
        icon: 'ri-mail-check-fill',
        title: 'Your message is with us',
        description: 'We\'ve received your enquiry and it\'s been passed to the right person.',
      },
      {
        icon: 'ri-time-fill',
        title: 'We respond within 24 hours',
        description: 'During business hours (Mon–Fri, 9am–5pm) we aim to reply the same day.',
      },
      {
        icon: 'ri-chat-check-fill',
        title: 'We\'ll answer your question',
        description: 'Our team will provide a full, helpful response to everything you\'ve asked.',
      },
    ],
    secondaryCta: { label: 'Explore Resources', to: '/resources' },
  },
  newsletter: {
    heading: 'You\'re Subscribed!',
    subheading: 'Welcome to our community. You\'ll be the first to hear about training sessions and news.',
    steps: [
      {
        icon: 'ri-mail-send-fill',
        title: 'Check your inbox',
        description: 'A confirmation email is on its way. Check your spam folder if you don\'t see it.',
      },
      {
        icon: 'ri-calendar-event-fill',
        title: 'Get training updates',
        description: 'We\'ll send you new session dates, free resources, and community stories.',
      },
      {
        icon: 'ri-heart-fill',
        title: 'Stay connected',
        description: 'Follow us on Facebook and Instagram @napplymouth for daily updates.',
      },
    ],
    secondaryCta: { label: 'View Training Dates', to: '/training' },
  },
  training: {
    heading: 'Booking Confirmed!',
    subheading: 'Your training session is booked. We\'ll send you a reminder 24 hours before your session.',
    steps: [
      {
        icon: 'ri-mail-check-fill',
        title: 'Confirmation email sent',
        description: 'Check your inbox for full details about your session, including location and time.',
      },
      {
        icon: 'ri-alarm-fill',
        title: 'Reminder email 24 hours before',
        description: 'We\'ll send you a reminder the day before your session with everything you need to know.',
      },
      {
        icon: 'ri-calendar-check-fill',
        title: 'Add it to your calendar',
        description: 'Make sure you save the date — sessions usually last around 90 minutes.',
      },
      {
        icon: 'ri-first-aid-kit-fill',
        title: 'Receive your free naloxone kit',
        description: 'You\'ll receive a free naloxone kit at the end of your training session.',
      },
    ],
    secondaryCta: { label: 'Explore Resources', to: '/resources' },
  },
};

const defaultConfig: FormConfig = {
  heading: 'Thank You!',
  subheading: 'Your submission has been received. We\'ll be in touch soon.',
  steps: [
    {
      icon: 'ri-check-double-fill',
      title: 'Submission received',
      description: 'We\'ve got your details and will review them shortly.',
    },
    {
      icon: 'ri-time-fill',
      title: 'We\'ll be in touch',
      description: 'Expect to hear from us within 48 hours.',
    },
    {
      icon: 'ri-heart-fill',
      title: 'Thank you for your support',
      description: 'Every action you take helps us save more lives in Plymouth and Devon.',
    },
  ],
  secondaryCta: { label: 'Explore Resources', to: '/resources' },
};

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const config = formConfigs[type] ?? defaultConfig;

  const [visible, setVisible] = useState(false);

  usePageMeta({
    title: 'Thank You | Naloxone Advocates Plymouth',
    description: 'Thank you for your submission. Naloxone Advocates Plymouth CIC will be in touch shortly.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/thank-you`,
  });

  useEffect(() => {
    // Add noindex so search engines don't index this page
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    // Trigger entrance animation
    const timer = setTimeout(() => setVisible(true), 50);
    return () => {
      clearTimeout(timer);
      // Restore robots meta on unmount
      const el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (el) el.setAttribute('content', 'index, follow');
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

            <div className="hidden md:flex items-center">
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
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Training &amp; P2P</Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Get Naloxone</Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Volunteer</Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Resources</Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Contact</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Emergency Banner */}
      <div className="bg-red-600 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3 text-center">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <i className="ri-alarm-warning-fill text-white text-xl"></i>
          </div>
          <p className="text-white text-sm font-semibold">
            In an emergency always call <strong>999</strong> first &nbsp;|&nbsp; Non-emergency health advice: <strong>NHS 111</strong>
          </p>
        </div>
      </div>

      {/* Hero — animated checkmark + heading */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 via-lime-300 to-lime-400 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/15 rounded-full"></div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated checkmark */}
          <div
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          >
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-gray-900 text-5xl"></i>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {config.heading}
            </h1>
            <p className="text-xl text-gray-800 font-semibold max-w-xl mx-auto">
              {config.subheading}
            </p>
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-4">
              What Happens Next
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Here's what to expect
            </h2>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-yellow-400 via-pink-400 to-lime-400 hidden md:block"></div>

            <div className="space-y-8">
              {config.steps.map((step, index) => {
                const colours = ['bg-yellow-400 text-gray-900', 'bg-pink-500 text-white', 'bg-lime-400 text-gray-900'];
                const colour = colours[index % colours.length];
                const isReminderStep = type === 'training' && index === 1;
                return (
                  <div
                    key={index}
                    className={`flex gap-6 items-start transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                    style={{ transitionDelay: `${300 + index * 150}ms` }}
                  >
                    <div className={`w-16 h-16 ${colour} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-10`}>
                      <i className={`${step.icon} text-2xl`}></i>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 flex-1 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {index + 1}</span>
                        {isReminderStep && (
                          <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                            📧 Reminder sent 24h before your session
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Fallback */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-yellow-400 rounded-3xl p-8 shadow-lg text-center">
            <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-question-line text-gray-900 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Haven't heard from us?</h3>
            <p className="text-gray-600 mb-6">
              If you don't hear from us within <strong>48 hours</strong>, please don't hesitate to reach out directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:07561349137"
                className="flex items-center justify-center gap-3 bg-blue-500 text-white px-7 py-3 rounded-full font-bold hover:bg-blue-600 transition-all shadow-md whitespace-nowrap cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-phone-fill text-lg"></i>
                </div>
                07561 349 137
              </a>
              <a
                href="mailto:napplymouth66@gmail.com"
                className="flex items-center justify-center gap-3 bg-pink-500 text-white px-7 py-3 rounded-full font-bold hover:bg-pink-600 transition-all shadow-md whitespace-nowrap cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-fill text-lg"></i>
                </div>
                napplymouth66@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What would you like to do next?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition-all shadow-lg whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-home-4-fill text-lg"></i>
              </div>
              Return to Home
            </Link>
            <Link
              to={config.secondaryCta.to}
              className="flex items-center justify-center gap-2 bg-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap"
            >
              {config.secondaryCta.label}
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-line text-lg"></i>
              </div>
            </Link>
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
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
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
            <div className="bg-yellow-400 rounded-2xl py-6 mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight">
                NALOXONE SAVES LIVES
              </h2>
            </div>
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
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
