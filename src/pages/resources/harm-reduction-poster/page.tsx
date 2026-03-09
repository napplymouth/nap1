
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../../hooks/usePageMeta';
import SiteNav from '../../../components/feature/SiteNav';

const drugSummaries = [
  {
    name: 'Opioids',
    icon: 'ri-capsule-line',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-400',
    bgLight: 'bg-red-50',
    risk: 'VERY HIGH',
    riskColor: 'bg-red-600',
    examples: 'Heroin · Fentanyl · Methadone · Codeine',
    naloxone: true,
    tips: [
      'Never use alone — always have someone with you',
      'Carry naloxone at all times',
      'Start with a small test dose',
      'Avoid mixing with alcohol or benzos',
    ],
    overdoseSigns: 'Unresponsive · Slow/stopped breathing · Blue lips · Gurgling sounds · Pinpoint pupils',
  },
  {
    name: 'Stimulants',
    icon: 'ri-flashlight-line',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-400',
    bgLight: 'bg-orange-50',
    risk: 'HIGH',
    riskColor: 'bg-orange-500',
    examples: 'Cocaine · Crack · MDMA · Amphetamine',
    naloxone: false,
    tips: [
      'Stay hydrated — sip water regularly',
      'Take regular breaks if dancing',
      'Avoid mixing with other substances',
      'Test your substances with a drug testing kit',
    ],
    overdoseSigns: 'Chest pain · Seizures · High body temperature · Paranoia · Irregular heartbeat',
  },
  {
    name: 'Depressants (CNS)',
    icon: 'ri-zzz-line',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-400',
    bgLight: 'bg-indigo-50',
    risk: 'HIGH',
    riskColor: 'bg-indigo-500',
    examples: 'Alcohol · Benzodiazepines · GHB/GBL · Ketamine',
    naloxone: false,
    tips: [
      'Never mix depressants — risk multiplies',
      'Never use GHB/GBL alone',
      'Measure GHB/GBL doses carefully',
      'Have a sober person present',
    ],
    overdoseSigns: 'Unconscious · Very slow breathing · Choking · Blue lips · Cannot be woken',
  },
  {
    name: 'Cannabis',
    icon: 'ri-leaf-line',
    color: 'bg-green-600',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
    bgLight: 'bg-green-50',
    risk: 'MODERATE',
    riskColor: 'bg-green-600',
    examples: 'Weed · Hash · Edibles · Spice (Synthetic)',
    naloxone: false,
    tips: [
      'Avoid synthetic cannabis (Spice) — extremely unpredictable',
      'Choose lower-potency strains where possible',
      'Edibles take longer — wait before re-dosing',
      'Do not drive after use',
    ],
    overdoseSigns: 'Severe anxiety · Paranoia · Rapid heart rate · Confusion · Extreme sedation (Spice)',
  },
  {
    name: 'Psychedelics',
    icon: 'ri-eye-line',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-400',
    bgLight: 'bg-purple-50',
    risk: 'MODERATE',
    riskColor: 'bg-purple-500',
    examples: 'LSD · Magic Mushrooms · DMT · 2C-B',
    naloxone: false,
    tips: [
      'Have a trusted sober "trip sitter" present',
      'Use in a safe, familiar environment',
      'Start with a low dose',
      'Avoid if you have a history of psychosis',
    ],
    overdoseSigns: 'Extreme panic · Loss of reality · Dangerous behaviour · Severe confusion · Seizures (rare)',
  },
  {
    name: 'Novel Psychoactive (NPS)',
    icon: 'ri-test-tube-line',
    color: 'bg-gray-700',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-500',
    bgLight: 'bg-gray-50',
    risk: 'VERY HIGH',
    riskColor: 'bg-gray-800',
    examples: 'Spice · Bath Salts · Flakka · Novel Benzos',
    naloxone: false,
    tips: [
      'Avoid NPS entirely — effects are completely unpredictable',
      'Never use alone',
      'Call 999 immediately if someone collapses',
      'Tell paramedics exactly what was taken',
    ],
    overdoseSigns: 'Sudden collapse · Seizures · Extreme aggression · Stopped breathing · Severe overheating',
  },
];

