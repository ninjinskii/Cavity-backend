import { assertEquals, Client, describe, it } from "../../../deps.ts";
import { PostgresClientRestDao } from "../rest-dao.ts";

const { DATABASE_URL } = Deno.env.toObject();
const [user, password, hostname, port, database] = DATABASE_URL.split(",");
const client = new Client({
  user,
  hostname,
  database,
  port,
  password,
});

describe("PostgresClientRestDao", () => {
  describe("toSqlInsert", () => {
    it("should parse objects to sql insert correctly", () => {
      const example = [{ aT: "a valeur", bT: "b valeur" }, { aT: "a valeur 2", bT: "b valeur 2" }];
      const dao = new PostgresClientRestDao(client, "a");

      const actual = dao.toSqlInsert(example)

      assertEquals(actual, '(a_t, b_t) VALUES (a valeur, b valeur), (a valeur 2, b valeur 2)')
    });
  });

  describe("selectAccountById", () => {
    it("returns appropriate data", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const value = await dao.selectByAccountId(1)

      assertEquals(value, '')
    })
  })
});
