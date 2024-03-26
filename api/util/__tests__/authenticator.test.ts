import inAuthentication from "../authenticator.ts";
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
} from "../../../deps.ts";
import { FrTranslations } from "../../i18n/translatable.ts";
import { JwtServiceImpl } from "../../infrastructure/jwt-service.ts";
import {
  assertBodyEquals,
  assertStatusEquals,
  simpleStubAsync,
  spyContext,
} from "../test-utils.ts";

const $t = new FrTranslations();
const jwtService = await JwtServiceImpl.newInstance("secret");

let mockContext: Context;

describe("inAuthentication", () => {
  beforeEach(() => {
    mockContext = createMockContext({
      headers: [["Authorization", "Bearer zepuifgo"]],
    });
  });

  it("can retrieve account id & pass it to execution block", async () => {
    const verifySpy = simpleStubAsync(jwtService, "verify", {
      account_id: "1",
    });
    const callbackSpy = spy(() => Promise.resolve());

    await inAuthentication(
      mockContext,
      jwtService,
      $t,
      callbackSpy,
    );

    spyContext([verifySpy], () => {
      assertSpyCall(verifySpy, 0, { args: ["zepuifgo"] });
      assertSpyCall(callbackSpy, 0, { args: [1, "zepuifgo"] });

      // response should not be touched if everything is going ok
      assertStatusEquals(mockContext, 404);
      assertBodyEquals(mockContext, undefined);
    });
  });

  it("should escape if authorization is wrongly formatted", async () => {
    const verifySpy = spy(jwtService, "verify");
    const callbackSpy = spy(() => Promise.resolve());

    mockContext = createMockContext({ headers: [["Authorization", "Bearer"]] });

    await inAuthentication(
      mockContext,
      jwtService,
      $t,
      callbackSpy,
    );

    spyContext([verifySpy], () => {
      assertSpyCalls(verifySpy, 0);
      assertSpyCalls(callbackSpy, 0);
      assertStatusEquals(mockContext, 401);
      assertBodyEquals(mockContext, { message: $t.unauthorized });
    });
  });

  it("should escape if authorization header is missing", async () => {
    const verifySpy = simpleStubAsync(jwtService, "verify", {
      account_id: "1",
    });
    const callbackSpy = spy(() => Promise.resolve());

    mockContext = createMockContext();

    await inAuthentication(
      mockContext,
      jwtService,
      $t,
      callbackSpy,
    );

    spyContext([verifySpy], () => {
      assertSpyCalls(verifySpy, 0);
      assertSpyCalls(callbackSpy, 0);
      assertStatusEquals(mockContext, 401);
      assertBodyEquals(mockContext, { message: $t.unauthorized });
    });
  });

  it("should escape if accountId is not a number", async () => {
    const verifySpy = simpleStubAsync(jwtService, "verify", "a");
    const callbackSpy = spy(() => Promise.resolve());

    await inAuthentication(
      mockContext,
      jwtService,
      $t,
      callbackSpy,
    );

    spyContext([verifySpy], () => {
      assertSpyCalls(verifySpy, 1);
      assertSpyCalls(callbackSpy, 0);
      assertStatusEquals(mockContext, 401);
      assertBodyEquals(mockContext, { message: $t.unauthorized });
    });
  });

  it("should escape if verify throws", async () => {
    const verifySpy = stub(
      jwtService,
      "verify",
      returnsNext([Promise.reject()]),
    );
    const callbackSpy = spy(() => Promise.resolve());

    await inAuthentication(
      mockContext,
      jwtService,
      $t,
      callbackSpy,
    );

    spyContext([verifySpy], () => {
      assertSpyCalls(verifySpy, 1);
      assertSpyCalls(callbackSpy, 0);
      assertStatusEquals(mockContext, 401);
      assertBodyEquals(mockContext, { message: $t.unauthorized });
    });
  });
});
