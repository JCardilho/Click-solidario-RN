import firebase from '../firebase';
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateUserDTO, IConversationsUser, IUser } from './DTO/user.dto';

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
import { getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage';

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
      image: '',
      notifications: [],
      conversations: [],
    });
    const auth = getAuth(firebase);
    await createUserWithEmailAndPassword(auth, params.email, params.password);
  } catch (err) {
    console.log(err);
  }
};

const getOneUser = async (uid: string): Promise<IUser> => {
  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  return docSnap.data() as IUser;
};

const loginUser = async (email: string, password: string): Promise<IUser> => {
  const auth = getAuth(firebase);
  const response = await signInWithEmailAndPassword(auth, email, password);

  const getDocRef = query(collection(getFirestore(firebase), 'users'), where('email', '==', email));
  const docSnap = await getDocs(getDocRef);
  if (docSnap.empty) throw new Error('Usuário não encontrado');
  const user = docSnap.docs[0].data() as IUser;

  const saveUserForApplication = {
    ...user,
    providerId: response.user.providerId,
    uid: docSnap.docs[0].id,
  };

  try {
    console.log('setou no cache');
    await AsyncStorage.setItem('user', JSON.stringify(saveUserForApplication));
  } catch (err: any) {
    console.log('Erro ao salvar usuário no AsyncStorage');
    throw new Error(err);
  }
  return saveUserForApplication;
};

const addImageToUserInFirebase = async (image: string) => {
  try {
    const cache = await AsyncStorage.getItem('user');
    if (!cache) throw new Error('Usuário não encontrado');
    const user = JSON.parse(cache) as IUser;
    const docRef = doc(getFirestore(firebase), 'users', user.uid);
    try {
      AsyncStorage.setItem('user', JSON.stringify({ ...user, image }));
    } catch (err) {
      console.log('Erro ao salvar usuário no AsyncStorage');
    }

    await setDoc(docRef, { image }, { merge: true });
  } catch (err) {
    console.log(err);
  }
};

const deleteOldImageToUserInFirebaseStorage = async (image: string) => {
  const cache = await AsyncStorage.getItem('user');
  if (!cache) throw new Error('Usuário não encontrado');
  const user = JSON.parse(cache) as IUser;
  const storage = getStorage();
  const desertRef = ref(storage, image);
  await deleteObject(desertRef);
};

const SendNotificationMessage = async (uid: string, otherUserUid: string): Promise<void> => {};

const CreateConversation = async (uid: string, params: IConversationsUser): Promise<boolean> => {
  console.log('uid', uid);

  const queryForVerifyIfExistConversation = query(
    collection(getFirestore(firebase), 'users', uid, 'conversations'),
    where('otherUserUid', '==', params.otherUserUid)
  );
  const docSnapForVerifyIfExistConversation = await getDocs(queryForVerifyIfExistConversation);
  console.log('existe', docSnapForVerifyIfExistConversation.empty);
  if (!docSnapForVerifyIfExistConversation.empty) return true;

  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  const user = docSnap.data() as IUser;
  const conversations = user.conversations || [];
  const newConversation = {
    ...params,
  };
  conversations.push(newConversation);
  await setDoc(docRef, { conversations }, { merge: true });
  return true;
};

const GetAllConversations = async (uid: string): Promise<IConversationsUser[]> => {
  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  const user = docSnap.data() as IUser;
  return user.conversations || [];
};

const MarkAsReadChatNotification = async ({
  uid,
  OtherUserUid,
}: {
  uid: string;
  OtherUserUid: string;
}) => {
  const user = await getOneUser(uid);
  const conversations = user.conversations || [];
  const newConversations = conversations.map((conversation) => {
    if (conversation.otherUserUid === OtherUserUid) {
      conversation.isNotification = false;
    }
    return conversation;
  });
  await setDoc(
    doc(getFirestore(firebase), 'users', uid),
    { conversations: newConversations },
    { merge: true }
  );
};

const MarkAsUnreadOtherUserChatNotification = async ({
  uid,
  OtherUserUid,
}: {
  uid: string;
  OtherUserUid: string;
}) => {
  const user = await getOneUser(OtherUserUid);
  const conversations = user.conversations || [];
  const verifyIfIsNotificationIsTrue = conversations.find(
    (conversation) => conversation.otherUserUid === uid && conversation.isNotification
  );
  console.log('verifyIfIsNotificationIsTrue', verifyIfIsNotificationIsTrue);

  if (verifyIfIsNotificationIsTrue) return;
  const newConversations = conversations.map((conversation) => {
    if (conversation.otherUserUid === uid) {
      conversation.isNotification = true;
    }
    return conversation;
  });

  console.log('newConversations', newConversations);

  await setDoc(
    doc(getFirestore(firebase), 'users', OtherUserUid),
    { conversations: newConversations },
    { merge: true }
  );
};

export const UserService = {
  createUser,
  loginUser,
  addImageToUserInFirebase,
  deleteOldImageToUserInFirebaseStorage,
  CreateConversation,
  GetAllConversations,
  MarkAsReadChatNotification,
  MarkAsUnreadOtherUserChatNotification,
};
