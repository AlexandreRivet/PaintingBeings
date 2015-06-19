/*global $, console, alert, FileReader */
var TMP_DATA;


$(document).ready(function () {
    'use strict';
    
    START_TIME = new Date().getTime();
   
    initInterface();
    //initScene();
    initModule2();
    animate();
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


    $("#SpeedParam").keyup(function(e) {
       
        if(e.keyCode == 13)
        {
           effectController.speed = $("#SpeedParam").val();
        }
    });

    $("#NumberParam").keyup(function(e) {
       
        if(e.keyCode == 13)
        {
           effectController.numBlobs = $("#NumberParam").val();
        }
    });
    $("#SubtractParam").keyup(function(e) {
       
        if(e.keyCode == 13)
        {
           effectController.subtract = $("#SubtractParam").val();
        }
    });
    $("#FloorParam").change(function(e) {
       
        debugger;
        effectController.floor = $("#FloorParam").is(":checked");
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
    
    var row = 316;
    var col = 316;
    var radius = 2000;
    
    var nbBlobs = row * col;
    
    MODEL = new THREE.IcosahedronGeometry(20, 2);
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
            
            if(!check(COLOR_TEXTURE))
            {
                COLOR_TEXTURE = new THREE.Texture();
                COLOR_TEXTURE.minFilter = THREE.NearestFilter;   
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



/*******************************************************************\
*                           Module 2 Functions
\*******************************************************************/
function initModule2() {

    container = document.getElementById( 'render_panel' );

    // CAMERA

    camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.set( -500, 500, 1500 );

    // SCENE

    scene = new THREE.Scene();

    // LIGHTS

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0.5, 0.5, 1 );
    scene.add( light );

    pointLight = new THREE.PointLight( 0x000000 );
    pointLight.position.set( 0, 0, 100 );
    //scene.add( pointLight );

    ambientLight = new THREE.AmbientLight( 0xffffff );
    scene.add( ambientLight );

    // MATERIALS

    materials = generateMaterials();
    current_material = "textured";

    // MARCHING CUBES

    resolution = 40;
    numBlobs = 50;

    effect = new THREE.MarchingCubes( resolution, materials[ current_material ].m, true, true );
    
    effect.position.set( 0, 0, 0 );
    effect.scale.set( 700, 700, 700 );

    effect.enableUvs = true;
    effect.enableColors = false;

    scene.add( effect );

    // RENDERER

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x050505 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = MARGIN + "px";
    renderer.domElement.style.left = "0px";

    container.appendChild( renderer.domElement );

    //

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    // CONTROLS

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    // STATS

    //stats = new Stats();
    //container.appendChild( stats.domElement );

    // COMPOSER

    renderer.autoClear = false;

    var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

    hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
    vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

    var bluriness = 8;

    hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
    vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

    hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );

    composer = new THREE.EffectComposer( renderer, renderTarget );

    var renderModel = new THREE.RenderPass( scene, camera );

    vblur.renderToScreen = true;
    //effectFXAA.renderToScreen = true;

    composer = new THREE.EffectComposer( renderer, renderTarget );

    composer.addPass( renderModel );

    composer.addPass( effectFXAA );

    composer.addPass( hblur );
    composer.addPass( vblur );

    // GUI

    setupGui();

    // EVENTS

    window.addEventListener( 'resize', onWindowResize, false );
    
    //STATS
    
    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);

}

//

function onWindowResize( event ) {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    hblur.uniforms[ 'h' ].value = 4 / SCREEN_WIDTH;
    vblur.uniforms[ 'v' ].value = 4 / SCREEN_HEIGHT;

    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );

}

function generateMaterials() {

    

    // toons

    var toonMaterial1 = createShaderMaterial( "toon1", light, ambientLight ),
    toonMaterial2 = createShaderMaterial( "toon2", light, ambientLight ),
    hatchingMaterial = createShaderMaterial( "hatching", light, ambientLight ),
    hatchingMaterial2 = createShaderMaterial( "hatching", light, ambientLight ),
    dottedMaterial = createShaderMaterial( "dotted", light, ambientLight ),
    dottedMaterial2 = createShaderMaterial( "dotted", light, ambientLight );

    hatchingMaterial2.uniforms.uBaseColor.value.setRGB( 0, 0, 0 );
    hatchingMaterial2.uniforms.uLineColor1.value.setHSL( 0, 0.8, 0.5 );
    hatchingMaterial2.uniforms.uLineColor2.value.setHSL( 0, 0.8, 0.5 );
    hatchingMaterial2.uniforms.uLineColor3.value.setHSL( 0, 0.8, 0.5 );
    hatchingMaterial2.uniforms.uLineColor4.value.setHSL( 0.1, 0.8, 0.5 );

    dottedMaterial2.uniforms.uBaseColor.value.setRGB( 0, 0, 0 );
    dottedMaterial2.uniforms.uLineColor1.value.setHSL( 0.05, 1.0, 0.5 );

    var texture = THREE.ImageUtils.loadTexture( "textures/ESGI_master_logo.jpg" );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    var materials = {

    "chrome" :
    {
        m: new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } ),
        h: 0, s: 0, l: 1
    },

    "liquid" :
    {
        m: new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 } ),
        h: 0, s: 0, l: 1
    },

    "shiny"  :
    {
        m: new THREE.MeshPhongMaterial( { color: 0x550000, specular: 0x440000, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3, metal: true } ),
        h: 0, s: 0.8, l: 0.2
    },

    "matte" :
    {
        m: new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x111111, shininess: 1 } ),
        h: 0, s: 0, l: 1
    },

    "flat" :
    {
        m: new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x111111, shininess: 1, shading: THREE.FlatShading } ),
        h: 0, s: 0, l: 1
    },

    "textured" :
    {
        m: new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 250, metal: true, map: texture } ),
        h: 0, s: 0, l: 1
    },

    "colors" :
    {
        m: new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: THREE.VertexColors } ),
        h: 0, s: 0, l: 1
    },

    "plastic" :
    {
        m: new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x888888, shininess: 250 } ),
        h: 0.6, s: 0.8, l: 0.1
    },

    "toon1"  :
    {
        m: toonMaterial1,
        h: 0.2, s: 1, l: 0.75
    },

    "toon2" :
    {
        m: toonMaterial2,
        h: 0.4, s: 1, l: 0.75
    },

    "hatching" :
    {
        m: hatchingMaterial,
        h: 0.2, s: 1, l: 0.9
    },

    "hatching2" :
    {
        m: hatchingMaterial2,
        h: 0.0, s: 0.8, l: 0.5
    },

    "dotted" :
    {
        m: dottedMaterial,
        h: 0.2, s: 1, l: 0.9
    },

    "dotted2" :
    {
        m: dottedMaterial2,
        h: 0.1, s: 1, l: 0.5
    }

    };

    return materials;

}

