import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import supabase from '../../../../lib/supabase';

interface CpdEntry {
  id: string;
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
}

const ACTIVITY_TYPES = [
  'Training Course',
  'Conference / Seminar',
  'E-Learning',
  'Peer Discussion',
  'Reading / Research',
  'Clinical Audit',
  'Mentoring / Supervision',
  'Webinar',
  'Workshop',
  'Other',
];

const EVIDENCE_TYPES = [
  'Certificate of Attendance',
  'Completion Certificate',
  'Reflective Account',
  'Meeting Notes',
  'Audit Report',
  'Published Article',
  'Other',
];

const EMPTY_FORM = {
  activity_title: '',
  activity_type: '',
  provider: '',
  date_completed: '',
  hours: '',
  learning_outcomes: '',
  reflection: '',
  evidence_type: '',
};

type FilterPeriod = 'all' | 'this_year' | 'last_year';

export default function CpdLog() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CpdEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CpdEntry | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [filterType, setFilterType] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cpd_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching CPD logs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const openAddForm = () => {
    setEditingEntry(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (entry: CpdEntry) => {
    setEditingEntry(entry);
    setForm({
      activity_title: entry.activity_title,
      activity_type: entry.activity_type,
      provider: entry.provider || '',
      date_completed: entry.date_completed,
      hours: String(entry.hours),
      learning_outcomes: entry.learning_outcomes || '',
      reflection: entry.reflection || '',
      evidence_type: entry.evidence_type || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        activity_title: form.activity_title.trim(),
        activity_type: form.activity_type,
        provider: form.provider.trim(),
        date_completed: form.date_completed,
        hours: parseFloat(form.hours),
        learning_outcomes: form.learning_outcomes.trim(),
        reflection: form.reflection.trim(),
        evidence_type: form.evidence_type,
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('cpd_logs')
          .update(payload)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);
        if (error) throw error;
        showToast('CPD entry updated successfully.', 'success');
      } else {
        const { error } = await supabase.from('cpd_logs').insert(payload);
        if (error) throw error;
        showToast('CPD entry added successfully.', 'success');
      }

      closeForm();
      fetchEntries();
    } catch (err) {
      console.error('Error saving CPD entry:', err);
      showToast('Failed to save entry. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('cpd_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast('Entry deleted.', 'success');
    } catch (err) {
      console.error('Error deleting CPD entry:', err);
      showToast('Failed to delete entry.', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const filtered = entries.filter((e) => {
    const year = new Date(e.date_completed).getFullYear();
    const matchPeriod =
      filterPeriod === 'all' ||
      (filterPeriod === 'this_year' && year === currentYear) ||
      (filterPeriod === 'last_year' && year === lastYear);
    const matchType = filterType === 'All' || e.activity_type === filterType;
    return matchPeriod && matchType;
  });

  const totalHours = filtered.reduce((sum, e) => sum + Number(e.hours), 0);
  const thisYearHours = entries
    .filter((e) => new Date(e.date_completed).getFullYear() === currentYear)
    .reduce((sum, e) => sum + Number(e.hours), 0);
  const verifiedCount = entries.filter((e) => e.verified).length;

  const typeBreakdown = ACTIVITY_TYPES.map((type) => ({
    type,
    count: entries.filter((e) => e.activity_type === type).length,
    hours: entries
      .filter((e) => e.activity_type === type)
      .reduce((sum, e) => sum + Number(e.hours), 0),
  })).filter((t) => t.count > 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'
          }`}
        >
          <i className={toast.type === 'success' ? 'ri-check-line text-lg' : 'ri-error-warning-line text-lg'}></i>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">CPD Log</h2>
          <p className="text-gray-500 text-sm">Record and track your continuing professional development hours</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line text-lg"></i>
          Add CPD Entry
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-xl text-cyan-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{thisYearHours.toFixed(1)}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Hours This Year</p>
          <p className="text-xs text-gray-400 mt-0.5">{currentYear}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <i className="ri-stack-line text-xl text-teal-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{entries.length}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Total Activities</p>
          <p className="text-xs text-gray-400 mt-0.5">All time</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="ri-bar-chart-2-line text-xl text-indigo-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {entries.length > 0 ? (entries.reduce((s, e) => s + Number(e.hours), 0) / entries.length).toFixed(1) : '0'}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Avg Hours / Activity</p>
          <p className="text-xs text-gray-400 mt-0.5">All time</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-shield-check-line text-xl text-green-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{verifiedCount}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Verified Entries</p>
          <p className="text-xs text-gray-400 mt-0.5">By NAP team</p>
        </div>
      </div>

      {/* Activity Breakdown */}
      {typeBreakdown.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">Activity Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {typeBreakdown.map((t) => (
              <div
                key={t.type}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${ACTIVITY_COLORS[t.type] || 'bg-gray-100 text-gray-700'}`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${ACTIVITY_ICONS[t.type] || 'ri-file-text-line'} text-sm`}></i>
                </div>
                {t.type}
                <span className="font-bold">{t.hours.toFixed(1)}h</span>
                <span className="opacity-60">({t.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'this_year', 'last_year'] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterPeriod === p ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'this_year' ? `${currentYear}` : `${lastYear}`}
            </button>
          ))}
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-cyan-600 focus:outline-none cursor-pointer"
        >
          <option value="All">All Activity Types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {filtered.length > 0 && (
          <div className="ml-auto flex items-center gap-2 bg-cyan-50 text-cyan-700 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">
            <i className="ri-time-line"></i>
            {totalHours.toFixed(1)} hours shown
          </div>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-gray-200 text-center">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your CPD log...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 border border-gray-200 text-center">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-3-line text-4xl text-cyan-400"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {entries.length === 0 ? 'No CPD entries yet' : 'No entries match your filters'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {entries.length === 0
              ? 'Start recording your continuing professional development activities.'
              : 'Try adjusting the period or activity type filter.'}
          </p>
          {entries.length === 0 && (
            <button
              onClick={openAddForm}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              Add Your First Entry
            </button>
          )}
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
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Entry Header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <i className={`${iconClass} text-xl`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">{entry.activity_title}</h4>
                      {entry.verified && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          <i className="ri-shield-check-line"></i>Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditForm(entry); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <i className="ri-edit-line text-base"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry.id); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <i className="ri-delete-bin-line text-base"></i>
                    </button>
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                      <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-lg`}></i>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4 bg-gray-50">
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
                    {entry.evidence_type && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Evidence:</p>
                        <span className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {entry.evidence_type}
                        </span>
                      </div>
                    )}
                    {entry.admin_notes && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          <i className="ri-sticky-note-line"></i>Note from NAP Team
                        </p>
                        <p className="text-sm text-teal-900 leading-relaxed">{entry.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeForm}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEntry ? 'Edit CPD Entry' : 'Add CPD Entry'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Record a continuing professional development activity</p>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Activity Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="activity_title"
                  value={form.activity_title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Naloxone Administration Training"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none"
                />
              </div>

              {/* Activity Type + Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Activity Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="activity_type"
                    value={form.activity_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select type…</option>
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Provider / Organisation</label>
                  <input
                    type="text"
                    name="provider"
                    value={form.provider}
                    onChange={handleChange}
                    placeholder="e.g. NAP Plymouth"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date + Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Date Completed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_completed"
                    value={form.date_completed}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    required
                    min="0.5"
                    max="40"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Evidence Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Evidence Type</label>
                <select
                  name="evidence_type"
                  value={form.evidence_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none cursor-pointer"
                >
                  <option value="">Select evidence type…</option>
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Learning Outcomes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Learning Outcomes</label>
                <textarea
                  name="learning_outcomes"
                  value={form.learning_outcomes}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="What did you learn from this activity?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.learning_outcomes.length}/500</p>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reflection</label>
                <textarea
                  name="reflection"
                  value={form.reflection}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="How will this activity impact your practice?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-cyan-600 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.reflection.length}/500</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Saving…</>
                  ) : (
                    <><i className="ri-save-line"></i>{editingEntry ? 'Update Entry' : 'Save Entry'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Entry?</h3>
            <p className="text-sm text-gray-500 mb-6">This CPD entry will be permanently removed and cannot be recovered.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? (
                  <><i className="ri-loader-4-line animate-spin"></i>Deleting…</>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
