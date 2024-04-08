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
  ISoliciteDonationHelpedList,
  ISoliciteDonationMessageRealTime,
} from './DTO/solicite-donation.dto';
import { MessagesService } from './MessagesService';
import { DataSnapshot, Unsubscribe } from 'firebase/database';
import { IPostSaved, IUser } from './DTO/user.dto';

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
    city: donation.city,
    state: donation.state,
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
  endAtParam: number,
  state: string,
  city: string
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

  const formattedData = snapshot.docs.map((doc) => {
    return {
      ...(doc.data() as any),
      uid: doc.id,
      createdAt: doc.data().createdAt.toDate(),
    };
  });

  if (state && city) {
    const sortedData = formattedData.sort((a, b) => {
      if (a.state === state) {
        if (a.city === city) {
          return -1;
        } else if (b.city === city) {
          return 1;
        }
        return 0;
      }
      return 0;
    });

    const removeMySoliciations = sortedData.filter((donation) => donation.ownerUid !== uid);

    const result: ISoliciteDonation[] = removeMySoliciations;

    return result;
  }

  const removeMySoliciations = formattedData.filter((donation) => donation.ownerUid !== uid);
  const result: ISoliciteDonation[] = removeMySoliciations;
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
        createdAt: data.createdAt.toDate(),
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
    uid_person_necessary: uid_person_donation,
    uid_person_donation: uid_person_reserve,
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
  const response = await MessagesService.GetMyMessages(uid_person_donation, uid_person_reserve);
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
    return MessagesService.WatchEventMessage(uid_person_donation, uid_person_reserve, func);
  } catch (err) {
    console.log('err', err);
    return () => {};
  }
};

const UpdateUpdateDonation = async (
  uid: string,
  donation: CreateSoliciteDonationDTO
): Promise<ISoliciteDonation> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await setDoc(
    docRef,
    {
      name: donation.name,
      description: donation.description,
      images: donation.images,
    },
    { merge: true }
  );
  const getResult = await GetOneSoliciteDonations(uid);
  if (!getResult) throw new Error('Donation not found');
  return getResult;
};

const AddImages = async (uid: string, images: string): Promise<string | undefined> => {
  try {
    const response = await fetch(images);
    const blob = await response.blob();
    const fileName = images.substring(images.lastIndexOf('/') + 1);
    const storage = getStorage();
    const mountainsRef = ref(
      storage,
      `images/${CollectionName}/${uid}/${fileName + Date.now().toString()}`
    );

    const result = await uploadBytes(mountainsRef, blob).then(async (snapshot) => {
      const downloadUrl = await getDownloadURL(snapshot.ref).then(async (url) => {
        const updateDoc = doc(getFirestore(firebase), CollectionName, uid);
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

const DeleteImages = async (images: string[], uid: string): Promise<void> => {
  const storage = getStorage();
  const result = images.map(async (url) => {
    if (!url) return;
    const desertRef = ref(storage, url);
    await deleteObject(desertRef);
    console.log('deletado', url);
  });
  const getReserveRef = collection(getFirestore(firebase), CollectionName, uid);
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
  const getReserveRef = doc(getFirestore(firebase), CollectionName, uid);
  const getDocrSnap = await getDoc(getReserveRef);
  const data = getDocrSnap.data();
  if (!data) throw new Error('Reserva não encontrada');
  const newImages = data.images.filter((img: string) => img !== image);
  console.log('ref', getDocrSnap.ref);
  await setDoc(getDocrSnap.ref, { images: newImages }, { merge: true });
};

const RegisterAssistence = async ({
  assistence,
  solicite_donation_uid,
}: {
  assistence: ISoliciteDonationHelpedList;
  solicite_donation_uid: string;
}): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, solicite_donation_uid);
  const getDocRef = await getDoc(docRef);
  const data = getDocRef.data() as ISoliciteDonation;
  if (!data) throw new Error('Reserva não encontrada');
  const newAssistence = [...data.helpedList, assistence];
  await setDoc(
    docRef,
    {
      helpedList: newAssistence,
    },
    { merge: true }
  );
};

const RemoveAssistence = async ({
  user_uid,
  solicite_donation_uid,
}: {
  solicite_donation_uid: string;
  user_uid: string;
}): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, solicite_donation_uid);
  const getDocRef = await getDoc(docRef);
  const data = getDocRef.data() as ISoliciteDonation;
  if (!data) throw new Error('Reserva não encontrada');
  const newAssistence = data.helpedList.filter((list) => list.uid !== user_uid);
  await setDoc(
    docRef,
    {
      helpedList: newAssistence,
    },
    { merge: true }
  );
};

const VerifiedAssistence = async ({
  user_uid,
  solicite_donation_uid,
}: {
  solicite_donation_uid: string;
  user_uid: string;
}): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, solicite_donation_uid);
  const getDocRef = await getDoc(docRef);
  const data = getDocRef.data() as ISoliciteDonation;
  if (!data) throw new Error('Reserva não encontrada');
  const newAssistence = data.helpedList.map((list) => {
    if (list.uid === user_uid) {
      return {
        ...list,
        isVerified: true,
      };
    }
    return list;
  });
  await setDoc(
    docRef,
    {
      helpedList: newAssistence,
    },
    { merge: true }
  );
};

