import { Application, Context } from "../deps.ts";
import { Account, AccountDTO } from "./model/account.ts";
import Repository from "./repository.ts";

type CreateTablesBody = { tables: Array<string> };
type DeleteTableBody = { table: string };

const app = new Application();
const repository: Repository = await Repository.getInstance();

app.static("/", "./public");
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
