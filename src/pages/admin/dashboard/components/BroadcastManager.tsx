import { useState } from 'react';
import supabase from '../../../../lib/supabase';
import BroadcastHistory from './BroadcastHistory';

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL
  ? `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const TEMPLATES = [
  {
    label: 'General Announcement',
    subject: 'Important Update from Naloxone Advocates Plymouth',
    body: 'Dear Member,\n\nWe have an important update to share with you.\n\n[Write your message here]\n\nThank you for your continued support.\n\nThe NAP Team',
  },
  {
    label: 'Training Reminder',
    subject: 'Upcoming Training Reminder – Naloxone Advocates Plymouth',
    body: 'Dear Member,\n\nThis is a friendly reminder about your upcoming training session.\n\n[Add training details here]\n\nPlease ensure you arrive on time and bring any required materials.\n\nThank you,\nThe NAP Team',
  },
  {
    label: 'Thank You Message',
    subject: 'Thank You from Naloxone Advocates Plymouth',
    body: 'Dear Member,\n\nWe wanted to take a moment to thank you for your incredible dedication and hard work.\n\n[Add your personal message here]\n\nYour contribution makes a real difference in our community.\n\nWith gratitude,\nThe NAP Team',
  },
  {
    label: 'Urgent Notice',
    subject: '⚠️ Urgent Notice – Naloxone Advocates Plymouth',
    body: 'Dear Member,\n\nWe need to bring an urgent matter to your attention.\n\n[Describe the urgent situation here]\n\nPlease read this carefully and respond if required.\n\nThank you,\nThe NAP Team',
  },
];

interface AudienceOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: 'all_members',
    label: 'All Members',
    description: 'Every approved member regardless of role',
    icon: 'ri-team-fill',
    color: 'bg-gray-900',
    textColor: 'text-yellow-400',
  },
  {
    value: 'peer_trainers',
    label: 'Peer Trainers Only',
    description: 'Members with the Peer Trainer role',
    icon: 'ri-user-voice-fill',
    color: 'bg-pink-500',
    textColor: 'text-white',
  },
  {
    value: 'kit_carriers',
    label: 'Kit Carriers Only',
    description: 'Members with the Kit Carrier role',
    icon: 'ri-medicine-bottle-fill',
    color: 'bg-lime-500',
    textColor: 'text-white',
  },
  {
    value: 'first_responders',
    label: 'First Responders Only',
    description: 'Members with the First Responder role',
    icon: 'ri-heart-pulse-fill',
    color: 'bg-red-500',
    textColor: 'text-white',
  },
  {
    value: 'coordinators',
    label: 'Coordinators Only',
    description: 'Members with the Coordinator role',
    icon: 'ri-user-star-fill',
    color: 'bg-yellow-500',
    textColor: 'text-white',
  },
  {
    value: 'all_volunteers',
    label: 'All Volunteers',
    description: 'All approved volunteers (separate from members)',
    icon: 'ri-hand-heart-fill',
    color: 'bg-teal-500',
    textColor: 'text-white',
  },
];

interface BroadcastManagerProps {
  adminId: string;
  adminName: string;
}

export default function BroadcastManager({ adminId, adminName }: BroadcastManagerProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('all_members');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [sentHistory, setSentHistory] = useState<
    { subject: string; sentAt: string; count: number; audience: string }[]
  >([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);

  const selectedAudience = AUDIENCE_OPTIONS.find((a) => a.value === targetAudience) ?? AUDIENCE_OPTIONS[0];

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchRecipientCount = async () => {
    setLoadingCount(true);
    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/broadcast-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'preview', body: 'preview', previewOnly: true, targetAudience }),
      });
      const data = await res.json();
      setRecipientCount(data.recipientCount ?? null);
    } catch {
      setRecipientCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const handleOpenConfirm = async () => {
    if (!subject.trim() || !body.trim()) {
      showToast('error', 'Please fill in both the subject and message before sending.');
      return;
    }
    setConfirmOpen(true);
    await fetchRecipientCount();
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/broadcast-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), targetAudience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send broadcast.');

      await supabase.from('broadcasts').insert({
        title: subject.trim(),
        message: body.trim(),
        target_audience: targetAudience,
        sent_by: adminId || null,
        sent_by_name: adminName || null,
        recipient_count: data.sent ?? 0,
      });

      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'broadcast_sent',
        target_name: null,
        target_id: null,
        details: `${data.sent ?? 0} recipients (${selectedAudience.label}) - Subject: ${subject.trim()}`,
      });

      setSentHistory((prev) => [
        { subject: subject.trim(), sentAt: new Date().toISOString(), count: data.sent ?? 0, audience: selectedAudience.label },
        ...prev,
      ]);
      showToast('success', `Broadcast sent to ${data.sent ?? 0} recipient(s) successfully!`);
      setSubject('');
      setBody('');
      setConfirmOpen(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to send broadcast.');
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setShowTemplates(false);
  };

  const charCount = body.length;
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

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

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-send-fill text-yellow-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Send Broadcast?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              Subject: <span className="font-semibold text-gray-800">{subject}</span>
            </p>
            <div className="flex justify-center mt-3 mb-1">
              <span className={`${selectedAudience.color} ${selectedAudience.textColor} text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap`}>
                <i className={selectedAudience.icon}></i>
                {selectedAudience.label}
              </span>
            </div>
            {loadingCount ? (
              <div className="flex items-center justify-center gap-2 my-4 text-gray-400 text-sm">
                <i className="ri-loader-4-line animate-spin"></i>
                Counting recipients…
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 my-4 text-center">
                <span className="text-2xl font-black text-gray-900">
                  {recipientCount !== null ? recipientCount : '—'}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedAudience.label.toLowerCase()} will receive this email
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mb-6">
              This action cannot be undone. The selected group will receive this email immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || loadingCount}
                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-bold text-sm text-gray-900 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
              >
                {sending ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Sending…</>
                ) : (
                  <><i className="ri-send-plane-fill"></i> Send Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header + Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Broadcast</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Send targeted emails and review all past broadcasts.
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compose' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-mail-send-fill"></i>
            Compose
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-history-fill"></i>
            History
          </button>
        </div>
      </div>

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && <BroadcastHistory />}

      {/* ── COMPOSE TAB ── */}
      {activeTab === 'compose' && (
        <>
          {/* Templates toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowTemplates((v) => !v)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-file-list-3-line"></i>
              {showTemplates ? 'Hide Templates' : 'Use a Template'}
            </button>
          </div>

          {/* Templates Panel */}
          {showTemplates && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Quick Templates</h3>
                <p className="text-xs text-gray-500 mt-0.5">Click a template to pre-fill the form. You can edit it before sending.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => applyTemplate(tpl)}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-gray-100 group-hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-colors">
                        <i className="ri-file-text-line text-gray-600 group-hover:text-gray-900 text-sm"></i>
                      </div>
                      <span className="font-bold text-gray-800 text-sm">{tpl.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 pl-9">{tpl.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compose Form */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                <i className="ri-mail-fill text-yellow-400 text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Compose Email</h3>
                <p className="text-xs text-gray-500">Fill in the audience, subject and message below</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* TARGET AUDIENCE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAudienceOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:border-yellow-400 focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${selectedAudience.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${selectedAudience.icon} ${selectedAudience.textColor} text-sm`}></i>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{selectedAudience.label}</p>
                        <p className="text-xs text-gray-400">{selectedAudience.description}</p>
                      </div>
                    </div>
                    <i className={`ri-arrow-${audienceOpen ? 'up' : 'down'}-s-line text-gray-400 text-lg flex-shrink-0`}></i>
                  </button>
                  {audienceOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setTargetAudience(opt.value); setAudienceOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left border-b border-gray-50 last:border-0 ${
                            targetAudience === opt.value ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <div className={`w-9 h-9 ${opt.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <i className={`${opt.icon} ${opt.textColor} text-base`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-400">{opt.description}</p>
                          </div>
                          {targetAudience === opt.value && (
                            <i className="ri-check-line text-yellow-500 text-lg flex-shrink-0"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Update from Naloxone Advocates Plymouth"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{subject.length}/200</p>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here. Each recipient will be addressed by their first name automatically."
                  rows={12}
                  maxLength={5000}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors resize-none font-mono leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{wordCount} words</p>
                  <p className="text-xs text-gray-400">{charCount}/5000 characters</p>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-lightbulb-line text-yellow-500 text-base"></i>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">Tip:</strong> Each email will automatically start with{' '}
                  <em>&quot;Hi [Name],&quot;</em> before your message. Only approved members matching the selected audience will receive it.
                </p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleOpenConfirm}
                  disabled={!subject.trim() || !body.trim()}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 px-8 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md"
                >
                  <i className="ri-send-plane-fill text-lg"></i>
                  Send to {selectedAudience.label}
                </button>
              </div>
            </div>
          </div>

          {/* Sent This Session */}
          {sentHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Sent This Session</h3>
                <p className="text-xs text-gray-500 mt-0.5">Broadcasts sent since you logged in</p>
              </div>
              <div className="divide-y divide-gray-100">
                {sentHistory.map((item, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 bg-lime-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-checkbox-circle-fill text-lime-600 text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Sent to {item.count} recipient(s) · {item.audience} ·{' '}
                        {new Date(item.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="bg-lime-100 text-lime-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Delivered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
