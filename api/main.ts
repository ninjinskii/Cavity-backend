import { Application, Context } from "../deps.ts";
import Repository from "./repository.ts";

const app = new Application();
const repository: Repository = await Repository.getInstance();

app.static("/", "./public");
app.start({ port: 5000 });

const a = await repository.createTable("usered");
console.log(a);


app.get("/", async (ctx: Context) => {
  return await ctx.file("./public/index.html");
});
