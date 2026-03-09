
import { useState, useEffect } from 'react';
import supabase from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

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

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: GoalCategory[] = [
  'Recovery', 'Mental Health', 'Housing', 'Employment',
  'Relationships', 'Physical Health', 'Education', 'Other',
];

const CATEGORY_META: Record<GoalCategory, { icon: string; color: string; bg: string }> = {
  Recovery:        { icon: 'ri-heart-pulse-line',    color: 'text-rose-600',    bg: 'bg-rose-100' },
  'Mental Health': { icon: 'ri-mental-health-line',  color: 'text-violet-600',  bg: 'bg-violet-100' },
  Housing:         { icon: 'ri-home-heart-line',     color: 'text-amber-600',   bg: 'bg-amber-100' },
  Employment:      { icon: 'ri-briefcase-line',      color: 'text-teal-600',    bg: 'bg-teal-100' },
  Relationships:   { icon: 'ri-group-line',          color: 'text-pink-600',    bg: 'bg-pink-100' },
  'Physical Health':{ icon: 'ri-run-line',           color: 'text-lime-600',    bg: 'bg-lime-100' },
  Education:       { icon: 'ri-graduation-cap-line', color: 'text-yellow-600',  bg: 'bg-yellow-100' },
  Other:           { icon: 'ri-star-line',           color: 'text-gray-600',    bg: 'bg-gray-100' },
};

const STATUS_META: Record<GoalStatus, { label: string; color: string; dot: string }> = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  paused:    { label: 'Paused',    color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
};

const PRIORITY_META: Record<GoalPriority, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'text-rose-600 bg-rose-50 border-rose-200' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-5">
        <i className="ri-flag-2-line text-rose-400 text-4xl"></i>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No goals yet</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
        Start logging what you're working on with your mentor. Goals help you track progress and celebrate wins.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer"
      >
        Add Your First Goal
      </button>
    </div>
  );
}

interface MilestoneListProps {
  milestones: Milestone[];
  onToggle: (m: Milestone) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
  saving: boolean;
}

