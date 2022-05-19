import { Application, Router } from "../../deps.ts"
import Repository from "../db/repository.ts";
import { EnTranslations, Translatable } from "../i18n/translatable.ts";

export default abstract class Controller {
  router: Router;
  repository: Repository;
  $t: Translatable = new EnTranslations();

  constructor(router: Router, repository: Repository) {
    this.router = router;
    this.repository = repository;

    this.handleRequests();
  }

  abstract handleRequests(): void;
}