const UnVerifiedAssistence = async ({
  user_uid,
  solicite_donation_uid,
}: {
  solicite_donation_uid: string;
  user_uid: string;
}): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, solicite_donation_uid);
  const getDocRef = await getDoc(docRef);
  const data = getDocRef.data() as ISoliciteDonation;
  if (!data) throw new Error('Reserva não encontrada');
  const newAssistence = data.helpedList.map((list) => {
    if (list.uid === user_uid) {
      return {
        ...list,
        isVerified: false,
      };
    }
    return list;
  });
  await setDoc(
    docRef,
    {
      helpedList: newAssistence,
    },
    { merge: true }
  );
};

const SaveSoliciteDonation = async ({
  donation,
  user_uid,
}: {
  donation: ISoliciteDonation;
  user_uid: string;
}): Promise<IPostSaved> => {
  const getUser = await getDoc(doc(getFirestore(firebase), 'users', user_uid));
  const data = getUser.data() as IUser;
  if (!data) throw new Error('Usuário não encontrado');
  const newList = [
    ...(data.posts_saved || []),
    {
      type: 'solicite',
      postId: donation.uid,
      postTitle: donation.name,
      postDescription: donation.description,
    },
  ];
  await setDoc(
    doc(getFirestore(firebase), 'users', user_uid),
    {
      posts_saved: newList,
    },
    { merge: true }
  );
  return {
    type: 'solicite',
    postId: donation.uid,
    postTitle: donation.name,
    postDescription: donation.description,
  };
};

const RemoveSavedSoliciteDonation = async ({
  donation,
  user_uid,
}: {
  donation: ISoliciteDonation;
  user_uid: string;
}): Promise<void> => {
  const getUser = await getDoc(doc(getFirestore(firebase), 'users', user_uid));
  const data = getUser.data() as IUser;
  if (!data) throw new Error('Usuário não encontrado');
  const verifyIfAlreadySaved = (data.posts_saved || []).find(
    (list) => list.postId === donation.uid
  );
  if (!verifyIfAlreadySaved) return;
  const newList = (data.posts_saved || []).filter((list) => list.postId !== donation.uid);
  await setDoc(
    doc(getFirestore(firebase), 'users', user_uid),
    {
      posts_saved: newList,
    },
    { merge: true }
  );
};

const VerifiedSocilitationOfSocialAssistence = async ({
  uid,
  isVerified,
}: {
  uid: string;
  isVerified: boolean;
}): Promise<void> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await setDoc(
    docRef,
    {
      isVerified,
    },
    { merge: true }
  );
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
  UpdateUpdateDonation,
  AddImages,
  DeleteImages,
  DeleteImage,
  RegisterAssistence,
  RemoveAssistence,
  VerifiedAssistence,
  UnVerifiedAssistence,
  SaveSoliciteDonation,
  RemoveSavedSoliciteDonation,
  VerifiedSocilitationOfSocialAssistence,
};
