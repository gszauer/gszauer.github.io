// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const raycaster = new THREE.Raycaster();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x8099b3, 1);
document.body.appendChild(renderer.domElement);

// Game constants
const LANES = 4;
const ROWS = 3;
const CUBE_COUNT = 200;
const CUBE_SPEED = 0.1;
const LANE_WIDTH = 2;
const ROW_HEIGHT = 2;
const RED = 0xff0000;
const BLUE = 0x0000ff;
const GREEN = 0x00ff00;
const INTERACTION_ZONE_START = -5;
const INTERACTION_ZONE_END = 25;
const INTERACTION_ZONE_LENGTH = INTERACTION_ZONE_END - INTERACTION_ZONE_START;

// Game state
let score = 0;
const scoreElement = document.getElementById('score');
const activeSwipes = new Map();

// Camera position
camera.position.set(0, 2, 5);
camera.rotation.x = -0.2;

// Ground plane
const planeGeometry = new THREE.PlaneGeometry(LANES * LANE_WIDTH, 2000);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -ROW_HEIGHT;
scene.add(ground);

// Interaction Zone
const zoneGeometry = new THREE.PlaneGeometry(LANES * LANE_WIDTH, INTERACTION_ZONE_LENGTH);
const zoneMaterial = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.5 });
const interactionZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
interactionZone.rotation.x = -Math.PI / 2;
interactionZone.position.y = ground.position.y + 0.01;
interactionZone.position.z = (INTERACTION_ZONE_START + INTERACTION_ZONE_END) / 2;
scene.add(interactionZone);

// Arrow Textures
function createArrowTexture(direction, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#' + new THREE.Color(color).getHexString();
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = 'white';
    context.translate(128, 128);
    let rotation = 0;
    if (direction === 'down') rotation = Math.PI;
    if (direction === 'left') rotation = -Math.PI / 2;
    if (direction === 'right') rotation = Math.PI / 2;
    context.rotate(rotation);
    context.beginPath();
    context.moveTo(0, -60);
    context.lineTo(70, 60);
    context.lineTo(-70, 60);
    context.closePath();
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

const directions = ['up', 'down', 'left', 'right'];
const colors = { 'red': RED, 'blue': BLUE, 'green': GREEN };
const arrowTextures = {};
for (const dir of directions) {
    arrowTextures[dir] = {};
    for (const c in colors) {
        arrowTextures[dir][c] = createArrowTexture(dir, colors[c]);
    }
}

// Cube Creation
const cubes = [];
for (let i = 0; i < CUBE_COUNT; i++) {
    const colorName = Math.random() > 0.5 ? 'red' : 'blue';
    const color = colors[colorName];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const sideMaterial = new THREE.MeshBasicMaterial({ color: color });
    const frontMaterial = new THREE.MeshBasicMaterial({ map: arrowTextures[direction][colorName] });
    const materials = [
        sideMaterial.clone(), sideMaterial.clone(), sideMaterial.clone(),
        sideMaterial.clone(), frontMaterial, sideMaterial.clone()
    ];
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, materials);
    const lane = Math.floor(Math.random() * LANES) - (LANES / 2) + 0.5;
    const row = Math.floor(Math.random() * ROWS);
    cube.position.set(lane * LANE_WIDTH, row * ROW_HEIGHT + 0.5, -i * 10);
    cube.userData = { direction, inZone: false, hit: false };
    scene.add(cube);
    cubes.push(cube);
}

function updateScore() {
    scoreElement.innerText = `Score: ${score}`;
}

// Mouse and Touch Controls
let mouseSwipe = null;

function handleMouseDown(event) {
    event.preventDefault();
    mouseSwipe = {
        id: 'mouse',
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        trailPoints: [],
        trail: null
    };
    activeSwipes.set('mouse', mouseSwipe);
}

