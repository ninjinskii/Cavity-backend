import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import Repository from "../api/db/repository.ts";

const repository = Repository.getInstance();

Deno.test("Example test", () => {
  const a = 1 + 1;
  const b = 2
  assertEquals(a, b);
});