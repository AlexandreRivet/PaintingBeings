var currentPopulation;
//var lastPopulation;

function GenAlgo(currentImage) {
     
        currentPopulation = new Population();
        currentPopulation.randomInit();
        currentPopulation.evaluate(currentImage);
        
}

function nextPopulation(currentImage) {
    
    //lastPopulation = currentPopulation;
    
    //CrossOver
    for (var i = 11 ; i < 44 ; ++i) {
        currentPopulation.blobImages[i].crossOver(new BlobImage());
    }
    
    //Mutation
    for (var i = 44 ; i < 77 ; ++i) {
        currentPopulation.blobImages[i].mutate();
    }
    
    //New image
    for (var i = 77 ; i <= 100 ; ++i) {
        currentPopulation.blobImages[i] = new BlobImage();
    }
    
    currentPopulation.evaluate(currentImage);
}
