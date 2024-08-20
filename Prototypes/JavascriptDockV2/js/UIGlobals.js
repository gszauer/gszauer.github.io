function V4UUID() {
    const guid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
    return guid;
};

function AsNumber(v) {
    if(!(Number.isFinite(v))){
        return 0;
    }
    return v;
}

function IsString(v) {
    return (typeof v === 'string' || v instanceof String);
}

function ClampNumber(v, min, max) {
    if (v < min) { v = min; }
    if (v > max) { v = max; }
    return v;
}

function UpdateCSSRules(selector, property, value) {
    const cssRules = (document.all) ? 'rules' : 'cssRules';
    const allowRun = selector !== null && selector !== undefined;
    const allowUpdate = property !== null && property !== undefined && 
                     value !== null && value !== undefined;

    for (let j = 0, count = document.styleSheets.length; j < count; ++j) {
        const rules = document.styleSheets[j][cssRules];
        for (let i = 0, len = rules.length; i<len; i++) {
            if (allowRun) {
                if (allowUpdate && rules[i].selectorText === selector) {
                    rules[i].style[property] = value;
                }
                /*if (rules[i].selectorText === selector) {
                    console.log("Contains: " + rules[i].selectorText);
                }*/
            }
            //console.log("Selector: " + rules[i].selectorText);
        }
    }
}