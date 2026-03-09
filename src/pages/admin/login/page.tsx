import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../../lib/supabase';

type View = 'login' | 'forgot' | 'forgot-sent' | 'reset-password' | 'reset-done' | 'magic-link' | 'magic-otp' | 'magic-sent';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);

  const [magicEmail, setMagicEmail] = useState('');
  const [magicError, setMagicError] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const adminEmails = ['napplymouth66@gmail.com', 'kelly.anne1@nhs.net'];

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setView('reset-password');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery' || params.get('code')) {
      setView('reset-password');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Always clear any existing session first
      await supabase.auth.signOut({ scope: 'local' });

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!data?.user) {
        setError('Login failed. Please try again.');
        return;
      }

      const { data: profile } = await supabase
        .from('volunteer_profiles')
        .select('is_admin')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setError('Access denied. This area is for administrators only.');
        return;
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      if (resetErr) throw resetErr;
      setView('forgot-sent');
    } catch (err: any) {
      setResetError(err?.message ?? 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError('');
    if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordError('Passwords do not match.');
      return;
    }
    setNewPasswordLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
      await supabase.auth.signOut();
      setView('reset-done');
    } catch (err: any) {
      setNewPasswordError(err?.message ?? 'Failed to update password. Please try again.');
    } finally {
      setNewPasswordLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicError('');
    setMagicLoading(true);
    try {
      if (!adminEmails.includes(magicEmail.toLowerCase().trim())) {
        setMagicError('This email is not registered as an admin account.');
        setMagicLoading(false);
        return;
      }
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: magicEmail.trim(),
        options: {
          shouldCreateUser: false,
        },
      });
      if (otpErr) throw otpErr;
      setOtpCode('');
      setOtpError('');
      setView('magic-otp');
    } catch (err: any) {
      setMagicError(err?.message ?? 'Failed to send code. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: magicEmail.trim(),
        token: otpCode.trim(),
        type: 'email',
      });
      if (verifyErr) throw verifyErr;

      const { data: profile, error: profileError } = await supabase
        .from('volunteer_profiles')
        .select('is_admin')
        .eq('user_id', data.user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setOtpError('Access denied. This account does not have admin privileges.');
        return;
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('invalid') || err?.message?.toLowerCase().includes('expired')) {
        setOtpError('Invalid or expired code. Please check the code and try again.');
      } else {
        setOtpError(err?.message ?? 'Verification failed. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-yellow-400 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/">
            <img
              src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
              alt="Naloxone Advocates Plymouth"
              className="h-14 w-auto"
            />
          </Link>
          <Link to="/" className="text-gray-900 font-semibold text-sm hover:text-pink-500 transition-colors whitespace-nowrap">
            <i className="ri-arrow-left-line mr-1"></i> Back to Site
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2 rounded-full font-bold mb-4 text-sm">
          <i className="ri-shield-keyhole-fill"></i>
          Admin Portal
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {view === 'login' ? 'Admin Sign In'
            : view === 'reset-password' ? 'Set New Password'
            : view === 'magic-otp' ? 'Enter Your Code'
            : view === 'magic-sent' ? 'Check Your Email'
            : 'Reset Password'}
        </h1>
        <p className="text-gray-400 text-sm">
          {view === 'login' ? 'Restricted access — authorised personnel only'
            : view === 'reset-password' ? 'Choose a new secure password for your account'
            : view === 'magic-otp' ? `A 6-digit code was sent to ${magicEmail}`
            : view === 'magic-sent' ? 'A sign-in link has been sent to your inbox'
            : 'We\'ll send a reset link to your email'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mx-auto mb-6 shadow-lg">
              {view === 'login'
                ? <i className="ri-admin-fill text-yellow-400 text-3xl"></i>
                : view === 'magic-otp'
                ? <i className="ri-key-2-line text-yellow-400 text-3xl"></i>
                : view === 'magic-sent'
                ? <i className="ri-mail-check-line text-yellow-400 text-3xl"></i>
                : <i className="ri-lock-password-line text-yellow-400 text-3xl"></i>
              }
            </div>

            {/* ── LOGIN VIEW ── */}
            {view === 'login' && (
              <div className="space-y-5">
                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                      <i className="ri-error-warning-fill flex-shrink-0"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                        <i className="ri-mail-line text-gray-400 text-base"></i>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setResetEmail(email); setResetError(''); }}
                        className="text-xs text-yellow-600 font-semibold hover:text-yellow-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                        <i className="ri-lock-line text-gray-400 text-base"></i>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                      >
                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><i className="ri-loader-4-line animate-spin"></i>Signing in…</>
                    ) : (
                      <><i className="ri-login-box-line"></i>Sign In to Admin</>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* OTP Option */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <i className="ri-key-2-line text-yellow-600"></i>
                    Can't remember your password?
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Get a 6-digit sign-in code sent to your email — no password needed.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMagicEmail(email); setMagicError(''); setView('magic-link'); }}
                    className="w-full bg-yellow-400 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="ri-send-plane-2-line"></i>
                    Send Me a Sign-In Code
                  </button>
                </div>
              </div>
            )}

            {/* ── SEND OTP VIEW ── */}
            {view === 'magic-link' && (
              <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
                <p className="text-sm text-gray-500 text-center -mt-2">
                  Enter your admin email and we&apos;ll send a 6-digit sign-in code. No password required.
                </p>

                {magicError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{magicError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      placeholder="napplymouth66@gmail.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={magicLoading}
                  className="w-full bg-yellow-400 text-gray-900 py-4 rounded-full font-bold text-base hover:bg-yellow-500 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {magicLoading ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Sending…</>
                  ) : (
                    <><i className="ri-send-plane-2-line"></i>Send Sign-In Code</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <i className="ri-arrow-left-line"></i> Back to Sign In
                </button>
              </form>
            )}

            {/* ── ENTER OTP VIEW ── */}
            {view === 'magic-otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 text-center">
                  <i className="ri-mail-send-line mr-1"></i>
                  Code sent to <span className="font-bold">{magicEmail}</span>
                </div>

                {otpError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{otpError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">Check your inbox and spam folder. The code expires in 10 minutes.</p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length < 6}
                  className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Verifying…</>
                  ) : (
                    <><i className="ri-shield-check-line"></i>Verify &amp; Sign In</>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setView('magic-link'); setMagicError(''); }}
                    className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-1"></i>Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-gray-500 hover:text-gray-700 font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-1"></i>Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── FORGOT PASSWORD VIEW ── */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-5" noValidate>
                <p className="text-sm text-gray-500 text-center -mt-2">
                  Enter your admin email address and we&apos;ll send you a link to reset your password.
                </p>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Sending…</>
                  ) : (
                    <><i className="ri-send-plane-line"></i>Send Reset Link</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <i className="ri-arrow-left-line"></i> Back to Sign In
                </button>
              </form>
            )}

            {/* ── RESET EMAIL SENT VIEW ── */}
            {view === 'forgot-sent' && (
              <div className="text-center space-y-5">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                  <i className="ri-mail-check-line text-green-600 text-3xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Check your inbox</h2>
                  <p className="text-sm text-gray-500">
                    A password reset link has been sent to <span className="font-semibold text-gray-700">{resetEmail}</span>. Follow the link in the email to set a new password.
                  </p>
                </div>
                <p className="text-xs text-gray-400">Didn&apos;t receive it? Check your spam folder or try again.</p>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setResetError(''); }}
                  className="text-sm text-yellow-600 font-semibold hover:text-yellow-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Resend email
                </button>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="ri-arrow-left-line"></i> Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* ── SET NEW PASSWORD VIEW ── */}
            {view === 'reset-password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-5" noValidate>
                <p className="text-sm text-gray-500 text-center -mt-2">
                  Enter and confirm your new password below.
                </p>

                {newPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{newPasswordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-2-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={newPasswordLoading}
                  className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {newPasswordLoading ? (
                    <><i className="ri-loader-4-line animate-spin"></i>Saving…</>
                  ) : (
                    <><i className="ri-shield-check-line"></i>Set New Password</>
                  )}
                </button>
              </form>
            )}

            {/* ── RESET DONE VIEW ── */}
            {view === 'reset-done' && (
              <div className="text-center space-y-5">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                  <i className="ri-checkbox-circle-line text-green-600 text-3xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Password Updated!</h2>
                  <p className="text-sm text-gray-500">
                    Your password has been changed successfully. You can now sign in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full bg-gray-900 text-yellow-400 py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-login-box-line"></i> Sign In Now
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Not an admin?{' '}
            <Link to="/members/login" className="text-pink-500 font-semibold hover:text-pink-600">Members login</Link>
            {' '}·{' '}
            <Link to="/volunteers/login" className="text-lime-600 font-semibold hover:text-lime-700">Volunteer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
