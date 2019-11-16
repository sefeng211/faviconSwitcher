let dragPanelUrl = browser.extension.getURL("src/panel/dragPanel.html");

var dbManager;
let uploadImagePanel = {
  allowScriptsToClose: true,
  type: "panel",
  url: dragPanelUrl,
  width: 400,
  height: 300
};

// Ask the background script to update it's cache
const pingUpdate = () => {
  browser.runtime.sendMessage({
    task: "UpdateCache"
  });
}

const removeURLFromDB = url => {
  dbManager.remove(url, function(e) {
    if (!e) {
      //success
      let removeElement = document.querySelector(
        "div[url=" + "'" + url + "'" + "]"
      );
      if (removeElement) {
        removeElement.parentNode.removeChild(removeElement);
        pingUpdate();
      }
    }
  });
};

function createSwitch(switchCounter) {
  let switchDiv = document.createElement("div");
  switchDiv.className = "display_checkbox";

  let switchButton = document.createElement("input");
  //let label = document.createElement("label");

  switchButton.type = "checkbox";
  switchButton.className = "visually-hidden";
  switchButton.id = "switch" + switchCounter;

  //label.htmlFor = "switch" + switchCounter;
  //label.appendChild(document.createTextNode("Label11"));

  switchDiv.appendChild(switchButton);
  //switchDiv.appendChild(label);
  return switchDiv;
}

function loopSitePairs(data, index) {
  if (index >= data.length) {
    return;
  }

  var item = data[index][Object.keys(data[index])[0]];
  var file = item.file;
  var sitePattern = item.sitePattern;

  var reader = new FileReader();

  reader.onload = function(e) {
    var name = document.createElement("div");
    var image = document.createElement("img");
    var switchButton = createSwitch(index);

    var removeButton = document.createElement("button");
    removeButton.innerHTML = "Remove";
    removeButton.className = "browser-style";

    //name.style.width = "100px";
    name.className = "display_pattern";

    image.style.height = "30px";
    image.style.width = "30px";
    image.className = "display_image";

    name.innerHTML = sitePattern;
    image.src = e.target.result;

    var tmpDiv = document.createElement("div");
    tmpDiv.className = "row_display";
    tmpDiv.setAttribute("url", sitePattern);

    tmpDiv.appendChild(name);
    tmpDiv.appendChild(image);
    tmpDiv.appendChild(switchButton);
    tmpDiv.appendChild(removeButton);

    removeButton.addEventListener("click", function(event) {
      const removeKey = event.target.parentElement.getAttribute("url");
      removeURLFromDB(removeKey);
    });

    document.getElementById("display_zone").appendChild(tmpDiv);
    var nextIndex = index + 1;
    loopSitePairs(data, nextIndex);
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    var nextIndex = index + 1;
    loopSitePairs(data, nextIndex);
  }
}

function updateFaviconList(dbManager) {
  // To make sure indexedDB is opened
  // TODO: Using setTimeout is ugly and we should use a callback function
  // or Promise.
  if (!dbManager.db) {
    setTimeout(function() {
      updateFaviconList(dbManager);
    }, 500);
    return;
  }

  dbManager.getAll(function(ret) {
    console.log(ret);
    loopSitePairs(ret, 0);
  });
}

let sitePattern;
window.onload = function() {
  dbManager = new IndexedDBWrapper();
  dbManager.openDB();

  let uploadImageButton = document.getElementById("upload_image");
  sitePattern = document.getElementById("site_pattern");

  // Wait for the database to be opened
  setTimeout(function() {
    updateFaviconList(dbManager);
  }, 500);

  uploadImageButton.addEventListener("click", function() {
    if (!sitePattern.value) {
      // User must provide an url pattern before upload an image.
      console.log("Empty site pattern");
    } else {
      dragPanelUrl = dragPanelUrl + "?sitePattern=" + sitePattern.value;
      uploadImagePanel.url = dragPanelUrl;
      var createdPanel = browser.windows.create(uploadImagePanel);
    }
  });
};
