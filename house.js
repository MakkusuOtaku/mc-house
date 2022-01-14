const maxSize = 5;
const roomSize = 5;
const blocks = [
    'air',
    'oak_planks',
    'bricks',
    'cobblestone',
    'glass',
    'stone_bricks',
    'mossy_stone_bricks',
    'cracked_stone_bricks',
    'mossy_cobblestone',
    'spruce_planks',
    'dark_oak_planks',
    'birch_planks',
    'dark_prismarine',
    'quartz_block',
    'dark_oak_log',
];

var palettes;
var house = {};

var roomMap = new Array(maxSize).fill(0).map(()=>{
    return new Array(maxSize).fill(false);
});

var windowMap = [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

var openRooms = [];

function choose(list) {
    return list[Math.floor(Math.random()*list.length)];
}

// Get the distance from a point to a line
function lineDistance(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
    
    var xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

async function loadPalettes() {
    let response = await fetch('palettes.json');
    palettes = await response.json();

    return palettes;
}

function generateHouse() {
    house = {};
    house.palette = choose(Object.values(palettes));
    console.log(house.palette);

    house.weights = {};
    house.weights.ridge = choose([0, 0.5, 0.75, 1, 2]);

    house.rooms = [];
    house.ridges = [];

    for (let x = 0; x < maxSize; x++) {
        for (let z = 0; z < maxSize; z++) {
            if (roomMap[x][z]) {
                if (roomMap[x-1] && roomMap[x-1][z]) {
                    house.ridges.push({
                        x1: (x+0.5)*roomSize-0.5,
                        z1: (z+0.5)*roomSize-0.5,
                        x2: (x-0.5)*roomSize-0.5,
                        z2: (z+0.5)*roomSize-0.5,
                    });
                }
                if (roomMap[x][z-1]) {
                    house.ridges.push({
                        x1: (x+0.5)*roomSize-0.5,
                        z1: (z+0.5)*roomSize-0.5,
                        x2: (x+0.5)*roomSize-0.5,
                        z2: (z-0.5)*roomSize-0.5,
                    });
                }
            }
        }
    }
    console.log(house);
}

function addOpen(x, z) {
    if (x < 0 || z < 0) return;
    if (x >= maxSize || z >= maxSize) return;

    if (roomMap[x][z]) return;
    openRooms.push({x: x, z: z});
}

function addRoom(x, z) {
    roomMap[x][z] = true;

    openRooms = openRooms.filter(p=>{
        return p.x != x || p.z != z;
    });

    addOpen(x-0, z-1);
    addOpen(x-0, z+1);
    addOpen(x-1, z-0);
    addOpen(x+1, z-0);
}

function generateRoom() {
    let point = choose(openRooms);
    averageX += point.x;
    averageZ += point.z;
    addRoom(point.x, point.z);
}

addRoom(2, 2);
var averageX = 2;
var averageZ = 2;

//*
var roomCount = Math.floor(Math.random()*5)+1;

for (let i = 0; i < roomCount-1; i++) {
    generateRoom();
}
//*/

/*///////////////////////////////////////////////////////////////////////////////
var roomCount = 4;

addRoom(1, 2);
addRoom(3, 2);
addRoom(2, 1);
averageX += 6;
averageZ += 5;
////////////////////////////////////////////////////////////////////////////////*/

averageX /= roomCount;
averageZ /= roomCount;

averageX -= maxSize/2;
averageZ -= maxSize/2;

var doorPosition = {x: 2, z: 0};

while (!roomMap[doorPosition.x][doorPosition.z]) {
    doorPosition.z += 1;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function getRoofWeights(x, z) {
    let weights = {};

    weights.axisX = Math.abs(x - (maxSize*roomSize/2));
    weights.axisZ = Math.abs(z - (maxSize*roomSize/2));

    return weights;
}

function getRoofHeight(x, z) {

    //let roofWeights = getRoofWeights(x, z);

    // Find the distance to the nearest ridge
    let ridgeDistance = Infinity;

    for (let ridge of house.ridges) {
        let d = lineDistance(x, z, ridge.x1, ridge.z1, ridge.x2, ridge.z2);
        if (d < ridgeDistance) {
            ridgeDistance = d;
        }
    }

    h = -ridgeDistance;

    // Calculate the lowest possible ridge height

    let lowRidge = house.weights.ridge*(roomSize/2+1.5);

    return (4+lowRidge)+Math.floor(h*house.weights.ridge);
}

function checkRoom(x, y) {
    x = Math.floor(x/roomSize);
    y = Math.floor(y/roomSize);

    if (x < 0 || y < 0 || x >= maxSize || y >= maxSize) return false;

    return roomMap[x][y];
}

function checkWall(x, y, z, roomX, roomZ) {
    if (x == 0 || x == roomSize*maxSize-1) return true;
    if (z == 0 || z == roomSize*maxSize-1) return true;

    if (x%roomSize === 0 && !roomMap[roomX-1][roomZ]) return true;
    if (x%roomSize === roomSize-1 && !roomMap[roomX+1][roomZ]) return true;

    if (z%roomSize === 0 && !roomMap[roomX][roomZ-1]) return true;
    if (z%roomSize === roomSize-1 && !roomMap[roomX][roomZ+1]) return true;
}

function checkWindow(x, y, z) {
    a = y % windowMap.length;
    b = (z+x) % windowMap[0].length;

    return windowMap[a][b];
}

function getBlock(x, y, z) {
    let roofHeight = getRoofHeight(x, z);
    let roomX = Math.floor(x/roomSize);
    let roomZ = Math.floor(z/roomSize);

    if (y > roofHeight) return 'air';

    //let wallType = choose(blocks);
    let doorX = doorPosition.x*roomSize;
    let doorZ = doorPosition.z*roomSize;
    doorX += Math.floor(roomSize/2);

    if (x == doorX && z == doorZ && (y == 1 || y == 2)) return 'air';

    if (roomMap[roomX][roomZ]) {
        if (y == 0) return 'floor';
        if (y == roofHeight) return 'roof';
        if (y > 4) return 'roof';

        let isWall = checkWall(x, y, z, roomX, roomZ);

        if ((z != doorZ || roomX != 2) && checkWindow(x, y, z) && isWall) return 'window';

        if (isWall) return 'wall';
    }

    /*
    if (y < roofHeight) {
        //if (checkRoom(x-1, z-1)) return 'wall-edge';
        //if (checkRoom(x-1, z+1)) return 'wall-edge';
        //if (checkRoom(x+1, z-1)) return 'wall-edge';
        //if (checkRoom(x+1, z+1)) return 'wall-edge';
    }
    //*/

    if (checkRoom(x+0, z+1) && y == roofHeight) return 'roof';
    if (checkRoom(x+0, z-1) && y == roofHeight) return 'roof';
    if (checkRoom(x+1, z+0) && y == roofHeight) return 'roof';
    if (checkRoom(x-1, z+0) && y == roofHeight) return 'roof';

    return 'air';
}

function type2Block(type) {
    let block = house.palette[type] || 'air';
    if (typeof block == 'string') return block;
    return choose(block);
}

function getBlockMap(x=0, y=0, z=0, chunkSize=roomSize*maxSize) {

    let chunk = [];
    for (let xx = 0; xx < chunkSize; xx++) {
        chunk[xx] = [];
        for (let yy = 0; yy < chunkSize; yy++) {
            chunk[xx][yy] = [];
            for (let zz = 0; zz < chunkSize; zz++) {
                let block = getBlock(x+xx, y+yy, z+zz);
                block = type2Block(block);
                chunk[xx][yy][zz] = blocks.indexOf(block);
            }
        }

    }
    return chunk;
}

loadPalettes().then(()=>{
    console.log('Palettes loaded');
    generateHouse();
});