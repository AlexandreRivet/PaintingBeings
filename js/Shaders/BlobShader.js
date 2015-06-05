var BlobShader = {

    uniforms : {
        "uTime":        {type: "f", value: 1.0},
        "uSeed":        {type: "f", value: 0.0},
        "uColor":       {type: "v3", value: new THREE.Vector3(1.0, 0.0, 0.0)},
        "uSampler":     {type: "t", value: null},
        "uSamplerSize": {type: "v2", value: new THREE.Vector2(0.0, 0.0)},
        "uBlobsSize":   {type: "v2", value: new THREE.Vector2(0.0, 0.0)}
    },

    attributes : {
    
    
    },
}