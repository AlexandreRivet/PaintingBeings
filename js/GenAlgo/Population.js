
var populationNbr = 100;

function Population() {
    this.blobImages = new Array();
    
}

Population.prototype = {
    
    randomInit : function(size) {
        for ( var i = 0; i < populationNbr ; ++i) {
            var blobImage = new BlobImage(size);
            this.blobImages.push(blobImage);
        }
        
    },
    
    evaluate : function(image) {
    
        console.log("Avant evaluate");
        
        //Evaluate and sort the array
        for(var i = 0; i < populationNbr ; ++i) {
            // console.log("Blob image fitness " + i );
            console.log(this.blobImages[i].fitness);
            this.blobImages[i].evaluate(image);
        }
        
        console.log("Après evaluate");
        //Evaluate and sort the array
        for(var i = 0; i < populationNbr ; ++i) {
            // console.log("Blob image fitness " + i );
            console.log(this.blobImages[i].fitness);
        }
        
        console.log("Avant sort");
        
        this.blobImages.sort(function(blobIA, blobIB) {
            return (blobIA.fitness - blobIB.fitness);
        });
        
        console.log("Après sort");
        
        for (var i = 0; i < this.blobImages.length - 1; i++)
        {
            console.log(this.blobImages[i].fitness);
            if (this.blobImages[i + 1].fitness < this.blobImages[i].fitness)
                console.log("COCK");
        }
    }
    
}