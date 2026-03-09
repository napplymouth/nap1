import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface KitRequest {
  id: string;
  user_id: string;
  status: string;
  notes: string | null;
  requested_at: string;
  updated_at: string;
  member?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'dispatched' | 'collected' | 'declined';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string; step: number }> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'ri-time-fill',             step: 0 },
  approved:   { label: 'Approved',   bg: 'bg-lime-100',   text: 'text-lime-700',   icon: 'ri-checkbox-circle-fill',  step: 1 },
  dispatched: { label: 'Dispatched', bg: 'bg-sky-100',    text: 'text-sky-700',    icon: 'ri-truck-fill',            step: 2 },
  collected:  { label: 'Collected',  bg: 'bg-green-100',  text: 'text-green-700',  icon: 'ri-hand-heart-fill',       step: 3 },
  declined:   { label: 'Declined',   bg: 'bg-red-100',    text: 'text-red-600',    icon: 'ri-close-circle-fill',     step: -1 },
};

const STEPS = ['Requested', 'Approved', 'Dispatched', 'Collected'];
const STATUS_OPTIONS = ['pending', 'approved', 'dispatched', 'collected', 'declined'];

export default function NaloxoneKitManager() {
  const [requests, setRequests] = useState<KitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<KitRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendEmail, setSendEmail] = useState(true);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data: kitData, error } = await supabase
        .from('naloxone_kit_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const rows = (kitData || []) as KitRequest[];

      // Fetch member profiles for each request
      const userIds = [...new Set(rows.map((r) => r.user_id))];
      let memberMap: Record<string, { full_name: string; email: string; phone?: string }> = {};

      if (userIds.length > 0) {
        const { data: memberData } = await supabase
          .from('member_profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', userIds);

        (memberData || []).forEach((m: any) => {
          memberMap[m.user_id] = { full_name: m.full_name, email: m.email, phone: m.phone };
        });
      }

      const enriched = rows.map((r) => ({ ...r, member: memberMap[r.user_id] }));
      setRequests(enriched);
    } catch {
      showToast('error', 'Failed to load kit requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const openDetail = (req: KitRequest) => {
    setSelected(req);
    setNewStatus(req.status);
    setAdminNote(req.notes || '');
    setSendEmail(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('naloxone_kit_requests')
        .update({
          status: newStatus,
          notes: adminNote || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id);

      if (error) throw error;

      // Send email notification if status changed and opted in
      if (sendEmail && newStatus !== selected.status && selected.member?.email) {
        try {
          await fetch(
            'https://tvbmcdfbmjhgghqnvufx.supabase.co/functions/v1/notify-kit-status',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                memberName: selected.member.full_name,
                memberEmail: selected.member.email,
                status: newStatus,
                adminNote: adminNote || null,
                requestId: selected.id,
              }),
            }
          );
        } catch {
          // Non-blocking — don't fail the whole update if email fails
        }
      }

      showToast('success', sendEmail && newStatus !== selected.status ? 'Status updated & member notified by email.' : 'Kit request updated successfully.');
      setSelected(null);
      await loadRequests();
    } catch {
      showToast('error', 'Failed to update request.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.member?.full_name?.toLowerCase().includes(q) ||
      r.member?.email?.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const countBy = (s: string) => requests.filter((r) => r.status === s).length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', icon: 'ri-question-line' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        <i className={cfg.icon}></i>
        {cfg.label}
      </span>
    );
  };

  const ProgressTracker = ({ status }: { status: string }) => {
    const currentStep = STATUS_CONFIG[status]?.step ?? 0;
    const isDeclined = status === 'declined';
    return (
      <div className="flex items-center gap-0 w-full">
        {STEPS.map((step, idx) => {
          const done = !isDeclined && currentStep >= idx;
          const active = !isDeclined && currentStep === idx;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? active
                      ? 'bg-lime-500 text-white ring-4 ring-lime-200'
                      : 'bg-lime-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {done && !active ? <i className="ri-check-line text-sm"></i> : idx + 1}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${done ? 'text-lime-600' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded-full mb-4 ${!isDeclined && currentStep > idx ? 'bg-lime-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Naloxone Kit Requests</h1>
        <p className="text-gray-500 text-sm">Review, approve, and track all naloxone kit requests from community members.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total',      value: requests.length,        bg: 'bg-gray-900',   text: 'text-white',       sub: 'text-gray-400',   icon: 'ri-first-aid-kit-fill' },
          { label: 'Pending',    value: countBy('pending'),      bg: 'bg-yellow-400', text: 'text-gray-900',    sub: 'text-gray-700',   icon: 'ri-time-fill' },
          { label: 'Approved',   value: countBy('approved'),     bg: 'bg-lime-500',   text: 'text-white',       sub: 'text-lime-100',   icon: 'ri-checkbox-circle-fill' },
          { label: 'Dispatched', value: countBy('dispatched'),   bg: 'bg-sky-500',    text: 'text-white',       sub: 'text-sky-100',    icon: 'ri-truck-fill' },
          { label: 'Collected',  value: countBy('collected'),    bg: 'bg-green-600',  text: 'text-white',       sub: 'text-green-100',  icon: 'ri-hand-heart-fill' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-md`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-1`}>{s.value}</div>
            <div className={`text-xs font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {countBy('pending') > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-notification-3-fill text-gray-900 text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-yellow-800 text-sm">
              {countBy('pending')} kit request{countBy('pending') > 1 ? 's' : ''} awaiting review
            </p>
            <p className="text-yellow-700 text-xs mt-0.5">
              Review and approve or decline each request below.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all cursor-pointer whitespace-nowrap"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {(['all', 'pending', 'approved', 'dispatched', 'collected', 'declined'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap capitalize ${
                  statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? `All (${requests.length})` : `${STATUS_CONFIG[s]?.label || s} (${countBy(s)})`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-base"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, ID…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span className="text-sm font-medium">Loading requests…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-first-aid-kit-line text-3xl text-gray-300"></i>
            </div>
            <p className="text-gray-500 font-semibold">No requests found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Requester</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Requested</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Last Updated</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{req.member?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{req.member?.email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 min-w-[260px]">
                      <ProgressTracker status={req.status} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(req.requested_at)}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(req.updated_at)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetail(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-edit-line"></i>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Update Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kit Request</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">#{selected.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Requester */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <i className="ri-user-line"></i> Requester Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Name</p>
                    <p className="font-semibold text-gray-900">{selected.member?.full_name || 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{selected.member?.email || '—'}</p>
                  </div>
                  {selected.member?.phone && (
                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="font-semibold text-gray-900">{selected.member.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <i className="ri-route-line"></i> Current Progress
                </h3>
                <ProgressTracker status={selected.status} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Requested</p>
                  <p className="font-semibold text-gray-900">{formatDate(selected.requested_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Last Updated</p>
                  <p className="font-semibold text-gray-900">{formatDate(selected.updated_at)}</p>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <i className="ri-refresh-line"></i> Update Status
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setNewStatus(s)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                          newStatus === s
                            ? `${cfg.bg} ${cfg.text} border-current`
                            : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <i className={`${cfg.icon} text-lg`}></i>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <i className="ri-sticky-note-line"></i> Admin Note
                  <span className="text-gray-400 font-normal normal-case">(optional — visible to member)</span>
                </h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Add a note for the member, e.g. reason for decline or collection instructions…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 resize-none transition-colors"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{adminNote.length}/500</p>
              </div>

              {/* Email notification toggle */}
              <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition-colors ${sendEmail ? 'bg-lime-50 border-lime-200' : 'bg-gray-50 border-gray-200'}`}>
                <button
                  type="button"
                  onClick={() => setSendEmail((v) => !v)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors cursor-pointer ${sendEmail ? 'bg-lime-500 border-lime-500' : 'bg-white border-gray-300'}`}
                >
                  {sendEmail && <i className="ri-check-line text-white text-xs"></i>}
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Notify member by email</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {newStatus !== selected.status
                      ? `An email will be sent to ${selected.member?.email || 'the member'} about the status change to "${STATUS_CONFIG[newStatus]?.label || newStatus}".`
                      : 'Status hasn\'t changed — no email will be sent.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {updating ? (
                    <><i className="ri-loader-4-line animate-spin"></i> Saving…</>
                  ) : (
                    <><i className="ri-save-line"></i> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
