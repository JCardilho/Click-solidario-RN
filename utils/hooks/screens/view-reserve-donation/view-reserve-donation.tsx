import { create } from 'zustand';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';

interface Types {
  ViewReserveDonations: IReserveDonation[];
}

interface Actions {
  addViewReserveDonations: (data: IReserveDonation) => void;
  updateViewReserveDonations: (data: IReserveDonation) => void;
  setImages: (images: string[], uid: string) => void;
  setReserve: (reserve: IReserveDonation['reserve'], uid: string) => void;
}

const useReserveDonationsZustand = create<Types & Actions>((set) => ({
  ViewReserveDonations: [],
  addViewReserveDonations: (data) =>
    set((state) => ({ ViewReserveDonations: [...state.ViewReserveDonations, data] })),
  updateViewReserveDonations: (data) => {
    set((state) => {
      const index = state.ViewReserveDonations.findIndex((item) => item.uid === data.uid);
      state.ViewReserveDonations[index] = data;
      return { ViewReserveDonations: state.ViewReserveDonations };
    });
  },
  setImages: (images, uid) => {
    set((state) => {
      const index = state.ViewReserveDonations.findIndex((item) => item.uid === uid);
      state.ViewReserveDonations[index].images = images;
      return { ViewReserveDonations: state.ViewReserveDonations };
    });
  },
  setReserve: (reserve, uid) => {
    set((state) => {
      const index = state.ViewReserveDonations.findIndex((item) => item.uid === uid);
      state.ViewReserveDonations[index].reserve = reserve;
      return { ViewReserveDonations: state.ViewReserveDonations };
    });
  },
}));

export const useReserveDonations = () => {
  const zustand = useReserveDonationsZustand();

  const searchViewReserveDonations = (uid: string) => {
    const result = zustand.ViewReserveDonations.find((item) => item.uid === uid);
    return result;
  };

  return {
    ...zustand,
    searchViewReserveDonations,
  };
};
