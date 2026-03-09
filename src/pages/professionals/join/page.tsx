import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../../../components/feature/SiteNav';
import { usePageMeta } from '../../../hooks/usePageMeta';

const FORM_SUBMIT_URL = 'https://readdy.ai/api/form/d6ihm69boei3uoqmpl10';

const trainingPackages = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: '£',
    duration: 'Half day (3 hrs)',
    tag: null,
    color: 'border-amber-600',
    accent: 'bg-amber-600',
    textAccent: 'text-amber-700',
    features: [
      'Opioid overdose recognition',
      'Naloxone administration (nasal & injectable)',
      'Recovery position & aftercare',
      'Legal framework & Good Samaritan protections',
      'Certificate of completion',
      'Up to 10 participants',
    ],
    bestFor: 'GPs, practice nurses, pharmacists',
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '£',
    duration: 'Full day (6 hrs)',
    tag: 'MOST POPULAR',
    color: 'border-slate-400',
    accent: 'bg-slate-400',
    textAccent: 'text-slate-500',
    features: [
      'Everything in Bronze',
      'Poly-drug overdose scenarios',
      'Harm reduction counselling skills',
      'Stigma-informed communication',
      'Patient referral pathways',
      'Hands-on simulation exercises',
      'Up to 15 participants',
      'CPD-accredited certificate',
    ],
    bestFor: 'Hospital teams, A&E staff, social workers',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '£',
    duration: 'Flexible',
    tag: null,
    color: 'border-yellow-400',
    accent: 'bg-yellow-400',
    textAccent: 'text-yellow-600',
    features: [
      'Everything in Silver',
      'Fully bespoke curriculum',
      'On-site or virtual delivery',
      'Unlimited participants',
      'Train-the-trainer option',
      'Policy & protocol review',
      'Ongoing support package',
      'Annual refresher included',
    ],
    bestFor: 'NHS trusts, councils, large charities',
  },
];

const faqs = [
  {
    q: 'Is the training CPD-accredited?',
    a: 'Our Advanced Clinical package carries CPD accreditation. Foundation certificates are recognised by most professional bodies as evidence of continuing professional development.',
  },
  {
    q: 'Can training be delivered at our premises?',
    a: 'Yes — all packages can be delivered on-site at your organisation. We bring all equipment and materials. Virtual delivery is also available for remote or hybrid teams.',
  },
  {
    q: 'How many people can attend per session?',
    a: 'Foundation sessions accommodate up to 10 participants; Advanced Clinical up to 15. Organisational packages have no cap — we scale to your team size.',
  },
  {
    q: 'Do participants receive naloxone kits?',
    a: 'Naloxone kits can be included for an additional cost, or we can advise on how your organisation can obtain them through NHS supply channels.',
  },
  {
    q: 'How do I pay?',
    a: 'After submitting your enquiry, we will send an invoice. We accept BACS bank transfer and card payment. Purchase orders are accepted for NHS and public sector organisations.',
  },
  {
    q: 'Can we get a group discount?',
    a: 'Yes — organisations booking multiple sessions or large cohorts receive discounted rates. Contact us to discuss your requirements.',
  },
];

