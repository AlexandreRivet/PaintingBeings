// var blobNbr = 4100;
var blobMutation = 30;

function BlobImage(blobNbr) 
{
    this.blobNumber = blobNbr;
    
    var newBlobs = new Array();
    
    for (var i = 0; i < this.blobNumber ; ++i) 
    {
        newBlobs.push(new Blob());
    }
    
    this.blobs = newBlobs;
    this.fitness = 0;
    
}

BlobImage.prototype = 
{
    
    crossOver : function(another) 
    {
     
        var copy = this.clone();
        
        for (var i = 0; i < this.blobNumber ; ++i) 
        {
            var index = Math.floor((Math.random() * 2));
            if(index)
            {
                copy.blobs[i] = another.blobs[i].clone();
            }
        }
        
        return copy;
        
    },
    
    mutate : function() 
    {   
        var copy = this.clone();
        
        var blobToMutate = (this.blobNumber * blobMutation) / 100;
        for (var i = 0; i < blobToMutate ; ++i) 
        {
            var randomIndex = Math.floor((Math.random() * this.blobNumber));    
            copy.blobs[randomIndex].mutate();
        }
        
        return copy;
        
    },
    
    evaluate : function(image) 
    {    
        
        this.fitness = 0;
        for(var i = 0; i < image.length ; i++) 
        {
            for(var j = 0; j < image[i].length; j++) 
            {
                this.fitness += this.blobs[(i * image[i].length) + j].evaluate(image[i][j]);
            }
        }
        
    },
    
    clone: function()
    {
        var newBlobImage = new BlobImage(this.blobNumber);
        for (var i = 0; i < this.blobNumber; i++)
            newBlobImage.blobs[i] = this.blobs[i].clone();
        newBlobImage.fitness = this.fitness;
        
        return newBlobImage;
    }
    
}
            
