import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import supabase from '../../../../lib/supabase';

type Category = 'All' | 'Clinical Guidelines' | 'Training Materials' | 'Referral Pathways' | 'CPD Templates' | 'Drug Information';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: Category;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX';
  fileSize: string;
  updated: string;
  icon: string;
  iconBg: string;
  isNew?: boolean;
  isFeatured?: boolean;
  downloads: number;
}

const PROFESSIONAL_RESOURCES: Resource[] = [
  {
    id: 'pr1',
    title: 'Clinical Naloxone Prescribing Guide 2025',
    description: 'Comprehensive prescribing guidance for healthcare professionals covering indications, dosing, formulations, patient counselling, and follow-up care for naloxone provision.',
    category: 'Clinical Guidelines',
    fileType: 'PDF',
    fileSize: '3.2 MB',
    updated: '22 Jan 2025',
    icon: 'ri-stethoscope-line',
    iconBg: 'bg-cyan-600',
    isNew: true,
    isFeatured: true,
    downloads: 487,
  },
  {
    id: 'pr2',
    title: 'Opioid Overdose Management Protocol',
    description: 'Evidence-based clinical protocol for emergency management of opioid overdose in primary care, community pharmacy, and emergency department settings.',
    category: 'Clinical Guidelines',
    fileType: 'PDF',
    fileSize: '2.8 MB',
    updated: '18 Jan 2025',
    icon: 'ri-first-aid-kit-line',
    iconBg: 'bg-red-600',
    isNew: true,
    downloads: 412,
  },
  {
    id: 'pr3',
    title: 'Professional Training Slide Deck',
    description: 'Ready-to-use PowerPoint presentation for delivering naloxone training to healthcare professionals. Includes clinical evidence, case studies, and Q&A guidance.',
    category: 'Training Materials',
    fileType: 'PPTX',
    fileSize: '12.4 MB',
    updated: '15 Jan 2025',
    icon: 'ri-slideshow-line',
    iconBg: 'bg-blue-600',
    downloads: 356,
  },
  {
    id: 'pr4',
    title: 'Harm Reduction Referral Pathway Map',
    description: 'Visual flowchart showing referral pathways from primary care, A&E, and community pharmacy to specialist addiction services, mental health support, and social care.',
    category: 'Referral Pathways',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    updated: '12 Jan 2025',
    icon: 'ri-route-line',
    iconBg: 'bg-teal-600',
    downloads: 298,
  },
  {
    id: 'pr5',
    title: 'CPD Evidence Template — Naloxone Training',
    description: 'Pre-formatted CPD evidence template for healthcare professionals to document naloxone training attendance, learning outcomes, and reflective practice.',
    category: 'CPD Templates',
    fileType: 'DOCX',
    fileSize: '640 KB',
    updated: '10 Jan 2025',
    icon: 'ri-file-text-line',
    iconBg: 'bg-indigo-600',
    downloads: 267,
  },
  {
    id: 'pr6',
    title: 'Patient Information Leaflet — Naloxone',
    description: 'Evidence-based patient information leaflet suitable for distribution in GP surgeries, pharmacies, and clinics. Covers what naloxone is, how to use it, and where to get it.',
    category: 'Clinical Guidelines',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    updated: '8 Jan 2025',
    icon: 'ri-article-line',
    iconBg: 'bg-cyan-600',
    downloads: 523,
  },
  {
    id: 'pr7',
    title: 'Fentanyl Risk Assessment Tool',
    description: 'Clinical risk assessment tool for identifying patients at high risk of fentanyl exposure. Includes screening questions, risk stratification, and intervention recommendations.',
    category: 'Clinical Guidelines',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    updated: '5 Jan 2025',
    icon: 'ri-alert-line',
    iconBg: 'bg-red-600',
    downloads: 389,
  },
  {
    id: 'pr8',
    title: 'Pharmacy Naloxone Supply Protocol',
    description: 'Standard operating procedure for community pharmacies providing naloxone under patient group direction (PGD) or emergency supply arrangements.',
    category: 'Clinical Guidelines',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    updated: '3 Jan 2025',
    icon: 'ri-medicine-bottle-line',
    iconBg: 'bg-cyan-600',
    downloads: 445,
  },
  {
    id: 'pr9',
    title: 'Multi-Agency Referral Form',
    description: 'Standardised referral form for healthcare professionals to refer patients to addiction services, housing support, mental health teams, and social care.',
    category: 'Referral Pathways',
    fileType: 'DOCX',
    fileSize: '580 KB',
    updated: '28 Dec 2024',
    icon: 'ri-file-transfer-line',
    iconBg: 'bg-teal-600',
    downloads: 234,
  },
  {
    id: 'pr10',
    title: 'CPD Reflective Practice Template',
    description: 'Structured template for documenting reflective practice following naloxone training or clinical incidents. Suitable for revalidation portfolios.',
    category: 'CPD Templates',
    fileType: 'DOCX',
    fileSize: '520 KB',
    updated: '22 Dec 2024',
    icon: 'ri-edit-box-line',
    iconBg: 'bg-indigo-600',
    downloads: 198,
  },
  {
    id: 'pr11',
    title: 'Clinical Case Studies Collection',
    description: 'Anonymised case studies demonstrating naloxone use in real-world clinical scenarios. Includes learning points and discussion questions for training sessions.',
    category: 'Training Materials',
    fileType: 'PDF',
    fileSize: '4.7 MB',
    updated: '18 Dec 2024',
    icon: 'ri-book-open-line',
    iconBg: 'bg-blue-600',
    downloads: 312,
  },
  {
    id: 'pr12',
    title: 'Training Session Evaluation Form',
    description: 'Pre-formatted evaluation form for collecting feedback from healthcare professionals attending naloxone training sessions. Includes quantitative and qualitative sections.',
    category: 'Training Materials',
    fileType: 'DOCX',
    fileSize: '480 KB',
    updated: '15 Dec 2024',
    icon: 'ri-survey-line',
    iconBg: 'bg-blue-600',
    downloads: 176,
  },
  {
    id: 'pr13',
    title: 'Local Service Directory — Plymouth',
    description: 'Comprehensive directory of addiction services, mental health support, housing assistance, and harm reduction services available in Plymouth and surrounding areas.',
    category: 'Referral Pathways',
    fileType: 'PDF',
    fileSize: '2.3 MB',
    updated: '10 Dec 2024',
    icon: 'ri-map-pin-line',
    iconBg: 'bg-teal-600',
    downloads: 421,
  },
  {
    id: 'pr14',
    title: 'CPD Certificate Template',
    description: 'Customisable certificate template for issuing CPD certificates to healthcare professionals completing naloxone training. Includes NAP branding.',
    category: 'CPD Templates',
    fileType: 'DOCX',
    fileSize: '720 KB',
    updated: '5 Dec 2024',
    icon: 'ri-award-line',
    iconBg: 'bg-indigo-600',
    downloads: 289,
  },
  {
    id: 'pr15',
    title: 'Clinical Audit Tool — Naloxone Provision',
    description: 'Excel-based audit tool for monitoring naloxone provision rates, patient demographics, and follow-up outcomes. Includes data analysis templates.',
    category: 'Clinical Guidelines',
    fileType: 'XLSX',
    fileSize: '1.8 MB',
    updated: '1 Dec 2024',
    icon: 'ri-bar-chart-box-line',
    iconBg: 'bg-cyan-600',
    downloads: 203,
  },
];

