
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { usePageMeta } from '../../../hooks/usePageMeta';
import SiteNav from '../../../components/feature/SiteNav';

const warningSignsSections = [
  {
    title: 'Behavioural Changes',
    icon: 'ri-user-unfollow-line',
    color: 'bg-red-500',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-300',
    signs: [
      'Sudden withdrawal from family and friends',
      'Unexplained absences or staying out very late',
      'Secretive behaviour — locking doors, hiding phone',
      'Dramatic mood swings or irritability',
      'Loss of interest in hobbies or activities they used to enjoy',
      'Neglecting responsibilities at work, school, or home',
    ],
  },
  {
    title: 'Physical Signs',
    icon: 'ri-body-scan-line',
    color: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-300',
    signs: [
      'Unexplained weight loss or changes in appetite',
      'Bloodshot or glazed eyes, or pinpoint pupils',
      'Slurred speech or impaired coordination',
      'Unusual smells on breath, clothing, or in their room',
      'Track marks or bruising on arms',
      'Neglecting personal hygiene and appearance',
    ],
  },
  {
    title: 'Financial & Social Signs',
    icon: 'ri-money-pound-circle-line',
    color: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    signs: [
      'Frequently asking to borrow money with vague explanations',
      'Missing money or valuables from the home',
      'New friends you\'ve never met, or avoiding old friends',
      'Legal problems — arrests, cautions, or court appearances',
      'Losing jobs or dropping out of education',
      'Lying or making excuses about whereabouts',
    ],
  },
];

const supportStages = [
  {
    stage: '01',
    title: 'Educate Yourself',
    icon: 'ri-book-open-line',
    color: 'bg-teal-600',
    description: 'Understanding addiction as a health condition — not a moral failing — is the first step. Learn about the substances involved, how dependency develops, and what recovery looks like.',
    tips: [
      'Read about the specific substance(s) involved',
      'Understand that addiction changes brain chemistry',
      'Learn the difference between dependence and addiction',
      'Recognise that recovery is a process, not a single event',
    ],
  },
  {
    stage: '02',
    title: 'Start the Conversation',
    icon: 'ri-chat-heart-line',
    color: 'bg-green-600',
    description: 'Talking to a loved one about their substance use is one of the hardest things you\'ll do. Timing, tone, and approach all matter enormously.',
    tips: [
      'Choose a calm moment — not during or just after use',
      'Use "I" statements: "I\'m worried about you" not "You\'re ruining everything"',
      'Listen without interrupting or judging',
      'Avoid ultimatums in the first conversation',
      'Be prepared for denial — it may take several conversations',
    ],
  },
  {
    stage: '03',
    title: 'Set Healthy Boundaries',
    icon: 'ri-shield-user-line',
    color: 'bg-amber-600',
    description: 'Boundaries protect both you and your loved one. They are not punishments — they are limits that keep everyone safer and prevent enabling behaviour.',
    tips: [
      'Be clear about what you will and won\'t accept',
      'Do not give money that may fund substance use',
      'Do not cover up or make excuses for their behaviour',
      'Follow through on boundaries you set — consistency matters',
      'Seek support for yourself in maintaining boundaries',
    ],
  },
  {
    stage: '04',
    title: 'Encourage Professional Help',
    icon: 'ri-hospital-line',
    color: 'bg-red-600',
    description: 'Professional treatment significantly improves outcomes. You can\'t force someone into recovery, but you can make it easier for them to take that step.',
    tips: [
      'Research local treatment options before the conversation',
      'Offer to go with them to their first appointment',
      'Contact Change Grow Live or Turning Point for advice',
      'Ask their GP for a referral to specialist services',
      'Consider a structured intervention with professional support',
    ],
  },
  {
    stage: '05',
    title: 'Look After Yourself',
    icon: 'ri-heart-pulse-line',
    color: 'bg-rose-600',
    description: 'You cannot pour from an empty cup. Your own mental and physical health must be a priority — not a luxury. Families affected by addiction experience significant trauma.',
    tips: [
      'Join a family support group such as Al-Anon or Families Anonymous',
      'Speak to your own GP about the impact on your mental health',
      'Maintain your own social connections and interests',
      'Accept that you cannot control another person\'s choices',
      'Celebrate small steps forward — recovery is non-linear',
    ],
  },
];

