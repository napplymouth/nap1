import { useState, useEffect } from 'react';
import supabase from '../../../../lib/supabase';

interface ActivityLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  target_name: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  volunteer_approved: { label: 'Approved Volunteer', icon: 'ri-user-add-line', color: 'text-green-600' },
  volunteer_rejected: { label: 'Rejected Volunteer', icon: 'ri-user-unfollow-line', color: 'text-red-600' },
  hours_approved: { label: 'Approved Hours', icon: 'ri-check-double-line', color: 'text-lime-600' },
  hours_flagged: { label: 'Flagged Hours', icon: 'ri-flag-line', color: 'text-orange-600' },
  hours_bulk_approved: { label: 'Bulk Approved Hours', icon: 'ri-checkbox-multiple-line', color: 'text-lime-600' },
  hours_deleted: { label: 'Deleted Hours', icon: 'ri-delete-bin-line', color: 'text-red-600' },
  broadcast_sent: { label: 'Sent Broadcast', icon: 'ri-mail-send-line', color: 'text-yellow-600' },
  admin_invited: { label: 'Invited Admin', icon: 'ri-admin-line', color: 'text-purple-600' },
  email_resent: { label: 'Resent Email', icon: 'ri-refresh-line', color: 'text-sky-600' },
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, [filterType, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const paginatedLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Actions</option>
              <option value="volunteer_approved">Volunteer Approved</option>
              <option value="volunteer_rejected">Volunteer Rejected</option>
              <option value="hours_approved">Hours Approved</option>
              <option value="hours_flagged">Hours Flagged</option>
              <option value="hours_bulk_approved">Bulk Hours Approved</option>
              <option value="hours_deleted">Hours Deleted</option>
              <option value="broadcast_sent">Broadcast Sent</option>
              <option value="admin_invited">Admin Invited</option>
              <option value="email_resent">Email Resent</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('all');
                setDateRange('all');
                setPage(1);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Activity Log List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-history-line text-5xl text-gray-300 mb-3"></i>
            <p className="text-gray-500 text-lg font-medium">No activity logs found</p>
            <p className="text-gray-400 text-sm mt-1">Admin actions will appear here</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {paginatedLogs.map((log) => {
                const config = ACTION_CONFIG[log.action_type] || {
                  label: log.action_type,
                  icon: 'ri-information-line',
                  color: 'text-gray-600',
                };

                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0 ${config.color}`}>
                        <i className={`${config.icon} text-xl`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {log.admin_name}
                              <span className="font-normal text-gray-600 ml-1">
                                {config.label.toLowerCase()}
                              </span>
                              {log.target_name && (
                                <span className="font-semibold text-gray-900 ml-1">
                                  {log.target_name}
                                </span>
                              )}
                            </p>
                            {log.details && (
                              <p className="text-sm text-gray-500 mt-1">{log.details}</p>
                            )}
                          </div>
                          
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {getRelativeTime(log.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    Next
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}