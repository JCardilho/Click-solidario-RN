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
import { UserService } from '../services/UserService';

interface Types {
  user: IUser | null | undefined;
}

interface Actions {
  setUser: (user: IUser | null) => void;
  addImageToUser: (image: string) => void;
}

const useCurrentUser = create<Types & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  addImageToUser: (image) =>
    set((state) => {
      if (!state.user)
        return {
          user: null,
        };

      return {
        user: {
          ...state.user,
          image,
        },
      };
    }),
}));

export const useCurrentUserHook = () => {
  const { user, setUser, addImageToUser } = useCurrentUser();
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
          router.push('/entrar');
        }
      });

      return () => unsubscribe();
    } catch (err) {
      router.push('/entrar');
    }
  };

  const sendFromHome = (user: IUser) => {
    const verify = verifyUserWithZodSchema(user);
    if (verify) {
      console.log('Verificou e está correto!!');
      setUser(user);
      router.push('/home');
      return;
    }
    console.log('não passou');
    sendFromLogin();
  };

  const sendFromLogin = () => {
    if (path == '/') return;
    console.info('Enviando usuário da login');
    router.push('/entrar');
    return;
  };

  const verifyUserAndSendUserFromHome = async () => {
    try {
      if (user && user !== null) return sendFromHome(user);
      const getCachedUser = (await getCache('user')) as IUser | null;
      if (!getCachedUser || getCachedUser === null) return sendFromLogin();
      if (getCachedUser) {
        console.info('Enviando usuário da home');
        sendFromHome(getCachedUser);
        return;
      }
    } catch (err) {
      return router.push('/entrar');
    }
  };

  const addImageToUserAndSetCache = async (image: string) => {
    addImageToUser(image);
    await UserService.addImageToUserInFirebase(image);
  };

  return { user, verifyUser, verifyUserAndSendUserFromHome, setUser, addImageToUserAndSetCache };
};
