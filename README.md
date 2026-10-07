# 篇篇流萤阅读答题助手 1.0

在已登录的篇篇流萤题目页读取文章与选项，通过 DeepSeek 分析答案。项目包含 Chrome Manifest V3 插件和 Python 脚本，不包含 API 密钥。

## Chrome 插件

1. 打开 `chrome://extensions`，开启开发者模式。
2. 点击“加载已解压的扩展程序”，选择 `chrome-extension` 文件夹。
3. 在普通 Chrome 中手动完成网站验证和登录，打开单篇题目页。
4. 点击插件图标，在助手页面填写自己的 DeepSeek API Key，保存设置。
5. 点击“DeepSeek 分析答案”，核对答案和依据后点击“一键勾选答案”。
6. 返回题目页核对并手动提交。

插件默认使用官方接口 `https://api.deepseek.com` 和模型 `deepseek-flash`。填写的密钥保存在本机扩展存储中。只将文章标题、正文、题目和选项发送给 DeepSeek，不提取网站 Cookie 或登录凭据。答案可在同一原题目标签页下恢复，也可导出为 JSON。

插件不处理或绕过网站安全验证。模型可能出错，置信度为模型自评；低置信度答案需人工核对后才能勾选。

## Python 脚本

需要 Python 3.10 或更高版本。在 PowerShell 执行：

```powershell
py -m pip install -r requirements.txt
py -m playwright install chromium
$taskKey = Read-Host 'DeepSeek API Key' -AsSecureString
$env:DEEPSEEK_API_KEY = [System.Net.NetworkCredential]::new('', $taskKey).Password
py fireflies_answer.py --fill
```

首次需在脚本打开的独立浏览器中自行登录。默认仅输出答案，`--fill` 自动勾选，`--submit` 勾选并提交，会写入网站答题记录。运行输出保存在 `outputs`，登录状态保存在 `.browser-profile`；这些目录不上传到 GitHub。

如果独立浏览器无法完成安全验证，可在正常浏览器中打开题目，用 Ctrl+S 选择“网页，全部”，保存为 `题目.html`，然后执行：

```powershell
py fireflies_answer.py --html "题目.html"
```

本地 HTML 模式输出答案，需在网站手动填写。其他参数请查看 `py fireflies_answer.py --help`。

## 检查

```powershell
node --check chrome-extension/app.js
node chrome-extension/check.cjs
node chrome-extension/check-fill.cjs
py -m py_compile fireflies_answer.py
```

检查覆盖答案格式、选项对应、输出中断处理、异步表单重渲染和勾选失败。Chrome 安装及网站完整答题流程仍需实际验证。
