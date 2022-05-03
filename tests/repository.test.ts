import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import Repository from "../api/db/repository.ts";

const repository = await Repository.getInstance();

Deno.test("Query conditions builder, single condition", () => {
  const buildQueryConditions = repository["buildQueryConditions"];
  const condition = [{ where: "username", equals: "user1" }];
  const fullQuery = buildQueryConditions("SELECT * FROM user", condition);

  assertEquals(fullQuery, "SELECT * FROM user WHERE username = 'user1';");
});

Deno.test("Query conditions builder, multiple conditions", () => {
  const buildQueryConditions = repository["buildQueryConditions"];
  const conditions = [
    { where: "username", equals: "user1" },
    { where: "id", equals: "1" },
    { where: "last_edited", equals: "29/04/2022" },
  ];
  const fullQuery = buildQueryConditions("SELECT * FROM user", conditions);

  assertEquals(
    fullQuery,
    "SELECT * FROM user WHERE username = 'user1' AND id = '1' AND last_edited = '29/04/2022';",
  );
});

Deno.test("Query conditions builder, no condition", () => {
  const buildQueryConditions = repository["buildQueryConditions"];
  const fullQuery = buildQueryConditions("SELECT * FROM user", []);

  assertEquals(fullQuery, "SELECT * FROM user;");
});

Deno.test("Build insert query arguments without undefined or null value", () => {
  const toPgsqlArgs = repository["toPgsqlArgs"];
  const args = toPgsqlArgs({ id: "1", user: "user1", password: "azerty" });

  assertEquals(args, { vars: "user,password", values: "'user1','azerty'" });
});

Deno.test("Build insert query arguments with undefined value", () => {
  const toPgsqlArgs = repository["toPgsqlArgs"];
  const args = toPgsqlArgs({ id: "1", user: "user1", password: undefined });

  assertEquals(args, { vars: "user,password", values: "'user1',NULL" });
});

Deno.test("Build insert query arguments with null value", () => {
  const toPgsqlArgs = repository["toPgsqlArgs"];
  const args = toPgsqlArgs({ id: "1", user: "user1", password: null });

  assertEquals(args, { vars: "user,password", values: "'user1',NULL" });
});
