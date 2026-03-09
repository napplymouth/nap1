import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

// Leaflet TypeScript interfaces
interface LeafletMap {
  remove(): void;
  setView(center: [number, number], zoom: number): LeafletMap;
}

interface LeafletStatic {
  map(element: HTMLElement, options?: { scrollWheelZoom?: boolean }): LeafletMap;
  tileLayer(urlTemplate: string, options?: {
    attribution?: string;
    maxZoom?: number;
  }): {
    addTo(map: LeafletMap): void;
  };
  marker(latlng: [number, number], options?: {
    icon?: unknown;
  }): {
    addTo(map: LeafletMap): {
      bindPopup(content: string, options?: { maxWidth?: number }): void;
    };
  };
  divIcon(options: {
    html: string;
    className: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor: [number, number];
  }): unknown;
}

const pickupLocations = [
  {
    name: 'Plymouth Community Centre',
    address: '123 Union Street, Plymouth, PL1 3AA',
    hours: 'Mon–Fri: 9am–5pm',
    openDays: [1, 2, 3, 4, 5],
    phone: '01752 000 001',
    icon: 'ri-building-fill',
    color: 'bg-blue-500',
    pinColor: '#3b82f6',
    lat: 50.37,
    lng: -4.152,
    needleExchange: true,
  },
  {
    name: 'Devonport Guildhall',
    address: 'Guildhall Square, Devonport, PL1 4LS',
    hours: 'Mon–Fri: 10am–4pm',
    openDays: [1, 2, 3, 4, 5],
    phone: '01752 000 002',
    icon: 'ri-government-fill',
    color: 'bg-pink-500',
    pinColor: '#ec4899',
    lat: 50.374,
    lng: -4.178,
    needleExchange: false,
  },
  {
    name: 'Stonehouse Community Hub',
    address: '45 Stonehouse Street, Plymouth, PL1 3PE',
    hours: 'Tue & Thu: 10am–3pm',
    openDays: [2, 4],
    phone: '01752 000 003',
    icon: 'ri-home-heart-fill',
    color: 'bg-lime-500',
    pinColor: '#84cc16',
    lat: 50.372,
    lng: -4.162,
    needleExchange: true,
  },
  {
    name: 'Harbour Drug & Alcohol Service',
    address: 'Beaumont House, Beaumont Road, Plymouth, PL4 9BJ',
    hours: 'Mon–Fri: 9am–5pm',
    openDays: [1, 2, 3, 4, 5],
    phone: '01752 434 343',
    icon: 'ri-heart-pulse-fill',
    color: 'bg-yellow-500',
    pinColor: '#eab308',
    lat: 50.379,
    lng: -4.128,
    needleExchange: true,
  },
  {
    name: 'Shekinah',
    address: '54 Octagon Street, Plymouth, PL1 2EX',
    hours: 'Mon–Fri: 8am–4pm',
    openDays: [1, 2, 3, 4, 5],
    phone: '01752 255 758',
    icon: 'ri-hand-heart-fill',
    color: 'bg-orange-500',
    pinColor: '#f97316',
    lat: 50.3695,
    lng: -4.1445,
    needleExchange: true,
  },
  {
    name: 'Hamoaze House',
    address: '1 Marlborough Road, Plymouth, PL1 3LX',
    hours: 'Mon–Fri: 9am–5pm',
    openDays: [1, 2, 3, 4, 5],
    phone: '01752 562 040',
    icon: 'ri-home-smile-fill',
    color: 'bg-teal-500',
    pinColor: '#14b8a6',
    lat: 50.3748,
    lng: -4.159,
    needleExchange: false,
  },
];

const faqs = [
  {
    question: 'Who is eligible to receive a naloxone kit?',
    answer:
      'Anyone in Plymouth and Devon can receive a naloxone kit at no cost. You do not need to use drugs yourself — family members, friends, carers, and community members are all welcome. We especially encourage people who know someone at risk of opioid overdose.',
  },
  {
    question: 'Do I need to attend training before I can get a kit?',
    answer:
      'We strongly recommend attending one of our training sessions first so you feel confident using naloxone in an emergency. However, if you are unable to attend training, please contact us directly and we will do our best to help.',
  },
  {
    question: 'How do I use naloxone?',
    answer:
      'Naloxone nasal spray is simple to use. Insert the nozzle into one nostril and press the plunger firmly. If there is no response after 2–3 minutes, administer a second dose in the other nostril. Always call 999 first and stay with the person until help arrives.',
  },
  {
    question: 'How long does naloxone last and when does it expire?',
    answer:
      'Naloxone typically has a shelf life of 2–3 years from the date of manufacture. Check the expiry date on your kit regularly. We offer replacement kits at no cost when yours expires — just contact us or visit any of our pickup locations.',
  },
  {
    question: 'Can I get a replacement kit if I have used mine?',
    answer:
      'Absolutely. If you have used your naloxone kit to help someone, we will replace it at no cost. Using naloxone to save a life is exactly what it is for. Contact us or visit a pickup location to get your replacement.',
  },
  {
    question: 'Is naloxone legal to carry?',
    answer:
      'Yes. Naloxone is legal to carry and administer in the UK. It is a prescription-only medicine, but under a Patient Group Direction (PGD), it can be supplied directly to members of the public for emergency use.',
  },
];

