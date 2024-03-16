import { create } from 'zustand';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';

interface Types {
  ViewReserveDonations: IReserveDonation[];
}

interface Actions {
  addViewReserveDonations: (data: IReserveDonation) => void;
  updateViewReserveDonations: (data: IReserveDonation) => void;
  setImages: (images: string[], uid: string) => void;
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
}));

export const useReserveDonations = () => {
  const { ViewReserveDonations, addViewReserveDonations, updateViewReserveDonations, setImages } =
    useReserveDonationsZustand();

  const searchViewReserveDonations = (uid: string) => {
    const result = ViewReserveDonations.find((item) => item.uid === uid);
    return result;
  };

  return {
    ViewReserveDonations,
    addViewReserveDonations,
    searchViewReserveDonations,
    updateViewReserveDonations,
    setImages,
  };
};
