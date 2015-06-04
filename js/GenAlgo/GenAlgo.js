var currentPopulation;
var lastFitness;

function GenAlgo(currentImage) 
{     
    var size = currentImage.length * currentImage[0].length;
    
    currentPopulation = new Population();
    currentPopulation.randomInit(size);
    currentPopulation.evaluate(currentImage);       
}

function nextPopulation(currentImage) 
{    
    var size = currentImage.length * currentImage[0].length;
    
    lastFitness = currentPopulation.blobImages[0].fitness;
    
    //CrossOver
    for (var i = 15 ; i <= 40; i++) {
        currentPopulation.blobImages[i].crossOver(currentPopulation.blobImages[0]);
    }
    
    //Mutation
    for (var i = 41 ; i <= 60 ; i++) {
        currentPopulation.blobImages[i].mutate();
    }
    
    //New image
    for (var i = 61 ; i < 100 ; i++) {
        currentPopulation.blobImages[i] = new BlobImage(size);
    }
    
    currentPopulation.evaluate(currentImage);
    
    console.log (lastFitness + " " + currentPopulation.blobImages[0].fitness);
    if (lastFitness < currentPopulation.blobImages[0].fitness)
        debugger;
    
    return currentPopulation.blobImages[0];
}