function handleMouseMove(event) {
    if (mouseSwipe) {
        const prevX = mouseSwipe.x;
        const prevY = mouseSwipe.y;
        mouseSwipe.x = event.clientX;
        mouseSwipe.y = event.clientY;
        
        // Check for cube hits during swipe
        const dx = mouseSwipe.x - mouseSwipe.startX;
        const dy = mouseSwipe.y - mouseSwipe.startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {  // Minimum swipe distance
            let swipeDirection = '';
            const moveDx = mouseSwipe.x - prevX;
            const moveDy = mouseSwipe.y - prevY;
            if (Math.abs(moveDx) > Math.abs(moveDy)) {
                swipeDirection = moveDx > 0 ? 'right' : 'left';
            } else {
                swipeDirection = moveDy > 0 ? 'down' : 'up';
            }
            
            const touchX = (mouseSwipe.x / window.innerWidth) * 2 - 1;
            const touchY = -(mouseSwipe.y / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera({ x: touchX, y: touchY }, camera);
            const intersects = raycaster.intersectObjects(cubes);
            
            for (const intersect of intersects) {
                const cube = intersect.object;
                if (cube.userData.inZone && !cube.userData.hit && cube.userData.direction === swipeDirection) {
                    score++;
                    cube.userData.hit = true;
                    scene.remove(cube);
                    updateScore();
                }
            }
        }
    }
}

function handleMouseUp(event) {
    if (mouseSwipe) {
        const dx = mouseSwipe.x - mouseSwipe.startX;
        const dy = mouseSwipe.y - mouseSwipe.startY;
        let swipeDirection = '';
        if (Math.abs(dx) > Math.abs(dy)) {
            swipeDirection = dx > 0 ? 'right' : 'left';
        } else {
            swipeDirection = dy > 0 ? 'down' : 'up';
        }

        const touchX = (mouseSwipe.x / window.innerWidth) * 2 - 1;
        const touchY = -(mouseSwipe.y / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera({ x: touchX, y: touchY }, camera);
        const intersects = raycaster.intersectObjects(cubes);

        for (const intersect of intersects) {
            const cube = intersect.object;
            if (cube.userData.inZone && !cube.userData.hit && cube.userData.direction === swipeDirection) {
                score++;
                cube.userData.hit = true;
                scene.remove(cube);
            }
        }
        updateScore();
        if (mouseSwipe.trail) scene.remove(mouseSwipe.trail);
        activeSwipes.delete('mouse');
        mouseSwipe = null;
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
        const swipe = {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            x: touch.clientX,
            y: touch.clientY,
            trailPoints: [],
            trail: null
        };
        activeSwipes.set(touch.identifier, swipe);
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
        const swipe = activeSwipes.get(touch.identifier);
        if (swipe) {
            const prevX = swipe.x;
            const prevY = swipe.y;
            swipe.x = touch.clientX;
            swipe.y = touch.clientY;
            
            // Check for cube hits during swipe
            const dx = swipe.x - swipe.startX;
            const dy = swipe.y - swipe.startY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {  // Minimum swipe distance
                let swipeDirection = '';
                const moveDx = swipe.x - prevX;
                const moveDy = swipe.y - prevY;
                if (Math.abs(moveDx) > Math.abs(moveDy)) {
                    swipeDirection = moveDx > 0 ? 'right' : 'left';
                } else {
                    swipeDirection = moveDy > 0 ? 'down' : 'up';
                }
                
                const touchX = (swipe.x / window.innerWidth) * 2 - 1;
                const touchY = -(swipe.y / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera({ x: touchX, y: touchY }, camera);
                const intersects = raycaster.intersectObjects(cubes);
                
                for (const intersect of intersects) {
                    const cube = intersect.object;
                    if (cube.userData.inZone && !cube.userData.hit && cube.userData.direction === swipeDirection) {
                        score++;
                        cube.userData.hit = true;
                        scene.remove(cube);
                        updateScore();
                    }
                }
            }
        }
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
        const swipe = activeSwipes.get(touch.identifier);
        if (swipe) {
            const dx = swipe.x - swipe.startX;
            const dy = swipe.y - swipe.startY;
            let swipeDirection = '';
            if (Math.abs(dx) > Math.abs(dy)) {
                swipeDirection = dx > 0 ? 'right' : 'left';
            } else {
                swipeDirection = dy > 0 ? 'down' : 'up';
            }

            const touchX = (swipe.x / window.innerWidth) * 2 - 1;
            const touchY = -(swipe.y / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera({ x: touchX, y: touchY }, camera);
            const intersects = raycaster.intersectObjects(cubes);

            for (const intersect of intersects) {
                const cube = intersect.object;
                if (cube.userData.inZone && !cube.userData.hit && cube.userData.direction === swipeDirection) {
                    score++;
                    cube.userData.hit = true;
                    scene.remove(cube);
                }
            }
            updateScore();
            if (swipe.trail) scene.remove(swipe.trail);
            activeSwipes.delete(touch.identifier);
        }
    }
}

// Mouse events
renderer.domElement.addEventListener('mousedown', handleMouseDown, { passive: false });
renderer.domElement.addEventListener('mousemove', handleMouseMove, { passive: false });
renderer.domElement.addEventListener('mouseup', handleMouseUp, { passive: false });
renderer.domElement.addEventListener('mouseleave', handleMouseUp, { passive: false });

// Touch events
renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: false });
renderer.domElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });


function animate() {
    requestAnimationFrame(animate);

    // Update and draw swipe trails
    activeSwipes.forEach(swipe => {
        if (swipe.trail) scene.remove(swipe.trail);
        
        const touchX = (swipe.x / window.innerWidth) * 2 - 1;
        const touchY = -(swipe.y / window.innerHeight) * 2 + 1;
        
        // Create a ray from camera through the touch point
        raycaster.setFromCamera({ x: touchX, y: touchY }, camera);
        
        // Project the point into 3D space at a fixed distance from camera
        const direction = raycaster.ray.direction.clone();
        const point = camera.position.clone().add(direction.multiplyScalar(4));
        
        swipe.trailPoints.push(point);
        if (swipe.trailPoints.length > 30) swipe.trailPoints.shift();
        
        if (swipe.trailPoints.length > 1) {
            const trailGeometry = new THREE.BufferGeometry().setFromPoints(swipe.trailPoints);
            const trailMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffff00,  // Yellow color
                linewidth: 5
            });
            swipe.trail = new THREE.Line(trailGeometry, trailMaterial);
            swipe.trail.renderOrder = 999;  // Render on top
            scene.add(swipe.trail);
        }
    });


    for (let i = cubes.length - 1; i >= 0; i--) {
        const cube = cubes[i];
        cube.position.z += CUBE_SPEED;

        if (cube.userData.hit) continue;

        const isInZone = cube.position.z > INTERACTION_ZONE_START && cube.position.z < INTERACTION_ZONE_END;
        if (isInZone && !cube.userData.inZone) {
            cube.userData.inZone = true;
            for (let j = 0; j < 6; j++) {
                if (j !== 4) cube.material[j].color.set(GREEN);
            }
            cube.material[4].map = arrowTextures[cube.userData.direction]['green'];
            cube.material[4].needsUpdate = true;
        }

        if (cube.position.z > INTERACTION_ZONE_END + 1) {
            if (!cube.userData.hit) {
                score--;
                updateScore();
            }
            scene.remove(cube);
            cubes.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

updateScore();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);