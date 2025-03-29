# TS4 Gallery Downloader (Modified)

A **modified version** of the widely used and highly respected [**“TS4 Gallery Downloader” script by anadius**](https://anadius.su/sims-4-gallery-downloader) — a trusted name in the Sims modding community known for tools that make *The Sims 4* more accessible and customizable.

This version preserves all the powerful functionality of the original script, which allows players to **download households, lots, and rooms directly** from *The Sims 4* Gallery website.

🔧 **What’s new in this fork?**  
Just fixed the problem like `RangeError: Invalid typed array length` that occurred when the script tried to process broken or incomplete `.dat` files from EA servers. Now it skips re-encoding those files and logs a warning instead of crashing.

---

## 🛠️ What’s New in This Fork

- ✅ **Truncated .dat check** – Prevents `RangeError: Invalid typed array length` by detecting and skipping corrupted `.dat` files.
- ✅ **Graceful fallback** – If a `.dat` file is too short to re-encode, it is still included raw in the final `.zip`.
- ✅ **Console feedback** – Clear warnings are shown in the browser console when data is invalid or incomplete.
- ✅ **Optional UI enhancement** – A custom styled “Download” button is added for easier access (in the modded version).
- ✅ **No breaking changes** – The rest of the script remains fully functional and compatible with working items.

---

## 📦 Installation

1. **Install a userscript manager:**
   - [Tampermonkey](https://tampermonkey.net/) – recommended
   - [Violentmonkey](https://violentmonkey.github.io/)

2. **Choose the version that suits you best:**

| Version | Description | Link |
|--------|-------------|------|
| ✨ **Modded Version (Recommended)** | 🧩 Includes fix + styled “Download” button for easier use | [Install](https://github.com/nrksu1tan/TS4-gallery-downloader/raw/refs/heads/main/mod%20versions/TS4%20Gallery%20Downloader%20—%20Fixed%20&%20Enhanced-2.1.17.user.js) |
| ⚙️ Fix Only (Upstream Patch) | ✅ Just the bugfix, for upstream author or contributors | [Install](https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/sims-4-gallery-downloader-fixed.user.js) |

> 🟢 **Normal users should use the *Modded Version*** — it's easier, prettier, and beginner-friendly.  
> 🧠 **Original author or devs** should use the *Fix Only* version if reviewing for integration.

---

## 📸 Button Preview

Here is how the custom “Download” button looks in the modded version:


> ![image](https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/refs/heads/main/assets/demo.png)
> 




---

## ⚠️ Usage Notes

- If you see warnings like `Truncated .dat file` in the browser console, that means the Gallery item was removed or the file is corrupted on EA’s servers.
- The script still downloads what it can, even for broken items.

---

## 🙏 Credits

- 👨‍💻 **Original author**: [anadius](https://github.com/anadius)  
  All core logic belongs to the original creator. This fork only includes a small bug fix.
- ✍️ **Modified by**: [Nursultan](https://github.com/nrksu1tan)  
  Added custom download button and improved fallback behavior.

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
