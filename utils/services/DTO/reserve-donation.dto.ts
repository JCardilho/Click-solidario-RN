export interface CreateReserveDonationDTO {
  name: string;
  description: string;
  images: Array<String> | undefined;
  ownerUid: string;
  ownerName?: string;
}

export interface IReserveDonation extends CreateReserveDonationDTO {
  createdAt: Date;
  reserve: IReserveOwner;
  uid: string;
}

interface IReserveOwner {
  endDateOfLastReserve?: Date;
  endOwnerUidOfLastReserve?: string;
  endOwnerNameOfLastReserve?: string;
}
