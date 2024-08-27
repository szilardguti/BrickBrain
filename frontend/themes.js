document.addEventListener("DOMContentLoaded", function () {
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
        mainRow.innerHTML = `<td>${mainCategory.id}</td><td>${mainCategory.name}</td>`;
        tableBody.appendChild(mainRow);

        // Create rows for the sub-themes
        subThemes.forEach((subTheme) => {
          if (subTheme.parent_id === mainCategory.id) {
            const subRow = document.createElement("tr");
            subRow.className = `sub-theme sub-theme-${mainCategory.id}`;
            subRow.innerHTML = `<td>${subTheme.name}</td>`;
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
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
}

function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
