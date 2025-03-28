# TS4 Gallery Downloader (Modified)

A **modified version** of [anadius’ “TS4 gallery downloader”](https://anadius.su/sims-4-gallery-downloader) script, which allows you to download households, lots, and rooms directly from *The Sims 4* Gallery website.  
This fork primarily **fixes** a `RangeError` that occurred when certain `.dat` files were incomplete or “truncated” on EA’s servers.  
The modified script now detects those truncated files, returns them **without** re-encoding, and logs warnings instead of crashing.

---

## 🛠️ What’s New in This Fork

- ✅ **Truncated .dat check** – Prevents `RangeError: Invalid typed array length` by detecting and skipping corrupted `.dat` files.
- ✅ **Graceful fallback** – If a `.dat` file is too short to re-encode, it is still included raw in the final `.zip`.
- ✅ **Console feedback** – Clear warnings are shown in the browser console when data is invalid or incomplete.
- ✅ **No breaking changes** – The rest of the script remains fully functional and compatible with working items.

---

## 📦 Installation

1. **Install a userscript manager:**
   - [Tampermonkey](https://tampermonkey.net/) – recommended
   - [Violentmonkey](https://violentmonkey.github.io/)

2. **Install the script:**
   - Click the **Intall** button: [**INSTALL**](https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/sims-4-gallery-downloader-fixed.js)

3. **Visit The Sims 4 Gallery:**
   - Supported on:  
     `https://www.ea.com/ru-ru/games/the-sims/the-sims-4/pc/gallery`

4. **Click “Download”:**
   - Each item tile will have a “Download” button that saves all tray files.

---

## ⚠️ Usage Notes

- If you see warnings like `Truncated .dat file` in the browser console, that means the Gallery item was removed or the file is corrupted on EA’s servers.
- The script still downloads what it can, even for broken items.

---

## 🙏 Credits

- 👨‍💻 **Original author**: [anadius](https://github.com/anadius)  
  All core logic belongs to the original creator. This fork only includes a small bug fix.
- 📚 Libraries used:  
  - [`protobufjs`](https://www.npmjs.com/package/protobufjs)  
  - [`jszip`](https://www.npmjs.com/package/jszip)  
  - [`file-saver`](https://www.npmjs.com/package/file-saver)  
  - [`long`](https://www.npmjs.com/package/long)

---

## 📜 Disclaimer

> This project is not affiliated with or endorsed by Electronic Arts or Maxis.  
> “The Sims” and related assets are trademarks of Electronic Arts Inc.  
> This script is for personal backup and educational use only. Use responsibly.
