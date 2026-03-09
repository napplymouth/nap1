
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface MemberProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  member_role: string;
  approval_status: string;
}

interface Certificate {
  id: string;
  user_id: string;
  certificate_number: string;
  course_name: string;
  course_type: string;
  issued_at: string;
  expires_at: string | null;
  issued_by: string;
  status: string;
  member?: MemberProfile;
}

interface IssueFormData {
  user_id: string;
  course_name: string;
  course_type: string;
  expires_months: string;
  custom_course: string;
}

const COURSE_OPTIONS = [
  { name: 'Naloxone Administration', type: 'In-Person Training' },
  { name: 'Overdose Awareness', type: 'eLearning' },
  { name: 'Peer-to-Peer Trainer', type: 'P2P Programme' },
  { name: 'Harm Reduction Basics', type: 'eLearning' },
  { name: 'Community Training', type: 'In-Person Training' },
  { name: 'Organisational Training', type: 'In-Person Training' },
  { name: 'Custom…', type: '' },
];

const EXPIRY_OPTIONS = [
  { label: '1 Year', months: '12' },
  { label: '2 Years', months: '24' },
  { label: '3 Years', months: '36' },
  { label: 'No Expiry', months: '0' },
];

const EMPTY_FORM: IssueFormData = {
  user_id: '',
  course_name: '',
  course_type: '',
  expires_months: '24',
  custom_course: '',
};

function generateCertNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NAP-${year}-${rand}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

