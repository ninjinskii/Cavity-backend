import { Translatable } from "../i18n/translatable.ts";
import Controller from "./controller.ts";

export default class ControllerManager {
  controllers: Array<Controller> = [];

  addControllers(...controllers: Array<Controller>): void {
    controllers.push(...controllers);
  }

  updateControllersTranslator(translator: Translatable): void {
    this.controllers.forEach((controller) => {
      controller.translator = translator;
    });
  }
}
