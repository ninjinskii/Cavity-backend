export interface Translatable {
  fullLocaleName: string;
  baseError: string; // Used when an error is truly unknown or when the error does not depend on the user.
  notFound: string;
  accountAlreadyExists: string;
  wrongAccount: string;
  wrongRegistrationCode: string;
  alreadyConfirmed: string;
  emailSubject: string;
  emailSubjectRecover: string;
  emailContent: string;
  emailContentRecover: string;
  wrongCredentials: string;
  unauthorized: string;
  unauthorizedReset: string;
  missingParameters: string;
  confirmAccount: string;
  invalidEmail: string;
  weakPassword: string;
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
  emailSubjectRecover = "Récupération du mot de passe de votre compte Cavity";
  emailContent = "Voici le code de confirmation de votre compte: ";
  emailContentRecover = `Cliquez sur ce lien pour réinitialiser votre mot de passe: `;
  wrongCredentials = "Identifiants erronés.";
  unauthorized = "Session expirée.";
  unauthorizedReset = "Impossible de vérifier le jeton de réinitialisation. Veuillez réouvrir le lien de réinitialisation qui vous a été transmis.";
  missingParameters = "Paramètres manquants.";
  confirmAccount = "Confirmez votre compte avant de vous connecter.";
  invalidEmail = "Email non valide.";
  weakPassword = "Mot de passe trop faible.";
}

export class EnTranslations implements Translatable {
  fullLocaleName = "English";
  baseError = "An error occured.";
  notFound = "This object does not exists.";
  accountAlreadyExists = "Account already exists.";
  wrongAccount = "This account does not exists.";
  wrongRegistrationCode = "Wrong code.";
  alreadyConfirmed = "Account already confirmed.";
  emailSubject = "Validate your Cavity account";
  emailSubjectRecover = "Password recover for your Cavity account";
  emailContent = "Here is your account confirmation code: ";
  emailContentRecover = `Follow this link to reset your password: `;
  wrongCredentials = "Wrong credentials.";
  unauthorized = "Session expired.";
    unauthorizedReset = "Impossible de vérifier le jeton de réinitialisation. Veuillez réouvrir le lien de réinitialisation qui vous a été transmis.";
  missingParameters = "Missing parameters.";
  confirmAccount = "Confirm your account creation before logging in.";
  invalidEmail = "Invalid email.";
  weakPassword = "Password is too weak.";
}
