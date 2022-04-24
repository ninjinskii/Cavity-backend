import { Context, jwt } from "../../deps.ts";
import { Translatable } from "../i18n/translatable.ts";

export class JWTDecoder {
  static async authenticate(
    ctx: Context,
    jwtKey: CryptoKey,
    t: Translatable,
  ): Promise<JWTResponse> {
    const authorization = ctx.request.headers.get("Authorization");
    const baseError = {
      accountId: -1,
      errorMessage: t.unauthorized,
      errorCode: 401,
    };

    if (!authorization || authorization.split(" ").length !== 2) {
      return baseError;
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, jwtKey) as {
        account_id: string;
      };

      const accountId = parseInt(account_id);

      if (accountId !== NaN) {
        return { accountId };
      } else {
        return baseError;
      }
    } catch (error) {
      return baseError;
    }
  }
}

export interface JWTResponse {
  accountId: number;
  errorMessage?: string;
  errorCode?: number;
}
