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
import { MessagesService } from './MessagesService';
import { IPostSaved, IUser } from './DTO/user.dto';

const CollectionName = 'reserve-donations';

const CreateReserveDonation = async (
  donation: CreateReserveDonationDTO
): Promise<IReserveDonation> => {
  const ref = collection(getFirestore(firebase), CollectionName);
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
    city: donation.city,
    state: donation.state,
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

const GetAllReserveDonations = async (
  uid: string,
  startAtParam: number,
  endAtParam: number,
  state: string,
  city: string
): Promise<{
  userReserveCount: number;
  donations: IReserveDonation[];
}> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const query1 = query(
    ref,
    or(
      where('reserve.endDateOfLastReserve', '==', null),
      where('reserve.endDateOfLastReserve', '<', new Date())
    ),
    orderBy('reserve.endDateOfLastReserve', 'asc'),
    startAt(startAtParam),
    limit(endAtParam)
  );
  const snapshot = await getDocs(query1);

  const queryYourReserves = query(ref, where('reserve.endOwnerUidOfLastReserve', '==', uid));
  const snapshotYourReserves = await getDocs(queryYourReserves);
  const removeIfDateIsBefore = snapshotYourReserves.docs.filter(
    (doc) =>
      doc.data().reserve.endDateOfLastReserve &&
      doc.data().reserve.endDateOfLastReserve.toDate() > new Date()
  );

  const updateDate = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name,
      description: data.description,
      images: data.images,
      ownerUid: data.ownerUid,
      createdAt: data.created.toDate(),
      ownerName: data.ownerName,
      city: data.city,
      state: data.state,
      reserve: {
        endDateOfLastReserve: data.reserve.endDateOfLastReserve
          ? data.reserve.endDateOfLastReserve.toDate()
          : undefined,
        endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
      },
    };
  });

  if (state && city) {
    const sortedData = updateDate.sort((a, b) => {
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

    const removeMyReserve = sortedData.filter((data) => data.ownerUid !== uid);

    return {
      userReserveCount: removeIfDateIsBefore.length,
      donations: removeMyReserve,
    };
  }

  const removeMyReserve = updateDate.filter((data) => data.ownerUid !== uid);

  return {
    userReserveCount: removeIfDateIsBefore.length,
    donations: removeMyReserve,
  };
};

const GetMyReserveDonations = async (uid: string): Promise<IReserveDonation[]> => {
  const ref = collection(getFirestore(firebase), CollectionName);
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
        city: data.city,
        state: data.state,
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
  const ref = collection(getFirestore(firebase), CollectionName);
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
        city: data.city,
        state: data.state,
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
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
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
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
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
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  await deleteDoc(docRef);
};

const UpdateReserveDonation = async (
  uid: string,
  donation: CreateReserveDonationDTO
): Promise<IReserveDonation> => {
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

const SearchReserveDonations = async (
  search: string,
  uid: string,
  startAtParam: number,
  endAtParam: number
): Promise<{
  userReserveCount: number;
  donations: IReserveDonation[];
}> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const q = query(
    ref,

    or(
      where('reserve.endDateOfLastReserve', '==', null),
      where('reserve.endDateOfLastReserve', '<', new Date())
    ),

    orderBy('reserve.endDateOfLastReserve', 'desc'),
    startAt(startAtParam),
    limit(endAtParam)
  );
  const snapshot = await getDocs(q);

  const queryYourReserves = query(ref, where('reserve.endOwnerUidOfLastReserve', '==', uid));
  const snapshotYourReserves = await getDocs(queryYourReserves);

  return {
    userReserveCount: snapshotYourReserves.docs.length,
    donations: snapshot.docs
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
          city: data.city,
          state: data.state,
          reserve: {
            endDateOfLastReserve: data.reserve.endDateOfLastReserve
              ? data.reserve.endDateOfLastReserve.toDate()
              : undefined,
            endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
            endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
          },
        };
      })
      .filter((data) => data.ownerUid !== uid)
      .filter((data) => data.name.includes(search) || data.description.includes(search)),
  };
};

