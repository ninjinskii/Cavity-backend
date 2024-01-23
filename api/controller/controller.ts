import { Router } from "../../deps.ts";
import { EnTranslations, Translatable } from "../i18n/translatable.ts";

export default abstract class Controller {
  $t: Translatable = new EnTranslations();

  constructor(protected router: Router) {
  }

  abstract handleRequests(): void;
}
