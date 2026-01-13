console.log("points.js loaded");

let allPoints = [];

map.on('load', () => {

  fetch('famimaPeregrination.geojson')
    .then(res => res.json())
    .then(json => {
      window.allPoints = json.features || [];
      console.log("points loaded:", allPoints.length);
      allPoints = json.features || [];

      map.addSource('points', {
        type: 'geojson',
        data: json
      });

      // 外枠
      map.addLayer({
        id: 'points-circle-outline',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 12, 10, 16],
          'circle-color': '#ffffff'
        }
      });

      // 中身
      map.addLayer({
        id: 'points-circle-inner',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 14, 15, 18],
          'circle-color': '#1e8e3e'
        }
      });

      // 番号
      map.addLayer({
        id: 'points-number',
        type: 'symbol',
        source: 'points',
        layout: {
          'text-field': ['to-string', ['get', 'no']],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 13, 15, 15],
          'text-font': ['Open Sans Semibold'],
          'text-anchor': 'center',
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.3)',
          'text-halo-width': 1
        }
      });

      // ラベル
      map.addLayer({
        id: 'points-label',
        type: 'symbol',
        source: 'points',
        minzoom: 8,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-font': ['Open Sans Semibold'],
          'text-offset': [0, 1.6],
          'text-anchor': 'top',
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#202124',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });
    });
});

/* 共通ポップアップ */
window.showPopup = function(feature) {
  const title =
    feature.properties.rename?.trim()
      ? `${feature.properties.name}<br>${feature.properties.rename}`
      : feature.properties.name;

  new maplibregl.Popup({ offset: 12, maxWidth: '90vw' })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`
      <b>${feature.properties.no}</b><br>
      ${title}<br>
      ${feature.properties.address || ''}
    `)
    .addTo(map);
};

// クリック
map.on('click', 'points-number', e => showPopup(e.features[0]));
map.on('mouseenter', 'points-number', () => map.getCanvas().style.cursor = 'pointer');
map.on('mouseleave', 'points-number', () => map.getCanvas().style.cursor = '');
