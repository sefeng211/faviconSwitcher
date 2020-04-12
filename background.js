var storedFavicon = {};
function updateFavicon(dbManager) {
  storedFavicon = {};
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
        storedFavicon[item.sitePattern] = {
          file: item.file,
          active: item.active
        };
      }
    }
  });
}

function UpdateUrlActive(dbManager, url, active) {
  if (!dbManager.db) {
    setTimeout(function() {
      UpdateUrlActive(dbManager, url, active);
    }, 1000);
    return;
  }

  let keys = Object.keys(storedFavicon);
  let data = storedFavicon[url];
  if (data) {
    data.sitePattern = url;
    data.active = active;
    dbManager.upsert(data, function(e) {
      if (e === url) {
        // Uploaded Successfully
        updateFavicon(dbManager);
      }
    });
  } else {
    // Is it possible?
  }
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
  const spaceReplacedFilter = filter.replace(/ /g, '%20');
  let regex = RegExp(filter);
  if (regex.test(url)) {
    return true;
  } else {
    regex = RegExp(spaceReplacedFilter);
    return regex.test(url);
  }
};

function findMatchFile(url) {
  let keys = Object.keys(storedFavicon);

  for (const filter of keys) {
    if (compareURL(url.trim(), filter.trim())) {
      // Don't need to null check here because only non-null files have
      // been added to storedFavicon.
      const item = storedFavicon[filter];
      if (item.active) {
        return item.file;
      }
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
    updateFavicon(dbManager);
  } else if (request.task === "UpdateUrlActive") {
    const url = request.url;
    const active = request.active;
    UpdateUrlActive(dbManager, url, active);
  }
});
