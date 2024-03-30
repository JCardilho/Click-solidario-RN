export interface IMessageRealTimeStructure {
    createdAt: string;
    messages: IMessage[];
    uid_person_necessary: string;
    uid_person_donation: string;
  }
  
  interface IMessage {
    text: string;
    createdAt: string;
    owner_message_uid: string;
  }
  