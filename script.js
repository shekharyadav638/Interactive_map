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
    .then((data) => generateSidebar(data.categories))
    .catch((error) => console.error("Error fetching data:", error));
}

function generateSidebar(categories) {
  const sidebar = document.getElementById("sidebar");
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategories = urlParams.get("categories")
    ? urlParams.get("categories").split(",")
    : [];

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

    // Add markers if the category is selected from the URL
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
      //create icon variable and set its height and width
      var icon = {
        url: "icon.svg",
        scaledSize: new google.maps.Size(50, 50),
      };

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lon },
        title: location.name,
        icon: icon,
      });

      marker.addListener("click", () => {
        infowindow.close();
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
              <div class="swiper-pagination"></div>
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

        google.maps.event.addListenerOnce(infowindow, "domready", () => {
          new Swiper(`#${swiperId}`, {
            loop: true,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
          });
        });

        map.panTo(marker.getPosition());
        setTimeout(() => {
          map.setZoom(13);
        }, 500);
      });

      allMarkers.push(marker);
      return marker;
    });
  }

  markers[category.name].forEach((marker) => marker.setMap(map));
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

document.addEventListener("click", (event) => {
  if (!event.target.closest(".gm-style")) {
    infowindow.close();
    map.setZoom(12);
  }
});

const hamburger = document.getElementById("toggler");
const sidebar = document.getElementById("sidebar");
const side = document.getElementById("side");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  hamburger.classList.toggle("active");
  side.classList.toggle("active");
});
