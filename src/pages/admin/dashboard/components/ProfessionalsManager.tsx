import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface Professional {
  id: string;
  full_name: string;
  email: string;
  profession_type: string;
  employer_organisation: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface Props {
  onStatsChange?: (stats: Stats) => void;
}

export default function ProfessionalsManager({ onStatsChange }: Props) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [professionFilter, setProfessionFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  const computeAndEmitStats = useCallback((list: Professional[]) => {
    if (!onStatsChange) return;
    onStatsChange({
      total: list.length,
      pending: list.filter(p => p.approval_status === 'pending').length,
      approved: list.filter(p => p.approval_status === 'approved').length,
      rejected: list.filter(p => p.approval_status === 'rejected').length,
    });
  }, [onStatsChange]);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
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
      const list: Professional[] = json.data || [];
      setProfessionals(list);
      computeAndEmitStats(list);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, details: string) => {
    try {
      await supabase.from('admin_activity_log').insert({
        action,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateProfessionalStatus = async (professional: Professional, approval_status: 'approved' | 'rejected') => {
    setActionLoading(professional.id);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-professionals`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: professional.id, approval_status }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update professional');

      await logActivity(
        approval_status === 'approved' ? 'Professional Approved' : 'Professional Rejected',
        `${approval_status === 'approved' ? 'Approved' : 'Rejected'} professional application for ${professional.full_name} (${professional.email}) - ${professional.profession_type} at ${professional.employer_organisation}`
      );

      try {
        await fetch(
          `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/notify-professional-status`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              professionalName: professional.full_name,
              professionalEmail: professional.email,
              professionType: professional.profession_type,
              employerOrganisation: professional.employer_organisation,
              status: approval_status,
            }),
          }
        );
      } catch (notifyErr) {
        console.error('Failed to send status notification email:', notifyErr);
      }

      setProfessionals(prev => {
        const updated = prev.map(p => p.id === professional.id ? { ...p, approval_status } : p);
        computeAndEmitStats(updated);
        return updated;
      });

      setShowConfirmModal(false);
      setShowDetailModal(false);
      setSelectedProfessional(null);
    } catch (error) {
      console.error(`Error updating professional:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (professional: Professional) => updateProfessionalStatus(professional, 'approved');
  const handleReject = (professional: Professional) => updateProfessionalStatus(professional, 'rejected');

  const openConfirmModal = (professional: Professional, action: 'approve' | 'reject') => {
    setSelectedProfessional(professional);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = 
      prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.employer_organisation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prof.approval_status === statusFilter;
    const matchesProfession = professionFilter === 'all' || prof.profession_type === professionFilter;

    return matchesSearch && matchesStatus && matchesProfession;
  });

  const pendingCount = professionals.filter(p => p.approval_status === 'pending').length;
  const approvedCount = professionals.filter(p => p.approval_status === 'approved').length;
  const rejectedCount = professionals.filter(p => p.approval_status === 'rejected').length;

  const professionTypes = Array.from(new Set(professionals.map(p => p.profession_type)));

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <i className="ri-loader-4-line text-2xl animate-spin"></i>
          <span>Loading professionals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{professionals.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-xl text-yellow-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-line text-xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="ri-close-line text-xl text-red-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email, or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
            <select
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Professions</option>
              {professionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profession</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProfessionals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <i className="ri-user-search-line text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500">No professionals found</p>
                  </td>
                </tr>
              ) : (
                filteredProfessionals.map((prof) => (
                  <tr key={prof.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{prof.full_name}</p>
                        <p className="text-sm text-gray-500">{prof.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{prof.profession_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{prof.employer_organisation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(prof.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(prof.approval_status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProfessional(prof);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                        {prof.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmModal(prof, 'approve')}
                              disabled={actionLoading === prof.id}
                              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {actionLoading === prof.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => openConfirmModal(prof, 'reject')}
                              disabled={actionLoading === prof.id}
                              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {actionLoading === prof.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                'Reject'
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Professional Application Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedProfessional.full_name}</h4>
                  <p className="text-gray-600 mt-1">{selectedProfessional.email}</p>
                </div>
                {getStatusBadge(selectedProfessional.approval_status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Profession Type</p>
                  <p className="font-medium text-gray-900">{selectedProfessional.profession_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Organisation</p>
                  <p className="font-medium text-gray-900">{selectedProfessional.employer_organisation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Applied On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedProfessional.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedProfessional.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {selectedProfessional.approval_status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openConfirmModal(selectedProfessional, 'approve')}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                  >
                    <i className="ri-check-line mr-2"></i>
                    Approve Application
                  </button>
                  <button
                    onClick={() => openConfirmModal(selectedProfessional, 'reject')}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedProfessional && confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                confirmAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`text-2xl ${
                  confirmAction === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
                }`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmAction === 'approve' ? 'Approve Application?' : 'Reject Application?'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {confirmAction === 'approve' 
                ? `Are you sure you want to approve ${selectedProfessional.full_name}'s application? They will gain access to the professionals portal.`
                : `Are you sure you want to reject ${selectedProfessional.full_name}'s application? This action can be reversed later if needed.`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction === 'approve' 
                  ? handleApprove(selectedProfessional) 
                  : handleReject(selectedProfessional)
                }
                disabled={actionLoading !== null}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium whitespace-nowrap ${
                  confirmAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading !== null ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : (
                  confirmAction === 'approve' ? 'Approve' : 'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}