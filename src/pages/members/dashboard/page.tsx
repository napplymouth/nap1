import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import supabase from '../../../lib/supabase';
import BroadcastInbox from './components/BroadcastInbox';
import CertificatesSection from './components/CertificatesSection';
import SessionHistory from './components/SessionHistory';
import ImpactTracker from './components/ImpactTracker';
import PeerProgressTracker from './components/PeerProgressTracker';

interface MemberProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  event_id: string;
  status: string;
  created_at: string;
  events: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  shipping_address: any;
}

interface KitRequest {
  id: string;
  status: 'pending' | 'approved' | 'dispatched' | 'collected' | 'declined';
  notes: string | null;
  requested_at: string;
  updated_at: string;
}

type ResourceCategory = 'All' | 'Training Materials' | 'Harm Reduction Guides' | 'Community Outreach' | 'Policy Documents' | 'Drug Information';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'PNG';
  fileSize: string;
  updated: string;
  icon: string;
  iconBg: string;
  isNew?: boolean;
  downloads: number;
}

interface DrugInfo {
  id: string;
  name: string;
  streetNames: string;
  category: 'Opioid' | 'Stimulant' | 'Depressant' | 'Psychedelic' | 'Dissociative' | 'Cannabinoid';
  riskLevel: 'Very High' | 'High' | 'Moderate';
  riskColor: string;
  description: string;
  effects: string[];
  overdoseSigns: string[];
  harmReduction: string[];
  naloxoneWorks: boolean;
  icon: string;
  iconBg: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'Overdose Response Guide 2025',
    description: 'Updated step-by-step instructions for recognising and responding to an opioid overdose. Includes the latest clinical guidance and post-overdose care advice.',
    category: 'Training Materials',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    updated: '20 Jan 2025',
    icon: 'ri-file-text-fill',
    iconBg: 'bg-yellow-400',
    isNew: true,
    downloads: 312,
  },
  {
    id: 'r2',
    title: 'Naloxone Administration Visual Guide',
    description: 'Illustrated step-by-step guide to administering naloxone nasal spray and auto-injector. Ideal for printing and displaying at community venues.',
    category: 'Training Materials',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    updated: '15 Jan 2025',
    icon: 'ri-first-aid-kit-fill',
    iconBg: 'bg-pink-500',
    isNew: true,
    downloads: 278,
  },
  {
    id: 'r3',
    title: 'Peer Trainer Handbook',
    description: 'Comprehensive guide for peer trainers covering session structure, facilitation tips, Q&A handling, and signposting to further support services.',
    category: 'Training Materials',
    fileType: 'PDF',
    fileSize: '4.1 MB',
    updated: '10 Jan 2025',
    icon: 'ri-book-open-fill',
    iconBg: 'bg-lime-400',
    downloads: 194,
  },
  {
    id: 'r4',
    title: 'Training Session Slide Deck',
    description: 'Ready-to-use PowerPoint presentation for community training sessions. Covers opioid awareness, overdose signs, naloxone use, and aftercare.',
    category: 'Training Materials',
    fileType: 'PPTX',
    fileSize: '8.7 MB',
    updated: '5 Jan 2025',
    icon: 'ri-slideshow-fill',
    iconBg: 'bg-yellow-400',
    downloads: 156,
  },
  {
    id: 'r5',
    title: 'Fentanyl Awareness Leaflet 2025',
    description: 'New 2025 edition — key facts, harm reduction advice, and warning signs specific to fentanyl and synthetic opioids. Suitable for distribution.',
    category: 'Harm Reduction Guides',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    updated: '22 Jan 2025',
    icon: 'ri-alert-fill',
    iconBg: 'bg-pink-500',
    isNew: true,
    downloads: 241,
  },
  {
    id: 'r6',
    title: 'Safer Drug Use — Harm Reduction Tips',
    description: 'Practical harm reduction guidance covering safer use practices, recognising dangerous situations, and when to seek emergency help.',
    category: 'Harm Reduction Guides',
    fileType: 'PDF',
    fileSize: '980 KB',
    updated: '18 Jan 2025',
    icon: 'ri-shield-check-fill',
    iconBg: 'bg-lime-400',
    downloads: 187,
  },
  {
    id: 'r7',
    title: 'Overdose Response Poster (A3)',
    description: 'High-resolution A3 poster summarising the overdose response steps. Designed for display in community centres, pharmacies, and public spaces.',
    category: 'Harm Reduction Guides',
    fileType: 'PNG',
    fileSize: '3.5 MB',
    updated: '12 Jan 2025',
    icon: 'ri-image-fill',
    iconBg: 'bg-yellow-400',
    downloads: 329,
  },
  {
    id: 'r8',
    title: 'Poly-Drug Use Awareness Guide',
    description: 'Explains the risks of combining substances, with specific focus on opioids mixed with alcohol, benzodiazepines, and stimulants.',
    category: 'Harm Reduction Guides',
    fileType: 'PDF',
    fileSize: '1.6 MB',
    updated: '8 Jan 2025',
    icon: 'ri-capsule-fill',
    iconBg: 'bg-pink-500',
    downloads: 143,
  },
  {
    id: 'r9',
    title: 'Community Outreach Toolkit',
    description: 'Everything you need to run a community outreach event — planning checklist, talking points, FAQ sheet, and feedback form templates.',
    category: 'Community Outreach',
    fileType: 'PDF',
    fileSize: '5.2 MB',
    updated: '14 Jan 2025',
    icon: 'ri-community-fill',
    iconBg: 'bg-lime-400',
    downloads: 112,
  },
  {
    id: 'r10',
    title: 'Outreach Event Flyer Template',
    description: 'Editable Word document flyer template for promoting community naloxone training events. Includes NAP branding and placeholder text.',
    category: 'Community Outreach',
    fileType: 'DOCX',
    fileSize: '640 KB',
    updated: '9 Jan 2025',
    icon: 'ri-file-word-fill',
    iconBg: 'bg-yellow-400',
    downloads: 98,
  },
  {
    id: 'r11',
    title: 'Volunteer Outreach Script',
    description: 'Suggested conversation guide for volunteers approaching members of the public about naloxone. Includes common objections and responses.',
    category: 'Community Outreach',
    fileType: 'PDF',
    fileSize: '760 KB',
    updated: '3 Jan 2025',
    icon: 'ri-chat-voice-fill',
    iconBg: 'bg-pink-500',
    downloads: 87,
  },
  {
    id: 'r12',
    title: 'NAP Safeguarding Policy 2025',
    description: 'Our updated safeguarding policy covering responsibilities, reporting procedures, and contact details for designated safeguarding leads.',
    category: 'Policy Documents',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    updated: '2 Jan 2025',
    icon: 'ri-shield-user-fill',
    iconBg: 'bg-lime-400',
    downloads: 76,
  },
  {
    id: 'r13',
    title: 'Data Protection & GDPR Policy',
    description: 'How NAP collects, stores, and uses personal data. Includes member rights, data retention schedules, and contact for data queries.',
    category: 'Policy Documents',
    fileType: 'PDF',
    fileSize: '890 KB',
    updated: '2 Jan 2025',
    icon: 'ri-lock-2-fill',
    iconBg: 'bg-yellow-400',
    downloads: 64,
  },
  {
    id: 'r14',
    title: 'Volunteer Code of Conduct',
    description: 'Expected standards of behaviour for all NAP volunteers, including confidentiality, professional boundaries, and social media guidance.',
    category: 'Policy Documents',
    fileType: 'PDF',
    fileSize: '720 KB',
    updated: '2 Jan 2025',
    icon: 'ri-file-list-3-fill',
    iconBg: 'bg-pink-500',
    downloads: 91,
  },
];

