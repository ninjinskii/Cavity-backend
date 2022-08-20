import { generateRegistrationCode } from "../api/model/account.ts";
import { assert } from "../deps.ts";

Deno.test("Account registration number", () => {
  const code = generateRegistrationCode();

  assert(code > 100000 && code < 999999);
});
