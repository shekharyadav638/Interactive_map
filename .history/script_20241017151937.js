let map;
let markers = {};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.7041, lng: 77.1025 },
    zoom: 10,
  });

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => generateSidebar(data.categories))
    .catch((error) => console.error("Error fetching data:", error));
}

function generateSidebar(categories) {
  const sidebar = document.getElementById("sidebar");
  const selectAllLabel = document.createElement("label");
  selectAllLabel.innerHTML = `
    <input type="checkbox" id="select-all" checked>
    Select All
  `;
  sidebar.appendChild(selectAllLabel);

  const selectAllCheckbox = document.getElementById("select-all");
  selectAllCheckbox.addEventListener("change", (e) => {
    const checked = e.target.checked;
    document.querySelectorAll(".category").forEach((checkbox) => {
      checkbox.checked = checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });

  categories.forEach((category) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" class="category" value="${category.name}" checked>
      ${capitalize(category.name)}
    `;
    sidebar.appendChild(label);

    const checkbox = label.querySelector("input");

    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        addMarkers(category);
      } else {
        removeMarkers(category.name);
      }
      updateSelectAllState();
    });
    addMarkers(category);
  });
}

function updateSelectAllState() {
  const allChecked = Array.from(document.querySelectorAll(".category")).every(
    (checkbox) => checkbox.checked
  );
  document.getElementById("select-all").checked = allChecked;
}

function addMarkers(category) {
  if (!markers[category.name]) {
    markers[category.name] = category.locations.map((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lon },
        map: map,
        title: location.name,
      });

      marker.addListener("click", () => showDetails(location));
      return marker;
    });
  }
}

function removeMarkers(categoryName) {
  if (markers[categoryName]) {
    markers[categoryName].forEach((marker) => marker.setMap(null));
    delete markers[categoryName];
  }
}

function showDetails(location) {
  document.getElementById("details-sidebar").classList.add("active");
  document.getElementById("location-title").innerText = location.name;
  document.getElementById("location-info").innerText = location.info;
  document.getElementById("location-image").src = location.image;
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".details-sidebar")) {
    document.getElementById("details-sidebar").classList.remove("active");
  }
});

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
