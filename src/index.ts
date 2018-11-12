import { PNGEmbedder } from "./PNGEmbedder";
declare var $:any;
declare var JSZip:any;

var embedder:PNGEmbedder = new PNGEmbedder();
var pngData:any;
var pngName:string;
var canvas = document.createElement("canvas");

var isZip:boolean = false;

$(()=>{
	
    console.log("hogehoge");


    $("#file").on("change", (e:any)=>{
//        console.log(e);
        if(e.target.files.length < 1)  {$("#message").text("ファイルを選択してください。");return;};
        if(e.target.files[0].name.indexOf("png") == -1) { $("#message").text("PNGを選択してください。");return;};
        loadPng(e.target.files[0]);
        pngName = e.target.files[0].name;
    });

    $("#embed").click(()=>{
		var dataStr = $("#output").val();
		isZip = $("#isZip").prop("checked");

        if(isZip){
            var zip = new JSZip();
            zip.file("data.hvd",dataStr);
            zip.generateAsync({type:"uint8array",compression: "DEFLATE"})
                .then((u8a)=>{
                    embedder.embed(pngData, u8a, (implantedDataURL:string)=>{
                        console.log("complete");
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
                });
    
            }else{
        var data = new TextEncoder().encode(dataStr);
        embedder.embed(pngData, data, (implantedDataURL:string)=>{
                            console.log("complete");
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
        
        

        }


    });
    $("#extract").click(()=>{
		isZip = $("#isZip").prop("checked");
        if(isZip){
            var zip = new JSZip();
            zip.loadAsync(embedder.extract(pngData)).then((zip)=>{
                zip.file("data.hvd").async("uint8array").then((obj)=>{
                    console.log(new TextDecoder().decode(obj));
                });
            })
       }else{
			console.log(new TextDecoder().decode(embedder.extract(pngData)));

        }
//        $("#output").text(new TextDecoder().decode());
    });

});

function loadPng(file:File){
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