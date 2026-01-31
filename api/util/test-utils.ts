import { assertEquals } from "@std/assert";
import { Context } from "@oak/oak";
import { returnsNext, type Spy, type Stub, stub } from "@std/testing/mock";
import { Router } from "@oak/oak";

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
  Object.assign(mockContext, {
    ...mockContext,
    request: { ...mockContext.request, body: { json() {} } },
  });

  return stub(
    mockContext.request.body,
    "json",
    returnsNext([Promise.resolve(body)]),
  );
}

export function assertBodyEquals(mockContext: Context, body: unknown) {
  assertEquals(mockContext.response.body, body);
}

export function assertStatusEquals(mockContext: Context, status: number) {
  assertEquals(mockContext.response.status, status);
}

export class FakeRouter extends Router {
  override post() {
    return this;
  }

  override delete() {
    return this;
  }

  override get() {
    return this;
  }
}
