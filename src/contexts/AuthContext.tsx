import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import supabase from '../lib/supabase';

type UserType = 'member' | 'professional' | 'volunteer' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: UserType | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserType: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserType = async (userId: string): Promise<UserType | null> => {
    // Check admin FIRST (volunteer_profiles with is_admin = true)
    const { data: adminData } = await supabase
      .from('volunteer_profiles')
      .select('id, is_admin')
      .eq('user_id', userId)
      .eq('is_admin', true)
      .maybeSingle();

    if (adminData) return 'admin';

    // Check professional
    const { data: professionalData } = await supabase
      .from('professional_profiles')
      .select('id, approval_status')
      .eq('user_id', userId)
      .maybeSingle();

    if (professionalData) return 'professional';

    // Check volunteer
    const { data: volunteerData } = await supabase
      .from('volunteer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (volunteerData) return 'volunteer';

    // Check member
    const { data: memberData } = await supabase
      .from('member_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberData) return 'member';

    return null;
  };

  const refreshUserType = async () => {
    if (user) {
      const type = await fetchUserType(user.id);
      setUserType(type);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const type = await fetchUserType(session.user.id);
        setUserType(type);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const type = await fetchUserType(session.user.id);
        setUserType(type);
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userType, loading, signOut, refreshUserType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}