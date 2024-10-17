let map; // Google map instance
let markers = {}; // Store markers by category

// Initialize the Google map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.7041, lng: 77.1025 }, // Centered on Delhi
    zoom: 10,
  });

  // Fetch categories and locations dynamically
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
