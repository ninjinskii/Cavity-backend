import * as bcrypt from "bcrypt";

export default class PasswordService {
  // Using hashSync() instead of hash() because hash() is causing a crash on Deno deploy
  // See https://github.com/denoland/deploy_feedback/issues/171
  public static encrypt(password: string): string {
    return bcrypt.hashSync(password);
  }

  // Using compareSync() instead of compare() because compare() is causing a crash on Deno deploy
  // See https://github.com/denoland/deploy_feedback/issues/171
  public static compare(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
