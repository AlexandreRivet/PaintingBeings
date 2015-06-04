/*global $, console, alert, FileReader */
var TMP_DATA;


$(document).ready(function () {
    'use strict';
    
    START_TIME = new Date().getTime();
   
    initInterface();
    initScene();
    startThread();
});


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
        
        pixelsColorArray = generatePixelsColorArray(IMAGES[CURRENT_IMAGE].naturalImage);
        
        var data = imageToJSON(pixelsColorArray);
        //TMP_DATA = imageToJSON(pixelsColorArray);
        //TMP_DATA = pixelsColorArray;
        
        //GenAlgo(TMP_DATA);
        
        // runAlgo();
        
        THREAD.postMessage(data);
    });
    
}

function initScene()
{
    log('Initialisation scene.', 'info');
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x34495E);
    $("#render_panel").append(renderer.domElement);
    /*
    var nbBlobs = 4096;
    
    var model = new THREE.IcosahedronGeometry(20, 2);
    var geometry = new THREE.BufferGeometry();
    var vertices = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.faces.length * 3 * 3), 3);
    
    var index = 0, localPosition;
    for (var i = 0; i < nbBlobs; i++)
    {
        for (var j = 0; j < model.faces.length; j++)
        {
            localPosition = model.vertices[model.faces[j].a];
            vertices.push(
            index++;    
            
            index++;
            
            index++;
        }
    }
    */
    
    
    
    
    camera.position.z = 1000;

    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);
    
    var render = function () {
        requestAnimationFrame( render );
        
        CURRENT_TIME = (new Date().getTime());
        TIME_APPLICATION = CURRENT_TIME - START_TIME;
        
        renderer.render(scene, camera);
        
        STATS.update();
    };
    
    log('Scene initialised.', 'info');

    render();    
}

function startThread()
{
    if(typeof(Worker) !== "undefined") 
    {
        if(!check(THREAD)) 
        {
            THREAD = new Worker('js/WebWorker/GenAlgoWorker.js');
        }
        THREAD.onmessage = function(event) 
        {   
            var data = event.data;
            var blobs = data.blobs;
            
            var width = IMAGES[CURRENT_IMAGE].image.size.w;
            var height = IMAGES[CURRENT_IMAGE].image.size.h;
            
            if ( (!check(GEN_ALGO_TEXTURE)) || (GEN_ALGO_TEXTURE.mWidth != width) || (GEN_ALGO_TEXTURE.mHeight != height))
            {
                GEN_ALGO_TEXTURE = new CustomTexture(width, height);
            }
            
            for (var i = 0; i < blobs.length; i++)
            {
                GEN_ALGO_TEXTURE.setColorAtIndex(i, blobs[i].color);
            }
            // ct.convertToImage();
            $("#algoImage").html(GEN_ALGO_TEXTURE.mCanvas);
        };
    } 
    else 
    {
        console.warn('Worker are not available in your browser. Download one who supports this epic technology.');   
    }
    
}

function runAlgo()
{
    nextPopulation(TMP_DATA);
    
    setTimeout("runAlgo()", 50);
}

