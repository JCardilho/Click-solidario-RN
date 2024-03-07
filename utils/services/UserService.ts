import firebase from '../firebase';
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateUserDTO } from './DTO/user.dto';
import {
  collection,
  addDoc,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const createUser = async (params: CreateUserDTO): Promise<void> => {
  try {
    const ref = collection(getFirestore(firebase), 'users');
    await addDoc(ref, {
      name: params.name || '',
      email: params.email,
      cpf: params.cpf || '',
      pix: {
        key: params.pix?.key || '',
        type: params.pix?.type || '',
      },
    });
    const auth = getAuth(firebase);
    await createUserWithEmailAndPassword(auth, params.email, params.password);
  } catch (err) {
    console.log(err);
  }
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
