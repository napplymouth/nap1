import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../../components/feature/SiteNav';
import { usePageMeta } from '../../hooks/usePageMeta';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  accent: string;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'naloxone',
    label: 'About Naloxone',
    icon: 'ri-medicine-bottle-fill',
    color: 'bg-yellow-400',
    accent: 'border-yellow-400',
    faqs: [
      {
        question: 'What is naloxone?',
        answer: 'Naloxone (also known by the brand name Nyxoid or Prenoxad) is a life-saving medication that rapidly reverses an opioid overdose. It works by blocking opioid receptors in the brain, temporarily stopping the effects of drugs like heroin, fentanyl, methadone, and prescription painkillers. It is safe, fast-acting, and has no effect on someone who has not taken opioids.',
      },
      {
        question: 'How does naloxone work?',
        answer: 'Naloxone binds to the same receptors in the brain that opioids attach to, but it does so much more strongly. This "knocks off" the opioid and reverses the overdose within 2–5 minutes. It can be given as a nasal spray (intranasal) or as an injection. The effects last 30–90 minutes, which is why calling 999 immediately is still essential — the overdose can return once naloxone wears off.',
      },
      {
        question: 'How long does naloxone last?',
        answer: 'Naloxone typically lasts between 30 and 90 minutes. Because many opioids — especially long-acting ones like methadone or fentanyl — stay in the body much longer, a person can go back into overdose after the naloxone wears off. This is why you must always call 999 and stay with the person until emergency services arrive, even if they appear to have recovered.',
      },
      {
        question: 'Can naloxone be used on someone who has not taken opioids?',
        answer: 'Yes — naloxone is completely safe to give even if you are unsure whether opioids are involved. If no opioids are present in the person\'s system, naloxone will have no effect at all. It will not harm them. When in doubt, always administer naloxone and call 999.',
      },
      {
        question: 'What types of naloxone are available?',
        answer: 'There are two main forms available in the UK: (1) Nasal spray (Nyxoid) — a pre-filled device that delivers a measured dose into one nostril. This is the most common form we distribute as it requires no needles and is easy to use. (2) Injectable (Prenoxad) — a pre-filled syringe for intramuscular injection, typically into the outer thigh or upper arm. Both are equally effective. We provide training on both at our sessions.',
      },
      {
        question: 'Does naloxone work on all drugs?',
        answer: 'Naloxone only works on opioids. It will not reverse overdoses caused by alcohol, benzodiazepines (like diazepam or Xanax), cocaine, MDMA, or other non-opioid substances. However, many overdoses involve a mix of substances including opioids, so it is always worth giving naloxone if an opioid overdose is suspected. Always call 999 regardless of what substances may be involved.',
      },
    ],
  },
  {
    id: 'training',
    label: 'Training & Eligibility',
    icon: 'ri-graduation-cap-fill',
    color: 'bg-pink-500',
    accent: 'border-pink-500',
    faqs: [
      {
        question: 'Who can attend naloxone training?',
        answer: 'Anyone can attend our naloxone training — there are no restrictions. You do not need any medical background or prior knowledge. Our training is designed for members of the public, people who use drugs, family members, friends, carers, support workers, healthcare professionals, and anyone who wants to be prepared to save a life. We welcome everyone.',
      },
      {
        question: 'Is the training free?',
        answer: 'Yes, all of our community training sessions are completely free of charge. We believe that life-saving knowledge should be accessible to everyone, regardless of income or background. Naloxone kits are also provided at no cost to participants who complete the training.',
      },
      {
        question: 'How long does the training take?',
        answer: 'Our standard community training session takes approximately 1–2 hours. This includes recognising the signs of an opioid overdose, how to respond safely, how to administer naloxone (both nasal spray and injection), and what to do while waiting for emergency services. Our Peer-to-Peer (P2P) sessions may run slightly longer as they include more discussion and lived-experience sharing.',
      },
      {
        question: 'Do I need to book in advance?',
        answer: 'Yes, we ask that you book in advance so we can ensure we have enough naloxone kits and materials for everyone. You can book through our website using the booking calendar, or contact us directly by phone or email. Walk-ins may be accommodated if space allows, but booking is strongly recommended.',
      },
      {
        question: 'What is the Peer-to-Peer (P2P) training?',
        answer: 'Our Peer-to-Peer (P2P) programme is led by people with lived experience of drug use or addiction. It is designed to be especially welcoming for people who use drugs, their families, and those who have faced stigma from traditional services. The training covers the same life-saving content but in a more informal, supportive, and non-judgemental environment. P2P trainers understand the realities of drug use from personal experience.',
      },
      {
        question: 'Can organisations book training for their staff?',
        answer: 'Absolutely. We offer tailored organisational training for workplaces, charities, NHS services, housing providers, schools, and community groups. We can come to your premises and deliver training to your whole team. Sessions can be adapted to your organisation\'s specific needs. Contact us to discuss dates, group sizes, and any specific requirements.',
      },
      {
        question: 'Will I receive a certificate?',
        answer: 'Yes, all participants who complete our training receive a certificate of completion. This can be used as evidence of training for employers, volunteer roles, or personal records. The certificate confirms you have been trained in overdose recognition and naloxone administration.',
      },
      {
        question: 'Do I need to be a certain age to attend?',
        answer: 'Our standard community sessions are open to adults aged 18 and over. We can arrange sessions for younger people (16–17) with appropriate parental or guardian consent. If you are looking for training for a school or youth organisation, please contact us to discuss how we can best support your group.',
      },
    ],
  },
  {
    id: 'side-effects',
    label: 'Side Effects & Safety',
    icon: 'ri-heart-pulse-fill',
    color: 'bg-lime-500',
    accent: 'border-lime-400',
    faqs: [
      {
        question: 'Are there any side effects of naloxone?',
        answer: 'Naloxone itself has very few side effects. The main effect people experience is opioid withdrawal, which is caused by the sudden removal of opioids from the receptors — not by naloxone itself. Withdrawal symptoms can include agitation, sweating, nausea, vomiting, shaking, and muscle aches. These are uncomfortable but not life-threatening. The person may also feel confused or distressed when they regain consciousness.',
      },
      {
        question: 'What should I do if the person becomes aggressive after naloxone?',
        answer: 'It is common for someone to wake up feeling confused, frightened, or agitated after naloxone reverses an overdose — especially if they were in a deep unconscious state. They may not understand what happened. Stay calm, speak reassuringly, and keep a safe distance if needed. Do not restrain them. Remind them that you are trying to help. Emergency services will be on their way. Never leave them alone.',
      },
      {
        question: 'Is naloxone safe to give to pregnant women?',
        answer: 'Yes. If a pregnant woman is experiencing an opioid overdose, naloxone should be given immediately. The risk of not treating the overdose — which can cause brain damage or death for both mother and baby — far outweighs any potential risk from naloxone. Always call 999 immediately in this situation.',
      },
      {
        question: 'Can naloxone be given to children?',
        answer: 'Naloxone can be given to children in an emergency opioid overdose situation. The dose may differ from adults, and emergency services should be called immediately. If a child has accidentally ingested opioid medication (such as prescription painkillers), administer naloxone and call 999 straight away. Our training covers paediatric considerations.',
      },
      {
        question: 'What if the person does not respond to the first dose?',
        answer: 'If the person does not respond within 2–3 minutes, give a second dose of naloxone. You can give up to three doses. If there is still no response, continue rescue breathing and wait for emergency services. A lack of response may mean the overdose involves a very high dose of opioids (such as fentanyl), a non-opioid substance, or another medical emergency. Keep calling 999 and stay with the person.',
      },
      {
        question: 'Can I overdose on naloxone?',
        answer: 'No. Naloxone has an extremely high safety profile. It is not possible to overdose on naloxone in the traditional sense. Even if given to someone who has not taken opioids, it will have no harmful effect. You cannot give too much naloxone in an emergency situation — always prioritise saving the person\'s life.',
      },
    ],
  },
  {
    id: 'legality',
    label: 'Legality & Access',
    icon: 'ri-scales-3-fill',
    color: 'bg-blue-500',
    accent: 'border-blue-500',
    faqs: [
      {
        question: 'Is it legal to carry naloxone in the UK?',
        answer: 'Yes. In England, Wales, and Scotland, it is completely legal for any member of the public to possess and administer naloxone in an emergency. The Medicines Act 1968 was amended to allow this. You do not need a prescription to carry naloxone obtained through a harm reduction programme like ours. You are protected by law when acting in good faith to save someone\'s life.',
      },
      {
        question: 'Do I need a prescription to get naloxone?',
        answer: 'No. Naloxone can be obtained without a prescription through harm reduction organisations like Naloxone Advocates Plymouth, drug treatment services, some pharmacies, and NHS services. Since 2015, regulations in England have allowed naloxone to be supplied without a prescription for the purpose of saving lives. Simply attend one of our free training sessions and you will receive a kit.',
      },
      {
        question: 'Will I get in trouble with the police if I use naloxone?',
        answer: 'No. Using naloxone to help someone who is overdosing is a compassionate act and you are protected by law. The UK\'s "Good Samaritan" principle means that people who call for help during a drug-related emergency are unlikely to face prosecution. The police\'s priority in these situations is saving lives, not arresting bystanders. Always call 999 — it could save someone\'s life.',
      },
      {
        question: 'Is naloxone available on the NHS?',
        answer: 'Yes. Naloxone is available on the NHS and can be prescribed by GPs, drug treatment services, and other healthcare providers. It is also available through community harm reduction programmes like ours at no cost. NHS England has committed to expanding naloxone access as part of its drug strategy. If you are in drug treatment, ask your key worker or prescriber about getting naloxone.',
      },
      {
        question: 'Can I take naloxone abroad?',
        answer: 'Laws on naloxone vary by country. In many European countries and the USA, naloxone is legal to carry. However, some countries have stricter regulations. If you are travelling abroad, check the laws of your destination country before taking naloxone with you. Carry a letter from your GP or prescriber explaining the medication if you are unsure. Contact us if you need advice.',
      },
      {
        question: 'What is the legal position if someone dies despite me using naloxone?',
        answer: 'If you administer naloxone in good faith to try to save someone\'s life and they sadly do not survive, you are protected by law. The UK\'s legal framework recognises that bystanders acting in good faith to help in a medical emergency should not face criminal liability. The most important thing is always to call 999 and do your best to help. You will not be prosecuted for trying to save a life.',
      },
    ],
  },
  {
    id: 'getting-naloxone',
    label: 'Getting a Kit',
    icon: 'ri-first-aid-kit-fill',
    color: 'bg-yellow-500',
    accent: 'border-yellow-500',
    faqs: [
      {
        question: 'How do I get a free naloxone kit?',
        answer: 'The easiest way is to attend one of our free training sessions — you will receive a naloxone kit at the end. You can also contact us directly to discuss other ways to access a kit. Additionally, naloxone is available from drug treatment services, some pharmacies (including some Boots and Lloyds Pharmacy branches), and NHS services across Plymouth and Devon.',
      },
      {
        question: 'What is included in a naloxone kit?',
        answer: 'Our standard naloxone kit includes: one or two doses of naloxone nasal spray (Nyxoid), instructions for use, an information leaflet about overdose recognition and response, and emergency contact numbers. Some kits also include gloves and a face shield for rescue breathing. Everything you need to respond to an overdose is included.',
      },
      {
        question: 'How should I store my naloxone kit?',
        answer: 'Store your naloxone kit at room temperature (between 15°C and 30°C), away from direct sunlight and moisture. Do not store it in the fridge or freezer. Keep it somewhere accessible — not locked away — so you can reach it quickly in an emergency. Check the expiry date regularly and contact us for a replacement when it is due to expire.',
      },
      {
        question: 'What do I do after I have used my naloxone kit?',
        answer: 'After using your naloxone kit in an emergency, contact us and we will replace it free of charge. Used naloxone devices should be disposed of safely — do not put needles in household waste. You can return used kits to us, a pharmacy, or a drug treatment service for safe disposal. We will always ensure you have a fresh kit available.',
      },
      {
        question: 'Can I get multiple kits for my family or household?',
        answer: 'Yes. We encourage people at risk and their families to have multiple kits available — at home, at work, and with close friends or family members. The more people who carry naloxone, the more lives can be saved. Contact us to discuss your needs and we will do our best to ensure everyone who needs a kit has one.',
      },
    ],
  },
  {
    id: 'families',
    label: 'Families & Carers',
    icon: 'ri-heart-2-fill',
    color: 'bg-rose-500',
    accent: 'border-rose-500',
    faqs: [
      {
        question: 'What do I do if my loved one refuses to get help?',
        answer: 'You cannot force someone into recovery — they must reach that decision themselves. However, you can create the conditions that make it easier. Keep communication open and non-judgemental. Research local treatment options so you\'re ready when they are. Consider speaking to a professional about a structured intervention. In the meantime, protect your own wellbeing by joining a family support group such as Al-Anon or Families Anonymous. Many people in recovery say it was a family member\'s consistent, compassionate presence — not pressure — that eventually made the difference.',
      },
      {
        question: 'Is it safe to carry naloxone at school?',
        answer: 'Yes — in England and Wales it is legal for any member of the public, including school staff and older students, to carry naloxone. There is no age restriction on possession. Many secondary schools and sixth forms now keep naloxone on site as part of their first aid provision. If you are a parent or carer of a young person who uses opioids, we strongly encourage you to speak to the school\'s pastoral team about having naloxone available. We can provide training and kits for school staff — contact us to arrange this.',
      },
      {
        question: 'How do I talk to my child about a parent\'s drug use?',
        answer: 'Children need honest, age-appropriate explanations — not silence or lies, which can be more frightening than the truth. For younger children, you might say: "Mummy/Daddy is very unwell and is getting help." For older children and teenagers, a more direct conversation about addiction as an illness is usually better. Reassure them that it is not their fault, that they are loved, and that they are safe. Nacoa (National Association for Children of Alcoholics) offers excellent resources and a helpline specifically for children in this situation: 0800 358 3456.',
      },
      {
        question: 'Am I enabling my loved one by giving them money or a place to stay?',
        answer: 'This is one of the most difficult questions families face. There is an important difference between supporting someone and enabling their addiction. Enabling means doing things that remove the natural consequences of drug use — such as giving cash that funds substances, covering up behaviour, or repeatedly rescuing them from crises without any expectation of change. Supporting means being emotionally present, encouraging treatment, and maintaining healthy boundaries. Practical help like food, shelter, and attending appointments together is generally supportive. Giving cash with no conditions attached is generally enabling. A family support worker or counsellor can help you navigate this.',
      },
      {
        question: 'What should I do if I find drugs or drug equipment at home?',
        answer: 'Stay calm. Do not flush drugs down the toilet or throw away equipment without thinking it through — this can trigger a crisis or dangerous withdrawal. If you find needles or syringes, do not handle them with bare hands. Contact your local needle exchange or pharmacy for safe disposal advice. If you find drugs, you can contact Change Grow Live Plymouth (01752 434343) for advice on how to handle the situation safely. If you believe a child in the home is at risk, contact your local children\'s services or call the NSPCC helpline on 0808 800 5000.',
      },
      {
        question: 'How do I know if my loved one is overdosing?',
        answer: 'The key signs of an opioid overdose are: very slow, shallow, or stopped breathing; blue or grey lips and fingertips (cyanosis); unresponsive — won\'t wake up even if you shout or rub their sternum; gurgling or snoring sounds (the "death rattle"); pinpoint (very small) pupils; limp body. If you see these signs, call 999 immediately, administer naloxone if you have it, and put them in the recovery position if they are breathing. Do not leave them alone. Our free training sessions teach you exactly what to do — book a place at our next session.',
      },
      {
        question: 'Can I get naloxone for a family member who uses drugs, even if they don\'t come to training?',
        answer: 'Yes. You do not need to bring your loved one to training — you can attend on your own and receive a naloxone kit to keep at home. In fact, many of the people who carry naloxone are family members, partners, and friends rather than the person who uses drugs themselves. We will train you to recognise an overdose and administer naloxone confidently. Having a kit at home could save your loved one\'s life. Contact us or book a session through our website.',
      },
      {
        question: 'Where can I get emotional support as a family member?',
        answer: 'You deserve support too — not just your loved one. Several organisations offer free, confidential help specifically for families: Al-Anon Family Groups (0800 0086 811) for families affected by alcohol; Families Anonymous (0207 498 4680) for families affected by drugs; Adfam (020 3817 9410) for national family support; Change Grow Live Plymouth (01752 434343) for local family advice; and Samaritans (116 123) if you are struggling emotionally. Your GP can also refer you to counselling or local mental health support. You do not have to go through this alone.',
      },
    ],
  },
];

