// ==UserScript==
// @name        TS4 Gallery Downloader — Fixed & Enhanced
// @description Fixes broken downloads and adds a custom download button to TS4 Gallery
// @author      anadius + modifications from nrksu1tan
// @match       *://www.ea.com/*/games/the-sims/the-sims-4/pc/gallery*
// @match       *://www.ea.com/games/the-sims/the-sims-4/pc/gallery*
// @connect     sims4cdn.ea.com
// @connect     athena.thesims.com
// @connect     www.thesims.com
// @connect     thesims-api.ea.com
// @version     2.1.17
// @namespace   anadius.github.io
// @grant       unsafeWindow
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlhttpRequest
// @grant       GM.getResourceUrl
// @grant       GM_getResourceURL
// @icon        https://anadius.github.io/ts4installer-tumblr-files/userjs/sims-4-gallery-downloader.png
// @resource    bundle.json https://anadius.github.io/ts4installer-tumblr-files/userjs/bundle.min.json?version=1.105.332
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://cdn.jsdelivr.net/npm/long@4.0.0/dist/long.js#sha256-Cp9yM71yBwlF4CLQBfDKHoxvI4BoZgQK5aKPAqiupEQ=
// @require     https://cdn.jsdelivr.net/npm/file-saver@2.0.1/dist/FileSaver.min.js#sha256-Sf4Tr1mzejErqH+d3jzEfBiRJAVygvjfwUbgYn92yOU=
// @require     https://cdn.jsdelivr.net/npm/jszip@3.2.0/dist/jszip.min.js#sha256-VwkT6wiZwXUbi2b4BOR1i5hw43XMzVsP88kpesvRYfU=
// @require     https://cdn.jsdelivr.net/npm/protobufjs@6.8.8/dist/protobuf.min.js#sha256-VPK6lQo4BEjkmYz6rFWbuntzvMJmX45mSiLXgcLHCLE=
// ==/UserScript==

/* global protobuf, saveAs, JSZip, Long */
/* eslint curly: 0 */
/* eslint no-sequences: 0 */
/* eslint no-return-assign: 0 */

