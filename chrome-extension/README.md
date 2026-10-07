# Chrome Extension 1.0

1. Open `chrome://extensions` in Chrome and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Complete the website's security verification and sign in manually, then open an individual assignment.
4. Click the extension icon. Enter your own DeepSeek API key and save the settings.
5. Click **DeepSeek 分析答案** (Analyze answers), review the results, then click **一键勾选答案** (Select all answers).
6. Return to the website, check the selections, and submit manually.

The extension uses the official `https://api.deepseek.com` endpoint and defaults to `deepseek-flash`. No API key is bundled. Your key is stored locally in Chrome extension storage. Generated answers are also cached locally and can be restored for the same assignment tab if the article, questions, and options have not changed.

You may switch tabs during analysis, but keep both the assistant and the original assignment tab open. The extension does not complete or bypass website security verification and does not submit answers automatically.

After editing the extension files, reload the extension on the extensions page, then refresh the assistant page. The version displayed at the top should be 1.0.
