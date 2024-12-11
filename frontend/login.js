document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ user: username, pw: password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An error occurred");
          });
        }
      })
      .then((data) => {
        window.location.href = "themes.html";
      })
      .catch((error) => {
        document.getElementById("loginError").textContent = error.message;
      });
  });
