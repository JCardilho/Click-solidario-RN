import { AuthCredential, IdTokenResult } from 'firebase/auth';
import { z } from 'zod';

export interface CreateUserDTO {
  email: string;
  cpf?: string;
  name?: string;
  password: string;
  pix?: {
    key: string;
    type: string;
  };
}

export interface IUser extends Omit<CreateUserDTO, 'password'>, Pick<AuthCredential, 'providerId'> {
  socialAssistant?: boolean;
  administrator?: boolean;
  image?: string;
  uid: string;
  conversations?: IConversationsUser[];
  notifications?: Notifications[];
  token?: IdTokenResult ;
}

export interface IConversationsUser {
  routeQuery: string;
  otherUserUid: string;
  otherUserName: string;
  isNotification: boolean;
}

interface Notifications {
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

const userSchema = z.object({
  email: z.string().email(),
  cpf: z.string().optional(),
  name: z.string().optional(),
  pix: z
    .object({
      key: z.string(),
      type: z.string(),
    })
    .optional(),
  socialAssistant: z.boolean().optional(),
  administrator: z.boolean().optional(),
  providerId: z.string(),
  image: z.string().optional(),
  uid: z.string(),
});

export const verifyUserWithZodSchema = (user: IUser | null): boolean => {
  if (!user) return false;
  const verify = userSchema.safeParse(user);
  return verify.success;
};
