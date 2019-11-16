var storedFavicon = {};
function updateFavicon(dbManager) {
  // Same as the hack in popup.js
  // TODO: Fix me
  if (!dbManager.db) {
    setTimeout(function() {
      updateFavicon(dbManager);
    }, 1000);
    return;
  }

  dbManager.getAll(function(ret) {
    for (const key of Object.keys(ret)) {
      let item = ret[key][Object.keys(ret[key])[0]];

      if (item.file) {
        storedFavicon[item.sitePattern] = item.file;
      }
    }
  });
}

var dbManager = new IndexedDBWrapper();
dbManager.openDB();

setTimeout(function() {
  updateFavicon(dbManager);
}, 1000);

const GlobalUrlFilter = {
  urls: ["https://*/*", "http://*/*"]
};

//TODO: Find/Implement a better algorithm
const compareURL = (url, filter) => {
  let regex = RegExp(filter);
  return regex.test(url);
};

function findMatchFile(url) {
  let keys = Object.keys(storedFavicon);

  for (const filter of keys) {
    if (compareURL(url, filter)) {
      // Don't need to null check here because only non-null files have
      // been added to storedFavicon.
      return storedFavicon[filter];
    }
  }
  return null;
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
  if (storedFavicon && Object.keys(storedFavicon).length) {
    var file = findMatchFile(tabInfo.url);
    if (file) {
      browser.tabs.sendMessage(tabId, { file: file });
    }
  }
}, GlobalUrlFilter);

browser.runtime.onMessage.addListener(function(request, sender, sendMessage) {
  if (request.task === "UpdateCache") {
    console.log("Update cache");
    updateFavicon(dbManager);
  }
});
