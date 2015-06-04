var blobNbr = 4100;
var blobMutation = 30;

function BlobImage() {
    
    var newBlobs = new Array();
    
    for (var i = 0; i < blobNbr ; ++i) {
        newBlobs.push(new Blob());
    }
    
    this.blobs = newBlobs;
    this.fitness = 0;
    
}

BlobImage.prototype = {
    
    crossOver : function(another) {
     
        for (var i = 0; i < blobNbr / 2 ; ++i) {
            this.blobs[i] = another.blobs[i];      
        }
        
    },
    
    mutate : function() {
        
        var blobToMutate = (blobNbr * blobMutation)/100;
        
        for (var i = 0; i < blobToMutate ; ++i) {
            var randomIndex = Math.floor((Math.random() * blobNbr));    
            this.blobs[randomIndex].mutate();
        }
        
    },
    
    evaluate : function(image) {
        
        for(var i = 0; i < image.length ; ++i) {
            for(var j = 0; j < image[j].length; ++j) {
                console.log(i + " " + j);
                this.fitness += this.blobs[(i*image[i].length)+j].evaluate(image[i][j]);
                
            }
        }
        
    }
    
}
            
