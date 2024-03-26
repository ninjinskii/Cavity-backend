import {
  assertSpyCall,
  assertSpyCalls,
  beforeEach,
  Context,
  createMockContext,
  describe,
  it,
  spy,
  SupabaseClient,
} from "../../../deps.ts";
import { EnTranslations } from "../../i18n/translatable.ts";
import { Account } from "../../model/account.ts";
import { JwtServiceImpl } from "../../infrastructure/jwt-service.ts";
import { SupabaseAccountDao } from "../../dao/account-dao.ts";
import PasswordService from "../../infrastructure/password-service.ts";
import { AuthController } from "../auth.ts";
import {
  assertBodyEquals,
  assertStatusEquals,
  fakeRequestBody,
  FakeRouter,
  simpleStub,
  simpleStubAsync,
  spyContext,
} from "../../util/test-utils.ts";

const $t = new EnTranslations();
const client = {} as SupabaseClient;
const jwtService = await JwtServiceImpl.newInstance("secret");
const router = new FakeRouter();
const accountDao = new SupabaseAccountDao(client);

const authController = new AuthController({
  router,
  jwtService,
  accountDao,
});

const fakeAccount: Account = {
  id: 1,
  email: "abc@abc.fr",
  password: "shht",
  registrationCode: null,
  resetToken: null,
  lastUpdateTime: null,
  lastUser: null,
};

let mockContext: Context;

describe("Auth controller", () => {
  beforeEach(() => {
    mockContext = createMockContext();
  });

  describe("login", () => {
    beforeEach(() => {
      fakeRequestBody(mockContext, { email: "abc@abc.fr", password: "shht" });
    });

    it("can login user", async () => {
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [
          fakeAccount,
        ],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", true);
      const jwtSpy = simpleStubAsync(jwtService, "create", "token");

      await authController.login(mockContext);

      spyContext([selectAccountSpy, passwordSpy, jwtSpy], () => {
        assertSpyCall(selectAccountSpy, 0, { args: ["abc@abc.fr"] });
        assertSpyCall(passwordSpy, 0, { args: ["shht", fakeAccount.password] });
        assertSpyCalls(jwtSpy, 1);
        assertStatusEquals(mockContext, 200);
        assertBodyEquals(mockContext, {
          token: "token",
          email: fakeAccount.email,
          lastUpdateTime: null,
          lastUser: null,
        });
      });
    });

    it("should fail if no account found with given email", async () => {
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [],
      );
      const passwordSpy = spy(PasswordService, "compare");
      const jwtSpy = spy(jwtService, "create");

      await authController.login(mockContext);

      spyContext([selectAccountSpy, passwordSpy, jwtSpy], () => {
        assertSpyCall(selectAccountSpy, 0, { args: ["abc@abc.fr"] });
        assertSpyCalls(passwordSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.wrongCredentials });
      });
    });

    it("should fail if account is not confirmed", async () => {
      const fakeAccountWithRegistrationCode: Account = {
        id: 1,
        email: "abc@abc.fr",
        password: "shht",
        registrationCode: 123456,
        resetToken: null,
        lastUpdateTime: null,
        lastUser: null,
      };
      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccountWithRegistrationCode],
      );
      const passwordSpy = spy(PasswordService, "compare");
      const jwtSpy = spy(jwtService, "create");

      await authController.login(mockContext);

      spyContext([selectAccountSpy, passwordSpy, jwtSpy], () => {
        assertSpyCall(selectAccountSpy, 0, { args: ["abc@abc.fr"] });
        assertSpyCalls(passwordSpy, 1);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 412);
        assertBodyEquals(mockContext, { message: $t.confirmAccount });
      });
    });

    it("should fail if given password is wrong", async () => {
      fakeRequestBody(mockContext, { email: "abc@abc.fr", password: "wrong" });

      const selectAccountSpy = simpleStubAsync(
        accountDao,
        "selectByEmailWithPassword",
        [fakeAccount],
      );
      const passwordSpy = simpleStub(PasswordService, "compare", false);
      const jwtSpy = spy(jwtService, "create");

      await authController.login(mockContext);

      spyContext([selectAccountSpy, passwordSpy, jwtSpy], () => {
        assertSpyCall(selectAccountSpy, 0, { args: ["abc@abc.fr"] });
        assertSpyCall(passwordSpy, 0, { args: ["wrong", "shht"] });
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 400);
        assertBodyEquals(mockContext, { message: $t.wrongCredentials });
      });
    });

    it("should handle db error", async () => {
      const selectAccountSpy = simpleStub(
        accountDao,
        "selectByEmailWithPassword",
        Promise.reject("Fail for test purposes"),
      );
      const passwordSpy = spy(PasswordService, "compare");
      const jwtSpy = spy(jwtService, "create");

      await authController.login(mockContext);

      spyContext([selectAccountSpy, passwordSpy, jwtSpy], () => {
        assertSpyCall(selectAccountSpy, 0, { args: ["abc@abc.fr"] });
        assertSpyCalls(passwordSpy, 0);
        assertSpyCalls(jwtSpy, 0);
        assertStatusEquals(mockContext, 500);
        assertBodyEquals(mockContext, { message: $t.baseError });
      });
    });
  });
});
