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
        
        pixelsColorArray = generatePixelsColorArray(IMAGES[CURRENT_IMAGE]);
        
        var data = imageToJSON(pixelsColorArray);
        
        THREAD.postMessage(data);
    });
    
}

function initScene()
{
    log('Initialisation scene.', 'info');
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 2000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x34495E);
    $("#render_panel").append(renderer.domElement);
    
    var row = 32;
    var col = 32;
    var nbBlobs = row * col;
    
    var model = new THREE.IcosahedronGeometry(10, 2);
    var geometry = new THREE.BufferGeometry();
    var vertices = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.faces.length * 3 * 3), 3);
    
    var index = 0, localPosition;
    var dx = -(row / 2 * 25), dy = -(row / 2 * 25);
    for (var i = 0; i < nbBlobs; i++)
    {
        if ((i != 0) && (i % col == 0))
        {
            dx = -(row / 2 * 25);; 
            dy += 25;
        }
        else if (i!=0)
        {
            dx += 25;   
        }
        
        for (var j = 0; j < model.faces.length; j++)
        {
            localPosition = model.vertices[model.faces[j].a];
            vertices.setXYZ(index, localPosition.x + dx, localPosition.y + dy, localPosition.z);
            index++;    
            
            localPosition = model.vertices[model.faces[j].b];
            vertices.setXYZ(index, localPosition.x + dx, localPosition.y + dy, localPosition.z);
            index++;
            
            localPosition = model.vertices[model.faces[j].c];
            vertices.setXYZ(index, localPosition.x + dx, localPosition.y + dy, localPosition.z);
            index++;
        }
    }
    geometry.addAttribute('position', vertices);
    
    index = 0;
    var indices = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.faces.length * 3 * 4), 4);
    for (var i = 0; i < nbBlobs; i++)
    {
        for (var j = 0; j < model.faces.length; j++)
        {
            indices.setXYZW(index, i, 0, 0, 0);
            index++;
            indices.setXYZW(index, i, 0, 0, 0);
            index++;
            indices.setXYZW(index, i, 0, 0, 0);
            index++;
        }
    }
    geometry.addAttribute('color', indices);
    
    BlobShader.uniforms["uBlobsSize"].value = new THREE.Vector2(row, col);
    MATERIAL = new THREE.RawShaderMaterial(
        {
            uniforms: BlobShader.uniforms,
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent,
            transparent: true
        }
    );
    
    OBJECT = new THREE.Mesh(geometry, MATERIAL);
    COLOR_TEXTURE = new THREE.Texture();
    COLOR_TEXTURE.minFilter = THREE.NearestFilter;
    OBJECT.material.uniforms["uSampler"].value = COLOR_TEXTURE;
    
    scene.add(OBJECT);
    
    camera.position.z = 1000;

    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);
    
    var render = function () {
        requestAnimationFrame( render );
        
        CURRENT_TIME = (new Date().getTime());
        TIME_APPLICATION = CURRENT_TIME - START_TIME;
        
        // OBJECT.rotation.y += 0.005;
        OBJECT.material.uniforms["uTime"].value = TIME_APPLICATION * 0.0005;
        
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
            
            var width = IMAGES[CURRENT_IMAGE].naturalDownScale.x;
            var height = IMAGES[CURRENT_IMAGE].naturalDownScale.y;
            
            if ( (!check(GEN_ALGO_TEXTURE)) || (GEN_ALGO_TEXTURE.mWidth != width) || (GEN_ALGO_TEXTURE.mHeight != height))
            {
                GEN_ALGO_TEXTURE = new CustomTexture(width, height);
            }
            
            for (var i = 0; i < blobs.length; i++)
            {
                GEN_ALGO_TEXTURE.setColorAtIndex(i, blobs[i].color);
            }
            
            OBJECT.material.uniforms["uSamplerSize"].value = new THREE.Vector2(width, height);
            
            COLOR_TEXTURE.image = GEN_ALGO_TEXTURE.mCanvas;
            COLOR_TEXTURE.sourceFile = GEN_ALGO_TEXTURE.mCanvas;
            COLOR_TEXTURE.needsUpdate = true;
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

