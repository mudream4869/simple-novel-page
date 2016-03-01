最近手癢想寫小說，但又不想弄到各大網站，只想放在網路上。這東西就是這種情況下的產物。

大概想了想，需求就這個：章節列表，然後再用`靜態`+`jquery`可以把需求弄到很低。

# 大致架構

小說存放方式如下：

```
+root
|- chapters.txt
|-+[第ㄧ章]
| |- lists.txt
| |- [第一節].txt
|
|-+[第二章]
...
```

`chapters.txt`裡面是`章`的列表
`lists.txt`裡面是`節`的列表

# 實作方法

使用`$.get(url, callback);`可以抓取到各列表、章節內容，基本上就完成了。

# 範例

四處尋找容易架設的靜態網頁空間，發現`Dropbox`+`DropPages`不錯，就拿來試用了，雖然之前有租一個一年的主機，不過為了好好測試被壓低的需求，就用它了。

[DropPages範例](http://simple-novel-page.droppages.com/index.html)

### 第一步

開通DropPages

### 第二步

把所有檔案（就github上這些檔案）放在`Public`資料夾底下

### 第三步

打開`http://[page-name].droppages.com/index.html`

假如嫌後面多出`index.html`麻煩，可以去設定`Templates/base.html`轉到`index.html`

# 最後

[Source Code on Github](https://github.com/mudream4869/simple-novel-page)