const DRUG_INFO: DrugInfo[] = [
  {
    id: 'd1',
    name: 'Heroin / Opioids',
    streetNames: 'Smack, H, Brown, Gear, Junk',
    category: 'Opioid',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Heroin and other opioids (morphine, codeine, fentanyl, methadone, oxycodone) are powerful pain-relieving drugs that act on opioid receptors in the brain. They produce intense euphoria and pain relief but carry an extremely high risk of overdose, respiratory depression, and dependence.',
    effects: ['Intense euphoria and pain relief', 'Drowsiness and sedation', 'Slowed breathing', 'Nausea and vomiting', 'Constipation', 'Pinpoint pupils'],
    overdoseSigns: ['Unresponsive or unconscious', 'Slow, shallow or stopped breathing', 'Blue or grey lips and fingertips', 'Gurgling or snoring sounds', 'Limp body', 'Pinpoint pupils'],
    harmReduction: ['Never use alone — have someone with you', 'Carry naloxone at all times', 'Start with a small test dose', 'Avoid mixing with alcohol or benzodiazepines', 'Use clean equipment', 'Know where to get naloxone locally'],
    naloxoneWorks: true,
    icon: 'ri-syringe-fill',
    iconBg: 'bg-red-500',
  },
  {
    id: 'd2',
    name: 'Fentanyl',
    streetNames: 'Apache, China Girl, Dance Fever, Goodfella',
    category: 'Opioid',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Fentanyl is a synthetic opioid 50–100 times stronger than morphine. It is increasingly found mixed into heroin, cocaine, and counterfeit pills. Even tiny amounts can cause fatal overdose. Fentanyl test strips can detect its presence.',
    effects: ['Extreme euphoria', 'Severe respiratory depression', 'Unconsciousness', 'Pinpoint pupils', 'Confusion', 'Sedation'],
    overdoseSigns: ['Rapid onset of unconsciousness', 'Stopped or very slow breathing', 'Blue lips and fingertips', 'Unresponsive to stimulation', 'Limp body', 'May require multiple naloxone doses'],
    harmReduction: ['Use fentanyl test strips on all substances', 'Never use alone', 'Carry multiple naloxone doses', 'Start with a tiny test dose', 'Call 999 immediately if overdose suspected', 'Avoid mixing with any other substance'],
    naloxoneWorks: true,
    icon: 'ri-alert-fill',
    iconBg: 'bg-red-600',
  },
  {
    id: 'd3',
    name: 'Cocaine',
    streetNames: 'Coke, Charlie, Snow, Blow, White',
    category: 'Stimulant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Cocaine is a powerful stimulant that increases heart rate, blood pressure, and alertness. It produces intense but short-lived euphoria followed by a crash. Carries serious cardiovascular risks including heart attack and stroke.',
    effects: ['Intense energy and confidence', 'Elevated heart rate and blood pressure', 'Reduced appetite', 'Euphoria', 'Increased body temperature', 'Insomnia and restlessness'],
    overdoseSigns: ['Chest pain or heart palpitations', 'Seizures', 'Extremely high body temperature', 'Confusion or paranoia', 'Stroke symptoms', 'Irregular heartbeat'],
    harmReduction: ['Avoid mixing with alcohol (creates toxic cocaethylene)', 'Stay hydrated', 'Take breaks between doses', 'Test substances with a drug testing kit', 'Do not use if you have heart conditions', 'Avoid mixing with other stimulants'],
    naloxoneWorks: false,
    icon: 'ri-flashlight-fill',
    iconBg: 'bg-orange-500',
  },
  {
    id: 'd4',
    name: 'Crack Cocaine',
    streetNames: 'Crack, Rock, Stone, Freebase',
    category: 'Stimulant',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Crack cocaine is a smokable form of cocaine that produces an intense but very short-lived high (5–10 minutes). It is highly addictive and carries all the cardiovascular risks of powder cocaine, with faster onset and more compulsive use patterns.',
    effects: ['Immediate intense euphoria', 'Extreme energy and alertness', 'Increased heart rate and blood pressure', 'Paranoia and anxiety', 'Aggressive behaviour', 'Severe crash after use'],
    overdoseSigns: ['Chest pain', 'Seizures', 'Heart attack', 'Stroke', 'Extreme agitation', 'Loss of consciousness'],
    harmReduction: ['Use clean pipes — do not share', 'Avoid mixing with alcohol or other drugs', 'Take breaks between hits', 'Stay hydrated', 'Have someone with you', 'Seek help if chest pain occurs'],
    naloxoneWorks: false,
    icon: 'ri-fire-fill',
    iconBg: 'bg-red-500',
  },
  {
    id: 'd5',
    name: 'MDMA / Ecstasy',
    streetNames: 'Mandy, Molly, E, Pills, XTC',
    category: 'Stimulant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'MDMA (ecstasy) is a stimulant and empathogen that increases serotonin, dopamine, and norepinephrine. It produces feelings of euphoria, emotional warmth, and increased energy. Risks include overheating, dehydration, and serotonin syndrome.',
    effects: ['Euphoria and emotional warmth', 'Increased energy', 'Enhanced sensory perception', 'Jaw clenching', 'Increased heart rate and body temperature', 'Dehydration'],
    overdoseSigns: ['Extremely high body temperature (hyperthermia)', 'Seizures', 'Confusion and agitation', 'Loss of consciousness', 'Rapid or irregular heartbeat', 'Severe dehydration'],
    harmReduction: ['Sip water regularly (250ml per hour)', 'Take regular breaks if dancing', 'Avoid mixing with other substances', 'Test pills with a drug testing kit', 'Do not take if on antidepressants (SSRIs)', 'Cool down regularly'],
    naloxoneWorks: false,
    icon: 'ri-heart-pulse-fill',
    iconBg: 'bg-pink-500',
  },
  {
    id: 'd6',
    name: 'Benzodiazepines',
    streetNames: 'Benzos, Vallies, Xanax, Diazepam, Blues',
    category: 'Depressant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Benzodiazepines (diazepam, alprazolam, lorazepam) are prescription depressants used to treat anxiety and insomnia. They slow brain activity and carry high risks of dependence, overdose (especially when mixed with opioids or alcohol), and dangerous withdrawal.',
    effects: ['Relaxation and reduced anxiety', 'Sedation and drowsiness', 'Impaired coordination', 'Memory loss (blackouts)', 'Slowed breathing', 'Lowered inhibitions'],
    overdoseSigns: ['Unconsciousness', 'Very slow or stopped breathing', 'Extreme drowsiness', 'Confusion', 'Limp body', 'Cannot be woken up'],
    harmReduction: ['Never mix with opioids or alcohol — risk multiplies', 'Only use prescribed doses', 'Do not drive or operate machinery', 'Avoid long-term use without medical supervision', 'Never stop suddenly (dangerous withdrawal)', 'Have a sober person present'],
    naloxoneWorks: false,
    icon: 'ri-medicine-bottle-fill',
    iconBg: 'bg-indigo-500',
  },
  {
    id: 'd7',
    name: 'Alcohol',
    streetNames: 'Booze, Drink, Liquor',
    category: 'Depressant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Alcohol is a legal depressant that slows the central nervous system. While socially accepted, it carries serious health risks including liver disease, dependence, and overdose (alcohol poisoning). Mixing with other depressants is extremely dangerous.',
    effects: ['Relaxation and lowered inhibitions', 'Impaired judgement and coordination', 'Slurred speech', 'Memory loss (blackouts)', 'Nausea and vomiting', 'Slowed breathing'],
    overdoseSigns: ['Unconsciousness', 'Vomiting while unconscious (choking risk)', 'Slow or irregular breathing', 'Blue or pale skin', 'Low body temperature', 'Cannot be woken up'],
    harmReduction: ['Pace your drinking — alternate with water', 'Eat before and during drinking', 'Never mix with benzodiazepines, opioids, or GHB', 'Place unconscious person in recovery position', 'Call 999 if someone cannot be woken', 'Know your limits'],
    naloxoneWorks: false,
    icon: 'ri-goblet-fill',
    iconBg: 'bg-amber-500',
  },
  {
    id: 'd8',
    name: 'Methamphetamine',
    streetNames: 'Meth, Crystal, Ice, Tina, Glass',
    category: 'Stimulant',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Methamphetamine is an extremely potent stimulant that produces intense euphoria and energy lasting 8–12 hours. It is highly addictive and causes severe physical and mental health damage with regular use, including psychosis, cardiovascular damage, and dental problems.',
    effects: ['Extreme energy and alertness', 'Euphoria and confidence', 'Reduced appetite and sleep', 'Increased heart rate and blood pressure', 'Hyperthermia', 'Paranoia and aggression'],
    overdoseSigns: ['Chest pain or heart attack', 'Stroke', 'Seizures', 'Extreme agitation or psychosis', 'Hyperthermia (overheating)', 'Loss of consciousness'],
    harmReduction: ['Avoid use entirely if possible — extremely addictive', 'Stay hydrated', 'Eat regularly even if not hungry', 'Take breaks and sleep', 'Avoid mixing with other stimulants', 'Seek help if experiencing psychosis'],
    naloxoneWorks: false,
    icon: 'ri-lightning-fill',
    iconBg: 'bg-yellow-500',
  },
  {
    id: 'd9',
    name: 'Cannabis',
    streetNames: 'Weed, Skunk, Hash, Marijuana, Pot, Grass',
    category: 'Cannabinoid',
    riskLevel: 'Moderate',
    riskColor: 'bg-yellow-500',
    description: 'Cannabis is the most widely used illegal drug in the UK. While generally considered lower risk, high-potency strains (skunk) and synthetic cannabis (Spice) carry significant mental health risks including anxiety, paranoia, and psychosis, especially in young people.',
    effects: ['Relaxation and euphoria', 'Altered perception of time', 'Increased appetite', 'Impaired short-term memory', 'Anxiety or paranoia (high-THC strains)', 'Red eyes and dry mouth'],
    overdoseSigns: ['Severe anxiety or panic attack', 'Paranoia and psychosis', 'Rapid heart rate', 'Nausea and vomiting', 'Confusion and disorientation', 'Extreme sedation (synthetic cannabis)'],
    harmReduction: ['Choose lower-potency strains where possible', 'Avoid synthetic cannabis (Spice) — extremely dangerous', 'Do not mix with tobacco', 'Avoid if you have a family history of psychosis', 'Do not drive after use', 'Edibles take longer — wait before re-dosing'],
    naloxoneWorks: false,
    icon: 'ri-leaf-fill',
    iconBg: 'bg-green-500',
  },
  {
    id: 'd10',
    name: 'Ketamine',
    streetNames: 'Ket, K, Special K, Kitty, Wonk',
    category: 'Dissociative',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Ketamine is a dissociative anaesthetic that causes feelings of detachment from the body and surroundings. At higher doses it causes complete dissociation ("K-hole"). Regular use causes serious bladder and kidney damage (ketamine bladder syndrome).',
    effects: ['Detachment from body and surroundings', 'Distorted perception of time and space', 'Numbness and pain relief', 'Confusion and disorientation', 'Hallucinations', 'Loss of coordination'],
    overdoseSigns: ['Complete dissociation ("K-hole")', 'Unconsciousness', 'Inability to move or speak', 'Vomiting while sedated (choking risk)', 'Respiratory depression', 'Seizures'],
    harmReduction: ['Sit or lie down before using — you may lose coordination', 'Never use alone', 'Avoid mixing with alcohol or other depressants', 'Limit frequency to protect bladder health', 'Seek help if you notice urinary pain or blood in urine', 'Use in a safe environment'],
    naloxoneWorks: false,
    icon: 'ri-bubble-chart-fill',
    iconBg: 'bg-teal-500',
  },
];

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'All',
  'Training Materials',
  'Harm Reduction Guides',
  'Community Outreach',
  'Policy Documents',
  'Drug Information',
];

