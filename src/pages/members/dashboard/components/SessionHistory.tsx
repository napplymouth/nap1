
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface SessionLog {
  id: string;
  session_name: string;
  session_date: string;
  location: string;
  session_type: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  'Community': 'bg-yellow-400 text-gray-900',
  'Peer-to-Peer (P2P)': 'bg-pink-500 text-white',
  'Organisational': 'bg-lime-400 text-gray-900',
  'eLearning': 'bg-sky-400 text-white',
  'Refresher': 'bg-orange-400 text-white',
  'Train the Trainer': 'bg-violet-500 text-white',
  'Other': 'bg-gray-400 text-white',
};

const TYPE_ICONS: Record<string, string> = {
  'Community': 'ri-community-fill',
  'Peer-to-Peer (P2P)': 'ri-team-fill',
  'Organisational': 'ri-building-fill',
  'eLearning': 'ri-graduation-cap-fill',
  'Refresher': 'ri-refresh-fill',
  'Train the Trainer': 'ri-user-star-fill',
  'Other': 'ri-calendar-fill',
};

type Props = {
  userId: string | undefined;
  memberName: string;
};

export default function SessionHistory({ userId, memberName }: Props) {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchLogs = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_logs')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setLogs((data as SessionLog[]) || []);
    } catch (err) {
      console.error('Error fetching session logs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = logs
    .filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.session_name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.session_type.toLowerCase().includes(q);
      const matchesType = filterType === 'all' || l.session_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const diff = new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
      return sortOrder === 'desc' ? -diff : diff;
    });

  const uniqueTypes = Array.from(new Set(logs.map((l) => l.session_type)));

  const thisYear = new Date().getFullYear();
  const sessionsThisYear = logs.filter(
    (l) => new Date(l.session_date).getFullYear() === thisYear
  ).length;

  const mostRecentSession = logs[0];

  // Group by year for timeline display
  const groupedByYear = filtered.reduce<Record<string, SessionLog[]>>((acc, log) => {
    const year = new Date(log.session_date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(log);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) =>
    sortOrder === 'desc' ? Number(b) - Number(a) : Number(a) - Number(b)
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <i className="ri-calendar-check-fill text-yellow-500"></i> Session History
        </h1>
        <p className="text-gray-500 text-sm">
          A complete record of every training session you've attended with NAP
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-calendar-check-fill text-white text-xl"></i>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{logs.length}</p>
          <p className="text-sm font-semibold text-gray-400">Total Sessions</p>
        </div>
        <div className="bg-yellow-400 rounded-2xl p-5 shadow-md">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-calendar-event-fill text-gray-900 text-xl"></i>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{sessionsThisYear}</p>
          <p className="text-sm font-semibold text-gray-700">This Year</p>
        </div>
        <div className="bg-lime-400 rounded-2xl p-5 shadow-md">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-map-pin-fill text-gray-900 text-xl"></i>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {new Set(logs.map((l) => l.location)).size}
          </p>
          <p className="text-sm font-semibold text-gray-700">Locations Visited</p>
        </div>
      </div>

      {/* Most recent session banner */}
      {mostRecentSession && (
        <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-star-fill text-gray-900 text-xl"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">Most Recent Session</p>
            <p className="font-bold text-gray-900 text-base truncate">{mostRecentSession.session_name}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-gray-800 text-xs flex items-center gap-1">
                <i className="ri-calendar-line"></i>
                {new Date(mostRecentSession.session_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              <span className="text-gray-800 text-xs flex items-center gap-1">
                <i className="ri-map-pin-line"></i>
                {mostRecentSession.location}
              </span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${TYPE_COLORS[mostRecentSession.session_type] || 'bg-gray-100 text-gray-600'}`}>
            {mostRecentSession.session_type}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-base"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions or locations…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 bg-white whitespace-nowrap"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Sort */}
        <button
          onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className={`${sortOrder === 'desc' ? 'ri-sort-desc' : 'ri-sort-asc'} text-base`}></i>
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Session list */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 flex flex-col items-center justify-center gap-4">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-400"></i>
          <p className="text-gray-500 font-semibold text-sm">Loading your session history…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-line text-gray-400 text-4xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {logs.length === 0 ? 'No sessions recorded yet' : 'No sessions match your search'}
          </h3>
          <p className="text-gray-500 text-sm">
            {logs.length === 0
              ? 'Your session history will appear here once an admin records your attendance.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedYears.map((year) => (
            <div key={year}>
              {/* Year divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gray-900 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  {year}
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">
                  {groupedByYear[year].length} session{groupedByYear[year].length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Sessions for this year */}
              <div className="space-y-3">
                {groupedByYear[year].map((log, idx) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${TYPE_COLORS[log.session_type]?.split(' ')[0] || 'bg-gray-400'} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <i className={`${TYPE_ICONS[log.session_type] || 'ri-calendar-fill'} text-xl ${TYPE_COLORS[log.session_type]?.split(' ')[1] || 'text-white'}`}></i>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-gray-900 text-base">{log.session_name}</h3>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLORS[log.session_type] || 'bg-gray-100 text-gray-600'}`}>
                                {log.session_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                                <i className="ri-calendar-line text-yellow-500"></i>
                                {new Date(log.session_date).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                                <i className="ri-map-pin-line text-pink-500"></i>
                                {log.location}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-gray-400 text-xs mt-2 flex items-start gap-1.5">
                                <i className="ri-sticky-note-line mt-0.5 flex-shrink-0"></i>
                                {log.notes}
                              </p>
                            )}
                          </div>

                          {/* Attendance badge */}
                          <div className="flex items-center gap-1.5 bg-lime-50 border border-lime-200 px-3 py-1.5 rounded-full flex-shrink-0">
                            <i className="ri-checkbox-circle-fill text-lime-500 text-sm"></i>
                            <span className="text-lime-700 text-xs font-bold whitespace-nowrap">Attended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 flex items-start gap-3">
            <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-gray-500 text-base"></i>
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm mb-0.5">About your session history</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Sessions are recorded by NAP administrators after you attend a training event.
                If you believe a session is missing, please contact your NAP coordinator.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
