import auth, {
  User,
  UserCredential,
  getAuth,
  sendEmailVerification,
  getIdToken,
  onAuthStateChanged,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import firebase from '../firebase';
import { usePathname, useRouter } from 'expo-router';
import { create } from 'zustand';
import { useCacheHook } from './cacheHook';
import { IUser, verifyUserWithZodSchema } from '../services/DTO/user.dto';

interface Types {
  user: IUser | null;
}

interface Actions {
  setUser: (user: IUser) => void;
}

const useCurrentUser = create<Types & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useCurrentUserHook = () => {
  const { user, setUser } = useCurrentUser();
  const router = useRouter();
  const { getCache } = useCacheHook();
  const path = usePathname();

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

  const sendFromHome = (user: IUser) => {
    const verify = verifyUserWithZodSchema(user);
    console.log(verify)
    if (verify) {
      setUser(user);
      router.push('/home');
      return;
    }
    console.log("não passou")
    sendFromLogin();
  };

  const sendFromLogin = () => {
    if (path == '/') return;
    router.push('/');
    return;
  };

  const verifyUserAndSendUserFromHome = async () => {
    try {
      if (user && user !== null) return sendFromHome(user);
      const getCachedUser = (await getCache('user')) as IUser | null;
      console.log("user on cache", getCachedUser)
      if (!getCachedUser || getCachedUser === null) return sendFromLogin();
      if (getCachedUser) {
        sendFromHome(getCachedUser);
        return;
      }
    } catch (err) {
      router.push('/');
    }
  };

  return { user, verifyUser, verifyUserAndSendUserFromHome, setUser };
};