const DRUG_CATEGORIES = ['All', 'Opioid', 'Stimulant', 'Depressant', 'Psychedelic', 'Dissociative', 'Cannabinoid'];

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600',
  DOCX: 'bg-blue-100 text-blue-600',
  PPTX: 'bg-orange-100 text-orange-600',
  PNG: 'bg-green-100 text-green-600',
};

export default function MembersDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [kitRequests, setKitRequests] = useState<KitRequest[]>([]);
  const [kitSubmitting, setKitSubmitting] = useState(false);
  const [kitSuccess, setKitSuccess] = useState(false);
  
  // Resource library states
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('All');
  const [resourceSearch, setResourceSearch] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [drugCategoryFilter, setDrugCategoryFilter] = useState<string>('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');

  // Check if user is a full member (Peer Trainer or Volunteer roles with full access)
  const isFullMember = profile?.role && ['Peer Trainer', 'Kit Carrier', 'First Responder', 'Coordinator'].includes(profile.role);

  // Pending bookings = confirmed or pending (not cancelled)
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  ).length;

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
      fetchOrders();
      fetchUnreadCount();
      fetchCertificateCount();
      fetchKitRequests();
    }
  }, [user]);

  // Compute next upcoming booking
  const nextBooking = bookings
    .filter((b) => b.status !== 'cancelled' && new Date(b.events.date) >= new Date())
    .sort((a, b) => new Date(a.events.date).getTime() - new Date(b.events.date).getTime())[0] || null;

  // Live countdown to next booking
  useEffect(() => {
    if (!nextBooking) {
      setCountdown(null);
      return;
    }
    const target = new Date(`${nextBooking.events.date}T${nextBooking.events.time || '00:00'}`);

    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextBooking]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_events')
        .select(`
          id,
          event_id,
          status,
          created_at,
          events (
            title,
            date,
            time,
            location
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data: broadcasts, error: broadcastError } = await supabase
        .from('broadcasts')
        .select('id, target_audience')
        .order('created_at', { ascending: false });

      if (broadcastError) throw broadcastError;

      const { data: profile } = await supabase
        .from('member_profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle();

      const userRole = profile?.role || '';

      const relevantBroadcasts = broadcasts?.filter((b: any) => {
        if (b.target_audience === 'All Members') return true;
        if (b.target_audience === userRole) return true;
        return false;
      }) || [];

      const { data: reads, error: readsError } = await supabase
        .from('broadcast_reads')
        .select('broadcast_id')
        .eq('user_id', user?.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map((r: any) => r.broadcast_id) || []);
      const unread = relevantBroadcasts.filter((b: any) => !readIds.has(b.id));

      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchCertificateCount = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('id, expires_at, status')
        .eq('user_id', user?.id);

      if (error) throw error;

      const active = (data || []).filter((c: any) => {
        const notExpired = !c.expires_at || new Date(c.expires_at) >= new Date();
        return notExpired && c.status !== 'expired';
      });

      setCertificateCount(active.length);
    } catch (error) {
      console.error('Error fetching certificate count:', error);
    }
  };

  const fetchKitRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('naloxone_kit_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });
      if (error) throw error;
      setKitRequests(data || []);
    } catch (error) {
      console.error('Error fetching kit requests:', error);
    }
  };

  const handleRequestKit = async () => {
    setKitSubmitting(true);
    try {
      const { error } = await supabase
        .from('naloxone_kit_requests')
        .insert({ user_id: user?.id, status: 'pending' });
      if (error) throw error;
      setKitSuccess(true);
      fetchKitRequests();
      setTimeout(() => setKitSuccess(false), 4000);
    } catch (error) {
      console.error('Error submitting kit request:', error);
    } finally {
      setKitSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_events')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  // Fetch user's downloads
  useEffect(() => {
    if (!user) return;

    const fetchDownloads = async () => {
      const { data, error } = await supabase
        .from('resource_downloads')
        .select('resource_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching downloads:', error);
        return;
      }

      if (data) {
        setDownloadedIds(data.map((d) => d.resource_id));
      }
    };

    fetchDownloads();
  }, [user]);

  const handleDownload = async (id: string) => {
    if (!user || downloadedIds.includes(id)) return;

    setLoadingDownload(id);

    try {
      const { error } = await supabase
        .from('resource_downloads')
        .insert({
          resource_id: id,
          user_id: user.id,
        });

      if (error) throw error;

      setDownloadedIds((prev) => [...prev, id]);
    } catch (error) {
      console.error('Error tracking download:', error);
      alert('Failed to track download. Please try again.');
    } finally {
      setLoadingDownload(null);
    }
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchCat = resourceCategory === 'All' || r.category === resourceCategory;
      const matchSearch =
        r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(resourceSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [resourceCategory, resourceSearch]);

  // Filter drugs
  const filteredDrugs = useMemo(() => {
    return DRUG_INFO.filter((drug) => {
      const matchCategory = drugCategoryFilter === 'All' || drug.category === drugCategoryFilter;
      const matchRisk = riskLevelFilter === 'All' || drug.riskLevel === riskLevelFilter;
      const matchSearch =
        drug.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        drug.streetNames.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        drug.description.toLowerCase().includes(resourceSearch.toLowerCase());
      return matchCategory && matchRisk && matchSearch;
    });
  }, [drugCategoryFilter, riskLevelFilter, resourceSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Community Member Dashboard (simplified)
  if (!isFullMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <i className="ri-user-heart-line text-xl text-white"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Community Portal</h1>
                  <p className="text-xs text-gray-500">Welcome back, {profile?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="relative p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                >
                  <i className="ri-notification-3-line text-xl"></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-dashboard-line text-xl"></i>
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-inbox-line text-xl"></i>
                  <span>Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-pink-500 text-white text-xs rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-calendar-check-line text-xl"></i>
                  <span>My Bookings</span>
                </div>
                {pendingBookingsCount > 0 && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-bold">
                    {pendingBookingsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('kit-requests')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'kit-requests'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-first-aid-kit-line text-xl"></i>
                <span>Naloxone Kits</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'resources'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-folder-download-line text-xl"></i>
                <span>Resources</span>
              </button>
              <button
                onClick={() => setActiveTab('peer-progress')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'peer-progress'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-flag-2-line text-xl"></i>
                <span>My Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'orders'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-shopping-bag-line text-xl"></i>
                <span>Shop Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-yellow-50 text-yellow-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-user-settings-line text-xl"></i>
                <span>Profile</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-yellow-400 to-pink-500 rounded-2xl p-8 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">Community Member</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
                  <p className="text-yellow-50">Community Member Portal</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-calendar-check-line text-2xl text-yellow-600"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter((b) => b.status !== 'cancelled').length}
                      </p>
                      <p className="text-sm text-gray-500">Active Bookings</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-shopping-bag-line text-2xl text-pink-600"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                      <p className="text-sm text-gray-500">Shop Orders</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-first-aid-kit-line text-2xl text-yellow-600"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{kitRequests.filter(r => r.status === 'collected').length}</p>
                      <p className="text-sm text-gray-500">Kits Collected</p>
                    </div>
                  </div>
                </div>

                {/* Naloxone Kit Request Status Tracker */}
                {(() => {
                  const latestRequest = kitRequests[0] || null;
                  const hasPending = latestRequest && latestRequest.status !== 'collected' && latestRequest.status !== 'declined';

                  const steps: { key: KitRequest['status']; label: string; icon: string }[] = [
                    { key: 'pending', label: 'Requested', icon: 'ri-time-line' },
                    { key: 'approved', label: 'Approved', icon: 'ri-checkbox-circle-line' },
                    { key: 'dispatched', label: 'Dispatched', icon: 'ri-truck-line' },
                    { key: 'collected', label: 'Collected', icon: 'ri-hand-heart-line' },
                  ];

                  const stepOrder = ['pending', 'approved', 'dispatched', 'collected'];
                  const currentStepIndex = latestRequest ? stepOrder.indexOf(latestRequest.status) : -1;

                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    approved: 'bg-green-100 text-green-700 border-green-200',
                    dispatched: 'bg-pink-100 text-pink-700 border-pink-200',
                    collected: 'bg-gray-100 text-gray-600 border-gray-200',
                    declined: 'bg-red-100 text-red-700 border-red-200',
                  };

                  return (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <i className="ri-first-aid-kit-line text-xl text-pink-600"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Naloxone Kit Request</h3>
                            <p className="text-xs text-gray-500">Track your kit request status</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('kit-requests')}
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium whitespace-nowrap"
                        >
                          View All →
                        </button>
                      </div>

                      {latestRequest && latestRequest.status === 'declined' ? (
                        <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-xl border border-red-100">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-close-circle-line text-xl text-red-500"></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-red-700">Request Declined</p>
                            <p className="text-sm text-red-500 mt-0.5">
                              {latestRequest.notes || 'Your request was not approved. Please contact us for more information.'}
                            </p>
                            <button
                              onClick={handleRequestKit}
                              disabled={kitSubmitting}
                              className="mt-3 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {kitSubmitting ? 'Submitting...' : 'Request Again'}
                            </button>
                          </div>
                        </div>
                      ) : hasPending && latestRequest ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[latestRequest.status]}`}>
                              {latestRequest.status.charAt(0).toUpperCase() + latestRequest.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Requested {new Date(latestRequest.requested_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex items-center">
                            {steps.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              const isActive = idx === currentStepIndex;
                              return (
                                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                      isCompleted
                                        ? 'bg-gradient-to-br from-yellow-400 to-pink-500 shadow-sm'
                                        : 'bg-gray-100'
                                    } ${isActive ? 'ring-2 ring-yellow-300 ring-offset-2' : ''}`}>
                                      <i className={`${step.icon} text-sm ${isCompleted ? 'text-white' : 'text-gray-400'}`}></i>
                                    </div>
                                    <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                  {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all ${idx < currentStepIndex ? 'bg-gradient-to-r from-yellow-400 to-pink-400' : 'bg-gray-200'}`}></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {latestRequest.notes && (
                            <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-100">
                              <i className="ri-information-line text-yellow-500 mr-1"></i>
                              {latestRequest.notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="ri-first-aid-kit-line text-xl text-gray-400"></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">
                                {kitRequests.length > 0 ? 'Last kit collected ✓' : 'No active kit request'}
                              </p>
                              <p className="text-sm text-gray-500">Request a free naloxone kit to carry</p>
                            </div>
                          </div>
                          {kitSuccess ? (
                            <span className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                              <i className="ri-check-line"></i>
                              <span>Submitted!</span>
                            </span>
                          ) : (
                            <button
                              onClick={handleRequestKit}
                              disabled={kitSubmitting}
                              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {kitSubmitting ? 'Submitting...' : 'Request Kit'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Upcoming Session Countdown */}
                {nextBooking ? (
                  <div className="bg-white rounded-xl border-2 border-yellow-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full uppercase tracking-wide">Next Session</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mt-2">{nextBooking.events.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <i className="ri-calendar-line text-yellow-500"></i>
                              <span>{new Date(nextBooking.events.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <i className="ri-time-line text-yellow-500"></i>
                              <span>{nextBooking.events.time}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <i className="ri-map-pin-line text-pink-500"></i>
                              <span>{nextBooking.events.location}</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium whitespace-nowrap ml-4"
                        >
                          View All →
                        </button>
                      </div>

                      {countdown && (
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { value: countdown.days, label: 'Days' },
                            { value: countdown.hours, label: 'Hours' },
                            { value: countdown.minutes, label: 'Mins' },
                            { value: countdown.seconds, label: 'Secs' },
                          ].map(({ value, label }) => (
                            <div key={label} className="bg-gradient-to-br from-yellow-400 to-pink-500 rounded-xl p-4 text-center text-white shadow-sm">
                              <p className="text-3xl font-bold tabular-nums leading-none">
                                {String(value).padStart(2, '0')}
                              </p>
                              <p className="text-xs font-medium mt-1 opacity-90 uppercase tracking-wide">{label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-calendar-line text-2xl text-gray-400"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">No upcoming sessions</p>
                        <p className="text-sm text-gray-500">Book a training session to see your countdown here</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                    >
                      Book Now
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400 transition-all">
                      <i className="ri-calendar-check-line text-2xl text-yellow-600 group-hover:text-white"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Book Training</h3>
                    <p className="text-sm text-gray-600">Reserve your spot</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('kit-requests')}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-400 transition-all">
                      <i className="ri-first-aid-kit-line text-2xl text-pink-600 group-hover:text-white"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Request Kit</h3>
                    <p className="text-sm text-gray-600">Get naloxone kit</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400 transition-all">
                      <i className="ri-folder-download-line text-2xl text-yellow-600 group-hover:text-white"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Resources</h3>
                    <p className="text-sm text-gray-600">Download guides</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all text-left group relative"
                  >
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-400 transition-all">
                      <i className="ri-inbox-line text-2xl text-pink-600 group-hover:text-white"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Inbox</h3>
                    <p className="text-sm text-gray-600">Read messages</p>
                    {unreadCount > 0 && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-pink-500 text-white text-xs rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <i className="ri-calendar-line text-yellow-600"></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.events.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.events.date).toLocaleDateString()} at {booking.events.time}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inbox' && (
              <BroadcastInbox onUnreadCountChange={setUnreadCount} />
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                  <button
                    onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all"
                  >
                    Book New Session
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <i className="ri-calendar-line text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <button
                      onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                    >
                      Browse Training Sessions
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="ri-calendar-check-line text-xl text-yellow-600"></i>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{booking.events.title}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center space-x-2">
                                  <i className="ri-calendar-line"></i>
                                  <span>{new Date(booking.events.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                  <i className="ri-time-line"></i>
                                  <span>{booking.events.time}</span>
                                </p>
                                <p className="flex items-center space-x-2">
                                  <i className="ri-map-pin-line"></i>
                                  <span>{booking.events.location}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {booking.status}
                            </span>
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'kit-requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Naloxone Kit Requests</h2>
                  {!kitRequests.some((r) => r.status === 'pending' || r.status === 'approved' || r.status === 'dispatched') && (
                    <button
                      onClick={handleRequestKit}
                      disabled={kitSubmitting}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {kitSubmitting ? 'Submitting...' : '+ Request New Kit'}
                    </button>
                  )}
                </div>

                {kitSuccess && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                    <i className="ri-check-double-line text-xl"></i>
                    <p className="font-medium">Your kit request has been submitted! We&apos;ll review it shortly.</p>
                  </div>
                )}

                {kitRequests.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <i className="ri-first-aid-kit-line text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-2 font-medium">No kit requests yet</p>
                    <p className="text-sm text-gray-400 mb-6">Request a free naloxone kit to carry in your community</p>
                    <button
                      onClick={handleRequestKit}
                      disabled={kitSubmitting}
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {kitSubmitting ? 'Submitting...' : 'Request a Kit'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kitRequests.map((req) => {
                      const steps: { key: string; label: string; icon: string }[] = [
                        { key: 'pending', label: 'Requested', icon: 'ri-time-line' },
                        { key: 'approved', label: 'Approved', icon: 'ri-checkbox-circle-line' },
                        { key: 'dispatched', label: 'Dispatched', icon: 'ri-truck-line' },
                        { key: 'collected', label: 'Collected', icon: 'ri-hand-heart-line' },
                      ];
                      const stepOrder = ['pending', 'approved', 'dispatched', 'collected'];
                      const currentIdx = stepOrder.indexOf(req.status);
                      const isDeclined = req.status === 'declined';

                      return (
                        <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div>
                              <p className="font-semibold text-gray-900">Kit Request</p>
                              <p className="text-sm text-gray-500">
                                Submitted {new Date(req.requested_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : req.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200'
                              : req.status === 'dispatched' ? 'bg-pink-100 text-pink-700 border-pink-200'
                              : req.status === 'collected' ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </div>

                          {isDeclined ? (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-sm text-red-600">
                              <i className="ri-close-circle-line mr-1"></i>
                              {req.notes || 'This request was declined. Please contact us for more information.'}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              {steps.map((step, idx) => {
                                const isCompleted = idx <= currentIdx;
                                const isActive = idx === currentIdx;
                                return (
                                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted ? 'bg-gradient-to-br from-yellow-400 to-pink-500 shadow-sm' : 'bg-gray-100'
                                      } ${isActive ? 'ring-2 ring-yellow-300 ring-offset-2' : ''}`}>
                                        <i className={`${step.icon} text-sm ${isCompleted ? 'text-white' : 'text-gray-400'}`}></i>
                                      </div>
                                      <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                      <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all ${idx < currentIdx ? 'bg-gradient-to-r from-yellow-400 to-pink-400' : 'bg-gray-200'}`}></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {req.notes && !isDeclined && (
                            <p className="mt-4 text-sm text-gray-600 bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-100">
                              <i className="ri-information-line text-yellow-500 mr-1"></i>
                              {req.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Harm Reduction Resources</h2>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400 text-base"></i>
                  </div>
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search resources and drug information..."
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors text-sm"
                  />
                  {resourceSearch && (
                    <button
                      onClick={() => setResourceSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-base"></i>
                    </button>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_CATEGORIES.map((cat) => {
                    const count = cat === 'All' 
                      ? RESOURCES.length + DRUG_INFO.length
                      : cat === 'Drug Information'
                      ? DRUG_INFO.length
                      : RESOURCES.filter((r) => r.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setResourceCategory(cat)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                          resourceCategory === cat
                            ? 'bg-pink-400 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-400 hover:text-gray-900'
                        }`}
                      >
                        {cat}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          resourceCategory === cat ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Drug Information Section */}
                {resourceCategory === 'Drug Information' && (
                  <>
                    {/* Drug Filters */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Drug Category</label>
                          <select
                            value={drugCategoryFilter}
                            onChange={(e) => setDrugCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                          >
                            {DRUG_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Risk Level</label>
                          <select
                            value={riskLevelFilter}
                            onChange={(e) => setRiskLevelFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                          >
                            <option value="All">All Levels</option>
                            <option value="Very High">Very High Risk</option>
                            <option value="High">High Risk</option>
                            <option value="Moderate">Moderate Risk</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Drug Info Cards */}
                    {filteredDrugs.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-search-line text-gray-400 text-3xl"></i>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-2">No drug information found</p>
                        <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search query</p>
                        <button
                          onClick={() => { setResourceSearch(''); setDrugCategoryFilter('All'); setRiskLevelFilter('All'); }}
                          className="bg-pink-400 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-500 transition-all whitespace-nowrap cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {filteredDrugs.map((drug) => (
                          <div
                            key={drug.id}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group cursor-pointer"
                            onClick={() => setSelectedDrug(drug)}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-14 h-14 ${drug.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                <i className={`${drug.icon} text-white text-2xl`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-900 text-base leading-tight">{drug.name}</h3>
                                  <span className={`${drug.riskColor} text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                                    {drug.riskLevel}
                                  </span>
                                  {drug.naloxoneWorks && (
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                                      <i className="ri-medicine-bottle-line"></i>Naloxone
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs mb-2">
                                  <strong>Street names:</strong> {drug.streetNames}
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">{drug.description}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">{drug.category}</span>
                                  <span className="text-pink-600 font-semibold flex items-center gap-1">
                                    <i className="ri-arrow-right-line"></i>Click for full info
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Regular Resources Section */}
                {resourceCategory !== 'Drug Information' && (
                  <>
                    {filteredResources.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-search-line text-gray-400 text-3xl"></i>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-2">No resources found</p>
                        <p className="text-gray-400 text-sm mb-6">Try adjusting your search or selecting a different category</p>
                        <button
                          onClick={() => { setResourceSearch(''); setResourceCategory('All'); }}
                          className="bg-pink-400 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-500 transition-all whitespace-nowrap cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredResources.map((resource) => (
                          <div
                            key={resource.id}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 ${resource.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                <i className={`${resource.icon} text-white text-2xl`}></i>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{resource.title}</h3>
                                  <span className={`${FILE_TYPE_COLORS[resource.fileType]} text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                                    {resource.fileType}
                                  </span>
                                  {resource.isNew && (
                                    <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{resource.description}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <i className="ri-price-tag-3-line"></i>
                                    <span className="text-gray-600 font-semibold">{resource.category}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <i className="ri-file-size-line"></i>{resource.fileSize}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <i className="ri-refresh-line"></i>Updated {resource.updated}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <i className="ri-download-line"></i>{resource.downloads} downloads
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDownload(resource.id)}
                                disabled={loadingDownload === resource.id || downloadedIds.includes(resource.id)}
                                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-md ${
                                  downloadedIds.includes(resource.id)
                                    ? 'bg-lime-400 text-gray-900'
                                    : loadingDownload === resource.id
                                    ? 'bg-gray-400 text-white cursor-wait'
                                    : 'bg-gray-900 text-pink-400 hover:bg-gray-800'
                                }`}
                              >
                                {loadingDownload === resource.id ? (
                                  <><i className="ri-loader-4-line animate-spin"></i>Downloading...</>
                                ) : downloadedIds.includes(resource.id) ? (
                                  <><i className="ri-check-line"></i>Downloaded</>
                                ) : (
                                  <><i className="ri-download-2-line"></i>Download</>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'peer-progress' && (
              <PeerProgressTracker />
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Shop Orders</h2>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <i className="ri-shopping-bag-line text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <button
                      onClick={() => window.REACT_APP_NAVIGATE('/shop')}
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-gray-900">Order #{order.order_number}</h3>
                            <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'dispatched'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        
                        {/* Order Tracking Timeline */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                            <div
                              className="absolute top-5 left-0 h-0.5 bg-pink-500 transition-all"
                              style={{
                                width: order.status === 'processing' ? '0%' : order.status === 'dispatched' ? '50%' : '100%'
                              }}
                            ></div>
                            
                            <div className="flex flex-col items-center relative z-10">
                              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center mb-2">
                                <i className="ri-check-line text-white"></i>
                              </div>
                              <span className="text-xs font-medium text-gray-900">Processing</span>
                            </div>
                            
                            <div className="flex flex-col items-center relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                order.status === 'dispatched' || order.status === 'delivered'
                                  ? 'bg-pink-500'
                                  : 'bg-gray-200'
                              }`}>
                                <i className={`ri-truck-line ${
                                  order.status === 'dispatched' || order.status === 'delivered'
                                    ? 'text-white'
                                    : 'text-gray-400'
                                }`}></i>
                              </div>
                              <span className={`text-xs font-medium ${
                                order.status === 'dispatched' || order.status === 'delivered'
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}>Dispatched</span>
                            </div>
                            
                            <div className="flex flex-col items-center relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                order.status === 'delivered'
                                  ? 'bg-pink-500'
                                  : 'bg-gray-200'
                              }`}>
                                <i className={`ri-home-smile-line ${
                                  order.status === 'delivered'
                                    ? 'text-white'
                                    : 'text-gray-400'
                                }`}></i>
                              </div>
                              <span className={`text-xs font-medium ${
                                order.status === 'delivered'
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}>Delivered</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-lg font-bold text-gray-900">Total: £{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Type</label>
                      <input
                        type="text"
                        value="Community Member"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drug Detail Modal */}
            {selectedDrug && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDrug(null)}>
                <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className={`${selectedDrug.iconBg} p-6 relative`}>
                    <button
                      onClick={() => setSelectedDrug(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-white text-2xl"></i>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <i className={`${selectedDrug.icon} text-white text-3xl`}></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedDrug.name}</h2>
                        <p className="text-white/90 text-sm">
                          <strong>Street names:</strong> {selectedDrug.streetNames}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className={`${selectedDrug.riskColor} text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
                        {selectedDrug.riskLevel} Risk
                      </span>
                      <span className="bg-white/30 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {selectedDrug.category}
                      </span>
                      {selectedDrug.naloxoneWorks && (
                        <span className="bg-white text-red-600 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                          <i className="ri-medicine-bottle-line"></i>Naloxone Reverses Overdose
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">What is it?</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedDrug.description}</p>
                    </div>

                    {selectedDrug.naloxoneWorks && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <i className="ri-medicine-bottle-line text-2xl text-red-600 flex-shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-bold text-red-800 mb-1">Naloxone can reverse an opioid overdose</p>
                          <p className="text-red-700 text-sm">Always call 999 first, then administer naloxone if available. <button onClick={() => window.REACT_APP_NAVIGATE('/get-naloxone')} className="underline font-semibold hover:text-red-900">Get a free naloxone kit →</button></p>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className="ri-pulse-line text-gray-700"></i>
                        </div>
                        Common Effects
                      </h3>
                      <ul className="space-y-2">
                        {selectedDrug.effects.map((effect, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-checkbox-blank-circle-fill text-gray-400 text-xs"></i>
                            </div>
                            <span>{effect}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className="ri-alarm-warning-line text-red-600"></i>
                        </div>
                        Overdose / Crisis Signs
                      </h3>
                      <ul className="space-y-2">
                        {selectedDrug.overdoseSigns.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-error-warning-fill text-red-500 text-xs"></i>
                            </div>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <i className="ri-shield-check-line text-green-600"></i>
                        </div>
                        Harm Reduction Tips
                      </h3>
                      <ul className="space-y-2">
                        {selectedDrug.harmReduction.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-check-line text-green-600 text-xs font-bold"></i>
                            </div>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDownload(selectedDrug.id)}
                        disabled={loadingDownload === selectedDrug.id || downloadedIds.includes(selectedDrug.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer shadow-md ${
                          downloadedIds.includes(selectedDrug.id)
                            ? 'bg-lime-500 text-white'
                            : loadingDownload === selectedDrug.id
                            ? 'bg-gray-400 text-white cursor-wait'
                            : 'bg-pink-400 text-white hover:bg-pink-500'
                        }`}
                      >
                        {loadingDownload === selectedDrug.id ? (
                          <><i className="ri-loader-4-line animate-spin"></i>Downloading...</>
                        ) : downloadedIds.includes(selectedDrug.id) ? (
                          <><i className="ri-check-line"></i>Downloaded</>
                        ) : (
                          <><i className="ri-download-2-line"></i>Download PDF</>
                        )}
                      </button>
                      <button
                        onClick={() => window.REACT_APP_NAVIGATE('/emergency')}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition-all whitespace-nowrap shadow-md"
                      >
                        <i className="ri-first-aid-kit-line"></i>Emergency Response Guide
                      </button>
                      <a
                        href="https://www.talktofrank.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all whitespace-nowrap shadow-md"
                      >
                        <i className="ri-external-link-line"></i>More Info on FRANK
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Peer Member Dashboard (full-featured)
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center">
                <i className="ri-shield-star-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Peer Members Portal</h1>
                <p className="text-xs text-gray-500">Welcome back, {profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('inbox')}
                className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
              >
                <i className="ri-notification-3-line text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-dashboard-line text-xl"></i>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                activeTab === 'inbox'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="ri-inbox-line text-xl"></i>
                <span>Inbox</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-pink-500 text-white text-xs rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                activeTab === 'bookings'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="ri-calendar-check-line text-xl"></i>
                <span>My Bookings</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-bold">
                  {pendingBookingsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('elearning')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'elearning'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-graduation-cap-line text-xl"></i>
              <span>eLearning</span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'certificates'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-award-line text-xl"></i>
              <span>Certificates</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'sessions'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-history-line text-xl"></i>
              <span>Session History</span>
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'impact'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-line-chart-line text-xl"></i>
              <span>My Impact</span>
            </button>
            <button
              onClick={() => setActiveTab('peer-progress')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'peer-progress'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-flag-2-line text-xl"></i>
              <span>My Progress</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'resources'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-folder-download-line text-xl"></i>
              <span>Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-shopping-bag-line text-xl"></i>
              <span>Order History</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-pink-50 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-user-settings-line text-xl"></i>
              <span>Profile</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-pink-500 to-yellow-400 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">{profile?.role}</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
                <p className="text-pink-50">Peer Members Portal</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Sessions Attended</span>
                    <i className="ri-calendar-check-line text-pink-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Kits Collected</span>
                    <i className="ri-first-aid-kit-line text-yellow-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Volunteer Hours</span>
                    <i className="ri-time-line text-pink-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">People Trained</span>
                    <i className="ri-group-line text-yellow-500 text-xl"></i>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">45</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-400 transition-all">
                    <i className="ri-calendar-check-line text-2xl text-pink-600 group-hover:text-white"></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Book Training</h3>
                  <p className="text-sm text-gray-600">Reserve your spot</p>
                </button>
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/get-naloxone')}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400 transition-all">
                    <i className="ri-first-aid-kit-line text-2xl text-yellow-600 group-hover:text-white"></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Request Kit</h3>
                  <p className="text-sm text-gray-600">Get naloxone kit</p>
                </button>
                <button
                  onClick={() => setActiveTab('elearning')}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-400 transition-all">
                    <i className="ri-graduation-cap-line text-2xl text-pink-600 group-hover:text-white"></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">eLearning</h3>
                  <p className="text-sm text-gray-600">Continue courses</p>
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400 transition-all">
                    <i className="ri-award-line text-2xl text-yellow-600 group-hover:text-white"></i>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Certificates</h3>
                  <p className="text-sm text-gray-600">View achievements</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'ri-award-line', text: 'Completed Naloxone Administration course', time: '2 days ago', color: 'pink' },
                    { icon: 'ri-calendar-check-line', text: 'Attended Harm Reduction Training', time: '5 days ago', color: 'yellow' },
                    { icon: 'ri-first-aid-kit-line', text: 'Collected Naloxone Kit #NK-2024-089', time: '1 week ago', color: 'pink' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${activity.icon} text-${activity.color}-600`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <BroadcastInbox onUnreadCountChange={setUnreadCount} />
          )}

          {activeTab === 'certificates' && <CertificatesSection />}

          {activeTab === 'sessions' && <SessionHistory />}

          {activeTab === 'impact' && <ImpactTracker />}

          {activeTab === 'peer-progress' && (
            <PeerProgressTracker />
          )}

          {activeTab === 'elearning' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">eLearning Courses</h2>
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/members/elearning')}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                >
                  Browse All Courses
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <i className="ri-graduation-cap-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 mb-4">Access your online training courses</p>
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/members/elearning')}
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                >
                  View Courses
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                <button
                  onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                >
                  Book New Session
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <i className="ri-calendar-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <button
                    onClick={() => window.REACT_APP_NAVIGATE('/booking')}
                    className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-all"
                  >
                    Browse Training Sessions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-calendar-check-line text-xl text-pink-600"></i>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">{booking.events.title}</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center space-x-2">
                                <i className="ri-calendar-line"></i>
                                <span>{new Date(booking.events.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              </p>
                              <p className="flex items-center space-x-2">
                                <i className="ri-time-line"></i>
                                <span>{booking.events.time}</span>
                              </p>
                              <p className="flex items-center space-x-2">
                                <i className="ri-map-pin-line"></i>
                                <span>{booking.events.location}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {booking.status}
                          </span>
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Harm Reduction Resources</h2>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-base"></i>
                </div>
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Search resources and drug information..."
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors text-sm"
                />
                {resourceSearch && (
                  <button
                    onClick={() => setResourceSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-base"></i>
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {RESOURCE_CATEGORIES.map((cat) => {
                  const count = cat === 'All' 
                    ? RESOURCES.length + DRUG_INFO.length
                    : cat === 'Drug Information'
                    ? DRUG_INFO.length
                    : RESOURCES.filter((r) => r.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setResourceCategory(cat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                        resourceCategory === cat
                          ? 'bg-pink-400 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-400 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        resourceCategory === cat ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Drug Information Section */}
              {resourceCategory === 'Drug Information' && (
                <>
                  {/* Drug Filters */}
                  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Drug Category</label>
                        <select
                          value={drugCategoryFilter}
                          onChange={(e) => setDrugCategoryFilter(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                        >
                          {DRUG_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Risk Level</label>
                        <select
                          value={riskLevelFilter}
                          onChange={(e) => setRiskLevelFilter(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                        >
                          <option value="All">All Levels</option>
                          <option value="Very High">Very High Risk</option>
                          <option value="High">High Risk</option>
                          <option value="Moderate">Moderate Risk</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Drug Info Cards */}
                  {filteredDrugs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-search-line text-gray-400 text-3xl"></i>
                      </div>
                      <p className="text-gray-700 font-bold text-lg mb-2">No drug information found</p>
                      <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search query</p>
                      <button
                        onClick={() => { setResourceSearch(''); setDrugCategoryFilter('All'); setRiskLevelFilter('All'); }}
                        className="bg-pink-400 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-500 transition-all whitespace-nowrap cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredDrugs.map((drug) => (
                        <div
                          key={drug.id}
                          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group cursor-pointer"
                          onClick={() => setSelectedDrug(drug)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 ${drug.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              <i className={`${drug.icon} text-white text-2xl`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-900 text-base leading-tight">{drug.name}</h3>
                                <span className={`${drug.riskColor} text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                                  {drug.riskLevel}
                                </span>
                                {drug.naloxoneWorks && (
                                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                                    <i className="ri-medicine-bottle-line"></i>Naloxone
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs mb-2">
                                <strong>Street names:</strong> {drug.streetNames}
                              </p>
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">{drug.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">{drug.category}</span>
                                <span className="text-pink-600 font-semibold flex items-center gap-1">
                                  <i className="ri-arrow-right-line"></i>Click for full info
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Regular Resources Section */}
              {resourceCategory !== 'Drug Information' && (
                <>
                  {filteredResources.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-search-line text-gray-400 text-3xl"></i>
                      </div>
                      <p className="text-gray-700 font-bold text-lg mb-2">No resources found</p>
                      <p className="text-gray-400 text-sm mb-6">Try adjusting your search or selecting a different category</p>
                      <button
                        onClick={() => { setResourceSearch(''); setResourceCategory('All'); }}
                        className="bg-pink-400 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-500 transition-all whitespace-nowrap cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 ${resource.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              <i className={`${resource.icon} text-white text-2xl`}></i>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{resource.title}</h3>
                                <span className={`${FILE_TYPE_COLORS[resource.fileType]} text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                                  {resource.fileType}
                                </span>
                                {resource.isNew && (
                                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{resource.description}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <i className="ri-price-tag-3-line"></i>
                                  <span className="text-gray-600 font-semibold">{resource.category}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="ri-file-size-line"></i>{resource.fileSize}
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="ri-refresh-line"></i>Updated {resource.updated}
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="ri-download-line"></i>{resource.downloads} downloads
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownload(resource.id)}
                              disabled={loadingDownload === resource.id || downloadedIds.includes(resource.id)}
                              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-md ${
                                downloadedIds.includes(resource.id)
                                  ? 'bg-lime-400 text-gray-900'
                                  : loadingDownload === resource.id
                                  ? 'bg-gray-400 text-white cursor-wait'
                                  : 'bg-gray-900 text-pink-400 hover:bg-gray-800'
                              }`}
                            >
                              {loadingDownload === resource.id ? (
                                <><i className="ri-loader-4-line animate-spin"></i>Downloading...</>
                              ) : downloadedIds.includes(resource.id) ? (
                                <><i className="ri-check-line"></i>Downloaded</>
                              ) : (
                                <><i className="ri-download-2-line"></i>Download</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Type</label>
                    <input
                      type="text"
                      value={profile?.role || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}