export default async function sendMail(
  to: string,
  subject: string,
  content: string,
  html: boolean = false,
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
