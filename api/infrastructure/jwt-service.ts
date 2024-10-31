import jwt from "jsonwebtoken";

type Algorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "none";

export interface JwtHeader {
  alg: Algorithm;
  [key: string]: unknown;
}

export interface JwtPayload {
  account_id?: number;
  reset_password?: boolean;
}

export interface JwtCreateOptions {
  header: JwtHeader;
  payload: JwtPayload;
  expirationMinutes?: number;
}

export interface JwtService {
  verify<T>(token: string): Promise<T>;
  create(options: JwtCreateOptions): Promise<string>;
}

export class JwtServiceImpl implements JwtService {
  private jwtKey: CryptoKey;
  private readonly DEFAULT_JWT_EXPIRATION_DELAY = 60 * 60 * 24 * 30 * 6; // ~ 6 months

  private constructor(jwtKey: CryptoKey) {
    this.jwtKey = jwtKey;
  }

  verify<T>(token: string): Promise<T> {
    return Promise.resolve(jwt.verify(token, this.jwtKey.toString())) as unknown as Promise<T>;
  }

  create(
    { header, payload, expirationMinutes }: JwtCreateOptions,
  ): Promise<string> {
    const payloadWithExpDate = {
      ...payload,
      exp: expirationMinutes
        ? this.toTimestampDate(expirationMinutes)
        : this.toTimestampDate(this.DEFAULT_JWT_EXPIRATION_DELAY),
    } as { [key: string]: unknown };

    return Promise.resolve(jwt.sign(
      { ...header, ...payloadWithExpDate},
      this.jwtKey.toString(),
    ));
  }

  private toTimestampDate(durationInMinutes: number): number {
    return durationInMinutes;
    // TODO: replace helper from ol lib with actual code -> https://deno.land/x/djwt@v3.0.2#getnumericdate
    // return jwt.getNumericDate(durationInMinutes);
  }

  static async newInstance(secret: string): Promise<JwtServiceImpl> {
    const key = await this.generateJwtKey(secret);
    return new JwtServiceImpl(key);
  }

  private static async generateJwtKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(secret);
    return await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );
  }
}
