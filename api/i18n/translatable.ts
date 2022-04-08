export interface Translatable {
  fullLocaleName: string;
  baseError: string; // Used when an error is truly unknown or when the error does not depend on the user.
  notFound: string;
  // accountResgistrationFailed: string
}

export class FrTranslations implements Translatable {
  fullLocaleName = "Français";
  baseError = "Une erreur est survenue.";
  notFound = "Objet non trouvé.";
}

export class EnTranslations implements Translatable {
  fullLocaleName = "English";
  baseError = "An error occured.";
  notFound = "This object does not exists.";
}
