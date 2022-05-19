import { Application, Context } from "../deps.ts";
import AuthController from "./controller/auth.ts";
import DataController from "./controller/data.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import Repository from "./db/repository.ts";
import AccountController from "./controller/account.ts";
import FileController from "./controller/file.ts";

type CreateTablesBody = { tables: Array<string> };
type DeleteTableBody = { table: string };

applyBigIntSerializer();

const app = new Application();
const repository: Repository = await Repository.getInstance();

const encoder = new TextEncoder();
const keyBuffer = encoder.encode("mySuperSecret");
const jwtKey = await crypto.subtle.importKey(
  "raw",
  keyBuffer,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const accountController = new AccountController(app, repository, jwtKey);
const authController = new AuthController(app, repository, jwtKey);
const dataController = new DataController(app, repository, jwtKey);
const fileController = new FileController(app, repository, jwtKey);
const manager = new ControllerManager();
manager.addControllers(
  accountController,
  authController,
  dataController,
  fileController,
);

// app.static("/", "./public");
app.use((next) =>
  (ctx: Context) => {
    const language = ctx.request.headers.get("Accept-Language");
    const $t = language?.includes("fr-")
      ? new FrTranslations()
      : new EnTranslations();

    manager.updateControllersTranslator($t);

    return next(ctx);
  }
);
app.get("/", async (ctx: Context) => {
  return await ctx.html(`<h1>Cavity api</h1>`, 200);
});
app.get("", async (ctx: Context) => {
  return await ctx.html(`<h1>Cavity api</h1>`, 200);
});
app.start({ port: 443 });

// app.file("/", "public/index.html");

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
