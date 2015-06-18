var currentPopulation;
var lastFitness;
var blobImageRight;

function GenAlgo(currentImage) 
{         
    var size = currentImage.length * currentImage[0].length;    
    
    blobImageRight = new BlobImage(size);
    blobImageRight.createFromImage2(currentImage);
    
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
        /*
        var crossed = null;
        if(Math.random()*1000 >= 999){
            crossed = blobImage.crossOver(blobImageRight);
        }else{*/
        crossed = blobImage.crossOver(currentPopulation.blobImages[Math.floor(Math.random()*(populationNbr-1))]);
        //}
        newPopulation.blobImages.push(crossed);
    }
    
    for (var i = 0 ; i < percentMutate; i++) 
    {
        var blobImage = currentPopulation.blobImages[i];
        var muted = blobImage.mutate(new BlobImage(size));
        newPopulation.blobImages.push(muted);
    }
    
    for (var i = 0 ; i < percentRandom ; i++) 
    {
        newPopulation.blobImages.push(new BlobImage(size));
    }
        
    newPopulation.evaluate(currentImage);
    
    // console.log(newPopulation.blobImages[0].fitness);
    
    currentPopulation = newPopulation.clone();
    
    return newPopulation.blobImages[0];
}