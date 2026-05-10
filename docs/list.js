let currentYear = 'all';
let currentPref = 'all';
let currentCity = "all";

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

// 都道府県リストを prefOrder から自動生成
Object.keys(prefOrder)
  .sort((a, b) => prefOrder[a] - prefOrder[b])
  .forEach(pref => {
    const opt = document.createElement('option');
    opt.value = pref;
    opt.textContent = pref;
    prefSelect.appendChild(opt);
  });

// list展開
listBtn.onclick = () => {
  const listOpen = listPanel.classList.contains('open');
  const aboutOpen = aboutPanel.classList.contains('open');

  // 既に開いてたら全部閉じる
  if (listOpen || aboutOpen) {
    listPanel.classList.remove('open');
    aboutPanel.classList.remove('open');
    document.body.classList.remove('list-open');
    document.body.classList.remove('about-open');
    return;
  }

  // リストを開く
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
  listBody.innerHTML = "";

  let filtered = allPoints;

  // 年フィルター
  if (currentYear !== "all") {
    filtered = filtered.filter(f => {
      const y = (f.properties.date || "").slice(0, 4);
      return y === currentYear;
    });
  }

  // 都道府県フィルター
  if (currentPref !== "all") {
    filtered = filtered.filter(f => f.properties.pref === currentPref);
  }

  // 市区町村フィルター
  if (currentCity) {
    filtered = filtered.filter(f => f.properties.city === currentCity);
  }

  // prefOrder → cityOrder の順番で並べる
  filtered.sort((a, b) => {
    const pa = prefOrder[a.properties.pref] ?? 999;
    const pb = prefOrder[b.properties.pref] ?? 999;
    if (pa !== pb) return pa - pb;

    const ca = cityOrder[a.properties.city] ?? 999999;
    const cb = cityOrder[b.properties.city] ?? 999999;
    return ca - cb;
  });

  filtered.forEach(f => {
    const div = document.createElement("div");
    div.className = "list-item";

    div.innerHTML = `
      <div class="list-title">
        <span class="list-no">${f.properties.no}</span>
        <span class="list-name">${f.properties.name || ""}</span>
      </div>
      <div class="list-pref">${f.properties.pref_label}</div>
      <div class="list-city">${f.properties.city_label}</div>
      ${f.properties.address ? `<div class="list-address">${f.properties.address}</div>` : ""}
      ${f.properties.date ? `<div class="list-date">${f.properties.date}</div>` : ""}
    `;

    div.onclick = () => {
      listPanel.classList.remove("open");
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

    // active 切り替え
    document.querySelectorAll('.year-tabs button')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    buildList();
  };
});

// 都道府県セレクト変更イベント
document.getElementById('prefFilter').onchange = e => {
  currentPref = e.target.value === '' ? 'all' : e.target.value;

  // 市区町村フィルターをリセット
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

    // cityOrder を使って Excel の順番でソート
    const sorted = [...cities].sort((a, b) => {
      const ca = cityOrder[a] ?? 999999;
      const cb = cityOrder[b] ?? 999999;
      return ca - cb;
    });

    sorted.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      citySelect.appendChild(opt);
    });

    citySelect.disabled = false;
  }

  buildList();
};

// 市区町村セレクト変更イベント
citySelect.onchange = e => {
  currentCity = e.target.value === "" ? "" : e.target.value;
  buildList();
};


// 都道府県集計
function buildPrefFilter() {
  prefSelect.innerHTML = `<option value="">すべての都道府県</option>`;

  const prefs = new Set(allPoints.map(f => f.properties.pref));

  // prefOrder の順番で並べる
  const sorted = [...prefs].sort((a, b) => {
    const pa = prefOrder[a] ?? 999;
    const pb = prefOrder[b] ?? 999;
    return pa - pb;
  });

  sorted.forEach(pref => {
    const opt = document.createElement("option");
    opt.value = pref;

    // GeoJSON に入れた pref_label を使う
    const sample = allPoints.find(f => f.properties.pref === pref);
    opt.textContent = sample.properties.pref_label;

    prefSelect.appendChild(opt);
  });
}


// 市区町村集計
function buildCityFilter(currentPref) {
  citySelect.innerHTML = `<option value="">すべての市区町村</option>`;

  if (!currentPref || currentPref === "all") {
    citySelect.disabled = true;
    return;
  }

  const cities = new Set();

  allPoints.forEach(f => {
    if (f.properties.pref === currentPref) {
      cities.add(f.properties.city);
    }
  });

  // cityOrder の順番で並べる
  const sorted = [...cities].sort((a, b) => {
    const ca = cityOrder[a] ?? 999999;
    const cb = cityOrder[b] ?? 999999;
    return ca - cb;
  });

  sorted.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;

    const sample = allPoints.find(f => f.properties.city === city);
    opt.textContent = sample.properties.city_label;

    citySelect.appendChild(opt);
  });

  citySelect.disabled = false;
}
