//load the google map and centre it to delhi
function initMap() {
  var delhi = { lat: 28.7041, lng: 77.1025 };
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: delhi,
  });
  var marker = new google.maps.Marker({
    position: delhi,
    map: map,
  });
}
