const scene = new THREE.Scene();

const BoxSize = 5; // #DEFINE BoxSize
const Rate = 1/6; // #DEFINE Rate of each step in BoxSize (BoxSize/Rate must be INTEGER)
const SafePrecision = 9; //#DEFINE larger than the length of fixed portion of BoxSize*Rate
var KEY_INTERRUPT = false;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 500);
camera.position.set(100, 60, 60);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(500, 1000, 1500);
scene.add(light);

const cubeGeometry = new THREE.BoxGeometry(BoxSize, BoxSize, BoxSize);
const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00fff0
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, BoxSize*0.5);
scene.add(cube);

const cubeTargetPoint = new THREE.Vector3(0, 0, BoxSize*0.5);

// Displayer initialize
document.getElementById('cubePos').innerText = 
`<${cube.position.x}, ${cube.position.y}, ${cube.position.z}>`
document.getElementById('targetPos').innerText = 
`<${cubeTargetPoint.x}, ${cubeTargetPoint.y}, ${cubeTargetPoint.z}>`

const keyEventQueue = [];
document.addEventListener('keydown', function(event) {
    console.log(event.key);
    switch (event.key) {
        case "s":
            cubeTargetPoint.x += BoxSize;
            break;
        case "d":
            cubeTargetPoint.y += BoxSize;
            break;
        case "w":
            cubeTargetPoint.x -= BoxSize;
            break;
        case "a":
            cubeTargetPoint.y -= BoxSize;
            break;
        case "Escape":
            KEY_INTERRUPT = !KEY_INTERRUPT;
            break;
    }
    keyEventQueue.push(cubeTargetPoint.clone());
});

function updateMovement(){
    if(keyEventQueue.length != 0){
        // Read queue's head
        const targetPosition = keyEventQueue[0];

        // Reach or not & direction
        const dist = targetPosition.clone().sub(cube.position);

        // Reach the target -> dequeue, reset cube rotation(more accurate), return
        if(dist.equals(new THREE.Vector3(0, 0, 0))){
            keyEventQueue.shift();
            cube.rotation.set(0, 0, 0);
            return;
        }

        // Update position if not reach
        const {x,y} = dist;
        if(x > 0) cube.position.setX(Number((cube.position.x + BoxSize*Rate).toFixed(SafePrecision)));
        if(x < 0) cube.position.setX(Number((cube.position.x - BoxSize*Rate).toFixed(SafePrecision)));
        if(y > 0) cube.position.setY(Number((cube.position.y + BoxSize*Rate).toFixed(SafePrecision)));
        if(y < 0) cube.position.setY(Number((cube.position.y - BoxSize*Rate).toFixed(SafePrecision)));

        if(x > 0) cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI * Rate / 2);
        if(x < 0) cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), - Math.PI * Rate / 2);
        if(y > 0) cube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), - Math.PI * Rate / 2);
        if(y < 0) cube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI * Rate / 2);

        // Display position
        document.getElementById('cubePos').innerText = 
        `<${cube.position.x}, ${cube.position.y}, ${cube.position.z}>`
        document.getElementById('targetPos').innerText = 
        `<${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}>`
    }
}
function animation() {
    // callback every 1/60 second
    window.requestAnimationFrame(animation);

    if(KEY_INTERRUPT) return;

    // update position
    updateMovement();

    // render
    renderer.render(scene, camera);
};
renderer.render(scene, camera);
window.requestAnimationFrame(animation);
