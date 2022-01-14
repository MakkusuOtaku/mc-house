document.getElementById('generate-button').addEventListener('click', () => {
    location.reload();
});

const roomCanvas = document.querySelector('#room-map');
roomCanvas.width = roomCanvas.clientWidth*2;
roomCanvas.height = roomCanvas.clientHeight*2;
const roomContext = roomCanvas.getContext('2d');

let unit = roomCanvas.width/5;

roomContext.fillStyle = 'cornflowerblue';
roomContext.fillRect(0, 0, roomCanvas.width, roomCanvas.height);

roomContext.strokeStyle = "#fff";
roomContext.fillStyle = "#fff";
roomContext.lineWidth = 2;

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

/*
context.fillStyle = "#f009";
context.beginPath();
context.moveTo(doorPosition.x*unit+(unit/2), doorPosition.z*unit+(unit/2));
context.arc(doorPosition.x*unit+(unit/2), doorPosition.z*unit+(unit/2), unit/10, 0, Math.PI*2);
context.fill();

let avgX = averageX+(maxSize/2);
let avgZ = averageZ+(maxSize/2);

context.fillStyle = "#0f09";
context.beginPath();
context.moveTo(avgX*unit+(unit/2), avgZ*unit+(unit/2));
context.arc(avgX*unit+(unit/2), avgZ*unit+(unit/2), unit/10, 0, Math.PI*2);
context.fill();
*/

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

unit = windowCanvas.width/5;

const glassImage = new Image();
glassImage.src = "./glass.png";

console.log(windowContext);

glassImage.onload = ()=>{
    for (let x = 0; x < windowMap.length; x++) {
        for (let z = 0; z < windowMap[0].length; z++) {
            if (windowMap[x][z]) {
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

unit = roofCanvas.width/5;

function drawRoof() {
    roofContext.strokeStyle = "#fff6";
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
}

setTimeout(drawRoof, 1000);