export interface CreateSoliciteDonationDTO {
  name: string;
  description: string;
  images: Array<String> | undefined;
  ownerUid: string;
  ownerName?: string;
}

export interface ISoliciteDonation extends CreateSoliciteDonationDTO {
  createdAt: Date;
  isVerified: boolean;
  helpedList: ISoliciteDonationHelpedList[];
  uid: string;
  isFinished?: boolean;
}

export interface ISoliciteDonationHelpedList {
  uid: string;
  name: string;
  message?: string;
  type: 'partial' | 'total';
  isVerified: boolean;
}

// Realtime Database

export interface ISoliciteDonationMessageRealTime {
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
