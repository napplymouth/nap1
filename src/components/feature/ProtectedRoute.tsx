import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('member' | 'professional' | 'volunteer' | 'admin')[];
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { user, userType, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Give auth state a moment to settle after redirect from login
    if (!loading) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login based on current path
    if (location.pathname.startsWith('/professionals')) {
      return <Navigate to="/professionals/login" replace />;
    }
    if (location.pathname.startsWith('/volunteers')) {
      return <Navigate to="/volunteers/login" replace />;
    }
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/members/login" replace />;
  }

  // Check if user type is allowed
  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this area.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}