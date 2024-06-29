import {
  Application,
  createClient,
  logger,
  Router,
  SupabaseClient,
} from "../deps.ts";
import { AuthController } from "./controller/auth.ts";
import { DataController } from "./controller/rest.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import { AccountController } from "./controller/account.ts";
import { JwtServiceImpl } from "./infrastructure/jwt-service.ts";
import { SupabaseAccountDao } from "./dao/account-dao.ts";
import { SupabaseRestDao } from "./dao/rest-dao.ts";
import { AccountDao } from "./dao/account-dao.ts";
import { DaoMapper } from "./controller/rest.ts";
import { SentryErrorReporter } from "./infrastructure/error-reporter.ts";
import { BaseAuthenticator } from "./infrastructure/authenticator.ts";

applyBigIntSerializer();

const app = new Application();
const router = new Router();
const { TOKEN_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY } = Deno.env.toObject();

const jwtService = await JwtServiceImpl.newInstance(TOKEN_SECRET);
const errorReporter = SentryErrorReporter.getInstance();
const authenticator = new BaseAuthenticator(jwtService, errorReporter);

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
  } finally {
    // This is not unsafe
    // deno-lint-ignore no-unsafe-finally
    return next();
  }
});

const { accountDao, mapper } = getAccountDao();

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

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 5000 });

logger.info(`Deno version: ${Deno.version.deno}`);

function applyBigIntSerializer() {
  BigInt.prototype.toJSON = function () {
    return parseInt(this.toString());
  };
}

function getRouteDaoMapper(client: SupabaseClient) {
  return {
    "/county": new SupabaseRestDao(client, "county"),
    "/wine": new SupabaseRestDao(client, "wine"),
    "/bottle": new SupabaseRestDao(client, "bottle"),
    "/friend": new SupabaseRestDao(client, "friend"),
    "/grape": new SupabaseRestDao(client, "grape"),
    "/review": new SupabaseRestDao(client, "review"),
    "/qgrape": new SupabaseRestDao(client, "q_grape"),
    "/freview": new SupabaseRestDao(client, "f_review"),
    "/history": new SupabaseRestDao(client, "history_entry"),
    "/tasting": new SupabaseRestDao(client, "tasting"),
    "/tasting-action": new SupabaseRestDao(client, "tasting_action"),
    "/history-x-friend": new SupabaseRestDao(client, "history_x_friend"),
    "/tasting-x-friend": new SupabaseRestDao(client, "tasting_x_friend"),
  };
}

function getAccountDao(): { accountDao: AccountDao; mapper: DaoMapper } {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return {
    accountDao: new SupabaseAccountDao(client),
    mapper: getRouteDaoMapper(client),
  };
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
