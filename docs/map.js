window.map = new maplibregl.Map({
  container: 'map',
  center: [135.7, 35.0],
  zoom: 6,
  style: {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256
      }
    },
    layers: [{
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }]
  }
});
window.addEventListener("load", () => {
  map.resize();
});
