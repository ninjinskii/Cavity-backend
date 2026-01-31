import { Application, Context, Next, Router } from "@oak/oak";
import { Client } from "postgres";
import * as logger from "@std/log";
import { AuthController } from "./controller/auth.ts";
import { DataController } from "./controller/rest.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import { AccountController } from "./controller/account.ts";
import { JwtServiceImpl } from "./infrastructure/jwt-service.ts";
import { PostgresClientAccountDao } from "./dao/account-dao.ts";
import { PostgresClientRestDao } from "./dao/rest-dao.ts";
import { AccountDao } from "./dao/account-dao.ts";
import { DaoMapper } from "./controller/rest.ts";
import { LogErrorReporter } from "./infrastructure/error-reporter.ts";
import { BaseAuthenticator } from "./infrastructure/authenticator.ts";

applyBigIntSerializer();

const { TOKEN_SECRET, DATABASE_URL } = Deno.env.toObject();
const [user, password, hostname, port, database] = DATABASE_URL.split(",");
const client = new Client({
  user,
  hostname,
  database,
  port,
  password,
  //tls: {
  // caCertificates: [
  // await Deno.readTextFile(new URL("../prod-ca-2021.crt", import.meta.url)),
  //],
  //},
});

const jwtService = await JwtServiceImpl.newInstance(TOKEN_SECRET);
const errorReporter = new LogErrorReporter();
const authenticator = new BaseAuthenticator(jwtService, errorReporter);
const { accountDao, mapper } = createDaos();
const router = new Router();

const accountController = new AccountController({
  router,
  accountDao,
  errorReporter,
  authenticator,
});

const authController = new AuthController({
  router,
  accountDao,
  errorReporter,
  authenticator,
});

const dataController = new DataController({
  router,
  mapper,
  errorReporter,
  authenticator,
});

const manager = new ControllerManager();
manager.addControllers(
  accountController,
  authController,
  dataController,
);

const app = new Application();
app.use(createLanguageMiddleware(manager));
app.use(router.routes());
app.use(router.allowedMethods());

logger.info(`Deno version: ${Deno.version.deno}`);
await app.listen({ port: 5000 });

function applyBigIntSerializer() {
  BigInt.prototype.toJSON = function () {
    return parseInt(this.toString());
  };
}

function createLanguageMiddleware(manager: ControllerManager) {
  return async (ctx: Context, next: Next) => {
    const language = ctx.request.headers.get("Accept-Language");
    const $t = language?.includes("fr-") ? new FrTranslations() : new EnTranslations();

    manager.updateControllersTranslator($t);

    try {
      await ctx.send({
        root: `${Deno.cwd()}/public`,
        index: "index.html",
      });
    } finally {
      // This is not unsafe
      // deno-lint-ignore no-unsafe-finally
      return next();
    }
  };
}

function createRouteDaoMapper(): DaoMapper {
  return {
    "/county": new PostgresClientRestDao(client, "county"),
    "/wine": new PostgresClientRestDao(client, "wine"),
    "/bottle": new PostgresClientRestDao(client, "bottle"),
    "/friend": new PostgresClientRestDao(client, "friend"),
    "/grape": new PostgresClientRestDao(client, "grape"),
    "/review": new PostgresClientRestDao(client, "review"),
    "/qgrape": new PostgresClientRestDao(client, "q_grape"),
    "/freview": new PostgresClientRestDao(client, "f_review"),
    "/history": new PostgresClientRestDao(client, "history_entry"),
    "/tasting": new PostgresClientRestDao(client, "tasting"),
    "/tasting-action": new PostgresClientRestDao(client, "tasting_action"),
    "/history-x-friend": new PostgresClientRestDao(client, "history_x_friend"),
    "/tasting-x-friend": new PostgresClientRestDao(client, "tasting_x_friend"),
  };
}

function createDaos(): { accountDao: AccountDao; mapper: DaoMapper } {
  return {
    accountDao: new PostgresClientAccountDao(client),
    mapper: createRouteDaoMapper(),
  };
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
