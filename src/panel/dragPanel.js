window.indexeddbResult =
  window.indexeddbResult ||
  window.mozIndexeddbResult ||
  window.webkitIndexeddbResult ||
  window.msIndexeddbResult;

window.IdbResultTransaction = window.IdbResultTransaction ||
  window.webkitIdbResultTransaction ||
  window.msIdbResultTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IdbResultKeyRange =
  window.IdbResultKeyRange ||
  window.webkitIdbResultKeyRange ||
  window.msIdbResultKeyRange;

// (Mozilla has never prefixed these objects, so we don't need window.mozIdbResult*)

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

window.onload = function() {
  dbMAG = new IndexedDBWrapper();
  dbMAG.openDB(function(ret) {
    console.log(ret);
  });

  const dropzone = document.getElementById("drop_zone");
  dropzone.addEventListener("dragenter", dragenter, false);
  dropzone.addEventListener("dragover", dragover, false);
  dropzone.addEventListener("drop", drop, false);

  const button = document.getElementById("getAll");
  button.addEventListener("click", function() {
    dbMAG.getAll("faviconStorage", function(ret) {
      console.log(ret);
    });
  });
};

let sitePattern = "";
// Get the image file if it was dragged into the sidebar drop zone
function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const sitePattern = urlParams.get("sitePattern");
  const data = {
    sitePattern: sitePattern,
    file: e.dataTransfer.files[0],
    active: true
  };
  dbMAG.upsert(data, function(e) {
    console.log("UPLOADED");
    if (e === sitePattern) {
      // Uploaded Successfully
      const infoElement = document.getElementById("info");
      infoElement.innerHTML = "Upload Success, Please close this window";
      pingUpdate();

      // Remove the dropZone
      const dropZone = document.getElementById("drop_zone");
      dropZone.parentNode.removeChild(dropZone);
    }
    console.log(e);
  });
}
