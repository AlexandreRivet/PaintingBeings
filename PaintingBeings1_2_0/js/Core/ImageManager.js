var CustomTexture = function(width, height)
{
    this.mWidth = width;
    this.mHeight = height;
    this.mCanvas = document.createElement('canvas');
    this.mCanvas.width = width;
    this.mCanvas.height = height;
    this.mCtx = this.mCanvas.getContext('2d');
    this.mImage = new Image();
    
    this.mData = null;
    
    this.init();
}

CustomTexture.prototype.init = function()
{
    this.mData = this.mCtx.getImageData(0, 0, this.mWidth, this.mHeight);
    var data = this.mData.data;
    for (var i = 0; i < this.mHeight; i++)
    {  
        for (var j = 0; j < this.mWidth * 4; j += 4)
        {
            data[i * this.mWidth * 4 + j    ] = 255;
            data[i * this.mWidth * 4 + j + 1] = 255;
            data[i * this.mWidth * 4 + j + 2] = 255;
            data[i * this.mWidth * 4 + j + 3] = 255;
        }
    }
    this.compute();
}

CustomTexture.prototype.getWidth = function()
{
    return this.mWidth;   
}

CustomTexture.prototype.getHeight = function()
{
    return this.mHeight;
}

CustomTexture.prototype.getColorAtIndex = function(index)
{
    var row = Math.floor(index / this.mHeight);
    var col = index % this.mWidth;
    this.getColorAtPosition(row, col);
}

CustomTexture.prototype.getColorAtPosition = function(row, col)
{
    var imgData = this.mCtx.getImageData(row, col, 1, 1);
    var color = imgData.data;
    
    return {
        "r": color[0], 
        "g": color[1], 
        "b": color[2], 
        "a": color[3]
    };
}

CustomTexture.prototype.setColorAtIndex = function(index, color)
{
    var row = Math.floor(index / this.mWidth);
    var col = index % this.mWidth;
    this.setColorAtPosition(row, col, color);
}

CustomTexture.prototype.setColorAtPosition = function(row, col, color)
{
    var data = this.mData.data;
    
    data[row * this.mWidth * 4 + col * 4    ] = color[0]; 
    data[row * this.mWidth * 4 + col * 4 + 1] = color[1]; 
    data[row * this.mWidth * 4 + col * 4 + 2] = color[2]; 
    data[row * this.mWidth * 4 + col * 4 + 3] = 255;
}

CustomTexture.prototype.convertToImage = function()
{
    this.mImage.src = this.mCanvas.toDataURL("image/png");   
}

CustomTexture.prototype.save = function()
{
    this.convertToImage();
    window.href = this.mImage.src;
}

CustomTexture.prototype.compute = function()
{
    this.mCtx.putImageData(this.mData, 0, 0);
}


// Fonctions nécessaires à la gestion des images
function saveFiles(files)
{
    type = undefined;
    for (i = 0; i < files.length; i += 1) {
        file = files[i];
        type = (file.type).split('/')[0];
        if (type !== "image") {
            log("Le fichier '" + file.name + "' n'est pas une image.", 'error');
            continue;
        }
        
        if (IMAGES[file.name] != undefined || IMAGES[file.name] != null) {
            log("Le fichier '" + file.name + "' existe déjà.", 'info');
            continue;
        }
                  
        IMAGES[file.name] = {"file": file, "image": null, "naturalImage": null};
        CURRENT_IMAGE = file.name;
        
        saveImage(file);
    }
}

function saveImage(file) {
    'use strict';
    var reader = new FileReader();
    reader.onload = function (e) {
        var image = new Image();
        image.onload = function () {
            IMAGES[file.name].naturalImage = this.cloneNode(true);
            
            IMAGES[file.name].image = this;
            IMAGES[file.name].image.size = {'w' : this.width, 'h' : this.height};
            IMAGES[file.name].image.id = 'photo_' + file.name;
            IMAGES[file.name].image.className = 'photo';
            $('#gallery_slider').append(IMAGES[file.name].image);
            
            log("L'image '" + file.name + "' a été chargée avec succès.", 'success');
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function getImageData( image ) 
{
    var size = downScale(image, DOWNSCALE_RATIO);
    
    var canvas = document.createElement( 'canvas' );
    canvas.width = size.x;
    canvas.height = size.y;

    var context = canvas.getContext( '2d' );    
    
    context.drawImage( image, 0, 0, size.x, size.y);

    return context.getImageData( 0, 0, size.x, size.y );
}

function getPixel( imagedata, x, y ) {

    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}

function generatePixelsColorArray(image)
{
    var imagedata = getImageData(image.naturalImage);
    image.naturalDownScale = new THREE.Vector2(imagedata.width, imagedata.height);
    
    pixelsColorArray = new Array();
    for(var i = 0; i<imagedata.height ; i++)
    {
        pixelsColorArray[i] = new Array();
        for(var j = 0; j<imagedata.width ; j++)
        {
            pixelsColorArray[i][j] = getPixel(imagedata, j, i);
        }
    }
    
    return pixelsColorArray;
}

function downScale(image, maxSize)
{
    var imgWidth = image.width;
    var imgHeight = image.height;
    
    var finalWidth, finalHeight;
    
    if (imgWidth < maxSize && imgHeight < maxSize)
        return new THREE.Vector2(imgWidth, imgHeight);
    
    
    if (imgWidth > imgHeight)
    {
        finalWidth = maxSize;
        finalHeight = imgHeight / (imgWidth/maxSize);
    }
    else
    {
        finalHeight = maxSize;
        finalWidth = imgWidth / (imgHeight/maxSize);
    }
    
    return new THREE.Vector2(finalWidth, finalHeight);
}

function imageToJSON(source) 
{    
    var dest = {
        "data": []
    };

    for (var i = 0;  i < source.length; i++) 
    {
        dest.data.push([]);
        for (var j = 0; j < source[i].length; j++) 
        {
            dest.data[i].push(
                {
                    "r": source[i][j].r,
                    "g": source[i][j].g,
                    "b": source[i][j].b,
                    "a": source[i][j].a
                }
            );            
        }
    }
    
    return dest;
}

function JSONToImage(source)
{
    var data = source.data;

    var dest = new Array();
    for (var i = 0; i < data.length; i++)
    {
        dest.push(new Array());
        for (var j = 0; j < data[i].length; j++)
        {
            var pixel = data[i][j];
            dest[i].push(
                {
                    "r": pixel.r,
                    "g": pixel.g,
                    "b": pixel.b,
                    "a": pixel.a
                }
            );
        }
    }
    
    return dest;
}
