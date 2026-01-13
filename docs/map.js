map.remove();

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [139.7, 35.6],
  zoom: 5
});

window.addEventListener("load", () => {
  map.resize();
});
