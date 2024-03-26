import {
  assertSpyCall,
  assertSpyCalls,
  beforeEach,
  Context,
  createMockContext,
  describe,
  it,
  returnsNext,
  spy,
  stub,
  SupabaseClient,
} from "../../../deps.ts";
import { EnTranslations } from "../../i18n/translatable.ts";
import { JwtServiceImpl } from "../../infrastructure/jwt-service.ts";
import { DataController } from "../rest.ts";
import { SupabaseRestDao } from "../../dao/rest-dao.ts";
import {
  assertBodyEquals,
  assertStatusEquals,
  fakeRequestBody,
  FakeRouter,
  simpleStub,
  simpleStubAsync,
  spyContext,
} from "../../util/test-utils.ts";
import { FakeErrorReporter } from "../../infrastructure/error-reporter.ts";
import { BaseAuthenticator } from "../../util/authenticator.ts";

const $t = new EnTranslations();
const client = {
  createTransaction() {
    return {
      begin() {
      },
      commit() {
      },
    };
  },
} as unknown as SupabaseClient;

const mapper = {
  "/county": new SupabaseRestDao(client, "county"),
  "/wine": new SupabaseRestDao(client, "wine"),
  "/bottle": new SupabaseRestDao(client, "bottle"),
  "/friend": new SupabaseRestDao(client, "friend"),
  "/grape": new SupabaseRestDao(client, "grape"),
  "/review": new SupabaseRestDao(client, "review"),
  "/qgrape": new SupabaseRestDao(client, "q_grape"),
  "/freview": new SupabaseRestDao(client, "f_review"),
  "/history": new SupabaseRestDao(client, "history_entry"),
  "/tasting": new SupabaseRestDao(client, "tasting"),
  "/tasting-action": new SupabaseRestDao(client, "tasting_action"),
  "/history-x-friend": new SupabaseRestDao(client, "history_x_friend"),
  "/tasting-x-friend": new SupabaseRestDao(client, "tasting_x_friend"),
};

const jwtService = await JwtServiceImpl.newInstance("secret");
const errorReporter = new FakeErrorReporter();
const authenticator = new BaseAuthenticator(jwtService, errorReporter);
const router = new FakeRouter();
const restController = new DataController({
  router,
  mapper,
  errorReporter,
  authenticator,
});
const restDao = new SupabaseRestDao(client, "");

let mockContext: Context;

