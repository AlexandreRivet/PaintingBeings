/*global $, console, alert, FileReader */

$(document).ready(function () {
    'use strict';
    
    START_TIME = new Date().getTime();
   
    initInterface();
    initScene();
    startThread();
    
    setTimeout(function() {$("#loader_wrapper").hide();}, Math.random() * 1000 + 500);
});


function initInterface() {
    'use strict';
    
    Webcam.set({
        width: $('#webcam').innerWidth(),
        height: $('#webcam').innerHeight(),
    });
    
    Webcam.attach("#webcam");
    
    var checkWebcam = function() {
    
        if (Webcam.error) {
        
            $("#webcam").css('cursor', 'auto');
            $("#no_webcam").show();
            
            return;
            
        }            
        
        if (Webcam.loaded && Webcam.live) {
            
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
            
            return;
                
        }
        
        setTimeout(checkWebcam, 100);
        
    }
    
    setTimeout(checkWebcam, 100);

    $('.icon').click(function(e) {
        var parent = $(this).parent();
        var id = parent.attr('id');
        if (parent.hasClass('visible')) {
            
            parent.removeClass('visible').addClass('hidden');
             
        } else if (parent.hasClass('hidden')) {
            
            parent.removeClass('hidden').addClass('visible');
                
        } else {
            
            parent.addClass('visible');
            
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
        
        if (check(INTERVAL_ID))
            clearInterval(INTERVAL_ID);
        
        DURATION_ALGO = 0;
        INTERVAL_ID = setInterval(function() {
            
            DURATION_ALGO++;
            $('#durationAlgo').html(formatSeconds(DURATION_ALGO));
            
        }, 1000);
        
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
        }
    });
    
    $('input[name="downGroup_1"]:radio').change(function(e) {
       
        var val = parseInt($(this).val());
        DOWNSCALE_RATIO = val;
        
        var id = $(this).attr('id');
        id = parseInt(id.substr(1, 1)); 
        
        $("#d" + id + "_2").prop("checked", true);

    });
    
    $('input[name="downGroup_2"]:radio').change(function(e) {
       
        var val = parseInt($(this).val());
        DOWNSCALE_RATIO = val;
        
        var id = $(this).attr('id');
        id = parseInt(id.substr(1, 1)); 
        
        $("#d" + id + "_1").prop("checked", true);
        
    });
    
    
    $('input[name="typeGroup"]:radio').change(function(e) {
       
        var val = parseInt($(this).val());    
        
        if (val == 1) {
            
            TYPE_BLOB_V1 = 1;
            ROW = 71;
            COL = 71;
            
            BLOB_V1 = new THREE.Mesh(GEOMETRY_5K, METERIAL_V1);
            
        } else {
            
            if (!ALREADY_ASKED[val - 2]) {
                
                if (!confirm('An High-end PC is required for this option. Are you sure?')) {
                 
                    HIGH_MODE[val - 2] = false;
                    
                    $("#t" + TYPE_BLOB_V1).prop("checked", true);
                    
                } else {
                    
                    HIGH_MODE[val - 2] = true;
                    ALREADY_ASKED[val - 2] = true;
                    
                }
                
            }
            
            if (val == 2) {
                                
                if (!HIGH_MODE[val - 2]) {
                 
                    return;
                    
                }
                
                TYPE_BLOB_V1 = 2;
                ROW = 317;
                COL = 317;
                
                if( !check(GEOMETRY_100K) ) {
                        
                    GEOMETRY_100K = initWith(MODEL_100K, ROW * COL);
                    
                }
            
                BLOB_V1 = new THREE.Mesh(GEOMETRY_100K, METERIAL_V1);
                
            } else if (val == 3) {
                
                if (!HIGH_MODE[val - 2]) {
                 
                    return;
                    
                }
                
                TYPE_BLOB_V1 = 3;
                ROW = 1000;
                COL = 1000;
                
                if( !check(GEOMETRY_1000K) ) {
                        
                    GEOMETRY_1000K = initWith(MODEL_1000K, ROW * COL);
                    
                }
            
                BLOB_V1 = new THREE.Mesh(GEOMETRY_1000K, METERIAL_V1);
                
            }
            
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
    
    $("#a_download").click(function(e) {
    
        var data = GEN_ALGO_TEXTURE.mCanvas.toDataURL();
        
        $(this).attr("download", 'result_' + formatDate() + '.png');
        $(this).attr("href", data);
        
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
        $("#switch_mode").show();
        
        if (check(GEN_ALGO_TEXTURE)) {
            $("#successPercent").show();
            $("#btn_download").show();
        }
    }
    else
    {
        $("#header").hide();
        $("#left_panel").hide();
        $("#whatisthis").hide();
        $("#right_panel").hide();
        $("#right_panel_bis").hide();
        $("#switch_mode").hide();
        
        if (check(GEN_ALGO_TEXTURE)) {
            $("#successPercent").hide();
            $("#btn_download").hide();
        }
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
            
            var maxValue = width * height * 3 * 255;
            var percentSuccess = ((maxValue - data.fitness) / maxValue) * 100;
            
            $("#fitnessAlgo").html(percentSuccess.toFixed(1) + '%');
            
            if ( (!check(GEN_ALGO_TEXTURE)) || (GEN_ALGO_TEXTURE.mWidth != width) || (GEN_ALGO_TEXTURE.mHeight != height))
            {
                GEN_ALGO_TEXTURE = new CustomTexture(width, height);
                $("#btn_download").show();
                $("#successPercent").show();
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