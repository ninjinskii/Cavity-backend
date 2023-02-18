import { Application, Client, initTables, logger, Router } from "../deps.ts";
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
import { AccountDao } from "./dao/account-dao.ts";
import { JwtServiceImpl } from "./service/jwt-service.ts";

applyBigIntSerializer();

const app = new Application();
const router = new Router();
const { DATABASE_URL, TOKEN_SECRET } = Deno.env.toObject();
const [user, password, hostname, port, database] = DATABASE_URL.split(",");
const client = new Client({
  user,
  hostname,
  database,
  port,
  password,
  tls: {
    caCertificates: [
      await Deno.readTextFile(new URL("../prod-ca-2021.crt", import.meta.url)),
    ],
  },
});

await initTables(
  client,
  [
    Account,
    Bottle,
    County,
    FReview,
    Friend,
    Grape,
    HistoryEntry,
    HistoryXFriend,
    QGrape,
    Review,
    TastingAction,
    TastingXFriend,
    Tasting,
    Wine,
  ],
);

await client.connect();

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
    return next();
  }
});

const accountDao = new AccountDao(client);

const accountController = new AccountController({
  router,
  client,
  jwtService,
  accountDao,
});
const authController = new AuthController({
  router,
  client,
  jwtService,
  accountDao,
});
const dataController = new DataController({ router, client, jwtService });
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

declare global {
  interface BigInt {
    toJSON: () => number;
  }
}
