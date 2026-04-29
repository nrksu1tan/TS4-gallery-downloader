# TS4 Gallery Downloader: Enhanced Edition

![Version](https://img.shields.io/badge/version-v3.6.1-blue?style=flat-square)
![Userscript](https://img.shields.io/badge/works%20on-EA%20Gallery-5cba47?logo=ea&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

A smarter, faster, and more beautiful way to download content from The Sims 4 Gallery. 

This is an actively maintained, highly optimized upgrade of the original [TS4 Gallery Downloader by anadius](https://anadius.su/sims-4-gallery-downloader). We kept the core magic that lets you download lots, rooms, and households directly from your browser, but completely rewrote the engine to make it faster, safer, and much easier to use.

---

## ✨ Why use the Enhanced Edition?

- **Lightning Fast:** Downloads multiple high-resolution images at the same time, cutting wait times significantly.
- **Never Crashes:** If a gallery item is broken or missing files on EA's servers, the script simply skips the bad parts instead of freezing.
- **Beautiful Interface:** Say goodbye to ugly browser pop-ups. Enjoy a clean "Download" button with a smooth progress bar and modern, native-looking notifications.

---

## 🚀 How to Install & Use

**Step 1. Install a Userscript Manager** You will need a browser extension to run this script. We recommend [Tampermonkey](https://tampermonkey.net/).

**Step 2. Install the Script** Click the button below to add the script to your browser:  
[![Install Script](https://img.shields.io/badge/-Install_Enhanced_Edition-2ecc71?style=for-the-badge)](https://github.com/nrksu1tan/TS4-gallery-downloader/raw/refs/heads/main/mod%20versions/TS4%20Gallery%20Downloader%20%E2%80%94%20Fixed%20%26%20Enhanced.user.js)

**Step 3. Download Content** 1. Go to the [The Sims 4 Gallery](https://www.ea.com/games/the-sims/the-sims-4/pc/gallery).
2. Click the new green **Download** button on any gallery item.
3. Unzip the downloaded `.zip` file.
4. Move all extracted files (`.trayitem`, `.blueprint`, `.bpi`, `.hhi`, `.sgi`) into your game folder:  
   `Documents\Electronic Arts\The Sims 4\Tray`

---

## ⚙️ Under the Hood (For Developers)

For those interested in the technical architecture, this fork shifts from fragile DOM-scraping to a robust, high-load-ready implementation:
- **Direct REST API Integration:** Fetches metadata strictly via `thesims-api.ea.com` endpoints, completely bypassing the Angular DOM scope limitations.
- **Data Integrity:** Implemented strict `Long.fromString` parsing to fix critical `uint64` precision loss during Protobuf serialization of EA's massive ID structures.
- **Parallelism & Memory Safety:** Replaced sequential awaits with `Promise.all` for image fetching. Enforced strict garbage collection (`URL.revokeObjectURL`) and removed global DOM-polling (`setInterval`) to prevent memory leaks and UI thread blocking.
- **i18n:** Dynamic localization logic based on `navigator.language`.

---

## 🤝 Credits & Acknowledgments

This project stands on the shoulders of the community:

- **[anadius](https://github.com/anadius)** — Original architecture and initial concept. All core generation logic belongs to the original creator.
- **[wccm92](https://github.com/wccm92)** — Major technical contribution: reverse-engineering EA's REST endpoints and fixing the 64-bit precision loss during Protobuf encoding.
- **[nrksu1tan](https://github.com/nrksu1tan)** — Fork maintainer. Parallel processing architecture, UI/UX overhaul, i18n, and performance optimizations.

---

## ⚠️ Disclaimer

> This project is open-source and not affiliated with or endorsed by Electronic Arts or Maxis. “The Sims” and related assets are trademarks of Electronic Arts Inc. This tool is provided for educational purposes and personal backup only. Use responsibly.

*If this script makes your game better, consider leaving a ⭐ **Star** on this repository!*
