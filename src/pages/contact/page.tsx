import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import SiteNav from '../../components/feature/SiteNav';

export default function ContactPage() {
  usePageMeta({
    title: 'Contact Naloxone Advocates Plymouth | Get in Touch Today',
    description: 'Contact Naloxone Advocates Plymouth CIC for naloxone training enquiries, free kit requests, volunteering opportunities, or general support. Phone, email and online form available.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact`,
    ogTitle: 'Contact Naloxone Advocates Plymouth CIC',
    ogDescription: 'Get in touch with our team for training, naloxone kits, volunteering or general enquiries. We respond within 24 hours.',
  });

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact`,
          "name": "Contact Naloxone Advocates Plymouth | Get in Touch",
          "description": "Contact Naloxone Advocates Plymouth CIC. Get in touch for naloxone training enquiries, kit requests, volunteering, or general support. Phone, email and online form available.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact` }
            ]
          }
        },
        {
          "@type": "ContactPage",
          "name": "Contact Naloxone Advocates Plymouth",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/contact`,
          "description": "Get in touch with our team for training, naloxone kits, volunteering or general enquiries.",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+447561349137",
            "email": "napplymouth66@gmail.com",
            "contactType": "customer support",
            "availableLanguage": "English",
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
              "opens": "09:00",
              "closes": "17:00"
            }
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How quickly can I get naloxone training?",
              "acceptedAnswer": { "@type": "Answer", "text": "We run regular training sessions throughout the week. You can usually book a session within 3-5 days. For urgent requests, contact us directly." }
            },
            {
              "@type": "Question",
              "name": "Is there any cost for the training?",
              "acceptedAnswer": { "@type": "Answer", "text": "No! All our training sessions and naloxone kits are completely at no cost. We're funded to provide this life-saving service to the community." }
            },
            {
              "@type": "Question",
              "name": "Do I need medical experience?",
              "acceptedAnswer": { "@type": "Answer", "text": "Not at all! Our training is designed for everyone. We'll teach you everything you need to know in a simple, supportive way." }
            },
            {
              "@type": "Question",
              "name": "Can I get naloxone without attending training?",
              "acceptedAnswer": { "@type": "Answer", "text": "We strongly recommend attending training first so you know how to use naloxone safely and effectively. However, in urgent situations, contact us to discuss options." }
            }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-contact';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-contact')?.remove(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataToSend = new FormData(form);
    
    try {
      await fetch('https://readdy.ai/api/form/d606ii6mq2rq4g9vonb0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formDataToSend as unknown as Record<string, string>).toString(),
      });
      navigate('/thank-you?type=contact');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-400 to-lime-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
            Get In Touch
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white font-semibold max-w-3xl mx-auto">
            We're here to help. Whether you need training, support, or just have questions about naloxone and harm reduction.
          </p>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-alarm-warning-fill text-red-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Emergency? Call 999 Immediately</h3>
              <p className="text-white text-sm">For life-threatening situations, always contact emergency services first</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-500 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-phone-fill text-blue-500 text-3xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Phone</h3>
              <p className="text-white/80 text-sm mb-4">Monday - Friday, 9am - 5pm</p>
              <a href="tel:07561349137" className="text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors">
                07561 349 137
              </a>
            </div>

            <div className="bg-pink-500 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-fill text-pink-500 text-3xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Email</h3>
              <p className="text-white/80 text-sm mb-4">We respond within 24 hours</p>
              <a href="mailto:napplymouth66@gmail.com" className="text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors break-all">
                napplymouth66@gmail.com
              </a>
            </div>

            <div className="bg-lime-500 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-fill text-lime-500 text-3xl"></i>
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">Visit Us</h3>
              <p className="text-gray-800 text-sm mb-4">Hyde Park House, Mutley Plain</p>
              <p className="text-gray-900 font-semibold text-sm">
                Hyde Park House<br />
                Mutley Plain<br />
                Plymouth, PL4 6LF
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Form & Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible</p>

                <form 
                  id="contact-form"
                  data-readdy-form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
                      placeholder="07xxx xxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enquiry Topic *</label>
                    <select
                      name="topic"
                      required
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm cursor-pointer"
                    >
                      <option value="">Select a topic</option>
                      <option value="training">Training Enquiry</option>
                      <option value="naloxone">Request Naloxone Kit</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="partnership">Partnership/Collaboration</option>
                      <option value="general">General Enquiry</option>
                      <option value="support">Need Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      maxLength={500}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">Maximum 500 characters</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap cursor-pointer"
                  >
                    Send Message <i className="ri-send-plane-fill ml-2"></i>
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We typically respond within 24 hours during business days
                  </p>
                </form>
              </div>

              {/* Quick Links */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Link to="/training" className="bg-blue-500 text-white p-6 rounded-2xl hover:bg-blue-600 transition-all shadow-lg text-center">
                  <i className="ri-calendar-check-fill text-3xl mb-2"></i>
                  <p className="font-bold">Book Training</p>
                </Link>
                <Link to="/get-naloxone" className="bg-yellow-400 text-gray-900 p-6 rounded-2xl hover:bg-yellow-500 transition-all shadow-lg text-center">
                  <i className="ri-medicine-bottle-fill text-3xl mb-2"></i>
                  <p className="font-bold">Get Naloxone</p>
                </Link>
              </div>
            </div>

            {/* Map & Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                <div className="h-96 w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2523.4567890123456!2d-4.131!3d50.3784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c93b9e3b3b3b3%3A0x1234567890abcdef!2sHyde%20Park%20House%2C%20Mutley%20Plain%2C%20Plymouth%20PL4%206LF!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Naloxone Advocates Plymouth - Hyde Park House, Mutley Plain, Plymouth PL4 6LF"
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">Our Location</h3>
                  <p className="text-gray-600 mb-4">
                    <i className="ri-map-pin-line text-pink-500 mr-2"></i>
                    Hyde Park House, Mutley Plain, Plymouth, PL4 6LF
                  </p>
                  <p className="text-sm text-gray-500">
                    We operate across Plymouth and Devon. Training sessions are held at various community venues.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Hyde+Park+House+Mutley+Plain+Plymouth+PL4+6LF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-pink-600 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-map-pin-2-line"></i>
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-xl text-white">
                <h3 className="text-2xl font-bold mb-6">Opening Hours</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Sunday</span>
                    <span className="text-white/60">Closed</span>
                  </div>
                </div>
                <div className="mt-6 bg-white/10 rounded-2xl p-4">
                  <p className="text-sm">
                    <i className="ri-information-line mr-2"></i>
                    Training sessions may be available outside these hours. Contact us for flexible scheduling.
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Follow Us</h3>
                <p className="text-gray-600 mb-6">Stay updated with our latest news, training sessions, and community events</p>
                <div className="flex gap-4">
                  <a href="#" className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <i className="ri-facebook-fill text-white text-2xl"></i>
                  </a>
                  <a href="#" className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <i className="ri-instagram-fill text-white text-2xl"></i>
                  </a>
                  <a href="#" className="w-14 h-14 bg-blue-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <i className="ri-twitter-fill text-white text-2xl"></i>
                  </a>
                  <a href="#" className="w-14 h-14 bg-lime-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <i className="ri-linkedin-fill text-gray-900 text-2xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6">
              Common Questions
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                How quickly can I get naloxone training?
              </h3>
              <p className="text-gray-600 pl-8">
                We run regular training sessions throughout the week. You can usually book a session within 3-5 days. For urgent requests, contact us directly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Is there any cost for the training?
              </h3>
              <p className="text-gray-600 pl-8">
                No! All our training sessions and naloxone kits are completely at no cost. We're funded to provide this life-saving service to the community.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Do I need medical experience?
              </h3>
              <p className="text-gray-600 pl-8">
                Not at all! Our training is designed for everyone. We'll teach you everything you need to know in a simple, supportive way.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                <i className="ri-question-line text-pink-500 mr-2"></i>
                Can I get naloxone without attending training?
              </h3>
              <p className="text-gray-600 pl-8">
                We strongly recommend attending training first so you know how to use naloxone safely and effectively. However, in urgent situations, contact us to discuss options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-white font-semibold mb-10">
            Book your naloxone training today and become part of our life-saving community
          </p>
          <Link to="/training" className="inline-block bg-pink-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-pink-600 transition-all shadow-xl whitespace-nowrap">
            Book Training <i className="ri-arrow-right-line ml-2"></i>
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
            </div>

            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training & P2P</Link></li>
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
