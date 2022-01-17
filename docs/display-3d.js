//const canvas = document.createElement('canvas');
const canvas = document.querySelector('#header-canvas');
//document.body.appendChild(canvas);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

//const structure.length = 8;
//const halfChunk = structure.length/2;

const chunks = [];
const entities = [];
var player;

const glassID = 4;

var textures;

import * as THREE from "https://cdn.skypack.dev/three@0.134.0";

const loader = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
});

console.log(renderer.shadowMap);
renderer.shadowMap.enabled = true;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 1000);
camera.position.y = 15;
camera.position.z = -35;

// Place the camera inside an empty object
let cameraObject = new THREE.Object3D();
cameraObject.add(camera);
scene.add(cameraObject);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-10, 20, -5);
light.castShadow = true;
scene.add(light);

const light2 = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light2);

const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 20);

function screenshot(width=3840, height=2160) {
    let originalWidth = canvas.width;
    let originalHeight = canvas.height;

    canvas.width = width;
    canvas.height = height;
    camera.aspect = canvas.width/canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);

    let data = canvas.toDataURL('image/png');
    let link = document.createElement('a');

    link.download = 'screenshot.png';
    link.href = data;
    link.click();

    canvas.width = originalWidth;
    canvas.height = originalHeight;
    camera.aspect = canvas.width/canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(originalWidth, originalHeight);
}

document.getElementById('screenshot-button').addEventListener('click', () => {
    screenshot();
});

window.addEventListener('resize', ()=>{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    camera.aspect = canvas.width/canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize(canvas.width, canvas.height);
});

const blockUV = {
    default: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]
};

// Number of blocks devided by 1.
const textureSize = 1/15;

const uv = [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0],
];

// Multiply every second value by textureSize
for (let i = 0; i < uv.length; i++) {
    for (let j = 0; j < uv[i].length; j += 2) {
        uv[i][j] *= textureSize;
        //uv[i][j] += textureSize*1;
    }
}

function getUV(id, side, uvList=uv) {
    // Return uv[side] but add (id*textureSize) to every second value
    let thisUV = [...uvList[side]];
    for (let i = 0; i < thisUV.length; i+=2) {
        thisUV[i] += textureSize*id;
    }
    return thisUV;//thisUV.map((v,i)=> i%2 ? v + (id * textureSize) : v);
}

function getBlock(x, y, z, structure) {
    // This looks kind of ugly
    if (x < 0 || x >= structure.length) return 0;
    if (y < 0 || y >= structure.length) return 0;
    if (z < 0 || z >= structure.length) return 0;
    
    let block = structure[x][y][z];
    return block;
}

function getSolid(x, y, z, structure) {
    let block = getBlock(x, y, z, structure);
    return block != 0 && block != glassID;
}

function generateVertices(structure) {
    let vertices = [];
    let uvs = [];

    for (let xx = -structure.length/2; xx < structure.length/2; xx++) {
        for (let yy = -structure.length/2; yy < structure.length/2; yy++) {
            for (let zz = -structure.length/2; zz < structure.length/2; zz++) {

                let rX = xx+(structure.length/2);
                let rY = yy+(structure.length/2);
                let rZ = zz+(structure.length/2);

                let block = getBlock(rX, rY, rZ, structure);

                if (block == 0) continue;

                let height = 0;//heightGenerator(xx, zz);

                if (!getSolid(rX, rY+1, rZ, structure)) {
                    vertices.push(
                        xx, yy, zz,
                        xx, yy, zz+1,
                        xx+1, yy, zz+1,
                        xx+1, yy, zz+1,
                        xx+1, yy, zz,
                        xx, yy, zz
                    );
                    uvs.push(...getUV(block, 0));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }

                if (!getSolid(rX, rY-1, rZ, structure)) {
                    vertices.push(
                        xx, yy-1, zz,
                        xx+1, yy-1, zz+1,
                        xx, yy-1, zz+1,
                        xx+1, yy-1, zz+1,
                        xx, yy-1, zz,
                        xx+1, yy-1, zz
                    );
                    uvs.push(...getUV(block, 1));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }

                if (!getSolid(rX, rY, rZ-1, structure)) {
                    vertices.push(
                        xx, yy, zz,
                        xx+1, yy-1, zz,
                        xx, yy-1, zz,
                        xx+1, yy-1, zz,
                        xx, yy, zz,
                        xx+1, yy, zz
                    );
                    uvs.push(...getUV(block, 2));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }

                if (!getSolid(rX, rY, rZ+1, structure)) {
                    vertices.push(
                        xx, yy, zz+1,
                        xx, yy-1, zz+1,
                        xx+1, yy-1, zz+1,
                        xx+1, yy-1, zz+1,
                        xx+1, yy, zz+1,
                        xx, yy, zz+1
                    );
                    uvs.push(...getUV(block, 3));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }

                if (!getSolid(rX-1, rY, rZ, structure)) {
                    vertices.push(
                        xx, yy, zz,
                        xx, yy-1, zz,
                        xx, yy-1, zz+1,
                        xx, yy-1, zz+1,
                        xx, yy, zz+1,
                        xx, yy, zz
                    );
                    uvs.push(...getUV(block, 4));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }

                if (!getSolid(rX+1, rY, rZ, structure)) {
                    vertices.push(
                        xx+1, yy, zz,
                        xx+1, yy-1, zz+1,
                        xx+1, yy-1, zz,
                        xx+1, yy-1, zz+1,
                        xx+1, yy, zz,
                        xx+1, yy, zz+1
                    );
                    uvs.push(...getUV(block, 5));
                } else {
                    vertices.push(...new Array(18));
                    uvs.push(...new Array(18));
                }
            }
        }
    }

    return { vertices, uvs };
}

