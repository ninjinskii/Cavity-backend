import { Application, initTables, QueryBuilder, Router } from "../deps.ts";
import AuthController from "./controller/auth.ts";
import DataController from "./controller/data.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import AccountController from "./controller/account.ts";
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

applyBigIntSerializer();

const app = new Application();
const router = new Router();
const databaseUrl = Deno.env.get("DATABASE_URL") || "";
const queryBuilder = new QueryBuilder(databaseUrl);

await initTables(
  databaseUrl,
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
    Wine
  ],
);

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
  } finally {
    return next();
  }
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
