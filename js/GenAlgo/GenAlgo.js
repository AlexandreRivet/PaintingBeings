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
    
    var newPopulation = new Population();
    
    // 10 percent of best
    for (var i = 0; i < 10; i++)
    {
        var blobImage = currentPopulation.blobImages[i].clone();
        newPopulation.blobImages.push(blobImage);
    }
    
    // 30 percent of cross
    for (var i = 0; i < 30; i++)
    {
        var blobImage = currentPopulation.blobImages[i];
        var crossed = blobImage.crossOver(new BlobImage(size));
        newPopulation.blobImages.push(crossed);
    }
    
    // 30 percent of mutate
    for (var i = 0 ; i < 30; i++) 
    {
        var blobImage = currentPopulation.blobImages[i];
        var muted = blobImage.mutate(new BlobImage(size));
        newPopulation.blobImages.push(muted);
    }
    
    // 30 percent of random
    for (var i = 0 ; i < 30 ; i++) 
    {
        newPopulation.blobImages.push(new BlobImage(size));
    }
    
    newPopulation.evaluate(currentImage);
    
    console.log(newPopulation.blobImages[0].fitness);
    
    currentPopulation = newPopulation.clone();
    
    return newPopulation.blobImages[0];
}