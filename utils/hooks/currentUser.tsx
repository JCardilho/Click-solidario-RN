import auth, { User, UserCredential, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import firebase from '../firebase';
import { useRouter } from 'expo-router';
import { create } from 'zustand';
import { useCacheHook } from './cacheHook';

interface Types {
  user: UserCredential | null;
}

interface Actions {
  setUser: (user: UserCredential) => void;
}

const useCurrentUser = create<Types & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useCurrentUserHook = () => {
  const { user, setUser } = useCurrentUser();
  const router = useRouter();
  const { getCache, setCache } = useCacheHook();

  const verifyUser = async () => {
    try {
      const getCachedUser: any = await getCache('user');
      if (getCachedUser) {
        setUser(getCachedUser);
        router.push('/home');
      }
      const getAuth = auth.getAuth(firebase);
      const unsubscribe = onAuthStateChanged(getAuth, async (user) => {
        if (!user) {
          router.push('/');
        }
      });

      return () => unsubscribe();
    } catch (err) {
      router.push('/');
    }
  };

  const verifyUserAndSendUserFromHome = async () => {
    try {
      const getCachedUser: any = await getCache('user');
      if (getCachedUser) {
        setUser(getCachedUser);
        router.push('/home');
      }
      const getAuth = auth.getAuth(firebase);
      const unsubscribe = onAuthStateChanged(getAuth, async (user) => {
        if (user) {
          router.push('/home');
        } else router.push('/');
      });

      return () => unsubscribe();
    } catch (err) {}
  };

  return { user, verifyUser, verifyUserAndSendUserFromHome, setUser };
};
