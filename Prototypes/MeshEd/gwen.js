"use strict";
var Gwen = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    ActionBar: () => ActionBar,
    ActionBarButton: () => ActionBarButton,
    ActionBarSeparator: () => ActionBarSeparator,
    BAKED_ROW_500: () => BAKED_ROW_500,
    BAKED_ROW_508: () => BAKED_ROW_508,
    Base: () => Base,
    BaseScrollBar: () => BaseScrollBar,
    Button: () => Button,
    Canvas: () => Canvas,
    Center: () => Center,
    CheckBox: () => CheckBox,
    CheckBoxWithLabel: () => CheckBoxWithLabel,
    CollapsibleCategory: () => CollapsibleCategory,
    CollapsibleList: () => CollapsibleList,
    ColorDisplay: () => ColorDisplay,
    ColorLerpBox: () => ColorLerpBox,
    ColorPicker: () => ColorPicker,
    ColorSlider: () => ColorSlider,
    ComboBox: () => ComboBox,
    CrossSplitter: () => CrossSplitter,
    CursorType: () => CursorType,
    DARK_PALETTE: () => DARK_PALETTE,
    DOUBLE_CLICK_SPEED: () => DOUBLE_CLICK_SPEED,
    Dialogs: () => Dialogs_exports,
    DockBase: () => DockBase,
    DockedTabControl: () => DockedTabControl,
    Dragger: () => Dragger,
    DynamicSkin: () => DynamicSkin,
    FieldLabel: () => FieldLabel,
    FilePicker: () => FilePicker,
    FolderPicker: () => FolderPicker,
    FontAtlas: () => FontAtlas,
    GroupBox: () => GroupBox,
    HSVColorPicker: () => HSVColorPicker,
    Highlight: () => Highlight,
    HorizontalScrollBar: () => HorizontalScrollBar,
    HorizontalSlider: () => HorizontalSlider,
    ImagePanel: () => ImagePanel,
    KEY_REPEAT_DELAY: () => KEY_REPEAT_DELAY,
    KEY_REPEAT_RATE: () => KEY_REPEAT_RATE,
    Key: () => Key,
    LIGHT_PALETTE: () => LIGHT_PALETTE,
    Label: () => Label,
    LabelClickable: () => LabelClickable,
    LabeledRadioButton: () => LabeledRadioButton,
    ListBox: () => ListBox,
    ListBoxRow: () => ListBoxRow,
    MAX_MOUSE_BUTTONS: () => MAX_MOUSE_BUTTONS,
    Menu: () => Menu,
    MenuDivider: () => MenuDivider,
    MenuItem: () => MenuItem,
    MenuStrip: () => MenuStrip,
    Modal: () => Modal,
    NumericUpDown: () => NumericUpDown,
    PALETTE: () => PALETTE,
    PageControl: () => PageControl,
    PasswordTextBox: () => PasswordTextBox,
    Pos: () => Pos,
    Position: () => Position,
    ProgressBar: () => ProgressBar,
    Properties: () => Properties,
    PropertyBase: () => PropertyBase,
    PropertyCheckbox: () => PropertyCheckbox,
    PropertyColorSelector: () => PropertyColorSelector,
    PropertyComboBox: () => PropertyComboBox,
    PropertyFile: () => PropertyFile,
    PropertyFolder: () => PropertyFolder,
    PropertyNumeric: () => PropertyNumeric,
    PropertyRow: () => PropertyRow,
    PropertyText: () => PropertyText,
    PropertyTree: () => PropertyTree,
    PropertyTreeNode: () => PropertyTreeNode,
    REGIONS: () => REGIONS,
    RadioButton: () => RadioButton,
    RadioButtonController: () => RadioButtonController,
    Rectangle: () => Rectangle,
    Renderer: () => Renderer,
    ResizableControl: () => ResizableControl,
    Resizer: () => Resizer,
    RichLabel: () => RichLabel,
    ScrollBarBar: () => ScrollBarBar,
    ScrollBarButton: () => ScrollBarButton,
    ScrollControl: () => ScrollControl,
    Signal: () => Signal,
    Skin: () => Skin,
    Slider: () => Slider,
    SliderBar: () => SliderBar,
    SplitterBar: () => SplitterBar,
    SplitterHorizontal: () => SplitterHorizontal,
    SplitterVertical: () => SplitterVertical,
    StatusBar: () => StatusBar,
    TabButton: () => TabButton,
    TabControl: () => TabControl,
    TabStrip: () => TabStrip,
    TabTitleBar: () => TabTitleBar,
    Table: () => Table,
    TableRow: () => TableRow,
    Text: () => Text,
    TextBox: () => TextBox,
    TextBoxMultiline: () => TextBoxMultiline,
    TextBoxNumeric: () => TextBoxNumeric,
    Tile: () => Tile,
    ToolBarButton: () => ToolBarButton,
    ToolBarStrip: () => ToolBarStrip,
    TreeControl: () => TreeControl,
    TreeNode: () => TreeNode,
    VERSION: () => VERSION,
    VertexBatch: () => VertexBatch,
    VerticalScrollBar: () => VerticalScrollBar,
    VerticalSlider: () => VerticalSlider,
    WebGL2Renderer: () => WebGL2Renderer,
    WindowCloseButton: () => WindowCloseButton,
    WindowControl: () => WindowControl,
    WindowMaximizeButton: () => WindowMaximizeButton,
    WindowMinimizeButton: () => WindowMinimizeButton,
    addColor: () => addColor,
    addMargin: () => addMargin,
    addPoint: () => addPoint,
    addPointInPlace: () => addPointInPlace,
    addRect: () => addRect,
    attachInput: () => attachInput,
    bakedRow500: () => bakedRow500,
    bakedRow508: () => bakedRow508,
    cloneColor: () => cloneColor,
    cloneMargin: () => cloneMargin,
    clonePoint: () => clonePoint,
    cloneRect: () => cloneRect,
    color: () => color,
    colorEquals: () => colorEquals,
    dragAndDropPackage: () => dragAndDropPackage,
    eventInfo: () => eventInfo,
    font: () => font,
    hsv: () => hsv,
    hsvToColor: () => hsvToColor,
    lerpColor: () => lerpColor,
    margin: () => margin,
    openNativeFileDialog: () => openNativeFileDialog,
    placeBelow: () => placeBelow,
    point: () => point,
    rect: () => rect,
    rectBottom: () => rectBottom,
    rectEquals: () => rectEquals,
    rectLeft: () => rectLeft,
    rectRight: () => rectRight,
    rectSize: () => rectSize,
    rectTop: () => rectTop,
    rgbToHsv: () => rgbToHsv,
    scaleColor: () => scaleColor,
    setPoint: () => setPoint,
    subColor: () => subColor,
    subPoint: () => subPoint,
    subPointInPlace: () => subPointInPlace,
    texture: () => texture
  });

  // src/core/Structures.ts
  function point(x = 0, y = 0) {
    return { x, y };
  }
  function addPoint(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  function subPoint(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }
  function addPointInPlace(a, b) {
    a.x += b.x;
    a.y += b.y;
  }
  function subPointInPlace(a, b) {
    a.x -= b.x;
    a.y -= b.y;
  }
  function clonePoint(p) {
    return { x: p.x, y: p.y };
  }
  function setPoint(p, x, y) {
    p.x = x;
    p.y = y;
  }
  function margin(left = 0, top = 0, right = 0, bottom = 0) {
    return { top, bottom, left, right };
  }
  function addMargin(a, b) {
    return {
      top: a.top + b.top,
      bottom: a.bottom + b.bottom,
      left: a.left + b.left,
      right: a.right + b.right
    };
  }
  function cloneMargin(m) {
    return { top: m.top, bottom: m.bottom, left: m.left, right: m.right };
  }
  function rect(x = 0, y = 0, w = 0, h = 0) {
    return { x, y, w, h };
  }
  function addRect(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, w: a.w + b.w, h: a.h + b.h };
  }
  function cloneRect(r) {
    return { x: r.x, y: r.y, w: r.w, h: r.h };
  }
  function rectEquals(a, b) {
    return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
  }
  function rectLeft(r) {
    return r.x;
  }
  function rectRight(r) {
    return r.x + r.w;
  }
  function rectTop(r) {
    return r.y;
  }
  function rectBottom(r) {
    return r.y + r.h;
  }
  function rectSize(r) {
    return { x: r.w, y: r.h };
  }
  function hsv(h = 0, s = 0, v = 0) {
    return { h, s, v };
  }
  var clampChannel = (n) => Math.max(0, Math.min(255, Math.round(n)));
  function color(r = 255, g = 255, b = 255, a = 255) {
    return {
      r: clampChannel(r),
      g: clampChannel(g),
      b: clampChannel(b),
      a: clampChannel(a)
    };
  }
  function addColor(a, b) {
    return {
      r: clampChannel(a.r + b.r),
      g: clampChannel(a.g + b.g),
      b: clampChannel(a.b + b.b),
      a: clampChannel(a.a + b.a)
    };
  }
  function subColor(a, b) {
    return {
      r: clampChannel(a.r - b.r),
      g: clampChannel(a.g - b.g),
      b: clampChannel(a.b - b.b),
      a: clampChannel(a.a - b.a)
    };
  }
  function scaleColor(c, f) {
    return {
      r: clampChannel(c.r * f),
      g: clampChannel(c.g * f),
      b: clampChannel(c.b * f),
      a: clampChannel(c.a * f)
    };
  }
  function colorEquals(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }
  function cloneColor(c) {
    return { r: c.r, g: c.g, b: c.b, a: c.a };
  }
  var CursorType = {
    Normal: 0,
    Beam: 1,
    SizeNS: 2,
    SizeWE: 3,
    SizeNWSE: 4,
    SizeNESW: 5,
    SizeAll: 6,
    No: 7,
    Wait: 8,
    Finger: 9,
    Count: 10
  };
  function dragAndDropPackage() {
    return {
      name: "",
      userdata: null,
      draggable: false,
      drawcontrol: null,
      holdoffset: { x: 0, y: 0 }
    };
  }

  // src/core/Events.ts
  var Signal = class {
    constructor() {
      // A plain array is the smallest and fastest container for the tiny handler
      // counts typical in UI code. We guard mutation during emit via snapshotting,
      // not copy-on-write, so steady-state subscriptions stay allocation-free.
      this.handlers = [];
    }
    on(handler) {
      this.handlers.push(handler);
      let disposed = false;
      return () => {
        if (disposed) return;
        disposed = true;
        const i = this.handlers.indexOf(handler);
        if (i !== -1) this.handlers.splice(i, 1);
      };
    }
    remove(handler) {
      const i = this.handlers.indexOf(handler);
      if (i !== -1) this.handlers.splice(i, 1);
    }
    emit(arg) {
      if (this.handlers.length === 0) return;
      const snapshot = this.handlers.slice();
      for (let i = 0; i < snapshot.length; i++) {
        snapshot[i](arg);
      }
    }
    clear() {
      this.handlers.length = 0;
    }
    get size() {
      return this.handlers.length;
    }
  };
  function eventInfo() {
    return {
      controlCaller: null,
      control: null,
      data: null,
      string: "",
      point: { x: 0, y: 0 },
      integer: 0
    };
  }

  // src/core/Align.ts
  var Pos = {
    None: 0,
    Left: 1 << 1,
    // 2
    Right: 1 << 2,
    // 4
    Top: 1 << 3,
    // 8
    Bottom: 1 << 4,
    // 16
    CenterV: 1 << 5,
    // 32
    CenterH: 1 << 6,
    // 64
    Fill: 1 << 7,
    // 128
    Center: 1 << 5 | 1 << 6
    // 96
  };
  function placeBelow(ctrl, below, border = 0) {
    ctrl.setPos(ctrl.x, below.bottom + border);
  }

  // src/renderer/Texture.ts
  function texture(name = "") {
    return { name, data: null, failed: false, width: 0, height: 0 };
  }

  // src/renderer/Renderer.ts
  var Renderer = class {
    constructor() {
      this.m_drawColor = color(255, 255, 255, 255);
      this.m_renderOffset = point(0, 0);
      this.m_rectClipRegion = rect(0, 0, 0, 0);
      this.m_scale = 1;
    }
    // ---- Default primitive fallbacks (ported from BaseRender.cpp) ----
    drawLinedRect(r) {
      this.drawFilledRect(rect(r.x, r.y, r.w, 1));
      this.drawFilledRect(rect(r.x, r.y + r.h - 1, r.w, 1));
      this.drawFilledRect(rect(r.x, r.y, 1, r.h));
      this.drawFilledRect(rect(r.x + r.w - 1, r.y, 1, r.h));
    }
    drawPixel(x, y) {
      this.drawFilledRect(rect(x, y, 1, 1));
    }
    // Matches BaseRender.cpp:57-80. We mutate a local copy of `r` — the
    // caller's Rect is untouched even though GWEN takes the parameter by
    // value and mutates it in place.
    drawShavedCornerRect(r, bSlight = false) {
      const x = r.x;
      const y = r.y;
      const w = r.w - 1;
      const h = r.h - 1;
      if (bSlight) {
        this.drawFilledRect(rect(x + 1, y, w - 1, 1));
        this.drawFilledRect(rect(x + 1, y + h, w - 1, 1));
        this.drawFilledRect(rect(x, y + 1, 1, h - 1));
        this.drawFilledRect(rect(x + w, y + 1, 1, h - 1));
        return;
      }
      this.drawPixel(x + 1, y + 1);
      this.drawPixel(x + w - 1, y + 1);
      this.drawPixel(x + 1, y + h - 1);
      this.drawPixel(x + w - 1, y + h - 1);
      this.drawFilledRect(rect(x + 2, y, w - 3, 1));
      this.drawFilledRect(rect(x + 2, y + h, w - 3, 1));
      this.drawFilledRect(rect(x, y + 2, 1, h - 3));
      this.drawFilledRect(rect(x + w, y + 2, 1, h - 3));
    }
    drawMissingImage(r) {
      this.setDrawColor(color(255, 38, 0, 255));
      this.drawFilledRect(r);
    }
    // ---- Render-offset accessors ----
    setRenderOffset(p) {
      this.m_renderOffset = { x: p.x, y: p.y };
    }
    // Faithful to GWEN: the parameter is a Rect, and only (x, y) are used.
    addRenderOffset(r) {
      this.m_renderOffset.x += r.x;
      this.m_renderOffset.y += r.y;
    }
    getRenderOffset() {
      return { x: this.m_renderOffset.x, y: this.m_renderOffset.y };
    }
    // ---- Coordinate translation ----
    // Returns a [x, y] tuple rather than taking int& out-params as in C++.
    // Callers destructure the result.
    translate(x, y) {
      x += this.m_renderOffset.x;
      y += this.m_renderOffset.y;
      return [Math.ceil(x * this.m_scale), Math.ceil(y * this.m_scale)];
    }
    // Produces a new Rect — does not mutate `r`.
    translateRect(r) {
      const [x, y] = this.translate(r.x, r.y);
      return {
        x,
        y,
        w: Math.ceil(r.w * this.m_scale),
        h: Math.ceil(r.h * this.m_scale)
      };
    }
    // ---- Clipping ----
    setClipRegion(r) {
      this.m_rectClipRegion = cloneRect(r);
    }
    // Port of `Base::AddClipRegion` with its peculiar behaviour: the
    // incoming rect's (x, y) are *replaced* by the current render offset
    // before the intersection math runs. Work on a local copy so the
    // caller's Rect stays untouched.
    addClipRegion(r) {
      const out = {
        x: this.m_renderOffset.x,
        y: this.m_renderOffset.y,
        w: r.w,
        h: r.h
      };
      const clip = this.m_rectClipRegion;
      if (out.x < clip.x) {
        out.w -= clip.x - out.x;
        out.x = clip.x;
      }
      if (out.y < clip.y) {
        out.h -= clip.y - out.y;
        out.y = clip.y;
      }
      if (out.x + out.w > clip.x + clip.w) {
        out.w = clip.x + clip.w - out.x;
      }
      if (out.y + out.h > clip.y + clip.h) {
        out.h = clip.y + clip.h - out.y;
      }
      this.m_rectClipRegion = out;
    }
    clipRegionVisible() {
      return this.m_rectClipRegion.w > 0 && this.m_rectClipRegion.h > 0;
    }
    clipRegion() {
      return this.m_rectClipRegion;
    }
    // ---- Scale ----
    setScale(s) {
      this.m_scale = s;
    }
    getScale() {
      return this.m_scale;
    }
    // ---- Font surface ----
    //
    // The GWEN base class has fallback `RenderText` / `MeasureText` that
    // draw placeholder rectangles so a renderer missing font support still
    // produces *something* on screen. We throw instead: backends that mean
    // to render text must wire a real implementation (e.g. `FontAtlas`),
    // and a silent fallback would mask bugs.
    loadFont(_font) {
      throw new Error("Font renderer not initialized");
    }
    freeFont(_font) {
      throw new Error("Font renderer not initialized");
    }
    renderText(_font, _pos, _text) {
      throw new Error("Font renderer not initialized");
    }
    measureText(_font, _text) {
      throw new Error("Font renderer not initialized");
    }
    // ---- Color picking ----
    //
    // GWEN's base implementation returns the supplied default. Backends
    // with a CPU-side texture copy may override this to sample `t`.
    pixelColour(_t, _x, _y, def) {
      return def;
    }
  };

  // src/renderer/Batch.ts
  var VertexBatch = class {
    constructor(capacity = 2048) {
      this.count = 0;
      this.capacity = capacity;
      this.data = new Float32Array(capacity * 8);
    }
    addVert(x, y, u, v, r, g, b, a) {
      const i = this.count * 8;
      const d = this.data;
      d[i + 0] = x;
      d[i + 1] = y;
      d[i + 2] = u;
      d[i + 3] = v;
      d[i + 4] = r;
      d[i + 5] = g;
      d[i + 6] = b;
      d[i + 7] = a;
      this.count++;
    }
    get vertexCount() {
      return this.count;
    }
    get byteLength() {
      return this.count * 32;
    }
    get view() {
      return this.data.subarray(0, this.count * 8);
    }
    reset() {
      this.count = 0;
    }
    // `threshold` in vertices — returns true when appending another quad
    // (6 verts) would overflow. Default of 2 keeps rooms for the tail of a
    // triangle pair but the renderer almost always passes 6 explicitly.
    isFull(threshold = 2) {
      return this.capacity - this.count <= threshold;
    }
  };

  // src/skin/FontAtlas.ts
  function font(facename = "Arial", size = 14, bold = false) {
    return { facename, size, bold, data: null, realsize: 0 };
  }
  var ATLAS_SIZE = 2048;
  var GLYPH_PADDING = 2;
  var ASCII_PRINTABLE_START = 32;
  var ASCII_PRINTABLE_END = 126;
  function makeScratchCanvas(w, h) {
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(w, h);
    }
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function quoteFacename(name) {
    if (/^[A-Za-z0-9-]+$/.test(name)) return name;
    return `"${name.replace(/"/g, '\\"')}"`;
  }
  function buildFontString(facename, realsize, bold) {
    const px = Math.round(realsize);
    return `${bold ? "bold " : ""}${px}px ${quoteFacename(facename)}, sans-serif`;
  }
  function glyphKey(facename, realsize, bold, codepoint) {
    return `${facename}|${realsize}|${bold ? 1 : 0}|${codepoint}`;
  }
  function rgbaAlphaToR8(rgba, w, h) {
    const out = new Uint8Array(w * h);
    for (let i = 0, j = 3; i < out.length; i++, j += 4) {
      out[i] = rgba[j];
    }
    return out;
  }
  var FontAtlas = class {
    constructor(gl) {
      this.atlasSize = ATLAS_SIZE;
      this.restoreBinding = null;
      this.cache = /* @__PURE__ */ new Map();
      // Row-packer state.
      this.cursorX = 0;
      this.cursorY = 0;
      this.rowHeight = 0;
      this.warnedFull = false;
      this.gl = gl;
      this.scratch = makeScratchCanvas(ATLAS_SIZE, ATLAS_SIZE);
      const ctx = this.scratch.getContext("2d", {
        willReadFrequently: true
      });
      if (!ctx) {
        throw new Error("FontAtlas: 2D context unavailable");
      }
      this.ctx = ctx;
      const tex = gl.createTexture();
      if (!tex) throw new Error("FontAtlas: createTexture failed");
      this.texture = tex;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R8,
        ATLAS_SIZE,
        ATLAS_SIZE,
        0,
        gl.RED,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    /**
     * Set the callback invoked after the atlas performs any internal
     * `gl.bindTexture` / `texSubImage2D`. The renderer registers a function
     * that re-binds whatever it last tracked, so the atlas never leaves GL
     * state in a form the renderer doesn't expect.
     */
    setTextureRestoreFn(fn) {
      this.restoreBinding = fn;
    }
    // ---- Lifecycle ----
    ensureFont(f, scale) {
      const realsize = Math.max(1, f.size * scale);
      let handle = f.data;
      let needLineHeight = false;
      if (!handle) {
        handle = {
          facename: f.facename,
          size: f.size,
          bold: f.bold,
          realsize,
          lastScale: scale,
          lineHeight: 0
        };
        f.data = handle;
        needLineHeight = true;
      } else {
        if (handle.realsize !== realsize) needLineHeight = true;
        handle.lastScale = scale;
        handle.realsize = realsize;
      }
      if (needLineHeight) {
        this.ctx.font = buildFontString(handle.facename, realsize, handle.bold);
        this.ctx.textBaseline = "alphabetic";
        const m = this.ctx.measureText("Ag");
        const ascent = Math.max(0, Math.ceil(m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent));
        const descent = Math.max(0, Math.ceil(m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent));
        handle.lineHeight = ascent + descent;
      }
      f.realsize = realsize;
    }
    loadFont(f) {
      if (!f.data) this.ensureFont(f, 1);
      for (let cp = ASCII_PRINTABLE_START; cp <= ASCII_PRINTABLE_END; cp++) {
        this.getOrRasterize(f, cp);
      }
    }
    freeFont(f) {
      f.data = null;
    }
    // ---- Drawing ----
    // Cursor accumulates in BACKING-pixel space (CSS px × DPR) and is rounded
    // once per glyph. Per-glyph rounding in CSS space (the previous approach)
    // dropped sub-pixel advances and drifted up to 1 backing pixel per
    // character — visible as uneven kerning at small sizes. Snapping every
    // glyph to integer backing pixels also keeps the LINEAR-filtered atlas
    // sampling exactly one texel per destination pixel.
    renderText(f, pos, text, renderer) {
      this.ensureFont(f, renderer.getFontScale());
      const handle = f.data;
      const scale = handle.lastScale;
      let cursorBacking = pos.x * scale;
      const yBacking = pos.y * scale;
      for (let i = 0; i < text.length; i++) {
        const cp = text.charCodeAt(i);
        const entry = this.getOrRasterize(f, cp);
        if (!entry) {
          continue;
        }
        const drawW = entry.cellW - GLYPH_PADDING;
        const drawH = entry.cellH - GLYPH_PADDING;
        renderer.drawFontGlyphBacking(
          this.texture,
          Math.round(cursorBacking),
          Math.round(yBacking + entry.offsetY),
          drawW,
          drawH,
          entry.u0,
          entry.v0,
          entry.u1,
          entry.v1
        );
        cursorBacking += entry.advance;
      }
    }
    measureText(f, text) {
      if (!f.data) this.ensureFont(f, 1);
      const handle = f.data;
      const scale = handle.lastScale;
      let total = 0;
      for (let i = 0; i < text.length; i++) {
        const cp = text.charCodeAt(i);
        const entry = this.getOrRasterize(f, cp);
        if (entry) total += entry.advance;
      }
      const h = handle.lineHeight > 0 ? handle.lineHeight : f.realsize;
      return point(total / scale, h / scale);
    }
    // ---- Rasterization ----
    getOrRasterize(f, codepoint) {
      const handle = f.data;
      const realsize = handle.realsize;
      const key = glyphKey(handle.facename, realsize, handle.bold, codepoint);
      const cached = this.cache.get(key);
      if (cached !== void 0) return cached;
      const entry = this.rasterize(handle, codepoint);
      this.cache.set(key, entry);
      return entry;
    }
    rasterize(handle, codepoint) {
      const ctx = this.ctx;
      const ch = String.fromCharCode(codepoint);
      ctx.font = buildFontString(handle.facename, handle.realsize, handle.bold);
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "white";
      const m = ctx.measureText(ch);
      const advance = m.width;
      const fontAscent = Math.max(0, Math.ceil(m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent));
      const fontDescent = Math.max(0, Math.ceil(m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent));
      const cellW = Math.max(1, Math.ceil(advance) + GLYPH_PADDING);
      const cellH = Math.max(1, fontAscent + fontDescent + GLYPH_PADDING);
      if (cellW > ATLAS_SIZE) {
        return null;
      }
      if (this.cursorX + cellW > ATLAS_SIZE) {
        this.cursorX = 0;
        this.cursorY += this.rowHeight;
        this.rowHeight = 0;
      }
      if (this.cursorY + cellH > ATLAS_SIZE) {
        if (!this.warnedFull) {
          console.warn("FontAtlas full");
          this.warnedFull = true;
        }
        return null;
      }
      const cellX = this.cursorX;
      const cellY = this.cursorY;
      if (cellH > this.rowHeight) this.rowHeight = cellH;
      this.cursorX += cellW;
      ctx.clearRect(0, 0, cellW, cellH);
      ctx.fillText(ch, 1, 1 + fontAscent);
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, cellW, cellH);
      } catch {
        return null;
      }
      const r8 = rgbaAlphaToR8(imageData.data, cellW, cellH);
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        cellX,
        cellY,
        cellW,
        cellH,
        gl.RED,
        gl.UNSIGNED_BYTE,
        r8
      );
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      if (this.restoreBinding) this.restoreBinding();
      const u0 = (cellX + 1) / ATLAS_SIZE;
      const v0 = (cellY + 1) / ATLAS_SIZE;
      const u1 = (cellX + cellW - 1) / ATLAS_SIZE;
      const v1 = (cellY + cellH - 1) / ATLAS_SIZE;
      return {
        advance,
        offsetY: 0,
        u0,
        v0,
        u1,
        v1,
        cellW,
        cellH
      };
    }
  };

  // src/renderer/WebGL2Renderer.ts
  var VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 aUv;
layout(location=2) in vec4 aColor;
uniform mat4 uProjection;
out vec2 vUv;
out vec4 vColor;
void main() {
  gl_Position = uProjection * vec4(aPos, 0.0, 1.0);
  vUv = aUv;
  vColor = aColor;
}`;
  var FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
in vec4 vColor;
uniform sampler2D uTex;
uniform int uMode;
out vec4 fragColor;
void main() {
  vec4 s = texture(uTex, vUv);
  if (uMode == 2) fragColor = vec4(vColor.rgb, s.r * vColor.a);
  else fragColor = s * vColor;
}`;
  var MODE_FILL = 0;
  var MODE_TEXTURED = 1;
  var MODE_FONT = 2;
  var VBO_CAPACITY_VERTS = 8192;
  var WebGL2Renderer = class extends Renderer {
    constructor(canvas, options) {
      super();
      this.program = null;
      this.uProjectionLoc = null;
      this.uTexLoc = null;
      this.uModeLoc = null;
      this.vao = null;
      this.vbo = null;
      this.batch = new VertexBatch(VBO_CAPACITY_VERTS);
      this.nullTexture = null;
      this.boundTex = null;
      this.lastMode = MODE_FILL;
      this.fontAtlas = null;
      // Cached draw-color components in [0, 1] — avoid per-vertex division.
      this.dr = 1;
      this.dg = 1;
      this.db = 1;
      this.da = 1;
      this.canvas = canvas;
      this.dpr = options?.devicePixelRatio ?? (globalThis.devicePixelRatio || 1);
      const gl = canvas.getContext("webgl2", {
        alpha: options?.alpha ?? true,
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        stencil: false
      });
      if (!gl) {
        throw new Error("WebGL2 is not available in this browser/context");
      }
      this.gl = gl;
    }
    // -------- Lifecycle --------
    init() {
      const { gl } = this;
      const program = this.buildProgram(VERT_SRC, FRAG_SRC);
      this.program = program;
      gl.useProgram(program);
      this.uProjectionLoc = gl.getUniformLocation(program, "uProjection");
      this.uTexLoc = gl.getUniformLocation(program, "uTex");
      this.uModeLoc = gl.getUniformLocation(program, "uMode");
      gl.uniform1i(this.uTexLoc, 0);
      gl.uniform1i(this.uModeLoc, MODE_FILL);
      const vao = gl.createVertexArray();
      if (!vao) throw new Error("createVertexArray failed");
      this.vao = vao;
      gl.bindVertexArray(vao);
      const vbo = gl.createBuffer();
      if (!vbo) throw new Error("createBuffer failed");
      this.vbo = vbo;
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.batch.data.byteLength, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 8);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
      const nt = gl.createTexture();
      if (!nt) throw new Error("createTexture failed");
      this.nullTexture = nt;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, nt);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255])
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.boundTex = nt;
      this.updateProjection();
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      this.fontAtlas = new FontAtlas(gl);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.nullTexture);
      this.boundTex = this.nullTexture;
      this.fontAtlas.setTextureRestoreFn(() => {
        const tex = this.boundTex;
        if (tex) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, tex);
        }
      });
    }
    begin() {
      const { gl, canvas } = this;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.batch.data.byteLength, gl.DYNAMIC_DRAW);
      this.batch.reset();
      this.bindNullTexture();
      this.setMode(MODE_FILL);
    }
    end() {
      this.flushBatch();
    }
    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      this.updateProjection();
    }
    // -------- State --------
    setDrawColor(c) {
      this.m_drawColor = c;
      this.dr = c.r / 255;
      this.dg = c.g / 255;
      this.db = c.b / 255;
      this.da = c.a / 255;
    }
    // -------- Primitives --------
    drawFilledRect(r) {
      if (this.lastMode !== MODE_FILL || this.boundTex !== this.nullTexture) {
        this.flushBatch();
        this.bindNullTexture();
        this.setMode(MODE_FILL);
      }
      const t = this.translateRect(r);
      this.writeQuad(t.x, t.y, t.w, t.h, 0, 0, 1, 1);
    }
    drawTexturedRect(tex, r, u1 = 0, v1 = 0, u2 = 1, v2 = 1) {
      const glTex = tex.data instanceof WebGLTexture ? tex.data : null;
      if (!glTex || tex.failed) {
        this.drawMissingImage(r);
        return;
      }
      if (this.lastMode !== MODE_TEXTURED || this.boundTex !== glTex) {
        this.flushBatch();
        this.bindTex(glTex);
        this.setMode(MODE_TEXTURED);
      }
      const t = this.translateRect(r);
      this.writeQuad(t.x, t.y, t.w, t.h, u1, v1, u2, v2);
    }
    // -------- Clipping --------
    startClip() {
      this.flushBatch();
      const { gl, canvas } = this;
      const r = this.m_rectClipRegion;
      const s = this.m_scale * this.dpr;
      const px = Math.round(r.x * s);
      const pw = Math.round(r.w * s);
      const ph = Math.round(r.h * s);
      const sy = canvas.height - Math.round((r.y + r.h) * s);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(px, sy, pw, ph);
    }
    endClip() {
      this.flushBatch();
      this.gl.disable(this.gl.SCISSOR_TEST);
    }
    // -------- Textures --------
    // String-URL loading is not wired yet — the production path is
    // `loadTextureFromSource`, which `DynamicSkin` (T006) calls with an
    // already-rasterized OffscreenCanvas. A future HTTP/image loader task
    // can extend this to honour `texture.name`.
    loadTexture(t) {
      t.failed = true;
    }
    loadTextureFromSource(t, source) {
      const { gl } = this;
      let handle = t.data instanceof WebGLTexture ? t.data : null;
      const isNew = handle === null;
      if (!handle) {
        handle = gl.createTexture();
        if (!handle) {
          t.failed = true;
          return;
        }
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, handle);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source
      );
      if (isNew) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      const w = source.width ?? source.videoWidth ?? 0;
      const h = source.height ?? source.videoHeight ?? 0;
      t.data = handle;
      t.width = w;
      t.height = h;
      t.failed = false;
      if (this.boundTex) {
        gl.bindTexture(gl.TEXTURE_2D, this.boundTex);
      }
    }
    freeTexture(t) {
      if (t.data instanceof WebGLTexture) {
        this.gl.deleteTexture(t.data);
      }
      t.data = null;
      t.failed = false;
    }
    // -------- Fonts --------
    loadFont(f) {
      this.fontAtlasOrThrow().loadFont(f);
    }
    freeFont(f) {
      this.fontAtlasOrThrow().freeFont(f);
    }
    measureText(f, text) {
      const atlas = this.fontAtlasOrThrow();
      atlas.ensureFont(f, this.getScale() * this.dpr);
      return atlas.measureText(f, text);
    }
    renderText(f, pos, text) {
      this.fontAtlasOrThrow().renderText(f, pos, text, this);
    }
    // Exposed for the FontAtlas so it can rasterize at backing-pixel
    // resolution (CSS px × DPR) even when the caller's scale is 1.
    getFontScale() {
      return this.m_scale * this.dpr;
    }
    /**
     * @internal
     * Emits a textured quad sampling from the font atlas's R8 texture.
     * Coordinates are in pre-translation logical space; this method runs
     * `translate` + scale itself, mirroring `drawTexturedRect`. Rounding
     * here is in CSS-pixel space — fine for backwards-compat callers but
     * `drawFontGlyphBacking` is preferred for crisp text.
     */
    drawFontGlyph(atlasTexture, x, y, w, h, u0, v0, u1, v1) {
      if (this.lastMode !== MODE_FONT || this.boundTex !== atlasTexture) {
        this.flushBatch();
        this.bindTex(atlasTexture);
        this.setMode(MODE_FONT);
      }
      const [tx, ty] = this.translate(x, y);
      const tw = Math.ceil(w * this.m_scale);
      const th = Math.ceil(h * this.m_scale);
      this.writeQuad(tx, ty, tw, th, u0, v0, u1, v1);
    }
    /**
     * @internal
     * Emits a font-atlas quad whose position + size are already expressed in
     * backing pixels (CSS px × DPR). FontAtlas accumulates the per-glyph
     * cursor in backing-pixel space and rounds once per glyph, so the inputs
     * are integers; we convert back to CSS for the projection (which still
     * uses CSS dims) by dividing by DPR. The result is a quad whose corners
     * project to integer backing pixels, so the atlas's per-glyph cells
     * sample exactly one texel per destination pixel under LINEAR filtering.
     */
    drawFontGlyphBacking(atlasTexture, xBacking, yBacking, wBacking, hBacking, u0, v0, u1, v1) {
      if (this.lastMode !== MODE_FONT || this.boundTex !== atlasTexture) {
        this.flushBatch();
        this.bindTex(atlasTexture);
        this.setMode(MODE_FONT);
      }
      const dpr = this.dpr;
      const cssX = xBacking / dpr + this.m_renderOffset.x;
      const cssY = yBacking / dpr + this.m_renderOffset.y;
      const tx = Math.round(cssX * dpr) / dpr;
      const ty = Math.round(cssY * dpr) / dpr;
      const tw = wBacking / dpr;
      const th = hBacking / dpr;
      this.writeQuad(tx, ty, tw, th, u0, v0, u1, v1);
    }
    fontAtlasOrThrow() {
      if (!this.fontAtlas) {
        throw new Error("WebGL2Renderer.init() not yet called");
      }
      return this.fontAtlas;
    }
    // -------- Internals --------
    writeQuad(x, y, w, h, u1, v1, u2, v2) {
      if (this.batch.isFull(6)) {
        this.flushBatch();
      }
      const r = this.dr;
      const g = this.dg;
      const b = this.db;
      const a = this.da;
      const x2 = x + w;
      const y2 = y + h;
      const bp = this.batch;
      bp.addVert(x, y, u1, v1, r, g, b, a);
      bp.addVert(x2, y, u2, v1, r, g, b, a);
      bp.addVert(x, y2, u1, v2, r, g, b, a);
      bp.addVert(x2, y, u2, v1, r, g, b, a);
      bp.addVert(x2, y2, u2, v2, r, g, b, a);
      bp.addVert(x, y2, u1, v2, r, g, b, a);
    }
    flushBatch() {
      if (this.batch.vertexCount === 0) return;
      const { gl } = this;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.batch.view);
      gl.drawArrays(gl.TRIANGLES, 0, this.batch.vertexCount);
      this.batch.reset();
    }
    // Always binds unconditionally. FontAtlas (and any other code that owns
    // a WebGLTexture) is free to call `gl.bindTexture` on its own during
    // uploads; the renderer's `boundTex` field is only a batching hint for
    // the callers in `drawFilledRect` / `drawTexturedRect` / `drawFontGlyph`
    // (to decide whether to flush). At the point we actually commit to a
    // new binding, we must issue the GL call unconditionally — otherwise
    // the GL state can silently disagree with `boundTex`.
    bindNullTexture() {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.nullTexture);
      this.boundTex = this.nullTexture;
    }
    bindTex(handle) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, handle);
      this.boundTex = handle;
    }
    setMode(mode) {
      if (this.lastMode === mode) return;
      this.lastMode = mode;
      this.gl.uniform1i(this.uModeLoc, mode);
    }
    // Top-left origin, Y-down. Callers feed in CSS-logical coordinates
    // (`canvas.setBounds` in the demo, pixel-read tests that don't multiply
    // by DPR, etc.) — so the projection's W/H is the canvas's CSS size, not
    // its backing-pixel size. `gl.viewport` still uses backing pixels (set
    // in `begin()` and `resize()`), which upscales the projection's NDC
    // output to cover the full high-DPI drawing buffer. Falls back to
    // `canvas.width` when clientWidth is 0 (isolated test canvases built
    // without DOM layout, which set backing directly with no CSS).
    updateProjection() {
      const { gl, canvas } = this;
      const w = canvas.clientWidth || canvas.width || 1;
      const h = canvas.clientHeight || canvas.height || 1;
      const m = new Float32Array([
        2 / w,
        0,
        0,
        0,
        0,
        -2 / h,
        0,
        0,
        0,
        0,
        -1,
        0,
        -1,
        1,
        0,
        1
      ]);
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(this.uProjectionLoc, false, m);
    }
    buildProgram(vertSrc, fragSrc) {
      const { gl } = this;
      const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
      const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
      const prog = gl.createProgram();
      if (!prog) throw new Error("createProgram failed");
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(prog) ?? "(no log)";
        gl.deleteProgram(prog);
        throw new Error(`shader link failed: ${log}`);
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return prog;
    }
    compileShader(type, src) {
      const { gl } = this;
      const sh = gl.createShader(type);
      if (!sh) throw new Error("createShader failed");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh) ?? "(no log)";
        gl.deleteShader(sh);
        throw new Error(`shader compile failed: ${log}`);
      }
      return sh;
    }
  };

  // src/skin/AtlasRegions.ts
  var RAW_REGIONS = [
    // ----- Frame & feedback -----
    { name: "Shadow", type: "bordered", x: 448, y: 0, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Tooltip", type: "bordered", x: 128, y: 320, w: 127, h: 31, m: [8, 8, 8, 8] },
    { name: "StatusBar", type: "bordered", x: 128, y: 288, w: 127, h: 31, m: [8, 8, 8, 8] },
    { name: "Selection", type: "bordered", x: 384, y: 32, w: 31, h: 31, m: [4, 4, 4, 4] },
    // ----- Panel variants -----
    { name: "Panel.Normal", type: "bordered", x: 256, y: 0, w: 63, h: 63, m: [16, 16, 16, 16] },
    { name: "Panel.Bright", type: "bordered", x: 320, y: 0, w: 63, h: 63, m: [16, 16, 16, 16] },
    { name: "Panel.Dark", type: "bordered", x: 256, y: 64, w: 63, h: 63, m: [16, 16, 16, 16] },
    { name: "Panel.Highlight", type: "bordered", x: 320, y: 64, w: 63, h: 63, m: [16, 16, 16, 16] },
    // ----- Window frames -----
    // mt keeps the painted title bar height in sync with the dragger's
    // height (WindowControl): an mt that's larger than the dragger leaves
    // an empty stripe below the title text and bakes a hard separator
    // line at the bottom of the title strip.
    { name: "Window.Normal", type: "bordered", x: 0, y: 0, w: 127, h: 127, m: [8, 28, 8, 8] },
    { name: "Window.Inactive", type: "bordered", x: 128, y: 0, w: 127, h: 127, m: [8, 28, 8, 8] },
    // ----- Window controls (Close / Maxi / Mini / Restore × 3 states) -----
    { name: "Window.Close", type: "single", x: 32, y: 448, w: 31, h: 31 },
    { name: "Window.Close_Hover", type: "single", x: 64, y: 448, w: 31, h: 31 },
    { name: "Window.Close_Down", type: "single", x: 96, y: 448, w: 31, h: 31 },
    { name: "Window.Mini", type: "single", x: 32 + 96, y: 448, w: 31, h: 31 },
    { name: "Window.Mini_Hover", type: "single", x: 64 + 96, y: 448, w: 31, h: 31 },
    { name: "Window.Mini_Down", type: "single", x: 96 + 96, y: 448, w: 31, h: 31 },
    { name: "Window.Maxi", type: "single", x: 32 + 96 * 2, y: 448, w: 31, h: 31 },
    { name: "Window.Maxi_Hover", type: "single", x: 64 + 96 * 2, y: 448, w: 31, h: 31 },
    { name: "Window.Maxi_Down", type: "single", x: 96 + 96 * 2, y: 448, w: 31, h: 31 },
    { name: "Window.Restore", type: "single", x: 32 + 96 * 2, y: 448 + 32, w: 31, h: 31 },
    { name: "Window.Restore_Hover", type: "single", x: 64 + 96 * 2, y: 448 + 32, w: 31, h: 31 },
    { name: "Window.Restore_Down", type: "single", x: 96 + 96 * 2, y: 448 + 32, w: 31, h: 31 },
    // ----- Checkbox / RadioButton glyphs -----
    { name: "Checkbox.Active.Checked", type: "single", x: 448, y: 32, w: 15, h: 15 },
    { name: "Checkbox.Active.Normal", type: "single", x: 464, y: 32, w: 15, h: 15 },
    { name: "Checkbox.Disabled.Checked", type: "single", x: 448, y: 48, w: 15, h: 15 },
    { name: "Checkbox.Disabled.Normal", type: "single", x: 464, y: 48, w: 15, h: 15 },
    { name: "RadioButton.Active.Checked", type: "single", x: 448, y: 64, w: 15, h: 15 },
    { name: "RadioButton.Active.Normal", type: "single", x: 464, y: 64, w: 15, h: 15 },
    { name: "RadioButton.Disabled.Checked", type: "single", x: 448, y: 80, w: 15, h: 15 },
    { name: "RadioButton.Disabled.Normal", type: "single", x: 464, y: 80, w: 15, h: 15 },
    // ----- Text box -----
    { name: "TextBox.Normal", type: "bordered", x: 0, y: 150, w: 127, h: 21, m: [4, 4, 4, 4] },
    { name: "TextBox.Focus", type: "bordered", x: 0, y: 172, w: 127, h: 21, m: [4, 4, 4, 4] },
    { name: "TextBox.Disabled", type: "bordered", x: 0, y: 193, w: 127, h: 21, m: [4, 4, 4, 4] },
    // ----- Menu -----
    { name: "Menu.Strip", type: "bordered", x: 0, y: 128, w: 127, h: 21, m: [1, 1, 1, 1] },
    { name: "Menu.BackgroundWithMargin", type: "bordered", x: 128, y: 128, w: 127, h: 63, m: [24, 8, 8, 8] },
    { name: "Menu.Background", type: "bordered", x: 128, y: 192, w: 127, h: 63, m: [8, 8, 8, 8] },
    { name: "Menu.Hover", type: "bordered", x: 128, y: 256, w: 127, h: 31, m: [8, 8, 8, 8] },
    { name: "Menu.RightArrow", type: "single", x: 464, y: 112, w: 15, h: 15 },
    { name: "Menu.Check", type: "single", x: 448, y: 112, w: 15, h: 15 },
    // ----- Tab -----
    { name: "Tab.Control", type: "bordered", x: 0, y: 256, w: 127, h: 127, m: [8, 8, 8, 8] },
    { name: "Tab.Bottom.Active", type: "bordered", x: 0, y: 416, w: 63, h: 31, m: [8, 8, 8, 8] },
    { name: "Tab.Bottom.Inactive", type: "bordered", x: 128, y: 416, w: 63, h: 31, m: [8, 8, 8, 8] },
    { name: "Tab.Top.Active", type: "bordered", x: 0, y: 384, w: 63, h: 31, m: [8, 8, 8, 8] },
    { name: "Tab.Top.Inactive", type: "bordered", x: 128, y: 384, w: 63, h: 31, m: [8, 8, 8, 8] },
    { name: "Tab.Left.Active", type: "bordered", x: 64, y: 384, w: 31, h: 63, m: [8, 8, 8, 8] },
    { name: "Tab.Left.Inactive", type: "bordered", x: 192, y: 384, w: 31, h: 63, m: [8, 8, 8, 8] },
    { name: "Tab.Right.Active", type: "bordered", x: 96, y: 384, w: 31, h: 63, m: [8, 8, 8, 8] },
    { name: "Tab.Right.Inactive", type: "bordered", x: 224, y: 384, w: 31, h: 63, m: [8, 8, 8, 8] },
    { name: "Tab.HeaderBar", type: "bordered", x: 128, y: 352, w: 127, h: 31, m: [4, 4, 4, 4] },
    // ----- Tree -----
    { name: "Tree.Background", type: "bordered", x: 256, y: 128, w: 127, h: 127, m: [16, 16, 16, 16] },
    { name: "Tree.Plus", type: "single", x: 448, y: 96, w: 15, h: 15 },
    { name: "Tree.Minus", type: "single", x: 464, y: 96, w: 15, h: 15 },
    // ----- Input.Button -----
    { name: "Input.Button.Normal", type: "bordered", x: 480, y: 0, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.Button.Hovered", type: "bordered", x: 480, y: 32, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.Button.Disabled", type: "bordered", x: 480, y: 64, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.Button.Pressed", type: "bordered", x: 480, y: 96, w: 31, h: 31, m: [8, 8, 8, 8] },
    // ----- Scroller arrows (4 states × 4 directions = 16) -----
    // GWEN encodes direction by row index 0..3 mapping to Left/Top/Right/Bottom
    // (DrawScrollButton in TexturedBase.h:812).
    { name: "Scroller.Button.Normal[0]", type: "bordered", x: 464, y: 208, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Normal[1]", type: "bordered", x: 464, y: 224, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Normal[2]", type: "bordered", x: 464, y: 240, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Normal[3]", type: "bordered", x: 464, y: 256, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Hover[0]", type: "bordered", x: 480, y: 208, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Hover[1]", type: "bordered", x: 480, y: 224, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Hover[2]", type: "bordered", x: 480, y: 240, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Hover[3]", type: "bordered", x: 480, y: 256, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Down[0]", type: "bordered", x: 464, y: 272, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Down[1]", type: "bordered", x: 464, y: 288, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Down[2]", type: "bordered", x: 464, y: 304, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Down[3]", type: "bordered", x: 464, y: 320, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Disabled[0]", type: "bordered", x: 528, y: 272, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Disabled[1]", type: "bordered", x: 528, y: 288, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Disabled[2]", type: "bordered", x: 528, y: 304, w: 15, h: 15, m: [2, 2, 2, 2] },
    { name: "Scroller.Button.Disabled[3]", type: "bordered", x: 528, y: 320, w: 15, h: 15, m: [2, 2, 2, 2] },
    // NOTE: The Disabled bucket lives at x=528 (>= atlas width 512) in the
    // upstream layout. We respect the source coordinates verbatim; the runtime
    // painter clamps the draw to within the canvas, so these disabled-glyph
    // cells just won't appear on the atlas page. Callers that need them
    // reuse Scroller.Button.Normal as a stand-in (DynamicSkin's
    // disabled-state shading already darkens the result enough to read).
    // ----- Scroller bars/tracks -----
    { name: "Scroller.TrackV", type: "bordered", x: 384, y: 208, w: 15, h: 127, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonV_Normal", type: "bordered", x: 400, y: 208, w: 15, h: 127, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonV_Hover", type: "bordered", x: 416, y: 208, w: 15, h: 127, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonV_Down", type: "bordered", x: 432, y: 208, w: 15, h: 127, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonV_Disabled", type: "bordered", x: 448, y: 208, w: 15, h: 127, m: [4, 4, 4, 4] },
    { name: "Scroller.TrackH", type: "bordered", x: 384, y: 128, w: 127, h: 15, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonH_Normal", type: "bordered", x: 384, y: 144, w: 127, h: 15, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonH_Hover", type: "bordered", x: 384, y: 160, w: 127, h: 15, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonH_Down", type: "bordered", x: 384, y: 176, w: 127, h: 15, m: [4, 4, 4, 4] },
    { name: "Scroller.ButtonH_Disabled", type: "bordered", x: 384, y: 192, w: 127, h: 15, m: [4, 4, 4, 4] },
    // ----- Input.ListBox -----
    { name: "Input.ListBox.Background", type: "bordered", x: 256, y: 256, w: 63, h: 127, m: [8, 8, 8, 8] },
    { name: "Input.ListBox.Hovered", type: "bordered", x: 320, y: 320, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.ListBox.EvenLine", type: "bordered", x: 352, y: 256, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.ListBox.OddLine", type: "bordered", x: 352, y: 288, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.ListBox.EvenLineSelected", type: "bordered", x: 320, y: 256, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "Input.ListBox.OddLineSelected", type: "bordered", x: 320, y: 288, w: 31, h: 31, m: [8, 8, 8, 8] },
    // ----- Input.ComboBox -----
    { name: "Input.ComboBox.Normal", type: "bordered", x: 384, y: 336, w: 127, h: 31, m: [8, 8, 32, 8] },
    { name: "Input.ComboBox.Hover", type: "bordered", x: 384, y: 368, w: 127, h: 31, m: [8, 8, 32, 8] },
    { name: "Input.ComboBox.Down", type: "bordered", x: 384, y: 400, w: 127, h: 31, m: [8, 8, 32, 8] },
    { name: "Input.ComboBox.Disabled", type: "bordered", x: 384, y: 432, w: 127, h: 31, m: [8, 8, 32, 8] },
    { name: "Input.ComboBox.Button.Normal", type: "single", x: 496, y: 272, w: 15, h: 15 },
    { name: "Input.ComboBox.Button.Hover", type: "single", x: 496, y: 288, w: 15, h: 15 },
    { name: "Input.ComboBox.Button.Down", type: "single", x: 496, y: 304, w: 15, h: 15 },
    { name: "Input.ComboBox.Button.Disabled", type: "single", x: 496, y: 320, w: 15, h: 15 },
    // ----- Input.UpDown (numeric spinner) -----
    { name: "Input.UpDown.Up.Normal", type: "single", x: 384, y: 112, w: 7, h: 7 },
    { name: "Input.UpDown.Up.Hover", type: "single", x: 392, y: 112, w: 7, h: 7 },
    { name: "Input.UpDown.Up.Down", type: "single", x: 400, y: 112, w: 7, h: 7 },
    { name: "Input.UpDown.Up.Disabled", type: "single", x: 408, y: 112, w: 7, h: 7 },
    { name: "Input.UpDown.Down.Normal", type: "single", x: 384, y: 120, w: 7, h: 7 },
    { name: "Input.UpDown.Down.Hover", type: "single", x: 392, y: 120, w: 7, h: 7 },
    { name: "Input.UpDown.Down.Down", type: "single", x: 400, y: 120, w: 7, h: 7 },
    { name: "Input.UpDown.Down.Disabled", type: "single", x: 408, y: 120, w: 7, h: 7 },
    // ----- Progress bar -----
    { name: "ProgressBar.Back", type: "bordered", x: 384, y: 0, w: 31, h: 31, m: [8, 8, 8, 8] },
    { name: "ProgressBar.Front", type: "bordered", x: 416, y: 0, w: 31, h: 31, m: [8, 8, 8, 8] },
    // ----- Input.Slider thumbs -----
    { name: "Input.Slider.H.Normal", type: "single", x: 416, y: 32, w: 15, h: 15 },
    { name: "Input.Slider.H.Hover", type: "single", x: 416, y: 48, w: 15, h: 15 },
    { name: "Input.Slider.H.Down", type: "single", x: 416, y: 64, w: 15, h: 15 },
    { name: "Input.Slider.H.Disabled", type: "single", x: 416, y: 80, w: 15, h: 15 },
    { name: "Input.Slider.V.Normal", type: "single", x: 432, y: 32, w: 15, h: 15 },
    { name: "Input.Slider.V.Hover", type: "single", x: 432, y: 48, w: 15, h: 15 },
    { name: "Input.Slider.V.Down", type: "single", x: 432, y: 64, w: 15, h: 15 },
    { name: "Input.Slider.V.Disabled", type: "single", x: 432, y: 80, w: 15, h: 15 },
    // ----- CategoryList -----
    { name: "CategoryList.Outer", type: "bordered", x: 256, y: 384, w: 63, h: 63, m: [8, 8, 8, 8] },
    { name: "CategoryList.Inner", type: "bordered", x: 320, y: 384, w: 63, h: 63, m: [8, 21, 8, 8] },
    { name: "CategoryList.Header", type: "bordered", x: 320, y: 352, w: 63, h: 31, m: [8, 8, 8, 8] },
    // ----- GroupBox -----
    { name: "GroupBox", type: "bordered", x: 0, y: 448, w: 31, h: 31, m: [8, 8, 8, 8] }
  ];
  for (const d of RAW_REGIONS) {
    if (d.type === "bordered") Object.freeze(d.m);
    Object.freeze(d);
  }
  var REGIONS = Object.freeze(RAW_REGIONS);
  var LIGHT_PALETTE = Object.freeze({
    canvasBg: "#7a9090",
    panelFill: "#e8e8e8",
    panelBright: "#f4f4f4",
    panelDark: "#c8c8c8",
    panelHighlight: "#fafafa",
    panelBorder: "#b0b0b0",
    titleActiveTop: "#7ab4d4",
    titleActiveBottom: "#4890c4",
    titleInactiveTop: "#c8c8c8",
    titleInactiveBot: "#a0a0a0",
    buttonNormalTop: "#f0f0f0",
    buttonNormalBot: "#d0d0d0",
    buttonHoverTop: "#e0f0ff",
    buttonHoverBot: "#b8d8f0",
    buttonPressedTop: "#c0c0c0",
    buttonPressedBot: "#d8d8d8",
    buttonDisabled: "#e0e0e0",
    buttonBorder: "#909090",
    textboxBg: "#ffffff",
    textboxBorder: "#b0b0b0",
    textboxFocused: "#4890c4",
    selection: "#4890c4",
    // Scrollbars deliberately tuned for visibility — the track sits a
    // notch darker than the surrounding panel chrome (#e8e8e8 panel,
    // #c8c8c8 panelDark) so the bar reads as a clear inset; the thumb
    // is brighter than the track with a stronger top-bottom gradient
    // and a distinctly darker border so it pops as a draggable handle.
    // Earlier values (#d0d0d0 track / #e8e8e8→#c0c0c0 thumb) blurred
    // into the surrounding grey at the bar's bottom + right edges.
    scrollTrack: "#b8b8b8",
    scrollTrackBorder: "#808080",
    scrollThumbTop: "#f0f0f0",
    scrollThumbBot: "#a8a8a8",
    scrollThumbBorder: "#606060",
    tooltipBg: "#ffffcc",
    tooltipBorder: "#909090",
    statusBarBg: "#d4d0c8",
    menuStripBg: "#d4d0c8",
    menuHoverBg: "#4890c4",
    progressBack: "#d0d0d0",
    progressFront: "#00d328",
    shadow: "rgba(0,0,0,0.47)",
    // ~120/255
    textNormal: "#000000",
    textDisabled: "#808080",
    textOnDark: "#ffffff",
    accent: "#4890c4",
    // Tab variants — tuned so active tabs sit clearly above the recessed
    // dock strip without making the light theme feel heavy.
    tabActiveTop: "#f8f8f8",
    tabActiveBot: "#e2e2e2",
    tabInactiveTop: "#d8d8d8",
    tabInactiveBot: "#bdbdbd",
    // Tree
    treeLines: "#909090",
    treeNormal: "#000000",
    treeHover: "#000000",
    treeSelected: "#ffffff",
    // Properties grid
    propLineNormal: "#ffffff",
    propLineSelected: "#4890c4",
    propLineHover: "#e0f0ff",
    propTitle: "#ffffff",
    propColumnNormal: "#e8e8e8",
    propColumnSelected: "#7ab4d4",
    propColumnHover: "#d8e8f8",
    propLabelNormal: "#000000",
    propLabelSelected: "#ffffff",
    propLabelHover: "#000000",
    propBorder: "#909090",
    // Modal & tooltip text
    modalBg: "rgba(25,25,25,0.40)",
    tooltipText: "#000000",
    // Category
    catHeader: "#ffffff",
    catHeaderClosed: "#a0a0a0",
    catLineText: "#000000",
    catLineTextHover: "#000000",
    catLineTextSelected: "#ffffff",
    catLineButton: "#000000",
    catLineButtonHover: "#000000",
    catLineButtonSelected: "#ffffff",
    catLineAltText: "#202020",
    catLineAltTextHover: "#000000",
    catLineAltTextSelected: "#ffffff",
    catLineAltButton: "#202020",
    catLineAltButtonHover: "#000000",
    catLineAltButtonSelected: "#ffffff"
  });
  var DARK_PALETTE = Object.freeze({
    canvasBg: "#1f1f1f",
    panelFill: "#2b2b2b",
    panelBright: "#343434",
    panelDark: "#242424",
    panelHighlight: "#3d3d3d",
    panelBorder: "#505050",
    titleActiveTop: "#383838",
    titleActiveBottom: "#303030",
    titleInactiveTop: "#2d2d2d",
    titleInactiveBot: "#272727",
    buttonNormalTop: "#3b3b3b",
    buttonNormalBot: "#333333",
    buttonHoverTop: "#474747",
    buttonHoverBot: "#3f3f3f",
    buttonPressedTop: "#262626",
    buttonPressedBot: "#303030",
    buttonDisabled: "#2f2f2f",
    buttonBorder: "#5a5a5a",
    textboxBg: "#252525",
    textboxBorder: "#565656",
    textboxFocused: "#2680eb",
    selection: "#2d6fb3",
    scrollTrack: "#242424",
    scrollTrackBorder: "#3f3f3f",
    scrollThumbTop: "#5b5b5b",
    scrollThumbBot: "#474747",
    scrollThumbBorder: "#686868",
    tooltipBg: "#353535",
    tooltipBorder: "#626262",
    statusBarBg: "#2a2a2a",
    menuStripBg: "#2a2a2a",
    menuHoverBg: "#2d6fb3",
    progressBack: "#242424",
    progressFront: "#55708a",
    shadow: "rgba(0,0,0,0.70)",
    textNormal: "#dcdcdc",
    textDisabled: "#858585",
    textOnDark: "#f4f4f4",
    accent: "#2680eb",
    tabActiveTop: "#4a4a4a",
    tabActiveBot: "#3d3d3d",
    tabInactiveTop: "#343434",
    tabInactiveBot: "#2b2b2b",
    treeLines: "#6a6a6a",
    treeNormal: "#dcdcdc",
    treeHover: "#f4f4f4",
    treeSelected: "#ffffff",
    propLineNormal: "#333333",
    propLineSelected: "#2d6fb3",
    propLineHover: "#454545",
    propTitle: "#dcdcdc",
    propColumnNormal: "#2f2f2f",
    propColumnSelected: "#315f9f",
    propColumnHover: "#3a3a3a",
    propLabelNormal: "#dcdcdc",
    propLabelSelected: "#ffffff",
    propLabelHover: "#f4f4f4",
    propBorder: "#555555",
    modalBg: "rgba(0,0,0,0.58)",
    tooltipText: "#dcdcdc",
    catHeader: "#dcdcdc",
    catHeaderClosed: "#9a9a9a",
    catLineText: "#dcdcdc",
    catLineTextHover: "#f4f4f4",
    catLineTextSelected: "#ffffff",
    catLineButton: "#dcdcdc",
    catLineButtonHover: "#f4f4f4",
    catLineButtonSelected: "#ffffff",
    catLineAltText: "#c6c6c6",
    catLineAltTextHover: "#f4f4f4",
    catLineAltTextSelected: "#ffffff",
    catLineAltButton: "#c6c6c6",
    catLineAltButtonHover: "#f4f4f4",
    catLineAltButtonSelected: "#ffffff"
  });
  var PALETTE = LIGHT_PALETTE;
  function bakedRow508(p) {
    const out = [
      { name: "Window.TitleActive", hex: "#003c74" },
      { name: "Window.TitleInactive", hex: "#7a96b6" },
      { name: "Button.Normal", hex: p.textNormal },
      { name: "Button.Hover", hex: p.textNormal },
      { name: "Tab.Active.Normal", hex: p.textNormal },
      { name: "Tab.Active.Hover", hex: p.textNormal },
      { name: "Tab.Inactive.Normal", hex: p.textNormal },
      { name: "Tab.Inactive.Hover", hex: p.textNormal },
      { name: "Label.Default", hex: p.textNormal },
      { name: "Label.Bright", hex: p.textOnDark },
      { name: "Tree.Lines", hex: p.treeLines },
      { name: "Tree.Normal", hex: p.treeNormal },
      { name: "Properties.Line_Normal", hex: p.propLineNormal },
      { name: "Properties.Line_Selected", hex: p.propLineSelected },
      { name: "Properties.Column_Normal", hex: p.propColumnNormal },
      { name: "Properties.Column_Selected", hex: p.propColumnSelected },
      { name: "Properties.Label_Normal", hex: p.propLabelNormal },
      { name: "Properties.Label_Selected", hex: p.propLabelSelected },
      // Translucent — opaque #191919 turned the screen pitch black behind a
      // modal window, hiding the parent UI completely. The palette's
      // `modalBg` value tracks the right alpha for each theme.
      { name: "ModalBackground", hex: p.modalBg },
      { name: "TooltipText", hex: p.tooltipText },
      { name: "Category.Line.Text", hex: p.catLineText },
      { name: "Category.Line.Text_Hover", hex: p.catLineTextHover },
      { name: "Category.Line.Button_Hover", hex: p.catLineButtonHover },
      { name: "Category.Line.Button_Selected", hex: p.catLineButtonSelected },
      { name: "Category.LineAlt.Text_Selected", hex: p.catLineAltTextSelected },
      { name: "Category.LineAlt.Button", hex: p.catLineAltButton }
    ];
    for (const c of out) Object.freeze(c);
    return Object.freeze(out);
  }
  function bakedRow500(p) {
    const out = [
      { name: "Pad500_0", hex: "#000000" },
      { name: "Pad500_1", hex: "#000000" },
      { name: "Button.Down", hex: p.textNormal },
      { name: "Button.Disabled", hex: p.textDisabled },
      { name: "Tab.Active.Down", hex: p.textNormal },
      { name: "Tab.Active.Disabled", hex: p.textDisabled },
      { name: "Tab.Inactive.Down", hex: p.textNormal },
      { name: "Tab.Inactive.Disabled", hex: p.textDisabled },
      { name: "Label.Dark", hex: p.textNormal },
      { name: "Label.Highlight", hex: p.textOnDark },
      { name: "Tree.Hover", hex: p.treeHover },
      { name: "Tree.Selected", hex: p.treeSelected },
      { name: "Properties.Line_Hover", hex: p.propLineHover },
      { name: "Properties.Title", hex: p.propTitle },
      { name: "Properties.Column_Hover", hex: p.propColumnHover },
      { name: "Properties.Border", hex: p.propBorder },
      { name: "Properties.Label_Hover", hex: p.propLabelHover },
      { name: "Pad500_17", hex: "#000000" },
      { name: "Category.Header", hex: p.catHeader },
      { name: "Category.Header_Closed", hex: p.catHeaderClosed },
      { name: "Category.Line.Text_Selected", hex: p.catLineTextSelected },
      { name: "Category.Line.Button", hex: p.catLineButton },
      { name: "Category.LineAlt.Text", hex: p.catLineAltText },
      { name: "Category.LineAlt.Text_Hover", hex: p.catLineAltTextHover },
      { name: "Category.LineAlt.Button_Hover", hex: p.catLineAltButtonHover },
      { name: "Category.LineAlt.Button_Selected", hex: p.catLineAltButtonSelected }
    ];
    for (const c of out) Object.freeze(c);
    return Object.freeze(out);
  }
  var BAKED_ROW_508 = bakedRow508(LIGHT_PALETTE);
  var BAKED_ROW_500 = bakedRow500(LIGHT_PALETTE);

  // src/skin/DynamicSkin.ts
  var activePalette = LIGHT_PALETTE;
  var activeRow500 = bakedRow500(LIGHT_PALETTE);
  var activeRow508 = bakedRow508(LIGHT_PALETTE);
  function setActivePalette(p) {
    activePalette = p;
    activeRow500 = bakedRow500(p);
    activeRow508 = bakedRow508(p);
  }
  var ATLAS_SIZE2 = 512;
  function makeAtlasCanvas() {
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(ATLAS_SIZE2, ATLAS_SIZE2);
    }
    const c = document.createElement("canvas");
    c.width = ATLAS_SIZE2;
    c.height = ATLAS_SIZE2;
    return c;
  }
  function parseHex(s) {
    if (s.startsWith("rgba")) {
      const inner = s.slice(s.indexOf("(") + 1, s.lastIndexOf(")"));
      const parts = inner.split(",").map((p) => parseFloat(p));
      return color(parts[0] | 0, parts[1] | 0, parts[2] | 0, Math.round((parts[3] ?? 1) * 255));
    }
    let h = s.startsWith("#") ? s.slice(1) : s;
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const n = parseInt(h, 16);
    return color(n >> 16 & 255, n >> 8 & 255, n & 255, 255);
  }
  function paletteIsDark() {
    const c = parseHex(activePalette.canvasBg);
    return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722 < 96;
  }
  function darkAware(lightValue, darkValue) {
    return paletteIsDark() ? darkValue : lightValue;
  }
  function paletteRgba(hex, alpha) {
    const c = parseHex(hex);
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
  }
  function drawPatch(ctx, x, y, w, h, style) {
    const r = style.borderRadius ?? 0;
    const fill = style.fill;
    const stroke = style.stroke;
    if (fill) {
      ctx.fillStyle = fill;
      if (r > 0) {
        roundRectPath(ctx, x, y, w, h, r);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }
    }
    if (style.bevelLight) {
      ctx.fillStyle = style.bevelLight;
      ctx.fillRect(x + 1, y + 1, w - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, h - 2);
    }
    if (style.bevelDark) {
      ctx.fillStyle = style.bevelDark;
      ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
      ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      if (r > 0) {
        roundRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
        ctx.stroke();
      } else {
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      }
    }
  }
  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  function vGradient(ctx, x, y, h, top, bot) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    return g;
  }
  function hGradient(ctx, x, y, w, left, right) {
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, left);
    g.addColorStop(1, right);
    return g;
  }
  function drawCheckmark(ctx, x, y, color2) {
    ctx.strokeStyle = color2;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 8);
    ctx.lineTo(x + 6, y + 11);
    ctx.lineTo(x + 12, y + 4);
    ctx.stroke();
    ctx.lineCap = "butt";
  }
  function drawRadioDot(ctx, x, y, color2) {
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(x + 7.5, y + 7.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawCircleFrame(ctx, x, y, fill, border) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x + 7.5, y + 7.5, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 7.5, y + 7.5, 6.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  function drawWindowControl(ctx, x, y, state, glyph) {
    let top;
    let bot;
    let glyphColor = "#ffffff";
    if (state === "normal") {
      top = activePalette.titleActiveTop;
      bot = activePalette.titleActiveBottom;
    } else if (state === "hover") {
      top = darkAware("#a4d4f0", activePalette.buttonHoverTop);
      bot = darkAware("#5cb0e0", activePalette.buttonHoverBot);
    } else {
      top = darkAware("#3878ac", activePalette.buttonPressedTop);
      bot = darkAware("#205c90", activePalette.buttonPressedBot);
    }
    drawPatch(ctx, x + 4, y + 4, 23, 23, {
      fill: vGradient(ctx, x + 4, y + 4, 23, top, bot),
      stroke: darkAware("#205c90", state === "normal" ? activePalette.panelBorder : activePalette.accent),
      borderRadius: 2
    });
    ctx.strokeStyle = glyphColor;
    ctx.fillStyle = glyphColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    if (glyph === "close") {
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 11);
      ctx.lineTo(x + 20, y + 20);
      ctx.moveTo(x + 20, y + 11);
      ctx.lineTo(x + 11, y + 20);
      ctx.stroke();
    } else if (glyph === "maxi") {
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 11.5, y + 11.5, 9, 9);
      ctx.fillRect(x + 11, y + 11, 10, 2);
    } else if (glyph === "restore") {
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 13.5, y + 9.5, 7, 7);
      ctx.fillStyle = top;
      ctx.fillRect(x + 11, y + 12, 7, 7);
      ctx.strokeStyle = glyphColor;
      ctx.strokeRect(x + 10.5, y + 11.5, 7, 7);
    } else {
      ctx.fillRect(x + 11, y + 19, 10, 2);
    }
    ctx.lineCap = "butt";
  }
  function drawTriangle(ctx, x, y, dir, color2) {
    ctx.fillStyle = color2;
    ctx.beginPath();
    const cx = x + 7.5;
    const cy = y + 7.5;
    const r = 3.5;
    if (dir === "left") {
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy - r);
      ctx.lineTo(cx + r, cy + r);
    } else if (dir === "right") {
      ctx.moveTo(cx + r, cy);
      ctx.lineTo(cx - r, cy - r);
      ctx.lineTo(cx - r, cy + r);
    } else if (dir === "top") {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx - r, cy + r);
      ctx.lineTo(cx + r, cy + r);
    } else {
      ctx.moveTo(cx, cy + r);
      ctx.lineTo(cx - r, cy - r);
      ctx.lineTo(cx + r, cy - r);
    }
    ctx.closePath();
    ctx.fill();
  }
  function drawSpinnerArrow(ctx, x, y, up, color2) {
    ctx.fillStyle = color2;
    ctx.beginPath();
    if (up) {
      ctx.moveTo(x + 3.5, y + 1.5);
      ctx.lineTo(x + 0.5, y + 5.5);
      ctx.lineTo(x + 6.5, y + 5.5);
    } else {
      ctx.moveTo(x + 3.5, y + 5.5);
      ctx.lineTo(x + 0.5, y + 1.5);
      ctx.lineTo(x + 6.5, y + 1.5);
    }
    ctx.closePath();
    ctx.fill();
  }
  function drawSliderThumb(ctx, x, y, state) {
    let top;
    let bot;
    let border;
    if (state === "normal") {
      top = activePalette.buttonNormalTop;
      bot = activePalette.buttonNormalBot;
      border = activePalette.buttonBorder;
    } else if (state === "hover") {
      top = activePalette.buttonHoverTop;
      bot = activePalette.buttonHoverBot;
      border = activePalette.buttonBorder;
    } else if (state === "down") {
      top = activePalette.buttonPressedTop;
      bot = activePalette.buttonPressedBot;
      border = activePalette.buttonBorder;
    } else {
      top = activePalette.buttonDisabled;
      bot = activePalette.buttonDisabled;
      border = darkAware("#b0b0b0", activePalette.panelBorder);
    }
    drawPatch(ctx, x + 1, y + 1, 13, 13, {
      fill: vGradient(ctx, x + 1, y + 1, 13, top, bot),
      stroke: border,
      borderRadius: 2
    });
  }
  function drawComboButton(ctx, x, y, state) {
    drawSliderThumb(ctx, x, y, state);
    const arrowColor = state === "disabled" ? activePalette.textDisabled : activePalette.textNormal;
    drawTriangle(ctx, x, y, "bottom", arrowColor);
  }
  function drawScrollerArrowButton(ctx, x, y, state, dirIdx) {
    let top;
    let bot;
    let border;
    if (state === "normal") {
      top = activePalette.buttonNormalTop;
      bot = activePalette.buttonNormalBot;
      border = activePalette.buttonBorder;
    } else if (state === "hover") {
      top = activePalette.buttonHoverTop;
      bot = activePalette.buttonHoverBot;
      border = activePalette.buttonBorder;
    } else if (state === "down") {
      top = activePalette.buttonPressedTop;
      bot = activePalette.buttonPressedBot;
      border = activePalette.buttonBorder;
    } else {
      top = activePalette.buttonDisabled;
      bot = activePalette.buttonDisabled;
      border = darkAware("#b0b0b0", activePalette.panelBorder);
    }
    drawPatch(ctx, x, y, 15, 15, {
      fill: vGradient(ctx, x, y, 15, top, bot),
      stroke: border
    });
    const arrowColor = state === "disabled" ? activePalette.textDisabled : activePalette.textNormal;
    const dir = dirIdx === 0 ? "left" : dirIdx === 1 ? "top" : dirIdx === 2 ? "right" : "bottom";
    drawTriangle(ctx, x, y, dir, arrowColor);
  }
  function drawRegion(ctx, d) {
    const { x, y, w, h, name } = d;
    const buttonNormal = () => {
      drawPatch(ctx, x, y, w, h, {
        fill: vGradient(ctx, x, y, h, activePalette.buttonNormalTop, activePalette.buttonNormalBot),
        stroke: activePalette.buttonBorder,
        borderRadius: 3,
        bevelLight: darkAware("rgba(255,255,255,0.5)", "rgba(255,255,255,0.08)")
      });
    };
    const buttonHover = () => {
      drawPatch(ctx, x, y, w, h, {
        fill: vGradient(ctx, x, y, h, activePalette.buttonHoverTop, activePalette.buttonHoverBot),
        stroke: activePalette.accent,
        borderRadius: 3,
        bevelLight: darkAware("rgba(255,255,255,0.6)", "rgba(255,255,255,0.12)")
      });
    };
    const buttonDown = () => {
      drawPatch(ctx, x, y, w, h, {
        fill: vGradient(ctx, x, y, h, activePalette.buttonPressedTop, activePalette.buttonPressedBot),
        stroke: activePalette.buttonBorder,
        borderRadius: 3,
        bevelDark: darkAware("rgba(0,0,0,0.15)", "rgba(0,0,0,0.35)")
      });
    };
    const buttonDisabled = () => {
      drawPatch(ctx, x, y, w, h, {
        fill: activePalette.buttonDisabled,
        stroke: darkAware("#b0b0b0", activePalette.panelBorder),
        borderRadius: 3
      });
    };
    switch (name) {
      // ---- Frame & feedback ----
      case "Shadow": {
        const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w / 2);
        grad.addColorStop(0, "rgba(0,0,0,0.55)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        drawPatch(ctx, x, y, w, h, { fill: grad, borderRadius: 8 });
        return;
      }
      case "Tooltip": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.tooltipBg,
          stroke: activePalette.tooltipBorder,
          borderRadius: 2
        });
        return;
      }
      case "StatusBar": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.statusBarBg,
          stroke: activePalette.panelBorder,
          bevelLight: darkAware("rgba(255,255,255,0.5)", "rgba(255,255,255,0.06)")
        });
        return;
      }
      case "Selection": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.selection,
          borderRadius: 2
        });
        return;
      }
      // ---- Panels ----
      case "Panel.Normal": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelFill,
          stroke: activePalette.panelBorder,
          borderRadius: 4
        });
        return;
      }
      case "Panel.Bright": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelBright,
          stroke: activePalette.panelBorder,
          borderRadius: 4
        });
        return;
      }
      case "Panel.Dark": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelDark,
          stroke: activePalette.panelBorder,
          borderRadius: 4
        });
        return;
      }
      case "Panel.Highlight": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelHighlight,
          stroke: activePalette.accent,
          borderRadius: 4
        });
        return;
      }
      // ---- Window frames ----
      case "Window.Normal":
      case "Window.Inactive": {
        const inactive = name === "Window.Inactive";
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelFill,
          stroke: inactive ? darkAware("#909090", activePalette.panelBorder) : darkAware("#205c90", activePalette.buttonBorder),
          borderRadius: 6
        });
        const titleTop = inactive ? activePalette.titleInactiveTop : activePalette.titleActiveTop;
        const titleBot = inactive ? activePalette.titleInactiveBot : activePalette.titleActiveBottom;
        ctx.save();
        roundRectPath(ctx, x + 1, y + 1, w - 2, 26, 5);
        ctx.clip();
        ctx.fillStyle = vGradient(ctx, x, y, 28, titleTop, titleBot);
        ctx.fillRect(x, y, w, 28);
        ctx.restore();
        return;
      }
      // ---- Window controls ----
      case "Window.Close":
        drawWindowControl(ctx, x, y, "normal", "close");
        return;
      case "Window.Close_Hover":
        drawWindowControl(ctx, x, y, "hover", "close");
        return;
      case "Window.Close_Down":
        drawWindowControl(ctx, x, y, "down", "close");
        return;
      case "Window.Mini":
        drawWindowControl(ctx, x, y, "normal", "mini");
        return;
      case "Window.Mini_Hover":
        drawWindowControl(ctx, x, y, "hover", "mini");
        return;
      case "Window.Mini_Down":
        drawWindowControl(ctx, x, y, "down", "mini");
        return;
      case "Window.Maxi":
        drawWindowControl(ctx, x, y, "normal", "maxi");
        return;
      case "Window.Maxi_Hover":
        drawWindowControl(ctx, x, y, "hover", "maxi");
        return;
      case "Window.Maxi_Down":
        drawWindowControl(ctx, x, y, "down", "maxi");
        return;
      case "Window.Restore":
        drawWindowControl(ctx, x, y, "normal", "restore");
        return;
      case "Window.Restore_Hover":
        drawWindowControl(ctx, x, y, "hover", "restore");
        return;
      case "Window.Restore_Down":
        drawWindowControl(ctx, x, y, "down", "restore");
        return;
      // ---- Checkbox ----
      case "Checkbox.Active.Normal": {
        drawPatch(ctx, x, y, 15, 15, {
          fill: activePalette.textboxBg,
          stroke: activePalette.buttonBorder
        });
        return;
      }
      case "Checkbox.Active.Checked": {
        drawPatch(ctx, x, y, 15, 15, {
          fill: activePalette.textboxBg,
          stroke: activePalette.buttonBorder
        });
        drawCheckmark(ctx, x, y, activePalette.textNormal);
        return;
      }
      case "Checkbox.Disabled.Normal": {
        drawPatch(ctx, x, y, 15, 15, {
          fill: activePalette.buttonDisabled,
          stroke: darkAware("#b0b0b0", activePalette.panelBorder)
        });
        return;
      }
      case "Checkbox.Disabled.Checked": {
        drawPatch(ctx, x, y, 15, 15, {
          fill: activePalette.buttonDisabled,
          stroke: darkAware("#b0b0b0", activePalette.panelBorder)
        });
        drawCheckmark(ctx, x, y, activePalette.textDisabled);
        return;
      }
      // ---- Radio button ----
      case "RadioButton.Active.Normal": {
        drawCircleFrame(ctx, x, y, activePalette.textboxBg, activePalette.buttonBorder);
        return;
      }
      case "RadioButton.Active.Checked": {
        drawCircleFrame(ctx, x, y, activePalette.textboxBg, activePalette.buttonBorder);
        drawRadioDot(ctx, x, y, activePalette.textNormal);
        return;
      }
      case "RadioButton.Disabled.Normal": {
        drawCircleFrame(ctx, x, y, activePalette.buttonDisabled, darkAware("#b0b0b0", activePalette.panelBorder));
        return;
      }
      case "RadioButton.Disabled.Checked": {
        drawCircleFrame(ctx, x, y, activePalette.buttonDisabled, darkAware("#b0b0b0", activePalette.panelBorder));
        drawRadioDot(ctx, x, y, activePalette.textDisabled);
        return;
      }
      // ---- Text box ----
      case "TextBox.Normal": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.textboxBg,
          stroke: activePalette.textboxBorder
        });
        return;
      }
      case "TextBox.Focus": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.textboxBg,
          stroke: activePalette.textboxFocused
        });
        ctx.fillStyle = darkAware("rgba(72,144,196,0.12)", paletteRgba(activePalette.accent, 0.16));
        ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
        return;
      }
      case "TextBox.Disabled": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.buttonDisabled,
          stroke: darkAware("#b0b0b0", activePalette.panelBorder)
        });
        return;
      }
      // ---- Menu ----
      case "Menu.Strip": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.menuStripBg,
          bevelLight: darkAware("#ffffff", "rgba(255,255,255,0.08)"),
          bevelDark: darkAware("#a0a0a0", "rgba(0,0,0,0.35)")
        });
        return;
      }
      case "Menu.BackgroundWithMargin":
      case "Menu.Background": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelFill,
          stroke: activePalette.panelBorder
        });
        if (name === "Menu.BackgroundWithMargin") {
          ctx.fillStyle = darkAware("#dcdcdc", activePalette.panelDark);
          ctx.fillRect(x + 1, y + 1, 22, h - 2);
          ctx.fillStyle = activePalette.panelBorder;
          ctx.fillRect(x + 23, y + 1, 1, h - 2);
        }
        return;
      }
      case "Menu.Hover": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.menuHoverBg,
          borderRadius: 2
        });
        return;
      }
      case "Menu.RightArrow": {
        drawTriangle(ctx, x, y, "right", activePalette.textNormal);
        return;
      }
      case "Menu.Check": {
        drawCheckmark(ctx, x, y, activePalette.textNormal);
        return;
      }
      // ---- Tab ----
      case "Tab.Control": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelFill,
          stroke: activePalette.panelBorder,
          borderRadius: 3
        });
        return;
      }
      case "Tab.HeaderBar": {
        drawPatch(ctx, x, y, w, h, {
          fill: vGradient(ctx, x, y, h, activePalette.panelDark, activePalette.panelFill),
          stroke: activePalette.panelBorder
        });
        return;
      }
      case "Tab.Top.Active":
      case "Tab.Bottom.Active":
      case "Tab.Left.Active":
      case "Tab.Right.Active": {
        drawPatch(ctx, x, y, w, h, {
          fill: vGradient(ctx, x, y, h, activePalette.tabActiveTop, activePalette.tabActiveBot),
          stroke: darkAware(activePalette.buttonBorder, activePalette.panelBorder),
          borderRadius: 3
        });
        return;
      }
      case "Tab.Top.Inactive":
      case "Tab.Bottom.Inactive":
      case "Tab.Left.Inactive":
      case "Tab.Right.Inactive": {
        drawPatch(ctx, x, y, w, h, {
          fill: vGradient(ctx, x, y, h, activePalette.tabInactiveTop, activePalette.tabInactiveBot),
          stroke: darkAware(activePalette.buttonBorder, activePalette.panelBorder),
          borderRadius: 3
        });
        return;
      }
      // ---- Tree ----
      case "Tree.Background": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.textboxBg,
          stroke: activePalette.panelBorder
        });
        return;
      }
      case "Tree.Plus": {
        drawPatch(ctx, x + 3, y + 3, 9, 9, {
          fill: activePalette.textboxBg,
          stroke: darkAware("#808080", activePalette.panelBorder)
        });
        ctx.fillStyle = activePalette.textNormal;
        ctx.fillRect(x + 5, y + 7, 5, 1);
        ctx.fillRect(x + 7, y + 5, 1, 5);
        return;
      }
      case "Tree.Minus": {
        drawPatch(ctx, x + 3, y + 3, 9, 9, {
          fill: activePalette.textboxBg,
          stroke: darkAware("#808080", activePalette.panelBorder)
        });
        ctx.fillStyle = activePalette.textNormal;
        ctx.fillRect(x + 5, y + 7, 5, 1);
        return;
      }
      // ---- Input.Button ----
      case "Input.Button.Normal":
        buttonNormal();
        return;
      case "Input.Button.Hovered":
        buttonHover();
        return;
      case "Input.Button.Pressed":
        buttonDown();
        return;
      case "Input.Button.Disabled":
        buttonDisabled();
        return;
      // ---- Scroller arrow buttons ----
      case "Scroller.Button.Normal[0]":
        drawScrollerArrowButton(ctx, x, y, "normal", 0);
        return;
      case "Scroller.Button.Normal[1]":
        drawScrollerArrowButton(ctx, x, y, "normal", 1);
        return;
      case "Scroller.Button.Normal[2]":
        drawScrollerArrowButton(ctx, x, y, "normal", 2);
        return;
      case "Scroller.Button.Normal[3]":
        drawScrollerArrowButton(ctx, x, y, "normal", 3);
        return;
      case "Scroller.Button.Hover[0]":
        drawScrollerArrowButton(ctx, x, y, "hover", 0);
        return;
      case "Scroller.Button.Hover[1]":
        drawScrollerArrowButton(ctx, x, y, "hover", 1);
        return;
      case "Scroller.Button.Hover[2]":
        drawScrollerArrowButton(ctx, x, y, "hover", 2);
        return;
      case "Scroller.Button.Hover[3]":
        drawScrollerArrowButton(ctx, x, y, "hover", 3);
        return;
      case "Scroller.Button.Down[0]":
        drawScrollerArrowButton(ctx, x, y, "down", 0);
        return;
      case "Scroller.Button.Down[1]":
        drawScrollerArrowButton(ctx, x, y, "down", 1);
        return;
      case "Scroller.Button.Down[2]":
        drawScrollerArrowButton(ctx, x, y, "down", 2);
        return;
      case "Scroller.Button.Down[3]":
        drawScrollerArrowButton(ctx, x, y, "down", 3);
        return;
      // Disabled arrow buckets live at x>=512 (off-canvas in the upstream
      // layout). Skip painting; consumers fall back to Scroller.Button.Normal.
      case "Scroller.Button.Disabled[0]":
      case "Scroller.Button.Disabled[1]":
      case "Scroller.Button.Disabled[2]":
      case "Scroller.Button.Disabled[3]":
        return;
      // ---- Scroller bars/tracks ----
      case "Scroller.TrackV":
      case "Scroller.TrackH": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.scrollTrack,
          stroke: activePalette.scrollTrackBorder
        });
        return;
      }
      case "Scroller.ButtonV_Normal":
      case "Scroller.ButtonH_Normal": {
        const horiz = name === "Scroller.ButtonH_Normal";
        drawPatch(ctx, x, y, w, h, {
          fill: horiz ? vGradient(ctx, x, y, h, activePalette.scrollThumbTop, activePalette.scrollThumbBot) : hGradient(ctx, x, y, w, activePalette.scrollThumbTop, activePalette.scrollThumbBot),
          stroke: activePalette.scrollThumbBorder,
          borderRadius: 2
        });
        return;
      }
      case "Scroller.ButtonV_Hover":
      case "Scroller.ButtonH_Hover": {
        const horiz = name === "Scroller.ButtonH_Hover";
        drawPatch(ctx, x, y, w, h, {
          fill: horiz ? vGradient(ctx, x, y, h, activePalette.buttonHoverTop, activePalette.buttonHoverBot) : hGradient(ctx, x, y, w, activePalette.buttonHoverTop, activePalette.buttonHoverBot),
          stroke: activePalette.accent,
          borderRadius: 2
        });
        return;
      }
      case "Scroller.ButtonV_Down":
      case "Scroller.ButtonH_Down": {
        const horiz = name === "Scroller.ButtonH_Down";
        drawPatch(ctx, x, y, w, h, {
          fill: horiz ? vGradient(ctx, x, y, h, activePalette.buttonPressedTop, activePalette.buttonPressedBot) : hGradient(ctx, x, y, w, activePalette.buttonPressedTop, activePalette.buttonPressedBot),
          stroke: activePalette.buttonBorder,
          borderRadius: 2
        });
        return;
      }
      case "Scroller.ButtonV_Disabled":
      case "Scroller.ButtonH_Disabled": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.buttonDisabled,
          stroke: darkAware("#b0b0b0", activePalette.panelBorder),
          borderRadius: 2
        });
        return;
      }
      // ---- Input.ListBox ----
      case "Input.ListBox.Background": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.textboxBg,
          stroke: activePalette.panelBorder
        });
        return;
      }
      case "Input.ListBox.Hovered": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.buttonHoverBot
        });
        return;
      }
      case "Input.ListBox.EvenLine": {
        return;
      }
      case "Input.ListBox.OddLine": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelBright
        });
        return;
      }
      case "Input.ListBox.EvenLineSelected":
      case "Input.ListBox.OddLineSelected": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.selection
        });
        return;
      }
      // ---- Input.ComboBox ----
      case "Input.ComboBox.Normal":
        buttonNormal();
        return;
      case "Input.ComboBox.Hover":
        buttonHover();
        return;
      case "Input.ComboBox.Down":
        buttonDown();
        return;
      case "Input.ComboBox.Disabled":
        buttonDisabled();
        return;
      case "Input.ComboBox.Button.Normal":
        drawComboButton(ctx, x, y, "normal");
        return;
      case "Input.ComboBox.Button.Hover":
        drawComboButton(ctx, x, y, "hover");
        return;
      case "Input.ComboBox.Button.Down":
        drawComboButton(ctx, x, y, "down");
        return;
      case "Input.ComboBox.Button.Disabled":
        drawComboButton(ctx, x, y, "disabled");
        return;
      // ---- Input.UpDown ----
      case "Input.UpDown.Up.Normal":
        drawSpinnerArrow(ctx, x, y, true, activePalette.textNormal);
        return;
      case "Input.UpDown.Up.Hover":
        drawSpinnerArrow(ctx, x, y, true, activePalette.accent);
        return;
      case "Input.UpDown.Up.Down":
        drawSpinnerArrow(ctx, x, y, true, darkAware("#205c90", activePalette.textNormal));
        return;
      case "Input.UpDown.Up.Disabled":
        drawSpinnerArrow(ctx, x, y, true, activePalette.textDisabled);
        return;
      case "Input.UpDown.Down.Normal":
        drawSpinnerArrow(ctx, x, y, false, activePalette.textNormal);
        return;
      case "Input.UpDown.Down.Hover":
        drawSpinnerArrow(ctx, x, y, false, activePalette.accent);
        return;
      case "Input.UpDown.Down.Down":
        drawSpinnerArrow(ctx, x, y, false, darkAware("#205c90", activePalette.textNormal));
        return;
      case "Input.UpDown.Down.Disabled":
        drawSpinnerArrow(ctx, x, y, false, activePalette.textDisabled);
        return;
      // ---- ProgressBar ----
      case "ProgressBar.Back": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.progressBack,
          stroke: activePalette.panelBorder,
          borderRadius: 2
        });
        return;
      }
      case "ProgressBar.Front": {
        drawPatch(ctx, x, y, w, h, {
          fill: vGradient(ctx, x, y, h, darkAware("#33e858", "#6f879f"), activePalette.progressFront),
          stroke: darkAware("#008818", "#7e91a4"),
          borderRadius: 2
        });
        return;
      }
      // ---- Input.Slider thumbs ----
      case "Input.Slider.H.Normal":
        drawSliderThumb(ctx, x, y, "normal");
        return;
      case "Input.Slider.H.Hover":
        drawSliderThumb(ctx, x, y, "hover");
        return;
      case "Input.Slider.H.Down":
        drawSliderThumb(ctx, x, y, "down");
        return;
      case "Input.Slider.H.Disabled":
        drawSliderThumb(ctx, x, y, "disabled");
        return;
      case "Input.Slider.V.Normal":
        drawSliderThumb(ctx, x, y, "normal");
        return;
      case "Input.Slider.V.Hover":
        drawSliderThumb(ctx, x, y, "hover");
        return;
      case "Input.Slider.V.Down":
        drawSliderThumb(ctx, x, y, "down");
        return;
      case "Input.Slider.V.Disabled":
        drawSliderThumb(ctx, x, y, "disabled");
        return;
      // ---- CategoryList ----
      case "CategoryList.Outer": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.panelFill,
          stroke: activePalette.panelBorder,
          borderRadius: 4
        });
        return;
      }
      case "CategoryList.Inner": {
        drawPatch(ctx, x, y, w, h, {
          fill: activePalette.textboxBg,
          stroke: activePalette.panelBorder
        });
        ctx.fillStyle = vGradient(ctx, x + 1, y + 1, 18, activePalette.titleActiveTop, activePalette.titleActiveBottom);
        ctx.fillRect(x + 1, y + 1, w - 2, 18);
        ctx.fillStyle = darkAware("#205c90", activePalette.panelBorder);
        ctx.fillRect(x + 1, y + 19, w - 2, 1);
        return;
      }
      case "CategoryList.Header": {
        drawPatch(ctx, x, y, w, h, {
          fill: vGradient(ctx, x, y, h, activePalette.titleActiveTop, activePalette.titleActiveBottom),
          stroke: darkAware("#205c90", activePalette.panelBorder),
          borderRadius: 3
        });
        return;
      }
      // ---- GroupBox ----
      case "GroupBox": {
        drawPatch(ctx, x, y, w, h, {
          fill: "rgba(0,0,0,0)",
          stroke: activePalette.panelBorder,
          borderRadius: 3
        });
        return;
      }
      default: {
        drawPatch(ctx, x, y, w, h, { fill: "#ff00ff" });
        return;
      }
    }
  }
  var DynamicSkin = class {
    constructor(renderer) {
      this.tex = texture("DynamicSkin");
      this.regionMap = /* @__PURE__ */ new Map();
      this.initialized = false;
      this.currentPalette = LIGHT_PALETTE;
      this.renderer = renderer;
      this.regions = this.regionMap;
      this.colors = buildSkinColors();
    }
    init() {
      if (this.initialized) return;
      this.initialized = true;
      for (const d of REGIONS) this.recordRegion(d);
      this.paint();
    }
    /**
     * Swap the active palette and re-paint the atlas. The texture
     * handle stays stable (callers' references remain valid); only the
     * pixels and the `colors` struct change. No-op if the same palette
     * is already active.
     */
    setTheme(palette) {
      if (this.currentPalette === palette) return;
      this.currentPalette = palette;
      if (this.initialized) this.paint();
      else {
        setActivePalette(palette);
        this.colors = buildSkinColors();
      }
    }
    getPalette() {
      return this.currentPalette;
    }
    // Paint the offscreen atlas canvas using `currentPalette` and
    // re-upload to the GPU. Called once from `init()` and again from
    // every `setTheme()` after init.
    paint() {
      setActivePalette(this.currentPalette);
      const canvas = makeAtlasCanvas();
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("DynamicSkin: 2D context unavailable");
      }
      ctx.clearRect(0, 0, ATLAS_SIZE2, ATLAS_SIZE2);
      ctx.imageSmoothingEnabled = false;
      for (const d of REGIONS) {
        if (d.x >= ATLAS_SIZE2 || d.y >= ATLAS_SIZE2) continue;
        drawRegion(ctx, d);
      }
      bakeColorStrip(ctx);
      this.renderer.loadTextureFromSource(this.tex, canvas);
      this.tex.width = ATLAS_SIZE2;
      this.tex.height = ATLAS_SIZE2;
      this.tex.name = "DynamicSkin";
      this.colors = buildSkinColors();
    }
    getTexture() {
      return this.tex;
    }
    recordRegion(d) {
      const inv = 1 / ATLAS_SIZE2;
      const uv = [
        d.x * inv,
        d.y * inv,
        (d.x + d.w) * inv,
        (d.y + d.h) * inv
      ];
      if (d.type === "bordered") {
        this.regionMap.set(d.name, {
          type: "bordered",
          x: d.x,
          y: d.y,
          w: d.w,
          h: d.h,
          marginLeft: d.m[0],
          marginTop: d.m[1],
          marginRight: d.m[2],
          marginBottom: d.m[3],
          uv
        });
      } else {
        this.regionMap.set(d.name, {
          type: "single",
          x: d.x,
          y: d.y,
          w: d.w,
          h: d.h,
          uv
        });
      }
    }
  };
  function bakeColorStrip(ctx) {
    for (let n = 0; n < activeRow508.length; n++) {
      ctx.fillStyle = activeRow508[n].hex;
      ctx.fillRect(4 + 8 * n, 508, 8, 4);
    }
    for (let n = 0; n < activeRow500.length; n++) {
      ctx.fillStyle = activeRow500[n].hex;
      ctx.fillRect(4 + 8 * n, 500, 8, 4);
    }
  }
  function buildSkinColors() {
    const find = (row, name) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i].name === name) return parseHex(row[i].hex);
      }
      return color(255, 0, 255, 255);
    };
    return {
      window: {
        titleActive: find(activeRow508, "Window.TitleActive"),
        titleInactive: find(activeRow508, "Window.TitleInactive")
      },
      button: {
        normal: find(activeRow508, "Button.Normal"),
        hover: find(activeRow508, "Button.Hover"),
        down: find(activeRow500, "Button.Down"),
        disabled: find(activeRow500, "Button.Disabled"),
        bright: parseHex(activePalette.panelBright),
        dark: parseHex(activePalette.panelDark)
      },
      tab: {
        active: { normal: find(activeRow508, "Tab.Active.Normal") },
        inactive: { normal: find(activeRow508, "Tab.Inactive.Normal") }
      },
      label: {
        default: find(activeRow508, "Label.Default"),
        bright: find(activeRow508, "Label.Bright"),
        dark: find(activeRow500, "Label.Dark"),
        highlight: find(activeRow500, "Label.Highlight")
      },
      tree: {
        lines: find(activeRow508, "Tree.Lines"),
        normal: find(activeRow508, "Tree.Normal"),
        hover: find(activeRow500, "Tree.Hover"),
        selected: find(activeRow500, "Tree.Selected")
      },
      properties: {
        line_normal: find(activeRow508, "Properties.Line_Normal"),
        line_selected: find(activeRow508, "Properties.Line_Selected"),
        line_hover: find(activeRow500, "Properties.Line_Hover"),
        title: find(activeRow500, "Properties.Title"),
        column_normal: find(activeRow508, "Properties.Column_Normal"),
        column_selected: find(activeRow508, "Properties.Column_Selected"),
        column_hover: find(activeRow500, "Properties.Column_Hover"),
        label_normal: find(activeRow508, "Properties.Label_Normal"),
        label_selected: find(activeRow508, "Properties.Label_Selected"),
        label_hover: find(activeRow500, "Properties.Label_Hover"),
        border: find(activeRow500, "Properties.Border")
      },
      modalBackground: find(activeRow508, "ModalBackground"),
      tooltipText: find(activeRow508, "TooltipText"),
      category: {
        header: find(activeRow500, "Category.Header"),
        header_closed: find(activeRow500, "Category.Header_Closed"),
        line: {
          text: find(activeRow508, "Category.Line.Text"),
          text_hover: find(activeRow508, "Category.Line.Text_Hover"),
          text_selected: find(activeRow500, "Category.Line.Text_Selected"),
          button: find(activeRow500, "Category.Line.Button"),
          button_hover: find(activeRow508, "Category.Line.Button_Hover"),
          button_selected: find(activeRow508, "Category.Line.Button_Selected")
        },
        line_alt: {
          text: find(activeRow500, "Category.LineAlt.Text"),
          text_hover: find(activeRow500, "Category.LineAlt.Text_Hover"),
          text_selected: find(activeRow508, "Category.LineAlt.Text_Selected"),
          button: find(activeRow508, "Category.LineAlt.Button"),
          button_hover: find(activeRow500, "Category.LineAlt.Button_Hover"),
          button_selected: find(activeRow500, "Category.LineAlt.Button_Selected")
        }
      }
    };
  }

  // src/core/Input.ts
  var Key = {
    Invalid: 0,
    Return: 1,
    Backspace: 2,
    Delete: 3,
    Left: 4,
    Right: 5,
    Shift: 6,
    Tab: 7,
    Space: 8,
    Home: 9,
    End: 10,
    Control: 11,
    Up: 12,
    Down: 13,
    Escape: 14,
    Alt: 15,
    Command: 16,
    Count: 17
  };
  function mapKey(keyString) {
    switch (keyString) {
      case "Enter":
        return Key.Return;
      case "Backspace":
        return Key.Backspace;
      case "Delete":
        return Key.Delete;
      case "ArrowLeft":
        return Key.Left;
      case "ArrowRight":
        return Key.Right;
      case "ArrowUp":
        return Key.Up;
      case "ArrowDown":
        return Key.Down;
      case "Shift":
        return Key.Shift;
      case "Tab":
        return Key.Tab;
      case " ":
        return Key.Space;
      case "Home":
        return Key.Home;
      case "End":
        return Key.End;
      case "Control":
        return Key.Control;
      case "Escape":
        return Key.Escape;
      case "Alt":
        return Key.Alt;
      case "Meta":
        return Key.Command;
      default:
        return Key.Invalid;
    }
  }
  function clientToCanvas(event, element) {
    const rect2 = element.getBoundingClientRect();
    return [Math.round(event.clientX - rect2.left), Math.round(event.clientY - rect2.top)];
  }
  var didWarn = false;
  function safeCall(fn) {
    try {
      fn();
    } catch (err) {
      if (!didWarn) {
        didWarn = true;
        console.error("[GwenJs] InputTarget threw; further errors suppressed:", err);
      }
    }
  }
  function attachInput(element, target, options) {
    const longPressMs = options?.longPressMs ?? 500;
    const longPressSlopPx = options?.longPressSlopPx ?? 10;
    if (element.tabIndex < 0) element.tabIndex = 0;
    element.style.touchAction = "none";
    let prevX = 0;
    let prevY = 0;
    const pressedButtons = /* @__PURE__ */ new Set();
    const pressedKeys = /* @__PURE__ */ new Set();
    const activePointers = /* @__PURE__ */ new Map();
    let longPressTimer = null;
    let longPressStartX = 0;
    let longPressStartY = 0;
    let longPressPointerId = null;
    let pendingRightUp = false;
    let leftDownEmitted = false;
    let twoFingerActive = false;
    function emitMove(x, y) {
      const dx = x - prevX;
      const dy = y - prevY;
      prevX = x;
      prevY = y;
      safeCall(() => {
        target.inputMouseMoved(x, y, dx, dy);
      });
    }
    function emitButton(button, pressed) {
      if (pressed) pressedButtons.add(button);
      else pressedButtons.delete(button);
      safeCall(() => {
        target.inputMouseButton(button, pressed);
      });
    }
    function clearLongPress() {
      if (longPressTimer != null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      longPressPointerId = null;
    }
    function onPointerDown(e) {
      const [x, y] = clientToCanvas(e, element);
      prevX = x;
      prevY = y;
      if (typeof element.setPointerCapture === "function") {
        try {
          element.setPointerCapture(e.pointerId);
        } catch {
        }
      }
      activePointers.set(e.pointerId, { x, y, pointerType: e.pointerType });
      if (e.pointerType === "touch") {
        if (activePointers.size >= 2) {
          clearLongPress();
          if (leftDownEmitted) {
            emitButton(0, false);
            leftDownEmitted = false;
          }
          if (!twoFingerActive) {
            twoFingerActive = true;
            emitButton(2, true);
          }
          return;
        }
        longPressStartX = x;
        longPressStartY = y;
        longPressPointerId = e.pointerId;
        leftDownEmitted = false;
        pendingRightUp = false;
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          if (!leftDownEmitted) {
            emitButton(2, true);
            pendingRightUp = true;
          }
        }, longPressMs);
        return;
      }
      emitButton(e.button, true);
    }
    function onPointerMove(e) {
      const [x, y] = clientToCanvas(e, element);
      const tracked = activePointers.get(e.pointerId);
      if (tracked !== void 0) {
        tracked.x = x;
        tracked.y = y;
      }
      if (longPressTimer != null && e.pointerId === longPressPointerId) {
        const dx = x - longPressStartX;
        const dy = y - longPressStartY;
        if (dx * dx + dy * dy > longPressSlopPx * longPressSlopPx) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          if (!leftDownEmitted && !twoFingerActive) {
            emitButton(0, true);
            leftDownEmitted = true;
          }
        }
      }
      emitMove(x, y);
    }
    function onPointerUp(e) {
      const [x, y] = clientToCanvas(e, element);
      activePointers.delete(e.pointerId);
      if (typeof element.releasePointerCapture === "function") {
        try {
          element.releasePointerCapture(e.pointerId);
        } catch {
        }
      }
      if (e.pointerType === "touch") {
        if (twoFingerActive) {
          if (activePointers.size === 0) {
            emitButton(2, false);
            twoFingerActive = false;
          }
          return;
        }
        if (pendingRightUp) {
          emitButton(2, false);
          pendingRightUp = false;
        } else if (leftDownEmitted) {
          emitButton(0, false);
          leftDownEmitted = false;
        } else {
          clearLongPress();
          emitMove(x, y);
          emitButton(0, true);
          emitButton(0, false);
        }
        clearLongPress();
        return;
      }
      emitButton(e.button, false);
    }
    function onPointerCancel(e) {
      activePointers.delete(e.pointerId);
      if (typeof element.releasePointerCapture === "function") {
        try {
          element.releasePointerCapture(e.pointerId);
        } catch {
        }
      }
      if (e.pointerType === "touch") {
        clearLongPress();
        if (twoFingerActive && activePointers.size === 0) {
          emitButton(2, false);
          twoFingerActive = false;
        } else if (leftDownEmitted) {
          emitButton(0, false);
          leftDownEmitted = false;
        } else if (pendingRightUp) {
          emitButton(2, false);
          pendingRightUp = false;
        }
        return;
      }
      for (const btn of Array.from(pressedButtons)) {
        emitButton(btn, false);
      }
    }
    function onPointerLeave(_e) {
      safeCall(() => {
        target.inputMouseMoved(-1, -1, 0, 0);
      });
      prevX = -1;
      prevY = -1;
    }
    function onWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      if (e.deltaY === 0) return;
      const v = -Math.sign(e.deltaY) * 60;
      safeCall(() => {
        target.inputMouseWheel(v);
      });
    }
    function onContextMenu(e) {
      e.preventDefault();
    }
    function onKeyDown(e) {
      if (target.inputAccelerator && (e.ctrlKey || e.metaKey) && e.key.length === 1 && e.key !== " " && e.key !== "Control" && e.key !== "Meta") {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
        if (e.shiftKey) parts.push("Shift");
        if (e.altKey) parts.push("Alt");
        parts.push(e.key.toUpperCase());
        const accel = parts.join("+");
        let consumed2 = false;
        safeCall(() => {
          consumed2 = target.inputAccelerator(accel);
        });
        if (consumed2) {
          e.preventDefault();
          return;
        }
      }
      const k = mapKey(e.key);
      if (k === Key.Invalid) return;
      pressedKeys.add(k);
      let consumed = false;
      safeCall(() => {
        consumed = target.inputKey(k, true);
      });
      if (consumed) e.preventDefault();
    }
    function onKeyUp(e) {
      const k = mapKey(e.key);
      if (k === Key.Invalid) return;
      pressedKeys.delete(k);
      let consumed = false;
      safeCall(() => {
        consumed = target.inputKey(k, false);
      });
      if (consumed) e.preventDefault();
    }
    function onKeyPress(e) {
      if (e.key.length !== 1) return;
      const ch = e.key;
      safeCall(() => {
        target.inputCharacter(ch);
      });
    }
    function onBlur() {
      for (const btn of Array.from(pressedButtons)) {
        safeCall(() => {
          target.inputMouseButton(btn, false);
        });
      }
      pressedButtons.clear();
      for (const k of Array.from(pressedKeys)) {
        safeCall(() => {
          target.inputKey(k, false);
        });
      }
      pressedKeys.clear();
      clearLongPress();
      activePointers.clear();
      pendingRightUp = false;
      leftDownEmitted = false;
      twoFingerActive = false;
    }
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerCancel);
    element.addEventListener("pointerleave", onPointerLeave);
    element.addEventListener("pointerout", onPointerLeave);
    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("contextmenu", onContextMenu);
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("keyup", onKeyUp);
    element.addEventListener("keypress", onKeyPress);
    element.addEventListener("blur", onBlur);
    return function detach() {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerCancel);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("pointerout", onPointerLeave);
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("contextmenu", onContextMenu);
      element.removeEventListener("keydown", onKeyDown);
      element.removeEventListener("keyup", onKeyUp);
      element.removeEventListener("keypress", onKeyPress);
      element.removeEventListener("blur", onBlur);
      clearLongPress();
      activePointers.clear();
      pressedButtons.clear();
      pressedKeys.clear();
    };
  }

  // src/controls/Base.ts
  var Base = class _Base {
    constructor(parent, name = "") {
      // ---- hierarchy ----
      this._parent = null;
      this._actualParent = null;
      this._innerPanel = null;
      this._children = [];
      this._name = "";
      // ---- bounds / layout ----
      this._bounds = rect(0, 0, 10, 10);
      // Seed renderBounds to match initial bounds. Otherwise controls whose
      // bounds are never explicitly changed (inner panels of ScrollControl,
      // etc.) have a (0,0,0,0) renderBounds that collapses their children's
      // layout to zero-height strips.
      this._renderBounds = rect(0, 0, 10, 10);
      this._innerBounds = rect();
      this._margin = { top: 0, bottom: 0, left: 0, right: 0 };
      this._padding = { top: 0, bottom: 0, left: 0, right: 0 };
      this._dock = Pos.None;
      // ---- flags ----
      this._hidden = false;
      this._disabled = false;
      this._mouseInputEnabled = true;
      this._keyboardInputEnabled = false;
      this._tabable = false;
      this._tabBoundary = false;
      this._shouldDrawBackground = true;
      this._needsLayout = true;
      this._includeInSize = true;
      this._restrictToParent = false;
      // ---- skin / cursor / tooltip ----
      this._skin = null;
      this._cursor = CursorType.Normal;
      this._toolTip = null;
      // ---- context menu ----
      // Stored as `Base` (not `Menu`) to avoid an import cycle: `Menu`
      // already imports `Base` as a runtime dependency, and a runtime
      // import in the other direction would loop. Callers pass a `Menu`
      // instance; Canvas narrows back to `Menu` via `instanceof` before
      // opening.
      this._contextMenu = null;
      // Accelerator → handler bindings. Populated by `addAccelerator` (used
      // e.g. by MenuItem.setAccelerator). Canvas.inputAccelerator walks the
      // tree calling `handleAccelerator(text)` until a control consumes it.
      this._accelerators = /* @__PURE__ */ new Map();
      // ---- drag-and-drop ----
      this._dragAndDropPackage = null;
      // ---- signals ----
      this.onHoverEnter = new Signal();
      this.onHoverLeave = new Signal();
      this._name = name;
      if (parent) this.setParent(parent);
    }
    // =======================================================================
    // Hierarchy
    // =======================================================================
    get parent() {
      return this._parent;
    }
    get actualParent() {
      return this._actualParent;
    }
    setParent(p) {
      if (this._parent === p) return;
      if (this._parent) this._parent.removeChild(this);
      this._parent = p;
      this._actualParent = null;
      if (p) p.addChild(this);
    }
    // Children land on innerPanel when one is installed (scroll controls etc).
    // The innerPanel wiring makes the outer control look like a normal parent
    // to user code while internally routing layout through a sub-panel.
    addChild(c) {
      if (this._innerPanel) {
        this._innerPanel.addChild(c);
        return;
      }
      this._children.push(c);
      this.onChildAdded(c);
      c._actualParent = this;
    }
    removeChild(c) {
      if (this._innerPanel === c) {
        this._innerPanel = null;
      }
      if (this._innerPanel) {
        this._innerPanel.removeChild(c);
      }
      const i = this._children.indexOf(c);
      if (i !== -1) {
        this._children.splice(i, 1);
        this.onChildRemoved(c);
      }
    }
    removeAllChildren() {
      while (this._children.length > 0) {
        this.removeChild(this._children[0]);
      }
    }
    get children() {
      if (this._innerPanel) return this._innerPanel.children;
      return this._children;
    }
    numChildren() {
      return this._children.length;
    }
    getChild(i) {
      if (i < 0 || i >= this._children.length) return null;
      return this._children[i];
    }
    isChild(c) {
      return this._children.indexOf(c) !== -1;
    }
    findChildByName(name, recursive = false) {
      for (let i = 0; i < this._children.length; i++) {
        const ch = this._children[i];
        if (ch._name !== "" && ch._name === name) return ch;
        if (recursive) {
          const sub = ch.findChildByName(name, true);
          if (sub) return sub;
        }
      }
      return null;
    }
    // Walks up to the root; T010's Canvas subclass overrides this to return
    // `this` so controls can reach canvas-wide state.
    getCanvas() {
      const p = this._parent;
      if (!p) return null;
      return p.getCanvas();
    }
    sendToBack() {
      const ap = this._actualParent;
      if (!ap) return;
      const arr = ap._children;
      if (arr.length === 0 || arr[0] === this) return;
      const i = arr.indexOf(this);
      if (i === -1) return;
      arr.splice(i, 1);
      arr.unshift(this);
      this.invalidateParent();
    }
    bringToFront() {
      const ap = this._actualParent;
      if (!ap) return;
      const arr = ap._children;
      if (arr.length === 0 || arr[arr.length - 1] === this) return;
      const i = arr.indexOf(this);
      if (i === -1) return;
      arr.splice(i, 1);
      arr.push(this);
      this.invalidateParent();
      this.redraw();
    }
    bringNextToControl(child, before) {
      const ap = this._actualParent;
      if (!ap) return;
      const arr = ap._children;
      const mi = arr.indexOf(this);
      if (mi !== -1) arr.splice(mi, 1);
      let i = arr.indexOf(child);
      if (i === -1) {
        this.bringToFront();
        return;
      }
      if (before) {
        i += 1;
        if (i >= arr.length) {
          this.bringToFront();
          return;
        }
      }
      arr.splice(i, 0, this);
      this.invalidateParent();
    }
    // Install `p` as the inner panel. Subsequent `addChild` calls route here.
    // GWEN subclasses set `m_InnerPanel` directly; we expose a helper so the
    // field can stay private on the outside while subclasses compose cleanly.
    setInnerPanel(p) {
      this._innerPanel = p;
    }
    getInnerPanel() {
      return this._innerPanel;
    }
    // =======================================================================
    // Touch propagation (GWEN's Base::Touch / Base::OnChildTouched).
    //
    // Window, TreeNode, and ComboBox rely on this to bubble "you are part of
    // an interactive chain" signals up the tree — e.g. touching a menu item
    // bubbles up so the menu knows a descendant is still alive. Base's
    // default walks to the parent; subclasses override `onChildTouched` to
    // react (e.g. bring-to-front).
    // =======================================================================
    touch() {
      if (this._parent) this._parent.onChildTouched(this);
    }
    onChildTouched(_child) {
      this.touch();
    }
    // Whether this control participates in the menu accelerator / close-on-
    // outside-click chain. Walks UP the parent chain so any descendant of a
    // Menu (the popup body, its scroll container, its MenuItems) inherits
    // the truthy answer. Matches GWEN Base::IsMenuComponent (Base.cpp:903).
    isMenuComponent() {
      if (!this._parent) return false;
      return this._parent.isMenuComponent();
    }
    // True for controls that own a popup menu currently shown (ComboBox,
    // MenuItem on a strip). Canvas's outside-click `closeMenus` skips these
    // so the owner's own click handler can run and toggle its menu.
    ownsOpenMenu() {
      return false;
    }
    // Recursively asks every descendant to close any open menus. Base just
    // walks the tree; Menu overrides to actually close itself + descendants.
    // Matches GWEN Base::CloseMenus (Base.cpp:910).
    closeMenus() {
      for (let i = 0; i < this._children.length; i++) {
        this._children[i].closeMenus();
      }
    }
    // =======================================================================
    // Name
    // =======================================================================
    setName(s) {
      this._name = s;
    }
    getName() {
      return this._name;
    }
    // =======================================================================
    // Bounds / layout
    // =======================================================================
    x() {
      return this._bounds.x;
    }
    y() {
      return this._bounds.y;
    }
    width() {
      return this._bounds.w;
    }
    height() {
      return this._bounds.h;
    }
    bottom() {
      return this._bounds.y + this._bounds.h + this._margin.bottom;
    }
    right() {
      return this._bounds.x + this._bounds.w + this._margin.right;
    }
    getPos() {
      return { x: this._bounds.x, y: this._bounds.y };
    }
    setPos(x, y) {
      this.setBounds(x, y, this._bounds.w, this._bounds.h);
    }
    setWidth(w) {
      this.setSize(w, this._bounds.h);
    }
    setHeight(h) {
      this.setSize(this._bounds.w, h);
    }
    setSize(w, h) {
      return this.setBounds(this._bounds.x, this._bounds.y, w, h);
    }
    getSize() {
      return { x: this._bounds.w, y: this._bounds.h };
    }
    setBounds(rOrX, y, w, h) {
      let nx;
      let ny;
      let nw;
      let nh;
      if (typeof rOrX === "number") {
        nx = rOrX;
        ny = y ?? 0;
        nw = w ?? 0;
        nh = h ?? 0;
      } else {
        nx = rOrX.x;
        ny = rOrX.y;
        nw = rOrX.w;
        nh = rOrX.h;
      }
      const b = this._bounds;
      if (b.x === nx && b.y === ny && b.w === nw && b.h === nh) return false;
      const old = cloneRect(b);
      b.x = nx;
      b.y = ny;
      b.w = nw;
      b.h = nh;
      this.onBoundsChanged(old);
      return true;
    }
    getBounds() {
      return this._bounds;
    }
    getRenderBounds() {
      return this._renderBounds;
    }
    // Virtual hook — default places the render window flush with the
    // control's local origin. Subclasses with a drop-shadow or outset visual
    // expand here.
    updateRenderBounds() {
      this._renderBounds.x = 0;
      this._renderBounds.y = 0;
      this._renderBounds.w = this._bounds.w;
      this._renderBounds.h = this._bounds.h;
    }
    getInnerBounds() {
      return this._innerBounds;
    }
    getPadding() {
      return this._padding;
    }
    setPadding(p) {
      const cur = this._padding;
      if (cur.left === p.left && cur.top === p.top && cur.right === p.right && cur.bottom === p.bottom) {
        return;
      }
      this._padding = { top: p.top, bottom: p.bottom, left: p.left, right: p.right };
      this.invalidate();
      this.invalidateParent();
    }
    getMargin() {
      return this._margin;
    }
    setMargin(m) {
      const cur = this._margin;
      if (cur.left === m.left && cur.top === m.top && cur.right === m.right && cur.bottom === m.bottom) {
        return;
      }
      this._margin = { top: m.top, bottom: m.bottom, left: m.left, right: m.right };
      this.invalidate();
      this.invalidateParent();
    }
    dock(pos) {
      if (this._dock === pos) return;
      this._dock = pos;
      this.invalidate();
      this.invalidateParent();
    }
    getDock() {
      return this._dock;
    }
    // Aligns this control within its parent's inner bounds. Matches
    // `Gwen::Controls::Base::Position` at Base.cpp:190.
    position(pos, xpad = 0, ypad = 0) {
      const parent = this._parent;
      if (!parent) return;
      const bounds = parent.getInnerBounds();
      const m = this._margin;
      let x = this._bounds.x;
      let y = this._bounds.y;
      if (pos & Pos.Left) x = bounds.x + xpad + m.left;
      if (pos & Pos.Right) x = bounds.x + (bounds.w - this._bounds.w - xpad - m.right);
      if (pos & Pos.CenterH) x = bounds.x + (bounds.w - this._bounds.w) * 0.5;
      if (pos & Pos.Top) y = bounds.y + ypad;
      if (pos & Pos.Bottom) y = bounds.y + (bounds.h - this._bounds.h - ypad);
      if (pos & Pos.CenterV) y = bounds.y + (bounds.h - this._bounds.h) * 0.5;
      this.setPos(x, y);
    }
    moveTo(x, y) {
      if (this._restrictToParent && this._parent) {
        const p = this._parent;
        const pm = p.getMargin();
        const pad = this._padding;
        if (x - pad.left < pm.left) x = pm.left + pad.left;
        if (y - pad.top < pm.top) y = pm.top + pad.top;
        if (x + this._bounds.w + pad.right > p.width() - pm.right) {
          x = p.width() - pm.right - this._bounds.w - pad.right;
        }
        if (y + this._bounds.h + pad.bottom > p.height() - pm.bottom) {
          y = p.height() - pm.bottom - this._bounds.h - pad.bottom;
        }
      }
      this.setBounds(x, y, this._bounds.w, this._bounds.h);
    }
    moveBy(dx, dy) {
      this.moveTo(this._bounds.x + dx, this._bounds.y + dy);
    }
    setRestrictToParent(b) {
      this._restrictToParent = b;
    }
    shouldRestrictToParent() {
      return this._restrictToParent;
    }
    doNotIncludeInSize() {
      this._includeInSize = false;
    }
    shouldIncludeInSize() {
      return this._includeInSize;
    }
    childrenSize() {
      let x = 0;
      let y = 0;
      for (let i = 0; i < this._children.length; i++) {
        const c = this._children[i];
        if (c._hidden) continue;
        if (!c._includeInSize) continue;
        if (c.right() > x) x = c.right();
        if (c.bottom() > y) y = c.bottom();
      }
      return { x, y };
    }
    sizeToChildren(w = true, h = true) {
      const size = this.childrenSize();
      size.y += this._padding.bottom;
      size.x += this._padding.right;
      return this.setSize(w ? size.x : this._bounds.w, h ? size.y : this._bounds.h);
    }
    // Minimum size floor used by Resizer and future layout clamps. GWEN exposes
    // this as a virtual so Window / Panel subclasses can enforce chrome
    // budgets; Base's default is a 1×1 square so pathological drags don't
    // collapse the target to a zero-size rect.
    getMinimumSize() {
      return point(1, 1);
    }
    // =======================================================================
    // Visibility / disabled / input flags
    // =======================================================================
    setHidden(b) {
      if (this._hidden === b) return;
      this._hidden = b;
      this.invalidate();
      this.redraw();
    }
    hidden() {
      return this._hidden;
    }
    isVisible() {
      if (this._hidden) return false;
      if (this._parent) return this._parent.isVisible();
      return true;
    }
    hide() {
      this.setHidden(true);
    }
    show() {
      this.setHidden(false);
    }
    setDisabled(b) {
      if (this._disabled === b) return;
      this._disabled = b;
      this.redraw();
    }
    isDisabled() {
      return this._disabled;
    }
    setMouseInputEnabled(b) {
      this._mouseInputEnabled = b;
    }
    getMouseInputEnabled() {
      return this._mouseInputEnabled;
    }
    setKeyboardInputEnabled(b) {
      this._keyboardInputEnabled = b;
    }
    getKeyboardInputEnabled() {
      return this._keyboardInputEnabled;
    }
    needsInputChars() {
      return false;
    }
    isTabable() {
      return this._tabable;
    }
    setTabable(b) {
      this._tabable = b;
    }
    shouldDrawBackground() {
      return this._shouldDrawBackground;
    }
    setShouldDrawBackground(b) {
      this._shouldDrawBackground = b;
    }
    shouldClip() {
      return true;
    }
    // =======================================================================
    // Invalidation / redraw
    // =======================================================================
    invalidate() {
      this._needsLayout = true;
    }
    invalidateParent() {
      if (this._parent) this._parent.invalidate();
    }
    invalidateChildren(recursive = false) {
      for (let i = 0; i < this._children.length; i++) {
        const c = this._children[i];
        c.invalidate();
        if (recursive) c.invalidateChildren(true);
      }
      if (this._innerPanel) {
        for (let i = 0; i < this._innerPanel._children.length; i++) {
          const c = this._innerPanel._children[i];
          c.invalidate();
          if (recursive) c.invalidateChildren(true);
        }
      }
    }
    needsLayout() {
      return this._needsLayout;
    }
    // Walks up to the canvas and marks the frame dirty. Until T010 supplies
    // a real canvas, this is a best-effort walk — safe to call pre-canvas
    // because it simply no-ops at the root.
    redraw() {
      const canvas = this.getCanvas();
      if (canvas) canvas.redraw();
    }
    // =======================================================================
    // Layout pipeline
    // =======================================================================
    // RecurseLayout — the heart of GWEN's docking layout. Ported line-for-
    // line from Base.cpp:747.
    recurseLayout(skin) {
      if (this._skin) skin = this._skin;
      if (this._hidden) return;
      if (this._needsLayout) {
        this._needsLayout = false;
        this.layout(skin);
      }
      const rb = this._renderBounds;
      let bx = rb.x + this._padding.left;
      let by = rb.y + this._padding.top;
      let bw = rb.w - this._padding.left - this._padding.right;
      let bh = rb.h - this._padding.top - this._padding.bottom;
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        if (child._hidden) continue;
        const iDock = child._dock;
        if (iDock & Pos.Fill) continue;
        if (iDock & Pos.Top) {
          const m = child._margin;
          child.setBounds(bx + m.left, by + m.top, bw - m.left - m.right, child.height());
          const iHeight = m.top + m.bottom + child.height();
          by += iHeight;
          bh -= iHeight;
        }
        if (iDock & Pos.Left) {
          const m = child._margin;
          child.setBounds(bx + m.left, by + m.top, child.width(), bh - m.top - m.bottom);
          const iWidth = m.left + m.right + child.width();
          bx += iWidth;
          bw -= iWidth;
        }
        if (iDock & Pos.Right) {
          const m = child._margin;
          child.setBounds(bx + bw - child.width() - m.right, by + m.top, child.width(), bh - m.top - m.bottom);
          const iWidth = m.left + m.right + child.width();
          bw -= iWidth;
        }
        if (iDock & Pos.Bottom) {
          const m = child._margin;
          child.setBounds(bx + m.left, by + bh - child.height() - m.bottom, bw - m.left - m.right, child.height());
          bh -= child.height() + m.bottom + m.top;
        }
        child.recurseLayout(skin);
      }
      this._innerBounds.x = bx;
      this._innerBounds.y = by;
      this._innerBounds.w = bw;
      this._innerBounds.h = bh;
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        const iDock = child._dock;
        if (!(iDock & Pos.Fill)) continue;
        const m = child._margin;
        child.setBounds(bx + m.left, by + m.top, bw - m.left - m.right, bh - m.top - m.bottom);
        child.recurseLayout(skin);
      }
      this.postLayout(skin);
      const canvas = this.getCanvas();
      if (canvas && this._tabable && !this._disabled) {
        if (!canvas.firstTab) canvas.firstTab = this;
        if (!canvas.nextTab) canvas.nextTab = this;
        canvas.tabList.push(this);
      }
      if (canvas && canvas.keyboardFocus === this) {
        canvas.nextTab = null;
      }
    }
    // Override hooks — empty by default. Canvas and custom controls override.
    layout(_skin) {
    }
    postLayout(_skin) {
    }
    // =======================================================================
    // Render pipeline
    // =======================================================================
    doRender(skin) {
      if (this._skin) skin = this._skin;
      this.think();
      this.renderRecursive(skin, this._bounds);
    }
    renderRecursive(skin, cliprect) {
      const render = skin.renderer;
      const oldOffset = render.getRenderOffset();
      render.addRenderOffset(cliprect);
      this.renderUnder(skin);
      const oldClip = cloneRect(render.clipRegion());
      if (this.shouldClip()) {
        render.addClipRegion(cliprect);
        if (!render.clipRegionVisible()) {
          render.setRenderOffset(oldOffset);
          render.setClipRegion(oldClip);
          return;
        }
      }
      render.startClip();
      this.render(skin);
      for (let i = 0; i < this._children.length; i++) {
        const c = this._children[i];
        if (c._hidden) continue;
        c.doRender(skin);
      }
      render.endClip();
      render.setClipRegion(oldClip);
      render.startClip();
      this.renderOver(skin);
      this.renderFocus(skin);
      render.endClip();
      render.setRenderOffset(oldOffset);
    }
    // Virtual render hooks. Empty by default; subclasses override.
    render(_skin) {
    }
    renderUnder(_skin) {
    }
    renderOver(_skin) {
    }
    renderFocus(skin) {
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this._tabable) return;
      skin.drawKeyboardHighlight(this, this._renderBounds, 3);
    }
    // =======================================================================
    // Skin
    // =======================================================================
    getSkin() {
      if (this._skin) return this._skin;
      if (this._parent) return this._parent.getSkin();
      throw new Error("Base.getSkin(): no skin set anywhere in the control tree");
    }
    setSkin(s, doChildren = false) {
      if (this._skin === s) return;
      this._skin = s;
      this.invalidate();
      this.redraw();
      this.onSkinChanged(s);
      if (doChildren) {
        for (let i = 0; i < this._children.length; i++) {
          this._children[i].setSkin(s, true);
        }
      }
    }
    onSkinChanged(_s) {
    }
    // =======================================================================
    // Coordinate conversion
    // =======================================================================
    localPosToCanvas(p) {
      if (this._parent) {
        let x = p.x + this._bounds.x;
        let y = p.y + this._bounds.y;
        const parentInner = this._parent._innerPanel;
        if (parentInner && parentInner.isChild(this)) {
          x += parentInner.x();
          y += parentInner.y();
        }
        return this._parent.localPosToCanvas({ x, y });
      }
      return p;
    }
    canvasPosToLocal(p) {
      if (this._parent) {
        let x = p.x - this._bounds.x;
        let y = p.y - this._bounds.y;
        const parentInner = this._parent._innerPanel;
        if (parentInner && parentInner.isChild(this)) {
          x -= parentInner.x();
          y -= parentInner.y();
        }
        return this._parent.canvasPosToLocal({ x, y });
      }
      return p;
    }
    // =======================================================================
    // Mouse
    // =======================================================================
    onMouseMoved(_x, _y, _dx, _dy) {
    }
    // Mouse wheel bubbles up through actualParent (so scroll panels can grab
    // it even when a non-scrollable child is hovered).
    onMouseWheeled(delta) {
      if (this._actualParent) return this._actualParent.onMouseWheeled(delta);
      return false;
    }
    onMouseClickLeft(_x, _y, _pressed) {
    }
    onMouseClickRight(_x, _y, _pressed) {
    }
    onMouseDoubleClickLeft(x, y) {
      this.onMouseClickLeft(x, y, true);
    }
    onMouseDoubleClickRight(x, y) {
      this.onMouseClickRight(x, y, true);
    }
    onMouseEnter() {
      const ev = {
        controlCaller: this,
        control: null,
        data: null,
        string: "",
        point: { x: 0, y: 0 },
        integer: 0
      };
      this.onHoverEnter.emit(ev);
      this.redraw();
    }
    onMouseLeave() {
      const ev = {
        controlCaller: this,
        control: null,
        data: null,
        string: "",
        point: { x: 0, y: 0 },
        integer: 0
      };
      this.onHoverLeave.emit(ev);
      this.redraw();
    }
    isHovered() {
      const c = this.getCanvas();
      return !!c && c.hoveredControl === this;
    }
    shouldDrawHover() {
      const c = this.getCanvas();
      if (!c) return false;
      return c.mouseFocus === this || c.mouseFocus === null;
    }
    // =======================================================================
    // Focus + keyboard
    // =======================================================================
    focus() {
      const canvas = this.getCanvas();
      if (!canvas) return;
      if (canvas.keyboardFocus === this) return;
      if (canvas.keyboardFocus) canvas.keyboardFocus.onLostKeyboardFocus();
      canvas.keyboardFocus = this;
      this.onKeyboardFocus();
      this.redraw();
    }
    blur() {
      const canvas = this.getCanvas();
      if (!canvas) return;
      if (canvas.keyboardFocus !== this) return;
      canvas.keyboardFocus = null;
      this.onLostKeyboardFocus();
      this.redraw();
    }
    hasFocus() {
      const c = this.getCanvas();
      return !!c && c.keyboardFocus === this;
    }
    onKeyboardFocus() {
    }
    onLostKeyboardFocus() {
    }
    // Dispatches a key press to the appropriate on<Key>* handler, then
    // bubbles unhandled keys to the parent. Matches Base.cpp:1042.
    onKeyPress(key, pressed = true) {
      let handled = false;
      switch (key) {
        case 7:
          handled = this.onKeyTab(pressed);
          break;
        // Tab
        case 8:
          handled = this.onKeySpace(pressed);
          break;
        // Space
        case 9:
          handled = this.onKeyHome(pressed);
          break;
        // Home
        case 10:
          handled = this.onKeyEnd(pressed);
          break;
        // End
        case 1:
          handled = this.onKeyReturn(pressed);
          break;
        // Return
        case 2:
          handled = this.onKeyBackspace(pressed);
          break;
        // Backspace
        case 3:
          handled = this.onKeyDelete(pressed);
          break;
        // Delete
        case 5:
          handled = this.onKeyRight(pressed);
          break;
        // Right
        case 4:
          handled = this.onKeyLeft(pressed);
          break;
        // Left
        case 12:
          handled = this.onKeyUp(pressed);
          break;
        // Up
        case 13:
          handled = this.onKeyDown(pressed);
          break;
        // Down
        case 14:
          handled = this.onKeyEscape(pressed);
          break;
        // Escape
        default:
          break;
      }
      if (!handled && this._parent) {
        this._parent.onKeyPress(key, pressed);
      }
      return handled;
    }
    onKeyRelease(key) {
      return this.onKeyPress(key, false);
    }
    onChar(_ch) {
      return false;
    }
    // Tab navigation scope. When true, Tab navigation rooted inside
    // this control stays inside it instead of leaking out to siblings
    // — used by WindowControl, Modal, DockBase, and TabControl pages.
    // The canvas itself is the outermost implicit boundary, so leaving
    // every other control at `false` keeps the existing single-cycle
    // behaviour for free-form layouts.
    isTabBoundary() {
      return this._tabBoundary;
    }
    setTabBoundary(b) {
      this._tabBoundary = b;
    }
    onKeyTab(down) {
      if (!down) return true;
      const canvas = this.getCanvas();
      if (!canvas) return true;
      const fullList = canvas.tabList;
      if (fullList.length === 0) return true;
      const reverse = canvas.isShiftDown();
      const focus = canvas.keyboardFocus;
      const scope = focus ? findTabScope(focus) : null;
      const list = scope === null ? fullList.filter((c) => findTabScope(c) === null) : fullList.filter((c) => c === scope || isWithinTabScope(c, scope));
      if (list.length === 0) return true;
      const idx = focus ? list.indexOf(focus) : -1;
      let next;
      if (idx === -1) {
        next = reverse ? list[list.length - 1] : list[0];
      } else {
        const n = list.length;
        next = list[(idx + (reverse ? -1 : 1) + n) % n];
      }
      next.focus();
      this.redraw();
      return true;
    }
    onKeyReturn(_down) {
      return false;
    }
    onKeySpace(_down) {
      return false;
    }
    onKeyBackspace(_down) {
      return false;
    }
    onKeyDelete(_down) {
      return false;
    }
    onKeyRight(_down) {
      return false;
    }
    onKeyLeft(_down) {
      return false;
    }
    onKeyHome(_down) {
      return false;
    }
    onKeyEnd(_down) {
      return false;
    }
    onKeyUp(_down) {
      return false;
    }
    onKeyDown(_down) {
      return false;
    }
    onKeyEscape(_down) {
      return false;
    }
    // =======================================================================
    // Hit test
    // =======================================================================
    // Children are walked in reverse (last = top-most). The first child that
    // claims the point wins; if none do, `this` claims iff it's mouse-enabled.
    getControlAt(x, y, onlyIfMouseEnabled = true) {
      if (this._hidden) return null;
      if (x < 0 || y < 0 || x >= this._bounds.w || y >= this._bounds.h) return null;
      for (let i = this._children.length - 1; i >= 0; i--) {
        const child = this._children[i];
        const found = child.getControlAt(x - child.x(), y - child.y(), onlyIfMouseEnabled);
        if (found) return found;
      }
      if (onlyIfMouseEnabled && !this._mouseInputEnabled) return null;
      return this;
    }
    // =======================================================================
    // Cursor + tooltip
    // =======================================================================
    setCursor(c) {
      this._cursor = c;
    }
    updateCursor() {
      const canvas = this.getCanvas();
      if (canvas) canvas.setCursor(this._cursor);
    }
    // Accelerator (keyboard shortcut) bindings. The string is normalised to
    // a canonical form (`"Ctrl+Shift+N"`) so the lookup is case-insensitive
    // and modifier-order-insensitive.
    addAccelerator(text, handler) {
      this._accelerators.set(canonicalAccelerator(text), handler);
    }
    removeAccelerator(text) {
      this._accelerators.delete(canonicalAccelerator(text));
    }
    hasAccelerator(text) {
      return this._accelerators.has(canonicalAccelerator(text));
    }
    // Walks this subtree looking for a control whose accelerator matches.
    // Returns true once a handler fires (caller stops at the first match).
    // Uses `this.children` (the getter) so we transparently descend into
    // any innerPanel (ScrollControl, Menu, etc.). Visibility is *not* a
    // gate — a closed File menu still owns its `Ctrl+N` accelerator,
    // which is the whole reason the shortcut exists.
    handleAccelerator(text) {
      if (this._disabled) return false;
      const key = canonicalAccelerator(text);
      const h = this._accelerators.get(key);
      if (h) {
        h();
        return true;
      }
      for (const c of this.children) {
        if (c.handleAccelerator(text)) return true;
      }
      return false;
    }
    setToolTip(text) {
      if (!text) {
        this.setToolTipControl(null);
        return;
      }
      const tip = new _Base(null);
      tip.setName(text);
      this.setToolTipControl(tip);
    }
    setToolTipControl(c) {
      if (this._toolTip && this._toolTip !== c) {
        this._toolTip.setParent(null);
      }
      this._toolTip = c;
      if (c) {
        c.setParent(this);
        c.setHidden(true);
      }
    }
    getToolTip() {
      return this._toolTip;
    }
    // =======================================================================
    // Context menu
    //
    // Each control may attach a `Menu` to be shown on right-click. When
    // the user right-clicks anywhere on the canvas, `Canvas` walks the
    // hovered-control's parent chain calling `onContextMenuRequest(x, y)`
    // and opens the first non-null `Menu` it finds. A control with no
    // explicit menu defers to its parent; `Canvas` itself extends `Base`,
    // so `canvas.setContextMenu(...)` becomes the global "background"
    // menu shown when nothing in the chain overrides.
    //
    // The field is typed `Base` to avoid a runtime import cycle (`Menu`
    // already imports `Base`); callers pass a `Menu` and `Canvas`
    // narrows back to `Menu` via `instanceof` before opening.
    // =======================================================================
    /**
     * Attach a context menu (right-click menu) to this control. Pass
     * `null` to clear. The menu is not destroyed by this call — it stays
     * around for future right-clicks until the caller disposes it.
     *
     * The menu should be parented to the canvas (or another top-level
     * container) so it draws above everything else; `Canvas` will
     * reparent automatically if needed when the menu is opened.
     */
    setContextMenu(menu) {
      this._contextMenu = menu;
    }
    getContextMenu() {
      return this._contextMenu;
    }
    /**
     * Hook called by Canvas on right-click to find the menu to show.
     * Default returns the menu set via `setContextMenu`. Override this
     * to build menus dynamically (populate items based on the click
     * location, suppress for certain regions, etc.). Return `null` to
     * defer to the parent in the chain — Canvas walks up until something
     * returns a non-null menu.
     */
    onContextMenuRequest(_x, _y) {
      return this._contextMenu;
    }
    // =======================================================================
    // Protected hooks
    // =======================================================================
    onBoundsChanged(oldBounds) {
      if (this._parent) this._parent.onChildBoundsChanged(oldBounds, this);
      if (this._bounds.w !== oldBounds.w || this._bounds.h !== oldBounds.h) {
        this.invalidate();
      }
      this.redraw();
      this.updateRenderBounds();
    }
    onChildBoundsChanged(_oldBounds, _child) {
    }
    onChildAdded(_child) {
      this.invalidate();
    }
    onChildRemoved(_child) {
      this.invalidate();
    }
    // =======================================================================
    // Teardown
    // =======================================================================
    dispose() {
      const rootCanvas = this.getCanvas();
      if (rootCanvas && typeof rootCanvas.preDeleteCanvas === "function") {
        rootCanvas.preDeleteCanvas(this);
      }
      for (let i = this._children.length - 1; i >= 0; i--) {
        this._children[i].dispose();
      }
      this._children.length = 0;
      if (this._parent) {
        this._parent.removeChild(this);
        this._parent = null;
      }
      this._actualParent = null;
      this.onHoverEnter.clear();
      this.onHoverLeave.clear();
      const canvas = this.getCanvas();
      if (canvas) {
        if (canvas.hoveredControl === this) canvas.hoveredControl = null;
        if (canvas.keyboardFocus === this) canvas.keyboardFocus = null;
        if (canvas.mouseFocus === this) canvas.mouseFocus = null;
      }
    }
    // =======================================================================
    // Think (per-frame hook)
    // =======================================================================
    think() {
    }
    // =======================================================================
    // Clipboard hooks
    // =======================================================================
    onPaste() {
    }
    onCopy() {
    }
    onCut() {
    }
    onSelectAll() {
    }
    // =======================================================================
    // Drag-and-drop (giver + receiver)
    //
    // The dispatch loop lives in `Canvas.inputMouseMoved` /
    // `Canvas.inputMouseButton`: a press over a draggable control records a
    // candidate, threshold movement promotes the candidate to an active
    // drag (calling `StartDragging`), every subsequent move dispatches
    // `HoverEnter` / `Hover` / `HoverLeave` to whichever ancestor of the
    // pointer's hit-test result accepts the package, and release calls
    // `HandleDrop`. Subclasses override these hooks to opt-in (DockBase is
    // the canonical receiver; TabButton + TabTitleBar are canonical
    // sources). The base no-ops are deliberate — they let any control
    // reach the dispatch path without forcing all of them to participate.
    // =======================================================================
    dragAndDrop_SetPackage(draggable, name = "", userdata = null) {
      if (!this._dragAndDropPackage) {
        this._dragAndDropPackage = {
          name: "",
          userdata: null,
          draggable: false,
          drawcontrol: null,
          holdoffset: { x: 0, y: 0 }
        };
      }
      this._dragAndDropPackage.draggable = draggable;
      this._dragAndDropPackage.name = name;
      this._dragAndDropPackage.userdata = userdata;
    }
    dragAndDrop_Draggable() {
      if (!this._dragAndDropPackage) return false;
      return this._dragAndDropPackage.draggable;
    }
    dragAndDrop_GetPackage(_x, _y) {
      return this._dragAndDropPackage;
    }
    // Default: take ownership of the package by recording the grab offset
    // (so the drag preview hangs off the pointer at the correct anchor)
    // and pointing `drawcontrol` at this control.
    dragAndDrop_StartDragging(p, x, y) {
      p.holdoffset = this.canvasPosToLocal({ x, y });
      p.drawcontrol = this;
      return true;
    }
    dragAndDrop_ShouldStartDrag() {
      return true;
    }
    dragAndDrop_EndDragging(_success, _x, _y) {
    }
    dragAndDrop_HoverEnter(_p, _x, _y) {
    }
    dragAndDrop_HoverLeave(_p) {
    }
    dragAndDrop_Hover(_p, _x, _y) {
    }
    // Default: receivers acknowledge the drop. The actual reparenting (or
    // any other side effect) is the subclass's job — see DockBase for the
    // `TabButtonMove` / `TabWindowMove` handling.
    dragAndDrop_HandleDrop(_p, _x, _y) {
      return true;
    }
    dragAndDrop_CanAcceptPackage(_p) {
      return false;
    }
  };
  function findTabScope(ctrl) {
    let p = ctrl.parent;
    while (p) {
      if (p.isTabBoundary()) return p;
      p = p.parent;
    }
    return null;
  }
  function isWithinTabScope(ctrl, scope) {
    let p = ctrl.parent;
    while (p) {
      if (p === scope) return true;
      if (p.isTabBoundary()) return false;
      p = p.parent;
    }
    return false;
  }
  function canonicalAccelerator(text) {
    const parts = text.split("+").map((p) => p.trim().toUpperCase()).filter((p) => p.length > 0);
    if (parts.length === 0) return "";
    const order = { CTRL: 0, SHIFT: 1, ALT: 2, META: 3, CMD: 3 };
    parts.sort((a, b) => {
      const ai = a in order ? order[a] : 99;
      const bi = b in order ? order[b] : 99;
      if (ai === bi) return a < b ? -1 : 1;
      return ai - bi;
    });
    return parts.map((p) => p === "CMD" ? "META" : p).join("+");
  }

  // src/skin/Skin.ts
  function paletteColor(hex) {
    let h = hex.startsWith("#") ? hex.slice(1) : hex;
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return color(n >> 16 & 255, n >> 8 & 255, n & 255, 255);
  }
  function paletteIsDark2(palette) {
    const c = paletteColor(palette.canvasBg);
    return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722 < 96;
  }
  var ATLAS_SIZE3 = 512;
  var HALF_TEXEL = 0.5 / ATLAS_SIZE3;
  var P_TL = 0;
  var P_T = 1;
  var P_TR = 2;
  var P_L = 3;
  var P_C = 4;
  var P_R = 5;
  var P_BL = 6;
  var P_B = 7;
  var P_BR = 8;
  var WHITE = color(255, 255, 255, 255);
  var Skin = class {
    constructor(renderer) {
      this.defaultFont = font("Arial", 14);
      this.renderer = renderer;
      this.dynamicSkin = new DynamicSkin(renderer);
    }
    init() {
      this.dynamicSkin.init();
    }
    get colors() {
      return this.dynamicSkin.colors;
    }
    /**
     * Swap the active palette and re-paint the atlas. Use the stock
     * `LIGHT_PALETTE` / `DARK_PALETTE` exports from `AtlasRegions`, or
     * supply your own object that satisfies the `Palette` shape.
     * Texture handle stays stable; controls keep working without
     * re-construction.
     */
    setTheme(palette) {
      this.dynamicSkin.setTheme(palette);
    }
    getPalette() {
      return this.dynamicSkin.getPalette();
    }
    // ======================================================================
    // 9-slice + single helpers
    // ======================================================================
    // drawBordered — 9-slice blit. `patchMask`, when supplied, is a length-9
    // boolean array; `patchMask[i] === false` suppresses patch `i` (used by
    // DrawGroupBox to punch a hole where the title sits).
    drawBordered(regionName, r, col = WHITE, patchMask) {
      const region = this.dynamicSkin.regions.get(regionName);
      if (!region) return;
      const tex = this.dynamicSkin.getTexture();
      this.renderer.setDrawColor(col);
      const ml = region.marginLeft ?? 0;
      const mt = region.marginTop ?? 0;
      const mr = region.marginRight ?? 0;
      const mb = region.marginBottom ?? 0;
      const uvLeft = region.uv[0] + HALF_TEXEL;
      const uvTop = region.uv[1] + HALF_TEXEL;
      const uvRight = region.uv[2] - HALF_TEXEL;
      const uvBottom = region.uv[3] - HALF_TEXEL;
      if (r.w < region.w && r.h < region.h) {
        this.renderer.drawTexturedRect(tex, r, uvLeft, uvTop, uvRight, uvBottom);
        return;
      }
      const uv0 = uvLeft;
      const uv1 = region.uv[0] + ml / ATLAS_SIZE3;
      const uv2 = region.uv[2] - mr / ATLAS_SIZE3;
      const uv3 = uvRight;
      const vv0 = uvTop;
      const vv1 = region.uv[1] + mt / ATLAS_SIZE3;
      const vv2 = region.uv[3] - mb / ATLAS_SIZE3;
      const vv3 = uvBottom;
      const rx = r.x;
      const ry = r.y;
      const rw = r.w;
      const rh = r.h;
      const midW = rw - ml - mr;
      const midH = rh - mt - mb;
      const mask = patchMask;
      const skip = (i) => mask !== void 0 && mask[i] === false;
      if (!skip(P_TL)) this.renderer.drawTexturedRect(tex, rect(rx, ry, ml, mt), uv0, vv0, uv1, vv1);
      if (!skip(P_T)) this.renderer.drawTexturedRect(tex, rect(rx + ml, ry, midW, mt), uv1, vv0, uv2, vv1);
      if (!skip(P_TR)) this.renderer.drawTexturedRect(tex, rect(rx + ml + midW, ry, mr, mt), uv2, vv0, uv3, vv1);
      if (!skip(P_L)) this.renderer.drawTexturedRect(tex, rect(rx, ry + mt, ml, midH), uv0, vv1, uv1, vv2);
      if (!skip(P_C)) this.renderer.drawTexturedRect(tex, rect(rx + ml, ry + mt, midW, midH), uv1, vv1, uv2, vv2);
      if (!skip(P_R)) this.renderer.drawTexturedRect(tex, rect(rx + ml + midW, ry + mt, mr, midH), uv2, vv1, uv3, vv2);
      if (!skip(P_BL)) this.renderer.drawTexturedRect(tex, rect(rx, ry + mt + midH, ml, mb), uv0, vv2, uv1, vv3);
      if (!skip(P_B)) this.renderer.drawTexturedRect(tex, rect(rx + ml, ry + mt + midH, midW, mb), uv1, vv2, uv2, vv3);
      if (!skip(P_BR)) this.renderer.drawTexturedRect(tex, rect(rx + ml + midW, ry + mt + midH, mr, mb), uv2, vv2, uv3, vv3);
    }
    drawSingle(regionName, r, col = WHITE) {
      const region = this.dynamicSkin.regions.get(regionName);
      if (!region) return;
      this.renderer.setDrawColor(col);
      this.renderer.drawTexturedRect(
        this.dynamicSkin.getTexture(),
        r,
        region.uv[0] + HALF_TEXEL,
        region.uv[1] + HALF_TEXEL,
        region.uv[2] - HALF_TEXEL,
        region.uv[3] - HALF_TEXEL
      );
    }
    drawSingleCentered(regionName, r, col = WHITE) {
      const region = this.dynamicSkin.regions.get(regionName);
      if (!region) return;
      const cx = r.x + (r.w - region.w) * 0.5;
      const cy = r.y + (r.h - region.h) * 0.5;
      this.renderer.setDrawColor(col);
      this.renderer.drawTexturedRect(
        this.dynamicSkin.getTexture(),
        rect(cx, cy, region.w, region.h),
        region.uv[0] + HALF_TEXEL,
        region.uv[1] + HALF_TEXEL,
        region.uv[2] - HALF_TEXEL,
        region.uv[3] - HALF_TEXEL
      );
    }
    // ======================================================================
    // Primitive symbols — ported from Skin.cpp:25-78
    // ======================================================================
    drawArrowDown(r) {
      const x = r.w / 5;
      const y = r.h / 5;
      this.renderer.drawFilledRect(rect(r.x + x * 0, r.y + y * 1, x, y * 1));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 1, x, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 2, r.y + y * 1, x, y * 3));
      this.renderer.drawFilledRect(rect(r.x + x * 3, r.y + y * 1, x, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 4, r.y + y * 1, x, y * 1));
    }
    drawArrowUp(r) {
      const x = r.w / 5;
      const y = r.h / 5;
      this.renderer.drawFilledRect(rect(r.x + x * 0, r.y + y * 3, x, y * 1));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 2, x, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 2, r.y + y * 1, x, y * 3));
      this.renderer.drawFilledRect(rect(r.x + x * 3, r.y + y * 2, x, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 4, r.y + y * 3, x, y * 1));
    }
    drawArrowLeft(r) {
      const x = r.w / 5;
      const y = r.h / 5;
      this.renderer.drawFilledRect(rect(r.x + x * 3, r.y + y * 0, x * 1, y));
      this.renderer.drawFilledRect(rect(r.x + x * 2, r.y + y * 1, x * 2, y));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 2, x * 3, y));
      this.renderer.drawFilledRect(rect(r.x + x * 2, r.y + y * 3, x * 2, y));
      this.renderer.drawFilledRect(rect(r.x + x * 3, r.y + y * 4, x * 1, y));
    }
    drawArrowRight(r) {
      const x = r.w / 5;
      const y = r.h / 5;
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 0, x * 1, y));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 1, x * 2, y));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 2, x * 3, y));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 3, x * 2, y));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 4, x * 1, y));
    }
    drawCheck(r) {
      const x = r.w / 5;
      const y = r.h / 5;
      this.renderer.drawFilledRect(rect(r.x + x * 0, r.y + y * 3, x * 2, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 1, r.y + y * 4, x * 2, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 2, r.y + y * 3, x * 2, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 3, r.y + y * 1, x * 2, y * 2));
      this.renderer.drawFilledRect(rect(r.x + x * 4, r.y + y * 0, x * 2, y * 2));
    }
    // ======================================================================
    // Button / input bordered
    // ======================================================================
    drawGenericPanel(ctrl) {
      this.drawBordered("Panel.Normal", ctrl.getRenderBounds());
    }
    drawButton(ctrl, depressed, hovered, disabled) {
      if (disabled) {
        this.drawBordered("Input.Button.Disabled", ctrl.getRenderBounds());
        return;
      }
      if (depressed) {
        this.drawBordered("Input.Button.Pressed", ctrl.getRenderBounds());
        return;
      }
      if (hovered) {
        this.drawBordered("Input.Button.Hovered", ctrl.getRenderBounds());
        return;
      }
      this.drawBordered("Input.Button.Normal", ctrl.getRenderBounds());
    }
    drawTextBox(ctrl) {
      if (ctrl.isDisabled()) {
        this.drawBordered("TextBox.Disabled", ctrl.getRenderBounds());
        return;
      }
      if (ctrl.hasFocus()) {
        this.drawBordered("TextBox.Focus", ctrl.getRenderBounds());
      } else {
        this.drawBordered("TextBox.Normal", ctrl.getRenderBounds());
      }
    }
    // ======================================================================
    // Checkbox / radio
    // ======================================================================
    drawCheckBox(ctrl, checked, _depressed) {
      const disabled = ctrl.isDisabled();
      const key = checked ? disabled ? "Checkbox.Disabled.Checked" : "Checkbox.Active.Checked" : disabled ? "Checkbox.Disabled.Normal" : "Checkbox.Active.Normal";
      this.drawSingle(key, ctrl.getRenderBounds());
    }
    drawRadioButton(ctrl, selected, _depressed) {
      const disabled = ctrl.isDisabled();
      const key = selected ? disabled ? "RadioButton.Disabled.Checked" : "RadioButton.Active.Checked" : disabled ? "RadioButton.Disabled.Normal" : "RadioButton.Active.Normal";
      this.drawSingle(key, ctrl.getRenderBounds());
    }
    // ======================================================================
    // Window frame + title buttons
    // ======================================================================
    drawWindow(ctrl, _topHeight, inFocus) {
      this.drawBordered(inFocus ? "Window.Normal" : "Window.Inactive", ctrl.getRenderBounds());
    }
    // Window-button draws use the control's render bounds directly
    // (rather than a hardcoded 31×31 dest rect). The atlas art is 31×31,
    // but the title bar is shorter than that — drawing 31×31 inside a
    // 22px-tall dragger clips the bottom of the button. Letting the
    // skin scale the texture to the control's actual size keeps the
    // glyph fully visible regardless of the title-bar height the host
    // chose.
    drawWindowCloseButton(ctrl, depressed, hovered, disabled) {
      const r = ctrl.getRenderBounds();
      if (disabled) {
        this.drawSingle("Window.Close", r, color(255, 255, 255, 50));
        return;
      }
      if (depressed) {
        this.drawSingle("Window.Close_Down", r);
        return;
      }
      if (hovered) {
        this.drawSingle("Window.Close_Hover", r);
        return;
      }
      this.drawSingle("Window.Close", r);
    }
    drawWindowMaximizeButton(ctrl, depressed, hovered, disabled, maximized) {
      const r = ctrl.getRenderBounds();
      if (!maximized) {
        if (disabled) {
          this.drawSingle("Window.Maxi", r, color(255, 255, 255, 50));
          return;
        }
        if (depressed) {
          this.drawSingle("Window.Maxi_Down", r);
          return;
        }
        if (hovered) {
          this.drawSingle("Window.Maxi_Hover", r);
          return;
        }
        this.drawSingle("Window.Maxi", r);
        return;
      }
      if (disabled) {
        this.drawSingle("Window.Restore", r, color(255, 255, 255, 50));
        return;
      }
      if (depressed) {
        this.drawSingle("Window.Restore_Down", r);
        return;
      }
      if (hovered) {
        this.drawSingle("Window.Restore_Hover", r);
        return;
      }
      this.drawSingle("Window.Restore", r);
    }
    drawWindowMinimizeButton(ctrl, depressed, hovered, disabled) {
      const r = ctrl.getRenderBounds();
      if (disabled) {
        this.drawSingle("Window.Mini", r, color(255, 255, 255, 100));
        return;
      }
      if (depressed) {
        this.drawSingle("Window.Mini_Down", r);
        return;
      }
      if (hovered) {
        this.drawSingle("Window.Mini_Hover", r);
        return;
      }
      this.drawSingle("Window.Mini", r);
    }
    // ======================================================================
    // Highlight / feedback
    // ======================================================================
    drawHighlight(ctrl) {
      this.renderer.setDrawColor(color(255, 100, 255, 255));
      this.renderer.drawFilledRect(ctrl.getRenderBounds());
    }
    // Alternating-pixel focus ring. Direct port of TexturedBase.h:768.
    drawKeyboardHighlight(ctrl, r, offset) {
      const rect2 = {
        x: r.x + offset,
        y: r.y + offset,
        w: r.w - offset * 2,
        h: r.h - offset * 2
      };
      const palette = this.dynamicSkin.getPalette();
      this.renderer.setDrawColor(paletteIsDark2(palette) ? paletteColor(palette.accent) : color(0, 0, 0, 255));
      let skip = true;
      const halfW = Math.floor(rect2.w * 0.5);
      for (let i = 0; i < halfW; i++) {
        if (!skip) {
          this.renderer.drawPixel(rect2.x + i * 2, rect2.y);
          this.renderer.drawPixel(rect2.x + i * 2, rect2.y + rect2.h - 1);
        } else {
          skip = !skip;
        }
      }
      skip = false;
      const halfH = Math.floor(rect2.h * 0.5);
      for (let i = 0; i < halfH; i++) {
        if (!skip) {
          this.renderer.drawPixel(rect2.x, rect2.y + i * 2);
          this.renderer.drawPixel(rect2.x + rect2.w - 1, rect2.y + i * 2);
        } else {
          skip = !skip;
        }
      }
    }
    // ======================================================================
    // Misc bordered overlays
    // ======================================================================
    drawStatusBar(ctrl) {
      this.drawBordered("StatusBar", ctrl.getRenderBounds());
    }
    drawShadow(ctrl) {
      const b = ctrl.getRenderBounds();
      const r = rect(b.x - 4, b.y - 4, b.w + 10, b.h + 10);
      this.drawBordered("Shadow", r);
    }
    drawToolTip(ctrl) {
      this.drawBordered("Tooltip", ctrl.getRenderBounds());
    }
    drawModalControl(ctrl) {
      if (!ctrl.shouldDrawBackground()) return;
      this.renderer.setDrawColor(this.colors.modalBackground);
      this.renderer.drawFilledRect(ctrl.getRenderBounds());
    }
    // ======================================================================
    // Scrollbar
    // ======================================================================
    drawScrollBar(ctrl, isHorizontal, _depressed) {
      this.drawBordered(isHorizontal ? "Scroller.TrackH" : "Scroller.TrackV", ctrl.getRenderBounds());
    }
    drawScrollBarBar(ctrl, depressed, hovered, isHorizontal) {
      if (!isHorizontal) {
        if (ctrl.isDisabled()) {
          this.drawBordered("Scroller.ButtonV_Disabled", ctrl.getRenderBounds());
          return;
        }
        if (depressed) {
          this.drawBordered("Scroller.ButtonV_Down", ctrl.getRenderBounds());
          return;
        }
        if (hovered) {
          this.drawBordered("Scroller.ButtonV_Hover", ctrl.getRenderBounds());
          return;
        }
        this.drawBordered("Scroller.ButtonV_Normal", ctrl.getRenderBounds());
        return;
      }
      if (ctrl.isDisabled()) {
        this.drawBordered("Scroller.ButtonH_Disabled", ctrl.getRenderBounds());
        return;
      }
      if (depressed) {
        this.drawBordered("Scroller.ButtonH_Down", ctrl.getRenderBounds());
        return;
      }
      if (hovered) {
        this.drawBordered("Scroller.ButtonH_Hover", ctrl.getRenderBounds());
        return;
      }
      this.drawBordered("Scroller.ButtonH_Normal", ctrl.getRenderBounds());
    }
    // dir values: Pos.Left=2 → i=0, Pos.Top=8 → i=1, Pos.Right=4 → i=2,
    // Pos.Bottom=16 → i=3 (matching the upstream array order).
    drawScrollButton(ctrl, direction, depressed, hovered, disabled) {
      let i = 0;
      if (direction === 8) i = 1;
      else if (direction === 4) i = 2;
      else if (direction === 16) i = 3;
      const state = disabled ? "Disabled" : depressed ? "Down" : hovered ? "Hover" : "Normal";
      this.drawBordered(`Scroller.Button.${state}[${i}]`, ctrl.getRenderBounds());
    }
    // ======================================================================
    // Progress bar
    // ======================================================================
    drawProgressBar(ctrl, isHorizontal, progress) {
      const rect2 = cloneRect(ctrl.getRenderBounds());
      if (isHorizontal) {
        this.drawBordered("ProgressBar.Back", rect2);
        rect2.w = Math.floor(rect2.w * progress);
        if (rect2.w > 0) this.drawBordered("ProgressBar.Front", rect2);
        return;
      }
      this.drawBordered("ProgressBar.Back", rect2);
      const invProgress = Math.floor(rect2.h * (1 - progress));
      rect2.y += invProgress;
      rect2.h -= invProgress;
      this.drawBordered("ProgressBar.Front", rect2);
    }
    // ======================================================================
    // Slider
    // ======================================================================
    // The 1px track + centre notches. Matches TexturedBase.h:730.
    drawSlider(ctrl, isHorizontal, numNotches, barSize) {
      if (isHorizontal) {
        const r2 = cloneRect(ctrl.getRenderBounds());
        r2.x += barSize * 0.5;
        r2.w -= barSize;
        r2.y += r2.h * 0.5 - 1;
        r2.h = 1;
        const palette2 = this.dynamicSkin.getPalette();
        this.renderer.setDrawColor(paletteIsDark2(palette2) ? paletteColor(palette2.panelBorder) : color(0, 0, 0, 100));
        this.drawSliderNotchesH(r2, numNotches, barSize * 0.5);
        this.renderer.drawFilledRect(r2);
        return;
      }
      const r = cloneRect(ctrl.getRenderBounds());
      r.y += barSize * 0.5;
      r.h -= barSize;
      r.x += r.w * 0.5 - 1;
      r.w = 1;
      const palette = this.dynamicSkin.getPalette();
      this.renderer.setDrawColor(paletteIsDark2(palette) ? paletteColor(palette.panelBorder) : color(0, 0, 0, 100));
      this.drawSliderNotchesV(r, numNotches, barSize * 0.4);
      this.renderer.drawFilledRect(r);
    }
    // The draggable thumb — centred blit of the appropriate 15×15 single.
    drawSlideButton(ctrl, depressed, horizontal) {
      const rb = ctrl.getRenderBounds();
      const prefix = horizontal ? "Input.Slider.H" : "Input.Slider.V";
      if (ctrl.isDisabled()) {
        this.drawSingleCentered(`${prefix}.Disabled`, rb);
        return;
      }
      if (depressed) {
        this.drawSingleCentered(`${prefix}.Down`, rb);
        return;
      }
      if (ctrl.isHovered()) {
        this.drawSingleCentered(`${prefix}.Hover`, rb);
        return;
      }
      this.drawSingleCentered(`${prefix}.Normal`, rb);
    }
    // Alias — GWEN spells it `DrawSlideButton`; the spec notes the rename.
    // Both names route here.
    drawSliderBar(ctrl, depressed, horizontal) {
      this.drawSlideButton(ctrl, depressed, horizontal);
    }
    drawSliderNotchesH(r, numNotches, dist) {
      if (numNotches === 0) return;
      const spacing = r.w / numNotches;
      for (let i = 0; i < numNotches + 1; i++) {
        this.renderer.drawFilledRect(rect(r.x + spacing * i, r.y + dist - 2, 1, 5));
      }
    }
    drawSliderNotchesV(r, numNotches, dist) {
      if (numNotches === 0) return;
      const spacing = r.h / numNotches;
      for (let i = 0; i < numNotches + 1; i++) {
        this.renderer.drawFilledRect(rect(r.x + dist - 1, r.y + spacing * i, 5, 1));
      }
    }
    // ======================================================================
    // Combo box
    // ======================================================================
    drawComboBox(ctrl, down, menuOpen) {
      if (ctrl.isDisabled()) {
        this.drawBordered("Input.ComboBox.Disabled", ctrl.getRenderBounds());
        return;
      }
      if (down || menuOpen) {
        this.drawBordered("Input.ComboBox.Down", ctrl.getRenderBounds());
        return;
      }
      if (ctrl.isHovered()) {
        this.drawBordered("Input.ComboBox.Hover", ctrl.getRenderBounds());
        return;
      }
      this.drawBordered("Input.ComboBox.Normal", ctrl.getRenderBounds());
    }
    drawComboDownArrow(ctrl, hovered, down, menuOpen, disabled) {
      const rb = ctrl.getRenderBounds();
      if (disabled) {
        this.drawSingle("Input.ComboBox.Button.Disabled", rb);
        return;
      }
      if (down || menuOpen) {
        this.drawSingle("Input.ComboBox.Button.Down", rb);
        return;
      }
      if (hovered) {
        this.drawSingle("Input.ComboBox.Button.Hover", rb);
        return;
      }
      this.drawSingle("Input.ComboBox.Button.Normal", rb);
    }
    // ======================================================================
    // Numeric up/down
    // ======================================================================
    drawNumericUpDownButton(ctrl, depressed, up) {
      const rb = ctrl.getRenderBounds();
      const prefix = up ? "Input.UpDown.Up" : "Input.UpDown.Down";
      if (ctrl.isDisabled()) {
        this.drawSingleCentered(`${prefix}.Disabled`, rb);
        return;
      }
      if (depressed) {
        this.drawSingleCentered(`${prefix}.Down`, rb);
        return;
      }
      if (ctrl.isHovered()) {
        this.drawSingleCentered(`${prefix}.Hover`, rb);
        return;
      }
      this.drawSingleCentered(`${prefix}.Normal`, rb);
    }
    // ======================================================================
    // Menu
    // ======================================================================
    drawMenuStrip(ctrl) {
      const r = ctrl.getRenderBounds();
      const renderer = this.renderer;
      const palette = this.dynamicSkin.getPalette();
      const dark = paletteIsDark2(palette);
      renderer.setDrawColor(paletteColor(palette.menuStripBg));
      renderer.drawFilledRect(r);
      renderer.setDrawColor(dark ? paletteColor(palette.panelHighlight) : color(255, 255, 255, 255));
      renderer.drawFilledRect(rect(r.x, r.y, r.w, 1));
      renderer.setDrawColor(dark ? paletteColor(palette.panelBorder) : color(160, 160, 160, 255));
      renderer.drawFilledRect(rect(r.x, r.y + r.h - 1, r.w, 1));
    }
    drawMenu(ctrl, paddingDisabled) {
      if (!paddingDisabled) {
        this.drawBordered("Menu.BackgroundWithMargin", ctrl.getRenderBounds());
        return;
      }
      this.drawBordered("Menu.Background", ctrl.getRenderBounds());
    }
    drawMenuItem(ctrl, submenuOpen, checked) {
      const rb = ctrl.getRenderBounds();
      if (submenuOpen || ctrl.isHovered()) {
        this.drawBordered("Menu.Hover", rb);
      }
      if (checked) {
        this.drawSingle("Menu.Check", rect(rb.x + 4, rb.y + 3, 15, 15));
      }
    }
    drawMenuRightArrow(ctrl) {
      this.drawSingle("Menu.RightArrow", ctrl.getRenderBounds());
    }
    drawMenuDivider(ctrl) {
      const palette = this.dynamicSkin.getPalette();
      this.renderer.setDrawColor(paletteIsDark2(palette) ? paletteColor(palette.panelBorder) : color(0, 0, 0, 100));
      this.renderer.drawFilledRect(ctrl.getRenderBounds());
    }
    // ======================================================================
    // Tab
    // ======================================================================
    drawTabControl(ctrl) {
      this.drawBordered("Tab.Control", ctrl.getRenderBounds());
    }
    drawTabTitleBar(ctrl) {
      this.drawBordered("Tab.HeaderBar", ctrl.getRenderBounds());
    }
    drawTabButton(ctrl, active, dir) {
      if (active) {
        this.drawActiveTabButton(ctrl, dir);
        return;
      }
      const rb = ctrl.getRenderBounds();
      if (dir === 16) this.drawBordered("Tab.Bottom.Inactive", rb);
      else if (dir === 8) this.drawBordered("Tab.Top.Inactive", rb);
      else if (dir === 2) this.drawBordered("Tab.Left.Inactive", rb);
      else if (dir === 4) this.drawBordered("Tab.Right.Inactive", rb);
    }
    // Active tabs extend an 8px strip into the content area so they appear
    // attached. See TexturedBase.h:569.
    drawActiveTabButton(ctrl, dir) {
      const b = ctrl.getRenderBounds();
      if (dir === 16) {
        this.drawBordered("Tab.Bottom.Active", rect(b.x, b.y - 8, b.w, b.h + 8));
        return;
      }
      if (dir === 8) {
        this.drawBordered("Tab.Top.Active", rect(b.x, b.y, b.w, b.h + 8));
        return;
      }
      if (dir === 2) {
        this.drawBordered("Tab.Left.Active", rect(b.x, b.y, b.w + 8, b.h));
        return;
      }
      if (dir === 4) {
        this.drawBordered("Tab.Right.Active", rect(b.x - 8, b.y, b.w + 8, b.h));
        return;
      }
    }
    // ======================================================================
    // List box
    // ======================================================================
    drawListBox(ctrl) {
      this.drawBordered("Input.ListBox.Background", ctrl.getRenderBounds());
    }
    drawListBoxLine(ctrl, selected, even) {
      const rb = ctrl.getRenderBounds();
      if (selected) {
        this.drawBordered(even ? "Input.ListBox.EvenLineSelected" : "Input.ListBox.OddLineSelected", rb);
        return;
      }
      if (ctrl.isHovered()) {
        this.drawBordered("Input.ListBox.Hovered", rb);
        return;
      }
      this.drawBordered(even ? "Input.ListBox.EvenLine" : "Input.ListBox.OddLine", rb);
    }
    // ======================================================================
    // Tree
    // ======================================================================
    drawTreeControl(ctrl) {
      this.drawBordered("Tree.Background", ctrl.getRenderBounds());
    }
    drawTreeButton(ctrl, open) {
      this.drawSingle(open ? "Tree.Minus" : "Tree.Plus", ctrl.getRenderBounds());
    }
    // Matches the composite TreeNode rendering from TexturedBase.h:998 +
    // Skin.cpp:80. The selection highlight renders first, then the horizontal
    // line to the expand button, then (if open) the vertical run down the
    // left gutter.
    drawTreeNode(_ctrl, open, selected, labelHeight, labelWidth, halfWay, lastBranch, isRoot) {
      if (selected) {
        this.drawBordered("Selection", rect(17, 0, labelWidth + 2, labelHeight - 1));
      }
      this.renderer.setDrawColor(this.colors.tree.lines);
      if (!isRoot) {
        this.renderer.drawFilledRect(rect(8, halfWay, 16 - 9, 1));
      }
      if (!open) return;
      this.renderer.drawFilledRect(rect(14 + 7, labelHeight + 1, 1, lastBranch + halfWay - labelHeight));
    }
    // ======================================================================
    // Property grid
    // ======================================================================
    drawPropertyRow(ctrl, labelWidth, beingEdited, hovered) {
      const rect2 = ctrl.getRenderBounds();
      const col = beingEdited ? this.colors.properties.column_selected : hovered ? this.colors.properties.column_hover : this.colors.properties.column_normal;
      this.renderer.setDrawColor(col);
      this.renderer.drawFilledRect(rect(0, rect2.y, labelWidth, rect2.h));
      const line = beingEdited ? this.colors.properties.line_selected : hovered ? this.colors.properties.line_hover : this.colors.properties.line_normal;
      this.renderer.setDrawColor(line);
      this.renderer.drawFilledRect(rect(labelWidth, rect2.y, 1, rect2.h));
      this.renderer.drawFilledRect(rect(rect2.x, rect2.y + rect2.h - 1, rect2.w, 1));
    }
    drawPropertyTreeNode(ctrl, borderLeft, borderTop) {
      const r = ctrl.getRenderBounds();
      this.renderer.setDrawColor(this.colors.properties.border);
      this.renderer.drawFilledRect(rect(r.x, r.y, borderLeft, r.h));
      this.renderer.drawFilledRect(rect(r.x + borderLeft, r.y, r.w - borderLeft, borderTop));
    }
    // ======================================================================
    // Color display
    // ======================================================================
    // Matches TexturedBase.h:885. Draws a checkerboard under any non-opaque
    // color so alpha is visible.
    drawColorDisplay(ctrl, col) {
      const rect2 = ctrl.getRenderBounds();
      if (col.a !== 255) {
        this.renderer.setDrawColor(color(255, 255, 255, 255));
        this.renderer.drawFilledRect(rect2);
        this.renderer.setDrawColor(color(128, 128, 128, 128));
        this.renderer.drawFilledRect(rect(0, 0, rect2.w * 0.5, rect2.h * 0.5));
        this.renderer.drawFilledRect(rect(rect2.w * 0.5, rect2.h * 0.5, rect2.w * 0.5, rect2.h * 0.5));
      }
      this.renderer.setDrawColor(col);
      this.renderer.drawFilledRect(rect2);
      const palette = this.dynamicSkin.getPalette();
      this.renderer.setDrawColor(paletteIsDark2(palette) ? paletteColor(palette.panelBorder) : color(0, 0, 0, 255));
      this.renderer.drawLinedRect(rect2);
    }
    // ======================================================================
    // Category list
    // ======================================================================
    drawCategoryHolder(ctrl) {
      this.drawBordered("CategoryList.Outer", ctrl.getRenderBounds());
    }
    drawCategoryInner(ctrl, collapsed) {
      if (collapsed) {
        this.drawBordered("CategoryList.Header", ctrl.getRenderBounds());
        return;
      }
      this.drawBordered("CategoryList.Inner", ctrl.getRenderBounds());
    }
    // ======================================================================
    // Group box
    // ======================================================================
    // Two bordered passes: the first draws the full frame except the top-
    // center strip (patch P_T / index 1) so the title label sits in an
    // empty gap; the second re-draws the top-center strip starting after
    // the text so the frame closes up to the right of the title.
    // Matches TexturedBase.h:547.
    drawGroupBox(ctrl, textStart, textHeight, textWidth) {
      const rect2 = cloneRect(ctrl.getRenderBounds());
      rect2.y += Math.floor(textHeight * 0.5);
      rect2.h -= Math.floor(textHeight * 0.5);
      this.drawBordered("GroupBox", rect2, WHITE, [true, false, true, true, true, true, true, true, true]);
      rect2.x += textStart + textWidth - 4;
      rect2.w -= textStart + textWidth - 4;
      this.drawBordered("GroupBox", rect2, WHITE, [false, true, false, false, false, false, false, false, false]);
    }
    // ======================================================================
    // Font management
    // ======================================================================
    setDefaultFont(name, size) {
      this.defaultFont = font(name, size);
    }
    getDefaultFont() {
      return this.defaultFont;
    }
    releaseFont(f) {
      this.renderer.freeFont(f);
    }
  };

  // src/controls/Dragger.ts
  var Dragger = class extends Base {
    constructor(parent) {
      super(parent);
      this.onDragStart = new Signal();
      this.onDragged = new Signal();
      this.onDragEnd = new Signal();
      this.onDoubleClickLeft = new Signal();
      this._target = null;
      this._doMove = true;
      this._depressed = false;
      this._holdPos = point();
      this.setMouseInputEnabled(true);
    }
    // =====================================================================
    // Config
    // =====================================================================
    setTarget(t) {
      this._target = t;
    }
    getTarget() {
      return this._target;
    }
    setDoMove(b) {
      this._doMove = b;
    }
    isDepressed() {
      return this._depressed;
    }
    // =====================================================================
    // Mouse
    // =====================================================================
    onMouseClickLeft(x, y, pressed) {
      if (this.isDisabled()) return;
      if (pressed) {
        const canvas2 = this.getCanvas();
        if (canvas2) canvas2.mouseFocus = this;
        this._depressed = true;
        if (this._target) {
          const p = this._target.canvasPosToLocal(point(x, y));
          this._holdPos.x = p.x;
          this._holdPos.y = p.y;
        }
        const info2 = eventInfo();
        info2.controlCaller = this;
        this.onDragStart.emit(info2);
        return;
      }
      this._depressed = false;
      const canvas = this.getCanvas();
      if (canvas) canvas.mouseFocus = null;
      const info = eventInfo();
      info.controlCaller = this;
      this.onDragEnd.emit(info);
    }
    onMouseMoved(x, y, dx, dy) {
      if (this.isDisabled()) return;
      if (!this._depressed) return;
      if (this._doMove && this._target) {
        let nx = x - this._holdPos.x;
        let ny = y - this._holdPos.y;
        const parent = this._target.parent;
        if (parent) {
          const local = parent.canvasPosToLocal(point(nx, ny));
          nx = local.x;
          ny = local.y;
        }
        this._target.moveTo(nx, ny);
      }
      const info = eventInfo();
      info.controlCaller = this;
      info.point = point(dx, dy);
      this.onDragged.emit(info);
    }
    onMouseDoubleClickLeft(_x, _y) {
      const info = eventInfo();
      info.controlCaller = this;
      this.onDoubleClickLeft.emit(info);
    }
    // =====================================================================
    // Render — intentionally empty. Dragger is a pure interaction control;
    // subclasses (Window title bar, ResizerControl) supply the art.
    // =====================================================================
    render(_skin) {
    }
  };

  // src/controls/ScrollBarBar.ts
  var ScrollBarBar = class extends Dragger {
    constructor(parent) {
      super(parent);
      this._horizontal = true;
      this.setTarget(this);
      this.setRestrictToParent(true);
    }
    setHorizontal(b) {
      this._horizontal = b;
    }
    isHorizontal() {
      return this._horizontal;
    }
    // Track area excludes the parent ScrollBar's two scroll buttons. For a
    // vertical bar the buttons are square w×w sitting at the top and
    // bottom; for a horizontal bar they're h×h at the left and right.
    moveTo(x, y) {
      const parent = this.parent;
      if (!parent) {
        super.moveTo(x, y);
        return;
      }
      if (this._horizontal) {
        const bs = parent.height();
        const minX = bs;
        const maxX = parent.width() - bs - this.width();
        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        super.moveTo(x, this.y());
      } else {
        const bs = parent.width();
        const minY = bs;
        const maxY = parent.height() - bs - this.height();
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;
        super.moveTo(this.x(), y);
      }
    }
    render(skin) {
      skin.drawScrollBarBar(this, this._depressed, this.isHovered(), this._horizontal);
    }
  };

  // src/controls/Text.ts
  var Text = class _Text extends Base {
    constructor(parent) {
      super(parent);
      this._text = "";
      this._textChanged = false;
      this._font = null;
      // `_color` is the default text color (resolved from skin on first
      // render if left at the construction default); `_colorOverride` takes
      // precedence whenever its alpha is non-zero. This mirrors GWEN's
      // "override" convention: alpha 0 means "not set" so the base color
      // wins.
      this._color = color(0, 0, 0, 255);
      // Whether `_color` was set explicitly by `setTextColor`. When false,
      // `render()` reads `skin.colors.label.default` instead — that lets a
      // theme switch on the active palette propagate to every Text
      // instance without reaching back through every control's
      // construction path.
      this._colorIsExplicit = false;
      this._colorPreset = null;
      this._colorOverride = color(255, 255, 255, 0);
      this._wrap = false;
      // Child Text lines populated by `refreshSizeWrap` — one per wrapped
      // line. Each child renders its own slice; this Text's own `render`
      // early-returns in wrap mode so the children paint without overlap.
      this._lines = [];
      this.setMouseInputEnabled(false);
      this._textChanged = true;
    }
    // =====================================================================
    // Text content
    // =====================================================================
    setText(s) {
      if (this._text === s) return;
      this._text = s;
      this._textChanged = true;
      this.invalidate();
      this.redraw();
    }
    getText() {
      return this._text;
    }
    length() {
      return this._text.length;
    }
    // =====================================================================
    // Font
    // =====================================================================
    setFont(f) {
      if (this._font === f) return;
      this._font = f;
      this._textChanged = true;
      this.invalidate();
      this.redraw();
    }
    getFont() {
      return this._font;
    }
    // =====================================================================
    // Color
    // =====================================================================
    setTextColor(c) {
      this._color = { r: c.r, g: c.g, b: c.b, a: c.a };
      this._colorIsExplicit = true;
      this._colorPreset = null;
      this.redraw();
    }
    textColor() {
      if (this._colorPreset) {
        const skin = this.getSkinOrNull();
        if (skin) return this.colorForPreset(skin, this._colorPreset);
      }
      return this._color;
    }
    setTextColorPreset(preset) {
      this._colorPreset = preset;
      this._colorIsExplicit = false;
      this.redraw();
    }
    setTextColorOverride(c) {
      this._colorOverride = { r: c.r, g: c.g, b: c.b, a: c.a };
      this.redraw();
    }
    textColorOverride() {
      return this._colorOverride;
    }
    effectiveTextColor(skin) {
      const baseColor = this._colorPreset ? this.colorForPreset(skin, this._colorPreset) : this._colorIsExplicit ? this._color : skin.colors.label.default;
      if (!this._colorIsExplicit && this._colorOverride.a === 0 && baseColor.r > 128 && this.isDisabledInTree()) {
        return skin.colors.button.disabled;
      }
      return this._colorOverride.a === 0 ? baseColor : this._colorOverride;
    }
    // =====================================================================
    // Wrap
    // =====================================================================
    setWrap(w) {
      if (this._wrap === w) return;
      this._wrap = w;
      this._textChanged = true;
      this.invalidate();
      this.redraw();
    }
    getWrap() {
      return this._wrap;
    }
    // =====================================================================
    // Size refresh
    // =====================================================================
    /**
     * Recompute the control's size from the current text + font. Falls back
     * to the skin's default font when no explicit font was set.
     */
    refreshSize() {
      this.resolveFont();
      const font2 = this._font;
      if (!font2) {
        return;
      }
      const skin = this.getSkinOrNull();
      if (!skin) return;
      const pad = this.getPadding();
      let w = 0;
      let h = Math.max(1, font2.size);
      if (this._text.length > 0) {
        const size = skin.renderer.measureText(font2, this._text);
        w = size.x;
        h = size.y;
      } else {
        w = 1;
      }
      this.setSize(
        Math.ceil(w) + pad.left + pad.right,
        Math.ceil(h) + pad.top + pad.bottom
      );
    }
    /**
     * Wrap-mode refresh — greedy word-wrap into per-line child Text
     * controls. Uses `this.width()` as the line constraint (the host
     * Label is responsible for setting that). Each line becomes a
     * non-wrapping child Text positioned at its baseline; this Text's
     * own `render` early-returns in wrap mode so the children paint.
     */
    refreshSizeWrap() {
      this.resolveFont();
      const font2 = this._font;
      if (!font2) return;
      const skin = this.getSkinOrNull();
      if (!skin) return;
      const pad = this.getPadding();
      const maxW = Math.max(1, this.width() - pad.left - pad.right);
      for (const ln of this._lines) ln.setParent(null);
      this._lines = [];
      if (this._text.length === 0) {
        this.setSize(this.width(), pad.top + pad.bottom + (font2.size || 1));
        return;
      }
      const lineH = Math.ceil(skin.renderer.measureText(font2, "Ag").y);
      const lines = [];
      const hardSegments = this._text.split("\n");
      for (let segIdx = 0; segIdx < hardSegments.length; segIdx++) {
        const segment = hardSegments[segIdx];
        if (segment.length === 0) {
          lines.push("");
          continue;
        }
        const tokens = segment.split(/(\s+)/).filter((t) => t.length > 0);
        let lineText = "";
        let lineWidth = 0;
        const flushLine = () => {
          if (lineText.length === 0) return;
          lines.push(lineText);
          lineText = "";
          lineWidth = 0;
        };
        for (const tok of tokens) {
          const isSpace = /^\s+$/.test(tok);
          const w = skin.renderer.measureText(font2, tok).x;
          if (isSpace) {
            if (lineWidth + w <= maxW || lineWidth === 0) {
              if (lineWidth > 0) {
                lineText += tok;
                lineWidth += w;
              }
              continue;
            }
            flushLine();
            continue;
          }
          if (lineWidth + w > maxW && lineWidth > 0) {
            flushLine();
          }
          lineText += tok;
          lineWidth += w;
        }
        flushLine();
        if (lines.length === 0 || segIdx > 0 && lines[lines.length - 1] !== "" && segment.trim().length === 0) {
          lines.push("");
        }
      }
      let y = pad.top;
      for (const line of lines) {
        const t = new _Text(this);
        t.setText(line.replace(/\s+$/, ""));
        t.setFont(font2);
        if (this._colorPreset) t.setTextColorPreset(this._colorPreset);
        else if (this._colorIsExplicit) t.setTextColor(this._color);
        if (this._colorOverride.a !== 0) t.setTextColorOverride(this._colorOverride);
        t.setPos(pad.left, y);
        t.refreshSize();
        this._lines.push(t);
        y += lineH;
      }
      this.setSize(this.width(), y + pad.bottom);
    }
    // =====================================================================
    // Layout + render
    // =====================================================================
    layout(_skin) {
      if (this._textChanged) {
        if (this._wrap) this.refreshSizeWrap();
        else this.refreshSize();
        this._textChanged = false;
      }
    }
    render(skin) {
      if (this._wrap) return;
      if (!this._text) return;
      this.resolveFont();
      const font2 = this._font;
      if (!font2) return;
      skin.renderer.setDrawColor(this.effectiveTextColor(skin));
      const pad = this.getPadding();
      skin.renderer.renderText(font2, point(pad.left, pad.top), this._text);
    }
    // =====================================================================
    // Hit-test for caret positioning (used by future TextBox T200-family).
    // =====================================================================
    /**
     * Rect enclosing the character at index `i`, in local-space pixels.
     * Returns a zero-width rect at end-of-text when `i >= length`.
     */
    getCharacterPosition(i) {
      this.resolveFont();
      const font2 = this._font;
      if (!font2) return rect(0, 0, 0, 0);
      const skin = this.getSkinOrNull();
      if (!skin) return rect(0, 0, 0, 0);
      const pad = this.getPadding();
      const clamped = Math.max(0, Math.min(i, this._text.length));
      const prefix = this._text.substring(0, clamped);
      const tail = clamped < this._text.length ? this._text[clamped] : "";
      const prefixSize = prefix.length > 0 ? skin.renderer.measureText(font2, prefix) : point(0, font2.size);
      const charW = tail.length > 0 ? skin.renderer.measureText(font2, tail).x : 0;
      return rect(
        pad.left + prefixSize.x,
        pad.top,
        charW,
        prefixSize.y
      );
    }
    // =====================================================================
    // Internal helpers
    // =====================================================================
    /**
     * If no font is set, pick up the skin's default font. A no-op when a
     * font has already been assigned or when no skin is reachable yet.
     */
    resolveFont() {
      if (this._font) return;
      const skin = this.getSkinOrNull();
      if (!skin) return;
      this._font = skin.getDefaultFont();
    }
    isDisabledInTree() {
      let node = this;
      while (node) {
        if (node.isDisabled()) return true;
        node = node.parent;
      }
      return false;
    }
    colorForPreset(skin, preset) {
      switch (preset) {
        case "bright":
          return skin.colors.label.bright;
        case "dark":
          return skin.colors.label.dark;
        case "highlight":
          return skin.colors.label.highlight;
        case "default":
        default:
          return skin.colors.label.default;
      }
    }
    /**
     * Variant of getSkin() that returns null instead of throwing, for the
     * pre-attached case (Text's constructor runs before the parent is
     * wired into a skin-carrying tree).
     */
    getSkinOrNull() {
      try {
        return this.getSkin();
      } catch {
        return null;
      }
    }
    /**
     * Accessor for the per-line children used by wrap mode. Currently
     * always empty — T117 will populate this as part of real word-wrap.
     */
    getLines() {
      return this._lines;
    }
  };

  // src/controls/Label.ts
  var Label = class _Label extends Base {
    constructor(parent) {
      super(parent);
      this._align = Pos.Left | Pos.Top;
      // When `setFontByName` is called we allocate a Font and retain it here
      // so the skin's glyph cache doesn't leak at teardown. User-supplied
      // Fonts (setFont) are the caller's responsibility.
      this._createdFont = null;
      this.setMouseInputEnabled(false);
      this.setBounds(0, 0, 100, 10);
      this._text = new Text(this);
      this._text.setFont(null);
      this._text.setPadding(margin(0, 0, 0, 0));
      this.setAlignment(Pos.Left | Pos.CenterV);
    }
    // =====================================================================
    // Text
    // =====================================================================
    // Promote the placeholder Base tooltip from Base.setToolTip to a real
    // text-bearing Label so Canvas can size and render it directly.
    setToolTip(text) {
      if (!text) {
        this.setToolTipControl(null);
        return;
      }
      const tip = new _Label(null);
      tip.setText(text);
      tip.setName(text);
      tip.setPadding(margin(5, 3, 5, 3));
      this.setToolTipControl(tip);
      tip.sizeToContents();
    }
    setText(s, doEvents = true) {
      if (this._text.getText() === s) return;
      this._text.setText(s);
      this.invalidate();
      this.redraw();
      if (doEvents) this.onTextChanged();
    }
    getText() {
      return this._text.getText();
    }
    textLength() {
      return this._text.length();
    }
    // =====================================================================
    // Alignment
    // =====================================================================
    setAlignment(a) {
      if (this._align === a) return;
      this._align = a;
      this.invalidate();
    }
    getAlignment() {
      return this._align;
    }
    // =====================================================================
    // Font
    // =====================================================================
    setFont(f) {
      this._text.setFont(f);
      this.invalidate();
    }
    /**
     * Allocate a fresh `Font` and hand it to the internal Text. The Label
     * retains ownership so the font's atlas handle can be released when
     * the Label is disposed.
     */
    setFontByName(facename, size, bold = false) {
      const f = font(facename, size, bold);
      this._createdFont = f;
      this._text.setFont(f);
      this.invalidate();
    }
    getFont() {
      return this._text.getFont();
    }
    // =====================================================================
    // Color
    // =====================================================================
    setTextColor(c) {
      this._text.setTextColor(c);
    }
    textColor() {
      return this._text.textColor();
    }
    effectiveTextColor(skin) {
      return this._text.effectiveTextColor(skin);
    }
    setTextColorOverride(c) {
      this._text.setTextColorOverride(c);
    }
    // =====================================================================
    // Wrap
    // =====================================================================
    setWrap(w) {
      this._text.setWrap(w);
      this.invalidate();
    }
    getWrap() {
      return this._text.getWrap();
    }
    // =====================================================================
    // Text padding (GWEN calls this "text padding" — independent of the
    // control's own padding, applied only inside Text).
    // =====================================================================
    setTextPadding(p) {
      this._text.setPadding(p);
      this.invalidate();
    }
    getTextPadding() {
      return this._text.getPadding();
    }
    // =====================================================================
    // Text metric accessors
    // =====================================================================
    textWidth() {
      return this._text.width();
    }
    textHeight() {
      return this._text.height();
    }
    textRight() {
      return this._text.right();
    }
    textX() {
      return this._text.x();
    }
    textY() {
      return this._text.y();
    }
    // =====================================================================
    // sizeToContents — shrink-wrap to text + padding
    // =====================================================================
    sizeToContents() {
      const pad = this.getPadding();
      this._text.setPos(pad.left, pad.top);
      this._text.refreshSize();
      this.setSize(
        this._text.width() + pad.left + pad.right,
        this._text.height() + pad.top + pad.bottom
      );
    }
    // =====================================================================
    // Skin color presets (label.default / bright / dark / highlight)
    // =====================================================================
    makeColorNormal() {
      this._text.setTextColorPreset("default");
    }
    makeColorBright() {
      this._text.setTextColorPreset("bright");
    }
    makeColorDark() {
      this._text.setTextColorPreset("dark");
    }
    makeColorHighlight() {
      this._text.setTextColorPreset("highlight");
    }
    // =====================================================================
    // Value aliases (GWEN exposes Get/SetValue on Label for use as a
    // generic "string carrier" by Property controls).
    // =====================================================================
    getValue() {
      return this.getText();
    }
    setValue(s) {
      this.setText(s);
    }
    // =====================================================================
    // Layout
    // =====================================================================
    postLayout(_skin) {
      if (this._text.getWrap()) {
        const pad = this.getPadding();
        const w = Math.max(1, this.width() - pad.left - pad.right);
        if (this._text.width() !== w) {
          this._text.setBounds(pad.left, pad.top, w, this._text.height());
          this._text.refreshSizeWrap();
        }
      }
      this._text.position(this._align);
    }
    // Rebuilds the text layout whenever the Label itself resizes — without
    // this, wrap-mode labels would keep their pre-resize line layout even
    // after the parent changed width.
    onBoundsChanged(old) {
      super.onBoundsChanged(old);
      if (this._text && this._text.getWrap()) {
        const pad = this.getPadding();
        const w = Math.max(1, this.width() - pad.left - pad.right);
        this._text.setBounds(pad.left, pad.top, w, this._text.height());
        this._text.refreshSizeWrap();
        this.invalidate();
      }
    }
    // =====================================================================
    // Subclass hook
    // =====================================================================
    /**
     * Fires after `setText(s, true)`. Default is a no-op; subclasses
     * (Button, MenuItem) override to re-layout internal children.
     */
    onTextChanged() {
    }
    // =====================================================================
    // Dispose
    // =====================================================================
    dispose() {
      if (this._createdFont) {
        const skin = this.getSkinOrNull();
        if (skin) skin.releaseFont(this._createdFont);
        this._createdFont = null;
      }
      super.dispose();
    }
    getSkinOrNull() {
      try {
        return this.getSkin();
      } catch {
        return null;
      }
    }
  };

  // src/controls/ImagePanel.ts
  var ImagePanel = class extends Base {
    constructor(parent) {
      super(parent);
      this._texture = texture();
      this._uv = [0, 0, 1, 1];
      this._drawColor = color(255, 255, 255, 255);
      this._stretch = true;
      this.setMouseInputEnabled(false);
    }
    // =====================================================================
    // Texture assignment
    // =====================================================================
    /**
     * Assign an already-uploaded Texture directly. The caller retains
     * ownership — ImagePanel does not `freeTexture` on dispose.
     */
    setTexture(t) {
      this._texture = t;
      this.redraw();
    }
    /**
     * Upload `source` into a freshly allocated Texture and assign it.
     * Intended for callers that hold an already-decoded image (e.g.
     * from `createImageBitmap` or an in-memory `OffscreenCanvas`).
     */
    setTextureFromSource(source, renderer) {
      const t = texture();
      renderer.loadTextureFromSource(t, source);
      this._texture = t;
      this.redraw();
    }
    getTexture() {
      return this._texture;
    }
    /**
     * Async helper: fetch + decode + upload an image from a URL. Resolves
     * with the uploaded Texture on success. On failure the returned
     * Texture has `failed = true` and the promise rejects so callers can
     * either bubble the error or fall back to a placeholder.
     *
     * We use `Image` (not `fetch` + `createImageBitmap`) so CORS and
     * SVG handling match what a browser does for `<img>`.
     */
    static loadFromURL(url, renderer) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const t = texture(url);
          renderer.loadTextureFromSource(t, img);
          resolve(t);
        };
        img.onerror = () => {
          const t = texture(url);
          t.failed = true;
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    }
    // =====================================================================
    // UV sub-rect
    // =====================================================================
    setUV(u1, v1, u2, v2) {
      this._uv[0] = u1;
      this._uv[1] = v1;
      this._uv[2] = u2;
      this._uv[3] = v2;
      this.redraw();
    }
    // =====================================================================
    // Draw color + stretch
    // =====================================================================
    setDrawColor(c) {
      this._drawColor = { r: c.r, g: c.g, b: c.b, a: c.a };
      this.redraw();
    }
    getDrawColor() {
      return this._drawColor;
    }
    setStretch(b) {
      if (this._stretch === b) return;
      this._stretch = b;
      this.redraw();
    }
    getStretch() {
      return this._stretch;
    }
    // =====================================================================
    // Texture name (diagnostic / asset tracking)
    // =====================================================================
    setImageName(s) {
      this._texture.name = s;
    }
    getImageName() {
      return this._texture.name;
    }
    // =====================================================================
    // Dimension accessors
    // =====================================================================
    textureWidth() {
      return this._texture.width;
    }
    textureHeight() {
      return this._texture.height;
    }
    failedToLoad() {
      return this._texture.failed;
    }
    /**
     * Shrink the control to match the texture's natural size. A no-op when
     * the texture is still 0×0 (e.g. pre-load).
     */
    sizeToContents() {
      if (this._texture.width === 0 || this._texture.height === 0) return;
      this.setSize(this._texture.width, this._texture.height);
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.renderer.setDrawColor(this._drawColor);
      const r = this._stretch ? this.getRenderBounds() : rect(0, 0, this._texture.width, this._texture.height);
      skin.renderer.drawTexturedRect(
        this._texture,
        r,
        this._uv[0],
        this._uv[1],
        this._uv[2],
        this._uv[3]
      );
    }
  };

  // src/controls/Button.ts
  var Button = class extends Label {
    constructor(parent) {
      super(parent);
      this.onPress = new Signal();
      this.onRightPress = new Signal();
      this.onDown = new Signal();
      this.onUp = new Signal();
      this.onDoubleClick = new Signal();
      this.onToggle = new Signal();
      this.onToggleOn = new Signal();
      this.onToggleOff = new Signal();
      this._depressed = false;
      this._isToggle = false;
      this._toggleState = false;
      this._centerImage = false;
      this._image = null;
      this.setMouseInputEnabled(true);
      this.setKeyboardInputEnabled(true);
      this.setTabable(true);
      this.setSize(100, 20);
      this.setAlignment(Pos.Center);
      this.setTextPadding(margin(3, 0, 3, 0));
      this.setShouldDrawBackground(true);
    }
    // =====================================================================
    // State queries + setters
    // =====================================================================
    isDepressed() {
      return this._depressed;
    }
    setDepressed(b) {
      if (this._depressed === b) return;
      this._depressed = b;
      this.redraw();
    }
    isToggle() {
      return this._isToggle;
    }
    setIsToggle(b) {
      this._isToggle = b;
    }
    getToggleState() {
      return this._toggleState;
    }
    setToggleState(b) {
      if (this._toggleState === b) return;
      this._toggleState = b;
      const info = eventInfo();
      info.controlCaller = this;
      this.onToggle.emit(info);
      if (b) this.onToggleOn.emit(info);
      else this.onToggleOff.emit(info);
      this.redraw();
    }
    toggle() {
      this.setToggleState(!this._toggleState);
    }
    // =====================================================================
    // Image
    // =====================================================================
    setImage(name, center = false) {
      if (!this._image) {
        this._image = new ImagePanel(this);
        this._image.setName("ButtonImage");
        this._image.setMouseInputEnabled(false);
      }
      this._image.setImageName(name);
      this._centerImage = center;
      this.invalidate();
    }
    // Assign an already-uploaded Texture to the button's icon slot. The
    // optional w/h size the ImagePanel; if omitted the texture's natural
    // dimensions are used.
    setImageTexture(t, w, h, center = false) {
      if (!this._image) {
        this._image = new ImagePanel(this);
        this._image.setName("ButtonImage");
        this._image.setMouseInputEnabled(false);
      }
      this._image.setTexture(t);
      const iw = w ?? t.width;
      const ih = h ?? t.height;
      if (iw > 0 && ih > 0) this._image.setSize(iw, ih);
      this._centerImage = center;
      this.invalidate();
    }
    setImageAlpha(f) {
      if (!this._image) return;
      this._image.setDrawColor(color(255, 255, 255, Math.round(f * 255)));
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      if (!this.shouldDrawBackground()) return;
      const drawDepressed = this._depressed && this.isHovered() || this._isToggle && this._toggleState;
      const hovered = this.isHovered() && !drawDepressed;
      skin.drawButton(this, drawDepressed, hovered, this.isDisabled());
    }
    // =====================================================================
    // Mouse
    // =====================================================================
    onMouseClickLeft(_x, _y, pressed) {
      if (this.isDisabled()) return;
      const info = eventInfo();
      info.controlCaller = this;
      const canvas = this.getCanvas();
      if (pressed) {
        if (canvas) canvas.mouseFocus = this;
        this._depressed = true;
        this.onDown.emit(info);
      } else {
        const wasDepressed = this._depressed;
        if (this.isHovered() && wasDepressed) {
          if (this._isToggle) this.toggle();
          this.onPress.emit(info);
        }
        if (canvas) canvas.mouseFocus = null;
        this._depressed = false;
        this.onUp.emit(info);
      }
      this.redraw();
    }
    onMouseClickRight(_x, _y, pressed) {
      if (this.isDisabled()) return;
      if (!pressed) return;
      const info = eventInfo();
      info.controlCaller = this;
      this.onRightPress.emit(info);
    }
    onMouseDoubleClickLeft(x, y) {
      this.onMouseClickLeft(x, y, true);
      const info = eventInfo();
      info.controlCaller = this;
      this.onDoubleClick.emit(info);
    }
    // =====================================================================
    // Keyboard — Space and Return both trigger a press when focused,
    // matching the modern web/desktop convention. Honours _isToggle so
    // a toggleable button (Bold, Italic, etc.) flips its state via
    // keyboard the same way it does via mouse.
    // =====================================================================
    onKeyPress(key, pressed = true) {
      if ((key === Key.Space || key === Key.Return) && pressed && !this.isDisabled()) {
        if (this._isToggle) this.toggle();
        const info = eventInfo();
        info.controlCaller = this;
        this.onPress.emit(info);
        return true;
      }
      return super.onKeyPress(key, pressed);
    }
    // Fires the press signal without any input gating — used by accelerator
    // handlers (menu shortcuts, enter-as-default-button).
    acceleratePressed() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onPress.emit(info);
    }
    // Convenience GWEN helper — wires `handler` straight into `onPress`.
    setAction(handler) {
      this.onPress.on(handler);
    }
    // =====================================================================
    // Layout
    // =====================================================================
    sizeToContents() {
      super.sizeToContents();
      if (this._image) {
        const h = this._image.height() + 4;
        if (this.height() < h) this.setHeight(h);
      }
    }
    postLayout(skin) {
      super.postLayout(skin);
      if (this._image) {
        if (this._centerImage) {
          this._image.position(Pos.Center);
        } else {
          this._image.position(Pos.Left | Pos.CenterV, 4, 0);
        }
      }
    }
    // Keep the public surface minimal: expose the image's draw color via a
    // thin setter so hosts don't have to unwrap the internal ImagePanel.
    setImageColor(c) {
      if (!this._image) return;
      this._image.setDrawColor(c);
    }
  };

  // src/controls/ScrollBarButton.ts
  var ScrollBarButton = class extends Button {
    constructor(parent) {
      super(parent);
      this._direction = Pos.Top;
    }
    setDirection(d) {
      this._direction = d;
    }
    getDirection() {
      return this._direction;
    }
    render(skin) {
      skin.drawScrollButton(this, this._direction, this.isDepressed(), this.isHovered(), this.isDisabled());
    }
  };

  // src/controls/ScrollBar.ts
  var BaseScrollBar = class extends Base {
    constructor(parent) {
      super(parent);
      this.onBarMoved = new Signal();
      // Track-area press state — held while a page-nudge click is in progress.
      this._depressed = false;
      this._contentSize = 0;
      this._viewableContentSize = 0;
      this._nudgeAmount = 20;
      // Normalized 0..1 scroll position.
      this._scrolledAmount = 0;
      this.setBounds(0, 0, 15, 15);
      this._scrollButtons = [new ScrollBarButton(this), new ScrollBarButton(this)];
      this._bar = new ScrollBarBar(this);
      this._bar.onDragged.on(() => {
        this.recomputeFromBarPosition();
        this.barMovedNotification();
      });
    }
    // =====================================================================
    // Config
    // =====================================================================
    setContentSize(s) {
      if (this._contentSize === s) return;
      this._contentSize = s;
      this.invalidate();
    }
    setViewableContentSize(s) {
      if (this._viewableContentSize === s) return;
      this._viewableContentSize = s;
      this.invalidate();
    }
    getContentSize() {
      return this._contentSize;
    }
    getViewableContentSize() {
      return this._viewableContentSize;
    }
    setNudgeAmount(n) {
      this._nudgeAmount = n;
    }
    getScrolledAmount() {
      return this._scrolledAmount;
    }
    // Matches `BaseScrollBar::GetNudgeAmount` — track-click nudges by one
    // page (viewable/content); button nudges by the fixed nudge pixel
    // count expressed as a fraction of the content size.
    getNudgeAmount() {
      const denom = this._contentSize <= 0 ? 1 : this._contentSize;
      if (this._depressed) return this._viewableContentSize / denom;
      return this._nudgeAmount / denom;
    }
    setScrolledAmount(amount, forceUpdate) {
      if (amount < 0) amount = 0;
      else if (amount > 1) amount = 1;
      if (amount === this._scrolledAmount && !forceUpdate) return false;
      this._scrolledAmount = amount;
      this.invalidate();
      this.barMovedNotification();
      return true;
    }
    barMovedNotification() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onBarMoved.emit(info);
    }
  };
  var HorizontalScrollBar = class extends BaseScrollBar {
    constructor(parent) {
      super(parent);
      this._bar.setHorizontal(true);
      this._scrollButtons[0].setDirection(Pos.Left);
      this._scrollButtons[1].setDirection(Pos.Right);
      this._scrollButtons[0].onPress.on(() => this.scrollToLeft());
      this._scrollButtons[1].onPress.on(() => this.scrollToRight());
    }
    scrollToLeft() {
      this.setScrolledAmount(this._scrolledAmount - this.getNudgeAmount(), true);
    }
    scrollToRight() {
      this.setScrolledAmount(this._scrolledAmount + this.getNudgeAmount(), true);
    }
    layout(skin) {
      super.layout(skin);
      const bs = this.height();
      this._scrollButtons[0].setBounds(0, 0, bs, bs);
      this._scrollButtons[1].setBounds(this.width() - bs, 0, bs, bs);
      let barW = 0;
      if (this._contentSize > 0 && this._viewableContentSize > 0) {
        barW = Math.max(bs * 0.5, this._viewableContentSize / this._contentSize * (this.width() - bs * 2));
      }
      const trackW = this.width() - bs * 2;
      const travel = trackW - barW;
      const barX = bs + this._scrolledAmount * Math.max(0, travel);
      this._bar.setBounds(barX, 0, barW, this.height());
    }
    recomputeFromBarPosition() {
      const bs = this.height();
      const trackW = this.width() - bs * 2;
      const travel = trackW - this._bar.width();
      if (travel <= 0) {
        this._scrolledAmount = 0;
        return;
      }
      const raw = (this._bar.x() - bs) / travel;
      this._scrolledAmount = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    }
    onMouseClickLeft(x, y, pressed) {
      if (!pressed) {
        this._depressed = false;
        const canvas2 = this.getCanvas();
        if (canvas2 && canvas2.mouseFocus === this) canvas2.mouseFocus = null;
        return;
      }
      this._depressed = true;
      const canvas = this.getCanvas();
      if (canvas) canvas.mouseFocus = this;
      const local = this.canvasPosToLocal(point(x, y));
      if (local.x < this._bar.x()) {
        this.setScrolledAmount(this._scrolledAmount - this.getNudgeAmount(), true);
      } else if (local.x > this._bar.x() + this._bar.width()) {
        this.setScrolledAmount(this._scrolledAmount + this.getNudgeAmount(), true);
      }
    }
    render(skin) {
      skin.drawScrollBar(this, true, this._depressed);
    }
  };
  var VerticalScrollBar = class extends BaseScrollBar {
    constructor(parent) {
      super(parent);
      this._bar.setHorizontal(false);
      this._scrollButtons[0].setDirection(Pos.Top);
      this._scrollButtons[1].setDirection(Pos.Bottom);
      this._scrollButtons[0].onPress.on(() => this.scrollToTop());
      this._scrollButtons[1].onPress.on(() => this.scrollToBottom());
    }
    scrollToTop() {
      this.setScrolledAmount(this._scrolledAmount - this.getNudgeAmount(), true);
    }
    scrollToBottom() {
      this.setScrolledAmount(this._scrolledAmount + this.getNudgeAmount(), true);
    }
    layout(skin) {
      super.layout(skin);
      const bs = this.width();
      this._scrollButtons[0].setBounds(0, 0, bs, bs);
      this._scrollButtons[1].setBounds(0, this.height() - bs, bs, bs);
      let barH = 0;
      if (this._contentSize > 0 && this._viewableContentSize > 0) {
        barH = Math.max(bs * 0.5, this._viewableContentSize / this._contentSize * (this.height() - bs * 2));
      }
      const trackH = this.height() - bs * 2;
      const travel = trackH - barH;
      const barY = bs + this._scrolledAmount * Math.max(0, travel);
      this._bar.setBounds(0, barY, this.width(), barH);
    }
    recomputeFromBarPosition() {
      const bs = this.width();
      const trackH = this.height() - bs * 2;
      const travel = trackH - this._bar.height();
      if (travel <= 0) {
        this._scrolledAmount = 0;
        return;
      }
      const raw = (this._bar.y() - bs) / travel;
      this._scrolledAmount = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    }
    onMouseClickLeft(x, y, pressed) {
      if (!pressed) {
        this._depressed = false;
        const canvas2 = this.getCanvas();
        if (canvas2 && canvas2.mouseFocus === this) canvas2.mouseFocus = null;
        return;
      }
      this._depressed = true;
      const canvas = this.getCanvas();
      if (canvas) canvas.mouseFocus = this;
      const local = this.canvasPosToLocal(point(x, y));
      if (local.y < this._bar.y()) {
        this.setScrolledAmount(this._scrolledAmount - this.getNudgeAmount(), true);
      } else if (local.y > this._bar.y() + this._bar.height()) {
        this.setScrolledAmount(this._scrolledAmount + this.getNudgeAmount(), true);
      }
    }
    render(skin) {
      skin.drawScrollBar(this, false, this._depressed);
    }
  };

  // src/controls/ScrollControl.ts
  var ScrollControl = class extends Base {
    constructor(parent) {
      super(parent);
      this._canScrollH = true;
      this._canScrollV = true;
      this._autoHideBars = false;
      this.setMouseInputEnabled(false);
      this._vBar = new VerticalScrollBar(this);
      this._vBar.dock(Pos.Right);
      this._vBar.setWidth(15);
      this._vBar.onBarMoved.on(() => this.invalidate());
      this._hBar = new HorizontalScrollBar(this);
      this._hBar.dock(Pos.Bottom);
      this._hBar.setHeight(15);
      this._hBar.onBarMoved.on(() => this.invalidate());
      const inner = new Base(this);
      inner.setMargin(margin(5, 5, 5, 5));
      inner.setMouseInputEnabled(true);
      inner.sendToBack();
      this.setInnerPanel(inner);
    }
    // =====================================================================
    // Config
    // =====================================================================
    setScroll(h, v) {
      this._canScrollH = h;
      this._canScrollV = v;
      this.invalidate();
    }
    canScrollH() {
      return this._canScrollH;
    }
    canScrollV() {
      return this._canScrollV;
    }
    setAutoHideBars(b) {
      this._autoHideBars = b;
    }
    getVerticalScrollBar() {
      return this._vBar;
    }
    getHorizontalScrollBar() {
      return this._hBar;
    }
    // =====================================================================
    // Scroll-to-edge helpers
    // =====================================================================
    scrollToTop() {
      this._vBar.setScrolledAmount(0, true);
    }
    scrollToBottom() {
      this._vBar.setScrolledAmount(1, true);
    }
    scrollToLeft() {
      this._hBar.setScrolledAmount(0, true);
    }
    scrollToRight() {
      this._hBar.setScrolledAmount(1, true);
    }
    clear() {
      const inner = this.getInnerPanel();
      if (inner) inner.removeAllChildren();
      this.invalidate();
    }
    // =====================================================================
    // Scroll-bar update pipeline
    //
    // Called from `layout()` each time the tree re-lays out. We compute
    // content extents from the inner panel's children, feed the bars, and
    // apply the resulting fractional scroll offset back to the inner panel.
    // =====================================================================
    updateScrollBars() {
      const inner = this.getInnerPanel();
      if (!inner) return;
      let contentW = 0;
      let contentH = 0;
      for (const c of inner.children) {
        if (!c.isVisible()) continue;
        const r = c.x() + c.width();
        const b = c.y() + c.height();
        if (r > contentW) contentW = r;
        if (b > contentH) contentH = b;
      }
      const pad = this.getPadding();
      const baseW = this.width() - pad.left - pad.right;
      const baseH = this.height() - pad.top - pad.bottom;
      let vHidden = !this._canScrollV;
      let hHidden = !this._canScrollH;
      let viewW = baseW - (vHidden ? 0 : this._vBar.width());
      let viewH = baseH - (hHidden ? 0 : this._hBar.height());
      for (let pass = 0; pass < 2; pass++) {
        const nextVHidden = !this._canScrollV || this._autoHideBars && contentH <= viewH;
        const nextHHidden = !this._canScrollH || this._autoHideBars && contentW <= viewW;
        if (nextVHidden === vHidden && nextHHidden === hHidden) break;
        vHidden = nextVHidden;
        hHidden = nextHHidden;
        viewW = baseW - (vHidden ? 0 : this._vBar.width());
        viewH = baseH - (hHidden ? 0 : this._hBar.height());
      }
      this._vBar.setHidden(vHidden);
      this._hBar.setHidden(hHidden);
      this._vBar.setContentSize(Math.max(contentH, viewH));
      this._vBar.setViewableContentSize(viewH);
      this._hBar.setContentSize(Math.max(contentW, viewW));
      this._hBar.setViewableContentSize(viewW);
      const panelW = this._canScrollH ? Math.max(viewW, contentW) : viewW;
      const panelH = this._canScrollV ? Math.max(viewH, contentH) : viewH;
      const overflowH = Math.max(0, contentH - viewH);
      const overflowW = Math.max(0, contentW - viewW);
      inner.setBounds(
        pad.left + (this._canScrollH ? -this._hBar.getScrolledAmount() * overflowW : 0),
        pad.top + (this._canScrollV ? -this._vBar.getScrolledAmount() * overflowH : 0),
        panelW,
        panelH
      );
    }
    // =====================================================================
    // Overrides
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      this.updateScrollBars();
    }
    // postLayout runs AFTER children have laid out, so contentH/contentW
    // reflect the children's settled bounds. Re-evaluate the bars here too —
    // on the first frame, layout() sees stale child sizes (e.g. a
    // CollapsibleCategory's height is 22 until its own postLayout fits it
    // to its rows). If visibility flips here, invalidate so the next layout
    // pass re-docks children at the corrected viewport width.
    postLayout(skin) {
      super.postLayout(skin);
      const beforeV = this._vBar.hidden();
      const beforeH = this._hBar.hidden();
      this.updateScrollBars();
      if (this._vBar.hidden() !== beforeV || this._hBar.hidden() !== beforeH) {
        this.invalidate();
      }
    }
    onMouseWheeled(delta) {
      if (this._canScrollV && !this._vBar.hidden()) {
        if (this._vBar.setScrolledAmount(
          this._vBar.getScrolledAmount() - this._vBar.getNudgeAmount() * (delta / 60),
          true
        )) {
          return true;
        }
      }
      if (this._canScrollH && !this._hBar.hidden()) {
        if (this._hBar.setScrolledAmount(
          this._hBar.getScrolledAmount() - this._hBar.getNudgeAmount() * (delta / 60),
          true
        )) {
          return true;
        }
      }
      return super.onMouseWheeled(delta);
    }
  };

  // src/controls/MenuItem.ts
  var RightArrow = class extends Base {
    constructor(parent) {
      super(parent);
      this.setMouseInputEnabled(false);
    }
    render(skin) {
      skin.drawMenuRightArrow(this);
    }
  };
  var MenuItem = class _MenuItem extends Button {
    constructor(parent) {
      super(parent);
      this.onMenuItemSelected = new Signal();
      this.onChecked = new Signal();
      this.onUnChecked = new Signal();
      this.onCheckChange = new Signal();
      this._menu = null;
      this._checkable = false;
      this._checked = false;
      this._onStrip = false;
      this._accelerator = null;
      this._acceleratorText = "";
      this._submenuArrow = null;
      this.setHeight(22);
      this.setShouldDrawBackground(false);
      this.setTabable(false);
      this.setAlignment(Pos.CenterV | Pos.Left);
    }
    // Includes accelerator + submenu-arrow widths so the host menu's
    // shrink-wrap can reserve space for the right-aligned controls. Matches
    // GWEN MenuItem::SizeToContents (MenuItem.cpp:181).
    sizeToContents() {
      super.sizeToContents();
      if (this._accelerator) {
        this._accelerator.sizeToContents();
        this.setWidth(this.width() + this._accelerator.width());
      }
      if (this._submenuArrow) {
        this.setWidth(this.width() + this._submenuArrow.width());
      }
    }
    // ComboBox / MenuItem own the menu they pop up. Canvas's outside-click
    // close-menus walk skips controls that own a visible menu so a click on
    // the owner reaches its own toggle handler.
    ownsOpenMenu() {
      return this._menu !== null && this._menu.isVisible();
    }
    // =====================================================================
    // Checkable state
    // =====================================================================
    isCheckable() {
      return this._checkable;
    }
    setCheckable(b) {
      this._checkable = b;
    }
    isChecked() {
      return this._checked;
    }
    setChecked(b) {
      if (b === this._checked) return;
      this._checked = b;
      const info = eventInfo();
      info.controlCaller = this;
      this.onCheckChange.emit(info);
      if (b) this.onChecked.emit(info);
      else this.onUnChecked.emit(info);
      this.redraw();
    }
    toggleChecked() {
      this.setChecked(!this._checked);
    }
    // =====================================================================
    // Strip / submenu
    // =====================================================================
    setOnStrip(b) {
      this._onStrip = b;
    }
    isOnStrip() {
      return this._onStrip;
    }
    hasMenu() {
      return this._menu !== null;
    }
    // Lazy submenu construction — GWEN creates the Menu on first access so
    // leaf items don't pay the allocation cost. We parent the submenu to the
    // canvas so it can float on top of its owning menu's clip region.
    getMenu() {
      if (!this._menu) {
        const canvas = this.getCanvas();
        this._menu = new Menu(canvas ?? null);
        this._menu.hide();
        if (!this._onStrip) {
          this._submenuArrow = new RightArrow(this);
          this._submenuArrow.setSize(15, 15);
          this._submenuArrow.dock(Pos.Right);
        }
        this.invalidate();
      }
      return this._menu;
    }
    isMenuOpen() {
      return this._menu !== null && this._menu.isVisible();
    }
    openMenu() {
      if (!this._menu) return;
      if (this._onStrip && this.parent) {
        for (const sibling of this.parent.children) {
          if (sibling === this) continue;
          if (sibling instanceof _MenuItem && sibling.isOnStrip() && sibling.isMenuOpen()) {
            sibling.closeMenu();
          }
        }
      }
      this._menu.show();
      this._menu.bringToFront();
      const basePos = this.localPosToCanvas({ x: 0, y: 0 });
      if (this._onStrip) {
        this._menu.setPos(basePos.x, basePos.y + this.height() + 1);
      } else {
        this._menu.setPos(basePos.x + this.width(), basePos.y);
      }
    }
    closeMenu() {
      if (!this._menu) return;
      this._menu.close();
      this._menu.closeAll();
    }
    toggleMenu() {
      if (this.isMenuOpen()) this.closeMenu();
      else this.openMenu();
    }
    // =====================================================================
    // Accelerator label
    // =====================================================================
    setAccelerator(text) {
      if (this._accelerator) {
        if (this._acceleratorText) this.removeAccelerator(this._acceleratorText);
        this._accelerator.dispose();
        this._accelerator = null;
        this._acceleratorText = "";
      }
      if (!text) return;
      this._accelerator = new Label(this);
      this._accelerator.dock(Pos.Right);
      this._accelerator.setAlignment(Pos.Right | Pos.CenterV);
      this._accelerator.setMargin(margin(0, 0, 4, 0));
      this._accelerator.setText(text);
      this.addAccelerator(text, () => this.acceleratePressed());
      this._acceleratorText = text;
    }
    // Fires the press signal *and* closes any open menus, so a Ctrl+N
    // shortcut behaves like a click on the item — onPress fires, the
    // selected event fires, and any menus that were tucking the item
    // disappear. Overrides Button.acceleratePressed.
    acceleratePressed() {
      super.acceleratePressed();
      this.onPressItem();
    }
    // =====================================================================
    // Mouse — extend Button's left-click with submenu / close-menus logic.
    // =====================================================================
    onMouseClickLeft(x, y, pressed) {
      const wasDepressed = this.isDepressed();
      super.onMouseClickLeft(x, y, pressed);
      if (pressed) return;
      if (!wasDepressed) return;
      if (!this.isHovered()) return;
      this.onPressItem();
    }
    // Press handler — GWEN spells this `OnPress`; in the TS port we keep
    // Button's `onPress` signal semantics intact and do the item-specific
    // work in `onPressItem` invoked from the mouse-up branch above.
    onPressItem() {
      if (this.hasMenu()) {
        this.toggleMenu();
        return;
      }
      if (!this._onStrip) {
        if (this._checkable) this.toggleChecked();
        const info = eventInfo();
        info.controlCaller = this;
        this.onMenuItemSelected.emit(info);
        const canvas = this.getCanvas();
        if (canvas) canvas.closeMenus();
      }
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawMenuItem(this, this.isMenuOpen(), this._checkable && this._checked);
      if (this._accelerator) {
        this._accelerator.setTextColorOverride(this.effectiveTextColor(skin));
      }
    }
  };

  // src/controls/Menu.ts
  var Menu = class extends ScrollControl {
    constructor(parent) {
      super(parent);
      this.onMenuClosed = new Signal();
      // Icon gutter is hidden by default — call setShowIconMargin(true) to
      // reserve a 24px column for menu-item icons. Most menus don't use icons,
      // so the saved horizontal space tightens the popup.
      this._disableIconMargin = true;
      this._deleteOnClose = false;
      // Floor for sizeToContents; tunable via setMinimumWidth so a
      // ComboBox can make its popup at least as wide as the combo.
      this._minimumWidth = 100;
      this.setBounds(0, 0, 10, 10);
      this.setPadding(margin(2, 2, 2, 2));
      this.setDisabled(false);
      this.setAutoHideBars(true);
      this.setScroll(false, true);
      this.hide();
      this.setKeyboardInputEnabled(false);
    }
    // Menus register as menu-components so the canvas's outside-click
    // close-menus walk leaves clicks-inside-menus alone. Base.isMenuComponent
    // walks UP the parent chain so descendants (MenuItems, the inner scroll
    // container) inherit the truthy answer.
    isMenuComponent() {
      return true;
    }
    // Whether hovering an item in this menu should auto-open its submenu.
    // Regular menus always do; MenuStrip narrows to "only when the strip
    // already has another menu open" so the bar isn't twitchy on first
    // mouse-over.
    shouldHoverOpenMenu() {
      return true;
    }
    // Hover handler wired by addItem. Fires when the pointer enters a child
    // MenuItem; we open its submenu (closing siblings first) when the host
    // menu wants hover-driven opens.
    onHoverItem(ctrl) {
      if (!this.shouldHoverOpenMenu()) return;
      if (!(ctrl instanceof MenuItem)) return;
      if (ctrl.isMenuOpen()) return;
      this.closeAll();
      if (ctrl.hasMenu()) ctrl.openMenu();
    }
    // Close-on-outside-click hook called by Canvas. Closes any open submenus
    // hosted by this menu's items, then hides the menu itself if visible.
    closeMenus() {
      super.closeMenus();
      this.closeAll();
      if (this.isVisible()) this.close();
    }
    // =====================================================================
    // Configuration
    // =====================================================================
    setDisableIconMargin(b) {
      this._disableIconMargin = b;
    }
    // Inverse alias — call setShowIconMargin(true) to reserve a 24px icon
    // gutter on the left side of every item, false to hide it. Equivalent
    // to setDisableIconMargin(!b) but reads more naturally at the call site.
    setShowIconMargin(b) {
      this._disableIconMargin = !b;
    }
    isIconMarginDisabled() {
      return this._disableIconMargin;
    }
    isIconMarginVisible() {
      return !this._disableIconMargin;
    }
    setDeleteOnClose(b) {
      this._deleteOnClose = b;
    }
    shouldDeleteOnClose() {
      return this._deleteOnClose;
    }
    // =====================================================================
    // Items
    // =====================================================================
    addItem(name, icon = "", accelerator = "") {
      const inner = this.getInnerPanel() ?? this;
      const item = new MenuItem(inner);
      item.setPadding(margin(2, 4, 4, 4));
      item.setText(name);
      if (icon) item.setImage(icon);
      if (accelerator) item.setAccelerator(accelerator);
      item.dock(Pos.Top);
      item.setTextPadding(margin(this._disableIconMargin ? 0 : 24, 0, 12, 0));
      item.setAlignment(Pos.CenterV | Pos.Left);
      item.sizeToContents();
      item.onHoverEnter.on((e) => this.onHoverItem(e.controlCaller));
      this.invalidate();
      return item;
    }
    addDivider() {
      const inner = this.getInnerPanel() ?? this;
      const d = new MenuDivider(inner);
      d.dock(Pos.Top);
      d.setMargin(margin(this._disableIconMargin ? 0 : 24, 0, 4, 0));
      return d;
    }
    clearItems() {
      const inner = this.getInnerPanel();
      if (inner) inner.removeAllChildren();
      this.invalidate();
    }
    // =====================================================================
    // Open / close
    // =====================================================================
    open(pos) {
      this.show();
      this.bringToFront();
      const canvas = this.getCanvas();
      const p = pos ?? canvas?.mousePosition ?? point(0, 0);
      this.setPos(p.x, p.y);
    }
    close() {
      this.hide();
      const info = eventInfo();
      info.controlCaller = this;
      this.onMenuClosed.emit(info);
      if (this._deleteOnClose) {
        const canvas = this.getCanvas();
        if (canvas && typeof canvas.addDelayedDelete === "function") {
          canvas.addDelayedDelete(this);
        }
      }
    }
    // Closes every open submenu reachable through child items (not this
    // menu itself — matches GWEN Menu::CloseAll, Menu.cpp:100). Hovering a
    // sibling item inside a popup must NOT hide the popup; only the popup's
    // own `close()` does that.
    closeAll() {
      const inner = this.getInnerPanel();
      if (!inner) return;
      for (const c of inner.children) {
        if (c instanceof MenuItem) c.closeMenu();
      }
    }
    // True when any of this menu's items has its submenu open. Mirrors GWEN
    // Menu::IsMenuOpen (Menu.cpp:113) — the strip relies on this returning
    // false when no dropdown is showing, so it can gate hover-driven opens.
    // The popup-visibility check used to live here but conflated "the popup
    // is showing" with "a child submenu is open" — wrong for the strip,
    // which is permanently visible.
    isMenuOpen() {
      const inner = this.getInnerPanel();
      if (!inner) return false;
      for (const c of inner.children) {
        if (c instanceof MenuItem && c.isMenuOpen()) return true;
      }
      return false;
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawMenu(this, this._disableIconMargin);
    }
    renderUnder(skin) {
      super.renderUnder(skin);
      skin.drawShadow(this);
    }
    // =====================================================================
    // Layout — match upstream by shrink-wrapping height to child sum,
    // clamped to the canvas bottom so long menus don't spill off-screen.
    // =====================================================================
    layout(skin) {
      this.sizeToContents();
      const inner = this.getInnerPanel();
      if (inner) {
        let h = 0;
        for (const c of inner.children) {
          if (!c.isVisible()) continue;
          h += c.height();
        }
        const canvas = this.getCanvas();
        if (canvas && this.y() + h > canvas.height()) {
          h = canvas.height() - this.y();
        }
        const pad = this.getPadding();
        this.setSize(this.width(), h + pad.top + pad.bottom);
      }
      super.layout(skin);
    }
    // GWEN's Menu::Layout walks items once to call each item's SizeToContents
    // and then picks the widest; LayoutSizeToContents (an auxiliary method)
    // does the menu-wide width pass. We fold both into one method — called
    // from layout above — so the visible width always tracks the longest
    // item's natural width. Minimum width of 100 matches upstream feel.
    //
    // ScrollControl.updateScrollBars sets the inner panel to the menu's full
    // viewport width (no vbar gutter when bars auto-hide and content fits),
    // so docked items end up exactly menu.width wide. Adding the menu's own
    // padding here is the only overhead the items don't already account for.
    sizeToContents() {
      const inner = this.getInnerPanel();
      if (!inner) return;
      let maxW = this._minimumWidth;
      for (const c of inner.children) {
        if (!c.isVisible()) continue;
        if (typeof c.sizeToContents === "function") {
          c.sizeToContents();
        }
        const w = c.width();
        if (w > maxW) maxW = w;
      }
      const pad = this.getPadding();
      const total = maxW + pad.left + pad.right;
      if (total !== this.width()) {
        this.setWidth(total);
      }
    }
    // Floor for sizeToContents — the menu can grow wider than this when
    // an item demands more space, but it won't shrink below it. ComboBox
    // sets this to its own width before opening the popup so the menu
    // is always at least as wide as the combo (matching the OS-native
    // behaviour); sub-menus and free-standing menus keep the default
    // 100px floor.
    setMinimumWidth(w) {
      this._minimumWidth = Math.max(0, w);
      this.invalidate();
    }
    getMinimumWidth() {
      return this._minimumWidth;
    }
  };
  var MenuDivider = class extends Base {
    constructor(parent) {
      super(parent);
      this.setHeight(1);
    }
    render(skin) {
      skin.drawMenuDivider(this);
    }
  };

  // src/controls/Canvas.ts
  var DOUBLE_CLICK_SPEED = 0.5;
  var KEY_REPEAT_RATE = 0.03;
  var KEY_REPEAT_DELAY = 0.3;
  var MAX_MOUSE_BUTTONS = 5;
  var DRAG_START_THRESHOLD = 5;
  function nowSec() {
    return performance.now() / 1e3;
  }
  function cursorToCss(c) {
    switch (c) {
      case CursorType.Beam:
        return "text";
      case CursorType.SizeNS:
        return "ns-resize";
      case CursorType.SizeWE:
        return "ew-resize";
      case CursorType.SizeNWSE:
        return "nwse-resize";
      case CursorType.SizeNESW:
        return "nesw-resize";
      case CursorType.SizeAll:
        return "move";
      case CursorType.No:
        return "not-allowed";
      case CursorType.Wait:
        return "wait";
      case CursorType.Finger:
        return "pointer";
      case CursorType.Normal:
      default:
        return "default";
    }
  }
  var Canvas = class extends Base {
    constructor(skin, htmlCanvas) {
      super(null);
      this.isCanvas = true;
      // --- Canvas-wide input state (was file-statics in GWEN) ---
      this.hoveredControl = null;
      this.keyboardFocus = null;
      this.mouseFocus = null;
      this.firstTab = null;
      this.nextTab = null;
      // Full ordered list of tabable controls under this canvas, rebuilt
      // every frame in `recurseLayout`. Used by `Base.onKeyTab` to walk
      // both forward (Tab) and backward (Shift+Tab); `firstTab`/`nextTab`
      // are kept for back-compat with anything that still reads them.
      this.tabList = [];
      // Drag-and-drop dispatch state. `dragCandidate` is set on left-button
      // press over a draggable control; `dragStarted` flips once the pointer
      // has moved past `DRAG_START_THRESHOLD` so a stationary click never
      // triggers a drag. `dragHoverTarget` is the deepest acceptor under the
      // pointer during an active drag. Cleared on release.
      this.dragCandidate = null;
      this.dragPackage = null;
      // Tracks the control we hid in `beginDrag` so the layout reflows around
      // it. Restored by `endDrag` (see `restoreDragHiddenSource`).
      this.dragHiddenSource = null;
      this.dragHiddenSourceWasHidden = false;
      this.dragStartPos = point(0, 0);
      this.dragStarted = false;
      this.dragHoverTarget = null;
      this.mousePosition = point(0, 0);
      this.keyRepeatTarget = null;
      this.leftMouseDown = false;
      this.rightMouseDown = false;
      this.lastClickPos = point(0, 0);
      // --- Canvas-specific state ---
      this._drawBackground = false;
      this._backgroundColor = color(255, 255, 255, 255);
      this._needsRedraw = true;
      this._scale = 1;
      this._delayedDelete = /* @__PURE__ */ new Set();
      this._delayedDeleteList = [];
      this._detachInput = null;
      // Track last applied CSS cursor so we don't thrash `style.cursor` on
      // every pointer-move. Browsers throttle these writes internally but the
      // equality check is basically free.
      this._lastAppliedCursor = -1;
      this.skin = skin;
      this.renderer = skin.renderer;
      this.htmlCanvas = htmlCanvas;
      this.setSkin(skin);
      this.keyState = new Array(Key.Count).fill(false);
      this.keyNextRepeat = new Array(Key.Count).fill(0);
      this.lastClickTime = new Array(MAX_MOUSE_BUTTONS).fill(-1);
      this._detachInput = attachInput(htmlCanvas, this);
    }
    // ======================================================================
    // Canvas identity
    // ======================================================================
    // Tighten the return type from `Base`'s `CanvasLike | null`. Covariant
    // narrowing — TS allows this on override because `Canvas` is a
    // `CanvasLike`.
    getCanvas() {
      return this;
    }
    // Top-level redraw latch. GWEN walks up to the canvas; the canvas's
    // implementation just sets a flag rather than recursing.
    redraw() {
      this._needsRedraw = true;
    }
    isRedrawNeeded() {
      return this._needsRedraw;
    }
    // ======================================================================
    // Scale + background
    // ======================================================================
    setScale(s) {
      if (this._scale === s) return;
      this._scale = s;
      this.renderer.setScale(s);
      this.redraw();
    }
    getScale() {
      return this._scale;
    }
    setDrawBackground(b) {
      this._drawBackground = b;
    }
    setBackgroundColor(c) {
      this._backgroundColor = { r: c.r, g: c.g, b: c.b, a: c.a };
    }
    // ======================================================================
    // Cursor
    // ======================================================================
    // Base calls `canvas.setCursor(_cursor)` inside `updateCursor`. We map
    // GWEN's CursorType onto a CSS keyword and only touch `style.cursor`
    // when the value actually changes.
    setCursor(c) {
      if (this._lastAppliedCursor === c) return;
      this._lastAppliedCursor = c;
      this.htmlCanvas.style.cursor = cursorToCss(c);
    }
    // ======================================================================
    // Bounds
    // ======================================================================
    // When the canvas itself resizes, every child needs a fresh layout
    // pass. Base's `onBoundsChanged` would only invalidate when w/h
    // changed; at the canvas level even a pure translation is rare, so
    // always invalidate.
    onBoundsChanged(old) {
      super.onBoundsChanged(old);
      this.invalidate();
      this.invalidateChildren(true);
      this.redraw();
    }
    // ======================================================================
    // Per-frame lifecycle
    // ======================================================================
    // doThink — called once per frame by the host, before `renderCanvas`.
    // Matches Canvas.cpp:99 (`DoThink`).
    doThink() {
      this.processDelayedDeletes();
      if (this.hidden()) return;
      this.firstTab = null;
      this.nextTab = null;
      this.tabList = [];
      this.processDelayedDeletes();
      this.recurseLayout(this.skin);
      if (this.nextTab == null) this.nextTab = this.firstTab;
      if (this.mouseFocus && !this.mouseFocus.isVisible()) {
        this.mouseFocus = null;
      }
      if (this.keyboardFocus && (!this.keyboardFocus.isVisible() || !this.keyboardFocus.getKeyboardInputEnabled())) {
        this.keyboardFocus = null;
      }
      if (this.keyboardFocus) {
        const now = nowSec();
        for (let i = 0; i < Key.Count; i++) {
          if (this.keyState[i] && this.keyRepeatTarget !== this.keyboardFocus) {
            this.keyState[i] = false;
            continue;
          }
          if (this.keyState[i] && now > this.keyNextRepeat[i]) {
            this.keyNextRepeat[i] = now + KEY_REPEAT_RATE;
            this.keyboardFocus.onKeyPress(i, true);
          }
        }
      }
      this.updateHoveredControl();
    }
    // renderCanvas — runs the full render pass. Callers should check
    // `isRedrawNeeded()` first if they want to elide unchanged frames.
    renderCanvas() {
      if (!this._needsRedraw) return;
      this._needsRedraw = false;
      const r = this.renderer;
      r.begin();
      this.recurseLayout(this.skin);
      r.setClipRegion(this.getRenderBounds());
      r.setRenderOffset(point(-this.x(), -this.y()));
      r.setScale(this._scale);
      if (this._drawBackground) {
        r.setDrawColor(this._backgroundColor);
        r.drawFilledRect(this.getRenderBounds());
      }
      this.doRender(this.skin);
      this.renderToolTip();
      this.renderDragPreview();
      r.end();
    }
    // Tooltip overlay — drawn last so it floats above every other control.
    // Triggered by `hoveredControl` having a `_toolTip` child that wasn't
    // suppressed by a setToolTipControl(null). Uses a Label-backed tooltip
    // when available (set via Label.setToolTip); falls back to rendering
    // the placeholder Base's `name` as plain text.
    renderToolTip() {
      const hovered = this.hoveredControl;
      if (!hovered || hovered === this) return;
      const tip = hovered.getToolTip();
      if (!tip) return;
      const pad = 12;
      let tw = tip.width();
      let th = tip.height();
      if (tw <= 0 || th <= 0) {
        const text = tip.getName();
        if (!text) return;
        const size = this.skin.renderer.measureText(this.skin.getDefaultFont(), text);
        tw = size.x + 10;
        th = size.y + 6;
      }
      let tx = this.mousePosition.x + pad;
      let ty = this.mousePosition.y + pad + 8;
      if (tx + tw > this.width()) tx = this.width() - tw - 2;
      if (ty + th > this.height()) ty = this.mousePosition.y - th - 4;
      if (tx < 2) tx = 2;
      if (ty < 2) ty = 2;
      tip.setPos(tx, ty);
      const wasHidden = tip.hidden();
      tip.setHidden(false);
      const renderer = this.skin.renderer;
      const savedOffset = renderer.getRenderOffset();
      renderer.setRenderOffset(point(savedOffset.x + tx, savedOffset.y + ty));
      this.skin.drawToolTip(tip);
      renderer.setRenderOffset(savedOffset);
      tip.doRender(this.skin);
      tip.setHidden(wasHidden);
    }
    // Drag preview — renders the dragged source at the pointer offset
    // recorded when the drag started (`p.holdoffset`). Provides visual
    // feedback that mirrors what GWEN's DragAndDrop manager draws.
    renderDragPreview() {
      if (!this.dragStarted || !this.dragPackage) return;
      const dc = this.dragPackage.drawcontrol;
      if (!dc) return;
      const ho = this.dragPackage.holdoffset;
      const renderer = this.skin.renderer;
      const w = dc.width();
      const h = dc.height();
      if (w <= 0 || h <= 0) return;
      const oldOffset = renderer.getRenderOffset();
      const targetX = this.mousePosition.x - ho.x;
      const targetY = this.mousePosition.y - ho.y;
      renderer.setRenderOffset(point(targetX - dc.x(), targetY - dc.y()));
      dc.doRender(this.skin);
      renderer.setRenderOffset(oldOffset);
    }
    // ======================================================================
    // Hover
    // ======================================================================
    updateHoveredControl() {
      if (this.dragStarted) return;
      const mx = this.mousePosition.x;
      const my = this.mousePosition.y;
      let candidate = null;
      const raw = this.getControlAt(mx - this.x(), my - this.y());
      if (raw && raw !== this) candidate = raw;
      if (candidate !== this.hoveredControl) {
        const old = this.hoveredControl;
        this.hoveredControl = null;
        if (old) old.onMouseLeave();
        this.hoveredControl = candidate;
        if (candidate) candidate.onMouseEnter();
      }
      if (this.mouseFocus && this.mouseFocus.getCanvas() === this) {
        this.hoveredControl = this.mouseFocus;
      }
    }
    // ======================================================================
    // Focus helpers
    // ======================================================================
    // Climb from `start` to find the first ancestor that wants keyboard
    // input. Matches Canvas.cpp:InputMouseButton behaviour.
    findKeyboardFocus(start) {
      let node = start;
      while (node) {
        if (node.getKeyboardInputEnabled()) {
          node.focus();
          return node;
        }
        node = node.parent;
      }
      if (this.keyboardFocus) this.keyboardFocus.blur();
      return null;
    }
    // ======================================================================
    // Delayed delete
    // ======================================================================
    addDelayedDelete(ctrl) {
      if (this._delayedDelete.has(ctrl)) return;
      this._delayedDelete.add(ctrl);
      this._delayedDeleteList.push(ctrl);
    }
    // Called from Base.dispose via CanvasLike so we can forget a control
    // that's going away right now. Without this, `processDelayedDeletes`
    // would call `dispose()` on something already disposed.
    preDeleteCanvas(ctrl) {
      if (this._delayedDelete.has(ctrl)) {
        this._delayedDelete.delete(ctrl);
        const i = this._delayedDeleteList.indexOf(ctrl);
        if (i !== -1) this._delayedDeleteList.splice(i, 1);
      }
      if (this.hoveredControl === ctrl) this.hoveredControl = null;
      if (this.keyboardFocus === ctrl) this.keyboardFocus = null;
      if (this.mouseFocus === ctrl) this.mouseFocus = null;
    }
    processDelayedDeletes() {
      if (this._delayedDeleteList.length === 0) return;
      const snapshot = this._delayedDeleteList.slice();
      this._delayedDelete.clear();
      this._delayedDeleteList.length = 0;
      for (let i = 0; i < snapshot.length; i++) {
        snapshot[i].dispose();
      }
      this.redraw();
    }
    // Convenience for host code that wants to nuke every child in one
    // call without tearing down the Canvas itself.
    releaseChildren() {
      const kids = this.children.slice();
      for (let i = 0; i < kids.length; i++) {
        kids[i].dispose();
      }
    }
    // ======================================================================
    // Dispose
    // ======================================================================
    dispose() {
      if (this._detachInput) {
        this._detachInput();
        this._detachInput = null;
      }
      this.releaseChildren();
      super.dispose();
    }
    // ======================================================================
    // InputTarget — raw input from core/Input.ts
    // ======================================================================
    inputMouseMoved(x, y, dx, dy) {
      if (this.hidden()) return false;
      this.mousePosition = point(x, y);
      if (this.dragCandidate && !this.dragStarted) {
        const ddx = x - this.dragStartPos.x;
        const ddy = y - this.dragStartPos.y;
        if (ddx * ddx + ddy * ddy >= DRAG_START_THRESHOLD * DRAG_START_THRESHOLD) {
          this.beginDrag(x, y);
        }
      }
      if (this.dragStarted) {
        this.updateDragHover(x, y);
        this.redraw();
        return true;
      }
      this.updateHoveredControl();
      const hovered = this.hoveredControl;
      if (!hovered || hovered === this) return false;
      hovered.onMouseMoved(x, y, dx, dy);
      hovered.updateCursor();
      return true;
    }
    // Drag-and-drop dispatch helpers.
    beginDrag(x, y) {
      if (!this.dragCandidate) return;
      const pkg = this.dragCandidate.dragAndDrop_GetPackage(x, y);
      if (!pkg || !pkg.draggable) {
        this.dragCandidate = null;
        return;
      }
      if (!this.dragCandidate.dragAndDrop_StartDragging(pkg, x, y)) {
        this.dragCandidate = null;
        return;
      }
      this.dragPackage = pkg;
      this.dragStarted = true;
      if (this.hoveredControl && this.hoveredControl !== this) {
        const old = this.hoveredControl;
        this.hoveredControl = null;
        old.onMouseLeave();
      }
      const dc = pkg.drawcontrol;
      if (dc) {
        const target = pkg.name === "TabWindowMove" && dc.parent ? dc.parent : dc;
        this.dragHiddenSource = target;
        this.dragHiddenSourceWasHidden = target.hidden();
        target.setHidden(true);
      }
    }
    updateDragHover(x, y) {
      if (!this.dragPackage) return;
      const raw = this.getControlAt(x - this.x(), y - this.y());
      let target = raw === this ? null : raw;
      while (target) {
        if (target !== this.dragCandidate && target.dragAndDrop_CanAcceptPackage(this.dragPackage)) {
          break;
        }
        target = target.parent;
      }
      if (target !== this.dragHoverTarget) {
        if (this.dragHoverTarget) this.dragHoverTarget.dragAndDrop_HoverLeave(this.dragPackage);
        this.dragHoverTarget = target;
        if (target) target.dragAndDrop_HoverEnter(this.dragPackage, x, y);
      }
      if (target) target.dragAndDrop_Hover(this.dragPackage, x, y);
    }
    endDrag(x, y) {
      if (!this.dragStarted || !this.dragCandidate || !this.dragPackage) {
        this.dragCandidate = null;
        this.dragPackage = null;
        this.dragStarted = false;
        this.dragHoverTarget = null;
        this.restoreDragHiddenSource(false, "");
        return;
      }
      let success = false;
      if (this.dragHoverTarget) {
        success = this.dragHoverTarget.dragAndDrop_HandleDrop(this.dragPackage, x, y);
        this.dragHoverTarget.dragAndDrop_HoverLeave(this.dragPackage);
      }
      this.dragCandidate.dragAndDrop_EndDragging(success, x, y);
      this.restoreDragHiddenSource(success, this.dragPackage.name);
      this.dragCandidate = null;
      this.dragPackage = null;
      this.dragStarted = false;
      this.dragHoverTarget = null;
    }
    // Reverse the `setHidden(true)` from `beginDrag`. For a TabWindowMove
    // we only leave the source DockBase hidden if the drop emptied it
    // (consolidation already hid it on the way out — restoring would
    // put an empty bordered dock back on screen). A SAME-source drop
    // (re-docking the same dock onto its own edge to claim corner
    // priority) reaches HandleDrop's "skip the move" branch — the dock
    // still has all its tabs, so we restore visibility. Cancelled
    // drags, single-tab moves, and non-dock drags all also restore.
    restoreDragHiddenSource(success, packageName) {
      const target = this.dragHiddenSource;
      if (!target) return;
      this.dragHiddenSource = null;
      let leaveHidden = false;
      if (success && packageName === "TabWindowMove") {
        const maybeDock = target;
        leaveHidden = typeof maybeDock.isEmpty === "function" && maybeDock.isEmpty();
      }
      if (!leaveHidden) {
        target.setHidden(this.dragHiddenSourceWasHidden);
      }
    }
    inputMouseButton(button, pressed) {
      if (this.hidden()) return false;
      if (button === 0 && !pressed && this.dragStarted) {
        this.leftMouseDown = false;
        this.endDrag(this.mousePosition.x, this.mousePosition.y);
        return true;
      }
      const hovered = this.hoveredControl;
      if (pressed && (!hovered || !hovered.isMenuComponent() && !hovered.ownsOpenMenu())) {
        this.closeMenus();
      }
      if (button === 2 && pressed && (!hovered || !hovered.isMenuComponent())) {
        this.tryShowContextMenu(
          hovered ?? this,
          this.mousePosition.x,
          this.mousePosition.y
        );
      }
      if (!hovered || !hovered.isVisible() || hovered === this) return false;
      if (button >= MAX_MOUSE_BUTTONS) return false;
      if (button === 0) this.leftMouseDown = pressed;
      else if (button === 2) this.rightMouseDown = pressed;
      const now = nowSec();
      const isDouble = pressed && this.lastClickPos.x === this.mousePosition.x && this.lastClickPos.y === this.mousePosition.y && now - this.lastClickTime[button] < DOUBLE_CLICK_SPEED;
      if (pressed && !isDouble) {
        this.lastClickTime[button] = now;
        this.lastClickPos = { x: this.mousePosition.x, y: this.mousePosition.y };
      }
      if (pressed) {
        if (!hovered.isMenuComponent() && !hovered.ownsOpenMenu()) {
          this.findKeyboardFocus(hovered);
        }
      }
      if (button === 0) {
        if (pressed) {
          let scan = hovered;
          while (scan && !scan.dragAndDrop_Draggable()) scan = scan.parent;
          if (scan) {
            this.dragCandidate = scan;
            this.dragStartPos = { x: this.mousePosition.x, y: this.mousePosition.y };
            this.dragStarted = false;
          }
        } else {
          if (this.dragStarted) {
            this.endDrag(this.mousePosition.x, this.mousePosition.y);
          } else {
            this.dragCandidate = null;
          }
        }
      }
      hovered.updateCursor();
      if (pressed) hovered.touch();
      const mx = this.mousePosition.x;
      const my = this.mousePosition.y;
      switch (button) {
        case 0:
          if (pressed && isDouble) {
            hovered.onMouseDoubleClickLeft(mx, my);
          } else {
            hovered.onMouseClickLeft(mx, my, pressed);
          }
          break;
        case 2:
          if (pressed && isDouble) {
            hovered.onMouseDoubleClickRight(mx, my);
          } else {
            hovered.onMouseClickRight(mx, my, pressed);
          }
          break;
        default:
          break;
      }
      return true;
    }
    inputMouseWheel(val) {
      if (this.hidden()) return false;
      const hovered = this.hoveredControl;
      if (!hovered || hovered.getCanvas() !== this) return false;
      hovered.onMouseWheeled(val);
      return true;
    }
    // =====================================================================
    // Context menus
    //
    // Walks from `start` up the parent chain calling
    // `onContextMenuRequest(x, y)`. The first non-null Menu wins and is
    // opened at the cursor position. Auto-reparents the menu onto this
    // canvas so it always draws above everything regardless of how the
    // user wired it up. Caller-side bubbling: a control that returns
    // `null` from `onContextMenuRequest` defers to its parent — handy
    // when the inner control wants the parent's menu, or when a
    // dynamically-built menu decides to bow out.
    // =====================================================================
    tryShowContextMenu(start, x, y) {
      let scan = start;
      while (scan) {
        const candidate = scan.onContextMenuRequest(x, y);
        if (candidate instanceof Menu) {
          if (candidate.parent !== this) candidate.setParent(this);
          candidate.open(point(x, y));
          return;
        }
        scan = scan.parent;
      }
    }
    inputKey(key, pressed) {
      if (this.hidden()) return false;
      if (key <= Key.Invalid || key >= Key.Count) return false;
      const target = this.keyboardFocus && this.keyboardFocus.isVisible() && this.keyboardFocus.getCanvas() === this ? this.keyboardFocus : null;
      let consumed = false;
      if (pressed && !this.keyState[key]) {
        this.keyState[key] = true;
        this.keyNextRepeat[key] = nowSec() + KEY_REPEAT_DELAY;
        this.keyRepeatTarget = target;
        if (target) consumed = target.onKeyPress(key, true);
      } else if (!pressed && this.keyState[key]) {
        this.keyState[key] = false;
        if (target) consumed = target.onKeyRelease(key);
      }
      if (target && key === Key.Tab) consumed = true;
      return consumed;
    }
    inputCharacter(ch) {
      if (this.hidden()) return false;
      const cp = ch.codePointAt(0);
      if (cp === void 0 || cp < 32) return false;
      const target = this.keyboardFocus;
      if (!target || !target.isVisible() || target.getCanvas() !== this || this.isControlDown()) {
        return false;
      }
      target.onChar(ch);
      return true;
    }
    // Walk the visible control tree for a control with a matching
    // accelerator binding (added via `Base.addAccelerator`). First match
    // wins — typically a MenuItem whose `setAccelerator(text)` registered
    // the binding. The standard clipboard / select-all shortcuts route
    // straight to a text-input keyboard-focus target before the tree
    // walk so a focused TextBox eats Ctrl+C/X/V/A even when a menu item
    // also bound those keys.
    inputAccelerator(text) {
      if (this.hidden()) return false;
      const focus = this.keyboardFocus;
      if (focus && focus.isVisible() && focus.needsInputChars()) {
        switch (text) {
          case "Ctrl+C":
            focus.onCopy();
            return true;
          case "Ctrl+X":
            focus.onCut();
            return true;
          case "Ctrl+V":
            focus.onPaste();
            return true;
          case "Ctrl+A":
            focus.onSelectAll();
            return true;
        }
      }
      return this.handleAccelerator(text);
    }
    // ======================================================================
    // Modifier queries
    // ======================================================================
    isKeyDown(key) {
      if (key < 0 || key >= Key.Count) return false;
      return this.keyState[key];
    }
    isControlDown() {
      return this.keyState[Key.Control] || this.keyState[Key.Command];
    }
    isShiftDown() {
      return this.keyState[Key.Shift];
    }
    isAltDown() {
      return this.keyState[Key.Alt];
    }
  };

  // src/controls/Rectangle.ts
  var Rectangle = class extends Base {
    constructor() {
      super(...arguments);
      this._color = color(255, 255, 255, 255);
    }
    getColor() {
      return this._color;
    }
    setColor(c) {
      this._color = { r: c.r, g: c.g, b: c.b, a: c.a };
      this.redraw();
    }
    render(skin) {
      skin.renderer.setDrawColor(this._color);
      skin.renderer.drawFilledRect(this.getRenderBounds());
    }
  };

  // src/controls/ProgressBar.ts
  var ProgressBar = class extends Label {
    constructor(parent) {
      super(parent);
      this._progress = 0;
      this._horizontal = true;
      this._autoLabel = true;
      this._cycleSpeed = 0;
      this.setMouseInputEnabled(true);
      this.setSize(128, 32);
      this.setTextPadding(margin(3, 0, 3, 0));
      this.setAlignment(Pos.Center);
      this.setText("0%");
    }
    // =====================================================================
    // Progress
    // =====================================================================
    setProgress(f) {
      const clamped = f < 0 ? 0 : f > 1 ? 1 : f;
      if (clamped === this._progress) return;
      this._progress = clamped;
      if (this._autoLabel) this.setText(`${Math.floor(clamped * 100)}%`);
      this.redraw();
    }
    getProgress() {
      return this._progress;
    }
    // GWEN aliases setProgress as setValueFloat for use as a numeric value
    // carrier; the inherited Label.setValue(string) still works for text.
    setValueFloat(v) {
      this.setProgress(v);
    }
    getValueFloat() {
      return this._progress;
    }
    // =====================================================================
    // Orientation
    // =====================================================================
    setVertical() {
      if (!this._horizontal) return;
      this._horizontal = false;
      this.redraw();
    }
    setHorizontal() {
      if (this._horizontal) return;
      this._horizontal = true;
      this.redraw();
    }
    isHorizontal() {
      return this._horizontal;
    }
    // =====================================================================
    // Auto label + cycle
    // =====================================================================
    setAutoLabel(b) {
      this._autoLabel = b;
    }
    getAutoLabel() {
      return this._autoLabel;
    }
    setCycleSpeed(f) {
      this._cycleSpeed = f;
    }
    getCycleSpeed() {
      return this._cycleSpeed;
    }
    // =====================================================================
    // Think — animates cycle mode. Fixed-step until T603 wires real dt.
    // =====================================================================
    think() {
      super.think();
      if (this._cycleSpeed === 0) return;
      let p = this._progress + this._cycleSpeed * (1 / 60);
      while (p > 1) p -= 1;
      while (p < 0) p += 1;
      this.setProgress(p);
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawProgressBar(this, this._horizontal, this._progress);
    }
  };

  // src/controls/GroupBox.ts
  var GroupBox = class extends Label {
    constructor(parent) {
      super(parent);
      this._innerMarginPx = 6;
      this.setAlignment(Pos.Top | Pos.Left);
      this.setTextPadding(margin(10, 0, 0, 0));
      this.setMouseInputEnabled(true);
      const inner = new Base(this);
      inner.dock(Pos.Fill);
      this._inner = inner;
      this.setInnerPanel(inner);
    }
    // =====================================================================
    // Inner margin
    // =====================================================================
    setInnerMargin(px) {
      if (this._innerMarginPx === px) return;
      this._innerMarginPx = px;
      this.invalidate();
    }
    getInnerMargin() {
      return this._innerMarginPx;
    }
    // The inner panel itself, for callers that want to configure it
    // directly (set a color, override docking, etc).
    getInnerPanel() {
      return this._inner;
    }
    // =====================================================================
    // Layout
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      if (!this._inner) return;
      const th = this.textHeight();
      const m = this._innerMarginPx;
      this._inner.setMargin(margin(m, Math.floor(th / 2) + m, m, m));
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawGroupBox(this, this.textX(), this.textHeight(), this.textWidth());
    }
  };

  // src/controls/StatusBar.ts
  var StatusBar = class extends Label {
    constructor(parent) {
      super(parent);
      this.setHeight(22);
      this.dock(Pos.Bottom);
      this.setPadding(margin(2, 2, 2, 2));
      this.setAlignment(Pos.Left | Pos.CenterV);
      this.setMouseInputEnabled(true);
    }
    // Dock a pre-built control onto the status bar. `right=true` pins it
    // to the trailing edge; otherwise it docks to the leading edge.
    addControl(ctrl, right = false) {
      ctrl.setParent(this);
      ctrl.dock(right ? Pos.Right : Pos.Left);
    }
    render(skin) {
      skin.drawStatusBar(this);
    }
  };

  // src/controls/FieldLabel.ts
  var _FieldLabel = class _FieldLabel extends Label {
    constructor(parent) {
      super(parent);
      this._field = null;
      this._fieldWidthOffset = _FieldLabel.DEFAULT_FIELD_WIDTH_OFFSET;
      this.setMargin(margin(0, 1, 0, 1));
      this.setAlignment(Pos.CenterV | Pos.Left);
    }
    // =====================================================================
    // Field assignment
    // =====================================================================
    setField(ctrl) {
      this._field = ctrl;
      ctrl.setParent(this);
      ctrl.dock(Pos.Right);
    }
    getField() {
      return this._field;
    }
    setFieldWidthOffset(px) {
      if (this._fieldWidthOffset === px) return;
      this._fieldWidthOffset = px;
      this.invalidate();
    }
    // =====================================================================
    // Layout
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      if (this._field) {
        this._field.setWidth(this.width() - this._fieldWidthOffset);
      }
    }
    // =====================================================================
    // Factory — GWEN's convenient "take any control, slap a caption on
    // the left" helper. The passed control's existing dock + bounds are
    // inherited by the new FieldLabel so the pair occupies the same space
    // the caller had already reserved for the field alone.
    // =====================================================================
    static setup(control, text) {
      const parent = control.parent;
      if (!parent) {
        throw new Error("FieldLabel.setup requires control to have a parent");
      }
      const fl = new _FieldLabel(parent);
      const b = control.getBounds();
      fl.setBounds(b.x, b.y, b.w, b.h);
      fl.dock(control.getDock());
      fl.setText(text);
      fl.setField(control);
      return fl;
    }
  };
  // Matches GWEN's hard-coded label-column width. Overridable via
  // `setFieldWidthOffset` for callers that need a different ratio.
  _FieldLabel.DEFAULT_FIELD_WIDTH_OFFSET = 70;
  var FieldLabel = _FieldLabel;

  // src/controls/Resizer.ts
  var Resizer = class extends Dragger {
    constructor(parent) {
      super(parent);
      this.onResize = new Signal();
      this._resizeDir = Pos.Left;
      this.setResizeDir(Pos.Left);
      this.setSize(6, 6);
    }
    // =====================================================================
    // Direction — sets which edge(s)/corner this handle grabs, and picks
    // the matching cursor.
    // =====================================================================
    setResizeDir(dir) {
      this._resizeDir = dir;
      if (dir & Pos.Left && dir & Pos.Top) {
        this.setCursor(CursorType.SizeNWSE);
        return;
      }
      if (dir & Pos.Right && dir & Pos.Bottom) {
        this.setCursor(CursorType.SizeNWSE);
        return;
      }
      if (dir & Pos.Right && dir & Pos.Top) {
        this.setCursor(CursorType.SizeNESW);
        return;
      }
      if (dir & Pos.Left && dir & Pos.Bottom) {
        this.setCursor(CursorType.SizeNESW);
        return;
      }
      if (dir & (Pos.Left | Pos.Right)) {
        this.setCursor(CursorType.SizeWE);
        return;
      }
      if (dir & (Pos.Top | Pos.Bottom)) {
        this.setCursor(CursorType.SizeNS);
        return;
      }
    }
    getResizeDir() {
      return this._resizeDir;
    }
    // =====================================================================
    // Drag → resize
    // =====================================================================
    onMouseMoved(_x, _y, dx, dy) {
      if (this.isDisabled()) return;
      if (!this._depressed) return;
      const t = this._target;
      if (!t) return;
      const b = t.getBounds();
      const min = t.getMinimumSize();
      let nx = b.x;
      let ny = b.y;
      let nw = b.w;
      let nh = b.h;
      if (this._resizeDir & Pos.Left) {
        const newW = Math.max(min.x, nw - dx);
        nx = b.x + (b.w - newW);
        nw = newW;
      } else if (this._resizeDir & Pos.Right) {
        nw = Math.max(min.x, nw + dx);
      }
      if (this._resizeDir & Pos.Top) {
        const newH = Math.max(min.y, nh - dy);
        ny = b.y + (b.h - newH);
        nh = newH;
      } else if (this._resizeDir & Pos.Bottom) {
        nh = Math.max(min.y, nh + dy);
      }
      t.setBounds(nx, ny, nw, nh);
      const info = eventInfo();
      info.controlCaller = this;
      this.onResize.emit(info);
    }
  };

  // src/controls/LabelClickable.ts
  var LabelClickable = class extends Button {
    constructor(parent) {
      super(parent);
      this.setShouldDrawBackground(false);
      this.setIsToggle(false);
      this.setCursor(CursorType.Finger);
      this.setAlignment(Pos.Left | Pos.CenterV);
    }
    // LabelClickable never paints a button body. Intentionally empty.
    render(_skin) {
    }
  };

  // src/controls/CheckBox.ts
  var CheckBox = class extends Button {
    constructor(parent) {
      super(parent);
      this.onChecked = new Signal();
      this.onUnChecked = new Signal();
      this.onCheckChanged = new Signal();
      this._checked = false;
      this.setSize(15, 15);
      this.setMouseInputEnabled(true);
    }
    // =====================================================================
    // Checked state
    // =====================================================================
    isChecked() {
      return this._checked;
    }
    setChecked(b) {
      if (this._checked === b) return;
      this._checked = b;
      const info = this.info();
      this.onCheckChanged.emit(info);
      if (b) this.onChecked.emit(info);
      else this.onUnChecked.emit(info);
      this.redraw();
    }
    toggle() {
      this.setChecked(!this._checked);
    }
    /**
     * Subclasses (RadioButton) override to `false` so clicking an already-
     * checked radio doesn't deselect the group's sole selection.
     */
    allowUncheck() {
      return true;
    }
    // =====================================================================
    // Mouse — toggle on release if the click landed inside us while
    // depressed. We defer to Button.onMouseClickLeft for focus / onDown /
    // onUp / onPress, then layer the check-toggle behaviour on top.
    // =====================================================================
    onMouseClickLeft(x, y, pressed) {
      const wasDepressed = this.isDepressed();
      super.onMouseClickLeft(x, y, pressed);
      if (pressed) return;
      if (!wasDepressed) return;
      if (!this.isHovered()) return;
      if (this._checked && !this.allowUncheck()) return;
      this.toggle();
    }
    // =====================================================================
    // Keyboard — Space / Return run Button's press handler (which fires
    // onPress) and then toggle the checked state, mirroring the click
    // path. allowUncheck() blocks the toggle on RadioButton when it
    // would deselect the current selection.
    // =====================================================================
    onKeyPress(key, pressed = true) {
      if ((key === Key.Space || key === Key.Return) && pressed && !this.isDisabled()) {
        super.onKeyPress(key, pressed);
        if (this._checked && !this.allowUncheck()) return true;
        this.toggle();
        return true;
      }
      return super.onKeyPress(key, pressed);
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawCheckBox(this, this._checked, this.isDepressed());
    }
    info() {
      const i = eventInfo();
      i.controlCaller = this;
      return i;
    }
  };
  var CheckBoxWithLabel = class extends Base {
    constructor(parent) {
      super(parent);
      this.setSize(200, 19);
      this._checkbox = new CheckBox(this);
      this._checkbox.dock(Pos.Left);
      this._checkbox.setMargin(margin(0, 2, 2, 2));
      this._label = new LabelClickable(this);
      this._label.dock(Pos.Fill);
      this._label.onPress.on(() => this._checkbox.toggle());
    }
    getCheckBox() {
      return this._checkbox;
    }
    getLabel() {
      return this._label;
    }
  };

  // src/controls/RichLabel.ts
  var RichLabel = class extends Base {
    constructor(parent) {
      super(parent);
      this._blocks = [];
      this._rebuildRequired = true;
      this._defaultColor = color(255, 255, 255, 255);
      this._defaultColorIsExplicit = false;
      this.setMouseInputEnabled(false);
    }
    // =====================================================================
    // Content
    // =====================================================================
    /**
     * Append a span of text, optionally with an explicit colour / font.
     * Embedded `\n` characters become synthetic line-break blocks so the
     * caller can just pass `"Hello\nWorld"` without manually splitting.
     */
    addText(text, col, font2) {
      if (text.length === 0) return;
      const parts = text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) this._blocks.push({ kind: "newline" });
        if (parts[i].length > 0) {
          const src = col ?? (this._defaultColorIsExplicit ? this._defaultColor : null);
          this._blocks.push({
            kind: "text",
            text: parts[i],
            color: src ? { r: src.r, g: src.g, b: src.b, a: src.a } : null,
            font: font2 ?? null
          });
        }
      }
      this._rebuildRequired = true;
      this.invalidate();
    }
    addLineBreak() {
      this._blocks.push({ kind: "newline" });
      this._rebuildRequired = true;
      this.invalidate();
    }
    clear() {
      this._blocks = [];
      this._rebuildRequired = true;
      this.invalidate();
    }
    setDefaultTextColor(c) {
      this._defaultColor = { r: c.r, g: c.g, b: c.b, a: c.a };
      this._defaultColorIsExplicit = true;
    }
    // =====================================================================
    // Layout
    // =====================================================================
    onBoundsChanged(old) {
      super.onBoundsChanged(old);
      if (old.w !== this.width()) {
        this._rebuildRequired = true;
      }
    }
    layout(skin) {
      super.layout(skin);
      if (!this._rebuildRequired) return;
      this.rebuild(skin);
      this._rebuildRequired = false;
    }
    /**
     * Tear down all existing Text children and reflow the block list into
     * per-token Text controls. Words are wrapped at the control's width;
     * leading whitespace at the start of a wrapped line is discarded.
     */
    rebuild(skin) {
      this.removeAllChildren();
      const maxWidth = this.width();
      const defaultFont = (() => {
        try {
          return skin.getDefaultFont();
        } catch {
          return null;
        }
      })();
      let x = 0;
      let y = 0;
      let lineHeight = 0;
      for (let bi = 0; bi < this._blocks.length; bi++) {
        const b = this._blocks[bi];
        if (b.kind === "newline") {
          x = 0;
          y += lineHeight > 0 ? lineHeight : 1;
          lineHeight = 0;
          continue;
        }
        const font2 = b.font ?? defaultFont;
        const tokens = splitIntoTokens(b.text);
        for (let ti = 0; ti < tokens.length; ti++) {
          const tok = tokens[ti];
          let tokWidth = 0;
          let tokHeight = font2 ? Math.max(1, font2.size) : 1;
          if (font2) {
            const size = skin.renderer.measureText(font2, tok);
            tokWidth = Math.ceil(size.x);
            tokHeight = Math.ceil(size.y);
          }
          if (x > 0 && x + tokWidth > maxWidth) {
            x = 0;
            y += lineHeight > 0 ? lineHeight : 1;
            lineHeight = 0;
            if (/^\s+$/.test(tok)) continue;
          }
          const t = new Text(this);
          if (font2) t.setFont(font2);
          if (b.color) t.setTextColor(b.color);
          t.setText(tok);
          t.refreshSize();
          t.setPos(x, y);
          x += tokWidth > 0 ? tokWidth : t.width();
          const h = tokHeight > 0 ? tokHeight : t.height();
          if (h > lineHeight) lineHeight = h;
        }
      }
      const finalHeight = y + (lineHeight > 0 ? lineHeight : 0);
      if (finalHeight !== this.height()) {
        this.setHeight(finalHeight);
      }
    }
  };
  function splitIntoTokens(text) {
    const out = [];
    const re = /(\s+|\S+)/g;
    let m;
    while ((m = re.exec(text)) !== null) out.push(m[0]);
    return out;
  }

  // src/controls/Slider.ts
  var SliderBar = class extends Dragger {
    constructor(parent) {
      super(parent);
      this._horizontal = true;
      this.setTarget(this);
      this.setRestrictToParent(true);
    }
    setHorizontal(b) {
      this._horizontal = b;
    }
    isHorizontal() {
      return this._horizontal;
    }
    render(skin) {
      skin.drawSlideButton(this, this._depressed, this._horizontal);
    }
  };
  var Slider = class extends Base {
    constructor(parent) {
      super(parent);
      this.onValueChanged = new Signal();
      this._min = 0;
      this._max = 1;
      // Normalized 0..1 position of the bar along the track.
      this._value = 0;
      this._numNotches = 5;
      this._clampToNotches = false;
      this.setBounds(0, 0, 32, 128);
      this._bar = new SliderBar(this);
      this._bar.onDragged.on(() => this.onMoved());
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
    }
    // =====================================================================
    // Range + value
    // =====================================================================
    setRange(min, max) {
      this._min = min;
      this._max = max;
    }
    getMin() {
      return this._min;
    }
    getMax() {
      return this._max;
    }
    setFloatValue(v, forceUpdate = false) {
      const span = this._max - this._min;
      let normalized = span === 0 ? 0 : (v - this._min) / span;
      if (normalized < 0) normalized = 0;
      else if (normalized > 1) normalized = 1;
      if (this._clampToNotches && this._numNotches > 0) {
        normalized = Math.floor(normalized * this._numNotches + 0.5) / this._numNotches;
      }
      if (normalized === this._value && !forceUpdate) return;
      this._value = normalized;
      const info = eventInfo();
      info.controlCaller = this;
      this.onValueChanged.emit(info);
      this.invalidate();
      this.redraw();
    }
    getFloatValue() {
      return this._min + this._value * (this._max - this._min);
    }
    // =====================================================================
    // Notches
    // =====================================================================
    setNotchCount(n) {
      this._numNotches = n;
    }
    getNotchCount() {
      return this._numNotches;
    }
    setClampToNotches(b) {
      this._clampToNotches = b;
      this.setFloatValue(this.getFloatValue(), true);
    }
    isClampedToNotches() {
      return this._clampToNotches;
    }
    // =====================================================================
    // Keyboard — arrows step by 1 unit of the caller's range; Home/End
    // jump to the endpoints. Matches GWEN's Slider.cpp:34.
    // =====================================================================
    onKeyLeft(down) {
      if (down) this.setFloatValue(this.getFloatValue() - 1);
      return true;
    }
    onKeyRight(down) {
      if (down) this.setFloatValue(this.getFloatValue() + 1);
      return true;
    }
    onKeyUp(down) {
      if (down) this.setFloatValue(this.getFloatValue() + 1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.setFloatValue(this.getFloatValue() - 1);
      return true;
    }
    onKeyHome(down) {
      if (down) this.setFloatValue(this._min);
      return true;
    }
    onKeyEnd(down) {
      if (down) this.setFloatValue(this._max);
      return true;
    }
    onMoved() {
      const normalized = this.calculateValue();
      const real = this._min + normalized * (this._max - this._min);
      this.setFloatValue(real);
      if (this._clampToNotches) this.snapBarToValue();
    }
  };
  var _HorizontalSlider = class _HorizontalSlider extends Slider {
    constructor(parent) {
      super(parent);
      this._bar.setHorizontal(true);
    }
    calculateValue() {
      const track = this.width() - _HorizontalSlider.BAR_SIZE;
      if (track <= 0) return 0;
      return this._bar.x() / track;
    }
    snapBarToValue() {
      this._bar.moveTo(this._value * (this.width() - _HorizontalSlider.BAR_SIZE), 0);
    }
    onMouseClickLeft(x, y, pressed) {
      if (!pressed) return;
      const local = this.canvasPosToLocal(point(x, y));
      this._bar.moveTo(local.x - this._bar.width() * 0.5, this._bar.y());
      this._bar.onMouseClickLeft(x, y, pressed);
      this.onMoved();
    }
    layout(skin) {
      super.layout(skin);
      this._bar.setSize(_HorizontalSlider.BAR_SIZE, this.height());
      this._bar.moveTo(this._value * (this.width() - _HorizontalSlider.BAR_SIZE), 0);
    }
    render(skin) {
      skin.drawSlider(
        this,
        true,
        this._clampToNotches ? this._numNotches : 0,
        this._bar.width()
      );
    }
    // Track-aligned focus band — wraps the nib with a few px of breathing
    // room on each side and overshoots the slider's left/right edges by
    // 3 px so the corners land in clean negative space rather than on
    // top of the nib at min/max value. Even height + Y derived from
    // `(slider.h - boxH) / 2` keeps top/bottom slack equal in pixel
    // space, dodging the half-pixel rounding asymmetry that biased the
    // previous 5-tall box visibly toward the bottom.
    //
    // Drawn from `renderUnder` rather than `renderFocus` so the
    // draggable nib (a child, drawn after `render`) ends up on top of
    // the dashed band instead of underneath it. Both hooks run with the
    // parent's clip active (see Base.renderRecursive), so the ±3px
    // overshoot still shows.
    renderUnder(skin) {
      super.renderUnder(skin);
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this.isTabable()) return;
      const boxH = 12;
      const boxY = Math.floor((this.height() - boxH) / 2);
      skin.drawKeyboardHighlight(this, rect(-3, boxY, this.width() + 6, boxH), 0);
    }
    // Suppress the default focus ring — already drawn beneath children
    // in `renderUnder`. Without this, Base.renderFocus would also paint
    // its default rectangle on top of the nib.
    renderFocus(_skin) {
    }
  };
  // Thumb size in pixels — 15 matches the Input.Slider.H.* single atlas
  // regions in DynamicSkin.
  _HorizontalSlider.BAR_SIZE = 15;
  var HorizontalSlider = _HorizontalSlider;
  var _VerticalSlider = class _VerticalSlider extends Slider {
    constructor(parent) {
      super(parent);
      this._bar.setHorizontal(false);
    }
    calculateValue() {
      const track = this.height() - _VerticalSlider.BAR_SIZE;
      if (track <= 0) return 0;
      return 1 - this._bar.y() / track;
    }
    snapBarToValue() {
      this._bar.moveTo(0, (1 - this._value) * (this.height() - _VerticalSlider.BAR_SIZE));
    }
    onMouseClickLeft(x, y, pressed) {
      if (!pressed) return;
      const local = this.canvasPosToLocal(point(x, y));
      this._bar.moveTo(this._bar.x(), local.y - this._bar.height() * 0.5);
      this._bar.onMouseClickLeft(x, y, pressed);
      this.onMoved();
    }
    layout(skin) {
      super.layout(skin);
      this._bar.setSize(this.width(), _VerticalSlider.BAR_SIZE);
      this._bar.moveTo(0, (1 - this._value) * (this.height() - _VerticalSlider.BAR_SIZE));
    }
    render(skin) {
      skin.drawSlider(
        this,
        false,
        this._clampToNotches ? this._numNotches : 0,
        this._bar.height()
      );
    }
    // See HorizontalSlider.renderUnder — same idea, vertical orientation:
    // a 12px-wide band centered on the slider's width with 3px overshoot
    // top/bottom so the corners stay clear of the nib at min/max value.
    // Drawn from `renderUnder` so the nib (child, drawn after `render`)
    // sits on top.
    renderUnder(skin) {
      super.renderUnder(skin);
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this.isTabable()) return;
      const boxW = 12;
      const boxX = Math.floor((this.width() - boxW) / 2);
      skin.drawKeyboardHighlight(this, rect(boxX, -3, boxW, this.height() + 6), 0);
    }
    renderFocus(_skin) {
    }
  };
  _VerticalSlider.BAR_SIZE = 15;
  var VerticalSlider = _VerticalSlider;

  // src/controls/RadioButton.ts
  var RadioButton = class extends CheckBox {
    constructor(parent) {
      super(parent);
      this.setSize(15, 15);
    }
    // GWEN's RadioButton.cpp:16 — a radio refuses to uncheck itself so the
    // group always has exactly one selection.
    allowUncheck() {
      return false;
    }
    render(skin) {
      skin.drawRadioButton(this, this.isChecked(), this.isDepressed());
    }
  };
  var LabeledRadioButton = class extends Base {
    constructor(parent) {
      super(parent);
      this.setSize(200, 19);
      this.radioButton = new RadioButton(this);
      this.radioButton.dock(Pos.Left);
      this.radioButton.setMargin(margin(0, 2, 2, 2));
      this.radioButton.setTabable(false);
      this.radioButton.setKeyboardInputEnabled(false);
      this.label = new LabelClickable(this);
      this.label.dock(Pos.Fill);
      this.label.setAlignment(Pos.CenterV | Pos.Left);
      this.label.setText("Radio Button");
      this.label.setTabable(false);
      this.label.setKeyboardInputEnabled(false);
      this.label.onPress.on(() => this.radioButton.setChecked(true));
    }
    select() {
      this.radioButton.setChecked(true);
    }
    isChecked() {
      return this.radioButton.isChecked();
    }
    // Space key toggles the radio even when focus rests on the label row
    // itself (GWEN's LabeledRadioButton delegates to its child RadioButton).
    onKeyPress(key, pressed = true) {
      if (pressed && key === Key.Space) {
        this.radioButton.setChecked(!this.radioButton.isChecked());
        return true;
      }
      return super.onKeyPress(key, pressed);
    }
    // Draw the focus highlight around the full row rather than just the
    // radio glyph. Matches LabeledRadioButton.cpp:21.
    renderFocus(skin) {
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this.isTabable()) return;
      skin.drawKeyboardHighlight(this, this.getRenderBounds(), 0);
    }
  };

  // src/controls/RadioButtonController.ts
  var RadioButtonController = class extends Base {
    constructor(parent) {
      super(parent);
      this.onSelectionChange = new Signal();
      this._selected = null;
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
    }
    addOption(text, optionalName = "") {
      const lrb = new LabeledRadioButton(this);
      lrb.setName(optionalName);
      lrb.label.setText(text);
      lrb.dock(Pos.Top);
      lrb.setMargin(margin(0, 1, 0, 1));
      lrb.setKeyboardInputEnabled(false);
      lrb.setTabable(false);
      lrb.radioButton.onChecked.on(() => this.onRadioChecked(lrb));
      this.invalidate();
      return lrb;
    }
    getSelected() {
      return this._selected;
    }
    getSelectedName() {
      return this._selected ? this._selected.getName() : "";
    }
    // =====================================================================
    // Keyboard nav — Up/Down (and Left/Right for mirror-symmetry with
    // horizontal layouts) move selection between options. Wraps at ends.
    // =====================================================================
    onKeyUp(down) {
      if (down) this.moveSelection(-1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.moveSelection(1);
      return true;
    }
    onKeyLeft(down) {
      if (down) this.moveSelection(-1);
      return true;
    }
    onKeyRight(down) {
      if (down) this.moveSelection(1);
      return true;
    }
    renderFocus(skin) {
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this.isTabable()) return;
      const options = this.getOptions();
      const focusRow = this._selected ?? options[0] ?? null;
      if (!focusRow) return;
      skin.drawKeyboardHighlight(this, focusRow.getBounds(), 0);
    }
    getOptions() {
      return this.children.filter((c) => c instanceof LabeledRadioButton);
    }
    moveSelection(delta) {
      const opts = this.getOptions();
      if (opts.length === 0) return;
      const cur = this._selected;
      const idx = cur ? opts.indexOf(cur) : -1;
      let next;
      if (idx === -1) next = delta > 0 ? 0 : opts.length - 1;
      else next = (idx + delta + opts.length) % opts.length;
      opts[next].radioButton.setChecked(true);
    }
    onRadioChecked(source) {
      const kids = this.children;
      for (let i = 0; i < kids.length; i++) {
        const c = kids[i];
        if (c instanceof LabeledRadioButton && c !== source) {
          c.radioButton.setChecked(false);
        }
      }
      this._selected = source;
      const info = eventInfo();
      info.controlCaller = this;
      this.onSelectionChange.emit(info);
    }
  };

  // src/controls/TextBox.ts
  var CARET_HOLD_SEC = 1.5;
  var CARET_BLINK_SEC = 0.5;
  var TextBox = class extends Label {
    constructor(parent) {
      super(parent);
      this.onTextChange = new Signal();
      this.onReturnPressed = new Signal();
      this._cursorPos = 0;
      this._cursorEnd = 0;
      this._editable = true;
      this._selectAll = false;
      this._nextCaretBlink = 0;
      this._caretVisible = true;
      // Pixel offset applied to the inner Text when the caret would
      // otherwise drift past the right edge of the visible area. Updated by
      // `makeCaretVisible`, applied in `layout` after the Label's
      // `sizeToContents` resets the inner Text's position.
      this._textOffsetX = 0;
      this.setSize(200, 20);
      this.setPadding(margin(4, 2, 4, 2));
      this.setMouseInputEnabled(true);
      this.setKeyboardInputEnabled(true);
      this.setTabable(true);
      this.setAlignment(Pos.Left | Pos.CenterV);
      this.setShouldDrawBackground(true);
    }
    // =====================================================================
    // Input-flag overrides
    // =====================================================================
    needsInputChars() {
      return true;
    }
    // =====================================================================
    // Editable / selection queries
    // =====================================================================
    isEditable() {
      return this._editable;
    }
    setEditable(b) {
      this._editable = b;
    }
    getCursorPos() {
      return this._cursorPos;
    }
    getCursorEnd() {
      return this._cursorEnd;
    }
    hasSelection() {
      return this._cursorPos !== this._cursorEnd;
    }
    getSelection() {
      if (!this.hasSelection()) return "";
      const a = Math.min(this._cursorPos, this._cursorEnd);
      const b = Math.max(this._cursorPos, this._cursorEnd);
      return this.getText().substring(a, b);
    }
    setCursorPos(i) {
      const clamped = Math.max(0, Math.min(this.getText().length, i));
      if (clamped === this._cursorPos) return;
      this._cursorPos = clamped;
      this.resetCaretBlink();
      this.makeCaretVisible();
      this.redraw();
    }
    setCursorEnd(i) {
      const clamped = Math.max(0, Math.min(this.getText().length, i));
      if (clamped === this._cursorEnd) return;
      this._cursorEnd = clamped;
      this.redraw();
    }
    // Adjust `_textOffsetX` so the caret is always inside the visible area.
    // Called whenever the cursor position or text content changes. Mirrors
    // GWEN's `MakeCaretVisible` — slides the text horizontally by the
    // smallest amount needed to keep the caret on-screen.
    //
    // Wrap mode (TextBoxMultiline) doesn't scroll horizontally — long
    // lines wrap instead. Skip the offset math entirely so the caret-X
    // measurement (which would otherwise treat the multi-line prefix as
    // a single run and produce a meaningless X) doesn't put the inner
    // Text into a stale offset.
    makeCaretVisible() {
      if (this._text.getWrap()) {
        if (this._textOffsetX !== 0) {
          this._textOffsetX = 0;
          this.invalidate();
        }
        return;
      }
      const skin = this.getSkin();
      const font2 = this.getFont() ?? skin.getDefaultFont();
      const pad = this.getPadding();
      const visibleW = this.width() - pad.left - pad.right;
      if (visibleW <= 0) return;
      const caretX = skin.renderer.measureText(font2, this.displayedText().substring(0, this._cursorPos)).x;
      if (caretX - this._textOffsetX > visibleW - 1) {
        this._textOffsetX = caretX - visibleW + 1;
      } else if (caretX - this._textOffsetX < 0) {
        this._textOffsetX = caretX;
      }
      if (this._textOffsetX < 0) this._textOffsetX = 0;
      this.invalidate();
    }
    setSelectAllOnFocus(b) {
      this._selectAll = b;
      if (b) this.onSelectAllAccel();
    }
    // =====================================================================
    // Visual-text hook — returns the string that's actually painted into
    // the inner Text. Defaults to `getText()`. PasswordTextBox overrides
    // to return the masked rendering so caret hit-testing, the caret-X
    // measurement in makeCaretVisible, and the caret/selection
    // measurements in renderOver all line up with the glyphs the user
    // sees on screen rather than the raw characters they typed (whose
    // widths differ from the mask glyph).
    // =====================================================================
    displayedText() {
      return this.getText();
    }
    // =====================================================================
    // Edit primitives
    // =====================================================================
    deleteText(start, len) {
      if (!this._editable) return;
      const t = this.getText();
      const a = Math.max(0, start);
      const b = Math.min(t.length, a + len);
      if (a >= b) return;
      this.setText(t.substring(0, a) + t.substring(b));
      if (this._cursorPos >= b) {
        this._cursorPos -= b - a;
      } else if (this._cursorPos > a) {
        this._cursorPos = a;
      }
      this._cursorEnd = this._cursorPos;
      this.resetCaretBlink();
    }
    insertText(s) {
      if (!this._editable) return;
      if (this.hasSelection()) this.eraseSelection();
      const t = this.getText();
      const pos = this._cursorPos;
      this.setText(t.substring(0, pos) + s + t.substring(pos));
      this._cursorPos += s.length;
      this._cursorEnd = this._cursorPos;
      this.resetCaretBlink();
    }
    eraseSelection() {
      if (!this.hasSelection()) return;
      const a = Math.min(this._cursorPos, this._cursorEnd);
      const b = Math.max(this._cursorPos, this._cursorEnd);
      this.deleteText(a, b - a);
      this._cursorPos = a;
      this._cursorEnd = a;
    }
    // =====================================================================
    // Character input
    // =====================================================================
    onChar(c) {
      if (!this._editable) return false;
      if (c === "	" || c.length !== 1) return false;
      this.insertText(c);
      return true;
    }
    // =====================================================================
    // Key handlers — arrow keys, Home/End respect Shift for selection
    // =====================================================================
    onKeyLeft(down) {
      if (!down) return true;
      const shiftDown = this.isShiftDown();
      this.setCursorPos(this._cursorPos - 1);
      if (!shiftDown) this.setCursorEnd(this._cursorPos);
      return true;
    }
    onKeyRight(down) {
      if (!down) return true;
      const shiftDown = this.isShiftDown();
      this.setCursorPos(this._cursorPos + 1);
      if (!shiftDown) this.setCursorEnd(this._cursorPos);
      return true;
    }
    onKeyHome(down) {
      if (!down) return true;
      const shiftDown = this.isShiftDown();
      this.setCursorPos(0);
      if (!shiftDown) this.setCursorEnd(this._cursorPos);
      return true;
    }
    onKeyEnd(down) {
      if (!down) return true;
      const shiftDown = this.isShiftDown();
      this.setCursorPos(this.getText().length);
      if (!shiftDown) this.setCursorEnd(this._cursorPos);
      return true;
    }
    onKeyBackspace(down) {
      if (!down) return true;
      if (this.hasSelection()) {
        this.eraseSelection();
        return true;
      }
      if (this._cursorPos > 0) this.deleteText(this._cursorPos - 1, 1);
      return true;
    }
    onKeyDelete(down) {
      if (!down) return true;
      if (this.hasSelection()) {
        this.eraseSelection();
        return true;
      }
      if (this._cursorPos < this.getText().length) this.deleteText(this._cursorPos, 1);
      return true;
    }
    onKeyReturn(down) {
      if (down) return true;
      this.blur();
      const info = eventInfo();
      info.controlCaller = this;
      this.onReturnPressed.emit(info);
      return true;
    }
    // =====================================================================
    // Mouse — caret placement + drag-select
    // =====================================================================
    /**
     * Best-effort character-index hit test from a TextBox-local (x, y).
     * Scans prefixes and picks the one whose right edge is closest to x.
     *
     * In wrap mode the y coordinate selects a hard-newline-delimited line
     * first (line index = floor((y - pad.top) / lineHeight)) and the
     * prefix scan runs against just that line's text — a single-line
     * substring measure for x. Without this, a click on visual line 2 or
     * 3 of a TextBoxMultiline would be hit-tested against the entire
     * source string and the caret would land somewhere on line 1 (often
     * "end of line 1" because newlines have ~0 measured width).
     *
     * y is optional for backwards compatibility with single-line callers
     * (and tests) that pass only x.
     */
    charIndexAt(localX, localY) {
      const text = this.displayedText();
      if (!text) return 0;
      const skin = this.getSkin();
      const font2 = this.getFont() ?? skin.getDefaultFont();
      const pad = this.getPadding();
      let lineStart = 0;
      let lineText = text;
      if (this._text.getWrap() && localY !== void 0) {
        const lineH = Math.max(1, Math.ceil(skin.renderer.measureText(font2, "Ag").y));
        const lineIdx = Math.max(0, Math.floor((localY - pad.top) / lineH));
        let curLine = 0;
        while (curLine < lineIdx) {
          const nextNL2 = text.indexOf("\n", lineStart);
          if (nextNL2 === -1) break;
          lineStart = nextNL2 + 1;
          curLine++;
        }
        const nextNL = text.indexOf("\n", lineStart);
        const lineEnd = nextNL === -1 ? text.length : nextNL;
        lineText = text.substring(lineStart, lineEnd);
      }
      let best = 0;
      let bestDist = Math.abs(localX - pad.left);
      for (let i = 1; i <= lineText.length; i++) {
        const w = skin.renderer.measureText(font2, lineText.substring(0, i)).x;
        const px = pad.left + w;
        const d = Math.abs(localX - px);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return lineStart + best;
    }
    onMouseClickLeft(x, y, pressed) {
      const canvas = this.getCanvas();
      if (pressed) {
        if (canvas) canvas.mouseFocus = this;
        if (this._selectAll) {
          this.onSelectAllAccel();
          this._selectAll = false;
          return;
        }
        const local = this.canvasPosToLocal(point(x, y));
        const idx = this.charIndexAt(local.x, local.y);
        this.setCursorPos(idx);
        if (!this.isShiftDown()) this.setCursorEnd(idx);
        return;
      }
      if (canvas && canvas.mouseFocus === this) canvas.mouseFocus = null;
    }
    onMouseMoved(x, y, dx, dy) {
      const canvas = this.getCanvas();
      if (!canvas || canvas.mouseFocus !== this) return;
      const local = this.canvasPosToLocal(point(x, y));
      const idx = this.charIndexAt(local.x, local.y);
      this.setCursorPos(idx);
    }
    onMouseDoubleClickLeft(x, y) {
      this.onSelectAllAccel();
    }
    // =====================================================================
    // Clipboard + select-all accelerators
    //
    // Exposed as the standard Base.onPaste/onCopy/onCut/onSelectAll hooks
    // so a future accelerator router (Ctrl+C/V/X/A) can route into them
    // generically. `navigator.clipboard` is used when available; failures
    // fall through silently — a TextBox with no clipboard permission is
    // still functional for local typing.
    // =====================================================================
    onSelectAllAccel() {
      this._cursorPos = 0;
      this._cursorEnd = this.getText().length;
      this.redraw();
    }
    onSelectAll() {
      this.onSelectAllAccel();
    }
    onCopyAccel() {
      const sel = this.getSelection();
      if (!sel) return;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(sel).catch(() => {
        });
      }
    }
    onCopy() {
      this.onCopyAccel();
    }
    onCutAccel() {
      this.onCopyAccel();
      this.eraseSelection();
    }
    onCut() {
      this.onCutAccel();
    }
    onPasteAccel() {
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      navigator.clipboard.readText().then((text) => {
        if (text) this.insertText(text);
      }).catch(() => {
      });
    }
    onPaste() {
      this.onPasteAccel();
    }
    // =====================================================================
    // Per-frame tick — caret blink
    // =====================================================================
    think() {
      super.think();
      const now = performance.now() / 1e3;
      if (now >= this._nextCaretBlink) {
        this._caretVisible = !this._caretVisible;
        this._nextCaretBlink = now + CARET_BLINK_SEC;
        if (this.hasFocus()) this.redraw();
      }
    }
    // =====================================================================
    // Focus hooks — reset caret to solid state on focus, hide on blur
    // =====================================================================
    onKeyboardFocus() {
      this.resetCaretBlink();
    }
    onLostKeyboardFocus() {
      this._caretVisible = false;
      this.redraw();
    }
    // =====================================================================
    // Label hook override — re-emit text changes through the signal. This
    // fires whenever anyone calls `setText` on us (external or internal
    // edits), so handlers never miss a mutation path.
    // =====================================================================
    onTextChanged() {
      super.onTextChanged();
      const len = this.getText().length;
      if (this._cursorPos > len) this._cursorPos = len;
      if (this._cursorEnd > len) this._cursorEnd = len;
      this.makeCaretVisible();
      const info = eventInfo();
      info.controlCaller = this;
      this.onTextChange.emit(info);
    }
    postLayout(skin) {
      super.postLayout(skin);
      const pad = this.getPadding();
      this._text.setPos(pad.left - this._textOffsetX, pad.top);
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      if (this.shouldDrawBackground()) {
        skin.drawTextBox(this);
      }
    }
    renderOver(skin) {
      if (!this.hasFocus()) return;
      const pad = this.getPadding();
      const text = this.displayedText();
      const font2 = this.getFont() ?? skin.getDefaultFont();
      const off = this._textOffsetX;
      if (this.hasSelection()) {
        const a = Math.min(this._cursorPos, this._cursorEnd);
        const b = Math.max(this._cursorPos, this._cursorEnd);
        const xA = skin.renderer.measureText(font2, text.substring(0, a)).x;
        const xB = skin.renderer.measureText(font2, text.substring(0, b)).x;
        const selRect = rect(
          pad.left + xA - off,
          pad.top,
          xB - xA,
          this.height() - pad.top - pad.bottom
        );
        skin.renderer.setDrawColor(color(50, 170, 255, 200));
        skin.renderer.drawFilledRect(selRect);
      }
      if (this._caretVisible) {
        const caretX = pad.left + skin.renderer.measureText(font2, text.substring(0, this._cursorPos)).x - off;
        const caretRect = rect(
          caretX,
          pad.top,
          1,
          this.height() - pad.top - pad.bottom
        );
        skin.renderer.setDrawColor(skin.colors.label.default);
        skin.renderer.drawFilledRect(caretRect);
      }
    }
    // =====================================================================
    // Internal helpers
    // =====================================================================
    /**
     * Stop blinking for `CARET_HOLD_SEC` seconds and show the caret. Called
     * on any caret movement or edit so the caret stays solidly visible
     * during active typing, then resumes blinking after the hold window.
     */
    resetCaretBlink() {
      this._nextCaretBlink = performance.now() / 1e3 + CARET_HOLD_SEC;
      this._caretVisible = true;
    }
    /** Reads shift state from the canvas; `false` when unreachable. */
    isShiftDown() {
      const canvas = this.getCanvas();
      return canvas !== null && typeof canvas.isShiftDown === "function" && canvas.isShiftDown();
    }
  };

  // src/controls/TextBoxNumeric.ts
  var TextBoxNumeric = class extends TextBox {
    constructor(parent) {
      super(parent);
      this.setText("0");
    }
    /**
     * Parse the current text as a floating-point number. Returns 0 for a
     * non-numeric or empty field (including a lone '-' or '.').
     */
    getFloatFromText() {
      const n = parseFloat(this.getText());
      return isNaN(n) ? 0 : n;
    }
    // ---------------------------------------------------------------------
    // Input gating
    // ---------------------------------------------------------------------
    onChar(c) {
      if (c === "	" || c.length !== 1) return false;
      if (!this.isTextAllowed(c, this.getCursorPos())) return false;
      return super.onChar(c);
    }
    insertText(s) {
      if (!this.isTextAllowed(s, this.getCursorPos())) return;
      super.insertText(s);
    }
    /**
     * Returns true iff inserting `str` at `pos` would produce a still-valid
     * numeric literal. Called for both single-char typing and bulk paste.
     */
    isTextAllowed(str, pos) {
      const existing = this.getText();
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "-") {
          if (i !== 0 || pos !== 0 || existing.includes("-")) return false;
        } else if (c === ".") {
          if (existing.includes(".")) return false;
        } else if (c < "0" || c > "9") {
          return false;
        }
      }
      return true;
    }
  };

  // src/controls/TextBoxMultiline.ts
  var TextBoxMultiline = class extends TextBox {
    constructor(parent) {
      super(parent);
      this.setWrap(true);
      this.setAlignment(Pos.Left | Pos.Top);
    }
    // ---------------------------------------------------------------------
    // Key handling
    // ---------------------------------------------------------------------
    onKeyReturn(down) {
      if (down) this.insertText("\n");
      return true;
    }
    onKeyUp(down) {
      if (!down) return true;
      this.moveCaretVertically(-1);
      return true;
    }
    onKeyDown(down) {
      if (!down) return true;
      this.moveCaretVertically(1);
      return true;
    }
    onKeyHome(down) {
      if (!down) return true;
      const text = this.getText();
      const pos = this.getCursorPos();
      const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
      this.setCursorPos(lineStart);
      if (!this.isShiftHeld()) this.setCursorEnd(lineStart);
      return true;
    }
    onKeyEnd(down) {
      if (!down) return true;
      const text = this.getText();
      const pos = this.getCursorPos();
      let lineEnd = text.indexOf("\n", pos);
      if (lineEnd === -1) lineEnd = text.length;
      this.setCursorPos(lineEnd);
      if (!this.isShiftHeld()) this.setCursorEnd(lineEnd);
      return true;
    }
    // ---------------------------------------------------------------------
    // Caret + selection render
    //
    // Replaces TextBox.renderOver, which measures the caret X across the
    // *entire* string and renders the caret quad as full-textbox-height —
    // both wrong for a multi-line edit. We scan to the cursor's line via
    // hard-break boundaries, measure the X within that line only, and
    // size the caret to one font line height.
    //
    // Soft-wrapped lines (text that wraps because it's too wide) still
    // collapse to their hard-break-only position; per-soft-line tracking
    // lands with the RichLabel refactor (T117).
    // ---------------------------------------------------------------------
    renderOver(skin) {
      if (!this.hasFocus()) return;
      const pad = this.getPadding();
      const font2 = this.getFont() ?? skin.getDefaultFont();
      const text = this.getText();
      const lineH = Math.max(1, Math.ceil(skin.renderer.measureText(font2, "Ag").y));
      const cursorPos = this.getCursorPos();
      const cursorEnd = this.getCursorEnd();
      const locate = (pos) => {
        const before = text.substring(0, pos);
        const lastNewline = before.lastIndexOf("\n");
        const lineStart = lastNewline + 1;
        let line = 0;
        for (let i = 0; i < lastNewline + 1; i++) if (before[i] === "\n") line++;
        return { line, prefix: text.substring(lineStart, pos) };
      };
      if (cursorPos !== cursorEnd) {
        const a = Math.min(cursorPos, cursorEnd);
        const b = Math.max(cursorPos, cursorEnd);
        const la = locate(a);
        const lb = locate(b);
        const xA = skin.renderer.measureText(font2, la.prefix).x;
        const xB = skin.renderer.measureText(font2, lb.prefix).x;
        skin.renderer.setDrawColor(color(50, 170, 255, 200));
        if (la.line === lb.line) {
          skin.renderer.drawFilledRect(rect(pad.left + xA, pad.top + la.line * lineH, xB - xA, lineH));
        } else {
          const fullW = this.width() - pad.left - pad.right;
          skin.renderer.drawFilledRect(rect(pad.left + xA, pad.top + la.line * lineH, fullW - xA, lineH));
          for (let l = la.line + 1; l < lb.line; l++) {
            skin.renderer.drawFilledRect(rect(pad.left, pad.top + l * lineH, fullW, lineH));
          }
          skin.renderer.drawFilledRect(rect(pad.left, pad.top + lb.line * lineH, xB, lineH));
        }
      }
      if (this._caretVisible) {
        const here = locate(cursorPos);
        const caretX = pad.left + skin.renderer.measureText(font2, here.prefix).x;
        const caretY = pad.top + here.line * lineH;
        skin.renderer.setDrawColor(skin.colors.label.default);
        skin.renderer.drawFilledRect(rect(caretX, caretY, 1, lineH));
      }
    }
    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------
    /**
     * Move caret up (`direction === -1`) or down (`direction === 1`) by one
     * line while preserving the caret's column (character offset within the
     * line). When Shift is held the selection anchor stays in place so the
     * user can grow/shrink a selection; otherwise the anchor follows.
     */
    moveCaretVertically(direction) {
      const text = this.getText();
      const pos = this.getCursorPos();
      const curLineStart = text.lastIndexOf("\n", pos - 1) + 1;
      const col = pos - curLineStart;
      if (direction === -1) {
        if (curLineStart === 0) return;
        const prevLineEnd = curLineStart - 1;
        const prevLineStart = text.lastIndexOf("\n", prevLineEnd - 1) + 1;
        const prevLineLen = prevLineEnd - prevLineStart;
        const newPos2 = prevLineStart + Math.min(col, prevLineLen);
        this.setCursorPos(newPos2);
        if (!this.isShiftHeld()) this.setCursorEnd(newPos2);
        return;
      }
      let nextLineStart = text.indexOf("\n", pos);
      if (nextLineStart === -1) return;
      nextLineStart += 1;
      let nextLineEnd = text.indexOf("\n", nextLineStart);
      if (nextLineEnd === -1) nextLineEnd = text.length;
      const nextLineLen = nextLineEnd - nextLineStart;
      const newPos = nextLineStart + Math.min(col, nextLineLen);
      this.setCursorPos(newPos);
      if (!this.isShiftHeld()) this.setCursorEnd(newPos);
    }
    /** Reads shift state from the canvas; `false` when unreachable. */
    isShiftHeld() {
      const canvas = this.getCanvas();
      if (!canvas) return false;
      const fn = canvas.isShiftDown;
      return typeof fn === "function" ? fn.call(canvas) : false;
    }
  };

  // src/controls/PasswordTextBox.ts
  var PasswordTextBox = class extends TextBox {
    constructor(parent) {
      super(parent);
      this._realText = "";
      this._passwordChar = "*";
    }
    // ---------------------------------------------------------------------
    // Public knobs
    // ---------------------------------------------------------------------
    /** Set the mask glyph. Empty string resets to the default ('*'). */
    setPasswordChar(c) {
      const next = c.length > 0 ? c[0] : "*";
      if (next === this._passwordChar) return;
      this._passwordChar = next;
      this.refreshMaskedText();
    }
    getPasswordChar() {
      return this._passwordChar;
    }
    // ---------------------------------------------------------------------
    // Text accessors — the override pair that keeps the real vs displayed
    // text distinct.
    // ---------------------------------------------------------------------
    /** Returns the unmasked text. */
    getText() {
      return this._realText;
    }
    /**
     * Returns the masked rendering — used by TextBox's caret hit-test
     * (`charIndexAt`), horizontal-scroll math (`makeCaretVisible`), and
     * caret/selection draw (`renderOver`). Without this override the
     * base class measures against the unmasked real text, and any time
     * the mask glyph's width differs from the underlying characters'
     * widths (almost always: '*' vs lowercase letters) the visible
     * caret drifts off the glyph the user clicked — most obvious at
     * end-of-text where a click on the trailing whitespace area lands
     * the caret well past the last visible mask glyph.
     */
    displayedText() {
      return this._passwordChar.repeat(this._realText.length);
    }
    /** Sets the unmasked text; display updates via `refreshMaskedText`. */
    setText(s, doEvents = true) {
      if (this._realText === s) return;
      this._realText = s;
      this.refreshMaskedText();
      const len = s.length;
      if (this.getCursorPos() > len) this.setCursorPos(len);
      if (this.getCursorEnd() > len) this.setCursorEnd(len);
      if (doEvents) this.emitTextChange();
    }
    // ---------------------------------------------------------------------
    // Edit primitives — route every mutation through `_realText`.
    // ---------------------------------------------------------------------
    insertText(s) {
      if (!this.isEditable()) return;
      if (this.hasSelection()) this.eraseSelection();
      const pos = this.getCursorPos();
      const next = this._realText.substring(0, pos) + s + this._realText.substring(pos);
      this._realText = next;
      this.refreshMaskedText();
      this.setCursorPos(pos + s.length);
      this.setCursorEnd(this.getCursorPos());
      this.emitTextChange();
    }
    deleteText(start, len) {
      if (!this.isEditable()) return;
      const t = this._realText;
      const a = Math.max(0, start);
      const b = Math.min(t.length, a + len);
      if (a >= b) return;
      this._realText = t.substring(0, a) + t.substring(b);
      this.refreshMaskedText();
      const cursor = this.getCursorPos();
      if (cursor >= b) this.setCursorPos(cursor - (b - a));
      else if (cursor > a) this.setCursorPos(a);
      this.setCursorEnd(this.getCursorPos());
      this.emitTextChange();
    }
    // ---------------------------------------------------------------------
    // Clipboard — deliberately disabled so the real password never hits
    // the system clipboard.
    // ---------------------------------------------------------------------
    onCopy() {
    }
    onCut() {
    }
    // ---------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------
    /**
     * Push the current masked rendering of `_realText` into the inherited
     * Label's Text child. We pass `doEvents = false` so Label doesn't
     * invoke TextBox's `onTextChanged` hook (which would re-emit our
     * `onTextChange` signal with the masked payload).
     */
    refreshMaskedText() {
      const masked = this._passwordChar.repeat(this._realText.length);
      super.setText(masked, false);
    }
    emitTextChange() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onTextChange.emit(info);
    }
  };

  // src/controls/NumericUpDown.ts
  var NumericUpDownButton_Up = class extends Button {
    constructor(parent) {
      super(parent);
      this.setTabable(false);
    }
    render(skin) {
      skin.drawNumericUpDownButton(this, this.isDepressed(), true);
    }
  };
  var NumericUpDownButton_Down = class extends Button {
    constructor(parent) {
      super(parent);
      this.setTabable(false);
    }
    render(skin) {
      skin.drawNumericUpDownButton(this, this.isDepressed(), false);
    }
  };
  var NumericUpDown = class extends TextBoxNumeric {
    constructor(parent) {
      super(parent);
      this.onChange = new Signal();
      this._min = 0;
      this._max = 100;
      this._value = 0;
      this.setSize(100, 20);
      const splitter = new Base(this);
      splitter.dock(Pos.Right);
      splitter.setWidth(13);
      this._upButton = new NumericUpDownButton_Up(splitter);
      this._upButton.dock(Pos.Top);
      this._upButton.setHeight(10);
      this._upButton.onPress.on(() => this.onPressUp());
      this._downButton = new NumericUpDownButton_Down(splitter);
      this._downButton.dock(Pos.Fill);
      this._downButton.onPress.on(() => this.onPressDown());
      this.setText("0");
      this.onTextChange.on(() => this.syncFromText());
    }
    // ---------------------------------------------------------------------
    // Min / max
    // ---------------------------------------------------------------------
    setMin(v) {
      this._min = v;
    }
    setMax(v) {
      this._max = v;
    }
    getMin() {
      return this._min;
    }
    getMax() {
      return this._max;
    }
    // ---------------------------------------------------------------------
    // Value
    //
    // Naming note: Label exposes `setValue(s: string)` / `getValue(): string`
    // as a generic string carrier for Property controls. TypeScript won't
    // let a subclass override those with an incompatible numeric signature
    // (C++ allows it via overload-on-parameter-type, TS does not), so the
    // numeric API lives under `setIntValue` / `getIntValue`. The inherited
    // string `getValue` / `setValue` remain functional and operate on the
    // numeric text representation.
    // ---------------------------------------------------------------------
    setIntValue(v) {
      const clamped = Math.max(this._min, Math.min(this._max, Math.floor(v)));
      if (clamped === this._value) return;
      this._value = clamped;
      this.setText(String(clamped));
      this.emitChange();
    }
    getIntValue() {
      return this._value;
    }
    // ---------------------------------------------------------------------
    // Key / button actions
    // ---------------------------------------------------------------------
    onKeyUp(down) {
      if (down) this.setIntValue(this._value + 1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.setIntValue(this._value - 1);
      return true;
    }
    onPressUp() {
      this.setIntValue(this._value + 1);
    }
    onPressDown() {
      this.setIntValue(this._value - 1);
    }
    // ---------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------
    /**
     * Fired whenever the inherited TextBox text changes — including our
     * own `setText` during `setValue`. We re-read the numeric value and
     * only update `_value` if the parsed integer is within [min, max].
     * Typing an out-of-range value leaves `_value` unchanged (the text
     * is not forcibly reverted, matching GWEN behaviour).
     */
    syncFromText() {
      const n = Math.floor(this.getFloatFromText());
      if (isNaN(n)) return;
      if (n < this._min || n > this._max) return;
      if (n === this._value) return;
      this._value = n;
      this.emitChange();
    }
    emitChange() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onChange.emit(info);
    }
  };

  // src/controls/TreeNode.ts
  var ToggleButton = class extends Button {
    constructor(parent) {
      super(parent);
      this._open = false;
      this.setSize(15, 15);
      this.setTabable(false);
      this.setShouldDrawBackground(false);
    }
    isOpen() {
      return this._open;
    }
    setOpen(b) {
      if (this._open === b) return;
      this._open = b;
      this.redraw();
    }
    render(skin) {
      skin.drawTreeButton(this, this._open);
    }
    // GWEN suppresses the focus ring on the tree button (TreeNode.cpp:23).
    renderFocus(_skin) {
    }
  };
  var TreeNodeText = class extends Button {
    constructor(parent) {
      super(parent);
      this.setAlignment(Pos.Left | Pos.CenterV);
      this.setShouldDrawBackground(false);
      this.setTabable(false);
    }
    render(skin) {
      if (this.isDisabled()) {
        this.setTextColor(skin.colors.button.disabled);
      } else if (this.isDepressed() || this.getToggleState()) {
        this.setTextColor(skin.colors.tree.selected);
      } else if (this.isHovered()) {
        this.setTextColor(skin.colors.tree.hover);
      } else {
        this.setTextColor(skin.colors.tree.normal);
      }
      super.render(skin);
    }
  };
  var _TreeNode = class _TreeNode extends Base {
    constructor(parent) {
      super(parent);
      this.onNamePress = new Signal();
      this.onRightPress = new Signal();
      this.onSelectChange = new Signal();
      this.onSelect = new Signal();
      this.onUnselect = new Signal();
      this._selected = false;
      this._selectable = true;
      this._root = false;
      // Reference to the owning TreeControl. Propagated by `addNode` so
      // every node — including deeply nested ones — can call back into the
      // tree's selection / consolidation logic. Without it, only top-level
      // nodes were wired to the TreeControl's onNodeSelected handler, so
      // clicking a nested node never deselected its siblings (or the rest
      // of the tree). Mirrors GWEN's `m_TreeControl` field.
      this._treeControl = null;
      this._toggleButton = new ToggleButton(this);
      this._toggleButton.setPos(0, 0);
      this._toggleButton.onPress.on(() => this.toggle());
      this._title = new TreeNodeText(this);
      this._title.dock(Pos.Top);
      this._title.setMargin(margin(16, 0, 0, 0));
      this._title.onPress.on(() => this.onClickTitle());
      this._title.onDoubleClick.on(() => this.onDoubleClickTitle());
      this._title.onRightPress.on((e) => this.onRightPress.emit(e));
      this._innerPanelChildren = new Base(this);
      this._innerPanelChildren.dock(Pos.Top);
      this._innerPanelChildren.setMargin(margin(_TreeNode.INDENT, 1, 0, 0));
      this._innerPanelChildren.hide();
    }
    // Hook for subclasses that want GWEN's "children land in the
    // collapsible inner panel" behaviour. Calling this in the subclass
    // constructor (after super) routes any later `new X(node)` calls
    // into `_innerPanelChildren`, which is what drives the toggle's
    // visibility and `expandAll`'s show/hide cycle.
    enableInnerPanelRouting() {
      this.setInnerPanel(this._innerPanelChildren);
    }
    // =====================================================================
    // Text
    // =====================================================================
    setText(s) {
      this._title.setText(s);
    }
    getText() {
      return this._title.getText();
    }
    // =====================================================================
    // Child nodes
    // =====================================================================
    addNode(label) {
      const child = new _TreeNode(this._innerPanelChildren);
      child.dock(Pos.Top);
      child.setText(label);
      if (this._treeControl) {
        child.setTreeControl(this._treeControl);
        this._treeControl.onNodeAdded(child);
      }
      return child;
    }
    getChildNodes() {
      return this._innerPanelChildren.children;
    }
    getButton() {
      return this._title;
    }
    setTreeControl(tc) {
      this._treeControl = tc;
    }
    getTreeControl() {
      return this._treeControl;
    }
    // =====================================================================
    // Open / close
    // =====================================================================
    isOpen() {
      return this._toggleButton.isOpen();
    }
    open() {
      this._toggleButton.setOpen(true);
      this._innerPanelChildren.show();
      this.invalidate();
    }
    close() {
      this._toggleButton.setOpen(false);
      this._innerPanelChildren.hide();
      this.invalidate();
    }
    toggle() {
      if (this.isOpen()) this.close();
      else this.open();
    }
    expandAll() {
      this.open();
      for (const c of this._innerPanelChildren.children) {
        if (c instanceof _TreeNode) c.expandAll();
      }
    }
    // =====================================================================
    // Selection
    // =====================================================================
    setSelectable(b) {
      this._selectable = b;
    }
    isSelectable() {
      return this._selectable;
    }
    isSelected() {
      return this._selected;
    }
    setSelected(b, fireEvents = true) {
      if (!this._selectable) return;
      if (this._selected === b) return;
      this._selected = b;
      this._title.setToggleState(b);
      if (fireEvents) {
        const info = eventInfo();
        info.controlCaller = this;
        this.onSelectChange.emit(info);
        if (b) this.onSelect.emit(info);
        else this.onUnselect.emit(info);
      }
    }
    deselectAll() {
      this.setSelected(false, false);
      for (const c of this._innerPanelChildren.children) {
        if (c instanceof _TreeNode) c.deselectAll();
      }
    }
    setRoot(b) {
      this._root = b;
    }
    isRoot() {
      return this._root;
    }
    // =====================================================================
    // Internal handlers
    // =====================================================================
    onClickTitle() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onNamePress.emit(info);
      this.setSelected(!this._selected);
    }
    onDoubleClickTitle() {
      if (this._innerPanelChildren.children.length > 0) this.toggle();
    }
    // =====================================================================
    // Layout + render
    // =====================================================================
    layout(skin) {
      if (this._innerPanelChildren.children.length === 0) {
        this._toggleButton.setHidden(true);
        this._toggleButton.setToggleState(false);
        this._innerPanelChildren.setHidden(true);
      } else {
        this._toggleButton.setHidden(false);
        this._innerPanelChildren.sizeToChildren(false, true);
      }
      super.layout(skin);
    }
    postLayout(skin) {
      super.postLayout(skin);
      this._innerPanelChildren.sizeToChildren(false, true);
      this.sizeToChildren(false, true);
      const titleH = this._title.height();
      const togH = this._toggleButton.height();
      this._toggleButton.setPos(0, Math.max(0, Math.floor((titleH - togH) / 2)));
    }
    // Selection highlight + connector lines paint BEFORE the children
    // (the title Button is the one rendering the actual text). Earlier
    // versions of this file called drawTreeNode from renderOver, which
    // runs AFTER the children — so the opaque blue Selection rect was
    // painted on top of the title text and made the selected row
    // unreadable. Matches GWEN TreeNode.cpp:76 (DrawTreeNode lives in
    // Render(), not in a renderOver-equivalent hook).
    render(skin) {
      let lastBranch = 0;
      const childNodes = this._innerPanelChildren.children;
      if (childNodes.length > 0) {
        const last = childNodes[childNodes.length - 1];
        lastBranch = this._innerPanelChildren.y() + last.y();
      }
      skin.drawTreeNode(
        this,
        this.isOpen(),
        this._selected,
        this._title.height(),
        this._title.textWidth(),
        this._toggleButton.y() + Math.floor(this._toggleButton.height() / 2),
        lastBranch,
        this._root
      );
    }
  };
  // Indent width for child rows — matches TreeNode.cpp's `TreeIndentation`.
  _TreeNode.INDENT = 14;
  var TreeNode = _TreeNode;

  // src/controls/ToolBar.ts
  var ToolBarButton = class extends Button {
    constructor(parent) {
      super(parent);
      this.setSize(20, 20);
      this.dock(Pos.Left);
    }
    shouldDrawBackground() {
      return this.isHovered();
    }
  };
  var ToolBarStrip = class extends Base {
    constructor(parent) {
      super(parent);
      this.setSize(25, 25);
      this.setPadding(margin(2, 2, 2, 2));
    }
    add(text, icon = "") {
      const b = new ToolBarButton(this);
      b.setToolTip(text);
      if (icon !== "") b.setImage(icon, false);
      return b;
    }
    render(skin) {
      skin.drawMenuStrip(this);
    }
  };

  // src/controls/ActionBar.ts
  var DEFAULT_ITEM_SIZE = 28;
  var BAR_PADDING = 2;
  var ActionBarButton = class extends Button {
    constructor(parent) {
      super(parent);
      this.setSize(DEFAULT_ITEM_SIZE, DEFAULT_ITEM_SIZE);
      this.setText("");
    }
  };
  var ActionBarSeparator = class extends Base {
    constructor(parent) {
      super(parent);
      this.setSize(8, 8);
      this.setMouseInputEnabled(false);
    }
    render(skin) {
      const r = this.getRenderBounds();
      skin.renderer.setDrawColor(color(140, 140, 140, 255));
      if (r.h > r.w) {
        const cx = r.x + Math.floor(r.w / 2);
        skin.renderer.drawFilledRect(rect(cx, r.y + 4, 1, Math.max(0, r.h - 8)));
      } else {
        const cy = r.y + Math.floor(r.h / 2);
        skin.renderer.drawFilledRect(rect(r.x + 4, cy, Math.max(0, r.w - 8), 1));
      }
    }
  };
  var ActionBar = class extends Base {
    constructor(parent) {
      super(parent);
      this._vertical = false;
      this._itemSize = DEFAULT_ITEM_SIZE;
      this._columns = 1;
      this._radioMode = false;
      this._activeButton = null;
      this.setPadding(margin(BAR_PADDING, BAR_PADDING, BAR_PADDING, BAR_PADDING));
      this.setSize(200, this._itemSize + BAR_PADDING * 2);
    }
    // =====================================================================
    // Orientation
    // =====================================================================
    setVertical(b) {
      if (this._vertical === b) return;
      this._vertical = b;
      if (b) this.setSize(this._itemSize * this._columns + BAR_PADDING * 2, Math.max(this.height(), 100));
      else this.setSize(Math.max(this.width(), 100), this._itemSize + BAR_PADDING * 2);
      this.relayoutItems();
    }
    isVertical() {
      return this._vertical;
    }
    // =====================================================================
    // Item size
    // =====================================================================
    setItemSize(px) {
      if (this._itemSize === px) return;
      this._itemSize = px;
      if (this._vertical) this.setWidth(px * this._columns + BAR_PADDING * 2);
      else this.setHeight(px + BAR_PADDING * 2);
      for (const c of this.children) {
        if (c instanceof ActionBarButton) c.setSize(px, px);
      }
      this.invalidate();
    }
    getItemSize() {
      return this._itemSize;
    }
    // =====================================================================
    // Columns (multi-column tool palettes — only meaningful when vertical)
    // =====================================================================
    /**
     * Set the number of columns for vertical (tool-palette) mode. With
     * `n > 1` the bar's width tracks `itemSize * n + 2*padding` and items
     * flow left-to-right then top-to-bottom in the grid (Photoshop-style
     * two-column toolbox). A no-op visually in horizontal mode but the
     * value is preserved across orientation flips.
     */
    setColumns(n) {
      const cols = Math.max(1, Math.floor(n));
      if (this._columns === cols) return;
      this._columns = cols;
      if (this._vertical) this.setWidth(this._itemSize * cols + BAR_PADDING * 2);
      this.relayoutItems();
    }
    getColumns() {
      return this._columns;
    }
    // =====================================================================
    // Radio mode (single-active toggle — Photoshop-style tool selection)
    // =====================================================================
    /**
     * Enable / disable single-active toggle behaviour. While radio mode is
     * on:
     *   - Every `ActionBarButton` child is auto-flagged as a toggle.
     *   - Activating one button deactivates whichever was previously
     *     active.
     *   - Clicking the active button re-activates it — radio mode keeps
     *     exactly one tool selected at all times once the first is
     *     chosen.
     */
    setRadioMode(b) {
      if (this._radioMode === b) return;
      this._radioMode = b;
      if (!b) return;
      let firstActive = null;
      for (const c of this.children) {
        if (c instanceof ActionBarButton) {
          c.setIsToggle(true);
          if (c.getToggleState() && !firstActive) firstActive = c;
        }
      }
      this._activeButton = firstActive;
      for (const c of this.children) {
        if (c instanceof ActionBarButton && c !== firstActive && c.getToggleState()) {
          c.setToggleState(false);
        }
      }
    }
    isRadioMode() {
      return this._radioMode;
    }
    /**
     * Programmatically promote `btn` to the active selection (or pass
     * `null` to clear). Honours the radio rule: previous active is
     * deactivated. Called automatically by the radio enforcement when a
     * user clicks a button.
     */
    setActiveButton(btn) {
      if (this._activeButton === btn) return;
      const prev = this._activeButton;
      this._activeButton = btn;
      if (btn) btn.setToggleState(true);
      if (prev && prev !== btn) prev.setToggleState(false);
    }
    getActiveButton() {
      return this._activeButton;
    }
    // =====================================================================
    // Item construction
    // =====================================================================
    /**
     * Add a square action button. Pass an icon Texture to use the icon
     * mode (centred image, no text); pass `text` to label it. Both can
     * be combined. In radio mode the button is auto-flagged as a toggle.
     */
    addButton(text = "", icon) {
      const b = new ActionBarButton(this);
      if (text) b.setText(text);
      if (icon) {
        const iconPx = Math.max(8, this._itemSize - 8);
        b.setImageTexture(icon, iconPx, iconPx, true);
      }
      b.setSize(this._itemSize, this._itemSize);
      this.attachRadioHandlers(b);
      if (this._radioMode) b.setIsToggle(true);
      this.dockChild(b);
      return b;
    }
    /**
     * Add a thin divider between two groups of items.
     */
    addSeparator() {
      const s = new ActionBarSeparator(this);
      s.setSize(8, 8);
      this.dockChild(s);
      return s;
    }
    /**
     * Add an arbitrary control as an item — useful for drop-downs
     * (`ComboBox`), label readouts, or custom widgets. The control's
     * perpendicular dimension is auto-centered with margin so non-square
     * widgets (a 22-tall ComboBox in a 28-tall slot, say) don't get
     * visually stretched by the dock pass.
     */
    addItem(ctrl) {
      if (ctrl.parent !== this) ctrl.setParent(this);
      const slot = this._itemSize;
      if (this._vertical) {
        const w = ctrl.width();
        if (w > 0 && w < slot) {
          const inset = Math.floor((slot - w) / 2);
          ctrl.setMargin(margin(inset, 0, inset, 0));
        }
      } else {
        const h = ctrl.height();
        if (h > 0 && h < slot) {
          const inset = Math.floor((slot - h) / 2);
          ctrl.setMargin(margin(0, inset, 0, inset));
        }
      }
      this.dockChild(ctrl);
      return ctrl;
    }
    // =====================================================================
    // Internal — radio enforcement
    // =====================================================================
    // Subscribe once per button. Handlers bail when radio mode is off, so
    // we can wire all buttons unconditionally and just flip the flag at
    // the bar level when needed.
    attachRadioHandlers(btn) {
      btn.onToggleOn.on(() => {
        if (!this._radioMode) return;
        const prev = this._activeButton;
        if (prev === btn) return;
        this._activeButton = btn;
        if (prev) prev.setToggleState(false);
      });
      btn.onToggleOff.on(() => {
        if (!this._radioMode) return;
        if (this._activeButton === btn) btn.setToggleState(true);
      });
    }
    // =====================================================================
    // Internal — docking / layout helpers
    // =====================================================================
    dockChild(c) {
      if (this._vertical && this._columns > 1) {
        c.dock(Pos.None);
      } else {
        c.dock(this._vertical ? Pos.Top : Pos.Left);
      }
    }
    relayoutItems() {
      for (const c of this.children) this.dockChild(c);
      this.invalidate();
    }
    // =====================================================================
    // Layout — multi-column grid for vertical tool palettes. Single-column
    // mode relies on the dock pass; multi-column mode positions items
    // manually so they flow left-to-right then top-to-bottom.
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      if (!this._vertical || this._columns <= 1) return;
      const pad = this.getPadding();
      const slot = this._itemSize;
      const x0 = pad.left;
      let y = pad.top;
      let col = 0;
      for (const c of this.children) {
        if (c.hidden()) continue;
        if (c instanceof ActionBarSeparator) {
          if (col !== 0) {
            y += slot;
            col = 0;
          }
          c.setBounds(x0, y, slot * this._columns, 8);
          y += 8;
          continue;
        }
        c.setBounds(x0 + col * slot, y, slot, slot);
        col++;
        if (col >= this._columns) {
          col = 0;
          y += slot;
        }
      }
    }
    // =====================================================================
    // Render — reuse the existing menu-strip background so the action bar
    // matches the visual language of MenuStrip / ToolBar. A custom skin
    // region would be a future refinement.
    // =====================================================================
    render(skin) {
      skin.drawMenuStrip(this);
    }
  };

  // src/controls/CollapsibleCategory.ts
  var CategoryButton = class extends Button {
    constructor() {
      super(...arguments);
      this._alt = false;
    }
    setAlt(b) {
      this._alt = b;
    }
    isAlt() {
      return this._alt;
    }
    render(skin) {
      if (this.getToggleState() || this.isHovered()) {
        super.render(skin);
      }
    }
  };
  var CHEVRON_DOWN = "\u25BC";
  var CHEVRON_RIGHT = "\u25B6";
  var CollapsibleCategory = class extends Base {
    constructor(parent) {
      super(parent);
      this.onSelection = new Signal();
      // Caller-supplied title, stored separately so we can keep the
      // chevron prefix in sync without losing it on `setText`.
      this._title = "Category Title";
      this.setBounds(0, 0, 512, 20);
      this.setPadding(margin(1, 0, 1, 5));
      this._headerButton = new Button(this);
      this._headerButton.dock(Pos.Top);
      this._headerButton.setHeight(20);
      this._headerButton.setIsToggle(true);
      this._headerButton.setShouldDrawBackground(false);
      this._headerButton.setAlignment(Pos.Left | Pos.CenterV);
      this._headerButton.setPadding(margin(6, 0, 0, 0));
      this._headerButton.onPress.on(() => {
        this.updateHeaderText();
        this.invalidate();
      });
      this.updateHeaderText();
    }
    // =====================================================================
    // Config
    // =====================================================================
    setText(t) {
      this._title = t;
      this.updateHeaderText();
    }
    getText() {
      return this._title;
    }
    // Keep the header button's label in sync with the title + current
    // collapse state. Called from setText and from the toggle handler.
    updateHeaderText() {
      const chevron = this._headerButton.getToggleState() ? CHEVRON_RIGHT : CHEVRON_DOWN;
      this._headerButton.setText(`${chevron}  ${this._title}`);
    }
    // =====================================================================
    // Rows
    // =====================================================================
    add(name) {
      const b = new CategoryButton(this);
      b.setText(name);
      b.dock(Pos.Top);
      b.setAlignment(Pos.Left | Pos.CenterV);
      b.setIsToggle(true);
      b.setTabable(false);
      b.setPadding(margin(5, 2, 2, 2));
      b.onPress.on(() => this.onItemPress(b));
      return b;
    }
    unselectAll() {
      for (const c of this.children) {
        if (c instanceof CategoryButton) c.setToggleState(false);
      }
    }
    getSelected() {
      for (const c of this.children) {
        if (c instanceof CategoryButton && c.getToggleState()) return c;
      }
      return null;
    }
    // =====================================================================
    // Collapse state
    // =====================================================================
    isCollapsed() {
      return this._headerButton.getToggleState();
    }
    // =====================================================================
    // Internal
    // =====================================================================
    onItemPress(b) {
      this.unselectAll();
      b.setToggleState(true);
      const info = eventInfo();
      info.controlCaller = this;
      this.onSelection.emit(info);
    }
    postLayout(skin) {
      super.postLayout(skin);
      if (this._headerButton.getToggleState()) {
        this.setHeight(this._headerButton.height());
      } else {
        let total = this._headerButton.height();
        for (const c of this.children) {
          if (c instanceof CategoryButton && !c.hidden()) total += c.height();
        }
        const pad = this.getPadding();
        this.setHeight(total + pad.top + pad.bottom);
      }
      let alt = false;
      for (const c of this.children) {
        if (c instanceof CategoryButton) {
          c.setAlt(alt);
          alt = !alt;
        }
      }
    }
    render(skin) {
      skin.drawCategoryInner(this, this._headerButton.getToggleState());
    }
  };

  // src/controls/TabTitleBar.ts
  var TabTitleBar = class extends Label {
    constructor(parent) {
      super(parent);
      this.setMouseInputEnabled(true);
      this.setTextPadding(margin(5, 2, 5, 2));
      this.setPadding(margin(1, 2, 1, 2));
      this.dragAndDrop_SetPackage(true, "TabWindowMove");
    }
    // Make the parent DockedTabControl the drag's drawcontrol so DockBase's
    // "TabWindowMove" branch can reparent the whole tab set.
    dragAndDrop_StartDragging(p, x, y) {
      p.holdoffset = this.canvasPosToLocal({ x, y });
      p.drawcontrol = this.parent;
      return p.drawcontrol !== null;
    }
    render(skin) {
      skin.drawTabTitleBar(this);
    }
  };

  // src/controls/TabButton.ts
  var TabButton = class extends Button {
    constructor(parent) {
      super(parent);
      this._page = null;
      // Typed as Base to avoid the TabControl <-> TabButton circular type
      // import; callers cast as needed.
      this._tabControl = null;
      // The edge the owning TabStrip docks against (Pos.Top / Bottom /
      // Left / Right). Drives which skin region the tab renders. Named
      // `_tabDock` to avoid clashing with Base's private `_dock`.
      this._tabDock = Pos.Top;
      this.dock(Pos.Left);
      this.setPadding(margin(3, 2, 5, 2));
      this.setTabable(false);
      this.dragAndDrop_SetPackage(true, "TabButtonMove");
    }
    setPage(p) {
      this._page = p;
    }
    getPage() {
      return this._page;
    }
    setTabControl(c) {
      this._tabControl = c;
    }
    getTabControl() {
      return this._tabControl;
    }
    isActive() {
      return this._page !== null && !this._page.hidden();
    }
    setTabDock(d) {
      this._tabDock = d;
    }
    getTabDock() {
      return this._tabDock;
    }
    render(skin) {
      skin.drawTabButton(this, this.isActive(), this._tabDock);
    }
    // When this is the only tab in a docked-style TabControl (i.e. one
    // whose strip plays the title-bar role), promote the drag to a
    // whole-dock move so the user gets the same outcome as grabbing the
    // strip's empty area. Without this, "grab the lone tab" and "grab
    // the title bar" silently produced different package names — same
    // visual effect for the user (a single tab's TC ends up empty
    // either way), but inconsistent intermediate state and edge cases
    // (e.g. drop targets that accept TabWindowMove but not
    // TabButtonMove). With 2+ tabs the conventional single-tab move
    // kicks in unchanged.
    dragAndDrop_StartDragging(p, x, y) {
      const tc = this._tabControl;
      const strip = tc?.getTabStrip?.();
      if (strip?.showsAsHeader?.() && tc?.tabCount?.() === 1) {
        p.name = "TabWindowMove";
        p.holdoffset = this.canvasPosToLocal({ x, y });
        p.drawcontrol = tc;
        return true;
      }
      p.name = "TabButtonMove";
      return super.dragAndDrop_StartDragging(p, x, y);
    }
  };

  // src/controls/TabStrip.ts
  var TabStrip = class extends Base {
    constructor(parent) {
      super(parent);
      this._allowReorder = false;
      this._dockDragControl = null;
      this._showAsHeader = false;
    }
    setAllowReorder(b) {
      this._allowReorder = b;
    }
    allowReorder() {
      return this._allowReorder;
    }
    /**
     * Configure this strip as a drag source for whole-dock relocation.
     * `ctrl` is reported as the `TabWindowMove` package's `drawcontrol`
     * (typically the owning DockedTabControl) so DockBase's drop handler
     * reparents the entire tab set in one go. Pass `null` to disable.
     */
    setDockDragControl(ctrl) {
      this._dockDragControl = ctrl;
      if (ctrl) {
        this.setMouseInputEnabled(true);
        this.dragAndDrop_SetPackage(true, "TabWindowMove");
      } else {
        this.dragAndDrop_SetPackage(false, "");
      }
    }
    dragAndDrop_StartDragging(p, x, y) {
      if (!this._dockDragControl) return false;
      p.holdoffset = this.canvasPosToLocal({ x, y });
      p.drawcontrol = this._dockDragControl;
      return true;
    }
    /**
     * Render with the Tab.HeaderBar background — turns the strip into a
     * macOS / VS Code-style title bar that hosts the tab buttons.
     */
    setShowAsHeader(b) {
      if (this._showAsHeader === b) return;
      this._showAsHeader = b;
      this.redraw();
    }
    showsAsHeader() {
      return this._showAsHeader;
    }
    render(skin) {
      if (this._showAsHeader) skin.drawTabTitleBar(this);
    }
    layout(skin) {
      super.layout(skin);
    }
  };

  // src/controls/TabControl.ts
  var TabControlInner = class extends Base {
    render(skin) {
      skin.drawTabControl(this);
    }
  };
  var TabControl = class extends Base {
    constructor(parent) {
      super(parent);
      this.onLoseTab = new Signal();
      this.onAddTab = new Signal();
      this._currentButton = null;
      this._tabStrip = new TabStrip(this);
      this._tabStrip.dock(Pos.Top);
      this._tabStrip.setHeight(24);
      this._inner = new TabControlInner(this);
      this._inner.dock(Pos.Fill);
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
    }
    // =====================================================================
    // Page management
    // =====================================================================
    addPage(text, page) {
      const pageControl = page ?? new Base(this._inner);
      pageControl.setParent(this._inner);
      pageControl.setMargin(margin(6, 6, 6, 6));
      pageControl.dock(Pos.Fill);
      pageControl.hide();
      pageControl.setTabBoundary(true);
      const btn = new TabButton(this._tabStrip);
      btn.setText(text);
      btn.setPage(pageControl);
      btn.setTabControl(this);
      btn.onPress.on(() => this.onTabPressed(btn));
      if (!this._currentButton) this.onTabPressed(btn);
      const info = eventInfo();
      info.controlCaller = this;
      this.onAddTab.emit(info);
      return btn;
    }
    removePage(btn) {
      const page = btn.getPage();
      if (page) page.setParent(null);
      btn.setParent(null);
      if (this._currentButton === btn) this._currentButton = null;
      const info = eventInfo();
      info.controlCaller = this;
      this.onLoseTab.emit(info);
      this.invalidate();
    }
    // =====================================================================
    // Queries
    // =====================================================================
    getTab(i) {
      const tabs = this._tabStrip.children.filter((c) => c instanceof TabButton);
      return tabs[i] ?? null;
    }
    tabCount() {
      let n = 0;
      for (const c of this._tabStrip.children) if (c instanceof TabButton) n++;
      return n;
    }
    getCurrentButton() {
      return this._currentButton;
    }
    getTabStrip() {
      return this._tabStrip;
    }
    getInnerPanel() {
      return this._inner;
    }
    // =====================================================================
    // Strip placement + reorder flag
    // =====================================================================
    setTabStripPosition(dock) {
      this._tabStrip.dock(dock);
      for (const c of this._tabStrip.children) {
        if (c instanceof TabButton) c.setTabDock(dock);
      }
    }
    setAllowReorder(b) {
      this._tabStrip.setAllowReorder(b);
    }
    allowReorder() {
      return this._tabStrip.allowReorder();
    }
    // =====================================================================
    // Internal
    // =====================================================================
    // =====================================================================
    // Keyboard nav — Left/Right (and Up/Down for vertical strips, since
    // arrow expectations track the strip's orientation) cycle tabs.
    // Home/End jump to the first/last tab.
    // =====================================================================
    onKeyLeft(down) {
      if (down) this.moveTab(-1);
      return true;
    }
    onKeyRight(down) {
      if (down) this.moveTab(1);
      return true;
    }
    onKeyUp(down) {
      if (down) this.moveTab(-1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.moveTab(1);
      return true;
    }
    onKeyHome(down) {
      if (down) {
        const t = this.getTab(0);
        if (t) this.onTabPressed(t);
      }
      return true;
    }
    onKeyEnd(down) {
      if (down) {
        const t = this.getTab(this.tabCount() - 1);
        if (t) this.onTabPressed(t);
      }
      return true;
    }
    getTabs() {
      return this._tabStrip.children.filter((c) => c instanceof TabButton);
    }
    moveTab(delta) {
      const tabs = this.getTabs();
      if (tabs.length === 0) return;
      const cur = this._currentButton;
      const idx = cur ? tabs.indexOf(cur) : -1;
      const n = tabs.length;
      const next = idx === -1 ? 0 : (idx + delta + n) % n;
      this.onTabPressed(tabs[next]);
    }
    // Render the focus ring around the active tab rather than the whole
    // control — the user reads "the active tab is selected" from the ring,
    // not "the entire tab control area is selected". TabButton coords are
    // local to its TabStrip parent, so we translate up into TabControl's
    // own frame before drawing.
    renderFocus(skin) {
      const canvas = this.getCanvas();
      if (!canvas || canvas.keyboardFocus !== this) return;
      if (!this.isTabable()) return;
      const btn = this._currentButton;
      if (!btn) return;
      const x = this._tabStrip.x() + btn.x();
      const y = this._tabStrip.y() + btn.y();
      skin.drawKeyboardHighlight(this, rect(x, y, btn.width(), btn.height()), 0);
    }
    onTabPressed(btn) {
      if (btn.parent !== this._tabStrip) return;
      const page = btn.getPage();
      if (!page) return;
      if (this._currentButton && this._currentButton !== btn) {
        const oldPage = this._currentButton.getPage();
        if (oldPage && oldPage.parent === this._inner) oldPage.hide();
      }
      page.show();
      this._currentButton = btn;
      this.invalidate();
    }
  };

  // src/controls/PageControl.ts
  var MAX_PAGES = 64;
  var PageControl = class extends Base {
    constructor(parent) {
      super(parent);
      this.onPageChanged = new Signal();
      this.onFinish = new Signal();
      this._pages = new Array(MAX_PAGES).fill(null);
      this._pageCount = 0;
      this._currentPage = -1;
      this._useFinish = false;
      this._controlStrip = new Base(this);
      this._controlStrip.dock(Pos.Bottom);
      this._controlStrip.setHeight(24);
      this._controlStrip.setMargin(margin(10, 10, 10, 10));
      this._backButton = new Button(this._controlStrip);
      this._backButton.dock(Pos.Left);
      this._backButton.setWidth(70);
      this._backButton.setText("Back");
      this._backButton.onPress.on(() => this.previousPage());
      this._nextButton = new Button(this._controlStrip);
      this._nextButton.dock(Pos.Right);
      this._nextButton.setWidth(70);
      this._nextButton.setText("Next");
      this._nextButton.onPress.on(() => this.nextPage());
      this._finishButton = new Button(this._controlStrip);
      this._finishButton.dock(Pos.Right);
      this._finishButton.setWidth(70);
      this._finishButton.setText("Finish");
      this._finishButton.onPress.on(() => this.finish());
      this._finishButton.hide();
      this._label = new Label(this._controlStrip);
      this._label.dock(Pos.Fill);
      this._label.setAlignment(Pos.CenterV | Pos.Left);
    }
    // =====================================================================
    // Configuration
    // =====================================================================
    setPageCount(n) {
      if (n > MAX_PAGES) n = MAX_PAGES;
      if (n < 0) n = 0;
      for (let i = 0; i < n; i++) {
        if (!this._pages[i]) {
          const p = new Base(this);
          p.dock(Pos.Fill);
          p.hide();
          this._pages[i] = p;
        }
      }
      this._pageCount = n;
      this._currentPage = -1;
      if (n > 0) this.showPage(0);
    }
    getPageCount() {
      return this._pageCount;
    }
    // =====================================================================
    // Navigation
    // =====================================================================
    showPage(i) {
      if (i === this._currentPage) return;
      if (i < 0 || i >= this._pageCount) return;
      for (let k = 0; k < this._pageCount; k++) {
        const p = this._pages[k];
        if (p) p.setHidden(k !== i);
      }
      this._currentPage = i;
      const isFirst = i === 0;
      const isLast = i === this._pageCount - 1;
      this._backButton.setHidden(isFirst);
      if (this._useFinish) {
        this._nextButton.setHidden(isLast);
        this._finishButton.setHidden(!isLast);
      } else {
        this._finishButton.hide();
        this._nextButton.setHidden(isLast);
      }
      this._label.setText(`Page ${i + 1} of ${this._pageCount}`);
      const info = eventInfo();
      info.controlCaller = this;
      info.integer = i;
      info.control = this._pages[i];
      this.onPageChanged.emit(info);
    }
    getPageNumber() {
      return this._currentPage;
    }
    getPage(i) {
      if (i < 0 || i >= this._pageCount) return null;
      return this._pages[i] ?? null;
    }
    getCurrentPage() {
      if (this._currentPage < 0) return null;
      return this._pages[this._currentPage] ?? null;
    }
    nextPage() {
      this.showPage(this._currentPage + 1);
    }
    previousPage() {
      this.showPage(this._currentPage - 1);
    }
    finish() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onFinish.emit(info);
    }
    // =====================================================================
    // Finish-button toggle
    // =====================================================================
    setUseFinishButton(b) {
      if (this._useFinish === b) return;
      this._useFinish = b;
      if (this._currentPage >= 0) {
        const i = this._currentPage;
        this._currentPage = -1;
        this.showPage(i);
      }
    }
    getUseFinishButton() {
      return this._useFinish;
    }
    // =====================================================================
    // Button accessors
    // =====================================================================
    nextButton() {
      return this._nextButton;
    }
    backButton() {
      return this._backButton;
    }
    finishButton() {
      return this._finishButton;
    }
    label() {
      return this._label;
    }
  };

  // src/controls/DockedTabControl.ts
  var DockedTabControl = class _DockedTabControl extends TabControl {
    constructor(parent) {
      super(parent);
      this.dock(Pos.Fill);
      this.setAllowReorder(true);
      const strip = this.getTabStrip();
      strip.setHeight(24);
      strip.setShowAsHeader(true);
      strip.setDockDragControl(this);
    }
    // =====================================================================
    // Legacy title-bar shims
    //
    // The dedicated TabTitleBar is gone — its role is played by the strip.
    // These methods are kept as no-ops so older callers (and any code
    // still wiring `setShowTitlebar(true)` from before the refactor)
    // don't error out. New code should configure the strip directly.
    // =====================================================================
    setShowTitlebar(_show) {
    }
    updateTitleBar() {
    }
    // =====================================================================
    // Move tabs between docked panels
    //
    // Snapshot the strip's children before mutating — attaching a button
    // to `target` triggers parent changes that would otherwise invalidate
    // the live iterator.
    // =====================================================================
    moveTabsTo(target) {
      const strip = this.getTabStrip();
      const snapshot = strip.children.slice();
      const wasCurrent = this.getCurrentButton();
      let moved = false;
      for (const c of snapshot) {
        if (c instanceof TabButton) {
          target.attachTabButton(c);
          moved = true;
        }
      }
      this.invalidate();
      if (moved) {
        if (wasCurrent && wasCurrent.parent === target.getTabStrip()) {
          target.onTabPressedExt(wasCurrent);
        }
        const info = eventInfo();
        info.controlCaller = this;
        this.onLoseTab.emit(info);
      }
    }
    // Reparent an existing TabButton into this control. Mirrors GWEN's
    // `TabControl::AddPage(TabButton*)` overload.
    attachTabButton(btn) {
      const sourceTC = btn.getTabControl();
      const page = btn.getPage();
      const inner = this.getInnerPanel();
      if (page) {
        page.setParent(inner);
        page.setHidden(true);
        page.setMargin(margin(6, 6, 6, 6));
        page.dock(Pos.Fill);
      }
      btn.setParent(this.getTabStrip());
      btn.dock(Pos.Left);
      btn.sizeToContents();
      btn.setTabControl(this);
      btn.onPress.on(() => this.handleTabPress(btn));
      this.handleTabPress(btn);
      this.invalidate();
      if (sourceTC && sourceTC !== this) {
        if (sourceTC instanceof _DockedTabControl) {
          const sourceCur = sourceTC.getCurrentButton();
          if (sourceCur && sourceCur.parent !== sourceTC.getTabStrip()) {
            const remaining = sourceTC.getTabStrip().children.filter((c) => c instanceof TabButton);
            if (remaining.length > 0) sourceTC.onTabPressedExt(remaining[0]);
          }
        }
        sourceTC.invalidate();
      }
    }
    // Thin wrapper around the protected onTabPressed for attachTabButton.
    handleTabPress(btn) {
      this.onTabPressed(btn);
    }
    // Public escape hatch so DockBase.attachTabButtonTo can drive tab
    // selection on this control without breaking encapsulation. Internal
    // callers should still prefer `handleTabPress`.
    onTabPressedExt(btn) {
      this.handleTabPress(btn);
    }
  };

  // src/controls/ListBox.ts
  var ListBoxRow = class extends Button {
    constructor(listBox) {
      super(listBox);
      this._selected = false;
      this._even = false;
      this._listBox = listBox;
      this.setPadding(margin(5, 0, 0, 0));
      this.setAlignment(Pos.Left | Pos.CenterV);
      this.setHeight(18);
      this.setShouldDrawBackground(false);
      this.setTabable(false);
    }
    isSelected() {
      return this._selected;
    }
    setSelected(b) {
      if (this._selected === b) return;
      this._selected = b;
      this.redraw();
    }
    isEven() {
      return this._even;
    }
    setEven(b) {
      this._even = b;
    }
    getListBox() {
      return this._listBox;
    }
    onMouseClickLeft(x, y, pressed) {
      const wasDepressed = this.isDepressed();
      super.onMouseClickLeft(x, y, pressed);
      if (!pressed) return;
      if (!wasDepressed) {
        const canvas = this.getCanvas();
        const shift = canvas !== null && typeof canvas.isShiftDown === "function" && canvas.isShiftDown();
        this._listBox.onRowClicked(this, shift);
      }
    }
    render(skin) {
      skin.drawListBoxLine(this, this._selected, this._even);
    }
  };
  var ListBox = class extends ScrollControl {
    constructor(parent) {
      super(parent);
      this.onRowSelected = new Signal();
      this._multiSelect = false;
      this._rows = [];
      this.setMargin(margin(1, 1, 1, 1));
      this.setScroll(false, true);
      this.setAutoHideBars(true);
      const inner = this.getInnerPanel();
      if (inner) inner.setPadding(margin(2, 2, 2, 2));
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
    }
    // =====================================================================
    // Configuration
    // =====================================================================
    setAllowMultiSelect(b) {
      this._multiSelect = b;
    }
    allowMultiSelect() {
      return this._multiSelect;
    }
    // =====================================================================
    // Items
    // =====================================================================
    addItem(label, name = "") {
      const row = new ListBoxRow(this);
      row.setText(label);
      row.setName(name);
      row.dock(Pos.Top);
      row.setEven(this._rows.length % 2 === 0);
      this._rows.push(row);
      this.invalidate();
      return row;
    }
    clear() {
      const inner = this.getInnerPanel();
      if (inner) inner.removeAllChildren();
      this._rows.length = 0;
      this.invalidate();
    }
    getRows() {
      return this._rows;
    }
    // =====================================================================
    // Selection
    // =====================================================================
    unselectAll() {
      for (const r of this._rows) r.setSelected(false);
    }
    getSelectedRow() {
      for (const r of this._rows) if (r.isSelected()) return r;
      return null;
    }
    getSelectedRows() {
      return this._rows.filter((r) => r.isSelected());
    }
    getSelectedRowName() {
      const row = this.getSelectedRow();
      return row ? row.getName() : "";
    }
    setSelectedRow(row, clearOthers = true) {
      if (clearOthers) this.unselectAll();
      row.setSelected(true);
      const info = eventInfo();
      info.controlCaller = this;
      info.control = row;
      info.string = row.getText();
      this.onRowSelected.emit(info);
    }
    // Dispatched from ListBoxRow's click handler. Per GWEN ListBox.cpp:122-129,
    // shift+click ADDS to the selection (never toggles off); a plain click
    // clears prior selections and selects only the clicked row.
    onRowClicked(row, shiftHeld) {
      const clear = !(this._multiSelect && shiftHeld);
      this.setSelectedRow(row, clear);
    }
    // =====================================================================
    // Keyboard nav — Up/Down moves the single-selection cursor; Home/End
    // jump to the first/last row. Multi-select isn't extended via keyboard
    // (mouse + Shift remains the way to grow a selection).
    // =====================================================================
    onKeyUp(down) {
      if (down) this.moveSelection(-1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.moveSelection(1);
      return true;
    }
    onKeyHome(down) {
      if (down && this._rows.length > 0) this.selectIndex(0);
      return true;
    }
    onKeyEnd(down) {
      if (down && this._rows.length > 0) this.selectIndex(this._rows.length - 1);
      return true;
    }
    moveSelection(delta) {
      if (this._rows.length === 0) return;
      const cur = this.getSelectedRow();
      const idx = cur ? this._rows.indexOf(cur) : -1;
      let next;
      if (idx === -1) next = delta > 0 ? 0 : this._rows.length - 1;
      else next = Math.max(0, Math.min(this._rows.length - 1, idx + delta));
      this.selectIndex(next);
    }
    selectIndex(i) {
      const row = this._rows[i];
      if (!row) return;
      this.setSelectedRow(row, true);
      this.scrollRowIntoView(row);
    }
    // Adjusts the vertical scroll so that `row` is fully visible. For a
    // typical 18px row in a viewport-sized listbox this is a no-op when the
    // row is already on-screen.
    scrollRowIntoView(row) {
      const inner = this.getInnerPanel();
      if (!inner) return;
      const vbar = this.getVerticalScrollBar();
      const viewportH = this.height() - this.getPadding().top - this.getPadding().bottom;
      const overflow = inner.height() - viewportH;
      if (overflow <= 0) return;
      const rowTop = row.y();
      const rowBottom = rowTop + row.height();
      const scrolled = vbar.getScrolledAmount();
      const visTop = scrolled * overflow;
      const visBottom = visTop + viewportH;
      if (rowTop < visTop) {
        vbar.setScrolledAmount(rowTop / overflow, true);
      } else if (rowBottom > visBottom) {
        vbar.setScrolledAmount((rowBottom - viewportH) / overflow, true);
      }
    }
    // Glob-style selection — `*` matches any run, `?` matches a single char.
    // Regex metacharacters in `pattern` are escaped before the glob chars are
    // re-introduced, so patterns like `"(file)-*.txt"` round-trip cleanly.
    selectByString(pattern, clearOthers = true) {
      if (clearOthers) this.unselectAll();
      const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("^" + escaped.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
      for (const r of this._rows) {
        if (re.test(r.getText())) {
          r.setSelected(true);
          const info = eventInfo();
          info.controlCaller = this;
          info.control = r;
          info.string = r.getText();
          this.onRowSelected.emit(info);
        }
      }
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawListBox(this);
    }
  };

  // src/controls/TreeControl.ts
  var TreeControl = class extends TreeNode {
    constructor(parent) {
      super(parent);
      this._allowMultiSelect = false;
      this.setTreeControl(this);
      this.getButton().hide();
      this._scrollControl = new ScrollControl(this);
      this._scrollControl.dock(Pos.Fill);
      this._scrollControl.setAutoHideBars(true);
      this._scrollControl.setScroll(false, true);
      this.setInnerPanel(this._scrollControl);
      this.setRoot(true);
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
    }
    // =====================================================================
    // Configuration
    // =====================================================================
    setAllowMultiSelect(b) {
      this._allowMultiSelect = b;
    }
    allowMultiSelect() {
      return this._allowMultiSelect;
    }
    getScroller() {
      return this._scrollControl;
    }
    // =====================================================================
    // Nodes
    // =====================================================================
    addNode(label) {
      const inner = this._scrollControl.getInnerPanel();
      const node = new TreeNode(inner ?? this._scrollControl);
      node.dock(Pos.Top);
      node.setText(label);
      node.setRoot(true);
      node.setTreeControl(this);
      this.onNodeAdded(node);
      return node;
    }
    // Called by both TreeControl.addNode (top-level) and TreeNode.addNode
    // (nested) so EVERY node — at any depth — has its onNamePress wired
    // back to the tree's deselect-all logic. Without this nested nodes
    // never notify the tree, so clicks on them leave selections in
    // sibling subtrees intact ("one selection per level" bug).
    // Matches GWEN TreeControl.cpp:62.
    onNodeAdded(node) {
      node.onNamePress.on((e) => this.onNodeSelected(e));
    }
    clear() {
      const inner = this._scrollControl.getInnerPanel();
      if (inner) inner.removeAllChildren();
      this.invalidate();
    }
    // The actual top-level nodes live inside the scroll control's
    // viewport, not inside `_innerPanelChildren` (which is the unused
    // base-TreeNode field). Override the inherited iterators so
    // selection / expansion / queries actually reach the visible tree.
    getChildNodes() {
      return this._scrollControl.getInnerPanel()?.children ?? [];
    }
    deselectAll() {
      for (const c of this.getChildNodes()) {
        if (c instanceof TreeNode) c.deselectAll();
      }
    }
    expandAll() {
      for (const c of this.getChildNodes()) {
        if (c instanceof TreeNode) c.expandAll();
      }
    }
    // =====================================================================
    // Selection
    // =====================================================================
    // Match GWEN TreeControl.cpp:66: a single-select tree clears EVERY
    // selection (including the caller's, which then flips back via the
    // SetSelected toggle that runs after onNamePress returns — see
    // TreeNode.onClickTitle). The previous "deselect except caller"
    // path produced the wrong toggle behaviour for already-selected
    // nodes and only iterated the top-level scroll children, leaving
    // selections in nested subtrees stuck.
    onNodeSelected(_info) {
      if (this._allowMultiSelect) {
        const canvas = this.getCanvas();
        const ctrlHeld = canvas !== null && typeof canvas.isControlDown === "function" && canvas.isControlDown();
        if (ctrlHeld) return;
      }
      this.deselectAll();
    }
    // =====================================================================
    // Keyboard nav
    //
    // Up/Down move through visible (expanded-into-view) nodes; Left
    // collapses the current node or jumps to its parent if already
    // collapsed; Right expands a closed node or descends into the first
    // child if already open. Home/End jump to the first / last visible
    // node.
    // =====================================================================
    onKeyUp(down) {
      if (down) this.moveSelection(-1);
      return true;
    }
    onKeyDown(down) {
      if (down) this.moveSelection(1);
      return true;
    }
    onKeyLeft(down) {
      if (down) this.collapseOrJumpToParent();
      return true;
    }
    onKeyRight(down) {
      if (down) this.expandOrDescend();
      return true;
    }
    onKeyHome(down) {
      if (down) {
        const list = this.flattenVisible();
        if (list.length > 0) this.selectNode(list[0]);
      }
      return true;
    }
    onKeyEnd(down) {
      if (down) {
        const list = this.flattenVisible();
        if (list.length > 0) this.selectNode(list[list.length - 1]);
      }
      return true;
    }
    // Walk visible (DFS) — root's children first, descending only into
    // open nodes. The root itself is hidden, so we start from its
    // children.
    flattenVisible() {
      const out = [];
      const visit = (node) => {
        out.push(node);
        if (!node.isOpen()) return;
        for (const c of node.getChildNodes()) {
          if (c instanceof TreeNode) visit(c);
        }
      };
      for (const c of this.getChildNodes()) {
        if (c instanceof TreeNode) visit(c);
      }
      return out;
    }
    findCurrentSelected(list) {
      for (const n of list) if (n.isSelected()) return n;
      return null;
    }
    moveSelection(delta) {
      const list = this.flattenVisible();
      if (list.length === 0) return;
      const cur = this.findCurrentSelected(list);
      const idx = cur ? list.indexOf(cur) : -1;
      let next;
      if (idx === -1) next = delta > 0 ? 0 : list.length - 1;
      else next = Math.max(0, Math.min(list.length - 1, idx + delta));
      this.selectNode(list[next]);
    }
    selectNode(node) {
      this.deselectAll();
      node.setSelected(true);
    }
    collapseOrJumpToParent() {
      const list = this.flattenVisible();
      const cur = this.findCurrentSelected(list);
      if (!cur) return;
      if (cur.isOpen() && cur.getChildNodes().length > 0) {
        cur.close();
        return;
      }
      const idx = list.indexOf(cur);
      for (let i = idx - 1; i >= 0; i--) {
        const candidate = list[i];
        if (this.isAncestor(candidate, cur)) {
          this.selectNode(candidate);
          return;
        }
      }
    }
    expandOrDescend() {
      const list = this.flattenVisible();
      const cur = this.findCurrentSelected(list);
      if (!cur) {
        if (list.length > 0) this.selectNode(list[0]);
        return;
      }
      const kids = cur.getChildNodes();
      if (kids.length === 0) return;
      if (!cur.isOpen()) {
        cur.open();
        return;
      }
      for (const c of kids) {
        if (c instanceof TreeNode) {
          this.selectNode(c);
          return;
        }
      }
    }
    isAncestor(maybeParent, child) {
      for (const c of maybeParent.getChildNodes()) {
        if (c === child) return true;
        if (c instanceof TreeNode && this.isAncestor(c, child)) return true;
      }
      return false;
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      if (this.shouldDrawBackground()) skin.drawTreeControl(this);
    }
  };

  // src/controls/MenuStrip.ts
  var MenuStrip = class extends Menu {
    constructor(parent) {
      super(parent);
      this.setBounds(0, 0, 200, 22);
      this.dock(Pos.Top);
      this.setPadding(margin(5, 0, 0, 0));
      this.setDisableIconMargin(true);
      this.show();
      this.setScroll(false, false);
      this.getVerticalScrollBar().hide();
      this.getHorizontalScrollBar().hide();
    }
    addItem(name, icon = "", accelerator = "") {
      const item = new MenuItem(this.getInnerPanel() ?? this);
      item.setText(name);
      if (icon) item.setImage(icon);
      if (accelerator) item.setAccelerator(accelerator);
      item.dock(Pos.Left);
      item.setPadding(margin(10, 0, 10, 0));
      item.setTextPadding(margin(5, 0, 5, 0));
      item.setOnStrip(true);
      item.sizeToContents();
      item.onHoverEnter.on((e) => this.onHoverItem(e.controlCaller));
      return item;
    }
    // Only auto-open submenus on hover when ANOTHER strip menu is already
    // open. First-time interaction still requires a click; once committed,
    // moving the mouse across the strip swaps which submenu is visible.
    // Matches GWEN MenuStrip::ShouldHoverOpenMenu (MenuStrip.cpp:42).
    shouldHoverOpenMenu() {
      return this.isMenuOpen();
    }
    close() {
    }
    closeMenus() {
      const inner = this.getInnerPanel();
      if (inner) {
        for (const c of inner.children) {
          if (c instanceof MenuItem) c.closeMenu();
        }
      }
    }
    layout(_skin) {
      this.updateScrollBars();
    }
    render(skin) {
      skin.drawMenuStrip(this);
    }
    renderUnder(_skin) {
    }
  };

  // src/controls/ComboBox.ts
  var ComboBoxDownArrow = class extends Button {
    constructor(combo) {
      super(combo);
      this._combo = combo;
      this.setSize(15, 15);
      this.setMouseInputEnabled(false);
      this.setTabable(false);
    }
    render(skin) {
      skin.drawComboDownArrow(
        this,
        this._combo.isHovered(),
        this._combo.isDepressed(),
        this._combo.isMenuOpen(),
        this._combo.isDisabled()
      );
    }
  };
  var ComboBox = class extends Button {
    constructor(parent) {
      super(parent);
      this.onSelection = new Signal();
      this._selectedItem = null;
      this.setSize(100, 20);
      this.setTabable(true);
      this.setKeyboardInputEnabled(true);
      this.setAlignment(Pos.Left | Pos.CenterV);
      this.setTextPadding(margin(3, 0, 3, 0));
      const canvas = this.getCanvas();
      this._menu = new Menu(canvas ?? this);
      this._menu.setDisableIconMargin(true);
      this._menu.setTabable(false);
      this._menu.hide();
      this._arrow = new ComboBoxDownArrow(this);
      this._arrow.dock(Pos.Right);
      this._arrow.setMargin(margin(0, 4, 4, 4));
    }
    // =====================================================================
    // Items
    // =====================================================================
    addItem(label, name = "") {
      const item = this._menu.addItem(label);
      item.setName(name);
      item.onMenuItemSelected.on(() => this.onItemSelected(item));
      if (!this._selectedItem) this.onItemSelected(item, false);
      return item;
    }
    clearItems() {
      this._menu.clearItems();
      this._selectedItem = null;
    }
    getSelectedItem() {
      return this._selectedItem;
    }
    selectItem(item, fireEvents = true) {
      this.onItemSelected(item, fireEvents);
    }
    selectItemByName(name, fireEvents = true) {
      const inner = this._menu.getInnerPanel();
      if (!inner) return;
      for (const c of inner.children) {
        if (c instanceof MenuItem && c.getName() === name) {
          this.onItemSelected(c, fireEvents);
          return;
        }
      }
    }
    // =====================================================================
    // Open / close
    // =====================================================================
    openList() {
      const canvas = this.getCanvas();
      if (canvas) this._menu.setParent(canvas);
      const pos = this.localPosToCanvas({ x: 0, y: this.height() });
      this._menu.setMinimumWidth(this.width());
      this._menu.setSize(this.width(), 0);
      this._menu.open(pos);
      this._menu.bringToFront();
    }
    closeList() {
      this._menu.hide();
    }
    isMenuOpen() {
      return this._menu.isVisible();
    }
    // The ComboBox owns its dropdown — Canvas's outside-click closeMenus
    // walk skips owners so this control's own toggle handler runs on click.
    ownsOpenMenu() {
      return this._menu.isVisible();
    }
    // =====================================================================
    // Mouse
    // =====================================================================
    onMouseClickLeft(x, y, pressed) {
      super.onMouseClickLeft(x, y, pressed);
      if (pressed && this.isHovered()) {
        if (this.isMenuOpen()) this.closeList();
        else this.openList();
      }
    }
    // =====================================================================
    // Keyboard — Up/Down cycle through items inline.
    // =====================================================================
    onKeyUp(down) {
      if (!down) return true;
      const items = this.menuItems();
      if (items.length === 0) return true;
      const idx = this._selectedItem ? items.indexOf(this._selectedItem) : 0;
      const next = idx > 0 ? items[idx - 1] : items[items.length - 1];
      this.onItemSelected(next, true);
      return true;
    }
    onKeyDown(down) {
      if (!down) return true;
      const items = this.menuItems();
      if (items.length === 0) return true;
      const idx = this._selectedItem ? items.indexOf(this._selectedItem) : -1;
      const next = idx < items.length - 1 ? items[idx + 1] : items[0];
      this.onItemSelected(next, true);
      return true;
    }
    menuItems() {
      const inner = this._menu.getInnerPanel();
      if (!inner) return [];
      const out = [];
      for (const c of inner.children) {
        if (c instanceof MenuItem) out.push(c);
      }
      return out;
    }
    // =====================================================================
    // Internal — selection handler shared by mouse + keyboard + API.
    // =====================================================================
    onItemSelected(item, fireEvents = true) {
      this._selectedItem = item;
      this.setText(item.getText());
      this.closeList();
      if (fireEvents) {
        const info = eventInfo();
        info.controlCaller = this;
        info.control = item;
        this.onSelection.emit(info);
      }
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawComboBox(this, this.isDepressed(), this.isMenuOpen());
    }
  };

  // src/controls/CollapsibleList.ts
  var CollapsibleList = class extends ScrollControl {
    constructor(parent) {
      super(parent);
      this.onSelection = new Signal();
      this.setAutoHideBars(true);
      this.setScroll(false, true);
      this.setMargin(margin(1, 0, 1, 1));
    }
    // =====================================================================
    // Categories
    // =====================================================================
    add(name) {
      const cat = new CollapsibleCategory(this.getInnerPanel() ?? this);
      cat.setText(name);
      cat.dock(Pos.Top);
      cat.onSelection.on((e) => this.onCategorySelection(e));
      return cat;
    }
    // =====================================================================
    // Selection
    // =====================================================================
    unselectAll() {
      const inner = this.getInnerPanel();
      if (!inner) return;
      for (const c of inner.children) {
        if (c instanceof CollapsibleCategory) c.unselectAll();
      }
    }
    getSelected() {
      const inner = this.getInnerPanel();
      if (!inner) return null;
      for (const c of inner.children) {
        if (c instanceof CollapsibleCategory) {
          const s = c.getSelected();
          if (s) return s;
        }
      }
      return null;
    }
    // =====================================================================
    // Internal — fired by each category when one of its rows is picked.
    // We unselect every OTHER category so cross-list selection stays
    // exclusive, then re-emit the event to our own subscribers.
    // =====================================================================
    onCategorySelection(e) {
      const source = e.controlCaller;
      const inner = this.getInnerPanel();
      if (!inner) return;
      for (const c of inner.children) {
        if (c instanceof CollapsibleCategory && c !== source) {
          c.unselectAll();
        }
      }
      this.onSelection.emit(e);
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      skin.drawCategoryHolder(this);
    }
  };

  // src/controls/Layout/Position.ts
  var Position = class extends Base {
    constructor(parent) {
      super(parent);
      this._position = Pos.Left | Pos.Top;
      this.setMouseInputEnabled(false);
    }
    setPosition(p) {
      if (this._position === p) return;
      this._position = p;
      this.invalidate();
    }
    getPosition() {
      return this._position;
    }
    postLayout(_skin) {
      for (const c of this.children) {
        if (c.getDock() === Pos.None) {
          c.position(this._position);
        }
      }
    }
  };
  var Center = class extends Position {
    constructor(parent) {
      super(parent);
      this._position = Pos.Center;
    }
  };

  // src/controls/Layout/Table.ts
  var MAX_COLUMNS = 16;
  var TableRow = class extends Base {
    constructor(parent) {
      super(parent);
      this.onRowSelected = new Signal();
      this._columnCount = 0;
      this._even = false;
      this._columns = [];
      for (let i = 0; i < MAX_COLUMNS; i++) this._columns.push(null);
    }
    setColumnCount(n) {
      if (n === this._columnCount) return;
      n = Math.min(MAX_COLUMNS, Math.max(0, n));
      for (let i = 0; i < n; i++) {
        let col = this._columns[i];
        if (!col) {
          col = new Label(this);
          col.setPadding(margin(3, 3, 3, 3));
          this._columns[i] = col;
        }
        if (i === n - 1) col.dock(Pos.Fill);
        else col.dock(Pos.Left);
      }
      this._columnCount = n;
      this.invalidate();
    }
    getColumnCount() {
      return this._columnCount;
    }
    setCellText(col, text) {
      if (col < 0 || col >= this._columnCount) return;
      const c = this._columns[col];
      if (c) c.setText(text);
    }
    getCellText(col) {
      if (col < 0 || col >= this._columnCount) return "";
      return this._columns[col]?.getText() ?? "";
    }
    setCellContents(col, ctrl, enableMouse = false) {
      if (col < 0 || col >= this._columnCount) return;
      const c = this._columns[col];
      if (!c) return;
      c.setMouseInputEnabled(enableMouse);
      ctrl.setParent(c);
    }
    getCellContents(col) {
      if (col < 0 || col >= this._columnCount) return null;
      return this._columns[col];
    }
    isEven() {
      return this._even;
    }
    setEven(b) {
      this._even = b;
    }
    // Base hook — `ListBoxRow`-style subclasses override to flip a
    // selection visual; this default is a no-op so plain TableRows
    // never accidentally render selection chrome.
    setSelected(_b) {
    }
    setTextColor(c) {
      for (let i = 0; i < this._columnCount; i++) {
        this._columns[i]?.setTextColor(c);
      }
    }
    sizeToContents() {
      let total = 0;
      let maxH = 0;
      for (let i = 0; i < this._columnCount; i++) {
        const col = this._columns[i];
        if (!col) continue;
        col.sizeToContents();
        total += col.width();
        maxH = Math.max(maxH, col.height());
      }
      this.setSize(total, maxH);
    }
  };
  var Table = class extends Base {
    constructor(parent) {
      super(parent);
      this._columnCount = 1;
      this._columnWidths = [];
      this._defaultRowHeight = 22;
      this._sizeToContents = false;
      for (let i = 0; i < MAX_COLUMNS; i++) this._columnWidths.push(0);
    }
    setColumnCount(n) {
      this._columnCount = Math.min(MAX_COLUMNS, Math.max(1, n));
      for (const c of this.children) {
        if (c instanceof TableRow) c.setColumnCount(this._columnCount);
      }
    }
    setColumnWidth(col, w) {
      if (col < 0 || col >= MAX_COLUMNS) return;
      this._columnWidths[col] = w;
      this.invalidate();
    }
    getColumnCount() {
      return this._columnCount;
    }
    getDefaultRowHeight() {
      return this._defaultRowHeight;
    }
    setDefaultRowHeight(h) {
      this._defaultRowHeight = h;
    }
    addRow() {
      const row = new TableRow(this);
      row.setColumnCount(this._columnCount);
      row.setHeight(this._defaultRowHeight);
      row.dock(Pos.Top);
      return row;
    }
    addRowObj(row) {
      row.setParent(this);
      row.setColumnCount(this._columnCount);
      row.dock(Pos.Top);
    }
    getRow(i) {
      const rows = this.children.filter((c) => c instanceof TableRow);
      return rows[i] ?? null;
    }
    rowCount() {
      return this.children.filter((c) => c instanceof TableRow).length;
    }
    remove(row) {
      row.setParent(null);
    }
    clear() {
      this.removeAllChildren();
    }
    layout(skin) {
      super.layout(skin);
      let i = 0;
      for (const c of this.children) {
        if (c instanceof TableRow) {
          c.setEven(i % 2 === 0);
          for (let col = 0; col < this._columnCount; col++) {
            const cell = c.getCellContents(col);
            if (cell && this._columnWidths[col] > 0 && col < this._columnCount - 1) {
              cell.setWidth(this._columnWidths[col]);
            }
          }
          i++;
        }
      }
    }
    sizeToContents() {
      const rows = this.children.filter((c) => c instanceof TableRow);
      for (let col = 0; col < this._columnCount; col++) {
        let max = 10;
        for (const r of rows) {
          const cell = r.getCellContents(col);
          if (cell) {
            cell.sizeToContents();
            max = Math.max(max, cell.width());
          }
        }
        this._columnWidths[col] = max;
      }
      this._sizeToContents = true;
      this.invalidate();
    }
  };

  // src/controls/Layout/Tile.ts
  var Tile = class extends Base {
    constructor(parent) {
      super(parent);
      this._tileSize = point(22, 22);
      this.dock(Pos.Fill);
    }
    setTileSize(w, h) {
      this._tileSize = point(w, h);
      this.invalidate();
    }
    getTileSize() {
      return this._tileSize;
    }
    layout(skin) {
      super.layout(skin);
      const pad = this.getPadding();
      const rb = this.getRenderBounds();
      const x0 = rb.x + pad.left;
      const y0 = rb.y + pad.top;
      const innerW = rb.w - pad.left - pad.right;
      let x = x0;
      let y = y0;
      for (const c of this.children) {
        if (c.getDock() !== Pos.None) continue;
        if (c.hidden()) continue;
        const cellX = x + Math.floor((this._tileSize.x - c.width()) / 2);
        const cellY = y + Math.floor((this._tileSize.y - c.height()) / 2);
        c.setPos(cellX, cellY);
        x += this._tileSize.x;
        if (x + this._tileSize.x > x0 + innerW) {
          x = x0;
          y += this._tileSize.y;
        }
      }
    }
  };

  // src/controls/Modal.ts
  var Modal = class extends Base {
    constructor(parent) {
      super(parent);
      this.setKeyboardInputEnabled(true);
      this.setMouseInputEnabled(true);
      this.setShouldDrawBackground(true);
      this.setTabBoundary(true);
    }
    layout(skin) {
      const canvas = this.getCanvas();
      if (canvas) {
        const c = canvas;
        this.setBounds(0, 0, c.width(), c.height());
      }
      super.layout(skin);
    }
    render(skin) {
      if (this.shouldDrawBackground()) {
        skin.drawModalControl(this);
      }
    }
  };
  var Highlight = class extends Base {
    constructor(parent) {
      super(parent);
      this.setMouseInputEnabled(false);
    }
    render(skin) {
      skin.drawHighlight(this);
    }
  };

  // src/controls/ResizableControl.ts
  var ResizableControl = class extends Base {
    constructor(parent) {
      super(parent);
      this.onResize = new Signal();
      this._minSize = point(5, 5);
      this._clampMovement = false;
      this._resizers = /* @__PURE__ */ new Map();
      const directions = [
        Pos.Left | Pos.Top,
        Pos.Top,
        Pos.Right | Pos.Top,
        Pos.Left,
        Pos.Right,
        Pos.Left | Pos.Bottom,
        Pos.Bottom,
        Pos.Right | Pos.Bottom
      ];
      for (const dir of directions) {
        const r = new Resizer(this);
        r.setResizeDir(dir);
        r.setTarget(this);
        r.onResize.on((e) => this.onResizerMoved(e));
        this._resizers.set(dir, r);
      }
      this.setKeyboardInputEnabled(true);
    }
    // =====================================================================
    // Config
    // =====================================================================
    setMinimumSize(p) {
      this._minSize = p;
    }
    getMinimumSize() {
      return this._minSize;
    }
    setClampMovement(b) {
      this._clampMovement = b;
    }
    shouldClampMovement() {
      return this._clampMovement;
    }
    disableResizing() {
      for (const r of this._resizers.values()) {
        r.setMouseInputEnabled(false);
      }
    }
    getResizer(dir) {
      return this._resizers.get(dir) ?? null;
    }
    // =====================================================================
    // Bounds — clamp width/height against the minimum floor so every caller
    // (layout passes, external setters, Resizer drags) honours the same limit.
    // =====================================================================
    setBounds(rOrX, y, w, h) {
      if (typeof rOrX === "number") {
        const nx = rOrX;
        const ny = y ?? 0;
        const nw = Math.max(this._minSize.x, w ?? 0);
        const nh = Math.max(this._minSize.y, h ?? 0);
        return super.setBounds(nx, ny, nw, nh);
      }
      const r = rOrX;
      return super.setBounds(r.x, r.y, Math.max(this._minSize.x, r.w), Math.max(this._minSize.y, r.h));
    }
    // =====================================================================
    // Resizer signal fan-out — emit our own onResize + invoke the virtual
    // so subclasses can fix up child layout.
    // =====================================================================
    onResizerMoved(_e) {
      const info = eventInfo();
      info.controlCaller = this;
      this.onResize.emit(info);
      this.onResized();
    }
    /** Subclass hook. GWEN calls this `OnResized`. */
    onResized() {
    }
    // =====================================================================
    // Layout — anchor the eight handles to the current edges every tick.
    // Corners occupy a fixed 6x6 square; edges take what's left.
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      const w = this.width();
      const h = this.height();
      const corner = 6;
      const edgeW = Math.max(0, w - corner * 2);
      const edgeH = Math.max(0, h - corner * 2);
      this._resizers.get(Pos.Left | Pos.Top)?.setBounds(0, 0, corner, corner);
      this._resizers.get(Pos.Top)?.setBounds(corner, 0, edgeW, corner);
      this._resizers.get(Pos.Right | Pos.Top)?.setBounds(w - corner, 0, corner, corner);
      this._resizers.get(Pos.Left)?.setBounds(0, corner, corner, edgeH);
      this._resizers.get(Pos.Right)?.setBounds(w - corner, corner, corner, edgeH);
      this._resizers.get(Pos.Left | Pos.Bottom)?.setBounds(0, h - corner, corner, corner);
      this._resizers.get(Pos.Bottom)?.setBounds(corner, h - corner, edgeW, corner);
      this._resizers.get(Pos.Right | Pos.Bottom)?.setBounds(w - corner, h - corner, corner, corner);
      for (const r of this._resizers.values()) r.bringToFront();
    }
  };

  // src/controls/WindowButtons.ts
  var WindowCloseButton = class extends Button {
    constructor(parent) {
      super(parent);
      this._window = null;
      this.setSize(31, 31);
      this.setText("");
      this.setTabable(false);
    }
    setWindow(w) {
      this._window = w;
    }
    getWindow() {
      return this._window;
    }
    render(skin) {
      if (!this._window) return;
      skin.drawWindowCloseButton(this, this.isDepressed(), this.isHovered(), this.isDisabled());
    }
  };
  var WindowMaximizeButton = class extends WindowCloseButton {
    constructor(parent) {
      super(parent);
      this._maximized = false;
    }
    setMaximized(b) {
      if (this._maximized === b) return;
      this._maximized = b;
      this.redraw();
    }
    isMaximized() {
      return this._maximized;
    }
    render(skin) {
      if (!this.getWindow()) return;
      skin.drawWindowMaximizeButton(this, this.isDepressed(), this.isHovered(), this.isDisabled(), this._maximized);
    }
  };
  var WindowMinimizeButton = class extends WindowCloseButton {
    constructor(parent) {
      super(parent);
    }
    render(skin) {
      if (!this.getWindow()) return;
      skin.drawWindowMinimizeButton(this, this.isDepressed(), this.isHovered(), this.isDisabled());
    }
  };

  // src/controls/SplitterBar.ts
  var SplitterBar = class extends Dragger {
    constructor(parent) {
      super(parent);
      this.setTarget(this);
      this.setRestrictToParent(true);
      this.setShouldDrawBackground(false);
    }
    layout(skin) {
      super.layout(skin);
      this.moveTo(this.x(), this.y());
    }
  };

  // src/controls/WindowControl.ts
  var WindowControl = class _WindowControl extends ResizableControl {
    constructor(parent, titleText = "Window") {
      super(parent);
      this.onWindowClosed = new Signal();
      this._closable = true;
      this._deleteOnClose = false;
      this._modal = null;
      this._preModalParent = null;
      this.setMinimumSize(point(100, 40));
      this.setClampMovement(true);
      this.setSize(200, 150);
      this.setMouseInputEnabled(true);
      this.setKeyboardInputEnabled(false);
      this.setTabBoundary(true);
      this._titleBar = new Dragger(this);
      this._titleBar.dock(Pos.Top);
      this._titleBar.setHeight(28);
      this._titleBar.setTarget(this);
      this._title = new Label(this._titleBar);
      this._title.dock(Pos.Fill);
      this._title.setAlignment(Pos.Left | Pos.CenterV);
      this._title.setPadding(margin(8, 0, 0, 0));
      this._title.setText(titleText);
      this._closeButton = new WindowCloseButton(this._titleBar);
      this._closeButton.setSize(24, 24);
      this._closeButton.dock(Pos.Right);
      this._closeButton.setMargin(margin(0, 2, 4, 2));
      this._closeButton.setWindow(this);
      this._closeButton.onPress.on(() => this.closeButtonPressed());
      this.getResizer(Pos.Top)?.hide();
    }
    // =====================================================================
    // Title / chrome config
    // =====================================================================
    setTitle(s) {
      this._title.setText(s);
    }
    getTitle() {
      return this._title.getText();
    }
    setClosable(b) {
      this._closable = b;
      this._closeButton.setHidden(!b);
    }
    isClosable() {
      return this._closable;
    }
    setDeleteOnClose(b) {
      this._deleteOnClose = b;
    }
    // =====================================================================
    // Z-order
    // =====================================================================
    touch() {
      super.touch();
      this.bringToFront();
    }
    // True when we're the front-most WindowControl sibling. Renderers use
    // this to pick the active vs inactive chrome.
    isOnTop() {
      const p = this.parent;
      if (!p) return false;
      const siblings = p.children;
      for (let i = siblings.length - 1; i >= 0; i--) {
        const s = siblings[i];
        if (s instanceof _WindowControl) return s === this;
      }
      return false;
    }
    // =====================================================================
    // Close
    // =====================================================================
    close() {
      this.closeButtonPressed();
    }
    closeButtonPressed() {
      this.destroyModal();
      const info = eventInfo();
      info.controlCaller = this;
      this.onWindowClosed.emit(info);
      this.setHidden(true);
      if (this._deleteOnClose) {
        const canvas = this.getCanvas();
        if (canvas && typeof canvas.addDelayedDelete === "function") {
          canvas.addDelayedDelete(this);
        }
      }
    }
    // =====================================================================
    // Modal wrap
    // =====================================================================
    makeModal(drawBackground = true) {
      if (this._modal) return;
      const canvas = this.getCanvas();
      if (!canvas) return;
      this._preModalParent = this.parent;
      this._modal = new Modal(canvas);
      this._modal.setShouldDrawBackground(drawBackground);
      this.setParent(this._modal);
    }
    destroyModal() {
      if (!this._modal) return;
      const canvas = this.getCanvas();
      this.setParent(this._preModalParent ?? canvas);
      this._modal.dispose();
      this._modal = null;
      this._preModalParent = null;
    }
    // =====================================================================
    // Visibility / input
    // =====================================================================
    setHidden(b) {
      super.setHidden(b);
      if (!b) this.bringToFront();
    }
    onMouseClickLeft(x, y, pressed) {
      super.onMouseClickLeft(x, y, pressed);
      if (pressed) this.touch();
    }
    // =====================================================================
    // Render
    // =====================================================================
    render(skin) {
      const hasFocus = this.isOnTop();
      skin.drawWindow(this, this._titleBar.bottom(), hasFocus);
    }
    renderUnder(skin) {
      skin.drawShadow(this);
    }
    renderFocus(_skin) {
    }
  };

  // src/controls/Splitters.ts
  var SplitterVertical = class extends Base {
    constructor(parent) {
      super(parent);
      this._splitterSize = 6;
      this._size = 100;
      this._rightSided = false;
      this._panels = [new Base(this), new Base(this)];
      this._splitterBar = new SplitterBar(this);
      this._splitterBar.setCursor(CursorType.SizeNS);
      this._splitterBar.onDragged.on(() => this.onSplitterMoved());
      this.setSize(100, 100);
    }
    // =====================================================================
    // Panel wiring — reparents user content into the panel slots and
    // fills them with Pos.Fill so resizes propagate automatically.
    // =====================================================================
    setPanels(a, b) {
      if (a) {
        a.setParent(this._panels[0]);
        a.dock(Pos.Fill);
      }
      if (b) {
        b.setParent(this._panels[1]);
        b.dock(Pos.Fill);
      }
    }
    setScaling(rightSided, size) {
      this._rightSided = rightSided;
      this._size = size;
      this.invalidate();
    }
    splitterPos() {
      return this._splitterBar.y();
    }
    // =====================================================================
    // Drag callback — reads the splitter's new position and updates
    // `_size` so relayout reproduces it. Direction depends on whether
    // the splitter is pinned to the near (top) or far (bottom) side.
    // =====================================================================
    onSplitterMoved() {
      if (this._rightSided) {
        this._size = this.height() - this._splitterBar.y() - this._splitterSize;
      } else {
        this._size = this._splitterBar.y();
      }
      this.invalidate();
    }
    // =====================================================================
    // Layout — place bar + two panels from `_size`.
    // =====================================================================
    layout(skin) {
      super.layout(skin);
      const bar = this._splitterBar;
      const barY = this._rightSided ? this.height() - this._size - this._splitterSize : this._size;
      bar.setBounds(0, barY, this.width(), this._splitterSize);
      this._panels[0].setBounds(0, 0, this.width(), barY);
      this._panels[1].setBounds(
        0,
        barY + this._splitterSize,
        this.width(),
        this.height() - barY - this._splitterSize
      );
    }
  };
  var SplitterHorizontal = class extends SplitterVertical {
    constructor(parent) {
      super(parent);
      this._splitterBar.setCursor(CursorType.SizeWE);
    }
    splitterPos() {
      return this._splitterBar.x();
    }
    onSplitterMoved() {
      if (this._rightSided) {
        this._size = this.width() - this._splitterBar.x() - this._splitterSize;
      } else {
        this._size = this._splitterBar.x();
      }
      this.invalidate();
    }
    // Overrides the parent's layout entirely. We don't chain to super's
    // layout because the axis is swapped — the parent would place the
    // bar horizontally, which is wrong for this subclass.
    layout(_skin) {
      const bar = this._splitterBar;
      const barX = this._rightSided ? this.width() - this._size - this._splitterSize : this._size;
      bar.setBounds(barX, 0, this._splitterSize, this.height());
      this._panels[0].setBounds(0, 0, barX, this.height());
      this._panels[1].setBounds(
        barX + this._splitterSize,
        0,
        this.width() - barX - this._splitterSize,
        this.height()
      );
    }
  };

  // src/controls/CrossSplitter.ts
  var CrossSplitter = class extends Base {
    constructor(parent) {
      super(parent);
      this.onZoomChange = new Signal();
      this.onZoomed = new Signal();
      this.onUnZoomed = new Signal();
      this._panels = [null, null, null, null];
      this._barSize = 5;
      this._hVal = 0.5;
      this._vVal = 0.5;
      this._zoomedSection = -1;
      this._vSplitter = new SplitterBar(this);
      this._vSplitter.setCursor(CursorType.SizeNS);
      this._vSplitter.onDragged.on(() => this.calcV());
      this._hSplitter = new SplitterBar(this);
      this._hSplitter.setCursor(CursorType.SizeWE);
      this._hSplitter.onDragged.on(() => this.calcH());
      this._cSplitter = new SplitterBar(this);
      this._cSplitter.setCursor(CursorType.SizeAll);
      this._cSplitter.onDragged.on(() => this.calcC());
    }
    // =====================================================================
    // Panel wiring
    // =====================================================================
    setPanel(i, p) {
      if (i < 0 || i > 3) return;
      if (p) p.setParent(this);
      this._panels[i] = p;
      this.invalidate();
    }
    getPanel(i) {
      if (i < 0 || i > 3) return null;
      return this._panels[i];
    }
    setSplitterSize(size) {
      this._barSize = size;
      this.invalidate();
    }
    centerPanels() {
      this._hVal = 0.5;
      this._vVal = 0.5;
      this.invalidate();
    }
    // =====================================================================
    // Zoom state
    // =====================================================================
    isZoomed() {
      return this._zoomedSection !== -1;
    }
    zoom(section) {
      this.unZoom();
      if (section < 0 || section > 3) return;
      this._zoomedSection = section;
      for (let i = 0; i < 4; i++) {
        const p = this._panels[i];
        if (p && i !== section) p.hide();
      }
      const info = eventInfo();
      info.controlCaller = this;
      this.onZoomed.emit(info);
      this.onZoomChange.emit(info);
      this.invalidate();
    }
    unZoom() {
      if (this._zoomedSection === -1) return;
      this._zoomedSection = -1;
      for (const p of this._panels) {
        if (p) p.show();
      }
      const info = eventInfo();
      info.controlCaller = this;
      this.onUnZoomed.emit(info);
      this.onZoomChange.emit(info);
      this.invalidate();
    }
    // =====================================================================
    // Drag callbacks — rewrite the fractional position from the bar's
    // current pixel offset, then invalidate so `layout` runs next tick.
    // =====================================================================
    calcV() {
      const h = this.height() - this._barSize;
      this._vVal = h > 0 ? this._vSplitter.y() / h : 0.5;
      this.calcAll();
    }
    calcH() {
      const w = this.width() - this._barSize;
      this._hVal = w > 0 ? this._hSplitter.x() / w : 0.5;
      this.calcAll();
    }
    calcC() {
      const w = this.width() - this._barSize;
      const h = this.height() - this._barSize;
      this._hVal = w > 0 ? this._cSplitter.x() / w : 0.5;
      this._vVal = h > 0 ? this._cSplitter.y() / h : 0.5;
      this.calcAll();
    }
    calcAll() {
      this.invalidate();
    }
    // =====================================================================
    // Layout
    // =====================================================================
    layout(_skin) {
      if (this._zoomedSection !== -1) {
        const zp = this._panels[this._zoomedSection];
        if (zp) zp.setBounds(0, 0, this.width(), this.height());
        return;
      }
      const W = this.width();
      const H = this.height();
      const b = this._barSize;
      const hX = Math.floor((W - b) * this._hVal);
      const vY = Math.floor((H - b) * this._vVal);
      this._vSplitter.setBounds(0, vY, W, b);
      this._hSplitter.setBounds(hX, 0, b, H);
      this._cSplitter.setBounds(hX, vY, b, b);
      const p0 = this._panels[0];
      if (p0) p0.setBounds(0, 0, hX, vY);
      const p1 = this._panels[1];
      if (p1) p1.setBounds(hX + b, 0, W - hX - b, vY);
      const p2 = this._panels[2];
      if (p2) p2.setBounds(0, vY + b, hX, H - vY - b);
      const p3 = this._panels[3];
      if (p3) p3.setBounds(hX + b, vY + b, W - hX - b, H - vY - b);
      this._vSplitter.bringToFront();
      this._hSplitter.bringToFront();
      this._cSplitter.bringToFront();
    }
  };

  // src/controls/DockBase.ts
  var DockBase = class _DockBase extends Base {
    constructor(parent) {
      super(parent);
      this._left = null;
      this._right = null;
      this._top = null;
      this._bottom = null;
      this._dockedTabControl = null;
      this._drawHover = false;
      // Named after GWEN's `m_bDropFar`. When the pointer lands in the
      // outermost 20% of the dock's bounds, a dropped tab is pushed behind
      // its siblings rather than to the front.
      this._dropToBack = false;
      this._hoverRect = rect(0, 0, 0, 0);
      this.setPadding(margin(1, 1, 1, 1));
      this.setSize(200, 200);
      this.setTabBoundary(true);
    }
    // =======================================================================
    // Lazy edge accessors
    // =======================================================================
    getLeft() {
      return this.getChildDock(Pos.Left);
    }
    getRight() {
      return this.getChildDock(Pos.Right);
    }
    getTop() {
      return this.getChildDock(Pos.Top);
    }
    getBottom() {
      return this.getChildDock(Pos.Bottom);
    }
    getTabControl() {
      return this._dockedTabControl;
    }
    getChildDock(pos) {
      let child = this.getFieldValue(pos);
      if (!child) {
        child = new _DockBase(this);
        this.setFieldValue(pos, child);
        child.setupChildDock(pos);
      } else if (child.hidden()) {
        child.setHidden(false);
      }
      return child;
    }
    getFieldValue(pos) {
      if (pos === Pos.Left) return this._left;
      if (pos === Pos.Right) return this._right;
      if (pos === Pos.Top) return this._top;
      if (pos === Pos.Bottom) return this._bottom;
      return null;
    }
    setFieldValue(pos, dock) {
      if (pos === Pos.Left) this._left = dock;
      else if (pos === Pos.Right) this._right = dock;
      else if (pos === Pos.Top) this._top = dock;
      else if (pos === Pos.Bottom) this._bottom = dock;
    }
    // Installs this dock as a child at the given edge: gives it its own
    // DockedTabControl filling the client area plus a Resizer on its
    // inside edge. Only called once per child (on first creation).
    setupChildDock(pos) {
      if (!this._dockedTabControl) {
        const tc = new DockedTabControl(this);
        tc.onLoseTab.on(() => this.onTabRemoved());
        this._dockedTabControl = tc;
      }
      const host = this.parent;
      if (host) {
        if (pos === Pos.Top || pos === Pos.Bottom) {
          const hh = host.height();
          if (hh > 0) this.setHeight(Math.max(40, Math.floor(hh * 0.5)));
        } else if (pos === Pos.Left || pos === Pos.Right) {
          const hw = host.width();
          if (hw > 0) this.setWidth(Math.max(40, Math.floor(hw * 0.5)));
        }
      }
      this.dock(pos);
      let resizerDir = Pos.Left;
      if (pos === Pos.Left) resizerDir = Pos.Right;
      else if (pos === Pos.Top) resizerDir = Pos.Bottom;
      else if (pos === Pos.Bottom) resizerDir = Pos.Top;
      const r = new Resizer(this);
      r.dock(resizerDir);
      r.setResizeDir(resizerDir);
      r.setTarget(this);
      r.setSize(2, 2);
    }
    // =======================================================================
    // Emptiness / consolidation
    // =======================================================================
    // A dock is empty when its own tab control has no tabs AND no visible
    // child dock holds anything. Matches GWEN's `IsEmpty` recursion.
    isEmpty() {
      if ((this._dockedTabControl?.tabCount() ?? 0) > 0) return false;
      if (this._left && !this._left.isEmpty()) return false;
      if (this._right && !this._right.isEmpty()) return false;
      if (this._top && !this._top.isEmpty()) return false;
      if (this._bottom && !this._bottom.isEmpty()) return false;
      return true;
    }
    onTabRemoved() {
      this.doRedundancyCheck();
      this.doConsolidateCheck();
    }
    doRedundancyCheck() {
      if (!this.isEmpty()) return;
      const p = this.parent;
      if (p instanceof _DockBase) p.onRedundantChildDock(this);
    }
    onRedundantChildDock(child) {
      child.setHidden(true);
      this.doRedundancyCheck();
      this.doConsolidateCheck();
    }
    // Pulls tabs from the first non-empty child dock into this one when this
    // dock's own tab control is empty but a descendant still holds tabs.
    // Priority order matches GWEN: bottom, top, left, right.
    doConsolidateCheck() {
      if (this.isEmpty()) return;
      if (!this._dockedTabControl) return;
      if (this._dockedTabControl.tabCount() > 0) return;
      const candidates = [this._bottom, this._top, this._left, this._right];
      for (const c of candidates) {
        if (c && !c.isEmpty() && c._dockedTabControl) {
          c._dockedTabControl.moveTabsTo(this._dockedTabControl);
          return;
        }
      }
    }
    // =======================================================================
    // Drop direction
    // =======================================================================
    // Partitions the pointer's local position into one of five targets:
    // Fill (centre 40% square), or one of Top/Left/Right/Bottom when the
    // pointer is closer to that edge. Anything beyond the outer 20%
    // ring flips `_dropToBack`.
    getDroppedTabDirection(x, y) {
      const w = this.width();
      const h = this.height();
      if (w <= 0 || h <= 0) return Pos.Fill;
      const top = y / h;
      const left = x / w;
      const right = (w - x) / w;
      const bottom = (h - y) / h;
      const minimum = Math.min(top, left, right, bottom);
      this._dropToBack = minimum < 0.2;
      if (minimum > 0.3) return Pos.Fill;
      if (top === minimum && (!this._top || this._top.hidden())) return Pos.Top;
      if (left === minimum && (!this._left || this._left.hidden())) return Pos.Left;
      if (right === minimum && (!this._right || this._right.hidden())) return Pos.Right;
      if (bottom === minimum && (!this._bottom || this._bottom.hidden())) return Pos.Bottom;
      return Pos.Fill;
    }
    // =======================================================================
    // Drag-and-drop overrides
    // =======================================================================
    dragAndDrop_CanAcceptPackage(p) {
      return p.name === "TabButtonMove" || p.name === "TabWindowMove";
    }
    dragAndDrop_HoverEnter(_p, _x, _y) {
      this._drawHover = true;
    }
    dragAndDrop_HoverLeave(_p) {
      this._drawHover = false;
    }
    dragAndDrop_Hover(_p, canvasX, canvasY) {
      const local = this.canvasPosToLocal(point(canvasX, canvasY));
      const dir = this.getDroppedTabDirection(local.x, local.y);
      const w = this.width();
      const h = this.height();
      if (dir === Pos.Fill) {
        if (!this._dockedTabControl) {
          this._hoverRect = rect(0, 0, 0, 0);
          return;
        }
        const ib = this.getInnerBounds();
        this._hoverRect = rect(ib.x, ib.y, ib.w, ib.h);
        return;
      }
      const bar = Math.floor((dir === Pos.Top || dir === Pos.Bottom ? h : w) * 0.25);
      if (dir === Pos.Left) this._hoverRect = rect(0, 0, bar, h);
      else if (dir === Pos.Right) this._hoverRect = rect(w - bar, 0, bar, h);
      else if (dir === Pos.Top) this._hoverRect = rect(0, 0, w, bar);
      else if (dir === Pos.Bottom) this._hoverRect = rect(0, h - bar, w, bar);
      if (this._dropToBack) return;
      if (dir === Pos.Top || dir === Pos.Bottom) {
        if (this._left && !this._left.hidden()) {
          const lw = this._left.width();
          this._hoverRect.x += lw;
          this._hoverRect.w -= lw;
        }
        if (this._right && !this._right.hidden()) {
          this._hoverRect.w -= this._right.width();
        }
      } else {
        if (this._top && !this._top.hidden()) {
          const th = this._top.height();
          this._hoverRect.y += th;
          this._hoverRect.h -= th;
        }
        if (this._bottom && !this._bottom.hidden()) {
          this._hoverRect.h -= this._bottom.height();
        }
      }
    }
    dragAndDrop_HandleDrop(p, canvasX, canvasY) {
      const local = this.canvasPosToLocal(point(canvasX, canvasY));
      const dir = this.getDroppedTabDirection(local.x, local.y);
      let addTo;
      let dropChild = null;
      if (dir === Pos.Fill) {
        if (!this._dockedTabControl) return false;
        addTo = this._dockedTabControl;
      } else {
        dropChild = this.getChildDock(dir);
        addTo = dropChild._dockedTabControl;
      }
      if (!addTo) return false;
      if (p.name === "TabButtonMove") {
        const src = p.drawcontrol;
        if (!(src instanceof TabButton)) return false;
        this.attachTabButtonTo(addTo, src);
      } else if (p.name === "TabWindowMove") {
        const src = p.drawcontrol;
        if (!(src instanceof DockedTabControl)) return false;
        if (src !== addTo) src.moveTabsTo(addTo);
      } else {
        return false;
      }
      if (dropChild) {
        if (this._dropToBack) dropChild.sendToBack();
        else dropChild.bringToFront();
      }
      this.invalidate();
      return true;
    }
    // Reparent a single TabButton (and its page) into the target
    // DockedTabControl. Mirrors GWEN's `TabControl::AddPage(TabButton*)`
    // overload — the logic is identical to DockedTabControl.attachTabButton
    // but that method is protected, and the task scope forbids touching
    // sibling files. Duplicated here as a tight, local helper.
    //
    // After the reparent, fire the *source* TabControl's `onLoseTab` so its
    // owning DockBase runs its redundancy/consolidation pass and hides the
    // now-empty dock. GWEN gets this for free via virtual `OnChildRemoved`;
    // we wire it explicitly here.
    attachTabButtonTo(target, btn) {
      const sourceTC = btn.getTabControl();
      const page = btn.getPage();
      const inner = target.getInnerPanel();
      if (page) {
        page.setParent(inner);
        page.setHidden(true);
        page.setMargin(margin(6, 6, 6, 6));
        page.dock(Pos.Fill);
      }
      btn.setParent(target.getTabStrip());
      btn.dock(Pos.Left);
      btn.sizeToContents();
      btn.setTabControl(target);
      btn.onPress.on(() => target.onTabPressedExt(btn));
      target.onTabPressedExt(btn);
      target.invalidate();
      if (sourceTC && sourceTC !== target && sourceTC instanceof DockedTabControl) {
        const sourceCur = sourceTC.getCurrentButton();
        if (sourceCur && sourceCur.parent !== sourceTC.getTabStrip()) {
          const remaining = sourceTC.getTabStrip().children.filter((c) => c instanceof TabButton);
          if (remaining.length > 0) sourceTC.onTabPressedExt(remaining[0]);
        }
        sourceTC.invalidate();
        const info = eventInfo();
        info.controlCaller = sourceTC;
        sourceTC.onLoseTab.emit(info);
      }
    }
    // =======================================================================
    // Render
    // =======================================================================
    // Upstream's `Render` is a no-op (the only non-commented line draws
    // nothing). All visible output lives in `renderOver`.
    render(_skin) {
    }
    renderOver(skin) {
      if (!this._drawHover) return;
      const renderer = skin.renderer;
      const rb = this.getRenderBounds();
      renderer.setDrawColor(color(38, 128, 235, 24));
      renderer.drawFilledRect(rb);
      if (this._hoverRect.w === 0) return;
      renderer.setDrawColor(color(38, 128, 235, 110));
      renderer.drawFilledRect(this._hoverRect);
      renderer.setDrawColor(color(112, 178, 255, 220));
      renderer.drawLinedRect(this._hoverRect);
    }
  };

  // src/core/ColorUtil.ts
  function rgbToHsv(c) {
    const r = c.r / 255;
    const g = c.g / 255;
    const b = c.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = (g - b) / d % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s, v };
  }
  function hsvToColor(h, s, v, a = 255) {
    if (s === 0) {
      const g2 = Math.round(v * 255);
      return color(g2, g2, g2, a);
    }
    const hh = (h % 360 + 360) % 360 / 60;
    const c = v * s;
    const x = c * (1 - Math.abs(hh % 2 - 1));
    const m = v - c;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh < 1) {
      r = c;
      g = x;
    } else if (hh < 2) {
      r = x;
      g = c;
    } else if (hh < 3) {
      g = c;
      b = x;
    } else if (hh < 4) {
      g = x;
      b = c;
    } else if (hh < 5) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    return color(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
      a
    );
  }
  function lerpColor(a, b, t) {
    return color(
      Math.round(a.r + (b.r - a.r) * t),
      Math.round(a.g + (b.g - a.g) * t),
      Math.round(a.b + (b.b - a.b) * t),
      Math.round(a.a + (b.a - a.a) * t)
    );
  }

  // src/controls/ColorDisplay.ts
  var ColorDisplay = class extends Base {
    constructor(parent) {
      super(parent);
      this._color = color(255, 255, 255, 255);
      this._drawCheckers = true;
      this.setSize(32, 32);
      this.setMouseInputEnabled(false);
    }
    // =======================================================================
    // Color
    // =======================================================================
    setColor(c) {
      this._color = c;
      this.redraw();
    }
    getColor() {
      return this._color;
    }
    // Per-channel setters — mirror GWEN's SetRed/SetGreen/SetBlue/SetAlpha.
    // All four go through `color()` so callers that pass out-of-range
    // values get clamped instead of corrupting the swatch.
    setRed(v) {
      this._color = color(v, this._color.g, this._color.b, this._color.a);
      this.redraw();
    }
    setGreen(v) {
      this._color = color(this._color.r, v, this._color.b, this._color.a);
      this.redraw();
    }
    setBlue(v) {
      this._color = color(this._color.r, this._color.g, v, this._color.a);
      this.redraw();
    }
    setAlpha(v) {
      this._color = color(this._color.r, this._color.g, this._color.b, v);
      this.redraw();
    }
    setDrawCheckers(b) {
      this._drawCheckers = b;
      this.redraw();
    }
    getDrawCheckers() {
      return this._drawCheckers;
    }
    // =======================================================================
    // Render
    // =======================================================================
    render(skin) {
      skin.drawColorDisplay(this, this._color);
    }
  };

  // src/controls/ColorControls.ts
  var LERP_BAKE_SIZE = 64;
  function makeLerpCanvas() {
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(LERP_BAKE_SIZE, LERP_BAKE_SIZE);
    }
    const c = document.createElement("canvas");
    c.width = LERP_BAKE_SIZE;
    c.height = LERP_BAKE_SIZE;
    return c;
  }
  var ColorLerpBox = class extends Base {
    constructor(parent) {
      super(parent);
      this.onSelectionChanged = new Signal();
      this._cursorPos = point(0, 0);
      this._hue = 0;
      this._depressed = false;
      // Baked saturation/value gradient texture for the current hue.
      // `_textureDirty` is flagged whenever the hue changes; the next
      // render() re-bakes and re-uploads. The texture handle itself is
      // reused across hue changes — only the source pixels swap.
      this._texture = texture("ColorLerpBox");
      this._textureDirty = true;
      this.setSize(128, 128);
      this.setMouseInputEnabled(true);
    }
    // =======================================================================
    // Color
    // =======================================================================
    // `onlyHue=true` matches GWEN's default: SetColor from a hue slider
    // only updates the hue channel, leaving the cursor (s, v) untouched.
    // Callers restoring a saved state pass `false` so the cursor also
    // snaps to the new saturation/value.
    setColor(c, onlyHue = true) {
      const hsv2 = rgbToHsv(c);
      if (this._hue !== hsv2.h) {
        this._hue = hsv2.h;
        this._textureDirty = true;
      }
      if (!onlyHue) {
        this._cursorPos = point(
          Math.round(hsv2.s * this.width()),
          Math.round((1 - hsv2.v) * this.height())
        );
      }
      this.emitSelectionChanged();
      this.redraw();
    }
    setHue(h) {
      if (this._hue === h) return;
      this._hue = h;
      this._textureDirty = true;
      this.emitSelectionChanged();
      this.redraw();
    }
    getHue() {
      return this._hue;
    }
    getSelectedColor() {
      return this.getColorAtPos(this._cursorPos.x, this._cursorPos.y);
    }
    getColorAtPos(x, y) {
      const w = this.width();
      const h = this.height();
      const s = w > 1 ? x / (w - 1) : 0;
      const v = h > 1 ? 1 - y / (h - 1) : 0;
      return hsvToColor(this._hue, s, v, 255);
    }
    getCursorPos() {
      return { x: this._cursorPos.x, y: this._cursorPos.y };
    }
    // =======================================================================
    // Mouse
    // =======================================================================
    onMouseClickLeft(x, y, pressed) {
      this._depressed = pressed;
      const canvas = this.getCanvas();
      if (canvas) canvas.mouseFocus = pressed ? this : null;
      if (pressed) this.updateCursorFromCanvasPos(x, y);
    }
    onMouseMoved(x, y, _dx, _dy) {
      if (this._depressed) this.updateCursorFromCanvasPos(x, y);
    }
    // =======================================================================
    // Render
    // =======================================================================
    render(skin) {
      if (this._textureDirty) {
        this.bakeTexture(skin.renderer);
        this._textureDirty = false;
      }
      skin.renderer.setDrawColor(color(255, 255, 255, 255));
      skin.renderer.drawTexturedRect(this._texture, this.getRenderBounds());
      skin.renderer.setDrawColor(color(0, 0, 0, 255));
      skin.renderer.drawLinedRect(this.getRenderBounds());
      const cur = this.getSelectedColor();
      const avg = (cur.r + cur.g + cur.b) / 3;
      skin.renderer.setDrawColor(avg < 170 ? color(255, 255, 255, 255) : color(0, 0, 0, 255));
      skin.renderer.drawLinedRect(rect(this._cursorPos.x - 3, this._cursorPos.y - 3, 6, 6));
    }
    // The cursor marker can extend up to 3px past every edge — let it
    // render against the parent's clip rather than the box's own,
    // so the indicator stays fully visible at any cursor position.
    shouldClip() {
      return false;
    }
    dispose() {
      const canvas = this.getCanvas();
      const renderer = canvas?.renderer;
      if (renderer && this._texture.data) renderer.freeTexture(this._texture);
      super.dispose();
    }
    // Re-rasterize the saturation/value gradient at the current hue and
    // re-upload it as a GPU texture. Called on first render and whenever
    // the hue changes. Saturation runs across X (0 left → 1 right);
    // value runs across Y (1 top → 0 bottom). We compute hsvToColor for
    // every pixel — at LERP_BAKE_SIZE = 64 that's only 4096 pixels, so
    // the work is negligible even on hue-slider drag.
    bakeTexture(renderer) {
      const off = makeLerpCanvas();
      const ctx = off.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(LERP_BAKE_SIZE, LERP_BAKE_SIZE);
      const data = img.data;
      const N = LERP_BAKE_SIZE - 1;
      let i = 0;
      for (let y = 0; y < LERP_BAKE_SIZE; y++) {
        const v = 1 - y / N;
        for (let x = 0; x < LERP_BAKE_SIZE; x++) {
          const s = x / N;
          const c = hsvToColor(this._hue, s, v, 255);
          data[i++] = c.r;
          data[i++] = c.g;
          data[i++] = c.b;
          data[i++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      renderer.loadTextureFromSource(this._texture, off);
    }
    // =======================================================================
    // Internals
    // =======================================================================
    updateCursorFromCanvasPos(canvasX, canvasY) {
      const local = this.canvasPosToLocal(point(canvasX, canvasY));
      this._cursorPos = point(
        Math.max(0, Math.min(this.width() - 1, local.x)),
        Math.max(0, Math.min(this.height() - 1, local.y))
      );
      this.emitSelectionChanged();
      this.redraw();
    }
    emitSelectionChanged() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onSelectionChanged.emit(info);
    }
  };
  var ColorSlider = class extends Base {
    constructor(parent) {
      super(parent);
      this.onSelectionChanged = new Signal();
      this._selectedDist = 0;
      this._depressed = false;
      this.setSize(32, 128);
      this.setMouseInputEnabled(true);
    }
    // =======================================================================
    // Color
    // =======================================================================
    setColor(c) {
      const hsv2 = rgbToHsv(c);
      this._selectedDist = Math.round(hsv2.h / 360 * this.height());
      this.emitSelectionChanged();
      this.redraw();
    }
    getSelectedColor() {
      return this.getColorAtHeight(this._selectedDist);
    }
    getColorAtHeight(y) {
      const H = this.height();
      const hue = H > 1 ? y / (H - 1) * 360 : 0;
      return hsvToColor(hue, 1, 1, 255);
    }
    getSelectedDist() {
      return this._selectedDist;
    }
    // =======================================================================
    // Mouse
    // =======================================================================
    onMouseClickLeft(x, y, pressed) {
      this._depressed = pressed;
      const canvas = this.getCanvas();
      if (canvas) canvas.mouseFocus = pressed ? this : null;
      if (pressed) this.updateSliderFromCanvasY(y);
    }
    onMouseMoved(_x, y, _dx, _dy) {
      if (this._depressed) this.updateSliderFromCanvasY(y);
    }
    // =======================================================================
    // Render
    // =======================================================================
    render(skin) {
      const renderer = skin.renderer;
      const w = this.width();
      const h = this.height();
      for (let y = 0; y < h; y += 1) {
        renderer.setDrawColor(this.getColorAtHeight(y));
        renderer.drawFilledRect(rect(5, y, w - 10, 1));
      }
      const drawY = this._selectedDist - 3;
      renderer.setDrawColor(color(0, 0, 0, 255));
      renderer.drawFilledRect(rect(0, drawY, 5, 5));
      renderer.drawFilledRect(rect(w - 5, drawY, 5, 5));
      renderer.drawFilledRect(rect(0, drawY + 2, w, 1));
    }
    // Same shouldClip override as ColorLerpBox — the position-indicator
    // tab extends 3px past the slider's top and bottom at the
    // extremes, so render it against the parent's clip.
    shouldClip() {
      return false;
    }
    // =======================================================================
    // Internals
    // =======================================================================
    updateSliderFromCanvasY(canvasY) {
      const local = this.canvasPosToLocal(point(0, canvasY));
      this._selectedDist = Math.max(0, Math.min(this.height() - 1, local.y));
      this.emitSelectionChanged();
      this.redraw();
    }
    emitSelectionChanged() {
      const info = eventInfo();
      info.controlCaller = this;
      this.onSelectionChanged.emit(info);
    }
  };

  // src/controls/ColorPicker.ts
  var ColorPicker = class extends Base {
    constructor(parent) {
      super(parent);
      this.onColorChanged = new Signal();
      this._color = color(255, 0, 0, 255);
      // Suppresses the write-back loop while updateControls is repainting
      // the slider / textbox — without this, setFloatValue / setText on the
      // child controls would bounce a stale value back through the channel
      // handlers during initial population.
      this._suspendChannelEvents = false;
      this.setSize(256, 150);
      const redRow = this.createChannelRow("Red", 5);
      const greenRow = this.createChannelRow("Green", 41);
      const blueRow = this.createChannelRow("Blue", 77);
      const alphaRow = this.createChannelRow("Alpha", 113);
      this._channels = { Red: redRow, Green: greenRow, Blue: blueRow, Alpha: alphaRow };
      const resultGroup = new GroupBox(this);
      resultGroup.setPos(180, 30);
      resultGroup.setSize(60, 60);
      resultGroup.setText("Result");
      this._resultSwatch = new ColorDisplay(resultGroup);
      this._resultSwatch.setBounds(7, 5, 32, 32);
      this._resultSwatch.setDrawCheckers(true);
      this.setColor(this._color);
    }
    // =======================================================================
    // Color
    // =======================================================================
    setColor(c) {
      this._color = c;
      this.updateControls();
    }
    getColor() {
      return this._color;
    }
    setAlphaVisible(visible) {
      this._channels.Alpha.group.setHidden(!visible);
    }
    isAlphaVisible() {
      return !this._channels.Alpha.group.hidden();
    }
    // =======================================================================
    // Layout helpers
    // =======================================================================
    createChannelRow(name, y) {
      const group = new GroupBox(this);
      group.setPos(5, y);
      group.setSize(160, 36);
      group.setText(name);
      const display = new ColorDisplay(group);
      display.setBounds(0, 3, 12, 12);
      const slider = new HorizontalSlider(group);
      slider.setBounds(17, 1, 70, 15);
      slider.setRange(0, 255);
      slider.onValueChanged.on(() => this.onSliderChanged(name));
      const textbox = new TextBoxNumeric(group);
      textbox.setBounds(95, 0, 36, 16);
      textbox.setText("0");
      textbox.onTextChange.on(() => this.onTextChanged(name));
      return { group, slider, textbox, display };
    }
    // =======================================================================
    // Channel sync
    // =======================================================================
    updateControls() {
      this._suspendChannelEvents = true;
      try {
        const c = this._color;
        const red = this._channels.Red;
        red.slider.setFloatValue(c.r);
        red.textbox.setText(String(c.r));
        red.display.setColor(color(c.r, 0, 0, 255));
        const green = this._channels.Green;
        green.slider.setFloatValue(c.g);
        green.textbox.setText(String(c.g));
        green.display.setColor(color(0, c.g, 0, 255));
        const blue = this._channels.Blue;
        blue.slider.setFloatValue(c.b);
        blue.textbox.setText(String(c.b));
        blue.display.setColor(color(0, 0, c.b, 255));
        const alpha = this._channels.Alpha;
        alpha.slider.setFloatValue(c.a);
        alpha.textbox.setText(String(c.a));
        alpha.display.setColor(color(255, 255, 255, c.a));
        this._resultSwatch.setColor(c);
      } finally {
        this._suspendChannelEvents = false;
      }
      const info = eventInfo();
      info.controlCaller = this;
      this.onColorChanged.emit(info);
    }
    onSliderChanged(name) {
      if (this._suspendChannelEvents) return;
      const v = Math.round(this._channels[name].slider.getFloatValue());
      this.updateChannel(name, v);
    }
    onTextChanged(name) {
      if (this._suspendChannelEvents) return;
      const v = Math.round(this._channels[name].textbox.getFloatFromText());
      this.updateChannel(name, v);
    }
    updateChannel(name, raw) {
      const v = Math.max(0, Math.min(255, raw));
      const cur = this._color;
      if (name === "Red") this._color = color(v, cur.g, cur.b, cur.a);
      else if (name === "Green") this._color = color(cur.r, v, cur.b, cur.a);
      else if (name === "Blue") this._color = color(cur.r, cur.g, v, cur.a);
      else this._color = color(cur.r, cur.g, cur.b, v);
      this.updateControls();
    }
    // =======================================================================
    // Render
    // =======================================================================
    // No art of our own — everything visible is a child control.
    render(_skin) {
    }
  };

  // src/controls/HSVColorPicker.ts
  var HSVColorPicker = class extends Base {
    constructor(parent) {
      super(parent);
      this.onColorChanged = new Signal();
      this._defaultColor = color(0, 0, 0, 255);
      // Guards the text/setColor loop: writing a new R/G/B into the numeric
      // boxes via `updateControls` must not re-enter `onNumericTyped`.
      this._suspendNumeric = false;
      this.setSize(256, 150);
      this._lerpBox = new ColorLerpBox(this);
      this._lerpBox.setPos(3, 3);
      this._lerpBox.setSize(128, 128);
      this._lerpBox.onSelectionChanged.on(() => this.onLerpBoxChanged());
      this._slider = new ColorSlider(this);
      this._slider.setPos(128 + 3 + 5, 3);
      this._slider.setSize(32, 128);
      this._slider.onSelectionChanged.on(() => this.onSliderChanged());
      this._after = new ColorDisplay(this);
      this._after.setPos(173, 5);
      this._after.setSize(48, 24);
      this._before = new ColorDisplay(this);
      this._before.setPos(173, 28);
      this._before.setSize(48, 24);
      this._rBox = this.makeNumeric("R", 173, 75);
      this._gBox = this.makeNumeric("G", 173, 95);
      this._bBox = this.makeNumeric("B", 173, 115);
      this.setColor(color(255, 0, 0, 255), false, true);
    }
    // =======================================================================
    // Color accessors
    // =======================================================================
    getColor() {
      return this._lerpBox.getSelectedColor();
    }
    getDefaultColor() {
      return this._defaultColor;
    }
    /**
     * Pushes a new color into the picker.
     * @param c        the new RGBA color
     * @param onlyHue  when true, the lerp-box cursor (s, v) is left alone —
     *                 the slider drives hue only. Pass false for a full reset.
     * @param reset    copies `c` into the default/"before" swatch so the
     *                 user can compare against the pre-interaction color.
     */
    setColor(c, onlyHue = true, reset = false) {
      if (reset) {
        this._defaultColor = c;
        this._before.setColor(c);
      }
      this._slider.setColor(c);
      this._lerpBox.setColor(c, onlyHue);
      this.updateControls(c);
    }
    // =======================================================================
    // Internal handlers
    // =======================================================================
    onLerpBoxChanged() {
      const c = this._lerpBox.getSelectedColor();
      this.updateControls(c);
      const info = eventInfo();
      info.controlCaller = this;
      this.onColorChanged.emit(info);
    }
    onSliderChanged() {
      const c = this._slider.getSelectedColor();
      this._lerpBox.setColor(c, true);
    }
    onNumericTyped() {
      if (this._suspendNumeric) return;
      const r = Math.round(this._rBox.getFloatFromText());
      const g = Math.round(this._gBox.getFloatFromText());
      const b = Math.round(this._bBox.getFloatFromText());
      const c = color(
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b)),
        255
      );
      this.setColor(c, false, false);
      const info = eventInfo();
      info.controlCaller = this;
      this.onColorChanged.emit(info);
    }
    // Repaints the numeric inputs and the "after" swatch. Wrapped in a
    // suspend flag so the setText calls don't bounce back through
    // `onNumericTyped` while we're the one driving the update.
    updateControls(c) {
      this._after.setColor(c);
      this._suspendNumeric = true;
      this._rBox.setText(String(c.r));
      this._gBox.setText(String(c.g));
      this._bBox.setText(String(c.b));
      this._suspendNumeric = false;
    }
    // =======================================================================
    // Construction helpers
    // =======================================================================
    makeNumeric(labelText, x, y) {
      const tb = new TextBoxNumeric(this);
      tb.setPos(x, y);
      tb.setSize(48, 16);
      tb.onTextChange.on(() => this.onNumericTyped());
      const label = new Label(this);
      label.setPos(x + 52, y);
      label.setSize(20, 16);
      label.setText(labelText);
      return tb;
    }
  };

  // src/controls/Dialogs.ts
  var Dialogs_exports = {};
  __export(Dialogs_exports, {
    fileOpen: () => fileOpen,
    fileSave: () => fileSave,
    folderOpen: () => folderOpen,
    query: () => query
  });
  function parseAccept(filter) {
    const parts = filter.split("|");
    const exts = parts[parts.length - 1] ?? "";
    const tokens = exts.match(/\*\.[A-Za-z0-9]+/g) ?? [];
    return tokens.map((t) => t.replace("*", "")).join(",");
  }
  async function fileOpen(useSystem, _name, _startPath, ext) {
    if (!useSystem || typeof document === "undefined") return null;
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      const accept = parseAccept(ext);
      if (accept) input.accept = accept;
      input.onchange = () => {
        const f = input.files?.[0];
        resolve(f ? f.name : null);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }
  async function fileSave(useSystem, _name, _startPath, ext) {
    if (!useSystem) return null;
    const w = globalThis;
    if (w.showSaveFilePicker) {
      try {
        const extMatch = ext.match(/\*\.[A-Za-z0-9]+/);
        const suggestedExt = extMatch ? extMatch[0].slice(1) : ".txt";
        const handle = await w.showSaveFilePicker({
          suggestedName: "file" + suggestedExt
        });
        return handle.name;
      } catch {
        return null;
      }
    }
    return null;
  }
  async function folderOpen(useSystem, _name, _startPath) {
    if (!useSystem || typeof document === "undefined") return null;
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.multiple = true;
      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        if (!files.length) {
          resolve(null);
          return;
        }
        const first = files[0].webkitRelativePath;
        const root = first.split("/")[0] ?? null;
        resolve(root);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }
  function query(canvas, text, onYes, onNo, onCancel) {
    const win = new WindowControl(canvas, "Confirm");
    win.setSize(320, 140);
    const cx = canvas.width() / 2;
    const cy = canvas.height() / 2;
    win.setPos(cx - 160, cy - 70);
    win.setClosable(true);
    win.makeModal(true);
    const label = new Label(win);
    label.setBounds(10, 30, 300, 60);
    label.setText(text);
    label.setAlignment(Pos.CenterH | Pos.CenterV);
    label.setWrap(true);
    let handled = false;
    const close = (handler) => {
      if (handled) return;
      handled = true;
      win.destroyModal();
      win.close();
      handler?.();
    };
    if (onYes && onNo && onCancel) {
      const yes = new Button(win);
      yes.setBounds(40, 100, 80, 22);
      yes.setText("Yes");
      yes.onPress.on(() => close(onYes));
      const no = new Button(win);
      no.setBounds(130, 100, 80, 22);
      no.setText("No");
      no.onPress.on(() => close(onNo));
      const cancel = new Button(win);
      cancel.setBounds(220, 100, 80, 22);
      cancel.setText("Cancel");
      cancel.onPress.on(() => close(onCancel));
    } else if (onYes && onNo) {
      const yes = new Button(win);
      yes.setBounds(80, 100, 80, 22);
      yes.setText("Yes");
      yes.onPress.on(() => close(onYes));
      const no = new Button(win);
      no.setBounds(170, 100, 80, 22);
      no.setText("No");
      no.onPress.on(() => close(onNo));
    } else {
      const ok = new Button(win);
      ok.setBounds(130, 100, 80, 22);
      ok.setText("OK");
      ok.onPress.on(() => close(onYes));
    }
    win.onWindowClosed.on(() => {
      if (!handled && onCancel) {
        handled = true;
        onCancel();
      }
    });
    return win;
  }

  // src/controls/FilePicker.ts
  function gwenFilterToAccept(filter) {
    const parts = filter.split("|");
    const exts = parts[parts.length - 1] ?? "";
    const tokens = exts.match(/\*\.[A-Za-z0-9]+/g) ?? [];
    return tokens.map((t) => t.replace("*", "")).join(",");
  }
  var FilePicker = class extends Base {
    constructor(parent) {
      super(parent);
      this.onFileChanged = new Signal();
      this._file = null;
      // Independent of `_file` so PropertyFile.setPropertyValue('foo.txt')
      // can prefill a display name without fabricating a File. When the
      // user picks a real file the two are kept in sync.
      this._displayName = "";
      // Browser `accept` attribute. Either set directly via `setAccept`
      // ('image/*') or derived from a GWEN-style filter via `setFileType`.
      this._accept = "";
      this._fileType = "Any Type | *.*";
      this.setSize(220, 22);
      this._browseButton = new Button(this);
      this._browseButton.dock(Pos.Right);
      this._browseButton.setWidth(70);
      this._browseButton.setText("Browse\u2026");
      this._browseButton.setMargin(margin(2, 0, 0, 0));
      this._browseButton.setTabable(true);
      this._browseButton.setKeyboardInputEnabled(true);
      this._browseButton.onPress.on(() => {
        try {
          void this.openDialog().catch(() => {
          });
        } catch {
        }
      });
      this._clearButton = new Button(this);
      this._clearButton.dock(Pos.Right);
      this._clearButton.setWidth(22);
      this._clearButton.setText("\u2715");
      this._clearButton.setMargin(margin(2, 0, 0, 0));
      this._clearButton.setTabable(true);
      this._clearButton.setKeyboardInputEnabled(true);
      this._clearButton.hide();
      this._clearButton.onPress.on(() => this.clear());
      this._textBox = new TextBox(this);
      this._textBox.dock(Pos.Fill);
      this._textBox.setEditable(false);
      this._textBox.setMouseInputEnabled(false);
      this._textBox.setKeyboardInputEnabled(false);
      this._textBox.setTabable(false);
    }
    // =====================================================================
    // Filter configuration
    // =====================================================================
    /** Set the browser `accept` attribute directly (e.g. 'image/*' or '.png,.jpg'). */
    setAccept(s) {
      this._accept = s;
    }
    getAccept() {
      return this._accept;
    }
    /**
     * Set a GWEN-style filter string ("Label | *.ext1;*.ext2"). The
     * extension tokens are translated into a browser `accept` value;
     * the label is dropped (browsers don't surface it).
     */
    setFileType(s) {
      this._fileType = s;
      this._accept = gwenFilterToAccept(s);
    }
    getFileType() {
      return this._fileType;
    }
    // =====================================================================
    // File / name accessors
    // =====================================================================
    /** Returns the currently selected File, or null if cleared. */
    getFile() {
      return this._file;
    }
    /**
     * Returns the display name. Equal to `getFile()?.name` when a real
     * file is held; otherwise whatever was last set via `setFileName`
     * (the "advisory display only" path).
     */
    getFileName() {
      return this._displayName;
    }
    /**
     * Replace the held File (or pass null to clear). Updates the display,
     * toggles the clear button's enabled state, and fires `onFileChanged`
     * unless `fireEvents` is explicitly false.
     */
    setFile(file, fireEvents = true) {
      this._file = file;
      this._displayName = file ? file.name : "";
      this._textBox.setText(this._displayName);
      this._clearButton.setHidden(!this.hasContent());
      this.invalidate();
      if (fireEvents) this.fireChanged();
    }
    /**
     * Set the display name without altering the File reference. Use this
     * to rehydrate a saved selection from a string when the bytes aren't
     * available. `getFile()` will continue to return whatever was held
     * (typically null in this scenario).
     */
    setFileName(name, fireEvents = true) {
      this._displayName = name;
      this._textBox.setText(name);
      this._clearButton.setHidden(!this.hasContent());
      this.invalidate();
      if (fireEvents) this.fireChanged();
    }
    /** True iff the picker holds either a File or a non-empty display name. */
    hasContent() {
      return this._file !== null || this._displayName !== "";
    }
    /** Drop the held File and clear the display. Always fires `onFileChanged`. */
    clear(fireEvents = true) {
      this.setFile(null, fireEvents);
    }
    // Property-grid aliases — kept so PropertyFile (and any future
    // serializer) treats the picker like any other property without
    // special-casing the accessor names.
    getValue() {
      return this.getFileName();
    }
    setValue(v) {
      if (v === "") this.clear();
      else this.setFileName(v);
    }
    // =====================================================================
    // Child accessors (mainly for tests + custom styling)
    // =====================================================================
    getTextBox() {
      return this._textBox;
    }
    getBrowseButton() {
      return this._browseButton;
    }
    getClearButton() {
      return this._clearButton;
    }
    // =====================================================================
    // Dialog
    // =====================================================================
    /**
     * Open the browser's native file dialog. Resolves with the picked File
     * or null on cancel / no DOM. Public so callers can trigger the dialog
     * programmatically (e.g. from a keyboard shortcut on a parent panel).
     *
     * On success the picker's state updates and `onFileChanged` fires
     * before the promise resolves — handlers can read `getFile()` directly.
     */
    async openDialog() {
      if (typeof document === "undefined") return null;
      const file = await openNativeFileDialog(this._accept);
      if (file) this.setFile(file);
      return file;
    }
    // =====================================================================
    // Internal
    // =====================================================================
    fireChanged() {
      const info = eventInfo();
      info.controlCaller = this;
      info.string = this._displayName;
      info.data = this._file;
      this.onFileChanged.emit(info);
    }
  };
  function openNativeFileDialog(accept = "") {
    if (typeof document === "undefined") return Promise.resolve(null);
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      if (accept) input.accept = accept;
      input.style.position = "fixed";
      input.style.left = "-10000px";
      input.style.top = "-10000px";
      input.style.opacity = "0";
      input.style.pointerEvents = "none";
      let settled = false;
      const cleanup = () => {
        if (input.parentNode) input.parentNode.removeChild(input);
      };
      const settle = (file) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(file);
      };
      input.onchange = () => settle(input.files?.[0] ?? null);
      input.oncancel = () => settle(null);
      document.body.appendChild(input);
      try {
        input.click();
      } catch {
        settle(null);
      }
    });
  }
  var FolderPicker = class extends Base {
    constructor(parent) {
      super(parent);
      this.onFolderChanged = new Signal();
      this.setSize(100, 20);
      this._button = new Button(this);
      this._button.dock(Pos.Right);
      this._button.setWidth(20);
      this._button.setText("..");
      this._button.setMargin(margin(2, 0, 0, 0));
      this._button.onPress.on(() => {
        void this.onBrowse();
      });
      this._textBox = new TextBox(this);
      this._textBox.dock(Pos.Fill);
    }
    setFolder(v) {
      this._textBox.setText(v);
      const info = eventInfo();
      info.controlCaller = this;
      info.string = v;
      this.onFolderChanged.emit(info);
    }
    getFolder() {
      return this._textBox.getText();
    }
    getValue() {
      return this.getFolder();
    }
    setValue(v) {
      this.setFolder(v);
    }
    getTextBox() {
      return this._textBox;
    }
    getButton() {
      return this._button;
    }
    async onBrowse() {
      const path = await folderOpen(true, "Open", "");
      if (path) this.setFolder(path);
    }
  };

  // src/controls/Properties.ts
  var PropertyBase = class extends Base {
    constructor(parent) {
      super(parent);
      this.onChange = new Signal();
      this.setHeight(17);
    }
  };
  var PropertyText = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._textbox = new TextBox(this);
      this._textbox.dock(Pos.Fill);
      this._textbox.setShouldDrawBackground(false);
      this._textbox.onTextChange.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
    }
    getPropertyValue() {
      return this._textbox.getText();
    }
    setPropertyValue(v, fireEvents = true) {
      this._textbox.setText(v, fireEvents);
    }
    isEditing() {
      return this._textbox.hasFocus();
    }
    getTextBox() {
      return this._textbox;
    }
  };
  var PropertyCheckbox = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._cb = new CheckBox(this);
      this._cb.setShouldDrawBackground(false);
      this._cb.setPos(2, 1);
      this._cb.setTabable(true);
      this._cb.setKeyboardInputEnabled(true);
      this._cb.onCheckChanged.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
      this.setHeight(18);
    }
    getPropertyValue() {
      return this._cb.isChecked() ? "1" : "0";
    }
    setPropertyValue(v, _fireEvents = true) {
      const truthy = v === "1" || v === "true" || v === "TRUE" || v === "yes" || v === "YES";
      this._cb.setChecked(truthy);
    }
    isEditing() {
      return this._cb.hasFocus();
    }
    getCheckBox() {
      return this._cb;
    }
  };
  var PropertyComboBox = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._cb = new ComboBox(this);
      this._cb.dock(Pos.Fill);
      this._cb.setShouldDrawBackground(false);
      this._cb.setTabable(true);
      this._cb.setKeyboardInputEnabled(true);
      this._cb.onSelection.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
      this.setHeight(18);
    }
    getComboBox() {
      return this._cb;
    }
    getPropertyValue() {
      const item = this._cb.getSelectedItem();
      return item ? item.getName() : "";
    }
    setPropertyValue(v, fireEvents = true) {
      this._cb.selectItemByName(v, fireEvents);
    }
    isEditing() {
      return this._cb.hasFocus();
    }
  };
  var PropertyNumeric = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._stepper = new NumericUpDown(this);
      this._stepper.dock(Pos.Fill);
      this._stepper.setShouldDrawBackground(false);
      this._stepper.setTabable(true);
      this._stepper.setKeyboardInputEnabled(true);
      this._stepper.onChange.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
      this.setHeight(18);
    }
    getNumericUpDown() {
      return this._stepper;
    }
    getPropertyValue() {
      return String(this._stepper.getIntValue());
    }
    setPropertyValue(v, _fireEvents = true) {
      const n = parseInt(v, 10);
      if (Number.isFinite(n)) this._stepper.setIntValue(n);
    }
    isEditing() {
      return this._stepper.hasFocus();
    }
  };
  var PropertyRow = class extends Base {
    constructor(parent) {
      super(parent);
      this.onChange = new Signal();
      this._property = null;
      this._label = new Label(this);
      this._label.dock(Pos.Left);
      this._label.setAlignment(Pos.Left | Pos.CenterV);
      this._label.setMargin(margin(2, 0, 0, 0));
      this.setHeight(17);
    }
    getLabel() {
      return this._label;
    }
    getProperty() {
      return this._property;
    }
    setProperty(p) {
      this._property = p;
      if (p.parent !== this) p.setParent(this);
      p.dock(Pos.Fill);
      p.onChange.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = p.getPropertyValue();
        this.onChange.emit(info);
      });
    }
    isEditing() {
      return this._property ? this._property.isEditing() : false;
    }
    // =======================================================================
    // Layout — sync the label width to the parent Properties' splitter.
    // =======================================================================
    layout(skin) {
      super.layout(skin);
      const splitX = this.getParentSplitWidth();
      if (splitX !== null) {
        this._label.setWidth(splitX);
      }
    }
    // =======================================================================
    // Render — delegates to skin. The hover highlight fires when either
    // the row itself or its editor is hovered.
    // =======================================================================
    render(skin) {
      const editing = this.isEditing();
      const hovered = this.isHovered() || (this._property ? this._property.isHovered() : false);
      const splitX = this.getParentSplitWidth();
      skin.drawPropertyRow(this, splitX !== null ? splitX : this._label.width(), editing, hovered);
    }
    // Private helper — walks up to the owning Properties, if any, and
    // returns its splitter position. Structural check (via instanceof) is
    // fine here: Properties and PropertyRow live in the same module so
    // there's no circular import concern.
    getParentSplitWidth() {
      const p = this.parent;
      if (p instanceof Properties) return p.getSplitWidth();
      return null;
    }
  };
  var Properties = class extends Base {
    constructor(parent) {
      super(parent);
      this.onChange = new Signal();
      this._splitter = new SplitterBar(this);
      this._splitter.setPos(80, 0);
      this._splitter.setCursor(CursorType.SizeWE);
      this._splitter.setWidth(3);
      this._splitter.setShouldDrawBackground(false);
      this._splitter.setMouseInputEnabled(true);
      this._splitter.doNotIncludeInSize();
      this._splitter.onDragged.on(() => this.invalidateChildren());
    }
    getSplitWidth() {
      return this._splitter.x();
    }
    getSplitter() {
      return this._splitter;
    }
    // Convenience factory — creates a PropertyRow with a PropertyText
    // pre-populated with `value` and wires up the onChange signal.
    add(name, value = "") {
      const row = new PropertyRow(this);
      row.getLabel().setText(name);
      row.dock(Pos.Top);
      const prop = new PropertyText(row);
      prop.setPropertyValue(value, false);
      row.setProperty(prop);
      this.wireRow(row);
      this._splitter.bringToFront();
      return row;
    }
    // Raw version — caller supplies the PropertyBase instance. Use when
    // the property isn't a plain text field (PropertyCheckbox,
    // PropertyComboBox, PropertyColorSelector, ...). Mirrors GWEN's
    // `Properties::Add( text, prop, value )` so callers that pass a
    // value get the property's `onChange` fired with `bFireChangeEvents
    // = true`. PropertyColorSelector relies on that fire to repaint
    // its swatch from the value string.
    addRow(name, prop, value = "") {
      const row = new PropertyRow(this);
      row.getLabel().setText(name);
      row.dock(Pos.Top);
      if (prop.parent !== row) prop.setParent(row);
      row.setProperty(prop);
      prop.setPropertyValue(value, true);
      this.wireRow(row);
      this._splitter.bringToFront();
      return row;
    }
    wireRow(row) {
      row.onChange.on((e) => {
        const info = eventInfo();
        info.controlCaller = this;
        info.control = row;
        info.string = e.string;
        this.onChange.emit(info);
      });
    }
    // =======================================================================
    // Layout — height auto-fits the row stack. Without this the grid stays
    // at Base's 10×10 default whenever its parent doesn't pre-size it (e.g.
    // a Properties grid docked Top inside a PropertyTreeNode), which makes
    // every row clip out of view. Mirrors Properties.cpp:26 PostLayout.
    // =======================================================================
    postLayout(skin) {
      super.postLayout(skin);
      if (this.sizeToChildren(false, true)) this.invalidateParent();
      this._splitter.setSize(3, this.height());
    }
  };
  var ColourButton = class extends Button {
    constructor(parent) {
      super(parent);
      this._color = color(255, 255, 255, 255);
      this.setWidth(20);
      this.setShouldDrawBackground(false);
      this.setText("");
    }
    setButtonColor(c) {
      this._color = c;
      this.redraw();
    }
    render(skin) {
      skin.renderer.setDrawColor(this._color);
      skin.renderer.drawFilledRect(this.getRenderBounds());
    }
  };
  var PropertyColorSelector = class extends PropertyText {
    constructor(parent) {
      super(parent);
      this._button = new ColourButton(this);
      this._button.dock(Pos.Right);
      this._button.setMargin(margin(1, 1, 1, 2));
      this._button.setWidth(20);
      this._button.onPress.on(() => this.onButtonPress());
      this._textbox.onTextChange.on(() => this.updateSwatch());
      this.updateSwatch();
    }
    // Open a transient Menu as the popover host for the HSV picker. Menu
    // gives us auto-hide-on-outside-click and the correct z-ordering; the
    // `deleteOnClose` flag ensures the picker gets torn down cleanly.
    onButtonPress() {
      const canvas = this.getCanvas();
      if (!canvas) return;
      const menu = new Menu(canvas);
      menu.setSize(256, 180);
      menu.setDeleteOnClose(true);
      menu.setDisableIconMargin(true);
      const picker = new HSVColorPicker(menu);
      picker.setSize(256, 150);
      picker.setColor(this.parseColor(), false, true);
      picker.onColorChanged.on(() => {
        const c = picker.getColor();
        this.setPropertyValue(`${c.r} ${c.g} ${c.b}`, true);
      });
      const canvasPos = this._button.localPosToCanvas({ x: 0, y: this._button.height() });
      menu.open(canvasPos);
      menu.bringToFront();
    }
    // Parse the canonical "R G B" string. Missing/invalid channels default
    // to 255 so an empty textbox renders as white rather than black.
    parseColor() {
      const parts = this.getPropertyValue().split(/\s+/).map((s) => parseInt(s, 10));
      const r = Number.isFinite(parts[0]) ? parts[0] : 255;
      const g = Number.isFinite(parts[1]) ? parts[1] : 255;
      const b = Number.isFinite(parts[2]) ? parts[2] : 255;
      return color(r, g, b, 255);
    }
    updateSwatch() {
      this._button.setButtonColor(this.parseColor());
    }
    getColorButton() {
      return this._button;
    }
  };
  var PropertyFile = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._picker = new FilePicker(this);
      this._picker.dock(Pos.Fill);
      this._picker.onFileChanged.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
      this.setHeight(22);
    }
    getFilePicker() {
      return this._picker;
    }
    /** Convenience — same as `getFilePicker().getFile()`. */
    getFile() {
      return this._picker.getFile();
    }
    getPropertyValue() {
      return this._picker.getFileName();
    }
    setPropertyValue(v, _fireEvents = true) {
      this._picker.setValue(v);
    }
    isEditing() {
      return false;
    }
  };
  var PropertyFolder = class extends PropertyBase {
    constructor(parent) {
      super(parent);
      this._picker = new FolderPicker(this);
      this._picker.dock(Pos.Fill);
      this._picker.onFolderChanged.on(() => {
        const info = eventInfo();
        info.controlCaller = this;
        info.string = this.getPropertyValue();
        this.onChange.emit(info);
      });
      this.setHeight(18);
    }
    getFolderPicker() {
      return this._picker;
    }
    getPropertyValue() {
      return this._picker.getFolder();
    }
    setPropertyValue(v, _fireEvents = true) {
      this._picker.setFolder(v);
    }
    isEditing() {
      return false;
    }
  };

  // src/controls/PropertyTree.ts
  var PropertyTreeNode = class extends TreeNode {
    constructor(parent) {
      super(parent);
      this.enableInnerPanelRouting();
    }
    render(skin) {
      super.render(skin);
      const inner = this._innerPanelChildren;
      skin.drawPropertyTreeNode(this, inner.x(), inner.y());
    }
  };
  var PropertyTree = class extends TreeControl {
    constructor(parent) {
      super(parent);
    }
    /**
     * Creates a collapsible group headed by `name` and returns the
     * Properties grid that owns the rows inside it.
     */
    add(name) {
      const host = this.getScroller().getInnerPanel() ?? this;
      const node = new PropertyTreeNode(host);
      node.setText(name);
      node.dock(Pos.Top);
      const props = new Properties(node);
      props.dock(Pos.Top);
      return props;
    }
    /**
     * Walks the top-level nodes and returns the Properties grid under the
     * one whose title matches `name`, or null if no such node exists.
     */
    findProperties(name) {
      const inner = this.getScroller().getInnerPanel();
      if (!inner) return null;
      for (const n of inner.children) {
        if (n instanceof PropertyTreeNode && n.getText() === name) {
          for (const c of n.children) {
            if (c instanceof Properties) return c;
          }
        }
      }
      return null;
    }
  };

  // src/index.ts
  var VERSION = "0.0.1";
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=gwen.js.map
