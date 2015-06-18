var BlobShader = {

    uniforms : {
        "uTime":        {type: "f", value: 1.0},
        "uSeed":        {type: "f", value: 0.0},
        "uSampler":     {type: "t", value: null},
        "uBlobsSize":   {type: "v2", value: null}
    },

    attributes : {
        "aIndex":       {type: "f", value: null},
        "aPosition":    {type: "v3", value: null}
    },
}