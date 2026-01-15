const listBtn   = document.getElementById('listBtn');
const listPanel = document.getElementById('listPanel');
const listBody  = document.getElementById('listBody');
const listClose = document.getElementById('listClose');

function buildList() {
  listBody.innerHTML = '';

  allPoints.forEach(f => {
    const div = document.createElement('div');
    div.className = 'list-item';

    div.innerHTML = `
      <div class="list-title">
        <span class="list-no">${f.properties.no}</span>
        <span class="list-name">${f.properties.name || ''}</span>
      </div>

      ${
        f.properties.rename
          ? `<div class="list-rename">${f.properties.rename}</div>`
          : ''
      }

      ${
        f.properties.address
          ? `<div class="list-address">${f.properties.address}</div>`
          : ''
      }
    `;

    div.onclick = () => {
      listPanel.style.display = 'none';
      map.flyTo({
        center: f.geometry.coordinates,
        zoom: 13
      });
      showPopup(f);
    };

    listBody.appendChild(div);
  });
}

listBtn.onclick = () => {
  buildList();
  listPanel.style.display = 'block';
};

listClose.onclick = () => {
  listPanel.style.display = 'none';
};
