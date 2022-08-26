import { Application, logger, QueryBuilder, Router } from "../deps.ts";
import AuthController from "./controller/auth.ts";
import DataController from "./controller/data.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import AccountController from "./controller/account.ts";

applyBigIntSerializer();

const app = new Application();
const router = new Router();
const databaseUrl = Deno.env.get("DATABASE_URL");
const queryBuilder = new QueryBuilder(databaseUrl || "");

const encoder = new TextEncoder();
const keyBuffer = encoder.encode("mySuperSecret");
const jwtKey = await crypto.subtle.importKey(
  "raw",
  keyBuffer,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

app.use(async (ctx, next) => {
  const language = ctx.request.headers.get("Accept-Language");
  const $t = language?.includes("fr-")
    ? new FrTranslations()
    : new EnTranslations();

  manager.updateControllersTranslator($t);

  try {
    await ctx.send({
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch(error) {
    logger.error(error)
  }

  return next();
});

const accountController = new AccountController(router, queryBuilder, jwtKey);
const authController = new AuthController(router, queryBuilder, jwtKey);
const dataController = new DataController(router, queryBuilder, jwtKey);
const manager = new ControllerManager();
manager.addControllers(
  accountController,
  authController,
  dataController,
);

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 5000 });

function applyBigIntSerializer() {
  BigInt.prototype.toJSON = function () {
    return parseInt(this.toString());
  };
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
