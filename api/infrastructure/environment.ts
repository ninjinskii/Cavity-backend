import * as logger from "@std/log";

export class Environment {
  static isDevelopmentMode(): boolean {
    const { DEVELOPMENT_MODE } = Deno.env.toObject();
    return DEVELOPMENT_MODE === "1";
  }

  static supabaseUrl(): string {
    const { SUPABASE_URL } = Deno.env.toObject();

    if (SUPABASE_URL === "") {
      logger.warn("Empty supabase url");
    }

    return SUPABASE_URL || "";
  }

  static supabaseKey(): string {
    const { SUPABASE_KEY } = Deno.env.toObject();

    if (SUPABASE_KEY === "") {
      logger.warn("Empty supabase key");
    }

    return SUPABASE_KEY || "";
  }

  static tokenSecret(): string {
    const { TOKEN_SECRET } = Deno.env.toObject();

    if (TOKEN_SECRET === "") {
      logger.warn("Empty token secret");
    }

    return TOKEN_SECRET || "";
  }

  static postgresDatabaseUrl(): string {
    const { DATABASE_URL } = Deno.env.toObject();

    if (DATABASE_URL === "") {
      logger.warn("Empty database url");
    }

    return DATABASE_URL || "";
  }
}
