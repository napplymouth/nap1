import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../lib/supabase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  phone?: string;
}

interface Order {
  id: string;
  customer_name: string;
  email: string;
  address: OrderAddress;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

type StatusFilter = 'all' | 'paid' | 'processing' | 'shipped' | 'completed' | 'refunded';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  paid:       { label: 'Paid',       bg: 'bg-green-100',  text: 'text-green-700',  icon: 'ri-checkbox-circle-fill' },
  processing: { label: 'Processing', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'ri-loader-4-line' },
  shipped:    { label: 'Shipped',    bg: 'bg-sky-100',    text: 'text-sky-700',    icon: 'ri-truck-line' },
  completed:  { label: 'Completed',  bg: 'bg-lime-100',   text: 'text-lime-700',   icon: 'ri-check-double-line' },
  refunded:   { label: 'Refunded',   bg: 'bg-red-100',    text: 'text-red-600',    icon: 'ri-refund-2-line' },
};

const STATUS_OPTIONS = ['paid', 'processing', 'shipped', 'completed', 'refunded'];

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch {
      showToast('error', 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // If status changed to shipped, send dispatch notification email
      if (newStatus === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const { error: emailError } = await supabase.functions.invoke('notify-order-shipped', {
            body: {
              orderId: order.id,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              items: order.items,
              total: order.total,
              deliveryAddress: order.delivery_address
            }
          });

          if (emailError) {
            console.error('Failed to send dispatch email:', emailError);
          } else {
            toast.success(`Dispatch email sent to ${order.customer_email}`);
          }
        }
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (newStatus !== 'shipped') {
        toast.success('Order status updated');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const countByStatus = (s: string) => orders.filter((o) => o.status === s).length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', icon: 'ri-question-line' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        <i className={cfg.icon}></i>
        {cfg.label}
      </span>
    );
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 ${toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
        <p className="text-gray-500 text-sm">View and manage all customer orders placed through the shop.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-shopping-bag-fill text-white text-xl"></i>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{orders.length}</div>
          <div className="text-sm font-semibold text-gray-400">Total Orders</div>
        </div>
        <div className="bg-yellow-400 rounded-2xl p-6 shadow-md">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-money-pound-circle-fill text-gray-900 text-xl"></i>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">£{totalRevenue.toFixed(2)}</div>
          <div className="text-sm font-semibold text-gray-700">Total Revenue</div>
        </div>
        <div className="bg-green-500 rounded-2xl p-6 shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-checkbox-circle-fill text-white text-xl"></i>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{countByStatus('paid') + countByStatus('completed')}</div>
          <div className="text-sm font-semibold text-green-100">Paid / Completed</div>
        </div>
        <div className="bg-sky-500 rounded-2xl p-6 shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-truck-fill text-white text-xl"></i>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{countByStatus('processing') + countByStatus('shipped')}</div>
          <div className="text-sm font-semibold text-sky-100">In Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {(['all', 'paid', 'processing', 'shipped', 'completed', 'refunded'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap capitalize ${
                  statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? `All (${orders.length})` : `${STATUS_CONFIG[s]?.label || s} (${countByStatus(s)})`}
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
              placeholder="Search name, email, ID…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span className="text-sm font-medium">Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shopping-bag-line text-3xl text-gray-300"></i>
            </div>
            <p className="text-gray-500 font-semibold">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-700 font-medium">
                        {Array.isArray(order.items) ? order.items.reduce((s, i) => s + i.quantity, 0) : 0} item(s)
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-eye-line"></i>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + Update */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Current Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 cursor-pointer bg-white font-semibold"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                    ))}
                  </select>
                  {updatingStatus && <i className="ri-loader-4-line animate-spin text-gray-400"></i>}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <i className="ri-user-line text-gray-400"></i>
                  Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Name</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{selectedOrder.email}</p>
                  </div>
                  {selectedOrder.address?.phone && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.address.phone}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.address?.line1}
                      {selectedOrder.address?.line2 ? `, ${selectedOrder.address.line2}` : ''}
                      {', '}{selectedOrder.address?.city}
                      {selectedOrder.address?.county ? `, ${selectedOrder.address.county}` : ''}
                      {', '}{selectedOrder.address?.postcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <i className="ri-shopping-bag-line text-gray-400"></i>
                  Order Items
                </h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between px-4 py-3 text-sm ${idx !== selectedOrder.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × £{Number(item.price).toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 font-bold text-sm border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-lg text-gray-900">£{Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
