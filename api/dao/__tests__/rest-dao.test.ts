import { assertEquals, Client, describe, it, stub, returnsNext } from "../../../deps.ts";
import { PostgresClientRestDao } from "../rest-dao.ts";
import { simpleStubAsync, spyContext } from "../../util/test-utils.ts";

const client = {} as Client;

describe("PostgresClientRestDao", () => {
  describe("selectByAccountId", () => {
    it("returns appropriate data", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const mockWines = [
        { id: 1, name: "Château Margaux", accountId: 1 },
        { id: 2, name: "Penfolds Grange", accountId: 1 },
      ];
      
      const clientSpy = simpleStubAsync(client, "queryObject", {
        rows: mockWines,
      });

      const value = await dao.selectByAccountId(1);

      spyContext([clientSpy], () => {
        assertEquals(value, mockWines);
      });
    });
  });

  describe("insert", () => {
    it("should insert objects correctly", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const winesData = [
        { name: "Château Margaux", accountId: 1 },
        { name: "Penfolds Grange", accountId: 1 },
      ];

      const clientSpy = simpleStubAsync(client, "queryObject", {});

      await dao.insert(winesData);

      spyContext([clientSpy], () => {
        assertEquals(clientSpy.calls.length, 1);
      });
    });
  });

  describe("replaceAllForAccount", () => {
    it("should replace all data with new data", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const winesData = [
        { name: "Château Margaux", accountId: 1 },
        { name: "Penfolds Grange", accountId: 1 },
      ];

      const mockTransaction = {
        begin: () => Promise.resolve(),
        queryObject: () => Promise.resolve({}),
        commit: () => Promise.resolve(),
        rollback: () => Promise.resolve(),
      };

      const createTransactionSpy = stub(
        client,
        "createTransaction",
        returnsNext([mockTransaction as any]),
      );

      await dao.replaceAllForAccount(1, winesData);

      spyContext([createTransactionSpy], () => {
        // Vérifie que la transaction a été créée
        assertEquals(createTransactionSpy.calls.length, 1);
      });
    });

    it("should delete all data when empty array is provided", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const emptyData: any[] = [];

      const mockTransaction = {
        begin: () => Promise.resolve(),
        queryObject: () => Promise.resolve({}),
        commit: () => Promise.resolve(),
        rollback: () => Promise.resolve(),
      };

      const createTransactionSpy = stub(
        client,
        "createTransaction",
        returnsNext([mockTransaction as any]),
      );

      await dao.replaceAllForAccount(1, emptyData);

      spyContext([createTransactionSpy], () => {
        // Vérifie que la transaction a été créée et que tout s'est bien passé
        assertEquals(createTransactionSpy.calls.length, 1);
      });
    });

    it("should rollback transaction when an error occurs", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      const winesData = [
        { name: "Château Margaux", accountId: 1 },
      ];

      let rollbackCalled = false;
      const mockTransaction = {
        begin: () => Promise.resolve(),
        queryObject: () => Promise.reject(new Error("Database error")),
        commit: () => Promise.resolve(),
        rollback: () => {
          rollbackCalled = true;
          return Promise.resolve();
        },
      };

      const createTransactionSpy = stub(
        client,
        "createTransaction",
        returnsNext([mockTransaction as any]),
      );

      try {
        await dao.replaceAllForAccount(1, winesData);
      } catch (error) {
        // L'erreur est attendue
      }

      spyContext([createTransactionSpy], () => {
        assertEquals(rollbackCalled, true);
      });
    });
  });

  describe("deleteAllForAccount", () => {
    it("should delete all records for an account", async () => {
      const dao = new PostgresClientRestDao(client, "wine");
      
      const clientSpy = simpleStubAsync(client, "queryObject", {});

      await dao.deleteAllForAccount(1);

      spyContext([clientSpy], () => {
        assertEquals(clientSpy.calls.length, 1);
      });
    });
  });
});
