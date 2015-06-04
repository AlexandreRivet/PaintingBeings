// var blobNbr = 4100;
var blobMutation = 30;

function BlobImage(blobNbr) {
    
    // console.log("BlobImage:" + blobNbr);
    
    this.blobNumber = blobNbr;
    
    var newBlobs = new Array();
    
    for (var i = 0; i < this.blobNumber ; ++i) {
        newBlobs.push(new Blob());
    }
    
    this.blobs = newBlobs;
    this.fitness = 0;
    
}

BlobImage.prototype = {
    
    crossOver : function(another) {
     
        for (var i = 0; i < this.blobNumber ; ++i) {
            var index = Math.floor((Math.random() * 2));
            if(index)
                this.blobs[i] = another.blobs[i];      
        }
        
    },
    
    mutate : function() {
        
        var blobToMutate = (this.blobNumber * blobMutation) / 100;
        
        for (var i = 0; i < blobToMutate ; ++i) {
            var randomIndex = Math.floor((Math.random() * this.blobNumber));    
            this.blobs[randomIndex].mutate();
        }
        
    },
    
    evaluate : function(image) {
        
        this.fitness = 0;
        
        for(var i = 0; i < image.length ; ++i) {
            for(var j = 0; j < image[i].length; ++j) {
                this.fitness += this.blobs[(i * image[i].length) + j].evaluate(image[i][j]);
            }
        }
        
    }
    
}
            
