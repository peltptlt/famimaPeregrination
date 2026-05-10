let currentYear = 'all';
let currentPref = 'all';

const listBtn    = document.getElementById('listBtn');
const listPanel  = document.getElementById('listPanel');
const listBody   = document.getElementById('listBody');
const listClose  = document.getElementById('listClose');
const aboutBtn   = document.getElementById('aboutBtn');
const aboutPanel = document.getElementById('aboutPanel');
const aboutClose = document.getElementById('aboutClose');
const aboutBody  = document.getElementById('aboutBody');
const prefSelect = document.getElementById('prefFilter');
const citySelect = document.getElementById('cityFilter');


// --------------------------------------
// ① 件数集計
// --------------------------------------
const prefCounts = {};
const cityCounts = {};

allPoints.forEach(f => {
  const p = f.properties.pref;
  const c = f.properties.city;

  prefCounts[p] = (prefCounts[p] || 0) + 1;
  cityCounts[c] = (cityCounts[c] || 0) + 1;
});


// --------------------------------------
// ② 最大文字数（揃え用）
// --------------------------------------
const maxPrefLen = Math.max(...Object.keys(prefCounts).map(p => p.length));
const maxCityLen = Math.max(...Object.keys(cityCounts).map(c => c.length));

function padZenkaku(str, width) {
  const padCount = width - str.length;
  return str + "　".repeat(padCount > 0 ? padCount : 0);
}


// --------------------------------------
// ③ 都道府県フィルター生成（pref は必ず 1 件以上ある前提）
// --------------------------------------
Object.keys(prefOrder)
  .sort((a, b) => prefOrder[a] - prefOrder[b])
  .forEach(pref => {
    // prefCounts に存在しない都道府県はスキップ（念のため）
    if (!prefCounts[pref]) return;

    const opt = document.createElement('option');
    opt.value = pref;

    const count = prefCounts[pref];
    const padded = padZenkaku(pref, maxPrefLen);

    opt.textContent = `${padded}（${count}）`;
    prefSelect.appendChild(opt);
  });


// --------------------------------------
// ④ リスト展開
// --------------------------------------
listBtn.onclick = () => {
  const listOpen = listPanel.classList.contains('open');
  const aboutOpen = aboutPanel.classList.contains('open');

  if (listOpen || aboutOpen) {
    listPanel.classList.remove('open');
    aboutPanel.classList.remove('open');
    document.body.classList.remove('list-open');
    document.body.classList.remove('about-open');
    return;
  }

  buildList();
  listPanel.classList.add('open');
  document.body.classList.add('list-open');
};

listClose.onclick = () => {
  listPanel.classList.remove('open');
  document.body.classList.remove('list-open');
};


// --------------------------------------
// ⑤ about
// --------------------------------------
aboutBtn.onclick = () => {
  fetch('about.html')
    .then(res => res.text())
    .then(html => {
      aboutBody.innerHTML = html;
      aboutPanel.classList.add('open');
    });
};

aboutClose.onclick = () => {
  aboutPanel.classList.remove('open');
};


// --------------------------------------
// ⑥ リスト本体
// --------------------------------------
function buildList() {
  listBody.innerHTML = '';

  let filtered = allPoints;

  if (currentYear !== 'all') {
    filtered = filtered.filter(f => {
      const d = f.properties.date || "";
      return d.slice(0, 4) === currentYear;
    });
  }

  if (currentPref !== 'all') {
    filtered = filtered.filter(f => f.properties.pref === currentPref);
  }

  if (citySelect.value !== "") {
    filtered = filtered.filter(f => f.properties.city === citySelect.value);
  }

  filtered.forEach(f => {
    const div = document.createElement('div');
    div.className = 'list-item';

    div.innerHTML = `
      <div class="list-title">
        <span class="list-no">${f.properties.no}</span>
        <span class="list-name">${f.properties.name || ''}</span>
      </div>

      ${f.properties.rename ? `<div class="list-rename">${f.properties.rename}</div>` : ''}
      ${f.properties.address ? `<div class="list-address">${f.properties.address}</div>` : ''}
      ${f.properties.date ? `<div class="list-date">${f.properties.date}</div>` : ''}
    `;

    div.onclick = () => {
      listPanel.classList.remove('open');
      map.flyTo({ center: f.geometry.coordinates, zoom: 13 });
      showPopup(f);
    };

    listBody.appendChild(div);
  });
}


// --------------------------------------
// ⑦ 年タブ
// --------------------------------------
document.querySelectorAll('.year-tabs button').forEach(btn => {
  btn.onclick = () => {
    currentYear = btn.dataset.year;

    document.querySelectorAll('.year-tabs button')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    buildList();
  };
});


// --------------------------------------
// ⑧ 都道府県フィルター変更
// --------------------------------------
prefSelect.onchange = e => {
  currentPref = e.target.value === '' ? 'all' : e.target.value;

  citySelect.innerHTML = `<option value="">すべての市区町村</option>`;
  citySelect.value = "";
  citySelect.disabled = true;

  if (currentPref !== 'all') {
    const cities = new Set();

    allPoints.forEach(f => {
      if (f.properties.pref === currentPref) {
        cities.add(f.properties.city);
      }
    });

    const sorted = [...cities].sort((a, b) => {
      const ca = cityOrder[a] ?? 999999;
      const cb = cityOrder[b] ?? 999999;
      return ca - cb;
    });

    sorted.forEach(c => {
      // ★ cityCounts が 0 の市区町村は出さない
      if (!cityCounts[c]) return;

      const opt = document.createElement('option');
      opt.value = c;

      const count = cityCounts[c];
      const padded = padZenkaku(c, maxCityLen);

      opt.textContent = `${padded}（${count}）`;
      citySelect.appendChild(opt);
    });

    citySelect.disabled = false;
  }

  buildList();
};


// --------------------------------------
// ⑨ 市区町村フィルター変更
// --------------------------------------
citySelect.onchange = () => { 
  buildList();
};
