import {
  assertEquals,
  Context,
  returnsNext,
  Router,
  Spy,
  Stub,
  stub,
} from "../../deps.ts";

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
  post() {
    return this;
  }

  delete() {
    return this;
  }

  get() {
    return this;
  }
}
