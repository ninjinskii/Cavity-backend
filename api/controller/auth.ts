import { Context, logger, Router } from "../../deps.ts";
import { AccountDTO } from "../model/account.ts";
import Controller from "./controller.ts";
import { json } from "../util/api-response.ts";
import { AccountDao } from "../dao/account-dao.ts";
import PasswordService from "../infrastructure/password-service.ts";
import { ErrorReporter } from "../infrastructure/error-reporter.ts";
import { Authenticator } from "../infrastructure/authenticator.ts";

interface AuthControllerOptions {
  router: Router;
  accountDao: AccountDao;
  errorReporter: ErrorReporter;
  authenticator: Authenticator;
}

export class AuthController extends Controller {
  private accountDao: AccountDao;
  private errorReporter: ErrorReporter;
  private authenticator: Authenticator;

  constructor(
    { router, accountDao, errorReporter, authenticator }: AuthControllerOptions,
  ) {
    super(router);
    this.accountDao = accountDao;
    this.errorReporter = errorReporter;
    this.authenticator = authenticator;

    this.handleRequests();
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
        logger.info(`User ${email} has tried to login with wrong credentials (id: ${account[0].id})`)
        return json(ctx, { message: this.$t.wrongCredentials }, 400);
      }

      logger.info(`User ${email} logged in (id: ${account[0].id})`);

      const token = await this.authenticator.createToken({
        header: { alg: "HS512", typ: "JWT" },
        payload: {
          account_id: account[0].id,
        },
      });

      const { lastUser, lastUpdateTime } = account[0];

      json(ctx, { token, email, lastUser, lastUpdateTime });
    } catch (error) {
      this.errorReporter.captureException(error);
      json(ctx, { message: this.$t.baseError }, 500);
    }
  }
}
