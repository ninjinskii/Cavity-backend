import { Client, Context, logger, Router } from "../../deps.ts";
import { AccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";
import { json } from "../util/api-response.ts";
import { AccountDao } from "../dao/account-dao.ts";
import { JwtService } from "../service/jwt-service.ts";
import PasswordService from "../service/password-service.ts";

interface AuthControllerOptions {
  router: Router;
  client: Client;
  jwtService: JwtService;
  accountDao: AccountDao;
}

export class AuthController extends Controller {
  private jwtService: JwtService;
  private accountDao: AccountDao;

  constructor(
    { router, client, jwtService, accountDao }: AuthControllerOptions,
  ) {
    super(router, client);
    this.jwtService = jwtService;
    this.accountDao = accountDao;
  }

  get default() {
    return "/auth/login";
  }

  handleRequests(): void {
    this.router.post(this.default, (ctx: Context) => this.login(ctx));
  }

  async login(ctx: Context): Promise<void> {
    const { email, password } = await ctx.request.body().value as AccountDTO;

    try {
      const account = await this.accountDao.selectByEmailWithPassword(email);

      if (account.length === 0) {
        // Not mentionning the fact that the account doesn't exists for security reasons
        return json(ctx, { message: this.$t.wrongCredentials }, 400);
      }

      const isConfirmed = account[0].registrationCode === null;
      const isAuthenticated = PasswordService.compare(
        password,
        account[0].password,
      );

      if (!isConfirmed) {
        return json(ctx, { message: this.$t.confirmAccount }, 412);
      }

      if (!isAuthenticated) {
        return json(ctx, { message: this.$t.wrongCredentials }, 400);
      }

      logger.info(`User ${email} logged in (id: ${account[0].id})`);

      const token = await this.jwtService.create({
        header: { alg: "HS512", typ: "JWT" },
        payload: {
          account_id: account[0].id,
        },
      });

      json(ctx, { token, email });
    } catch (error) {
      logger.error(error);
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }
}
