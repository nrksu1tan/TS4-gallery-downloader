// ==UserScript==
// @name        TS4 Gallery Downloader — Fixed & Enhanced Edition
// @description Enhanced version of TS4 Gallery Downloader with visual improvements, custom styles, and better reliability for custom download button — build by nrksu1tan.
// @author      anadius + modifications from nrksu1tan
// @match       *://www.ea.com/*/games/the-sims/the-sims-4/pc/gallery*
// @match       *://www.ea.com/games/the-sims/the-sims-4/pc/gallery*
// @connect     sims4cdn.ea.com
// @connect     athena.thesims.com
// @connect     www.thesims.com
// @connect     thesims-api.ea.com
// @version     2.1.19
// @namespace   anadius.github.io
// @grant       unsafeWindow
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlhttpRequest
// @grant       GM.getResourceUrl
// @grant       GM_getResourceURL
// @grant       GM_addStyle
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
    GM_addStyle(`
    .row {
    background-image: linear-gradient(#299ed0, #00215dd1);
    }
    body {
    background-color: #00000061;
    }
    /* --- ---*/
    html {
    background: url(https://anadius.su/images/pattern.png);
    }

     /* Общий контейнер каждой карточки (tile) */
    .stream-tile--container {
      margin-bottom: 25px !important; /* чуть увеличим отступ */
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    /* Главное оформление карточки */
    .stream-tile {
      background: #ffffff;            /* белая подложка */
      border-radius: 10px;           /* скруглим углы */
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      padding: 10px;
      transition: transform 0.2s ease;
      position: relative;
    }

    /* Ховер-эффект: чуть поднимаем и усиливаем тень */
    .stream-tile--container:hover .stream-tile {
      transform: translateY(-4px);
      box-shadow: 0 5px 12px rgba(0,0,0,0.3);
    }

    /* Картинка превью лота */
    .scaled-image__container {
      border-radius: 8px; /* скругление под стать карточке */
      overflow: hidden;   /* обрезаем края, чтобы картинка не выходила за границы */
      max-height: 200px;  /* ограничим высоту, чтобы карточка не растягивалась */
      margin-bottom: 10px;
    }

    .stream-tile__image {
      width: 100%;
      height: auto; /* Пусть картинка пропорционально скейлится */
      display: block;
    }

    /* Блок с названием, автором */
    .stream-tile__creator {
      background: #f2f2f2;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 10px;
      cursor: default;
      position: relative;
    }
    .stream-tile__creator-row {
      display: flex;
      align-items: center;
    }
    .stream-tile__creator-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
      border: 2px solid #fff;
      box-shadow: 0 0 2px rgba(0,0,0,0.2);
    }
    .stream-tile__creator-title {
      margin: 0;
      padding: 0;
    }
    .stream-tile__creator-name {
      display: block;
      font-size: 0.9rem;
      color: #333;
      text-decoration: underline;
      margin-top: 3px;
    }
    .stream-tile__creator-name:hover {
      text-decoration: none;
    }

    /* Кнопки действий (лайк, даунлоад, флаг и т.д.) */
    .gallery-details__actions {
      display: flex;
      justify-content: space-between; /* Распределим элементы */
      align-items: center;
      margin: 0;
      padding: 0 5px;
      list-style: none;
    }
    .stream-tile__actions-item {
      display: inline-flex;
      align-items: center;
    }

    .stream-tile__icon {
      margin-right: 4px;
    }

    /* Пример, как можно стилизовать счётчики лайков/скачиваний */
    .stream-tile__icon--favorite,
    .stream-tile__icon--download {
      font-weight: bold;
      color: #25a8e0; /* наш "фирменный" голубой */
    }

    /* Кнопка для Download, которую мы добавляли вручную */
    .custom-download-btn {
      background-color: #ffab00; /* можно выбрать другой приятный цвет */
      color: #fff;
      padding: 8px 12px;
      border: 2px solid #e87d00;
      border-bottom-width: 4px;
      border-radius: 15px;
      cursor: pointer;
      font-weight: bold;
      font-size: 1.0rem;
      transition: all 0.1s ease;
      margin: 2px 0 2px 10px;
      outline: none;
    }
    .custom-download-btn:active {
      transform: scale(0.97);
      border-bottom-width: 2px;
    }

    /* Иконка флага */
    .stream-tile__icon--flag {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjQnIGhlaWdodD0nMjQnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNOSA0SDIyTDE5IDIwSDEwTDEwIDIxSDkgMjFMMyAyMUwzIDRIN1oiIHN0cm9rZT0nIzMzMycgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PC9zdmc+');
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 16px 16px;
      width: 16px;
      height: 16px;
      opacity: 0.6;
    }

    /* Прятать серую полоску "Предмет удален из Галереи" если item не удалён */
    .stream-tile__removed {
      display: none !important;
    }
    /* Или стилизовать, если реально нужно показывать */
    /*.stream-tile__removed {
      background: #ff4c4c;
      color: #fff;
      font-weight: bold;
      padding: 8px;
      border-radius: 5px;
      margin-bottom: 8px;
    }*/
    .search-browse {
    margin-bottom: 2.5rem;
    margin-top: 2.3rem;
    padding: 6.3rem 1.5rem .7rem;
    position: relative;
    background-image: linear-gradient(#ffffff 71%, #ffffff00);
}

      `);


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


    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function reportError(e) {
        if(e.name && e.message && e.stack) {
            alert(`${e.name}\n\n${e.message}\n\n${e.stack}`);
        } else {
            alert(e);
        }
    }


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

    /* UUID, GUID, FNV */
    function dashify(uuid) {
        var slice = String.prototype.slice,
            indices = [[0, 8],[8, 12],[12, 16],[16, 20],[20]];
        return indices.map(function(index) {
            return slice.apply(uuid, index);
        }).join("-");
    }

    function uuid2Guid(uuid) {
        if (uuid.indexOf("-") !== -1) return uuid.toUpperCase();
        var decoded;
        try {
            decoded = atob(uuid);
        } catch (err) {
            return false;
        }
        var guid = "";
        for (var i = 0; i < decoded.length; i++) {
            var ch = decoded.charCodeAt(i);
            var hi = (ch & 240) >> 4;
            hi = hi.toString(16);
            var lo = (ch & 15);
            lo = lo.toString(16);
            guid += (hi + lo);
        }
        return dashify(guid).toUpperCase();
    }

    function getFilePath(guid) {
        var bfnvInit = 2166136261;
        var fnvInit = bfnvInit;
        for (var i = 0; i < guid.length; ++i) {
            fnvInit += (fnvInit << 1) + (fnvInit << 4) + (fnvInit << 7) + (fnvInit << 8) + (fnvInit << 24);
            fnvInit ^= guid.charCodeAt(i);
        }
        var result = (fnvInit >>> 0) % 1e4;
        result = result.toString(16);
        return "0x" + "00000000".substr(0, 8 - result.length) + result;
    }


    let root;
    async function loadProtobuf() {
        let data = await fetch(await GM.getResourceUrl('bundle.json'));
        let jsonDescriptor = await data.json();
        root = protobuf.Root.fromJSON(jsonDescriptor);
    }

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
                // OK
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

    /*  trayitem */
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
            throw "Не удалось скачать tray file. Возможно, лот удалён из Галереи.";
        }


        const [parsedMessage, messageClass] = parseMessageObj(message, "EA.Sims4.Network.TrayMetadata");

        parsedMessage.id = getRandomId();


        let additional = 0;
        if(parsedMessage.type === EXCHANGE_BLUEPRINT) {
            additional = parsedMessage.metadata.bp_metadata.num_thumbnails - 1;
        } else if(parsedMessage.type === EXCHANGE_HOUSEHOLD) {
            additional = parsedMessage.metadata.hh_metadata.sim_data.length;

            parsedMessage.metadata.hh_metadata.sim_data.forEach((sim, i) => {
                sim.id = parsedMessage.id.add(i + 1);
            });
        }

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


    async function getDataItem(guid, folder, type, id) {
        let response;
        try {
            response = await xhr({
                url: DATA_ITEM_URL.replace('{FOLDER}', folder).replace('{GUID}', guid),
                responseType: 'arraybuffer'
            });
        } catch(e) {
            if(e.name === 'GMXHRError' && e.status === 404) {
                throw "Не удалось скачать .dat файл. Лот скорее всего удалён из Галереи.";
            } else {
                throw e;
            }
        }

        if(type !== EXCHANGE_HOUSEHOLD) {

            return response;
        }


        const messageClass = root.lookupTypeOrEnum('EA.Sims4.Network.FamilyData');
        const totalBytes = response.byteLength;
        if(totalBytes < 8) {
            console.warn("Слишком короткий .dat файл (<8 байт). Возвращаю как есть.");
            return response;
        }
        const view = new DataView(response);
        let len = view.getUint32(4, true);
        if(totalBytes < 8 + len) {
            console.warn(`Обрезанный .dat: ожидается >= ${8+len}, есть ${totalBytes}. Возвращаю как есть.`);
            return response;
        }

        const prefix = new Uint8Array(response, 0, 4);
        const message = messageClass.decode(new Uint8Array(response, 8, len));
        const suffix = new Uint8Array(response, 8 + len);


        const newIdsDict = {};
        const sims = message.family_account.sim;
        sims.forEach((sim, i) => {
            newIdsDict[sim.sim_id.toString()] = id.add(i+1);
        });
        sims.forEach(sim => {
            sim.sim_id = newIdsDict[sim.sim_id.toString()];
            sim.significant_other = newIdsDict[sim.significant_other?.toString()];
            sim.attributes?.genealogy_tracker?.family_relations?.forEach(r => {
                const newId = newIdsDict[r.sim_id.toString()];
                if(newId) r.sim_id = newId;
            });
        });


        let editedMessage;
        try {
            editedMessage = new Uint8Array(messageClass.encode(message).finish());
        } catch(err) {
            console.error("Ошибка при ре-энкоде .dat:", err);
            return response;
        }


        const resultArray = new Uint8Array(8 + editedMessage.length + suffix.length);
        resultArray.set(prefix);
        new DataView(resultArray.buffer).setUint32(4, editedMessage.length, true);
        resultArray.set(editedMessage, 8);
        resultArray.set(suffix, 8 + editedMessage.length);
        return resultArray.buffer;
    }


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
                console.warn("Картинки нет или битая:", url);
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


            if(i === 0) {
                small.getContext('2d').drawImage(img, x, y, width, height, 0, 0, SMALL_WIDTH, SMALL_HEIGHT);
                images.push(small.toDataURL('image/jpeg').split('base64,')[1]);
            }
            big.getContext('2d').drawImage(img, x, y, width, height, 0, 0, BIG_WIDTH, BIG_HEIGHT);
            images.push(big.toDataURL('image/jpeg').split('base64,')[1]);
        }

        return images;
    }


    function generateName(type, id, ext) {
        const typeStr = '0x' + type.toString(16).toLowerCase().padStart(8, '0');
        const idStr   = '0x' + id.toString(16).toLowerCase().padStart(16, '0');
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

            // 1. TrayItem
            const [trayItem, type, id, additional, author, title] = await getTrayItem(uuid, guid, folder);
            zip.file(generateName(type, id, 'trayitem'), trayItem);

            // 2. Data (Lot/Room/Household)
            const [typeStr, dataExt, imageExt, additionalExt] = EXTENSIONS[type];
            const dataItem = await getDataItem(guid, folder, type, id);
            zip.file(generateName(0, id, dataExt), dataItem);


            const images = await getImages(guid, folder, type, additional);
            images.forEach((data, i) => {
                let group = (i === 0) ? 2 : 3; // 2 = small
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

            filename = filename.replace(/\s+/g, '_').replace(/[^a-z0-9.\-=_]/gi, '');


            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, filename + '.zip');

        } catch(e) {
            reportError(e);
        } finally {
            toggleDownload(scope, false);
        }
    }

    document.addEventListener('click', e => {
        let el = e.target;
        if(el.tagName === 'SPAN') el = el.parentNode.parentNode;
        else if(el.tagName === 'A') el = el.parentNode;

        if(el.tagName === 'LI' && el.classList.contains('stream-tile__actions-download')) {
            e.stopPropagation();
            const scope = unsafeWindow.angular.element(el).scope();
            downloadItem(scope);
        }
    }, true);



    function addCustomDownloadButtons() {

        const allLists = document.querySelectorAll('.gallery-details__actions');
        allLists.forEach(ul => {

            if (ul.querySelector('.custom-download-btn')) return;


            const newLi = document.createElement('li');
            newLi.className = 'stream-tile__actions-item custom-download-li';


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


            btn.addEventListener('click', ev => {
                ev.stopPropagation();


                let scopeEl = ul;
                let scope;
                while(scopeEl && scopeEl !== document.documentElement) {
                    const tempScope = unsafeWindow.angular.element(scopeEl).scope();
                    if(tempScope && tempScope.vm && tempScope.vm.uuid) {
                        scope = tempScope;
                        break;
                    }
                    scopeEl = scopeEl.parentElement;
                }

                if (!scope || !scope.vm || !scope.vm.uuid) {
                    console.warn("Не удалось найти Angular scope или vm.uuid");
                    return;
                }
                downloadItem(scope);
            });

            newLi.appendChild(btn);
            ul.appendChild(newLi);
        });
    }


    setInterval(addCustomDownloadButtons, 1500);


    const a = document.createElement('a');
    a.href = 'https://www.thesims.com/login?redirectUri=' + encodeURIComponent(document.location);
    a.innerHTML = '<b>force login</b>';
    Object.assign(a.style, {
        background: 'grey',
        color: 'white',
        display: 'inline-block',
        position: 'absolute',
        top: '0',
        left: '0',
        height: '40px',
        lineHeight: '40px',
        padding: '0 15px',
        zIndex: 99999
    });
    document.body.appendChild(a);


    (async () => {
        await loadProtobuf();
        console.log('TS4 gallery downloader – всё загружено и готово!');
    })();

})();
