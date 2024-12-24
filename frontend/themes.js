document.addEventListener("DOMContentLoaded", function () {
  const spinner = document.getElementById("spinner");
  fetchThemes();

  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  searchButton.addEventListener("click", searchThemes);
});

function searchThemes(event) {
  const searchValue = searchInput.value;
  const storedData = JSON.parse(sessionStorage.getItem("themes"));

  const searchResults = storedData.filter((theme) =>
    theme.name.toLowerCase().includes(searchValue)
  );

  // Add parent themes if only subtheme fits the search, important for correct display
  searchResults.forEach((theme) => {
    console.log(theme);
    const parentThemes = findParentThemes(theme, searchResults, storedData);
    if (parentThemes !== null) searchResults.push(...parentThemes);
  });

  showThemes(searchResults);
}

function findParentThemes(theme, searchResults, data) {
  const extendResults = [];
  if (
    theme.parent_id !== null &&
    searchResults.find((ft) => ft.id === theme.parent_id) === undefined
  ) {
    const parentTheme = data.find((ft) => ft.id === theme.parent_id);
    console.log(parentTheme);

    searchResults.push(parentTheme);
    extendResults.push(parentTheme);

    if (parentTheme.parent_id !== null) {
      const foundParentThemes = findParentThemes(
        parentTheme,
        searchResults,
        data
      );
      extendResults.push(...foundParentThemes);
    }

    return extendResults;
  }
  return null;
}

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
      sessionStorage.setItem("themes", JSON.stringify(data));
      showThemes(data);
    })
    .then((_) => spinner.classList.add("hidden"))
    .catch((error) => {
      console.error("Error fetching themes:", error);
    });
}

function showThemes(data) {
  const tableBody = document.querySelector("#themesTable tbody");
  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    const noTableRow = document.createElement("tr");
    const noCell = document.createElement("td");
    noCell.className = "text-center";
    noCell.colSpan = 4;
    noCell.innerHTML = "No data found!";

    noTableRow.appendChild(noCell);
    tableBody.appendChild(noTableRow);
    return;
  }

  data.forEach((theme) => {
    createRow(theme, data, tableBody);
  });

  addButtonListeners();
}

function findRow(themeId) {
  return document.getElementById(themeId);
}

function createRow(theme, data, parent) {
  if (findRow(theme.id) !== null) return;

  const subthemes = data.filter((ct) => ct.parent_id === theme.id);

  if (theme.parent_id !== null) {
    const parentRow = findRow(`sub-${theme.parent_id}`);

    if (parentRow === null) {
      parent = createRow(
        data.find((pt) => pt.id === theme.parent_id),
        data,
        parent
      );
    } else {
      parent = parentRow.children[0].children[0].children[1]; //td table tbody;
    }
  }

  const mainRow = document.createElement("tr");
  mainRow.id = theme.id;

  // Parts of the main row
  const mainID = document.createElement("td");
  mainID.innerText = theme.id;
  mainRow.appendChild(mainID);

  const mainName = document.createElement("td");
  mainName.innerText = theme.name;
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
  mainSubthemeButton.dataset.theme_id = theme.id;
  mainSubthemeButton.innerText = `Show Subtheme (${subthemes.length})`;
  mainSubthemeButtonCell.appendChild(mainSubthemeButton);
  mainRow.appendChild(mainSubthemeButtonCell);

  if (subthemes.length === 0) {
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
  mainViewButton.dataset.theme_id = theme.id;
  mainViewButton.innerText = "View";
  mainViewButtonCell.appendChild(mainViewButton);
  mainRow.appendChild(mainViewButtonCell);

  parent.appendChild(mainRow);

  if (subthemes.length > 0) {
    return createSubTable(theme.id, parent);
  }

  return null;
}

function createSubTable(mainCategoryId, parent) {
  if (findRow(`sub-${mainCategoryId}`) !== null) return;

  const subTableRow = document.createElement("tr");
  subTableRow.id = `sub-${mainCategoryId}`;
  subTableRow.className = "hidden";

  const subCell = document.createElement("td");
  subCell.colSpan = 4;

  const subTable = document.createElement("table");
  subTable.classList.add(
    "table",
    "table-hover",
    "m-0",
    "w-100",
    "border",
    "border-dark"
  );

  const subTableHead = document.createElement("thead");
  subTableHead.innerHTML = `<tr><th>ID</th><th>Subtheme Name</th><th>Show Subthemes</th><th>View sets</th></tr>`;
  subTableHead.className = "table-dark";
  subTable.appendChild(subTableHead);

  const subTableBody = document.createElement("tbody");
  subTable.appendChild(subTableBody);

  subCell.appendChild(subTable);
  subTableRow.appendChild(subCell);

  parent.appendChild(subTableRow);

  return subTableBody;
}

function addButtonListeners() {
  const viewButtons = document.querySelectorAll(".view-sets-btn");
  viewButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const themeId = event.currentTarget.parentNode.parentNode.id;
      window.location.href = `sets.html?theme_id=${themeId}`;
    });
  });

  const subthemeButtons = document.querySelectorAll(".subtheme-btn");
  subthemeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const themeId = event.currentTarget.parentNode.parentNode.id;

      const subthemeRow = document.getElementById(`sub-${themeId}`);
      if (subthemeRow.classList.contains("hidden")) {
        subthemeRow.classList.remove("hidden");
      } else {
        subthemeRow.classList.add("hidden");
      }
    });
  });
}
