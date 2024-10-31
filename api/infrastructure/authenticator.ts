import { Context } from "@oak/oak";
import type { Translatable } from "../i18n/translatable.ts";
import type { ErrorReporter } from "./error-reporter.ts";
import type { JwtCreateOptions, JwtService } from "./jwt-service.ts";
import { json } from "../util/api-response.ts";

export abstract class Authenticator {
  protected jwtService: JwtService;
  protected errorReporter: ErrorReporter;

  constructor(jwtService: JwtService, errorReporter: ErrorReporter) {
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
      const { account_id } = await this.jwtService.verify<{
        account_id: string;
      }>(token);

      const accountId = parseInt(account_id);

      if (!isNaN(accountId)) {
        console.info(`Authorized account ${accountId}`);

        this.errorReporter.setScopeTag("accountId", accountId.toString());
        const result = await block(accountId, token);
        this.errorReporter.removeScopeTag("accountId");

        return result;
      } else {
        json(ctx, { message: t.unauthorized }, 401);
      }
    } catch (error) {
      this.errorReporter.captureException(error);
      json(ctx, { message: t.unauthorized }, 401);
    }
  }
}
