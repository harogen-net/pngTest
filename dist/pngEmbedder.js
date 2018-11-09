export default class PNGEmbedder {
    
    constructor(){
        this.CHUNK_TYPE = "hvDc";
        this.CHUNK_TYPE_BARRAY = new TextEncoder().encode(this.CHUNK_TYPE);
    }

    embed(pngDataURL, bytearray, handler){
        // Base64 デコード
        var decoded = window.atob(pngDataURL.split(',', 2).pop());
        // Uint8Array に変換
        var png = new Uint8Array(
            decoded.split('').map(function(char) {
                return char.charCodeAt(0);
            })
        );
        var rpos = 0;
    
        // 書き込み用バッファ
        var implanted = new Uint8Array(png.length + bytearray.length + 12);
        var Signature = String.fromCharCode(137, 80, 78, 71, 13, 10, 26, 10);
        if (String.fromCharCode.apply(null, png.subarray(rpos, rpos += 8)) !== Signature) {
            throw new Error('invalid signature');
        }
    
        process(png, 'IDAT', function(png, rpos, length) {
            // rpos - 8 = チャンクの開始位置
            insertChunk(implanted, data, png, rpos - 8);
    
            // Uint8Array から bytestring に変換
            var implantedString = "";
            for (var i = 0, il = implanted.length; i < il; ++i) {
                implantedString += String.fromCharCode(implanted[i]);
            }
    
            // Base64 に変換
            var implantedBase64 = window.btoa(implantedString);
            var implantedDataURL = 'data:image/png;base64,' + implantedBase64;

            hander(implantedDataURL);
        });

        //

        var createChunk = (data)=>{
            var dataLength = data.length;
            var chunk = new Uint8Array(4 + 4 + dataLength + 4);
            var type = this.CHUNK_TYPE_BARRAY;
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
        };

        var insertChunk = (implanted, data, png, rpos)=>{
            var chunk = createChunk(data);
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
        };
    }

    extract(pngDataURL){


        return undefined;
    }

    //

    process(png, type, handler) {
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
}