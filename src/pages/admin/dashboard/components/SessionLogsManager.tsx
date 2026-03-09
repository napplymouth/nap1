
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface MemberProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface SessionLog {
  id: string;
  member_id: string;
  user_id: string;
  member_name: string;
  member_email: string;
  session_name: string;
  session_date: string;
  location: string;
  session_type: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
}

const SESSION_TYPES = [
  'Community',
  'Peer-to-Peer (P2P)',
  'Organisational',
  'eLearning',
  'Refresher',
  'Train the Trainer',
  'Other',
];

const TYPE_COLORS: Record<string, string> = {
  'Community': 'bg-yellow-100 text-yellow-700',
  'Peer-to-Peer (P2P)': 'bg-pink-100 text-pink-700',
  'Organisational': 'bg-lime-100 text-lime-700',
  'eLearning': 'bg-sky-100 text-sky-700',
  'Refresher': 'bg-orange-100 text-orange-700',
  'Train the Trainer': 'bg-violet-100 text-violet-700',
  'Other': 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  memberId: '',
  sessionName: '',
  sessionDate: '',
  location: '',
  sessionType: 'Community',
  notes: '',
};

export default function SessionLogsManager() {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [memberSearch, setMemberSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: logsData }, { data: membersData }] = await Promise.all([
        supabase
          .from('session_logs')
          .select('*')
          .order('session_date', { ascending: false }),
        supabase
          .from('member_profiles')
          .select('id, user_id, full_name, email')
          .eq('approval_status', 'approved')
          .order('full_name'),
      ]);
      setLogs((logsData as SessionLog[]) || []);
      setMembers((membersData as MemberProfile[]) || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.memberId || !form.sessionName || !form.sessionDate || !form.location) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      if (!member) throw new Error('Member not found');

      const { error } = await supabase.from('session_logs').insert({
        member_id: form.memberId,
        user_id: member.user_id,
        member_name: member.full_name,
        member_email: member.email,
        session_name: form.sessionName,
        session_date: form.sessionDate,
        location: form.location,
        session_type: form.sessionType,
        notes: form.notes || null,
        recorded_by: 'Admin',
      });

      if (error) throw error;

      showToast('success', `Session recorded for ${member.full_name}.`);
      setForm(EMPTY_FORM);
      setMemberSearch('');
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to record session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('session_logs').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Session log removed.');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete log.');
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const filteredLogs = logs.filter((l) => {
    const q = logSearch.toLowerCase();
    const matchesSearch =
      !q ||
      l.member_name.toLowerCase().includes(q) ||
      l.session_name.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.member_email.toLowerCase().includes(q);
    const matchesType = filterType === 'all' || l.session_type === filterType;
    return matchesSearch && matchesType;
  });

  // Group logs by member for the member view
  const logsByMember = filteredLogs.reduce<Record<string, SessionLog[]>>((acc, log) => {
    if (!acc[log.member_id]) acc[log.member_id] = [];
    acc[log.member_id].push(log);
    return acc;
  }, {});

  const uniqueMembers = Object.keys(logsByMember).map((memberId) => ({
    memberId,
    name: logsByMember[memberId][0].member_name,
    email: logsByMember[memberId][0].member_email,
    count: logsByMember[memberId].length,
    logs: logsByMember[memberId],
  }));

  const totalSessions = logs.length;
  const uniqueMemberCount = new Set(logs.map((l) => l.member_id)).size;
  const thisMonth = logs.filter((l) => {
    const d = new Date(l.session_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-fill text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Remove Session Log?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently remove this session record from the member's history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Session Logs</h1>
          <p className="text-gray-500 text-sm">Record and manage training sessions attended by each member.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-900 text-yellow-400 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap shadow-md"
        >
          <i className={showForm ? 'ri-close-line' : 'ri-add-line'}></i>
          {showForm ? 'Cancel' : 'Record Session'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions Logged', value: totalSessions, icon: 'ri-calendar-check-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
          { label: 'Members with Logs', value: uniqueMemberCount, icon: 'ri-user-heart-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
          { label: 'Sessions This Month', value: thisMonth, icon: 'ri-calendar-event-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-md`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-xl`}></i>
            </div>
            <div className={`text-4xl font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className={`text-sm font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Record Session Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center">
              <i className="ri-calendar-add-fill text-gray-900 text-lg"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Record a Training Session</h2>
              <p className="text-gray-500 text-xs">Log a session attended by a member</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Member picker */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Member <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-base"></i>
                </div>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search member by name or email…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
              {form.memberId && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 mb-2">
                  <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs flex-shrink-0">
                    {members.find((m) => m.id === form.memberId)?.full_name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-1">
                    {members.find((m) => m.id === form.memberId)?.full_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, memberId: '' })); setMemberSearch(''); }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
              {memberSearch && !form.memberId && (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">No approved members found</div>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setForm((f) => ({ ...f, memberId: m.id })); setMemberSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{m.full_name}</p>
                          <p className="text-gray-400 text-xs">{m.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Session Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Session Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.sessionName}
                  onChange={(e) => setForm((f) => ({ ...f, sessionName: e.target.value }))}
                  placeholder="e.g. Community Naloxone Training"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Session Type</label>
                <select
                  value={form.sessionType}
                  onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm bg-white"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Plymouth Community Centre"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes about this session…"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.notes.length}/500</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setMemberSearch(''); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-yellow-400 font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Saving…</>
                ) : (
                  <><i className="ri-save-line"></i> Save Session Log</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-list-check-2 text-yellow-500"></i>
            All Session Logs
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{filteredLogs.length}</span>
          </h2>
          <div className="flex gap-3 flex-wrap w-full sm:w-auto">
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 bg-white"
            >
              <option value="all">All Types</option>
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-base"></i>
              </div>
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search member, session, location…"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="ri-loader-4-line text-5xl animate-spin mb-3"></i>
            <p className="font-semibold">Loading session logs…</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="ri-calendar-line text-5xl mb-3"></i>
            <p className="font-semibold text-lg">No session logs yet</p>
            <p className="text-sm mt-1">Click "Record Session" to add the first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {uniqueMembers.map(({ memberId, name, email, count, logs: memberLogs }) => {
              const isExpanded = expandedMember === memberId;
              return (
                <div key={memberId}>
                  {/* Member row */}
                  <button
                    onClick={() => setExpandedMember(isExpanded ? null : memberId)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                      <p className="text-gray-400 text-xs">{email}</p>
                    </div>
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {count} session{count !== 1 ? 's' : ''}
                    </span>
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                      <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-lg`}></i>
                    </div>
                  </button>

                  {/* Expanded session rows */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {memberLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 px-8 py-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
                        >
                          <div className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${TYPE_COLORS[log.session_type] || 'bg-gray-100 text-gray-600'}`}>
                            {log.session_type}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{log.session_name}</p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                <i className="ri-calendar-line"></i>
                                {new Date(log.session_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                <i className="ri-map-pin-line"></i>
                                {log.location}
                              </span>
                              {log.notes && (
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                  <i className="ri-sticky-note-line"></i>
                                  {log.notes}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                            Logged {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <button
                            onClick={() => setDeleteConfirm(log.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer flex-shrink-0"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
