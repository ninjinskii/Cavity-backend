import { Context, Status } from "../../deps.ts";

export function json(ctx: Context, response: any, statusCode?: Status): void {
  ctx.response.status = statusCode || 200;
  ctx.response.body = response;
}

export function success(ctx: Context): void {
  ctx.response.body = { ok: true };
}
