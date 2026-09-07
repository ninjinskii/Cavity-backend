import * as logger from "@std/log";

export interface RateLimitRule {
  name: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Counter {
  count: number;
  expiresAt: number;
}

const MAX_TRANSACTION_RETRIES = 3;

export class RateLimiter {
  constructor(private kv: Deno.Kv) {}

  async check(
    rule: RateLimitRule,
    ip: string,
    identifier?: string,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;
    const windowEnd = windowStart + rule.windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowEnd - now) / 1000));
    const keys = [
      ["rate-limit", "v1", rule.name, "ip", await digest(ip), windowStart],
    ];

    if (identifier) {
      keys.push([
        "rate-limit",
        "v1",
        rule.name,
        "identifier",
        await digest(identifier),
        windowStart,
      ]);
    }

    for (let attempt = 0; attempt < MAX_TRANSACTION_RETRIES; attempt++) {
      const entries = await Promise.all(keys.map((key) => this.kv.get<Counter>(key)));
      const counters = entries.map((entry) => entry.value);

      if (counters.some((counter) => counter && counter.count >= rule.limit)) {
        return { allowed: false, retryAfterSeconds };
      }

      const nextCounter: Counter = {
        count: 1,
        expiresAt: windowEnd,
      };
      const operation = this.kv.atomic();
      entries.forEach((entry, index) => {
        operation.check(entry);
        operation.set(
          keys[index],
          entry.value ? { count: entry.value.count + 1, expiresAt: windowEnd } : nextCounter,
          { expireIn: rule.windowMs + 60_000 },
        );
      });

      const result = await operation.commit();
      if (result.ok) {
        return { allowed: true, retryAfterSeconds };
      }
    }

    throw new Error(`Rate limit transaction contention for ${rule.name}`);
  }

  static async open(): Promise<RateLimiter> {
    return new RateLimiter(await Deno.openKv());
  }
}

export class NoopRateLimiter extends RateLimiter {
  constructor() {
    super(null as unknown as Deno.Kv);
  }

  override check(
    _rule: RateLimitRule,
    _ip: string,
    _identifier?: string,
  ): Promise<RateLimitResult> {
    return Promise.resolve({ allowed: true, retryAfterSeconds: 0 });
  }
}

export async function checkRateLimit(
  rateLimiter: RateLimiter,
  rule: RateLimitRule,
  ip: string,
  identifier: string | undefined,
): Promise<RateLimitResult> {
  try {
    return await rateLimiter.check(rule, ip, identifier);
  } catch (error) {
    // Rate limiting is deliberately fail-open: an outage in KV must not take
    // the authentication system down. The event remains visible in logs.
    logger.error(`Rate limiter unavailable for ${rule.name}: ${error}`);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function clientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function normalizeIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

export async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function rateLimitResponse(
  response: { headers: Headers; status: number; body: unknown },
  retryAfterSeconds: number,
  message: string,
): void {
  response.status = 429;
  response.headers.set("Retry-After", retryAfterSeconds.toString());
  response.body = { message };
}
