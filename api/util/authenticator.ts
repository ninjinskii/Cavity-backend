import { Context, jwt } from "../../deps.ts";
import { Translatable } from "../i18n/translatable.ts";
import { json } from "./api-response.ts";

export default async function inAuthentication(
  ctx: Context,
  jwtKey: CryptoKey,
  t: Translatable,
  block: (accountId: number) => Promise<void>,
): Promise<void> {
  const authorization = ctx.request.headers.get("Authorization");

  if (!authorization || authorization.split(" ").length !== 2) {
    return json(ctx, { message: t.unauthorized }, 401);
  }

  const [_, token] = authorization!.split(" ");

  try {
    const { account_id } = await jwt.verify(token, jwtKey) as {
      account_id: string;
    };

    const accountId = parseInt(account_id);

    if (!isNaN(accountId)) {
      return await block(accountId);
    } else {
      json(ctx, { message: t.unauthorized }, 401);
    }
  } catch (_error) {
    json(ctx, { message: t.unauthorized }, 401);
  }
}
