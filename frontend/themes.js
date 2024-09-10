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
        // Create a row for the main category
        const mainRow = document.createElement("tr");
        mainRow.className = "main-category";
        mainRow.dataset.id = mainCategory.id;
        mainRow.innerHTML = `<td>${mainCategory.id}</td><td>${mainCategory.name}</td><td><button class="view-sets-btn" data-theme-id="${mainCategory.id}">VIEW</button></td>`;
        tableBody.appendChild(mainRow);

        // Create rows for the sub-themes
        subThemes.forEach((subTheme) => {
          if (subTheme.parent_id === mainCategory.id) {
            const subRow = document.createElement("tr");
            subRow.className = `sub-theme sub-theme-${mainCategory.id}`;
            subRow.innerHTML = `<td>${subTheme.id}</td><td>${subTheme.name}</td><td><button class="view-sets-btn" data-theme-id="${subTheme.id}">VIEW</button></td>`;
            tableBody.appendChild(subRow);
          }
        });

        // Add click event to toggle visibility of sub-themes
        mainRow.addEventListener("click", function () {
          const subRows = document.querySelectorAll(
            `.sub-theme-${mainCategory.id}`
          );
          subRows.forEach((subRow) => {
            subRow.style.display =
              subRow.style.display === "table-row" ? "none" : "table-row";
          });
        });
      });
    })
    .then((_) => addButtonListeners())
    .then((_) => spinner.classList.add("disabled"))
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
}

function addButtonListeners() {
  const buttons = document.querySelectorAll(".view-sets-btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const themeId = this.getAttribute("data-theme-id");
      window.location.href = `sets.html?theme_id=${themeId}`;
    });
  });
}