const familyServices = [
  {
    name: 'Al-Anon Family Groups UK',
    description: 'Support for families and friends of people with alcohol problems. Free meetings across the UK.',
    phone: '0800 0086 811',
    website: 'https://www.al-anonuk.org.uk',
    hours: '10am–10pm daily',
    tag: 'Alcohol',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Families Anonymous',
    description: 'Support groups for families affected by a loved one\'s drug use. No fees, no judgement.',
    phone: '0207 498 4680',
    website: 'https://www.famanon.org.uk',
    hours: 'Mon–Fri 1pm–4pm',
    tag: 'Drugs',
    tagColor: 'bg-red-100 text-red-700',
  },
  {
    name: 'FRANK',
    description: 'Honest information about drugs for families, young people, and professionals.',
    phone: '0300 123 6600',
    website: 'https://www.talktofrank.com',
    hours: '24/7',
    tag: 'Information',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    name: 'Change Grow Live Plymouth',
    description: 'Local substance misuse support — also offers family support and advice sessions.',
    phone: '01752 434343',
    website: 'https://www.changegrowlive.org',
    hours: 'Mon–Fri 9am–5pm',
    tag: 'Local',
    tagColor: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'Adfam',
    description: 'National charity working with families affected by drugs and alcohol. Resources, training, and support.',
    phone: '020 3817 9410',
    website: 'https://www.adfam.org.uk',
    hours: 'Mon–Fri 9am–5pm',
    tag: 'National',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    name: 'Samaritans',
    description: 'Confidential emotional support for anyone in distress — including family members.',
    phone: '116 123',
    website: 'https://www.samaritans.org',
    hours: '24/7',
    tag: 'Crisis',
    tagColor: 'bg-rose-100 text-rose-700',
  },
  {
    name: 'Mind',
    description: 'Mental health support for family members experiencing anxiety, depression, or trauma.',
    phone: '0300 123 3393',
    website: 'https://www.mind.org.uk',
    hours: 'Mon–Fri 9am–6pm',
    tag: 'Mental Health',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'NHS 111',
    description: 'Non-emergency medical advice — can also signpost to local mental health and addiction services.',
    phone: '111',
    website: 'https://www.nhs.uk',
    hours: '24/7',
    tag: 'Medical',
    tagColor: 'bg-blue-100 text-blue-700',
  },
];

const faqs = [
  {
    question: 'Should I confront my loved one about their drug use?',
    answer: 'A calm, compassionate conversation is more effective than a confrontation. Choose a moment when they are sober and you are both calm. Use "I" statements to express concern rather than blame. Be prepared for denial — it often takes multiple conversations before someone is ready to accept help.',
  },
  {
    question: 'Am I enabling their addiction by helping them?',
    answer: 'There is an important difference between supporting someone and enabling their addiction. Enabling means doing things that allow the addiction to continue without consequences — such as giving money, covering up behaviour, or making excuses. Supporting means being emotionally present, encouraging treatment, and maintaining healthy boundaries.',
  },
  {
    question: 'What if they refuse to get help?',
    answer: 'You cannot force someone into recovery — they must want it themselves. However, you can make it easier by researching options, offering to accompany them to appointments, and consistently expressing your concern. In the meantime, focus on your own wellbeing and consider joining a family support group such as Families Anonymous or Al-Anon.',
  },
  {
    question: 'How do I talk to children in the family about a parent\'s addiction?',
    answer: 'Children need age-appropriate, honest explanations. Avoid blaming the person or using frightening language. Reassure children that the addiction is not their fault and that they are loved and safe. Organisations like Nacoa (National Association for Children of Alcoholics) offer specific support for children in this situation.',
  },
  {
    question: 'Is it safe to have naloxone at home?',
    answer: 'Yes — if your loved one uses opioids (heroin, fentanyl, methadone, prescription painkillers), having naloxone at home could save their life. Naloxone is safe, free, and available without prescription in the UK. Contact us or visit our Get Naloxone page to receive a free kit and training.',
  },
  {
    question: 'What is the difference between detox and rehabilitation?',
    answer: 'Detox is the process of safely removing substances from the body, usually under medical supervision. Rehabilitation (rehab) addresses the psychological, social, and behavioural aspects of addiction through therapy, counselling, and support. Both are often needed — detox alone without follow-up support has a high relapse rate.',
  },
];

