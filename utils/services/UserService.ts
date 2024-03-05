import firebase from '../firebase';
import { UserCredential, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

const createUser = async (email: string, senha: string): Promise<UserCredential> => {
  const auth = getAuth(firebase);
  const response = await createUserWithEmailAndPassword(auth, email, senha);
  return response;
};

export const UserService = {
  createUser,
};
