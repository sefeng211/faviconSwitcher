const addIcon = iconPath => {
  var link = document.createElement("link");
  link.rel = "shortcut icon";
  link.href = iconPath;
  document.head.appendChild(link);
};

browser.runtime.onMessage.addListener(request => {
  var file = request.file;
  if (typeof file === 'object') {
    var reader = new FileReader();
    reader.onload = function(e) {
      addIcon(e.target.result);
    };
    reader.readAsDataURL(file);
  } else if (typeof file === 'string') {
    addIcon(file);
  }
});
