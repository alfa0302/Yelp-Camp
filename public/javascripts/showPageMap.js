const campgroundObject = JSON.parse(campground);
const [latitude, longitude] = campgroundObject.geometry.coordinates;
var map = L.map("map", {
  zoomControl: false,
}).setView([latitude, longitude], 10);
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker([latitude, longitude]).addTo(map);
marker.bindPopup(`<b>${campgroundObject.title}</b>`).openPopup();
map.invalidateSize();
