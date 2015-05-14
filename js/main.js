/*global $, console, alert, FileReader */

var IMAGES = {};
var CURRENT_IMAGE = "";

$(document).ready(function () {
    'use strict';
   
    initInterface();
});

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
            
            log("L'image '" + file.name + " a été chargée avec succès.", 'success');
            
            render();
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function initInterface() {
    'use strict';
    
    var canvas = $("#canvas")[0];
    canvas.width = $("#canvas").outerWidth();
    canvas.height = $("#canvas").outerHeight();
    
    $('.icon').click(function(e) {
        var parent = $(this).parent();
        if (parent.hasClass('visible')) {
            parent.removeClass('visible').addClass('hidden');
        } else if (parent.hasClass('hidden')) {
            parent.removeClass('hidden').addClass('visible');
        } else {
            parent.addClass('visible');
        }
    });
    
    $('#placement_icon_img, #right_panel_console_icon').click(function(e) {
        var parent = $(this).parent().parent();
        if (parent.hasClass('visible')) {
            parent.removeClass('visible').addClass('hidden');
        } else if (parent.hasClass('hidden')) {
            parent.removeClass('hidden').addClass('visible');
        } else {
            parent.addClass('visible');
        }
    });
    
    $('body').on('dragover', function (event) {         
        event.preventDefault();
        event.stopPropagation(); 
    });
    
    $('body').on('dragleave', function (event) {
        event.preventDefault();
        event.stopPropagation();
    });
    
    $('body').on('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
    });
    
    $('#upload_area').on('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
        
        $(this).addClass('dragover');    
    });
    
    $('#upload_area').on('dragleave', function (event) {
        event.preventDefault();
        event.stopPropagation();
        
        $(this).removeClass('dragover');  
    });
    
    $('#upload_area').on('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var files, file, type, i;
        
        $(this).removeClass('dragover');    
        
        files = event.originalEvent.dataTransfer.files;
        type = undefined;
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            type = (file.type).split('/')[0];
            if (type !== "image") {
                log("Le fichier '" + file.name + " n'est pas une image.", 'error');
                continue;
            }
            
            if (IMAGES[file.name] != undefined || IMAGES[file.name] != null) {
                log("Le fichier '" + file.name + " a été remplacé.", 'info');
            }
                      
            IMAGES[file.name] = {"file": file, "image": null};
            CURRENT_IMAGE = file.name;
            
            saveImage(file);
        }
    });    
    
    $(document).on('click', '.photo', function(e) {
        var id = $(this).attr('id');
        CURRENT_IMAGE = id.substr(6);
        console.log(CURRENT_IMAGE);
        render();
    });
    
}


function render()
{
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var finalPosition = {'w': 0, 'h': 0};
    finalPosition.x = ((canvas.width - 40) / 2) - (IMAGES[CURRENT_IMAGE].image.size.w / 2) + 40;
    finalPosition.y = ((canvas.height - 40) / 2) - (IMAGES[CURRENT_IMAGE].image.size.h / 2) + 40;
    
    ctx.drawImage(IMAGES[CURRENT_IMAGE].image, finalPosition.x, finalPosition.y);
}

function log(msg, className)
{
    var element = '<div>';
    element += '<div class="' + className + ' console_date">' + formatDate() + '</div>';
    element += '<div class="' + className + ' console_log">' + msg + '</div>';
    element += '</div>';
    
    $('#console_area').append(element);
    
}

function formatDate()
{
    var date = new Date();
    
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    
    return ((day < 10) ? '0' + day : day) + '-' + ((month < 10) ? '0' + month : month) + '-' + year + ' ' +
            ((hours < 10) ? '0' + hours : hours) + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' +
            ((seconds < 10) ? '0' + seconds : seconds) + '.' + 
            ((milliseconds < 100) ? ((milliseconds < 10) ? '00' + milliseconds : '0' + milliseconds) : milliseconds); 
    
}