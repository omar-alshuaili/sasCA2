// Client-side JavaScript code
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
  console.log(window.location.pathname);

  fetch("/login", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      } else {
        // orders = res
        window.location.href = "/orders";
        console.log(res.json());
      }
    })
    .catch((err) => {
      errorSpan.textContent = err;
    });
});

const signUpForm = document.getElementById("signup-form");

signUpForm.addEventListener("submit", (event) => {
  errorSpan.textContent = "";
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData);
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  console.log(window.location.pathname);

  fetch("/signup", {
    headers: {
      "Content-Type": "application/json",
    },
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
    .catch((err) => {
      errorSpan.textContent = err;
    });
});

function performSearch() {
  const searchBar = document.getElementById("searchBar");
  const searchResults = document.getElementById("searchResults");
  const input = searchBar.value;

  // Simulate search results
  const resultHTML = `<p>Search results for: ${input}</p>`;

  // Display the search results (vulnerable to XSS)
  searchResults.innerHTML = resultHTML;
}