const emergencySteps = [
  { step: '1', title: 'Call 999', desc: 'Always call 999 first. You will NOT get in trouble.', icon: 'ri-phone-fill', color: 'bg-red-600' },
  { step: '2', title: 'Check Breathing', desc: 'Look for chest movement. Listen for breathing sounds.', icon: 'ri-lungs-line', color: 'bg-red-500' },
  { step: '3', title: 'Give Naloxone', desc: 'If opioid overdose suspected, administer naloxone nasal spray or injection.', icon: 'ri-medicine-bottle-line', color: 'bg-yellow-500' },
  { step: '4', title: 'Recovery Position', desc: 'Roll onto their side. Tilt head back to keep airway open.', icon: 'ri-heart-pulse-line', color: 'bg-lime-500' },
  { step: '5', title: 'Stay With Them', desc: 'Never leave them alone. Naloxone wears off in 30–90 mins.', icon: 'ri-user-heart-line', color: 'bg-lime-600' },
];

export default function HarmReductionPosterPage() {
  usePageMeta({
    title: 'UK Harm Reduction Poster — Drug Safety Guide Plymouth | Naloxone Advocates',
    description: 'Free UK harm reduction poster covering all major drug categories, overdose signs, harm reduction tips, and emergency response steps. Printable educational resource for Plymouth and Devon.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/resources/harm-reduction-poster`,
    ogTitle: 'UK Harm Reduction Poster — Free Educational Resource',
    ogDescription: 'Printable harm reduction poster covering opioids, stimulants, cannabis, psychedelics and more. Overdose signs, safety tips, and emergency steps.',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav — hidden on print */}
      <div className="print:hidden">
        <SiteNav />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11px; }
          .poster-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Page Header — hidden on print */}
      <div className="print:hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/resources" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 whitespace-nowrap">
              <i className="ri-arrow-left-line"></i> Back to Resources
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Free Resource</span>
              <h1 className="text-4xl md:text-5xl font-black mb-3">UK Harm Reduction Poster</h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                A comprehensive educational poster covering all major drug categories, overdose signs, and life-saving harm reduction tips. Print and display in community spaces, support centres, and services.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-black text-lg hover:bg-yellow-300 transition-all shadow-xl whitespace-nowrap cursor-pointer"
              >
                <i className="ri-printer-line text-xl"></i>
                Print Poster
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

      {/* ===== POSTER CONTENT (printable) ===== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Poster Title Block */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8 text-center print:rounded-none">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
              alt="Naloxone Advocates Plymouth"
              className="h-12 w-auto print:hidden"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">UK Harm Reduction Poster</h2>
          <p className="text-gray-300 text-base mb-4">Naloxone Advocates Plymouth · napplymouth66@gmail.com · 07561 349 137</p>
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm">
            <i className="ri-alarm-warning-fill animate-pulse"></i>
            EMERGENCY? Always call 999 first
          </div>
        </div>

        {/* Emergency Steps Strip */}
        <div className="bg-red-600 rounded-2xl p-6 mb-8 print:rounded-none">
          <h3 className="text-white font-black text-xl text-center mb-5 uppercase tracking-wide">
            <i className="ri-alarm-warning-fill mr-2"></i>
            Overdose Emergency — 5 Steps
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {emergencySteps.map((s) => (
              <div key={s.step} className="bg-white/10 rounded-xl p-4 text-center">
                <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <i className={`${s.icon} text-white text-lg`}></i>
                </div>
                <div className="text-yellow-300 font-black text-xs mb-1">STEP {s.step}</div>
                <div className="text-white font-bold text-sm mb-1">{s.title}</div>
                <div className="text-red-100 text-xs leading-snug">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Naloxone Banner */}
        <div className="bg-yellow-400 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 print:rounded-none">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-medicine-bottle-line text-yellow-400 text-3xl"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-gray-900 font-black text-xl mb-1">Naloxone Reverses Opioid Overdose</h3>
            <p className="text-gray-800 text-sm leading-relaxed">
              Naloxone (Nyxoid nasal spray / Prenoxad injection) is safe, free, and available without prescription in the UK.
              It only works on opioids — it cannot harm someone who hasn't taken opioids.
              <strong className="ml-1">Get a free kit at naloxoneadvocatesplymouth.org or call 07561 349 137.</strong>
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/get-naloxone"
              className="print:hidden bg-gray-900 text-yellow-400 px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-800 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
            >
              <i className="ri-map-pin-line"></i>
              Get Free Kit
            </Link>
          </div>
        </div>

        {/* Drug Categories Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6 text-center uppercase tracking-wide">
            Drug Categories — Know the Risks
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 poster-grid">
            {drugSummaries.map((drug) => (
              <div
                key={drug.name}
                className={`rounded-2xl border-2 ${drug.borderColor} ${drug.bgLight} overflow-hidden print:rounded-none`}
              >
                {/* Card Header */}
                <div className={`${drug.color} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                      <i className={`${drug.icon} text-white text-xl`}></i>
                    </div>
                    <span className="text-white font-black text-base">{drug.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`${drug.riskColor} text-white text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap`}>
                      {drug.risk}
                    </span>
                    {drug.naloxone && (
                      <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Naloxone Works
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <p className="text-gray-500 text-xs mb-4 italic">{drug.examples}</p>

                  {/* Overdose Signs */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <i className="ri-alarm-warning-line text-red-500 text-sm"></i>
                      <span className="text-red-600 font-bold text-xs uppercase tracking-wide">Overdose / Crisis Signs</span>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{drug.overdoseSigns}</p>
                  </div>

                  {/* Harm Reduction Tips */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <i className="ri-shield-check-line text-green-600 text-sm"></i>
                      <span className="text-green-700 font-bold text-xs uppercase tracking-wide">Harm Reduction Tips</span>
                    </div>
                    <ul className="space-y-1.5">
                      {drug.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <i className="ri-check-line text-green-600 flex-shrink-0 mt-0.5"></i>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Messages Row */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center print:rounded-none">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-phone-fill text-white text-2xl"></i>
            </div>
            <h4 className="font-black text-gray-900 text-lg mb-2">Always Call 999</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              In any overdose emergency, call 999 first. You will <strong>not</strong> be arrested for calling. Emergency services are there to save lives.
            </p>
            <a href="tel:999" className="print:hidden mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full font-black text-sm hover:bg-red-700 transition-all whitespace-nowrap cursor-pointer">
              <i className="ri-phone-fill"></i> Call 999
            </a>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 text-center print:rounded-none">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-user-heart-line text-white text-2xl"></i>
            </div>
            <h4 className="font-black text-gray-900 text-lg mb-2">Never Use Alone</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Using alone dramatically increases the risk of a fatal overdose. Always have someone with you who knows what to do and where the naloxone is kept.
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center print:rounded-none">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-test-tube-line text-white text-2xl"></i>
            </div>
            <h4 className="font-black text-gray-900 text-lg mb-2">Test Your Substances</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Drug testing kits can detect fentanyl and other adulterants. Start with a small test dose. Tolerance changes — especially after a break, illness, or time in custody.
            </p>
          </div>
        </div>

        {/* Support Services Strip */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 print:rounded-none">
          <h3 className="text-white font-black text-lg text-center mb-5">
            <i className="ri-phone-line text-yellow-400 mr-2"></i>
            UK Support Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Emergency', number: '999', color: 'bg-red-600', hours: '24/7' },
              { name: 'NHS 111', number: '111', color: 'bg-yellow-500', hours: '24/7' },
              { name: 'FRANK', number: '0300 123 6600', color: 'bg-green-600', hours: '24/7' },
              { name: 'Samaritans', number: '116 123', color: 'bg-indigo-500', hours: '24/7' },
              { name: 'Change Grow Live', number: '01752 434343', color: 'bg-teal-600', hours: 'Mon–Fri' },
              { name: 'Turning Point', number: '01752 434988', color: 'bg-orange-500', hours: 'Mon–Fri' },
            ].map((s) => (
              <div key={s.name} className="bg-gray-800 rounded-xl p-3 text-center">
                <div className={`${s.color} text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block`}>{s.hours}</div>
                <div className="text-white font-black text-sm mb-0.5">{s.name}</div>
                <div className="text-yellow-300 font-bold text-xs">{s.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center print:rounded-none">
          <i className="ri-information-line text-gray-400 text-2xl mb-2 block"></i>
          <p className="text-gray-500 text-xs leading-relaxed max-w-3xl mx-auto">
            <strong className="text-gray-700">This poster is for harm reduction purposes only.</strong> We do not condone illegal drug use. This information is provided to help keep people safer. If you or someone you know needs support, please contact one of the services listed above. Naloxone Advocates Plymouth · napplymouth66@gmail.com · 07561 349 137 · Plymouth, Devon
          </p>
        </div>

      </div>

      {/* Bottom CTA — hidden on print */}
      <div className="print:hidden bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-black text-gray-900 mb-2">Want to display this in your service or community space?</h3>
          <p className="text-gray-600 text-sm mb-6">Print this poster and put it where it can save lives — hostels, community centres, support services, GP surgeries, and more.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-printer-line"></i> Print This Poster
            </button>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all whitespace-nowrap"
            >
              <i className="ri-mail-line"></i> Contact Us for Printed Copies
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

      {/* Footer — hidden on print */}
      <footer className="print:hidden bg-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-200 text-sm">&copy; 2025 Naloxone Advocates Plymouth. All rights reserved. <a href="https://readdy.ai/?ref=logo" className="hover:text-white transition-colors">Powered by Readdy</a></p>
        </div>
      </footer>
    </div>
  );
}
