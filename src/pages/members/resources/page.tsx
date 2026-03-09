import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import supabase from '../../../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const MEMBER = {
  name: 'Sarah Johnson',
  role: 'Peer Trainer',
  email: 'sarah.johnson@email.com',
  joinDate: 'January 2025',
  avatar: 'SJ',
  avatarGradient: 'from-pink-500 to-yellow-400',
};

type Category = 'All' | 'Training Materials' | 'Harm Reduction Guides' | 'Community Outreach' | 'Policy Documents' | 'Drug Information';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: Category;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'PNG';
  fileSize: string;
  updated: string;
  icon: string;
  iconBg: string;
  isNew?: boolean;
  isFeatured?: boolean;
  downloads: number;
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
    isFeatured: true,
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

const CATEGORIES: Category[] = [
  'All',
  'Training Materials',
  'Harm Reduction Guides',
  'Community Outreach',
  'Policy Documents',
  'Drug Information',
];

const CATEGORY_ICONS: Record<Category, string> = {
  'All': 'ri-apps-fill',
  'Training Materials': 'ri-book-open-fill',
  'Harm Reduction Guides': 'ri-shield-check-fill',
  'Community Outreach': 'ri-community-fill',
  'Policy Documents': 'ri-file-list-3-fill',
  'Drug Information': 'ri-capsule-fill',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600',
  DOCX: 'bg-blue-100 text-blue-600',
  PPTX: 'bg-orange-100 text-orange-600',
  PNG: 'bg-green-100 text-green-600',
};

type SortOption = 'newest' | 'popular' | 'az';

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

const DRUG_CATEGORIES = ['All', 'Opioid', 'Stimulant', 'Depressant', 'Psychedelic', 'Dissociative', 'Cannabinoid'];

