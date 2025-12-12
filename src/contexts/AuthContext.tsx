import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'customer' | 'farmer' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  farmerStatus: 'pending' | 'approved' | 'rejected' | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  registerAsFarmer: (farmData: { farmName: string; farmDescription?: string; farmLocation?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [farmerStatus, setFarmerStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchFarmerStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFarmerStatus(data.status as 'pending' | 'approved' | 'rejected');
      } else {
        setFarmerStatus(null);
      }
    } catch (error) {
      console.error('Error fetching farmer status:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer fetching additional data to avoid deadlock
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchFarmerStatus(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setFarmerStatus(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchFarmerStatus(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Account created!',
        description: 'Welcome to GreenHarvest Marketplace.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setFarmerStatus(null);
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const registerAsFarmer = async (farmData: { farmName: string; farmDescription?: string; farmLocation?: string }) => {
    if (!user) {
      return { error: new Error('You must be logged in to register as a farmer') };
    }

    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('farmers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        return { error: new Error('You have already registered as a farmer') };
      }

      const { error } = await supabase
        .from('farmers')
        .insert({
          user_id: user.id,
          farm_name: farmData.farmName,
          farm_description: farmData.farmDescription,
          farm_location: farmData.farmLocation,
        });

      if (error) throw error;

      // Add farmer role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'farmer',
        });

      setFarmerStatus('pending');
      
      toast({
        title: 'Farmer registration submitted!',
        description: 'Your application is pending admin approval.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      farmerStatus,
      signUp,
      signIn,
      signOut,
      registerAsFarmer,
    }}>
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
