import {
  assertEquals,
  assertSpyCall,
  beforeEach,
  Client,
  Context,
  createMockContext,
  describe,
  it,
  returnsNext,
  spy,
  stub,
} from "../../../deps.ts";
import { FakeRouter } from "../../../mocks/test-fakes.ts";
import { AccountController } from "../account.ts";
import {
  fakeRequestBody,
  simpleStubAsync,
  spyContext,
  spyCount,
} from "../../../mocks/test-utils.ts";
import { EnTranslations } from "../../i18n/translatable.ts";
import { Account } from "../../model/account.ts";
import { JwtServiceImpl } from "../../service/jwt-service.ts";
import { AccountDao } from "../../dao/account-dao.ts";

const $t = new EnTranslations();

const client = {} as Client;

// const JwtService = Spy(FakeBaseJwtService);
const jwtService = await JwtServiceImpl.newInstance("secret");

// const Router = Spy(FakeRouter);
const router = new FakeRouter();

// const AccountDao = Spy(FakeAccountDao);
const accountDao = new AccountDao(client);

const accountController = new AccountController({
  router,
  client,
  jwtService,
  accountDao,
});

const fakeAccount: Account = {
  id: 1,
  email: "abc@abc.fr",
  password: "shht",
  registrationCode: 123456,
  resetToken: null,
};

let mockContext: Context;

describe("Account controller", () => {
  beforeEach(() => {
    mockContext = createMockContext({
      headers: [["Authorization", "Bearer zepuifgo"]],
    });
  });

  describe("getAccount", () => {
    it("can retrieve an account", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = stub(
        accountDao,
        "selectById",
        returnsNext([Promise.resolve([fakeAccount])]),
      );

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCall(jwtSpy, spyCount(1), { args: ["zepuifgo"] });
        assertSpyCall(daoSpy, spyCount(1), { args: [1] });
        assertEquals(mockContext.response.status, 200);
        assertEquals(mockContext.response.body, fakeAccount);
      });
    });

    it("cannot retrieve account if not authenticated", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = spy(accountDao, "selectById");

      mockContext = createMockContext();

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCall(jwtSpy, spyCount(0));
        assertSpyCall(daoSpy, spyCount(0));
        assertEquals(mockContext.response.body, {
          message: $t.unauthorized,
        });
        assertEquals(mockContext.response.status, 401);
      });
    });

    it("should return 404 if no account matched", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = stub(
        accountDao,
        "selectById",
        returnsNext([Promise.resolve([])]),
      );

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCall(jwtSpy, spyCount(1));
        assertSpyCall(daoSpy, spyCount(0));
        assertEquals(mockContext.response.body, { message: $t.notFound });
        assertEquals(mockContext.response.status, 404);
      });
    });

    it("should return 500 if database error occured", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = stub(
        accountDao,
        "selectById",
        returnsNext([Promise.reject()]),
      );

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCall(jwtSpy, spyCount(1));
        assertSpyCall(daoSpy, spyCount(1));
        assertEquals(mockContext.response.body, { message: $t.baseError });
        assertEquals(mockContext.response.status, 500);
      });
    });
  });

  describe("confirmAccount", () => {
    it("should be possible to fake data in request body", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, spyCount(1), {
          args: [fakeAccount.email],
        });
        assertSpyCall(jwtSpy, spyCount(1), {
          args: [{
            header: { alg: "HS512", typ: "JWT" },
            payload: { account_id: fakeAccount.id },
          }],
        });
        assertEquals(mockContext.response.status, 200);
        assertEquals(mockContext.response.body, { token: "token" });
      });
    });

    it("should fail if no account matched", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", []);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, spyCount(0));
        assertSpyCall(jwtSpy, spyCount(0));
        assertEquals(mockContext.response.status, 400);
        assertEquals(mockContext.response.body, { message: $t.wrongAccount });
      });
    });

    it("should fail if account is already confirmed", async () => {
      const confirmedfakeAccount: Account = {
        id: 1,
        email: "abcd@abcd.fr",
        password: "shht",
        registrationCode: null, // registrationCode == null -> account is already confirmed
        resetToken: null,
      };

      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        confirmedfakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abcd@abcd.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), {
          args: [confirmedfakeAccount.email],
        });
        assertSpyCall(daoRegisterSpy, spyCount(0));
        assertSpyCall(jwtSpy, spyCount(0));
        assertEquals(mockContext.response.status, 400);
        assertEquals(mockContext.response.body, {
          message: $t.alreadyConfirmed,
        });
      });
    });

    it("should fail if registration code is not a number", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "hello ?",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, spyCount(0));
        assertSpyCall(jwtSpy, spyCount(0));
        assertEquals(mockContext.response.status, 400);
        assertEquals(mockContext.response.body, {
          message: $t.wrongRegistrationCode,
        });
      });
    });

    it("should fail if registration code is wrong", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "654321",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, spyCount(0));
        assertSpyCall(jwtSpy, spyCount(0));
        assertEquals(mockContext.response.status, 400);
        assertEquals(mockContext.response.body, {
          message: $t.wrongRegistrationCode,
        });
      });
    });

    it("should fail if database error occured", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = stub(
        accountDao,
        "selectByEmail",
        returnsNext([Promise.reject()]),
      );
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, spyCount(1), { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, spyCount(0));
        assertSpyCall(jwtSpy, spyCount(0));
        assertEquals(mockContext.response.status, 500);
        assertEquals(mockContext.response.body, { message: $t.baseError });
      });
    });
  });
});
