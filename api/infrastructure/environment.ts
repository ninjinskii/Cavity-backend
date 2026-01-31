export class Environment {
  static isDevelopmentMode(): boolean {
    const { DEVELOPMENT_MODE } = Deno.env.toObject();
    return DEVELOPMENT_MODE === "1";
  }
}
