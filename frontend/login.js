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
      body: JSON.stringify({ user: username, ukey: password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Login failed.");
        }
      })
      .then((data) => {
        // alert(data.message);

        // Redirect to the themes page
        window.location.href = "themes.html";
      })
      .catch((error) => {
        document.getElementById("loginError").textContent = error.message;
      });
  });
