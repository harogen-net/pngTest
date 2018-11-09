import { PNGEmbedder } from "./PNGEmbedder";
declare var $:any;
declare var JSZip:any;

var embedder:PNGEmbedder = new PNGEmbedder();
var pngData:any;
var pngName:string;
var canvas = document.createElement("canvas");

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
        //var data = new TextEncoder().encode(dataStr);

        var zip = new JSZip();
        zip.generateAsync({type:"uint8array"})
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



    });
    $("#extract").click(()=>{
        var zip = new JSZip();
        zip.loadAsync(embedder.extract(pngData)).then((obj)=>{
            console.log(zip);
        })
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