export default function FamilySupportGuidePage() {
  usePageMeta({
    title: 'Family Support Guide — Help for Families Affected by Addiction Plymouth',
    description: 'Practical guidance and support resources for families affected by substance use in Plymouth and Devon. Warning signs, how to help, setting boundaries, and local family support services.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources/family-support-guide`,
    ogTitle: 'Family Support Guide — Naloxone Advocates Plymouth',
    ogDescription: 'Resources and guidance for families affected by substance use. Warning signs, how to start the conversation, setting boundaries, and UK family support services.',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openStage, setOpenStage] = useState<number | null>(0);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden">
        <SiteNav />
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11px; }
        }
      `}</style>

      {/* Page Header */}
      <div className="print:hidden bg-gradient-to-br from-rose-700 to-rose-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/resources" className="text-rose-200 hover:text-white transition-colors text-sm flex items-center gap-1 whitespace-nowrap">
              <i className="ri-arrow-left-line"></i> Back to Resources
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block bg-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Free Resource</span>
              <h1 className="text-4xl md:text-5xl font-black mb-3">Family Support Guide</h1>
              <p className="text-rose-100 text-lg max-w-2xl">
                Practical guidance, warning signs, and support services for families and loved ones affected by substance use. You are not alone — and help is available.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-yellow-300 transition-all shadow-xl whitespace-nowrap cursor-pointer"
              >
                <i className="ri-printer-line text-xl"></i>
                Print Guide
              </button>
              <Link
                to="/resources"
                className="flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all whitespace-nowrap text-sm"
              >
                <i className="ri-arrow-left-line"></i>
                All Resources
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="print:hidden bg-red-600 text-white py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
          <i className="ri-alarm-warning-line text-2xl"></i>
          <p className="font-semibold text-sm">If someone is in immediate danger — call 999 now. For overdose, administer naloxone if available.</p>
          <Link to="/emergency" className="ml-2 bg-white text-red-600 px-4 py-1 rounded-full text-xs font-black hover:bg-red-50 transition-all whitespace-nowrap">Emergency Guide</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Intro Block */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 mb-12 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-heart-line text-white text-3xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">You Are Not Alone</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Living with or caring for someone affected by substance use is one of the most challenging experiences a family can face. It can bring feelings of fear, guilt, shame, anger, and exhaustion — often all at once.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This guide is designed to help you understand what your loved one may be going through, how to support them effectively, and — crucially — how to look after yourself in the process. <strong>Addiction is a health condition, not a moral failing.</strong> Recovery is possible, and families play a vital role.
            </p>
          </div>
        </div>

        {/* Warning Signs */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase tracking-wide">Recognise the Signs</span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Warning Signs of Substance Use</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
              These signs don't always mean someone has a substance use problem — but if you notice several together, it may be time to have a conversation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {warningSignsSections.map((section, i) => (
              <div key={i} className={`rounded-2xl border-2 ${section.borderColor} ${section.bgLight} overflow-hidden`}>
                <div className={`${section.color} px-5 py-4 flex items-center gap-3`}>
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className={`${section.icon} text-white text-xl`}></i>
                  </div>
                  <span className="text-white font-black text-base">{section.title}</span>
                </div>
                <ul className="p-5 space-y-3">
                  {section.signs.map((sign, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <i className="ri-error-warning-fill text-red-400 flex-shrink-0 mt-0.5 text-xs"></i>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How to Help — Step by Step */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase tracking-wide">Step-by-Step Guide</span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">How to Support Your Loved One</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
              There is no single right way to support someone through addiction. But these five stages provide a practical framework for families navigating this journey.
            </p>
          </div>
          <div className="space-y-4">
            {supportStages.map((stage, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenStage(openStage === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${stage.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${stage.icon} text-white text-xl`}></i>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Stage {stage.stage}</div>
                      <h3 className="text-lg font-black text-gray-900">{stage.title}</h3>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <i className={`ri-arrow-${openStage === i ? 'up' : 'down'}-s-line text-2xl text-gray-400`}></i>
                  </div>
                </button>
                {openStage === i && (
                  <div className="px-6 pb-7 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed mt-5 mb-5 text-sm">{stage.description}</p>
                    <ul className="space-y-2.5">
                      {stage.tips.map((tip, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-gray-700">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-check-line text-teal-600 font-bold"></i>
                          </div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Naloxone CTA */}
        <div className="bg-yellow-400 rounded-2xl p-7 mb-14 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-medicine-bottle-line text-yellow-400 text-3xl"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-gray-900 font-black text-xl mb-1">Does Your Loved One Use Opioids?</h3>
            <p className="text-gray-800 text-sm leading-relaxed">
              If your loved one uses heroin, fentanyl, methadone, or prescription opioids, having naloxone at home could save their life. Naloxone is <strong>free, safe, and available without prescription</strong> in the UK. We can provide a free kit and show you how to use it.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2">
            <Link
              to="/get-naloxone"
              className="print:hidden bg-gray-900 text-yellow-400 px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-800 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
            >
              <i className="ri-map-pin-line"></i>
              Get Free Naloxone Kit
            </Link>
            <Link
              to="/training"
              className="print:hidden bg-white/60 text-gray-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-white/80 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer text-center justify-center"
            >
              <i className="ri-graduation-cap-line"></i>
              Book Training
            </Link>
          </div>
        </div>

        {/* Family Support Services */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase tracking-wide">Get Help Now</span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Family Support Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
              You deserve support too. These organisations offer free, confidential help specifically for families and loved ones affected by substance use.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {familyServices.map((service, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-black text-gray-900 leading-tight pr-3">{service.name}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${service.tagColor}`}>{service.tag}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-gray-700">
                    <i className="ri-phone-line text-rose-500"></i>
                    <strong className="font-bold text-sm">{service.phone}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <i className="ri-time-line"></i>
                    <span>{service.hours}</span>
                  </div>
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-sm transition-colors whitespace-nowrap"
                  >
                    Visit Website <i className="ri-external-link-line"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Self-Care Section */}
        <section className="mb-14">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-pulse-line text-white text-2xl"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Looking After Yourself</h2>
              <p className="text-gray-600 text-sm max-w-xl mx-auto">
                Family members of people with addiction are at significantly higher risk of anxiety, depression, and burnout. Your wellbeing matters — not just for you, but for your loved one too.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: 'ri-group-line',
                  title: 'Join a Support Group',
                  desc: 'Al-Anon and Families Anonymous offer free, confidential peer support groups for families. Hearing from others who understand can be transformative.',
                },
                {
                  icon: 'ri-mental-health-line',
                  title: 'Seek Counselling',
                  desc: 'Talking to a therapist or counsellor about the impact of a loved one\'s addiction can help you process complex emotions and develop coping strategies.',
                },
                {
                  icon: 'ri-calendar-check-line',
                  title: 'Maintain Your Routine',
                  desc: 'Keep up with your own social life, hobbies, and interests. Isolation makes everything harder. You are allowed to have joy in your life.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-rose-100">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                    <i className={`${item.icon} text-rose-600 text-xl`}></i>
                  </div>
                  <h4 className="font-black text-gray-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm">Common questions from families affected by substance use</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <strong className="text-base text-gray-900 pr-4 font-bold">{faq.question}</strong>
                  <i className={`ri-arrow-${openFaq === i ? 'up' : 'down'}-s-line text-2xl text-rose-500 flex-shrink-0`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-700 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
          <i className="ri-information-line text-gray-400 text-2xl mb-2 block"></i>
          <p className="text-gray-500 text-xs leading-relaxed max-w-3xl mx-auto">
            <strong className="text-gray-700">This guide is for information and support purposes only.</strong> It does not replace professional medical, legal, or therapeutic advice. If you or your loved one is in immediate danger, call 999. For non-emergency support, contact your GP or one of the services listed above. Naloxone Advocates Plymouth · napplymouth66@gmail.com · 07561 349 137 · Plymouth, Devon
          </p>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="print:hidden bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-black text-gray-900 mb-2">Need to talk to someone?</h3>
          <p className="text-gray-600 text-sm mb-6">Our team can point you towards the right local support. We're here to help families as well as individuals.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-printer-line"></i> Print This Guide
            </button>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all whitespace-nowrap"
            >
              <i className="ri-mail-line"></i> Contact Us
            </Link>
            <Link
              to="/resources"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i> All Resources
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="print:hidden bg-rose-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-rose-200 text-sm">&copy; 2025 Naloxone Advocates Plymouth. All rights reserved. <a href="https://readdy.ai/?ref=logo" className="hover:text-white transition-colors">Powered by Readdy</a></p>
        </div>
      </footer>
    </div>
  );
}
