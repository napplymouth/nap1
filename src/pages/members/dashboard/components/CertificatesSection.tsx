
import { useState, useEffect, useRef } from 'react';
import supabase from '../../../../lib/supabase';

type Certificate = {
  id: string;
  certificate_number: string;
  course_name: string;
  course_type: string;
  issued_at: string;
  expires_at: string | null;
  issued_by: string;
  status: string;
};

type MockCertificate = {
  id: string;
  certificate_number: string;
  course_name: string;
  course_type: string;
  issued_at: string;
  expires_at: string | null;
  issued_by: string;
  status: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
};

const MOCK_CERTIFICATES: MockCertificate[] = [
  {
    id: 'cert-1',
    certificate_number: 'NAP-2025-0042',
    course_name: 'Naloxone Administration',
    course_type: 'In-Person Training',
    issued_at: '2025-01-15T10:00:00Z',
    expires_at: '2027-01-15T10:00:00Z',
    issued_by: 'Naloxone Advocates Plymouth',
    status: 'active',
    badge: 'Certified',
    badgeBg: 'bg-lime-400',
    badgeText: 'text-gray-900',
    icon: 'ri-medicine-bottle-fill',
  },
  {
    id: 'cert-2',
    certificate_number: 'NAP-2024-0019',
    course_name: 'Overdose Awareness',
    course_type: 'eLearning',
    issued_at: '2024-11-03T14:30:00Z',
    expires_at: '2026-11-03T14:30:00Z',
    issued_by: 'Naloxone Advocates Plymouth',
    status: 'active',
    badge: 'Certified',
    badgeBg: 'bg-lime-400',
    badgeText: 'text-gray-900',
    icon: 'ri-alert-fill',
  },
  {
    id: 'cert-3',
    certificate_number: 'NAP-2024-0007',
    course_name: 'Peer-to-Peer Trainer',
    course_type: 'P2P Programme',
    issued_at: '2024-08-20T09:00:00Z',
    expires_at: '2026-08-20T09:00:00Z',
    issued_by: 'Naloxone Advocates Plymouth',
    status: 'active',
    badge: 'Certified',
    badgeBg: 'bg-lime-400',
    badgeText: 'text-gray-900',
    icon: 'ri-team-fill',
  },
  {
    id: 'cert-4',
    certificate_number: 'NAP-2023-0003',
    course_name: 'Harm Reduction Basics',
    course_type: 'eLearning',
    issued_at: '2023-06-10T11:00:00Z',
    expires_at: '2025-06-10T11:00:00Z',
    issued_by: 'Naloxone Advocates Plymouth',
    status: 'expired',
    badge: 'Expired',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-600',
    icon: 'ri-shield-check-fill',
  },
];

const COURSE_ICONS: Record<string, string> = {
  'Naloxone Administration': 'ri-medicine-bottle-fill',
  'Overdose Awareness': 'ri-alert-fill',
  'Peer-to-Peer Trainer': 'ri-team-fill',
  'Harm Reduction Basics': 'ri-shield-check-fill',
  'Community Training': 'ri-community-fill',
  'Organisational Training': 'ri-building-fill',
};

