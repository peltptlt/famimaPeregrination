console.log("list.js loaded");

const listBtn = document.getElementById('listBtn');
const listPanel = document.getElementById('listPanel');
const listBody = document.getElementById('listBody');
const listClose = document.getElementById('listClose');

// 一覧を作る
function buildList() {
  listBody.innerHTML = '';

  // year ごとにまとめる
  const byYear = {};

  allPoints.forEach(f => {
    const year = f.properties.year || '不明';
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(f);
  });

  // 年順で並べる
  Object.keys(byYear).sort().forEach(year => {

    // 年ブロック
    const block = document.createElement('div');
    block.className = 'year-block';

    // 年ヘッダ
    const header = document.createElement('div');
    header.className = 'year-header';
    header.textContent = `${year}年（${byYear[year].length}件）`;

    // 中身
    const items = document.createElement('div');
    items.className = 'year-items';

    // 開け閉め
    header.onclick = () => {
      items.classList.toggle('open');
    };

    // 店リスト
    byYear[year].forEach(f => {
      const div = document.createElement('div');
      div.className = 'list-item';

      div.innerHTML = `
        <b>${f.properties.no}</b>
        ${f.properties.name || ''}
        ${f.properties.rename ? `→ ${f.properties.rename}` : ''}
        <div style="font-size:12px;color:#555;">
          ${f.properties.address || ''}
        </div>
      `;

      div.onclick = () => {
        listPanel.classList.add('hidden');

        map.flyTo({
          center: f.geometry.coordinates,
          zoom: 13
        });

        showPopup(f);
      };

      items.appendChild(div);
    });

    block.appendChild(header);
    block.appendChild(items);
    listBody.appendChild(block);
  });
}

// 一覧を開く
listBtn.onclick = () => {
  buildList();
  listPanel.classList.remove('hidden');
};

// 閉じる
listClose.onclick = () => {
  listPanel.classList.add('hidden');
};
