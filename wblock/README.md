# wBlock for iOS 1.0

A userscript edition of Fireflies Reading Assistant for Safari on iPhone and iPad. It uses wBlock's GM request and storage APIs, with a collapsible panel on the assignment page.

## Installation

1. Install or update [wBlock](https://apps.apple.com/hk/app/wblock/id6746388723) and follow its Safari extension setup.
2. In wBlock, open **Userscripts** and add a userscript using this URL:

   https://raw.githubusercontent.com/Justintunsday/pianpianliuying/main/wblock/fireflies.user.js

3. Enable the script, apply changes if prompted, and allow **wBlock Scripts** to run on `fireflies.chiculture.org.hk` in Safari.
4. Open Safari, complete the website's verification and sign in manually, then open an assignment page. Reload it after installing the script.
5. Tap the floating **答题助手** (Answer assistant) button. Enter your own DeepSeek API key in **DeepSeek 设置** (Settings) and save it.
6. Tap **读取题目** (Read questions), then **分析答案** (Analyze answers). Keep Safari in the foreground while the request runs.
7. Expand **答案分析** (Answer analysis) to review the answers and explanations, then tap **一键勾选** (Select all answers) in the top action row. Collapse the panel, switch to the website's answer tab, and submit manually.

If URL installation is unavailable, import `fireflies.user.js` as a userscript file or paste its complete contents into wBlock's userscript editor. Do not add it as a filter list.

## Privacy and behavior

No API key is bundled. Settings and generated answers are stored through wBlock's per-script storage APIs. wBlock's own sync or backup settings may affect where that storage is retained. The **清除密钥** (Clear key) button removes this script's saved settings.

API requests go only to `api.deepseek.com`, declared in the script's `@connect` metadata. Only the article title, text, questions and options are sent; website cookies and login credentials are not extracted. The script does not solve or bypass website security verification and does not submit answers automatically.

Confidence scores are model estimates, not accuracy guarantees. Low-confidence answers require manual review before selection. If the page changes during analysis, reread the assignment before selecting answers.

The metadata header is required by userscript managers. There are no ordinary code comments or embedded credentials.

## Verification

```powershell
node --check wblock/fireflies.user.js
node wblock/check.cjs
node chrome-extension/check-fill.cjs --wblock
```

These are offline checks of metadata, API transport behavior, response validation and asynchronous form updates. Installation, API behavior and answer selection have not been verified on an actual iOS device.

Reference: [wBlock source and userscript network documentation](https://github.com/0xCUB3/wBlock).
