document.addEventListener("DOMContentLoaded", function () {
  spinner = document.getElementById("spinner");
  fetchThemes();
});

function fetchThemes() {
  fetch("http://127.0.0.1:5000/api/themes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const mainCategories = data.filter((theme) => theme.parent_id === null);
      const subThemes = data.filter((theme) => theme.parent_id !== null);

      const tableBody = document.querySelector("#themesTable tbody");

      mainCategories.forEach((mainCategory) => {
        const currentsubThemes = subThemes.filter(
          (theme) => theme.parent_id === mainCategory.id
        );

        // Create a row for the main category
        const mainRow = document.createElement("tr");
        mainRow.dataset.id = mainCategory.id;

        // Parts of the main row
        const mainID = document.createElement("td");
        mainID.innerText = mainCategory.id;
        mainRow.appendChild(mainID);

        const mainName = document.createElement("td");
        mainName.innerText = mainCategory.name;
        mainRow.appendChild(mainName);

        const mainSubthemeButtonCell = document.createElement("td");
        const mainSubthemeButton = document.createElement("button");
        mainSubthemeButton.type = "button";
        mainSubthemeButton.classList.add(
          "btn",
          "btn-yellow",
          "subtheme-btn",
          "btn-sm",
          "w-100"
        );
        mainSubthemeButton.dataset.theme_id = mainCategory.id;
        mainSubthemeButton.innerText = `Show Subtheme (${currentsubThemes.length})`;
        mainSubthemeButtonCell.appendChild(mainSubthemeButton);
        mainRow.appendChild(mainSubthemeButtonCell);

        if (currentsubThemes.length === 0) {
          mainSubthemeButton.classList.add("disabled");
        }

        const mainViewButtonCell = document.createElement("td");
        const mainViewButton = document.createElement("button");
        mainViewButton.type = "button";
        mainViewButton.classList.add(
          "btn",
          "btn-yellow",
          "view-sets-btn",
          "btn-sm",
          "w-100"
        );
        mainViewButton.dataset.theme_id = mainCategory.id;
        mainViewButton.innerText = "View";
        mainViewButtonCell.appendChild(mainViewButton);
        mainRow.appendChild(mainViewButtonCell);

        tableBody.appendChild(mainRow);

        const subTableRow = document.createElement("tr");
        subTableRow.id = `sub-${mainCategory.id}`;
        subTableRow.className = "hidden";

        const subCell = document.createElement("td");
        subCell.colSpan = 4;

        const subTable = document.createElement("table");
        subTable.classList.add(
          "table",
          "table-striped",
          "table-hover",
          "m-0",
          "w-100"
        );

        const subTableHead = document.createElement("thead");
        subTableHead.innerHTML = `<tr><th>ID</th><th>Subtheme Name</th><th>View sets</th></tr>`;
        subTable.appendChild(subTableHead);
        const subTableBody = document.createElement("tbody");

        // Create rows for the sub-themes
        currentsubThemes.forEach((subTheme) => {
          const subRow = document.createElement("tr");
          subRow.dataset.id = subTheme.id;

          const subID = document.createElement("td");
          subID.innerText = subTheme.id;
          subRow.appendChild(subID);

          const subName = document.createElement("td");
          subName.innerText = subTheme.name;
          subRow.appendChild(subName);

          const viewButtonCell = document.createElement("td");
          const viewButton = document.createElement("button");
          viewButton.type = "button";
          viewButton.classList.add(
            "btn",
            "btn-yellow",
            "view-sets-btn",
            "btn",
            "btn-sm",
            "w-100"
          );
          viewButton.dataset.theme_id = subTheme.id;
          viewButton.innerText = "View";
          viewButtonCell.appendChild(viewButton);
          subRow.appendChild(viewButtonCell);

          subTableBody.appendChild(subRow);
        });

        subTable.appendChild(subTableBody);
        subCell.appendChild(subTable);
        subTableRow.appendChild(subCell);
        tableBody.appendChild(subTableRow);
      });
    })
    .then((_) => addButtonListeners())
    .then((_) => spinner.classList.add("hidden"))
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
}

function addButtonListeners() {
  const viewButtons = document.querySelectorAll(".view-sets-btn");
  viewButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const themeId =
        event.currentTarget.parentNode.parentNode.getAttribute("data-id");
      window.location.href = `sets.html?theme_id=${themeId}`;
    });
  });

  const subthemeButtons = document.querySelectorAll(".subtheme-btn");
  subthemeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const themeId =
        event.currentTarget.parentNode.parentNode.getAttribute("data-id");

      const subthemeRow = document.getElementById(`sub-${themeId}`);
      if (subthemeRow.classList.contains("hidden")) {
        subthemeRow.classList.remove("hidden");
      } else {
        subthemeRow.classList.add("hidden");
      }
    });
  });
}
