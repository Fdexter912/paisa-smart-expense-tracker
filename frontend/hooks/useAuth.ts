'use client'

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store';

export const useAuth = () => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]); // ⚠️ Make sure dependencies are here!

  return useAuthStore();
};