import { Application, Context } from "../deps.ts";
import AccountController from "./controller/account.ts";
import AuthController from "./controller/auth.ts";
import DataController from "./controller/data.ts";
import ControllerManager from "./controller/manager.ts";
import { EnTranslations, FrTranslations } from "./i18n/translatable.ts";
import { Account, AccountDTO } from "./model/account.ts";
import Repository from "./repository.ts";

type CreateTablesBody = { tables: Array<string> };
type DeleteTableBody = { table: string };

const app = new Application();
const repository: Repository = await Repository.getInstance();

const accountController = new AccountController(app, repository);
const authController = new AuthController(app, repository);
const dataController = new DataController(app, repository);
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

app.get("/account", async () => {
  const results = await repository.select<Account>("account");
  return results.rows;
});

app.post("/account", async (ctx: Context) => {
  const accountDto = await ctx.body as AccountDTO;
  const account = new Account(accountDto);

  repository.insert("account", account);

  return ctx.json(account);
});
