export class Account {
  id!: number;
  email: string;
  password: string;
  registration_code: number | null;

  constructor(account: AccountDTO) {
    this.email = account.email;
    this.password = account.password;
    this.registration_code = this.generateRegistrationCode();
  }

  private generateRegistrationCode(): number {
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
