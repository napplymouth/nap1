import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';
import MonthlyHoursChart from './MonthlyHoursChart';

interface HourEntry {
  id: string;
  user_id: string;
  date: string;
  activity: string;
  hours: number;
  notes: string | null;
  flag_reason: string | null;
  status: 'pending' | 'approved' | 'flagged';
  created_at: string;
  volunteer_profiles?: {
    full_name: string;
    email: string;
    volunteer_role: string;
  };
}

interface LogFormData {
  volunteer_id: string;
  date: string;
  activity: string;
  hours: string;
  notes: string;
}

interface ApprovedVolunteer {
  user_id: string;
  full_name: string;
  email: string;
  volunteer_role: string;
}

const EMPTY_FORM: LogFormData = {
  volunteer_id: '',
  date: '',
  activity: '',
  hours: '',
  notes: '',
};

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: 'ri-time-line',
    classes: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
  },
  approved: {
    label: 'Approved',
    icon: 'ri-check-line',
    classes: 'bg-lime-50 border border-lime-200 text-lime-700',
  },
  flagged: {
    label: 'Flagged',
    icon: 'ri-flag-line',
    classes: 'bg-red-50 border border-red-200 text-red-600',
  },
};

interface HoursManagerProps {
  adminId: string;
  adminName: string;
}