const COURSE_COLORS: Record<string, string> = {
  'In-Person Training': 'bg-yellow-400',
  'eLearning': 'bg-pink-500',
  'P2P Programme': 'bg-lime-400',
  'Community': 'bg-yellow-400',
  'Organisational': 'bg-lime-400',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

type CertificateCardProps = {
  cert: Certificate | MockCertificate;
  memberName: string;
  onPreview: (cert: Certificate | MockCertificate) => void;
};

function CertificateCard({ cert, memberName, onPreview }: CertificateCardProps) {
  const expired = isExpired(cert.expires_at);
  const days = daysUntilExpiry(cert.expires_at);
  const icon = COURSE_ICONS[cert.course_name] || 'ri-award-fill';
  const color = COURSE_COLORS[cert.course_type] || 'bg-yellow-400';
  const isExpiringSoon = days !== null && days > 0 && days <= 60;

  return (
    <div className={`bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-xl transition-all group ${expired ? 'border-red-100 opacity-80' : 'border-gray-100'}`}>
      {/* Top colour strip */}
      <div className={`h-2 w-full ${expired ? 'bg-red-200' : color}`}></div>

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-12 h-12 ${expired ? 'bg-gray-100' : color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
            <i className={`${icon} ${expired ? 'text-gray-400' : 'text-gray-900'} text-xl`}></i>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${expired ? 'bg-red-100 text-red-600' : 'bg-lime-400 text-gray-900'}`}>
            {expired ? 'Expired' : 'Active'}
          </span>
        </div>

        {/* Course name */}
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{cert.course_name}</h3>
        <p className="text-gray-500 text-xs mb-3">{cert.course_type}</p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-hashtag text-gray-400"></i>
            </div>
            <span className="font-mono font-semibold text-gray-700">{cert.certificate_number}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-calendar-check-line text-gray-400"></i>
            </div>
            <span>Issued: <strong className="text-gray-800">{formatDate(cert.issued_at)}</strong></span>
          </div>
          {cert.expires_at && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-time-line ${expired ? 'text-red-400' : isExpiringSoon ? 'text-orange-400' : 'text-gray-400'}`}></i>
              </div>
              <span className={expired ? 'text-red-500 font-semibold' : isExpiringSoon ? 'text-orange-500 font-semibold' : ''}>
                {expired ? `Expired ${formatDate(cert.expires_at)}` : `Expires: ${formatDate(cert.expires_at)}`}
              </span>
            </div>
          )}
        </div>

        {/* Expiry warning */}
        {isExpiringSoon && !expired && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
            <i className="ri-error-warning-fill text-orange-400 text-sm flex-shrink-0"></i>
            <p className="text-orange-600 text-xs font-semibold">Expires in {days} days — renew soon</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(cert)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-yellow-400 py-2.5 rounded-full font-bold text-xs hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-eye-line"></i> Preview
          </button>
          <button
            onClick={() => onPreview(cert)}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-2.5 rounded-full font-bold text-xs hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-download-line"></i> Download
          </button>
        </div>
      </div>
    </div>
  );
}

type PreviewModalProps = {
  cert: Certificate | MockCertificate | null;
  memberName: string;
  onClose: () => void;
};

