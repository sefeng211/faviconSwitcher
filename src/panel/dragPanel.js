function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'ico':
    case 'png':
        //etc
        return true;
    }
    return false;
}

const dropzone = document.querySelector("#drop_zone");

dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.style.background = "grey";
}, false);

dropzone.addEventListener('dragenter', function (e) {
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
});

dropzone.addEventListener('dragleave', function () {
    this.style.background = "white";
});

dropzone.addEventListener('drop', function (e) {
    this.style.background = "white";
}, false);

dropzone.addEventListener('drop', drop, false);

document.querySelector("#input").addEventListener('change', onFilePicker);
document.querySelector("#upload-image").addEventListener('click', function(e) {
    document.querySelector("input").click();
});

document.getElementById("drop_link_button").addEventListener("click", function() {
    const input_field = document.getElementById("drop_link_input_field");
    const favicon_url = input_field.value;
    if (!favicon_url) {
      input_field.classList.add("input_box_placeholder");
    } else {
      if (!favicon_url.startsWith("http") && !favicon_url.startsWith("https")) {
        updateMessage("Error: The input url must be started with either 'http' or 'https'");
        removeDropArea();
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const sitePattern = urlParams.get("sitePattern");
      const data = genUploadData(sitePattern, favicon_url, true);
      dbMAG.upsert(data, function(e) {
        if (e === sitePattern) {
          // Uploaded Successfully
          updateMessage("The link is saved successfully, Please close this window");
          pingUpdate();
          removeDropArea();
        }
      });
    }
});

var dbMAG;
// Ask the background script to update it's cache
const pingUpdate = () => {
  browser.runtime.sendMessage({
    task: "UpdateCache"
  });
};

const updateMessage = message => {
  const newInfoElement = document.createElement("p");
  const node = document.createTextNode(message);
  newInfoElement.appendChild(node);
  document.body.appendChild(newInfoElement);
};

function removeEvent() {
  document.querySelector("#drop_zone").removeEventListener('drop', drop, false);
}

window.onload = function() {
  dbMAG = new IndexedDBWrapper();
  dbMAG.openDB(function(ret) {
  });
};

const removeDropArea = () => {
  const dropZone = document.getElementById("drop_zone");
  dropZone.parentNode.removeChild(dropZone);

  const dropLinkDiv = document.getElementById("drop_link_div");
  dropLinkDiv.parentNode.removeChild(dropLinkDiv);
}

function _uploadFile(files) {
  const urlParams = new URLSearchParams(window.location.search);
  const sitePattern = urlParams.get("sitePattern");

  if (files[0]) {
    removeEvent();
  }

  //TODO: Figure out why an image may be empty here.
  if (!files[0]) {
    updateMessage(
      "Only image file is accepted (jpg, jpeg, png, ico), please close this window and try again."
    );
    removeDropArea();
    return;
  }

  if (!isImage(files[0].name)) {
    updateMessage(
      "This is not a image file, please upload an image file."
    );
    removeDropArea();
    return;
  }

  const data = genUploadData(sitePattern, files[0], true);

  dbMAG.upsert(data, function(e) {
    if (e === sitePattern) {
      // Uploaded Successfully
      updateMessage("Upload Success, Please close this window");
      pingUpdate();
      removeDropArea();
    }
  });
}

function onFilePicker(e) {
  _uploadFile(this.files);
}

function drop(e) {
  e.preventDefault();
  const files = e.target.files || e.dataTransfer.files;
  _uploadFile(files);
}