function createShaderMaterial( id, light, ambientLight ) {

    var shader = THREE.ShaderToon[ id ];

    var u = THREE.UniformsUtils.clone( shader.uniforms );

    var vs = shader.vertexShader;
    var fs = shader.fragmentShader;

    var material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );

    material.uniforms.uDirLightPos.value = light.position;
    material.uniforms.uDirLightColor.value = light.color;

    material.uniforms.uAmbientLightColor.value = ambientLight.color;

    return material;

}
function setupGui() {
    effectController = {

    material: "textured",

    speed: 1.0,
    numBlobs: 50,
    resolution: 40,
    isolation: 80,
    subtract: 64,    
    floor: true,
    wallx: false,
    wallz: false,

    hue: 0.0,
    saturation: 0.0,
    lightness: 1.0,

    lhue: 0.04,
    lsaturation: 1.0,
    llightness: 0.5,

    lx: 0.5,
    ly: 0.5,
    lz: 1.0,

    postprocessing: false,

    dummy: function() {
    }

    };
    if ( current_material === "textured" ) {

        effect.enableUvs = true;

    } else {

        effect.enableUvs = false;

    }

    if ( current_material === "colors" ) {

        effect.enableColors = true;

    } else {

        effect.enableColors = false;

    }

}
function updateCubes( object, time, numblobs, floor, wallx, wallz ) {

			object.reset();

			// fill the field with some metaballs

			var i, ballx, bally, ballz, subtract, strength;

			subtract = effectController.subtract;
			strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );
    
			for ( i = 0; i < numblobs; i ++ ) {

				ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.37 + 0.5;
				bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.5 + 0.1; // dip into the floor
				//ballz = Math.sin( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.37 + 0.5;
                ballz = i / numblobs;
				object.addBall(ballx, bally, ballz, strength, subtract);

			}

			if ( floor ) object.addPlaneY( 2, 12 );
			if ( wallz ) object.addPlaneZ( 2, 12 );
			if ( wallx ) object.addPlaneX( 2, 12 );

		}

		//


function animate() {

    requestAnimationFrame( animate );

    render();
    STATS.update();

}

function render() {

    if(check(COLOR_TEXTURE))
    {
        effect.material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3, metal: true, map: COLOR_TEXTURE } )
        //COLOR_TEXTURE.wrapS = COLOR_TEXTURE.wrapT = THREE.RepeatWrapping;   
    }
        
    var delta = clock.getDelta();

    time += delta * effectController.speed * 0.5;

    controls.update( delta );

    // marching cubes

    if ( effectController.resolution !== resolution ) {

        resolution = effectController.resolution;
        effect.init( resolution );

    }

    if ( effectController.isolation !== effect.isolation ) {

        effect.isolation = effectController.isolation;

    }
    
    updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );

    // materials

    if ( effect.material instanceof THREE.ShaderMaterial ) {

        if ( current_material === "dotted2" ) {

            effect.material.uniforms.uLineColor1.value.setHSL( effectController.hue, effectController.saturation, effectController.lightness );

        } else if ( current_material === "hatching2" ) {

            u = effect.material.uniforms;

            u.uLineColor1.value.setHSL( effectController.hue, effectController.saturation, effectController.lightness );
            u.uLineColor2.value.setHSL( effectController.hue, effectController.saturation, effectController.lightness );
            u.uLineColor3.value.setHSL( effectController.hue, effectController.saturation, effectController.lightness );
            u.uLineColor4.value.setHSL( ( effectController.hue + 0.2 % 1.0 ), effectController.saturation, effectController.lightness );

        } else {

            effect.material.uniforms.uBaseColor.value.setHSL( effectController.hue, effectController.saturation, effectController.lightness );

        }

    } else {

        effect.material.color.setHSL( effectController.hue, effectController.saturation, effectController.lightness );

    }

    // lights

    light.position.set( effectController.lx, effectController.ly, effectController.lz );
    light.position.normalize();

    pointLight.color.setHSL( effectController.lhue, effectController.lsaturation, effectController.llightness );

    // render

    if ( effectController.postprocessing ) {

        composer.render( delta );

    } else {

        renderer.clear();
        renderer.render( scene, camera );

    }

}

