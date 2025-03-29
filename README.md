# TS4 Gallery Downloader (Modified)

A **modified version** of the widely used and highly respected [**“TS4 Gallery Downloader” script by anadius**](https://anadius.su/sims-4-gallery-downloader) — a trusted name in the Sims modding community known for tools that make *The Sims 4* more accessible and customizable.

This version preserves all the powerful functionality of the original script, which allows players to **download households, lots, and rooms directly** from *The Sims 4* Gallery website.

🔧 **What’s new in this fork?**  
Fixed crashes when EA gives broken files — now the script just skips them and keeps downloading what works.  
Plus: new design with smoother cards, a better-looking page, and a bright custom **Download** button that’s easy to find.  
Same great features — just more stable and stylish!


---

## 🛠️ What’s New in This Fork (v2.2)

- 🚫 No more errors when downloading removed or broken items — the script just skips them.
- 📁 Still downloads everything else and saves it in a .zip file.
- 🔔 Shows helpful messages in the browser console if something doesn’t work.
- 🎨 **New design!** Gallery items look cleaner and more modern with rounded corners, shadows, and a nicer background.
- 🔘 Improved "Download" button — easier to see and use.
- ✅ Everything else works the same — just more reliable and better looking.

---



## 📦 Installation

1. **Install a userscript manager**  
   You need one of these browser extensions to run the script:
   - [Tampermonkey](https://tampermonkey.net/) – **recommended**
   - [Violentmonkey](https://violentmonkey.github.io/) – alternative option

2. **Choose your version**

| Version | Description | Link |
|--------|-------------|------|
| ✨ **Modded Version (Recommended)** | Includes the bugfix **+** a better UI and a styled "Download" button | [Install](https://github.com/nrksu1tan/TS4-gallery-downloader/raw/refs/heads/main/mod%20versions/TS4%20Gallery%20Downloader%20—%20Fixed%20&%20Enhanced.user.js) |
| ⚙️ **Fix Only (Upstream Patch)** | Only fixes the bug — no UI changes | [Install](https://raw.githubusercontent.com/nrksu1tan/TS4-gallery-downloader/main/sims-4-gallery-downloader-fixed.user.js) |

> 🟢 **Regular players should pick the *Modded Version*** — it's easier, looks better, and works the same.  
> 🧠 **Script authors or advanced users** might prefer the *Fix Only* version to integrate upstream.

3. **Go to the Sims 4 Gallery**  
   Open [The Sims 4 Gallery website](https://www.ea.com/games/the-sims/the-sims-4/pc/gallery) and wait a few seconds.

4. **Use the "Download" button**  
   You’ll now see a custom **Download** button on every lot, room, or household. Click it — and a `.zip` will download automatically.

5. **Install the downloaded content**  
   - Unzip the file  
   - Put all extracted files (`.trayitem`, `.blueprint`, `.bpi`, `.hhi`, `.sgi`, etc.) into:  
     `Documents\Electronic Arts\The Sims 4\Tray`

6. **Start the game**  
   Open Sims 4 and check your Library in Build/Buy mode. Don’t forget to enable **"Include Custom Content"** in the filter if needed.

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
