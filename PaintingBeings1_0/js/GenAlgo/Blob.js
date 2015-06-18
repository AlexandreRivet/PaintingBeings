function Blob() {
    
    this.size = 1;
    
    var red = Math.floor((Math.random() * 255));
    var green = Math.floor((Math.random() * 255));
    var blue = Math.floor((Math.random() * 255));
    
    this.color = [red, green, blue];
    // this.position = position;  
}

Blob.prototype = {
    
    mutate : function(pixel) {
        
        var colorIndex = Math.floor((Math.random() * 3));
        this.color[colorIndex] = pixel.color[colorIndex];
        //this.color[colorIndex] = Math.floor((Math.random() * 255));
        
    },
    
    evaluate : function(pixelColor) {
    
        var diffR = Math.abs(this.color[0] - pixelColor.r);
        var diffG = Math.abs(this.color[1] - pixelColor.g);
        var diffB = Math.abs(this.color[2] - pixelColor.b);
        
        return diffR + diffG + diffB;
    },
    
    clone: function() {
     
        var newBlob = new Blob();
        newBlob.size = this.size;
        newBlob.color =
            [
                this.color[0],
                this.color[1],
                this.color[2]
            ];
        return newBlob;
        
    }
    
}