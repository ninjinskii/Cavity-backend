export interface Account {
  id?: number;
  email: string;
  password: string;
  registrationCode: number | null;
  registration_code?: number | null;
  resetToken?: string;
}

export function generateRegistrationCode(): number {
  const max = 999999;
  const min = 100000;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface AccountDTO {
  email: string;
  password: string;
}

export interface ConfirmAccountDTO {
  email: string;
  registrationCode: string;
}
