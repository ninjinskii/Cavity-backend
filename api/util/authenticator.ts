import { Context, logger } from "../../deps.ts";
import { Translatable } from "../i18n/translatable.ts";
import { JwtService } from "../infrastructure/jwt-service.ts";
import { json } from "./api-response.ts";
import * as Sentry from "npm:@sentry/node";

export default async function inAuthentication(
  ctx: Context,
  jwtService: JwtService,
  t: Translatable,
  block: (accountId: number, token: string) => Promise<void>,
): Promise<void> {
  const authorization = ctx.request.headers.get("Authorization");

  if (!authorization || authorization.split(" ").length !== 2) {
    return json(ctx, { message: t.unauthorized }, 401);
  }

  const [_, token] = authorization!.split(" ");

  try {
    const { account_id } = await jwtService.verify(token) as {
      account_id: string;
    };

    const accountId = parseInt(account_id);

    if (!isNaN(accountId)) {
      logger.info(`Authorized account ${accountId}`);
      return await block(accountId, token);
    } else {
      json(ctx, { message: t.unauthorized }, 401);
    }
  } catch (error) {
    Sentry.captureException(error)
    json(ctx, { message: t.unauthorized }, 401);
  }
}