(function() {
  'use strict';

  const TRAY_ITEM_URL = 'https://thesims-api.ea.com/api/gallery/v1/sims/{UUID}';
  const DATA_ITEM_URL = 'http://sims4cdn.ea.com/content-prod.ts4/prod/{FOLDER}/{GUID}.dat';
  const IMAGE_URL = 'https://athena.thesims.com/v2/images/{TYPE}/{FOLDER}/{GUID}/{INDEX}.jpg';

  const EXCHANGE_HOUSEHOLD = 1;
  const EXCHANGE_BLUEPRINT = 2;
  const EXCHANGE_ROOM = 3;
  const EXTENSIONS = {
    [EXCHANGE_HOUSEHOLD]: ['Household', 'householdbinary', 'hhi', 'sgi'],
    [EXCHANGE_BLUEPRINT]: ['Lot', 'blueprint', 'bpi', 'bpi'],
    [EXCHANGE_ROOM]: ['Room', 'room', 'rmi', null]
  };

  const BIG_WIDTH = 591;
  const BIG_HEIGHT = 394;
  const SMALL_WIDTH = 300;
  const SMALL_HEIGHT = 200;

  const LONG_TYPES = ["sint64","uint64","int64","sfixed64","fixed64"];

  /* Helper functions */
  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function reportError(e) {
    if(e.name && e.message && e.stack)
      alert(`${e.name}\n\n${e.message}\n\n${e.stack}`);
    else
      alert(e);
  }

  /* GM XHR promise wrapper */
  const xhr = details => new Promise((resolve, reject) => {
    const stack = new Error().stack;
    const reject_xhr = res => {
      console.log(res);
      reject({
        name: 'GMXHRError',
        message: `XHR for URL ${details.url} returned status code ${res.status}`,
        stack: stack,
        status: res.status
      });
    };
    GM.xmlHttpRequest(Object.assign(
      { method: 'GET' },
      details,
      {
        onload: res => {
          if(res.status === 404) {
            reject_xhr(res);
          } else {
            resolve(res.response);
          }
        },
        onerror: res => reject_xhr(res)
      }
    ));
  });

  /* Original Sims-based utilities */
  function dashify(uuid) {
    var slice = String.prototype.slice,
        indices = [[0, 8],[8, 12],[12, 16],[16, 20],[20]];
    return indices.map(function(index) {
      return slice.apply(uuid, index);
    }).join("-");
  }

  function uuid2Guid(uuid) {
    if (-1 !== uuid.indexOf("-")) return uuid.toUpperCase();
    var decoded;
    try {
      decoded = atob(uuid);
    } catch (err) {
      return !1;
    }
    for (var guid = "", i = 0; i < decoded.length; i++) {
      var ch = decoded.charCodeAt(i);
      ch = (240 & ch) >> 4;  // high nibble
      ch = ch.toString(16);
      var tmpstr = ch.toString();
      ch = decoded.charCodeAt(i);  // again
      ch = 15 & ch;                // low nibble
      ch = ch.toString(16);
      tmpstr += ch.toString();
      guid += tmpstr;
    }
    return dashify(guid).toUpperCase();
  }

  function getFilePath(guid) {
    var bfnvInit = 2166136261;
    for (var fnvInit = bfnvInit, i = 0; i < guid.length; ++i) {
      fnvInit += (fnvInit << 1) + (fnvInit << 4) + (fnvInit << 7) + (fnvInit << 8) + (fnvInit << 24);
      fnvInit ^= guid.charCodeAt(i);
    }
    var result = (fnvInit >>> 0) % 1e4;
    result = result.toString(16);
    return "0x" + "00000000".substr(0, 8 - result.length) + result;
  }




  /* Our main code */
  (async () => {
    // Load the protobuf bundle
    let data = await fetch(await GM.getResourceUrl('bundle.json'));
    let jsonDescriptor = await data.json();
    const root = protobuf.Root.fromJSON(jsonDescriptor);

    /* ---- TRAY ITEM DOWNLOAD + PARSE ---- */
    function getRandomId() {
      return new Long(
        getRandomIntInclusive(1, 0xffffffff),
        getRandomIntInclusive(0, 0xffffffff),
        true
      );
    }

    function createPrefix(num) {
      const arr = new ArrayBuffer(8);
      const view = new DataView(arr);
      view.setUint32(4, num, true);
      return new Uint8Array(arr);
    }

    function camelToSnakeCase(str) {
      return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    function findKeyName(key, messageClass) {
      if(typeof messageClass.fields[key] !== "undefined") {
        return key;
      }
      const key2 = camelToSnakeCase(key);
      if(typeof messageClass.fields[key2] !== "undefined") {
        return key2;
      }
      const nameParts = [];
      let msgClass = messageClass;
      while(msgClass.name !== "" && typeof msgClass.name !== "undefined") {
        nameParts.unshift(msgClass.name);
        msgClass = msgClass.parent;
      }
      const name = nameParts.join(".");
      throw `${name} class doesn't have ${key} nor ${key2} key.`;
    }

    function parseValue(value, fieldType, isParentArray) {
      let parsedValue = value;
      const valueType = typeof value;
      if(valueType === "object") {
        if(Array.isArray(value)) {
          if(isParentArray) throw "No clue how to handle array of arrays";
          parsedValue = parseMessageArray(value, fieldType);
        } else {
          [parsedValue] = parseMessageObj(value, fieldType);
        }
      }
      else if(valueType === "string") {
        if(fieldType === "string" || fieldType === "bytes") {
          // do nothing
        }
        else if(LONG_TYPES.includes(fieldType)) {
          parsedValue = Long.fromValue(value);
        }
        else {
          // enum
          parsedValue = root.lookupEnum(fieldType).values[value.split('.').pop()];
        }
      }
      return parsedValue;
    }

    function parseMessageArray(messageArray, className) {
      const parsedArray = [];
      messageArray.forEach(arrayItem => {
        parsedArray.push(parseValue(arrayItem, className, true));
      });
      return parsedArray;
    }

    function parseMessageObj(messageObj, className) {
      const messageClass = root.lookupType(className);
      const keys = Object.keys(messageObj);
      const parsedMessage = {};
      for(let i=0; i<keys.length; i++) {
        const key = findKeyName(keys[i], messageClass);
        parsedMessage[key] = parseValue(messageObj[keys[i]], messageClass.fields[key].type);
      }
      return [parsedMessage, messageClass];
    }

    async function getTrayItem(uuid, guid, folder) {
      let message;
      try {
        message = await xhr({
          url: TRAY_ITEM_URL.replace('{UUID}', encodeURIComponent(uuid)),
          responseType: 'json',
          headers: { 'Accept-Language': 'en-US,en;q=0.9', 'Cookie': '' }
        });
      } catch(e) {
        if(e.name === 'GMXHRError') message = null;
        else throw e;
      }
      if(!message || typeof message.error !== 'undefined') {
        throw "Can't download tray file. Possibly removed from the Gallery.";
      }

      const [parsedMessage, messageClass] = parseMessageObj(message, "EA.Sims4.Network.TrayMetadata");
      // Random ID
      parsedMessage.id = getRandomId();

      // Additional images
      let additional = 0;
      if(parsedMessage.type === EXCHANGE_BLUEPRINT) {
        additional = parsedMessage.metadata.bp_metadata.num_thumbnails - 1;
      } else if(parsedMessage.type === EXCHANGE_HOUSEHOLD) {
        additional = parsedMessage.metadata.hh_metadata.sim_data.length;
        parsedMessage.metadata.hh_metadata.sim_data.forEach((sim, i) => {
          sim.id = parsedMessage.id.add(i + 1);
        });
      }

      // Encode
      const encodedMessage = messageClass.encode(parsedMessage).finish();
      const prefix = createPrefix(encodedMessage.byteLength);
      const resultFile = new Uint8Array(prefix.length + encodedMessage.length);
      resultFile.set(prefix);
      resultFile.set(encodedMessage, prefix.length);

      return [
        resultFile,
        parsedMessage.type,
        parsedMessage.id,
        additional,
        parsedMessage.modifier_name || parsedMessage.creator_name,
        parsedMessage.name
      ];
    }

    /* ---- DATA FILE DOWNLOAD + FIX ---- */
    async function getDataItem(guid, folder, type, id) {
      let response;
      try {
        response = await xhr({
          url: DATA_ITEM_URL.replace('{FOLDER}', folder).replace('{GUID}', guid),
          responseType: 'arraybuffer'
        });
      } catch(e) {
        if(e.name === 'GMXHRError' && e.status === 404) {
          throw "Can't download data file. Possibly removed from Gallery.";
        } else {
          throw e;
        }
      }

      // For Households, fix up sim IDs
      if(type === EXCHANGE_HOUSEHOLD) {
        const messageClass = root.lookupTypeOrEnum('EA.Sims4.Network.FamilyData');
        const totalBytes = response.byteLength;
        if(totalBytes < 8) {
          console.error("Truncated .dat file (< 8 bytes). Using raw data as fallback.");
          return response;
        }
        const view = new DataView(response);
        let len = view.getUint32(4, true);
        if(totalBytes < 8 + len) {
          console.error(`Truncated .dat file: expected >= ${8+len}, got ${totalBytes}. Using raw data.`);
          return response;
        }
        // decode
        const prefix = new Uint8Array(response, 0, 4);
        const message = messageClass.decode(new Uint8Array(response, 8, len));
        const suffix = new Uint8Array(response, 8 + len);

        // fix sim IDs
        const newIdsDict = {};
        const sims = message.family_account.sim;
        sims.forEach((sim, i) => {
          newIdsDict[sim.sim_id.toString()] = id.add(i+1);
        });
        sims.forEach(sim => {
          sim.sim_id = newIdsDict[sim.sim_id.toString()];
          sim.significant_other = newIdsDict[sim.significant_other.toString()];
          sim.attributes.genealogy_tracker.family_relations.forEach(r => {
            const newId = newIdsDict[r.sim_id.toString()];
            if(newId) r.sim_id = newId;
          });
        });

        // re-encode
        try {
          const editedMessage = new Uint8Array(messageClass.encode(message).finish());
          const resultArray = new Uint8Array(8 + editedMessage.length + suffix.length);
          resultArray.set(prefix);
          (new DataView(resultArray.buffer)).setUint32(4, editedMessage.length, true);
          resultArray.set(editedMessage, 8);
          resultArray.set(suffix, 8 + editedMessage.length);
          return resultArray.buffer;
        } catch(err) {
          console.error("Error re-encoding .dat:", err);
          return response;
        }
      }
      else {
        // for lots/rooms, no re-encode needed
        return response;
      }
    }

    /* ---- IMAGE FETCH ---- */
    function newCanvas(w, h) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    }

    function loadImage(url) {
      return new Promise(resolve => {
        xhr({ url, responseType: 'blob' }).then(blob => {
          const urlCreator = window.URL || window.webkitURL;
          const imageUrl = urlCreator.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            urlCreator.revokeObjectURL(img.src);
            resolve(img);
          };
          img.onerror = () => resolve(null);
          img.src = imageUrl;
        }).catch(() => resolve(null));
      });
    }

    async function getImages(guid, folder, type, additional) {
      const URL_TEMPLATE = IMAGE_URL
        .replace('{FOLDER}', folder)
        .replace('{GUID}', guid)
        .replace('{TYPE}', type - 1);

      const big = newCanvas(BIG_WIDTH, BIG_HEIGHT);
      const small = newCanvas(SMALL_WIDTH, SMALL_HEIGHT);
      const images = [];

      for(let i=0; i<=additional; i++) {
        const url = URL_TEMPLATE.replace('{INDEX}', i.toString().padStart(2, '0'));
        const img = await loadImage(url);
        if(!img) {
          console.warn("Missing/broken image at:", url);
          continue;
        }
        let width, height, x, y;
        if(type === EXCHANGE_BLUEPRINT || (type === EXCHANGE_HOUSEHOLD && i > 0)) {
          width = Math.round(img.naturalHeight * BIG_WIDTH / BIG_HEIGHT);
          height = img.naturalHeight;
        } else {
          width = BIG_WIDTH;
          height = BIG_HEIGHT;
        }
        x = (img.naturalWidth - width) / 2;
        y = (img.naturalHeight - height) / 2;

        // for i=0, also do small image
        if(i === 0) {
          small.getContext('2d').drawImage(img, x, y, width, height, 0, 0, SMALL_WIDTH, SMALL_HEIGHT);
          images.push(small.toDataURL('image/jpeg').split('base64,')[1]);
        }
        big.getContext('2d').drawImage(img, x, y, width, height, 0, 0, BIG_WIDTH, BIG_HEIGHT);
        images.push(big.toDataURL('image/jpeg').split('base64,')[1]);
      }

      return images;
    }

    /* ---- ZIP CREATION ---- */
    function generateName(type, id, ext) {
      const typeStr = '0x' + type.toString(16).toLowerCase().padStart(8, '0');
      const idStr = '0x' + id.toString(16).toLowerCase().padStart(16, '0');
      return `${typeStr}!${idStr}.${ext}`;
    }

    function toggleDownload(scope, bool) {
      scope.vm.toggleDownload.toggling = bool;
      scope.$apply();
    }

    async function downloadItem(scope) {
      try {
        const uuid = scope.vm.uuid;
        const guid = uuid2Guid(uuid);
        const folder = getFilePath(guid);

        toggleDownload(scope, true);
        const zip = new JSZip();

        const [trayItem, type, id, additional, author, title] = await getTrayItem(uuid, guid, folder);
        zip.file(generateName(type, id, 'trayitem'), trayItem);

        const [typeStr, dataExt, imageExt, additionalExt] = EXTENSIONS[type];
        const dataItem = await getDataItem(guid, folder, type, id);
        zip.file(generateName(0, id, dataExt), dataItem);

        const images = await getImages(guid, folder, type, additional);
        images.forEach((data, i) => {
          let group = (i === 0) ? 2 : 3;
          let extension = (i < 2) ? imageExt : additionalExt;
          let newId = id;
          if(i >= 2) {
            let j = i - 1;
            group += (1 << (4 * type)) * j;
            if(type === EXCHANGE_HOUSEHOLD) {
              newId = newId.add(j);
            }
          }
          zip.file(generateName(group, newId, extension), data, { base64: true });
        });

        let filename = [
          author,
          '0x' + type.toString(16).toLowerCase().padStart(8, '0'),
          title,
          uuid.replace(/\+/g, '-').replace(/\//g, '_')
        ].join('__');
        // sanitize
        filename = filename.replace(/\s+/g, '_').replace(/[^a-z0-9.\-=_]/gi, '');

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, filename + '.zip');
      } catch(e) {
        reportError(e);
      }
      toggleDownload(scope, false);
    }

    /* ---- EXISTING CLICK ON THE DEFAULT ICON ---- */
    document.addEventListener('click', e => {
      let el = e.target;
      if(el.tagName === 'SPAN') el = el.parentNode.parentNode;
      else if(el.tagName === 'A') el = el.parentNode;

      // if user clicks the default download icon
      if(el.tagName === 'LI' && el.classList.contains('stream-tile__actions-download')) {
        e.stopPropagation();
        const scope = unsafeWindow.angular.element(el).scope();
        downloadItem(scope);
      }
    }, true);

      /* ---- CUSTOM DOWNLOAD BUTTON ----
   We'll insert it into <ul class="gallery-details__actions"> as a new <li>. */

      function addCustomDownloadButtons() {
          // Find all the <ul class="gallery-details__actions">
          const allLists = document.querySelectorAll('.gallery-details__actions');
          allLists.forEach(ul => {
              // Skip if we already added our button
              if (ul.querySelector('.custom-download-btn')) return;

              // Create a new <li> element
              const newLi = document.createElement('li');
              newLi.className = 'stream-tile__actions-item custom-download-li';

              // Create the actual button
              const btn = document.createElement('button');
              btn.textContent = 'Download';

              btn.classList.add('custom-download-btn');

              // Apply custom styling
              btn.style.backgroundColor = '#25a8e0';
              btn.style.color = '#ffffff';
              btn.style.padding = '8px 12px';
              btn.style.paddingLeft = '12px';
              btn.style.border = '2px solid #37464f';
              btn.style.borderBottom = '4px solid #37464f';
              btn.style.borderRadius = '15px';
              btn.style.cursor = 'pointer';
              btn.style.fontWeight = 'bold';
              btn.style.fontSize = '1.2rem';
              btn.style.transition = 'all 0.1s ease';
              btn.style.marginTop = '2px';
              btn.style.marginLeft = '15px';


              // Simulate :active behavior
              btn.addEventListener('mousedown', () => {
                  btn.style.borderBottom = '1px solid #37464f';
                  btn.style.transform = 'scale(0.98)';
              });

              btn.addEventListener('mouseup', () => {
                  btn.style.borderBottom = '4px solid #37464f';
                  btn.style.transform = 'scale(1)';
              });

              btn.addEventListener('mouseleave', () => {
                  btn.style.borderBottom = '4px solid #37464f';
                  btn.style.transform = 'scale(1)';
              });

              // On click, trigger the original download function
              btn.addEventListener('click', ev => {
                  ev.stopPropagation();
                  const tile = ul.closest('.stream-tile');
                  if (!tile) {
                      console.warn("Couldn't find .stream-tile");
                      return;
                  }
                  const originalDownload = tile.querySelector('.stream-tile__actions-download');
                  if (!originalDownload) {
                      console.warn("Can't find original download icon inside tile");
                      return;
                  }
                  const scope = unsafeWindow.angular.element(originalDownload).scope();
                  if (!scope || !scope.vm || !scope.vm.uuid) {
                      console.warn("Scope or vm.uuid is missing");
                      return;
                  }
                  downloadItem(scope);
              });

              newLi.appendChild(btn);
              ul.appendChild(newLi);
          });
      }

      // Run periodically to catch newly loaded tiles
      setInterval(addCustomDownloadButtons, 1500);

      console.log('TS4 gallery downloader with custom download button loaded.');
  })();

  /* A "force login" link in the top-left corner */
  const a = document.createElement('a');
  a.href = 'https://www.thesims.com/login?redirectUri=' + encodeURIComponent(document.location);
  a.innerHTML = '<b>force login</b>';
  a.style.background = 'grey';
  a.style.color = 'white';
  a.style.display = 'inline-block';
  a.style.position = 'absolute';
  a.style.top = '0';
  a.style.left = '0';
  a.style.height = '40px';
  a.style.lineHeight = '40px';
  a.style.padding = '0 15px';
  a.style.zIndex = 99999;
  document.body.appendChild(a);

})();
