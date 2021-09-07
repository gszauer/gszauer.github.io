/* 
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
        IMGUI
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
*/

function IM_Init(canvas2D, context2D, draw_function) {
    canvas2D.addEventListener('mousemove',  IM_MouseMove);
    canvas2D.addEventListener('mousedown',  IM_MouseDown);
    canvas2D.addEventListener('mouseup',    IM_MouseUp);
    canvas2D.addEventListener('mouseleave', IM_MouseLeave);
    canvas2D.addEventListener('mouseenter', IM_MouseEnter);

    context2D.font = '24px serif';
    const height  = IM_FindTextHeight(context2D, 0, 0, 50, 50);

    canvas2D.imgui = {
        canvas: canvas2D,
        surface: context2D,

        mouseX: -1,
        mouseY: -1,
        mouseLeft: false,
        mouseWasDownWhenLeft: false,

        mouseDown: 0,

        hotItem: 0,
        activeItem: 0,
        idGen: 0,

        lineHeight: height,
        draw_func: draw_function
    }
    context2D.imgui = canvas2D.imgui;

    return canvas2D.imgui;
}

function IM_BeginFrame(ctx) {
  ctx.idGen = 1;
}

function IM_FindTextHeight(ctx, left, top, width, height) {
  ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(left, top, left + width, top + height);
  ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillText('gM', left + 1, top + height / 2);
    //ctx.fillText('M', left + 1, top + height / 2);

    var data = ctx.getImageData(left, top, width, height).data;
    var first = 50;
    var last = 0;

    for (var r = 0; r < height; r++) {
        for(var c = 0; c < width; c++) {
          const index = r * width * 4 + c * 4 
          const test = data[index]
            if(test != 255) {
              if (r > last) {
                  last = r;
              }
              if (r < first) {
                  first = r;
              }
            }
        }
    }

    if (first > last) {
      console.log("Could not find line height");
      return 0;
    }

   return last - first;
}

function IM_MouseInRegion(im, x, y, w, h) {
    return (
        im.mouseX >= x &&
        im.mouseY >= y &&
        im.mouseX <= x + w &&
        im.mouseY <= y + h
    )
}

function IM_PreMouseEvent(evt) {
    var im = evt.currentTarget.imgui;
    const w = im.canvas.width
    const h = im.canvas.height

    const rect = im.canvas.getBoundingClientRect();

    im.mouseX = (evt.clientX - rect.left) / ((rect.right - rect.left) / w)
    im.mouseY = (evt.clientY - rect.top) / ((rect.bottom - rect.top) / h)

    im.hotItem = 0;

    return im;
}

function IM_PostMouseEvent(im) {
    if (!im.mouseDown) {
        im.activeItem = 0
    }
    else {
        if (im.activeItem == 0) {
            im.activeItem = -1
        }
    }
}

function IM_MouseMove(evt) {
    var im = IM_PreMouseEvent(evt);

    im.draw_func(im);

    IM_PostMouseEvent(im);
}

function IM_MouseDown(evt) {
    var im = IM_PreMouseEvent(evt);
    im.mouseDown = true

    im.draw_func(im);

    IM_PostMouseEvent(im);
}

function IM_MouseUp(evt) {
    var im = IM_PreMouseEvent(evt);
    im.mouseDown = false
    im.draw_func(im);
    IM_PostMouseEvent(im);
    im.draw_func(im);
}

function IM_MouseLeave(evt) {
    var im = IM_PreMouseEvent(evt);

    im.mouseLeft = true;
    im.mouseWasDownWhenLeft = evt.buttons == 1
}

function IM_MouseEnter(evt) {
    var im = IM_PreMouseEvent(evt);

  var mouseIsDown = evt.buttons == 1

  if (mouseIsDown) {
    if (im.mouseLeft && im.mouseWasDownWhenLeft) {
      // Cool, we're int he right state, do nothing
    }
    else {
      im.hotItem = 0
      im.activeItem = -1
      IM_MouseUp(evt);
    }
  }
  else {
    im.hotItem = 0
    im.activeItem = -1
      im.mouseDown = false

    IM_MouseUp(evt);
  }

  im.mouseLeft = false;
    im.mouseWasDownWhenLeft = false;
}


function IM_Rect(context, color, rect) {
    if (typeof color == "undefined" || color == null) {
        color = {r:0,g:0,b:0}
    }
    else if (Array.isArray(color)) {
        color = {r:color[0],g:color[1],b:color[2]}
    }

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 50; h = 50;
    }
    else if (Array.isArray(rect)) {
        x = rect[0]; y = rect[1]; w = rect[2]; h = rect[3]
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    color.r = Math.round(color.r * 255);
    color.g = Math.round(color.g * 255);
    color.b = Math.round(color.b * 255);

    if (color.r > 255) { color.r = 255 }
    if (color.g > 255) { color.g = 255 }
    if (color.b > 255) { color.b = 255 }

    if (color.r < 0) { color.r = 0 }
    if (color.g < 0) { color.g = 0 }
    if (color.b < 0) { color.b = 0 }

    context.surface.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    context.surface.fillRect(x, y, w, h);
}

