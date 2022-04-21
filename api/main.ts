import { Application, Context } from "../deps.ts";
import AccountController from "./controller/account.ts";
import AuthController from "./controller/auth.ts";
import DataController from "./controller/data.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import Repository from "./db/repository.ts";

type CreateTablesBody = { tables: Array<string> };
type DeleteTableBody = { table: string };

applyBigIntSerializer()

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
const manager = new ControllerManager();
manager.addControllers(accountController, authController, dataController);

app.static("/", "./public");
app.use((next) =>
  (ctx: Context) => {
    const language = ctx.request.headers.get("Accept-Language");
    const translator = language?.includes("fr-")
      ? new FrTranslations()
      : new EnTranslations();

    manager.updateControllersTranslator(translator);

    return next(ctx);
  }
);
app.start({ port: 5000 });

app.get("/", async (ctx: Context) => {
  return await ctx.file("./public/index.html");
});

app.post("/create-tables", async (ctx: Context) => {
  const { tables } = await ctx.body as CreateTablesBody;
  repository.createTables(...tables);
});

app.post("/delete-table", async (ctx: Context) => {
  const { table } = await ctx.body as DeleteTableBody;
  repository.dropTable(table);
});

function applyBigIntSerializer() {
  BigInt.prototype.toJSON = function() { 
    return parseInt(this.toString()) 
  }
}

declare global {
  interface BigInt {
    toJSON: () => number
  }
}