function Blob() {
    
    this.size = 1;
    
    var red = Math.floor((Math.random() * 255));
    var green = Math.floor((Math.random() * 255));
    var blue = Math.floor((Math.random() * 255));
    
    this.color = [red, green, blue];
    //this.position = position;
    
}

Blob.prototype = {
    
    mutate : function() {
        
        var colorIndex = Math.floor((Math.random() * 3));
        this.color[colorIndex] = Math.floor((Math.random() * 255));
        
    },
    
    evaluate : function(pixelColor) {
    
        
        
    }
    
}