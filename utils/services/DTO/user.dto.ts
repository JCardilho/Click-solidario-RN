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
