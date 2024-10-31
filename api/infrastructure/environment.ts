export class Environment {
  static isDevelopmentMode(): boolean {
    return Bun.env.NODE_ENV === "development"
  }

  static getTokenSecret(): string {
    if (!Bun.env.TOKEN_SECRET) {
      throw new Error("Environment variable TOKEN_SECRET is missing.")
    }

    return Bun.env.TOKEN_SECRET
  }

  static getDatabaseUrl(): string {
    if (!Bun.env.DATABASE_URL) {
      throw new Error("Environment variable DATABASE_URL is missing.")
    }

    return Bun.env.DATABASE_URL
  }

  static getSendInBlueApiKey(): string {
    if (!Bun.env.SENDINBLUE_API_KEY) {
      throw new Error("Environment variable SENDINBLUE_API_KEY is missing.")
    }

    return Bun.env.SENDINBLUE_API_KEY
  }
}