const GetMyReserves = async (uid: string): Promise<IReserveDonation[]> => {
  const ref = collection(getFirestore(firebase), CollectionName);
  const queryRef = query(ref, where('reserve.endOwnerUidOfLastReserve', '==', uid));
  const querySnapshot = await getDocs(queryRef);
  return querySnapshot.docs
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
        city: data.city,
        state: data.state,
        reserve: {
          endDateOfLastReserve: data.reserve.endDateOfLastReserve
            ? data.reserve.endDateOfLastReserve.toDate()
            : undefined,
          endOwnerNameOfLastReserve: data.reserve.endOwnerNameOfLastReserve,
          endOwnerUidOfLastReserve: data.reserve.endOwnerUidOfLastReserve,
        },
      };
    })
    .filter(
      (donation) =>
        donation.reserve.endDateOfLastReserve && donation.reserve.endDateOfLastReserve > new Date()
    );
};

const CreateMessage = async ({
  uid_person_donation,
  uid_person_reserve,
  messages,
}: Omit<IReserveDonationMessageRealTime, 'createdAt'>): Promise<void> => {
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
): Promise<IReserveDonationMessageRealTime['messages']> => {
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

const CreateChatIfNotExists = async (
  uid_person_reserve: string,
  uid_person_donation: string
): Promise<void> => {
  const db = getDatabase(firebase);
  const ref = set(refDatabase(db, `messages/${uid_person_reserve}/${uid_person_donation}`), {
    messages: [],
    createdAt: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
    uid_person_reserve,
    uid_person_donation,
  });

  return ref;
};

const FinishReserve = async ({
  uid,
  endOwnerNameOfLastReserve,
  endOwnerUidOfLastReserve,
}: {
  uid: string;
  endOwnerNameOfLastReserve: string;
  endOwnerUidOfLastReserve: string;
}): Promise<Date> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  const newDate = new Date(2100, 1, 1);
  await setDoc(
    docRef,
    {
      reserve: {
        endDateOfLastReserve: newDate,
        endOwnerNameOfLastReserve: endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: endOwnerUidOfLastReserve,
      },
    },
    { merge: true }
  );
  return newDate;
};

const UnFinishReserve = async ({
  uid,
  endOwnerNameOfLastReserve,
  endOwnerUidOfLastReserve,
}: {
  uid: string;
  endOwnerNameOfLastReserve: string;
  endOwnerUidOfLastReserve: string;
}): Promise<Date> => {
  const docRef = doc(getFirestore(firebase), CollectionName, uid);
  const newDate = addDays(new Date(), 1);
  await setDoc(
    docRef,
    {
      reserve: {
        endDateOfLastReserve: newDate,
        endOwnerNameOfLastReserve: endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: endOwnerUidOfLastReserve,
      },
    },
    { merge: true }
  );
  return newDate;
};

const SaveReserveDonation = async ({
  donation,
  user_uid,
}: {
  donation: IReserveDonation;
  user_uid: string;
}): Promise<IPostSaved> => {
  const getUser = await getDoc(doc(getFirestore(firebase), 'users', user_uid));
  const data = getUser.data() as IUser;
  if (!data) throw new Error('Usuário não encontrado');
  const newList = [
    ...(data.posts_saved || []),
    {
      type: 'reserve',
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
    type: 'reserve',
    postId: donation.uid,
    postTitle: donation.name,
    postDescription: donation.description,
  };
};

const RemoveSavedReserveDonation = async ({
  donation,
  user_uid,
}: {
  donation: IReserveDonation;
  user_uid: string;
}): Promise<void> => {
  const getUser = await getDoc(doc(getFirestore(firebase), 'users', user_uid));
  const data = getUser.data() as IUser;
  if (!data) throw new Error('Usuário não encontrado');
  const newList = (data.posts_saved || []).filter((list) => list.postId !== donation.uid);
  await setDoc(
    doc(getFirestore(firebase), 'users', user_uid),
    {
      posts_saved: newList,
    },
    { merge: true }
  );
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
  SearchReserveDonations,
  GetMyReserves,
  CreateMessage,
  GetMyMessages,
  WatchEventMessage,
  FinishReserve,
  UnFinishReserve,
  SaveReserveDonation,
  RemoveSavedReserveDonation,
};
