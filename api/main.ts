import { Application, Context } from "../deps.ts";
import Repository from "./repository.ts";

type CreateTablesBody = { tables: Array<string> }

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
