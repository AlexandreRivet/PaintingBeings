var CustomTexture = function(width, height)
{
    this.mWidth = width;
    this.mHeight = height;
    this.mCanvas = document.createElement('canvas');
    this.mCanvas.width = width;
    this.mCanvas.height = height;
    this.mCtx = this.mCanvas.getContext('2d');
    this.mImage = new Image();
    
    this.init();
}

CustomTexture.prototype.init = function()
{
    var imgData = this.mCtx.getImageData(0, 0, this.mWidth, this.mHeight);
    var data = imgData.data;
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
    this.mCtx.putImageData(imgData, 0, 0);
    
    this.mImage.src = this.convertToImage();
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
    var row = Math.floor(index / this.mHeight);
    var col = index % this.mWidth;
    this.setColorAtPosition(row, col, color);
}

CustomTexture.prototype.setColorAtPosition = function(row, col, color)
{
    var pixel = this.mCtx.createImageData(1, 1);
    var data = pixel.data;
    data[0] = color[0];
    data[1] = color[1];
    data[2] = color[2];
    data[3] = 255;
    this.mCtx.putImageData(pixel, col, row);
}

CustomTexture.prototype.convertToImage = function()
{
    this.mImage.src = this.mCanvas.toDataURL("image/png");   
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
                  
        IMAGES[file.name] = {"file": file, "image": null};
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

