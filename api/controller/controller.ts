import { Application } from "../../deps.ts";
import Repository from "../repository.ts";
import { Translatable } from "../i18n/translatable.ts";

export default abstract class Controller {
  app: Application;
  repository: Repository;
  translator: Translatable | null = null;
  abstract path: string;

  constructor(app: Application, repository: Repository) {
    this.app = app;
    this.repository = repository;
  }

  abstract handleRequests(): void;
}
