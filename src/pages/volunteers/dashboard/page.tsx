import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import supabase from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import CertificatesSection from '../../members/dashboard/components/CertificatesSection';
import SessionHistory from '../../members/dashboard/components/SessionHistory';

interface HourEntry {
  id: string;
  date: string;
  activity_type: string;
  hours: number;
  description: string;
  admin_notes: string | null;
  status: 'pending' | 'approved' | 'flagged';
  created_at: string;
}

interface VolunteerEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string | null;
  notes: string | null;
  role: string;
}

interface BroadcastItem {
  id: string;
  subject: string;
  message: string;
  target_audience: string;
  created_at: string;
  is_read: boolean;
}

interface MessageState {
  type: 'success' | 'error';
  text: string;
}

interface HoursForm {
  date: string;
  hours: string;
  activity_type: string;
  description: string;
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
    harmReduction: ['Use clean pipes — do not share', 'Avoid mixing with alcohol or other drugs', 'Take breaks between hits', 'Stay hydrated', 'Have a sober person present', 'Seek help if chest pain occurs'],
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

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<{ full_name: string; phone: string | null } | null>(null);
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all');
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastItem | null>(null);
  const [hoursForm, setHoursForm] = useState<HoursForm>({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    activity_type: '',
    description: '',
  });

  // Resource library states
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('All');
  const [resourceSearch, setResourceSearch] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [drugCategoryFilter, setDrugCategoryFilter] = useState<string>('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'events', label: 'My Events', icon: 'ri-calendar-event-line' },
    { id: 'log-hours', label: 'Log Hours', icon: 'ri-time-line' },
    { id: 'hours', label: 'My Hours', icon: 'ri-bar-chart-line' },
    { id: 'certificates', label: 'Certificates', icon: 'ri-award-line' },
    { id: 'session-history', label: 'Session History', icon: 'ri-history-line' },
    { id: 'elearning', label: 'eLearning', icon: 'ri-graduation-cap-line' },
    { id: 'resources', label: 'Resources', icon: 'ri-folder-line' },
    { id: 'messages', label: 'Messages', icon: 'ri-mail-line', badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
  ];

  const filteredBroadcasts = messageFilter === 'unread'
    ? broadcasts.filter((b) => !b.is_read)
    : broadcasts;

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('volunteer_profiles')
      .select('full_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setProfile(data);
  }, [user?.id]);

  const loadAllData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await loadProfile();

