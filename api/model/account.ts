import { Entity, Field, Nullable, PrimaryKey, SizedField } from "../../deps.ts";

@Entity("account")
export class Account {
  constructor(
    @PrimaryKey("SERIAL") public id: number,
    @SizedField("VARCHAR", 255) public email: string,
    @Field("VARCHAR") public password: string,
    @Field("INT", Nullable.YES, "registration_code") public registrationCode:
      | number
      | null,
    @SizedField("VARCHAR", 300) public resetToken: string | null,
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
