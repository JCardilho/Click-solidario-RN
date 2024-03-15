import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { CreateReserveDonationDTO, IReserveDonation } from './DTO/reserve-donation.dto';
import firebase from '../firebase';
import { addDays, addMilliseconds } from 'date-fns';

const CreateReserveDonation = async (
  donation: CreateReserveDonationDTO
): Promise<IReserveDonation> => {
  const ref = collection(getFirestore(firebase), 'reserve-donations');
  const date = new Date();

  const doc = await addDoc(ref, {
    name: donation.name,
    description: donation.description,
    images: donation.images,
    ownerUid: donation.ownerUid,
    created: date,
    reserve: {
      endDateOfLastReserve: null,
      endOwnerNameOfLastReserve: '',
      endOwnerUidOfLastReserve: '',
    },
    ownerName: donation.ownerName,
  });

  return {
    ...donation,
    uid: doc.id,
    createdAt: date,
    reserve: {
      endDateOfLastReserve: undefined,
      endOwnerNameOfLastReserve: '',
      endOwnerUidOfLastReserve: '',
    },
  };
};

const GetAllReserveDonations = async (): Promise<IReserveDonation[]> => {
  const ref = collection(getFirestore(firebase), 'reserve-donations');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name,
      description: data.description,
      images: data.images,
      ownerUid: data.ownerUid,
      createdAt: data.created.toDate(),
      ownerName: data.ownerName,
      reserve: {
        endDateOfLastReserve: data.reserve.endDateOfLastReserve
          ? data.reserve.endDateOfLastReserve.toDate()
          : undefined,
        endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
      },
    };
  });
};

const GetMyReserveDonations = async (uid: string): Promise<IReserveDonation[]> => {
  const ref = collection(getFirestore(firebase), 'reserve-donations');
  const snapshot = await getDocs(ref);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();

      return {
        uid: doc.id,
        name: data.name,
        description: data.description,
        images: data.images,
        ownerUid: data.ownerUid,
        createdAt: data.created.toDate(),
        ownerName: data.ownerName,
        reserve: {
          endDateOfLastReserve: data.reserve.endDateOfLastReserve
            ? data.reserve.endDateOfLastReserve.toDate()
            : undefined,
          endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
          endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
        },
      };
    })
    .filter((donation) => donation.ownerUid === uid);
};

const GetOneReserveDonation = async (uid: string): Promise<IReserveDonation | undefined> => {
  const ref = collection(getFirestore(firebase), 'reserve-donations');
  const snapshot = await getDocs(ref);
  const result = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name,
        description: data.description,
        images: data.images,
        ownerUid: data.ownerUid,
        createdAt: data.created.toDate(),
        ownerName: data.ownerName,
        reserve: {
          endDateOfLastReserve: data.reserve.endDateOfLastReserve
            ? data.reserve.endDateOfLastReserve.toDate()
            : undefined,
          endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
          endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
        },
      };
    })
    .filter((donation) => donation.uid === uid);

  return result[0];
};

const ReserveDonationAction = async (
  uid: string,
  owner: Omit<IReserveDonation['reserve'], 'endDateOfLastReserve'>
): Promise<void> => {
  const docRef = doc(getFirestore(firebase), 'reserve-donations', uid);
  const endDateOfLastReserve = addDays(new Date(), 1);
  await setDoc(
    docRef,
    {
      reserve: {
        endDateOfLastReserve,
        endOwnerNameOfLastReserve: owner.endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: owner.endOwnerUidOfLastReserve,
      },
    },
    { merge: true }
  );
};

const RemoveReserveAction = async (uid: string): Promise<void> => {
  const docRef = doc(getFirestore(firebase), 'reserve-donations', uid);
  await setDoc(
    docRef,
    {
      reserve: {
        endDateOfLastReserve: null,
        endOwnerNameOfLastReserve: '',
        endOwnerUidOfLastReserve: '',
      },
    },
    { merge: true }
  );
};

const ExcludeReserveDonation = async (uid: string): Promise<void> => {
  const docRef = doc(getFirestore(firebase), 'reserve-donations', uid);
  await deleteDoc(docRef);
};

export const ReserveDonationsService = {
  CreateReserveDonation,
  GetAllReserveDonations,
  GetMyReserveDonations,
  GetOneReserveDonation,
  ReserveDonationAction,
  RemoveReserveAction,
  ExcludeReserveDonation,
};