      // Load events
      const { data: eventsData } = await supabase
        .from('volunteer_events')
        .select('id, title, date, time, location, description, notes, role')
        .eq('user_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      setEvents(eventsData || []);

      // Load hours
      const { data: hoursData } = await supabase
        .from('volunteer_hours')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      setHours(hoursData || []);

      // Load broadcasts
      const { data: broadcastsData } = await supabase
        .from('broadcasts')
        .select('id, subject, message, target_audience, created_at')
        .in('target_audience', ['all_volunteers', 'all'])
        .order('created_at', { ascending: false });

      if (broadcastsData && broadcastsData.length > 0) {
        const { data: readsData } = await supabase
          .from('broadcast_reads')
          .select('broadcast_id')
          .eq('user_id', user.id);

        const readIds = new Set((readsData || []).map((r: { broadcast_id: string }) => r.broadcast_id));
        const enriched: BroadcastItem[] = broadcastsData.map((b) => ({
          ...b,
          is_read: readIds.has(b.id),
        }));
        setBroadcasts(enriched);
        setUnreadCount(enriched.filter((b) => !b.is_read).length);
      } else {
        setBroadcasts([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadProfile]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/volunteers/login');
    }
  };

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('volunteer_hours').insert({
        user_id: user.id,
        date: hoursForm.date,
        activity_type: hoursForm.activity_type,
        hours: parseFloat(hoursForm.hours),
        description: hoursForm.description,
        status: 'pending',
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Hours logged successfully!' });
      setHoursForm({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        activity_type: '',
        description: '',
      });
      await loadAllData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to log hours';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const openBroadcastDetail = async (broadcast: BroadcastItem) => {
    setSelectedBroadcast(broadcast);
    if (!broadcast.is_read && user?.id) {
      await supabase.from('broadcast_reads').upsert({
        broadcast_id: broadcast.id,
        user_id: user.id,
      });
      setBroadcasts((prev) =>
        prev.map((b) => (b.id === broadcast.id ? { ...b, is_read: true } : b))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const closeBroadcastDetail = () => setSelectedBroadcast(null);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-24 right-4 z-50 ${
            message.type === 'success' ? 'bg-lime-500' : 'bg-red-500'
          } text-white px-6 py-4 rounded-xl shadow-lg font-semibold flex items-center gap-3`}
        >
          <i
            className={`${
              message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'
            } text-xl`}
          ></i>
          {message.text}
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i className="ri-shield-user-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Volunteer Portal</h1>
                <p className="text-xs text-green-600">Making a difference together</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('messages')}
                className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <i className="ri-mail-line text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <i className="ri-logout-box-line mr-2"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <nav className="p-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${item.icon} text-lg`}></i>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* ── DASHBOARD ── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Volunteer'}! 👋
                      </h2>
                      <p className="text-green-50 text-lg">
                        Thank you for your dedication to harm reduction
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <i className="ri-heart-pulse-line text-3xl"></i>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { icon: 'ri-calendar-check-line', color: 'green', value: events.length, label: 'Upcoming Events' },
                    { icon: 'ri-time-line', color: 'emerald', value: hours.reduce((s, h) => s + h.hours, 0), label: 'Total Hours' },
                    { icon: 'ri-checkbox-circle-line', color: 'teal', value: hours.filter((h) => h.status === 'approved').length, label: 'Approved Entries' },
                    { icon: 'ri-mail-line', color: 'green', value: unreadCount, label: 'Unread Messages' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                        <i className={`${stat.icon} text-xl text-${stat.color}-600`}></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { tab: 'log-hours', icon: 'ri-time-line', color: 'green', label: 'Log Hours', sub: 'Record volunteer time' },
                      { tab: 'events', icon: 'ri-calendar-event-line', color: 'emerald', label: 'My Events', sub: 'View scheduled events' },
                      { tab: 'elearning', icon: 'ri-graduation-cap-line', color: 'teal', label: 'eLearning', sub: 'Access training courses' },
                      { tab: 'certificates', icon: 'ri-award-line', color: 'green', label: 'Certificates', sub: 'View achievements' },
                    ].map((action) => (
                      <button
                        key={action.tab}
                        onClick={() => setActiveTab(action.tab)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left"
                      >
                        <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                          <i className={`${action.icon} text-xl text-${action.color}-600`}></i>
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">{action.label}</p>
                        <p className="text-xs text-gray-600">{action.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {events.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                      <button
                        onClick={() => setActiveTab('events')}
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-calendar-line text-xl text-green-600"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric',
                              })}{' '}at {event.time}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                            {event.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── EVENTS ── */}
            {activeTab === 'events' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">My Events</h2>
                  <p className="text-sm text-gray-600 mt-1">View your scheduled volunteer events</p>
                </div>
                <div className="p-6">
                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-calendar-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-600 mb-2">No upcoming events</p>
                      <p className="text-sm text-gray-500">Check back later for new volunteer opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <i className="ri-calendar-line"></i>
                                  <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <i className="ri-time-line"></i>
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <i className="ri-map-pin-line"></i>
                                  <span>{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full whitespace-nowrap">
                              {event.role}
                            </span>
                          </div>
                          {event.description && <p className="text-sm text-gray-600 mb-4">{event.description}</p>}
                          {event.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <i className="ri-information-line mr-2"></i>{event.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── LOG HOURS ── */}
            {activeTab === 'log-hours' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Log Volunteer Hours</h2>
                  <p className="text-sm text-gray-600 mt-1">Record your volunteer time and activities</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleLogHours} className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
                      <input
                        type="date"
                        value={hoursForm.date}
                        onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={hoursForm.hours}
                        onChange={(e) => setHoursForm({ ...hoursForm, hours: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Activity Type</label>
                      <select
                        value={hoursForm.activity_type}
                        onChange={(e) => setHoursForm({ ...hoursForm, activity_type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Select activity type</option>
                        <option value="Training">Training</option>
                        <option value="Outreach">Outreach</option>
                        <option value="Distribution">Distribution</option>
                        <option value="Administration">Administration</option>
                        <option value="Event Support">Event Support</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                      <textarea
                        value={hoursForm.description}
                        onChange={(e) => setHoursForm({ ...hoursForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                        placeholder="Describe your volunteer activities..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {submitting ? 'Submitting...' : 'Submit Hours'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── MY HOURS ── */}
            {activeTab === 'hours' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">My Hours</h2>
                  <p className="text-sm text-gray-600 mt-1">View your volunteer hour history and status</p>
                </div>
                <div className="p-6">
                  {hours.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-time-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-600 mb-2">No hours logged yet</p>
                      <p className="text-sm text-gray-500 mb-4">Start logging your volunteer time to track your impact</p>
                      <button
                        onClick={() => setActiveTab('log-hours')}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        Log Hours
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hours.map((entry) => (
                        <div key={entry.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">
                              {entry.hours} {entry.hours === 1 ? 'hour' : 'hours'}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                entry.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : entry.status === 'flagged'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {entry.status === 'approved' ? 'Approved' : entry.status === 'flagged' ? 'Flagged' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <i className="ri-calendar-line"></i>
                              <span>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="ri-bookmark-line"></i>
                              <span>{entry.activity_type}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{entry.description}</p>
                          {entry.admin_notes && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <i className="ri-information-line mr-2"></i>
                                <strong>Admin Note:</strong> {entry.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CERTIFICATES ── */}
            {activeTab === 'certificates' && (
              <CertificatesSection userId={user?.id} memberName={profile?.full_name || 'Volunteer'} />
            )}

            {/* ── SESSION HISTORY ── */}
            {activeTab === 'session-history' && (
              <SessionHistory userId={user?.id} memberName={profile?.full_name || 'Volunteer'} />
            )}

            {/* ── ELEARNING ── */}
            {activeTab === 'elearning' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">eLearning</h2>
                  <p className="text-sm text-gray-600 mt-1">Access training courses and educational materials</p>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 text-white mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Expand Your Knowledge</h3>
                        <p className="text-green-50 mb-4">
                          Access comprehensive training courses designed for volunteers
                        </p>
                        <button
                          onClick={() => navigate('/members/elearning')}
                          className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
                        >
                          Browse All Courses →
                        </button>
                      </div>
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <i className="ri-graduation-cap-line text-3xl"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-information-line text-xl text-green-600"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Complete Courses to Earn Certificates</h4>
                        <p className="text-sm text-gray-700">
                          Finish courses and pass assessments to receive official certificates. Track your progress and view earned certificates in the Certificates section.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESOURCES ── */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Harm Reduction Resources</h2>
                  <p className="text-sm text-gray-600">Access training materials, guides, and drug information</p>
                </div>
                
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
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors text-sm"
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
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-gray-900'
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
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                          className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer"
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
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">{drug.category}</span>
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
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
                          className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-green-600 transition-all whitespace-nowrap cursor-pointer"
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
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
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
                                    : 'bg-gray-900 text-green-400 hover:bg-gray-800'
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

            {/* ── MESSAGES ── */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                  <p className="text-sm text-gray-600 mt-1">Read broadcasts from the admin team</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-gray-900">{broadcasts.length}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
                        <p className="text-sm text-gray-600">Unread</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-gray-900">{broadcasts.length - unreadCount}</p>
                        <p className="text-sm text-gray-600">Read</p>
                      </div>
                    </div>
                    <select
                      value={messageFilter}
                      onChange={(e) => setMessageFilter(e.target.value as 'all' | 'unread')}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Messages</option>
                      <option value="unread">Unread Only</option>
                    </select>
                  </div>

                  {filteredBroadcasts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-mail-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {messageFilter === 'unread' ? 'No unread messages' : 'No messages yet'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {messageFilter === 'unread' ? 'All caught up!' : 'Check back later for updates'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBroadcasts.map((broadcast) => {
                        const isUnread = !broadcast.is_read;
                        return (
                          <button
                            key={broadcast.id}
                            onClick={() => openBroadcastDetail(broadcast)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              isUnread
                                ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                                : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="font-bold text-gray-900 flex-1">{broadcast.subject}</h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isUnread && (
                                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                                    New
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {new Date(broadcast.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{broadcast.message}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                  <p className="text-sm text-gray-600 mt-1">View your volunteer information</p>
                </div>
                <div className="p-6">
                  <div className="max-w-2xl space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'V'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Volunteer'}</h3>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          Active Volunteer
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                        <input type="text" value={profile?.full_name || ''} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                        <input type="tel" value={profile?.phone || ''} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        <i className="ri-logout-box-line mr-2"></i>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Broadcast Detail Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBroadcast.subject}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>
                      {new Date(selectedBroadcast.created_at).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                      All Volunteers
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeBroadcastDetail}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedBroadcast.message}</p>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeBroadcastDetail}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Close
              </button>
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
                <span className={`${selectedDrug.riskColor} text-white text-sm font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                  {selectedDrug.riskLevel} Risk
                </span>
                <span className="bg-white/30 text-white text-sm font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {selectedDrug.category}
                </span>
                {selectedDrug.naloxoneWorks && (
                  <span className="bg-white text-red-600 text-sm font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
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
                      : 'bg-green-500 text-white hover:bg-green-600'
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
    </div>
  );
}
