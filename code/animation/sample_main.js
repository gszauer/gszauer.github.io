var gWalkingClip = null;
var gSkeletonWalkingDemo = null;


function loop() {
    if (gSkeletonWalkingDemo != null) {
        gSkeletonWalkingDemo.Loop();
    }
}

function main() {
    let canvas = document.getElementById("skeletonWalkingCanvas");
    if (canvas === null) {
        console.error("Unable to find Skeleton Walking Canvas");
        gSkeletonWalkingDemo = null;
    }
    else {
        let gl = canvas.getContext("webgl");
        if (gl === null) {
            console.error("Unable to get OpenGL context for Skeleton Walking Canvas");
            gSkeletonWalkingDemo = null;
        }
        else {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gSkeletonWalkingDemo = new SkeletonAnimated(gl, canvas);
        }
    }

    window.setInterval(loop, 16);
}

window.onload = main;