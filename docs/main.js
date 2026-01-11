const map = new maplibregl.Map({
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

map.on('load', () => {

  let allPoints = [];

  fetch('famimaPeregrination.geojson')
    .then(r => r.json())
    .then(j => allPoints = j.features || []);

  function showPopup(feature) {
    const title =
      feature.properties.rename
        ? `${feature.properties.name}<br>${feature.properties.rename}`
        : (feature.properties.name || '');

    new maplibregl.Popup({ offset: 12 })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(`
        <b>${feature.properties.no}</b><br>
        ${title}<br>
        ${feature.properties.address || ''}
      `)
      .addTo(map);
  }

  /* --- 以下、今のレイヤ・検索処理をそのまま --- */
});
