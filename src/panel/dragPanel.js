function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

var dbMAG;
// Ask the background script to update it's cache
const pingUpdate = () => {
  browser.runtime.sendMessage({
    task: "UpdateCache"
  });
};

const updateMessage = message => {
  const infoElement = document.getElementById("drop_zone_label");
  infoElement.innerHTML = message;
};

window.onload = function() {
  dbMAG = new IndexedDBWrapper();
  dbMAG.openDB(function(ret) {
    console.log(ret);
  });

  const dropzone = document.getElementById("drop_zone");
  dropzone.addEventListener(
    "dragenter dragstart dragend dragleave dragover drag drop",
    function(e) {
      e.preventDefault();
    }
  );

  dropzone.addEventListener("dragenter", dragenter, false);
  dropzone.addEventListener("dragover", dragover, false);
  dropzone.addEventListener("drop", drop, false);
};

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const sitePattern = urlParams.get("sitePattern");
  const file = e.dataTransfer.files[0];

  console.log(e.dataTransfer.files);
  if (!file) {
    //TODO: Figure out why an image may be empty here.
    updateMessage(
      "Failed to upload the image, please close this window and try again"
    );
    return;
  }

  const data = genUploadData(sitePattern, file, true);

  dbMAG.upsert(data, function(e) {
    console.log("UPLOADED");
    if (e === sitePattern) {
      // Uploaded Successfully
      updateMessage("Upload Success, Please close this window");
      pingUpdate();

      // Remove the dropZone
      const dropZone = document.getElementById("drop_zone");
      dropZone.parentNode.removeChild(dropZone);
    }
    console.log(e);
  });
}