function MilestoneList({ milestones, onToggle, onDelete, onAdd, saving }: MilestoneListProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    onAdd(t);
    setNewTitle('');
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Steps / Milestones</p>
      {milestones.map((m) => (
        <div key={m.id} className="flex items-center gap-3 group">
          <button
            onClick={() => onToggle(m)}
            disabled={saving}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
              m.completed
                ? 'bg-yellow-400 border-yellow-400'
                : 'border-gray-300 hover:border-yellow-400'
            }`}
          >
            {m.completed && <i className="ri-check-line text-white text-xs"></i>}
          </button>
          <span className={`flex-1 text-sm ${m.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {m.title}
          </span>
          <button
            onClick={() => onDelete(m.id)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a step..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim() || saving}
          className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (g: Goal) => void;
  onToggleMilestone: (m: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onAddMilestone: (goalId: string, title: string) => void;
  saving: boolean;
}

function GoalCard({
  goal, onEdit, onDelete, onToggleComplete,
  onToggleMilestone, onDeleteMilestone, onAddMilestone, saving,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[goal.category];
  const status = STATUS_META[goal.status];
  const priority = PRIORITY_META[goal.priority];
  const milestones = goal.milestones || [];
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
  const isOverdue = goal.target_date && goal.status === 'active' && new Date(goal.target_date) < new Date();

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      goal.status === 'completed' ? 'border-yellow-200 opacity-80' : 'border-gray-200 hover:shadow-md'
    }`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Category icon */}
          <div className={`w-11 h-11 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <i className={`${cat.icon} ${cat.color} text-xl`}></i>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
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
                </div>
                <h3 className={`font-bold text-gray-900 text-base leading-snug ${goal.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {goal.title}
                </h3>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onToggleComplete(goal)}
                  title={goal.status === 'completed' ? 'Mark as active' : 'Mark as completed'}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    goal.status === 'completed'
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                  }`}
                >
                  <i className={goal.status === 'completed' ? 'ri-refresh-line' : 'ri-check-line'}></i>
                </button>
                <button
                  onClick={() => onEdit(goal)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 transition-all cursor-pointer"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            {/* Description */}
            {goal.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{goal.description}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
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
              <span className="flex items-center gap-1">
                <i className="ri-time-line"></i>
                Added {new Date(goal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Progress bar */}
            {milestones.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{completedCount} of {milestones.length} steps done</span>
                  <span className="text-xs font-bold text-gray-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Mentor notes */}
            {goal.mentor_notes && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <i className="ri-user-star-line text-amber-600 text-sm flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-0.5">Mentor Note</p>
                  <p className="text-xs text-amber-800 leading-relaxed">{goal.mentor_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-all cursor-pointer py-1"
        >
          <span>{expanded ? 'Hide steps' : `${milestones.length > 0 ? `${milestones.length} step${milestones.length !== 1 ? 's' : ''}` : 'Add steps'}`}</span>
          <i className={`${expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-base`}></i>
        </button>
      </div>

      {/* Milestones panel */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <MilestoneList
            milestones={milestones}
            onToggle={onToggleMilestone}
            onDelete={onDeleteMilestone}
            onAdd={(title) => onAddMilestone(goal.id, title)}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

// ─── Goal Form Modal ──────────────────────────────────────────────────────────

interface GoalFormProps {
  initial?: Partial<Goal>;
  onSave: (data: Partial<Goal>) => void;
  onClose: () => void;
  saving: boolean;
}

function GoalFormModal({ initial, onSave, onClose, saving }: GoalFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState<GoalCategory>(initial?.category || 'Recovery');
  const [priority, setPriority] = useState<GoalPriority>(initial?.priority || 'medium');
  const [status, setStatus] = useState<GoalStatus>(initial?.status || 'active');
  const [targetDate, setTargetDate] = useState(initial?.target_date || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() || null, category, priority, status, target_date: targetDate || null });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{initial?.id ? 'Edit Goal' : 'Add New Goal'}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
            <i className="ri-close-line text-gray-600 text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stay clean for 30 days"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does achieving this goal look like for you?"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Status & Target Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PeerProgressTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | GoalStatus>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | GoalCategory>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('peer_support_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('peer_support_milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (milestonesError) throw milestonesError;

      const enriched = (goalsData || []).map((g: Goal) => ({
        ...g,
        milestones: (milestonesData || []).filter((m: Milestone) => m.goal_id === g.id),
      }));

      setGoals(enriched);
    } catch (err) {
      console.error('Error fetching goals:', err);
      showToast('Failed to load goals. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, [user]);

  // ── Toast helper ───────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Goal CRUD ──────────────────────────────────────────────────────────────

  const handleSaveGoal = async (data: Partial<Goal>) => {
    if (!user) return;
    setSaving(true);
    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('peer_support_goals')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingGoal.id);
        if (error) throw error;
        showToast('Goal updated!', 'success');
      } else {
        const { error } = await supabase
          .from('peer_support_goals')
          .insert({ ...data, user_id: user.id });
        if (error) throw error;
        showToast('Goal added!', 'success');
      }
      setShowForm(false);
      setEditingGoal(null);
      await fetchGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      showToast('Failed to save goal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('peer_support_milestones').delete().eq('goal_id', id);
      const { error } = await supabase.from('peer_support_goals').delete().eq('id', id);
      if (error) throw error;
      showToast('Goal removed.', 'success');
      setDeleteConfirm(null);
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      showToast('Failed to delete goal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    setSaving(true);
    try {
      const newStatus: GoalStatus = goal.status === 'completed' ? 'active' : 'completed';
      const { error } = await supabase
        .from('peer_support_goals')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id);
      if (error) throw error;
      showToast(newStatus === 'completed' ? '🎉 Goal completed!' : 'Goal marked as active.', 'success');
      await fetchGoals();
    } catch (err) {
      console.error('Error toggling goal:', err);
      showToast('Failed to update goal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Milestone CRUD ─────────────────────────────────────────────────────────

  const handleToggleMilestone = async (m: Milestone) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('peer_support_milestones')
        .update({
          completed: !m.completed,
          completed_at: !m.completed ? new Date().toISOString() : null,
        })
        .eq('id', m.id);
      if (error) throw error;
      await fetchGoals();
    } catch (err) {
      console.error('Error toggling milestone:', err);
      showToast('Failed to update step.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('peer_support_milestones').delete().eq('id', id);
      if (error) throw error;
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting milestone:', err);
      showToast('Failed to remove step.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMilestone = async (goalId: string, title: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('peer_support_milestones')
        .insert({ goal_id: goalId, user_id: user.id, title, completed: false });
      if (error) throw error;
      await fetchGoals();
    } catch (err) {
      console.error('Error adding milestone:', err);
      showToast('Failed to add step.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const allMilestones = goals.flatMap((g) => g.milestones || []);
  const completedMilestones = allMilestones.filter((m) => m.completed).length;
  const overallProgress = allMilestones.length > 0
    ? Math.round((completedMilestones / allMilestones.length) * 100)
    : 0;

  // ── Filtered goals ─────────────────────────────────────────────────────────

  const filteredGoals = goals.filter((g) => {
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchCat = filterCategory === 'all' || g.category === filterCategory;
    return matchStatus && matchCat;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <i className={toast.type === 'success' ? 'ri-check-double-line' : 'ri-error-warning-line'}></i>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete this goal?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">All steps linked to this goal will also be removed. This can't be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer">Cancel</button>
              <button onClick={() => handleDeleteGoal(deleteConfirm)} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal form modal */}
      {(showForm || editingGoal) && (
        <GoalFormModal
          initial={editingGoal || undefined}
          onSave={handleSaveGoal}
          onClose={() => { setShowForm(false); setEditingGoal(null); }}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-flag-2-line text-pink-500"></i>
            Peer Support Progress
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track the goals and steps you're working on with your mentor</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-sm transition-all whitespace-nowrap cursor-pointer shadow-sm"
        >
          <i className="ri-add-line"></i>
          Add Goal
        </button>
      </div>

      {/* Stats strip */}
      {totalGoals > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Goals',       value: totalGoals,          icon: 'ri-flag-2-line',        bg: 'bg-gray-100',    text: 'text-gray-700' },
            { label: 'Active',            value: activeGoals,         icon: 'ri-play-circle-line',   bg: 'bg-green-100',   text: 'text-green-700' },
            { label: 'Completed',         value: completedGoals,      icon: 'ri-trophy-line',        bg: 'bg-yellow-100',  text: 'text-yellow-700' },
            { label: 'Steps Done',        value: `${completedMilestones}/${allMilestones.length}`, icon: 'ri-checkbox-circle-line', bg: 'bg-pink-100', text: 'text-pink-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${s.icon} ${s.text} text-lg`}></i>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall progress bar */}
      {allMilestones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{completedMilestones} of {allMilestones.length} steps completed across all goals</p>
        </div>
      )}

      {/* Filters */}
      {totalGoals > 0 && (
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'paused'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {s === 'all' ? 'All Goals' : STATUS_META[s].label}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1 self-stretch"></div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as 'all' | GoalCategory)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-600 focus:outline-none focus:border-yellow-400 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Goal list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading your goals...</p>
        </div>
      ) : filteredGoals.length === 0 && totalGoals === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">No goals match your current filters.</p>
          <button onClick={() => { setFilterStatus('all'); setFilterCategory('all'); }} className="mt-3 text-sm text-yellow-600 font-semibold hover:text-yellow-700 cursor-pointer">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => setEditingGoal(g)}
              onDelete={(id) => setDeleteConfirm(id)}
              onToggleComplete={handleToggleComplete}
              onToggleMilestone={handleToggleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onAddMilestone={handleAddMilestone}
              saving={saving}
            />
          ))}
        </div>
      )}

      {/* Mentor note callout */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-100 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-user-star-line text-amber-600 text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 mb-1">Working with a mentor?</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Share this tracker with your peer mentor so they can add notes and help you stay on track. Your mentor can also add goals on your behalf during your sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
