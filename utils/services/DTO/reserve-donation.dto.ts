export interface CreateReserveDonationDTO {
  name: string;
  description: string;
  images: Array<String> | undefined;
  ownerUid: string;
}

export interface IReserveDonation extends CreateReserveDonationDTO {
  createdAt: Date;
  isReserved: boolean;
  uid: string;
}
