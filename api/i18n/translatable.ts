export interface Translatable {
  fullLocaleName: string;
  baseError: string; // Used when an error is truly unknown or when the error does not depend on the user.
  notFound: string;
  accountAlreadyExists: string;
  wrongAccount: string;
  wrongRegistrationCode: string;
  alreadyConfirmed: string;
  emailSubject: string;
  emailContent: string;
  wrongCredentials: string;
  unauthorized: string;
  missingParameters: string;
  confirmAccount: string;
  invalidEmail: string;
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
  emailSubject = "Validation de votre compte Cavity";
  emailContent = "Voici le code de confirmation de votre compte: ";
  wrongCredentials = "Identifiants erronés.";
  unauthorized = "Session expirée.";
  missingParameters = "Paramètres manquants.";
  confirmAccount = "Confirmez votre compte avant de vous connecter.";
  invalidEmail = "Email non valide."
}

export class EnTranslations implements Translatable {
  fullLocaleName = "English";
  baseError = "An error occured.";
  notFound = "This object does not exists.";
  accountAlreadyExists = "Account already exists.";
  wrongAccount = "This account does not exists.";
  wrongRegistrationCode = "Wrong code.";
  alreadyConfirmed = "Account already confirmed";
  emailSubject = "Validate your Cavity account";
  emailContent = "Here is your account confirmation code: ";
  wrongCredentials = "Wrong credentials";
  unauthorized = "Session expired.";
  missingParameters = "Missing parameters.";
  confirmAccount = "Confirm your account creation before logging in.";
  invalidEmail = "Invalid email."
}
