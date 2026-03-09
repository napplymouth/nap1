
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
type GoalPriority = 'low' | 'medium' | 'high';
type GoalCategory =
  | 'Recovery'
  | 'Mental Health'
  | 'Housing'
  | 'Employment'
  | 'Relationships'
  | 'Physical Health'
  | 'Education'
  | 'Other';

interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  target_date: string | null;
  completed_at: string | null;
  mentor_notes: string | null;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

interface MemberRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  member_role: string;
  approval_status: string;
}

interface MemberWithGoals extends MemberRow {
  goals: Goal[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: GoalCategory[] = [
  'Recovery', 'Mental Health', 'Housing', 'Employment',
  'Relationships', 'Physical Health', 'Education', 'Other',
];

const CATEGORY_META: Record<GoalCategory, { icon: string; color: string; bg: string }> = {
  Recovery:          { icon: 'ri-heart-pulse-line',    color: 'text-rose-600',   bg: 'bg-rose-100' },
  'Mental Health':   { icon: 'ri-mental-health-line',  color: 'text-violet-600', bg: 'bg-violet-100' },
  Housing:           { icon: 'ri-home-heart-line',     color: 'text-amber-600',  bg: 'bg-amber-100' },
  Employment:        { icon: 'ri-briefcase-line',      color: 'text-teal-600',   bg: 'bg-teal-100' },
  Relationships:     { icon: 'ri-group-line',          color: 'text-pink-600',   bg: 'bg-pink-100' },
  'Physical Health': { icon: 'ri-run-line',            color: 'text-lime-600',   bg: 'bg-lime-100' },
  Education:         { icon: 'ri-graduation-cap-line', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  Other:             { icon: 'ri-star-line',           color: 'text-gray-600',   bg: 'bg-gray-100' },
};

const STATUS_META: Record<GoalStatus, { label: string; color: string; dot: string }> = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  paused:    { label: 'Paused',    color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',       dot: 'bg-red-400' },
};

const PRIORITY_META: Record<GoalPriority, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'text-rose-600 bg-rose-50 border-rose-200' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

// ─── Annotation Modal ─────────────────────────────────────────────────────────

interface AnnotateModalProps {
  goal: Goal;
  member: MemberRow;
  onSave: (goalId: string, note: string) => void;
  onClose: () => void;
  saving: boolean;
}

function AnnotateModal({ goal, member, onSave, onClose, saving }: AnnotateModalProps) {
  const [note, setNote] = useState(goal.mentor_notes || '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Mentor Annotation</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              For <span className="font-semibold text-gray-700">{member.full_name}</span> · {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-gray-600 text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <i className="ri-information-line text-amber-600 text-base flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your note will be visible to the member on their progress tracker, highlighted in amber.
              Saving a blank note will remove any existing annotation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mentor Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add guidance, encouragement, or observations for this goal..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{note.length}/500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(goal.id, note.trim())}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <><i className="ri-loader-4-line animate-spin"></i>Saving…</>
              ) : (
                <><i className="ri-save-line"></i>{note.trim() ? 'Save Note' : 'Remove Note'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Goal Panel ────────────────────────────────────────────────────────

interface MemberGoalPanelProps {
  member: MemberWithGoals;
  onAnnotate: (goal: Goal, member: MemberRow) => void;
  onClose: () => void;
}

function MemberGoalPanel({ member, onAnnotate, onClose }: MemberGoalPanelProps) {
  const goals = member.goals;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-user-heart-line text-yellow-400 text-xl"></i>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{member.full_name}</h2>
              <p className="text-xs text-gray-500">{member.email} · {member.member_role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-gray-600 text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-flag-2-line text-gray-400 text-3xl"></i>
              </div>
              <p className="text-gray-500 text-sm">This member has no goals yet.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const cat = CATEGORY_META[goal.category];
              const status = STATUS_META[goal.status];
              const priority = PRIORITY_META[goal.priority];
              const milestones = goal.milestones || [];
              const completedCount = milestones.filter((m) => m.completed).length;
              const progress = milestones.length > 0
                ? Math.round((completedCount / milestones.length) * 100)
                : 0;
              const isOverdue =
                goal.target_date &&
                goal.status === 'active' &&
                new Date(goal.target_date) < new Date();

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${cat.icon} ${cat.color} text-lg`}></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                              {status.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priority.color}`}>
                              {priority.label}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {goal.category}
                            </span>
                            {goal.mentor_notes && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                <i className="ri-user-star-line"></i>Annotated
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm leading-snug">{goal.title}</h3>
                        </div>

                        <button
                          onClick={() => onAnnotate(goal, member)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0"
                        >
                          <i className={goal.mentor_notes ? 'ri-edit-line' : 'ri-add-line'}></i>
                          {goal.mentor_notes ? 'Edit Note' : 'Add Note'}
                        </button>
                      </div>

                      {goal.description && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{goal.description}</p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        {goal.target_date && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                            <i className="ri-calendar-line"></i>
                            {isOverdue ? 'Overdue · ' : 'Target: '}
                            {new Date(goal.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {goal.completed_at && (
                          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                            <i className="ri-trophy-line"></i>
                            Completed {new Date(goal.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {milestones.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">{completedCount}/{milestones.length} steps</span>
                            <span className="text-xs font-bold text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Milestones list */}
                      {milestones.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {milestones.map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                m.completed ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'
                              }`}>
                                {m.completed && <i className="ri-check-line text-white" style={{ fontSize: '9px' }}></i>}
                              </div>
                              <span className={`text-xs ${m.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mentor note */}
                      {goal.mentor_notes && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <i className="ri-user-star-line text-amber-600 text-sm flex-shrink-0 mt-0.5"></i>
                          <div>
                            <p className="text-xs font-bold text-amber-700 mb-0.5">Your Note</p>
                            <p className="text-xs text-amber-800 leading-relaxed">{goal.mentor_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PeerGoalsManager() {
  const [members, setMembers] = useState<MemberWithGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<MemberWithGoals | null>(null);
  const [annotatingGoal, setAnnotatingGoal] = useState<{ goal: Goal; member: MemberRow } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .order('full_name', { ascending: true });

      if (membersError) throw membersError;

      const { data: goalsData, error: goalsError } = await supabase
        .from('peer_support_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('peer_support_milestones')
        .select('*')
        .order('created_at', { ascending: true });

      if (milestonesError) throw milestonesError;

      const enrichedGoals = (goalsData || []).map((g: Goal) => ({
        ...g,
        milestones: (milestonesData || []).filter((m: Milestone) => m.goal_id === g.id),
      }));

      const enrichedMembers: MemberWithGoals[] = (membersData || []).map((m: MemberRow) => ({
        ...m,
        goals: enrichedGoals.filter((g: Goal) => g.user_id === m.user_id),
      }));

      setMembers(enrichedMembers);

      // Refresh selected member panel if open
      if (selectedMember) {
        const refreshed = enrichedMembers.find((m) => m.id === selectedMember.id);
        if (refreshed) setSelectedMember(refreshed);
      }
    } catch (err) {
      console.error('Error loading peer goals data:', err);
      showToast('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMember]);

  useEffect(() => { loadData(); }, []);

  const handleSaveNote = async (goalId: string, note: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('peer_support_goals')
        .update({
          mentor_notes: note || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;

      // Send notification if note was added/updated (not removed)
      if (note && annotatingGoal) {
        const { goal, member } = annotatingGoal;
        const isUpdate = !!goal.mentor_notes;

        try {
          const { error: notifyError } = await supabase.functions.invoke('notify-mentor-annotation', {
            body: {
              goalId: goal.id,
              goalTitle: goal.title,
              goalCategory: goal.category,
              memberName: member.full_name,
              memberEmail: member.email,
              mentorNote: note,
              isUpdate,
            },
          });

          if (notifyError) {
            console.error('Notification failed:', notifyError);
            showToast('Note saved (notification failed)', 'success');
          } else {
            showToast('Note saved & member notified!', 'success');
          }
        } catch (notifyErr) {
          console.error('Notification error:', notifyErr);
          showToast('Note saved (notification failed)', 'success');
        }
      } else {
        showToast(note ? 'Note saved successfully!' : 'Note removed.', 'success');
      }

      setAnnotatingGoal(null);
      await loadData();
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Failed to save note.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const allGoals = members.flatMap((m) => m.goals);
  const totalMembers = members.filter((m) => m.goals.length > 0).length;
  const totalGoals = allGoals.length;
  const activeGoals = allGoals.filter((g) => g.status === 'active').length;
  const annotatedGoals = allGoals.filter((g) => g.mentor_notes).length;

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => ({
    cat,
    count: allGoals.filter((g) => g.category === cat).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const maxCatCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);

  // Unique roles for filter
  const uniqueRoles = Array.from(new Set(members.map((m) => m.member_role).filter(Boolean)));

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || m.member_role === roleFilter;
    return matchSearch && matchRole;
  });

  const hasActiveFilters = search.trim() !== '' || roleFilter !== 'all';

  // CSV export
  const handleExport = () => {
    const rows: string[][] = [
      ['Member Name', 'Email', 'Role', 'Total Goals', 'Active', 'Completed', 'Annotated', 'Categories'],
    ];
    members.forEach((m) => {
      const cats = Array.from(new Set(m.goals.map((g) => g.category))).join('; ');
      rows.push([
        m.full_name,
        m.email,
        m.member_role,
        String(m.goals.length),
        String(m.goals.filter((g) => g.status === 'active').length),
        String(m.goals.filter((g) => g.status === 'completed').length),
        String(m.goals.filter((g) => g.mentor_notes).length),
        cats,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peer-goals-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <i className={toast.type === 'success' ? 'ri-check-double-line' : 'ri-error-warning-line'}></i>
          {toast.msg}
        </div>
      )}

      {/* Annotation modal */}
      {annotatingGoal && (
        <AnnotateModal
          goal={annotatingGoal.goal}
          member={annotatingGoal.member}
          onSave={handleSaveNote}
          onClose={() => setAnnotatingGoal(null)}
          saving={saving}
        />
      )}

      {/* Member panel */}
      {selectedMember && (
        <MemberGoalPanel
          member={selectedMember}
          onAnnotate={(goal, member) => setAnnotatingGoal({ goal, member })}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Peer Goals</h1>
          <p className="text-gray-500 text-sm">View member goals, track progress, and add mentor annotations.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer shadow-sm"
        >
          <i className="ri-download-2-line"></i>
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Members with Goals', value: totalMembers,   icon: 'ri-user-heart-fill',       bg: 'bg-gray-900',    text: 'text-white',       sub: 'text-gray-400' },
          { label: 'Total Goals',        value: totalGoals,     icon: 'ri-flag-2-fill',            bg: 'bg-yellow-400',  text: 'text-gray-900',    sub: 'text-gray-700' },
          { label: 'Active Goals',       value: activeGoals,    icon: 'ri-play-circle-fill',       bg: 'bg-lime-500',    text: 'text-white',       sub: 'text-lime-100' },
          { label: 'Annotated',          value: annotatedGoals, icon: 'ri-user-star-fill',         bg: 'bg-amber-400',   text: 'text-gray-900',    sub: 'text-gray-700' },
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

      {/* Category breakdown chart */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-bar-chart-2-line text-yellow-500"></i>
            Goals by Category
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map(({ cat, count }) => {
              const meta = CATEGORY_META[cat];
              const pct = Math.round((count / maxCatCount) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${meta.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${meta.icon} ${meta.color} text-sm`}></i>
                  </div>
                  <span className="text-sm text-gray-700 w-32 flex-shrink-0">{cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${meta.bg.replace('bg-', 'bg-').replace('-100', '-400')}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-6 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Role filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
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

            {/* Role filter */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                <i className="ri-filter-3-line text-gray-400 text-base"></i>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white cursor-pointer appearance-none"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-gray-400"></i>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setRoleFilter('all'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-close-line"></i>
              Clear filters
            </button>
          )}
        </div>

        {/* Active filter info bar */}
        {hasActiveFilters && (
          <div className="px-5 py-2.5 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2 text-xs text-yellow-800">
            <i className="ri-information-line text-yellow-600"></i>
            Showing <span className="font-bold">{filteredMembers.length}</span> of {members.length} members
            {search && <span>· search: <span className="font-semibold">"{search}"</span></span>}
            {roleFilter !== 'all' && <span>· role: <span className="font-semibold">{roleFilter}</span></span>}
          </div>
        )}

        {/* Members table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading member goals…</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-user-search-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-sm">No members match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMembers.map((member) => {
              const memberGoals = member.goals;
              const active = memberGoals.filter((g) => g.status === 'active').length;
              const completed = memberGoals.filter((g) => g.status === 'completed').length;
              const annotated = memberGoals.filter((g) => g.mentor_notes).length;
              const allMs = memberGoals.flatMap((g) => g.milestones || []);
              const doneMs = allMs.filter((m) => m.completed).length;
              const overallPct = allMs.length > 0 ? Math.round((doneMs / allMs.length) * 100) : 0;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 font-bold text-sm">
                      {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{member.full_name}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {member.member_role}
                      </span>
                      {annotated > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <i className="ri-user-star-line"></i>{annotated} annotated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{member.email}</p>
                  </div>

                  {/* Goal counts */}
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 leading-none">{memberGoals.length}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600 leading-none">{active}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600 leading-none">{completed}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Done</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {allMs.length > 0 && (
                    <div className="hidden md:block w-28 flex-shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Steps</span>
                        <span className="text-xs font-bold text-gray-600">{overallPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all"
                          style={{ width: `${overallPct}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
