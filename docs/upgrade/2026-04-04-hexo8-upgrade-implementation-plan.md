# yianbau.github.io Hexo 8 升級實施計畫（editor2）

日期：2026-04-04  
策略：保守升級（最小變更、可回滾、跨 Windows/macOS）

## Task 1：建立升級基線與版本鎖定

檔案：

- 新增：`.nvmrc`
- 修改：`package.json`

步驟：

1. 新增 `.nvmrc`，內容固定為 `20`。  
2. 在 `package.json` 新增 `engines.node` 約束（`20.x`）。  
3. 新增 npm scripts（供 Makefile 呼叫）：
   - `check:env`
   - `verify:build`
   - `verify:ui`
   - `snapshot:baseline`

驗證：

1. `nvm use` 後 `node -v` 顯示 `v20.x`。  
2. `npm run check:env` 在 Node 非 20 時應失敗。  

## Task 2：升級 Hexo 與必要依賴

檔案：

- 修改：`package.json`
- 修改：`package-lock.json`

步驟：

1. 升級 `hexo` 到 `8.1.1`。  
2. 升級與 Hexo 8 相容的必要套件（先最小集合）：  
   - `hexo-deployer-git`  
   - `hexo-generator-*`（必要者）  
   - `hexo-renderer-*`（必要者）  
3. 安裝流程固定為 `npm ci`，不使用 `npm install` 當正式流程。  

驗證：

1. `npx hexo version` 顯示核心版本 `8.1.1`。  
2. `npm ci` 全程成功。  

## Task 3：建立跨平台檢查腳本

檔案：

- 新增：`scripts/check-env.js`
- 新增：`scripts/verify-build.js`

步驟：

1. `check-env.js` 檢查：
   - Node major = 20
   - Hexo core = 8.1.1
   - lockfile 與套件狀態可用
2. `verify-build.js` 檢查：
   - `public/index.html`、`public/about/index.html` 存在
   - 其他關鍵頁面輸出存在
   - sitemap/robots/feed 產物存在（若已配置）

驗證：

1. Windows/macOS 皆可直接 `node scripts/check-env.js`。  
2. 缺少關鍵輸出時 `verify-build.js` 會 fail。  

## Task 4：建立 Playwright 回歸機制

檔案：

- 新增：`tests/ui/playwright.config.ts`（或 `.js`）
- 新增：`tests/ui/specs/site-regression.spec.ts`
- 新增：`tests/baseline/*`
- 新增：`scripts/snapshot-baseline.js`
- 新增：`scripts/verify-ui.js`

步驟：

1. 設定比對頁面與優先級：
   - P1：`/`、`/about`
   - P2：文章頁、`/categories`、`/tags`
2. 建立 baseline 截圖與 DOM 快照。  
3. `verify-ui.js` 執行 Playwright，失敗即中止流程。  

驗證：

1. 變更 DOM 層級時測試應失敗。  
2. UI 偏移超過閾值時測試應失敗。  

## Task 5：調整 Makefile 入口（保留手動流程）

檔案：

- 修改：`Makefile`

步驟：

1. 新增 targets：
   - `check-env`
   - `verify-build`
   - `verify-ui`
   - `snapshot-baseline`
2. 更新 `generate`：
   - 先 `npm run check:env`
   - 再 `hexo clean && hexo generate`
   - 再 `npm run verify:build`
3. 更新 `deploy`：
   - 依序跑 `check-env -> generate -> verify-ui -> hexo deploy`

驗證：

1. 少任一 gate 時 `make deploy` 會中止。  
2. 完整通過時才會推送到 `master`。  

## Task 6：SEO 基礎修正（不改 UI 結構）

檔案：

- 修改：`_config.yml`
- 新增：`source/robots.txt`
- 可能修改：`themes/edinburgh/layout/_partial/head.ejs`（僅必要）

步驟：

1. `url` 改為 `https://yianbau.github.io`。  
2. 新增 sitemap plugin 設定。  
3. 新增 `robots.txt`。  
4. 若缺 canonical，補最小模板 patch。  

驗證：

1. build 後可存取 `sitemap.xml`。  
2. build 後可存取 `robots.txt`。  
3. 首頁與文章頁含 canonical。  

## Task 7：人工驗收與回滾演練

步驟：

1. 本機執行 `make preview`，人工檢查首頁/about。  
2. 執行 `make generate` 與 `make deploy`。  
3. 線上抽查 `https://yianbau.github.io/` 與 `/about`。  
4. 記錄 deploy 前 `master` SHA，實作一鍵回滾指令。  

驗證：

1. 發佈成功且頁面一致。  
2. 可在 1 次命令內回滾到前版。  

## 最終交付

1. 穩定升級後的 `editor2` 分支。  
2. 可跨平台執行的 Make + Node scripts。  
3. Playwright baseline 與回歸測試。  
4. 不破壞 DOM/UI 的 Hexo 8 發佈流程。  
