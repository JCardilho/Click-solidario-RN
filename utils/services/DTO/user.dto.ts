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
  state: string;
  city: string;
}

export interface IUser extends Omit<CreateUserDTO, 'password'>, Pick<AuthCredential, 'providerId'> {
  socialAssistant?: boolean;
  administrator?: boolean;
  image?: string;
  uid: string;
  conversations?: IConversationsUser[];
  notifications?: Notifications[];
  token?: IdTokenResult;
  posts_saved?: IPostSaved[];
}

export interface IConversationsUser {
  routeQuery: string;
  otherUserUid: string;
  otherUserName: string;
  isNotification: boolean;
  createdAt: Date;
  fromMessage: string;
}

interface Notifications {
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

export interface IPostSaved {
  type: 'reserve' | 'solicite';
  postId: string;
  postTitle: string;
  postDescription: string;
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
  image: z.string().optional(),
  uid: z.string(),
  conversations: z
    .array(
      z.object({
        routeQuery: z.string(),
        otherUserUid: z.string(),
        otherUserName: z.string(),
        isNotification: z.boolean(),
        createdAt: z.date(),
        fromMessage: z.string().optional(),
      })
    )
    .optional(),
  notifications: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        date: z.string(),
        isRead: z.boolean(),
      })
    )
    .optional(),
  posts_saved: z
    .array(
      z.object({
        type: z.string(),
        postId: z.string(),
        postTitle: z.string(),
        postDescription: z.string(),
      })
    )
    .optional(),
});

export const verifyUserWithZodSchema = (user: IUser | null): boolean => {
  if (!user) return false;
  const verify = userSchema.safeParse(user);
  if (!verify.success) console.log(verify.error);
  return verify.success;
};
