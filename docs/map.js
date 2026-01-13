console.log("map.js loaded");

window.map = new maplibregl.Map({
  container: 'map',
  center: [135.7, 35.0],
  zoom: 6,
  style: {
    version: 8,
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

map.on('load', () => {
  map.resize();
});
