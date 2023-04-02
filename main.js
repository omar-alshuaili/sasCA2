// Client-side JavaScript code
const getCsrfToken = () => {
  const tokenMatch = document.cookie.match(/_csrf=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};
const passwordInput = document.getElementById("password");
const errorSpan = document.getElementById("error-message");
errorSpan.classList.add("error-message");

passwordInput.addEventListener("input", () => {
  errorSpan.textContent = ""; // Clear any previous error messages
});

const form = document.getElementById("login-form");

form.addEventListener("submit", (event) => {
  errorSpan.textContent = "";
  event.preventDefault();
  const formData = new FormData(event.target);

  const email = formData.get("email");
  const password = formData.get("password");

  fetch("/login", {
    headers: {
      "Content-Type": "application/json",
      // "XSRF-TOKEN": document.cookie
      //   .split("; ")
      //   .find((row) => row.startsWith("XSRF-TOKEN="))
      //   .split("=")[1],
    },
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) {
        return res.text().then((text) => {
          errorSpan.textContent = text
        });
      } else {
        window.location.href = "/orders";
        console.log(res.json());
      }
    })
    .catch((err) => {
      errorSpan.textContent = err.message;
    });
});
