var BlobShader = {

    uniforms : {
        "uTime" : {type: "f", value: 1.0},
        "uSampler" : {type: "t", value: null}    
    },

    attributes : {
    
    
    },

    vertexShader : [
        
        "varying vec2 vTextCoord;",
        
        "void main() {",
            
            "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
            "gl_Position = projectionMatrix * mvPosition;",
        
            "vTextCoord = uv;",
            
        "}"
            
    ].join('\n'),
    
    fragmentShader : [
        
        "uniform float uTime;",
        "uniform sampler2D uSampler;",
        
        "varying vec2 vTextCoord;",
        
        "void main() {",
        
            "vec4 color = texture2D(uSampler, vTextCoord);",
            "gl_FragColor = color;",
        
        "}"
    
    ].join('\n')
}