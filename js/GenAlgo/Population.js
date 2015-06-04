
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
        //Evaluate and sort the array
        for(var i = 0; i < populationNbr ; ++i) {
            // console.log("Blob image fitness " + i );
            this.blobImages[i].evaluate(image);
        }
        
        this.blobImages.sort(function(blobIA, blobIB) {
            return (blobIA.fitness - blobIB.fitness);
        });
    }
    
}