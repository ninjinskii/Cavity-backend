import { Application } from "../../deps.ts";
import Repository from "../repository.ts";
import { Translatable } from "../i18n/translatable.ts";

export default abstract class Controller {
  app: Application;
  repository: Repository;
  translator: Translatable | null = null;
  path: string = "/account";

  constructor(app: Application, repository: Repository) {
    this.app = app;
    this.repository = repository;

    this.handleRequests();
  }

  abstract handleRequests(): void;
}
