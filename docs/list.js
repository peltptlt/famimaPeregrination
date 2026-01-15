let currentYear = 'all';

const listBtn   = document.getElementById('listBtn');
const listPanel = document.getElementById('listPanel');
const listBody  = document.getElementById('listBody');
const listClose = document.getElementById('listClose');

function buildList() {
  listBody.innerHTML = '';

  const filtered = currentYear === 'all'
    ? allPoints
    : allPoints.filter(f => String(f.properties.year) === currentYear);

  filtered.forEach(f => {
    const div = document.createElement('div');
    div.className = 'list-item';

    div.innerHTML = `
      <div class="list-title">
        <span class="list-no">${f.properties.no}</span>
        <span class="list-name">${f.properties.name || ''}</span>
      </div>

      ${f.properties.rename ? `
        <div class="list-rename">${f.properties.rename}</div>
      ` : ''}

      ${f.properties.address ? `
        <div class="list-address">${f.properties.address}</div>
      ` : ''}
    `;

    div.onclick = () => {
      listPanel.classList.remove('open');
      map.flyTo({ center: f.geometry.coordinates, zoom: 13 });
      showPopup(f);
    };

    listBody.appendChild(div);
  });

}

document.querySelectorAll('.year-tabs button').forEach(btn => {
  btn.onclick = () => {
    currentYear = btn.dataset.year;

    document.querySelectorAll('.year-tabs button')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    buildList();
  };
});

listBtn.onclick = () => {
  buildList();
  listPanel.classList.add('open');
};

listClose.onclick = () => {
  listPanel.classList.remove('open');
};
