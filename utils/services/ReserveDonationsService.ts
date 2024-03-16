import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { CreateReserveDonationDTO, IReserveDonation } from './DTO/reserve-donation.dto';
import firebase from '../firebase';
import { addDays, addMilliseconds } from 'date-fns';
import { deleteObject, ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

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
): Promise<IReserveDonation['reserve']> => {
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
  return {
    endDateOfLastReserve,
    endOwnerNameOfLastReserve: owner.endOwnerNameOfLastReserve,
    endOwnerUidOfLastReserve: owner.endOwnerUidOfLastReserve,
  };
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

const UpdateReserveDonation = async (
  uid: string,
  donation: CreateReserveDonationDTO
): Promise<IReserveDonation> => {
  const docRef = doc(getFirestore(firebase), 'reserve-donations', uid);
  await setDoc(
    docRef,
    {
      name: donation.name,
      description: donation.description,
      images: donation.images,
    },
    { merge: true }
  );
  const getResult = await GetOneReserveDonation(uid);
  console.log('getResult', getResult);
  if (!getResult) throw new Error('Donation not found');
  return getResult;
};

const DeleteImages = async (images: string[], uid: string): Promise<void> => {
  const storage = getStorage();
  const result = images.map(async (url) => {
    if (!url) return;
    const desertRef = ref(storage, url);
    await deleteObject(desertRef);
    console.log('deletado', url);
  });
  const getReserveRef = collection(getFirestore(firebase), 'reserve-donations', uid);
  const getDoc = await getDocs(getReserveRef);
  const data = getDoc.docs[0].data();
  const newImages = data.images.filter((image: string) => !images.includes(image));
  await setDoc(getDoc.docs[0].ref, { images: newImages }, { merge: true });
  await Promise.all(result);
};

const DeleteImage = async (image: string, uid: string): Promise<void> => {
  const storage = getStorage();
  const desertRef = ref(storage, image);
  await deleteObject(desertRef);
  console.log('deletou', image);
  const getReserveRef = doc(getFirestore(firebase), 'reserve-donations', uid);
  const getDocrSnap = await getDoc(getReserveRef);
  const data = getDocrSnap.data();
  if (!data) throw new Error('Reserva não encontrada');
  const newImages = data.images.filter((img: string) => img !== image);
  console.log('ref', getDocrSnap.ref);
  await setDoc(getDocrSnap.ref, { images: newImages }, { merge: true });
};

const AddImages = async (uid: string, images: string): Promise<string | undefined> => {
  try {
    const response = await fetch(images);
    const blob = await response.blob();
    const fileName = images.substring(images.lastIndexOf('/') + 1);
    const storage = getStorage();
    const mountainsRef = ref(
      storage,
      `images/reserve-donations/${uid}/${fileName + Date.now().toString()}`
    );

    const result = await uploadBytes(mountainsRef, blob).then(async (snapshot) => {
      const downloadUrl = await getDownloadURL(snapshot.ref).then(async (url) => {
        const updateDoc = doc(getFirestore(firebase), 'reserve-donations', uid);
        const oldValue = await getDoc(updateDoc);
        const data = oldValue.data();
        await setDoc(updateDoc, { images: [...(data?.images || []), url] }, { merge: true });
        return url;
      });
      return downloadUrl;
    });

    return result;
  } catch (err) {
    console.log('err', err);
  }
};

export const ReserveDonationsService = {
  CreateReserveDonation,
  GetAllReserveDonations,
  GetMyReserveDonations,
  GetOneReserveDonation,
  ReserveDonationAction,
  RemoveReserveAction,
  ExcludeReserveDonation,
  UpdateReserveDonation,
  DeleteImage,
  DeleteImages,
  AddImages,
};
