window.allPoints = [];

map.on('load', () => {
  fetch('famimaPeregrination.geojson')
    .then(res => res.json())
    .then(json => {
      allPoints = json.features || [];
      
      document.dispatchEvent(new Event('pointsLoaded'));
      
      map.addSource('points', {
        type: 'geojson',
        data: json
      });

      map.addLayer({
        id: 'points-circle-outline',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 12, 10, 16],
          'circle-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'points-circle-inner',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 14, 15, 18],
          'circle-color': '#1e8e3e'
        }
      });

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

      // クリック
      map.on('click', 'points-number', e => showPopup(e.features[0]));
      map.on('mouseenter', 'points-number', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'points-number', () => map.getCanvas().style.cursor = '');
    });
});

// 共通ポップアップ
window.showPopup = function(feature) {
  const title =
    feature.properties.rename?.trim()
      ? `${feature.properties.name}<br><span style="font-size:12px; color:#777;">${feature.properties.rename}</span>`
      : feature.properties.name;

  const address = feature.properties.address || "";
  const date = feature.properties.date || "";

  new maplibregl.Popup({ offset: 12, maxWidth: '90vw' })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`
      <div style="
        backdrop-filter: blur(10px);
        background:rgba(255,255,255,0.75);
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 6px 22px rgba(0,0,0,0.25);
        font-size:13px;
        line-height:1.45;
      ">
        <div style="
          background:linear-gradient(135deg, rgba(102,187,106,0.9), rgba(67,160,71,0.9));
          padding:10px 14px;
          color:#fff;
          font-size:15px;
          font-weight:700;
          text-shadow:0 1px 2px rgba(0,0,0,0.25);
        ">
          ${feature.properties.name}
        </div>

        <div style="padding:12px 14px;">
          <div style="color:#777; margin-bottom:4px; font-size:12px;">
            #${feature.properties.no}
          </div>

          <div style="color:#444; margin-bottom:4px;">
            ${address}
          </div>

          <div style="color:#1e88e5; font-weight:600; font-size:12px;">
            ${date}
          </div>
        </div>
      </div>
    `)
    .addTo(map);
};

