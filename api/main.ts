import { Application, Context, Next, Router } from "@oak/oak";
import { Client } from "postgres";
import * as logger from "@std/log";
import { AuthController } from "./controller/auth.ts";
import { DataController } from "./controller/rest.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import { AccountController } from "./controller/account.ts";
import { JwtServiceImpl } from "./infrastructure/jwt-service.ts";
import { PostgresClientAccountDao, SupabaseAccountDao } from "./dao/account-dao.ts";
import { createRestDao } from "./dao/rest-dao.ts";
import { AccountDao } from "./dao/account-dao.ts";
import { DaoMapper } from "./controller/rest.ts";
import { LogErrorReporter, SentryErrorReporter } from "./infrastructure/error-reporter.ts";
import { BaseAuthenticator } from "./infrastructure/authenticator.ts";
import { Environment } from "./infrastructure/environment.ts";
import { createClient, SupabaseClient } from "supabase";

applyBigIntSerializer();

const isDev = Environment.isDevelopmentMode();
const postgresUrl = Environment.postgresDatabaseUrl();
const jwtService = await JwtServiceImpl.newInstance(Environment.tokenSecret());
const errorReporter = isDev ? LogErrorReporter.getInstance() : SentryErrorReporter.getInstance();
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

function createRouteDaoMapper(client: Client | SupabaseClient): DaoMapper {
  return {
    "/county": createRestDao({ client, table: "county" }),
    "/wine": createRestDao({ client, table: "wine" }),
    "/bottle": createRestDao({ client, table: "bottle" }),
    "/friend": createRestDao({ client, table: "friend" }),
    "/grape": createRestDao({ client, table: "grape" }),
    "/review": createRestDao({ client, table: "review" }),
    "/qgrape": createRestDao({ client, table: "q_grape" }),
    "/freview": createRestDao({ client, table: "f_review" }),
    "/history": createRestDao({ client, table: "history_entry" }),
    "/tasting": createRestDao({ client, table: "tasting" }),
    "/tag": createRestDao({ client, table: "tag", ignoredFields: ["selected"] }),
    "/tasting-action": createRestDao({ client, table: "tasting_action" }),
    "/history-x-friend": createRestDao({ client, table: "history_x_friend" }),
    "/tasting-x-friend": createRestDao({ client, table: "tasting_x_friend" }),
    "/tag-x-bottle": createRestDao({
      client,
      table: "tag_x_bottle",
      ignoredFields: ["selected"],
    }),
  };
}

function createDaos(): { accountDao: AccountDao; mapper: DaoMapper } {
  if (isDev) {
    const [user, password, hostname, port, database] = postgresUrl.split(",");
    const postgresClient = new Client({
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

    return {
      accountDao: new PostgresClientAccountDao(postgresClient),
      mapper: createRouteDaoMapper(postgresClient),
    };
  } else {
    const supabaseUrl = Environment.supabaseUrl();
    const supabaseKey = Environment.supabaseKey();
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    return {
      accountDao: new SupabaseAccountDao(supabaseClient),
      mapper: createRouteDaoMapper(supabaseClient),
    };
  }
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
