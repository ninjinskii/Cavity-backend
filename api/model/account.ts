export class Account {
  id!: number;
  email: string;
  password: string;
  registration_code: number | undefined;

  constructor(account: AccountDTO) {
    this.email = account.email;
    this.password = account.password;
    this.registration_code = 123456;
  }
}

export interface AccountDTO {
  email: string;
  password: string;
}
