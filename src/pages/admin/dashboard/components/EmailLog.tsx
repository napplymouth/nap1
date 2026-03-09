import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '../../../../lib/supabase';

interface EmailLogEntry {
  id: string;
  sent_at: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  email_type: string;
  status: string;
  related_id: string | null;
  related_type: string | null;
  admin_note: string | null;
  metadata: Record<string, any> | null;
}

interface ResendHistoryEntry {
  id: string;
  admin_name: string;
  details: string;
  created_at: string;
}

type StatusFilter = 'all' | 'sent' | 'failed';
type TypeFilter = 'all' | 'kit_status' | 'order_shipped' | 'back_in_stock' | 'event_notify' | 'hours_summary' | 'broadcast' | 'other';

// Map email_type → edge function slug
const TYPE_TO_FUNCTION: Record<string, string> = {
  kit_status:    'notify-kit-status',
  order_shipped: 'notify-order-shipped',
  back_in_stock: 'notify-back-in-stock',
  event_notify:  'notify-event-volunteers',
  hours_summary: 'send-hours-summary',
  broadcast:     'broadcast-volunteers',
};

const TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  kit_status:     { label: 'Kit Status',       icon: 'ri-first-aid-kit-fill',    bg: 'bg-lime-100',    text: 'text-lime-700' },
  order_shipped:  { label: 'Order Shipped',     icon: 'ri-truck-fill',            bg: 'bg-sky-100',     text: 'text-sky-700' },
  back_in_stock:  { label: 'Back in Stock',     icon: 'ri-store-2-fill',          bg: 'bg-orange-100',  text: 'text-orange-700' },
  event_notify:   { label: 'Event Notify',      icon: 'ri-calendar-event-fill',   bg: 'bg-violet-100',  text: 'text-violet-700' },
  hours_summary:  { label: 'Hours Summary',     icon: 'ri-time-fill',             bg: 'bg-yellow-100',  text: 'text-yellow-700' },
  broadcast:      { label: 'Broadcast',         icon: 'ri-broadcast-fill',        bg: 'bg-pink-100',    text: 'text-pink-700' },
  other:          { label: 'Other',             icon: 'ri-mail-fill',             bg: 'bg-gray-100',    text: 'text-gray-600' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  sent:    { label: 'Sent',    bg: 'bg-lime-100',  text: 'text-lime-700',  icon: 'ri-check-line' },
  failed:  { label: 'Failed',  bg: 'bg-red-100',   text: 'text-red-600',   icon: 'ri-close-line' },
  pending: { label: 'Pending', bg: 'bg-yellow-100',text: 'text-yellow-700',icon: 'ri-time-line' },
};

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all',           label: 'All Types' },
  { key: 'kit_status',    label: 'Kit Status' },
  { key: 'order_shipped', label: 'Order Shipped' },
  { key: 'back_in_stock', label: 'Back in Stock' },
  { key: 'event_notify',  label: 'Event Notify' },
  { key: 'hours_summary', label: 'Hours Summary' },
  { key: 'broadcast',     label: 'Broadcast' },
  { key: 'other',         label: 'Other' },
];

