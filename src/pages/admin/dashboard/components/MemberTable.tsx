import { useState } from 'react';

interface MemberProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  member_role: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
  reviewed_at?: string;
}

interface MemberTableProps {
  members: MemberProfile[];
  filter: 'all' | 'pending' | 'approved' | 'rejected';
  onApprove: (id: string, userId: string) => void;
  onReject: (id: string, userId: string) => void;
  loading: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  peer_trainer: 'Peer Trainer',
  volunteer: 'Volunteer',
  community_member: 'Community Member',
};

const ROLE_COLORS: Record<string, string> = {
  peer_trainer: 'bg-pink-100 text-pink-700',
  volunteer: 'bg-lime-100 text-lime-700',
  community_member: 'bg-yellow-100 text-yellow-700',
};

export default function MemberTable({
  members,
  filter,
  onApprove,
  onReject,
  loading,
}: MemberTableProps) {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    id: string;
    userId: string;
    name: string;
  } | null>(null);

  const filtered = members.filter((m) => {
    if (filter === 'all') return true;
    return m.approval_status === filter;
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      onApprove(confirmAction.id, confirmAction.userId);
    } else {
      onReject(confirmAction.id, confirmAction.userId);
    }
    setConfirmAction(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <i className="ri-loader-4-line text-5xl animate-spin mb-3"></i>
        <p className="font-semibold">Loading members…</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <i className="ri-user-search-line text-5xl mb-3"></i>
        <p className="font-semibold text-lg">No members found</p>
        <p className="text-sm mt-1">
          {filter === 'pending'
            ? 'No pending applications right now.'
            : filter === 'approved'
            ? 'No approved members yet.'
            : filter === 'rejected'
            ? 'No rejected applications.'
            : 'No members registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmAction.type === 'approve' ? 'bg-lime-100' : 'bg-red-100'
              }`}
            >
              <i
                className={`text-3xl ${
                  confirmAction.type === 'approve'
                    ? 'ri-checkbox-circle-fill text-lime-600'
                    : 'ri-close-circle-fill text-red-500'
                }`}
              ></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {confirmAction.type === 'approve' ? 'Approve Member?' : 'Reject Application?'}
            </h3>
            <p className="text-gray-600 text-sm text-center mb-6">
              {confirmAction.type === 'approve'
                ? `${confirmAction.name} will be able to log in and access the members area.`
                : `${confirmAction.name}'s application will be rejected. They will not be able to log in.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer whitespace-nowrap ${
                  confirmAction.type === 'approve'
                    ? 'bg-lime-500 hover:bg-lime-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{member.full_name}</h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        member.approval_status === 'approved'
                          ? 'bg-lime-100 text-lime-700'
                          : member.approval_status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {member.approval_status === 'approved'
                        ? '✓ Approved'
                        : member.approval_status === 'rejected'
                        ? '✗ Rejected'
                        : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{member.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        ROLE_COLORS[member.member_role] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ROLE_LABELS[member.member_role] || member.member_role}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-calendar-line"></i>
                      Applied{' '}
                      {new Date(member.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {member.reviewed_at && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-check-double-line"></i>
                        Reviewed{' '}
                        {new Date(member.reviewed_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {member.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'approve',
                          id: member.id,
                          userId: member.user_id,
                          name: member.full_name,
                        })
                      }
                      className="bg-lime-500 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-lime-600 transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center gap-2"
                    >
                      <i className="ri-checkbox-circle-line"></i>
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'reject',
                          id: member.id,
                          userId: member.user_id,
                          name: member.full_name,
                        })
                      }
                      className="bg-red-50 text-red-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                    >
                      <i className="ri-close-circle-line"></i>
                      Reject
                    </button>
                  </>
                )}
                {member.approval_status === 'approved' && (
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'reject',
                        id: member.id,
                        userId: member.user_id,
                        name: member.full_name,
                      })
                    }
                    className="bg-red-50 text-red-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-user-forbid-line"></i>
                    Revoke Access
                  </button>
                )}
                {member.approval_status === 'rejected' && (
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'approve',
                        id: member.id,
                        userId: member.user_id,
                        name: member.full_name,
                      })
                    }
                    className="bg-lime-50 text-lime-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-lime-100 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-user-received-line"></i>
                    Re-approve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}