import { useState, useEffect } from 'react';
import supabase from '../../../../lib/supabase';

type ImpactData = {
  sessionsAttended: number;
  kitsCollected: number;
  peopleTrained: number;
  certificatesEarned: number;
  coursesCompleted: number;
  ordersPlaced: number;
};

type MilestoneItem = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  date: string;
  category: string;
  categoryColor: string;
};

type StatCardProps = {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  sublabel: string;
  progress: number;
  nextMilestone: number;
  accentColor: string;
};

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sublabel,
  progress,
  nextMilestone,
  accentColor,
}: StatCardProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(progress), 300);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
        >
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
          Next: {nextMilestone}
        </span>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-bold text-gray-700 leading-tight">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-4">{sublabel}</p>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${accentColor}`}
          style={{ width: `${animated}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        {value} / {nextMilestone} to next milestone
      </p>
    </div>
  );
}

const TIMELINE_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    icon: 'ri-user-add-fill',
    iconBg: 'bg-yellow-400',
    iconColor: 'text-gray-900',
    title: 'Joined NAP Community',
    desc: 'Became a registered member of Naloxone Advocates Plymouth',
    date: 'January 2024',
    category: 'Milestone',
    categoryColor: 'bg-yellow-400 text-gray-900',
  },
  {
    id: 'm2',
    icon: 'ri-calendar-check-fill',
    iconBg: 'bg-pink-500',
    iconColor: 'text-white',
    title: 'First Training Session',
    desc: 'Attended Community Naloxone Training at Plymouth Community Centre',
    date: 'February 2024',
    category: 'Training',
    categoryColor: 'bg-pink-500 text-white',
  },
  {
    id: 'm3',
    icon: 'ri-medicine-bottle-fill',
    iconBg: 'bg-lime-400',
    iconColor: 'text-gray-900',
    title: 'First Kit Collected',
    desc: 'Collected your first naloxone kit — ready to save a life',
    date: 'February 2024',
    category: 'Kit',
    categoryColor: 'bg-lime-400 text-gray-900',
  },
  {
    id: 'm4',
    icon: 'ri-award-fill',
    iconBg: 'bg-yellow-400',
    iconColor: 'text-gray-900',
    title: 'First Certificate Earned',
    desc: 'Completed Naloxone Administration — certified and ready',
    date: 'March 2024',
    category: 'Certificate',
    categoryColor: 'bg-yellow-400 text-gray-900',
  },
  {
    id: 'm5',
    icon: 'ri-team-fill',
    iconBg: 'bg-pink-500',
    iconColor: 'text-white',
    title: '10 People Trained',
    desc: 'Reached the milestone of training 10 people in overdose response',
    date: 'June 2024',
    category: 'Impact',
    categoryColor: 'bg-pink-500 text-white',
  },
  {
    id: 'm6',
    icon: 'ri-graduation-cap-fill',
    iconBg: 'bg-lime-400',
    iconColor: 'text-gray-900',
    title: 'eLearning Course Completed',
    desc: 'Finished Harm Reduction Basics — expanding your knowledge online',
    date: 'August 2024',
    category: 'eLearning',
    categoryColor: 'bg-lime-400 text-gray-900',
  },
  {
    id: 'm7',
    icon: 'ri-heart-fill',
    iconBg: 'bg-yellow-400',
    iconColor: 'text-gray-900',
    title: '5 Sessions Attended',
    desc: 'Attended 5 training sessions — a dedicated community champion',
    date: 'October 2024',
    category: 'Milestone',
    categoryColor: 'bg-yellow-400 text-gray-900',
  },
  {
    id: 'm8',
    icon: 'ri-star-fill',
    iconBg: 'bg-pink-500',
    iconColor: 'text-white',
    title: 'Community Champion Badge',
    desc: 'Recognised for outstanding contribution to harm reduction in Plymouth',
    date: 'December 2024',
    category: 'Badge',
    categoryColor: 'bg-pink-500 text-white',
  },
];

