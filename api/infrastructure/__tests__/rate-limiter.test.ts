import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { checkRateLimit, RateLimiter, type RateLimitRule } from "../rate-limiter.ts";

const rule: RateLimitRule = {
  name: "test",
  limit: 2,
  windowMs: 60_000,
};

describe("RateLimiter", () => {
  it("limits requests atomically by IP and identifier", async () => {
    const kv = await Deno.openKv(":memory:");
    const limiter = new RateLimiter(kv);

    assertEquals((await limiter.check(rule, "127.0.0.1", "user@example.com")).allowed, true);
    assertEquals((await limiter.check(rule, "127.0.0.1", "user@example.com")).allowed, true);
    const blocked = await limiter.check(rule, "127.0.0.1", "user@example.com");

    assertEquals(blocked.allowed, false);
    assertEquals(blocked.retryAfterSeconds > 0, true);
    kv.close();
  });

  it("keeps separate counters for separate identifiers", async () => {
    const kv = await Deno.openKv(":memory:");
    const limiter = new RateLimiter(kv);

    await limiter.check(rule, "127.0.0.1", "first@example.com");
    await limiter.check(rule, "127.0.0.1", "first@example.com");

    assertEquals(
      (await limiter.check(rule, "127.0.0.2", "second@example.com")).allowed,
      true,
    );
    kv.close();
  });

  it("fails open when KV is unavailable", async () => {
    const failingLimiter = {
      check: () => Promise.reject(new Error("KV unavailable")),
    } as unknown as RateLimiter;

    const result = await checkRateLimit(
      failingLimiter,
      rule,
      "127.0.0.1",
      "user@example.com",
    );

    assertEquals(result.allowed, true);
  });
});
