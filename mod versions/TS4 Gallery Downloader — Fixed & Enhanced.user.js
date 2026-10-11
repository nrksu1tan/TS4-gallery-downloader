// ==UserScript==
// @name        TS4 Gallery Downloader — Fixed & Enhanced Edition v3.6.7
// @description Enhanced version with parallel image loading, toast notifications, download protection, semver updates, and i18n — build by nrksu1tan.
// @author      anadius + modifications from nrksu1tan
// @match       *://www.ea.com/*games/the-sims/the-sims-4/gallery*
// @connect     sims4cdn.ea.com
// @connect     athena.thesims.com
// @connect     www.thesims.com
// @connect     thesims-api.ea.com
// @connect     raw.githubusercontent.com
// @connect     github.com
// @downloadURL https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/mod%20versions/TS4%20Gallery%20Downloader%20%E2%80%94%20Fixed%20%26%20Enhanced.user.js
// @updateURL   https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/mod%20versions/TS4%20Gallery%20Downloader%20%E2%80%94%20Fixed%20%26%20Enhanced.user.js
// @version     3.6.7
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

(function () {
    'use strict';

    if (!/\/games\/the-sims\/the-sims-4\/gallery/.test(location.pathname)) return;

    const CURRENT_VERSION = "3.6.7";
    const GITHUB_REPO_URL = "https://github.com/nrksu1tan/TS4-gallery-downloader";
    const GITHUB_ISSUES_URL = "https://github.com/nrksu1tan/TS4-gallery-downloader/issues/new";
    const GITHUB_RAW_URL = "https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/mod%20versions/TS4%20Gallery%20Downloader%20%E2%80%94%20Fixed%20%26%20Enhanced.user.js";

    const isRU = navigator.language.toLowerCase().startsWith('ru');
    const i18n = {
        btnDownload: isRU ? 'Скачать' : 'Download',
        btnDownloading: isRU ? 'Загрузка...' : 'Downloading...',
        toastSuccess: isRU ? 'успешно скачан!' : 'downloaded successfully!',
        toastFail: isRU ? 'Ошибка загрузки:' : 'Download failed:',
        toastNoScope: isRU ? 'Не удалось определить элемент - обновите страницу' : 'Could not identify gallery item - try refreshing',
        toastInitFail: isRU ? 'Скрипт не смог инициализироваться. Проверьте консоль (F12).' : 'Script failed to initialize. Check console (F12).',
        modalTitle: isRU ? '📥 TS4 Downloader обновлен' : '📥 TS4 Downloader Updated',
        modalBody: isRU ? 'Скрипт успешно установлен и готов к работе. Теперь вы можете скачивать постройки и симов напрямую из галереи The Sims 4 в один клик.' : 'The script is successfully installed and ready. You can now download builds and sims directly from the Sims 4 Gallery in one click.',
        modalVersion: isRU ? 'Версия скрипта:' : 'Script version:',
        modalDeveloper: isRU ? 'Разработчик:' : 'Developer:',
        modalThanks: isRU ? 'Если этот инструмент сэкономил вам время, лучшей благодарностью за мою работу будет <b>звездочка (Star)</b> проекту на GitHub. Это бесплатно, но очень мотивирует меня выпускать обновления! ⭐' : 'If this tool saves you time, the best way to say thanks for my work is to leave a <b>Star</b> on GitHub. It is free for you, but greatly motivates me to keep updating! ⭐',
        modalBtnStar: isRU ? '⭐ Поддержать автора' : '⭐ Support the author',
        modalBtnClose: isRU ? 'Понятно, спасибо' : 'Got it, thanks',
        updateText: isRU ? 'Доступна новая версия' : 'New version available',
        updateBtn: isRU ? 'Обновить' : 'Update',
        forceLogin: isRU ? 'Принудительный вход' : 'Force Login'
    };

    GM_addStyle(`
    .row { background-image: linear-gradient(#299ed0, #00215dd1); }
    body { background-color: #00000061; }

    .custom-download-btn {
        position: relative; overflow: hidden; background-color: #2ecc71; color: #fff;
        padding: 4px 12px; border: none; border-bottom: 2px solid #27ae60; border-radius: 8px;
        cursor: pointer; font-weight: 700; font-size: 13px; font-family: 'Open Sans', -apple-system, sans-serif;
        transition: all 0.15s ease; margin-left: auto; outline: none; white-space: nowrap;
        min-width: 80px; text-align: center; user-select: none; box-shadow: 0 2px 4px rgba(46, 204, 113, 0.2);
        z-index: 10;
    }
    .custom-download-btn:hover:not(:disabled) { background-color: #27ae60; box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3); }
    .custom-download-btn:active:not(:disabled) { border-bottom-width: 1px; box-shadow: none; transform: translateY(1px); }
    .custom-download-btn:disabled { background-color: #a8e6cf; border-bottom-color: #88d4ab; cursor: not-allowed; opacity: 0.9; box-shadow: none; }
    .custom-download-btn.is-loading::after {
        content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: btn-shimmer 1.2s infinite;
    }
    @keyframes btn-shimmer { 0% { left: -60%; } 100% { left: 160%; } }
    .custom-download-btn .btn-progress { position: absolute; bottom: 0; left: 0; height: 3px; width: 0%; background: rgba(255,255,255,0.8); transition: width 0.3s ease; border-radius: 0 0 8px 8px; }

    #ts4-toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 1000000; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
    .ts4-toast {
        display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 12px;
        font-family: -apple-system, system-ui, sans-serif; font-size: 14px; font-weight: 500;
        color: #fff; background: #222; box-shadow: 0 8px 24px rgba(0,0,0,0.15); pointer-events: auto; max-width: 380px; width: max-content;
        animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: bottom right;
    }
    .ts4-toast.is-hiding { animation: toast-out 0.3s ease forwards; }
    @keyframes toast-in { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes toast-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.8) translateY(20px); } }
    .ts4-toast--success { background: #2ecc71; }
    .ts4-toast--error { background: #e74c3c; }
    .ts4-toast--warn { background: #f39c12; }
    .ts4-toast--info { background: #3498db; }
    .ts4-toast-icon { font-size: 20px; line-height: 1; flex-shrink: 0; }
    .ts4-toast-text { flex: 1; line-height: 1.4; }
    .ts4-toast-close { opacity: 0.6; cursor: pointer; font-size: 18px; flex-shrink: 0; transition: opacity 0.2s; background: none; border: none; color: #fff; padding: 0; line-height: 1; margin-left: 4px; }
    .ts4-toast-close:hover { opacity: 1; }
    .ts4-toast a { color: #fff; text-decoration: underline; font-weight: 700; opacity: 0.9; }
    .ts4-toast a:hover { opacity: 1; }

    #ts4-glass-modal {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
        z-index: 999999; display: flex; justify-content: center; align-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        animation: modal-fade-in 0.3s ease forwards;
    }
    @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
    .ts4-glass-content {
        background: #ffffff; padding: 32px; border-radius: 20px; width: 440px; max-width: 90%; box-shadow: 0 24px 48px rgba(0,0,0,0.2);
        animation: modal-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes modal-slide-in { from { transform: translateY(30px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    .ts4-glass-header { font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #111; display: flex; align-items: center; gap: 8px; }
    .ts4-glass-body p { font-size: 15px; line-height: 1.5; margin-bottom: 16px; color: #333; }
    .ts4-meta { font-size: 13px; background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; color: #555; line-height: 1.6; }
    .ts4-btn-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .ts4-btn-primary { background: #2ecc71; color: #fff; border: none; border-bottom: 3px solid #27ae60; padding: 10px 24px; font-size: 14px; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .ts4-btn-primary:hover { background: #27ae60; transform: translateY(-1px); }
    .ts4-btn-primary:active { transform: translateY(1px); border-bottom-width: 1px; }
    .ts4-btn-link { color: #333; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; padding: 10px 16px; border-radius: 10px; transition: all 0.2s; border: 1px solid #ddd; display: flex; align-items: center; gap: 6px; }
    .ts4-btn-link:hover { background: #f8f9fa; border-color: #ccc; }

    .ts4-login-btn {
        position: fixed; top: 12px; left: 12px; z-index: 99999;
        background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px);
        color: #333; font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600;
        text-decoration: none; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s ease;
    }
    .ts4-login-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #0074d9; }
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
        [EXCHANGE_ROOM]:      ['Room', 'room', 'rmi', null]
    };
    const BIG_WIDTH = 591, BIG_HEIGHT = 394, SMALL_WIDTH = 300, SMALL_HEIGHT = 200;
    const LONG_TYPES = ["sint64", "uint64", "int64", "sfixed64", "fixed64"];

    const TOAST_ICONS = { success: '✓', error: '✕', warn: '⚠', info: 'ℹ' };

    function getToastContainer() {
        let c = document.getElementById('ts4-toast-container');
        if (!c) { c = document.createElement('div'); c.id = 'ts4-toast-container'; document.body.appendChild(c); }
        return c;
    }

    function showToast(message, type = 'info', duration = 5000) {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `ts4-toast ts4-toast--${type}`;
        toast.innerHTML = `
            <span class="ts4-toast-icon">${TOAST_ICONS[type] || 'ℹ'}</span>
            <span class="ts4-toast-text">${message}</span>
            <button class="ts4-toast-close" title="Close">✕</button>
        `;

        const dismiss = () => {
            toast.classList.add('is-hiding');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.ts4-toast-close').addEventListener('click', dismiss);
        container.appendChild(toast);
        if (duration > 0) setTimeout(dismiss, duration);
        return toast;
    }

    function logSuccess(title, author, type, uuid) {
        const itemUrl = `https://www.ea.com/games/the-sims/the-sims-4/gallery/${encodeURIComponent(uuid)}`;
        console.group(`%c TS4 Downloader: Downloaded ${title}`, 'color:#2ecc71;font-weight:bold;font-size:13px;');
        console.log('%c Name:',   'color:#999', title);
        console.log('%c Author:', 'color:#999', author);
        console.log('%c Type:',   'color:#999', type);
        console.log('%c UUID:',   'color:#999', uuid);
        console.log('%c Time:',   'color:#999', new Date().toLocaleTimeString());
        console.log('%c 🔗 Check Item:', 'font-weight:bold;color:#3498db', itemUrl);
        console.groupEnd();
    }

    function logFailure(context, error, uuid) {
        console.group(`%c TS4 Downloader: Error in ${context}`, 'color:#e74c3c;font-weight:bold;font-size:13px;');
        console.log('%c Reason:',       'font-weight:bold', error.message || error);
        console.log('%c UUID:',         'font-weight:bold', uuid);
        console.log('%c Details:',      'color:#999', error);
        console.log('%c 🆘 Report:',    'font-weight:bold;color:#3498db;', GITHUB_ISSUES_URL);
        console.groupEnd();
    }

    const xhr = details => new Promise((resolve, reject) =>
        GM.xmlHttpRequest(Object.assign({ method: 'GET' }, details, {
            onload:  res => {
                if (res.status === 404) {
                    reject(new Error(`404 Not Found: ${details.url}`));
                    return;
                }
                if (res.status < 200 || res.status >= 300) {
                    reject(new Error(`HTTP ${res.status} on ${details.url}`));
                    return;
                }
                resolve(res.response);
            },
            onerror: ()  => reject(new Error(`Network Error: ${details.url}`))
        }))
    );

    function isNewerVersion(remote, current) {
        const parse = v => v.split('.').map(Number);
        const r = parse(remote), c = parse(current);
        for (let i = 0; i < Math.max(r.length, c.length); i++) {
            const rv = r[i] ?? 0, cv = c[i] ?? 0;
            if (rv > cv) return true;
            if (rv < cv) return false;
        }
        return false;
    }

    function uuid2Guid(uuid) {
        // Защита от URL-safe Base64: проверяем паттерном, что это именно HEX GUID
        if (/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(uuid)) {
            return uuid.toUpperCase();
        }
        try {
            const binary = atob(uuid.replace(/-/g, '+').replace(/_/g, '/'));
            const hex = Array.from(binary, c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
            return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-').toUpperCase();
        } catch {
            throw new Error(`Invalid UUID format: ${uuid}`);
        }
    }

    function hexToBase64(hexStr) {
        const hex = hexStr.replace(/-/g, '');
        let binary = '';
        for (let i = 0; i < hex.length; i += 2) {
            binary += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return btoa(binary);
    }

    function getFilePath(guid) {
        let h = 2166136261;
        for (let i = 0; i < guid.length; i++) {
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
            h ^= guid.charCodeAt(i);
        }
        return '0x' + ('00000000' + ((h >>> 0) % 1e4).toString(16)).slice(-8);
    }

    function getRandomId() {
        return new Long(
            Math.floor(Math.random() * 0xffffffff) + 1,
            Math.floor(Math.random() * 0xffffffff),
            true
        );
    }

    const protobufRoot = (async () => {
        const url  = await GM.getResourceUrl('bundle.json');
        const data = await fetch(url);
        return protobuf.Root.fromJSON(await data.json());
    })();

    function coerceScalar(val, fieldType) {
        if (!LONG_TYPES.includes(fieldType)) return val;
        if (val === undefined || val === null) return Long.fromValue(0);
        if (Long.isLong(val)) return val;
        try {
            return typeof val === 'string'
                ? Long.fromString(val, fieldType === 'uint64' || fieldType === 'fixed64')
                : Long.fromValue(val);
        } catch { return Long.fromValue(0); }
    }

    async function parseMessageObj(obj, className) {
        const root = await protobufRoot;
        const msgClass = root.lookupType(className);
        const parsed = {};

        for (const key of Object.keys(obj)) {
            const snakeKey = key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
            const fieldKey = msgClass.fields[key] ? key : msgClass.fields[snakeKey] ? snakeKey : null;
            if (!fieldKey) continue;

            const field = msgClass.fields[fieldKey];
            const val   = obj[key];

            if (Array.isArray(val)) {
                parsed[fieldKey] = await Promise.all(val.map(v =>
                    typeof v === 'object' && v !== null
                        ? parseMessageObj(v, field.type).then(r => r[0])
                        : Promise.resolve(coerceScalar(v, field.type))
                ));
            } else if (typeof val === 'object' && val !== null) {
                [parsed[fieldKey]] = await parseMessageObj(val, field.type);
            } else {
                let isEnum = false;
                try {
                    const enumType = root.lookupEnum(field.type);
                    if (enumType && typeof val === 'string') {
                        parsed[fieldKey] = enumType.values[val.split('.').pop()];
                        isEnum = true;
                    }
                } catch (e) { /* ignore */ }

                if (!isEnum) {
                    parsed[fieldKey] = coerceScalar(val, field.type);
                }
            }
        }

        if (className.includes("WebTraitTracker")) {
            for (const f of ['icon_key', 'cas_selected_icon_key', 'icon', 'icon_high_res']) {
                if (!msgClass.fields[f]) continue;
                if (!parsed[f] || typeof parsed[f] !== 'object') {
                    parsed[f] = { type: 0, group: 0, instance: Long.fromValue(0) };
                } else {
                    if (!Long.isLong(parsed[f].instance)) parsed[f].instance = Long.fromValue(0);
                    parsed[f].type  = parsed[f].type  ?? 0;
                    parsed[f].group = parsed[f].group ?? 0;
                }
            }
        }

        for (const [fieldName, field] of Object.entries(msgClass.fields)) {
            if (parsed[fieldName] !== undefined && parsed[fieldName] !== null) {
                if (field.type?.includes('ResourceKey')) {
                    const rk = parsed[fieldName];
                    if (rk && !Long.isLong(rk.instance)) {
                        rk.instance = coerceScalar(rk.instance, 'uint64');
                    }
                }
                continue;
            }

            if (field.repeated) {
                parsed[fieldName] = [];
            } else if (LONG_TYPES.includes(field.type)) {
                parsed[fieldName] = Long.fromValue(0);
            } else if (['uint32','int32','float','double'].includes(field.type)) {
                parsed[fieldName] = 0;
            } else if (field.type === 'bool') {
                parsed[fieldName] = false;
            }
        }

        return [parsed, msgClass];
    }

    async function getTrayItem(uuid) {
        // Серверу EA нужен именно Base64-код, не трогаем регистр
        const message = await xhr({
            url: TRAY_ITEM_URL.replace('{UUID}', encodeURIComponent(uuid)),
            responseType: 'json',
            headers: { 'Accept-Language': 'en-US,en;q=0.9' }
        });

        if (!message || message.error !== undefined)
            throw new Error("API Error: Item might be hidden or removed.");

        const [parsedMessage, messageClass] = await parseMessageObj(message, "EA.Sims4.Network.TrayMetadata");
        parsedMessage.type ??= EXCHANGE_HOUSEHOLD;
        parsedMessage.id = getRandomId();

        let additional = 0;
        if (parsedMessage.type === EXCHANGE_BLUEPRINT) {
            additional = parsedMessage.metadata.bp_metadata.num_thumbnails - 1;
        } else if (parsedMessage.type === EXCHANGE_HOUSEHOLD) {
            const sims = parsedMessage.metadata?.hh_metadata?.sim_data || [];
            additional = sims.length > 0 ? sims.length : 1;
            sims.forEach((sim, i) => { sim.id = parsedMessage.id.add(i + 1); });
        }

        const encodedMessage = messageClass.encode(parsedMessage).finish();
        const prefix = new Uint8Array(8);
        new DataView(prefix.buffer).setUint32(4, encodedMessage.byteLength, true);

        const resultFile = new Uint8Array(prefix.length + encodedMessage.length);
        resultFile.set(prefix);
        resultFile.set(encodedMessage, prefix.length);

        return [
            resultFile,
            parsedMessage.type,
            parsedMessage.id,
            additional,
            parsedMessage.modifier_name || parsedMessage.creator_name || 'unknown',
            parsedMessage.name || 'unknown'
        ];
    }

    async function getDataItem(guid, folder, type, id) {
        const response = await xhr({
            url: DATA_ITEM_URL.replace('{FOLDER}', folder).replace('{GUID}', guid),
            responseType: 'arraybuffer'
        });

        if (type !== EXCHANGE_HOUSEHOLD) return response;

        const root = await protobufRoot;
        const messageClass = root.lookupTypeOrEnum('EA.Sims4.Network.FamilyData');
        if (response.byteLength < 8) return response;

        const view = new DataView(response);
        const len  = view.getUint32(4, true);
        if (response.byteLength < 8 + len) return response;

        let message;
        try {
            message = messageClass.decode(new Uint8Array(response, 8, len));
        } catch {
            return response;
        }

        const prefix = new Uint8Array(response, 0, 4);
        const suffix = new Uint8Array(response, 8 + len);
        const sims   = message.family_account.sim;
        const idMap  = {};

        sims.forEach((sim, i) => { idMap[sim.sim_id.toString()] = id.add(i + 1); });
        sims.forEach(sim => {
            sim.sim_id          = idMap[sim.sim_id.toString()];
            sim.significant_other = idMap[sim.significant_other?.toString()];
            sim.attributes?.genealogy_tracker?.family_relations?.forEach(r => {
                const newId = idMap[r.sim_id.toString()];
                if (newId) r.sim_id = newId;
            });
        });

        let editedMessage;
        try { editedMessage = new Uint8Array(messageClass.encode(message).finish()); }
        catch { return response; }

        const result = new Uint8Array(8 + editedMessage.length + suffix.length);
        result.set(prefix);
        new DataView(result.buffer).setUint32(4, editedMessage.length, true);
        result.set(editedMessage, 8);
        result.set(suffix, 8 + editedMessage.length);
        return result.buffer;
    }

    function newCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    }

    function loadImage(url) {
        return new Promise(resolve =>
            xhr({ url, responseType: 'blob' })
                .then(blob => {
                    const objectUrl = URL.createObjectURL(blob);
                    const img = new Image();
                    img.onload  = () => { URL.revokeObjectURL(objectUrl); resolve(img); };
                    img.onerror = () => resolve(null);
                    img.src = objectUrl;
                })
                .catch(() => resolve(null))
        );
    }

    async function getImages(guid, folder, type, additional) {
        const URL_TPL = IMAGE_URL
            .replace('{FOLDER}', folder)
            .replace('{GUID}', guid)
            .replace('{TYPE}', type - 1);

        const urls = Array.from({ length: additional + 1 }, (_, i) =>
            URL_TPL.replace('{INDEX}', String(i).padStart(2, '0'))
        );
        const loadedImages = await Promise.all(urls.map(loadImage));

        const big   = newCanvas(BIG_WIDTH, BIG_HEIGHT);
        const small = newCanvas(SMALL_WIDTH, SMALL_HEIGHT);
        const images = [];

        loadedImages.forEach((img, i) => {
            if (!img) return;

            let width, height;
            if (type === EXCHANGE_BLUEPRINT || (type === EXCHANGE_HOUSEHOLD && i > 0)) {
                width  = Math.round(img.naturalHeight * BIG_WIDTH / BIG_HEIGHT);
                height = img.naturalHeight;
            } else {
                width = BIG_WIDTH; height = BIG_HEIGHT;
            }
            const x = (img.naturalWidth  - width)  / 2;
            const y = (img.naturalHeight - height) / 2;

            if (i === 0) {
                small.getContext('2d').drawImage(img, x, y, width, height, 0, 0, SMALL_WIDTH, SMALL_HEIGHT);
                images.push(small.toDataURL('image/jpeg').split('base64,')[1]);
            }
            big.getContext('2d').drawImage(img, x, y, width, height, 0, 0, BIG_WIDTH, BIG_HEIGHT);
            images.push(big.toDataURL('image/jpeg').split('base64,')[1]);
        });

        return images;
    }

    function generateName(type, id, ext) {
        return `0x${type.toString(16).padStart(8,'0')}!0x${id.toString(16).padStart(16,'0')}.${ext}`;
    }

    async function downloadItem(uuid, btn) {
        btn.disabled = true;
        btn.classList.add('is-loading');
        const progressBar = btn.querySelector('.btn-progress');
        btn.querySelector('.btn-label').textContent = i18n.btnDownloading;
        if (progressBar) progressBar.style.width = '15%';

        try {
            const guid   = uuid2Guid(uuid);
            const folder = getFilePath(guid);
            const zip    = new JSZip();

            if (progressBar) progressBar.style.width = '30%';
            const [trayItem, type, id, additional, author, title] = await getTrayItem(uuid);
            zip.file(generateName(type, id, 'trayitem'), trayItem);

            if (progressBar) progressBar.style.width = '50%';
            const [typeStr, dataExt, imageExt, additionalExt] = EXTENSIONS[type] || ['Unknown', 'blueprint', 'jpg', 'jpg'];
            const dataItem = await getDataItem(guid, folder, type, id);
            zip.file(generateName(0, id, dataExt), dataItem);

            if (progressBar) progressBar.style.width = '70%';
            const images = await getImages(guid, folder, type, additional);
            images.forEach((data, i) => {
                let group = i === 0 ? 2 : 3;
                let extension = i < 2 ? imageExt : additionalExt;
                let newId = id;
                if (i >= 2) {
                    const j = i - 1;
                    group += (1 << (4 * type)) * j;
                    if (type === EXCHANGE_HOUSEHOLD) newId = newId.add(j);
                }
                zip.file(generateName(group, newId, extension), data, { base64: true });
            });

            if (progressBar) progressBar.style.width = '90%';
            const filename = [author, '0x' + type.toString(16).padStart(8,'0'), title,
                uuid.replace(/\+/g, '-').replace(/\//g, '_')]
                .join('__').replace(/\s+/g, '_').replace(/[^a-z0-9.\-=_]/gi, '');

            const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
            saveAs(content, filename + '.zip');

            if (progressBar) progressBar.style.width = '100%';
            logSuccess(title, author, typeStr, uuid);
            showToast(`<b>${title}</b> ${i18n.toastSuccess}`, 'success');

        } catch (e) {
            showToast(`${i18n.toastFail} ${e.message}`, 'error', 8000);
            logFailure("Download Process", e, uuid);
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('is-loading');
                btn.querySelector('.btn-label').textContent = i18n.btnDownload;
                if (progressBar) progressBar.style.width = '0%';
            }, 600);
        }
    }

    function extractCreationUuid(card) {
        // 1. Попытка вытащить Base64-код из ссылки
        const href = card.getAttribute('href') || '';
        const itemMatch = href.match(/\/item\/([^/?]+)/i);
        if (itemMatch) {
            return decodeURIComponent(itemMatch[1]);
        }

        // 2. Фоллбэк - берем Hex GUID из превью-изображения и переводим в Base64
        const img = card.querySelector('img[src*="athena.thesims.com"]');
        if (img) {
            const match = img.src.match(/\/([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})\//i);
            if (match) {
                return hexToBase64(match[1]);
            }
        }

        return null;
    }

    function addCustomDownloadButtons() {
        document.querySelectorAll('[class*="UgxCreationCard_metricGroup"]').forEach(container => {
            if (container.querySelector('.custom-download-btn')) return;

            const card = container.closest('a[class*="UgxCreationCard_card"]');
            if (!card) return;

            const uuid = extractCreationUuid(card);
            if (!uuid) return;

            const btn = document.createElement('button');
            btn.className = 'custom-download-btn';
            btn.innerHTML = `<span class="btn-label">${i18n.btnDownload}</span><span class="btn-progress"></span>`;

            btn.addEventListener('click', async ev => {
                ev.preventDefault();
                ev.stopPropagation();
                if (btn.disabled) return;
                await downloadItem(uuid, btn);
            });

            container.appendChild(btn);
        });

        document.querySelectorAll('[class*="CreatorPanel_panel"]').forEach(panel => {
            if (panel.querySelector('.custom-download-btn-detail')) return;

            const itemMatch = location.pathname.match(/\/item\/([^/?]+)/i);
            if (!itemMatch) return;

            const uuid = decodeURIComponent(itemMatch[1]);

            const btn = document.createElement('button');
            btn.className = 'custom-download-btn custom-download-btn-detail';
            btn.innerHTML = `<span class="btn-label">${i18n.btnDownload}</span><span class="btn-progress"></span>`;

            btn.style.width = '100%';
            btn.style.marginTop = '10px';
            btn.style.padding = '8px 12px';
            btn.style.fontSize = '14px';

            btn.addEventListener('click', async ev => {
                ev.preventDefault();
                ev.stopPropagation();
                if (btn.disabled) return;
                await downloadItem(uuid, btn);
            });

            const termsText = panel.querySelector('[class*="CreatorPanel_termsText"]');
            if (termsText) {
                panel.insertBefore(btn, termsText);
            } else {
                panel.appendChild(btn);
            }
        });
    }

    function initObserver() {
        let debounce;
        new MutationObserver(() => {
            clearTimeout(debounce);
            debounce = setTimeout(addCustomDownloadButtons, 150);
        }).observe(document.body, { childList: true, subtree: true });
        addCustomDownloadButtons();
    }

    function showWelcomeModal() {
        if (localStorage.getItem('ts4_gallery_seen_version') === CURRENT_VERSION) return;

        const modal = document.createElement('div');
        modal.id = 'ts4-glass-modal';
        modal.innerHTML = `
            <div class="ts4-glass-content">
                <div class="ts4-glass-header">${i18n.modalTitle}</div>
                <div class="ts4-glass-body">
                    <p>${i18n.modalBody}</p>
                    <div class="ts4-meta">
                        ${i18n.modalVersion} <b>${CURRENT_VERSION}</b><br>
                        ${i18n.modalDeveloper} <b>nrksu1tan</b>
                    </div>
                    <p style="font-size: 13.5px; color: #666; margin-bottom: 24px;">
                        ${i18n.modalThanks}
                    </p>
                </div>
                <div class="ts4-btn-row">
                    <a class="ts4-btn-link" href="${GITHUB_REPO_URL}" target="_blank">${i18n.modalBtnStar}</a>
                    <button class="ts4-btn-primary" id="ts4-close-btn">${i18n.modalBtnClose}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('ts4-close-btn').addEventListener('click', () => {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.25s ease';
            localStorage.setItem('ts4_gallery_seen_version', CURRENT_VERSION);
            setTimeout(() => modal.remove(), 280);
        });
    }

    function checkForUpdates() {
        const now = Date.now();
        if (now - parseInt(localStorage.getItem('ts4_update_check_time') || '0') < 86400000) return;

        GM.xmlHttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL + '?t=' + now,
            onload: res => {
                localStorage.setItem('ts4_update_check_time', String(now));
                if (res.status !== 200) return;
                const match = res.responseText.match(/@version\s+([\d.]+)/);
                if (match && isNewerVersion(match[1], CURRENT_VERSION)) {
                    showToast(
                        `${i18n.updateText} <b>${match[1]}</b> — <a href="${GITHUB_RAW_URL}" target="_blank">${i18n.updateBtn}</a>`,
                        'info',
                        0
                    );
                }
            }
        });
    }

    const loginBtn = document.createElement('a');
    loginBtn.href = 'https://www.thesims.com/login?redirectUri=' + encodeURIComponent(location.href);
    loginBtn.innerHTML = i18n.forceLogin;
    loginBtn.className = 'ts4-login-btn';
    document.body.appendChild(loginBtn);

    (async () => {
        try {
            await protobufRoot;
            console.log(`%c TS4 Gallery Downloader v${CURRENT_VERSION} Ready`, 'color:#2ecc71;font-weight:bold;font-size:14px;');
            initObserver();
            setTimeout(showWelcomeModal, 800);
            checkForUpdates();
        } catch (e) {
            console.error('TS4 Downloader: Critical init error', e);
            showToast(i18n.toastInitFail, 'error', 0);
        }
    })();

})();
