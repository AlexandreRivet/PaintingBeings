importScripts(
    '../Core/utils.js',
    '../Core/ImageManager.js', 
    '../GenAlgo/Blob.js', 
    '../GenAlgo/BlobImage.js', 
    '../GenAlgo/Population.js', 
    '../GenAlgo/GenAlgo.js'
);

var IMAGE_ANALYSED;

function main()
{
    if (check(IMAGE_ANALYSED))
    {
        // Traitement de l'algorithme génétique
        var bestFlubber = nextPopulation(IMAGE_ANALYSED);
    
        // Retourne le résultat au main thread
        postMessage(bestFlubber);
    }
    
    // Relance de la fonction
    setTimeout("main()", 10000);
}

self.addEventListener('message', function(e) {
    
    var data = e.data;
    
    IMAGE_ANALYSED = JSONToImage(data);
    GenAlgo(IMAGE_ANALYSED);
    
}, false);

main();