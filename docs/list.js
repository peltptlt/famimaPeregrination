const listBtn = document.getElementById("listBtn");
const listPanel = document.getElementById("listPanel");
const listClose = document.getElementById("listClose");

listBtn.onclick = () => {
  listPanel.style.display = "block";
};

listClose.onclick = () => {
  listPanel.style.display = "none";
  map.resize();
};
