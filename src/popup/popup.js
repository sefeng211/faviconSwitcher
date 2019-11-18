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
const pingUpdate = data => {
  browser.runtime.sendMessage(data);
};

const removeURLFromDB = url => {
  dbManager.remove(url, function(e) {
    if (!e) {
      //success
      let removeElement = document.querySelector(
        "div[url=" + "'" + url + "'" + "]"
      );
      if (removeElement) {
        removeElement.parentNode.removeChild(removeElement);
        pingUpdate({ task: "UpdateCache" });
      }
    }
  });
};

const updateImageForUrl = url => {
  dragPanelUrl = dragPanelUrl + "?sitePattern=" + url + '&' + 'mode=update';
  uploadImagePanel.url = dragPanelUrl;
  var createdPanel = browser.windows.create(uploadImagePanel);
};
function createSwitch(switchCounter, is_active) {
  let switchDiv = document.createElement("div");
  switchDiv.className = "display_checkbox browser-style";

  let switchButton = document.createElement("input");
  //let label = document.createElement("label");

  switchButton.type = "checkbox";
  switchButton.className = "visually-hidden";
  switchButton.id = "switch" + switchCounter;

  switchButton.checked = is_active;

  switchButton.addEventListener("change", function(event) {
    const key = event.target.parentElement.parentElement.getAttribute("url");
    pingUpdate({ task: "UpdateUrlActive", url: key, active: this.checked });
  });

  switchDiv.appendChild(switchButton);
  return switchDiv;
}

function loopSitePairs(data, index) {
  if (index >= data.length) {
    return;
  }

  var item = data[index][Object.keys(data[index])[0]];
  const file = item.file;
  const sitePattern = item.sitePattern;
  const is_active = item.active;
  const reader = new FileReader();

  reader.onload = function(e) {
    var name = document.createElement("div");
    var image = document.createElement("img");
    var switchButton = createSwitch(index, is_active);
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

    // Allow users to remove their button
    removeButton.addEventListener("click", function(event) {
      const removeKey = event.target.parentElement.getAttribute("url");
      removeURLFromDB(removeKey);
    });

    // Allow users to replace the image
    image.addEventListener("click", function(event) {
      const updateKey = event.target.parentElement.getAttribute("url");
      updateImageForUrl(updateKey);
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
      sitePattern.classList.add("input_box_placeholder");
    } else {
      dragPanelUrl = dragPanelUrl + "?sitePattern=" + sitePattern.value + '&' + 'mode=add';
      uploadImagePanel.url = dragPanelUrl;
      var createdPanel = browser.windows.create(uploadImagePanel);
    }
  });
};
