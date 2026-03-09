import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface CpdEntry {
  id: string;
  user_id: string;
  activity_title: string;
  activity_type: string;
  provider: string;
  date_completed: string;
  hours: number;
  learning_outcomes: string;
  reflection: string;
  evidence_type: string;
  verified: boolean;
  admin_notes: string | null;
  created_at: string;
  professional_name?: string;
  professional_email?: string;
  profession_type?: string;
}

const ACTIVITY_COLORS: Record<string, string> = {
  'Training Course': 'bg-cyan-100 text-cyan-700',
  'Conference / Seminar': 'bg-teal-100 text-teal-700',
  'E-Learning': 'bg-indigo-100 text-indigo-700',
  'Peer Discussion': 'bg-green-100 text-green-700',
  'Reading / Research': 'bg-amber-100 text-amber-700',
  'Clinical Audit': 'bg-red-100 text-red-700',
  'Mentoring / Supervision': 'bg-pink-100 text-pink-700',
  'Webinar': 'bg-orange-100 text-orange-700',
  'Workshop': 'bg-lime-100 text-lime-700',
  'Other': 'bg-gray-100 text-gray-700',
};

const ACTIVITY_ICONS: Record<string, string> = {
  'Training Course': 'ri-graduation-cap-line',
  'Conference / Seminar': 'ri-presentation-line',
  'E-Learning': 'ri-computer-line',
  'Peer Discussion': 'ri-discuss-line',
  'Reading / Research': 'ri-book-open-line',
  'Clinical Audit': 'ri-bar-chart-box-line',
  'Mentoring / Supervision': 'ri-user-star-line',
  'Webinar': 'ri-live-line',
  'Workshop': 'ri-tools-line',
  'Other': 'ri-file-text-line',
};

type FilterStatus = 'all' | 'unverified' | 'verified';

