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
import { dataTables } from "./dao/table-config.ts";
import { AccountSyncDao, PostgresSyncDao, SupabaseSyncDao } from "./dao/sync-dao.ts";
import { NoopRateLimiter, RateLimiter } from "./infrastructure/rate-limiter.ts";

applyBigIntSerializer();

const isDev = Environment.isDevelopmentMode();
const postgresUrl = Environment.postgresDatabaseUrl();
const jwtService = await JwtServiceImpl.newInstance(Environment.tokenSecret());
const errorReporter = isDev ? LogErrorReporter.getInstance() : SentryErrorReporter.getInstance();
const rateLimiter = await openRateLimiter();
const { accountDao, syncDao, mapper } = createDaos();
const authenticator = new BaseAuthenticator(jwtService, errorReporter, accountDao);
const router = new Router();

const accountController = new AccountController({
  router,
  accountDao,
  errorReporter,
  authenticator,
  rateLimiter,
});

const authController = new AuthController({
  router,
  accountDao,
  errorReporter,
  authenticator,
  rateLimiter,
});

const dataController = new DataController({
  router,
  mapper,
  syncDao,
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

Deno.serve(
  { port: 8000 },
  async (request) => await app.handle(request) ?? new Response("Not found", { status: 404 }),
);

function applyBigIntSerializer() {
  BigInt.prototype.toJSON = function () {
    return parseInt(this.toString());
  };
}

async function openRateLimiter(): Promise<RateLimiter> {
  try {
    return await RateLimiter.open();
  } catch (error) {
    logger.error(`Unable to open Deno KV rate limiter: ${error}`);
    return new NoopRateLimiter();
  }
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

function createRouteDaoMapper(
  client: Client | SupabaseClient,
): DaoMapper {
  return Object.fromEntries(
    dataTables.map((config) => [
      config.route,
      createRestDao({
        client,
        table: config.table,
        ignoredFields: config.ignoredFields,
      }),
    ]),
  );
}

function createDaos(): { accountDao: AccountDao; syncDao: AccountSyncDao; mapper: DaoMapper } {
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
      syncDao: new PostgresSyncDao(postgresClient, dataTables),
      mapper: createRouteDaoMapper(postgresClient),
    };
  } else {
    const supabaseUrl = Environment.supabaseUrl();
    const supabaseKey = Environment.supabaseKey();
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    return {
      accountDao: new SupabaseAccountDao(supabaseClient),
      syncDao: new SupabaseSyncDao(supabaseClient, dataTables),
      mapper: createRouteDaoMapper(supabaseClient),
    };
  }
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
