import { Context, Status } from "../../deps.ts";

export function json(
  ctx: Context,
  response: unknown,
  statusCode?: Status,
): void {
  ctx.response.status = statusCode || 200;
  // Response can actually contain pretty much anything
  // deno-lint-ignore no-explicit-any
  ctx.response.body = response as any;
}

export function success(ctx: Context): void {
  ctx.response.body = { ok: true };
}
