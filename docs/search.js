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
      f.properties.name?.toLowerCase().includes(q) ||
      f.properties.rename?.toLowerCase().includes(q)
    )
    .slice(0, 50)
    .forEach(f => {
      const div = document.createElement('div');
      div.className = 'search-item';

      div.innerHTML = `
        <div class="search-title">
          <span class="search-no">${f.properties.no}</span>
          <span class="search-name">${f.properties.name || ''}</span>
          ${f.properties.rename ? `
            <span class="search-rename">→ ${f.properties.rename}</span>
          ` : ''}
        </div>
      `;

      div.onclick = () => {
        map.flyTo({ center: f.geometry.coordinates, zoom: 12 });
        showPopup(f);
        results.innerHTML = '';
        input.blur();
      };

      results.appendChild(div);
    });
});

clearBtn.onclick = () => {
  input.value = '';
  results.innerHTML = '';
  clearBtn.style.display = 'none';
  input.focus();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && input.value) {
    input.value = '';
    results.innerHTML = '';
    clearBtn.style.display = 'none';
    input.blur();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  input.value = '';
  results.innerHTML = '';
  clearBtn.style.display = 'none';
});
