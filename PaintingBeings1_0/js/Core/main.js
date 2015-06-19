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
            
            IMAGES['snap_' + SNAP_COUNT] =  {"file": null, "image": img , "naturalImage": null};
            
            IMAGES['snap_' + SNAP_COUNT].naturalImage = img.cloneNode(true);
            
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
    
    $("body").keyup(function(e) {
        switch(e.which) 
        {
            case 73:
                flipInterface();
                break;
            case 82:
                ROTATE_ALLOWED = !ROTATE_ALLOWED;
                break;
            case 107:
                CAMERA.position.z -= 100;
                break;
                
            case 109:
                CAMERA.position.z += 100;
                break;
        }
    });
}

function flipInterface()
{
    INTERFACE_STATE = !INTERFACE_STATE;
    
    if (INTERFACE_STATE == true)
    {
        $("#header").show();
        $("#left_panel").show();
        $("#whatisthis").show();
        $("#right_panel").show();
        $("#right_panel_bis").show();
    }
    else
    {
        $("#header").hide();
        $("#left_panel").hide();
        $("#whatisthis").hide();
        $("#right_panel").hide();
        $("#right_panel_bis").hide();      
    }
}

function initScene()
{
    log('Initialisation scene.', 'info');
    
    var scene = new THREE.Scene();
    CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 15000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x34495E);
    $("#render_panel").append(renderer.domElement);
    
    var row = 360;
    var col = 360;
    var radius = 2000;
    
    var nbBlobs = row * col;
    
    MODEL = new THREE.IcosahedronGeometry(30, 2);
    var geometry = new THREE.BufferGeometry();
    
    var vertices = new THREE.BufferAttribute(new Float32Array(nbBlobs * MODEL.vertices.length * 3), 3);
    var step = 0, localPosition;
    
    for (var i = 0; i < nbBlobs; i++)
    {
        for(var j = 0; j < MODEL.vertices.length; j++)
        {
            localPosition = MODEL.vertices[j];
            vertices.setXYZ(step, localPosition.x, localPosition.y, localPosition.z);
            step++;
        }
    }
    geometry.addAttribute('position', vertices);
    log(vertices.length, "info");
    
    var faces = new THREE.BufferAttribute(new Uint32Array(nbBlobs * MODEL.faces.length * 3), 1);
    var step = 0, localFace;
    for (var i = 0; i < nbBlobs; i++)
    {
        var offset = i * MODEL.vertices.length;
        
        for(var j = 0; j < MODEL.faces.length; j++)
        {
            localFace = MODEL.faces[j];
            
            // index a
            faces.setX(step, localFace.a + offset);
            step++;
            
            // index b
            faces.setX(step, localFace.b + offset);
            step++;
            
            // index c
            faces.setX(step, localFace.c + offset);
            step++;
        }   
    }
    geometry.addAttribute('index', faces);
    
    var indexBlob = new THREE.BufferAttribute(new Float32Array(nbBlobs * MODEL.vertices.length), 1);
    var step = 0;
    for (var i = 0; i < nbBlobs; i++)
    {
        for(var j = 0; j < MODEL.vertices.length; j++)
        {
            indexBlob.setX(step, i);
            step++;
        }   
    }    
    geometry.addAttribute('aIndex', indexBlob);               

    var positions = new THREE.BufferAttribute(new Float32Array(nbBlobs * MODEL.vertices.length * 3), 3);
    var back = - row / 2 * 25, step = 0;
    for (var i = 0; i < nbBlobs; i++)
    {
        var dx = back + Math.random() * row * 25; 
        var dy = back + Math.random() * row * 25;
        var dz = back + Math.random() * row * 25;
        
        for (var j = 0; j < MODEL.vertices.length; j++)
        {
            positions.setXYZ(step, dx, dy, dz);
            step++;
        }
    }
    geometry.addAttribute('aPosition', positions);
    
    //BlobShader.uniforms["uBlobsSize"].value = new THREE.Vector2(radius * 2, radius * 2);
    BlobShader.uniforms["uBlobsSize"].value = new THREE.Vector2(row * 25, col * 25);
    MATERIAL = new THREE.RawShaderMaterial(
        {
            uniforms: BlobShader.uniforms,
            attributes: BlobShader.attributes,
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent,
            transparent: true
        }
    );
    
    OBJECT = new THREE.Mesh(geometry, MATERIAL);
    COLOR_TEXTURE = new THREE.Texture();
    COLOR_TEXTURE.minFilter = THREE.NearestFilter;
    OBJECT.material.uniforms["uSampler"].value = COLOR_TEXTURE;
    
    // SphereFormation(col, row, radius);
    // TorusFormation(row, col, radius, 1000);
    
    scene.add(OBJECT);
    
    CAMERA.position.z = 4000;

    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);
    
    var render = function () {
        requestAnimationFrame( render );
        
        CURRENT_TIME = (new Date().getTime());
        TIME_APPLICATION = CURRENT_TIME - START_TIME;
        
        if (ROTATE_ALLOWED)
            OBJECT.rotation.y += 0.005;
        OBJECT.material.uniforms["uTime"].value = TIME_APPLICATION * 0.0005;

        renderer.render(scene, CAMERA);
        
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
            
            COLOR_TEXTURE.image = GEN_ALGO_TEXTURE.mCanvas;
            COLOR_TEXTURE.sourceFile = GEN_ALGO_TEXTURE.mCanvas;
            COLOR_TEXTURE.needsUpdate = true;
            
            $("#debug_algo").html(GEN_ALGO_TEXTURE.mCanvas);
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

