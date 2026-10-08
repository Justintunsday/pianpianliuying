# Fireflies Reading Assistant 1.0

Read articles and multiple-choice questions from a signed-in Fireflies assignment page and use DeepSeek to analyze the answers. This project includes a Chrome Manifest V3 extension, a wBlock userscript for iOS Safari, and a Python script. No API key is included.

## iOS Safari (wBlock)

Install the userscript through wBlock using this URL:

https://raw.githubusercontent.com/Justintunsday/pianpianliuying/main/wblock/fireflies.user.js

The script adds a collapsible assistant to the assignment page. Enter your own API key, analyze the questions, review the answers and select options, then submit manually. See [wBlock installation instructions](wblock/README.md) for setup and limitations. Actual iOS behavior has not yet been verified on a device.

## Chrome Extension

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `chrome-extension` folder.
3. Complete the website's security verification and sign in manually in Chrome, then open an individual assignment.
4. Click the extension icon. Enter your own DeepSeek API key in the assistant's settings and save it.
5. Click **DeepSeek 分析答案** (Analyze answers), review the answers and supporting explanations, then click **一键勾选答案** (Select all answers).
6. Return to the assignment page, check the selections, and submit manually.

The extension uses the official endpoint `https://api.deepseek.com` and the `deepseek-flash` model by default. Your API key is stored locally in Chrome extension storage. Only the article title, article text, questions, and options are sent to DeepSeek; website cookies and login credentials are not extracted. Answers can be restored for the same assignment tab or exported as JSON.

The extension does not complete or bypass website security verification. Model answers may be incorrect, and confidence scores are self-reported by the model. Low-confidence answers require manual review before automatic selection.

## Python Script

Requires Python 3.10 or later. Run these commands in PowerShell:

```powershell
py -m pip install -r requirements.txt
py -m playwright install chromium
$taskKey = Read-Host 'DeepSeek API Key' -AsSecureString
$env:DEEPSEEK_API_KEY = [System.Net.NetworkCredential]::new('', $taskKey).Password
py fireflies_answer.py --fill
```

On the first run, sign in manually in the separate browser window opened by the script. By default, the script only outputs suggested answers. `--fill` selects the answers, while `--submit` selects and submits them, updating your assignment record on the website.

Run outputs are saved in `outputs`, and browser login data is stored in `.browser-profile`. These folders are excluded from version control.

If the script's browser cannot complete security verification, open the assignment in your regular browser, press Ctrl+S, choose **Webpage, Complete**, and save it as `assignment.html`. Then run:

```powershell
py fireflies_answer.py --html "assignment.html"
```

Local HTML mode outputs suggested answers; select and submit them manually on the website. For additional options, run `py fireflies_answer.py --help`.

## Checks

```powershell
node --check chrome-extension/app.js
node chrome-extension/check.cjs
node chrome-extension/check-fill.cjs
node --check wblock/fireflies.user.js
node wblock/check.cjs
node chrome-extension/check-fill.cjs --wblock
py -m py_compile fireflies_answer.py
```

Checks cover answer validation, option mapping, interrupted model output, asynchronous form re-rendering, and failed selections. Chrome installation and the full live assignment workflow still require verification.
