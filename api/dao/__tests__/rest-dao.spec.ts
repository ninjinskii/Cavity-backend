import { assertEquals, Client, describe, it } from "../../../deps.ts";
import { PostgresClientRestDao } from "../rest-dao.ts";

describe("parse", () => {
  it("should parse", () => {
    const example = [{ aT: "a valeur", bT: "b valeur" }, { aT: "a valeur 2", bT: "b valeur 2" }];
    const dao = new PostgresClientRestDao(({} as unknown as Client), "a");

    const value = dao.toSqlInsert(example)

    assertEquals(value, '')
  });
});
