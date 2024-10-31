import { type Translatable } from "../i18n/translatable.ts";
import Controller from "./controller.ts";

export default class ControllerManager {
  controllers: Array<Controller> = [];

  addControllers(...controllers: Array<Controller>): void {
    this.controllers.push(...controllers);
  }

  updateControllersTranslator($t: Translatable): void {
    this.controllers.forEach((controller) => {
      controller.$t = $t;
    });
  }
}
