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

// 文字列正規化（前後の全角/半角スペースを削る）
function norm(s) {
  return (s || '').replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

// 件数集計（正規化してからカウント）
const prefCounts = {};
const cityCounts = {};

allPoints.forEach(f => {
  const p = norm(f.properties.pref);
  const c = norm(f.properties.city);

  prefCounts[p] = (prefCounts[p] || 0) + 1;
  cityCounts[c] = (cityCounts[c] || 0) + 1;

  // 元データ側も正規化しておくと後の比較が楽
  f.properties.pref = p;
  f.properties.city = c;
});

// 最大文字数（件数揃え）
const maxPrefLen = Math.max(...Object.keys(prefCounts).map(p => p.length));
const maxCityLen = Math.max(...Object.keys(cityCounts).map(c => c.length));

function padZenkaku(str, width) {
  const padCount = width - str.length;
  return str + '　'.repeat(padCount > 0 ? padCount : 0);
}

// 都道府県フィルター生成（prefOrder はそのまま使う）
Object.keys(prefOrder)
  .sort((a, b) => prefOrder[a] - prefOrder[b])
  .forEach(pref => {
    const normPref = norm(pref);
    const count = prefCounts[normPref];

    // この都道府県にデータがなければ出さない
    if (!count) return;

    const opt = document.createElement('option');
    opt.value = normPref;

    const padded = padZenkaku(normPref, maxPrefLen);
    opt.textContent = `${padded}（${count}）`;

    prefSelect.appendChild(opt);
  });

// list展開
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

// list閉じる
listClose.onclick = () => {
  listPanel.classList.remove('open');
  document.body.classList.remove('list-open');
};

// about展開
aboutBtn.onclick = () => {
  fetch('about.html')
    .then(res => res.text())
    .then(html => {
      aboutBody.innerHTML = html;
      aboutPanel.classList.add('open');
    });
};

// about閉じる
aboutClose.onclick = () => {
  aboutPanel.classList.remove('open');
};

// list本編
function buildList() {
  listBody.innerHTML = '';

  let filtered = allPoints;

  // 年フィルター
  if (currentYear !== 'all') {
    filtered = filtered.filter(f => {
      const d = f.properties.date || '';
      const y = d.slice(0, 4);
      return y === currentYear;
    });
  }

  // 都道府県フィルター
  if (currentPref !== 'all') {
    filtered = filtered.filter(f => norm(f.properties.pref) === currentPref);
  }

  // 市区町村フィルター
  if (citySelect.value !== '') {
    filtered = filtered.filter(f => norm(f.properties.city) === citySelect.value);
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

// 年タブのクリックイベント
document.querySelectorAll('.year-tabs button').forEach(btn => {
  btn.onclick = () => {
    currentYear = btn.dataset.year;

    document.querySelectorAll('.year-tabs button')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    buildList();
  };
});

// 都道府県セレクト変更イベント
prefSelect.onchange = e => {
  currentPref = e.target.value === '' ? 'all' : e.target.value;

  // 市区町村フィルターをリセット
  citySelect.innerHTML = `<option value="">すべての市区町村</option>`;
  citySelect.value = '';
  citySelect.disabled = true;

  if (currentPref !== 'all') {
    const cities = new Set();

    allPoints.forEach(f => {
      if (norm(f.properties.pref) === currentPref) {
        cities.add(norm(f.properties.city));
      }
    });

    // cityOrder を使って Excel の順番でソート
    const sorted = [...cities].sort((a, b) => {
      const ca = cityOrder[a] ?? 999999;
      const cb = cityOrder[b] ?? 999999;
      return ca - cb;
    });

    sorted.forEach(c => {
      const count = cityCounts[c];
      if (!count) return; // 0件は出さない（あり得る前提）

      const opt = document.createElement('option');
      opt.value = c;

      const padded = padZenkaku(c, maxCityLen);
      opt.textContent = `${padded}（${count}）`;

      citySelect.appendChild(opt);
    });

    citySelect.disabled = false;
  }

  buildList();
};

// 市区町村セレクト変更イベント
citySelect.onchange = () => {
  buildList();
};
