import { Context, jwt } from "../../deps.ts";
import { Translatable } from "../i18n/translatable.ts";

export default async function inAuthentication(
  ctx: Context,
  jwtKey: CryptoKey,
  t: Translatable,
  block: (accountId: number) => Promise<void>,
): Promise<void> {
  const authorization = ctx.request.headers.get("Authorization");

  if (!authorization || authorization.split(" ").length !== 2) {
    return ctx.json({ message: t.unauthorized, code: 401 });
  }

  const [_, token] = authorization.split(" ");

  try {
    const { account_id } = await jwt.verify(token, jwtKey) as {
      account_id: string;
    };

    const accountId = parseInt(account_id);

    if (accountId !== NaN) {
      return await block(accountId);
    } else {
      return ctx.json({ message: t.unauthorized, code: 401 });
    }
  } catch (error) {
    return ctx.json({ message: t.unauthorized, code: 401 });
  }
}
