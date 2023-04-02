const getCsrfToken = () => {
  const tokenMatch = document.cookie.match(/_csrf=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};
console.log(getCsrfToken());
const signUpForm = document.getElementById("signup-form");
signUpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData);
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  fetch("/signup", {
    headers: {
      "Content-Type": "application/json",
      _csrf: getCsrfToken(),
    },
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify({ email: email, password: password, name: name }),
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      } else {
        window.location.href = "/login";
        console.log(res.json());
      }
    })
    .catch((err) => {});
});
