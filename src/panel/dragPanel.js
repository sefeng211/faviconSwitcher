function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
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

const removeDropZone = () => {
  const dropZone = document.getElementById("drop_zone");
  dropZone.parentNode.removeChild(dropZone);
}

function drop(e) {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const sitePattern = urlParams.get("sitePattern");
  const mode = urlParams.get("mode");

  const files = e.target.files || e.dataTransfer.files;

  if (files[0]) {
    removeEvent();
  }

  //TODO: Figure out why an image may be empty here.
  if (!files[0]) {
    updateMessage(
      "Failed to upload the image, please close this window and try again."
    );
    removeDropZone();
    return;
  }

  if (!isImage(files[0].name)) {
    updateMessage(
      "This is not a image file, please upload an image file."
    );
    removeDropZone();
    return;
  }

  const data = genUploadData(sitePattern, files[0], true);

  dbMAG.upsert(data, function(e) {
    if (e === sitePattern) {
      // Uploaded Successfully
      updateMessage("Upload Success, Please close this window");
      pingUpdate();
      removeDropZone();
    }
  });
}