export default function CpdLogsManager() {
  const [entries, setEntries] = useState<CpdEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('unverified');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState('All');
  const [professionals, setProfessionals] = useState<{ user_id: string; full_name: string }[]>([]);

  // Notes modal state
  const [notesModal, setNotesModal] = useState<{
    open: boolean;
    entryId: string;
    entryTitle: string;
    currentVerified: boolean;
    existingNotes: string;
  } | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all CPD logs
      const { data: logs, error: logsError } = await supabase
        .from('cpd_logs')
        .select('*')
        .order('date_completed', { ascending: false });

      if (logsError) throw logsError;

      // Fetch all professional profiles for name/email lookup
      const { data: profiles, error: profilesError } = await supabase
        .from('professional_profiles')
        .select('user_id, full_name, email, profession_type');

      if (profilesError) throw profilesError;

      const profileMap: Record<string, { full_name: string; email: string; profession_type: string }> = {};
      (profiles || []).forEach((p) => {
        profileMap[p.user_id] = {
          full_name: p.full_name,
          email: p.email,
          profession_type: p.profession_type,
        };
      });

      const enriched: CpdEntry[] = (logs || []).map((log) => ({
        ...log,
        professional_name: profileMap[log.user_id]?.full_name || 'Unknown',
        professional_email: profileMap[log.user_id]?.email || '',
        profession_type: profileMap[log.user_id]?.profession_type || '',
      }));

      setEntries(enriched);

      // Build unique professionals list
      const seen = new Set<string>();
      const profList: { user_id: string; full_name: string }[] = [];
      enriched.forEach((e) => {
        if (!seen.has(e.user_id)) {
          seen.add(e.user_id);
          profList.push({ user_id: e.user_id, full_name: e.professional_name || 'Unknown' });
        }
      });
      setProfessionals(profList.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    } catch (err) {
      console.error('Error fetching CPD logs:', err);
      showToast('Failed to load CPD entries.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Open notes modal before verifying
  const openNotesModal = (entry: CpdEntry) => {
    setNotesModal({
      open: true,
      entryId: entry.id,
      entryTitle: entry.activity_title,
      currentVerified: entry.verified,
      existingNotes: entry.admin_notes || '',
    });
    setNotesDraft(entry.admin_notes || '');
  };

  const closeNotesModal = () => {
    setNotesModal(null);
    setNotesDraft('');
  };

  // Save notes only (without changing verification)
  const handleSaveNotesOnly = async () => {
    if (!notesModal) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('cpd_logs')
        .update({ admin_notes: notesDraft.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', notesModal.entryId);

      if (error) throw error;

      setEntries((prev) =>
        prev.map((e) =>
          e.id === notesModal.entryId ? { ...e, admin_notes: notesDraft.trim() || null } : e
        )
      );
      showToast('Notes saved successfully.', 'success');
      closeNotesModal();
    } catch (err) {
      console.error('Error saving notes:', err);
      showToast('Failed to save notes.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Confirm verification with notes
  const handleConfirmVerify = async () => {
    if (!notesModal) return;
    setSavingNotes(true);
    try {
      const newVerified = !notesModal.currentVerified;
      const { error } = await supabase
        .from('cpd_logs')
        .update({
          verified: newVerified,
          admin_notes: notesDraft.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notesModal.entryId);

      if (error) throw error;

      setEntries((prev) =>
        prev.map((e) =>
          e.id === notesModal.entryId
            ? { ...e, verified: newVerified, admin_notes: notesDraft.trim() || null }
            : e
        )
      );
      showToast(
        newVerified ? 'CPD entry verified successfully.' : 'Verification removed.',
        'success'
      );
      closeNotesModal();
    } catch (err) {
      console.error('Error updating verification:', err);
      showToast('Failed to update verification status.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Quick remove verification (no modal needed)
  const handleRemoveVerification = async (id: string) => {
    setVerifyingId(id);
    try {
      const { error } = await supabase
        .from('cpd_logs')
        .update({ verified: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, verified: false } : e)));
      showToast('Verification removed.', 'success');
    } catch (err) {
      console.error('Error removing verification:', err);
      showToast('Failed to remove verification.', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = entries.filter((e) => {
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && e.verified) ||
      (filterStatus === 'unverified' && !e.verified);

    const matchProfessional =
      selectedProfessional === 'All' || e.user_id === selectedProfessional;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.activity_title?.toLowerCase().includes(q) ||
      e.professional_name?.toLowerCase().includes(q) ||
      e.professional_email?.toLowerCase().includes(q) ||
      e.activity_type?.toLowerCase().includes(q) ||
      e.provider?.toLowerCase().includes(q);

    return matchStatus && matchProfessional && matchSearch;
  });

  const totalEntries = entries.length;
  const verifiedCount = entries.filter((e) => e.verified).length;
  const unverifiedCount = entries.filter((e) => !e.verified).length;
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-lime-500' : 'bg-red-500'
          }`}
        >
          <i className={toast.type === 'success' ? 'ri-check-line text-lg' : 'ri-error-warning-line text-lg'}></i>
          {toast.message}
        </div>
      )}

      {/* Notes / Verify Modal */}
      {notesModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeNotesModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
                  <i className="ri-shield-check-line text-lime-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {notesModal.currentVerified ? 'Edit Notes' : 'Verify CPD Entry'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{notesModal.entryTitle}</p>
                </div>
              </div>
              <button
                onClick={closeNotesModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Admin Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Add any comments, feedback, or notes for this CPD entry…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-lime-400 resize-none transition-colors"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{notesDraft.length}/500</p>
              </div>

              {notesModal.existingNotes && notesDraft === notesModal.existingNotes && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <i className="ri-information-line text-amber-500 mt-0.5 flex-shrink-0"></i>
                  <p className="text-xs text-amber-700">
                    This entry already has notes. You can update them or leave them as-is.
                  </p>
                </div>
              )}

              {!notesModal.currentVerified && (
                <div className="flex items-start gap-2 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3">
                  <i className="ri-shield-check-line text-lime-600 mt-0.5 flex-shrink-0"></i>
                  <p className="text-xs text-lime-700">
                    The professional will see a <strong>Verified</strong> badge on their dashboard once confirmed. Notes will also be visible to them.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={closeNotesModal}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {/* Save notes only */}
                <button
                  onClick={handleSaveNotesOnly}
                  disabled={savingNotes}
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  {savingNotes ? (
                    <span className="flex items-center gap-1.5"><i className="ri-loader-4-line animate-spin"></i>Saving…</span>
                  ) : (
                    'Save Notes Only'
                  )}
                </button>
                {/* Verify / update */}
                <button
                  onClick={handleConfirmVerify}
                  disabled={savingNotes}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 shadow-sm ${
                    notesModal.currentVerified
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-lime-500 text-white hover:bg-lime-600'
                  }`}
                >
                  {savingNotes ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Updating…</>
                  ) : notesModal.currentVerified ? (
                    <><i className="ri-close-circle-line"></i>Remove Verification</>
                  ) : (
                    <><i className="ri-shield-check-line"></i>Confirm &amp; Verify</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">CPD Logs</h1>
        <p className="text-gray-500 text-sm">
          View and verify continuing professional development entries submitted by professionals.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: totalEntries, icon: 'ri-file-list-3-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
          { label: 'Awaiting Verification', value: unverifiedCount, icon: 'ri-time-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
          { label: 'Verified', value: verifiedCount, icon: 'ri-shield-check-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
          { label: 'Total CPD Hours', value: totalHours.toFixed(1), icon: 'ri-time-fill', bg: 'bg-cyan-600', text: 'text-white', sub: 'text-cyan-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i className={`${s.icon} ${s.text} text-xl`}></i>
              </div>
            </div>
            <div className={`text-4xl font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className={`text-sm font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {unverifiedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-notification-3-fill text-gray-900 text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-yellow-800 text-sm">
              {unverifiedCount} CPD {unverifiedCount === 1 ? 'entry' : 'entries'} awaiting verification
            </p>
            <p className="text-yellow-700 text-xs mt-0.5">
              Professionals can see their verified status in their dashboard once you approve.
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('unverified')}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all cursor-pointer whitespace-nowrap"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-wrap">
          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(
              [
                { key: 'unverified', label: 'Unverified', icon: 'ri-time-fill', color: 'text-yellow-600', count: unverifiedCount },
                { key: 'verified', label: 'Verified', icon: 'ri-shield-check-fill', color: 'text-lime-600', count: verifiedCount },
                { key: 'all', label: 'All', icon: 'ri-file-list-3-fill', color: 'text-gray-600', count: totalEntries },
              ] as { key: FilterStatus; label: string; icon: string; color: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`${tab.icon} ${filterStatus === tab.key ? tab.color : ''}`}></i>
                {tab.label}
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Professional filter */}
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-yellow-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Professionals</option>
              {professionals.map((p) => (
                <option key={p.user_id} value={p.user_id}>{p.full_name}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-base"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="p-5">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading CPD entries…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-sm font-semibold">No CPD entries found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const colorClass = ACTIVITY_COLORS[entry.activity_type] || 'bg-gray-100 text-gray-700';
                const iconClass = ACTIVITY_ICONS[entry.activity_type] || 'ri-file-text-line';

                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer bg-white"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      {/* Activity icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <i className={`${iconClass} text-lg`}></i>
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-sm">{entry.activity_title}</span>
                          {entry.verified ? (
                            <span className="flex items-center gap-1 bg-lime-100 text-lime-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-shield-check-fill"></i>Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-time-fill"></i>Unverified
                            </span>
                          )}
                          {entry.admin_notes && (
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                              <i className="ri-sticky-note-line"></i>Note added
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {/* Professional */}
                          <span className="flex items-center gap-1 font-semibold text-gray-700">
                            <i className="ri-user-line"></i>{entry.professional_name}
                          </span>
                          {entry.profession_type && (
                            <span className="text-gray-400">{entry.profession_type}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${colorClass}`}>
                            {entry.activity_type}
                          </span>
                          {entry.provider && (
                            <span className="flex items-center gap-1">
                              <i className="ri-building-line"></i>{entry.provider}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <i className="ri-calendar-line"></i>{formatDate(entry.date_completed)}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-cyan-700">
                            <i className="ri-time-line"></i>{Number(entry.hours).toFixed(1)} hrs
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Notes / Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openNotesModal(entry);
                          }}
                          title={entry.verified ? 'Edit notes or remove verification' : 'Add notes & verify'}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                            entry.verified
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-lime-500 text-white hover:bg-lime-600 shadow-sm'
                          }`}
                        >
                          {entry.verified ? (
                            <><i className="ri-edit-line"></i>Edit</>
                          ) : (
                            <><i className="ri-shield-check-line"></i>Verify</>
                          )}
                        </button>
                        <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                          <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-lg`}></i>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50 space-y-4">
                        {/* Professional info */}
                        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-gray-200">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Professional</p>
                            <p className="text-sm font-semibold text-gray-900">{entry.professional_name}</p>
                          </div>
                          {entry.professional_email && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                              <a
                                href={`mailto:${entry.professional_email}`}
                                className="text-sm text-cyan-700 font-semibold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {entry.professional_email}
                              </a>
                            </div>
                          )}
                          {entry.profession_type && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Role</p>
                              <p className="text-sm font-semibold text-gray-900">{entry.profession_type}</p>
                            </div>
                          )}
                          {entry.evidence_type && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Evidence</p>
                              <span className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {entry.evidence_type}
                              </span>
                            </div>
                          )}
                        </div>

                        {entry.learning_outcomes && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Outcomes</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{entry.learning_outcomes}</p>
                          </div>
                        )}
                        {entry.reflection && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Reflection</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{entry.reflection}</p>
                          </div>
                        )}

                        {/* Admin notes display */}
                        {entry.admin_notes && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                              <i className="ri-sticky-note-line"></i>Admin Notes
                            </p>
                            <p className="text-sm text-amber-900 leading-relaxed">{entry.admin_notes}</p>
                          </div>
                        )}

                        {/* Actions in expanded view */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => openNotesModal(entry)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-sticky-note-line"></i>
                            {entry.admin_notes ? 'Edit Notes' : 'Add Notes'}
                          </button>

                          <div className="flex items-center gap-2">
                            {entry.verified && (
                              <button
                                onClick={() => handleRemoveVerification(entry.id)}
                                disabled={verifyingId === entry.id}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
                              >
                                {verifyingId === entry.id ? (
                                  <><i className="ri-loader-4-line animate-spin"></i>Removing…</>
                                ) : (
                                  <><i className="ri-close-circle-line"></i>Remove Verification</>
                                )}
                              </button>
                            )}
                            {!entry.verified && (
                              <button
                                onClick={() => openNotesModal(entry)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-lime-500 text-white hover:bg-lime-600 shadow-md transition-all cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-shield-check-line"></i>Mark as Verified
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
