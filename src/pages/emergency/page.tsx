import { Link } from 'react-router-dom';
import { useState } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';

const steps = [
  {
    number: '1',
    title: 'Stay Safe',
    subtitle: 'Assess the scene first',
    color: 'bg-red-600',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    icon: 'ri-eye-fill',
    instructions: [
      'Check the area is safe for you to approach',
      'Look for any hazards — needles, traffic, unstable surfaces',
      'Do not put yourself at risk',
      'If unsafe, call 999 immediately and wait for emergency services',
    ],
    warning: null,
  },
  {
    number: '2',
    title: 'Call 999',
    subtitle: 'Do this FIRST — always',
    color: 'bg-red-600',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    icon: 'ri-phone-fill',
    instructions: [
      'Call 999 immediately — do not delay',
      'Tell them: "Someone is unresponsive and I think they may have overdosed"',
      'Give your exact location clearly',
      'Stay on the line — follow the operator\'s instructions',
      'You will NOT get in trouble for calling 999',
    ],
    warning: 'Naloxone is a temporary measure. Professional medical help is ALWAYS required.',
  },
  {
    number: '3',
    title: 'Check for Response',
    subtitle: 'Is the person conscious?',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    icon: 'ri-user-search-fill',
    instructions: [
      'Shout their name and tap their shoulders firmly',
      'Look for signs of overdose: slow/stopped breathing, blue lips or fingertips, gurgling sounds, unresponsive',
      'Check if they are breathing — look for chest movement',
      'If breathing is absent or very slow, act immediately',
    ],
    warning: null,
  },
  {
    number: '4',
    title: 'Not Breathing? Start CPR',
    subtitle: 'If there is no breathing at all',
    color: 'bg-red-700',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-700',
    textColor: 'text-red-700',
    icon: 'ri-heart-pulse-fill',
    instructions: [
      'If the person is NOT breathing, begin CPR immediately while waiting for 999',
      'Lay them flat on their back on a firm surface',
      'Place the heel of your hand on the centre of their chest (lower half of the breastbone)',
      'Place your other hand on top and interlock your fingers',
      'Push down hard and fast — at least 5–6 cm deep, 100–120 times per minute',
      'After 30 chest compressions, give 2 rescue breaths: tilt the head back, lift the chin, pinch the nose, and breathe into the mouth until the chest rises',
      'Continue the cycle of 30 compressions and 2 breaths until paramedics arrive or the person starts breathing',
      'If you are not trained in rescue breaths, do hands-only CPR — continuous chest compressions without stopping',
    ],
    warning: 'Do not stop CPR unless the person starts breathing normally, a defibrillator (AED) is ready to use, or paramedics take over. Administer naloxone alongside CPR if available.',
  },
  {
    number: '5',
    title: 'Give Naloxone',
    subtitle: 'Administer the nasal spray or injection',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    icon: 'ri-medicine-bottle-fill',
    instructions: [
      'Lay the person on their back',
      'Tilt their head back gently to open the airway',
      'Insert the nozzle into one nostril (nasal spray) OR inject into the outer thigh or upper arm muscle (injectable)',
      'Press the plunger firmly to release the full dose',
      'If no response after 2–3 minutes, give a second dose in the other nostril or a new injection site',
      'You can give up to 3 doses — keep going until help arrives',
    ],
    warning: 'Naloxone only works on opioids (heroin, methadone, fentanyl, prescription painkillers). It will not harm someone who has not taken opioids.',
  },
  {
    number: '6',
    title: 'Recovery Position',
    subtitle: 'Keep them safe while you wait',
    color: 'bg-lime-500',
    lightColor: 'bg-lime-50',
    borderColor: 'border-lime-500',
    textColor: 'text-lime-600',
    icon: 'ri-heart-pulse-fill',
    instructions: [
      'If they are breathing, place them in the recovery position',
      'Roll them onto their side — left side is best',
      'Tilt their head back to keep the airway open',
      'Bend the top knee forward to keep them stable',
      'Stay with them and monitor their breathing',
      'Keep them warm with a coat or blanket if available',
    ],
    warning: null,
  },
  {
    number: '7',
    title: 'When They Wake Up',
    subtitle: 'Naloxone wears off — stay alert',
    color: 'bg-lime-500',
    lightColor: 'bg-lime-50',
    borderColor: 'border-lime-500',
    textColor: 'text-lime-600',
    icon: 'ri-shield-check-fill',
    instructions: [
      'They may be confused, agitated, or aggressive — this is normal',
      'Speak calmly and reassure them',
      'Do NOT let them take more drugs — naloxone wears off in 30–90 minutes',
      'They MUST be seen by paramedics — do not let them leave',
      'Tell paramedics how much naloxone you gave and when',
      'Stay with them until emergency services arrive',
    ],
    warning: 'Naloxone wears off faster than opioids. The person can go back into overdose. NEVER leave them alone.',
  },
];