export default function MembersResourcesPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [drugCategoryFilter, setDrugCategoryFilter] = useState<string>('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');

  // Fetch profile data
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

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

  const handleLogout = async () => {
    await signOut();
    navigate('/members/login');
  };

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

  const filtered = useMemo(() => {
    let list = RESOURCES.filter((r) => {
      const matchCat = activeCategory === 'All' || r.category === activeCategory;
      const matchSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'popular') list = [...list].sort((a, b) => b.downloads - a.downloads);
    else if (sortBy === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [activeCategory, searchQuery, sortBy]);

  const filteredDrugs = useMemo(() => {
    return DRUG_INFO.filter((drug) => {
      const matchCategory = drugCategoryFilter === 'All' || drug.category === drugCategoryFilter;
      const matchRisk = riskLevelFilter === 'All' || drug.riskLevel === riskLevelFilter;
      const matchSearch =
        drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.streetNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchRisk && matchSearch;
    });
  }, [drugCategoryFilter, riskLevelFilter, searchQuery]);

  const featuredResource = RESOURCES.find((r) => r.isFeatured);

  // Generate member display data
  const memberDisplay = profile
    ? {
        name: profile.full_name,
        role: profile.role,
        email: profile.email,
        joinDate: new Date(profile.created_at).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        }),
        avatar: profile.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        avatarGradient: 'from-pink-500 to-yellow-400',
      }
    : {
        name: 'Loading...',
        role: '',
        email: '',
        joinDate: '',
        avatar: '...',
        avatarGradient: 'from-gray-400 to-gray-500',
      };

  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-fill', to: '/members/dashboard' },
    { key: 'bookings', label: 'My Bookings', icon: 'ri-calendar-check-fill', to: '/members/dashboard' },
    { key: 'resources', label: 'Resources', icon: 'ri-file-download-fill', to: '/members/resources' },
    { key: 'profile', label: 'Profile', icon: 'ri-user-settings-fill', to: '/members/dashboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-yellow-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-yellow-500 transition-colors cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className={`${sidebarOpen ? 'ri-close-line' : 'ri-menu-line'} text-gray-900 text-xl`}></i>
              </button>
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                  alt="Naloxone Advocates Plymouth"
                  className="h-12 w-auto"
                />
              </Link>
              <div className="hidden sm:flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span className="text-gray-900 font-bold text-xs">Members Area</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-gray-900 font-bold text-sm leading-none">{memberDisplay.name}</p>
                  <p className="text-gray-700 text-xs">{memberDisplay.role}</p>
                </div>
                <div className={`w-10 h-10 bg-gradient-to-br ${memberDisplay.avatarGradient} rounded-full flex items-center justify-center shadow-md`}>
                  <span className="text-white font-bold text-sm">{memberDisplay.avatar}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-900 text-yellow-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-r-line"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl lg:shadow-none border-r border-gray-100 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          {/* Member card */}
          <div className="p-6 bg-gradient-to-br from-yellow-400 to-lime-400">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 bg-gradient-to-br ${memberDisplay.avatarGradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-white font-bold text-lg">{memberDisplay.avatar}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{memberDisplay.name}</p>
                <span className="inline-block bg-white/70 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full mt-1">{memberDisplay.role}</span>
              </div>
            </div>
            <p className="text-gray-800 text-xs mt-3 flex items-center gap-1">
              <i className="ri-calendar-line"></i> Member since {memberDisplay.joinDate}
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  item.key === 'resources'
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom links */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold text-sm transition-all whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-home-line text-base"></i>
              </div>
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-logout-box-r-line text-base"></i>
              </div>
              Logout
            </button>
          </div>
        </aside>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-5xl space-y-8">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
                  <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                    <i className="ri-shield-user-fill"></i> Members Only
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Exclusive training materials, guides, and documents for NAP members — {RESOURCES.length} resources available
                </p>
              </div>
              <div className="flex items-center gap-2 bg-lime-100 text-lime-700 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                <i className="ri-download-fill"></i>
                {RESOURCES.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()} total downloads
              </div>
            </div>

            {/* Featured Resource */}
            {featuredResource && (
              <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full"></div>
                <div className="absolute bottom-0 right-24 w-20 h-20 bg-pink-400/20 rounded-full"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <i className={`${featuredResource.icon} text-gray-900 text-3xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        ✦ Featured
                      </span>
                      <span className="bg-white/70 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {featuredResource.fileType}
                      </span>
                      {featuredResource.isNew && (
                        <span className="bg-gray-900 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{featuredResource.title}</h2>
                    <p className="text-gray-800 text-sm mt-1 leading-relaxed">{featuredResource.description}</p>
                    <p className="text-gray-700 text-xs mt-2 flex items-center gap-3">
                      <span><i className="ri-file-size-line mr-1"></i>{featuredResource.fileSize}</span>
                      <span><i className="ri-refresh-line mr-1"></i>Updated {featuredResource.updated}</span>
                      <span><i className="ri-download-line mr-1"></i>{featuredResource.downloads} downloads</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(featuredResource.id)}
                    disabled={loadingDownload === featuredResource.id || downloadedIds.includes(featuredResource.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer shadow-md ${
                      downloadedIds.includes(featuredResource.id)
                        ? 'bg-lime-500 text-white'
                        : loadingDownload === featuredResource.id
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-gray-900 text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    {loadingDownload === featuredResource.id ? (
                      <><i className="ri-loader-4-line animate-spin"></i>Downloading...</>
                    ) : downloadedIds.includes(featuredResource.id) ? (
                      <><i className="ri-check-line"></i>Downloaded</>
                    ) : (
                      <><i className="ri-download-2-line"></i>Download</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Search + Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-base"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by title, category or keyword…"
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-base"></i>
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                  <i className="ri-sort-desc text-gray-400 text-base"></i>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pl-11 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm font-semibold text-gray-700 cursor-pointer appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Downloaded</option>
                  <option value="az">A – Z</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const count = cat === 'All' 
                  ? RESOURCES.length 
                  : cat === 'Drug Information'
                  ? DRUG_INFO.length
                  : RESOURCES.filter((r) => r.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-yellow-400 text-gray-900 shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-400 hover:text-gray-900'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${CATEGORY_ICONS[cat]} text-sm`}></i>
                    </div>
                    {cat}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      activeCategory === cat ? 'bg-gray-900/20 text-gray-900' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Drug Information Section */}
            {activeCategory === 'Drug Information' && (
              <>
                {/* Drug Filters */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 mb-2">Drug Category</label>
                      <select
                        value={drugCategoryFilter}
                        onChange={(e) => setDrugCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        <option value="All">All Levels</option>
                        <option value="Very High">Very High Risk</option>
                        <option value="High">High Risk</option>
                        <option value="Moderate">Moderate Risk</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {filteredDrugs.length === 0
                      ? 'No drug information sheets found'
                      : `Showing ${filteredDrugs.length} drug information sheet${filteredDrugs.length !== 1 ? 's' : ''}`}
                  </p>
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
                      onClick={() => { setSearchQuery(''); setDrugCategoryFilter('All'); setRiskLevelFilter('All'); }}
                      className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer"
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
                              <span className="text-yellow-600 font-semibold flex items-center gap-1">
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
            {activeCategory !== 'Drug Information' && (
              <>
                {/* Results count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {filtered.length === 0
                      ? 'No resources found'
                      : `Showing ${filtered.length} resource${filtered.length !== 1 ? 's' : ''}${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`}
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500">
                      Results for <strong className="text-gray-900">"{searchQuery}"</strong>
                    </p>
                  )}
                </div>

                {/* Resource Grid */}
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-search-line text-gray-400 text-3xl"></i>
                    </div>
                    <p className="text-gray-700 font-bold text-lg mb-2">No resources found</p>
                    <p className="text-gray-400 text-sm mb-6">Try adjusting your search or selecting a different category</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                      className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((resource) => (
                      <div
                        key={resource.id}
                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className={`w-14 h-14 ${resource.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                            <i className={`${resource.icon} text-white text-2xl`}></i>
                          </div>

                          {/* Content */}
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

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(resource.id)}
                            disabled={loadingDownload === resource.id || downloadedIds.includes(resource.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                              downloadedIds.includes(resource.id)
                                ? 'bg-lime-400 text-gray-900'
                                : loadingDownload === resource.id
                                ? 'bg-gray-400 text-white cursor-wait'
                                : 'bg-gray-900 text-yellow-400 hover:bg-gray-800'
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

            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="ri-question-answer-fill text-white text-2xl"></i>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-gray-900 mb-1">Can't find what you need?</h3>
                <p className="text-gray-500 text-sm">Contact the NAP team and we'll help you find the right resource or create something new.</p>
              </div>
              <Link
                to="/contact"
                className="flex-shrink-0 bg-pink-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-pink-600 transition-all whitespace-nowrap shadow-md"
              >
                Contact Us <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>

          </div>
        </main>
      </div>

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
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">What is it?</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDrug.description}</p>
              </div>

              {selectedDrug.naloxoneWorks && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-medicine-bottle-line text-2xl text-red-600 flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-bold text-red-800 mb-1">Naloxone can reverse an opioid overdose</p>
                    <p className="text-red-700 text-sm">Always call 999 first, then administer naloxone if available. <Link to="/get-naloxone" className="underline font-semibold hover:text-red-900">Get a free naloxone kit →</Link></p>
                  </div>
                </div>
              )}

              {/* Effects */}
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

              {/* Overdose Signs */}
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

              {/* Harm Reduction */}
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownload(selectedDrug.id)}
                  disabled={loadingDownload === selectedDrug.id || downloadedIds.includes(selectedDrug.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer shadow-md ${
                    downloadedIds.includes(selectedDrug.id)
                      ? 'bg-lime-500 text-white'
                      : loadingDownload === selectedDrug.id
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
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
                <Link
                  to="/emergency"
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition-all whitespace-nowrap shadow-md"
                >
                  <i className="ri-first-aid-kit-line"></i>Emergency Response Guide
                </Link>
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
