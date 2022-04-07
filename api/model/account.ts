export class Account {
  id!: number;
  email: string;
  password: string;
  registrationCode: number | undefined;

  constructor(account: AccountDTO) {
    this.email = account.email;
    this.password = account.password;
    this.registrationCode = 123456;
  }
}

export interface AccountDTO {
  email: string;
  password: string;
}
