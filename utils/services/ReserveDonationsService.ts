import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { CreateReserveDonationDTO, IReserveDonation } from './DTO/reserve-donation.dto';
import firebase from '../firebase';

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
    isReserved: false,
    ownerName: donation.ownerName,
  });

  return {
    ...donation,
    uid: doc.id,
    createdAt: date,
    isReserved: false,
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
      isReserved: data.isReserved,
      ownerName: data.ownerName,
    };
  });
};

export const ReserveDonationsService = {
  CreateReserveDonation,
  GetAllReserveDonations,
};
