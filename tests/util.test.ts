import { kebabToSnake, pascalToSnake } from "../api/util/string-util.ts";
import { assertEquals } from "../deps.ts";

Deno.test("Kebab to snake case", () => {
  const kebab = { "history-x-friend": 0 };
  const snake = Object.keys(kebabToSnake(kebab as never))[0];

  assertEquals(snake, "history_x_friend");
});

Deno.test("Pascal to snake case", () => {
  const pascal = { "historyXFriend": 0 };
  const snake = Object.keys(pascalToSnake(pascal as never))[0];

  assertEquals(snake, "history_x_friend");
});