const signs = [
  { icon: 'ri-zzz-fill', label: 'Unresponsive or unconscious', color: 'text-red-500' },
  { icon: 'ri-lungs-fill', label: 'Slow, shallow or stopped breathing', color: 'text-red-500' },
  { icon: 'ri-drop-fill', label: 'Blue or grey lips and fingertips', color: 'text-red-500' },
  { icon: 'ri-sound-module-fill', label: 'Gurgling or snoring sounds', color: 'text-red-500' },
  { icon: 'ri-eye-close-fill', label: 'Pinpoint (very small) pupils', color: 'text-yellow-500' },
  { icon: 'ri-body-scan-fill', label: 'Limp body, pale or clammy skin', color: 'text-yellow-500' },
];

const myths = [
  {
    myth: '"I\'ll get in trouble for calling 999"',
    fact: 'You will NOT be arrested for calling 999 to report an overdose. Emergency services are there to save lives, not to prosecute bystanders.',
  },
  {
    myth: '"I should put them in a cold shower"',
    fact: 'This is dangerous and can cause shock. Keep them warm and in the recovery position instead.',
  },
  {
    myth: '"I should inject them with salt water"',
    fact: 'This is a myth and can cause serious harm. Only use naloxone and call 999.',
  },
  {
    myth: '"Naloxone will hurt them if they haven\'t taken opioids"',
    fact: 'Naloxone is safe. If no opioids are present, it simply has no effect. It cannot cause harm.',
  },
  {
    myth: '"They\'re just sleeping it off — they\'ll be fine"',
    fact: 'Never assume. An overdose can be fatal within minutes. Always call 999 and administer naloxone if available.',
  },
  {
    myth: '"I should keep them awake by walking them around"',
    fact: 'Do not try to walk someone who is overdosing. Keep them still, in the recovery position, and monitor their breathing.',
  },
];

