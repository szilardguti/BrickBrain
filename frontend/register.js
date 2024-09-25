document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const apikey = document.getElementById("apikey").value;

    fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ user: username, pw: password, ukey: apikey }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Unknown error occurred");
          });
        }
      })
      .then((data) => {
        // alert(data.message);

        // Redirect to the themes page
        window.location.href = "login.html";
      })
      .catch((error) => {
        document.getElementById("loginError").textContent = error.message;
      });
  });
