import { bcrypt, Client, Context, jwt, Router } from "../../deps.ts";
import { AccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";
import { json } from "../util/api-response.ts";
import { AccountDao } from "../dao/account-dao.ts";

export default class AuthController extends Controller {
  private jwtKey: CryptoKey;
  private accountDao = new AccountDao(this.client);

  constructor(router: Router, client: Client, jwtKey: CryptoKey) {
    super(router, client);
    this.jwtKey = jwtKey;
  }

  get default() {
    return "/auth/login";
  }

  handleRequests(): void {
    this.router.post(this.default, (ctx: Context) => this.login(ctx));
  }

  async login(ctx: Context): Promise<void> {
    const { email, password } = await ctx.request.body().value as AccountDTO;
    const account = await this.accountDao.selectByEmailWithPassword(email);

    if (account.length === 0) {
      // Not mentionning the fact that the account doesn't exists for security reasons
      return json(ctx, { message: this.$t.wrongCredentials }, 400);
    }

    const isConfirmed = account[0].registrationCode === null;

    // Using compareSync() instead of compare() because compare() is causing a crash on Deno deploy
    // See https://github.com/denoland/deploy_feedback/issues/171
    const isAuthenticated = bcrypt.compareSync(
      password,
      account[0].password as string,
    );

    if (!isConfirmed) {
      return json(ctx, { message: this.$t.confirmAccount }, 412);
    }

    if (!isAuthenticated) {
      return json(ctx, { message: this.$t.wrongCredentials }, 400);
    }

    const token = await jwt.create(
      { alg: "HS512", typ: "JWT" },
      {
        exp: jwt.getNumericDate(60 * 60 * 48), // 48h
        account_id: account[0].id,
      },
      this.jwtKey,
    );

    json(ctx, { token, email });
  }
}
