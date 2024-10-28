let map;
let markers = {};
let allMarkers = [];
let markerCluster;
let infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 28.619962, lng: 77.251035 },
    zoom: 12,
  });
  infowindow = new google.maps.InfoWindow();

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      generateSidebar(data.categories);
      reopenInfowindowFromUrl(data.categories);
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function reopenInfowindowFromUrl(categories) {
  const urlParams = new URLSearchParams(window.location.search);
  const markerName = urlParams.get("marker");

  if (markerName) {
    for (const category of categories) {
      const marker = markers[category.name]?.find(
        (m) => m.getTitle() === markerName
      );
      if (marker) {
        google.maps.event.trigger(marker, "click");
        break;
      }
    }
  }
}

function generateSidebar(categories) {
  const sidebar = document.getElementById("sidebar");
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategories = urlParams.get("categories")
    ? urlParams.get("categories").split(",")
    : [];

  // Select All Checkbox
  const selectAllLabel = document.createElement("label");
  selectAllLabel.innerHTML = `
    <input type="checkbox" id="select-all" ${
      selectedCategories.length === categories.length ? "checked" : ""
    }>
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
      <input type="checkbox" class="category" value="${category.name}" ${
      selectedCategories.includes(category.name) ? "checked" : ""
    }>
      ${category.name}
    `;
    sidebar.appendChild(label);
    const checkbox = label.querySelector("input");

    checkbox.addEventListener("change", (e) => {
      const selectedCategories = Array.from(
        document.querySelectorAll(".category:checked")
      ).map((checkbox) => checkbox.value);
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      } else {
        params.delete("categories");
      }
      window.history.replaceState({}, "", `${location.pathname}?${params}`);

      if (e.target.checked) {
        addMarkers(category);
      } else {
        removeMarkers(category.name);
      }
      updateSelectAllState();
      updateMarkerCluster();
    });

    if (selectedCategories.includes(category.name)) {
      addMarkers(category);
    }
  });

  updateMarkerCluster();
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
      const categoryIcons = {
        Shopping: "shopping.png",
        Attractions: "attractions.jpeg",
        Food: "food.png",
        Parks: "parks.png",
        OSL: "osl.png",
      };

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lon },
        title: location.name,
        icon: {
          url: categoryIcons[category.name],
          scaledSize: new google.maps.Size(50, 50),
        },
      });

      marker.addListener("click", () => {
        openInfowindow(marker, location);
      });

      allMarkers.push(marker);
      return marker;
    });
  }

  markers[category.name].forEach((marker) => marker.setMap(map));
}

function openInfowindow(marker, location) {
  infowindow.close(); // Close previous infowindow

  const swiperId = `swiper-${location.name.replace(/\s+/g, "-")}`;
  const swiperHTML = `
    <div style="width: 250px; overflow: hidden;">
      <div class="swiper-container" id="${swiperId}">
        <div class="swiper-wrapper">
          ${location.images
            .map(
              (src) => `
                <div class="swiper-slide">
                  <img src="${src}" style="width: 100%; height: 150px; object-fit: cover;" />
                </div>
              `
            )
            .join("")}
        </div>
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
      </div>
      <h1>${location.name}</h1>
      <p>${location.info}</p>
    </div>
  `;

  infowindow.setContent(swiperHTML);
  infowindow.open({
    anchor: marker,
    map,
  });

  // Update the URL with the marker's name
  const params = new URLSearchParams(window.location.search);
  params.set("marker", marker.getTitle());
  const newUrl = `${window.location.origin}${window.location.pathname}?${params}`;
  window.history.replaceState({}, "", newUrl);

  google.maps.event.addListenerOnce(infowindow, "domready", () => {
    new Swiper(`#${swiperId}`, {
      loop: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  });

  google.maps.event.addListener(map, "click", () => {
    infowindow.close();
    map.setZoom(12);
  });

  map.panTo(marker.getPosition());
  setTimeout(() => map.setZoom(13), 500);
}

function removeMarkers(categoryName) {
  if (markers[categoryName]) {
    markers[categoryName].forEach((marker) => {
      marker.setMap(null);
      const index = allMarkers.indexOf(marker);
      if (index > -1) allMarkers.splice(index, 1);
    });
    delete markers[categoryName];
  }
}

function updateMarkerCluster() {
  if (markerCluster) {
    markerCluster.clearMarkers();
  }
  markerCluster = new markerClusterer.MarkerClusterer({
    map: map,
    markers: allMarkers,
  });
}

// Close the infowindow and clear the marker from the URL
document.addEventListener("click", (event) => {
  if (!event.target.closest(".gm-style")) {
    infowindow.close();
    map.setZoom(12);

    const params = new URLSearchParams(window.location.search);
    params.delete("marker");
    const newUrl = `${window.location.origin}${window.location.pathname}?${params}`;
    window.history.replaceState({}, "", newUrl);
  }
});

const hamburger = document.getElementById("toggler");
const sidebar = document.getElementById("sidebar");
const side = document.getElementById("side");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  side.classList.toggle("active");
});
