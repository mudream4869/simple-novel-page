# simple-novel-page

陽春的靜態單一小說頁面

## 使用簡介

只需要注意三個東西

* 書名：`info.txt`
* 章列表：`chapters.txt`
* 節列表：`[章名]/list.txt`
* 節：`[章名]/[節名].txt`

選用的檔案

* 簡介：`about.txt`（沒有就顯示預設文字）
* 整本下載：`txtall.txt`（有這個檔案，簡介頁才會出現「下載TXT」按鈕）

### 列表格式

`chapters.txt` 和 `list.txt` 都是一行一筆，空行會被略過，行首尾的空白會被去掉，
所以章節名裡可以有空白。

### Markdown

節的檔名若是 `[節名].md`，實際檔案要存成 `[節名].md.txt`，內容會用 Markdown 算繪；
其餘的節一律當純文字，換行就是換行。

`.md` 是唯一會被當成副檔名的東西，所以節名裡可以有點，例如 `第1.5節` 會原樣顯示。

## 範例

範例：[使用DropBox搭配DropPages](http://simple-novel-page.droppages.com/index.html)

### 第一步

開通DropPages

### 第二步

把所有檔案（就github上這些檔案）放在`Public`資料夾底下

### 第三步

打開`http://[page-name].droppages.com/index.html`

假如嫌後面多出`index.html`麻煩，可以去設定`Templates/base.html`轉到`index.html`
