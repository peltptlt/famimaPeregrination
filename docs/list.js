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
      <b>${f.properties.no}</b>
      ${f.properties.name || ''}
      ${feature.properties.name}<br>${feature.properties.rename}
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
