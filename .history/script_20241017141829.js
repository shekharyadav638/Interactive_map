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

// Generate the sidebar dynamically with categories
function generateSidebar(categories) {
  const sidebar = document.getElementById("sidebar");
  categories.forEach((category) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" class="category" value="${category.name}">
      ${capitalize(category.name)}
    `;
    sidebar.appendChild(label);

    // Event listener for category checkbox
    label.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        addMarkers(category);
      } else {
        removeMarkers(category.name);
      }
    });
  });
}

// Add markers for the selected category
function addMarkers(category) {
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

// Remove markers for the unselected category
function removeMarkers(categoryName) {
  if (markers[categoryName]) {
    markers[categoryName].forEach((marker) => marker.setMap(null));
    delete markers[categoryName];
  }
}

// Show details in the right sidebar
function showDetails(location) {
  document.getElementById("location-title").innerText = location.name;
  document.getElementById("location-info").innerText = location.info;
  document.getElementById("location-image").src = location.image;

  // Show the right sidebar
  document.getElementById("details-sidebar").classList.add("active");
}

// Hide the right sidebar when clicking on the map
document.addEventListener("click", (event) => {
  if (!event.target.closest(".details-sidebar")) {
    document.getElementById("details-sidebar").classList.remove("active");
  }
});

// Helper function to capitalize text
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
