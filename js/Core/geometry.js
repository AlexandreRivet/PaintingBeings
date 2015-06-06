function SphereFormation(row, col, radius)
{
    var step = 0;
    var geometry = OBJECT.geometry;
    var pos = geometry.attributes.aPosition.array;
    
    for (var y = 0; y < row; y++)
    {
        for (var x = 0; x < col; x++)
        {
            var u = x / col;
            var v = y / row;
            
            var vertex = new THREE.Vector3();
            vertex.x = - radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
            vertex.y = radius * Math.cos(v * Math.PI);
            vertex.z = radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);
            
            for(var j = 0; j < MODEL.vertices.length; j++)
            {
                pos[step] = MODEL.vertices[j].x + vertex.x;
                step++;
                
                pos[step] = MODEL.vertices[j].y + vertex.y;
                step++;
                
                pos[step] = MODEL.vertices[j].z + vertex.z;
                step++;
            }
        }
    } 
    geometry.attributes.aPosition.needsUpdate = true;
}

function TorusFormation(row, col, radius, radiusTube)
{
    var step = 0, tube = radiusTube;
    var geometry = OBJECT.geometry;
    var pos = geometry.attributes.aPosition.array;
    
    for (var y = 0; y < row; y++)
    {
        for (var x = 0; x < col; x++)
        {
            var u = x / col * Math.PI * 2;
            var v = y / row * Math.PI * 2;
            
            var vertex = new THREE.Vector3();
            vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u);
            vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u);
            vertex.z = tube * Math.sin(v);
            
            for(var j = 0; j < MODEL.vertices.length; j++)
            {
                pos[step] = MODEL.vertices[j].x + vertex.x;
                step++;
                
                pos[step] = MODEL.vertices[j].y + vertex.y;
                step++;
                
                pos[step] = MODEL.vertices[j].z + vertex.z;
                step++;
            }
        }
    } 
    geometry.attributes.aPosition.needsUpdate = true;    
}