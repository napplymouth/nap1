import { useState } from 'react';
import supabase from '../../../../lib/supabase';

interface InviteResult {
  email: string;
  status: 'success' | 'error';
  message: string;
}

interface InviteAdminProps {
  adminId: string;
  adminName: string;
}

export default function InviteAdmin({ adminId, adminName }: InviteAdminProps) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'A valid email is required.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        'https://tvbmcdfbmjhgghqnvufx.supabase.co/functions/v1/invite-admin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            full_name: form.full_name.trim(),
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setResult({ email: form.email, status: 'error', message: json.error || 'Failed to create admin.' });
      } else {
        // Log the action
        await supabase.from('admin_activity_log').insert({
          admin_id: adminId,
          admin_name: adminName,
          action_type: 'admin_invited',
          target_name: form.full_name.trim(),
          target_id: null,
          details: form.email.trim(),
        });

        setResult({ email: form.email, status: 'success', message: json.message || 'Admin account created successfully.' });
        setForm({ full_name: '', email: '', password: '', confirm_password: '' });
        setErrors({});
      }
    } catch (err: any) {
      setResult({ email: form.email, status: 'error', message: err.message || 'Unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof form) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:border-yellow-400 bg-white'
    }`;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Invite Admin</h1>
        <p className="text-gray-500 text-sm">
          Create a new administrator account. The new admin can log in immediately with the credentials you set.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-shield-keyhole-fill text-yellow-600 text-lg"></i>
        </div>
        <div>
          <p className="font-bold text-yellow-800 text-sm mb-1">Admin privileges</p>
          <p className="text-yellow-700 text-xs leading-relaxed">
            Admin accounts have full access to the dashboard — volunteers, events, hours, broadcast, and admin management.
            Only invite people you fully trust.
          </p>
        </div>
      </div>

      {/* Result Banner */}
      {result && (
        <div
          className={`rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 ${
            result.status === 'success'
              ? 'bg-lime-50 border border-lime-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <i
              className={`text-xl ${
                result.status === 'success'
                  ? 'ri-checkbox-circle-fill text-lime-600'
                  : 'ri-error-warning-fill text-red-500'
              }`}
            ></i>
          </div>
          <div className="flex-1">
            <p
              className={`font-bold text-sm ${
                result.status === 'success' ? 'text-lime-800' : 'text-red-700'
              }`}
            >
              {result.status === 'success' ? 'Admin created!' : 'Failed to create admin'}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                result.status === 'success' ? 'text-lime-700' : 'text-red-600'
              }`}
            >
              {result.message}
            </p>
            {result.status === 'success' && (
              <p className="text-xs text-lime-600 mt-1">
                <strong>{result.email}</strong> can now log in at <strong>/admin</strong>.
              </p>
            )}
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer w-6 h-6 flex items-center justify-center"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-user-fill text-gray-400 text-base"></i>
              </div>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Jane Smith"
                className={`${inputClass('full_name')} pl-9`}
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="ri-error-warning-line"></i> {errors.full_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-mail-fill text-gray-400 text-base"></i>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                className={`${inputClass('email')} pl-9`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="ri-error-warning-line"></i> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-lock-fill text-gray-400 text-base"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className={`${inputClass('password')} pl-9 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="ri-error-warning-line"></i> {errors.password}
              </p>
            )}
            {/* Strength indicator */}
            {form.password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= i * 3
                        ? form.password.length >= 12
                          ? 'bg-lime-500'
                          : form.password.length >= 8
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {form.password.length < 8 ? 'Too short' : form.password.length < 12 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-lock-2-fill text-gray-400 text-base"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Re-enter password"
                className={`${inputClass('confirm_password')} pl-9`}
              />
              {form.confirm_password && form.password === form.confirm_password && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill text-lime-500"></i>
                </div>
              )}
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <i className="ri-error-warning-line"></i> {errors.confirm_password}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base"></i>
                  Creating Admin Account…
                </>
              ) : (
                <>
                  <i className="ri-shield-user-fill text-base"></i>
                  Create Admin Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security note */}
      <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
        <i className="ri-lock-line"></i>
        Accounts are created securely via a server-side function. Passwords are never stored in plain text.
      </p>
    </div>
  );
}