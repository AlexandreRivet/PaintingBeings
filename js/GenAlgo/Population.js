
var populationNbr = 100;

function Population() {
    this.blobImages = new Array();
    
}

Population.prototype = {
    
    randomInit : function() {
        for ( var i = 0; i < populationNbr ; ++i) {
            var blobImage = new BlobImage();
            this.blobImages.push(blobImage);
        }
        
    },
    
    evaluate : function(image) {
        //Evaluate and sort the array
        for(var i = 0; i < populationNbr ; ++i) {
            this.blobImages[i].evaluate(image);
        }
        
        this.blobImages.sort(function(blobIA, blobIB) {
            
            if(blobIA.fitness < blobIB.fitness)
                return 1;
            else if(blobIA.fitness > blobIB.fitness)
                return -1;
            else
                return 0;
            
        });
    }
    
}