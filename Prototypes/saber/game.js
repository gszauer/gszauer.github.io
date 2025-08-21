let scene, camera, renderer, player;
let groundSegments = [];
let leftTarget, rightTarget;
let activeTouches = {};
const scrollSpeed = 0.2;
const segmentLength = 40;
const numSegments = 2;

// Cube management
let cubes = [];
const cubeSpeed = 0.15;
const gridWidth = 3;
const gridHeight = 3;
const gridSpacing = 1.2;
const spawnDistance = -30;
const despawnDistance = 5;
const minSpawnInterval = 1000;
const maxSpawnInterval = 2000;
let lastSpawnTime = 0;
let nextSpawnTime = 0;

// Saber references for collision detection
let leftSaberBlade, rightSaberBlade;

// Score tracking
let score = 0;
let scoreElement;

function createHumanoid() {
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const skinMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa88 });
    
    const root = new THREE.Group();
    
    const torsoGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 1.5;
    root.add(torso);
    
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 0.9, 0);
    torso.add(head);
    
    const upperArmGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const lowerArmGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.12);
    const handGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.1);
    
    const leftShoulderPivot = new THREE.Group();
    leftShoulderPivot.position.set(0.5, 0.5, 0);
    torso.add(leftShoulderPivot);
    
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, bodyMaterial);
    leftUpperArm.position.set(0, -0.25, 0);
    leftShoulderPivot.add(leftUpperArm);
    
    const leftElbowPivot = new THREE.Group();
    leftElbowPivot.position.set(0, -0.25, 0);
    leftUpperArm.add(leftElbowPivot);
    
    const leftLowerArm = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    leftLowerArm.position.set(0, -0.25, 0);
    leftElbowPivot.add(leftLowerArm);
    
    const leftWristPivot = new THREE.Group();
    leftWristPivot.position.set(0, -0.25, 0);
    leftLowerArm.add(leftWristPivot);
    
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(0, -0.075, 0);
    leftWristPivot.add(leftHand);
    
    // Left lightsaber
    const leftSaberHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x444444 })
    );
    leftSaberHandle.rotation.x = Math.PI * 0.35; // About 63 degree backward tilt (pointing forward)
    leftSaberHandle.position.set(0, -0.08, -0.05);
    leftHand.add(leftSaberHandle);
    
    leftSaberBlade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00 })
    );
    leftSaberBlade.position.set(0, -0.7, 0);
    leftSaberHandle.add(leftSaberBlade);
    
    const rightShoulderPivot = new THREE.Group();
    rightShoulderPivot.position.set(-0.5, 0.5, 0);
    torso.add(rightShoulderPivot);
    
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, bodyMaterial);
    rightUpperArm.position.set(0, -0.25, 0);
    rightShoulderPivot.add(rightUpperArm);
    
    const rightElbowPivot = new THREE.Group();
    rightElbowPivot.position.set(0, -0.25, 0);
    rightUpperArm.add(rightElbowPivot);
    
    const rightLowerArm = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    rightLowerArm.position.set(0, -0.25, 0);
    rightElbowPivot.add(rightLowerArm);
    
    const rightWristPivot = new THREE.Group();
    rightWristPivot.position.set(0, -0.25, 0);
    rightLowerArm.add(rightWristPivot);
    
    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0, -0.075, 0);
    rightWristPivot.add(rightHand);
    
    // Right lightsaber
    const rightSaberHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x444444 })
    );
    rightSaberHandle.rotation.x = Math.PI * 0.35; // About 63 degree backward tilt (pointing forward)
    rightSaberHandle.position.set(0, -0.08, -0.05);
    rightHand.add(rightSaberHandle);
    
    rightSaberBlade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 1.2),
        new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000 })
    );
    rightSaberBlade.position.set(0, -0.7, 0);
    rightSaberHandle.add(rightSaberBlade);
    
    const pelvisGeometry = new THREE.BoxGeometry(0.7, 0.2, 0.3);
    const pelvis = new THREE.Mesh(pelvisGeometry, bodyMaterial);
    pelvis.position.set(0, -0.7, 0);
    torso.add(pelvis);
    
    const upperLegGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const lowerLegGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const footGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.3);
    
    const leftHipPivot = new THREE.Group();
    leftHipPivot.position.set(0.2, -0.1, 0);
    pelvis.add(leftHipPivot);
    
    const leftUpperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
    leftUpperLeg.position.set(0, -0.3, 0);
    leftHipPivot.add(leftUpperLeg);
    
    const leftKneePivot = new THREE.Group();
    leftKneePivot.position.set(0, -0.3, 0);
    leftUpperLeg.add(leftKneePivot);
    
    const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
    leftLowerLeg.position.set(0, -0.3, 0);
    leftKneePivot.add(leftLowerLeg);
    
    const leftAnklePivot = new THREE.Group();
    leftAnklePivot.position.set(0, -0.3, 0);
    leftLowerLeg.add(leftAnklePivot);
    
    const leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
    leftFoot.position.set(0, -0.05, 0.05);
    leftAnklePivot.add(leftFoot);
    
    const rightHipPivot = new THREE.Group();
    rightHipPivot.position.set(-0.2, -0.1, 0);
    pelvis.add(rightHipPivot);
    
    const rightUpperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
    rightUpperLeg.position.set(0, -0.3, 0);
    rightHipPivot.add(rightUpperLeg);
    
    const rightKneePivot = new THREE.Group();
    rightKneePivot.position.set(0, -0.3, 0);
    rightUpperLeg.add(rightKneePivot);
    
    const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
    rightLowerLeg.position.set(0, -0.3, 0);
    rightKneePivot.add(rightLowerLeg);
    
    const rightAnklePivot = new THREE.Group();
    rightAnklePivot.position.set(0, -0.3, 0);
    rightLowerLeg.add(rightAnklePivot);
    
    const rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
    rightFoot.position.set(0, -0.05, 0.05);
    rightAnklePivot.add(rightFoot);
    
    root.leftShoulderPivot = leftShoulderPivot;
    root.leftElbowPivot = leftElbowPivot;
    root.leftWristPivot = leftWristPivot;
    root.leftHand = leftHand;
    root.rightShoulderPivot = rightShoulderPivot;
    root.rightElbowPivot = rightElbowPivot;
    root.rightWristPivot = rightWristPivot;
    root.rightHand = rightHand;
    root.leftSaberBlade = leftSaberBlade;
    root.rightSaberBlade = rightSaberBlade;
    
    return root;
}

