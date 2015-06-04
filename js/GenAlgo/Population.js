var populationNbr = 100;

function Population() 
{
    this.blobImages = new Array();
}

Population.prototype = {
    
    randomInit : function(size) 
    {
        
        for ( var i = 0; i < populationNbr ; ++i) 
            this.blobImages.push(new BlobImage(size));
        
    },
    
    evaluate : function(image) 
    {
        
        for(var i = 0; i < populationNbr ; ++i) 
            this.blobImages[i].evaluate(image);

        this.blobImages.sort(function(blobIA, blobIB) {
            return (blobIA.fitness - blobIB.fitness);
        });
        
    },
    
    clone: function()
    {
        
        var newPopulation = new Population();
        for (var i = 0; i < this.blobImages.length; i++)
            newPopulation.blobImages.push(this.blobImages[i].clone());
        
        return newPopulation;
        
    }
    
}