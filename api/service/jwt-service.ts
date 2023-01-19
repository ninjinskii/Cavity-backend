import { jwt } from "../../deps.ts";

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
  verify(token: string): Promise<unknown>;
  create(options: JwtCreateOptions): Promise<string>;
}

export class JwtServiceImpl implements JwtService {
  public jwtKey: CryptoKey; // Todo: private when other controller use jwtSerice instead of jwtKey
  private readonly DEFAULT_JWT_EXPIRATION_DELAY = 60 * 60 * 48; // 48h

  private constructor(jwtKey: CryptoKey) {
    this.jwtKey = jwtKey;
  }

  verify(token: string): Promise<unknown> {
    return jwt.verify(token, this.jwtKey);
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

    return jwt.create(
      header,
      payloadWithExpDate,
      this.jwtKey,
    );
  }

  private toTimestampDate(durationInMinutes: number): number {
    return jwt.getNumericDate(durationInMinutes);
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