const CATEGORIES: Category[] = [
  'All',
  'Clinical Guidelines',
  'Training Materials',
  'Referral Pathways',
  'CPD Templates',
  'Drug Information',
];

const CATEGORY_ICONS: Record<Category, string> = {
  'All': 'ri-apps-line',
  'Clinical Guidelines': 'ri-stethoscope-line',
  'Training Materials': 'ri-slideshow-line',
  'Referral Pathways': 'ri-route-line',
  'CPD Templates': 'ri-file-text-line',
  'Drug Information': 'ri-capsule-line',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600',
  DOCX: 'bg-blue-100 text-blue-600',
  PPTX: 'bg-orange-100 text-orange-600',
  XLSX: 'bg-green-100 text-green-600',
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
  clinicalPresentation: string[];
  managementSteps: string[];
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
    description: 'Heroin and other opioids (morphine, codeine, fentanyl, methadone, oxycodone) are powerful analgesics acting on mu-opioid receptors. High risk of respiratory depression, overdose, and physical dependence.',
    clinicalPresentation: ['Respiratory depression (RR &lt;12/min)', 'Decreased level of consciousness', 'Miosis (pinpoint pupils)', 'Hypotension and bradycardia', 'Cyanosis', 'Pulmonary oedema'],
    managementSteps: ['Ensure airway patency and adequate ventilation', 'Administer naloxone 400mcg IM/IN, repeat every 2-3 minutes', 'Monitor respiratory rate and consciousness level', 'Arrange hospital admission for observation (opioid half-life)', 'Consider buprenorphine for maintenance therapy', 'Provide take-home naloxone on discharge'],
    naloxoneWorks: true,
    icon: 'ri-syringe-line',
    iconBg: 'bg-red-500',
  },
  {
    id: 'd2',
    name: 'Fentanyl',
    streetNames: 'Apache, China Girl, Dance Fever, Goodfella',
    category: 'Opioid',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Synthetic opioid 50-100x more potent than morphine. Increasingly found in illicit drug supply. Rapid onset, short duration, high overdose risk. May require multiple naloxone doses.',
    clinicalPresentation: ['Rapid onset of severe respiratory depression', 'Profound unconsciousness', 'Rigid chest wall (wooden chest syndrome)', 'Severe miosis', 'Bradycardia and hypotension', 'May not respond to initial naloxone dose'],
    managementSteps: ['Immediate airway management — may require bag-valve-mask', 'Administer naloxone 400mcg-2mg IM/IN, repeat frequently', 'Prepare for multiple naloxone doses (higher doses needed)', 'Urgent hospital transfer — prolonged monitoring required', 'Consider naloxone infusion in hospital setting', 'Test substances with fentanyl test strips (harm reduction)'],
    naloxoneWorks: true,
    icon: 'ri-alert-line',
    iconBg: 'bg-red-600',
  },
  {
    id: 'd3',
    name: 'Cocaine',
    streetNames: 'Coke, Charlie, Snow, Blow, White',
    category: 'Stimulant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Potent CNS stimulant and local anaesthetic. Blocks reuptake of dopamine, norepinephrine, and serotonin. Cardiovascular toxicity including MI, stroke, and arrhythmias.',
    clinicalPresentation: ['Tachycardia and hypertension', 'Chest pain (cardiac ischaemia)', 'Agitation, anxiety, paranoia', 'Hyperthermia', 'Seizures', 'Stroke or myocardial infarction'],
    managementSteps: ['ECG monitoring — assess for ischaemia/arrhythmias', 'Benzodiazepines for agitation and seizures (lorazepam 2-4mg)', 'Avoid beta-blockers (unopposed alpha stimulation)', 'Aspirin and GTN for chest pain (if cardiac cause suspected)', 'Cooling measures for hyperthermia', 'Psychiatric assessment if severe agitation/psychosis'],
    naloxoneWorks: false,
    icon: 'ri-flashlight-line',
    iconBg: 'bg-orange-500',
  },
  {
    id: 'd4',
    name: 'Crack Cocaine',
    streetNames: 'Crack, Rock, Stone, Freebase',
    category: 'Stimulant',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Smokable freebase form of cocaine. Rapid onset (seconds), intense but short-lived effects (5-10 min). Higher addiction potential and cardiovascular risk than powder cocaine.',
    clinicalPresentation: ['Acute coronary syndrome', 'Severe hypertension', 'Agitation and violent behaviour', 'Hyperthermia', 'Rhabdomyolysis', 'Acute psychosis'],
    managementSteps: ['Immediate cardiac monitoring and 12-lead ECG', 'Benzodiazepines for agitation (diazepam 10mg IV/PO)', 'Treat hypertension with benzodiazepines first-line', 'Aspirin 300mg if ACS suspected (after ECG)', 'IV fluids for rhabdomyolysis prevention', 'De-escalation techniques and safe environment'],
    naloxoneWorks: false,
    icon: 'ri-fire-line',
    iconBg: 'bg-red-500',
  },
  {
    id: 'd5',
    name: 'MDMA / Ecstasy',
    streetNames: 'Mandy, Molly, E, Pills, XTC',
    category: 'Stimulant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'Amphetamine derivative with stimulant and entactogenic properties. Increases serotonin, dopamine, and norepinephrine. Risks include hyperthermia, hyponatraemia, and serotonin syndrome.',
    clinicalPresentation: ['Hyperthermia (core temp &gt;40°C)', 'Hyponatraemia (water intoxication)', 'Serotonin syndrome (if on SSRIs)', 'Tachycardia and hypertension', 'Bruxism and jaw clenching', 'Seizures'],
    managementSteps: ['Aggressive cooling for hyperthermia (ice packs, fans, cold IV fluids)', 'Check serum sodium urgently — treat hyponatraemia cautiously', 'Benzodiazepines for agitation and seizures', 'Avoid serotonergic agents if serotonin syndrome suspected', 'Monitor CK levels (rhabdomyolysis risk)', 'Fluid balance monitoring (avoid excessive free water)'],
    naloxoneWorks: false,
    icon: 'ri-heart-pulse-line',
    iconBg: 'bg-pink-500',
  },
  {
    id: 'd6',
    name: 'Benzodiazepines',
    streetNames: 'Benzos, Vallies, Xanax, Diazepam, Blues',
    category: 'Depressant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'GABA-A receptor agonists causing CNS depression. High risk when combined with opioids or alcohol (synergistic respiratory depression). Dangerous withdrawal syndrome if stopped abruptly.',
    clinicalPresentation: ['Drowsiness and sedation', 'Ataxia and slurred speech', 'Respiratory depression (especially with opioids)', 'Hypotension', 'Paradoxical agitation (elderly)', 'Amnesia'],
    managementSteps: ['Supportive care — airway protection and ventilation', 'Flumazenil (benzodiazepine antagonist) — use with caution', 'Avoid flumazenil if chronic use (seizure risk) or co-ingestion', 'Monitor for co-ingestion with opioids (naloxone if indicated)', 'Gradual withdrawal protocol if chronic use', 'Psychiatric assessment for dependence'],
    naloxoneWorks: false,
    icon: 'ri-medicine-bottle-line',
    iconBg: 'bg-indigo-500',
  },
  {
    id: 'd7',
    name: 'Alcohol',
    streetNames: 'Booze, Drink, Liquor',
    category: 'Depressant',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'CNS depressant acting on GABA and glutamate systems. Acute intoxication causes respiratory depression and aspiration risk. Chronic use leads to dependence and severe withdrawal syndrome.',
    clinicalPresentation: ['Decreased consciousness (GCS &lt;8)', 'Respiratory depression', 'Hypoglycaemia', 'Hypothermia', 'Aspiration pneumonia', 'Alcohol withdrawal (tremor, seizures, delirium tremens)'],
    managementSteps: ['Airway protection — recovery position or intubation if GCS &lt;8', 'Check blood glucose — treat hypoglycaemia (IV dextrose)', 'Thiamine 100mg IV (Pabrinex) before glucose if chronic use', 'Monitor for withdrawal — CIWA-Ar score', 'Benzodiazepines for withdrawal (chlordiazepoxide reducing regimen)', 'Assess for head injury and other trauma'],
    naloxoneWorks: false,
    icon: 'ri-goblet-line',
    iconBg: 'bg-amber-500',
  },
  {
    id: 'd8',
    name: 'Methamphetamine',
    streetNames: 'Meth, Crystal, Ice, Tina, Glass',
    category: 'Stimulant',
    riskLevel: 'Very High',
    riskColor: 'bg-red-600',
    description: 'Highly potent amphetamine with prolonged duration (8-12 hours). Severe cardiovascular and neuropsychiatric toxicity. High addiction potential and neurotoxicity with chronic use.',
    clinicalPresentation: ['Severe agitation and psychosis', 'Hyperthermia (core temp &gt;41°C)', 'Tachycardia and hypertensive crisis', 'Myocardial infarction or stroke', 'Seizures', 'Rhabdomyolysis and acute kidney injury'],
    managementSteps: ['Immediate sedation with benzodiazepines (diazepam 10-20mg IV)', 'Aggressive cooling for hyperthermia', 'Cardiac monitoring and 12-lead ECG', 'Avoid antipsychotics (lower seizure threshold)', 'IV fluids for rhabdomyolysis (target urine output 200ml/hr)', 'Psychiatric assessment and admission if psychosis persists'],
    naloxoneWorks: false,
    icon: 'ri-lightning-line',
    iconBg: 'bg-yellow-500',
  },
  {
    id: 'd9',
    name: 'Cannabis',
    streetNames: 'Weed, Skunk, Hash, Marijuana, Pot, Grass',
    category: 'Cannabinoid',
    riskLevel: 'Moderate',
    riskColor: 'bg-yellow-500',
    description: 'Cannabinoid receptor agonist. Generally low acute toxicity but high-potency strains (skunk) and synthetic cannabinoids (Spice) carry significant psychiatric risks including psychosis.',
    clinicalPresentation: ['Anxiety and panic attacks', 'Acute psychosis (especially high-THC strains)', 'Tachycardia', 'Postural hypotension', 'Hyperemesis syndrome (chronic use)', 'Impaired cognition and coordination'],
    managementSteps: ['Reassurance and calm environment for anxiety/panic', 'Benzodiazepines if severe anxiety (lorazepam 1-2mg)', 'Antipsychotics if acute psychosis (olanzapine 5-10mg)', 'IV fluids and antiemetics for hyperemesis syndrome', 'Screen for synthetic cannabinoids (more severe toxicity)', 'Mental health assessment if psychosis persists'],
    naloxoneWorks: false,
    icon: 'ri-leaf-line',
    iconBg: 'bg-green-500',
  },
  {
    id: 'd10',
    name: 'Ketamine',
    streetNames: 'Ket, K, Special K, Kitty, Wonk',
    category: 'Dissociative',
    riskLevel: 'High',
    riskColor: 'bg-orange-500',
    description: 'NMDA receptor antagonist causing dissociative anaesthesia. Acute risks include aspiration and trauma. Chronic use causes ketamine bladder syndrome (ulcerative cystitis) and cognitive impairment.',
    clinicalPresentation: ['Dissociation and altered consciousness ("K-hole")', 'Nystagmus and ataxia', 'Hypertension and tachycardia', 'Respiratory depression (high doses)', 'Aspiration risk', 'Urinary symptoms (chronic use — dysuria, haematuria)'],
    managementSteps: ['Supportive care — safe environment to prevent injury', 'Recovery position to prevent aspiration', 'Benzodiazepines for severe agitation (midazolam 5mg IM)', 'Monitor blood pressure (usually self-limiting)', 'Urology referral if chronic use (bladder ultrasound, cystoscopy)', 'Avoid stimulation (worsens dissociation)'],
    naloxoneWorks: false,
    icon: 'ri-bubble-chart-line',
    iconBg: 'bg-teal-500',
  },
];

