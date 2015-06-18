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
    
    for (var i = 0; i < percentBest; i++)
    {
        var blobImage = currentPopulation.blobImages[i].clone();
        newPopulation.blobImages.push(blobImage);
    }

    for (var i = 0; i < percentCrossed; i++)
    {
        var blobImage = currentPopulation.blobImages[i];
        var crossed = blobImage.crossOver(currentPopulation.blobImages[Math.floor(Math.random()*(populationNbr-1))]);
        //if(Math.random()
        newPopulation.blobImages.push(crossed);
    }
    
    for (var i = 0 ; i < percentMutate; i++) 
    {
        var blobImage = currentPopulation.blobImages[i];
        var muted = blobImage.mutate(new BlobImage(size));
        newPopulation.blobImages.push(muted);
    }
    
    for (var i = 0 ; i < percentRandom-1 ; i++) 
    {
        newPopulation.blobImages.push(new BlobImage(size));
    }
    
    var blobImage = new BlobImage(size);
    blobImage.createFromImage(currentImage);
    newPopulation.blobImages.push(blobImage);
    
    newPopulation.evaluate(currentImage);
    
    // console.log(newPopulation.blobImages[0].fitness);
    
    currentPopulation = newPopulation.clone();
    
    return newPopulation.blobImages[0];
}