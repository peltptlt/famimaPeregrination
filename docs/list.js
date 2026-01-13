console.log("list.js loaded");

const listBtn   = document.getElementById('listBtn');
const listPanel = document.getElementById('listPanel');
const listBody  = document.getElementById('listBody');
const listClose = document.getElementById('listClose');

// 一覧を作る
function buildList() {
  listBody.innerHTML = '';

  allPoints.forEach(f => {
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

    // クリックで地図へ
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

// 一覧を開く
listBtn.onclick = () => {
  buildList();
  listPanel.style.display = 'flex';
};

// 一覧を閉じる
listClose.onclick = () => {
  listPanel.style.display = 'none';
};
