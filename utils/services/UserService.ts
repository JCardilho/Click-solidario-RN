import firebase from '../firebase';
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createUser = async (email: string, password: string): Promise<UserCredential> => {
  const auth = getAuth(firebase);
  const response = await createUserWithEmailAndPassword(auth, email, password);
  return response;
};

const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  const auth = getAuth(firebase);
  const response = await signInWithEmailAndPassword(auth, email, password);
  try {
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  } catch (err: any) {
    console.log('Erro ao salvar usuário no AsyncStorage');
    throw new Error(err);
  }
  return response;
};

export const UserService = {
  createUser,
  loginUser,
};
