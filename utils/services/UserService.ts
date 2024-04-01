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
    if (!params.email || !params.password) throw new Error('Email ou senha não informados');

    const verifyLastLetterEmailIfIsSpace =
      params.email[params.email.length - 1] === ' ' ? params.email.slice(0, -1) : params.email;

    params.email = verifyLastLetterEmailIfIsSpace.toLowerCase();

    const ref = collection(getFirestore(firebase), 'users');
    await addDoc(ref, {
      name: params.name || '',
      email: params.email,
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
  const data = docSnap.data() as IUser;
  return {
    ...data,
    conversations: data.conversations?.map((conv: any) => ({
      ...conv,
      createdAt: conv.createdAt.toDate(),
    })),
  };
};

const loginUser = async (email: string, password: string): Promise<IUser> => {
  const auth = getAuth(firebase);

  if (!email || !password) throw new Error('Email ou senha não informados');

  const verifyLastLetterEmailIfIsSpace =
    email[email.length - 1] === ' ' ? email.slice(0, -1) : email;

  email = verifyLastLetterEmailIfIsSpace.toLowerCase();

  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    try {
      const getDocRef = query(
        collection(getFirestore(firebase), 'users'),
        where('email', '==', email)
      );
      const docSnap = await getDocs(getDocRef);
      if (docSnap.empty) throw new Error('Usuário não encontrado');
      const user = docSnap.docs[0].data() as IUser;

      const getToken = await response.user.getIdTokenResult();

      const saveUserForApplication = {
        ...user,
        providerId: response.user.providerId,
        uid: docSnap.docs[0].id,
        token: getToken,
      };
      try {
        console.log('setou no cache');
        await AsyncStorage.setItem('user', JSON.stringify(saveUserForApplication));
      } catch (err: any) {
        console.log('Erro ao salvar usuário no AsyncStorage');
        throw new Error('Erro ao entrar!!');
      }
      return saveUserForApplication;
    } catch (err) {
      throw new Error('Erro ao entrar!!');
    }
  } catch (err) {
    throw new Error('Email ou senha incorretos');
  }
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

const CreateConversation = async (
  uid: string,
  params: Omit<IConversationsUser, 'createdAt'>
): Promise<boolean> => {
  try {
    const queryForVerifyIfExistConversation = doc(getFirestore(firebase), 'users', uid);
    const docSnapForVerifyIfExistConversation = await getDoc(queryForVerifyIfExistConversation);
    if (!docSnapForVerifyIfExistConversation.exists()) throw new Error('Usuário não encontrado');
    const userVerify = docSnapForVerifyIfExistConversation.data() as IUser;
    if (!userVerify.conversations) userVerify.conversations = [];
    const verifyIfExistConversation = userVerify.conversations.find(
      (conversation) => conversation.otherUserUid === params.otherUserUid
    );
    if (verifyIfExistConversation) return true;
    const docRef = doc(getFirestore(firebase), 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Usuário não encontrado');
    const user = docSnap.data() as IUser;
    const conversations = user.conversations || [];
    const newConversation: IConversationsUser = {
      ...params,
      createdAt: new Date(),
    };
    conversations.push(newConversation);
    console.log('criou!!');
    await setDoc(docRef, { conversations }, { merge: true });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const GetAllConversations = async (uid: string): Promise<IConversationsUser[]> => {
  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  const user = docSnap.data() as IUser;
  const newConversations = user.conversations?.map((conv: any) => ({
    ...conv,
    createdAt: conv.createdAt.toDate(),
  }));

  return newConversations || [];
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

const UpdateDataUser = async (uid: string): Promise<IUser> => {
  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  const data = docSnap.data() as IUser;
  const newConversations = data.conversations?.map((conv: any) => ({
    ...conv,
    createdAt: conv.createdAt.toDate(),
  }));
  console.log('newConversations', newConversations);

  return {
    ...data,
    uid: docSnap.id,
    conversations: newConversations,
  };
};

const GetAllPostsSaved = async (uid: string): Promise<IUser['posts_saved']> => {
  const docRef = doc(getFirestore(firebase), 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Usuário não encontrado');
  const user = docSnap.data() as IUser;
  return user.posts_saved || [];
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
  getOneUser,
  UpdateDataUser,
  GetAllPostsSaved,
};
