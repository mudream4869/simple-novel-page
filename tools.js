// 靜態空間不見得會送 no-cache，一律加亂數避開快取
function noCacheUrl(filename){
    return filename + "?" + Math.random();
}

// fetch 遇到 404 不會 reject，要自己擋
function fetchText(url){
    return fetch(url).then(function(r){
        if(!r.ok)
            throw new Error(r.status + " " + url);
        return r.text();
    });
}

// 讀檔，切成非空的行陣列
function getArrayByFilename(filename, callback, errback){
    return fetchText(noCacheUrl(filename)).then(function(res){
        callback(getArrayByString(res));
    }, errback || function(){});
}

// 一行一筆，去掉空行與行首尾空白（所以章節名可以含空白）
function getArrayByString(input_str){
    var lines = input_str.split(/\r?\n/);
    var ret_arr = [];
    for(var i = 0; i < lines.length; i++){
        var line = lines[i].trim();
        if(line != "")
            ret_arr.push(line);
    }

    return ret_arr;
}

// cls、text 可省略
function el(tag, cls, text){
    var e = document.createElement(tag);
    if(cls)
        e.className = cls;
    if(text !== undefined)
        e.textContent = text;
    return e;
}

function getParametersDict(){
    var query = document.location.search.replace(/^\?/, "");
    if(query == "")
        return {};

    var dict = {};
    var para_list = query.split("&");

    for(var i = 0; i < para_list.length; i++){
        var para_line = para_list[i].split("=");
        if(para_line[0] == "")
            continue;
        dict[decodeParameter(para_line[0])] = decodeParameter(para_line[1] || "");
    }

    return dict;
}

function decodeParameter(str){
    return decodeURIComponent(str.replace(/\+/g, " "));
}

// 本頁唯一看得懂的副檔名，其餘的點都當作節名的一部分
var KNOWN_EXTS = ["md"];

// 副檔名取最後一個點之後，沒有副檔名則回空字串
function getFileExtByFilename(filename){
    var pos = filename.lastIndexOf(".");
    if(pos <= 0)
        return "";

    return filename.substring(pos + 1);
}

// 只去掉認得的副檔名，「第1.5節」這種節名要原樣保留
function removeFileExt(filename){
    var pos = filename.lastIndexOf(".");
    if(pos <= 0)
        return filename;

    if(KNOWN_EXTS.indexOf(filename.substring(pos + 1).toLowerCase()) == -1)
        return filename;

    return filename.substring(0, pos);
}

// 章節名可能含 &、# 等字元，組 URL 一律編碼
function getContentUrl(chapter, tt){
    return "content.html?chapter=" + encodeURIComponent(chapter) +
           "&tt=" + encodeURIComponent(tt);
}

function getChapterListUrl(chapter){
    return encodeURIComponent(chapter) + "/list.txt";
}

function getTextUrl(chapter, tt){
    return encodeURIComponent(chapter) + "/" + encodeURIComponent(tt) + ".txt";
}

// 純文字轉 HTML：先跳脫再把換行換成 <br>
function textToHtml(str){
    return el("div", "", str).innerHTML.replace(/\r?\n/g, "<br>");
}

// 三個頁面共用的書名載入
function initNovelTitle(){
    getArrayByFilename("info.txt", function(arr){
        if(arr.length == 0)
            return;

        document.querySelector("h1.novel-title").textContent = arr[0];
        document.title = arr[0];
    });
}
