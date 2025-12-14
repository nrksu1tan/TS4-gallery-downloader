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
// @connect     raw.githubusercontent.com
// @version     3.1
// @namespace   anadius.github.io
// @grant       unsafeWindow
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlhttpRequest
// @grant       GM.getResourceUrl
// @grant       GM_getResourceURL
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @icon        https://anadius.github.io/ts4installer-tumblr-files/userjs/sims-4-gallery-downloader.png
// @resource    bundle.json https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/refs/heads/main/assets/bundle.min.json
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

    const CURRENT_VERSION = "3.1";
    const GITHUB_REPO_URL = "https://github.com/nrksu1tan/TS4-gallery-downloader";
    const GITHUB_ISSUES_URL = "https://github.com/nrksu1tan/TS4-gallery-downloader/issues/new";
    const GITHUB_RAW_URL = "https://github.com/nrksu1tan/TS4-gallery-downloader/raw/refs/heads/main/mod%20versions/TS4%20Gallery%20Downloader%20%E2%80%94%20Fixed%20&%20Enhanced.user.js";

    GM_addStyle(`
    .row { background-image: linear-gradient(#299ed0, #00215dd1); }
    body { background-color: #00000061; }
    html { background: url(https://anadius.su/images/pattern.png); }

    .stream-tile--container { margin-bottom: 25px !important; position: relative; overflow: hidden; transition: transform 0.2s ease; }
    .stream-tile { background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 10px; transition: transform 0.2s ease; position: relative; }
    .stream-tile--container:hover .stream-tile { transform: translateY(-4px); box-shadow: 0 8px 15px rgba(0,0,0,0.15); }
    .scaled-image__container { border-radius: 6px; overflow: hidden; max-height: 200px; margin-bottom: 10px; }
    .stream-tile__image { width: 100%; height: auto; display: block; }
    .stream-tile__creator { background: #f4f4f4; padding: 10px; border-radius: 4px; margin-bottom: 10px; cursor: default; position: relative; }
    .stream-tile__creator-row { display: flex; align-items: center; }
    .stream-tile__creator-image { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; border: 2px solid #fff; }
    .stream-tile__creator-name { display: block; font-size: 0.9rem; color: #333; text-decoration: underline; margin-top: 3px; }
    .stream-tile__creator-name:hover { text-decoration: none; }
    .gallery-details__actions { display: flex; justify-content: space-between; align-items: center; margin: 0; padding: 0 5px; list-style: none; }
    .stream-tile__actions-item { display: inline-flex; align-items: center; }
    .stream-tile__icon { margin-right: 4px; }
    .stream-tile__icon--favorite, .stream-tile__icon--download { font-weight: 600; color: #0074d9; }
    .stream-tile__removed { display: none !important; }
    .search-browse { margin-bottom: 2.5rem; margin-top: 2.3rem; padding: 6.3rem 1.5rem .7rem; position: relative; background-image: linear-gradient(#ffffff 71%, #ffffff00); }

    .custom-download-btn {
      background-color: #0074d9; /* Professional Blue */
      color: #ffffff;
      padding: 6px 14px;
      border: 1px solid #0056a3;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background-color 0.2s ease;
      margin: 2px 0 2px 10px;
      outline: none;
      font-family: 'Open Sans', sans-serif;
    }
    .custom-download-btn:hover { background-color: #0056a3; }
    .custom-download-btn:active { transform: translateY(1px); }

    #ts4-glass-modal {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .ts4-glass-content {
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.5);
        padding: 40px;
        border-radius: 16px;
        width: 480px;
        max-width: 90%;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        text-align: left;
        color: #333;
    }
    .ts4-glass-header {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 10px;
        color: #111;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        padding-bottom: 15px;
    }
    .ts4-glass-body p {
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 15px;
        color: #444;
    }
    .ts4-meta {
        font-size: 13px;
        background: rgba(0,0,0,0.05);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 25px;
        color: #555;
    }
    .ts4-meta a {
        color: #0074d9;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
    }
    .ts4-meta a:hover { color: #0056a3; text-decoration: underline; }
    .ts4-btn-primary {
        background-color: #111;
        color: white;
        border: none;
        padding: 10px 24px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: opacity 0.2s;
        float: right;
    }
    .ts4-btn-primary:hover { opacity: 0.8; }

    /* Update Notification */
    #ts4-update-toast {
        position: fixed;
        bottom: 20px; right: 20px;
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: sans-serif;
        font-size: 13px;
        z-index: 1000000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 15px;
        backdrop-filter: blur(4px);
    }
    #ts4-update-toast a { color: #4dabf7; text-decoration: none; font-weight: bold; }
    #ts4-update-toast a:hover { text-decoration: underline; }
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


    // --- LOGGING SYSTEM ---
    function logSuccess(title, author, type, uuid) {
        const itemUrl = `https://www.ea.com/games/the-sims/the-sims-4/pc/gallery/${uuid}`;
        console.group(`%c TS4 Downloader: Downloaded ${title}`, 'color: #2ecc71; font-weight: bold; font-size: 13px;');
        console.log(`%c Name:`, 'color:#999', title);
        console.log(`%c Author:`, 'color:#999', author);
        console.log(`%c Type:`, 'color:#999', type);
        console.log(`%c UUID:`, 'color:#999', uuid);
        console.log(`%c Time:`, 'color:#999', new Date().toLocaleTimeString());
        console.log(`%c 🔗 Check Item:`, 'font-weight:bold; color: #3498db', itemUrl);
        console.groupEnd();
    }

    function logFailure(context, error, uuid) {
        console.group(`%c TS4 Downloader: Error in ${context}`, 'color: #e74c3c; font-weight: bold; font-size: 13px;');
        console.log(`%c Reason:`, 'font-weight:bold', error.message || error);
        console.log(`%c UUID:`, 'font-weight:bold', uuid);
        console.log(`%c Details:`, 'color:#999', error);
        console.log(`%c 🆘 Report Issue:`, 'font-weight:bold; color: #3498db;', GITHUB_ISSUES_URL);
        console.groupEnd();
    }

    // --- UI & UPDATES ---
    function showWelcomeModal() {
        const lastSeenVersion = localStorage.getItem('ts4_gallery_seen_version');
        if (lastSeenVersion === CURRENT_VERSION) return;

        const modal = document.createElement('div');
        modal.id = 'ts4-glass-modal';
        modal.innerHTML = `
            <div class="ts4-glass-content">
                <div class="ts4-glass-header">TS4 Gallery Downloader</div>
                <div class="ts4-glass-body">
                    <p>Script initialized successfully. You can now download Households, Lots, Rooms, and Tattoos directly from the EA Gallery.</p>
                    <div class="ts4-meta">
                        Version: <b>${CURRENT_VERSION}</b><br>
                        Developer: <a href="${GITHUB_REPO_URL}" target="_blank">nrksu1tan</a>
                    </div>
                    <p>To use: Click the new "Download" button on any gallery item.</p>
                    <button class="ts4-btn-primary" id="ts4-close-btn">Close</button>
                    <div style="clear:both;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('ts4-close-btn').addEventListener('click', () => {
            modal.style.opacity = '0';
            localStorage.setItem('ts4_gallery_seen_version', CURRENT_VERSION);
            setTimeout(() => modal.remove(), 300);
        });
    }

    function checkForUpdates() {
        const lastCheck = localStorage.getItem('ts4_update_check_time');
        const now = Date.now();
        // Check once every 24 hours (86400000 ms)
        if (lastCheck && (now - parseInt(lastCheck)) < 86400000) return;

        console.log('Checking for updates...');
        GM.xmlHttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL + '?t=' + now, // cache buster
            onload: function(response) {
                localStorage.setItem('ts4_update_check_time', now.toString());
                if (response.status === 200) {
                    const match = response.responseText.match(/@version\s+([\d.]+)/);
                    if (match && match[1]) {
                        const remoteVersion = match[1];
                        if (remoteVersion > CURRENT_VERSION) {
                            showUpdateNotification(remoteVersion);
                        }
                    }
                }
            }
        });
    }

    function showUpdateNotification(newVersion) {
        const toast = document.createElement('div');
        toast.id = 'ts4-update-toast';
        toast.innerHTML = `
            <span>New version available: <b>${newVersion}</b></span>
            <a href="${GITHUB_REPO_URL}" target="_blank">Update</a>
            <span style="cursor:pointer; margin-left:10px; opacity:0.6;" onclick="this.parentElement.remove()">✕</span>
        `;
        document.body.appendChild(toast);
    }


    // --- CORE LOGIC (PROTOBUF & DOWNLOAD) ---

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const xhr = details => new Promise((resolve, reject) => {
        const stack = new Error().stack;
        const reject_xhr = res => {
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
        if (key === 'dynamicAreas' || key2 === 'dynamic_areas') {
            return null;
        }
        const nameParts = [];
        let msgClass = messageClass;
        while(msgClass.name !== "" && typeof msgClass.name !== "undefined") {
            nameParts.unshift(msgClass.name);
            msgClass = msgClass.parent;
        }
        return null;
    }

    function parseValue(value, fieldType, isParentArray) {
        let parsedValue = value;
        const valueType = typeof value;

        if (valueType === "object" && value !== null) {
            if (Array.isArray(value)) {
                if (isParentArray) throw "No clue how to handle array of arrays";
                parsedValue = parseMessageArray(value, fieldType);
            } else {
                [parsedValue] = parseMessageObj(value, fieldType);
            }
        }
        else if (valueType === "string") {
            if (fieldType === "string" || fieldType === "bytes") {
            } else if (LONG_TYPES.includes(fieldType)) {
                parsedValue = Long.fromValue(value);
            } else {
                try {
                    parsedValue = root.lookupEnum(fieldType).values[value.split('.').pop()];
                } catch (e) {
                    parsedValue = 0;
                }
            }
        }
        else if (LONG_TYPES.includes(fieldType)) {
            if (value === undefined || value === null) {
                parsedValue = Long.fromValue(0);
            } else {
                parsedValue = Long.fromValue(value);
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

        // 1. Parse standard keys
        for (let i = 0; i < keys.length; i++) {
            const key = findKeyName(keys[i], messageClass);
            if (key !== null) {
                parsedMessage[key] = parseValue(messageObj[keys[i]], messageClass.fields[key].type);
            }
        }

        // 2. AGGRESSIVE FIX FOR MISSING DATA
        if (className.includes("WebTraitTracker")) {
            const resourceKeyFields = ['icon_key', 'cas_selected_icon_key', 'icon', 'icon_high_res'];
            resourceKeyFields.forEach(field => {
                if (messageClass.fields[field]) {
                    if (!parsedMessage[field] || typeof parsedMessage[field] !== 'object') {
                        parsedMessage[field] = { type: 0, group: 0, instance: Long.fromValue(0) };
                    } else {
                        if (!parsedMessage[field].instance) parsedMessage[field].instance = Long.fromValue(0);
                        if (parsedMessage[field].type === undefined) parsedMessage[field].type = 0;
                        if (parsedMessage[field].group === undefined) parsedMessage[field].group = 0;
                    }
                }
            });
        }

        for (const fieldName in messageClass.fields) {
            const field = messageClass.fields[fieldName];
            if (parsedMessage[fieldName] === undefined || parsedMessage[fieldName] === null) {
                if (field.repeated) {
                    parsedMessage[fieldName] = [];
                } else if (LONG_TYPES.includes(field.type)) {
                    parsedMessage[fieldName] = Long.fromValue(0);
                } else if (["uint32", "int32", "float", "double"].includes(field.type)) {
                    parsedMessage[fieldName] = 0;
                } else if (field.type === "bool") {
                    parsedMessage[fieldName] = false;
                } else if (field.resolvedType && field.resolvedType.fields) {
                    const [emptyChild] = parseMessageObj({}, field.type);
                    parsedMessage[fieldName] = emptyChild;
                }
            } else {
                if (field.type.includes("ResourceKey")) {
                     let rKey = parsedMessage[fieldName];
                     if (rKey && (rKey.instance === undefined || rKey.instance === null)) {
                         rKey.instance = Long.fromValue(0);
                     }
                }
            }
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
            throw new Error("API Error: Item might be hidden or removed.");
        }

        const [parsedMessage, messageClass] = parseMessageObj(message, "EA.Sims4.Network.TrayMetadata");

        if (parsedMessage.type === undefined || parsedMessage.type === null) {
            parsedMessage.type = EXCHANGE_HOUSEHOLD;
        }

        parsedMessage.id = getRandomId();

        let additional = 0;
        if(parsedMessage.type === EXCHANGE_BLUEPRINT) {
            additional = parsedMessage.metadata.bp_metadata.num_thumbnails - 1;
        } else if(parsedMessage.type === EXCHANGE_HOUSEHOLD) {
            if (parsedMessage.metadata && parsedMessage.metadata.hh_metadata && parsedMessage.metadata.hh_metadata.sim_data) {
                additional = parsedMessage.metadata.hh_metadata.sim_data.length;
                parsedMessage.metadata.hh_metadata.sim_data.forEach((sim, i) => {
                    sim.id = parsedMessage.id.add(i + 1);
                });
            } else {
                 additional = 1;
            }
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
                throw new Error("Data file (.dat) missing from server.");
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
            console.warn("Invalid .dat file size. Using original.");
            return response;
        }
        const view = new DataView(response);
        let len = view.getUint32(4, true);
        if(totalBytes < 8 + len) {
            console.warn(`Truncated .dat file. Using original.`);
            return response;
        }

        const prefix = new Uint8Array(response, 0, 4);

        let message;
        try {
            message = messageClass.decode(new Uint8Array(response, 8, len));
        } catch (err) {
            console.warn("Protobuf decode failed (likely Tattoo/Accessory). Using original file.");
            return response;
        }

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
            console.error("Error re-encoding .dat:", err);
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
                console.warn("Image missing:", url);
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
        const uuid = scope.vm.uuid;
        try {
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

            filename = filename.replace(/\s+/g, '_').replace(/[^a-z0-9.\-=_]/gi, '');

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, filename + '.zip');

            logSuccess(title, author, typeStr, uuid);

        } catch(e) {
            alert("Download Failed! Check console (F12) for details.");
            logFailure("Download Process", e, uuid);
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

            btn.addEventListener('mousedown', () => {
                btn.style.borderBottom = '1px solid #0056a3';
                btn.style.transform = 'scale(0.98)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.borderBottom = '4px solid #0056a3';
                btn.style.transform = 'scale(1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderBottom = '4px solid #0056a3';
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
                    console.warn("TS4 Downloader: Failed to find Angular scope.");
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
        console.log('%c TS4 Gallery Downloader v' + CURRENT_VERSION + ' Ready', 'color: #2ecc71; font-weight: bold; font-size: 14px;');
        setTimeout(showWelcomeModal, 1000);
        checkForUpdates();
    })();

})();