function simplifyTerrain(vertices, uvs, terrain) {
    return { vertices, uvs };
}

function createChunk(x, y, z) {
    let boxes = [];
    let geometry = new THREE.BufferGeometry();

    let terrain = getBlockMap(x, y, z);

    let { vertices, uvs } = generateVertices(terrain);
    let { vertices: newVertices, uvs: newUvs } = simplifyTerrain(vertices, uvs, terrain);

    vertices = vertices.filter(v => v != undefined);
    uvs = uvs.filter(v => v != undefined);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    let chunk = new THREE.Mesh(geometry, material);
    chunk.castShadow = true;
    chunk.receiveShadow = true;

    chunk.position.set(
        0,//-averageX*roomSize/2,
        (terrain.length/2)+1.01,
        0//-averageZ*roomSize/2
    );

    chunk.matrixAutoUpdate = false;
    chunk.updateMatrix();

    scene.add(chunk);
    console.log(chunk.matrixAutoUpdate);
    return chunk;
}

textures = loader.load('textures-extended.png', (texture) => {
    //chunks.push(createChunk(0, 0, 0));
    window.houseObject = createChunk(0, 0, 0);
    camera.lookAt(0, 0, 0);
});

textures.magFilter = THREE.NearestFilter;
textures.minFilter = THREE.LinearMipMapLinearFilter;

const material = new THREE.MeshPhongMaterial({ 
    map: textures,
    transparent: true,
    //side: THREE.DoubleSide,
    wireframe: false,
    clippingPlanes: [ clippingPlane ],
    clipShadows: true,
});

// Create a plane with the texture of the "room-map" canvas
//const plane = new THREE.Plane(new THREE.Vector3(1, 1, 0), 0);
const planeGeometry = new THREE.PlaneBufferGeometry(roomSize*maxSize, roomSize*maxSize);
const planeTexture = new THREE.CanvasTexture(document.getElementById('room-map'));
planeTexture.wrapS = THREE.RepeatWrapping;
planeTexture.wrapT = THREE.RepeatWrapping;
planeTexture.repeat.set(1, 1);
//planeTexture.magFilter = THREE.NearestFilter;
//planeTexture.minFilter = THREE.LinearMipMapLinearFilter;
const planeMaterial = new THREE.MeshBasicMaterial({
    map: planeTexture,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
/*plane.position.set(
    -averageX*roomSize/2,
    0,
    -averageZ*roomSize/2
);*/
plane.rotation.x = -Math.PI/2;
scene.add(plane);

var startTime = Date.now();

setTimeout(() => {
    cameraObject.rotation.y = 3.14/4;
    renderer.render(scene, camera);
}, 1000);

setInterval(()=>{
    //cameraObject.rotation.y += 0.01;
    //clippingPlane.constant += 0.02;

    //let time = Date.now() - startTime;
    //let t = easeOutElastic(time / 1000);

    //camera.position.x = (t * 10)-12.5;

    renderer.render(scene, camera);

}, 1000 / 30);