/*global $, console, alert, FileReader */

var IMAGES = {};
var CURRENT_IMAGE = "";
var STATS = null;

var TEXTURE = null;
var MATERIAL = null;

var SNAP_COUNT = 0;

var BEGIN_APPLICATION = 0;
var TIME_APPLICATION = 0;

$(document).ready(function () {
    'use strict';
    
    BEGIN_APPLICATION = new Date().getTime();
   
    initInterface();
    initScene();
});

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

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function getPixel( imagedata, x, y ) {

    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}

/*
function processImageToFloatArray(){
    var imagedata = getImageData( imgTexture.image );
    var color = getPixel( imagedata, 10, 10 );
    return color;
}
*/

function initInterface() {
    'use strict';
    
    Webcam.set({
        width: $('#webcam').innerWidth(),
        height: $('#webcam').innerHeight(),
    });
    
    $("#webcam").click(function() {
        Webcam.snap(function(data) {
            var img = new Image();
            img.src = data;
            img.id = 'photo_' + 'snap_' + SNAP_COUNT;
            img.className = 'photo';
            
            IMAGES['snap_' + SNAP_COUNT] =  {"file": null, "image": img};
            
            $('#gallery_slider').append(IMAGES['snap_' + SNAP_COUNT].image);
            
            SNAP_COUNT++;            
        });
    });
    
    $('.icon').click(function(e) {
        var parent = $(this).parent();
        var id = parent.attr('id');
        if (parent.hasClass('visible')) {
            parent.removeClass('visible').addClass('hidden');
             
            if (id == "left_panel_upload")
                Webcam.reset();
        } else if (parent.hasClass('hidden')) {
            parent.removeClass('hidden').addClass('visible');
            
            if (id == "left_panel_upload")
                Webcam.attach("#webcam");
        } else {
            parent.addClass('visible');
            
            if (id == "left_panel_upload")
                Webcam.attach("#webcam");
        }
    });
    
    $('#placement_icon_img, #right_panel_console_icon, #right_panel_stats_icon').click(function(e) {
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
        saveFiles(files);
        
    });
    
    $("#my-file").change(function (event) {
        var files = event.target.files;
        saveFiles(files);
        $(this).val('');
    });   
    
    $(document).on('click', '.photo', function(e) {
        var id = $(this).attr('id');
        CURRENT_IMAGE = id.substr(6);
        
        if (TEXTURE.image != IMAGES[CURRENT_IMAGE].image)
        {
            TEXTURE.image = IMAGES[CURRENT_IMAGE].image;
            TEXTURE.sourceFile = CURRENT_IMAGE;
            TEXTURE.needsUpdate = true;
        }
        
        var imagedata = getImageData( TEXTURE.image );
        var color = getPixel( imagedata, 10, 10 );
        log("R: "+ color.r + " G: "+ color.g + " B: " + color.b + " A: "+color.a, 'info');
    });
    
}

function initScene()
{
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x34495E);
    $("#render_panel").append(renderer.domElement);

    var geometry = new THREE.PlaneGeometry( 3, 3);
    TEXTURE = new THREE.Texture();
    // MATERIAL = new THREE.MeshBasicMaterial( { map: TEXTURE } );
    MATERIAL = new THREE.ShaderMaterial({uniforms: BlobShader.uniforms, vertexShader: BlobShader.vertexShader, fragmentShader: BlobShader.fragmentShader});
    MATERIAL.uniforms["uSampler"].value = TEXTURE;
    var cube = new THREE.Mesh( geometry, MATERIAL );
    scene.add( cube );

    camera.position.z = 5;

    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);
    
    var render = function () {
        requestAnimationFrame( render );
        
        TIME_APPLICATION = (new Date().getTime()) - BEGIN_APPLICATION;
        MATERIAL.uniforms["uTime"].value += 1.0;

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
        STATS.update();
    };  

    
    render();    
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