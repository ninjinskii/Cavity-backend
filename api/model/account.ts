export class Account {
  constructor(
    public id: number,
    public email: string,
    public password: string,
    public registrationCode: number | null,
    public resetToken: string | null,
    public lastUser: string | null,
    public lastUpdateTime: number | null,
  ) {
  }

  static generateRegistrationCode(): number {
    const max = 999999;
    const min = 100000;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export interface AccountDTO {
  email: string;
  password: string;
}

export interface ConfirmAccountDTO {
  email: string;
  registrationCode: string;
}