describe("Data controller", () => {
  beforeEach(() => {
    mockContext = createMockContext({
      headers: [["Authorization", "Bearer zepuifgo"]],
    });
    restController["getDao"] = () => restDao;
  });

  describe("handlePost", () => {
    it("can persist posted data & add account id in it", async () => {
      fakeRequestBody(mockContext, [{ a: "a", b: "b" }, { a: "c", b: "d" }]);

      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = simpleStubAsync(
        restDao,
        "deleteAllForAccount",
        undefined,
      );
      const insertSpy = simpleStubAsync(restDao, "insert", undefined);

      await restController.handlePost(mockContext);

      spyContext([jwtSpy, deleteSpy, insertSpy], () => {
        assertSpyCall(jwtSpy, 0, { args: ["zepuifgo"] });
        assertSpyCall(deleteSpy, 0, { args: [1] });
        assertSpyCall(insertSpy, 0, {
          args: [[{ a: "a", b: "b", account_id: 1 }, {
            a: "c",
            b: "d",
            account_id: 1,
          }]],
        });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should not be able to post if not authenticated", async () => {
      fakeRequestBody(mockContext, [{ a: "a", b: "b" }, { a: "c", b: "d" }]);

      const jwtSpy = simpleStubAsync(jwtService, "verify", {
        account_id: "qsdf",
      });
      const deleteSpy = spy(restDao, "deleteAllForAccount");
      const insertSpy = spy(restDao, "insert");

      await restController.handlePost(mockContext);

      spyContext([jwtSpy, deleteSpy, insertSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(deleteSpy, 0);
        assertSpyCalls(insertSpy, 0);
        assertStatusEquals(mockContext, 401);
        assertBodyEquals(mockContext, { message: $t.unauthorized });
      });
    });

    it("should remove all data if given array is empty", async () => {
      fakeRequestBody(mockContext, []);

      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = simpleStubAsync(
        restDao,
        "deleteAllForAccount",
        undefined,
      );
      const insertSpy = spy(restDao, "insert");

      await restController.handlePost(mockContext);

      spyContext([jwtSpy, deleteSpy, insertSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCall(deleteSpy, 0, { args: [1] });
        assertSpyCalls(insertSpy, 0);
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should fail if request body is not an array", async () => {
      fakeRequestBody(mockContext, { object: "but array expected" });

      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = spy(restDao, "deleteAllForAccount");
      const insertSpy = spy(restDao, "insert");

      await restController.handlePost(mockContext);

      spyContext([jwtSpy, deleteSpy, insertSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(deleteSpy, 0);
        assertSpyCalls(insertSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.missingParameters });
      });
    });

    it("should handle db error", async () => {
      fakeRequestBody(mockContext, []);

      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = stub(
        restDao,
        "deleteAllForAccount",
        returnsNext([Promise.reject("Fail for test purposes")]),
      );
      const insertSpy = spy(restDao, "insert");

      await restController.handlePost(mockContext);

      spyContext([jwtSpy, deleteSpy, insertSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(deleteSpy, 1);
        assertSpyCalls(insertSpy, 0);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });

    // TODO: supabase-js does not support transactions yet
    // it("should fail if transaction error occured", async () => {
    //   fakeRequestBody(mockContext, [{ a: "a", b: "b" }, { a: "c", b: "d" }]);

    //   const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
    //   const deleteSpy = simpleStubAsync(
    //     restDao,
    //     "deleteAllForAccount",
    //     undefined,
    //   );
    //   const insertSpy = stub(
    //     restDao,
    //     "insert",
    //     returnsNext([Promise.reject("Fail for test purposes")]),
    //   );

    //   await restController.handlePost(mockContext);

    //   spyContext([jwtSpy, deleteSpy, insertSpy], () => {
    //     assertSpyCalls(jwtSpy, 1);
    //     assertSpyCalls(deleteSpy, 1);
    //     assertSpyCalls(insertSpy, 1);
    //     assertStatusEquals(mockContext, 400); // Not sure why 400 here
    //     assertBodyEquals(mockContext, { message: $t.missingParameters });
    //   });
    // });
  });

  describe("handleGet", () => {
    it("can send users data & remove accountId key", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectSpy = simpleStubAsync(restDao, "selectByAccountId", [
        { a: 1, accountId: 1 },
        { b: 2 },
      ]);

      await restController.handleGet(mockContext);

      spyContext([jwtSpy, selectSpy], () => {
        assertSpyCall(jwtSpy, 0, { args: ["zepuifgo"] });
        assertSpyCall(selectSpy, 0, { args: [1] });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, [{ a: 1 }, { b: 2 }]);
      });
    });

    it("should fail if not authenticated", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", {
        account_id: "qsdf",
      });
      const selectSpy = spy(restDao, "selectByAccountId");

      await restController.handleGet(mockContext);

      spyContext([jwtSpy, selectSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(selectSpy, 0);
        assertStatusEquals(mockContext, 401);
        assertBodyEquals(mockContext, { message: $t.unauthorized });
      });
    });

    it("should handle db error", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectSpy = simpleStub(
        restDao,
        "selectByAccountId",
        Promise.reject("Fail for test purposes"),
      );

      await restController.handleGet(mockContext);

      spyContext([jwtSpy, selectSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(selectSpy, 1);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });
  });

  describe("handleDelete", () => {
    it("should be able to delete users data", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = simpleStubAsync(
        restDao,
        "deleteAllForAccount",
        undefined,
      );

      await restController.handleDelete(mockContext);

      spyContext([jwtSpy, deleteSpy], () => {
        assertSpyCall(jwtSpy, 0, { args: ["zepuifgo"] });
        assertSpyCalls(deleteSpy, 1);
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should fail if not authenticated", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", {
        account_id: "qsdf",
      });
      const deleteSpy = spy(restDao, "deleteAllForAccount");

      await restController.handleDelete(mockContext);

      spyContext([jwtSpy, deleteSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(deleteSpy, 0);
        assertStatusEquals(mockContext, 401);
        assertBodyEquals(mockContext, { message: $t.unauthorized });
      });
    });

    it("should handle db error", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const deleteSpy = simpleStub(
        restDao,
        "deleteAllForAccount",
        Promise.reject("Fail for test purposes"),
      );

      await restController.handleDelete(mockContext);

      spyContext([jwtSpy, deleteSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(deleteSpy, 1);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });
  });
});
