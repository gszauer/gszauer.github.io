var gWalkingClip = null;
var gSkinnedWalkingDemo = null;

function loop() {
    if (gSkinnedWalkingDemo != null) {
        gSkinnedWalkingDemo.Loop();
    }
}

function main() {
    let canvas = document.getElementById("skinnedWalkingCanvas");
    if (canvas === null) {
        console.error("Unable to find Skinned Walking Canvas");
        gSkinnedWalkingDemo = null;
    }
    else {
        let gl = canvas.getContext("webgl");
        if (gl === null) {
            console.error("Unable to get OpenGL context for Skinned Walking Canvas");
            gSkinnedWalkingDemo = null;
        }
        else {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gSkinnedWalkingDemo = new FullPageAnimated(gl, canvas);
        }
    }

    window.setInterval(loop, 16);
}