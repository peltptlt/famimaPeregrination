let currentYear = 'all';
let currentPref = 'all';

const listBtn   = document.getElementById('listBtn');
const listPanel = document.getElementById('listPanel');
const listBody  = document.getElementById('listBody');
const listClose = document.getElementById('listClose');

function extractPref(address) {
  const m = address.match(/(北海道|.+?県|.+?府|.+?都)/);
  return m ? m[1] : '';
}

function buildList() {
  listBody.innerHTML = '';

  let filtered = allPoints;

  // 年フィルター
  if (currentYear !== 'all') {
    filtered = filtered.filter(f => String(f.properties.year) === currentYear);
  }

  // 都道府県フィルター
  if (currentPref !== 'all') {
    filtered = filtered.filter(f => {
      const addr = f.properties.address || '';
      return extractPref(addr) === currentPref;
    });
  }

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

// 都道府県セレクト変更イベント
document.getElementById('prefFilter').onchange = e => {
  currentPref = e.target.value === '' ? 'all' : e.target.value;
  buildList();
};

