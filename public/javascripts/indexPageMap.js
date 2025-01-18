const camps = JSON.parse(campgrounds);
var map = L.map("map", {
  zoomControl: false,
});
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);
var markers = L.markerClusterGroup();
camps.forEach((camp) => {
  const [latitude, longitude] = camp.geometry.coordinates;
  var popupContent = `
    <strong>${camp.title}</strong><br>
    <a href="/campgrounds/${camp._id}" target="">View Campsite</a>
  `;
  var marker = L.marker([latitude, longitude]).bindPopup(popupContent);
  markers.addLayer(marker);
});
map.addLayer(markers);
map.fitBounds(markers.getBounds());
