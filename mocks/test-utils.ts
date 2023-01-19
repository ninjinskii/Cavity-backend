import { JwtService } from "../api/service/jwt-service.ts";
import { BodyJson, Context, returnsNext, Spy, Stub, stub } from "../deps.ts";

// When using assertSpyCall() and not assertSpyCalls(), call count assertion are 0 based, which might be misleading
export function spyCount(count: number): number {
  return count - 1;
}

export function spyContext(spies: Spy[], block: () => void): void {
  try {
    block();
  } finally {
    spies.forEach((s) => s.restore());
  }
}

export function simpleStub<T>(
  object: T,
  method: keyof T,
  returnNext: unknown,
) {
  return stub(object, method, returnsNext([returnNext] as never));
}

export function simpleStubAsync<T>(
  object: T,
  method: keyof T,
  returnNext: unknown,
) {
  return stub(
    object,
    method,
    returnsNext([Promise.resolve(returnNext)] as never),
  );
}

export function fakeRequestBody(
  mockContext: Context,
  body: unknown,
): Stub {
  return stub(
    mockContext.request,
    "body",
    returnsNext([{ value: Promise.resolve(body), type: "json" } as BodyJson]),
  );
}

// export type Constructor = new (...args: any[]) => {};
