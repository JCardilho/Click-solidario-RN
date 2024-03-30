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
import { CreateSoliciteDonationDTO, ISoliciteDonation } from './DTO/solicite-donation.dto';

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

export const SoliciteDonationsSerivce = {
  CreateSoliciteDonation,
  GetAllSoliciteDonations,
  GetMySoliciteDonations,
  GetOneSoliciteDonations,
  SearchSoliciteDonations,
};
