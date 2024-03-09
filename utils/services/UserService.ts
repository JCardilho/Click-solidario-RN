import firebase from '../firebase';
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateUserDTO, IUser } from './DTO/user.dto';

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
      email: params.email.toLowerCase(),
      cpf: params.cpf || '',
      pix: {
        key: params.pix?.key || '',
        type: params.pix?.type || '',
      },
      administrator: false,
      socialAssistant: false,
    });
    const auth = getAuth(firebase);
    await createUserWithEmailAndPassword(auth, params.email, params.password);
  } catch (err) {
    console.log(err);
  }
};

const loginUser = async (email: string, password: string): Promise<IUser> => {
  const auth = getAuth(firebase);
  const response = await signInWithEmailAndPassword(auth, email, password);

  const getDocRef = query(collection(getFirestore(firebase), 'users'), where('email', '==', email));
  const docSnap = await getDocs(getDocRef);
  if (docSnap.empty) throw new Error('Usuário não encontrado');
  const user = docSnap.docs[0].data() as IUser;
  console.log('user');
  try {
    console.log('setou no cache');
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        providerId: response.user.providerId,
      })
    );
  } catch (err: any) {
    console.log('Erro ao salvar usuário no AsyncStorage');
    throw new Error(err);
  }
  return {
    ...user,
    providerId: response.user.providerId,
  };
};

export const UserService = {
  createUser,
  loginUser,
};
