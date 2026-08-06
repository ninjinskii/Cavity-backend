import { Context } from "@oak/oak";
import * as logger from "@std/log";
import { Translatable } from "../i18n/translatable.ts";
import { ErrorReporter } from "./error-reporter.ts";
import { JwtCreateOptions, JwtService } from "./jwt-service.ts";
import { json } from "../util/api-response.ts";
import { AccountDao } from "../dao/account-dao.ts";

type SessionVersionStore = Pick<AccountDao, "selectSessionVersion">;
const LEGACY_SESSION_VERSION = "legacy";

export abstract class Authenticator {
  protected jwtService: JwtService;
  protected errorReporter: ErrorReporter;

  constructor(
    jwtService: JwtService,
    errorReporter: ErrorReporter,
    protected accountDao: SessionVersionStore,
  ) {
    this.jwtService = jwtService;
    this.errorReporter = errorReporter;
  }

  abstract let(
    ctx: Context,
    t: Translatable,
    block: (accountId: number, token: string) => Promise<void>,
  ): Promise<void>;

  createToken(options: JwtCreateOptions) {
    return this.jwtService.create(options);
  }

  verifyToken<T>(token: string) {
    return this.jwtService.verify<T>(token);
  }
}

export class BaseAuthenticator extends Authenticator {
  async let(
    ctx: Context,
    t: Translatable,
    block: (accountId: number, token: string) => Promise<void>,
  ) {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization || authorization.split(" ").length !== 2) {
      return json(ctx, { message: t.unauthorized }, 401);
    }

    const [_, token] = authorization!.split(" ");

    try {
      const { account_id, session_version } = await this.jwtService.verify<{
        account_id: string | number;
        session_version?: string;
      }>(token);

      const accountId = Number(account_id);

      if (Number.isSafeInteger(accountId)) {
        const currentSessionVersion = await this.accountDao.selectSessionVersion(accountId);
        const hasValidLegacySession = !session_version &&
          currentSessionVersion === LEGACY_SESSION_VERSION;

        if (!hasValidLegacySession && currentSessionVersion !== session_version) {
          return json(ctx, { message: t.unauthorized }, 401);
        }

        logger.info(`Authorized account ${accountId}`);

        this.errorReporter.setScopeTag("accountId", accountId.toString());
        const result = await block(accountId, token);
        this.errorReporter.removeScopeTag("accountId");

        return result;
      } else {
        json(ctx, { message: t.unauthorized }, 401);
      }
    } catch (error) {
      this.errorReporter.captureException(error as Error);
      json(ctx, { message: t.unauthorized }, 401);
    }
  }
}
