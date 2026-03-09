
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../../lib/supabase';

type ViewMode = 'signin' | 'register' | 'forgot' | 'pending' | 'otp' | 'otp-verify';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  professionType: string;
  employerOrganisation: string;
}

export default function ProfessionalsLoginPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // OTP
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  // Register Form
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionType: '',
    employerOrganisation: '',
  });

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState('');

  const professionTypes = [
    'GP (General Practitioner)',
    'Nurse',
    'Pharmacist',
    'Social Worker',
    'Paramedic',
    'Psychologist',
    'Counsellor',
    'Other Healthcare Professional',
  ];

  const startResendCooldown = () => {
    setOtpResendCooldown(60);
    const interval = setInterval(() => {
      setOtpResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          setError('No professional profile found. Please register first.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.approval_status === 'pending') {
          setViewMode('pending');
          return;
        }

        if (profile.approval_status === 'rejected') {
          setError('Your application has been rejected. Please contact support for more information.');
          await supabase.auth.signOut();
          return;
        }

        navigate('/professionals/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: { shouldCreateUser: false },
      });

      if (otpError) throw otpError;

      startResendCooldown();
      setViewMode('otp-verify');
      setSuccessMessage(`A 6-digit code has been sent to ${otpEmail}`);
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('user not found') || err.message?.toLowerCase().includes('signups not allowed')) {
        setError('No professional account found with this email. Please register first.');
      } else {
        setError(err.message || 'Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: { shouldCreateUser: false },
      });
      if (otpError) throw otpError;
      startResendCooldown();
      setSuccessMessage('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otpCode,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          setError('No professional profile found for this account.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.approval_status === 'pending') {
          setViewMode('pending');
          return;
        }

        if (profile.approval_status === 'rejected') {
          setError('Your application has been rejected. Please contact support.');
          await supabase.auth.signOut();
          return;
        }

        navigate('/professionals/dashboard');
      }
    } catch (err: any) {
      setError(err.message?.includes('invalid') ? 'Invalid or expired code. Please try again.' : err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!registerForm.professionType) {
      setError('Please select your profession type');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.fullName,
            user_type: 'professional',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: registerForm.fullName,
            email: registerForm.email,
            profession_type: registerForm.professionType,
            employer_organisation: registerForm.employerOrganisation,
            approval_status: 'pending',
          });

        if (profileError) throw profileError;

        // Notify all admins about the new registration
        try {
          await fetch(
            `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/notify-professional-registration`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                professionalName: registerForm.fullName,
                professionalEmail: registerForm.email,
                professionType: registerForm.professionType,
                employerOrganisation: registerForm.employerOrganisation,
              }),
            }
          );
        } catch {
          // Notification failure should not block registration
        }

        setViewMode('pending');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/professionals/login`,
      });

      if (error) throw error;

      setSuccessMessage('Password reset link sent to your email');
      setForgotEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRegisterForm = (field: keyof RegisterFormData, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetToSignIn = () => {
    setError('');
    setSuccessMessage('');
    setOtpCode('');
    setOtpEmail('');
    setViewMode('signin');
  };

  if (viewMode === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-time-line text-4xl text-amber-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Pending</h1>
          <p className="text-gray-600 mb-6">
            Thank you for registering as a healthcare professional. Your application is currently under review by our admin team.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            You will receive an email notification once your account has been approved. This typically takes 1-2 business days.
          </p>
          <button
            onClick={() => { supabase.auth.signOut(); setViewMode('signin'); }}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (viewMode === 'signin') return 'Professionals Portal';
    if (viewMode === 'register') return 'Register as Professional';
    if (viewMode === 'forgot') return 'Reset Password';
    if (viewMode === 'otp') return 'Sign In with Code';
    if (viewMode === 'otp-verify') return 'Enter Your Code';
    return '';
  };

  const getSubtitle = () => {
    if (viewMode === 'signin') return 'Sign in to access professional resources';
    if (viewMode === 'register') return 'Join our network of healthcare professionals';
    if (viewMode === 'forgot') return 'Enter your email to receive a reset link';
    if (viewMode === 'otp') return 'We\'ll send a one-time code to your email';
    if (viewMode === 'otp-verify') return `Enter the 6-digit code sent to ${otpEmail}`;
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mx-auto">
              <i className="ri-hospital-line text-3xl text-white"></i>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">{getSubtitle()}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <i className="ri-error-warning-line text-xl text-red-600 mt-0.5"></i>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <i className="ri-checkbox-circle-line text-xl text-green-600 mt-0.5"></i>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Sign In Form */}
          {viewMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="your.email@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccessMessage(''); setViewMode('forgot'); }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* OTP Option */}
              <button
                type="button"
                onClick={() => { setError(''); setSuccessMessage(''); setViewMode('otp'); }}
                className="w-full px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="ri-mail-send-line text-lg"></i>
                Sign in with a code
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMessage(''); setViewMode('register'); }}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* OTP — Enter Email */}
          {viewMode === 'otp' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <i className="ri-information-line text-xl text-teal-600 mt-0.5 shrink-0"></i>
                <p className="text-sm text-teal-800">
                  Enter your registered professional email and we&apos;ll send you a one-time 6-digit code — no password needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="your.email@hospital.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
                ) : (
                  <><i className="ri-send-plane-line"></i> Send Me a Code</>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetToSignIn}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  <i className="ri-arrow-left-line mr-1"></i>
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* OTP — Verify Code */}
          {viewMode === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-mail-check-line text-3xl text-teal-600"></i>
                </div>
                <p className="text-sm text-gray-500">
                  Check your inbox at <span className="font-semibold text-gray-700">{otpEmail}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-center tracking-[0.5em] font-mono text-lg"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">The code expires in 10 minutes</p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Verifying...</>
                ) : (
                  <><i className="ri-shield-check-line"></i> Verify &amp; Sign In</>
                )}
              </button>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetToSignIn}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  <i className="ri-arrow-left-line mr-1"></i>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResendCooldown > 0 || loading}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {otpResendCooldown > 0 ? `Resend in ${otpResendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(e) => handleUpdateRegisterForm('fullName', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => handleUpdateRegisterForm('email', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="your.email@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession Type</label>
                <select
                  value={registerForm.professionType}
                  onChange={(e) => handleUpdateRegisterForm('professionType', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="">Select your profession</option>
                  {professionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employer / Organisation</label>
                <input
                  type="text"
                  value={registerForm.employerOrganisation}
                  onChange={(e) => handleUpdateRegisterForm('employerOrganisation', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="City General Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => handleUpdateRegisterForm('password', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleUpdateRegisterForm('confirmPassword', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Re-enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMessage(''); setViewMode('signin'); }}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="your.email@hospital.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetToSignIn}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            <i className="ri-arrow-left-line mr-1"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
