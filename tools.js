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

function escapeHtml(str){
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// 極簡 Markdown：只支援常用語法，原始 HTML 一律跳脫
var MD_FENCE = /^\s*(`{3,}|~{3,})/;
// # 後面要有空白，「#hashtag」不算標題
var MD_HEADING = /^\s*(#{1,6})(?:\s+(.*?)(?:\s+#+)?)?\s*$/;
var MD_HR = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
var MD_QUOTE = /^\s*> ?/;
var MD_UL = /^\s*[-*+]\s+(.*)$/;
var MD_OL = /^\s*\d+[.)]\s+(.*)$/;

function markdownToHtml(src){
    return mdBlocks(src.replace(/\r\n?/g, "\n").split("\n")).join("\n");
}

function mdIsBlockStart(line){
    return MD_FENCE.test(line) || MD_HEADING.test(line) || MD_HR.test(line) ||
           MD_QUOTE.test(line) || MD_UL.test(line) || MD_OL.test(line);
}

function mdBlocks(lines){
    var out = [];
    var i = 0;
    var m;

    while(i < lines.length){
        var line = lines[i];

        if(line.trim() == ""){
            i++;
        }else if((m = line.match(MD_FENCE))){
            var code = [];
            for(i++; i < lines.length && lines[i].trim().indexOf(m[1]) != 0; i++)
                code.push(lines[i]);
            i++;
            out.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        }else if((m = line.match(MD_HEADING))){
            var n = m[1].length;
            out.push("<h" + n + ">" + mdInline(m[2] || "") + "</h" + n + ">");
            i++;
        }else if(MD_HR.test(line)){
            out.push("<hr>");
            i++;
        }else if(MD_QUOTE.test(line)){
            var quote = [];
            for(; i < lines.length && MD_QUOTE.test(lines[i]); i++)
                quote.push(lines[i].replace(MD_QUOTE, ""));
            out.push("<blockquote>\n" + mdBlocks(quote).join("\n") + "\n</blockquote>");
        }else if(MD_UL.test(line) || MD_OL.test(line)){
            var re = MD_UL.test(line) ? MD_UL : MD_OL;
            var items = [];
            // 縮排的後續行併入同一項；不支援巢狀
            for(; i < lines.length && lines[i].trim() != ""; i++){
                if((m = lines[i].match(re)))
                    items.push(m[1]);
                else if(/^\s/.test(lines[i]) && !mdIsBlockStart(lines[i]))
                    items[items.length - 1] += "\n" + lines[i].trim();
                else
                    break;
            }
            var tag = re == MD_UL ? "ul" : "ol";
            out.push("<" + tag + ">\n<li>" + items.map(mdInline).join("</li>\n<li>") +
                     "</li>\n</" + tag + ">");
        }else{
            var para = [];
            for(; i < lines.length && lines[i].trim() != "" &&
                  (para.length == 0 || !mdIsBlockStart(lines[i])); i++)
                para.push(lines[i].replace(/^\s+/, ""));
            out.push("<p>" + mdInline(para.join("\n")) + "</p>");
        }
    }

    return out;
}

// 已產生的 HTML 先換成佔位字元，避免被後面的規則再處理
function mdInline(text){
    var saved = [];
    function save(html){
        saved.push(html);
        return "\u0000" + (saved.length - 1) + "\u0000";
    }

    text = text
        .replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, function(_, tick, code){
            return save("<code>" + escapeHtml(code.trim()) + "</code>");
        })
        .replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, function(_, c){
            return save(escapeHtml(c));
        });

    // 網址允許一層成對括號，例如維基百科的連結
    var link = /(!?)\[([^\]]*)\]\(\s*((?:[^\s()]|\([^\s()]*\))+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g;

    text = escapeHtml(text)
        .replace(link, function(_, img, label, url, title){
            url = mdSafeUrl(url);
            var t = title ? ' title="' + title + '"' : "";
            if(img)
                return save('<img src="' + url + '" alt="' + label + '"' + t + ">");
            return save('<a href="' + url + '"' + t + ">") + label + save("</a>");
        })
        .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "<strong>$2</strong>")
        .replace(/\*(?=\S)([\s\S]*?\S)\*/g, "<em>$1</em>")
        .replace(/(^|\W)_(?=\S)([\s\S]*?\S)_(?!\w)/g, "$1<em>$2</em>")
        .replace(/ {2,}\n/g, "<br>\n");

    return text.replace(/\u0000(\d+)\u0000/g, function(_, k){
        return saved[k];
    });
}

// 只放行 http(s)、mailto 與相對路徑，擋掉 javascript: 之類
function mdSafeUrl(url){
    var m = url.replace(/[\u0000-\u0020\u007F]/g, "").match(/^([^\/?#]*?):/);
    if(m && !/^(https?|mailto)$/i.test(m[1]))
        return "#";
    return url;
}
