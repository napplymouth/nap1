
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface MemberImpact {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  sessions_attended: number;
  kits_collected: number;
  people_trained: number;
}

interface EditState {
  sessions_attended: number;
  kits_collected: number;
  people_trained: number;
}

export default function ImpactStatsManager() {
  const [members, setMembers] = useState<MemberImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditState>({ sessions_attended: 0, kits_collected: 0, people_trained: 0 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('member_profiles')
        .select('id, user_id, full_name, email, sessions_attended, kits_collected, people_trained')
        .eq('approval_status', 'approved')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setMembers(
        (data || []).map((m) => ({
          ...m,
          sessions_attended: m.sessions_attended ?? 0,
          kits_collected: m.kits_collected ?? 0,
          people_trained: m.people_trained ?? 0,
        }))
      );
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const startEdit = (member: MemberImpact) => {
    setEditingId(member.id);
    setEditValues({
      sessions_attended: member.sessions_attended,
      kits_collected: member.kits_collected,
      people_trained: member.people_trained,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (member: MemberImpact) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('member_profiles')
        .update({
          sessions_attended: editValues.sessions_attended,
          kits_collected: editValues.kits_collected,
          people_trained: editValues.people_trained,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, ...editValues } : m
        )
      );
      setEditingId(null);
      showToast('success', `Impact stats updated for ${member.full_name}.`);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EditState, raw: string) => {
    const val = Math.max(0, parseInt(raw, 10) || 0);
    setEditValues((prev) => ({ ...prev, [field]: val }));
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const STAT_FIELDS: { key: keyof EditState; label: string; icon: string; color: string }[] = [
    { key: 'sessions_attended', label: 'Sessions', icon: 'ri-calendar-check-fill', color: 'text-yellow-500' },
    { key: 'kits_collected', label: 'Kits', icon: 'ri-medicine-bottle-fill', color: 'text-pink-500' },
    { key: 'people_trained', label: 'Trained', icon: 'ri-team-fill', color: 'text-lime-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 transition-all ${
            toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Member Impact Stats</h1>
        <p className="text-gray-500 text-sm">
          Manually update sessions attended, kits collected, and people trained for each approved member.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-information-fill text-gray-900 text-sm"></i>
        </div>
        <p className="text-yellow-800 text-sm leading-relaxed">
          These stats appear on each member&apos;s personal Impact dashboard. Only approved members are shown here.
          Click <strong>Edit</strong> on any row to update their numbers, then <strong>Save</strong> to apply.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
          <i className="ri-search-line text-gray-400 text-base"></i>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <i className="ri-loader-4-line animate-spin text-4xl text-yellow-400"></i>
            <p className="text-gray-400 text-sm font-semibold">Loading members…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <i className="ri-user-search-line text-gray-300 text-3xl"></i>
            </div>
            <p className="text-gray-400 font-semibold text-sm">No approved members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                  {STAT_FIELDS.map((f) => (
                    <th key={f.key} className="text-center px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1.5">
                        <i className={`${f.icon} ${f.color}`}></i>
                        {f.label}
                      </div>
                    </th>
                  ))}
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((member) => {
                  const isEditing = editingId === member.id;
                  return (
                    <tr key={member.id} className={`transition-colors ${isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      {/* Member info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-900 font-bold text-sm">
                              {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{member.full_name}</p>
                            <p className="text-gray-400 text-xs truncate">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Stat fields */}
                      {STAT_FIELDS.map((f) => (
                        <td key={f.key} className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={editValues[f.key]}
                              onChange={(e) => handleFieldChange(f.key, e.target.value)}
                              className="w-20 text-center border-2 border-yellow-400 rounded-xl px-2 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            />
                          ) : (
                            <span className={`text-2xl font-bold ${f.color}`}>
                              {member[f.key]}
                            </span>
                          )}
                        </td>
                      ))}

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(member)}
                              disabled={saving}
                              className="px-4 py-2 rounded-xl bg-lime-500 text-white font-bold text-sm hover:bg-lime-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                            >
                              {saving ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                <i className="ri-save-line"></i>
                              )}
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(member)}
                            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto"
                          >
                            <i className="ri-edit-line"></i>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary footer */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} approved member{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
