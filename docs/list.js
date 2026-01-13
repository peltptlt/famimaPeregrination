console.log("list.js loaded");

window.addEventListener('DOMContentLoaded', () => {

  const listBtn = document.getElementById('listBtn');
  const listPanel = document.getElementById('listPanel');
  const listBody = document.getElementById('listBody');
  const listClose = document.getElementById('listClose');

  if (!listBtn || !listPanel || !listBody || !listClose) {
    console.error("list DOM not found");
    return;
  }

  // 一覧を作る
  function buildList() {
    listBody.innerHTML = '';

    const byYear = {};

    allPoints.forEach(f => {
      const year = f.properties.year || '不明';
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(f);
    });

    Object.keys(byYear).sort().forEach((year, index) => {

      const block = document.createElement('div');
      block.className = 'year-block';

      const header = document.createElement('div');
      header.className = 'year-header';
      header.textContent = `${year}年（${byYear[year].length}件）`;

      const items = document.createElement('div');
      items.className = 'year-items';

      if (index === 0) {
        items.classList.add('open');
      }

      header.onclick = () => {
        items.classList.toggle('open');
      };

      header.onclick = () => {
        items.classList.toggle('open');
      };

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

  // 開く
  listBtn.onclick = () => {
    buildList();
    listPanel.classList.remove('hidden');
  };

  // 閉じる
  listClose.onclick = () => {
    listPanel.classList.add('hidden');
  };

});
