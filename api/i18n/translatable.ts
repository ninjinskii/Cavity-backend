export interface Translatable {
  fullLocaleName: string;
  baseError: string; // Used when an error is truly unknown or when the error does not depend on the user.
  notFound: string;
  accountAlreadyExists: string;
  wrongAccount: string;
  wrongRegistrationCode: string;
  alreadyConfirmed: string;
  // accountResgistrationFailed: string
}

export class FrTranslations implements Translatable {
  fullLocaleName = "Français";
  baseError = "Une erreur est survenue.";
  notFound = "Objet non trouvé.";
  accountAlreadyExists = "Le compte existe déjà.";
  wrongAccount = "Ce compte n'existe pas.";
  wrongRegistrationCode = "Le code n'est pas bon.";
  alreadyConfirmed = "Ce compte est déjà confirmé.";
}

export class EnTranslations implements Translatable {
  fullLocaleName = "English";
  baseError = "An error occured.";
  notFound = "This object does not exists.";
  accountAlreadyExists = "Account already exists.";
  wrongAccount = "This account does not exists.";
  wrongRegistrationCode = "Wrong code.";
  alreadyConfirmed = "Account already confirmed";
}
