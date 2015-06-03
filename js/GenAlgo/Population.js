
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
    
    select : function() {
        
        
        
    },
    
    evaluate : function() {
           //Evaluate and sort the array
    }
    
}