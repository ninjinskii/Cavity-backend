import {
  afterAll,
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
import { AccountController } from "../account.ts";
import { EnTranslations } from "../../i18n/translatable.ts";
import { Account } from "../../model/account.ts";
import { JwtServiceImpl } from "../../infrastructure/jwt-service.ts";
import { SupabaseAccountDao } from "../../dao/account-dao.ts";
import PasswordService from "../../infrastructure/password-service.ts";
import {
  assertBodyEquals,
  assertStatusEquals,
  fakeRequestBody,
  FakeRouter,
  simpleStub,
  simpleStubAsync,
  spyContext,
} from "../../util/test-utils.ts";
import { Environment } from "../../infrastructure/environment.ts";
import { FakeErrorReporter } from "../../infrastructure/error-reporter.ts";
import { BaseAuthenticator } from "../../infrastructure/authenticator.ts";

const $t = new EnTranslations();

const client = {} as SupabaseClient;
const jwtService = await JwtServiceImpl.newInstance("secret");
const errorReporter = new FakeErrorReporter();
const authenticator = new BaseAuthenticator(jwtService, errorReporter);
const router = new FakeRouter();
const accountDao = new SupabaseAccountDao(client);
const accountController = new AccountController({
  router,
  accountDao,
  errorReporter,
  authenticator,
});

let fakeAccount: Account;

let mockContext: Context;

const alwaysFalse = Array.from({ length: 100 }, () => false);
stub(
  Environment,
  "isDevelopmentMode",
  returnsNext(alwaysFalse),
);

describe("Account controller", () => {
  beforeEach(() => {
    fakeAccount = {
      id: 1,
      email: "abc@abc.fr",
      password: "shht",
      registrationCode: 123456,
      resetToken: null,
      lastUser: null,
      lastUpdateTime: null,
    };

    mockContext = createMockContext({
      headers: [["Authorization", "Bearer zepuifgo"]],
    });
  });

  describe("getAccount", () => {
    it("can retrieve an account", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = simpleStubAsync(accountDao, "selectById", [fakeAccount]);

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCall(jwtSpy, 0, { args: ["zepuifgo"] });
        assertSpyCall(daoSpy, 0, { args: [1] });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ...fakeAccount, token: "zepuifgo" });
      });
    });

    it("cannot retrieve account if not authenticated", async () => {
      const jwtSpy = spy(jwtService, "verify");
      const daoSpy = spy(accountDao, "selectById");

      mockContext = createMockContext();

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCalls(jwtSpy, 0);
        assertSpyCalls(daoSpy, 0);
        assertBodyEquals(mockContext, { message: $t.unauthorized });
        assertStatusEquals(mockContext, 401);
      });
    });

    it("should return 404 if no account matched", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const daoSpy = simpleStubAsync(accountDao, "selectById", []);

      await accountController.getAccount(mockContext);

      spyContext([jwtSpy, daoSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(daoSpy, 1);
        assertBodyEquals(mockContext, { message: $t.notFound });
        assertStatusEquals(mockContext, 404);
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
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(daoSpy, 1);
        assertBodyEquals(mockContext, { message: $t.baseError });
        assertStatusEquals(mockContext, 500);
      });
    });
  });

  describe("confirmAccount", () => {
    it("can confirm an account & return token", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);
      const fakeAccountId = fakeAccount.id;

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, 0, { args: [fakeAccount.email] });
        assertSpyCall(jwtSpy, 0, {
          args: [{
            header: { alg: "HS512", typ: "JWT" },
            payload: { account_id: fakeAccountId },
          }],
        });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ...fakeAccount, token: "token" });
      });
    });

    it("can confirm an account with spaces in provided email", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);
      const daoRegisterSpy = simpleStubAsync(accountDao, "register", undefined);
      const fakeAccountId = fakeAccount.id;

      fakeRequestBody(mockContext, {
        email: "   abc@abc.fr   \n",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCall(daoRegisterSpy, 0, { args: [fakeAccount.email] });
        assertSpyCall(jwtSpy, 0, {
          args: [{
            header: { alg: "HS512", typ: "JWT" },
            payload: { account_id: fakeAccountId },
          }],
        });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ...fakeAccount, token: "token" });
      });
    });

    it("should fail if no account matched", async () => {
      const jwtSpy = spy(jwtService, "create");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", []);
      const daoRegisterSpy = spy(accountDao, "register");

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCalls(daoRegisterSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.wrongAccount });
      });
    });

    it("should fail if account is already confirmed", async () => {
      const confirmedfakeAccount: Account = {
        id: 1,
        email: "abcd@abcd.fr",
        password: "shht",
        registrationCode: null, // registrationCode == null -> account is already confirmed
        resetToken: null,
        lastUpdateTime: null,
        lastUser: null,
      };

      const jwtSpy = spy(jwtService, "create");
      const daoRegisterSpy = spy(accountDao, "register");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        confirmedfakeAccount,
      ]);

      fakeRequestBody(mockContext, {
        email: "abcd@abcd.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [confirmedfakeAccount.email] });
        assertSpyCalls(daoRegisterSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.alreadyConfirmed });
      });
    });

    it("should fail if registration code is not a number", async () => {
      const jwtSpy = spy(jwtService, "create");
      const daoRegisterSpy = spy(accountDao, "register");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "hello ?",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCalls(daoRegisterSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, {
          message: $t.wrongRegistrationCode,
        });
      });
    });

    it("should fail if registration code is wrong", async () => {
      const jwtSpy = spy(jwtService, "create");
      const daoRegisterSpy = spy(accountDao, "register");
      const daoSelectSpy = simpleStubAsync(accountDao, "selectByEmail", [
        fakeAccount,
      ]);

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "654321",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCalls(daoRegisterSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, {
          message: $t.wrongRegistrationCode,
        });
      });
    });

    it("should fail if database error occured", async () => {
      const jwtSpy = spy(jwtService, "create");
      const daoRegisterSpy = spy(accountDao, "register");
      const daoSelectSpy = stub(
        accountDao,
        "selectByEmail",
        returnsNext([Promise.reject()]),
      );

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        registrationCode: "123456",
      });

      await accountController.confirmAccount(mockContext);

      spyContext([jwtSpy, daoSelectSpy, daoRegisterSpy], () => {
        assertSpyCall(daoSelectSpy, 0, { args: [fakeAccount.email] });
        assertSpyCalls(daoRegisterSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });
  });

  describe("postAccount", () => {
    const fetchTemp = globalThis.fetch;

    afterAll(() => {
      globalThis.fetch = fetchTemp;
    });

    beforeEach(() => {
      accountController["isAccountUnique"] = () => Promise.resolve(true);
      globalThis.fetch = () => Promise.resolve(Response.json({}));

      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        password: "sHht..2D4!",
      });
    });

    it("can create an account", async () => {
      const insertAccountSpy = simpleStubAsync(accountDao, "insert", undefined);
      const codeSpy = simpleStub(Account, "generateRegistrationCode", 234567);
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      const expectedAccount = {
        email: "abc@abc.fr",
        registrationCode: 234567,
        password: "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
        resetToken: null,
      };

      await accountController.postAccount(mockContext);

      spyContext([insertAccountSpy, codeSpy, passwordSpy], () => {
        assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
        assertSpyCalls(codeSpy, 1);
        assertSpyCall(insertAccountSpy, 0, { args: [[expectedAccount]] });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("trims given emails but not password", async () => {
      const spacePassword = "sHht..2D4! ";
      const insertAccountSpy = simpleStubAsync(accountDao, "insert", undefined);
      const codeSpy = simpleStub(Account, "generateRegistrationCode", 234567);
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      fakeRequestBody(mockContext, {
        email: "  abc@abc.fr  \n",
        password: spacePassword,
      });

      const expectedAccount = {
        email: "abc@abc.fr",
        registrationCode: 234567,
        password: "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
        resetToken: null,
      };

      await accountController.postAccount(mockContext);

      spyContext([insertAccountSpy, codeSpy, passwordSpy], () => {
        assertSpyCall(passwordSpy, 0, { args: [spacePassword] });
        assertSpyCalls(codeSpy, 1);
        assertSpyCall(insertAccountSpy, 0, { args: [[expectedAccount]] });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should fail if password not secure enough", async () => {
      fakeRequestBody(mockContext, {
        email: "abc@abc.fr",
        password: "shhtshhtshht",
      });
      const insertAccountSpy = spy(accountDao, "insert");
      const codeSpy = spy(Account, "generateRegistrationCode");
      const passwordSpy = spy(PasswordService, "encrypt");

      await accountController.postAccount(mockContext);

      spyContext([insertAccountSpy, codeSpy, passwordSpy], () => {
        assertSpyCalls(passwordSpy, 0);
        assertSpyCalls(codeSpy, 0);
        assertSpyCalls(insertAccountSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.weakPassword });
      });
    });

    it("should fail if email already registered", async () => {
      const insertAccountSpy = spy(accountDao, "insert");
      const codeSpy = spy(Account, "generateRegistrationCode");
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      accountController["isAccountUnique"] = () => Promise.resolve(false);

      await accountController.postAccount(mockContext);

      spyContext([insertAccountSpy, codeSpy, passwordSpy], () => {
        assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
        assertSpyCalls(codeSpy, 0);
        assertSpyCalls(insertAccountSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.accountAlreadyExists });
      });
    });

    it("should fail if database error occured", async () => {
      const insertAccountSpy = simpleStub(
        accountDao,
        "insert",
        Promise.reject("Fail for tests purposes"),
      );
      const deleteAccountSpy = simpleStub(
        accountDao,
        "deleteByEmail",
        Promise.resolve(),
      );
      const codeSpy = simpleStub(Account, "generateRegistrationCode", 234567);
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      await accountController.postAccount(mockContext);

      spyContext(
        [insertAccountSpy, deleteAccountSpy, codeSpy, passwordSpy],
        () => {
          assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
          assertSpyCalls(codeSpy, 1);
          assertSpyCalls(insertAccountSpy, 1);
          assertStatusEquals(mockContext, 400);
          assertBodyEquals(mockContext, { message: $t.invalidEmail });
        },
      );
    });

    it("should cleanup account if mail sending gone wrong", async () => {
      const insertAccountSpy = simpleStubAsync(accountDao, "insert", undefined);
      const deleteAccountSpy = simpleStubAsync(
        accountDao,
        "deleteByEmail",
        undefined,
      );
      const codeSpy = simpleStub(Account, "generateRegistrationCode", 234567);
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      globalThis.fetch = () => Promise.reject("Fail for tests purposes");

      await accountController.postAccount(mockContext);

      spyContext(
        [insertAccountSpy, deleteAccountSpy, codeSpy, passwordSpy],
        () => {
          assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
          assertSpyCalls(codeSpy, 1);
          assertSpyCalls(insertAccountSpy, 1);
          assertSpyCall(deleteAccountSpy, 0, { args: ["abc@abc.fr"] });
          assertStatusEquals(mockContext, 400);
          assertBodyEquals(mockContext, { message: $t.invalidEmail });
        },
      );
    });

    it("should fail if mail sending gone wrong and database error ocurred", async () => {
      const insertAccountSpy = simpleStubAsync(accountDao, "insert", undefined);
      const deleteAccountSpy = simpleStub(
        accountDao,
        "deleteByEmail",
        Promise.reject("Fail for test purposes"),
      );
      const codeSpy = simpleStub(Account, "generateRegistrationCode", 234567);
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "$2sQ0$TZDo4Eg9SQCx./5XYqaBreHIfS0RfKg.Xxf9AptChuQMIgtHzpDiu",
      );

      globalThis.fetch = () => Promise.reject("Fail for tests purposes");

      await accountController.postAccount(mockContext);

      spyContext(
        [insertAccountSpy, deleteAccountSpy, codeSpy, passwordSpy],
        () => {
          assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
          assertSpyCalls(codeSpy, 1);
          assertSpyCalls(insertAccountSpy, 1);
          assertSpyCall(deleteAccountSpy, 0, { args: ["abc@abc.fr"] });
          assertStatusEquals(mockContext, 500);
          assertBodyEquals(mockContext, { message: $t.baseError });
        },
      );
    });
  });

  describe("deleteAccount", () => {
    beforeEach(() => {
      fakeRequestBody(mockContext, {
        email: "abcde@abcde.fr",
        password: "shht",
      });
    });

    it("can delete account", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", true);
      const deleteAccountSpy = simpleStubAsync(
        accountDao,
        "deleteById",
        undefined,
      );

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCall(selectAccountSpy, 0, { args: ["abcde@abcde.fr"] });
          assertSpyCall(passwordSpy, 0, { args: ["shht", "shht"] });
          assertSpyCall(deleteAccountSpy, 0, { args: [fakeAccount.id] });
        },
      );
    });

    it("can delete account with spaces provided in email", async () => {
      const spacePassword = "shht ";
      fakeAccount.password = spacePassword;
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", true);
      const deleteAccountSpy = simpleStubAsync(
        accountDao,
        "deleteById",
        undefined,
      );

      fakeRequestBody(mockContext, {
        email: "  abcde@abcde.fr  \n",
        password: spacePassword,
      });

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCall(selectAccountSpy, 0, { args: ["abcde@abcde.fr"] });
          assertSpyCall(passwordSpy, 0, {
            args: [spacePassword, spacePassword],
          });
          assertSpyCall(deleteAccountSpy, 0, { args: [fakeAccount.id] });
        },
      );
    });

    it("cannot delete account if not authenticated", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", {
        account_id: "qsdf",
      });
      const selectAccountSpy = spy(accountDao, "selectByEmailWithPassword");
      const passwordSpy = spy(PasswordService, "compare");
      const deleteAccountSpy = spy(accountDao, "deleteById");

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCalls(selectAccountSpy, 0);
          assertSpyCalls(passwordSpy, 0);
          assertSpyCalls(deleteAccountSpy, 0);
          assertBodyEquals(mockContext, { message: $t.unauthorized });
          assertStatusEquals(mockContext, 401);
        },
      );
    });

    it("cannot delete account if account not found", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [],
      );
      const passwordSpy = spy(PasswordService, "compare");
      const deleteAccountSpy = spy(accountDao, "deleteById");

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCalls(selectAccountSpy, 1);
          assertSpyCalls(passwordSpy, 0);
          assertSpyCalls(deleteAccountSpy, 0);
        },
      );
    });

    it("cannot delete account if passwords does not match", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", false);
      const deleteAccountSpy = spy(accountDao, "deleteById");

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCalls(selectAccountSpy, 1);
          assertSpyCalls(passwordSpy, 1);
          assertSpyCalls(deleteAccountSpy, 0);
          assertStatusEquals(mockContext, 400);
          assertBodyEquals(mockContext, { message: $t.wrongCredentials });
        },
      );
    });

    it("cannot delete account if token id does not match db account id", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "2" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", true);
      const deleteAccountSpy = spy(accountDao, "deleteById");

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCalls(selectAccountSpy, 1);
          assertSpyCalls(passwordSpy, 1);
          assertSpyCalls(deleteAccountSpy, 0);
          assertStatusEquals(mockContext, 401);
          assertBodyEquals(mockContext, { message: $t.unauthorized });
        },
      );
    });

    it("should handle db error when deleting account", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", true);
      const deleteAccountSpy = simpleStub(
        accountDao,
        "deleteById",
        Promise.reject("Fail for test purposes"),
      );

      await accountController.deleteAccount(mockContext);

      spyContext(
        [jwtSpy, selectAccountSpy, passwordSpy, deleteAccountSpy],
        () => {
          assertSpyCalls(jwtSpy, 1);
          assertSpyCalls(selectAccountSpy, 1);
          assertSpyCalls(passwordSpy, 1);
          assertSpyCalls(deleteAccountSpy, 1);
          assertStatusEquals(mockContext, 500);
          assertBodyEquals(mockContext, { message: $t.baseError });
        },
      );
    });
  });

  describe("recoverAccount", () => {
    const fetchTemp = globalThis.fetch;

    afterAll(() => {
      globalThis.fetch = fetchTemp;
    });

    beforeEach(() => {
      globalThis.fetch = () => Promise.resolve(Response.json({}));
      fakeRequestBody(mockContext, { email: "abcdef@abcdef.fr" });
      accountController["isAccountUnique"] = () => Promise.resolve(false);
    });

    it("can send a mail to recover account", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const updateAccountSpy = simpleStubAsync(
        accountDao,
        "setPendingRecovery",
        [fakeAccount],
      );

      await accountController.recoverAccount(mockContext);

      spyContext([jwtSpy, updateAccountSpy], () => {
        assertSpyCall(jwtSpy, 0);
        assertSpyCall(updateAccountSpy, 0, {
          args: ["abcdef@abcdef.fr", "token"],
        });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should fail silently if no account match the given email", async () => {
      const jwtSpy = spy(jwtService, "create");
      const updateAccountSpy = spy(accountDao, "setPendingRecovery");

      accountController["isAccountUnique"] = () => Promise.resolve(true);
      await accountController.recoverAccount(mockContext);

      spyContext([jwtSpy, updateAccountSpy], () => {
        assertSpyCalls(jwtSpy, 0);
        assertSpyCalls(updateAccountSpy, 0);

        // We want a positive feedback to not leak the fact that the account does not exists
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("cannot send mail if db error occured", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const updateAccountSpy = simpleStub(
        accountDao,
        "setPendingRecovery",
        Promise.reject(),
      );

      await accountController.recoverAccount(mockContext);

      spyContext([jwtSpy, updateAccountSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(updateAccountSpy, 1);

        // We want a positive feedback to not leak the fact that the account does not exists
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });

    it("should fail if mail sending gone wrong", async () => {
      globalThis.fetch = () => Promise.reject(Response.error());

      const jwtSpy = simpleStubAsync(jwtService, "create", "token");
      const updateAccountSpy = simpleStubAsync(
        accountDao,
        "setPendingRecovery",
        [fakeAccount],
      );

      await accountController.recoverAccount(mockContext);

      spyContext([jwtSpy, updateAccountSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(updateAccountSpy, 1);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });
  });

  describe("resetPassword", () => {
    beforeEach(() => {
      fakeRequestBody(mockContext, { token: "token", password: "sHht..2D4!" });
    });

    it("can reset password", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", {
        reset_password: true,
      });
      const passwordSpy = simpleStub(
        PasswordService,
        "encrypt",
        "encryptedpassword",
      );
      const updateAccountSpy = simpleStub(
        accountDao,
        "recover",
        Promise.resolve(),
      );

      await accountController.resetPassword(mockContext);

      spyContext([jwtSpy, passwordSpy, updateAccountSpy], () => {
        assertSpyCall(jwtSpy, 0, { args: ["token"] });
        assertSpyCall(passwordSpy, 0, { args: ["sHht..2D4!"] });
        assertSpyCall(updateAccountSpy, 0, {
          args: ["encryptedpassword", "token"],
        });
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });

    it("should fail silently if token seems incorrect/fake", async () => {
      const jwtSpy = simpleStubAsync(jwtService, "verify", { account_id: "1" });
      const passwordSpy = spy(PasswordService, "encrypt");
      const updateAccountSpy = spy(accountDao, "recover");

      await accountController.resetPassword(mockContext);

      spyContext([jwtSpy, passwordSpy, updateAccountSpy], () => {
        assertSpyCalls(jwtSpy, 1);
        assertSpyCalls(passwordSpy, 0);
        assertSpyCalls(updateAccountSpy, 0);

        // Positive feedback to not leak any sensitive information
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, { ok: true });
      });
    });
  });
});
