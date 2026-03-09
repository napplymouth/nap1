import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../../lib/supabase';
import VolunteerTable from './components/VolunteerTable';
import MemberTable from './components/MemberTable';
import EventsManager from './components/EventsManager';
import BroadcastManager from './components/BroadcastManager';
import HoursManager from './components/HoursManager';
import InviteAdmin from './components/InviteAdmin';
import ActivityLog from './components/ActivityLog';
import ProductsManager from './components/ProductsManager';
import OrdersManager from './components/OrdersManager';
import CertificatesManager from './components/CertificatesManager';
import ImpactStatsManager from './components/ImpactStatsManager';
import SessionLogsManager from './components/SessionLogsManager';
import NaloxoneKitManager from './components/NaloxoneKitManager';
import EmailLog from './components/EmailLog';
import ProfessionalsManager from './components/ProfessionalsManager';
import CpdLogsManager from './components/CpdLogsManager';
import PeerGoalsManager from './components/PeerGoalsManager';

interface VolunteerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  volunteer_role: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  phone?: string;
  notes?: string;
  reviewed_at?: string;
}

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

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

type AdminSection = 'volunteers' | 'members' | 'professionals' | 'events' | 'broadcast' | 'hours' | 'invite' | 'activity' | 'products' | 'orders' | 'certificates' | 'impact' | 'sessions' | 'naloxone' | 'email_log' | 'profile' | 'cpd_logs' | 'peer_goals';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [volunteerStats, setVolunteerStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [memberStats, setMemberStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [professionalStats, setProfessionalStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [adminId, setAdminId] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('volunteers');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profilePasswordError, setProfilePasswordError] = useState('');
  const [profilePasswordSuccess, setProfilePasswordSuccess] = useState('');
  const [profilePasswordLoading, setProfilePasswordLoading] = useState(false);
  const [showProfileCurrent, setShowProfileCurrent] = useState(false);
  const [showProfileNew, setShowProfileNew] = useState(false);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadVolunteers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const all = (data || []) as VolunteerProfile[];
      setVolunteers(all);
      setVolunteerStats({
        total: all.length,
        pending: all.filter((v) => v.approval_status === 'pending').length,
        approved: all.filter((v) => v.approval_status === 'approved').length,
        rejected: all.filter((v) => v.approval_status === 'rejected').length,
      });
    } catch (err) {
      console.error('Error loading volunteers:', err);
      showToast('error', 'Failed to load volunteers.');
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('member_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const all = (data || []) as MemberProfile[];
      setMembers(all);
      setMemberStats({
        total: all.length,
        pending: all.filter((m) => m.approval_status === 'pending').length,
        approved: all.filter((m) => m.approval_status === 'approved').length,
        rejected: all.filter((m) => m.approval_status === 'rejected').length,
      });
    } catch (err) {
      console.error('Error loading members:', err);
      showToast('error', 'Failed to load members.');
    }
  }, []);

  const loadProfessionals = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? null;
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-professionals`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
          },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch professionals');

      const all = json.data || [];
      setProfessionalStats({
        total: all.length,
        pending: all.filter((p: any) => p.approval_status === 'pending').length,
        approved: all.filter((p: any) => p.approval_status === 'approved').length,
        rejected: all.filter((p: any) => p.approval_status === 'rejected').length,
      });
    } catch (err) {
      console.error('Error loading professionals:', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) navigate('/admin/login');
          return;
        }

        const { data: profile } = await supabase
          .from('volunteer_profiles')
          .select('is_admin, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!profile?.is_admin) {
          navigate('/admin/login');
          return;
        }

        setAdminName(profile.full_name || 'Admin');
        setAdminId(session.user.id);
        await Promise.all([loadVolunteers(), loadMembers(), loadProfessionals()]);
      } catch (err) {
        console.error('Admin check error:', err);
        if (!cancelled) navigate('/admin/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runCheck();

    return () => { cancelled = true; };
  }, [navigate, loadVolunteers, loadMembers, loadProfessionals]);

  const handleVolunteerApprove = async (id: string, userId: string) => {
    setActionLoading(true);
    try {
      const volunteer = volunteers.find((v) => v.id === id);
      const volunteerName = volunteer?.full_name || 'Unknown';

      const { error } = await supabase
        .from('volunteer_profiles')
        .update({
          approval_status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'volunteer_approved',
        target_name: volunteerName,
        target_id: userId,
        details: null,
      });

      showToast('success', 'Volunteer approved successfully! They can now log in.');
      await loadVolunteers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to approve volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVolunteerReject = async (id: string, userId: string) => {
    setActionLoading(true);
    try {
      const volunteer = volunteers.find((v) => v.id === id);
      const volunteerName = volunteer?.full_name || 'Unknown';

      const { error } = await supabase
        .from('volunteer_profiles')
        .update({
          approval_status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'volunteer_rejected',
        target_name: volunteerName,
        target_id: userId,
        details: null,
      });

      showToast('success', 'Application rejected.');
      await loadVolunteers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMemberApprove = async (id: string, userId: string) => {
    setActionLoading(true);
    try {
      const member = members.find((m) => m.id === id);
      const memberName = member?.full_name || 'Unknown';

      const { error } = await supabase
        .from('member_profiles')
        .update({
          approval_status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'member_approved',
        target_name: memberName,
        target_id: userId,
        details: null,
      });

      // Send approval email notification
      if (member?.email) {
        fetch(
          `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/notify-member-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              memberName: member.full_name,
              memberEmail: member.email,
              memberRole: member.member_role,
              status: 'approved',
            }),
          }
        ).catch(() => {/* silent — email is best-effort */});
      }

      showToast('success', 'Member approved successfully! They can now log in.');
      await loadMembers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to approve member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMemberReject = async (id: string, userId: string) => {
    setActionLoading(true);
    try {
      const member = members.find((m) => m.id === id);
      const memberName = member?.full_name || 'Unknown';

      const { error } = await supabase
        .from('member_profiles')
        .update({
          approval_status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('admin_activity_log').insert({
        admin_id: adminId,
        admin_name: adminName,
        action_type: 'member_rejected',
        target_name: memberName,
        target_id: userId,
        details: null,
      });

      // Send rejection email notification
      if (member?.email) {
        fetch(
          `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/notify-member-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              memberName: member.full_name,
              memberEmail: member.email,
              memberRole: member.member_role,
              status: 'rejected',
            }),
          }
        ).catch(() => {/* silent — email is best-effort */});
      }

      showToast('success', 'Application rejected.');
      await loadMembers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const filteredVolunteersBySearch = volunteers.filter((v) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      v.full_name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.volunteer_role?.toLowerCase().includes(q)
    );
  });

  const filteredMembersBySearch = members.filter((m) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.member_role?.toLowerCase().includes(q)
    );
  });

  const TABS: { key: FilterTab; label: string; icon: string; color: string }[] = [
    { key: 'pending', label: 'Pending', icon: 'ri-time-fill', color: 'text-yellow-600' },
    { key: 'approved', label: 'Approved', icon: 'ri-checkbox-circle-fill', color: 'text-lime-600' },
    { key: 'rejected', label: 'Rejected', icon: 'ri-close-circle-fill', color: 'text-red-500' },
    { key: 'all', label: 'All', icon: 'ri-team-fill', color: 'text-gray-600' },
  ];

  const currentStats = activeSection === 'volunteers' ? volunteerStats : memberStats;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilePasswordError('');
    setProfilePasswordSuccess('');

    if (profileNewPassword.length < 8) {
      setProfilePasswordError('New password must be at least 8 characters.');
      return;
    }
    if (profileNewPassword !== profileConfirmPassword) {
      setProfilePasswordError('New passwords do not match.');
      return;
    }

    setProfilePasswordLoading(true);
    try {
      // Re-authenticate first to verify current password
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error('No active session found.');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: profileCurrentPassword,
      });
      if (signInErr) {
        setProfilePasswordError('Current password is incorrect. Please try again.');
        setProfilePasswordLoading(false);
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({ password: profileNewPassword });
      if (updateErr) throw updateErr;

      setProfilePasswordSuccess('Password updated successfully!');
      setProfileCurrentPassword('');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
    } catch (err: any) {
      setProfilePasswordError(err?.message ?? 'Failed to update password. Please try again.');
    } finally {
      setProfilePasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Top Nav */}
      <nav className="bg-gray-900 sticky top-0 z-40 shadow-lg">
        <div className="px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                alt="NAP"
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full font-bold text-sm">
              <i className="ri-shield-keyhole-fill"></i>
              Admin Panel
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white text-sm font-bold">{adminName}</span>
              <span className="text-gray-400 text-xs">Administrator</span>
            </div>
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'profile'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <i className="ri-user-settings-line"></i>
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-600 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-logout-box-line"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Section Switcher */}
        <div className="flex gap-2 mb-8 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm w-fit flex-wrap">
          <button
            onClick={() => { setActiveSection('volunteers'); setFilter('pending'); setSearch(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'volunteers'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-team-fill"></i>
            Volunteers
            {volunteerStats.pending > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {volunteerStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveSection('members'); setFilter('pending'); setSearch(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'members'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-user-heart-fill"></i>
            Members
            {memberStats.pending > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {memberStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveSection('professionals'); setSearch(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'professionals'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-stethoscope-fill"></i>
            Professionals
            {professionalStats.pending > 0 && (
              <span className="bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                {professionalStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('cpd_logs')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'cpd_logs'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-medal-line"></i>
            CPD Logs
          </button>
          <button
            onClick={() => setActiveSection('peer_goals')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'peer_goals'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-flag-2-line"></i>
            Peer Goals
          </button>
          <button
            onClick={() => setActiveSection('naloxone')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'naloxone'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-first-aid-kit-fill"></i>
            Naloxone Kits
          </button>
          <button
            onClick={() => setActiveSection('certificates')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'certificates'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-award-fill"></i>
            Certificates
          </button>
          <button
            onClick={() => setActiveSection('impact')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'impact'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-bar-chart-box-fill"></i>
            Impact Stats
          </button>
          <button
            onClick={() => setActiveSection('sessions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'sessions'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-calendar-check-fill"></i>
            Session Logs
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'events'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-calendar-event-fill"></i>
            Events
          </button>
          <button
            onClick={() => setActiveSection('hours')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'hours'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-time-fill"></i>
            Hours
          </button>
          <button
            onClick={() => setActiveSection('broadcast')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'broadcast'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-broadcast-fill"></i>
            Broadcast
          </button>
          <button
            onClick={() => setActiveSection('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'products'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-store-2-fill"></i>
            Products
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'orders'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-shopping-bag-fill"></i>
            Orders
          </button>
          <button
            onClick={() => setActiveSection('invite')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'invite'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-shield-user-fill"></i>
            Invite Admin
          </button>
          <button
            onClick={() => setActiveSection('activity')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'activity'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-history-fill"></i>
            Activity Log
          </button>
          <button
            onClick={() => setActiveSection('email_log')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'email_log'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className="ri-mail-send-fill"></i>
            Email Log
          </button>
        </div>

        {/* ── VOLUNTEERS SECTION ── */}
        {activeSection === 'volunteers' && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Volunteer Applications</h1>
              <p className="text-gray-500 text-sm">Review, approve or reject volunteer applications from this panel.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Applications', value: volunteerStats.total, icon: 'ri-team-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
                { label: 'Pending Review', value: volunteerStats.pending, icon: 'ri-time-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
                { label: 'Approved', value: volunteerStats.approved, icon: 'ri-checkbox-circle-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
                { label: 'Rejected', value: volunteerStats.rejected, icon: 'ri-close-circle-fill', bg: 'bg-red-500', text: 'text-white', sub: 'text-red-100' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className={`${s.icon} ${s.text} text-xl`}></i>
                    </div>
                  </div>
                  <div className={`text-4xl font-bold ${s.text} mb-1`}>{s.value}</div>
                  <div className={`text-sm font-semibold ${s.sub}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending Alert Banner */}
            {volunteerStats.pending > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-notification-3-fill text-gray-900 text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-yellow-800 text-sm">
                    {volunteerStats.pending} application{volunteerStats.pending > 1 ? 's' : ''} waiting for your review
                  </p>
                  <p className="text-yellow-700 text-xs mt-0.5">
                    Volunteers cannot log in until you approve their application.
                  </p>
                </div>
                <button
                  onClick={() => setFilter('pending')}
                  className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all cursor-pointer whitespace-nowrap"
                >
                  Review Now
                </button>
              </div>
            )}

            {/* Search + Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                        filter === tab.key
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`${tab.icon} ${filter === tab.key ? tab.color : ''}`}></i>
                      {tab.label}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          filter === tab.key ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {tab.key === 'all'
                          ? volunteerStats.total
                          : tab.key === 'pending'
                          ? volunteerStats.pending
                          : tab.key === 'approved'
                          ? volunteerStats.approved
                          : volunteerStats.rejected}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
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
              </div>

              {/* Table */}
              <div className="p-5">
                <VolunteerTable
                  volunteers={filteredVolunteersBySearch}
                  filter={filter}
                  onApprove={handleVolunteerApprove}
                  onReject={handleVolunteerReject}
                  loading={loading || actionLoading}
                />
              </div>
            </div>
          </>
        )}

        {/* ── MEMBERS SECTION ── */}
        {activeSection === 'members' && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Member Applications</h1>
              <p className="text-gray-500 text-sm">Review, approve or reject member (peers) applications from this panel.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Applications', value: memberStats.total, icon: 'ri-user-heart-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
                { label: 'Pending Review', value: memberStats.pending, icon: 'ri-time-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
                { label: 'Approved', value: memberStats.approved, icon: 'ri-checkbox-circle-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
                { label: 'Rejected', value: memberStats.rejected, icon: 'ri-close-circle-fill', bg: 'bg-red-500', text: 'text-white', sub: 'text-red-100' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className={`${s.icon} ${s.text} text-xl`}></i>
                    </div>
                  </div>
                  <div className={`text-4xl font-bold ${s.text} mb-1`}>{s.value}</div>
                  <div className={`text-sm font-semibold ${s.sub}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending Alert Banner */}
            {memberStats.pending > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-notification-3-fill text-gray-900 text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-yellow-800 text-sm">
                    {memberStats.pending} application{memberStats.pending > 1 ? 's' : ''} waiting for your review
                  </p>
                  <p className="text-yellow-700 text-xs mt-0.5">
                    Members cannot log in until you approve their application.
                  </p>
                </div>
                <button
                  onClick={() => setFilter('pending')}
                  className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-yellow-500 transition-all cursor-pointer whitespace-nowrap"
                >
                  Review Now
                </button>
              </div>
            )}

            {/* Search + Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                        filter === tab.key
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`${tab.icon} ${filter === tab.key ? tab.color : ''}`}></i>
                      {tab.label}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          filter === tab.key ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {tab.key === 'all'
                          ? memberStats.total
                          : tab.key === 'pending'
                          ? memberStats.pending
                          : tab.key === 'approved'
                          ? memberStats.approved
                          : memberStats.rejected}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
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
              </div>

              {/* Table */}
              <div className="p-5">
                <MemberTable
                  members={filteredMembersBySearch}
                  filter={filter}
                  onApprove={handleMemberApprove}
                  onReject={handleMemberReject}
                  loading={loading || actionLoading}
                />
              </div>
            </div>
          </>
        )}

        {/* ── PROFESSIONALS SECTION ── */}
        {activeSection === 'professionals' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Professional Applications</h1>
              <p className="text-gray-500 text-sm">Review, approve or reject healthcare professional applications from this panel.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Applications', value: professionalStats.total, icon: 'ri-stethoscope-fill', bg: 'bg-gray-900', text: 'text-white', sub: 'text-gray-400' },
                { label: 'Pending Review', value: professionalStats.pending, icon: 'ri-time-fill', bg: 'bg-yellow-400', text: 'text-gray-900', sub: 'text-gray-700' },
                { label: 'Approved', value: professionalStats.approved, icon: 'ri-checkbox-circle-fill', bg: 'bg-lime-500', text: 'text-white', sub: 'text-lime-100' },
                { label: 'Rejected', value: professionalStats.rejected, icon: 'ri-close-circle-fill', bg: 'bg-red-500', text: 'text-white', sub: 'text-red-100' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className={`${s.icon} ${s.text} text-xl`}></i>
                    </div>
                  </div>
                  <div className={`text-4xl font-bold ${s.text} mb-1`}>{s.value}</div>
                  <div className={`text-sm font-semibold ${s.sub}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending Alert Banner */}
            {professionalStats.pending > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-notification-3-fill text-gray-900 text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-yellow-800 text-sm">
                    {professionalStats.pending} professional application{professionalStats.pending > 1 ? 's' : ''} waiting for your review
                  </p>
                  <p className="text-yellow-700 text-xs mt-0.5">
                    Professionals cannot access the portal until you approve their application.
                  </p>
                </div>
              </div>
            )}

            <ProfessionalsManager onStatsChange={(stats) => setProfessionalStats(stats)} />
          </>
        )}

        {/* ── CPD LOGS SECTION ── */}
        {activeSection === 'cpd_logs' && <CpdLogsManager />}

        {/* ── PEER GOALS SECTION ── */}
        {activeSection === 'peer_goals' && <PeerGoalsManager />}

        {/* ── NALOXONE KITS SECTION ── */}
        {activeSection === 'naloxone' && <NaloxoneKitManager />}

        {/* ── CERTIFICATES SECTION ── */}
        {activeSection === 'certificates' && <CertificatesManager />}

        {/* ── IMPACT STATS SECTION ── */}
        {activeSection === 'impact' && <ImpactStatsManager />}

        {/* ── SESSION LOGS SECTION ── */}
        {activeSection === 'sessions' && <SessionLogsManager />}

        {/* ── EVENTS SECTION ── */}
        {activeSection === 'events' && <EventsManager />}

        {/* ── HOURS SECTION ── */}
        {activeSection === 'hours' && <HoursManager adminId={adminId} adminName={adminName} />}

        {/* ── BROADCAST SECTION ── */}
        {activeSection === 'broadcast' && <BroadcastManager adminId={adminId} adminName={adminName} />}

        {/* ── PRODUCTS SECTION ── */}
        {activeSection === 'products' && <ProductsManager />}

        {/* ── ORDERS SECTION ── */}
        {activeSection === 'orders' && <OrdersManager />}

        {/* ── INVITE ADMIN SECTION ── */}
        {activeSection === 'invite' && <InviteAdmin adminId={adminId} adminName={adminName} />}

        {/* ── ACTIVITY LOG SECTION ── */}
        {activeSection === 'activity' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Activity Log</h1>
              <p className="text-gray-500 text-sm">Track all admin actions including approvals, rejections, and broadcasts.</p>
            </div>
            <ActivityLog />
          </>
        )}

        {/* ── EMAIL LOG SECTION ── */}
        {activeSection === 'email_log' && <EmailLog />}

        {/* ── PROFILE SETTINGS SECTION ── */}
        {activeSection === 'profile' && (
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
              <p className="text-gray-500 text-sm">Manage your admin account and update your password.</p>
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-admin-fill text-yellow-400 text-3xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{adminName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <i className="ri-shield-keyhole-fill"></i>
                      Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <i className="ri-lock-password-line text-gray-700 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Set a new secure password for your account</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                {profilePasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{profilePasswordError}</span>
                  </div>
                )}
                {profilePasswordSuccess && (
                  <div className="bg-lime-50 border border-lime-200 text-lime-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill flex-shrink-0"></i>
                    <span>{profilePasswordSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type={showProfileCurrent ? 'text' : 'password'}
                      value={profileCurrentPassword}
                      onChange={(e) => setProfileCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileCurrent(!showProfileCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={showProfileCurrent ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-2-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type={showProfileNew ? 'text' : 'password'}
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileNew(!showProfileNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={showProfileNew ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {/* Password strength hints */}
                  {profileNewPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {[
                        { ok: profileNewPassword.length >= 8, label: 'At least 8 characters' },
                        { ok: /[A-Z]/.test(profileNewPassword), label: 'One uppercase letter' },
                        { ok: /[0-9]/.test(profileNewPassword), label: 'One number' },
                        { ok: /[^A-Za-z0-9]/.test(profileNewPassword), label: 'One special character' },
                      ].map((hint) => (
                        <div key={hint.label} className={`flex items-center gap-2 text-xs ${hint.ok ? 'text-lime-600' : 'text-gray-400'}`}>
                          <i className={hint.ok ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
                          {hint.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-2-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type={showProfileConfirm ? 'text' : 'password'}
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfileConfirm(!showProfileConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={showProfileConfirm ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {profileConfirmPassword.length > 0 && profileNewPassword !== profileConfirmPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="ri-close-circle-fill"></i> Passwords do not match
                    </p>
                  )}
                  {profileConfirmPassword.length > 0 && profileNewPassword === profileConfirmPassword && (
                    <p className="text-xs text-lime-600 mt-1 flex items-center gap-1">
                      <i className="ri-checkbox-circle-fill"></i> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={profilePasswordLoading}
                  className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {profilePasswordLoading ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Updating Password…</>
                  ) : (
                    <><i className="ri-shield-check-line"></i>Update Password</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Admin Panel · Naloxone Advocates Plymouth ·{' '}
          <Link to="/" className="hover:text-gray-600 transition-colors">Back to site</Link>
        </p>
      </div>
    </div>
  );
}