import { Application, Client, initTables, Router } from "../deps.ts";
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
import * as Sentry from "npm:@sentry/node";

applyBigIntSerializer();

const SENTRY_SAMPLE_RATE = 0.5;
const SENTRY_DSN =
  "https://510d13bb29e849568634a09f5f612234@o1364222.ingest.sentry.io/4504697605652480";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: SENTRY_SAMPLE_RATE,
  beforeSend: (event: Sentry.Event, _hint?: Sentry.EventHint) => {
    const { DEV_MODE } = Deno.env.toObject();
    const isProduction = DEV_MODE !== "1";

    if (isProduction) {
      return event;
    }

    // Do not send the event to Sentry if the app is not in production
    return null;
  },
});

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
