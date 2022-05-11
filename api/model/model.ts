import { DataTypes, Model } from "../../deps.ts";

export class Account extends Model {
  static table = "account";
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    registrationCode: {
      type: DataTypes.INTEGER,
      as: "registration_code",
      allowNull: true,
    },
  };

  generateRegistrationCode(): number {
    const max = 999999;
    const min = 100000;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  all(): Promise<Array<Model>> {
    return Account.all()
  }

  where = Account.where
}

export interface AccountDTO {
  email: string;
  password: string;
}

export interface ConfirmAccountDTO {
  email: string;
  registrationCode: string;
}
