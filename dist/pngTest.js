'use strict';


var pngData;
var pngName;
const CHUNK_NAME = "hvDc"
const CHUNK_BARRAY = new TextEncoder().encode(CHUNK_NAME);


$(()=>{
    console.log("hogehoge");
    var canvas = document.createElement("canvas");

    $("#file").on("change", (e)=>{
//        console.log(e);
        if(e.target.files.length < 1)  {$("#message").text("ファイルを選択してください。");return;};
        if(e.target.files[0].name.indexOf("png") == -1) { $("#message").text("PNGを選択してください。");return;};
        loadPng(e.target.files[0]);
        pngName = e.target.files[0].name;
    });

    $("#embed").click(()=>{
        embed();
    });
    $("#extract").click(()=>{
        extract();
    });
});


function extract(){
    if(!pngData) { $("#message").text("PNGデータがありません。");return;}


    var b64data = pngData.split(',', 2);
 
    // Base64 デコード
    var decoded = window.atob(b64data.pop());
     
    // Uint8Array に変換
    var png = new Uint8Array(
        decoded.split('').map(function(char) {
            return char.charCodeAt(0);
        })
    );



    var extractedData = process(png, CHUNK_NAME, function(png, rpos, length) {
        return png.subarray(rpos, rpos += length);
    });
    $("#output").text(new TextDecoder().decode(extractedData));
}

function embed(){
    if(!pngData) { $("#message").text("PNGデータがありません。");return;}

    var b64data = pngData.split(',', 2);
 
    // Base64 デコード
    var decoded = window.atob(b64data.pop());
     
    // Uint8Array に変換
    var png = new Uint8Array(
        decoded.split('').map(function(char) {
            return char.charCodeAt(0);
        })
    );


    var dataStr = $("#output").val();
    var data = new TextEncoder().encode(dataStr);
    //var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    
    // 書き込み用バッファ
    var implanted = new Uint8Array(png.length + data.length + 12);
    var Signature = String.fromCharCode(137, 80, 78, 71, 13, 10, 26, 10);
    var rpos = 0;
    if (String.fromCharCode.apply(null, png.subarray(rpos, rpos += 8)) !== Signature) {
        throw new Error('invalid signature');
    }

    process(png, 'IDAT', function(png, rpos, length) {
        // rpos - 8 = チャンクの開始位置
        insertHogeChunk(implanted, data, png, rpos - 8);

        // Uint8Array から bytestring に変換
    var implantedString = "";
    for (var i = 0, il = implanted.length; i < il; ++i) {
        implantedString += String.fromCharCode(implanted[i]);
    }

// Base64 に変換
        var implantedBase64 = window.btoa(implantedString);
        var implantedDataURL = 'data:image/png;base64,' + implantedBase64;
        $("img#img").attr("src", implantedDataURL);
        $("#message").text("埋め込みが完了しました。");


        var a = document.createElement("a");
        a.href = implantedDataURL;
        a.target = '_blank';
        a.download = pngName;
        a.click();
        URL.revokeObjectURL(a.href);

        $("#file").val("");
    });
    console.log("hogehoge");
 

}

function process(png, type, handler) {
    var dataLength;
    var chunkType;
    var nextChunkPos;
    var Signature = String.fromCharCode(137, 80, 78, 71, 13, 10, 26, 10);
    var rpos = 0;
    
    // シグネチャの確認
    if (String.fromCharCode.apply(null, png.subarray(rpos, rpos += 8)) !== Signature) {
        throw new Error('invalid signature');
    }
    
    // チャンクの探索
    while (rpos < png.length) {
        dataLength = (
            (png[rpos++] << 24) |
            (png[rpos++] << 16) |
            (png[rpos++] <<  8) |
            (png[rpos++]      )
        ) >>> 0;
    
        nextChunkPos = rpos + dataLength + 8;
    
        chunkType = String.fromCharCode.apply(null, png.subarray(rpos, rpos += 4));
        
        if (chunkType === type) {
            return handler(png, rpos, dataLength);
        }
        
        rpos = nextChunkPos;
    }
}

function createHogeChunk(data) {
    var dataLength = data.length;
    var chunk = new Uint8Array(4 + 4 + dataLength + 4);
    var type = CHUNK_BARRAY;
    var crc;
    var pos = 0;
    var i;
    
    // length
    chunk[pos++] = (dataLength >> 24) & 0xff;
    chunk[pos++] = (dataLength >> 16) & 0xff;
    chunk[pos++] = (dataLength >>  8) & 0xff;
    chunk[pos++] = (dataLength      ) & 0xff;
    
    // type
    chunk[pos++] = type[0];
    chunk[pos++] = type[1];
    chunk[pos++] = type[2];
    chunk[pos++] = type[3];
    
    // data
    for (i = 0; i < dataLength; ++i) {
        chunk[pos++] = data[i];
    }
    
    //crc
    crc = Zlib.CRC32.calc(type);
    crc = Zlib.CRC32.update(data, crc);
    chunk[pos++] = (crc >> 24) & 0xff;
    chunk[pos++] = (crc >> 16) & 0xff;
    chunk[pos++] = (crc >>  8) & 0xff;
    chunk[pos++] = (crc      ) & 0xff;
    
    return chunk;
}

function insertHogeChunk(implanted, data, png, rpos) {
    var chunk = createHogeChunk(data);
    var pos = 0;
    
    // IDAT チャンクの前までコピー
    implanted.set(png.subarray(0, rpos), pos);
    pos += rpos;
    
    // hoGe チャンクをコピー
    implanted.set(chunk, pos);
    pos += chunk.length;
    
    // IDAT チャンク以降をコピー
    implanted.set(png.subarray(rpos), pos);
    
    return implanted;
}


function loadPng(file){
    var reader = new FileReader();
    reader.addEventListener('load', (e) => {
        pngData = reader.result;
        $("img#img").attr("src", pngData);
    });
    try{
        reader.readAsDataURL(file);
    }
    catch(e){
        $("#message").text("PNGロードエラーです。");
    }
}