function IM_Label(context, val, color, point) {
    var x = 0; var y = 0;
    if (typeof point == "undefined" || point == null) {
        x = 0; y = 0;
    }
    else if (Array.isArray(point)) {
        x = point[0]; y = point[1]; 
    }
    else {
        x = point.x; y = point.y;
    }

    if (typeof color == "undefined" || color == null) {
        color = {r:0,g:0,b:0}
    }
    else if (Array.isArray(color)) {
        color = {r:color[0],g:color[1],b:color[2]}
    }

    color.r = Math.round(color.r * 255);
    color.g = Math.round(color.g * 255);
    color.b = Math.round(color.b * 255);

    if (color.r > 255) { color.r = 255 }
    if (color.g > 255) { color.g = 255 }
    if (color.b > 255) { color.b = 255 }

    if (color.r < 0) { color.r = 0 }
    if (color.g < 0) { color.g = 0 }
    if (color.b < 0) { color.b = 0 }

    context.surface.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    context.surface.fillText(val, x, y + context.lineHeight);
}

function IM_Button(context, text, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 50; h = 50;

        if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
      h = context.lineHeight + 10
    }
    }
    else if (Array.isArray(rect)) {
      x = rect[0]; y = rect[1];

      if (rect.length == 2) {
          if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
          h = context.lineHeight + 10
        }
        else {
          w = 50
          h = 50
        }
      }
      else {
        w = rect[2]; h = rect[3]
      }
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

    var rectColor = [0.5, 0.5, 0.5]
    var textColor = [0.3, 0.3, 0.3]

    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
        }
    }
    //else { // button is not hot, but it may be active    

    IM_Rect(context, [.2, .2, .2], [x, y, w, h]);

    x += 2; y += 2; w -= 4; h -= 4;
    IM_Rect(context, rectColor, [x, y, w, h]);

    if (typeof text != "undefined" && text != null) {
      x += 2; y += 1
    IM_Label(context, text, textColor, [x, y])
    }

    if (!context.mouseDown && context.hotItem == id && context.activeItem == id) {
        return true;
    }
    return false;
}

function IM_Scrollbar(context, val, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 350; h = 30;
    }
    else if (Array.isArray(rect)) {
      if (rect.length == 2) {
        h = 30
        w = 350
      }
      else {
        w = rect[2]; 
        h = rect[3]
      }
        x = rect[0]; y = rect[1]; 
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

  const centerY = (y + h / 2)

  var rectColor = [0.5, 0.5, 0.5]
  var bgColor = [0.5, 0.5, 0.5]
    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
      bgColor = [0.6, 0.6, 0.6]
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
      bgColor = [0.6, 0.6, 0.6]
        }
    }

  if (context.activeItem == id) {
    var mouseX = context.mouseX;
    if (mouseX < x) { mouseX = x; }
    if (mouseX > x + w) { mouseX = x + w; }

    val = (mouseX - x - 6) / (w - 10)
  }

  if (val < 0) { val = 0 }
  if (val > 1) { val = 1 }

  IM_Rect(context, bgColor, [x, centerY - 3, w, 6])
  
  const xOffset = val * (w - 10)
  IM_Rect(context, [0.2, 0.2, 0.2], [x + xOffset, y, 10, h]);
  IM_Rect(context, rectColor, [x + xOffset + 2, y + 2, 6, h - 4]);

  return val;
}

function IM_Checkbox(context, val, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 30; h = 30;

        if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
      h = context.lineHeight + 10
    }
    }
    else if (Array.isArray(rect)) {
      x = rect[0]; y = rect[1];

      if (rect.length == 2) {
        w = 30
        h = 30
      }
      else {
        w = rect[2]; h = rect[3]
      }
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

    var rectColor = [0.5, 0.5, 0.5]
    var textColor = [0.3, 0.3, 0.3]
    var tickColor = [0,0,0]

    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
          tickColor = [0.2, 0.2, 0.2];
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
          tickColor = [0.2, 0.2, 0.2];
        }
    }
    //else { // button is not hot, but it may be active    

    IM_Rect(context, [.2, .2, .2], [x, y, w, h]);

    IM_Rect(context, rectColor, [x + 2, y + 2, w - 4, h - 4]);

    if (!context.mouseDown && context.hotItem == id && context.activeItem == id) {
        val = !val
    }

    if (val) {
      IM_Rect(context, tickColor, [x + 6, y + 6, w - 12, h - 12]);
    }

    return val;
}