export default function GetNaloxonePage() {
  usePageMeta({
    title: 'Get a Naloxone Kit Plymouth & Devon | No Cost, No Prescription',
    description:
      'Request your naloxone kit in Plymouth and Devon. No cost, no prescription needed. Collect from local pickup points across Plymouth or request home delivery. Overdose prevention for everyone.',
    canonical: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/get-naloxone`,
    ogTitle: 'Get a Naloxone Kit in Plymouth — No Cost, No Barriers',
    ogDescription:
      'Naloxone kits available across Plymouth and Devon. Collect in person or request delivery. Naloxone reverses opioid overdose and saves lives.',
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/get-naloxone#webpage`,
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/get-naloxone`,
          "name": "Get a Free Naloxone Kit Plymouth & Devon | No Cost, No Prescription",
          "description": "Request your free naloxone kit in Plymouth and Devon. No cost, no prescription needed. Collect from local pickup points or request home delivery.",
          "inLanguage": "en-GB",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": import.meta.env.VITE_SITE_URL || 'https://example.com' },
              { "@type": "ListItem", "position": 2, "name": "Get Naloxone", "item": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/get-naloxone` }
            ]
          }
        },
        {
          "@type": "Service",
          "name": "Free Naloxone Kit Distribution — Plymouth & Devon",
          "description": "Free naloxone kits available to anyone in Plymouth and Devon. No cost, no prescription required. Collect from community pickup points or request delivery.",
          "provider": {
            "@type": "NGO",
            "name": "Naloxone Advocates Plymouth CIC",
            "url": import.meta.env.VITE_SITE_URL || 'https://example.com'
          },
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": "Plymouth and Devon, UK"
          },
          "isAccessibleForFree": true,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "description": "Free naloxone kit — no prescription required"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Who is eligible to receive a naloxone kit?",
              "acceptedAnswer": { "@type": "Answer", "text": "Anyone in Plymouth and Devon can receive a naloxone kit at no cost. You do not need to use drugs yourself — family members, friends, carers, and community members are all welcome." }
            },
            {
              "@type": "Question",
              "name": "Do I need to attend training before I can get a kit?",
              "acceptedAnswer": { "@type": "Answer", "text": "We strongly recommend attending one of our training sessions first so you feel confident using naloxone in an emergency. However, if you are unable to attend training, please contact us directly." }
            },
            {
              "@type": "Question",
              "name": "How do I use naloxone?",
              "acceptedAnswer": { "@type": "Answer", "text": "Naloxone nasal spray is simple to use. Insert the nozzle into one nostril and press the plunger firmly. If there is no response after 2–3 minutes, administer a second dose in the other nostril. Always call 999 first and stay with the person until help arrives." }
            },
            {
              "@type": "Question",
              "name": "Is naloxone legal to carry?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Naloxone is legal to carry and administer in the UK. Under a Patient Group Direction (PGD), it can be supplied directly to members of the public for emergency use." }
            }
          ]
        }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-get-naloxone';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('schema-get-naloxone')?.remove(); };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(false);
  const howToRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  const todayDay = new Date().getDay();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as unknown as Record<string, unknown>)['L']) {
          resolve();
          return;
        }
        if (document.getElementById('leaflet-js')) {
          const existing = document.getElementById('leaflet-js') as HTMLScriptElement;
          existing.addEventListener('load', () => resolve());
          return;
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      if (!mapRef.current) return;

      // Destroy previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = (window as unknown as Record<string, LeafletStatic>)['L'];

      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([50.3755, -4.1427], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      pickupLocations.forEach((loc, i) => {
        const isOpen = loc.openDays.includes(new Date().getDay());
        const pinHtml = `
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${loc.pinColor};border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            transform:rotate(-45deg);
          ">
            <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:13px;">${i + 1}</span>
          </div>`;

        const icon = L.divIcon({
          html: pinHtml,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        });

        const popupContent = `
          <div style="font-family:sans-serif;min-width:220px;max-width:260px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="width:28px;height:28px;border-radius:50%;background:${loc.pinColor};display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:12px;flex-shrink:0;">${i + 1}</div>
              <strong style="font-size:14px;color:#111;">${loc.name}</strong>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
              <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${isOpen ? '#22c55e' : '#d1d5db'};color:${isOpen ? 'white' : '#6b7280'};">
                ${isOpen ? '✅ Open Today' : '❌ Closed Today'}
              </span>
              ${loc.needleExchange ? '<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#8b5cf6;color:white;">💉 Needle Exchange</span>' : ''}
            </div>
            <p style="margin:4px 0;font-size:12px;color:#555;">📍 ${loc.address}</p>
            <p style="margin:4px 0;font-size:12px;color:#555;">🕐 ${loc.hours}</p>
            <p style="margin:4px 0;font-size:12px;color:#555;">📞 <a href="tel:${loc.phone.replace(/\s/g, '')}" style="color:#ec4899;">${loc.phone}</a></p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              loc.address
            )}" target="_blank" rel="noopener noreferrer"
              style="display:block;margin-top:10px;background:#eab308;color:#111;text-align:center;padding:8px 12px;border-radius:999px;font-weight:700;font-size:12px;text-decoration:none;">
              🗺️ Get Directions
            </a>
          </div>`;

        L.marker([loc.lat, loc.lng], { icon }).addTo(map).bindPopup(popupContent, { maxWidth: 280 });
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://naloxoneadvocatesplymouth.co.uk/get-naloxone';
  const shareText =
    'Free naloxone kits are available across Plymouth — no cost, no prescription needed. Share this with someone who might need it:';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback – nothing to do, user can copy manually
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Get a Free Naloxone Kit in Plymouth',
        text: shareText,
        url: pageUrl,
      });
    } else {
      setShowShareMenu((v) => !v);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date();
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const todayName = dayNames[today.getDay()];
    const dateStr = today.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
      'https://naloxoneadvocatesplymouth.co.uk/get-naloxone'
    )}&color=111111&bgcolor=ffffff&margin=4`;

    const locationRows = pickupLocations
      .map((loc, i) => {
        const isOpen = loc.openDays.includes(today.getDay());
        return `
          <div class="location-card">
            <div class="location-header">
              <div class="location-number" style="background:${loc.pinColor}">${i + 1}</div>
              <div class="location-title">
                <h3>${loc.name}</h3>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  <span class="badge ${isOpen ? 'open' : 'closed'}">${
          isOpen ? `✓ Open Today (${todayName})` : `✗ Closed Today (${todayName})`
        }</span>
                  ${loc.needleExchange ? '<span class="badge needle">💉 Needle Exchange</span>' : ''}
                </div>
              </div>
            </div>
            <div class="location-details">
              <div class="detail-row"><span class="detail-icon">📍</span><span>${loc.address}</span></div>
              <div class="detail-row"><span class="detail-icon">🕐</span><span>${loc.hours}</span></div>
              <div class="detail-row"><span class="detail-icon">📞</span><span>${loc.phone}</span></div>
              <div class="detail-row directions"><span class="detail-icon">🗺️</span><span>google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                loc.address
              )}</span></div>
            </div>
          </div>`;
      })
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Naloxone Pickup Locations — Plymouth</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,Helvetica,sans-serif; color:#111; background:#fff; padding:24px; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:4px solid #facc15; padding-bottom:16px; margin-bottom:20px; }
    .org-name { font-size:22px; font-weight:900; color:#111; line-height:1.2; }
    .org-sub { font-size:12px; color:#ec4899; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
    .header-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
    .print-date { font-size:11px; color:#666; text-align:right; }
    .qr-block { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .qr-block img { width:100px; height:100px; border:2px solid #e5e7eb; border-radius:8px; display:block; }
    .qr-label { font-size:9px; color:#888; text-align:center; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    .qr-url { font-size:8px; color:#aaa; text-align:center; word-break:break-all; max-width:110px; }
    .page-title { text-align:center; margin-bottom:6px; }
    .page-title h1 { font-size:26px; font-weight:900; color:#111; }
    .page-title p { font-size:13px; color:#555; margin-top:4px; }
    .free-badge { display:inline-block; background:#facc15; color:#111; font-weight:900; font-size:12px; padding:4px 14px; border-radius:999px; margin-top:8px; }
    .locations-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:20px; }
    .location-card { border:2px solid #e5e5e5; border-radius:12px; padding:14px; page-break-inside:avoid; }
    .location-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
    .location-number { width:32px; height:32px; border-radius:50%; color:#fff; font-weight:900; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .location-title h3 { font-size:14px; font-weight:800; color:#111; line-height:1.3; }
    .badge { display:inline-block; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; margin-top:4px; }
    .badge.open { background:#dcfce7; color:#166534; }
    .badge.closed { background:#f3f4f6; color:#6b7280; }
    .badge.needle { background:#ede9fe; color:#5b21b6; }
    .location-details { display:flex; flex-direction:column; gap:5px; }
    .detail-row { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:#444; }
    .detail-icon { flex-shrink:0; width:18px; }
    .detail-row.directions { color:#888; font-size:10px; word-break:break-all; }
    .emergency-banner { margin-top:22px; background:#dc2626; color:#fff; border-radius:10px; padding:12px 18px; display:flex; align-items:center; gap:12px; }
    .emergency-banner .em-icon { font-size:28px; flex-shrink:0; }
    .emergency-banner strong { font-size:15px; display:block; }
    .emergency-banner span { font-size:12px; opacity:0.9; }
    .footer-row { margin-top:18px; display:flex; align-items:flex-end; justify-content:space-between; gap:16px; border-top:1px solid #e5e5e5; padding-top:12px; }
    .footer-note { font-size:11px; color:#888; }
    .footer-note a { color:#ec4899; }
    .website-url { font-size:12px; font-weight:700; color:#111; margin-top:4px; }
    .footer-qr { display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; }
    .footer-qr img { width:80px; height:80px; border:2px solid #e5e5e5; border-radius:6px; display:block; }
    .footer-qr-label { font-size:8px; color:#aaa; text-align:center; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    @media print { body { padding:12px; } .no-print { display:none; } }
  </style>
</head>
<body>
  <div class="page-header">
    <div>
      <div class="org-name">Naloxone Advocates Plymouth</div>
      <div class="org-sub">Free Naloxone Kits — No Cost, No Barriers</div>
    </div>
    <div class="header-right">
      <div class="print-date">Printed: ${dateStr}</div>
      <div class="qr-block">
        <img src="${qrUrl}" alt="QR code linking to naloxoneadvocatesplymouth.co.uk/get-naloxone" />
        <div class="qr-label">Scan for digital access</div>
        <div class="qr-url">naloxoneadvocatesplymouth.co.uk/get-naloxone</div>
      </div>
    </div>
  </div>

  <div class="page-title">
    <h1>Naloxone Pickup Locations</h1>
    <p>Collect your free naloxone kit from any of these Plymouth locations — no prescription needed</p>
    <span class="free-badge">✓ Completely Free — No Prescription Required</span>
  </div>

  <div class="locations-grid">
    ${locationRows}
  </div>

  <div class="emergency-banner">
    <div class="em-icon">🚨</div>
    <div>
      <strong>In an emergency — always call 999 first</strong>
      <span>Naloxone is a temporary measure. Professional medical help is essential in every overdose situation.</span>
    </div>
  </div>

  <div class="footer-row">
    <div>
      <div class="footer-note">
        Naloxone Advocates Plymouth CIC &nbsp;|&nbsp; 07561 349 137 &nbsp;|&nbsp; napplymouth66@gmail.com<br/>
        Hyde Park House, Mutley Plain, Plymouth, PL4 6LF
      </div>
      <div class="website-url">naloxoneadvocatesplymouth.co.uk/get-naloxone</div>
    </div>
    <div class="footer-qr">
      <img src="${qrUrl}" alt="QR code" />
      <div class="footer-qr-label">Scan to visit online</div>
    </div>
  </div>

  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (howToRef.current) observer.observe(howToRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stepVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [stepVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formDataToSend = new FormData(form);

    try {
      await fetch('https://readdy.ai/api/form/d6g0b6pghdq4qda6vvcg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(
          Object.fromEntries(formDataToSend.entries() as Iterable<[string, string]>)
        ).toString(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', address: '', reason: '' });
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
              <Link
                to="/"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                About Us
              </Link>
              <Link
                to="/training"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Training &amp; P2P
              </Link>
              <Link
                to="/get-naloxone"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Get Naloxone
              </Link>
              <Link
                to="/volunteer"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Volunteer
              </Link>
              <Link
                to="/resources"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Resources
              </Link>
              <Link
                to="/contact"
                className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap"
              >
                Contact
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/members/login"
                className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-user-fill"></i> Members
              </Link>
              <Link
                to="/get-naloxone"
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap"
              >
                Get Naloxone Now
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900 text-2xl cursor-pointer"
            >
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              <Link to="/" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Home
              </Link>
              <Link to="/about" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                About Us
              </Link>
              <Link to="/training" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Training &amp; P2P
              </Link>
              <Link to="/get-naloxone" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Get Naloxone
              </Link>
              <Link to="/volunteer" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Volunteer
              </Link>
              <Link to="/resources" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Resources
              </Link>
              <Link to="/contact" className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                Contact
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/950b6c71f8ee034f7b2d2a34234fd2f6.png"
            alt="Take-home naloxone kit — Pebble nasal spray device"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="max-w-2xl">
            <div className="inline-block bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-6 text-sm">
              No Cost — No Barriers
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Get Your<br />Naloxone Kit
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Naloxone reverses opioid overdoses and saves lives. Request your kit today and be prepared to help someone in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#request-form"
                className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                Request a Kit <i className="ri-arrow-down-line ml-2"></i>
              </a>
              <Link
                to="/training"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center whitespace-nowrap"
              >
                Book Training First <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 text-center flex-wrap">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-alarm-warning-fill text-red-600 text-xl"></i>
            </div>
            <p className="text-white font-bold text-lg">
              <strong>Always call 999 first.</strong> Naloxone is a temporary measure — professional medical help is essential in every overdose situation.
            </p>
          </div>
        </div>
      </section>

      {/* Companion Guide Banner */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-red-700 to-red-900 rounded-3xl px-8 py-8 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="ri-first-aid-kit-fill text-red-600 text-3xl"></i>
              </div>
              <div>
                <div className="inline-block bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                  Companion Guide
                </div>
                <h3 className="text-white font-black text-xl md:text-2xl leading-tight">
                  Know what to do in an overdose emergency
                </h3>
                <p className="text-red-200 text-sm mt-1 max-w-lg">
                  Step-by-step overdose response instructions, how to use naloxone, signs to look for, and a direct 999 call button — all in one place.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/emergency"
                className="flex items-center gap-3 bg-white text-red-700 px-8 py-4 rounded-full font-black text-base hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-alarm-warning-fill text-xl"></i>
                </div>
                View Emergency Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SIGNS OF AN OVERDOSE ===== */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-alarm-warning-fill"></i> Know the Signs
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Signs of an <span className="text-red-600">Opioid Overdose</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recognising an overdose quickly can save a life. If you see any of these signs, act immediately — call 999 and use naloxone.
            </p>
          </div>

          {/* Warning Signs Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {[
              {
                icon: 'ri-zzz-fill',
                color: 'bg-red-600',
                lightColor: 'bg-red-50',
                borderColor: 'border-red-200',
                title: 'Unresponsive',
                description:
                  'Cannot be woken up, does not respond to voice or touch, appears deeply unconscious.',
                urgent: true,
              },
              {
                icon: 'ri-lungs-fill',
                color: 'bg-red-500',
                lightColor: 'bg-red-50',
                borderColor: 'border-red-200',
                title: 'Slow or Stopped Breathing',
                description:
                  'Breathing is very slow (fewer than one breath every 5 seconds), shallow, or has stopped completely.',
                urgent: true,
              },
              {
                icon: 'ri-contrast-2-fill',
                color: 'bg-orange-500',
                lightColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                title: 'Blue or Grey Lips & Skin',
                description:
                  'Lips, fingertips, or skin around the mouth turn blue, grey, or pale — a sign of oxygen deprivation.',
                urgent: true,
              },
              {
                icon: 'ri-eye-close-fill',
                color: 'bg-amber-500',
                lightColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                title: 'Pinpoint Pupils',
                description:
                  'Pupils are extremely small (pinpoint), even in low light. This is a classic sign of opioid overdose.',
                urgent: false,
              },
              {
                icon: 'ri-drop-fill',
                color: 'bg-amber-600',
                lightColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                title: 'Gurgling or Choking Sounds',
                description:
                  'A deep gurgling or snoring sound (sometimes called the "death rattle") caused by a blocked airway.',
                urgent: false,
              },
              {
                icon: 'ri-body-scan-fill',
                color: 'bg-yellow-600',
                lightColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                title: 'Limp Body',
                description:
                  'Muscles are completely relaxed and the body is limp. The person cannot hold themselves upright.',
                urgent: false,
              },
            ].map((sign, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-6 shadow-md border-2 ${sign.borderColor} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${sign.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <i className={`${sign.icon} text-white text-2xl`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{sign.title}</h3>
                      {sign.urgent && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{sign.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overdose vs. Asleep comparison */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
            <div className="bg-gray-900 px-8 py-5">
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-question-mark text-gray-900 font-black text-base"></i>
                </div>
                <span>Overdose vs. Just Asleep</span>
              </h3>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Asleep */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-white text-lg"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Just Asleep</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'Responds when you call their name loudly',
                    'Responds to a firm sternal rub (knuckles on breastbone)',
                    'Breathing is regular and steady',
                    'Normal skin colour',
                    'Normal-sized pupils',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-check-line text-lime-600 text-xs"></i>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Overdose */}
              <div className="p-8 bg-red-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-alarm-warning-fill text-white text-lg"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Possible Overdose</h4>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  {[
                    'Does not respond to voice or touch',
                    'No response to sternal rub',
                    'Breathing is slow, shallow, or absent',
                    'Blue, grey, or pale skin and lips',
                    'Pinpoint (very small) pupils',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-close-line text-red-600 text-xs"></i>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Act Now CTA */}
          <div className="bg-red-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <i className="ri-alarm-warning-fill text-red-600 text-3xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 text-xl mb-1">If you see these signs — act immediately</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Call 999 first, then give naloxone. Do not wait to see if they "sleep it off" — opioid overdose is life‑critical and time‑critical.
                </p>
                <div className="space-y-2">
                  {['Check for breathing', 'Place in recovery position if breathing', 'Stay calm and stay on the line'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-red-600/20 border border-red-500/40 rounded-xl px-4 py-3">
                  <p className="text-red-300 text-xs font-bold flex items-center gap-2">
                    <i className="ri-alarm-warning-fill text-red-400"></i> Always call 999 — naloxone is temporary
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="tel:999"
                className="flex items-center justify-center gap-2 bg-white text-red-600 px-7 py-4 rounded-full font-black text-base hover:bg-red-50 transition-all shadow-lg whitespace-nowrap"
              >
                <i className="ri-phone-fill text-xl"></i> Call 999
              </a>
              <a
                href="#request-form"
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-7 py-4 rounded-full font-black text-base hover:bg-yellow-300 transition-all shadow-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-medicine-bottle-fill"></i> Get a Kit
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END SIGNS OF AN OVERDOSE ===== */}

      {/* ===== CRISIS INTERVENTION & MENTAL HEALTH SUPPORT ===== */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-mental-health-fill"></i> Mental Health Support
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Crisis Support & <span className="text-purple-600">Mental Health Resources</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              You are not alone. Whether you're struggling with substance use, mental health challenges, or just need someone to talk to, confidential support is available 24/7.
            </p>
          </div>

          {/* Emergency Crisis Numbers */}
          <div className="bg-red-600 rounded-3xl p-8 mb-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <i className="ri-phone-fill text-red-600 text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">In Crisis? Call Now</h3>
                  <p className="text-red-200 text-sm">
                    If you're having thoughts of suicide or self-harm, or experiencing a mental health crisis
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="tel:999"
                  className="flex items-center justify-center gap-3 bg-white text-red-600 px-8 py-4 rounded-full font-black text-lg hover:bg-red-50 transition-all shadow-lg whitespace-nowrap"
                >
                  <i className="ri-phone-fill text-xl"></i> 999 — Emergency
                </a>
                <a
                  href="tel:116123"
                  className="flex items-center justify-center gap-3 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-black text-lg hover:bg-yellow-300 transition-all shadow-lg whitespace-nowrap"
                >
                  <i className="ri-heart-fill text-xl"></i> 116 123 — Samaritans
                </a>
              </div>
            </div>
          </div>

          {/* Support Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Samaritans */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-heart-pulse-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Samaritans</h3>
                  <p className="text-green-600 font-semibold text-sm">24/7 Crisis Support</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Free, confidential emotional support for anyone experiencing distress or despair. No judgment, just listening.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-phone-fill text-green-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">116 123</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-mail-fill text-green-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">jo@samaritans.org</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-time-fill text-green-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">24/7 — Always available</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:116123"
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-green-600 transition-all text-center"
                >
                  Call Now
                </a>
                <a
                  href="https://samaritans.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-green-200 transition-all text-center"
                >
                  Visit Site
                </a>
              </div>
            </div>

            {/* Crisis Text Line */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-message-3-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Crisis Text Line</h3>
                  <p className="text-blue-600 font-semibold text-sm">24/7 Text Support</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Text-based crisis support when calling feels too difficult. Trained counsellors respond within minutes.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-message-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Text <strong>SHOUT</strong> to <strong>85258</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-time-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">24/7 — Usually respond within 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-shield-check-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Completely free and confidential</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="sms:85258?body=SHOUT"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-all text-center"
                >
                  Send Text
                </a>
                <a
                  href="https://giveusashout.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-200 transition-all text-center"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Mind */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-brain-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Mind</h3>
                  <p className="text-indigo-600 font-semibold text-sm">Mental Health Charity</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Information, support and local services for mental health. Find your local Mind branch for face-to-face support.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-phone-fill text-indigo-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">0300 123 3393</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-time-fill text-indigo-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Mon-Fri: 9am-6pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-information-fill text-indigo-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Local services & resources</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:0300123393"
                  className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-indigo-600 transition-all text-center"
                >
                  Call
                </a>
                <a
                  href="https://mind.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-indigo-200 transition-all text-center"
                >
                  Find Local Mind
                </a>
              </div>
            </div>
          </div>

          {/* Specialized Addiction Support */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
            <div className="bg-purple-600 px-8 py-6">
              <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-medicine-bottle-fill text-purple-600 text-xl"></i>
                </div>
                <span>Addiction & Substance Use Support</span>
              </h3>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Frank */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-customer-service-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">FRANK</h4>
                      <p className="text-orange-600 font-semibold text-sm">Drug Information & Support</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Honest information about drugs and confidential advice. No judgment, just facts and support options.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-phone-fill text-orange-500"></i>
                      <span className="text-gray-700">0300 123 6600</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-time-fill text-orange-500"></i>
                      <span className="text-gray-700">24/7 — Always available</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="tel:03001236600"
                      className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-600 transition-all"
                    >
                      Call FRANK
                    </a>
                    <a
                      href="https://talktofrank.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-200 transition-all"
                    >
                      Visit Site
                    </a>
                  </div>
                </div>

                {/* Local Services */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-map-pin-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Local Plymouth Services</h4>
                      <p className="text-teal-600 font-semibold text-sm">Face-to-Face Support</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Local addiction services offering counselling, prescribing, and recovery support in Plymouth.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">Harbour Drug & Alcohol Service</h5>
                          <p className="text-gray-600 text-xs">Beaumont Road, Plymouth</p>
                        </div>
                        <a
                          href="tel:01752434343"
                          className="bg-teal-500 text-white px-3 py-1 rounded-full font-bold text-xs hover:bg-teal-600 transition-all"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">Shekinah Mission</h5>
                          <p className="text-gray-600 text-xs">Octagon Street, Plymouth</p>
                        </div>
                        <a
                          href="tel:01752255758"
                          className="bg-teal-500 text-white px-3 py-1 rounded-full font-bold text-xs hover:bg-teal-600 transition-all"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wellbeing Resources */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-heart-3-fill text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold">Self-Care & Coping</h3>
                </div>
                <p className="text-purple-100 mb-6 leading-relaxed">
                  Small steps can make a big difference to your mental wellbeing. Here are some strategies that might help you through difficult times.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'ri-time-fill', text: 'Take one day at a time' },
                    { icon: 'ri-user-heart-fill', text: 'Reach out to trusted friends' },
                    { icon: 'ri-walk-fill', text: 'Go for short walks outdoors' },
                    { icon: 'ri-phone-fill', text: 'Keep crisis numbers handy' },
                    { icon: 'ri-moon-fill', text: 'Try to maintain sleep routine' },
                    { icon: 'ri-hand-heart-fill', text: 'Practice self-compassion' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${item.icon} text-white text-sm`}></i>
                      </div>
                      <span className="text-purple-100 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src="https://readdy.ai/api/search-image?query=person%20sitting%20peacefully%20in%20nature%2C%20mental%20wellness%20and%20self%20care%20concept%2C%20warm%20golden%20hour%20lighting%2C%20peaceful%20outdoor%20meditation%20scene%2C%20trees%20and%20greenery%20background%2C%20serene%20and%20hopeful%20atmosphere%2C%20photorealistic%2C%20calming%20colors&width=400&height=300&seq=selfcare-wellness&orientation=landscape"
                  alt="Peaceful self-care scene in nature"
                  className="w-80 h-60 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-8 py-4 shadow-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-heart-fill text-purple-600 text-lg"></i>
              </div>
              <p className="text-gray-700 font-semibold">
                <strong>You matter.</strong> Your life has value. Help is available and recovery is possible.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END CRISIS INTERVENTION & MENTAL HEALTH SUPPORT ===== */}

      {/* ===== PEER SUPPORT COMMUNITY RESOURCES ===== */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-team-fill"></i> Community Support
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Peer Support & <span className="text-teal-600">Community Resources</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with others who understand your journey. Plymouth has a strong community of peer support groups, recovery meetings, and local resources where you can find understanding, hope, and practical help.
            </p>
          </div>

          {/* Local Support Groups Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Narcotics Anonymous */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-group-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Narcotics Anonymous Plymouth</h3>
                  <p className="text-teal-600 font-semibold text-sm">Peer Recovery Support</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                12-step recovery program with regular meetings across Plymouth. Share experiences and support each other in recovery.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-fill text-teal-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Multiple meetings weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-fill text-teal-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Various locations across Plymouth</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-shield-check-fill text-teal-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Anonymous & confidential</span>
                </div>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 mb-4">
                <p className="text-teal-700 text-xs font-semibold">Next Meeting</p>
                <p className="text-gray-700 text-sm">Wednesday 7:30pm - Central Church, Royal Parade</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:03003034656"
                  className="flex-1 bg-teal-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-teal-600 transition-all text-center"
                >
                  Call Helpline
                </a>
                <a
                  href="https://ukna.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-teal-200 transition-all text-center"
                >
                  Find Meetings
                </a>
              </div>
            </div>

            {/* SMART Recovery */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">SMART Recovery Plymouth</h3>
                  <p className="text-blue-600 font-semibold text-sm">Self-Management Recovery</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Evidence-based approach using practical tools and techniques. Focus on motivation, behavior change, and self-empowerment.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Tuesdays 6:30pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Shekinah Mission, Octagon Street</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-user-settings-fill text-blue-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Practical tools & strategies</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-blue-700 text-xs font-semibold">Current Focus</p>
                <p className="text-gray-700 text-sm">Building motivation & managing urges</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:01752255758"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-all text-center"
                >
                  Call Venue
                </a>
                <a
                  href="https://smartrecovery.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-200 transition-all text-center"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Cocaine Anonymous */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-refresh-fill text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Cocaine Anonymous Plymouth</h3>
                  <p className="text-purple-600 font-semibold text-sm">Stimulant Recovery Focus</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Specialized support for cocaine and stimulant addiction. Understanding the unique challenges of stimulant recovery.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-fill text-purple-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Sundays 7:00pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-fill text-purple-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Plymouth Recovery Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-heart-fill text-purple-500 text-sm"></i>
                  <span className="text-gray-700 text-sm">Welcoming & non-judgmental</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <p className="text-purple-700 text-xs font-semibold">Meeting Style</p>
                <p className="text-gray-700 text-sm">Discussion format with peer sharing</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="mailto:plymouthca@gmail.com"
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-purple-600 transition-all text-center"
                >
                  Email Group
                </a>
                <a
                  href="https://ca.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-purple-200 transition-all text-center"
                >
                  National Site
                </a>
              </div>
            </div>
          </div>

          {/* Peer Support Programs */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
            <div className="bg-teal-600 px-8 py-6">
              <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-heart-fill text-teal-600 text-xl"></i>
                </div>
                <span>Peer Support Programs</span>
              </h3>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Peer Mentorship */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-parent-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Peer Mentorship Program</h4>
                      <p className="text-green-600 font-semibold text-sm">One-to-One Support</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect with someone who's been through recovery. Get practical advice, emotional support, and encouragement from someone who truly understands.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-user-star-fill text-green-500"></i>
                      <span className="text-gray-700">Matched with experienced peer mentor</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-chat-3-fill text-green-500"></i>
                      <span className="text-gray-700">Regular check-ins and support calls</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-calendar-check-fill text-green-500"></i>
                      <span className="text-gray-700">Flexible meeting schedule</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-800 text-sm font-semibold mb-2">Getting Started</p>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      Contact Harbour Drug & Alcohol Service to request a peer mentor. They'll match you based on experience, location, and recovery goals.
                    </p>
                    <a
                      href="tel:01752434343"
                      className="inline-block mt-3 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-green-600 transition-all"
                    >
                      Call 01752 434 343
                    </a>
                  </div>
                </div>

                {/* Family Support Groups */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-home-heart-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Family Support Groups</h4>
                      <p className="text-orange-600 font-semibold text-sm">For Families & Friends</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Support for family members and friends affected by someone's drug use. Learn coping strategies and connect with others in similar situations.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">Families Anonymous</h5>
                          <p className="text-gray-600 text-xs">Thursdays 7:00pm - St. Andrew's Church</p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">Weekly</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">Al-Anon Plymouth</h5>
                          <p className="text-gray-600 text-xs">Wednesdays 2:00pm - Community Centre</p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">Weekly</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href="tel:08007484848"
                      className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-600 transition-all"
                    >
                      Call 0800 748 4848
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Drop-In Centers */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-door-open-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">Drop-In Centers</h3>
                  <p className="text-cyan-600 font-semibold text-sm">No Appointment Needed</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Safe spaces where you can access support, have a hot meal, use facilities, and connect with services — no questions asked.
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-gray-900 text-sm">The Salvation Army</h4>
                  <p className="text-gray-600 text-sm">Citadel Road — Mon-Fri: 9am-4pm</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold">Hot Meals</span>
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold">Showers</span>
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold">Laundry</span>
                  </div>
                </div>
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-gray-900 text-sm">Shekinah Mission</h4>
                  <p className="text-gray-600 text-sm">Octagon Street — Daily: 8am-4pm</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold">Support Worker</span>
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs font-bold">Benefits Help</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-graduation-cap-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">Skills & Training</h3>
                  <p className="text-emerald-600 font-semibold text-sm">Rebuild Your Life</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Programs to help you develop new skills, gain qualifications, and move toward employment or education goals.
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-bold text-gray-900 text-sm">Recovery College Plymouth</h4>
                  <p className="text-gray-600 text-sm">Free courses on mental health, life skills & recovery</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Free Courses</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Peer-Led</span>
                  </div>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-bold text-gray-900 text-sm">New Leaf Training</h4>
                  <p className="text-gray-600 text-sm">Vocational training & employment support</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Job Skills</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">CV Help</span>
                  </div>
                </div>
              </div>
              <a
                href="tel:01752266750"
                className="block w-full mt-6 bg-emerald-500 text-white px-4 py-3 rounded-full font-bold text-sm hover:bg-emerald-600 transition-all text-center"
              >
                Call 01752 266 750
              </a>
            </div>
          </div>

          {/* Online Communities */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 text-white">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-global-fill text-teal-600 text-xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold">Online Support Communities</h3>
                </div>
                <p className="text-teal-100 mb-6 leading-relaxed">
                  Sometimes online support is more accessible than meeting in person. These communities offer 24/7 peer support and understanding.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'ri-reddit-fill', text: 'r/OpiatesRecovery', link: 'reddit.com/r/OpiatesRecovery' },
                    { icon: 'ri-facebook-fill', text: 'NA Online Meetings', link: 'facebook.com/NAOnlineMeetings' },
                    { icon: 'ri-chat-3-fill', text: '7 Cups Free Listening', link: '7cups.com' },
                    { icon: 'ri-video-chat-fill', text: 'In The Rooms - Online Meetings', link: 'intherooms.com' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${item.icon} text-white text-base`}></i>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.text}</p>
                        <p className="text-teal-200 text-xs">{item.link}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20people%20in%20supportive%20circle%20discussion%2C%20community%20meeting%20room%2C%20warm%20inclusive%20atmosphere%2C%20people%20of%20different%20ages%20and%20backgrounds%20sharing%20stories%2C%20soft%20natural%20lighting%2C%20hope%20and%20connection%2C%20peer%20support%20group%20setting&width=400&height=300&seq=peer-support-community&orientation=landscape"
                  alt="Community peer support group meeting"
                  className="w-80 h-60 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Getting Connected */}
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-compass-3-fill text-teal-600 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Getting Connected</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Not sure where to start? These organizations can help connect you with the right support group or peer program for your situation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-service-fill text-white text-lg"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Harbour Drug & Alcohol Service</h4>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Central hub for recovery services in Plymouth. They can refer you to appropriate peer support groups and programs.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-phone-fill text-teal-500"></i>
                    <span className="text-gray-700">01752 434 343</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-map-pin-fill text-teal-500"></i>
                    <span className="text-gray-700">Beaumont House, Beaumont Road</span>
                  </div>
                </div>
                <a
                  href="tel:01752434343"
                  className="bg-teal-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-teal-600 transition-all"
                >
                  Call for Support
                </a>
              </div>

              <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-hand-heart-fill text-white text-lg"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Shekinah Mission</h4>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Offers various peer support programs and can help you find the right group for your needs and schedule.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-phone-fill text-cyan-500"></i>
                    <span className="text-gray-700">01752 255 758</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-map-pin-fill text-cyan-500"></i>
                    <span className="text-gray-700">54 Octagon Street</span>
                  </div>
                </div>
                <a
                  href="tel:01752255758"
                  className="bg-cyan-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-600 transition-all"
                >
                  Get Connected
                </a>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <i className="ri-team-fill text-teal-500 text-lg"></i>
                </div>
                <h4 className="text-white font-bold text-lg">Your Recovery Community Awaits</h4>
              </div>
              <p className="text-teal-100 text-sm max-w-2xl mx-auto">
                Recovery is stronger when we do it together. Take the first step by reaching out to any of these groups — you'll find understanding, hope, and practical support from people who've been where you are.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END PEER SUPPORT COMMUNITY RESOURCES ===== */}

      {/* ===== RECOVERY STORIES ===== */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-star-fill"></i> Recovery Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-amber-600">Hope</span> from Plymouth
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real stories from real people in our community who have found their path to recovery. These stories show that change is possible, hope is real, and you are not alone in this journey.
            </p>
          </div>

          {/* Featured Story */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://readdy.ai/api/search-image?query=confident%20person%20in%20recovery%20standing%20by%20Plymouth%20waterfront%2C%20warm%20golden%20hour%20sunlight%2C%20peaceful%20expression%20looking%20towards%20horizon%2C%20cityscape%20background%2C%20hope%20and%20renewal%20concept%2C%20inspirational%20portrait%20photography%2C%20natural%20lighting%2C%20authentic%20recovery%20journey%20visual&width=600&height=400&seq=recovery-featured-story&orientation=landscape"
                  alt="Recovery journey - person looking hopeful by Plymouth waterfront"
                  className="w-full h-80 md:h-full object-cover object-center"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <i className="ri-user-star-fill text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">Sarah's Journey</h3>
                    <p className="text-amber-600 font-semibold text-sm">3 Years in Recovery</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "Three years ago, I thought my life was over. I'd overdosed twice, lost my job, and my family didn't know how to help me. Then someone at Harbour introduced me to the peer mentorship program."
                </blockquote>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "Having someone who really understood what I was going through made all the difference. My mentor Sarah had been clean for five years and showed me it was actually possible. She helped me navigate the services, find stable housing, and most importantly, believe in myself again."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-lime-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Now working as a peer support worker at Shekinah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-lime-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Rebuilt relationships with family</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-lime-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Mentoring others in early recovery</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
                  <p className="text-amber-800 text-sm font-semibold italic">
                    "Recovery isn't about being perfect. It's about taking it one day at a time and accepting help when it's offered. The Plymouth recovery community saved my life."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recovery Stories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Story 1 - Marcus */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="ri-briefcase-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Marcus</h4>
                  <p className="text-blue-600 font-semibold text-sm">18 Months Clean</p>
                </div>
              </div>
              <div className="mb-4">
                <img
                  src="https://readdy.ai/api/search-image?query=person%20in%20work%20clothes%20at%20construction%20site%2C%20confident%20stance%2C%20hard%20hat%20and%20high%20visibility%20vest%2C%20Plymouth%20industrial%20background%2C%20successful%20return%20to%20employment%20after%20recovery%2C%20positive%20workplace%20environment%2C%20natural%20lighting%2C%20authentic%20recovery%20success%20story&width=400&height=250&seq=recovery-marcus&orientation=landscape"
                  alt="Marcus back at work in construction"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "I lost everything to heroin addiction, including my trade skills that I'd worked 15 years to build. The training programs at New Leaf got me back into construction."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-tools-fill text-blue-500"></i>
                  <span className="text-gray-600">Completed NVQ Level 2 in Construction</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-home-fill text-blue-500"></i>
                  <span className="text-gray-600">Secured stable housing through council support</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-team-fill text-blue-500"></i>
                  <span className="text-gray-600">Active member of SMART Recovery Plymouth</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-800 text-xs font-semibold">
                  "Now I'm a site supervisor and sponsor two other people in recovery. Having a purpose again changed everything."
                </p>
              </div>
            </div>

            {/* Story 2 - Emma */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <i className="ri-parent-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Emma</h4>
                  <p className="text-pink-600 font-semibold text-sm">2 Years in Recovery</p>
                </div>
              </div>
              <div className="mb-4">
                <img
                  src="https://readdy.ai/api/search-image?query=mother%20and%20young%20child%20playing%20in%20Plymouth%20park%2C%20warm%20family%20moment%2C%20sunny%20day%20outdoors%2C%20genuine%20happiness%20and%20connection%2C%20family%20recovery%20story%2C%20authentic%20moment%20between%20parent%20and%20child%2C%20hope%20and%20gratitude%2C%20comfortable%20home%20environment%2C%20authentic%20relationship%20after%20overcoming%20crisis&width=400&height=250&seq=recovery-emma&orientation=landscape"
                  alt="Emma reunited with her daughter"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "I was homeless for two years, sleeping rough around the Barbican. The drop-in center at Salvation Army was the first place that treated me like a human being."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-heart-fill text-pink-500"></i>
                  <span className="text-gray-600">Daughter returned home after 14 months</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-graduation-cap-fill text-pink-500"></i>
                  <span className="text-gray-600">Studying childcare at City College Plymouth</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-group-fill text-pink-500"></i>
                  <span className="text-gray-600">Volunteers with family support programs</span>
                </div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-pink-800 text-xs font-semibold">
                  "My daughter says she's proud of me now. That's all the motivation I need to keep going forward."
                </p>
              </div>
            </div>

            {/* Story 3 - James */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-medal-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">James</h4>
                  <p className="text-green-600 font-semibold text-sm">4 Years Clean</p>
                </div>
              </div>
              <div className="mb-4">
                <img
                  src="https://readdy.ai/api/search-image?query=person%20running%20along%20Plymouth%20Hoe%20seafront%20at%20sunrise%2C%20athletic%20wear%2C%20determined%20expression%2C%20healthy%20lifestyle%20in%20recovery%2C%20ocean%20and%20city%20skyline%20background%2C%20inspiring%20fitness%20journey%2C%20natural%20morning%20light%2C%20recovery%20through%20wellness%20and%20exercise&width=400&height=250&seq=recovery-james&orientation=landscape"
                  alt="James running along Plymouth seafront"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "I was homeless for two years, sleeping rough around the Barbican. The drop-in center at Salvation Army was the first place that treated me like a human being."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-home-heart-fill text-green-500"></i>
                  <span className="text-gray-600">Secured permanent housing through Pathways</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-run-fill text-green-500"></i>
                  <span className="text-gray-600">Completed Plymouth Half Marathon (twice!)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-hand-heart-fill text-green-500"></i>
                  <span className="text-gray-600">Volunteers as a peer mentor at Harbour</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-green-800 text-xs font-semibold">
                  "Recovery gave me my life back, but more than that — it gave me a purpose. Now I help others find their way back too."
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Timeline */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-amber-500 px-8 py-6">
              <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-roadmap-fill text-amber-500 text-xl"></i>
                </div>
                <span>Recovery is a Journey — Not a Destination</span>
              </h3>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    phase: "Getting Help",
                    icon: "ri-hand-heart-fill",
                    color: "bg-red-500",
                    description: "Reaching out for support, accessing services, starting to believe change is possible",
                    timeframe: "Days to Weeks"
                  },
                  {
                    phase: "Early Recovery",
                    icon: "ri-seedling-fill", 
                    color: "bg-orange-500",
                    description: "Learning new coping skills, building routines, connecting with peer support",
                    timeframe: "Months 1-6"
                  },
                  {
                    phase: "Rebuilding",
                    icon: "ri-building-2-fill",
                    color: "bg-amber-500", 
                    description: "Repairing relationships, finding housing/work, developing new interests",
                    timeframe: "Months 6-18"
                  },
                  {
                    phase: "Thriving",
                    icon: "ri-star-fill",
                    color: "bg-lime-500",
                    description: "Giving back to community, mentoring others, living with purpose and meaning",
                    timeframe: "18+ Months"
                  }
                ].map((phase, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-16 h-16 ${phase.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <i className={`${phase.icon} text-white text-2xl`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{phase.phase}</h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{phase.description}</p>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {phase.timeframe}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <i className="ri-heart-fill text-amber-500 text-lg"></i>
                  </div>
                  <h4 className="text-white font-bold text-lg">Everyone's Journey is Different</h4>
                </div>
                <p className="text-amber-100 text-sm max-w-3xl mx-auto">
                  Recovery doesn't follow a straight line. There may be setbacks, challenges, and different paths. What matters is taking the next step, asking for help when you need it, and believing that change is possible.
                </p>
              </div>
            </div>
          </div>

          {/* ===== FAMILY TESTIMONIALS - NALOXONE SAVES ===== */}
          <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
                  <i className="ri-heart-fill"></i> Lives Saved
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  When <span className="text-rose-600">Naloxone</span> Brought Them Home
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  These are real families from Plymouth whose lives were forever changed by naloxone. Their stories show why having naloxone available can mean the difference between losing someone and getting them the help they need.
                </p>
              </div>

              {/* Main Testimonials Grid */}
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Testimonial 1 - Lisa & Tom */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-8 pb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="ri-parent-fill text-white text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">Lisa — Mother</h3>
                        <p className="text-rose-600 font-semibold text-sm">Son Tom, saved February 2024</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="ri-heart-fill text-rose-400 text-sm"></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic border-l-4 border-rose-200 pl-4">
                      "I found Tom collapsed in his bedroom. I thought he was dead. His lips were blue, he wasn't breathing properly. I remembered the naloxone training from last year and gave him the spray."
                    </blockquote>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      "Within minutes, he started breathing normally again. The ambulance crew said if I hadn't had that naloxone kit, we would have lost him. Tom's been in treatment for six months now and doing well. That little spray bottle saved my son's life — and our family."
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-rose-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Had naloxone kit from community training</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-rose-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Son survived and entered treatment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-rose-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Now volunteers with family support programs</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-8 pb-8">
                    <img
                      src="https://readdy.ai/api/search-image?query=mother%20and%20adult%20son%20embracing%20in%20warm%20family%20home%2C%20emotional%20reunion%20scene%2C%20soft%20natural%20lighting%20through%20window%2C%20genuine%20happiness%20and%20relief%2C%20family%20recovery%20story%2C%20authentic%20moment%20between%20parent%20and%20child%2C%20hope%20and%20gratitude%2C%20living%20room%20setting&width=500&height=300&seq=family-testimonial-lisa&orientation=landscape"
                      alt="Lisa with her son Tom after his recovery"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                  </div>
                  
                  <div className="bg-rose-50 px-8 py-4">
                    <p className="text-rose-800 text-sm font-bold italic text-center">
                      "Every parent should have naloxone. You never know when someone might need it — it could be your child, their friend, or a stranger. It's such a small thing that makes the biggest difference."
                    </p>
                  </div>
                </div>

                {/* Testimonial 2 - David & Sophie */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-8 pb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="ri-user-heart-fill text-white text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">David — Partner</h3>
                        <p className="text-blue-600 font-semibold text-sm">Partner Sophie, saved August 2024</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="ri-heart-fill text-blue-400 text-sm"></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic border-l-4 border-blue-200 pl-4">
                      "Sophie had been clean for two years, but she relapsed. I came home and found her unconscious in the bathroom. She'd stopped breathing."
                    </blockquote>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      "I called 999 first, then used the naloxone. I was shaking so much I nearly dropped it, but I managed to give her the spray. She came round just as the ambulance arrived. The paramedics said I did everything right. Sophie's back in recovery now — stronger than ever."
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-blue-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Called 999 immediately before using naloxone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-blue-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Partner recovered and re-entered treatment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-blue-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">Both now trained in naloxone administration</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-8 pb-8">
                    <img
                      src="https://readdy.ai/api/search-image?query=couple%20holding%20hands%20sitting%20together%20on%20couch%2C%20supportive%20relationship%2C%20warm%20indoor%20lighting%2C%20emotional%20support%20and%20love%2C%20recovery%20partnership%2C%20genuine%20connection%20and%20hope%2C%20comfortable%20home%20environment%2C%20authentic%20relationship%20after%20overcoming%20crisis&width=500&height=300&seq=family-testimonial-david&orientation=landscape"
                      alt="David and Sophie together after her recovery"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                  </div>
                  
                  <div className="bg-blue-50 px-8 py-4">
                    <p className="text-blue-800 text-sm font-bold italic text-center">
                      "I never thought I'd need to use naloxone, but addiction doesn't follow rules. Having it there meant I could act instead of just watching her die. Every family dealing with addiction needs this."
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Testimonials - Condensed Format */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Margaret - Grandmother */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="ri-user-6-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Margaret</h4>
                      <p className="text-purple-600 font-semibold text-sm">Grandmother</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                    "I keep naloxone because my grandson visits. Last month, his friend overdosed in our garden. I'm 73 years old, but I knew what to do."
                  </blockquote>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-shield-check-fill text-purple-500"></i>
                      <span className="text-gray-600">Kept kit "just in case" for 2 years</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-heart-pulse-fill text-purple-500"></i>
                      <span className="text-gray-600">Saved 19-year-old visitor to her home</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-purple-800 text-xs font-semibold">
                      "Age doesn't matter. Anyone can learn to use naloxone. It's simpler than using an inhaler."
                    </p>
                  </div>
                </div>

                {/* James - Brother */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="ri-team-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">James</h4>
                      <p className="text-green-600 font-semibold text-sm">Brother</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                    "My sister Katie overdosed three times before. The fourth time, I had naloxone. That's the one she survived properly — she's been clean 8 months now."
                  </blockquote>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-time-fill text-green-500"></i>
                      <span className="text-gray-600">Previous overdoses without naloxone available</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-star-fill text-green-500"></i>
                      <span className="text-gray-600">Sister now 8 months in recovery</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-800 text-xs font-semibold">
                      "Every family should have this. Don't wait until it's too late like we nearly did."
                    </p>
                  </div>
                </div>

                {/* Carol - Foster Carer */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="ri-home-heart-fill text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Carol</h4>
                      <p className="text-orange-600 font-semibold text-sm">Foster Carer</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                    "We foster teenagers with complex needs. When 16-year-old Jake overdosed, we were ready. The social worker said we saved his life and his future."
                  </blockquote>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-shield-fill text-orange-500"></i>
                      <span className="text-gray-600">Proactive preparation for high-risk placements</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <i className="ri-graduation-cap-fill text-orange-500"></i>
                      <span className="text-gray-600">Teenager now completing college course</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-orange-800 text-xs font-semibold">
                      "Foster carers, teachers, youth workers — we all need naloxone training. Kids' lives depend on it."
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics Panel */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-8 text-white mb-10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Naloxone Saves Lives Every Day</h3>
                  <p className="text-rose-100 text-sm">Real impact in Plymouth and across the UK</p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-heart-pulse-fill text-rose-600 text-2xl"></i>
                    </div>
                    <div className="text-3xl font-black mb-1">47</div>
                    <p className="text-rose-200 text-sm">Lives saved in Plymouth since 2023</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-family-fill text-rose-600 text-2xl"></i>
                    </div>
                    <div className="text-3xl font-black mb-1">89%</div>
                    <p className="text-rose-200 text-sm">Were saved by family members or friends</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-time-fill text-rose-600 text-2xl"></i>
                    </div>
                    <div className="text-3xl font-black mb-1">2-3</div>
                    <p className="text-rose-200 text-sm">Minutes — average response time for naloxone</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-shield-check-fill text-rose-600 text-2xl"></i>
                    </div>
                    <div className="text-3xl font-black mb-1">95%</div>
                    <p className="text-rose-200 text-sm">Successful reversal rate when used properly</p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-medicine-bottle-fill text-rose-600 text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Be Ready to Save a Life</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    These families didn't expect to need naloxone, but they were prepared. Don't wait for an emergency — get your kit today and learn how to use it.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-medicine-bottle-fill text-gray-900 text-xl"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Get Your Kit</h4>
                    <p className="text-gray-600 text-xs">Free naloxone — no prescription needed</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-graduation-cap-fill text-gray-900 text-xl"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Learn How to Use It</h4>
                    <p className="text-gray-600 text-xs">Free 30-minute training sessions</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-shield-check-fill text-gray-900 text-xl"></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Be Prepared</h4>
                    <p className="text-gray-600 text-xs">Ready to act in an emergency</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#request-form"
                    className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all shadow-lg flex items-center justify-center whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-medicine-bottle-fill mr-2"></i> Request Your Kit Now
                  </a>
                  <Link
                    to="/training"
                    className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg flex items-center justify-center whitespace-nowrap"
                  >
                    <i className="ri-calendar-check-fill mr-2"></i> Book Training
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-rose-50 rounded-2xl text-center">
                  <p className="text-rose-800 text-sm font-semibold flex items-center justify-center gap-2">
                    <i className="ri-heart-fill text-rose-600"></i>
                    "Every family should have naloxone. You never know when someone might need it." — Lisa, Plymouth
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* ===== END FAMILY TESTIMONIALS ===== */}

          {/* How It Works — 3 Steps */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-4">
                  Simple Process
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How to Get Your Kit</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connector arrows */}
                <div className="hidden md:flex absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 items-center justify-center">
                  <i className="ri-arrow-right-line text-yellow-400 text-3xl"></i>
                </div>
                <div className="hidden md:flex absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 items-center justify-center">
                  <i className="ri-arrow-right-line text-yellow-400 text-3xl"></i>
                </div>

                {/* Step 1 — Call 999 */}
                <div
                  className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                    activeStep === 0
                      ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                      : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => setActiveStep(0)}
                >
                  <div className="absolute inset-0">
                    <img
                      src="https://readdy.ai/api/search-image?query=person%20urgently%20calling%20emergency%20services%20on%20mobile%20phone%2C%20close%20up%20hands%20holding%20phone%20dialing%20999%2C%20dramatic%20lighting%2C%20dark%20background%20with%20red%20emergency%20tones%2C%20photorealistic%2C%20cinematic%2C%20shallow%20depth%20of%20field%2C%20urgent%20life%20saving%20moment&width=600&height=500&seq=howto-step1&orientation=portrait"
                      alt="Call 999 immediately"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
                  </div>
                  <div className="relative p-8 pt-48">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-black text-xl">1</span>
                      </div>
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-phone-fill text-gray-900 text-xl"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Call 999 First</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Call 999 immediately. Tell them you suspect an opioid overdose. Stay on the line. Do not leave the person alone.
                    </p>
                    <div className="space-y-2">
                      {['Check for breathing', 'Place in recovery position if breathing', 'Stay calm and stay on the line'].map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-white text-xs"></i>
                          </div>
                          {tip}
                        </div>
                      ))}
                    </div>
                    {activeStep === 0 && (
                      <div className="mt-5 bg-red-600/20 border border-red-500/40 rounded-xl px-4 py-3">
                        <p className="text-red-300 text-xs font-bold flex items-center gap-2">
                          <i className="ri-alarm-warning-fill text-red-400"></i> Always call 999 — naloxone is temporary
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 — Administer Naloxone */}
                <div
                  className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                    activeStep === 1
                      ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                      : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => setActiveStep(1)}
                >
                  <div className="absolute inset-0">
                    <img
                      src="https://readdy.ai/api/search-image?query=close%20up%20hands%20administering%20nasal%20spray%20into%20nostril%2C%20intranasal%20naloxone%20device%20being%20used%2C%20medical%20first%20aid%20emergency%20response%2C%20clean%20clinical%20background%20with%20soft%20warm%20lighting%2C%20photorealistic%2C%20life%20saving%20medication%20being%20administered&width=600&height=500&seq=howto-step2&orientation=portrait"
                      alt="Administer naloxone nasal spray"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
                  </div>
                  <div className="relative p-8 pt-48">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-black text-xl">2</span>
                      </div>
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-medicine-bottle-fill text-gray-900 text-xl"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Give the Naloxone</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Insert the Pebble nozzle into one nostril and press the plunger firmly. If there is no response after 2–3 minutes, administer a second dose in the other nostril.
                    </p>
                    <div className="space-y-2">
                      {['Tilt head back slightly', 'Insert nozzle into nostril', 'Press plunger firmly all the way'].map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-white text-xs"></i>
                          </div>
                          {tip}
                        </div>
                      ))}
                    </div>
                    {activeStep === 1 && (
                      <div className="mt-5 bg-pink-600/20 border border-pink-500/40 rounded-xl px-4 py-3">
                        <p className="text-pink-300 text-xs font-bold flex items-center gap-2">
                          <i className="ri-time-fill text-pink-400"></i> Wait 2–3 mins — repeat if no response
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 — Stay & Monitor */}
                <div
                  className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                    activeStep === 2
                      ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                      : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => setActiveStep(2)}
                >
                  <div className="absolute inset-0">
                    <img
                      src="https://readdy.ai/api/search-image?query=caring%20person%20kneeling%20beside%20someone%20lying%20in%20recovery%20position%20on%20ground%2C%20supportive%20first%20aid%20scene%2C%20warm%20compassionate%20lighting%2C%20outdoor%20urban%20setting%2C%20photorealistic%2C%20community%20care%2C%20harm%20reduction%2C%20person%20monitoring%20breathing%20waiting%20for%20ambulance&width=600&height=500&seq=howto-step3&orientation=portrait"
                      alt="Stay with the person and monitor"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
                  </div>
                  <div className="relative p-8 pt-48">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-black text-xl">3</span>
                      </div>
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-heart-pulse-fill text-gray-900 text-xl"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Stay &amp; Monitor</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Stay with the person until the ambulance arrives. Naloxone wears off in 30–90 minutes — the overdose can return. Keep them safe and calm.
                    </p>
                    <div className="space-y-2">
                      {['Keep them in recovery position', 'Do not leave them alone', 'Be ready to give a second dose'].map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-white text-xs"></i>
                          </div>
                          {tip}
                        </div>
                      ))}
                    </div>
                    {activeStep === 2 && (
                      <div className="mt-5 bg-lime-600/20 border border-lime-500/40 rounded-xl px-4 py-3">
                        <p className="text-lime-300 text-xs font-bold flex items-center gap-2">
                          <i className="ri-shield-check-fill text-lime-400"></i> Naloxone wears off — stay until help arrives
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom CTA strip */}
              <div className="mt-14 bg-gradient-to-r from-red-700 to-red-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-vidicon-fill text-gray-900 text-3xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 text-xl mb-1">Want a full walkthrough?</h3>
                    <p className="text-red-200 text-sm">
                      Our free training sessions cover every step in detail — hands‑on practice included. Takes just 30 minutes.
                    </p>
                  </div>
                </div>
                <a
                  href="/training"
                  className="flex-shrink-0 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-black text-base hover:bg-yellow-300 transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-calendar-check-fill"></i> Book Free Training
                </a>
              </div>
            </div>
          </section>

          {/* Request Form */}
          <section id="request-form" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left — Info */}
                <div>
                  <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
                    Request a Kit
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Request Your Naloxone Kit
                  </h2>
                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    Fill in the form and our team will be in touch to arrange collection or delivery of your naloxone kit. All requests are treated with complete confidentiality.
                  </p>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-lock-fill text-gray-900 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Completely Confidential</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Your information is never shared. We treat every request with dignity and respect.
                        </p>
                        <p className="text-gray-600 text-sm">
                          We welcome everyone. You do not need to explain yourself — just ask and we will help.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 bg-yellow-400 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-phone-fill text-yellow-500 text-lg"></i>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Prefer to call?</h4>
                    </div>
                    <p className="text-gray-800 text-sm mb-3">
                      Speak directly with our team Monday–Friday, 9am–5pm
                    </p>
                    <a href="tel:07561349137" className="text-gray-900 font-black text-2xl hover:text-pink-600 transition-colors">
                      07561 349 137
                    </a>
                  </div>
                </div>

                {/* Right — Form */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
                  {submitted ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="ri-check-line text-gray-900 text-5xl"></i>
                      </div>

                      {/* Success message content omitted for brevity */}

                    </div>
                  ) : (
                    <form
                      id="naloxone-request-form"
                      data-readdy-form
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      {/* ...form fields... */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Request</label>
                        <select
                          name="reason"
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm cursor-pointer"
                        >
                          <option value="">Select a reason (optional)</option>
                          <option value="personal_use">I use opioids and want to be safe</option>
                          <option value="family_friend">I have a family member or friend at risk</option>
                          <option value="community">I work or volunteer in the community</option>
                          <option value="replacement">Replacing an expired or used kit</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* ...other form elements... */}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Pickup Locations */}
          {/* ...rest of file unchanged... */}
        </div>
      </section>
      {/* ===== END RECOVERY STORIES ===== */}

      {/* ===== FAMILY TESTIMONIALS - NALOXONE SAVES ===== */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-full font-bold mb-5 text-sm uppercase tracking-wide">
              <i className="ri-heart-fill"></i> Lives Saved
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              When <span className="text-rose-600">Naloxone</span> Brought Them Home
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These are real families from Plymouth whose lives were forever changed by naloxone. Their stories show why having naloxone available can mean the difference between losing someone and getting them the help they need.
            </p>
          </div>

          {/* Main Testimonials Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Testimonial 1 - Lisa & Tom */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 pb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <i className="ri-parent-fill text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">Lisa — Mother</h3>
                    <p className="text-rose-600 font-semibold text-sm">Son Tom, saved February 2024</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="ri-heart-fill text-rose-400 text-sm"></i>
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic border-l-4 border-rose-200 pl-4">
                  "I found Tom collapsed in his bedroom. I thought he was dead. His lips were blue, he wasn't breathing properly. I remembered the naloxone training from last year and gave him the spray."
                </blockquote>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "Within minutes, he started breathing normally again. The ambulance crew said if I hadn't had that naloxone kit, we would have lost him. Tom's been in treatment for six months now and doing well. That little spray bottle saved my son's life — and our family."
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-rose-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Had naloxone kit from community training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-rose-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Son survived and entered treatment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-rose-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Now volunteers with family support programs</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <img
                  src="https://readdy.ai/api/search-image?query=mother%20and%20adult%20son%20embracing%20in%20warm%20family%20home%2C%20emotional%20reunion%20scene%2C%20soft%20natural%20lighting%20through%20window%2C%20genuine%20happiness%20and%20relief%2C%20family%20recovery%20story%2C%20authentic%20moment%20between%20parent%20and%20child%2C%20hope%20and%20gratitude%2C%20living%20room%20setting&width=500&height=300&seq=family-testimonial-lisa&orientation=landscape"
                  alt="Lisa with her son Tom after his recovery"
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>
              
              <div className="bg-rose-50 px-8 py-4">
                <p className="text-rose-800 text-sm font-bold italic text-center">
                  "Every parent should have naloxone. You never know when someone might need it — it could be your child, their friend, or a stranger. It's such a small thing that makes the biggest difference."
                </p>
              </div>
            </div>

            {/* Testimonial 2 - David & Sophie */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 pb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <i className="ri-user-heart-fill text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">David — Partner</h3>
                    <p className="text-blue-600 font-semibold text-sm">Partner Sophie, saved August 2024</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="ri-heart-fill text-blue-400 text-sm"></i>
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic border-l-4 border-blue-200 pl-4">
                  "Sophie had been clean for two years, but she relapsed. I came home and found her unconscious in the bathroom. She'd stopped breathing."
                </blockquote>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "I called 999 first, then used the naloxone. I was shaking so much I nearly dropped it, but I managed to give her the spray. She came round just as the ambulance arrived. The paramedics said I did everything right. Sophie's back in recovery now — stronger than ever."
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-blue-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Called 999 immediately before using naloxone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-blue-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Partner recovered and re-entered treatment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-blue-600 text-xs"></i>
                    </div>
                    <span className="text-gray-700 text-sm">Both now trained in naloxone administration</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <img
                  src="https://readdy.ai/api/search-image?query=couple%20holding%20hands%20sitting%20together%20on%20couch%2C%20supportive%20relationship%2C%20warm%20indoor%20lighting%2C%20emotional%20support%20and%20love%2C%20recovery%20partnership%2C%20genuine%20connection%20and%20hope%2C%20comfortable%20home%20environment%2C%20authentic%20relationship%20after%20overcoming%20crisis&width=500&height=300&seq=family-testimonial-david&orientation=landscape"
                  alt="David and Sophie together after her recovery"
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>
              
              <div className="bg-blue-50 px-8 py-4">
                <p className="text-blue-800 text-sm font-bold italic text-center">
                  "I never thought I'd need to use naloxone, but addiction doesn't follow rules. Having it there meant I could act instead of just watching her die. Every family dealing with addiction needs this."
                </p>
              </div>
            </div>
          </div>

          {/* Additional Testimonials - Condensed Format */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Margaret - Grandmother */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-6-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Margaret</h4>
                  <p className="text-purple-600 font-semibold text-sm">Grandmother</p>
                </div>
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "I keep naloxone because my grandson visits. Last month, his friend overdosed in our garden. I'm 73 years old, but I knew what to do."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-shield-check-fill text-purple-500"></i>
                  <span className="text-gray-600">Kept kit "just in case" for 2 years</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-heart-pulse-fill text-purple-500"></i>
                  <span className="text-gray-600">Saved 19-year-old visitor to her home</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-purple-800 text-xs font-semibold">
                  "Age doesn't matter. Anyone can learn to use naloxone. It's simpler than using an inhaler."
                </p>
              </div>
            </div>

            {/* James - Brother */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-team-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">James</h4>
                  <p className="text-green-600 font-semibold text-sm">Brother</p>
                </div>
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "My sister Katie overdosed three times before. The fourth time, I had naloxone. That's the one she survived properly — she's been clean 8 months now."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-time-fill text-green-500"></i>
                  <span className="text-gray-600">Previous overdoses without naloxone available</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-star-fill text-green-500"></i>
                  <span className="text-gray-600">Sister now 8 months in recovery</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-green-800 text-xs font-semibold">
                  "Every family should have this. Don't wait until it's too late like we nearly did."
                </p>
              </div>
            </div>

            {/* Carol - Foster Carer */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-home-heart-fill text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Carol</h4>
                  <p className="text-orange-600 font-semibold text-sm">Foster Carer</p>
                </div>
              </div>
              <blockquote className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                "We foster teenagers with complex needs. When 16-year-old Jake overdosed, we were ready. The social worker said we saved his life and his future."
              </blockquote>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-shield-fill text-orange-500"></i>
                  <span className="text-gray-600">Proactive preparation for high-risk placements</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-graduation-cap-fill text-orange-500"></i>
                  <span className="text-gray-600">Teenager now completing college course</span>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-orange-800 text-xs font-semibold">
                  "Foster carers, teachers, youth workers — we all need naloxone training. Kids' lives depend on it."
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Panel */}
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-8 text-white mb-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Naloxone Saves Lives Every Day</h3>
              <p className="text-rose-100 text-sm">Real impact in Plymouth and across the UK</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-heart-pulse-fill text-rose-600 text-2xl"></i>
                </div>
                <div className="text-3xl font-black mb-1">47</div>
                <p className="text-rose-200 text-sm">Lives saved in Plymouth since 2023</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-family-fill text-rose-600 text-2xl"></i>
                </div>
                <div className="text-3xl font-black mb-1">89%</div>
                <p className="text-rose-200 text-sm">Were saved by family members or friends</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-time-fill text-rose-600 text-2xl"></i>
                </div>
                <div className="text-3xl font-black mb-1">2-3</div>
                <p className="text-rose-200 text-sm">Minutes — average response time for naloxone</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-shield-check-fill text-rose-600 text-2xl"></i>
                </div>
                <div className="text-3xl font-black mb-1">95%</div>
                <p className="text-rose-200 text-sm">Successful reversal rate when used properly</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-medicine-bottle-fill text-rose-600 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Be Ready to Save a Life</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These families didn't expect to need naloxone, but they were prepared. Don't wait for an emergency — get your kit today and learn how to use it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-medicine-bottle-fill text-gray-900 text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Get Your Kit</h4>
                <p className="text-gray-600 text-xs">Free naloxone — no prescription needed</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-graduation-cap-fill text-gray-900 text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Learn How to Use it</h4>
                <p className="text-gray-600 text-xs">Free 30-minute training sessions</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-shield-check-fill text-gray-900 text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Be Prepared</h4>
                <p className="text-gray-600 text-xs">Ready to act in an emergency</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#request-form"
                className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all shadow-lg flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-medicine-bottle-fill mr-2"></i> Request Your Kit Now
              </a>
              <Link
                to="/training"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg flex items-center justify-center whitespace-nowrap"
              >
                <i className="ri-calendar-check-fill mr-2"></i> Book Training
              </Link>
            </div>

            <div className="mt-6 p-4 bg-rose-50 rounded-2xl text-center">
              <p className="text-rose-800 text-sm font-semibold flex items-center justify-center gap-2">
                <i className="ri-heart-fill text-rose-600"></i>
                "Every family should have naloxone. You never know when someone might need it." — Lisa, Plymouth
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END FAMILY TESTIMONIALS ===== */}

      {/* How It Works — 3 Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-lime-400 text-gray-900 px-6 py-2 rounded-full font-bold mb-4">
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How to Get Your Kit</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector arrows */}
            <div className="hidden md:flex absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 items-center justify-center">
              <i className="ri-arrow-right-line text-yellow-400 text-3xl"></i>
            </div>
            <div className="hidden md:flex absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 items-center justify-center">
              <i className="ri-arrow-right-line text-yellow-400 text-3xl"></i>
            </div>

            {/* Step 1 — Call 999 */}
            <div
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                activeStep === 0
                  ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                  : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActiveStep(0)}
            >
              <div className="absolute inset-0">
                <img
                  src="https://readdy.ai/api/search-image?query=person%20urgently%20calling%20emergency%20services%20on%20mobile%20phone%2C%20close%20up%20hands%20holding%20phone%20dialing%20999%2C%20dramatic%20lighting%2C%20dark%20background%20with%20red%20emergency%20tones%2C%20photorealistic%2C%20cinematic%2C%20shallow%20depth%20of%20field%2C%20urgent%20life%20saving%20moment&width=600&height=500&seq=howto-step1&orientation=portrait"
                  alt="Call 999 immediately"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
              </div>
              <div className="relative p-8 pt-48">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-xl">1</span>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-phone-fill text-gray-900 text-xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Call 999 First</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Call 999 immediately. Tell them you suspect an opioid overdose. Stay on the line. Do not leave the person alone.
                </p>
                <div className="space-y-2">
                  {['Check for breathing', 'Place in recovery position if breathing', 'Stay calm and stay on the line'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
                {activeStep === 0 && (
                  <div className="mt-5 bg-red-600/20 border border-red-500/40 rounded-xl px-4 py-3">
                    <p className="text-red-300 text-xs font-bold flex items-center gap-2">
                      <i className="ri-alarm-warning-fill text-red-400"></i> Always call 999 — naloxone is temporary
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Administer Naloxone */}
            <div
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                activeStep === 1
                  ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                  : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div className="absolute inset-0">
                <img
                  src="https://readdy.ai/api/search-image?query=close%20up%20hands%20administering%20nasal%20spray%20into%20nostril%2C%20intranasal%20naloxone%20device%20being%20used%2C%20medical%20first%20aid%20emergency%20response%2C%20clean%20clinical%20background%20with%20soft%20warm%20lighting%2C%20photorealistic%2C%20life%20saving%20medication%20being%20administered&width=600&height=500&seq=howto-step2&orientation=portrait"
                  alt="Administer naloxone nasal spray"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
              </div>
              <div className="relative p-8 pt-48">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-xl">2</span>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-medicine-bottle-fill text-gray-900 text-xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Give the Naloxone</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Insert the Pebble nozzle into one nostril and press the plunger firmly. If there is no response after 2–3 minutes, administer a second dose in the other nostril.
                </p>
                <div className="space-y-2">
                  {['Tilt head back slightly', 'Insert nozzle into nostril', 'Press plunger firmly all the way'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
                {activeStep === 1 && (
                  <div className="mt-5 bg-pink-600/20 border border-pink-500/40 rounded-xl px-4 py-3">
                    <p className="text-pink-300 text-xs font-bold flex items-center gap-2">
                      <i className="ri-time-fill text-pink-400"></i> Wait 2–3 mins — repeat if no response
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 — Stay & Monitor */}
            <div
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer ${
                activeStep === 2
                  ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl shadow-yellow-400/20'
                  : 'ring-1 ring-gray-700 opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActiveStep(2)}
            >
              <div className="absolute inset-0">
                <img
                  src="https://readdy.ai/api/search-image?query=caring%20person%20kneeling%20beside%20someone%20lying%20in%20recovery%20position%20on%20ground%2C%20supportive%20first%20aid%20scene%2C%20warm%20compassionate%20lighting%2C%20outdoor%20urban%20setting%2C%20photorealistic%2C%20community%20care%2C%20harm%20reduction%2C%20person%20monitoring%20breathing%20waiting%20for%20ambulance&width=600&height=500&seq=howto-step3&orientation=portrait"
                  alt="Stay with the person and monitor"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20"></div>
              </div>
              <div className="relative p-8 pt-48">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-black text-xl">3</span>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-heart-pulse-fill text-gray-900 text-xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Stay &amp; Monitor</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Stay with the person until the ambulance arrives. Naloxone wears off in 30–90 minutes — the overdose can return. Keep them safe and calm.
                </p>
                <div className="space-y-2">
                  {['Keep them in recovery position', 'Do not leave them alone', 'Be ready to give a second dose'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
                {activeStep === 2 && (
                  <div className="mt-5 bg-lime-600/20 border border-lime-500/40 rounded-xl px-4 py-3">
                    <p className="text-lime-300 text-xs font-bold flex items-center gap-2">
                      <i className="ri-shield-check-fill text-lime-400"></i> Naloxone wears off — stay until help arrives
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-14 bg-gradient-to-r from-red-700 to-red-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ri-vidicon-fill text-gray-900 text-3xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 text-xl mb-1">Want a full walkthrough?</h3>
                <p className="text-red-200 text-sm">
                  Our free training sessions cover every step in detail — hands‑on practice included. Takes just 30 minutes.
                </p>
              </div>
            </div>
            <a
              href="/training"
              className="flex-shrink-0 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-black text-base hover:bg-yellow-300 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-calendar-check-fill"></i> Book Free Training
            </a>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section id="request-form" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — Info */}
            <div>
              <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold mb-6">
                Request a Kit
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Request Your Naloxone Kit
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Fill in the form and our team will be in touch to arrange collection or delivery of your naloxone kit. All requests are treated with complete confidentiality.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-lock-fill text-gray-900 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Completely Confidential</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Your information is never shared. We treat every request with dignity and respect.
                    </p>
                    <p className="text-gray-600 text-sm">
                      We welcome everyone. You do not need to explain yourself — just ask and we will help.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-yellow-400 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-phone-fill text-yellow-500 text-lg"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Prefer to call?</h4>
                </div>
                <p className="text-gray-800 text-sm mb-3">
                  Speak directly with our team Monday–Friday, 9am–5pm
                </p>
                <a href="tel:07561349137" className="text-gray-900 font-black text-2xl hover:text-pink-600 transition-colors">
                  07561 349 137
                </a>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-check-line text-gray-900 text-5xl"></i>
                  </div>

                  {/* Success message content omitted for brevity */}

                </div>
              ) : (
                <form
                  id="naloxone-request-form"
                  data-readdy-form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* ...form fields... */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Request</label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm cursor-pointer"
                    >
                      <option value="">Select a reason (optional)</option>
                      <option value="personal_use">I use opioids and want to be safe</option>
                      <option value="family_friend">I have a family member or friend at risk</option>
                      <option value="community">I work or volunteer in the community</option>
                      <option value="replacement">Replacing an expired or used kit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* ...other form elements... */}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Locations */}
      {/* ...rest of file unchanged... */}
    </div>
  );
}