export default function ProfessionalsJoinPage() {
  usePageMeta({
    title: 'Professional Naloxone Training Plymouth | CPD Accredited | Naloxone Advocates',
    description: 'CPD-accredited naloxone training for healthcare professionals in Plymouth and Devon. Foundation, Advanced Clinical and bespoke organisational packages. Book your session today.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/professionals/join`,
    ogTitle: 'Professional Naloxone Training — Naloxone Advocates Plymouth',
    ogDescription: 'Specialist naloxone training for GPs, nurses, pharmacists and NHS teams. CPD-accredited. On-site or virtual. Book now.',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organisation: '',
    role: '',
    package: '',
    teamSize: '',
    preferredDate: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Professional Naloxone Training — Naloxone Advocates Plymouth',
      description: 'CPD-accredited naloxone training for healthcare professionals. Foundation, Advanced Clinical and bespoke organisational packages available.',
      provider: {
        '@type': 'NGO',
        name: 'Naloxone Advocates Plymouth CIC',
        url: import.meta.env.VITE_SITE_URL || 'https://example.com',
      },
      offers: [
        { '@type': 'Offer', name: 'Foundation', price: '95', priceCurrency: 'GBP' },
        { '@type': 'Offer', name: 'Advanced Clinical', price: '175', priceCurrency: 'GBP' },
      ],
      courseMode: ['onsite', 'online'],
      educationalLevel: 'Professional',
      inLanguage: 'en-GB',
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-prof-training';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-prof-training')?.remove(); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.package) { setFormError('Please select a training package.'); return; }
    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      Object.entries(formData).forEach(([k, v]) => body.append(k, v));
      const res = await fetch(FORM_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setFormError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=professional%20healthcare%20training%20workshop%20room%20with%20medical%20professionals%20in%20scrubs%20and%20business%20attire%20seated%20around%20tables%20with%20training%20materials%2C%20modern%20clinical%20education%20setting%2C%20bright%20overhead%20lighting%2C%20focused%20group%20learning%20environment%2C%20NHS%20style%20training%20room%2C%20clean%20and%20professional%20atmosphere%2C%20wide%20angle%20view&width=1440&height=700&seq=prof-hero-bg-01&orientation=landscape"
            alt="Professional training session"
            className="w-full h-full object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/50 to-gray-900/70"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-sm mb-6">
            <i className="ri-stethoscope-line"></i>
            For Healthcare Professionals
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Professional Naloxone<br />
            <span className="text-yellow-400">Training Packages</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            CPD-accredited training delivered by specialists with lived experience. Equip your team to respond confidently to opioid overdose — on-site or virtually, across Plymouth and Devon.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#packages"
              className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl whitespace-nowrap cursor-pointer"
            >
              View Packages
            </a>
            <a
              href="#enquire"
              className="inline-block bg-white/10 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all whitespace-nowrap cursor-pointer"
            >
              Make an Enquiry
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-yellow-400 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { icon: 'ri-award-line', text: 'CPD Accredited' },
              { icon: 'ri-map-pin-line', text: 'Plymouth & Devon' },
              { icon: 'ri-computer-line', text: 'On-site or Virtual' },
              { icon: 'ri-group-line', text: 'NHS & Charity Rates' },
              { icon: 'ri-shield-check-line', text: 'Lived-Experience Led' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${item.icon} text-xl`}></i>
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-block bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-sm mb-6">
                Why Train With Us?
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Training That Goes Beyond the Textbook
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our trainers aren't just clinically qualified — many have <strong className="text-gray-900">lived experience of addiction and recovery</strong>. That combination of professional knowledge and personal insight creates training that is genuinely transformative for healthcare teams.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We work with GP surgeries, NHS trusts, community pharmacies, social care teams and third-sector organisations across Plymouth and Devon to build confident, stigma-informed responders.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'ri-heart-pulse-line', label: 'Evidence-based curriculum' },
                  { icon: 'ri-user-heart-line', label: 'Stigma-informed approach' },
                  { icon: 'ri-file-certificate-line', label: 'CPD certificates issued' },
                  { icon: 'ri-refresh-line', label: 'Annual refresher support' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <div className="w-9 h-9 flex items-center justify-center bg-pink-100 rounded-lg flex-shrink-0">
                      <i className={`${item.icon} text-pink-500 text-lg`}></i>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 leading-snug">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ height: '480px' }}>
                <img
                  src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20healthcare%20professionals%20nurses%20doctors%20pharmacists%20in%20a%20training%20workshop%20actively%20engaged%20in%20hands-on%20naloxone%20training%20exercise%2C%20trainer%20demonstrating%20nasal%20spray%20technique%2C%20bright%20modern%20training%20room%2C%20professional%20development%20session%2C%20engaged%20participants%20taking%20notes%2C%20warm%20natural%20lighting%2C%20documentary%20photography%20style&width=700&height=480&seq=prof-why-us-img-01&orientation=portrait"
                  alt="Healthcare professionals in naloxone training"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-group-fill text-gray-900 text-2xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-500">Professionals trained</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-lime-400 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-6">
              Training Packages
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Package
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All packages include expert facilitation, printed materials and a certificate for every participant.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trainingPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border-t-4 ${pkg.color} flex flex-col ${pkg.tag ? 'ring-2 ring-pink-500 md:scale-105' : ''}`}
              >
                {pkg.tag && (
                  <div className={`${pkg.accent} text-white text-xs font-bold px-4 py-1 rounded-full inline-block mb-4 self-start`}>
                    {pkg.tag}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className={`text-4xl font-bold ${pkg.textAccent}`}>{pkg.price}</span>
                  {pkg.price !== 'POA' && <span className="text-gray-500 text-sm mb-1">per session</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <i className="ri-time-line"></i>
                  {pkg.duration}
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Best for</div>
                <p className="text-sm text-gray-600 mb-6 italic">{pkg.bestFor}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`ri-checkbox-circle-fill ${pkg.textAccent} text-lg`}></i>
                      </div>
                      <span className="text-sm text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#enquire"
                  onClick={() => setFormData((p) => ({ ...p, package: pkg.name }))}
                  className={`block w-full ${pkg.accent} ${pkg.id === 'silver' ? 'text-white' : 'text-gray-900'} px-6 py-4 rounded-full font-bold text-center hover:opacity-90 transition-all whitespace-nowrap cursor-pointer`}
                >
                  Book This Package
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            All prices exclude VAT. NHS and registered charity discounts available — mention this when enquiring.
          </p>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-sm mb-6">
              Curriculum
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Your Team Will Learn</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A practical, evidence-based curriculum designed for busy clinical and social care professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'ri-heart-pulse-line', title: 'Overdose Recognition', desc: 'Identifying opioid overdose quickly and accurately, including poly-drug presentations.' },
              { icon: 'ri-syringe-line', title: 'Naloxone Administration', desc: 'Hands-on practice with both nasal spray (Pebble) and injectable (Prenoxad) formats.' },
              { icon: 'ri-first-aid-kit-line', title: 'Emergency Response', desc: 'Calling 999, recovery position, rescue breathing and monitoring until help arrives.' },
              { icon: 'ri-chat-heart-line', title: 'Stigma-Informed Care', desc: 'Language, attitudes and communication skills that support people who use drugs.' },
              { icon: 'ri-scales-3-line', title: 'Legal Framework', desc: 'Good Samaritan protections, prescribing rights and organisational liability.' },
              { icon: 'ri-route-line', title: 'Referral Pathways', desc: 'Local and national support services, harm reduction resources and follow-up care.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-yellow-400 rounded-xl mb-4">
                  <i className={`${item.icon} text-gray-900 text-2xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-lime-400 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-6">
              Testimonials
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Professionals Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The Advanced Clinical session was the best CPD I\'ve attended in years. The trainers\' lived experience made the stigma module genuinely eye-opening for our whole team.',
                name: 'Dr. Sarah Okafor',
                role: 'GP Partner, Devonport Health Centre',
                initials: 'SO',
                color: 'bg-pink-500',
                textColor: 'text-white',
              },
              {
                quote: 'We booked the organisational package for 40 staff across two sites. The team were flexible, professional and the bespoke content was exactly what we needed.',
                name: 'Mark Hennessy',
                role: 'Head of Operations, Plymouth City Council',
                initials: 'MH',
                color: 'bg-yellow-400',
                textColor: 'text-gray-900',
              },
              {
                quote: 'As a community pharmacist, I\'d done naloxone training before — but never like this. The hands-on simulation and the honest conversation about stigma were invaluable.',
                name: 'Priya Sharma',
                role: 'Community Pharmacist, Stonehouse',
                initials: 'PS',
                color: 'bg-lime-400',
                textColor: 'text-gray-900',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400 text-lg"></i>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${t.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`font-bold text-sm ${t.textColor}`}>{t.initials}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* P2P Programme */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://readdy.ai/api/search-image?query=two%20people%20sitting%20together%20in%20a%20community%20setting%20having%20a%20supportive%20peer%20to%20peer%20conversation%2C%20warm%20and%20welcoming%20environment%2C%20community%20centre%20or%20library%20background%2C%20natural%20light%2C%20candid%20documentary%20style%20photography%2C%20diverse%20individuals%2C%20genuine%20human%20connection%2C%20soft%20warm%20tones%2C%20hopeful%20atmosphere&width=600&height=500&seq=p2p-section-img-01&orientation=portrait"
                  alt="Peer-to-peer programme"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/60 md:block hidden"></div>
              </div>
              <div className="p-10 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-lime-400 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-6 self-start">
                  <i className="ri-community-line"></i>
                  P2P Programme
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Want a Peer-to-Peer Programme in Your Area?
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our <strong className="text-white">Peer-to-Peer (P2P) programme</strong> trains people with lived experience to become naloxone champions in their own communities — one of the most effective ways to get life-saving kits into the hands of people who need them most.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  We can help you set up and run a fully supported P2P programme in your area, tailored to your local community. If you're a commissioner, public health team, or third-sector organisation and want to explore this, we'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:napplymouth66@gmail.com?subject=P2P Programme Enquiry"
                    className="inline-flex items-center justify-center gap-2 bg-lime-400 text-gray-900 px-7 py-4 rounded-full font-bold hover:bg-lime-300 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-mail-send-line"></i>
                    Email Us for Details
                  </a>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <i className="ri-time-line text-gray-500"></i>
                    </div>
                    We reply within one working day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-yellow-400 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-6">
              FAQs
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <i className={`text-gray-500 text-lg transition-transform duration-200 ${openFaq === i ? 'ri-subtract-line' : 'ri-add-line'}`}></i>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquire" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-sm mb-6">
              Book Now
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Make an Enquiry</h2>
            <p className="text-lg text-gray-600">
              Fill in the form below and we'll get back to you within one working day with availability and a confirmed quote.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-checkbox-circle-fill text-gray-900 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enquiry Received!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for your interest. A member of our team will be in touch within one working day to discuss your training needs and confirm availability.
              </p>
              <Link
                to="/training"
                className="inline-block bg-pink-500 text-white px-8 py-4 rounded-full font-bold hover:bg-pink-600 transition-all whitespace-nowrap"
              >
                Back to Training
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <i className="ri-error-warning-line text-red-500 text-xl mt-0.5 flex-shrink-0"></i>
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}
              <form data-readdy-form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Dr. Jane Smith"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@nhstrust.co.uk"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organisation *</label>
                    <input
                      type="text"
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleChange}
                      required
                      placeholder="NHS Trust / Charity / Practice"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role *</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Practice Manager, GP, Nurse"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Training Package *</label>
                    <select
                      name="package"
                      value={formData.package}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none bg-white cursor-pointer"
                    >
                      <option value="">Select a package</option>
                      <option value="Bronze">Bronze (half day)</option>
                      <option value="Silver">Silver (full day)</option>
                      <option value="Gold">Gold (bespoke)</option>
                      <option value="Not sure">Not sure — please advise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Team Size</label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none bg-white cursor-pointer"
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1–5 people</option>
                      <option value="6-10">6–10 people</option>
                      <option value="11-20">11–20 people</option>
                      <option value="21-50">21–50 people</option>
                      <option value="50+">50+ people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date / Timeframe</label>
                  <input
                    type="text"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    placeholder="e.g. Any Tuesday in March, or ASAP"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Any specific requirements, accessibility needs, or questions for us..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm outline-none resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.message.length}/500</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i> Sending Enquiry...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-send-plane-line"></i> Send Enquiry
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We'll respond within one working day. For urgent enquiries, please{' '}
                  <Link to="/contact" className="text-pink-500 hover:underline">contact us directly</Link>.
                </p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Already a Registered Professional?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Access your CPD resources, session history and certificates in the professionals portal.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/professionals/login"
              className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-xl whitespace-nowrap"
            >
              <i className="ri-login-box-line mr-2"></i>Sign In to Portal
            </Link>
            <Link
              to="/professionals/login"
              className="inline-block bg-white/10 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all whitespace-nowrap"
            >
              <i className="ri-user-add-line mr-2"></i>Register as Professional
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