function CertificatePreviewModal({ cert, memberName, onClose }: PreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!cert) return null;

  const expired = isExpired(cert.expires_at);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=650');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${cert.course_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; padding: 0; background: #fff; }
            .cert-wrap { width: 900px; min-height: 620px; padding: 60px; box-sizing: border-box; font-family: 'Inter', sans-serif; border: 8px solid #facc15; position: relative; }
            .cert-inner { border: 2px solid #fde68a; padding: 40px; min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .cert-logo { font-size: 13px; font-weight: 700; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
            .cert-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #111827; margin-bottom: 8px; }
            .cert-sub { font-size: 14px; color: #6b7280; margin-bottom: 32px; letter-spacing: 1px; text-transform: uppercase; }
            .cert-name { font-family: 'Playfair Display', serif; font-size: 36px; color: #111827; border-bottom: 3px solid #facc15; padding-bottom: 8px; margin-bottom: 24px; }
            .cert-course { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 8px; }
            .cert-type { font-size: 14px; color: #6b7280; margin-bottom: 32px; }
            .cert-meta { display: flex; gap: 48px; justify-content: center; margin-bottom: 32px; }
            .cert-meta-item { text-align: center; }
            .cert-meta-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
            .cert-meta-value { font-size: 14px; font-weight: 700; color: #111827; margin-top: 4px; }
            .cert-number { font-size: 12px; color: #9ca3af; margin-top: 24px; font-family: monospace; }
            .cert-seal { width: 80px; height: 80px; background: #facc15; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-award-fill text-yellow-500"></i> Certificate Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-900 text-yellow-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-printer-line"></i> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-600 text-lg"></i>
            </button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="p-6">
          <div ref={printRef}>
            <div
              className="relative border-8 border-yellow-400 rounded-2xl overflow-hidden"
              style={{ minHeight: '500px' }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-yellow-400 text-6xl font-bold select-none"
                    style={{ top: `${(i % 3) * 33}%`, left: `${(i % 4) * 25}%`, transform: 'rotate(-15deg)' }}
                  >
                    ✦
                  </div>
                ))}
              </div>

              <div className="relative z-10 border-2 border-yellow-200 m-3 rounded-xl p-10 flex flex-col items-center text-center">
                {/* Org name */}
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">
                  Naloxone Advocates Plymouth
                </p>

                {/* Seal */}
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <i className="ri-award-fill text-gray-900 text-4xl"></i>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificate of Completion
                </h1>
                <p className="text-gray-500 text-sm tracking-widest uppercase mb-8">
                  This is to certify that
                </p>

                {/* Member name */}
                <p
                  className="text-3xl font-bold text-gray-900 border-b-4 border-yellow-400 pb-3 mb-8 px-8"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {memberName}
                </p>

                {/* Course */}
                <p className="text-gray-500 text-sm mb-2">has successfully completed</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{cert.course_name}</p>
                <p className="text-gray-500 text-sm mb-8">{cert.course_type}</p>

                {/* Meta row */}
                <div className="flex gap-12 mb-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Date Issued</p>
                    <p className="font-bold text-gray-900 text-sm mt-1">{formatDate(cert.issued_at)}</p>
                  </div>
                  {cert.expires_at && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Valid Until</p>
                      <p className={`font-bold text-sm mt-1 ${expired ? 'text-red-500' : 'text-gray-900'}`}>
                        {formatDate(cert.expires_at)}
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Issued By</p>
                    <p className="font-bold text-gray-900 text-sm mt-1">{cert.issued_by}</p>
                  </div>
                </div>

                {/* Certificate number */}
                <p className="text-xs text-gray-400 font-mono">
                  Certificate No: {cert.certificate_number}
                </p>

                {expired && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-6 py-3">
                    <p className="text-red-500 font-bold text-sm flex items-center gap-2 justify-center">
                      <i className="ri-error-warning-fill"></i> This certificate has expired
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  userId: string | undefined;
  memberName: string;
};

export default function CertificatesSection({ userId, memberName }: Props) {
  const [certificates, setCertificates] = useState<(Certificate | MockCertificate)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [previewCert, setPreviewCert] = useState<Certificate | MockCertificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    setLoading(true);
    if (!userId) {
      setCertificates(MOCK_CERTIFICATES);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setCertificates(data as Certificate[]);
    } else {
      setCertificates(MOCK_CERTIFICATES);
    }
    setLoading(false);
  };

  const filtered = certificates.filter((c) => {
    if (filter === 'active') return !isExpired(c.expires_at) && c.status !== 'expired';
    if (filter === 'expired') return isExpired(c.expires_at) || c.status === 'expired';
    return true;
  });

  const activeCount = certificates.filter((c) => !isExpired(c.expires_at) && c.status !== 'expired').length;
  const expiredCount = certificates.filter((c) => isExpired(c.expires_at) || c.status === 'expired').length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <i className="ri-award-fill text-yellow-500"></i> Certificates &amp; Achievements
        </h1>
        <p className="text-gray-500 text-sm">Download proof of your completed training and qualifications</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-lime-600">{activeCount}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Active</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{expiredCount}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Expired</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full w-fit">
        {(['all', 'active', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap cursor-pointer capitalize ${
              filter === f ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? `All (${certificates.length})` : f === 'active' ? `Active (${activeCount})` : `Expired (${expiredCount})`}
          </button>
        ))}
      </div>

      {/* Certificate grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-400"></i>
          <p className="text-gray-500 font-semibold text-sm">Loading your certificates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-award-line text-gray-400 text-4xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">No certificates found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {filter === 'expired'
              ? 'You have no expired certificates.'
              : 'Complete a training session or eLearning course to earn your first certificate.'}
          </p>
          <a
            href="/training"
            className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all whitespace-nowrap"
          >
            <i className="ri-calendar-add-fill mr-2"></i>Book Training
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {filtered.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              memberName={memberName}
              onPreview={setPreviewCert}
            />
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-gradient-to-br from-yellow-400 to-lime-400 rounded-2xl p-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-information-fill text-gray-900 text-xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">About Your Certificates</h3>
            <p className="text-gray-800 text-sm leading-relaxed">
              Certificates are issued upon successful completion of in-person training sessions and eLearning courses.
              Most certificates are valid for <strong>2 years</strong>. You can preview and print them as PDF proof of training at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewCert && (
        <CertificatePreviewModal
          cert={previewCert}
          memberName={memberName}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </div>
  );
}
