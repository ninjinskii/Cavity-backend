import { Application, logger, Router, createClient, Client, initTables } from "../deps.ts";
import { AuthController } from "./controller/auth.ts";
import { DataController } from "./controller/rest.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import { AccountController } from "./controller/account.ts";
import { Account } from "./model/account.ts";
import { Bottle } from "./model/bottle.ts";
import { County } from "./model/county.ts";
import { FReview } from "./model/f-review.ts";
import { Friend } from "./model/friend.ts";
import { Grape } from "./model/grape.ts";
import { HistoryEntry } from "./model/history-entry.ts";
import { HistoryXFriend } from "./model/history-x-friend.ts";
import { QGrape } from "./model/q-grape.ts";
import { Review } from "./model/review.ts";
import { TastingAction } from "./model/tasting-action.ts";
import { TastingXFriend } from "./model/tasting-x-friend.ts";
import { Tasting } from "./model/tasting.ts";
import { Wine } from "./model/wine.ts";
import { JwtServiceImpl } from "./service/jwt-service.ts";
import { SupabaseAccountDao } from "./dao/account-dao.ts";
import { DenormRestDao, SupabaseRestDao } from "./dao/rest-dao.ts";
import { DenormAccountDao } from "./dao/account-dao.ts";
import { AccountDao } from "./dao/account-dao.ts";
import { DaoMapper } from "./controller/rest.ts";

applyBigIntSerializer();

const app = new Application();
const router = new Router();
const { DATABASE_URL, TOKEN_SECRET, DEVELOPMENT } = Deno.env.toObject();
const [user, password, hostname, port, database] = DATABASE_URL.split(",");

const jwtService = await JwtServiceImpl.newInstance(TOKEN_SECRET);

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

const { accountDao, mapper } = getAccountDao()

const accountController = new AccountController({
  router,
  jwtService,
  accountDao,
});
const authController = new AuthController({
  router,
  jwtService,
  accountDao,
});
const dataController = new DataController({ router, jwtService, mapper });
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

function getRouteDaoMapper(client: any) {
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

  // if (DEVELOPMENT) {
    // Utiliser supabase en local
    // return {
    //   "/county": new DenormRestDao(client, "county"),
    //   "/wine": new DenormRestDao(client, "wine"),
    //   "/bottle": new DenormRestDao(client, "bottle"),
    //   "/friend": new DenormRestDao(client, "friend"),
    //   "/grape": new DenormRestDao(client, "grape"),
    //   "/review": new DenormRestDao(client, "review"),
    //   "/qgrape": new DenormRestDao(client, "q_grape"),
    //   "/freview": new DenormRestDao(client, "f_review"),
    //   "/history": new DenormRestDao(client, "history_entry"),
    //   "/tasting": new DenormRestDao(client, "tasting"),
    //   "/tasting-action": new DenormRestDao(client, "tasting_action"),
    //   "/history-x-friend": new DenormRestDao(client, "history_x_friend"),
    //   "/tasting-x-friend": new DenormRestDao(client, "tasting_x_friend"),
    // };
  // }
}

function getAccountDao(): { accountDao: AccountDao, mapper: DaoMapper } {
  const client = createClient('http://172.17.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')
  return { accountDao: new SupabaseAccountDao(client), mapper: getRouteDaoMapper(client) }
}

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
