const getCsrfToken = () => {
  const tokenMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
}

let email = document.getElementById("email-current");

fetch("/account", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-XSRF-TOKEN": getCsrfToken(),
  },
  credentials: "same-origin",
})
  .then((res) => {
    if (res.status === 403) {
      return res.json().then((json) => {
        if (json.redirect) {
          window.location.href = json.redirect;
        }
      });
    }

    if (!res.ok) {
      return res.text().then((text) => {
        console.log(text);
        text = JSON.parse(text);
      });
    } else {
      return res.json();
    }
  })
  .then((data) => {
    if (data) {
      console.log(data);
      email.value = data.username;
    }
  })
  .catch((err) => {
    console.log(1);
  });

let update_email_form = document.getElementById("update-email-form");
const successMessage = document.getElementById("success-message");

// Display the success message if it's in sessionStorage
document.addEventListener("DOMContentLoaded", () => {
  const storedMessage = sessionStorage.getItem("successMessage");
  if (storedMessage) {
    successMessage.textContent = storedMessage;
    sessionStorage.removeItem("successMessage");
  }
});

update_email_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  const emailInput = event.target.elements.email;
  const email = formData.get("email");

  fetch("/change-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "X-XSRF-TOKEN": getCsrfToken(),
    },
    body: JSON.stringify({ email: email }),
    credentials: "same-origin",
  })
    .then((res) => {
      if (res.status === 404) {
        return res.json().then((json) => {
          if (json.redirect) {
            window.location.href = json.redirect;
          }
        });
      }

      if (!res.ok) {
        return res.text().then((text) => {
          console.log(text);
        });
      } else {
        return res.json();
      }
    })
    .then((data) => {
      if (data) {
        console.log(data);
        emailInput.value = email; // Update the email input field with the new email
        sessionStorage.setItem("successMessage", "Email updated successfully");
        window.location.reload(); // Refresh the page to show the changes
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
