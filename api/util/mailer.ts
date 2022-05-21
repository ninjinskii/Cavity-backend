import { Translatable } from "../i18n/translatable.ts";

export default async function sendConfirmationMail(
  to: string,
  registrationCode: number,
  $t: Translatable,
) {
  const { SENDINBLUE_API_KEY } = Deno.env.toObject();

  const mail = {
    sender: {
      name: "Cavity",
      email: "cavity.app@gmail.com",
    },
    to: [{ email: to }],
    subject: $t.emailSubject,
    textContent: $t.emailContent + registrationCode,
  };

  const headers = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json",
    "api-key": SENDINBLUE_API_KEY,
  });

  const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
    method: "POST",
    headers,
    body: JSON.stringify(mail),
  });

  if (response.status < 200 && response.status >= 300) {
    console.log(await response.json());
    throw new Error("Unable to send confirmation mail");
  }
}
