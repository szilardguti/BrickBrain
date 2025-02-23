document.addEventListener("DOMContentLoaded", function () {
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const setNumber = getQueryParam("set_num");
  if (!setNumber) {
    window.location.href = "themes.html";
  }

  document.getElementById("set_number").value = setNumber;

  const setName = sessionStorage.getItem("set_name");
  if (setName) {
    document.getElementById("name").value = setName;
    document.getElementById("set_img").alt = setName;
  }

  const setImgLink = sessionStorage.getItem("set_img");
  if (setImgLink) {
    document.getElementById("set_img").src = setImgLink;
  }

  document
    .getElementById("legoSetForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = {
        set_number: document.getElementById("set_number").value,
        name: document.getElementById("name").value,
        purchase_price: parseFloat(
          document.getElementById("purchase_price").value
        ),
        average_price: parseFloat(
          document.getElementById("average_price").value
        ),
        average_price_half_year: parseFloat(
          document.getElementById("average_price_half_year").value
        ),
        overpriced: document.getElementById("overpriced").checked,
        missing_pieces: document
          .getElementById("missing_pieces")
          .value.split(",")
          .map((item) => item.trim()),
        origin: document.getElementById("origin").value,
        has_manual: document.getElementById("has_manual").checked,
        has_box: document.getElementById("has_box").checked,
        set_img_url: setImgLink,
      };

      // Send POST request with JSON payload
      fetch("http://127.0.0.1:5000/api/owned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "mysets.html";
          } else {
            return response.json().then((errorData) => {
              // no cookie found
              if (errorData.err_code && errorData.err_code == 401)
                window.location.href = "login.html";

              throw new Error(errorData.message || "An error occurred");
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to submit data: " + error.message);
        });
    });
});
