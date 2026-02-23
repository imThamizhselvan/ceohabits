import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Profile } from '../types/profile';

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();
  const { user, profile, loading, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const authUser = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    };
    setUser(authUser);
    fetchOrCreateProfile(clerkUser);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, clerkUser?.id]);

  async function fetchOrCreateProfile(clerkUser: NonNullable<ReturnType<typeof useUser>['user']>) {
    await supabase.from('profiles').upsert(
      {
        id: clerkUser.id,
        username: clerkUser.fullName ?? clerkUser.username ?? null,
        avatar_url: clerkUser.imageUrl ?? null,
        xp: 0,
        level: 1,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single();

    setProfile(data as Profile | null);
    setLoading(false);
  }

  return {
    user,
    profile,
    loading,
    signOut: () => clerk.signOut(),
  };
}