const DRUG_CATEGORIES = ['All', 'Opioid', 'Stimulant', 'Depressant', 'Psychedelic', 'Dissociative', 'Cannabinoid'];

export default function ProfessionalResources() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [drugCategoryFilter, setDrugCategoryFilter] = useState<string>('All');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');

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

  const filtered = useMemo(() => {
    let list = PROFESSIONAL_RESOURCES.filter((r) => {
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

  const featuredResource = PROFESSIONAL_RESOURCES.find((r) => r.isFeatured);

  return (
    <div className="max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Professional Resources</h2>
            <span className="bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
              <i className="ri-hospital-line"></i> Healthcare Professionals
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Clinical guidelines, training materials, and professional development resources — {PROFESSIONAL_RESOURCES.length} resources available
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
          <i className="ri-download-line"></i>
          {PROFESSIONAL_RESOURCES.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()} total downloads
        </div>
      </div>

      {/* Featured Resource */}
      {featuredResource && (
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full"></div>
          <div className="absolute bottom-0 right-24 w-20 h-20 bg-teal-400/20 rounded-full"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <i className={`${featuredResource.icon} text-white text-3xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white text-cyan-600 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  ✦ Featured
                </span>
                <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {featuredResource.fileType}
                </span>
                {featuredResource.isNew && (
                  <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">{featuredResource.title}</h3>
              <p className="text-cyan-50 text-sm mt-1 leading-relaxed">{featuredResource.description}</p>
              <p className="text-cyan-100 text-xs mt-2 flex items-center gap-3">
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
                  ? 'bg-teal-400 text-white'
                  : loadingDownload === featuredResource.id
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-white text-cyan-600 hover:bg-cyan-50'
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
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-600 focus:outline-none transition-colors text-sm"
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
            className="pl-11 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-600 focus:outline-none transition-colors text-sm font-semibold text-gray-700 cursor-pointer appearance-none"
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
            ? PROFESSIONAL_RESOURCES.length 
            : cat === 'Drug Information'
            ? DRUG_INFO.length
            : PROFESSIONAL_RESOURCES.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-cyan-600 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${CATEGORY_ICONS[cat]} text-sm`}></i>
              </div>
              {cat}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-cyan-600 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-cyan-600 focus:outline-none text-sm font-semibold text-gray-700 cursor-pointer"
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
                ? 'No drug information found'
                : `Showing ${filteredDrugs.length} clinical reference${filteredDrugs.length !== 1 ? 's' : ''}`}
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
                className="bg-cyan-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-cyan-700 transition-all whitespace-nowrap cursor-pointer"
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
                        <span className="text-cyan-600 font-semibold flex items-center gap-1">
                          <i className="ri-arrow-right-line"></i>Clinical guidance
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
                className="bg-cyan-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-cyan-700 transition-all whitespace-nowrap cursor-pointer"
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
                          <span className="bg-cyan-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">New</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mb-2">
                        <strong>Category:</strong> {resource.category}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">{resource.description}</p>
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
                          ? 'bg-teal-400 text-white'
                          : loadingDownload === resource.id
                          ? 'bg-gray-400 text-white cursor-wait'
                          : 'bg-cyan-600 text-white hover:bg-cyan-700'
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
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
          <i className="ri-question-answer-line text-white text-2xl"></i>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-gray-900 mb-1">Need additional clinical resources?</h3>
          <p className="text-gray-500 text-sm">Contact the NAP team for bespoke training materials or clinical guidance.</p>
        </div>
        <Link
          to="/contact"
          className="flex-shrink-0 bg-cyan-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-cyan-700 transition-all whitespace-nowrap shadow-md"
        >
          Contact Us <i className="ri-arrow-right-line ml-1"></i>
        </Link>
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clinical Overview</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDrug.description}</p>
              </div>

              {selectedDrug.naloxoneWorks && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-medicine-bottle-line text-2xl text-red-600 flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-bold text-red-800 mb-1">Naloxone is the antidote for opioid overdose</p>
                    <p className="text-red-700 text-sm">Administer 400mcg-2mg IM/IN, repeat every 2-3 minutes as needed. Monitor for re-sedation due to opioid half-life.</p>
                  </div>
                </div>
              )}

              {/* Clinical Presentation */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-pulse-line text-gray-700"></i>
                  </div>
                  Clinical Presentation
                </h3>
                <ul className="space-y-2">
                  {selectedDrug.clinicalPresentation.map((sign, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-checkbox-blank-circle-fill text-gray-400 text-xs"></i>
                      </div>
                      <span dangerouslySetInnerHTML={{ __html: sign }}></span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Management Steps */}
              <div className="bg-cyan-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-first-aid-kit-line text-cyan-600"></i>
                  </div>
                  Clinical Management
                </h3>
                <ul className="space-y-2">
                  {selectedDrug.managementSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-600 font-bold text-xs">{i + 1}</span>
                      </div>
                      <span dangerouslySetInnerHTML={{ __html: step }}></span>
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
                      ? 'bg-teal-400 text-white'
                      : loadingDownload === selectedDrug.id
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  {loadingDownload === selectedDrug.id ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Downloading...</>
                  ) : downloadedIds.includes(selectedDrug.id) ? (
                    <><i className="ri-check-line"></i>Downloaded</>
                  ) : (
                    <><i className="ri-download-2-line"></i>Download Clinical Reference</>
                  )}
                </button>
                <a
                  href="https://bnf.nice.org.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all whitespace-nowrap shadow-md"
                >
                  <i className="ri-external-link-line"></i>BNF Reference
                </a>
                <a
                  href="https://www.toxbase.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all whitespace-nowrap shadow-md"
                >
                  <i className="ri-external-link-line"></i>TOXBASE
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}