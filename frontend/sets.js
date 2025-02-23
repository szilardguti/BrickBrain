document.addEventListener("DOMContentLoaded", function () {
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const themeId = getQueryParam("theme_id");

  if (!themeId) window.location.href = "themes.html";

  fetch(`http://127.0.0.1:5000/api/sets?theme_id=${themeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) return response.json();
      else {
        return response.json().then((errorData) => {
          // no cookie found
          if (errorData.err_code && errorData.err_code == 401)
            window.location.href = "login.html";

          throw new Error(errorData.message || "An error occurred");
        });
      }
    })
    .then((data) => {
      const tableBody = document.querySelector("#setsTable tbody");
      tableBody.innerHTML = "";

      data.forEach((set) => {
        const row = document.createElement("tr");

        const imgCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = set.set_img_url;
        img.alt = set.name;
        img.style.width = "300px";
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const setNumCell = document.createElement("td");
        setNumCell.textContent = set.set_num;
        setNumCell.className = "fw-bold";
        row.appendChild(setNumCell);

        const nameCell = document.createElement("td");
        const nameLink = document.createElement("a");
        nameLink.href = set.set_url;
        nameLink.textContent = set.name;
        nameLink.target = "_blank";
        nameCell.appendChild(nameLink);
        row.appendChild(nameCell);

        const yearCell = document.createElement("td");
        yearCell.textContent = set.year;
        row.appendChild(yearCell);

        const partsCell = document.createElement("td");
        partsCell.textContent = set.num_parts;
        row.appendChild(partsCell);

        const buttonCell = document.createElement("td");
        const addButton = document.createElement("button");
        addButton.textContent = "Add Set";
        addButton.classList.add(
          "btn",
          "btn-yellow",
          "subtheme-btn",
          "btn-sm",
          "w-100"
        );

        addButton.addEventListener("click", () => {
          sessionStorage.setItem("set_name", set.name);
          sessionStorage.setItem("set_img", set.set_img_url);
          window.location.href = `addset.html?set_num=${set.set_num}`;
        });

        buttonCell.appendChild(addButton);
        row.appendChild(buttonCell);

        tableBody.appendChild(row);
      });
    })
    .then((_) => spinner.classList.add("hidden"))
    .catch((error) => {
      console.error("Error fetching the sets:", error);
    });
});