function createCube(gridX, gridY, isRed) {
    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const color = isRed ? 0xff0000 : 0x00ff00;
    const material = new THREE.MeshBasicMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.3
    });
    const cube = new THREE.Mesh(geometry, material);
    
    // Calculate position based on grid coordinates
    const xOffset = (gridX - 1) * gridSpacing;
    const yOffset = (gridY - 1) * gridSpacing + 2;
    
    cube.position.set(xOffset, yOffset, spawnDistance);
    cube.userData = {
        isRed: isRed,
        gridX: gridX,
        gridY: gridY,
        destroyed: false
    };
    
    return cube;
}

function spawnCubePattern() {
    const currentTime = Date.now();
    
    if (currentTime < nextSpawnTime) {
        return;
    }
    
    // Check if we have less than 7 cubes
    if (cubes.length >= 7) {
        // Schedule a check for later
        nextSpawnTime = currentTime + 500;
        return;
    }
    
    // Calculate how many cubes we can spawn (up to 7 total)
    const maxCanSpawn = 7 - cubes.length;
    const desiredSpawn = Math.floor(Math.random() * 4) + 1;
    const numCubesToSpawn = Math.min(desiredSpawn, maxCanSpawn);
    
    if (numCubesToSpawn <= 0) {
        nextSpawnTime = currentTime + 500;
        return;
    }
    
    const positions = [];
    
    // Generate random unique positions
    while (positions.length < numCubesToSpawn) {
        const gridX = Math.floor(Math.random() * gridWidth);
        const gridY = Math.floor(Math.random() * gridHeight);
        const posKey = `${gridX},${gridY}`;
        
        if (!positions.some(p => p.key === posKey)) {
            positions.push({ x: gridX, y: gridY, key: posKey });
        }
    }
    
    // Create cubes at those positions
    positions.forEach(pos => {
        const isRed = Math.random() < 0.5;
        const cube = createCube(pos.x, pos.y, isRed);
        scene.add(cube);
        cubes.push(cube);
    });
    
    // Schedule next spawn
    lastSpawnTime = currentTime;
    nextSpawnTime = currentTime + minSpawnInterval + Math.random() * (maxSpawnInterval - minSpawnInterval);
}

function updateCubes() {
    // Move cubes towards player and check for despawn
    for (let i = cubes.length - 1; i >= 0; i--) {
        const cube = cubes[i];
        
        if (cube.userData.destroyed) {
            continue;
        }
        
        cube.position.z += cubeSpeed;
        
        // Remove cubes that have passed the player
        if (cube.position.z > despawnDistance) {
            scene.remove(cube);
            cubes.splice(i, 1);
        }
    }
}

