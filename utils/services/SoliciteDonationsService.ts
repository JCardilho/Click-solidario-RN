import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  query,
  where,
  or,
  and,
  limit,
  startAt,
  orderBy,
} from 'firebase/firestore';

import firebase from '../firebase';
import { addDays, addMilliseconds, format } from 'date-fns';
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  CreateSoliciteDonationDTO,
  ISoliciteDonation,
  ISoliciteDonationMessageRealTime,
} from './DTO/solicite-donation.dto';
import { MessagesService } from './MessagesService';
import { DataSnapshot, Unsubscribe } from 'firebase/database';

const CollectionName = 'solicite-donations';

const CreateSoliciteDonation = async (
  donation: CreateSoliciteDonationDTO
): Promise<ISoliciteDonation> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const date = new Date();

  const createDoc = {
    name: donation.name,
    description: donation.description,
    images: donation.images,
    ownerUid: donation.ownerUid,
    createdAt: date,
    ownerName: donation.ownerName,
    isVerified: false,
    helpedList: [],
    isFinished: false,
  };

  const doc = await addDoc(ref, createDoc);

  return {
    ...createDoc,
    uid: doc.id,
    createdAt: date,
  };
};

const GetAllSoliciteDonations = async (
  uid: string,
  startAtParam: number,
  endAtParam: number
): Promise<ISoliciteDonation[]> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const query1 = query(
    ref,
    where('isFinished', '==', false),
    orderBy('isFinished', 'desc'),
    startAt(startAtParam),
    limit(endAtParam)
  );
  const snapshot = await getDocs(query1);
  const result: ISoliciteDonation[] = snapshot.docs
    .map((doc) => {
      return {
        ...(doc.data() as any),
        uid: doc.id,
        createdAt: doc.data().createdAt.toDate(),
      };
    })
    .filter((donation) => donation.ownerUid !== uid);

  return result;
};

const GetMySoliciteDonations = async (uid: string): Promise<ISoliciteDonation[]> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const snapshot = await getDocs(ref);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...(data as any),
        uid: doc.id,
        createdAt: data.createdAt.toDate(),
      };
    })
    .filter((donation) => donation.ownerUid === uid);
};

const GetOneSoliciteDonations = async (uid: string): Promise<ISoliciteDonation | undefined> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const snapshot = await getDocs(ref);
  const result = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...(data as any),
        uid: doc.id,
        createdAt: data.createdAt.toDate(),
      };
    })
    .filter((donation) => donation.uid === uid);

  return result[0];
};

const SearchSoliciteDonations = async (
  search: string,
  uid: string,
  startAtParam: number,
  endAtParam: number
): Promise<ISoliciteDonation[]> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const query1 = query(
    ref,
    where('isFinished', '==', false),
    orderBy('isFinished', 'desc'),
    startAt(startAtParam),
    limit(endAtParam)
  );
  const snapshot = await getDocs(query1);
  const result = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...(data as any),
        uid: doc.id,
        createdAt: data.created.toDate(),
      };
    })
    .filter((data) => data.ownerUid !== uid)
    .filter((data) => data.name.includes(search) || data.description.includes(search));

  return result;
};

const ExcludeSoliciteDonation = async (uid: string): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await deleteDoc(docRef);
};

const FinishSolicite = async ({ uid }: { uid: string }): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await setDoc(
    docRef,
    {
      isFinished: true,
    },
    { merge: true }
  );
};

const UnFinishSolicite = async ({ uid }: { uid: string }): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await setDoc(
    docRef,
    {
      isFinished: false,
    },
    { merge: true }
  );
};

const CreateMessage = async ({
  uid_person_donation,
  uid_person_reserve,
  messages,
}: Omit<ISoliciteDonationMessageRealTime, 'createdAt'>): Promise<void> => {
  /* const db = getDatabase(firebase);
  const getOldMessages = await GetMyMessages(uid_person_reserve, uid_person_donation);

  console.log('getOldMessages', getOldMessages);

  const ref = set(
    refDatabase(db, `messages/${uid_person_reserve}/${uid_person_donation}`),
    {
      messages: getOldMessages ? [...getOldMessages, messages[0]] : [messages[0]],
      createdAt: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
      uid_person_reserve,
      uid_person_donation,
    }
  );

  return ref; */
  await MessagesService.CreateMessage({
    uid_person_necessary: uid_person_reserve,
    uid_person_donation,
    messages,
  });
};

const GetMyMessages = async (
  uid_person_reserve: string,
  uid_person_donation: string
): Promise<ISoliciteDonationMessageRealTime['messages']> => {
  /*   const db = getDatabase(firebase);
  const ref = refDatabase(db, `messages/${uid_person_reserve}/${uid_person_donation}`);
  const snapshot = await get(ref);
  const data = snapshot.val();
  if (!data) return [];
  return data.messages; */
  const response = await MessagesService.GetMyMessages(uid_person_reserve, uid_person_donation);
  return response;
};

const WatchEventMessage = (
  uid_person_reserve: string,
  uid_person_donation: string,
  func: (snap: DataSnapshot) => void
): Unsubscribe => {
  try {
    /*  console.log('uid_person_reserve', uid_person_reserve);
    console.log('uid_person_donation', uid_person_donation);

    const db = getDatabase(firebase);
    const ref = refDatabase(db, `messages/${uid_person_reserve}/${uid_person_donation}`);

    return onValue(ref, (snapshot) => func(snapshot)); */
    return MessagesService.WatchEventMessage(uid_person_reserve, uid_person_donation, func);
  } catch (err) {
    console.log('err', err);
    return () => {};
  }
};

export const SoliciteDonationsSerivce = {
  CreateSoliciteDonation,
  GetAllSoliciteDonations,
  GetMySoliciteDonations,
  GetOneSoliciteDonations,
  SearchSoliciteDonations,
  FinishSolicite,
  UnFinishSolicite,
  ExcludeSoliciteDonation,
  CreateMessage,
  GetMyMessages,
  WatchEventMessage,
};
