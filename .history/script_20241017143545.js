let map;
let markers = {};

// Initialize Google Map
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

// Generate Sidebar with Categories and "Select All" checkbox
function generateSidebar(categories) {
  const sidebar = document.getElementById("sidebar");

  // Create "Select All" checkbox
  const selectAllLabel = document.createElement("label");
  selectAllLabel.innerHTML = `
    <input type="checkbox" id="select-all" checked>
    Select All
  `;
  sidebar.appendChild(selectAllLabel);

  // Event listener for "Select All"
  document.getElementById("select-all").addEventListener("change", (e) => {
    const checked = e.target.checked;
    document.querySelectorAll(".category").forEach((checkbox) => {
      checkbox.checked = checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });

  // Create category checkboxes
  categories.forEach((category) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" class="category" value="${category.name}" checked>
      ${capitalize(category.name)}
    `;
    sidebar.appendChild(label);

    // Add event listener to each category checkbox
    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        addMarkers(category);
      } else {
        removeMarkers(category.name);
      }
    });

    // Add markers initially since all are checked by default
    addMarkers(category);
  });
}

// Add Markers for a Selected Category
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

// Remove Markers for an Unselected Category
function removeMarkers(categoryName) {
  if (markers[categoryName]) {
    markers[categoryName].forEach((marker) => marker.setMap(null));
    delete markers[categoryName];
  }
}

// Show Details in the Right Sidebar
function showDetails(location) {
  document.getElementById("location-title").innerText = location.name;
  document.getElementById("location-info").innerText = location.info;
  document.getElementById("location-image").src = location.image;

  // Show the right sidebar
  document.getElementById("details-sidebar").classList.add("active");
}

// Hide the Right Sidebar when Clicking Outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".details-sidebar")) {
    document.getElementById("details-sidebar").classList.remove("active");
  }
});

// Helper function to Capitalize Text
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
