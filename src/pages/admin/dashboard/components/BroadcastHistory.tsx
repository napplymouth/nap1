
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  sent_by: string | null;
  sent_by_name: string | null;
  recipient_count: number;
  created_at: string;
}

const AUDIENCE_META: Record<string, { label: string; icon: string; color: string; textColor: string }> = {
  all_members: { label: 'All Members', icon: 'ri-team-fill', color: 'bg-gray-900', textColor: 'text-yellow-400' },
  peer_trainers: { label: 'Peer Trainers', icon: 'ri-user-voice-fill', color: 'bg-pink-500', textColor: 'text-white' },
  kit_carriers: { label: 'Kit Carriers', icon: 'ri-medicine-bottle-fill', color: 'bg-lime-500', textColor: 'text-white' },
  first_responders: { label: 'First Responders', icon: 'ri-heart-pulse-fill', color: 'bg-red-500', textColor: 'text-white' },
  coordinators: { label: 'Coordinators', icon: 'ri-user-star-fill', color: 'bg-yellow-500', textColor: 'text-white' },
  all_volunteers: { label: 'All Volunteers', icon: 'ri-hand-heart-fill', color: 'bg-teal-500', textColor: 'text-white' },
};

function getAudienceMeta(value: string) {
  return AUDIENCE_META[value] ?? { label: value, icon: 'ri-broadcast-fill', color: 'bg-gray-400', textColor: 'text-white' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export default function BroadcastHistory() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBroadcasts((data || []) as Broadcast[]);
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const filtered = broadcasts.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.message?.toLowerCase().includes(q) ||
      b.sent_by_name?.toLowerCase().includes(q);
    const matchAudience = audienceFilter === 'all' || b.target_audience === audienceFilter;
    return matchSearch && matchAudience;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalRecipients = broadcasts.reduce((sum, b) => sum + (b.recipient_count || 0), 0);
  const thisMonth = broadcasts.filter((b) => {
    const d = new Date(b.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const audienceOptions = [
    { value: 'all', label: 'All Audiences' },
    ...Object.entries(AUDIENCE_META).map(([value, meta]) => ({ value, label: meta.label })),
  ];

  return (
    <div>
      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Broadcasts', value: broadcasts.length, icon: 'ri-broadcast-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
          { label: 'This Month', value: thisMonth, icon: 'ri-calendar-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
          { label: 'Total Recipients', value: totalRecipients.toLocaleString(), icon: 'ri-mail-send-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
          { label: 'Audience Groups', value: Object.keys(AUDIENCE_META).length, icon: 'ri-group-fill', bg: 'bg-orange-400', text: 'text-white', sub: 'text-orange-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-md`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-0.5`}>{s.value}</div>
            <div className={`text-xs font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <i className="ri-history-fill text-yellow-400 text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">All Past Broadcasts</h3>
              <p className="text-xs text-gray-500">{filtered.length} broadcast{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Audience filter */}
            <select
              value={audienceFilter}
              onChange={(e) => { setAudienceFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer bg-white text-gray-700 font-medium"
            >
              {audienceOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search subject or message…"
                className="pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors w-56"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={loadBroadcasts}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span className="text-sm font-medium">Loading broadcast history…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-broadcast-fill text-3xl text-gray-300"></i>
            </div>
            <p className="font-bold text-gray-500 text-sm">No broadcasts found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || audienceFilter !== 'all' ? 'Try adjusting your filters.' : 'No broadcasts have been sent yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map((b) => {
              const meta = getAudienceMeta(b.target_audience);
              const isExpanded = expandedId === b.id;
              return (
                <div key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Row */}
                  <div
                    className="px-6 py-4 flex items-start gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  >
                    {/* Audience icon */}
                    <div className={`w-10 h-10 ${meta.color} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className={`${meta.icon} ${meta.textColor} text-base`}></i>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{b.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{b.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-gray-400 text-lg`}></i>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Audience badge */}
                        <span className={`${meta.color} ${meta.textColor} text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap`}>
                          <i className={meta.icon}></i>
                          {meta.label}
                        </span>

                        {/* Recipient count */}
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <i className="ri-user-fill"></i>
                          {b.recipient_count > 0 ? `${b.recipient_count} recipient${b.recipient_count !== 1 ? 's' : ''}` : 'Recipients not recorded'}
                        </span>

                        {/* Sent by */}
                        {b.sent_by_name && (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                            <i className="ri-shield-user-fill"></i>
                            {b.sent_by_name}
                          </span>
                        )}

                        {/* Date */}
                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap ml-auto">
                          <i className="ri-time-line"></i>
                          {formatDate(b.created_at)} at {formatTime(b.created_at)}
                          <span className="text-gray-300 mx-1">·</span>
                          {timeAgo(b.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded message */}
                  {isExpanded && (
                    <div className="px-6 pb-5">
                      <div className="ml-14 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <i className="ri-mail-open-fill text-gray-400 text-sm"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Message</span>
                        </div>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{b.message}</pre>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Sent on {formatDate(b.created_at)} at {formatTime(b.created_at)}
                            {b.sent_by_name ? ` by ${b.sent_by_name}` : ''}
                          </span>
                          <span className="text-xs text-gray-400">
                            {b.message.trim().split(/\s+/).length} words · {b.message.length} characters
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <i className="ri-arrow-left-s-line text-base"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === p ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <i className="ri-arrow-right-s-line text-base"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
