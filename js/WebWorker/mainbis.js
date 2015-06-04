var w;
var value = 0;

var colors = {
    "data": []
}

function convertToJSON(source, dest) 
{    
    for (var i = 0;  i < source.length; i++) {
        dest.data.push([]);
        for (var j = 0; j < source[i].length; j++) {
            dest.data[i].push(
                {
                    "r": source[i][j].r,
                    "g": source[i][j].g,
                    "b": source[i][j].b,
                    "a": source[i][j].a
                }
            );            
        }
    }
}

function startBlobWorker()
{
     if(typeof(Worker) !== "undefined") {
        if(typeof(w) == "undefined") {
            w = new Worker("js/GenAlgo/BlobWorker.js");
            setInterval(function() { w.postMessage(colors); value++; }, 500);
        }
        w.onmessage = function(event) {
            console.log(event.data);
        };
     } else {
        console.warn('Worker are not available in your browser. Download one who supports this epic technology.');   
     }
}

function stopBlobWorker()
{
    w.terminate();
    w = undefined;
}
    
startBlobWorker();

