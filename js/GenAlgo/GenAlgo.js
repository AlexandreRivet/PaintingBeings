var currentPopulation;
//var lastPopulation;

function GenAlgo(currentImage) 
{     
    var size = currentImage.length * currentImage[0].length;
    
    // console.log(size);
    
    currentPopulation = new Population();
    currentPopulation.randomInit(size);
    currentPopulation.evaluate(currentImage);       
}

function nextPopulation(currentImage) {
    
    var size = currentImage.length * currentImage[0].length;
    
    //CrossOver
    for (var i = 5 ; i < 40 ; ++i) {
        currentPopulation.blobImages[i].crossOver(currentPopulation.blobImages[0]);
    }
    
    //Mutation
    for (var i = 41 ; i < 80 ; ++i) {
        currentPopulation.blobImages[i].mutate();
    }
    
    //New image
    for (var i = 81 ; i < 100 ; ++i) {
        currentPopulation.blobImages[i] = new BlobImage(size);
    }
    
    currentPopulation.evaluate(currentImage);
    
    return currentPopulation.blobImages[0];
}
