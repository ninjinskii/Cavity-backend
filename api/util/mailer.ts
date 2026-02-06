import { ErrorReporter } from "../infrastructure/error-reporter.ts";

export default async function sendMail(
  to: string,
  subject: string,
  content: string,
  errorReporter: ErrorReporter,
  html = false,
) {
  const { SENDINBLUE_API_KEY } = Deno.env.toObject();

  const mail = {
    sender: {
      name: "Cavity",
      email: "cavity.app@gmail.com",
    },
    to: [{ email: to }],
    subject: subject,
    textContent: html ? undefined : content,
    htmlContent: html ? content : undefined,
  };

  const headers = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json",
    "api-key": SENDINBLUE_API_KEY,
  });

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers,
    body: JSON.stringify(mail),
  });

  if (response.status < 200 || response.status >= 300) {
    const errorResponse = await response.json();
    errorReporter.captureMessage(
      `Error occured while sending mail to ${to} with status code ${response.status} 
      and response is: ${JSON.stringify(errorResponse)}`,
    );
    throw new Error(JSON.stringify(errorResponse));
  } else {
    errorReporter.captureMessage(
      `Send mail to user ${to} with status code ${response.status}`,
    );
  }
}