function updateScore(points) {
    score += points;
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

function checkSaberCollisions() {
    if (!leftSaberBlade || !rightSaberBlade) return;
    
    // Get world positions and bounding boxes for sabers
    const leftSaberWorld = new THREE.Vector3();
    leftSaberBlade.getWorldPosition(leftSaberWorld);
    
    const rightSaberWorld = new THREE.Vector3();
    rightSaberBlade.getWorldPosition(rightSaberWorld);
    
    // Check each cube for collision
    for (let i = cubes.length - 1; i >= 0; i--) {
        const cube = cubes[i];
        
        if (cube.userData.destroyed) {
            continue;
        }
        
        const cubePos = cube.position;
        
        // Only check green cubes for scoring
        if (!cube.userData.isRed) {
            // Check collision with either saber for green cubes
            const leftDist = leftSaberWorld.distanceTo(cubePos);
            const rightDist = rightSaberWorld.distanceTo(cubePos);
            
            if (leftDist < 0.8 || rightDist < 0.8) {
                // Destroy green cube and increase score
                cube.userData.destroyed = true;
                scene.remove(cube);
                cubes.splice(i, 1);
                updateScore(1);
            }
        }
    }
}

function init() {
    scene = new THREE.Scene();
    
    // Get score element
    scoreElement = document.getElementById('score');
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3.5, 3);
    camera.lookAt(0, 2, 0);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0.5, 0.6, 0.7), 1.0);
    document.body.appendChild(renderer.domElement);
    
    player = createHumanoid();
    player.position.set(0, 0, 0);
    scene.add(player);
    
    const targetGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const leftTargetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const rightTargetMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    leftTarget = new THREE.Mesh(targetGeometry, leftTargetMaterial);
    leftTarget.position.set(-1.5, 2, -0.5);
    scene.add(leftTarget);
    
    rightTarget = new THREE.Mesh(targetGeometry, rightTargetMaterial);
    rightTarget.position.set(1.5, 2, -0.5);
    scene.add(rightTarget);
    
    const groundGeometry = new THREE.PlaneGeometry(5, segmentLength);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    
    for (let i = 0; i < numSegments; i++) {
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.7, -20 - (i * segmentLength));
        scene.add(ground);
        groundSegments.push(ground);
    }
    
    window.addEventListener('resize', onWindowResize, false);
    
    renderer.domElement.addEventListener('touchstart', onTouchStart, false);
    renderer.domElement.addEventListener('touchmove', onTouchMove, false);
    renderer.domElement.addEventListener('touchend', onTouchEnd, false);
    
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onTouchStart(event) {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        const isLeft = touch.clientX < window.innerWidth / 2;
        
        // Check if we already have a touch controlling this sphere
        let alreadyControlled = false;
        for (let id in activeTouches) {
            if (activeTouches[id].isLeft === isLeft && id !== 'mouse') {
                alreadyControlled = true;
                break;
            }
        }
        
        // Only add this touch if the sphere isn't already being controlled
        if (!alreadyControlled) {
            const target = isLeft ? leftTarget : rightTarget;
            activeTouches[touch.identifier] = {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                initialTargetX: target.position.x,
                initialTargetY: target.position.y,
                isLeft: isLeft,
                target: target
            };
        }
    }
}

function onTouchMove(event) {
    event.preventDefault();
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if (activeTouches[touch.identifier]) {
            activeTouches[touch.identifier].currentX = touch.clientX;
            activeTouches[touch.identifier].currentY = touch.clientY;
            const deltaX = touch.clientX - activeTouches[touch.identifier].startX;
            const deltaY = activeTouches[touch.identifier].startY - touch.clientY;
            const target = activeTouches[touch.identifier].target;
            target.position.x = Math.max(-2.5, Math.min(2.5, activeTouches[touch.identifier].initialTargetX + deltaX * 0.01));
            target.position.y = Math.max(0.5, Math.min(4, activeTouches[touch.identifier].initialTargetY + deltaY * 0.01));
        }
    }
}

function onTouchEnd(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        delete activeTouches[touch.identifier];
    }
}

function onMouseDown(event) {
    const isLeft = event.clientX < window.innerWidth / 2;
    
    // Check if we already have a touch controlling this sphere
    let alreadyControlled = false;
    for (let id in activeTouches) {
        if (activeTouches[id].isLeft === isLeft) {
            alreadyControlled = true;
            break;
        }
    }
    
    // Only add mouse control if the sphere isn't already being controlled
    if (!alreadyControlled) {
        const target = isLeft ? leftTarget : rightTarget;
        activeTouches['mouse'] = {
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            initialTargetX: target.position.x,
            initialTargetY: target.position.y,
            isLeft: isLeft,
            target: target
        };
    }
}

