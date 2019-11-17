const addIcon = iconPath => {
  console.log("Add Icon");
  var link = document.createElement("link");
  link.rel = "shortcut icon";
  link.href = browser.extension.getURL(iconPath);
  document.head.appendChild(link);
};

browser.runtime.onMessage.addListener(request => {
  var file = request.file;
  var reader = new FileReader();
  reader.onload = function(e) {
    addIcon(e.target.result);
  };
  reader.readAsDataURL(file);
});
