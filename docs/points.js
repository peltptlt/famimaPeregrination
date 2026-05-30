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
  const name = feature.properties.name || "";
  const rename = feature.properties.rename?.trim() || "";
  const address = feature.properties.address || "";
  const date = feature.properties.date || "";
  const no = feature.properties.no;

  new maplibregl.Popup({ offset: 12, maxWidth: '90vw' })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`
      <div style="
        background:#fff;
        border-radius:14px;
        border:1.5px solid #dcdcdc;
        box-shadow:0 4px 16px rgba(0,0,0,0.18);
        font-size:13px;
        line-height:1.45;
        overflow:hidden;
      ">

        <!-- name 主役 -->
        <div style="
          background:linear-gradient(135deg, #66bb6a, #43a047);
          padding:8px 12px;
          color:#fff;
          font-size:15px;
          font-weight:700;
          letter-spacing:0.4px;
          text-shadow:0 1px 2px rgba(0,0,0,0.25);
        ">
          ${name}
          ${rename ? `<div style="font-size:11px; opacity:0.85;">${rename}</div>` : ""}
        </div>

        <div style="padding:10px 12px;">

          <!-- no + date 左寄せで統一 -->
          <div style="
            display:flex;
            gap:12px;
            color:#777;
            font-size:11px;
            margin-bottom:6px;
          ">
            <span>#${no}</span>
            <span style="color:#1e88e5;">${date}</span>
          </div>

          <div style="color:#666; font-size:12px;">
            ${address}
          </div>

        </div>
      </div>
    `)
    .addTo(map);
};

