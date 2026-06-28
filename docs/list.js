document.addEventListener("pointsLoaded", () => {

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
  // 文字列正規化（前後の空白 + ダブルクォート除去）
  // --------------------------------------
  function norm(s) {
    return (s || '')
      .replace(/^[\s\u3000"]+|[\s\u3000"]+$/g, '')
      .replace(/^"|"$/g, '');
  }

  // --------------------------------------
  // 件数集計（正規化してからカウント）
  // --------------------------------------
  const prefCounts = {};
  const cityCounts = {};

  allPoints.forEach(f => {
    const p = norm(f.properties.pref);
    const c = norm(f.properties.city);

    prefCounts[p] = (prefCounts[p] || 0) + 1;
    cityCounts[c] = (cityCounts[c] || 0) + 1;

    // 元データも正規化しておく
    f.properties.pref = p;
    f.properties.city = c;
  });

  // --------------------------------------
  // 最大文字数（揃え用）
  // --------------------------------------
  const maxPrefLen = Math.max(...Object.keys(prefCounts).map(p => p.length));
  const maxCityLen = Math.max(...Object.keys(cityCounts).map(c => c.length));

  function padZenkaku(str, width) {
    const padCount = width - str.length;
    return str + "　".repeat(padCount > 0 ? padCount : 0);
  }

  // --------------------------------------
  // 都道府県フィルター生成
  // --------------------------------------
  Object.keys(prefOrder)
    .map(k => norm(k))  // 正規化
    .sort((a, b) => prefOrder[a] - prefOrder[b])
    .forEach(pref => {
      const p = norm(pref);
      const count = prefCounts[p];

      if (!count) return; // データがない都道府県は出さない

      const opt = document.createElement('option');
      opt.value = p;

      const padded = padZenkaku(p, maxPrefLen);
      opt.textContent = `${padded}（${count}）`;

      prefSelect.appendChild(opt);
    });

  // --------------------------------------
  // list展開
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
  // about
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
  // list本編
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
  // 年タブ
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
  // 都道府県フィルター変更
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
        const count = cityCounts[c];
        if (!count) return;

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

  // --------------------------------------
  // 市区町村フィルター変更
  // --------------------------------------
  citySelect.onchange = () => { 
    buildList();
  };

});
