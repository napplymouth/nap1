import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import supabase from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BroadcastInbox from '../../members/dashboard/components/BroadcastInbox';
import CertificatesSection from '../../members/dashboard/components/CertificatesSection';
import ProfessionalResources from './components/ProfessionalResources';
import CpdLog from './components/CpdLog';

interface ProfessionalProfile {
  id: string;
  full_name: string;
  email: string;
  profession_type: string;
  employer_organisation: string;
  approval_status: string;
  created_at: string;
}

interface QuickStats {
  totalBookings: number;
  upcomingBookings: number;
  certificates: number;
  resourcesDownloaded: number;
}

export default function ProfessionalsDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [stats, setStats] = useState<QuickStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    certificates: 0,
    resourcesDownloaded: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/professionals/login');
      return;
    }
    loadProfile();
    loadStats();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate('/professionals/login');
        return;
      }

      if (data.approval_status !== 'approved') {
        navigate('/professionals/login');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const [certificatesRes, downloadsRes] = await Promise.all([
        supabase
          .from('certificates')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('resource_downloads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      setStats({
        totalBookings: 0,
        upcomingBookings: 0,
        certificates: certificatesRes.count || 0,
        resourcesDownloaded: downloadsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/professionals/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'inbox', label: 'Inbox', icon: 'ri-mail-line' },
    { id: 'bookings', label: 'My Bookings', icon: 'ri-calendar-check-line' },
    { id: 'certificates', label: 'Certificates', icon: 'ri-award-line' },
    { id: 'cpd', label: 'CPD Log', icon: 'ri-file-list-3-line' },
    { id: 'resources', label: 'Resources', icon: 'ri-folder-line' },
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i className="ri-menu-line text-xl text-gray-700"></i>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
            <i className="ri-hospital-line text-white text-lg"></i>
          </div>
          <span className="font-semibold text-gray-900">Professional Portal</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i className="ri-logout-box-line text-xl text-gray-700"></i>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-50 lg:z-auto`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                <i className="ri-hospital-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg whitespace-nowrap">Professional Portal</h1>
                <p className="text-xs text-gray-500 whitespace-nowrap">Healthcare Members</p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-700 font-semibold text-lg">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{profile.full_name}</h3>
                <p className="text-sm text-cyan-600 truncate">{profile.profession_type}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{profile.employer_organisation}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} text-xl`}></i>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <i className="ri-logout-box-line text-xl"></i>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name.split(' ')[0]}!</h2>
                    <p className="text-cyan-100 text-lg">
                      {profile.profession_type} at {profile.employer_organisation}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <i className="ri-stethoscope-line text-4xl"></i>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <i className="ri-calendar-check-line text-2xl text-cyan-600"></i>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Total Bookings</h3>
                  <p className="text-sm text-gray-500">Training sessions attended</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="ri-calendar-event-line text-2xl text-blue-600"></i>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.upcomingBookings}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upcoming</h3>
                  <p className="text-sm text-gray-500">Sessions scheduled</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <i className="ri-award-line text-2xl text-teal-600"></i>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.certificates}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Certificates</h3>
                  <p className="text-sm text-gray-500">Earned credentials</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <i className="ri-download-line text-2xl text-indigo-600"></i>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.resourcesDownloaded}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Resources</h3>
                  <p className="text-sm text-gray-500">Downloaded materials</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-cyan-600 hover:bg-cyan-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                      <i className="ri-calendar-line text-2xl text-cyan-600 group-hover:text-white"></i>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 whitespace-nowrap">Book Training</h4>
                      <p className="text-sm text-gray-500 whitespace-nowrap">Schedule a session</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <i className="ri-folder-download-line text-2xl text-blue-600 group-hover:text-white"></i>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 whitespace-nowrap">Browse Resources</h4>
                      <p className="text-sm text-gray-500 whitespace-nowrap">Clinical materials</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-600 hover:bg-teal-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                      <i className="ri-file-text-line text-2xl text-teal-600 group-hover:text-white"></i>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 whitespace-nowrap">View Certificates</h4>
                      <p className="text-sm text-gray-500 whitespace-nowrap">CPD evidence</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h2>
                <p className="text-gray-600">Messages and announcements from the team</p>
              </div>
              <BroadcastInbox />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
                <p className="text-gray-600">View and manage your training session bookings</p>
              </div>
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-calendar-line text-4xl text-cyan-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Book your first training session to get started</p>
                <button
                  onClick={() => navigate('/booking')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Browse Training Sessions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificates</h2>
                <p className="text-gray-600">Your earned certificates and CPD evidence</p>
              </div>
              <CertificatesSection />
            </div>
          )}

          {activeTab === 'cpd' && (
            <div className="max-w-5xl mx-auto">
              <CpdLog />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="max-w-5xl mx-auto">
              <ProfessionalResources />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
                <p className="text-gray-600">Manage your professional account information</p>
              </div>
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profession Type</label>
                    <input
                      type="text"
                      value={profile.profession_type}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employer / Organisation</label>
                    <input
                      type="text"
                      value={profile.employer_organisation}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      To update your profile information, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}