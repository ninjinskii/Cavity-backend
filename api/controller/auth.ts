import { Application, bcrypt, Context, jwt } from "../../deps.ts";
import { Account, AccountDTO } from "../model/account.ts";
import Repository from "../repository.ts";
import Controller from "./controller.ts";

export default class AuthController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  get default() {
    return "/auth/login";
  }

  async handleRequests(): Promise<void> {
    this.app
      .post(this.default, async (ctx: Context) => this.login(ctx));
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
      {
        //exp: jwt.getNumericDate(60 * 60 * 48), // 48h
        account_id: account[0].id,
      },
      this.jwtKey,
    );

    return ctx.json({ token });
  }
}
