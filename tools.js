function getArrayByFilename(filename, callback){
    $.get(filename + "?" + Math.random(), function(res){
        var arr = res.replace(/\n/g, " ").split(" ");
        callback(arr);
    });
}

function getNewDiv(){
    return $(document.createElement("div"));
}

function getParametersDict(){
    href_list = document.location.href.split("?");
    
    if(href_list.length == 1)
        return {};

    var dict = {};

    para_list = href_list[1].split("&");

    for(var i = 0;i < para_list.length;i++){
        para_line = para_list[i].split("=");
        dict[para_line[0]] = decodeURIComponent(para_line[1]);
    }
    
    return dict;
}

function getFileExtByFilename(filename){
    if(filename == "")
        return "";
    
    var ret = "";
    for(var i = filename.length-1; i >= 0;i--){
        if(filename[i] == "."){
            flag = true;
            break;
        }
        ret = filename[i] + ret;
    }

    if(ret == filename)
        return "";

    return ret;
}

function removeFileExt(filename){
    var ret = "";
    for(var i = 0;i < filename.length;i++){
        if(filename[i] == ".")
            break;
        ret += filename[i];
    }

    return ret;
}
