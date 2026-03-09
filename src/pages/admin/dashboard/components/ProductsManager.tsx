import { useState, useEffect, useRef } from 'react';
import supabase from '../../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  badge: string | null;
  featured: boolean;
  in_stock: boolean;
  rating: number;
  reviews: number;
  created_at: string;
}

interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  email: string;
  created_at: string;
  notified_at: string | null;
}

const CATEGORIES = ['Apparel', 'Accessories', 'Resources', 'Bundles'];
const BADGES = ['', 'Best Seller', 'New', 'Sale', 'Bundle Deal'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  image: '',
  category: 'Accessories',
  badge: '',
  featured: false,
  in_stock: true,
};

export default function ProductsManager() {
  const [activeView, setActiveView] = useState<'products' | 'alerts'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const formRef = useRef<HTMLDivElement>(null);

  // Stock alerts state
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertSearch, setAlertSearch] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) showToast('error', 'Failed to load products.');
    else setProducts((data || []) as Product[]);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      image: p.image || '',
      category: p.category,
      badge: p.badge || '',
      featured: p.featured,
      in_stock: p.in_stock,
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      showToast('error', 'Name and price are required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      image: form.image.trim(),
      category: form.category,
      badge: form.badge || null,
      featured: form.featured,
      in_stock: form.in_stock,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('products').insert([payload]));
    }

    if (error) {
      showToast('error', 'Failed to save product.');
    } else {
      showToast('success', editingId ? 'Product updated!' : 'Product added!');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) showToast('error', 'Failed to delete product.');
    else { showToast('success', 'Product deleted.'); await loadProducts(); }
    setDeletingId(null);
  };

  const loadAlerts = async () => {
    setAlertsLoading(true);
    const { data, error } = await supabase
      .from('back_in_stock_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAlerts(data as StockAlert[]);
    setAlertsLoading(false);
  };

  useEffect(() => {
    if (activeView === 'alerts') loadAlerts();
  }, [activeView]);

  const handleMarkNotified = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;

    setMarkingId(id);

    try {
      // Call Edge Function to send email
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/notify-back-in-stock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            alertId: alert.id,
            email: alert.email,
            productName: alert.product_name,
            productId: alert.product_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send notification email');
      }

      // Only update database after successful email send
      const { error } = await supabase
        .from('back_in_stock_alerts')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Notification email sent!');
      await loadAlerts();
    } catch (err) {
      console.error('Error sending notification:', err);
      showToast('error', 'Failed to send notification email');
    } finally {
      setMarkingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const q = alertSearch.toLowerCase();
    return !q || a.email.toLowerCase().includes(q) || a.product_name.toLowerCase().includes(q);
  });

  const pendingCount = alerts.filter((a) => !a.notified_at).length;

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 ${toast.type === 'success' ? 'bg-lime-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={toast.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Products</h1>
          <p className="text-gray-500 text-sm">Add, edit, or remove products from your shop.</p>
        </div>
        {activeView === 'products' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-add-line text-lg"></i>
            Add Product
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveView('products')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeView === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <i className="ri-store-2-line mr-1.5"></i>
          All Products
        </button>
        <button
          onClick={() => setActiveView('alerts')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeView === 'alerts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <i className="ri-notification-3-line"></i>
          Stock Alerts
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full leading-none">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── STOCK ALERTS VIEW ── */}
      {activeView === 'alerts' && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Signups', value: alerts.length, icon: 'ri-user-line', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Pending Notification', value: alerts.filter((a) => !a.notified_at).length, icon: 'ri-time-line', color: 'bg-orange-50 text-orange-600' },
              { label: 'Already Notified', value: alerts.filter((a) => !!a.notified_at).length, icon: 'ri-check-double-line', color: 'bg-lime-50 text-lime-700' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 ${s.color}`}>
                  <i className={`${s.icon} text-xl`}></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-base"></i>
            </div>
            <input
              type="text"
              value={alertSearch}
              onChange={(e) => setAlertSearch(e.target.value)}
              placeholder="Search by email or product name..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
            />
          </div>

          {/* Alerts Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {alertsLoading ? (
              <div className="flex items-center justify-center py-20">
                <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                  <i className="ri-notification-off-line text-3xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 font-medium">No stock alerts yet.</p>
                <p className="text-gray-400 text-sm mt-1">Customers will appear here when they sign up for back-in-stock notifications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer Email</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Signed Up</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full flex-shrink-0">
                              <i className="ri-mail-line text-yellow-600 text-sm"></i>
                            </div>
                            <span className="font-medium text-gray-900">{alert.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate">{alert.product_name}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          {alert.notified_at ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-lime-100 text-lime-700">
                              <i className="ri-check-line"></i> Notified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                              <i className="ri-time-line"></i> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!alert.notified_at && (
                            <button
                              onClick={() => handleMarkNotified(alert.id)}
                              disabled={markingId === alert.id}
                              className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                            >
                              {markingId === alert.id
                                ? <i className="ri-loader-4-line animate-spin"></i>
                                : <i className="ri-check-line"></i>
                              }
                              Mark Notified
                            </button>
                          )}
                          {alert.notified_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(alert.notified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4">{filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} shown</p>
        </div>
      )}

      {/* ── PRODUCTS VIEW ── */}
      {activeView === 'products' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-base"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${filterCategory === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div ref={formRef} className="bg-white border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
                  <i className="ri-close-line text-gray-500 text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                    placeholder="e.g. Awareness T-Shirt"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm resize-none"
                    placeholder="Short product description..."
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (£) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                    placeholder="0.00"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Original Price (£) <span className="text-gray-400 font-normal">— for sale items</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                    placeholder="Leave blank if not on sale"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm cursor-pointer"
                  >
                    {BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                    placeholder="https://..."
                  />
                  {form.image && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, featured: !form.featured })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.featured ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, in_stock: !form.in_stock })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.in_stock ? 'bg-lime-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.in_stock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                  <i className="ri-store-2-line text-3xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 font-medium">No products found.</p>
                <button onClick={openAdd} className="mt-4 text-sm text-yellow-600 font-semibold hover:underline cursor-pointer">
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Price</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Badge</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-image-line text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{p.name}</p>
                              {p.featured && (
                                <span className="text-xs text-yellow-600 font-semibold">⭐ Featured</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{p.category}</td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900">£{p.price.toFixed(2)}</span>
                          {p.original_price && (
                            <span className="ml-2 text-xs text-gray-400 line-through">£{p.original_price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${p.in_stock ? 'bg-lime-100 text-lime-700' : 'bg-red-100 text-red-600'}`}>
                            <i className={p.in_stock ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}></i>
                            {p.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {p.badge ? (
                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{p.badge}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-700 transition-all cursor-pointer"
                              title="Edit"
                            >
                              <i className="ri-edit-line text-base"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === p.id
                                ? <i className="ri-loader-4-line animate-spin text-base"></i>
                                : <i className="ri-delete-bin-line text-base"></i>
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} shown</p>
        </>
      )}
    </div>
  );
}