export default function EmailLog() {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EmailLogEntry | null>(null);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Resend state
  const [resendTarget, setResendTarget] = useState<EmailLogEntry | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResult, setResendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [resendedIds, setResendedIds] = useState<Set<string>>(new Set());

  // Resend history state
  const [resendHistory, setResendHistory] = useState<ResendHistoryEntry[]>([]);
  const [resendHistoryLoading, setResendHistoryLoading] = useState(false);

  // ── Bulk resend state ─────────────────────────────────────────────────────
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    done: number;
    succeeded: number;
    failed: number;
    current: string | null;
    finished: boolean;
  } | null>(null);
  // ─────────────────────────────────────────────────────────────────────────

  const PAGE_SIZE = 20;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      setLogs((data || []) as EmailLogEntry[]);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // Load resend history whenever the detail modal opens
  const loadResendHistory = useCallback(async (logId: string) => {
    setResendHistoryLoading(true);
    setResendHistory([]);
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('id, admin_name, details, created_at')
        .eq('action_type', 'email_resent')
        .eq('target_id', logId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResendHistory((data || []) as ResendHistoryEntry[]);
    } catch {
      setResendHistory([]);
    } finally {
      setResendHistoryLoading(false);
    }
  }, []);

  const openDetailModal = (log: EmailLogEntry) => {
    setSelected(log);
    loadResendHistory(log.id);
  };

  // ── Resend logic ──────────────────────────────────────────────────────────
  const canResend = (log: EmailLogEntry) =>
    log.status === 'failed' && !!TYPE_TO_FUNCTION[log.email_type];

  const handleResendConfirm = async () => {
    if (!resendTarget) return;
    setResendLoading(true);
    setResendResult(null);

    const fnSlug = TYPE_TO_FUNCTION[resendTarget.email_type];
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${supabaseUrl}/functions/v1/${fnSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resend: true,
          log_id: resendTarget.id,
          related_id: resendTarget.related_id,
          recipient_email: resendTarget.recipient_email,
          recipient_name: resendTarget.recipient_name,
          subject: resendTarget.subject,
          metadata: resendTarget.metadata,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      // Mark the log entry as sent in DB
      await supabase
        .from('email_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', resendTarget.id);

      // ── Activity log entry ──────────────────────────────────────────────
      const adminName = session?.user?.user_metadata?.full_name
        || session?.user?.email
        || 'Admin';
      const typeLabel = (TYPE_CONFIG[resendTarget.email_type] || TYPE_CONFIG['other']).label;

      await supabase.from('admin_activity_log').insert({
        admin_id: session?.user?.id ?? 'unknown',
        admin_name: adminName,
        action_type: 'email_resent',
        target_name: resendTarget.recipient_name || resendTarget.recipient_email,
        target_id: resendTarget.id,
        details: `Resent "${resendTarget.subject}" (${typeLabel}) to ${resendTarget.recipient_email}`,
        created_at: new Date().toISOString(),
      });
      // ───────────────────────────────────────────────────────────────────

      // Update local state
      setLogs((prev) =>
        prev.map((l) =>
          l.id === resendTarget.id
            ? { ...l, status: 'sent', sent_at: new Date().toISOString() }
            : l
        )
      );
      setResendedIds((prev) => new Set(prev).add(resendTarget.id));

      // Sync selected modal if open
      if (selected?.id === resendTarget.id) {
        setSelected((prev) => prev ? { ...prev, status: 'sent', sent_at: new Date().toISOString() } : prev);
        // Refresh resend history in the modal
        loadResendHistory(resendTarget.id);
      }

      setResendResult({ success: true, message: `Email successfully resent to ${resendTarget.recipient_email}.` });
    } catch (err: any) {
      setResendResult({ success: false, message: err?.message || 'Resend failed. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const openResendDialog = (log: EmailLogEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setResendTarget(log);
    setResendResult(null);
  };

  const closeResendDialog = () => {
    setResendTarget(null);
    setResendResult(null);
    setResendLoading(false);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => logs.filter((l) => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchType   = typeFilter === 'all' || l.email_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.recipient_email?.toLowerCase().includes(q) ||
      l.recipient_name?.toLowerCase().includes(q) ||
      l.subject?.toLowerCase().includes(q) ||
      l.related_id?.toLowerCase().includes(q);

    let matchDate = true;
    if (dateFrom) matchDate = matchDate && new Date(l.sent_at) >= new Date(dateFrom + 'T00:00:00');
    if (dateTo)   matchDate = matchDate && new Date(l.sent_at) <= new Date(dateTo + 'T23:59:59');

    return matchStatus && matchType && matchSearch && matchDate;
  }), [logs, statusFilter, typeFilter, search, dateFrom, dateTo]);

  // Failed rows visible on current page that are resendable
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const resendableOnPage = useMemo(
    () => paginated.filter((l) => canResend(l) && !resendedIds.has(l.id)),
    [paginated, resendedIds]
  );

  const allPageChecked =
    resendableOnPage.length > 0 &&
    resendableOnPage.every((l) => checkedIds.has(l.id));

  const somePageChecked = resendableOnPage.some((l) => checkedIds.has(l.id));

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllPage = () => {
    if (allPageChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        resendableOnPage.forEach((l) => next.delete(l.id));
        return next;
      });
    } else {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        resendableOnPage.forEach((l) => next.add(l.id));
        return next;
      });
    }
  };

  const clearSelection = () => setCheckedIds(new Set());

  // Emails selected for bulk resend
  const bulkTargets = useMemo(
    () => logs.filter((l) => checkedIds.has(l.id) && canResend(l)),
    [logs, checkedIds]
  );

  // ── Bulk resend execution ─────────────────────────────────────────────────
  const handleBulkResend = async () => {
    if (bulkTargets.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const adminName = session?.user?.user_metadata?.full_name
      || session?.user?.email
      || 'Admin';
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

    setBulkProgress({
      total: bulkTargets.length,
      done: 0,
      succeeded: 0,
      failed: 0,
      current: bulkTargets[0]?.recipient_email ?? null,
      finished: false,
    });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < bulkTargets.length; i++) {
      const log = bulkTargets[i];
      const fnSlug = TYPE_TO_FUNCTION[log.email_type];

      setBulkProgress((prev) => prev ? {
        ...prev,
        current: log.recipient_email,
      } : prev);

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/${fnSlug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            resend: true,
            log_id: log.id,
            related_id: log.related_id,
            recipient_email: log.recipient_email,
            recipient_name: log.recipient_name,
            subject: log.subject,
            metadata: log.metadata,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        await supabase
          .from('email_logs')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', log.id);

        const typeLabel = (TYPE_CONFIG[log.email_type] || TYPE_CONFIG['other']).label;
        await supabase.from('admin_activity_log').insert({
          admin_id: session?.user?.id ?? 'unknown',
          admin_name: adminName,
          action_type: 'email_resent',
          target_name: log.recipient_name || log.recipient_email,
          target_id: log.id,
          details: `[Bulk] Resent "${log.subject}" (${typeLabel}) to ${log.recipient_email}`,
          created_at: new Date().toISOString(),
        });

        setLogs((prev) =>
          prev.map((l) =>
            l.id === log.id ? { ...l, status: 'sent', sent_at: new Date().toISOString() } : l
          )
        );
        setResendedIds((prev) => new Set(prev).add(log.id));
        succeeded++;
      } catch {
        failed++;
      }

      setBulkProgress((prev) => prev ? {
        ...prev,
        done: i + 1,
        succeeded,
        failed,
        current: bulkTargets[i + 1]?.recipient_email ?? null,
        finished: i + 1 === bulkTargets.length,
      } : prev);
    }

    // Clear selection after bulk done
    setCheckedIds(new Set());
  };

  const closeBulkDialog = () => {
    if (bulkProgress && !bulkProgress.finished) return; // prevent close mid-run
    setShowBulkDialog(false);
    setBulkProgress(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const countByStatus = (s: string) => logs.filter((l) => l.status === s).length;
  const countByType   = (t: string) => logs.filter((l) => l.email_type === t).length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getTypeCfg = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG['other'];

  const TypeBadge = ({ type }: { type: string }) => {
    const cfg = getTypeCfg(type);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        <i className={cfg.icon}></i>
        {cfg.label}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['sent'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        <i className={cfg.icon}></i>
        {cfg.label}
      </span>
    );
  };

  const hasDateFilter = dateFrom || dateTo;

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setShowDatePicker(false);
  };

  const formatDateLabel = () => {
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Until ${dateTo}`;
    return 'Date Range';
  };

  const exportToCSV = () => {
    const headers = ['Sent At', 'Recipient Name', 'Recipient Email', 'Subject', 'Type', 'Status', 'Related Type', 'Reference ID', 'Admin Note'];
    const rows = filtered.map((l) => [
      formatDate(l.sent_at),
      l.recipient_name || '',
      l.recipient_email,
      l.subject,
      getTypeCfg(l.email_type).label,
      l.status,
      l.related_type ? l.related_type.replace(/_/g, ' ') : '',
      l.related_id ? l.related_id.slice(0, 8).toUpperCase() : '',
      l.admin_note || '',
    ]);
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateLabel = dateFrom || dateTo
      ? `_${dateFrom || 'start'}_to_${dateTo || 'end'}`
      : `_${new Date().toISOString().slice(0, 10)}`;
    link.href = url;
    link.download = `email_log${dateLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Email Log</h1>
        <p className="text-gray-500 text-sm">Track all outbound email notifications sent to members and volunteers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sent',    value: logs.length,              bg: 'bg-gray-900',   text: 'text-white',      sub: 'text-gray-400',  icon: 'ri-mail-fill' },
          { label: 'Delivered',     value: countByStatus('sent'),     bg: 'bg-lime-500',   text: 'text-white',      sub: 'text-lime-100',  icon: 'ri-check-double-line' },
          { label: 'Failed',        value: countByStatus('failed'),   bg: 'bg-red-500',    text: 'text-white',      sub: 'text-red-100',   icon: 'ri-error-warning-fill' },
          { label: 'Kit Updates',   value: countByType('kit_status'), bg: 'bg-yellow-400', text: 'text-gray-900',   sub: 'text-gray-700',  icon: 'ri-first-aid-kit-fill' },
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

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filters row */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          {/* Type filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_FILTERS.map((tf) => (
              <button
                key={tf.key}
                onClick={() => { setTypeFilter(tf.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === tf.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tf.label}
                {tf.key !== 'all' && (
                  <span className="ml-1.5 opacity-70">({countByType(tf.key)})</span>
                )}
              </button>
            ))}
          </div>

          {/* Status + Search + Date row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['all', 'sent', 'failed'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap capitalize ${
                    statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s === 'all' ? `All (${logs.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${countByStatus(s)})`}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto">
              {/* Date Range Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    hasDateFilter
                      ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <i className="ri-calendar-line text-sm"></i>
                  <span>{formatDateLabel()}</span>
                  {hasDateFilter && (
                    <span
                      onClick={(e) => { e.stopPropagation(); clearDateFilter(); }}
                      className="ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-gray-900/20 hover:bg-gray-900/40 transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </span>
                  )}
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 w-72">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-900">Filter by Date Range</p>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-gray-500 text-sm"></i>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          max={dateTo || undefined}
                          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">To</label>
                        <input
                          type="date"
                          value={dateTo}
                          min={dateFrom || undefined}
                          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Quick Select</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Today', fn: () => {
                            const d = new Date().toISOString().slice(0, 10);
                            setDateFrom(d); setDateTo(d); setPage(1);
                          }},
                          { label: 'Last 7 days', fn: () => {
                            const to = new Date().toISOString().slice(0, 10);
                            const from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
                            setDateFrom(from); setDateTo(to); setPage(1);
                          }},
                          { label: 'Last 30 days', fn: () => {
                            const to = new Date().toISOString().slice(0, 10);
                            const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
                            setDateFrom(from); setDateTo(to); setPage(1);
                          }},
                          { label: 'This month', fn: () => {
                            const now = new Date();
                            const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                            const to = now.toISOString().slice(0, 10);
                            setDateFrom(from); setDateTo(to); setPage(1);
                          }},
                        ].map((p) => (
                          <button
                            key={p.label}
                            onClick={() => { p.fn(); setShowDatePicker(false); }}
                            className="px-3 py-2 bg-gray-100 hover:bg-yellow-100 hover:text-yellow-800 text-gray-600 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasDateFilter && (
                      <button
                        onClick={clearDateFilter}
                        className="mt-3 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Clear Date Filter
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-base"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search email, name, subject…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>

              {/* Export CSV */}
              <button
                onClick={exportToCSV}
                disabled={filtered.length === 0}
                title={`Export ${filtered.length} row${filtered.length !== 1 ? 's' : ''} to CSV`}
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-2-line text-sm"></i>
                Export CSV
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md">{filtered.length}</span>
              </button>
            </div>
          </div>

          {/* Active date filter badge */}
          {hasDateFilter && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-bold text-yellow-800">
                <i className="ri-calendar-check-line"></i>
                Showing {filtered.length} email{filtered.length !== 1 ? 's' : ''} in range: {formatDateLabel()}
                <button
                  onClick={clearDateFilter}
                  className="ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-yellow-800 text-xs"></i>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* ── Bulk Selection Toolbar ──────────────────────────────────────── */}
        {checkedIds.size > 0 && (
          <div className="flex items-center justify-between gap-4 px-5 py-3 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-checkbox-multiple-line text-red-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">
                  {checkedIds.size} failed email{checkedIds.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-red-500">Ready to bulk retry delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear selection
              </button>
              <button
                onClick={() => { setShowBulkDialog(true); setBulkProgress(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
                Resend {checkedIds.size} Email{checkedIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────────── */}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span className="text-sm font-medium">Loading email log…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-line text-3xl text-gray-300"></i>
            </div>
            <p className="text-gray-500 font-semibold">No emails found</p>
            <p className="text-gray-400 text-sm mt-1">
              {logs.length === 0
                ? 'Emails will appear here once notifications are sent.'
                : 'Try adjusting your filters or search term.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {/* Bulk checkbox header */}
                    <th className="px-4 py-3 w-10">
                      {resendableOnPage.length > 0 && (
                        <button
                          onClick={toggleAllPage}
                          title={allPageChecked ? 'Deselect all on this page' : 'Select all failed on this page'}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            allPageChecked
                              ? 'bg-red-500 border-red-500'
                              : somePageChecked
                              ? 'bg-red-100 border-red-400'
                              : 'bg-white border-gray-300 hover:border-red-400'
                          }`}
                        >
                          {allPageChecked && <i className="ri-check-line text-white text-xs"></i>}
                          {!allPageChecked && somePageChecked && <i className="ri-subtract-line text-red-500 text-xs"></i>}
                        </button>
                      )}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Recipient</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Subject</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Sent At</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((log) => {
                    const isResendable = canResend(log) && !resendedIds.has(log.id);
                    const isChecked = checkedIds.has(log.id);
                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors ${
                          isChecked ? 'bg-red-50 hover:bg-red-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Row checkbox — only for resendable failed emails */}
                        <td className="px-4 py-4 w-10">
                          {isResendable && (
                            <button
                              onClick={() => toggleCheck(log.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                isChecked
                                  ? 'bg-red-500 border-red-500'
                                  : 'bg-white border-gray-300 hover:border-red-400'
                              }`}
                            >
                              {isChecked && <i className="ri-check-line text-white text-xs"></i>}
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{log.recipient_name || '—'}</p>
                          <p className="text-xs text-gray-400">{log.recipient_email}</p>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className="text-gray-700 text-sm truncate" title={log.subject}>{log.subject}</p>
                          {log.related_id && (
                            <p className="text-xs text-gray-400 font-mono mt-0.5">#{log.related_id.slice(0, 8).toUpperCase()}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <TypeBadge type={log.email_type} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(log.sent_at)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailModal(log)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <i className="ri-eye-line"></i>
                              View
                            </button>
                            {canResend(log) && (
                              <button
                                onClick={(e) => openResendDialog(log, e)}
                                title="Retry delivery"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap border border-red-200"
                              >
                                <i className="ri-refresh-line"></i>
                                Resend
                              </button>
                            )}
                            {resendedIds.has(log.id) && log.status === 'sent' && (
                              <span className="flex items-center gap-1 text-xs text-lime-600 font-bold">
                                <i className="ri-check-line"></i>
                                Resent
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-left-s-line"></i>
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
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            page === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Email Details</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">#{selected.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status + Type */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={selected.status} />
                <TypeBadge type={selected.email_type} />
                {resendedIds.has(selected.id) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-lime-100 text-lime-700">
                    <i className="ri-check-double-line"></i>
                    Resent successfully
                  </span>
                )}
              </div>

              {/* Failed banner with Resend CTA */}
              {selected.status === 'failed' && canResend(selected) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-error-warning-fill text-red-500 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-700">Delivery failed</p>
                      <p className="text-xs text-red-500 mt-0.5">This email was not delivered. You can retry sending it now.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openResendDialog(selected)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                  >
                    <i className="ri-refresh-line"></i>
                    Resend Now
                  </button>
                </div>
              )}

              {/* Recipient */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <i className="ri-user-line"></i> Recipient
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-fill text-gray-500"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selected.recipient_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selected.recipient_email}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                  <i className="ri-mail-line"></i> Subject
                </p>
                <p className="text-sm text-gray-800 font-medium bg-gray-50 rounded-xl px-4 py-3">{selected.subject}</p>
              </div>

              {/* Sent At */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Sent At</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(selected.sent_at)}</p>
                </div>
                {selected.related_type && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Related To</p>
                    <p className="font-semibold text-gray-900 text-sm capitalize">{selected.related_type.replace(/_/g, ' ')}</p>
                  </div>
                )}
              </div>

              {/* Related ID */}
              {selected.related_id && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Reference ID</p>
                  <p className="font-mono text-sm text-gray-700">#{selected.related_id.slice(0, 8).toUpperCase()}</p>
                </div>
              )}

              {/* Admin Note */}
              {selected.admin_note && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1.5 flex items-center gap-2">
                    <i className="ri-sticky-note-line"></i> Admin Note Included
                  </p>
                  <p className="text-sm text-yellow-800">{selected.admin_note}</p>
                </div>
              )}

              {/* Metadata */}
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <i className="ri-code-line"></i> Additional Info
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                    {Object.entries(selected.metadata).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2 text-xs">
                        <span className="text-gray-400 font-mono min-w-[100px]">{k}</span>
                        <span className="text-gray-700 font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Resend History ─────────────────────────────────────────── */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <i className="ri-history-line"></i> Resend History
                  {resendHistory.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                      {resendHistory.length}
                    </span>
                  )}
                </p>

                {resendHistoryLoading ? (
                  <div className="flex items-center gap-2 py-4 text-gray-400">
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    <span className="text-xs">Loading history…</span>
                  </div>
                ) : resendHistory.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-history-line text-gray-300 text-sm"></i>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">No retry attempts recorded for this email.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-200"></div>
                    <div className="space-y-3">
                      {resendHistory.map((entry, idx) => (
                        <div key={entry.id} className="flex items-start gap-3 pl-1">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            idx === 0 ? 'bg-lime-100 border-2 border-lime-400' : 'bg-gray-100 border-2 border-gray-300'
                          }`}>
                            <i className={`text-xs ${idx === 0 ? 'ri-refresh-line text-lime-600' : 'ri-refresh-line text-gray-400'}`}></i>
                          </div>
                          {/* Content */}
                          <div className={`flex-1 rounded-xl p-3 border ${
                            idx === 0
                              ? 'bg-lime-50 border-lime-200'
                              : 'bg-gray-50 border-gray-100'
                          }`}>
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <i className="ri-admin-line text-gray-500 text-xs"></i>
                                </div>
                                <span className={`text-xs font-bold ${idx === 0 ? 'text-lime-800' : 'text-gray-700'}`}>
                                  {entry.admin_name}
                                </span>
                                {idx === 0 && (
                                  <span className="px-1.5 py-0.5 bg-lime-200 text-lime-700 text-xs font-bold rounded-full">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatDate(entry.created_at)}
                              </span>
                            </div>
                            <p className={`text-xs mt-1.5 leading-relaxed ${idx === 0 ? 'text-lime-700' : 'text-gray-500'}`}>
                              {entry.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* ─────────────────────────────────────────────────────────── */}

              <button
                onClick={() => setSelected(null)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Single Resend Confirmation Dialog ────────────────────────────── */}
      {resendTarget && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => { if (!resendLoading) closeResendDialog(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ri-refresh-line text-red-500 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Resend Email</h3>
                <p className="text-xs text-gray-400 mt-0.5">Retry delivery for this failed notification</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-user-line"></i>
                  <span className="font-semibold text-gray-700">{resendTarget.recipient_name || resendTarget.recipient_email}</span>
                  <span className="text-gray-400">·</span>
                  <span>{resendTarget.recipient_email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-mail-line"></i>
                  <span className="text-gray-700 font-medium truncate">{resendTarget.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-broadcast-line"></i>
                  <TypeBadge type={resendTarget.email_type} />
                </div>
              </div>

              {resendResult && (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${
                  resendResult.success ? 'bg-lime-50 border border-lime-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    resendResult.success ? 'bg-lime-100' : 'bg-red-100'
                  }`}>
                    <i className={`text-sm ${resendResult.success ? 'ri-check-line text-lime-600' : 'ri-close-line text-red-500'}`}></i>
                  </div>
                  <p className={`text-sm font-medium ${resendResult.success ? 'text-lime-700' : 'text-red-600'}`}>
                    {resendResult.message}
                  </p>
                </div>
              )}

              {!resendResult?.success && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={closeResendDialog}
                    disabled={resendLoading}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResendConfirm}
                    disabled={resendLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {resendLoading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        Sending…
                      </>
                    ) : (
                      <>
                        <i className="ri-refresh-line"></i>
                        Confirm Resend
                      </>
                    )}
                  </button>
                </div>
              )}

              {resendResult?.success && (
                <button
                  onClick={closeResendDialog}
                  className="w-full px-4 py-3 bg-lime-500 text-white font-bold text-sm rounded-xl hover:bg-lime-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Resend Dialog ────────────────────────────────────────────── */}
      {showBulkDialog && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => { if (!bulkProgress || bulkProgress.finished) closeBulkDialog(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-send-line text-red-500 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bulk Resend</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Retry delivery for {bulkTargets.length} failed email{bulkTargets.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Pre-run: recipient list preview */}
              {!bulkProgress && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Selected emails ({bulkTargets.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bulkTargets.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                          <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-user-line text-red-500 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {log.recipient_name || log.recipient_email}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{log.subject}</p>
                          </div>
                          <TypeBadge type={log.email_type} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                    <i className="ri-information-line text-yellow-600 text-sm mt-0.5 flex-shrink-0"></i>
                    <p className="text-xs text-yellow-700">
                      Each email will be retried one by one. This may take a moment depending on the number selected.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeBulkDialog}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkResend}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line"></i>
                      Confirm &amp; Resend All
                    </button>
                  </div>
                </>
              )}

              {/* In-progress / finished */}
              {bulkProgress && (
                <>
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-800">
                        {bulkProgress.finished ? 'Bulk resend complete' : 'Sending emails…'}
                      </p>
                      <span className="text-xs font-bold text-gray-500">
                        {bulkProgress.done} / {bulkProgress.total}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          bulkProgress.finished
                            ? bulkProgress.failed === 0 ? 'bg-lime-500' : 'bg-yellow-400'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    {!bulkProgress.finished && bulkProgress.current && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                        <i className="ri-loader-4-line animate-spin text-xs"></i>
                        Sending to {bulkProgress.current}…
                      </p>
                    )}
                  </div>

                  {/* Result counters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{bulkProgress.total}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Total</p>
                    </div>
                    <div className="bg-lime-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-lime-600">{bulkProgress.succeeded}</p>
                      <p className="text-xs text-lime-500 mt-0.5">Succeeded</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-red-500">{bulkProgress.failed}</p>
                      <p className="text-xs text-red-400 mt-0.5">Failed</p>
                    </div>
                  </div>

                  {/* Summary message when done */}
                  {bulkProgress.finished && (
                    <div className={`rounded-xl p-4 flex items-start gap-3 ${
                      bulkProgress.failed === 0
                        ? 'bg-lime-50 border border-lime-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        bulkProgress.failed === 0 ? 'bg-lime-100' : 'bg-yellow-100'
                      }`}>
                        <i className={`text-sm ${
                          bulkProgress.failed === 0
                            ? 'ri-check-double-line text-lime-600'
                            : 'ri-alert-line text-yellow-600'
                        }`}></i>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${
                          bulkProgress.failed === 0 ? 'text-lime-700' : 'text-yellow-700'
                        }`}>
                          {bulkProgress.failed === 0
                            ? `All ${bulkProgress.succeeded} emails resent successfully!`
                            : `${bulkProgress.succeeded} sent, ${bulkProgress.failed} still failed.`}
                        </p>
                        {bulkProgress.failed > 0 && (
                          <p className="text-xs text-yellow-600 mt-0.5">
                            Failed emails remain in the log — you can retry them individually.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {bulkProgress.finished && (
                    <button
                      onClick={closeBulkDialog}
                      className="w-full px-4 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Done
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
