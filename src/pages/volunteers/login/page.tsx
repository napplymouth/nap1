import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../../lib/supabase';

type View = 'login' | 'register' | 'forgot' | 'pending';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/training', label: 'Training & P2P' },
  { to: '/get-naloxone', label: 'Get Naloxone' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
];

const VOLUNTEER_ROLES = [
  { value: 'peer_trainer', label: 'Peer Trainer', icon: 'ri-user-voice-fill', color: 'bg-pink-500' },
  { value: 'outreach_volunteer', label: 'Outreach Volunteer', icon: 'ri-walk-fill', color: 'bg-lime-500' },
  { value: 'peer_support_worker', label: 'Peer Support Worker', icon: 'ri-hand-heart-fill', color: 'bg-yellow-400' },
  { value: 'events_coordinator', label: 'Events Coordinator', icon: 'ri-calendar-event-fill', color: 'bg-purple-500' },
  { value: 'content_creator', label: 'Content Creator', icon: 'ri-edit-box-fill', color: 'bg-blue-500' },
  { value: 'admin_support', label: 'Admin Support', icon: 'ri-file-list-3-fill', color: 'bg-teal-500' },
];

export default function VolunteersLoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [loginGeneralError, setLoginGeneralError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [registerGeneralError, setRegisterGeneralError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // -----------------------------------------------------------------
  // Validation helpers – removed TypeScript return type annotations
  // to keep the file usable as plain JavaScript/JSX.
  // -----------------------------------------------------------------
  const validateLogin = () => {
    const errors: FormErrors = {};
    if (!loginData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) errors.email = 'Please enter a valid email';
    if (!loginData.password) errors.password = 'Password is required';
    else if (loginData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors: FormErrors = {};
    if (!registerData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!registerData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerData.email)) errors.email = 'Please enter a valid email';
    if (!registerData.password) errors.password = 'Password is required';
    else if (registerData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!registerData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (registerData.password !== registerData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!registerData.role) errors.role = 'Please select a volunteer role';
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -----------------------------------------------------------------
  // Handlers – added try/catch for more robust error handling.
  // -----------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginGeneralError('');
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) throw error;

      // Ensure the user is a volunteer
      if (data?.user?.user_metadata?.user_type !== 'volunteer') {
        setLoginGeneralError(
          'This login is for volunteers only. Please use the members login if you are not a volunteer.'
        );
        await supabase.auth.signOut();
        return;
      }

      // Check approval status from volunteer_profiles
      const { data: profile } = await supabase
        .from('volunteer_profiles')
        .select('approval_status')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile || profile.approval_status === 'pending') {
        await supabase.auth.signOut();
        setLoginGeneralError('Your volunteer application is still awaiting admin approval. You will be notified once approved.');
        return;
      }

      if (profile.approval_status === 'rejected') {
        await supabase.auth.signOut();
        setLoginGeneralError('Your volunteer application was not approved. Please contact us for more information.');
        return;
      }

      navigate('/volunteers/dashboard');
    } catch (err: any) {
      setLoginGeneralError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterGeneralError('');
    if (!validateRegister()) return;
    setRegisterLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName,
            volunteer_role: registerData.role,
            user_type: 'volunteer',
            approval_status: 'pending',
          },
        },
      });
      if (error) throw error;

      // Create a volunteer profile record with pending status
      if (data?.user?.id) {
        await supabase.from('volunteer_profiles').insert({
          user_id: data.user.id,
          full_name: registerData.fullName,
          email: registerData.email,
          volunteer_role: registerData.role,
          approval_status: 'pending',
        });
      }

      // Sign out immediately — they must wait for approval
      await supabase.auth.signOut();
      setView('pending');
    } catch (err: any) {
      setRegisterGeneralError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/volunteers/login`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setForgotLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // JSX – unchanged (except small formatting fixes)
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-yellow-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                alt="Naloxone Advocates Plymouth"
                className="h-16 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-900 font-semibold hover:text-pink-500 transition-colors whitespace-nowrap text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/members/login"
                className="bg-gray-900 text-yellow-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-user-fill"></i> Members Area
              </Link>
            </div>
            <button
              className="md:hidden text-gray-900 text-2xl cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="block text-gray-900 font-semibold hover:text-pink-500 transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link to="/members/login" className="block text-gray-900 font-bold hover:text-pink-500 transition-colors">
                Members Area
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-lime-400 to-yellow-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 text-gray-900 px-5 py-2 rounded-full font-bold mb-4 text-sm">
            <i className="ri-heart-fill text-pink-500"></i>
            Volunteer Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Welcome to the Volunteer Portal</h1>
          <p className="text-lg text-white font-semibold max-w-2xl mx-auto">
            Log your hours, register for events, and manage your volunteer activities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Tab Toggle */}
          {view !== 'forgot' && (
            <div className="flex bg-white rounded-2xl p-1 shadow-lg mb-8 border border-gray-100">
              <button
                onClick={() => setView('login')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  view === 'login' ? 'bg-lime-400 text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-login-box-line mr-2"></i>Sign In
              </button>
              <button
                onClick={() => setView('register')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  view === 'register' ? 'bg-lime-400 text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-user-add-line mr-2"></i>Register as Volunteer
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {view === 'login' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="ri-heart-fill text-gray-900 text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Volunteer Sign In</h2>
                <p className="text-gray-500 text-sm mt-1">Access your volunteer dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                {loginGeneralError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{loginGeneralError}</span>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        loginErrors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        loginErrors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginData.remember}
                      onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                      className="w-4 h-4 accent-lime-400 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm text-pink-500 font-semibold hover:text-pink-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-base hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>Signing in…
                    </>
                  ) : (
                    <>
                      <i className="ri-login-box-line"></i>Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Not a volunteer yet?{' '}
                  <button onClick={() => setView('register')} className="text-pink-500 font-bold hover:text-pink-600 transition-colors cursor-pointer">
                    Register now
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* REGISTER FORM */}
          {view === 'register' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-lime-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="ri-user-add-fill text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Register as Volunteer</h2>
                <p className="text-gray-500 text-sm mt-1">Join our volunteer community</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5" noValidate>
                {registerGeneralError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-fill flex-shrink-0"></i>
                    <span>{registerGeneralError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      placeholder="Your full name"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        registerErrors.fullName ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {registerErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {registerErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        registerErrors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Min. 8 characters"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        registerErrors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {registerErrors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-lock-2-line text-gray-400 text-base"></i>
                    </div>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Repeat your password"
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm ${
                        registerErrors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-lime-400'
                      }`}
                    />
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">I want to volunteer as a…</label>
                  <div className="grid grid-cols-2 gap-3">
                    {VOLUNTEER_ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: role.value })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          registerData.role === role.value
                            ? 'border-lime-400 bg-lime-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                          <i className={`${role.icon} text-white text-lg`}></i>
                        </div>
                        <span className="text-xs font-bold text-gray-700 text-center leading-tight">{role.label}</span>
                        {registerData.role === role.value && (
                          <div className="w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
                            <i className="ri-check-line text-gray-900 text-xs"></i>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {registerErrors.role && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>
                      {registerErrors.role}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-base hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {registerLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>Creating account…
                    </>
                  ) : (
                    <>
                      <i className="ri-user-add-line"></i>Register as Volunteer
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Already registered?{' '}
                  <button onClick={() => setView('login')} className="text-pink-500 font-bold hover:text-pink-600 transition-colors cursor-pointer">
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {view === 'forgot' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <button
                onClick={() => setView('login')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-semibold mb-6 cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i> Back to Sign In
              </button>

              {forgotSent ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-mail-check-fill text-gray-900 text-4xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    We&apos;ve sent a password reset link to <strong>{forgotEmail}</strong>. Please check your inbox and follow the instructions.
                  </p>
                  <button
                    onClick={() => {
                      setView('login');
                      setForgotSent(false);
                      setForgotEmail('');
                    }}
                    className="bg-lime-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-lime-500 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <i className="ri-key-2-fill text-gray-900 text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter your email and we&apos;ll send you a reset link</p>
                  </div>
                  <form onSubmit={handleForgot} className="space-y-5">
                    {forgotError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                        <i className="ri-error-warning-fill flex-shrink-0"></i>
                        <span>{forgotError}</span>
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
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lime-400 focus:outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-pink-500 text-white py-4 rounded-full font-bold text-base hover:bg-pink-600 transition-all shadow-lg whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin"></i>Sending…
                        </>
                      ) : (
                        <>
                          <i className="ri-send-plane-fill"></i>Send Reset Link
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* PENDING APPROVAL SCREEN */}
          {view === 'pending' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-time-fill text-gray-900 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Thank you for registering as a volunteer. Your application is now <strong>pending admin approval</strong>.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <i className="ri-information-fill text-yellow-500 text-lg flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">What happens next?</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• An admin will review your application</li>
                      <li>• You will be notified by email once approved</li>
                      <li>• Once approved, you can sign in and access your dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setView('login')}
                className="w-full bg-lime-400 text-gray-900 py-3 rounded-full font-bold text-sm hover:bg-lime-500 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>Back to Sign In
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Questions? <Link to="/contact" className="text-pink-500 font-semibold hover:text-pink-600">Contact us</Link>
              </p>
            </div>
          )}

          {/* Benefits strip */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: 'ri-time-fill', color: 'bg-lime-500', text: 'Log Your Hours', textColor: 'text-white' },
              { icon: 'ri-calendar-event-fill', color: 'bg-pink-500', text: 'Register for Events', textColor: 'text-white' },
              { icon: 'ri-bar-chart-fill', color: 'bg-yellow-400', text: 'Track Your Impact', textColor: 'text-gray-900' },
            ].map((item) => (
              <div key={item.text} className={`${item.color} rounded-2xl p-4 text-center shadow-md`}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <i className={`${item.icon} ${item.textColor} text-xl`}></i>
                </div>
                <p className={`${item.textColor} text-xs font-bold leading-tight`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-capsule-fill text-gray-900 text-lg"></i>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-sm tracking-tight">NALOXONE</span>
                <span className="font-bold text-pink-400 text-xs tracking-widest uppercase">Advocates Plymouth</span>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>© 2025 Naloxone Advocates Plymouth CIC. All rights reserved.</p>
            <p className="mt-2">
              <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Powered by Readdy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