export default function EmergencyPage() {
  usePageMeta({
    title: 'In an Emergency — Overdose Response Guide | Naloxone Advocates Plymouth',
    description: 'Step-by-step overdose response instructions for Plymouth and Devon. Learn how to recognise an opioid overdose, call 999, and administer naloxone to save a life.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/emergency`,
    ogTitle: 'In an Emergency — Overdose Response | Naloxone Advocates Plymouth',
    ogDescription: 'Clear, step-by-step guide to responding to an opioid overdose. Call 999 first, then administer naloxone. Free training available in Plymouth and Devon.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/emergency#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/emergency`,
          "name": "In an Emergency — Overdose Response Guide | Naloxone Advocates Plymouth",
          "description": "Step-by-step overdose response instructions. Learn how to recognise an opioid overdose, call 999, and administer naloxone to save a life.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "In an Emergency", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/emergency` }
            ]
          }
        },
        {
          "@type": "HowTo",
          "name": "How to Respond to an Opioid Overdose",
          "description": "Step-by-step guide to responding to an opioid overdose emergency using naloxone.",
          "totalTime": "PT5M",
          "step": [
            { "@type": "HowToStep", "position": 1, "name": "Stay Safe", "text": "Check the area is safe for you to approach. Look for any hazards. If unsafe, call 999 immediately and wait for emergency services." },
            { "@type": "HowToStep", "position": 2, "name": "Call 999", "text": "Call 999 immediately. Tell them someone is unresponsive and you think they may have overdosed. Give your exact location and stay on the line." },
            { "@type": "HowToStep", "position": 3, "name": "Check for Response", "text": "Shout their name and tap their shoulders firmly. Look for signs of overdose: slow or stopped breathing, blue lips, gurgling sounds, unresponsive." },
            { "@type": "HowToStep", "position": 4, "name": "Start CPR if Not Breathing", "text": "If the person is not breathing, begin CPR immediately. 30 chest compressions followed by 2 rescue breaths. Continue until paramedics arrive." },
            { "@type": "HowToStep", "position": 5, "name": "Give Naloxone", "text": "Insert the nozzle into one nostril and press the plunger firmly. If no response after 2-3 minutes, give a second dose in the other nostril." },
            { "@type": "HowToStep", "position": 6, "name": "Recovery Position", "text": "If they are breathing, place them in the recovery position on their side. Tilt their head back to keep the airway open." },
            { "@type": "HowToStep", "position": 7, "name": "Stay and Monitor", "text": "Stay with the person until the ambulance arrives. Naloxone wears off in 30-90 minutes — the overdose can return. Never leave them alone." }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-emergency';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-emergency')?.remove(); };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Emergency Banner */}
      {bannerVisible && (
        <div className="bg-red-600 text-white sticky top-0 z-[60] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 justify-center flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <i className="ri-alarm-warning-fill text-yellow-300 text-lg animate-pulse"></i>
                <span className="font-black text-sm tracking-wide uppercase whitespace-nowrap">Emergency?</span>
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">If someone is overdosing —</span>
              <a
                href="tel:999"
                className="bg-white text-red-600 font-black text-lg px-5 py-1 rounded-full hover:bg-yellow-300 hover:text-red-700 transition-all shadow-md whitespace-nowrap flex items-center gap-2 cursor-pointer"
              >
                <i className="ri-phone-fill"></i> Call 999 Now
              </a>
              <span className="text-white/80 text-sm whitespace-nowrap hidden sm:inline">
                Then administer naloxone while waiting for help
              </span>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <i className="ri-close-line text-white text-base"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`bg-yellow-400 sticky z-50 shadow-md ${bannerVisible ? 'top-[42px]' : 'top-0'}`}>
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
                <i className="ri-alarm-warning-fill"></i> In an Emergency
              </Link>
              <Link to="/resources" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Resources</Link>
              <Link to="/contact" className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap">Contact</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/members/login" className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2">
                <i className="ri-user-fill"></i> Members
              </Link>
              <Link to="/get-naloxone" className="bg-gray-900 text-yellow-400 px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap">
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
              <Link to="/emergency" className="block text-red-600 font-bold hover:text-red-700 transition-colors">In an Emergency</Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Resources</Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">Contact</Link>
              <Link to="/members/login" className="block text-gray-900 font-bold hover:text-pink-500 transition-colors">Members Area</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero — Full-width urgent red */}
      <section className="bg-red-600 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full font-bold text-sm mb-6">
            <i className="ri-alarm-warning-fill animate-pulse"></i>
            Life-Saving Information
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            In an Emergency
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-semibold mb-10 max-w-3xl mx-auto leading-relaxed">
            If you think someone is overdosing, every second counts. Follow these steps — you could save their life.
          </p>

          {/* Giant 999 CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <a
              href="tel:999"
              className="bg-white text-red-600 px-12 py-6 rounded-full font-black text-3xl hover:bg-yellow-300 hover:text-red-700 transition-all shadow-2xl whitespace-nowrap flex items-center gap-3 cursor-pointer animate-pulse"
            >
              <i className="ri-phone-fill"></i> Call 999 Now
            </a>
          </div>
          <p className="text-white/80 text-base font-semibold">
            <i className="ri-information-line mr-1"></i>
            You will NOT get in trouble for calling 999. Emergency services are there to save lives.
          </p>
        </div>
      </section>

      {/* Quick Signs Strip */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-yellow-400 font-black text-center text-sm uppercase tracking-widest mb-6">
            Signs of an Opioid Overdose — Act Immediately if You See These
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {signs.map((sign) => (
              <div key={sign.label} className="bg-gray-800 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <i className={`${sign.icon} ${sign.color} text-2xl`}></i>
                </div>
                <p className="text-white text-xs font-semibold leading-tight">{sign.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-bold mb-5">
              Step-by-Step Guide
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What to Do in an Overdose Emergency
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow these steps in order. Stay calm — you can do this.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`bg-white rounded-3xl shadow-lg border-l-8 ${step.borderColor} overflow-hidden`}
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Step number */}
                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-white font-black text-2xl">{step.number}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-gray-900">{step.title}</h3>
                        <span className={`text-sm font-bold ${step.textColor} bg-opacity-10 ${step.lightColor} px-3 py-1 rounded-full`}>
                          {step.subtitle}
                        </span>
                      </div>

                      <ul className="space-y-3 mt-4">
                        {step.instructions.map((instruction, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className={`w-6 h-6 ${step.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <i className="ri-check-line text-white text-xs"></i>
                            </div>
                            <span className="text-gray-700 leading-relaxed">{instruction}</span>
                          </li>
                        ))}
                      </ul>

                      {step.warning && (
                        <div className="mt-5 bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-alert-fill text-yellow-600 text-lg"></i>
                          </div>
                          <p className="text-yellow-800 font-semibold text-sm leading-relaxed">{step.warning}</p>
                        </div>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 ${step.lightColor} rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex`}>
                      <i className={`${step.icon} ${step.textColor} text-2xl`}></i>
                    </div>
                  </div>
                </div>

                {/* Connector arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center pb-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-arrow-down-line text-gray-300 text-2xl"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prominent 999 reminder mid-page */}
      <section className="bg-red-600 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="ri-alarm-warning-fill text-yellow-300 text-6xl mb-4 block animate-pulse"></i>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Always Call 999 First
          </h2>
          <p className="text-white/90 text-xl font-semibold mb-8 max-w-2xl mx-auto">
            Naloxone buys time — but paramedics save lives. Never skip calling 999, even if you have naloxone.
          </p>
          <a
            href="tel:999"
            className="inline-flex items-center gap-3 bg-white text-red-600 px-14 py-6 rounded-full font-black text-3xl hover:bg-yellow-300 hover:text-red-700 transition-all shadow-2xl cursor-pointer"
          >
            <i className="ri-phone-fill"></i> 999
          </a>
        </div>
      </section>

      {/* Naloxone How-To Visual */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-5">
              How to Use Naloxone
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Administering Naloxone Nasal Spray
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Naloxone nasal spray (Nyxoid / Prenoxad) is simple to use — no needles, no medical training required.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: '1',
                title: 'Lay Them Down',
                desc: 'Place the person on their back on a flat surface. Tilt their head back to open the airway.',
                icon: 'ri-user-fill',
                color: 'bg-red-600',
              },
              {
                step: '2',
                title: 'Prepare the Spray',
                desc: 'Remove the naloxone nasal spray from its packaging. Hold it with your thumb on the bottom and two fingers on the nozzle.',
                icon: 'ri-medicine-bottle-fill',
                color: 'bg-yellow-500',
              },
              {
                step: '3',
                title: 'Spray into Nostril',
                desc: 'Insert the nozzle into one nostril. Press the plunger firmly with your thumb to release the full dose.',
                icon: 'ri-drop-fill',
                color: 'bg-yellow-500',
              },
              {
                step: '4',
                title: 'Wait & Repeat',
                desc: 'Wait 2–3 minutes for a response. If no response, give a second dose in the other nostril. Repeat up to 3 times.',
                icon: 'ri-time-fill',
                color: 'bg-lime-500',
              },
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 rounded-3xl p-7 text-center shadow-md hover:shadow-lg transition-all">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <i className={`${item.icon} text-white text-3xl`}></i>
                </div>
                <div className="text-4xl font-black text-gray-200 mb-2">{item.step}</div>
                <h3 className="text-lg font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Key facts row */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-time-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-1">Works in 2–5 Minutes</h4>
                <p className="text-gray-600 text-sm">Naloxone starts reversing an opioid overdose within minutes of administration.</p>
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-alarm-warning-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-1">Wears Off in 30–90 Min</h4>
                <p className="text-gray-600 text-sm">The person can go back into overdose. Never leave them alone — wait for paramedics.</p>
              </div>
            </div>
            <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-1">Safe to Use</h4>
                <p className="text-gray-600 text-sm">Naloxone is safe. If no opioids are present, it has no effect. You cannot overdose on naloxone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Injectable Naloxone Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-bold mb-5">
              Injectable Naloxone
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How to Use Injectable Naloxone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Injectable naloxone (Prenoxad pre-filled syringe) is also widely distributed. Here's how to use it safely and quickly.
            </p>
          </div>

          {/* Comparison banner */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 mb-12 flex items-start gap-4 max-w-3xl mx-auto">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-information-fill text-gray-900 text-lg"></i>
            </div>
            <div>
              <p className="font-black text-gray-900 mb-1">Nasal Spray vs Injectable — Which do I have?</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong>Nasal spray (Nyxoid/Prenoxad spray)</strong> — a white plastic device you press into the nostril. No needles needed.<br />
                <strong>Injectable (Prenoxad syringe / vial + syringe kit)</strong> — a pre-filled syringe or a glass vial with a separate syringe. Injected into muscle. Both are equally effective.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: '1',
                title: 'Prepare the Syringe',
                desc: 'If using a pre-filled syringe, remove the cap. If using a vial, draw up 1ml of naloxone solution into the syringe. Remove any air bubbles by tapping and pushing the plunger gently.',
                icon: 'ri-medicine-bottle-fill',
                color: 'bg-red-600',
              },
              {
                step: '2',
                title: 'Choose the Injection Site',
                desc: 'The outer thigh (through clothing if needed) or the upper outer arm muscle are the best sites. Avoid veins — this must go into muscle (intramuscular), not a vein.',
                icon: 'ri-body-scan-fill',
                color: 'bg-red-600',
              },
              {
                step: '3',
                title: 'Inject the Naloxone',
                desc: 'Insert the needle at a 90° angle firmly into the muscle. Push the plunger all the way down to deliver the full dose. Withdraw the needle and apply light pressure.',
                icon: 'ri-drop-fill',
                color: 'bg-yellow-500',
              },
              {
                step: '4',
                title: 'Wait & Repeat if Needed',
                desc: 'Wait 2–3 minutes for a response. If there is no improvement, inject a second dose into a different site. You can give up to 3 doses. Keep giving CPR if they are not breathing.',
                icon: 'ri-time-fill',
                color: 'bg-lime-500',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-7 text-center shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <i className={`${item.icon} text-white text-3xl`}></i>
                </div>
                <div className="text-4xl font-black text-gray-200 mb-2">{item.step}</div>
                <h3 className="text-lg font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Injectable key notes */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-alert-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">Muscle Only — Not a Vein</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Injectable naloxone must be given into a muscle (intramuscular), NOT into a vein. The outer thigh or upper arm are the safest and easiest sites. You can inject through thin clothing in an emergency.
                </p>
              </div>
            </div>
            <div className="bg-lime-50 border-2 border-lime-300 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">Continue CPR Alongside</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If the person is not breathing, do not stop CPR to give naloxone — do both. One person can give CPR while another administers the injection. Naloxone and CPR together give the best chance of survival.
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-recycle-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">Safe Disposal of Needles</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  After use, do not re-cap the needle. Place the used syringe in a sharps bin if available. If not, keep it safe and hand it to paramedics when they arrive. Never leave needles on the ground.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-information-fill text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">Tell the Paramedics</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  When paramedics arrive, tell them: how many doses you gave, which type (nasal or injectable), and the time of each dose. This helps them provide the right follow-up treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Myths & Facts */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-5">
              Myths vs Facts
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Don't Believe These Myths
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Dangerous myths can cost lives. Know the facts.
            </p>
          </div>

          <div className="space-y-4">
            {myths.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setExpandedMyth(expandedMyth === index ? null : index)}
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-close-circle-fill text-red-400 text-xl"></i>
                    </div>
                    <p className="text-white font-bold text-lg">{item.myth}</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <i className={`ri-arrow-${expandedMyth === index ? 'up' : 'down'}-s-line text-gray-400 text-xl`}></i>
                  </div>
                </div>
                {expandedMyth === index && (
                  <div className="px-6 pb-6">
                    <div className="flex items-start gap-4 bg-lime-900/30 border border-lime-500/30 rounded-xl p-5">
                      <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-check-line text-white text-base"></i>
                      </div>
                      <div>
                        <p className="text-lime-400 font-bold text-sm uppercase tracking-wide mb-1">The Fact</p>
                        <p className="text-gray-200 leading-relaxed">{item.fact}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Trained CTA */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-lime-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-white/70 text-gray-900 px-5 py-2 rounded-full font-bold text-sm mb-5">
                Be Prepared
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
                Get Trained.<br />Carry Naloxone.<br />Save a Life.
              </h2>
              <p className="text-gray-800 text-lg leading-relaxed mb-8">
                Our free training sessions take just 1–2 hours and give you the skills and confidence to respond to an overdose. You'll leave with a free naloxone kit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/training"
                  className="bg-gray-900 text-yellow-400 px-8 py-4 rounded-full font-black text-lg hover:bg-gray-800 transition-all shadow-xl whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-graduation-cap-fill"></i> Book Free Training
                </Link>
                <Link
                  to="/get-naloxone"
                  className="bg-pink-500 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-pink-600 transition-all shadow-xl whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-medicine-bottle-fill"></i> Get a Naloxone Kit
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <i className="ri-phone-fill text-red-600 text-2xl"></i>
                Emergency Contacts
              </h3>
              <div className="space-y-4">
                <a
                  href="tel:999"
                  className="flex items-center justify-between bg-red-600 text-white rounded-2xl px-6 py-4 hover:bg-red-700 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-black text-xl">999</p>
                    <p className="text-red-200 text-sm">Emergency Services</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <i className="ri-phone-fill text-white text-xl"></i>
                  </div>
                </a>
                <a
                  href="tel:111"
                  className="flex items-center justify-between bg-yellow-400 text-gray-900 rounded-2xl px-6 py-4 hover:bg-yellow-500 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-black text-xl">111</p>
                    <p className="text-gray-700 text-sm">NHS Non-Emergency</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-900/10 rounded-full flex items-center justify-center group-hover:bg-gray-900/20 transition-colors">
                    <i className="ri-phone-fill text-gray-900 text-xl"></i>
                  </div>
                </a>
                <a
                  href="tel:07561349137"
                  className="flex items-center justify-between bg-gray-100 text-gray-900 rounded-2xl px-6 py-4 hover:bg-gray-200 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-black text-base">07561 349 137</p>
                    <p className="text-gray-500 text-sm">Naloxone Advocates Plymouth</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                    <i className="ri-phone-fill text-gray-700 text-xl"></i>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Download & Share</h2>
          <p className="text-gray-600 mb-10">Print these guides and keep them where they're needed most</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Overdose Response Poster', desc: 'A4 poster for community spaces, hostels, and services', icon: 'ri-file-text-fill', color: 'bg-red-600' },
              { title: 'Naloxone Quick Guide', desc: 'Pocket-sized step-by-step naloxone administration card', icon: 'ri-first-aid-kit-fill', color: 'bg-yellow-500' },
              { title: 'Signs of Overdose Card', desc: 'Wallet card listing overdose signs and emergency numbers', icon: 'ri-heart-pulse-fill', color: 'bg-lime-500' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <i className={`${item.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{item.desc}</p>
                <Link to="/resources" className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:text-red-700 transition-colors">
                  <i className="ri-download-line"></i> View Resources
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="mb-4">
                <img
                  src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                  alt="Naloxone Advocates Plymouth"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">A grassroots, peer-led harm reduction organisation dedicated to saving lives through naloxone training and community support.</p>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training & P2P</Link></li>
                <li><Link to="/get-naloxone" className="text-gray-400 hover:text-white transition-colors">Get Naloxone</Link></li>
                <li><Link to="/emergency" className="text-red-400 hover:text-red-300 font-bold transition-colors">In an Emergency</Link></li>
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li>
                  <a href="https://www.justgiving.com/naloxoneadvocatesplymouth" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Donate</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Get Help Now</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="font-black text-white text-xl">Emergency: 999</p>
                <p>NHS Non-Emergency: 111</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
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
