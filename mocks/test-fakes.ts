import { Account } from "../api/model/account.ts";
import { JwtCreateOptions, JwtService } from "../api/service/jwt-service.ts";
import { Client, Dao, Router } from "../deps.ts";
// import { Constructor } from "./test-utils.ts";

// export function Spy<T extends Constructor>(Base: T) {
//   return class Spying extends Base {
//     _callCount = 0;
//     _lastArgs: unknown[] = [];

//     update(args: unknown[]): void {
//       this.incrementCallCount();
//       this.registerLastArgs(args);
//     }

//     reset(): void {
//       this._callCount = 0;
//       this._lastArgs = [];
//     }

//     private incrementCallCount(): void {
//       this._callCount++;
//     }

//     private registerLastArgs(args: unknown[]): void {
//       this._lastArgs = args;
//     }
//   };
// }

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
