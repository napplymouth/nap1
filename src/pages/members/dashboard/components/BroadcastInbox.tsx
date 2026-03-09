
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  created_at: string;
  isRead?: boolean;
}

interface BroadcastInboxProps {
  userId?: string;
  memberRole?: string;
  onRead?: () => void;
}

// Map member_role values to target_audience values used when broadcasting
const ROLE_TO_AUDIENCE: Record<string, string> = {
  'Peer Trainer': 'peer_trainers',
  'Kit Carrier': 'kit_carriers',
  'First Responder': 'first_responders',
  'Coordinator': 'coordinators',
};

export function getRelevantAudiences(memberRole?: string): string[] {
  const base = ['all_members', 'members'];
  if (!memberRole) return base;
  const mapped = ROLE_TO_AUDIENCE[memberRole];
  return mapped ? [...base, mapped] : base;
}

export default function BroadcastInbox({ userId, memberRole, onRead }: BroadcastInboxProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Broadcast | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const relevantAudiences = getRelevantAudiences(memberRole);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: msgs } = await supabase
        .from('broadcasts')
        .select('id, title, message, target_audience, created_at')
        .in('target_audience', relevantAudiences)
        .order('created_at', { ascending: false });

      const { data: reads } = userId
        ? await supabase
            .from('broadcast_reads')
            .select('broadcast_id')
            .eq('user_id', userId)
        : { data: [] };

      const readSet = new Set((reads ?? []).map((r: any) => r.broadcast_id));
      setReadIds(readSet);
      setBroadcasts(
        (msgs ?? []).map((m: any) => ({ ...m, isRead: readSet.has(m.id) }))
      );
    } finally {
      setLoading(false);
    }
  }, [userId, memberRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsRead = async (broadcast: Broadcast) => {
    setSelected(broadcast);
    if (!broadcast.isRead && userId) {
      await supabase
        .from('broadcast_reads')
        .upsert({ broadcast_id: broadcast.id, user_id: userId }, { onConflict: 'broadcast_id,user_id' });
      setReadIds((prev) => new Set([...prev, broadcast.id]));
      setBroadcasts((prev) =>
        prev.map((b) => (b.id === broadcast.id ? { ...b, isRead: true } : b))
      );
      if (onRead) onRead();
    }
  };

  const unreadCount = broadcasts.filter((b) => !b.isRead).length;
  const filtered = filter === 'unread' ? broadcasts.filter((b) => !b.isRead) : broadcasts;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFullDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const audienceLabel = (val: string) => {
    const map: Record<string, string> = {
      all_members: 'All Members',
      members: 'All Members',
      all_volunteers: 'All Volunteers',
      peer_trainers: 'Peer Trainers',
      kit_carriers: 'Kit Carriers',
      first_responders: 'First Responders',
      coordinators: 'Coordinators',
    };
    return map[val] ?? val;
  };

  const audienceBadgeColor = (val: string) => {
    const map: Record<string, string> = {
      all_members: 'bg-gray-900 text-yellow-400',
      members: 'bg-gray-900 text-yellow-400',
      all_volunteers: 'bg-teal-100 text-teal-700',
      peer_trainers: 'bg-pink-100 text-pink-700',
      kit_carriers: 'bg-lime-100 text-lime-700',
      first_responders: 'bg-red-100 text-red-700',
      coordinators: 'bg-yellow-100 text-yellow-700',
    };
    return map[val] ?? 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-inbox-fill text-yellow-500"></i> Broadcast Inbox
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Messages sent to you by the NAP admin team</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            <span className="text-pink-600 font-bold text-sm whitespace-nowrap">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Messages', value: broadcasts.length, icon: 'ri-mail-fill', color: 'bg-yellow-400', text: 'text-gray-900' },
          { label: 'Unread', value: unreadCount, icon: 'ri-mail-unread-fill', color: 'bg-pink-500', text: 'text-white' },
          { label: 'Read', value: broadcasts.length - unreadCount, icon: 'ri-mail-check-fill', color: 'bg-lime-400', text: 'text-gray-900' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.text} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full w-fit">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f === 'all' ? 'All Messages' : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 flex flex-col items-center gap-4">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-400"></i>
          <p className="text-gray-500 font-semibold text-sm">Loading messages…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-inbox-line text-gray-400 text-4xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No messages yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === 'unread'
              ? 'You\'ve read all your messages.'
              : 'Admin broadcasts will appear here when sent.'}
          </p>
          {filter === 'unread' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all cursor-pointer whitespace-nowrap"
            >
              View All Messages
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => markAsRead(msg)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-4 ${
                  !msg.isRead ? 'bg-yellow-50/60' : ''
                }`}
              >
                {/* Unread dot */}
                <div className="flex-shrink-0 mt-1.5">
                  {!msg.isRead ? (
                    <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !msg.isRead ? 'bg-yellow-400' : 'bg-gray-100'
                }`}>
                  <i className={`ri-megaphone-fill text-base ${!msg.isRead ? 'text-gray-900' : 'text-gray-400'}`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={`text-sm leading-tight ${!msg.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {msg.title}
                    </p>
                    {!msg.isRead && (
                      <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{msg.message}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <i className="ri-time-line"></i>{formatDate(msg.created_at)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${audienceBadgeColor(msg.target_audience)}`}>
                      {audienceLabel(msg.target_audience)}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-300 mt-1">
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-megaphone-fill text-gray-900 text-lg"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">From NAP Admin</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatFullDate(selected.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${audienceBadgeColor(selected.target_audience)}`}>
                  <i className="ri-group-line mr-1"></i>{audienceLabel(selected.target_audience)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{selected.title}</h2>
              <div className="prose prose-sm max-w-none">
                {selected.message.split('\n').map((line, i) => (
                  <p key={i} className={`text-gray-700 text-sm leading-relaxed ${line === '' ? 'mt-3' : 'mt-1'}`}>
                    {line || <>&nbsp;</>}
                  </p>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="bg-lime-100 text-lime-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                <i className="ri-check-double-line"></i> Read
              </span>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-900 text-yellow-400 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