const BADGES = [
  {
    id: 'b1',
    icon: 'ri-user-add-fill',
    label: 'First Responder',
    desc: 'Attended your first session',
    earned: true,
    color: 'bg-yellow-400',
    textColor: 'text-gray-900',
  },
  {
    id: 'b2',
    icon: 'ri-medicine-bottle-fill',
    label: 'Kit Carrier',
    desc: 'Collected a naloxone kit',
    earned: true,
    color: 'bg-pink-500',
    textColor: 'text-white',
  },
  {
    id: 'b3',
    icon: 'ri-award-fill',
    label: 'Certified',
    desc: 'Earned your first certificate',
    earned: true,
    color: 'bg-lime-400',
    textColor: 'text-gray-900',
  },
  {
    id: 'b4',
    icon: 'ri-team-fill',
    label: 'Trainer',
    desc: 'Trained 10+ people',
    earned: true,
    color: 'bg-yellow-400',
    textColor: 'text-gray-900',
  },
  {
    id: 'b5',
    icon: 'ri-heart-fill',
    label: 'Champion',
    desc: 'Attended 5+ sessions',
    earned: true,
    color: 'bg-pink-500',
    textColor: 'text-white',
  },
  {
    id: 'b6',
    icon: 'ri-star-fill',
    label: 'Community Star',
    desc: 'Trained 50+ people',
    earned: false,
    color: 'bg-gray-200',
    textColor: 'text-gray-400',
  },
  {
    id: 'b7',
    icon: 'ri-shield-star-fill',
    label: 'Life Saver',
    desc: 'Reversed an overdose',
    earned: false,
    color: 'bg-gray-200',
    textColor: 'text-gray-400',
  },
  {
    id: 'b8',
    icon: 'ri-trophy-fill',
    label: 'NAP Legend',
    desc: 'Attend 20+ sessions',
    earned: false,
    color: 'bg-gray-200',
    textColor: 'text-gray-400',
  },
];

type Props = {
  userId: string | undefined;
  memberName: string;
  memberJoinDate: string;
};