const COURSE_COLORS: Record<string, string> = {
  'In-Person Training': 'bg-yellow-400 text-gray-900',
  'eLearning': 'bg-pink-100 text-pink-700',
  'P2P Programme': 'bg-lime-100 text-lime-700',
};

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [certsRes, membersRes] = await Promise.all([
        supabase
          .from('certificates')
          .select('*')
          .order('issued_at', { ascending: false }),
        supabase
          .from('member_profiles')
          .select('id, user_id, full_name, email, member_role, approval_status')
          .eq('approval_status', 'approved')
          .order('full_name'),
      ]);

      if (certsRes.error) throw certsRes.error;
      if (membersRes.error) throw membersRes.error;

      const memberMap = new Map<string, MemberProfile>();
      (membersRes.data || []).forEach((m) => memberMap.set(m.user_id, m as MemberProfile));

      const enriched = (certsRes.data || []).map((c) => ({
        ...c,
        member: memberMap.get(c.user_id),
      })) as Certificate[];

      setCertificates(enriched);
      setMembers((membersRes.data || []) as MemberProfile[]);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = members.filter((m) => {
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    return m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const handleCourseSelect = (courseName: string) => {
    const found = COURSE_OPTIONS.find((c) => c.name === courseName);
    setFormData((prev) => ({
      ...prev,
      course_name: courseName === 'Custom…' ? '' : courseName,
      course_type: found?.type || '',
      custom_course: courseName === 'Custom…' ? prev.custom_course : '',
    }));
  };

  const handleSelectMember = (member: MemberProfile) => {
    setSelectedMember(member);
    setFormData((prev) => ({ ...prev, user_id: member.user_id }));
    setMemberSearch(member.full_name);
    setShowMemberDropdown(false);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseName = formData.course_name || formData.custom_course;
    if (!formData.user_id || !courseName || !formData.course_type) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const issuedAt = new Date().toISOString();
      let expiresAt: string | null = null;
      if (formData.expires_months !== '0') {
        const exp = new Date();
        exp.setMonth(exp.getMonth() + parseInt(formData.expires_months, 10));
        expiresAt = exp.toISOString();
      }

      const { error } = await supabase.from('certificates').insert({
        user_id: formData.user_id,
        certificate_number: generateCertNumber(),
        course_name: courseName,
        course_type: formData.course_type,
        issued_at: issuedAt,
        expires_at: expiresAt,
        issued_by: 'Naloxone Advocates Plymouth',
        status: 'active',
      });

      if (error) throw error;

      showToast('success', `Certificate issued to ${selectedMember?.full_name}!`);
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setSelectedMember(null);
      setMemberSearch('');
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to issue certificate.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'revoked' })
        .eq('id', revokeTarget.id);
      if (error) throw error;
      showToast('success', 'Certificate revoked.');
      setRevokeTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to revoke certificate.');
    } finally {
      setRevoking(false);
    }
  };

  const filtered = certificates.filter((c) => {
    const matchSearch =
      !search ||
      c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.certificate_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.member?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.member?.email?.toLowerCase().includes(search.toLowerCase());

    const expired = isExpired(c.expires_at);
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? c.status === 'active' && !expired
        : filterStatus === 'expired'
        ? expired && c.status !== 'revoked'
        : c.status === 'revoked';

    return matchSearch && matchStatus;
  });

  const activeCount = certificates.filter((c) => c.status === 'active' && !isExpired(c.expires_at)).length;
  const expiredCount = certificates.filter((c) => isExpired(c.expires_at) && c.status !== 'revoked').length;
  const revokedCount = certificates.filter((c) => c.status === 'revoked').length;

  const isCustomCourse = formData.course_name === '' && COURSE_OPTIONS.find((o) => o.name === 'Custom…');

  return (
    <div className="relative">
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

      {/* Revoke Confirm Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-forbid-fill text-red-500 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Revoke Certificate?</h3>
            <p className="text-gray-600 text-sm text-center mb-1">
              <span className="font-semibold">{revokeTarget.course_name}</span>
            </p>
            <p className="text-gray-500 text-xs text-center mb-6">
              Issued to <strong>{revokeTarget.member?.full_name || 'this member'}</strong>. The certificate will be marked as revoked and the member will no longer be able to use it as proof of training.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRevokeTarget(null)}
                disabled={revoking}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {revoking ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-forbid-line"></i>}
                {revoking ? 'Revoking…' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="ri-award-fill text-yellow-500"></i> Issue Certificate
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Select a member and training course to issue a certificate.</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setSelectedMember(null); setMemberSearch(''); }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-500"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleIssue} className="p-6 space-y-5">
              {/* Member picker */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Member <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-user-search-line text-gray-400 text-base"></i>
                  </div>
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                      if (!e.target.value) { setSelectedMember(null); setFormData((p) => ({ ...p, user_id: '' })); }
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    placeholder="Search member by name or email…"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  />
                  {selectedMember && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-checkbox-circle-fill text-lime-500 text-base"></i>
                    </div>
                  )}
                </div>

                {showMemberDropdown && memberSearch && filteredMembers.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember(m)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{m.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showMemberDropdown && memberSearch && filteredMembers.length === 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-4 text-center text-sm text-gray-500">
                    No approved members found matching &quot;{memberSearch}&quot;
                  </div>
                )}
              </div>

              {/* Course selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Training Course <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COURSE_OPTIONS.map((opt) => {
                    const isSelected =
                      opt.name === 'Custom…'
                        ? formData.course_name === '' && formData.custom_course !== ''
                        : formData.course_name === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => handleCourseSelect(opt.name)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-50 text-gray-900'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom course name */}
              {(formData.course_name === '' && formData.custom_course !== undefined) && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Custom Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.custom_course}
                    onChange={(e) => setFormData((p) => ({ ...p, custom_course: e.target.value }))}
                    placeholder="e.g. Advanced Harm Reduction"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
                  />
                </div>
              )}

              {/* Course type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Delivery Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['In-Person Training', 'eLearning', 'P2P Programme', 'Community', 'Organisational'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, course_type: t }))}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        formData.course_type === t
                          ? 'border-yellow-400 bg-yellow-400 text-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Certificate Validity</label>
                <div className="flex gap-2">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, expires_months: opt.months }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                        formData.expires_months === opt.months
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview summary */}
              {selectedMember && (formData.course_name || formData.custom_course) && formData.course_type && (
                <div className="bg-gradient-to-br from-yellow-50 to-lime-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Certificate Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-award-fill text-gray-900 text-lg"></i>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{formData.course_name || formData.custom_course}</p>
                      <p className="text-xs text-gray-500">{formData.course_type} · Issued to {selectedMember.full_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Valid for {formData.expires_months === '0' ? 'lifetime' : `${formData.expires_months} months`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setSelectedMember(null); setMemberSearch(''); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 font-bold text-sm text-gray-900 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-award-fill"></i>}
                  {saving ? 'Issuing…' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-award-fill text-yellow-500"></i> Certificates Manager
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Issue and manage training certificates for community members.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md"
        >
          <i className="ri-add-circle-fill text-lg"></i>
          Issue Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Issued', value: certificates.length, icon: 'ri-award-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
          { label: 'Active', value: activeCount, icon: 'ri-checkbox-circle-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
          { label: 'Expired', value: expiredCount, icon: 'ri-time-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
          { label: 'Revoked', value: revokedCount, icon: 'ri-forbid-fill', bg: 'bg-red-500', text: 'text-white', sub: 'text-red-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-md`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-0.5`}>{s.value}</div>
            <div className={`text-xs font-semibold ${s.sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {([
              { key: 'all', label: `All (${certificates.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'expired', label: `Expired (${expiredCount})` },
              { key: 'revoked', label: `Revoked (${revokedCount})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.key
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
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
              placeholder="Search member or course…"
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

        {/* Table */}
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <i className="ri-loader-4-line text-5xl animate-spin mb-3"></i>
              <p className="font-semibold">Loading certificates…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-award-line text-4xl"></i>
              </div>
              <p className="font-bold text-gray-600 text-lg">No certificates found</p>
              <p className="text-sm mt-1">
                {search ? 'Try a different search term.' : 'Issue the first certificate using the button above.'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Issue First Certificate
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((cert) => {
                const expired = isExpired(cert.expires_at);
                const revoked = cert.status === 'revoked';
                const statusLabel = revoked ? 'Revoked' : expired ? 'Expired' : 'Active';
                const statusClass = revoked
                  ? 'bg-red-100 text-red-600'
                  : expired
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-lime-100 text-lime-700';

                return (
                  <div
                    key={cert.id}
                    className={`border rounded-2xl p-5 transition-all ${
                      revoked ? 'border-red-100 bg-red-50/30 opacity-75' : 'border-gray-200 bg-white hover:border-yellow-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Member avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {cert.member?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Member name + status */}
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="font-bold text-gray-900 text-base">
                              {cert.member?.full_name || 'Unknown Member'}
                            </p>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{cert.member?.email || '—'}</p>

                          {/* Course info */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800 text-sm">{cert.course_name}</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${COURSE_COLORS[cert.course_type] || 'bg-gray-100 text-gray-600'}`}>
                              {cert.course_type}
                            </span>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className="ri-hashtag text-gray-400"></i>
                              <span className="font-mono font-semibold text-gray-600">{cert.certificate_number}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-calendar-check-line text-gray-400"></i>
                              Issued {formatDate(cert.issued_at)}
                            </span>
                            {cert.expires_at ? (
                              <span className={`flex items-center gap-1 ${expired ? 'text-orange-500 font-semibold' : ''}`}>
                                <i className="ri-time-line text-gray-400"></i>
                                {expired ? `Expired ${formatDate(cert.expires_at)}` : `Expires ${formatDate(cert.expires_at)}`}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-lime-600 font-semibold">
                                <i className="ri-infinity-line"></i>
                                No expiry
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!revoked && (
                          <button
                            onClick={() => setRevokeTarget(cert)}
                            className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                          >
                            <i className="ri-forbid-line"></i>
                            Revoke
                          </button>
                        )}
                        {revoked && (
                          <span className="text-xs text-gray-400 italic px-3">Certificate revoked</span>
                        )}
                      </div>
                    </div>
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
