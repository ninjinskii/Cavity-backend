import { Application, Context } from "../deps.ts";

const app = new Application();

app.static("/", "./public");
app.start({ port: 5000 });

app.get("/", async (ctx: Context) => {
  return await ctx.file("./public/index.html");
});
