/*global $, console, alert, FileReader */

$(document).ready(function () {
    'use strict';
    
    START_TIME = new Date().getTime();
   
    initInterface();
    initScene();
    startThread();
    
    setTimeout(function() {$("#loader_wrapper").hide();}, Math.random() * 1000 + 2500);
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
    
    $("#switch_mode").click(function(e) {
        
        if (MODE == 1) {
            MODE = 2;
            
            $("#switch_mode").removeClass("mode1").addClass("mode2");
            $("#version_slider").removeClass('slider_mode1').addClass('slider_mode2');
            
        } else {
            MODE = 1;
            
            $("#switch_mode").removeClass("mode2").addClass("mode1");
            $("#version_slider").removeClass('slider_mode2').addClass('slider_mode1');
            
        }
        
        setMode();
    
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
    
    $('input[name="typeGroup"]:radio').change(function(e) {
       
        var val = parseInt($(this).val());
        
        if (val == 1) {
            
            TYPE_BLOB_V1 = 1;
            ROW = 316;
            COL = 316;
            
            BLOB_V1 = new THREE.Mesh(GEOMETRY_100K, METERIAL_V1);
            
        } else if (val == 2) {
            
            TYPE_BLOB_V1 = 2;
            ROW = 1000;
            COL = 1000;
            
            BLOB_V1 = new THREE.Mesh(GEOMETRY_1000K, METERIAL_V1);
            
        }
        
        BLOB_V1.name = "BLOBS";
        
        var object = SCENE.getObjectByName("BLOBS");
        object.parent.remove(object);   
        SCENE.add(BLOB_V1);
        
        var formationVal = $('input[name="formationGroup"]:radio:checked').val();
        
        if (formationVal === "cube") {
        
            CubeFormation(ROW, COL);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(ROW * 25, COL * 25);
            
        } else if (formationVal === "sphere") {
            
            SphereFormation(ROW, COL, RADIUS);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);
                
            
        } else if (formationVal === "torus") {
            
            TorusFormation(ROW, COL, RADIUS, RADIUS / 4);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);
            
        }
        
         
     });
        
    

    $('input[name="formationGroup"]:radio').change(function(e) {
       
        var val = $(this).val();
        
        if (val === "cube") {
         
            CubeFormation(ROW, COL);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(ROW * 25, COL * 25);
            
        } else if (val === "sphere") {
            
            SphereFormation(ROW, COL, RADIUS);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);                
            
        } else if (val === "torus") {
            
            TorusFormation(ROW, COL, RADIUS, RADIUS / 4);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);
            
        }
        
    });
    
    $('#formation_radius').change(function(e) {
        
        var val = $(this).val();
        RADIUS = parseInt(val);
        $("#radius_value").html(RADIUS);
    
        var formationVal = $('input[name="formationGroup"]:radio:checked').val();
        
        if (formationVal === "sphere") {
            
            SphereFormation(ROW, COL, RADIUS);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);
            
        } else if (formationVal === "torus") {
            
            TorusFormation(ROW, COL, RADIUS, RADIUS / 4);
            BLOB_V1.material.uniforms["uBlobsSize"].value = new THREE.Vector2(RADIUS * 2, RADIUS * 2);
            
        }
        
    });
    
    $('#NumberParam').change(function(e) {
        
        var val = $(this).val();
        PARAMETERS.numBlobs = parseInt(val);
        
        $("#numberblob_value").html(PARAMETERS.numBlobs);
        
    });
    

    $("#SpeedParam").change(function(e) {
        
        var val = $(this).val();
        PARAMETERS.speed = parseFloat(val);
        
        $("#speed_value").html(PARAMETERS.speed);
        
    });

    $("#SubtractParam").change(function(e) {
        
        var val = $(this).val();
        PARAMETERS.subtract = parseInt(val);
        
        $("#subtract_value").html(PARAMETERS.subtract);
        
    });
    
    $("#FloorParam").change(function(e) {
       
        PARAMETERS.floor = $("#FloorParam").is(":checked");
        
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
            
            GEN_ALGO_TEXTURE.compute();        
    
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