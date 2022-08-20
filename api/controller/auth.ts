import { bcrypt, Context, jwt, Query, Router } from "../../deps.ts";
import { Account, AccountDTO } from "../model/account.ts";
import Repository from "../db/repository.ts";
import Controller from "./controller.ts";
import { json } from "../util/api-response.ts";
import { Where } from "https://deno.land/x/sql_builder@v1.9.1/where.ts";

export default class AuthController extends Controller {
  private jwtKey: CryptoKey;

  constructor(router: Router, repository: Repository, jwtKey: CryptoKey) {
    super(router, repository);
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

    const query = new Query()
      .table("account")
      .select("")
      .where(Where.field("email").eq(email))
      .build();

    const response = await this.repository.do<Account>(query);

    if (response.rows.length === 0) {
      // Not mentionning the fact that the account doesn't exists for security reasons
      return json(ctx, { message: this.$t.wrongCredentials }, 400);
    }

    const account = response.rows[0];
    const isConfirmed = account.registrationCode === null;

    // Using compareSync() instead of compare() because compare() is causing a crash on Deno deploy
    // See https://github.com/denoland/deploy_feedback/issues/171
    const isAuthenticated = bcrypt.compareSync(
      password,
      account.password as string,
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
        account_id: account.id,
      },
      this.jwtKey,
    );

    json(ctx, { token, email });
  }
}
