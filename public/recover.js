function checkPassword() {
  const pwdEl = document.getElementById("pwd");
  const pwdConfEl = document.getElementById("pwdconf");
  const pwd = pwdEl.value;
  const pwdConf = pwdConfEl.value;
  return pwd === pwdConf;
}

function submit() {
  const pwdEl = document.getElementById("pwd");
  const alert = document.getElementById("alert");

  if (checkPassword()) {
    const password = pwdEl.value;
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    });

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const token = params.get("token");
    const body = { token, password };

    fetch(`${window.location.origin}/account/resetpassword`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    })
      .then((response) => {
        if (!response.ok) {
          alert.style.display = "block";
          response.body
            .getReader()
            .read()
            .then((bytes) => {
              const message = JSON.parse(
                String.fromCharCode(...bytes.value)
              ).message;

              alert.innerHTML = decodeURIComponent(escape(message));
            });
        } else {
          alert.style.display = "block";
          alert.innerHTML = "Mot de passe mis à jour.";
        }
      })
      .catch(() => {
        alert.style.display = "block";
        alert.innerHTML = "Une erreur est survenue.";
      });
  } else {
    alert.style.display = "block";
    alert.innerHTML = "Les mots de passe ne correspondent pas.";
  }
}
