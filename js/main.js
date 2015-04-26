/*global $, console, alert, FileReader */

var IMAGES = {};
var CURRENT_IMAGE = "";

$(document).ready(function () {
    'use strict';
    
    var canvas = $("#webgl_canvas")[0];
    canvas.width = $("#drawingArea").outerWidth(true) * window.devicePixelRatio;
    canvas.height = $("#drawingArea").outerHeight(true) * window.devicePixelRatio;
        
    $('body').on('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    });
    
    $('body').on('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var files, file, type, i;
        
        files = event.originalEvent.dataTransfer.files;
        type = undefined;
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            type = (file.type).split('/')[0];
            if (type !== "image") {
                alert("Le fichier " + file.name + " n'est pas une image.");
                continue;
            }
            
            if (IMAGES[file.name] != undefined || IMAGES[file.name] != null) {
                alert("Le fichier va être remplacé.");
            }
                      
            IMAGES[file.name] = {"file": file, "image": null};
            CURRENT_IMAGE = file.name;
            
            saveImage(file);
        }
    });
});

function saveImage(file) {
    'use strict';
    var reader = new FileReader();
    reader.onload = function (e) {
        var image = new Image();
        image.onload = function () {
            IMAGES[file.name].image = this;
            alert('Image "' + file.name + '" chargée avec succès.');
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}