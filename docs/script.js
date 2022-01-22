document.getElementById('generate-button').addEventListener('click', () => {
    location.reload();
});

const roomCanvas = document.querySelector('#room-map');
roomCanvas.width = roomCanvas.clientWidth*2;
roomCanvas.height = roomCanvas.clientHeight*2;
const roomContext = roomCanvas.getContext('2d');

roomContext.fillStyle = 'cornflowerblue';
roomContext.fillRect(0, 0, roomCanvas.width, roomCanvas.height);

roomContext.strokeStyle = "#fff";
roomContext.fillStyle = "#fff";
roomContext.lineWidth = 2;

function drawRooms() {
    let unit = roomCanvas.width/5;

    for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
            if (roomMap[x][z]) {
                roomContext.fillRect(x*unit+16, z*unit+16, unit-32, unit-32);
            }
            roomContext.strokeRect(x*unit, z*unit, unit, unit);
        }
    }
    
    for (let point of openRooms) {
        let x = point.x*unit+(unit/2);
        let z = point.z*unit+(unit/2);
    
        roomContext.beginPath();
        roomContext.moveTo(x, z);
        roomContext.arc(x, z, unit/10, 0, Math.PI*2);
        roomContext.fill();
    }
}

const windowCanvas = document.querySelector('#window-map');
windowCanvas.width = windowCanvas.clientWidth;
windowCanvas.height = windowCanvas.clientHeight;
const windowContext = windowCanvas.getContext('2d');

windowContext.strokeStyle = "#fff";
windowContext.fillStyle = "#fff";
windowContext.lineWidth = 2;

windowContext.shadowColor = "#0006";
windowContext.shadowOffsetX = 8;
windowContext.shadowOffsetY = 8;
windowContext.shadowBlur = 5;

const glassImage = new Image();

glassImage.onload = ()=>{
    let unit = windowCanvas.width/5;
    for (let x = 0; x < house.windowMap.length; x++) {
        for (let z = 0; z < house.windowMap[0].length; z++) {
            if (house.windowMap[x][z]) {
                //windowContext.fillRect(x*unit+16, z*unit+16, unit-32, unit-32);
                windowContext.drawImage(glassImage, z*unit, x*unit, unit, unit);
            }
            //windowContext.strokeRect(x*unit, z*unit, unit, unit);
        }
    }
};

const roofCanvas = document.querySelector('#roof-map');
roofCanvas.width = roofCanvas.clientWidth;
roofCanvas.height = roofCanvas.clientHeight;
const roofContext = roofCanvas.getContext('2d');

roofContext.strokeStyle = "#fff";
roofContext.lineWidth = 2;

function drawRoof() {
    roofContext.strokeStyle = "#fff6";
    let unit = roofCanvas.width/5;
    
    for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
            if (roomMap[x][z]) {
                roofContext.strokeRect(x*unit, z*unit, unit, unit);
            }
        }
    }

    roofContext.strokeStyle = "#fff";
    for (let ridge of house.ridges) {
        roofContext.strokeStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
        roofContext.beginPath();
        roofContext.moveTo(ridge.x1/roomSize*unit, ridge.z1/roomSize*unit);
        roofContext.lineTo(ridge.x2/roomSize*unit, ridge.z2/roomSize*unit);
        roofContext.stroke();
    }

    roofContext.fillStyle = "#f009";
    for (let peak of house.peaks) {
        roofContext.beginPath();
        roofContext.moveTo(peak.x/roomSize*unit, peak.z/roomSize*unit);
        roofContext.arc(peak.x/roomSize*unit, peak.z/roomSize*unit, unit/10, 0, Math.PI*2);
        roofContext.fill();
    }
}

const paletteCanvas = document.querySelector('#palette-map');
paletteCanvas.width = paletteCanvas.clientWidth;
paletteCanvas.height = paletteCanvas.clientHeight;
const paletteContext = paletteCanvas.getContext('2d');

paletteContext.imageSmoothingEnabled = false;

const textureImage = new Image();

textureImage.onload = ()=>{
    let wallBlock = blocks.indexOf(house.palette.wall);
    let roofBlock = blocks.indexOf(house.palette.roof);
    let floorBlock = blocks.indexOf(house.palette.floor);
    let windowBlock = blocks.indexOf(house.palette.window);

    let u = paletteCanvas.width;

    paletteContext.drawImage(textureImage,
        wallBlock*16, 0, 16, 16,
        u*0.1, u*0.1, u/2.5, u/2.5
    );

    paletteContext.drawImage(textureImage,
        roofBlock*16, 0, 16, 16,
        u*0.23, u*0.23, u/2.5, u/2.5
    );

    paletteContext.drawImage(textureImage,
        floorBlock*16, 0, 16, 16,
        u*0.37, u*0.37, u/2.5, u/2.5
    );

    paletteContext.drawImage(textureImage,
        windowBlock*16, 0, 16, 16,
        u*0.5, u*0.5, u/2.5, u/2.5
    );
};

function init() {
    drawRooms();
    glassImage.src = "./glass.png";
    textureImage.src = "./textures-extended.png";
    //drawRoof();
}

// Execute when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', init);

setTimeout(drawRoof, 1000);