export interface CreateReserveDonationDTO {
  name: string;
  description: string;
  images: Array<String> | undefined;
  ownerUid: string;
  ownerName?: string;
  city: string;
  state: string;
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

// Realtime Database

export interface IReserveDonationMessageRealTime {
  createdAt: string;
  messages: IMessage[];
  uid_person_reserve: string;
  uid_person_donation: string;
}

interface IMessage {
  text: string;
  createdAt: string;
  owner_message_uid: string;
}
