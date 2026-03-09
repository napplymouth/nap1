import { useState, useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';
import SiteNav from '../../components/feature/SiteNav';

export default function ResourcesPage() {
  usePageMeta({
    title: 'Harm Reduction Resources Plymouth | Free Downloads & Support Links',
    description: 'Free harm reduction resources for Plymouth and Devon. Download overdose response guides, naloxone administration guides, and access local support services including FRANK, NHS 111 and more.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources`,
    ogTitle: 'Free Harm Reduction Resources — Naloxone Advocates Plymouth',
    ogDescription: 'Download free overdose response guides, naloxone administration guides and access local support services across Plymouth and Devon.',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openDrug, setOpenDrug] = useState<number | null>(null);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources`,
          "name": "Harm Reduction Resources Plymouth | Free Downloads & Support Links",
          "description": "Free harm reduction resources for Plymouth and Devon. Download overdose response guides, naloxone administration guides, and access local support services.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Resources", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources` }
            ]
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Are these resources available to download at no cost?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes, all downloadable resources on this page are completely at no cost. We encourage you to download, print, and share them with your community, family, or organization." }
            },
            {
              "@type": "Question",
              "name": "Can I share these materials with others?",
              "acceptedAnswer": { "@type": "Answer", "text": "Absolutely! These resources are designed to be shared widely. You can print them for community centres, schools, support groups, or anywhere they might help save lives." }
            },
            {
              "@type": "Question",
              "name": "What should I do in an emergency?",
              "acceptedAnswer": { "@type": "Answer", "text": "Always call 999 first in any emergency. While naloxone can reverse an opioid overdose, professional medical help is essential. Administer naloxone if available, then stay with the person until help arrives." }
            },
            {
              "@type": "Question",
              "name": "How can I get involved in harm reduction work?",
              "acceptedAnswer": { "@type": "Answer", "text": "Visit our Volunteer page to learn about opportunities with Naloxone Advocates Plymouth. We welcome people from all backgrounds who want to help reduce drug-related harm in our community." }
            }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-resources';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-resources')?.remove(); };
  }, []);

  const downloadableResources = [
    {
      title: 'Overdose Response Guide',
      description: 'Step-by-step instructions for recognizing and responding to an opioid overdose',
      icon: 'ri-file-text-line',
      color: 'bg-red-500',
      href: '/emergency',
      label: 'View Full Guide'
    },
    {
      title: 'Naloxone Administration Guide',
      description: 'Complete UK instructions for administering naloxone nasal spray and injectable',
      icon: 'ri-medicine-bottle-line',
      color: 'bg-blue-500',
      href: '/emergency#naloxone',
      label: 'View Instructions'
    },
    {
      title: 'Harm Reduction Poster',
      description: 'Educational poster for community spaces and support centers',
      icon: 'ri-image-line',
      color: 'bg-green-500',
      href: '/resources/harm-reduction-poster',
      label: 'View Resource'
    },
    {
      title: 'Family Support Guide',
      description: 'Resources and guidance for families affected by substance use',
      icon: 'ri-heart-line',
      color: 'bg-purple-500',
      href: '/resources/family-support-guide',
      label: 'View Support Guide'
    }
  ];

  const supportLinks = [
    {
      name: 'FRANK',
      description: 'Honest information about drugs',
      phone: '0300 123 6600',
      website: 'https://www.talktofrank.com',
      hours: '24/7'
    },
    {
      name: 'Change Grow Live Plymouth',
      description: 'Local substance misuse support service',
      phone: '01752 434343',
      website: 'https://www.changegrowlive.org',
      hours: 'Mon-Fri 9am-5pm'
    },
    {
      name: 'NHS 111',
      description: 'Non-emergency medical advice',
      phone: '111',
      website: 'https://www.nhs.uk',
      hours: '24/7'
    },
    {
      name: 'Turning Point',
      description: 'Health and social care services',
      phone: '01752 434988',
      website: 'https://www.turning-point.co.uk',
      hours: 'Mon-Fri 9am-5pm'
    },
    {
      name: 'Plymouth Drug & Alcohol Action Team',
      description: 'Local coordination and support',
      phone: '01752 668000',
      website: 'https://www.plymouth.gov.uk',
      hours: 'Mon-Fri 9am-5pm'
    },
    {
      name: 'Samaritans',
      description: 'Emotional support for anyone in distress',
      phone: '116 123',
      website: 'https://www.samaritans.org',
      hours: '24/7'
    }
  ];

  const videos = [
    {
      title: 'How to Use Naloxone Nasal Spray',
      duration: '3:45',
      thumbnail: 'https://readdy.ai/api/search-image?query=medical%20professional%20demonstrating%20nasal%20spray%20administration%20technique%20in%20clean%20clinical%20setting%20with%20simple%20white%20background%20educational%20healthcare%20training%20video%20thumbnail%20style%20professional%20lighting%20clear%20instructional%20demonstration&width=400&height=225&seq=vid1&orientation=landscape'
    },
    {
      title: 'Recognizing Opioid Overdose Signs',
      duration: '4:20',
      thumbnail: 'https://readdy.ai/api/search-image?query=healthcare%20education%20illustration%20showing%20medical%20awareness%20symptoms%20recognition%20with%20simple%20clean%20background%20professional%20training%20material%20style%20clear%20informative%20visual%20aid%20medical%20illustration&width=400&height=225&seq=vid2&orientation=landscape'
    },
    {
      title: 'Recovery Position Technique',
      duration: '2:30',
      thumbnail: 'https://readdy.ai/api/search-image?query=first%20aid%20training%20demonstration%20recovery%20position%20technique%20on%20clean%20white%20background%20professional%20medical%20education%20style%20clear%20instructional%20photography%20healthcare%20training%20material&width=400&height=225&seq=vid3&orientation=landscape'
    },
    {
      title: 'Harm Reduction Basics',
      duration: '5:15',
      thumbnail: 'https://readdy.ai/api/search-image?query=community%20health%20education%20presentation%20style%20with%20simple%20clean%20background%20professional%20public%20health%20training%20material%20informative%20healthcare%20awareness%20illustration%20modern%20educational%20design&width=400&height=225&seq=vid4&orientation=landscape'
    }
  ];

  const faqs = [
    {
      question: 'Are these resources available to download at no cost?',
      answer: 'Yes, all downloadable resources on this page are completely at no cost. We encourage you to download, print, and share them with your community, family, or organisation.'
    },
    {
      question: 'Can I share these materials with others?',
      answer: 'Absolutely! These resources are designed to be shared widely. You can print them for community centres, schools, support groups, or anywhere they might help save lives.'
    },
    {
      question: 'What should I do in an emergency?',
      answer: 'Always call 999 first in any emergency. While naloxone can reverse an opioid overdose, professional medical help is essential. Administer naloxone if available, then stay with the person until help arrives.'
    },
    {
      question: 'How can I get involved in harm reduction work?',
      answer: 'Visit our Volunteer page to learn about opportunities with Naloxone Advocates Plymouth. We welcome people from all backgrounds who want to help reduce drug-related harm in our community.'
    }
  ];

  const drugCategories = [
    {
      name: 'Opioids',
      icon: 'ri-capsule-line',
      color: 'bg-red-500',
      borderColor: 'border-red-500',
      tagColor: 'bg-red-100 text-red-700',
      risk: 'Very High',
      examples: 'Heroin, Morphine, Codeine, Fentanyl, Methadone, Oxycodone',
      description: 'Opioids are powerful pain-relieving drugs that act on opioid receptors in the brain and body. They produce feelings of euphoria and pain relief but carry an extremely high risk of overdose and dependence.',
      effects: ['Intense pain relief and euphoria', 'Drowsiness and sedation', 'Slowed breathing', 'Nausea and vomiting', 'Constipation', 'Pinpoint pupils'],
      overdoseSigns: ['Unresponsive or unconscious', 'Slow, shallow or stopped breathing', 'Blue or grey lips and fingertips', 'Gurgling or snoring sounds', 'Limp body', 'Pinpoint pupils'],
      harmReduction: ['Never use alone — have someone with you', 'Carry naloxone at all times', 'Start with a small test dose', 'Avoid mixing with alcohol or benzodiazepines', 'Use clean equipment', 'Know where to get naloxone locally'],
      naloxoneWorks: true,
    },
    {
      name: 'Stimulants',
      icon: 'ri-flashlight-line',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500',
      tagColor: 'bg-orange-100 text-orange-700',
      risk: 'High',
      examples: 'Cocaine, Crack Cocaine, Amphetamine, Methamphetamine, MDMA (Ecstasy)',
      description: 'Stimulants speed up the central nervous system, increasing heart rate, blood pressure and alertness. They can cause intense euphoria followed by a crash, and carry serious cardiovascular risks.',
      effects: ['Increased energy and alertness', 'Elevated heart rate and blood pressure', 'Reduced appetite', 'Euphoria and confidence', 'Increased body temperature', 'Insomnia'],
      overdoseSigns: ['Chest pain or heart palpitations', 'Seizures', 'Extremely high body temperature', 'Confusion or paranoia', 'Stroke symptoms', 'Irregular heartbeat'],
      harmReduction: ['Stay hydrated — sip water regularly', 'Take regular breaks if dancing', 'Avoid mixing with other substances', 'Test your substances with a drug testing kit', 'Know the signs of overheating', 'Do not use if you have heart conditions'],
      naloxoneWorks: false,
    },
    {
      name: 'Depressants (CNS)',
      icon: 'ri-zzz-line',
      color: 'bg-indigo-500',
      borderColor: 'border-indigo-500',
      tagColor: 'bg-indigo-100 text-indigo-700',
      risk: 'High',
      examples: 'Alcohol, Benzodiazepines (Valium, Xanax), GHB/GBL, Ketamine',
      description: 'Central nervous system depressants slow down brain activity and bodily functions. They are often prescribed medically but carry high risks of dependence, overdose — especially when combined with other depressants.',
      effects: ['Relaxation and reduced anxiety', 'Slowed breathing and heart rate', 'Impaired coordination and judgement', 'Memory loss (blackouts)', 'Sedation and drowsiness', 'Lowered inhibitions'],
      overdoseSigns: ['Unconsciousness or unresponsive', 'Very slow or stopped breathing', 'Choking or vomiting', 'Blue lips or fingertips', 'Limp body', 'Cannot be woken up'],
      harmReduction: ['Never mix depressants together — risk multiplies', 'Never use GHB/GBL alone', 'Measure GHB/GBL doses carefully — small differences are dangerous', 'Do not drink alcohol alongside', 'Have a sober person present', 'Place in recovery position if unconscious'],
      naloxoneWorks: false,
    },
    {
      name: 'Cannabis',
      icon: 'ri-leaf-line',
      color: 'bg-green-600',
      borderColor: 'border-green-600',
      tagColor: 'bg-green-100 text-green-700',
      risk: 'Moderate',
      examples: 'Weed, Skunk, Hash, Resin, Edibles, CBD, Synthetic Cannabis (Spice)',
      description: 'Cannabis is the most widely used illegal drug in the UK. While generally considered lower risk than many substances, high-potency strains and synthetic cannabis (Spice) carry significant mental health risks.',
      effects: ['Relaxation and euphoria', 'Altered perception of time', 'Increased appetite', 'Impaired short-term memory', 'Anxiety or paranoia (especially high-THC strains)', 'Red eyes and dry mouth'],
      overdoseSigns: ['Severe anxiety or panic attack', 'Paranoia and psychosis', 'Rapid heart rate', 'Nausea and vomiting', 'Confusion and disorientation', 'Extreme sedation (Spice)'],
      harmReduction: ['Choose lower-potency strains where possible', 'Avoid synthetic cannabis (Spice) — extremely unpredictable', 'Do not mix with tobacco', 'Avoid if you have a family history of psychosis', 'Do not drive after use', 'Edibles take longer to kick in — wait before re-dosing'],
      naloxoneWorks: false,
    },
    {
      name: 'Psychedelics',
      icon: 'ri-eye-line',
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      tagColor: 'bg-purple-100 text-purple-700',
      risk: 'Moderate',
      examples: 'LSD (Acid), Magic Mushrooms (Psilocybin), DMT, Mescaline, 2C-B',
      description: 'Psychedelics alter perception, mood and thought by affecting serotonin receptors. While rarely physically toxic, they can cause intense psychological distress and dangerous behaviour during a "bad trip".',
      effects: ['Visual and auditory hallucinations', 'Altered sense of time and self', 'Intense emotional experiences', 'Increased heart rate', 'Nausea', 'Profound spiritual or philosophical experiences'],
      overdoseSigns: ['Extreme panic or terror', 'Complete loss of reality (psychosis)', 'Dangerous or erratic behaviour', 'Severe confusion', 'Prolonged or worsening symptoms', 'Seizures (rare)'],
      harmReduction: ['Have a trusted sober "trip sitter" present', 'Use in a safe, familiar environment', 'Avoid if you have a personal or family history of psychosis', 'Do not mix with lithium or antidepressants', 'Start with a low dose', 'Do not drive or operate machinery'],
      naloxoneWorks: false,
    },
    {
      name: 'Dissociatives',
      icon: 'ri-bubble-chart-line',
      color: 'bg-teal-500',
      borderColor: 'border-teal-500',
      tagColor: 'bg-teal-100 text-teal-700',
      risk: 'High',
      examples: 'Ketamine, Nitrous Oxide (Laughing Gas), PCP, DXM',
      description: 'Dissociatives cause feelings of detachment from reality, the body and surroundings. Ketamine in particular has become increasingly common in the UK and carries serious risks of bladder and kidney damage with regular use.',
      effects: ['Detachment from body and surroundings', 'Distorted perception of time and space', 'Hallucinations', 'Numbness and pain relief', 'Confusion and disorientation', 'Euphoria at lower doses'],
      overdoseSigns: ['Complete dissociation ("K-hole")', 'Unconsciousness', 'Inability to move or speak', 'Vomiting while sedated (aspiration risk)', 'Respiratory depression', 'Seizures'],
      harmReduction: ['Never use ketamine alone', 'Sit or lie down before using — you may lose coordination', 'Avoid mixing with alcohol or other depressants', 'Limit frequency of use to protect bladder health', 'Nitrous oxide: use in a seated position, never from a bag over the head', 'Seek help if you notice urinary pain or blood in urine'],
      naloxoneWorks: false,
    },
    {
      name: 'Novel Psychoactive Substances (NPS)',
      icon: 'ri-test-tube-line',
      color: 'bg-gray-700',
      borderColor: 'border-gray-700',
      tagColor: 'bg-gray-100 text-gray-700',
      risk: 'Very High',
      examples: 'Spice / Mamba (Synthetic Cannabis), Bath Salts, Flakka, Novel Benzodiazepines',
      description: 'NPS (formerly called "legal highs") are synthetic substances designed to mimic the effects of other drugs. They are extremely unpredictable, often far more potent than the drugs they imitate, and can be life-threatening.',
      effects: ['Highly variable and unpredictable', 'Can mimic stimulants, depressants or psychedelics', 'Intense sedation (synthetic cannabis)', 'Extreme agitation or aggression', 'Hallucinations', 'Seizures'],
      overdoseSigns: ['Sudden collapse or unconsciousness', 'Seizures', 'Extreme aggression or psychosis', 'Stopped breathing', 'Severe overheating', 'Unresponsive to stimulation'],
      harmReduction: ['Avoid NPS entirely where possible — effects are completely unpredictable', 'Never use alone', 'Start with an extremely small amount if used', 'Do not mix with any other substance', 'Call 999 immediately if someone collapses', 'Tell paramedics exactly what was taken'],
      naloxoneWorks: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Harm Reduction Resources</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Free educational materials, support links, and life-saving information for our community
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <i className="ri-alarm-warning-line text-3xl"></i>
            <p className="text-lg font-semibold">EMERGENCY? Always call 999 first • Then administer naloxone if available</p>
          </div>
        </div>
      </div>

      {/* Crisis Helplines */}
      <section className="py-12 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-red-500">
              <i className="ri-phone-line text-4xl text-red-500 mb-3"></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency</h3>
              <p className="text-3xl font-bold text-red-600 mb-1">999</p>
              <p className="text-sm text-gray-600">Life-threatening situations</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-blue-500">
              <i className="ri-hospital-line text-4xl text-blue-500 mb-3"></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">NHS 111</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">111</p>
              <p className="text-sm text-gray-600">Non-emergency medical advice</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-green-500">
              <i className="ri-chat-heart-line text-4xl text-green-500 mb-3"></i>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Samaritans</h3>
              <p className="text-3xl font-bold text-green-600 mb-1">116 123</p>
              <p className="text-sm text-gray-600">Emotional support 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Downloadable Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Educational materials you can download, print, and share at no cost
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {downloadableResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden cursor-pointer">
                <div className={`${resource.color} h-32 flex items-center justify-center`}>
                  <i className={`${resource.icon} text-6xl text-white`}></i>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>
                  <a
                    href={resource.href}
                    target={resource.href.startsWith('/emergency') ? '_blank' : '_self'}
                    rel={resource.href.startsWith('/emergency') ? 'noopener noreferrer' : undefined}
                    className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium whitespace-nowrap flex items-center justify-center space-x-2"
                  >
                    <i className="ri-download-line"></i>
                    <span>{resource.label}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drug Categories Section */}
      <section id="drug-categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wide">Know Your Substances</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The 7 Drug Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding different drug types helps reduce harm. Click any category to learn about effects, overdose signs, and harm reduction tips.
            </p>
          </div>

          {/* Category Quick Nav */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {drugCategories.map((drug, index) => (
              <button
                key={index}
                onClick={() => setOpenDrug(openDrug === index ? null : index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  openDrug === index
                    ? `${drug.color} border-transparent text-white shadow-md`
                    : `bg-white ${drug.borderColor} text-gray-700 hover:shadow-md`
                }`}
              >
                <i className={`${drug.icon}`}></i>
                <span>{drug.name}</span>
              </button>
            ))}
          </div>

          {/* Drug Cards */}
          <div className="space-y-4">
            {drugCategories.map((drug, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-md border-l-4 ${drug.borderColor} overflow-hidden transition-all`}>
                {/* Card Header */}
                <button
                  onClick={() => setOpenDrug(openDrug === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${drug.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${drug.icon} text-2xl text-white`}></i>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{drug.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{drug.examples}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Risk Level:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${drug.tagColor}`}>{drug.risk}</span>
                    </div>
                    {drug.naloxoneWorks && (
                      <span className="hidden sm:inline-flex items-center space-x-1 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                        <i className="ri-medicine-bottle-line"></i>
                        <span>Naloxone Reverses</span>
                      </span>
                    )}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className={`ri-arrow-${openDrug === index ? 'up' : 'down'}-s-line text-2xl text-gray-400`}></i>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {openDrug === index && (
                  <div className="px-6 pb-8 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed mt-6 mb-8 text-base">{drug.description}</p>

                    {drug.naloxoneWorks && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start space-x-3">
                        <i className="ri-medicine-bottle-line text-2xl text-red-600 flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-bold text-red-800">Naloxone can reverse an opioid overdose</p>
                          <p className="text-red-700 text-sm mt-1">Always call 999 first, then administer naloxone if available. <a href="/get-naloxone" className="underline font-semibold hover:text-red-900">Get a free naloxone kit →</a></p>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Effects */}
                      <div className="bg-gray-50 rounded-lg p-5">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className="ri-pulse-line text-gray-700"></i>
                          </div>
                          <span>Common Effects</span>
                        </h4>
                        <ul className="space-y-2">
                          {drug.effects.map((effect, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <i className="ri-checkbox-blank-circle-fill text-gray-400 text-xs"></i>
                              </div>
                              <span>{effect}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Overdose Signs */}
                      <div className="bg-red-50 rounded-lg p-5">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className="ri-alarm-warning-line text-red-600"></i>
                          </div>
                          <span>Overdose / Crisis Signs</span>
                        </h4>
                        <ul className="space-y-2">
                          {drug.overdoseSigns.map((sign, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <i className="ri-error-warning-fill text-red-500 text-xs"></i>
                              </div>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Harm Reduction */}
                      <div className="bg-green-50 rounded-lg p-5">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <i className="ri-shield-check-line text-green-600"></i>
                          </div>
                          <span>Harm Reduction Tips</span>
                        </h4>
                        <ul className="space-y-2">
                          {drug.harmReduction.map((tip, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <i className="ri-check-line text-green-600 text-xs font-bold"></i>
                              </div>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                      <a href="/emergency" className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer">
                        <i className="ri-first-aid-kit-line"></i>
                        <span>Emergency Response Guide</span>
                      </a>
                      <a href="https://www.talktofrank.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer">
                        <i className="ri-external-link-line"></i>
                        <span>More Info on FRANK</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-center">
            <i className="ri-information-line text-3xl text-yellow-600 mb-3"></i>
            <p className="text-gray-800 font-semibold text-lg mb-1">This information is for harm reduction purposes only</p>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">We do not condone illegal drug use. This information is provided to help keep people safer. If you or someone you know needs support, please contact one of our support services below.</p>
          </div>
        </div>
      </section>

      {/* Support Links */}
      <section id="support-services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Support Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local and national organizations providing help and support
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportLinks.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-phone-line text-blue-600"></i>
                    <strong className="font-semibold">{service.phone}</strong>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <i className="ri-time-line text-blue-600"></i>
                    <span>{service.hours}</span>
                  </div>
                </div>
                <a 
                  href={service.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors whitespace-nowrap"
                >
                  <span>Visit Website</span>
                  <i className="ri-external-link-line"></i>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Useful Videos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Useful Videos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visual guides and training materials
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videos.map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <i className="ri-play-fill text-3xl text-blue-600"></i>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Common questions about our resources</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <strong className="text-lg text-gray-900 pr-4">{faq.question}</strong>
                  <i className={`ri-arrow-${openFaq === index ? 'up' : 'down'}-s-line text-2xl text-blue-600 flex-shrink-0`}></i>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Naloxone Advocates Plymouth</h3>
              <p className="text-blue-200 text-sm">
                Saving lives through education, training, and community support.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Home</a></li>
                <li><a href="/about" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">About Us</a></li>
                <li><a href="/training" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Training</a></li>
                <li><a href="/get-naloxone" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Get Naloxone</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/volunteer" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Volunteer</a></li>
                <li><a href="/resources" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Resources</a></li>
                <li><a href="/contact" className="text-blue-200 hover:text-white transition-colors whitespace-nowrap">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li className="flex items-start space-x-2">
                  <i className="ri-mail-line mt-1"></i>
                  <span>napplymouth66@gmail.com</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-phone-line mt-1"></i>
                  <span>07561 349 137</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-map-pin-line mt-1"></i>
                  <span>Plymouth, Devon</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-sm text-blue-200">
            <p>&copy; 2025 Naloxone Advocates Plymouth. All rights reserved. <a href="https://readdy.ai/?ref=logo" className="hover:text-white transition-colors whitespace-nowrap">Powered by Readdy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
