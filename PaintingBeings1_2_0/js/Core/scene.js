function initScene() {
 
    // Création de la scène
    SCENE = new THREE.Scene();
    
    // Création de la caméra
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150000);
    CAMERA.position.set(-500, 500, 1500);
    
    // Création du renderer
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    RENDERER.setClearColor(0x34495E);
    $("#render_panel").append(RENDERER.domElement);    
    
    // Création des lights
    DIRECTIONAL_LIGHT = new THREE.DirectionalLight( 0xffffff );
    DIRECTIONAL_LIGHT.position.set( 0.5, 0.5, 1 );
    SCENE.add( DIRECTIONAL_LIGHT );

    AMBIENT_LIGHT = new THREE.AmbientLight( 0xffffff );
    SCENE.add( AMBIENT_LIGHT );
    
    // Ajout du control
    CONTROLS = new THREE.OrbitControls(CAMERA, RENDERER.domElement);
    
    // Ajout du module de stats
    STATS = new Stats();
    STATS.domElement.style.position = 'absolute';
    STATS.domElement.style.top = '0px';
    $("#stats_area").append(STATS.domElement);
    
    // Initialisation de la clock
    TIME = 0;
    CLOCK = new THREE.Clock();

    // Chargement d'une texture par défaut
    COLOR_TEXTURE = THREE.ImageUtils.loadTexture( "textures/ESGI_master_logo.jpg" );
    COLOR_TEXTURE.wrapS = COLOR_TEXTURE.wrapT = THREE.RepeatWrapping;    
    COLOR_TEXTURE.minFilter = THREE.NearestFilter;
    
    // Initialisation des paramètres
    setupParameters();
    
    var initModule1 = function() {
        
        var radius = 10000;
        
        MODEL_100K = new THREE.IcosahedronGeometry(20, 2);
        MODEL_1000K = new THREE.BoxGeometry(20, 20, 20);
        
        GEOMETRY_100K = initWith(MODEL_100K, 316 * 316);
        GEOMETRY_1000K = initWith(MODEL_1000K, 1000 * 1000);        
    
        BlobShader.uniforms["uBlobsSize"].value = new THREE.Vector2(ROW * 25, COL * 25);
        METERIAL_V1 = new THREE.RawShaderMaterial(
            {
                uniforms: BlobShader.uniforms,
                attributes: BlobShader.attributes,
                vertexShader: document.getElementById("vertexShader").textContent,
                fragmentShader: document.getElementById("fragmentShader").textContent,
                transparent: true
            }
        );
        
        BLOB_V1 = new THREE.Mesh(GEOMETRY_100K, METERIAL_V1);
        BLOB_V1.name = "BLOBS";
        BLOB_V1.visible = true;
        BLOB_V1.material.uniforms["uSampler"].value = COLOR_TEXTURE;
        
        SCENE.add(BLOB_V1);
        
    }
    
    var initModule2 = function() {
            
        MATERIAL_V2 = new THREE.MeshPhongMaterial(
            {
                color:              0xffffff,
                specular:           0xffffff,
                shininess:          500,
                metal:              true,
                map:                COLOR_TEXTURE,
                side:               2
            }
        );
        
        
        resolution = 40;
        numBlobs = 100;
        
        BLOB_V2 = new THREE.MarchingCubes(resolution, MATERIAL_V2, true, true);
        BLOB_V2.position.set(0, 0, 0);
        BLOB_V2.scale.set(700, 700, 700);
        BLOB_V2.enableUvs = true;
        BLOB_V2.enableColors = false;
        BLOB_V2.visible = false;
        
        SCENE.add(BLOB_V2);
        
    }
    
    var render = function() {
        
        requestAnimationFrame( render );
        
        // Acquisition du delta
        var delta = CLOCK.getDelta();
        TIME += delta * PARAMETERS.speed * 0.5;
        
        CURRENT_TIME = (new Date().getTime());
        TIME_APPLICATION = CURRENT_TIME - START_TIME;
        
        CONTROLS.update(delta);
        
        // Mise à jour des blobs
        if (MODE == 1) {
            
            BLOB_V1.material.uniforms["uTime"].value = TIME_APPLICATION * 0.0005;
            
        } else {
            
            updateCubes(BLOB_V2, TIME, PARAMETERS.numBlobs, PARAMETERS.subtract, PARAMETERS.floor, PARAMETERS.wallX, PARAMETERS.wallz);
            
            BLOB_V2.material.color.setHSL(PARAMETERS.hue, PARAMETERS.saturation, PARAMETERS.lightness);
            
        }
        
        RENDERER.clear();
        RENDERER.render( SCENE, CAMERA );
        
        STATS.update();
        
    }
    
    initModule1();
    initModule2();
    render();
    
}

function initWith(model, nbBlobs) {
        
    // model = new THREE.IcosahedronGeometry(20, 2);
    var geometry = new THREE.BufferGeometry();
    
    var vertices = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.vertices.length * 3), 3);

    var step = 0, localPosition;
    for (var i = 0; i < nbBlobs; i++)
    {
        for(var j = 0; j < model.vertices.length; j++)
        {
            localPosition = model.vertices[j];
            vertices.setXYZ(step, localPosition.x, localPosition.y, localPosition.z);
            step++;
        }
    }
    geometry.addAttribute('position', vertices);

    var faces = new THREE.BufferAttribute(new Uint32Array(nbBlobs * model.faces.length * 3), 1);
    var step = 0, localFace;
    for (var i = 0; i < nbBlobs; i++)
    {
        var offset = i * model.vertices.length;

        for(var j = 0; j < model.faces.length; j++)
        {
            localFace = model.faces[j];

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

    var indexBlob = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.vertices.length), 1);
    var step = 0;
    for (var i = 0; i < nbBlobs; i++)
    {
        for(var j = 0; j < model.vertices.length; j++)
        {
            indexBlob.setX(step, i);
            step++;
        }   
    }    
    geometry.addAttribute('aIndex', indexBlob);               

    var positions = new THREE.BufferAttribute(new Float32Array(nbBlobs * model.vertices.length * 3), 3);
    var back = - ROW / 2 * 25, step = 0;
    for (var i = 0; i < nbBlobs; i++)
    {
        var dx = back + Math.random() * ROW * 25; 
        var dy = back + Math.random() * ROW * 25;
        var dz = back + Math.random() * ROW * 25;

        for (var j = 0; j < model.vertices.length; j++)
        {
            positions.setXYZ(step, dx, dy, dz);
            step++;
        }
    }   
    geometry.addAttribute('aPosition', positions);
    
    return geometry;
}

function setupParameters() {
 
    PARAMETERS = {
     
        speed:              1.0,
        numBlobs:           100,
        resolution:         40,
        isolation:          80,
        subtract:           64,
        
        floor:              true,
        wallx:              false,
        wallz:              false,
        
        hue:                0.0,
        saturation:         0.0,
        lightness:          1.0,
        
        lhue:               0.04,
        lsaturation:        1.0,
        llightness:         0.5,
        
        lx:                 0.5,
        ly:                 0.5,
        lz:                 1.0  
        
    };
    
}

function setMode() {
    
    if (MODE == 1) {
        
        BLOB_V1.visible = true;
        BLOB_V2.visible = false;
        
    } else {
        
        BLOB_V1.visible = false;
        BLOB_V2.visible = true;
        
    }
    
}

function updateCubes( object, time, numblobs, subtract, floor, wallx, wallz ) {

    object.reset();

    // fill the field with some metaballs

    var i, ballx, bally, ballz, strength;

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