export default function HoursManager({ adminId, adminName }: HoursManagerProps) {
  const [entries, setEntries] = useState<HourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<ApprovedVolunteer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HourEntry | null>(null);
  const [formData, setFormData] = useState<LogFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<HourEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState('');
  const [filterVolunteer, setFilterVolunteer] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [flagModal, setFlagModal] = useState<{ entry: HourEntry } | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSaving, setFlagSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);
  const [summaryVolunteerId, setSummaryVolunteerId] = useState('');
  const [sendingSummary, setSendingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{ sent: boolean; totalHours?: number; email?: string } | null>(null);

  // Send Summary to All state
  const [sendAllModal, setSendAllModal] = useState(false);
  const [sendAllProgress, setSendAllProgress] = useState<{
    status: 'idle' | 'running' | 'done';
    total: number;
    sent: number;
    failed: number;
    errors: string[];
    failedVolunteers: ApprovedVolunteer[];
  }>({ status: 'idle', total: 0, sent: 0, failed: 0, errors: [], failedVolunteers: [] });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hoursRes, volRes] = await Promise.all([
        supabase
          .from('volunteer_hours')
          .select(`
            id,
            user_id,
            date,
            activity,
            hours,
            notes,
            status,
            created_at,
            volunteer_profiles (
              full_name,
              email,
              volunteer_role
            )
          `)
          .order('date', { ascending: false }),
        supabase
          .from('volunteer_profiles')
          .select('user_id, full_name, email, volunteer_role')
          .eq('approval_status', 'approved')
          .order('full_name', { ascending: true }),
      ]);

      if (hoursRes.error) throw hoursRes.error;
      if (volRes.error) throw volRes.error;

      setEntries((hoursRes.data || []) as unknown as HourEntry[]);
      setVolunteers((volRes.data || []) as ApprovedVolunteer[]);
    } catch {
      showToast('error', 'Failed to load hours data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (entry: HourEntry) => {
    setEditingEntry(entry);
    setFormData({
      volunteer_id: entry.user_id,
      date: entry.date,
      activity: entry.activity,
      hours: String(entry.hours),
      notes: entry.notes || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(formData.hours);
    if (!formData.volunteer_id || !formData.date || !formData.activity.trim() || isNaN(hoursNum) || hoursNum <= 0) {
      showToast('error', 'Please fill in all required fields with valid values.');
      return;
    }
    if (hoursNum > 24) {
      showToast('error', 'Hours cannot exceed 24 per entry.');
      return;
    }
    setSaving(true);
    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('volunteer_hours')
          .update({
            user_id: formData.volunteer_id,
            date: formData.date,
            activity: formData.activity.trim(),
            hours: hoursNum,
            notes: formData.notes.trim() || null,
          })
          .eq('id', editingEntry.id);
        if (error) throw error;
        showToast('success', 'Hours entry updated successfully!');
      } else {
        const { error } = await supabase
          .from('volunteer_hours')
          .insert({
            user_id: formData.volunteer_id,
            date: formData.date,
            activity: formData.activity.trim(),
            hours: hoursNum,
            notes: formData.notes.trim() || null,
            status: 'approved',
          });
        if (error) throw error;
        showToast('success', 'Hours logged successfully!');
      }
      closeForm();
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const volunteerName = deleteConfirm.volunteer_profiles?.full_name || 'Unknown';
      const entryDetails = `${deleteConfirm.hours}h - ${deleteConfirm.activity}`;

      const { error } = await supabase
        .from('volunteer_hours')
        .delete()
        .eq('id', deleteConfirm.id);
      if (error) throw error;

      // Log the deletion
      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'hours_deleted',
        target_name: volunteerName,
        target_id: deleteConfirm.user_id,
        details: entryDetails,
      });

      showToast('success', 'Entry deleted.');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete entry.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (entryId: string, newStatus: 'approved' | 'rejected' | 'flagged' | 'pending', flagReasonText?: string) => {
    setUpdatingStatus(entryId);
    try {
      const updatePayload: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'flagged' && flagReasonText !== undefined) {
        updatePayload.flag_reason = flagReasonText.trim() || null;
      }
      if (newStatus === 'approved' || newStatus === 'pending') {
        updatePayload.flag_reason = null;
      }

      const { error } = await supabase
        .from('volunteer_hours')
        .update(updatePayload)
        .eq('id', entryId);

      if (error) throw error;

      // Send approval email notification (non-blocking)
      if (newStatus === 'approved') {
        try {
          await supabase.functions.invoke('notify-approved-hours', {
            body: { entryId }
          });
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }

      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openFlagModal = (entry: HourEntry) => {
    setFlagReason(entry.flag_reason || '');
    setFlagModal({ entry });
  };

  const closeFlagModal = () => {
    setFlagModal(null);
    setFlagReason('');
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModal) return;
    setFlagSaving(true);
    await handleStatusChange(flagModal.entry.id, 'flagged', flagReason);

    // Send email notification to the volunteer
    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      await fetch(`${supabaseUrl}/functions/v1/notify-flagged-hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: flagModal.entry.id,
          flagReason: flagReason.trim() || null,
        }),
      });
    } catch {
      // Non-blocking — email failure shouldn't prevent the flag from saving
    }

    setFlagSaving(false);
    closeFlagModal();
  };

  // Filtered entries
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.volunteer_profiles?.full_name?.toLowerCase().includes(q) ||
      e.volunteer_profiles?.email?.toLowerCase().includes(q) ||
      e.activity?.toLowerCase().includes(q);
    const matchVol = !filterVolunteer || e.user_id === filterVolunteer;
    const matchMonth = !filterMonth || e.date?.startsWith(filterMonth);
    const matchStatus = !filterStatus || e.status === filterStatus;
    const matchFrom = !dateFrom || e.date >= dateFrom;
    const matchTo = !dateTo || e.date <= dateTo;
    return matchSearch && matchVol && matchMonth && matchStatus && matchFrom && matchTo;
  });

  // Stats
  const approvedEntries = entries.filter((e) => e.status === 'approved');
  const totalHours = approvedEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  const filteredHours = filtered
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + Number(e.hours), 0);
  const pendingCount = entries.filter((e) => e.status === 'pending').length;
  const flaggedCount = entries.filter((e) => e.status === 'flagged').length;

  // Per-volunteer totals for leaderboard (approved only)
  const volunteerTotals = volunteers
    .map((v) => ({
      ...v,
      total: approvedEntries
        .filter((e) => e.user_id === v.user_id)
        .reduce((sum, e) => sum + Number(e.hours), 0),
    }))
    .filter((v) => v.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Unique months for filter
  const months = Array.from(
    new Set(entries.map((e) => e.date?.slice(0, 7)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const exportCSV = () => {
    const headers = ['Volunteer Name', 'Email', 'Role', 'Activity', 'Date', 'Hours', 'Status', 'Notes', 'Flag Reason'];
    const rows = filtered.map((e) => [
      e.volunteer_profiles?.full_name || '',
      e.volunteer_profiles?.email || '',
      e.volunteer_profiles?.volunteer_role || '',
      e.activity,
      e.date,
      e.hours,
      e.status,
      e.notes || '',
      e.flag_reason || '',
    ]);

    const escape = (val: string | number) => {
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const rangeStr = dateFrom && dateTo
      ? `${dateFrom}_to_${dateTo}`
      : dateFrom
      ? `from_${dateFrom}`
      : dateTo
      ? `to_${dateTo}`
      : new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `volunteer-hours-${rangeStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', `Exported ${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'} to CSV.`);
  };

  const pendingFiltered = filtered.filter((e) => e.status === 'pending');
  const allPendingSelected =
    pendingFiltered.length > 0 && pendingFiltered.every((e) => selectedIds.has(e.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingFiltered.forEach((e) => next.delete(e.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingFiltered.forEach((e) => next.add(e.id));
        return next;
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkApproving(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from('volunteer_hours')
        .update({ status: 'approved', flag_reason: null })
        .in('id', ids);
      if (error) throw error;

      // Send approval email to each volunteer (non-blocking)
      ids.forEach(async (entryId) => {
        try {
          await supabase.functions.invoke('notify-approved-hours', {
            body: { entryId }
          });
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't block the UI or show error to admin
        }
      });

      setSelectedIds(new Set());
      showToast('success', `${ids.length} ${ids.length === 1 ? 'entry' : 'entries'} approved successfully!`);
    } catch (err: any) {
      showToast('error', err?.message || 'Bulk approve failed.');
    } finally {
      setBulkApproving(false);
    }
  };

  const handleSendSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryVolunteerId) return;
    setSendingSummary(true);
    setSummaryResult(null);
    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-hours-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: summaryVolunteerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send summary');
      const vol = volunteers.find((v) => v.user_id === summaryVolunteerId);
      setSummaryResult({ sent: true, totalHours: data.totalHours, email: vol?.email });
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to send summary email.');
      setSendingSummary(false);
    } finally {
      setSendingSummary(false);
    }
  };

  const closeSummaryModal = () => {
    setSummaryModal(false);
    setSummaryVolunteerId('');
    setSummaryResult(null);
  };

  const handleSendSummaryToAll = async () => {
    if (volunteers.length === 0) return;
    setSendAllProgress({ status: 'running', total: volunteers.length, sent: 0, failed: 0, errors: [], failedVolunteers: [] });

    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const failedVolunteers: ApprovedVolunteer[] = [];

    for (const vol of volunteers) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-hours-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: vol.user_id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        sent += 1;
      } catch (err: any) {
        failed += 1;
        errors.push(`${vol.full_name}: ${err?.message || 'Unknown error'}`);
        failedVolunteers.push(vol);
      }
      setSendAllProgress((prev) => ({ ...prev, sent, failed, errors: [...errors], failedVolunteers: [...failedVolunteers] }));
    }

    setSendAllProgress({ status: 'done', total: volunteers.length, sent, failed, errors, failedVolunteers });
  };

  const handleResendFailed = async () => {
    const failedList = sendAllProgress.failedVolunteers;
    if (failedList.length === 0) return;

    setSendAllProgress((prev) => ({
      ...prev,
      status: 'running',
      total: failedList.length,
      sent: 0,
      failed: 0,
      errors: [],
      failedVolunteers: [],
    }));

    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const newFailedVolunteers: ApprovedVolunteer[] = [];

    for (const vol of failedList) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-hours-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: vol.user_id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        sent += 1;
      } catch (err: any) {
        failed += 1;
        errors.push(`${vol.full_name}: ${err?.message || 'Unknown error'}`);
        newFailedVolunteers.push(vol);
      }
      setSendAllProgress((prev) => ({
        ...prev,
        sent,
        failed,
        errors: [...errors],
        failedVolunteers: [...newFailedVolunteers],
      }));
    }

    setSendAllProgress({
      status: 'done',
      total: failedList.length,
      sent,
      failed,
      errors,
      failedVolunteers: newFailedVolunteers,
    });
  };

  const closeSendAllModal = () => {
    setSendAllModal(false);
    setSendAllProgress({ status: 'idle', total: 0, sent: 0, failed: 0, errors: [], failedVolunteers: [] });
  };

  return (
    <div className="relative">
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-fill text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Entry?</h3>
            <p className="text-gray-600 text-sm text-center mb-1">
              <span className="font-semibold">{deleteConfirm.activity}</span>
            </p>
            <p className="text-gray-500 text-xs text-center mb-6">
              {Number(deleteConfirm.hours)} hrs · {formatDate(deleteConfirm.date)} · {deleteConfirm.volunteer_profiles?.full_name}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
              >
                {deleting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-delete-bin-line"></i>}
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Reason Modal */}
      {flagModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-flag-fill text-red-500 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Flag Entry</h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {flagModal.entry.activity} — {flagModal.entry.volunteer_profiles?.full_name}
                </p>
              </div>
            </div>
            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Reason for flagging <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="e.g. Hours seem inconsistent with the event duration, please clarify…"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 text-sm transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{flagReason.length}/500</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <i className="ri-information-line text-red-400 text-sm mt-0.5 flex-shrink-0"></i>
                <p className="text-xs text-red-600">
                  The volunteer will see this reason in their dashboard so they know what to address.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeFlagModal}
                  disabled={flagSaving}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flagSaving}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                >
                  {flagSaving ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-flag-fill"></i>
                  )}
                  {flagSaving ? 'Flagging…' : 'Flag Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Summary Modal */}
      {summaryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            {summaryResult?.sent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-mail-check-fill text-lime-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Summary Sent!</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Email delivered to <span className="font-bold text-gray-800">{summaryResult.email}</span>
                </p>
                {summaryResult.totalHours !== undefined && (
                  <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 font-black text-sm px-4 py-2 rounded-full mt-3">
                    <i className="ri-time-fill"></i>
                    {Number(summaryResult.totalHours) % 1 === 0
                      ? summaryResult.totalHours
                      : Number(summaryResult.totalHours).toFixed(1)} approved hrs included
                  </div>
                )}
                <button
                  onClick={closeSummaryModal}
                  className="mt-6 w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-mail-send-fill text-yellow-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Send Hours Summary</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Email a volunteer their full approved hours breakdown</p>
                  </div>
                </div>
                <form onSubmit={handleSendSummary} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Select Volunteer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={summaryVolunteerId}
                      onChange={(e) => setSummaryVolunteerId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white"
                      required
                    >
                      <option value="">Choose a volunteer…</option>
                      {volunteers.map((v) => {
                        const approvedHrs = approvedEntries
                          .filter((e) => e.user_id === v.user_id)
                          .reduce((sum, e) => sum + Number(e.hours), 0);
                        return (
                          <option key={v.user_id} value={v.user_id}>
                            {v.full_name} — {approvedHrs % 1 === 0 ? approvedHrs : approvedHrs.toFixed(1)} approved hrs
                          </option>
                        );
                      })}
                    </select>
                    {volunteers.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">No approved volunteers found.</p>
                    )}
                  </div>

                  {summaryVolunteerId && (() => {
                    const vol = volunteers.find((v) => v.user_id === summaryVolunteerId);
                    const hrs = approvedEntries
                      .filter((e) => e.user_id === summaryVolunteerId)
                      .reduce((sum, e) => sum + Number(e.hours), 0);
                    return vol ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-gray-900 text-sm flex-shrink-0">
                          {vol.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{vol.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{vol.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-gray-900 text-sm">{hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h</p>
                          <p className="text-xs text-gray-400">approved</p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                    <i className="ri-information-line text-yellow-600 text-sm mt-0.5 flex-shrink-0"></i>
                    <p className="text-xs text-yellow-800">
                      The email will include a full monthly breakdown breakdown all approved hours and a total count.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeSummaryModal}
                      disabled={sendingSummary}
                      className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingSummary || !summaryVolunteerId}
                      className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {sendingSummary ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-mail-send-line"></i>
                      )}
                      {sendingSummary ? 'Sending…' : 'Send Summary'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Send Summary to All Modal */}
      {sendAllModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            {sendAllProgress.status === 'idle' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-mail-send-fill text-yellow-400 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Send Summary to All</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Email every approved volunteer their hours breakdown</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700">Recipients</span>
                    <span className="text-sm font-black text-gray-900">{volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {volunteers.map((v) => {
                      const hrs = approvedEntries
                        .filter((e) => e.user_id === v.user_id)
                        .reduce((sum, e) => sum + Number(e.hours), 0);
                      return (
                        <div key={v.user_id} className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center font-black text-gray-900 text-xs flex-shrink-0">
                            {v.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 flex-1 truncate">{v.full_name}</span>
                          <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                            {hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {volunteers.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">No approved volunteers found.</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2 mb-6">
                  <i className="ri-information-line text-yellow-600 text-sm mt-0.5 flex-shrink-0"></i>
                  <p className="text-xs text-yellow-800">
                    Each volunteer will receive a personalised email with their full monthly breakdown and total approved hours.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeSendAllModal}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendSummaryToAll}
                    disabled={volunteers.length === 0}
                    className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <i className="ri-send-plane-fill"></i>
                    Send to All {volunteers.length > 0 && `(${volunteers.length})`}
                  </button>
                </div>
              </>
            )}

            {sendAllProgress.status === 'running' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-mail-send-fill text-yellow-600 text-3xl animate-pulse"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Sending Summaries…</h3>
                <p className="text-sm text-gray-500 mb-6">Please don't close this window.</p>

                {/* Progress bar */}
                <div className="bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${sendAllProgress.total > 0 ? ((sendAllProgress.sent + sendAllProgress.failed) / sendAllProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-sm font-bold text-gray-700 mb-4">
                  {sendAllProgress.sent + sendAllProgress.failed} / {sendAllProgress.total} processed
                </p>

                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-lime-600">{sendAllProgress.sent}</p>
                    <p className="text-xs text-gray-500 font-semibold">Sent</p>
                  </div>
                  {sendAllProgress.failed > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-black text-red-500">{sendAllProgress.failed}</p>
                      <p className="text-xs text-gray-500 font-semibold">Failed</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sendAllProgress.status === 'done' && (
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${sendAllProgress.failed === 0 ? 'bg-lime-100' : 'bg-yellow-100'}`}>
                  <i className={`text-3xl ${sendAllProgress.failed === 0 ? 'ri-mail-check-fill text-lime-600' : 'ri-mail-send-fill text-yellow-600'}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {sendAllProgress.failed === 0 ? 'All Summaries Sent!' : 'Sending Complete'}
                </h3>

                <div className="flex justify-center gap-6 mb-5">
                  <div className="text-center">
                    <p className="text-3xl font-black text-lime-600">{sendAllProgress.sent}</p>
                    <p className="text-xs text-gray-500 font-semibold">Successfully Sent</p>
                  </div>
                  {sendAllProgress.failed > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-black text-red-500">{sendAllProgress.failed}</p>
                      <p className="text-xs text-gray-500 font-semibold">Failed</p>
                    </div>
                  )}
                </div>

                {sendAllProgress.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-left max-h-32 overflow-y-auto">
                    <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
                      <i className="ri-error-warning-line"></i>
                      Failed recipients:
                    </p>
                    {sendAllProgress.failedVolunteers.map((vol) => (
                      <div key={vol.user_id} className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center font-black text-red-700 text-xs flex-shrink-0">
                          {vol.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-bold text-red-700 truncate">{vol.full_name}</p>
                          <p className="text-xs text-red-500 truncate">{vol.email}</p>
                        </div>
                      </div>
                    ))}
                    {sendAllProgress.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-500 mt-1 pl-8">{err.split(': ').slice(1).join(': ')}</p>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {sendAllProgress.failed > 0 && (
                    <button
                      onClick={handleResendFailed}
                      className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                    >
                      <i className="ri-refresh-line text-base"></i>
                      Resend Failed ({sendAllProgress.failed})
                    </button>
                  )}
                  <button
                    onClick={closeSendAllModal}
                    className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Hours Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Hours Entry' : 'Log Volunteer Hours'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingEntry ? 'Update the details below.' : 'Record hours for a volunteer.'}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-500"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Volunteer <span className="text-red-500">*</span>
                </label>
                <select
                  name="volunteer_id"
                  value={formData.volunteer_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white"
                  required
                >
                  <option value="">Select a volunteer…</option>
                  {volunteers.map((v) => (
                    <option key={v.user_id} value={v.user_id}>
                      {v.full_name} — {v.volunteer_role}
                    </option>
                  ))}
                </select>
                {volunteers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No approved volunteers found.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    max={today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    min="0.5"
                    max="24"
                    step="0.5"
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Activity / Task <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  placeholder="e.g. Naloxone distribution, Community outreach…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes…"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.notes.length}/500</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-bold text-sm text-gray-900 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className={editingEntry ? 'ri-save-line' : 'ri-time-fill'}></i>
                  )}
                  {saving ? 'Saving…' : editingEntry ? 'Save Changes' : 'Log Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Hours</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review, approve, or flag hours submitted by volunteers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSendAllModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md"
            title="Email every approved volunteer their hours summary"
          >
            <i className="ri-send-plane-fill text-lg"></i>
            Send Summary to All
            {volunteers.length > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {volunteers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSummaryModal(true)}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-5 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            title="Send a volunteer their approved hours summary by email"
          >
            <i className="ri-mail-send-line text-lg"></i>
            Send Summary
          </button>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-5 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            title={filtered.length === 0 ? 'No entries to export' : `Export ${filtered.length} entries as CSV`}
          >
            <i className="ri-download-2-line text-lg"></i>
            Export CSV
            {(search || filterVolunteer || filterMonth || filterStatus || dateFrom || dateTo) && filtered.length > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </button>
          <button
            onClick={openCreate}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md"
          >
            <i className="ri-add-circle-fill text-lg"></i>
            Log Hours
          </button>
        </div>
      </div>

      {/* Pending / Flagged Alert Banner */}
      {(pendingCount > 0 || flaggedCount > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingCount > 0 && (
            <button
              onClick={() => setFilterStatus('pending')}
              className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-5 py-3 rounded-xl font-bold text-sm hover:bg-yellow-100 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-time-line text-yellow-500 text-base"></i>
              {pendingCount} pending {pendingCount === 1 ? 'entry' : 'entries'} awaiting review
              <i className="ri-arrow-right-s-line"></i>
            </button>
          )}
          {flaggedCount > 0 && (
            <button
              onClick={() => setFilterStatus('flagged')}
              className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-flag-line text-red-500 text-base"></i>
              {flaggedCount} flagged {flaggedCount === 1 ? 'entry' : 'entries'}
              <i className="ri-arrow-right-s-line"></i>
            </button>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Approved Hours',
            value: totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1),
            icon: 'ri-time-fill',
            bg: 'bg-gray-900',
            text: 'text-white',
            sub: 'text-gray-400',
          },
          {
            label: 'Pending Review',
            value: pendingCount,
            icon: 'ri-time-line',
            bg: pendingCount > 0 ? 'bg-yellow-400' : 'bg-yellow-100',
            text: 'text-gray-900',
            sub: 'text-gray-700',
          },
          {
            label: 'Active Volunteers',
            value: new Set(approvedEntries.map((e) => e.user_id)).size,
            icon: 'ri-user-heart-fill',
            bg: 'bg-lime-500',
            text: 'text-white',
            sub: 'text-lime-100',
          },
          {
            label: 'Flagged Entries',
            value: flaggedCount,
            icon: 'ri-flag-fill',
            bg: flaggedCount > 0 ? 'bg-red-500' : 'bg-gray-200',
            text: flaggedCount > 0 ? 'text-white' : 'text-gray-700',
            sub: flaggedCount > 0 ? 'text-red-100' : 'text-gray-500',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-0.5`}>{s.value}</div>
            <div className={`text-xs font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Hours Chart */}
      <MonthlyHoursChart entries={entries} />

      {/* Leaderboard + Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-trophy-fill text-yellow-500 text-base"></i>
            </div>
            Top Volunteers
            <span className="ml-auto text-xs text-gray-400 font-normal">approved hrs only</span>
          </h3>
          {volunteerTotals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <i className="ri-trophy-line text-3xl mb-2"></i>
              <p className="text-xs font-semibold">No approved hours yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {volunteerTotals.map((v, idx) => {
                const maxHours = volunteerTotals[0].total;
                const pct = maxHours > 0 ? (v.total / maxHours) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={v.user_id} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center flex-shrink-0">
                      {idx < 3 ? medals[idx] : <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-800 truncate">{v.full_name}</span>
                        <span className="text-xs font-black text-gray-900 ml-2 flex-shrink-0">
                          {v.total % 1 === 0 ? v.total : v.total.toFixed(1)}h
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-filter-3-fill text-gray-500 text-base"></i>
            </div>
            Filter Entries
            {(search || filterVolunteer || filterMonth || filterStatus || dateFrom || dateTo) && (
              <span className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or activity…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* Volunteer filter */}
            <select
              value={filterVolunteer}
              onChange={(e) => setFilterVolunteer(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white"
            >
              <option value="">All Volunteers</option>
              {volunteers.map((v) => (
                <option key={v.user_id} value={v.user_id}>{v.full_name}</option>
              ))}
            </select>

            {/* Month filter */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors bg-white"
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>

            {/* Date Range — From */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">From date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-calendar-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || today}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                />
                {dateFrom && (
                  <button
                    onClick={() => setDateFrom('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Date Range — To */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">To date</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-calendar-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  max={today}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                />
                {dateTo && (
                  <button
                    onClick={() => setDateTo('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active date range badge */}
          {(dateFrom || dateTo) && (
            <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-check-line text-yellow-600 text-sm"></i>
              </div>
              <span className="text-xs font-bold text-yellow-800">
                {dateFrom && dateTo
                  ? `${formatDate(dateFrom)} → ${formatDate(dateTo)}`
                  : dateFrom
                  ? `From ${formatDate(dateFrom)}`
                  : `Up to ${formatDate(dateTo)}`}
              </span>
              <span className="ml-auto text-xs text-yellow-600 font-semibold">
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          )}

          {(search || filterVolunteer || filterMonth || filterStatus || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setFilterVolunteer(''); setFilterMonth(''); setFilterStatus(''); setDateFrom(''); setDateTo(''); }}
              className="mt-3 text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <i className="ri-close-circle-line"></i>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-900 text-sm">
              Hours Log
              <span className="ml-2 text-xs font-semibold text-gray-400">
                ({filtered.length} {filtered.length === 1 ? 'entry' : 'entries'})
              </span>
            </h3>
            {filtered.length > 0 && filteredHours > 0 && (
              <span className="text-xs font-black text-gray-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
                {filteredHours % 1 === 0 ? filteredHours : filteredHours.toFixed(1)} approved hrs
              </span>
            )}
          </div>

          {/* Bulk action bar */}
          {pendingFiltered.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAllPending}
                className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap bg-white hover:bg-gray-50"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${allPendingSelected ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300'}`}>
                  {allPendingSelected && <i className="ri-check-line text-gray-900 text-xs"></i>}
                </div>
                {allPendingSelected ? 'Deselect All' : `Select All Pending (${pendingFiltered.length})`}
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                >
                  {bulkApproving ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-check-double-line text-sm"></i>
                  )}
                  {bulkApproving ? 'Approving…' : `Approve ${selectedIds.size} Selected`}
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="ri-loader-4-line text-5xl animate-spin mb-3"></i>
            <p className="font-semibold">Loading hours…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-time-line text-3xl"></i>
            </div>
            <p className="font-bold text-gray-600 text-lg">No entries found</p>
            <p className="text-sm mt-1">
              {search || filterVolunteer || filterMonth || filterStatus
                ? 'Try adjusting your filters.'
                : 'Start by logging hours for a volunteer.'}
            </p>
            {!search && !filterVolunteer && !filterMonth && !filterStatus && (
              <button
                onClick={openCreate}
                className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Log First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Volunteer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Activity</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Hours</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Notes / Flag Reason</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((entry) => {
                  const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                  const isUpdating = updatingStatus === entry.id;
                  const isPending = entry.status === 'pending';
                  const isSelected = selectedIds.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-lime-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        {isPending ? (
                          <button
                            onClick={() => toggleSelect(entry.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                              isSelected
                                ? 'bg-lime-500 border-lime-500'
                                : 'border-gray-300 hover:border-lime-400 bg-white'
                            }`}
                          >
                            {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                          </button>
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                      </td>
                      {/* Volunteer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 font-black text-gray-900 text-sm">
                            {entry.volunteer_profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {entry.volunteer_profiles?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {entry.volunteer_profiles?.volunteer_role || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Activity */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-800 font-medium">{entry.activity}</span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{formatDate(entry.date)}</span>
                      </td>
                      {/* Hours */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-800 font-black text-sm px-3 py-1 rounded-full whitespace-nowrap">
                          <i className="ri-time-fill text-xs"></i>
                          {Number(entry.hours) % 1 === 0 ? Number(entry.hours) : Number(entry.hours).toFixed(1)}h
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.classes}`}>
                            {isUpdating ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <i className={statusCfg.icon}></i>
                            )}
                            {statusCfg.label}
                          </span>
                        </div>
                      </td>
                      {/* Notes / Flag Reason */}
                      <td className="px-5 py-4 max-w-xs">
                        {entry.status === 'flagged' && entry.flag_reason ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                              <i className="ri-flag-fill text-xs"></i>
                              Flag reason:
                            </div>
                            <span className="text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg block line-clamp-2">
                              {entry.flag_reason}
                            </span>
                          </div>
                        ) : entry.notes ? (
                          <span className="text-xs text-gray-500 line-clamp-2">{entry.notes}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {entry.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(entry.id, 'approved')}
                              disabled={isUpdating}
                              className="w-8 h-8 flex items-center justify-center bg-lime-50 hover:bg-lime-100 text-lime-600 hover:text-lime-800 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              title="Approve"
                            >
                              <i className="ri-check-line text-sm"></i>
                            </button>
                          )}
                          {entry.status !== 'flagged' && (
                            <button
                              onClick={() => openFlagModal(entry)}
                              disabled={isUpdating}
                              className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              title="Flag"
                            >
                              <i className="ri-flag-line text-sm"></i>
                            </button>
                          )}
                          {entry.status === 'flagged' && (
                            <button
                              onClick={() => openFlagModal(entry)}
                              disabled={isUpdating}
                              className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              title="Edit flag reason"
                            >
                              <i className="ri-edit-line text-sm"></i>
                            </button>
                          )}
                          {entry.status !== 'pending' && (
                            <button
                              onClick={() => handleStatusChange(entry.id, 'pending')}
                              disabled={isUpdating}
                              className="w-8 h-8 flex items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              title="Set to Pending"
                            >
                              <i className="ri-time-line text-sm"></i>
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(entry)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-800 rounded-lg transition-all cursor-pointer"
                            title="Edit"
                          >
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(entry)}
                            className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody> 
            </table>
          </div>
        )}
      </div>
    </div>
  );
}