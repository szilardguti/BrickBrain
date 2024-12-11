document.addEventListener("DOMContentLoaded", function () {
  spinner = document.getElementById("spinner");

  // Fetch owned sets from the backend API
  fetch("http://127.0.0.1:5000/api/owned", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for session
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
      const tableBody = document.querySelector("#ownedSetsTable tbody");
      tableBody.innerHTML = ""; // Clear table body before appending rows

      data.forEach((ownedSet) => {
        const row = document.createElement("tr");
        row.id = ownedSet.guid;

        const imgCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = ownedSet.set_img_url;
        img.alt = ownedSet.name;
        img.style.width = "300px";
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const setNumberCell = document.createElement("td");
        setNumberCell.textContent = ownedSet.set_number;
        row.appendChild(setNumberCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = ownedSet.name;
        row.appendChild(nameCell);

        const purchasePriceCell = document.createElement("td");
        purchasePriceCell.textContent = `$${ownedSet.purchase_price.toFixed(
          2
        )}`;
        row.appendChild(purchasePriceCell);

        const averagePriceCell = document.createElement("td");
        averagePriceCell.textContent = `$${ownedSet.average_price.toFixed(2)}`;
        row.appendChild(averagePriceCell);

        const halfYearAvgPriceCell = document.createElement("td");
        halfYearAvgPriceCell.textContent = `$${ownedSet.average_price_half_year.toFixed(
          2
        )}`;
        row.appendChild(halfYearAvgPriceCell);

        const overpricedCell = document.createElement("td");
        overpricedCell.textContent = ownedSet.overpriced ? "Yes" : "No";
        row.appendChild(overpricedCell);

        const missingPiecesCell = document.createElement("td");
        missingPiecesCell.textContent = ownedSet.missing_pieces.join(", ");
        row.appendChild(missingPiecesCell);

        const originCell = document.createElement("td");
        originCell.textContent = ownedSet.origin;
        row.appendChild(originCell);

        const hasManualCell = document.createElement("td");
        hasManualCell.textContent = ownedSet.has_manual ? "Yes" : "No";
        row.appendChild(hasManualCell);

        const hasBoxCell = document.createElement("td");
        hasBoxCell.textContent = ownedSet.has_box ? "Yes" : "No";
        row.appendChild(hasBoxCell);

        tableBody.appendChild(row); // Add row to table body
      });
    })
    .then((_) => spinner.classList.add("disabled"))
    .catch((error) => {
      console.error("Error fetching owned sets:", error);
    });
});
