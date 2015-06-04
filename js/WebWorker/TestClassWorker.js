var blob;
var coucou = 0;

function run() {
    
    blob = new Blob(Math.random(), 0x00ff00, new THREE.Vector2(10, 20));
    
    var a = 0;
    for(var i = 0; i < 10000000; i++) { a += i;}
    blob.size = a;
    
    return blob;
}