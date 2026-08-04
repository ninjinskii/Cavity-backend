import * as logger from "@std/log";

export class Environment {
  private static readonly TOKEN_SECRET_MIN_LENGTH = 100;

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

    if (TOKEN_SECRET === "" || TOKEN_SECRET.length < this.TOKEN_SECRET_MIN_LENGTH) {
      throw new Error(
        `JWT token secret env variable is empty or smaller than ${this.TOKEN_SECRET_MIN_LENGTH} chars`,
      );
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

  static brevoApiKey(): string {
    const { BREVO_API_KEY } = Deno.env.toObject();

    if (BREVO_API_KEY === "") {
      logger.warn("Empty brevo api key");
    }

    return BREVO_API_KEY;
  }
}