export default function ImpactTracker({ userId, memberName, memberJoinDate }: Props) {
  const [impact, setImpact] = useState<ImpactData>({
    sessionsAttended: 7,
    kitsCollected: 3,
    peopleTrained: 18,
    certificatesEarned: 4,
    coursesCompleted: 3,
    ordersPlaced: 2,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'badges'>('overview');

  // ------------------------------------------------------------------------
  // Data fetching – robust with error handling
  // ------------------------------------------------------------------------
  const fetchImpactData = async () => {
    setLoading(true);
    try {
      const updates: Partial<ImpactData> = {};

      if (userId) {
        // Fetch impact stats stored on the member profile
        const { data: profile, error: profileError } = await supabase
          .from('member_profiles')
          .select('sessions_attended, kits_collected, people_trained')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile stats:', profileError);
        } else if (profile) {
          updates.sessionsAttended = profile.sessions_attended ?? 0;
          updates.kitsCollected = profile.kits_collected ?? 0;
          updates.peopleTrained = profile.people_trained ?? 0;
        }

        // Certificates count
        const { data: certs, error: certsError } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', userId);

        if (certsError) {
          console.error('Error fetching certificates:', certsError);
        } else if (certs) {
          updates.certificatesEarned = certs.length;
        }

        // Orders count
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id')
          .eq('email', userId);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else if (orders) {
          updates.ordersPlaced = orders.length;
        }
      }

      setImpact((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Unexpected error while fetching impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
    // Re‑run only when the userId changes.
  }, [userId]);

  // ------------------------------------------------------------------------
  // Helper to compute progress bar percentages
  // ------------------------------------------------------------------------
  const getProgress = (value: number, next: number) =>
    Math.min(Math.round((value / next) * 100), 100);

  const STAT_CARDS = [
    {
      icon: 'ri-calendar-check-fill',
      iconBg: 'bg-yellow-400',
      iconColor: 'text-gray-900',
      value: impact.sessionsAttended,
      label: 'Sessions Attended',
      sublabel: 'In-person training sessions',
      nextMilestone: 10,
      accentColor: 'bg-yellow-400',
    },
    {
      icon: 'ri-medicine-bottle-fill',
      iconBg: 'bg-pink-500',
      iconColor: 'text-white',
      value: impact.kitsCollected,
      label: 'Kits Collected',
      sublabel: 'Naloxone kits received',
      nextMilestone: 5,
      accentColor: 'bg-pink-500',
    },
    {
      icon: 'ri-team-fill',
      iconBg: 'bg-lime-400',
      iconColor: 'text-gray-900',
      value: impact.peopleTrained,
      label: 'People Trained',
      sublabel: "Lives you've helped protect",
      nextMilestone: 25,
      accentColor: 'bg-lime-400',
    },
    {
      icon: 'ri-award-fill',
      iconBg: 'bg-yellow-400',
      iconColor: 'text-gray-900',
      value: impact.certificatesEarned,
      label: 'Certificates Earned',
      sublabel: 'Completed qualifications',
      nextMilestone: 5,
      accentColor: 'bg-yellow-400',
    },
    {
      icon: 'ri-graduation-cap-fill',
      iconBg: 'bg-pink-500',
      iconColor: 'text-white',
      value: impact.coursesCompleted,
      label: 'Courses Completed',
      sublabel: 'eLearning modules finished',
      nextMilestone: 5,
      accentColor: 'bg-pink-500',
    },
    {
      icon: 'ri-shopping-bag-fill',
      iconBg: 'bg-lime-400',
      iconColor: 'text-gray-900',
      value: impact.ordersPlaced,
      label: 'Orders Placed',
      sublabel: 'Items from the NAP shop',
      nextMilestone: 5,
      accentColor: 'bg-lime-400',
    },
  ];

  const earnedBadges = BADGES.filter((b) => b.earned).length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="ri-bar-chart-box-fill text-pink-500"></i> My Impact
          </h1>
          <p className="text-gray-500 text-sm">
            Your personal journey and contribution to harm reduction in Plymouth
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-2xl px-5 py-3 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
            <i className="ri-trophy-fill text-gray-900 text-xl"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">Badges Earned</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {earnedBadges} / {BADGES.length}
            </p>
          </div>
        </div>
      </div>

      {/* Hero summary card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-400/10 rounded-full"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-pink-500/10 rounded-full"></div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-semibold mb-1">
            Member since {memberJoinDate}
          </p>
          <h2 className="text-white text-2xl font-bold mb-6">
            {memberName}&apos;s Impact Summary
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-400">{impact.sessionsAttended}</p>
              <p className="text-gray-300 text-sm mt-1 font-semibold">Sessions</p>
              <p className="text-gray-500 text-xs">Attended</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-5xl font-bold text-pink-400">{impact.peopleTrained}</p>
              <p className="text-gray-300 text-sm mt-1 font-semibold">People</p>
              <p className="text-gray-500 text-xs">Trained</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-lime-400">{impact.kitsCollected}</p>
              <p className="text-gray-300 text-sm mt-1 font-semibold">Kits</p>
              <p className="text-gray-500 text-xs">Collected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full w-fit">
        {(
          [
            { key: 'overview', label: 'Overview', icon: 'ri-bar-chart-fill' },
            { key: 'timeline', label: 'Journey', icon: 'ri-time-line' },
            { key: 'badges', label: 'Badges', icon: 'ri-medal-fill' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={`${tab.icon} text-sm`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <i className="ri-loader-4-line animate-spin text-4xl text-yellow-400"></i>
              <p className="text-gray-500 font-semibold text-sm">
                Loading your impact data...
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {STAT_CARDS.map((card) => (
                <StatCard
                  key={card.label}
                  {...card}
                  progress={getProgress(card.value, card.nextMilestone)}
                />
              ))}
            </div>
          )}

          {/* Motivational banner */}
          <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-2xl p-6 shadow-md flex items-start gap-4">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-heart-fill text-gray-900 text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                You&apos;re making a real difference
              </h3>
              <p className="text-gray-800 text-sm leading-relaxed">
                Every session you attend, every kit you carry, and every person you train brings us closer to a Plymouth where no one dies from an overdose alone.
                Keep going — your impact matters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TIMELINE TAB ── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            A visual record of your journey with Naloxone Advocates Plymouth
          </p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-pink-400 to-lime-400 rounded-full"></div>

            <div className="space-y-4 pl-16">
              {TIMELINE_MILESTONES.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-10 top-5 w-9 h-9 ${item.iconBg} rounded-full flex items-center justify-center shadow-md border-2 border-white`}
                  >
                    <i className={`${item.icon} ${item.iconColor} text-sm`}></i>
                  </div>

                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`${item.categoryColor} text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}
                        >
                          {item.category}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                      <i className="ri-calendar-line"></i>
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}

              {/* Future milestone */}
              <div className="relative bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5">
                <div className="absolute -left-10 top-5 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                  <i className="ri-question-mark text-gray-400 text-sm"></i>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-gray-400 text-sm">
                      Your next milestone awaits...
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Keep attending sessions and training people to unlock new achievements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BADGES TAB ── */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Earn badges by reaching milestones in your harm reduction journey
            </p>
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
              {earnedBadges} / {BADGES.length} earned
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl border p-5 text-center transition-all ${
                  badge.earned
                    ? 'bg-white shadow-md border-gray-100 hover:shadow-lg'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 ${badge.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm ${
                    badge.earned ? 'shadow-md' : ''
                  }`}
                >
                  <i className={`${badge.icon} ${badge.textColor} text-2xl`}></i>
                </div>
                <p
                  className={`font-bold text-sm leading-tight mb-1 ${
                    badge.earned ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {badge.label}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{badge.desc}</p>
                {badge.earned ? (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <i className="ri-check-line text-lime-500 text-xs"></i>
                    <span className="text-lime-600 text-xs font-bold">Earned</span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <i className="ri-lock-line text-gray-300 text-xs"></i>
                    <span className="text-gray-300 text-xs font-bold">Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-trophy-fill text-yellow-400 text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Unlock more badges</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Train more people, attend more sessions, and complete eLearning courses to unlock the remaining{' '}
                {BADGES.length - earnedBadges} badges. Each badge represents a real milestone in your
                harm reduction journey.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