function onMouseMove(event) {
    if (activeTouches['mouse']) {
        activeTouches['mouse'].currentX = event.clientX;
        activeTouches['mouse'].currentY = event.clientY;
        const deltaX = event.clientX - activeTouches['mouse'].startX;
        const deltaY = activeTouches['mouse'].startY - event.clientY;
        const target = activeTouches['mouse'].target;
        target.position.x = Math.max(-2.5, Math.min(2.5, activeTouches['mouse'].initialTargetX + deltaX * 0.01));
        target.position.y = Math.max(0.5, Math.min(4, activeTouches['mouse'].initialTargetY + deltaY * 0.01));
    }
}

function onMouseUp(event) {
    delete activeTouches['mouse'];
}

function solveCCDIK(joints, target, iterations = 10, isLeftArm = true) {
    for (let iteration = 0; iteration < iterations; iteration++) {
        for (let i = joints.length - 1; i >= 0; i--) {
            const joint = joints[i];
            
            // Get world position of the end effector
            const endEffector = joints[joints.length - 1];
            const endEffectorWorld = new THREE.Vector3();
            endEffector.getWorldPosition(endEffectorWorld);
            
            // Get world position of current joint
            const jointWorld = new THREE.Vector3();
            joint.getWorldPosition(jointWorld);
            
            // Get world position of target
            const targetWorld = new THREE.Vector3();
            target.getWorldPosition(targetWorld);
            
            // Calculate vectors from joint to end effector and joint to target
            const toEnd = new THREE.Vector3().subVectors(endEffectorWorld, jointWorld);
            const toTarget = new THREE.Vector3().subVectors(targetWorld, jointWorld);
            
            // Skip if vectors are too small
            if (toEnd.length() < 0.01 || toTarget.length() < 0.01) continue;
            
            toEnd.normalize();
            toTarget.normalize();
            
            // Calculate rotation axis and angle
            const axis = new THREE.Vector3().crossVectors(toEnd, toTarget);
            const angle = Math.acos(Math.max(-1, Math.min(1, toEnd.dot(toTarget))));
            
            // Apply rotation in world space
            if (axis.length() > 0.001 && Math.abs(angle) > 0.001) {
                axis.normalize();
                
                // Convert world rotation to local rotation
                const worldQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
                const jointWorldQuaternion = new THREE.Quaternion();
                joint.getWorldQuaternion(jointWorldQuaternion);
                
                const newWorldQuaternion = new THREE.Quaternion().multiplyQuaternions(worldQuaternion, jointWorldQuaternion);
                
                // Get parent world quaternion
                const parentWorldQuaternion = new THREE.Quaternion();
                if (joint.parent) {
                    joint.parent.getWorldQuaternion(parentWorldQuaternion);
                }
                
                // Calculate local quaternion
                const localQuaternion = new THREE.Quaternion().multiplyQuaternions(
                    parentWorldQuaternion.invert(),
                    newWorldQuaternion
                );
                
                joint.quaternion.copy(localQuaternion);
            }
        }
        
        // Check if we're close enough
        const endEffector = joints[joints.length - 1];
        const endEffectorWorld = new THREE.Vector3();
        endEffector.getWorldPosition(endEffectorWorld);
        const targetWorld = new THREE.Vector3();
        target.getWorldPosition(targetWorld);
        
        if (endEffectorWorld.distanceTo(targetWorld) < 0.1) {
            break;
        }
    }
}

function updateIK() {
    // Left arm reaches for right target (green)
    solveCCDIK([player.leftShoulderPivot, player.leftElbowPivot, player.leftWristPivot], rightTarget, 10, true);
    
    // Right arm reaches for left target (red)
    solveCCDIK([player.rightShoulderPivot, player.rightElbowPivot, player.rightWristPivot], leftTarget, 10, false);
}

function updateGround() {
    groundSegments.forEach(segment => {
        segment.position.z += scrollSpeed;
        
        if (segment.position.z > 20) {
            const furthestSegment = groundSegments.reduce((prev, current) => 
                (prev.position.z < current.position.z) ? prev : current
            );
            segment.position.z = furthestSegment.position.z - segmentLength;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    updateGround();
    updateIK();
    spawnCubePattern();
    updateCubes();
    checkSaberCollisions();
    
    renderer.render(scene, camera);
}

init();
animate();