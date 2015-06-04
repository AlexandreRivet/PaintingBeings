var currentPopulation;
//var lastPopulation;

function GenAlgo(currentImage) 
{     
    var size = currentImage.length * currentImage[0].length;
    
    currentPopulation = new Population();
    currentPopulation.randomInit(size);
    currentPopulation.evaluate(currentImage);       
}

function nextPopulation(currentImage) {
    
    var size = currentImage.length * currentImage[0].length;
    
    //CrossOver
    for (var i = 1 ; i < 20 ; ++i) {
        currentPopulation.blobImages[i].crossOver(currentPopulation.blobImages[0]);
    }
    
    //Mutation
    for (var i = 21 ; i < 40 ; ++i) {
        currentPopulation.blobImages[i].mutate();
    }
    
    //New image
    for (var i = 61 ; i < 100 ; ++i) {
        currentPopulation.blobImages[i] = new BlobImage(size);
    }
    
    currentPopulation.evaluate(currentImage);
    
    console.log(currentPopulation.blobImages[0].fitness);
    
    return currentPopulation.blobImages[0];
}
