# yianbau.github.io Hexo 8 升級設計方案

日期：2026-04-04  
分支：`editor2`（唯一開發分支）  
發佈模式：方案 A（本機手動 `make preview -> make generate -> make deploy`）

## 1. 目標

1. 將專案從 `Hexo 6.3.0` 升級到 `Hexo 8.1.1`。  
2. Node.js 以 `nvm` 管理，固定 `Node 20 LTS`。  
3. 不破壞現有 theme（`edinburgh`）的 DOM 與 UI 結構。  
4. 發佈流程維持簡單手動操作，但加入嚴格前置檢查。  
5. `master` 維持 GitHub Pages 靜態輸出分支。  

## 2. 不可變約束

1. 只在 `editor2` 進行升級與驗證。  
2. `editor` 分支保留不動。  
3. 不導入 CI-only 發佈流程，不改成 Travis/GitHub Actions 必經。  
4. 所有新增命令必須同時支援 Windows 與 macOS。  
5. 只做必要相容 patch，不做 theme 重構。  

## 3. 風險模型與控制策略

### 3.1 版本相容風險

- 風險：Hexo 主版本升級造成 plugin/renderer/deployer 不相容。  
- 控制：保守升級，只升核心與必要套件；使用 `npm ci` 鎖依賴。  

### 3.2 發佈風險

- 風險：本機版本漂移導致 `make deploy` 結果不一致。  
- 控制：`make generate` 與 `make deploy` 前強制檢查 Node/Hexo 版本與 lockfile。  

### 3.3 Theme 破壞風險

- 風險：helper 或模板差異造成 DOM 層級、樣式、區塊位移。  
- 控制：Playwright 雙驗證（DOM + screenshot）作為 deploy gate。  

## 4. 驗證等級（Gate）

### Gate 1：環境驗證

必須通過：

1. `node -v` 為 `20.x`。  
2. Hexo CLI/核心版本為 `8.1.1`。  
3. 依賴安裝必須使用 `npm ci`。  

### Gate 2：建置驗證

必須通過：

1. `hexo clean` 成功。  
2. `hexo generate` 成功。  
3. 產物 `public/` 結構完整。  

### Gate 3：UI/DOM 回歸驗證

最高優先頁（阻斷級）：

1. `/`（首頁）  
2. `/about`  

次高頁（阻斷級）：

1. 代表性文章頁（含圖片與 code block）  
2. `/categories`  
3. `/tags`  

驗證方式：

1. DOM 結構比對（關鍵 selector 存在、層級與順序一致）。  
2. 截圖比對（desktop + mobile）。  

## 5. 跨平台命令設計

`Makefile` 只保留入口；實作邏輯放 Node scripts：

1. `scripts/check-env.js`：檢查 Node/Hexo/npm ci 狀態。  
2. `scripts/verify-build.js`：檢查 `public/` 關鍵輸出。  
3. `scripts/verify-ui.js`：Playwright DOM + screenshot 比對。  
4. `scripts/snapshot-baseline.js`：建立與更新 baseline。  

建議 Make targets：

1. `make check-env`  
2. `make snapshot-baseline`  
3. `make verify-ui`  
4. `make generate`（含前置檢查）  
5. `make deploy`（含全部 gate）  

## 6. SEO/AEO/GEO 同步修正

1. `_config.yml` `url` 修正為 `https://yianbau.github.io`。  
2. 新增 sitemap 產生器（`hexo-generator-sitemap`）。  
3. 新增 `source/robots.txt`。  
4. 若 theme 未提供 canonical，補最小模板 patch。  
5. 保留既有 feed 並驗證可讀。  

## 7. 回滾策略

1. 每次 deploy 前記錄 `master` 最新 commit SHA。  
2. 發現線上異常時，直接回退到前一個已驗證 commit。  
3. 回滾後保留問題版本標記，禁止重複 deploy。  

## 8. 完成定義（DoD）

1. 在 `editor2` 可穩定執行：`nvm use` -> `npm ci` -> `make preview` -> `make generate` -> `make deploy`。  
2. 首頁與 about DOM + UI 比對 100% 通過。  
3. 次高頁面 DOM + UI 比對通過。  
4. `master` 發佈後 `https://yianbau.github.io/` 正常載入。  
5. GitHub Pages 可正常爬搜（sitemap/robots/canonical 可用）。  
