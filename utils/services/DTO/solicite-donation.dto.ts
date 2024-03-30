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
}
