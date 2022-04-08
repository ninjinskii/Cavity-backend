import { Application } from "../../deps.ts";
import Repository from "../repository.ts";
import { EnTranslations, Translatable } from "../i18n/translatable.ts";

export default abstract class Controller {
  app: Application;
  repository: Repository;
  translator: Translatable = new EnTranslations();
  path: string = "/account";

  constructor(app: Application, repository: Repository) {
    this.app = app;
    this.repository = repository;

    this.handleRequests();
  }

  abstract handleRequests(): void;
}
