import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import Repository from "../api/db/repository.ts";
import pascalToSnake from "../api/util/pascal-to-snake.js";
import { Query, Transaction, Where } from "../deps.ts";

interface TestObject {
  id: number;
  test_string: string;
  test_int: number;
}

const repository = await Repository.getInstance();
const createTableQuery = await Deno.readTextFile(`./api/db/sql/test/test.sql`);

Deno.test("Insert a record", async () => {
  await repository.do(createTableQuery);

  const query = new Query()
    .table("test")
    .insert({ test_string: "Hi mom!", test_int: 1 })
    .build();

  const response = await repository.do(query);

  assertEquals(response.rowCount, 1);
});

Deno.test("Insert multiple records", async () => {
  await repository.do(createTableQuery);

  const records = [
    { test_string: "Hi again mom!", test_int: 2 },
    { test_string: "Some juicy test", test_int: 3 },
  ];

  const query = new Query()
    .table("test")
    .insert(records)
    .build();

  const response = await repository.do(query);

  assertEquals(response.rowCount, 2);
});

Deno.test("Read a record", async () => {
  await repository.do(createTableQuery);

  const query = new Query()
    .table("test")
    .select("test_string")
    .where(Where.field("test_int").eq(1))
    .build();

  const response = await repository.do<TestObject>(query);
  const str = response.rows[0]?.test_string;

  assertEquals("Hi mom!", str);
});

Deno.test("Delete a record", async () => {
  await repository.do(createTableQuery);

  const query = new Query()
    .table("test")
    .insert({ test_string: "Delete me", test_int: 1 })
    .build();

  const query2 = new Query()
    .delete("test")
    .where(Where.field("test_string").eq("Delete me"))
    .build();

  await repository.do(query);
  const response = await repository.do(query2);

  assertEquals(response.rowCount, 1);
});

Deno.test("Update a record", async () => {
  await repository.do(createTableQuery);

  const newString = { test_string: "Hello mom!", test_int: 1 };
  const query = new Query()
    .table("test")
    .insert({ test_string: "Hi mom!", test_int: 1 })
    .build();

  const query2 = new Query()
    .table("test")
    .update(newString)
    .where(Where.field("test_int").eq(1))
    .build();

  const query3 = new Query()
    .table("test")
    .select("*")
    .where(Where.field("test_string").eq("Hello mom!"))
    .build();

  await repository.do(query);
  await repository.do(query2);
  const response = await repository.do<TestObject>(query3);

  assertEquals(response.rows[0].test_int, 1);
});

Deno.test("Partial update", async () => {
  await repository.do(createTableQuery);

  const newInt = { test_int: 100 };
  const query = new Query()
    .table("test")
    .insert({ test_string: "Hi mom!", test_int: 1 })
    .build();

  const query2 = new Query()
    .table("test")
    .update(newInt)
    .where(Where.field("test_string").eq("Hi mom!"))
    .build();

  const query3 = new Query()
    .table("test")
    .select("*")
    .where(Where.field("test_int").eq(100))
    .build();

  await repository.do(query);
  await repository.do(query2);
  const response = await repository.do<TestObject>(query3);

  assertEquals(response.rows[0].test_int, 100);
  assertEquals(response.rows[0].test_string, "Hi mom!");
})

Deno.test("Use a transaction", async () => {
  await repository.do(createTableQuery);

  const records = [
    { test_string: "Hi again mom!", test_int: 2 },
    { test_string: "Some juicy test", test_int: 3 },
  ];

  const query = new Query()
    .table("test")
    .delete()
    .build();

  const query2 = new Query()
    .table("test")
    .insert({ test_string: "Hi mom!", test_int: 1 })
    .build();

  const query3 = new Query()
    .table("test")
    .insert(records)
    .build();

  const query4 = new Query()
    .table("test")
    .insert(records.reverse())
    .build();

  const query5 = new Query()
    .table("test")
    .select("id", "test_int")
    .build();

  await repository.doInTransaction(async (t: Transaction) => {
    await repository.do(query, t);
    await repository.do(query2, t);
    await repository.do(query3, t);
    await repository.do(query, t);
    await repository.do(query4, t);
  });

  const response = await repository.do<TestObject>(query5);
  const expectedHigherId = response.rows.find((item) => item.test_int === 2)
    ?.id || 0;
  const expectedLowerId = response.rows.find((item) => item.test_int === 3)
    ?.id || 0;

  assertEquals(expectedHigherId > expectedLowerId, true);
});

Deno.test("Pascal case to snake case insert", async () => {
  // Typical client data
  const data = { testString: "Hi mom!", testInt: 1 };
  const formattedData = pascalToSnake(data);

  const query = new Query()
    .table("test")
    .insert(formattedData)
    .build();

  const response = await repository.do(query);

  assertEquals(response.rowCount, 1);
});
