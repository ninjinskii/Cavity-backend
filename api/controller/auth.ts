import { bcrypt, Context, jwt } from "../../deps.ts";
import { Account, AccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";

export default class AuthController extends Controller {
  jwtKey: CryptoKey | null = null;

  get default() {
    return "/auth/login";
  }

  async handleRequests(): Promise<void> {
    this.jwtKey = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );

    this.app
      .post(this.default, (ctx: Context) => this.login(ctx));
  }

  async login(ctx: Context): Promise<void> {
    const { email, password } = await ctx.body as AccountDTO;
    const account = await this.repository.selectBy<Account>(
      "account",
      "email",
      email,
    );
    
    if (account.length === 0) {
      // Not mentionning the fact that the account doesn't exists for security reasons
      return ctx.json({ message: this.translator.wrongCredentials }, 400);
    }
    
    const isAuthenticated = await bcrypt.compare(password, account[0].password);
    
    if (!isAuthenticated) {
      return ctx.json({ message: this.translator.wrongCredentials }, 400);
    }

    const token = await jwt.create(
      { alg: "HS512", typ: "JWT" },
      { exp: jwt.getNumericDate(60 * 60), account_id: account[0].id }, // 60 min
      this.jwtKey,
    );

    return ctx.json({ token });
  }
}
