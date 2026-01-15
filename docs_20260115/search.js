const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const clearBtn = document.getElementById('clearBtn');

input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase();
  results.innerHTML = '';
  clearBtn.style.display = q ? 'block' : 'none';
  if (!q) return;

  allPoints
    .filter(f =>
      String(f.properties.no).includes(q) ||
      f.properties.name?.toLowerCase().includes(q)
    )
    .slice(0, 50)
    .forEach(f => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.textContent = `${f.properties.no} ${f.properties.name || ''}`;

      div.onclick = () => {
        map.flyTo({ center: f.geometry.coordinates, zoom: 12 });
        showPopup(f);
        results.innerHTML = '';
        input.blur();
      };

      results.appendChild(div);
    });
});

