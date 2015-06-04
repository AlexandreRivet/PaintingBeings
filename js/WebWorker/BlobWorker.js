importScripts('Blob.js', 'TestClassWorker.js', '../../libs/three/three.js');

var IMAGE = null;

function runGeneticAlgorithm()
{
    // Affichage de l'image
    console.log(IMAGE);
    
    // Ici déroulement de l'algo génétique
    var result = run();
    
    // Ici on retourne le résultat du thread
    postMessage(result);
    
    // On relance la fonction dans le thread
    setTimeout("runGeneticAlgorithm()", 1000);
}

self.addEventListener('message', function(e) {
    IMAGE = e.data;
}, false);

runGeneticAlgorithm();