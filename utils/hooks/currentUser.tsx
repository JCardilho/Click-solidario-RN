import auth, { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import firebase from '../firebase';
import { useRouter } from 'expo-router';
import { useCacheHook } from './cacheHook';

export const useCurrentUser = () => {
  const [user, setUser] = useState<auth.User | null>(null);
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
        if (user) {
          setUser(user);
          await setCache('user', user);
        } else router.push('/');
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
          setUser(user);
          await setCache('user', user);
          router.push('/home');
        } else router.push('/');
      });

      return () => unsubscribe();
    } catch (err) {}
  };

  useEffect(() => {
    console.log('user', user);
  }, [user]);

  return { user, verifyUser, verifyUserAndSendUserFromHome, setUser };
};
