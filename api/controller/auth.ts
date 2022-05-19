import { bcrypt, Context, jwt, Router } from "../../deps.ts";
import { Account, AccountDTO } from "../model/account.ts";
import Repository from "../db/repository.ts";
import Controller from "./controller.ts";

export default class AuthController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, repository: Repository, jwtKey: CryptoKey) {
    super(router, repository);
    this.jwtKey = jwtKey;
  }

  get default() {
    return "/auth/login";
  }

  async handleRequests(): Promise<void> {
    this.router.post(this.default, async (ctx: Context) => this.login(ctx));
  }

  async login(ctx: Context): Promise<void> {
    const { email, password } = await ctx.request.body().value as AccountDTO;

    const account = await Account
      .where("email", email)
      .get() as Array<Account>;

    if (account.length === 0) {
      // Not mentionning the fact that the account doesn't exists for security reasons
      ctx.response.status = 400;
      ctx.response.body = { message: this.$t.wrongCredentials };
      return;
    }

    const isConfirmed = account[0].registrationCode === null;
    const isAuthenticated = await bcrypt.compare(
      password,
      account[0].password as string,
    );

    if (!isConfirmed) {
      ctx.response.status = 412;
      ctx.response.body = { message: this.$t.confirmAccount };
      return;
    }

    if (!isAuthenticated) {
      ctx.response.status = 400;
      ctx.response.body = { message: this.$t.wrongCredentials };
      return;
    }

    const token = await jwt.create(
      { alg: "HS512", typ: "JWT" },
      {
        exp: jwt.getNumericDate(60 * 60 * 48), // 48h
        account_id: account[0].id,
      },
      this.jwtKey,
    );

    ctx.response.body = { token, email };
  }
}
