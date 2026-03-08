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

document.getElementById('locateBtn').onclick = () => {
  if (!navigator.geolocation) {
    alert("現在地取得がサポートされていません");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;

      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true
      });
    },
    err => {
      alert("現在地を取得できませんでした");
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
};
