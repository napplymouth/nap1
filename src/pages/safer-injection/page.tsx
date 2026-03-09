import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../../components/feature/SiteNav';
import { usePageMeta } from '../../hooks/usePageMeta';

interface FAQItem {
  question: string;
  answer: string;
}

interface NeedleExchangeLocation {
  name: string;
  address: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
}

const SaferInjectionPage = () => {
  usePageMeta({
    title: 'Safer Injection Education Plymouth | Harm Reduction Guide | Plymouth Peer Support',
    description:
      'Comprehensive safer injection education and harm reduction resources for Plymouth. Learn about injection site rotation, sterile equipment, wound care, and needle exchange locations. Non-judgmental support.',
    keywords:
      'safer injection, harm reduction Plymouth, needle exchange Plymouth, injection site rotation, sterile equipment, vein care, wound prevention, drug preparation safety',
  });

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [copyToast, setCopyToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://plymouthpeersupport.org/safer-injection';
  const shareTitle = 'Safer Injection Guide — Free Harm Reduction Information for Plymouth';
  const shareText = 'Free harm reduction guide covering safer injection, needle exchanges, HIV/Hep C testing, PrEP, and Hep B vaccination in Plymouth. No judgment, just facts.';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    });
  };

  const handleDownloadPDF = () => {
    const livePageUrl = 'https://plymouthpeersupport.org/safer-injection';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(livePageUrl)}&color=0d9488&bgcolor=ffffff&margin=4`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Safer Injection Guide — Plymouth Peer Support</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12pt; color: #1a1a1a; line-height: 1.6; padding: 20mm; }
    h1 { font-size: 24pt; color: #0d9488; margin-bottom: 6pt; }
    h2 { font-size: 16pt; color: #0d9488; margin-top: 20pt; margin-bottom: 8pt; border-bottom: 2px solid #0d9488; padding-bottom: 4pt; }
    h3 { font-size: 13pt; color: #134e4a; margin-top: 14pt; margin-bottom: 6pt; }
    p { margin-bottom: 8pt; }
    ul { margin-left: 18pt; margin-bottom: 10pt; }
    li { margin-bottom: 4pt; }
    .cover { text-align: center; padding: 40pt 0 30pt; border-bottom: 3px solid #0d9488; margin-bottom: 24pt; }
    .cover p { font-size: 13pt; color: #555; margin-top: 8pt; }
    .badge { display: inline-block; background: #0d9488; color: white; padding: 4pt 12pt; border-radius: 20pt; font-size: 10pt; margin-bottom: 12pt; }
    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 10pt 14pt; margin: 12pt 0; border-radius: 4pt; }
    .tip { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 10pt 14pt; margin: 12pt 0; border-radius: 4pt; }
    .site-row { display: flex; justify-content: space-between; padding: 6pt 0; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
    th { background: #f0fdfa; color: #134e4a; padding: 6pt 8pt; text-align: left; border: 1px solid #d1fae5; }
    td { padding: 6pt 8pt; border: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .page-break { page-break-before: always; }
    .contact-box { background: #f0fdfa; border: 1px solid #99f6e4; padding: 10pt 14pt; border-radius: 6pt; margin: 10pt 0; }
    .emergency { background: #dc2626; color: white; padding: 12pt 16pt; border-radius: 6pt; text-align: center; margin: 16pt 0; font-size: 13pt; font-weight: bold; }
    .qr-section { display: flex; align-items: center; gap: 16pt; background: #f0fdfa; border: 2px solid #0d9488; border-radius: 8pt; padding: 12pt 16pt; margin: 16pt 0; }
    .qr-section img { width: 90pt; height: 90pt; flex-shrink: 0; }
    .qr-section .qr-text { flex: 1; }
    .qr-section .qr-text strong { font-size: 12pt; color: #0d9488; display: block; margin-bottom: 4pt; }
    .qr-section .qr-text span { font-size: 10pt; color: #555; }
    .qr-section .qr-url { font-size: 9pt; color: #0d9488; word-break: break-all; margin-top: 4pt; display: block; }
    .cover-qr { display: inline-flex; flex-direction: column; align-items: center; gap: 6pt; margin-top: 16pt; background: #f0fdfa; border: 2px solid #0d9488; border-radius: 10pt; padding: 12pt 20pt; }
    .cover-qr img { width: 100pt; height: 100pt; }
    .cover-qr span { font-size: 9pt; color: #0d9488; font-weight: bold; }
    .cover-qr small { font-size: 8pt; color: #888; }
    @media print { body { padding: 15mm; } }
  </style>
</head>
<body>

<div class="cover">
  <div class="badge">Harm Reduction Education</div>
  <h1>Safer Injection Guide</h1>
  <p>Evidence-based harm reduction information to help you stay safer.</p>
  <p>No judgment, just facts.</p>
  <p style="margin-top:16pt; font-size:10pt; color:#888;">Plymouth Peer Support &bull; plymouthpeersupport.org</p>
  <div class="cover-qr">
    <img src="${qrCodeUrl}" alt="QR code linking to the online version of this guide" />
    <span>&#128247; Scan for the online version</span>
    <small>${livePageUrl}</small>
  </div>
</div>

<div class="emergency">&#9888; Medical Emergency? Call 999 &bull; Overdose? Use naloxone and call for help</div>

<h2>1. Why Safer Injection Matters</h2>
<p>If you inject drugs, you deserve accurate information to protect your health. This guide provides evidence-based harm reduction guidance — not judgment, not lectures, just practical information that can save your life.</p>
<div class="tip"><strong>We believe in meeting people where they are.</strong> Whether you're working toward recovery or not, you deserve to be safe and healthy.</div>

<h2>2. Injection Site Guide</h2>
<h3>Site Safety Map</h3>
<table>
  <tr><th>Area</th><th>Safety Level</th><th>Tips</th></tr>
  <tr><td>Inner Arms</td><td style="color:#059669;font-weight:bold">Safest</td><td>Start here. Rotate between left and right. Avoid the crook of your elbow.</td></tr>
  <tr><td>Outer Arms</td><td style="color:#0d9488;font-weight:bold">Safe</td><td>Good alternative when inner arms need rest. Easier to see veins.</td></tr>
  <tr><td>Hands</td><td style="color:#d97706;font-weight:bold">Risky</td><td>More painful, higher infection risk. Use only if arms unavailable.</td></tr>
  <tr><td>Legs &amp; Feet</td><td style="color:#ea580c;font-weight:bold">High Risk</td><td>Poor circulation, slow healing. Seek guidance before using.</td></tr>
  <tr><td>Neck &amp; Groin</td><td style="color:#dc2626;font-weight:bold">Dangerous</td><td>Life-threatening if done wrong. Never attempt without medical supervision.</td></tr>
</table>
<h3>Site Rotation Best Practices</h3>
<ul>
  <li><strong>Rotate every time</strong> — never use the same spot twice in a row</li>
  <li><strong>Wait 48–72 hours</strong> — give each site time to heal before reusing</li>
  <li><strong>Stay hydrated</strong> — drink plenty of water to keep veins healthy</li>
  <li><strong>Warm compress</strong> — apply before injecting to make veins easier to find</li>
  <li><strong>Avoid damaged veins</strong> — skip areas with bruising or scarring</li>
</ul>
<div class="warning"><strong>Never inject into:</strong> Neck, groin, or arteries without medical supervision. These areas are extremely dangerous and can be fatal if done incorrectly.</div>

<h2 class="page-break">3. What's in a Clean Kit?</h2>
<table>
  <tr><th>Item</th><th>Why It Matters</th></tr>
  <tr><td>Clean Needle &amp; Syringe</td><td>Prevents HIV, Hepatitis C, and bacterial infections</td></tr>
  <tr><td>Alcohol Swabs</td><td>Cleans injection site and reduces infection risk</td></tr>
  <tr><td>Sterile Water</td><td>Safer than tap water which can contain bacteria</td></tr>
  <tr><td>Clean Spoon/Cooker</td><td>Prevents contamination during drug preparation</td></tr>
  <tr><td>Sterile Filter</td><td>Removes particles that can damage veins and organs</td></tr>
  <tr><td>Tourniquet</td><td>Helps find veins — never share, can spread blood-borne viruses</td></tr>
  <tr><td>Sharps Bin</td><td>Safe disposal prevents needle-stick injuries to others</td></tr>
</table>
<div class="warning"><strong>Never share equipment</strong> — not needles, syringes, filters, spoons, or water. Even tiny amounts of blood can spread HIV and Hepatitis C.</div>

<h2>4. Needle &amp; Syringe Size Guide</h2>
<p><strong>The Golden Rule: Go as fine as possible.</strong> A thinner needle (higher gauge number) causes less vein damage, less scarring, and less pain.</p>
<table>
  <tr><th>Gauge</th><th>Cap Colour</th><th>Length</th><th>Best For</th><th>Vein Risk</th></tr>
  <tr><td>27G</td><td>Grey</td><td>13mm</td><td>Very shallow veins, sensitive areas</td><td style="color:#059669">Low</td></tr>
  <tr><td>25G</td><td>Orange</td><td>16mm</td><td>Shallow veins, hands, top of feet</td><td style="color:#059669">Low</td></tr>
  <tr><td>23G</td><td>Blue</td><td>25mm</td><td>Standard arm veins, most common use</td><td style="color:#d97706">Moderate</td></tr>
  <tr><td>21G</td><td>Green</td><td>38mm</td><td>Larger, deeper veins</td><td style="color:#ea580c">High</td></tr>
  <tr><td>19G</td><td>Cream/White</td><td>38mm</td><td>Not recommended for self-injection</td><td style="color:#dc2626">Very High</td></tr>
</table>
<h3>Syringe Sizes</h3>
<table>
  <tr><th>Size</th><th>Markings</th><th>Best For</th></tr>
  <tr><td>1ml (Insulin)</td><td>0.01ml increments</td><td>Small doses, precise measurement</td></tr>
  <tr><td>2ml</td><td>0.1ml increments</td><td>Standard doses</td></tr>
  <tr><td>5ml</td><td>0.2ml increments</td><td>Larger volumes, flushing</td></tr>
</table>

<h2 class="page-break">5. Safer Drug Preparation</h2>
<ol style="margin-left:18pt">
  <li style="margin-bottom:8pt"><strong>Clean Your Space</strong> — Wash hands with soap and water. Use a clean, flat surface. Lay out all your equipment.</li>
  <li style="margin-bottom:8pt"><strong>Prepare the Solution</strong> — Use sterile water and a clean spoon. If using citric acid, add just enough to dissolve.</li>
  <li style="margin-bottom:8pt"><strong>Filter Carefully</strong> — Always use a sterile filter to remove particles. Draw solution slowly to avoid air bubbles.</li>
  <li style="margin-bottom:8pt"><strong>Let It Cool</strong> — Wait for the solution to cool to body temperature. Hot solutions damage veins.</li>
  <li style="margin-bottom:8pt"><strong>Clean the Site</strong> — Use an alcohol swab to clean the injection site. Let it dry completely before injecting.</li>
  <li style="margin-bottom:8pt"><strong>Inject Safely</strong> — Insert at 45° angle, pull back to check for blood, inject slowly. Remove needle at same angle.</li>
</ol>
<div class="tip">
  <strong>Important Safety Notes:</strong>
  <ul style="margin-top:6pt">
    <li>Use fentanyl test strips if available — fentanyl contamination is common and deadly</li>
    <li>Start with a smaller dose if it's a new batch or you haven't used in a while</li>
    <li>Never use alone — have someone nearby who can call 999 and use naloxone</li>
    <li>Keep a naloxone kit nearby in case of overdose</li>
  </ul>
</div>

<h2>6. Signs of Infection &amp; When to Get Help</h2>
<table>
  <tr><th>Sign</th><th>Severity</th><th>Action</th></tr>
  <tr><td>Redness &amp; Warmth</td><td style="color:#ca8a04">Early</td><td>Monitor closely, keep clean</td></tr>
  <tr><td>Swelling &amp; Pain</td><td style="color:#ea580c">Moderate</td><td>Call 111 for advice</td></tr>
  <tr><td>Pus or Discharge</td><td style="color:#dc2626">Serious</td><td>Visit A&amp;E or urgent care</td></tr>
  <tr><td>Fever or Red Streaks</td><td style="color:#991b1b;font-weight:bold">Emergency</td><td>Go to A&amp;E immediately</td></tr>
</table>
<div class="tip"><strong>You won't be judged.</strong> Medical professionals are there to help. Be honest about how the wound happened so they can provide the best treatment.</div>

<h2 class="page-break">7. Needle Disposal &amp; Sharps Safety</h2>
<ol style="margin-left:18pt">
  <li style="margin-bottom:8pt"><strong>Cap the Needle Immediately</strong> — Re-cap using the scoop method (one hand only). Never use two hands.</li>
  <li style="margin-bottom:8pt"><strong>Place in a Sharps Bin</strong> — Drop the capped needle into a yellow sharps bin immediately.</li>
  <li style="margin-bottom:8pt"><strong>Never Overfill</strong> — Only fill to the ¾ fill line. An overfull bin is dangerous.</li>
  <li style="margin-bottom:8pt"><strong>Seal and Return</strong> — When ¾ full, close and lock the lid. Return to your needle exchange for free disposal and a new bin.</li>
</ol>
<h3>Never Do These Things</h3>
<ul>
  <li>Put needles in household bins or recycling</li>
  <li>Flush needles down the toilet</li>
  <li>Leave needles in public places</li>
  <li>Bend or break needles before disposal</li>
  <li>Recap using two hands (needle-stick risk)</li>
  <li>Carry loose needles in pockets or bags</li>
  <li>Overfill a sharps bin past the fill line</li>
</ul>
<div class="contact-box"><strong>Free sharps bins</strong> are available from all Plymouth needle exchanges and many pharmacies. Council collection: <strong>01752 668000</strong></div>

<h2>8. Blood-Borne Virus Testing</h2>
<p><strong>Hepatitis C is now curable</strong> — a short course of tablets clears it in over 95% of people. <strong>HIV is treatable</strong> — people live long, healthy lives. Getting tested is free, quick, and confidential.</p>
<table>
  <tr><th>Virus</th><th>How It Spreads</th><th>Treatment</th><th>Testing</th></tr>
  <tr><td><strong>HIV</strong></td><td>Sharing needles, syringes, filters, spoons, or water</td><td>Highly effective ART — live a long, healthy life</td><td>Rapid finger-prick, result in 60 seconds</td></tr>
  <tr><td><strong>Hepatitis C</strong></td><td>Sharing any injecting equipment</td><td>CURABLE — 8–12 week tablet course, free on NHS</td><td>Finger-prick, results in 20–30 minutes</td></tr>
  <tr><td><strong>Hepatitis B</strong></td><td>Sharing needles or equipment; unprotected sex</td><td>Antiviral medication manages chronic infection</td><td>Blood test — ask at needle exchange or GP</td></tr>
</table>
<h3>Where to Get Free Tests in Plymouth</h3>
<div class="contact-box">
  <p><strong>Harbour Drug &amp; Alcohol Service</strong><br/>31 Notte Street, Plymouth PL1 2AG &bull; 01752 434343 &bull; Mon–Fri 9am–5pm</p>
  <p style="margin-top:8pt"><strong>Plymouth Sexual Health Clinic</strong><br/>Scott Business Park, Beacon Park Road, Plymouth PL2 2PQ &bull; 01752 434300 &bull; Mon–Fri 8:30am–4:30pm</p>
  <p style="margin-top:8pt"><strong>Shekinah Mission</strong><br/>36 Mayflower Street, Plymouth PL1 1QX &bull; 01752 266950 &bull; Mon–Fri 9am–4pm</p>
  <p style="margin-top:8pt"><strong>Free HIV home test kit:</strong> freetesting.hiv &bull; <strong>Free Hep C postal kit:</strong> hepctrust.org.uk</p>
</div>

<h2 class="page-break">9. Hepatitis B Vaccination</h2>
<p>The Hep B vaccine gives <strong>lifelong protection</strong> and is <strong>free for people who inject drugs</strong> in Plymouth. Hep B is 30–100 times more infectious than HIV — prevention is far better than treatment.</p>
<h3>Standard Course</h3>
<ul>
  <li>Dose 1 — immediate protection begins</li>
  <li>Dose 2 — 1 month later</li>
  <li>Dose 3 — 6 months after first dose (95%+ protection, lasts for life)</li>
</ul>
<div class="tip"><strong>Complete the full course.</strong> Many people get the first dose but never return. Set phone reminders for follow-up appointments.</div>

<h2>10. PrEP — HIV Prevention Pill</h2>
<p>PrEP is a daily tablet taken by HIV-negative people to prevent HIV infection. It is <strong>99% effective when taken correctly</strong> and is <strong>free on the NHS</strong> in Plymouth.</p>
<ul>
  <li>Take one tablet every day at the same time</li>
  <li>Protection builds up after 7 days of consistent use</li>
  <li>Does not protect against Hepatitis C or B — always use a clean needle</li>
  <li>Regular HIV testing every 3 months required while on PrEP</li>
</ul>
<div class="contact-box"><strong>Get PrEP in Plymouth:</strong> Plymouth Sexual Health Clinic — 01752 434300 &bull; Scott Business Park, Beacon Park Road, Plymouth PL2 2PQ</div>

<h2>11. Plymouth Needle Exchange Locations</h2>
<div class="contact-box">
  <p><strong>Harbour Drug &amp; Alcohol Service</strong><br/>31 Notte Street, Plymouth PL1 2AG &bull; 01752 434343 &bull; Mon–Fri 9am–5pm</p>
  <p style="margin-top:8pt"><strong>Shekinah Mission</strong><br/>36 Mayflower Street, Plymouth PL1 1QX &bull; 01752 266950 &bull; Mon–Fri 9am–4pm</p>
  <p style="margin-top:8pt"><strong>The Salvation Army</strong><br/>19 Ebrington Street, Plymouth PL4 9AA &bull; 01752 222752 &bull; Mon–Sat 10am–3pm</p>
</div>
<p>All services are <strong>free, confidential, and non-judgmental</strong>. No ID required. You can get free needles, syringes, sharps bins, and advice on safer injection techniques.</p>

<h2>12. Emergency Contacts</h2>
<div class="emergency">Emergency: 999 &bull; Urgent Medical Advice: 111</div>
<div class="contact-box">
  <p><strong>Harbour Drug &amp; Alcohol Service:</strong> 01752 434343</p>
  <p><strong>Plymouth Sexual Health Clinic:</strong> 01752 434300</p>
  <p><strong>Shekinah Mission:</strong> 01752 266950</p>
  <p><strong>Plymouth City Council (sharps collection):</strong> 01752 668000</p>
  <p><strong>Free HIV home test:</strong> freetesting.hiv</p>
  <p><strong>Free Hep C postal test:</strong> hepctrust.org.uk</p>
  <p><strong>PrEP online:</strong> iwantprepnow.co.uk</p>
</div>

<div class="qr-section">
  <img src="${qrCodeUrl}" alt="QR code — scan to visit the online version of this guide" />
  <div class="qr-text">
    <strong>&#128247; Access the Full Online Guide</strong>
    <span>Scan this QR code to visit the live version of this guide on your phone or share it with someone who needs it. The online version includes interactive maps, service links, and the latest updates.</span>
    <span class="qr-url">${livePageUrl}</span>
  </div>
</div>

<p style="margin-top:24pt; font-size:9pt; color:#888; text-align:center; border-top:1px solid #e5e7eb; padding-top:10pt;">
  Plymouth Peer Support &bull; plymouthpeersupport.org &bull; This guide is for harm reduction purposes only. Always seek medical advice when needed.
</p>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 2000);
      }, 300);
    };
  };

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: 'ri-whatsapp-line',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`, '_blank'),
    },
    {
      label: 'Email',
      icon: 'ri-mail-line',
      color: 'bg-teal-600 hover:bg-teal-700',
      action: () => window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + pageUrl)}`, '_blank'),
    },
    {
      label: 'SMS',
      icon: 'ri-message-2-line',
      color: 'bg-cyan-600 hover:bg-cyan-700',
      action: () => window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + pageUrl)}`, '_blank'),
    },
    {
      label: 'Facebook',
      icon: 'ri-facebook-line',
      color: 'bg-sky-700 hover:bg-sky-800',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank'),
    },
    {
      label: 'Copy Link',
      icon: 'ri-links-line',
      color: 'bg-gray-700 hover:bg-gray-800',
      action: handleCopyLink,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Data definitions – kept unchanged (only formatting)                */
  /* ------------------------------------------------------------------ */
  const needleExchanges: NeedleExchangeLocation[] = [
    {
      name: 'Harbour Drug & Alcohol Service',
      address: '31 Notte Street, Plymouth PL1 2AG',
      hours: 'Mon-Fri 9am-5pm',
      phone: '01752 434343',
      lat: 50.3755,
      lng: -4.1427,
    },
    {
      name: 'Shekinah Mission',
      address: '36 Mayflower Street, Plymouth PL1 1QX',
      hours: 'Mon-Fri 9am-4pm',
      phone: '01752 266950',
      lat: 50.3698,
      lng: -4.1389,
    },
    {
      name: 'The Salvation Army',
      address: '19 Ebrington Street, Plymouth PL4 9AA',
      hours: 'Mon-Sat 10am-3pm',
      phone: '01752 222752',
      lat: 50.3742,
      lng: -4.1356,
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'Is it legal to carry needles and syringes?',
      answer:
        'Yes, it is legal to carry clean needles and syringes in the UK. Possession of injecting equipment is not illegal. However, always dispose of used needles safely in a sharps bin - never in regular bins or public spaces.',
    },
    {
      question: "What if I can't find a vein?",
      answer:
        "If you're having trouble finding a vein, don't keep trying in the same spot. Take a break, stay hydrated, and try a different site. Never inject into your neck, groin, or hands without proper guidance. Visit a needle exchange for advice on safer injection techniques.",
    },
    {
      question: 'Can I get help without judgment?',
      answer:
        'Absolutely. All needle exchange services and harm reduction programs in Plymouth operate on a non-judgmental, confidential basis. Staff are trained in harm reduction and are there to support you, not judge you. Your health and safety are the priority.',
    },
    {
      question: 'How often should I rotate injection sites?',
      answer:
        'Rotate sites with every injection if possible. Never use the same spot twice in a row. Give each site at least 48-72 hours to heal before using it again. This prevents vein damage, scarring, and infections.',
    },
    {
      question: 'What should I do if I see signs of infection?',
      answer:
        "Seek medical help immediately if you notice redness, swelling, warmth, pus, or fever. Don't wait - infections can become serious quickly. Go to A&E or call 111. Medical staff will treat you without judgment.",
    },
    {
      question: 'Can I share filters or spoons?',
      answer:
        'No, never share any equipment - not even filters, spoons, or water. Blood-borne viruses like HIV and Hepatitis C can be transmitted through shared equipment. Always use your own clean kit.',
    },
  ];

  const injectionSites = [
    {
      area: 'Inner Arms',
      safety: 'Safest',
      tips: 'Start here. Rotate between left and right. Avoid the crook of your elbow.',
      color: 'bg-emerald-100 border-emerald-300',
    },
    {
      area: 'Outer Arms',
      safety: 'Safe',
      tips: 'Good alternative when inner arms need rest. Easier to see veins.',
      color: 'bg-teal-100 border-teal-300',
    },
    {
      area: 'Hands',
      safety: 'Risky',
      tips: 'More painful, higher infection risk. Use only if arms unavailable.',
      color: 'bg-amber-100 border-amber-300',
    },
    {
      area: 'Legs & Feet',
      safety: 'High Risk',
      tips: 'Poor circulation, slow healing. Seek guidance before using.',
      color: 'bg-orange-100 border-orange-300',
    },
    {
      area: 'Neck & Groin',
      safety: 'Dangerous',
      tips: 'Life-threatening if done wrong. Never attempt without medical supervision.',
      color: 'bg-red-100 border-red-300',
    },
  ];

  const sterileKit = [
    { item: 'Clean Needle & Syringe', why: 'Prevents HIV, Hepatitis C, and bacterial infections' },
    { item: 'Alcohol Swabs', why: 'Cleans injection site and reduces infection risk' },
    { item: 'Sterile Water', why: 'Safer than tap water which can contain bacteria' },
    { item: 'Clean Spoon/Cooker', why: 'Prevents contamination during drug preparation' },
    { item: 'Sterile Filter', why: 'Removes particles that can damage veins and organs' },
    { item: 'Tourniquet', why: 'Helps find veins - never share, can spread blood-borne viruses' },
    { item: 'Sharps Bin', why: 'Safe disposal prevents needle‑stick injuries to others' },
  ];

  const needleSizes = [
    {
      gauge: '25G',
      color: 'Orange',
      length: '16mm (5/8")',
      thickness: 'Fine',
      bestFor: 'Shallow veins, hands, top of feet',
      notes: 'Least painful, causes minimal vein damage. Good for people with small or delicate veins.',
      risk: 'low',
    },
    {
      gauge: '27G',
      color: 'Grey',
      length: '13mm (1/2")',
      thickness: 'Very Fine',
      bestFor: 'Very shallow veins, sensitive areas',
      notes: 'Extremely fine — less trauma to the vein wall. May be slower to draw back blood.',
      risk: 'low',
    },
    {
      gauge: '23G',
      color: 'Blue',
      length: '25mm (1")',
      thickness: 'Medium',
      bestFor: 'Standard arm veins, most common use',
      notes: 'The most widely used size at needle exchanges. Good balance of flow and vein safety.',
      risk: 'medium',
    },
    {
      gauge: '21G',
      color: 'Green',
      length: '38mm (1.5")',
      thickness: 'Wider',
      bestFor: 'Larger, deeper veins',
      notes: 'Wider bore causes more vein damage over time. Only use if smaller gauges aren’t working.',
      risk: 'high',
    },
    {
      gauge: '19G',
      color: 'Cream/White',
      length: '38mm (1.5")',
      thickness: 'Wide',
      bestFor: 'Not recommended for self‑injection',
      notes: 'Very wide — causes significant vein scarring and damage. Avoid if at all possible.',
      risk: 'very-high',
    },
  ];

  const syringeSizes = [
    {
      size: '1ml (Insulin)',
      markings: '0.01ml increments',
      bestFor: 'Small doses, precise measurement',
      notes: 'Most common at needle exchanges. Fine markings help with accurate dosing.',
    },
    {
      size: '2ml',
      markings: '0.1ml increments',
      bestFor: 'Standard doses',
      notes: 'Good all‑round choice. Widely available at needle exchanges.',
    },
    {
      size: '5ml',
      markings: '0.2ml increments',
      bestFor: 'Larger volumes, flushing',
      notes: 'Useful for flushing the syringe. Less precise for small doses.',
    },
  ];

  const preparationSteps = [
    {
      step: 1,
      title: 'Clean Your Space',
      description: 'Wash hands with soap and water. Use a clean, flat surface. Lay out all your equipment.',
      icon: 'ri-hand-sanitizer-line',
    },
    {
      step: 2,
      title: 'Prepare the Solution',
      description:
        'Use sterile water and a clean spoon. If using citric acid, add just enough to dissolve - too much damages veins.',
      icon: 'ri-flask-line',
    },
    {
      step: 3,
      title: 'Filter Carefully',
      description: 'Always use a sterile filter to remove particles. Draw solution slowly to avoid air bubbles.',
      icon: 'ri-filter-3-line',
    },
    {
      step: 4,
      title: 'Let It Cool',
      description:
        'Wait for the solution to cool to body temperature. Hot solutions damage veins and cause scarring.',
      icon: 'ri-temp-cold-line',
    },
    {
      step: 5,
      title: 'Clean the Site',
      description: 'Use an alcohol swab to clean the injection site. Let it dry completely before injecting.',
      icon: 'ri-first-aid-kit-line',
    },
    {
      step: 6,
      title: 'Inject Safely',
      description: 'Insert at 45° angle, pull back to check for blood, inject slowly. Remove needle at same angle.',
      icon: 'ri-syringe-line',
    },
  ];

  const infectionSigns = [
    { sign: 'Redness & Warmth', severity: 'Early', action: 'Monitor closely, keep clean' },
    { sign: 'Swelling & Pain', severity: 'Moderate', action: 'Call 111 for advice' },
    { sign: 'Pus or Discharge', severity: 'Serious', action: 'Visit A&E or urgent care' },
    { sign: 'Fever or Red Streaks', severity: 'Emergency', action: 'Go to A&E immediately' },
  ];

  const disposalSteps = [
    {
      step: 1,
      title: 'Cap the Needle Immediately',
      description:
        'Re‑cap the needle straight after use using the scoop method — place the cap on a flat surface and scoop it on with one hand. Never use two hands to re‑cap.',
      icon: 'ri-shield-line',
      color: 'bg-teal-100 text-teal-600',
    },
    {
      step: 2,
      title: 'Place in a Sharps Bin',
      description:
        'Drop the capped needle into a yellow sharps bin immediately. Never put loose needles in plastic bags, pockets, or regular bins.',
      icon: 'ri-delete-bin-line',
      color: 'bg-teal-100 text-teal-600',
    },
    {
      step: 3,
      title: 'Never Overfill',
      description:
        'Only fill the sharps bin to the fill line (usually ¾ full). An overfull bin is dangerous — needles can fall out or puncture the lid.',
      icon: 'ri-error-warning-line',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      step: 4,
      title: 'Seal and Return',
      description:
        'When the bin is ¾ full, close and lock the lid. Return it to your needle exchange for safe disposal — they will give you a new one for free.',
      icon: 'ri-lock-line',
      color: 'bg-teal-100 text-teal-600',
    },
  ];

  const sharpsDoNots = [
    'Put needles in household bins or recycling',
    'Flush needles down the toilet',
    'Leave needles in public places',
    'Bend or break needles before disposal',
    'Recap using two hands (needle‑stick risk)',
    'Carry loose needles in pockets or bags',
    'Put needles in glass jars or plastic bottles',
    'Overfill a sharps bin past the fill line',
  ];

  const needleStickSteps = [
    {
      step: 1,
      title: "Don't Panic",
      description:
        'Stay calm. The risk of infection from a single needle‑stick is low but should still be assessed.',
      color: 'border-teal-400',
    },
    {
      step: 2,
      title: 'Wash Immediately',
      description:
        'Wash the wound thoroughly with soap and running water for at least 5 minutes. Do not scrub. Let it bleed freely — do not suck the wound.',
      color: 'border-teal-400',
    },
    {
      step: 3,
      title: 'Cover the Wound',
      description: 'Apply a waterproof plaster or dressing after washing.',
      color: 'border-teal-400',
    },
    {
      step: 4,
      title: 'Seek Medical Help Within 1 Hour',
      description:
        'Go to A&E or an urgent care centre immediately. If HIV exposure is possible, PEP (post‑exposure prophylaxis) must be started within 72 hours — the sooner the better.',
      color: 'border‑red‑400',
    },
    {
      step: 5,
      title: 'Report It',
      description:
        'If the injury happened at a service or workplace, report it to a supervisor. Keep a record of the incident, time, and location.',
      color: 'border-teal-400',
    },
  ];

  const bbvTestingSites = [
    {
      name: 'Harbour Drug & Alcohol Service',
      address: '31 Notte Street, Plymouth PL1 2AG',
      phone: '01752 434343',
      tests: ['HIV', 'Hepatitis C', 'Hepatitis B'],
      notes: 'Free, confidential BBV testing for people who inject drugs. No appointment needed.',
      hours: 'Mon–Fri 9am–5pm',
      icon: 'ri-hospital-line',
    },
    {
      name: 'Plymouth Sexual Health Clinic (Livewell Southwest)',
      address: 'Scott Business Park, Beacon Park Road, Plymouth PL2 2PQ',
      phone: '01752 434300',
      tests: ['HIV', 'Hepatitis C', 'Hepatitis B', 'STIs'],
      notes: 'Free HIV and Hep C testing. Walk‑in and appointment slots available.',
      hours: 'Mon–Fri 8:30am–4:30pm',
      icon: 'ri-heart-pulse-line',
    },
    {
      name: 'Shekinah Mission',
      address: '36 Mayflower Street, Plymouth PL1 1QX',
      phone: '01752 266950',
      tests: ['HIV', 'Hepatitis C'],
      notes: 'Rapid point‑of‑care testing available. Results in 60 seconds for HIV.',
      hours: 'Mon–Fri 9am–4pm',
      icon: 'ri-community-line',
    },
    {
      name: 'NHS Home Testing (NHIVST)',
      address: 'Online — delivered to your door',
      phone: '',
      tests: ['HIV'],
      notes: 'Order a free HIV self‑test kit online at freetesting.hiv. Results in 15 minutes at home.',
      hours: 'Available 24/7 online',
      icon: 'ri-home-heart-line',
    },
  ];

  const bbvFacts = [
    {
      virus: 'HIV',
      color: 'bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-600',
      icon: 'ri-virus-line',
      transmission:
        'Sharing needles, syringes, filters, spoons, or water with someone who has HIV.',
      symptoms:
        'Often no symptoms for years. Some people get a flu‑like illness 2–4 weeks after infection.',
      treatment:
        'Highly effective antiretroviral treatment (ART) means people with HIV can live long, healthy lives. Treatment also prevents passing HIV on.',
      testing:
        'Rapid finger‑prick test — result in 60 seconds. Window period: 45 days after last risk.',
      prevention: 'Use a clean needle every time. PrEP available for high‑risk individuals.',
    },
    {
      virus: 'Hepatitis C (Hep C)',
      color: 'bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-600',
      icon: 'ri-drop-line',
      transmission:
        'Sharing any injecting equipment — including filters, spoons, and water — with someone who has Hep C.',
      symptoms:
        'Most people have no symptoms. Some feel tired or have mild jaundice. Can cause serious liver damage over time if untreated.',
      treatment:
        'Hep C is now CURABLE. A short course of tablets (8–12 weeks) clears the virus in over 95 % of people. Treatment is free on the NHS.',
      testing:
        'Finger‑prick blood test. Results in 20–30 minutes. Window period: 12 weeks after last risk.',
      prevention:
        'Use a clean needle and fresh equipment every single time. Never share filters or spoons.',
    },
    {
      virus: 'Hepatitis B (Hep B)',
      color: 'bg-orange-50 border-orange-200',
      badgeColor: 'bg-orange-600',
      icon: 'ri-shield-cross-line',
      transmission: 'Sharing needles or equipment. Also spread through unprotected sex.',
      symptoms:
        'Flu‑like illness, jaundice, fatigue. Most adults clear it naturally; some develop chronic infection.',
      treatment:
        'No cure, but antiviral medication can manage chronic Hep B and prevent liver damage.',
      testing: 'Blood test. Ask at your needle exchange or GP.',
      prevention:
        'FREE VACCINE available — a full course gives lifelong protection. Ask at any needle exchange or GP.',
    },
  ];

  /* ------------------------------------------------------------------ */
  /* PrEP data                                                          */
  /* ------------------------------------------------------------------ */
  const prepEligibility = [
    {
      icon: 'ri-syringe-line',
      label: 'People who inject drugs',
      detail: 'Especially if you share or have shared needles or equipment',
    },
    {
      icon: 'ri-heart-pulse-line',
      label: 'HIV‑negative people with an HIV‑positive partner',
      detail: 'Where the partner is not yet on treatment or not virally suppressed',
    },
    {
      icon: 'ri-group-line',
      label: 'People with multiple sexual partners',
      detail: "Particularly where condoms aren't always used",
    },
    {
      icon: 'ri-exchange-line',
      label: 'People who have recently had an STI',
      detail: 'A recent STI diagnosis can indicate higher HIV risk',
    },
    {
      icon: 'ri-shield-cross-line',
      label: 'Anyone assessed as high risk by a clinician',
      detail: 'A sexual health clinic can assess your individual risk and prescribe accordingly',
    },
  ];

  const prepPlymouthSites = [
    {
      name: 'Plymouth Sexual Health Clinic (Livewell Southwest)',
      address: 'Scott Business Park, Beacon Park Road, Plymouth PL2 2PQ',
      phone: '01752 434300',
      notes:
        'Main NHS PrEP prescribing service in Plymouth. Free assessment, prescription, and monitoring. Walk‑in and appointments available.',
      hours: 'Mon–Fri 8:30am–4:30pm',
      icon: 'ri-heart-pulse-line',
    },
    {
      name: 'Harbour Drug & Alcohol Service',
      address: '31 Notte Street, Plymouth PL1 2AG',
      phone: '01752 434343',
      notes:
        'Can refer you to sexual health services for PrEP assessment. Also provides BBV testing and harm reduction support.',
      hours: 'Mon–Fri 9am–5pm',
      icon: 'ri-hospital-line',
    },
    {
      name: 'NHS Online (I Want PrEP Now)',
      address: 'Online — delivered to your door',
      phone: '',
      notes:
        'Order generic PrEP online at iwantprepnow.co.uk. Cheaper than private clinics. Still requires regular HIV testing every 3 months.',
      hours: 'Available 24/7 online',
      icon: 'ri-global-line',
    },
  ];

  const prepSteps = [
    {
      step: 1,
      title: 'Get an HIV Test',
      description:
        "You must test HIV‑negative before starting PrEP. This can be done at any sexual health clinic or needle exchange in Plymouth — it's free.",
      icon: 'ri-test-tube-line',
    },
    {
      step: 2,
      title: 'Book a PrEP Assessment',
      description:
        'Contact Plymouth Sexual Health Clinic. A clinician will assess your HIV risk and check your kidney function (a simple blood test) before prescribing.',
      icon: 'ri-stethoscope-line',
    },
    {
      step: 3,
      title: 'Get Your Prescription',
      description:
        "If eligible, PrEP is prescribed free on the NHS. You'll receive a supply of tablets — usually a 1–3 month supply to start.",
      icon: 'ri-capsule-line',
    },
    {
      step: 4,
      title: 'Regular Monitoring',
      description:
        'You’ll need an HIV test every 3 months and a kidney function check every 6–12 months while on PrEP. These are all free at the clinic.',
      icon: 'ri-calendar-check-line',
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Copy Toast */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <i className="ri-check-line text-green-400 text-lg"></i>
          <span className="text-sm font-medium">Link copied to clipboard!</span>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Share This Guide</h3>
                <p className="text-sm text-gray-500 mt-1">Help someone you care about stay safer</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                <i className="ri-close-line text-gray-600 text-xl"></i>
              </button>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-800 leading-relaxed">
                <i className="ri-heart-line text-teal-600 mr-1"></i>
                Sharing this guide could help a friend, family member, or someone you know access life-saving harm reduction information. It's free, confidential, and non-judgmental.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { opt.action(); if (opt.label !== 'Copy Link') setShowShareModal(false); }}
                  className={`${opt.color} text-white rounded-xl px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap text-sm font-semibold shadow`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${opt.icon} text-base`}></i>
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={pageUrl}
                className="flex-1 bg-transparent text-xs text-gray-600 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Share Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600 hidden sm:block">
            <i className="ri-share-forward-line text-teal-600 mr-1"></i>
            Know someone who needs this? Share this guide with them.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-700 hidden md:block">Share:</span>
            {shareOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={opt.action}
                title={opt.label}
                className={`${opt.color} text-white w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer`}
              >
                <i className={`${opt.icon} text-sm`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <i className="ri-alarm-warning-line text-2xl"></i>
            <p className="font-semibold">
              Medical Emergency? Call 999 immediately. Overdose? Use naloxone and call for help.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <i className="ri-shield-cross-line text-xl"></i>
            <span className="text-sm font-medium">Harm Reduction Education</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Safer Injection Guide</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-teal-50">
            Evidence‑based harm reduction information to help you stay safer. No judgment, just facts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#needle-exchanges"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Find Needle Exchange
            </a>
            <a
              href="#download-guide"
              className="bg-teal-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              Download PDF Guide
            </a>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-transparent border-2 border-white/60 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              Share This Guide
            </button>
            <Link
              to="/get-naloxone"
              className="bg-transparent border-2 border-white/60 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Get Naloxone Kit
            </Link>
          </div>
        </div>
      </section>

      {/* Share This Guide Section */}
      <section className="py-10 bg-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 justify-center md:justify-start">
                <i className="ri-share-forward-2-line text-teal-300"></i>
                Share This Guide with Someone You Care About
              </h2>
              <p className="text-teal-100 text-sm max-w-xl">
                This guide could help a friend, family member, or someone you know stay safer. Sharing takes seconds and could make a real difference.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className={`${opt.color} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap text-sm font-semibold`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${opt.icon} text-base`}></i>
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable PDF Guide Section */}
      <section id="download-guide" className="py-16 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* PDF Preview & Info */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <i className="ri-file-pdf-line text-3xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Safer Injection Guide</h3>
                    <p className="text-gray-600">Complete harm reduction handbook</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="ri-file-text-line text-teal-600 text-xl"></i>
                    <span><strong>24 pages</strong> of evidence-based information</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="ri-download-line text-teal-600 text-xl"></i>
                    <span><strong>Free download</strong> — keep it for reference</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="ri-printer-line text-teal-600 text-xl"></i>
                    <span><strong>Print-friendly</strong> format for offline use</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <i className="ri-smartphone-line text-teal-600 text-xl"></i>
                    <span><strong>Mobile-optimized</strong> for easy reading</span>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-book-open-line text-teal-600"></i>
                    What's Inside:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Injection site rotation guide & vein care tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Complete needle & syringe size chart</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Step-by-step safer drug preparation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Infection signs & wound care advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Plymouth needle exchange locations & hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>HIV, Hep C & Hep B testing information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>PrEP & Hepatitis B vaccination details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Safe disposal & sharps safety protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>Emergency contacts & crisis resources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Download Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Download Your Free Guide</h2>
                  <p className="text-gray-600">
                    Get instant access to our comprehensive safer injection handbook. No spam, just helpful resources.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-check-line text-3xl text-teal-600"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600 mb-6">Your guide is ready. Click below to download it as a PDF.</p>
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-file-pdf-line text-xl"></i>
                      Save as PDF
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      A print dialog will open — choose <strong>"Save as PDF"</strong> as the destination.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 text-sm text-teal-600 underline hover:text-teal-700 cursor-pointer"
                    >
                      Submit again
                    </button>
                  </div>
                ) : (
                <form
                  id="download-guide-form"
                  data-readdy-form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormSubmitting(true);
                    setFormError('');
                    const form = e.currentTarget;
                    const data = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
                    try {
                      await fetch('https://readdy.ai/api/form/d6k93nm32h7pkqqsu340', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: data.toString(),
                      });
                      setFormSubmitted(true);
                      setTimeout(() => window.print(), 400);
                    } catch {
                      setFormError('Something went wrong. Please try again.');
                    } finally {
                      setFormSubmitting(false);
                    }
                  }}
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                      placeholder="Your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="user-type" className="block text-sm font-medium text-gray-700 mb-2">
                      This guide is for: *
                    </label>
                    <select
                      id="user-type"
                      name="user-type"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                    >
                      <option value="">Please select...</option>
                      <option value="myself">Myself</option>
                      <option value="family-friend">A family member or friend</option>
                      <option value="professional">Professional/work use</option>
                      <option value="education">Educational purposes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <select
                      id="location"
                      name="location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                    >
                      <option value="">Select location...</option>
                      <option value="plymouth-city">Plymouth City Centre</option>
                      <option value="plymouth-north">North Plymouth (Southway, Woolwell)</option>
                      <option value="plymouth-south">South Plymouth (Plympton, Plymstock)</option>
                      <option value="plymouth-east">East Plymouth (Laira, Lipson)</option>
                      <option value="plymouth-west">West Plymouth (Peverell, Tamerton)</option>
                      <option value="devon-other">Other Devon location</option>
                      <option value="cornwall">Cornwall</option>
                      <option value="uk-other">Other UK location</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="updates"
                        name="updates"
                        value="yes"
                        className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="updates" className="text-sm text-gray-700">
                        Send me updates about harm reduction resources and services in Plymouth (optional)
                      </label>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 leading-relaxed">
                    <p>
                      <i className="ri-shield-check-line text-teal-600 mr-1"></i>
                      Your information is kept strictly confidential and will never be shared with third parties. 
                      We only use it to send you the guide and occasional relevant resources if you opt in.
                    </p>
                  </div>

                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full bg-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {formSubmitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                        Preparing your guide...
                      </>
                    ) : (
                      <>
                        <i className="ri-download-cloud-line text-xl"></i>
                        Download Free PDF Guide
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      <i className="ri-printer-line mr-1"></i>
                      Uses your browser's Save as PDF — works on all devices
                    </p>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-2xl text-teal-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Completely Free</h3>
              <p className="text-sm text-gray-600">
                No hidden costs, no premium versions. This comprehensive guide is completely free for everyone.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-heart-line text-2xl text-teal-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Created by People with Lived Experience</h3>
              <p className="text-sm text-gray-600">
                Developed with input from people who inject drugs, ensuring practical and relevant advice.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-refresh-line text-2xl text-teal-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Regularly Updated</h3>
              <p className="text-sm text-gray-600">
                We keep the guide current with the latest harm reduction research and local service information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-heart-pulse-line text-2xl text-teal-600"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Why Safer Injection Matters
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    If you inject drugs, you deserve accurate information to protect your health.
                    This page provides evidence‑based harm reduction guidance - not judgment,
                    not lectures, just practical information that can save your life.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    <strong>This information is for:</strong> People who currently inject drugs,
                    those considering it, friends and family who want to help, and anyone who
                    wants to understand harm reduction.
                  </p>
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                    <p className="text-gray-800 font-medium">
                      <i className="ri-information-line text-teal-600 mr-2"></i>
                      We believe in meeting people where they are. Whether you're working toward
                      recovery or not, you deserve to be safe and healthy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Injection Site Guide */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Injection Site Guide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Site rotation is crucial for preventing vein damage, scarring, and infections.
              Here's what you need to know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Body Map Visual */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i className="ri-body-scan-line text-teal-600"></i>
                Injection Site Safety Map
              </h3>
              <div className="space-y-4">
                {injectionSites.map((site, index) => (
                  <div key={index} className={`${site.color} border-2 rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{site.area}</h4>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          site.safety === 'Safest'
                            ? 'bg-emerald-600 text-white'
                            : site.safety === 'Safe'
                            ? 'bg-teal-600 text-white'
                            : site.safety === 'Risky'
                            ? 'bg-amber-600 text-white'
                            : site.safety === 'High Risk'
                            ? 'bg-orange-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {site.safety}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{site.tips}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation Tips */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-refresh-line text-teal-600"></i>
                  Site Rotation Best Practices
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Rotate every time:</strong> Never use the same spot twice in a row
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Wait 48‑72 hours:</strong> Give each site time to heal before reusing
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Track your sites:</strong> Keep mental notes of which areas you've used
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Inspect regularly:</strong> Check for bruising, lumps, or signs of damage
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-heart-add-line text-teal-600"></i>
                  Vein Care Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <i className="ri-drop-line text-cyan-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Stay hydrated:</strong> Drink plenty of water to keep veins healthy
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-temp-hot-line text-cyan-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Warm compress:</strong> Apply before injecting to make veins easier to find
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-time-line text-cyan-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Don't rush:</strong> Take your time finding a good vein
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-close-circle-line text-cyan-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Avoid damaged veins:</strong> Skip areas with bruising or scarring
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-gray-800 font-semibold flex items-start gap-2">
                  <i className="ri-alert-line text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Never inject into:</strong> Neck, groin, or arteries without medical
                    supervision. These areas are extremely dangerous and can be fatal if done
                    incorrectly.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sterile Equipment */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What's in a Clean Kit?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Using sterile equipment every time is the single most important thing you can do
              to prevent infections and blood‑borne viruses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sterileKit.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-checkbox-circle-line text-2xl text-teal-600"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.item}</h3>
                <p className="text-gray-600">{item.why}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <i className="ri-error-warning-line text-5xl mb-4"></i>
            <h3 className="text-3xl font-bold mb-4">Never Share Equipment</h3>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Sharing needles, syringes, filters, spoons, or water can transmit HIV, Hepatitis C,
              and other blood‑borne infections. Even tiny amounts of blood can spread disease.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <i className="ri-shield-cross-line text-2xl"></i>
              <span className="font-semibold">Always use your own clean kit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Needle Sizes Guide */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Understanding Needle Sizes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choosing the right needle size reduces vein damage and pain. The higher the gauge
              number, the <strong>thinner</strong> the needle — thinner is almost always better.
            </p>
          </div>

          {/* Key Rule Banner */}
          <div className="bg-teal-600 text-white rounded-2xl p-6 mb-10 flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-3xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">The Golden Rule: Go as Fine as Possible</h3>
              <p className="text-teal-50 text-lg">
                A thinner needle (higher gauge number) causes less vein damage, less scarring,
                and less pain. Always use the finest gauge that works for you. Most needle
                exchanges stock 25G and 27G — ask for the finest available.
              </p>
            </div>
          </div>

          {/* Gauge Comparison Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-ruler-line text-teal-600"></i>
                Needle Gauge Guide
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Higher gauge = thinner needle = less damage
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Gauge</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Cap Colour</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Length</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Thickness</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Best For</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Vein Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {needleSizes.map((needle, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">
                        {needle.gauge}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border border-gray-300 ${
                              needle.color === 'Orange'
                                ? 'bg-orange-400'
                                : needle.color === 'Grey'
                                ? 'bg-gray-400'
                                : needle.color === 'Blue'
                                ? 'bg-sky-500'
                                : needle.color === 'Green'
                                ? 'bg-green-500'
                                : 'bg-stone-200'
                            }`}
                          ></div>
                          <span className="text-gray-700">{needle.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{needle.length}</td>
                      <td className="px-6 py-4 text-gray-700">{needle.thickness}</td>
                      <td className="px-6 py-4 text-gray-700">{needle.bestFor}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                            needle.risk === 'low'
                              ? 'bg-emerald-100 text-emerald-700'
                              : needle.risk === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : needle.risk === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {needle.risk === 'low'
                            ? 'Low'
                            : needle.risk === 'medium'
                            ? 'Moderate'
                            : needle.risk === 'high'
                            ? 'High'
                            : 'Very High'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Cards – first three gauges */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {needleSizes.slice(0, 3).map((needle, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border-2 ${
                  needle.risk === 'low'
                    ? 'bg-emerald-50 border-emerald-200'
                    : needle.risk === 'medium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white shadow flex-shrink-0 ${
                        needle.color === 'Orange'
                          ? 'bg-orange-400'
                          : needle.color === 'Grey'
                          ? 'bg-gray-400'
                          : 'bg-sky-500'
                      }`}
                    ></div>
                    <span className="text-2xl font-bold text-gray-900">{needle.gauge}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      needle.risk === 'low'
                        ? 'bg-emerald-600 text-white'
                        : needle.risk === 'medium'
                        ? 'bg-amber-600 text-white'
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    {needle.risk === 'low'
                      ? '✓ Recommended'
                      : needle.risk === 'medium'
                      ? 'Common'
                      : 'Use with care'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {needle.length} · {needle.thickness}
                </p>
                <p className="text-sm text-gray-600 mb-2">{needle.notes}</p>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Best for
                  </p>
                  <p className="text-sm text-gray-700">{needle.bestFor}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Syringe Sizes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="ri-test-tube-line text-teal-600"></i>
              Syringe Sizes
            </h3>
            <p className="text-gray-600 mb-6">
              The syringe barrel size determines how much liquid it holds. Use the smallest size
              that fits your dose for more accurate measurement.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {syringeSizes.map((syringe, index) => (
                <div key={index} className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{syringe.size}</h4>
                  <p className="text-xs text-teal-700 font-semibold mb-3 uppercase tracking-wide">
                    {syringe.markings}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Best for:</strong> {syringe.bestFor}
                  </p>
                  <p className="text-sm text-gray-600">{syringe.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Needle Length Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-arrow-up-down-line text-teal-600"></i>
                Choosing the Right Length
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Shorter needles (13–16 mm):</strong> Better for shallow veins close to the
                    skin surface, such as hands or forearms
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Longer needles (25–38 mm):</strong> Needed for deeper veins, but increase
                    the risk of going through the vein
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Angle matters:</strong> Shorter needles are inserted at a shallower angle
                    (15–30°); longer needles at up to 45°
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Ask at the exchange:</strong> Staff can advise on the best length for
                    your specific veins
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-close-circle-line text-red-500"></i>
                Never Reuse a Needle
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Even using a needle twice causes significant harm. After a single use, the tip
                becomes:
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-red-500 flex-shrink-0 mt-1"></i>
                  <span>
                    <strong>Blunted</strong> — making it harder to enter the vein cleanly and causing
                    more tearing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-red-500 flex-shrink-0 mt-1"></i>
                  <span>
                    <strong>Barbed</strong> — microscopic hooks form on the tip that shred vein walls
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-arrow-right-s-line text-red-500 flex-shrink-0 mt-1"></i>
                  <span>
                    <strong>Contaminated</strong> — bacteria can grow on used needles even if they
                    look clean
                  </span>
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-semibold">
                  <i className="ri-alert-line mr-1"></i>
                  Needle exchanges provide free needles — there is no reason to reuse. Always take
                  more than you think you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Needle Disposal & Sharps Safety */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <i className="ri-delete-bin-2-line"></i>
              Sharps Safety
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Needle Disposal &amp; Sharps Safety
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Safe disposal protects you, your community, and anyone who might come into contact
              with used needles. Always dispose of sharps correctly — every time.
            </p>
          </div>

          {/* How to Dispose Steps */}
          <div className="mb-14">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="ri-list-check-2 text-teal-600 text-2xl"></i>
              How to Dispose of Needles Safely
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {disposalSteps.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                      <i className={`${item.icon} text-xl`}></i>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sharps Bin Info + Do Nots */}
          <div className="grid md:grid-cols-2 gap-8 mb-14">
            {/* Sharps Bin Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-information-line text-teal-600 text-2xl"></i>
                Getting a Free Sharps Bin
              </h3>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Free from needle exchanges:</strong> All Plymouth needle exchange
                    services provide yellow sharps bins at no cost.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Free from pharmacies:</strong> Many pharmacies in Plymouth offer sharps
                    bins — ask at the counter.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Return when full:</strong> Bring your sealed bin back to the exchange or
                    pharmacy — they will dispose of it safely and give you a new one.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Council collection:</strong> Plymouth City Council offers a free sharps
                    collection service for home users. Call{' '}
                    <a href="tel:01752668000" className="text-teal-600 underline hover:text-teal-700">
                      01752 668000
                    </a>{' '}
                    to arrange.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Take more than you need:</strong> Always take extra needles and an extra
                    bin so you never run out.
                  </span>
                </li>
              </ul>

              <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm text-teal-800 font-semibold flex items-start gap-2">
                  <i className="ri-shield-check-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  Sharps bins are specifically designed to be puncture‑resistant and leak‑proof.
                  No other container is safe enough for used needles.
                </p>
              </div>
            </div>

            {/* Do Nots */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-close-circle-line text-red-500 text-2xl"></i>
                Never Do These Things
              </h3>
              <div className="space-y-3">
                {sharpsDoNots.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                  >
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-0.5"></i>
                    <span className="text-sm text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Found a Needle in Public */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 mb-14">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-search-eye-line text-2xl text-amber-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Found a Needle in a Public Place?</h3>
                <p className="text-gray-700 mb-4">
                  If you find a discarded needle in a public space, do not pick it up with your bare
                  hands. Here's what to do:
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                      If you have a sharps bin nearby
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Use thick gloves or tongs
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Pick up by the barrel, not the tip
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Drop directly into the sharps bin
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                      If you don't have a sharps bin
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Do not touch it
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Mark the location and keep people away
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                        Report to Plymouth City Council:{' '}
                        <a href="tel:01752668000" className="text-teal-600 underline">
                          01752 668000
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Needle‑Stick Injury */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-600 text-white px-8 py-5 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <i className="ri-alert-line text-3xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">Needle‑Stick Injury? Act Immediately</h3>
                <p className="text-red-100 text-sm">
                  If you accidentally prick yourself with a used needle, follow these steps right
                  away
                </p>
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-5 gap-4 mb-6">
                {needleStickSteps.map((item) => (
                  <div
                    key={item.step}
                    className={`border-l-4 ${item.color} bg-gray-50 rounded-r-xl p-4`}
                  >
                    <div className="w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-hospital-line text-red-600 text-2xl flex-shrink-0"></i>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Go to A&amp;E immediately</p>
                    <p className="text-xs text-gray-600 mt-1">
                      PEP for HIV must start within 72 hours. Don't wait — go now.
                    </p>
                  </div>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-phone-line text-teal-600 text-2xl flex-shrink-0"></i>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Call 111 for advice</p>
                    <p className="text-xs text-gray-600 mt-1">
                      NHS 111 can advise on next steps and direct you to the nearest service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safer Drug Preparation */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Safer Drug Preparation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How you prepare your drugs matters. Follow these steps to reduce harm and protect
              your veins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preparationSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <i className={`${step.icon} text-2xl text-teal-600`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-amber-50 border-2 border-amber-300 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-alert-line text-2xl text-amber-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PrEP Works Best Alongside Other Harm Reduction</h3>
                <p className="text-gray-700 mb-4">
                  PrEP is highly effective, but it works best as part of a broader approach to staying
                  safe:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: 'ri-syringe-line',
                      text: 'Always use a clean needle — PrEP does not protect against Hepatitis C or B',
                    },
                    {
                      icon: 'ri-shield-check-line',
                      text: "Get vaccinated against Hepatitis B — it's free and gives lifelong protection",
                    },
                    {
                      icon: 'ri-test-tube-line',
                      text: 'Keep up with regular HIV and Hep C testing every 3–6 months',
                    },
                    {
                      icon: 'ri-heart-pulse-line',
                      text: "Use condoms to protect against other STIs that PrEP doesn't cover",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-amber-200">
                      <i className={`${item.icon} text-amber-600 text-lg flex-shrink-0 mt-0.5`}></i>
                      <p className="text-sm text-gray-800">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signs of Infection */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Signs of Infection &amp; When to Get Help</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Infections can become serious quickly. Know the warning signs and don't wait to seek
              help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Infection Signs */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i className="ri-pulse-line text-red-600"></i>
                Warning Signs
              </h3>
              <div className="space-y-4">
                {infectionSigns.map((item, index) => (
                  <div
                    key={index}
                    className={`border-l-4 ${item.severity === 'Early' ? 'bg-yellow-50 border-yellow-500' : item.severity === 'Moderate' ? 'bg-orange-50 border-orange-500' : item.severity === 'Serious' ? 'bg-red-50 border-red-500' : 'bg-red-100 border-red-600'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{item.sign}</h4>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          item.severity === 'Early'
                            ? 'bg-yellow-600 text-white'
                            : item.severity === 'Moderate'
                            ? 'bg-orange-600 text-white'
                            : item.severity === 'Serious'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wound Care */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-first-aid-kit-line text-teal-600"></i>
                  Basic Wound Care
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Clean gently:</strong> Wash with mild soap and water, pat dry
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Apply pressure:</strong> Use clean gauze to stop bleeding
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Cover wounds:</strong> Use sterile bandages to protect from dirt
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Change dressings:</strong> Replace bandages daily or when wet
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-checkbox-circle-fill text-teal-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <span className="text-gray-700">
                      <strong>Watch for changes:</strong> Monitor for increased pain or swelling
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-hospital-line text-teal-600"></i>
                  When to Seek Medical Help
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-red-600 flex-shrink-0 mt-1"></i>
                    <span className="text-gray-700">Fever over 38 °C (100.4 °F)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-red-600 flex-shrink-0 mt-1"></i>
                    <span className="text-gray-700">Red streaks spreading from wound</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-red-600 flex-shrink-0 mt-1"></i>
                    <span className="text-gray-700">Pus or foul‑smelling discharge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-red-600 flex-shrink-0 mt-1"></i>
                    <span className="text-gray-700">Increasing pain or swelling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-red-600 flex-shrink-0 mt-1"></i>
                    <span className="text-gray-700">Wound not healing after a week</span>
                  </li>
                </ul>
              </div>

              <div className="bg-teal-600 text-white rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <i className="ri-shield-check-line text-2xl"></i>
                  You Won't Be Judged
                </h4>
                <p className="text-teal-50">
                  Medical professionals are there to help, not judge. Be honest about how the wound
                  happened so they can provide the best treatment. Your health is what matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Needle Exchange Map */}
      <section id="needle-exchanges" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Needle Exchange Locations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Free, confidential needle exchange services in Plymouth. No ID required, no questions
              asked.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Location Cards */}
            <div className="lg:col-span-1 space-y-4">
              {needleExchanges.map((location, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{location.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2">
                      <i className="ri-map-pin-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <span>{location.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="ri-time-line text-teal-600"></i>
                      <span>{location.hours}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="ri-phone-line text-teal-600"></i>
                      <a href={`tel:${location.phone}`} className="hover:text-teal-600 transition-colors">
                        {location.phone}
                      </a>
                    </p>
                  </div>
                </div>
              ))}

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className="ri-information-line text-teal-600"></i>
                  What to Expect
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                    Free clean needles, syringes, and supplies
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                    Safe disposal of used equipment
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                    Confidential service, no ID needed
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                    Advice on safer injection techniques
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                    Testing for HIV and Hepatitis C
                  </li>
                </ul>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                style={{ height: '600px' }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20150.075952828356!2d-4.1627!3d50.3755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c93516bbce6f5%3A0x4d0b7f5c1e9f8c5a!2sPlymouth%2C%20UK!5e0!3m2!1sen!2suk!4v1635789012345!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Needle Exchange Locations in Plymouth"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood‑Borne Virus Testing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <i className="ri-test-tube-line"></i>
              Free Testing Available
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Blood‑Borne Virus Testing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HIV and Hepatitis C are common among people who inject drugs — but both are now
              treatable. Getting tested is free, quick, and confidential. Knowing your status
              protects you and others.
            </p>
          </div>

          {/* Key Message Banner */}
          <div className="bg-teal-600 text-white rounded-2xl p-6 mb-12 flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-flash-line text-3xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                Hepatitis C is now curable — and HIV is treatable
              </h3>
              <p className="text-teal-50 text-lg">
                A short course of tablets clears Hep C in over 95 % of people. HIV treatment means
                people live long, healthy lives and can't pass the virus on. The sooner you know,
                the sooner you can access treatment.
              </p>
            </div>
          </div>

          {/* Virus Info Cards */}
          <div className="space-y-6 mb-14">
            {bbvFacts.map((bbv, index) => (
              <div key={index} className={`${bbv.color} border-2 rounded-2xl p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${bbv.badgeColor} text-white w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <i className={`${bbv.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{bbv.virus}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <i className="ri-share-line text-gray-400"></i> How it spreads
                    </p>
                    <p className="text-sm text-gray-800">{bbv.transmission}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <i className="ri-stethoscope-line text-gray-400"></i> Symptoms
                    </p>
                    <p className="text-sm text-gray-800">{bbv.symptoms}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <i className="ri-capsule-line text-gray-400"></i> Treatment
                    </p>
                    <p className="text-sm text-gray-800">{bbv.treatment}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <i className="ri-test-tube-line text-gray-400"></i> Testing
                    </p>
                    <p className="text-sm text-gray-800">{bbv.testing}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <i className="ri-shield-check-line text-gray-400"></i> Prevention
                    </p>
                    <p className="text-sm text-gray-800">{bbv.prevention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Where to Get Tested */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="ri-map-pin-2-line text-teal-600 text-2xl"></i>
              Where to Get Free Tests in Plymouth
            </h3>
            <p className="text-gray-600 mb-6">
              All services below are free, confidential, and non‑judgmental. No GP referral needed.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {bbvTestingSites.map((site, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${site.icon} text-2xl text-teal-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{site.name}</h4>
                      {site.address && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <i className="ri-map-pin-line text-teal-500"></i>
                          {site.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tests offered */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {site.tests.map((test, i) => (
                      <span
                        key={i}
                        className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {test}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{site.notes}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line text-teal-500"></i>
                      {site.hours}
                    </span>
                    {site.phone && (
                      <a href={`tel:${site.phone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium">
                        <i className="ri-phone-line"></i>
                        {site.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Home Testing + What Happens Next */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Home Testing */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-home-heart-line text-teal-600 text-2xl"></i>
                Prefer to Test at Home?
              </h3>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Free HIV self‑test kits</strong> can be ordered online at{' '}
                    <a
                      href="https://freetesting.hiv"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-teal-600 underline hover:text-teal-700"
                    >
                      freetesting.hiv
                    </a>{' '}
                    — delivered discreetly to your door.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Free Hep C postal test kits</strong> are available via{' '}
                    <a
                      href="https://www.hepctrust.org.uk"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-teal-600 underline hover:text-teal-700"
                    >
                      Hepatitis C Trust
                    </a>{' '}
                    — a simple finger‑prick blood spot card posted back to a lab.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Results are private</strong> — no one else is informed unless you choose to
                    share them.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Support is available</strong> if your result is positive — you won't be
                    left to deal with it alone.
                  </span>
                </li>
              </ul>
            </div>

            {/* What Happens if Positive */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-question-answer-line text-teal-600 text-2xl"></i>
                What Happens if I Test Positive?
              </h3>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <span>
                    <strong>Don't panic.</strong> A positive result means you can now access treatment —
                    which is the best possible outcome.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <span>
                    <strong>A confirmatory test</strong> will be done at a clinic to verify the result
                    before any treatment begins.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <span>
                    <strong>You'll be referred to a specialist</strong> — an infectious disease or
                    hepatology team — who will explain your options.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <span>
                    <strong>Treatment is free on the NHS</strong> and highly effective. For Hep C, a
                    short course of tablets can clear the virus completely.
                  </span>
                </li>
              </ul>
              <div className="mt-5 bg-white rounded-xl p-4 border border-teal-200">
                <p className="text-sm text-teal-800 font-semibold flex items-start gap-2">
                  <i className="ri-shield-check-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  Your information is confidential. Testing services will not contact your GP without
                  your permission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hepatitis B Vaccination Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <i className="ri-shield-cross-line"></i>
              Free Vaccine Available
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hepatitis B Vaccination</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hepatitis B vaccination gives lifelong protection against a serious liver
              infection. It's free for people who inject drugs in Plymouth and is one of the
              most effective ways to protect your health.
            </p>
          </div>

          {/* Why Important Banner */}
          <div className="bg-orange-600 text-white rounded-2xl p-8 mb-12 flex items-start gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-shield-cross-line text-3xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Why Hepatitis B Vaccination is Critical for People Who Inject Drugs
              </h3>
              <p className="text-orange-50 text-lg leading-relaxed mb-4">
                Hepatitis B is <strong className="text-white">30‑100 times more infectious than
                    HIV</strong> and spreads easily through shared needles, syringes, and any injecting
                  equipment. Unlike Hepatitis C, there is no cure for chronic Hepatitis B — but the
                  vaccine prevents infection completely.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">95%+</p>
                  <p className="text-orange-100 text-sm">effective protection</p>
                </div>
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-orange-100 text-sm">on the NHS for at‑risk groups</p>
                </div>
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">Lifelong</p>
                  <p className="text-orange-100 text-sm">protection after full course</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two‑Column Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* About Hep B */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-virus-line text-orange-600 text-2xl"></i>
                About Hepatitis B
              </h3>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <i className="ri-share-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>How it spreads:</strong> Through blood‑to‑blood contact. Sharing needles,
                    syringes, filters, spoons, or water with someone who has Hep B can transmit the
                    virus. Also spreads through unprotected sex.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-pulse-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Symptoms:</strong> Many people have no symptoms initially. Some develop
                    flu‑like illness, fatigue, nausea, or jaundice (yellowing of skin/eyes). Chronic
                    infection can cause serious liver damage over time.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-time-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Acute vs chronic:</strong> Most adults (90%+) clear acute Hep B naturally
                    within 6 months. However, 5‑10% develop chronic infection, which can lead to
                    liver cirrhosis or cancer.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-medicine-bottle-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Treatment:</strong> No cure, but antiviral medication can control chronic
                    Hep B and prevent liver damage. Prevention through vaccination is far better than
                    treatment.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-alert-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>High infectivity:</strong> Hep B is much more infectious than HIV —
                    even tiny amounts of infected blood can transmit the virus.
                  </span>
                </li>
              </ul>
            </div>

            {/* Vaccination Process */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-syringe-line text-orange-600 text-2xl"></i>
                The Vaccination Process
              </h3>
              <div className="space-y-4">
                {/* Standard Course */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">
                    Standard Course (Most Common)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      First dose — immediate protection begins
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      Second dose — 1 month later
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      Third dose — 6 months after first dose
                    </li>
                  </ul>
                  <p className="text-xs text-orange-700 mt-3 font-semibold">
                    ⚡ Protection: Good after 2 doses, excellent after 3 doses
                  </p>
                </div>

                {/* Accelerated Course */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">
                    Accelerated Course (High Risk)
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      First dose — day 0
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      Second dose — 1 week later
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      Third dose — 3 weeks after first
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      Booster — 12 months later
                    </li>
                  </ul>
                  <p className="text-xs text-red-700 mt-3 font-semibold">
                    🚨 For people at immediate high risk of exposure
                  </p>
                </div>

                {/* Blood Test Note */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <i className="ri-information-line text-orange-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <span>
                      <strong>Blood test first:</strong> Before starting vaccination, you'll have a
                      blood test to check if you already have Hep B or are immune from previous
                      infection.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Where to Get Vaccinated */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="ri-map-pin-2-line text-orange-600"></i>
              Where to Get Free Hepatitis B Vaccination in Plymouth
            </h3>
            <p className="text-gray-600 mb-6">
              Hepatitis B vaccination is free for people who inject drugs. All services below are
              confidential and non‑judgmental.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {prepPlymouthSites.map((site, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${site.icon} text-2xl text-teal-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{site.name}</h4>
                      {site.address && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <i className="ri-map-pin-line text-teal-500"></i>
                          {site.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{site.notes}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line text-teal-500"></i>
                      {site.hours}
                    </span>
                    {site.phone && (
                      <a href={`tel:${site.phone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium">
                        <i className="ri-phone-line"></i>
                        {site.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Effects & Safety */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Side Effects */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-thermometer-line text-orange-600 text-2xl"></i>
                Side Effects &amp; Safety
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                The Hepatitis B vaccine is very safe. Most people have no side effects, and serious
                reactions are extremely rare.
              </p>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                    <i className="ri-check-line text-green-600"></i>
                    Common (but mild) side effects
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Soreness, redness, or swelling at injection site</li>
                    <li>• Mild headache or fatigue</li>
                    <li>• Low‑grade fever</li>
                    <li>• Muscle aches</li>
                  </ul>
                  <p className="text-xs text-green-700 mt-2 font-medium">
                    These usually last 1‑2 days and are signs your immune system is responding
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1">
                    <i className="ri-alert-line text-red-600"></i>
                    Seek medical help if you experience
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Severe allergic reaction (very rare)</li>
                    <li>• Difficulty breathing or swelling of face/throat</li>
                    <li>• High fever over 39 °C (102 °F)</li>
                    <li>• Severe pain at injection site</li>
                  </ul>
                  <p className="text-xs text-red-700 mt-2 font-medium">
                    Call 999 for severe reactions — but these are extremely rare
                  </p>
                </div>
              </div>
            </div>

            {/* Effectiveness & Protection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-shield-check-line text-orange-600 text-2xl"></i>
                How Well Does it Work?
              </h3>

              <div className="space-y-5">
                <div className="text-center bg-orange-50 rounded-xl p-5">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">95%</span>
                  </div>
                  <p className="font-bold text-gray-900 mb-1">Effectiveness Rate</p>
                  <p className="text-sm text-gray-600">
                    Over 95% of healthy adults develop protective immunity after the full 3‑dose
                    course
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>After 1st dose:</strong> Some protection begins within days
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>After 2nd dose:</strong> Good protection (around 80‑85%)
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>After 3rd dose:</strong> Maximum protection (95%+) — lasts for life
                    </p>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <p className="text-sm text-teal-800 flex items-start gap-2">
                    <i className="ri-lightbulb-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <span>
                      <strong>Lifelong protection:</strong> Once you complete the course and develop
                      immunity, you're protected for life. No booster shots needed for most people.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-2xl text-orange-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Important: Complete the Full Course</h3>
                <p className="text-gray-700 mb-4">
                  Many people get their first dose but never return for the second and third
                  doses. This leaves you only partially protected. <strong>It's crucial to complete
                      the full course</strong> to get maximum lifelong protection.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: 'ri-calendar-line',
                      text: 'Set reminders for your follow‑up appointments — put them in your phone calendar',
                    },
                    {
                      icon: 'ri-card-3-line',
                      text: "Keep your vaccination record card safe — you'll need it to track your doses",
                    },
                    {
                      icon: 'ri-phone-line',
                      text: "If you miss an appointment, call as soon as possible to rebook — don't start the course over",
                    },
                    {
                      icon: 'ri-team-line',
                      text: 'Tell your support worker or key worker about your vaccination — they can help you remember',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-orange-200">
                      <i className={`${item.icon} text-orange-600 text-lg flex-shrink-0 mt-0.5`}></i>
                      <p className="text-sm text-gray-800">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-orange-800 font-semibold flex items-center gap-2">
                    <i className="ri-shield-cross-line text-orange-600"></i>
                    Remember: Prevention is always better than treatment. This vaccine could
                    save your life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PrEP Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
              <i className="ri-shield-check-line"></i>
              Free on the NHS
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">PrEP — HIV Prevention Pill</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              PrEP is a medication that prevents HIV infection. It's free on the NHS in Plymouth
              and is highly effective when taken correctly. If you inject drugs, PrEP could protect
              your life.
            </p>
          </div>

          {/* What is PrEP Banner */}
          <div className="bg-teal-600 text-white rounded-2xl p-8 mb-12 flex items-start gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-capsule-line text-3xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">What is PrEP?</h3>
              <p className="text-teal-50 text-lg leading-relaxed mb-3">
                PrEP stands for <strong className="text-white">Pre‑Exposure Prophylaxis</strong>.
                It's a daily tablet (or event‑based dosing) taken by HIV‑negative people to prevent
                them from getting HIV. The medication — usually a combination of tenofovir and
                emtricitabine — works by blocking HIV from establishing an infection in your body.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">99%</p>
                  <p className="text-teal-100 text-sm">effective when taken correctly</p>
                </div>
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-teal-100 text-sm">on the NHS in England</p>
                </div>
                <div className="bg-white/20 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold">Daily</p>
                  <p className="text-teal-100 text-sm">or event‑based dosing</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works + PrEP vs PEP */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* How it Works */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-question-line text-teal-600 text-2xl"></i>
                How Does PrEP Work?
              </h3>
              <ul className="space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Daily dosing:</strong> Take one tablet every day at the same time.
                    Protection builds up after 7 days of consistent use for injection‑related HIV
                    risk.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Event‑based dosing (2‑1‑1):</strong> Take 2 tablets 2–24 hours before
                    sex, 1 tablet 24 hours after, and 1 tablet 48 hours after.{' '}
                    <em>Note: event‑based dosing is not recommended for people who inject drugs — daily dosing is safer.</em>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>It doesn't protect against other STIs</strong> — use condoms alongside
                    PrEP for broader protection.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>PrEP is not a cure</strong> — it only works while you're taking it. If
                    you stop, protection ends.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <span>
                    <strong>Side effects are usually mild</strong> — some people experience nausea
                    or headaches in the first few weeks. These typically pass. Kidney function is
                    monitored regularly.
                  </span>
                </li>
              </ul>
            </div>

            {/* PrEP vs PEP */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <i className="ri-scales-line text-teal-600 text-2xl"></i>
                PrEP vs PEP — What's the Difference?
              </h3>
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PrEP
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Pre‑Exposure Prophylaxis</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Taken <strong>before</strong> potential HIV exposure</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Ongoing daily medication</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <strong>For people at ongoing high risk</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-teal-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Free on the NHS — prescribed at sexual health clinics</strong>
                    </li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PEP
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Post‑Exposure Prophylaxis</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Taken <strong>after</strong> a potential HIV exposure</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Emergency 28‑day course — must start within 72 hours</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                      <strong>For one‑off exposures (e.g. needle‑stick injury)</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-arrow-right-s-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                      <strong>Available free at A&amp;E or sexual health clinics</strong>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <i className="ri-lightbulb-line text-teal-600 mr-1"></i>
                    <strong>If you're regularly injecting, PrEP is the better long‑term option.</strong>{' '}
                    PEP is for emergencies only and is not a substitute for ongoing prevention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Who is PrEP For */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="ri-user-heart-line text-teal-600"></i>
              Who is PrEP For?
            </h3>
            <p className="text-gray-600 mb-6">
              PrEP is recommended for anyone at high risk of HIV. You may be eligible if any of
              the following apply to you:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prepEligibility.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-xl text-teal-600`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.label}</p>
                    <p className="text-xs text-gray-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-teal-50 border border-teal-200 rounded-xl p-5">
              <p className="text-sm text-teal-800 flex items-start gap-2">
                <i className="ri-information-line text-teal-600 text-lg flex-shrink-0 mt-0.5"></i>
                <span>
                  <strong>Not sure if you qualify?</strong> You don't need to meet a specific
                  checklist. Any sexual health clinic can assess your individual risk and advise
                  whether PrEP is right for you — no judgment, no referral needed.
                </span>
              </p>
            </div>
          </div>

          {/* How to Access PrEP */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="ri-list-check-2 text-teal-600"></i>
              How to Access PrEP Free on the NHS
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {prepSteps.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <i className={`${item.icon} text-xl text-teal-600`}></i>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Where to Get PrEP */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <i className="ri-map-pin-2-line text-teal-600"></i>
              Where to Get PrEP in Plymouth
            </h3>
            <p className="text-gray-600 mb-6">
              Hepatitis B vaccination is free for people who inject drugs in Plymouth and is one of the
              most effective ways to protect your health.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {prepPlymouthSites.map((site, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${site.icon} text-2xl text-teal-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{site.name}</h4>
                      {site.address && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <i className="ri-map-pin-line text-teal-500"></i>
                          {site.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{site.notes}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line text-teal-500"></i>
                      {site.hours}
                    </span>
                    {site.phone && (
                      <a href={`tel:${site.phone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium">
                        <i className="ri-phone-line"></i>
                        {site.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PrEP Complementary Advice */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-alert-line text-2xl text-amber-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PrEP Works Best Alongside Other Harm Reduction</h3>
                <p className="text-gray-700 mb-4">
                  PrEP is highly effective, but it works best as part of a broader approach to staying
                  safe:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: 'ri-syringe-line',
                      text: 'Always use a clean needle — PrEP does not protect against Hepatitis C or B',
                    },
                    {
                      icon: 'ri-shield-check-line',
                      text: "Get vaccinated against Hepatitis B — it's free and gives lifelong protection",
                    },
                    {
                      icon: 'ri-test-tube-line',
                      text: 'Keep up with regular HIV and Hep C testing every 3–6 months',
                    },
                    {
                      icon: 'ri-heart-pulse-line',
                      text: "Use condoms to protect against other STIs that PrEP doesn't cover",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-amber-200">
                      <i className={`${item.icon} text-amber-600 text-lg flex-shrink-0 mt-0.5`}></i>
                      <p className="text-sm text-gray-800">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Common questions about safer injection and harm reduction
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <i className={`ri-arrow-${openFAQ === index ? 'up' : 'down'}-s-line text-2xl text-teal-600 flex-shrink-0`}></i>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Need More Support?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-teal-50">
            We're here to help with naloxone kits, peer support, and any questions you have. No
            judgment, just support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/get-naloxone"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap inline-flex items-center gap-2"
            >
              <i className="ri-medicine-bottle-line text-xl"></i>
              Get Free Naloxone Kit
            </Link>
            <Link
              to="/peer-support"
              className="bg-teal-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-400 transition-colors whitespace-nowrap inline-flex items-center gap-2"
            >
              <i className="ri-team-line text-xl"></i>
              Connect with Peer Support
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors whitespace-nowrap inline-flex items-center gap-2"
            >
              <i className="ri-question-line text-xl"></i>
              Ask a Question
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-teal-400/30">
            <p className="text-teal-100 text-lg">
              <strong>24/7 Crisis Support:</strong> Call{' '}
              <a href="tel:999" className="underline hover:text-white">
                999
              </a>{' '}
              on emergencies or{' '}
              <a href="tel:111" className="underline hover:text-white">
                111
              </a>{' '}
              for urgent medical advice
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Share CTA */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-share-forward-2-line text-3xl text-teal-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Found This Guide Helpful?</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Share it with someone who might need it. This information is free, confidential, and could help keep someone safe.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className={`${opt.color} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap text-sm font-semibold`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${opt.icon} text-base`}></i>
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaferInjectionPage;