export default function FAQPage() {
  usePageMeta({
    title: 'Naloxone FAQ Plymouth — Training, Side Effects & Legality | Naloxone Advocates Plymouth',
    description: 'Frequently asked questions about naloxone in Plymouth — how it works, who can get trained, side effects, UK legality, and how to get a free kit. Expert harm reduction answers.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/faq`,
    ogTitle: 'Naloxone FAQ — Naloxone Advocates Plymouth CIC',
    ogDescription: 'Everything you need to know about naloxone, overdose response training, side effects, and UK law. Free training and kits available in Plymouth and Devon.',
  });

  const [activeCategory, setActiveCategory] = useState('naloxone');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeData = faqCategories.find((c) => c.id === activeCategory)!;

  const allFaqs = faqCategories.flatMap((c) =>
    c.faqs.map((f) => ({ ...f, categoryId: c.id }))
  );

  const totalQuestions = allFaqs.length;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SiteNav />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-yellow-400 via-lime-300 to-lime-400 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 shadow-sm text-sm">
            <i className="ri-question-answer-fill text-pink-500 text-base" />
            Frequently Asked Questions
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need<br />to Know About Naloxone
          </h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed mb-8">
            Clear, honest answers about <strong>naloxone training</strong>, eligibility, side effects, and UK legality — from Plymouth's leading harm reduction organisation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/70 px-5 py-2.5 rounded-full shadow-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-checkbox-circle-fill text-pink-500 text-base" />
              </div>
              <span className="text-gray-900 font-semibold text-sm whitespace-nowrap">{totalQuestions} questions answered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 px-5 py-2.5 rounded-full shadow-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-shield-check-fill text-pink-500 text-base" />
              </div>
              <span className="text-gray-900 font-semibold text-sm whitespace-nowrap">Expert harm reduction advice</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 px-5 py-2.5 rounded-full shadow-sm">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-map-pin-fill text-pink-500 text-base" />
              </div>
              <span className="text-gray-900 font-semibold text-sm whitespace-nowrap">Plymouth & Devon focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs + FAQ Content */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer border-2 ${
                  activeCategory === cat.id
                    ? `${cat.color} text-gray-900 border-transparent shadow-lg scale-105`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${cat.icon} text-base`} />
                </div>
                {cat.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeCategory === cat.id ? 'bg-white/50 text-gray-900' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.faqs.length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Category Header */}
          <div className={`flex items-center gap-4 mb-8 p-6 rounded-2xl border-l-4 ${activeData.accent} bg-gray-50`}>
            <div className={`w-12 h-12 ${activeData.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${activeData.icon} text-white text-xl`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activeData.label}</h2>
              <p className="text-gray-500 text-sm">{activeData.faqs.length} questions in this section</p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {activeData.faqs.map((faq, idx) => {
              const key = `${activeCategory}-${idx}`;
              const isOpen = !!openItems[key];
              return (
                <div
                  key={key}
                  className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    isOpen ? `${activeData.accent} shadow-lg` : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(key)}
                    className="w-full flex items-start justify-between gap-4 p-6 text-left cursor-pointer bg-white"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        isOpen ? `${activeData.color} text-white` : 'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base leading-snug">
                        <a id={`faq-${activeCategory}-${idx}`} className="scroll-mt-32">{faq.question}</a>
                      </h4>
                    </div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${
                      isOpen ? `${activeData.color}` : 'bg-gray-100'
                    }`}>
                      <i className={`${isOpen ? 'ri-subtract-line text-white' : 'ri-add-line text-gray-500'} text-lg`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 bg-white">
                      <div className="ml-11 border-t border-gray-100 pt-4">
                        <p className="text-gray-700 leading-relaxed text-sm">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Families & Carers — Still Have Questions prompt */}
          {activeCategory === 'families' && (
            <div className="mt-10 rounded-3xl overflow-hidden shadow-xl border border-rose-100">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-heart-2-fill text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold leading-tight">Still have questions?</h3>
                  <p className="text-rose-100 text-sm mt-0.5">We're here for families — you don't have to figure this out alone.</p>
                </div>
              </div>
              <div className="bg-white px-8 py-8">
                <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-2xl">
                  If your question isn't answered above, our team is happy to talk things through — whether you're worried about a loved one, unsure about naloxone, or just need someone to point you in the right direction. You can also book a free family naloxone training session directly.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link
                    to="/contact"
                    className="flex items-center gap-4 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 rounded-2xl px-6 py-5 transition-all group cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-rose-500 group-hover:bg-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <i className="ri-chat-3-fill text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Contact Our Team</p>
                      <p className="text-gray-500 text-xs mt-0.5">Ask us anything — we'll respond within 24 hours</p>
                    </div>
                    <div className="ml-auto w-6 h-6 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-rose-400 group-hover:text-rose-600 text-base transition-colors" />
                    </div>
                  </Link>

                  <Link
                    to="/training#family-carers"
                    className="flex items-center gap-4 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 hover:border-pink-400 rounded-2xl px-6 py-5 transition-all group cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-pink-500 group-hover:bg-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <i className="ri-calendar-check-fill text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Book Family Training</p>
                      <p className="text-gray-500 text-xs mt-0.5">Free 90-min session — naloxone kit included</p>
                    </div>
                    <div className="ml-auto w-6 h-6 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-pink-400 group-hover:text-pink-600 text-base transition-colors" />
                    </div>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-phone-fill text-rose-400 text-sm" />
                    </div>
                    <span>Call us: <a href="tel:07561349137" className="font-semibold text-gray-700 hover:text-rose-500 transition-colors">07561 349 137</a></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-mail-fill text-rose-400 text-sm" />
                    </div>
                    <span>Email: <a href="mailto:napplymouth66@gmail.com" className="font-semibold text-gray-700 hover:text-rose-500 transition-colors">napplymouth66@gmail.com</a></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-shield-check-fill text-rose-400 text-sm" />
                    </div>
                    <span className="font-medium text-gray-600">Confidential &amp; non-judgemental</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-12 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <i className="ri-alarm-warning-fill text-yellow-300 text-3xl animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white">In an Emergency</h2>
          </div>
          <p className="text-white text-lg font-semibold mb-6">
            If someone is overdosing right now — <strong className="text-yellow-300">call 999 immediately.</strong> Naloxone is a temporary measure. Professional medical help is always essential.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:999"
              className="bg-white text-red-600 px-8 py-4 rounded-full font-black text-xl hover:bg-yellow-300 transition-all shadow-lg whitespace-nowrap cursor-pointer"
            >
              Call 999
            </a>
            <Link
              to="/emergency"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg whitespace-nowrap"
            >
              Emergency Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                alt="Naloxone Advocates Plymouth"
                className="h-14 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                Peer-led harm reduction organisation providing free naloxone training and kits across Plymouth and Devon.
              </p>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/training', label: 'Training & P2P' },
                  { to: '/get-naloxone', label: 'Get Naloxone' },
                  { to: '/resources', label: 'Resources' },
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/faq', label: 'FAQ' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-gray-400 hover:text-white transition-colors text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-pink-500 font-bold text-lg mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <p className="font-semibold text-white">Emergency: 999</p>
                <p>Phone: 07561 349 137</p>
                <p>Email: napplymouth66@gmail.com</p>
                <p className="mt-3 text-gray-500">Plymouth & Devon, UK</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Naloxone Advocates Plymouth CIC. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
