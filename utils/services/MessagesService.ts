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
import {
  CreateReserveDonationDTO,
  IReserveDonation,
  IReserveDonationMessageRealTime,
} from './DTO/reserve-donation.dto';
import firebase from '../firebase';
import { addDays, addMilliseconds, format } from 'date-fns';
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  DataSnapshot,
  Unsubscribe,
  child,
  get,
  getDatabase,
  onValue,
  ref as refDatabase,
  set,
} from 'firebase/database';
import { IMessageRealTimeStructure } from './DTO/message.dto';

const CreateMessage = async ({
  uid_person_donation,
  uid_person_necessary,
  messages,
}: Omit<IMessageRealTimeStructure, 'createdAt'>): Promise<void> => {
  const db = getDatabase(firebase);
  const getOldMessages = await GetMyMessages(uid_person_necessary, uid_person_donation);

  console.log('getOldMessages', getOldMessages);

  const ref = set(refDatabase(db, `messages/${uid_person_necessary}/${uid_person_donation}`), {
    messages: getOldMessages ? [...getOldMessages, messages[0]] : [messages[0]],
    createdAt: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
    uid_person_necessary,
    uid_person_donation,
  });

  return ref;
};

const GetMyMessages = async (
  uid_person_necessary: string,
  uid_person_donation: string
): Promise<IMessageRealTimeStructure['messages']> => {
  const db = getDatabase(firebase);
  const ref = refDatabase(db, `messages/${uid_person_necessary}/${uid_person_donation}`);
  const snapshot = await get(ref);
  const data = snapshot.val();
  if (!data) return [];
  return data.messages;
};

const WatchEventMessage = (
  uid_person_necessary: string,
  uid_person_donation: string,
  func: (snap: DataSnapshot) => void
): Unsubscribe => {
  try {
    console.log('uid_person_reserve', uid_person_necessary);
    console.log('uid_person_donation', uid_person_donation);

    const db = getDatabase(firebase);
    const ref = refDatabase(db, `messages/${uid_person_necessary}/${uid_person_donation}`);

    return onValue(ref, (snapshot) => func(snapshot));
  } catch (err) {
    console.log('err', err);
    return () => {};
  }
};

export const MessagesService = {
  CreateMessage,
  GetMyMessages,
  WatchEventMessage,
};
