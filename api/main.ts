import { Application, Context } from "../deps.ts";
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
  const results = await repository.select("account") as { rows : Array<any> };
  console.log(results);
  return results.rows;
})

app.post("/account", async (ctx: Context) => {
  const account = await ctx.body as {
    email: string;
    password: string;
    registration_code: number;
  };

  repository.insert("account", account);
});
