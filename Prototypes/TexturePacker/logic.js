"use strict";

const GlobalLoadedAtlasSets = [];

// https://stackoverflow.com/questions/22087076/how-to-make-a-simple-image-upload-using-javascript-html
function LoadImages(event) {
    event.preventDefault();

    const fileInput = document.getElementById("file-upload");
    const fileList = document.getElementById("file-list");
    const filePreview = document.getElementById("file-preview");

    const result = {
        requested: 0,
        served: 0,
        images: []
    };

    // Check if any files are selected
    const selectedFiles = fileInput.files;
    result.requested = selectedFiles.length;
    if (selectedFiles.length === 0) {
        alert("Please select at least one file to upload.");
        return;
    }

    for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();

        reader.onload = function(){
            /*let output = document.getElementById('output_image');
            output.src = reader.result;*/

            const img = new Image();
            img.onload = function() {
                fileList.innerHTML = fileList.innerHTML +  "<div>" + selectedFiles[i].name + "</div>";
                //filePreview.appendChild(img);

                result.images.push({
                    width: this.width,
                    height: this.height,
                    name: selectedFiles[i].name,
                    image: img
                });
                result.served += 1;
            }

            img.src =  reader.result;
        }

        reader.readAsDataURL(selectedFiles[i]);
    }

    GlobalLoadedAtlasSets.push(result);
    return result;
}

function HexToRGBA(hex, a){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + a +')';
    }
    throw new Error('Bad Hex');
}

function BuildAtlas(event) {
    event.preventDefault();

    const width = Number(document.getElementById('canvas-width').value);
    const height = Number(document.getElementById('canvas-height').value);
    const padding = Number(document.getElementById('canvas-padding').value);
    const background = document.getElementById('canvas-background').value;
    const alpha = Number(document.getElementById('canvas-alpha').value);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");
    canvas.id = "atlas-canvas";
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas background
    context.beginPath();
    context.rect(0, 0, width, height);
    context.fillStyle = HexToRGBA(background, alpha) ;//background;//"#FF0000";
    context.fill();
    context.closePath();

    // Prepare rects to be packed
    let packTargets = [];
    for (let i = 0, i_len = GlobalLoadedAtlasSets.length; i < i_len; ++i) {
        const atlasSet = GlobalLoadedAtlasSets[i];
        if (atlasSet.requested == 0) {
            continue;
        }
        if (atlasSet.requested !== atlasSet.served) {
            console.error('atlases not done loading. Abandoning set');
            alert('atlases not done loading. Abandoning set');
            continue;
        }

        for (let j = 0, j_len = atlasSet.images.length; j < j_len; ++j) {
            const image = atlasSet.images[j];

            image.w = image.width + padding * 2;
            image.h = image.height + padding * 2;
            packTargets.push(image);
        }
    }

    // Pack rects
    let packer = new Packer(width, height);
    packTargets.sort(function(a,b) { return (a.h < b.h); }); // sort inputs for best results
    packer.fit(packTargets);

    for(let n = 0, n_len = packTargets.length ; n < n_len; ++n) {
        let block = packTargets[n];
        if (block.fit) {
            let drawX = Number(block.fit.x) + padding;
            let drawY = Number(block.fit.y) + padding;
            context.drawImage(block.image, drawX, drawY);
            console.log(block.name + ', x: ' + drawX + ', y: ' + drawY + ', w: ' + block.width + ', h' + block.height);
        }
        else {
            alert('sprite ' + block.name + ' did not fit');
            console.error('sprite ' + block.name + ' did not fit');
        }
    }

    const filePreview = document.getElementById('file-preview');
    filePreview.innerHTML = "";
    filePreview.appendChild(canvas);

    return {
        targets: packTargets,
        canvas: canvas
    };
}

function ExportProject(event) {
    const atlas = BuildAtlas(event);
    const canvas = atlas.canvas;
    const targets = atlas.targets;
    const image = canvas.toDataURL();
    const padding = Number(document.getElementById('canvas-padding').value);

    const fileName = document.getElementById('canvas-name').value || "Export";
    if (fileName == null || fileName.length == 0) {
        fileName == "Export";
    }

    let link = document.createElement('a');
    link.download = fileName + '.png';
    link.href = image;
    link.click();
    link.remove();

    let exportJson = '{"frames": [';
    for(let n = 0, n_len = targets.length ; n < n_len; ++n) {
        const target = targets[n];
        if (target.fit) {
            const x = Number(target.fit.x) + padding;
            const y = Number(target.fit.y) + padding;
            const w = Number(target.width);
            const h = Number(target.height);

            // Guessing format from https://github.com/phaserjs/examples/blob/master/public/assets/atlas/megaset-0.json
            exportJson += '{ "filename": "' + target.name + '", ';
            exportJson += '"frame": {"x":' + x + ',"y":' + y + ',"w":' + w + ',"h":' + h + '}, ';
            exportJson += '"spriteSourceSize": {"x":0,"y":0,"w":' + w + ',"h":' + h + '},';
            exportJson += '"sourceSize": {"w":' + w + ',"h":' + h + '},';
            exportJson += '"pivot": {"x":0.5,"y":0.5} }';

            if (n + 1 < n_len) {
                exportJson += ", ";
            }
        }
    }
   
    exportJson += ']}';

    link = document.createElement('a');
    link.download = fileName + '.json';
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportJson);
    link.click();
    link.remove();
}