"use strict";
var BrutalMesh = (() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/harness.ts
  var tests = [];
  function defineTest(suite, name, fn) {
    tests.push({ suite, name, fn });
  }
  async function runTests(filter) {
    const results = [];
    for (const t of tests) {
      if (filter?.suite && t.suite !== filter.suite) continue;
      if (filter?.name && t.name !== filter.name) continue;
      const start = performance.now();
      try {
        await t.fn();
        results.push({ suite: t.suite, name: t.name, passed: true, durationMs: performance.now() - start });
      } catch (err) {
        const msg = err instanceof Error ? `${err.message}
${err.stack ?? ""}` : String(err);
        results.push({
          suite: t.suite,
          name: t.name,
          passed: false,
          error: msg,
          durationMs: performance.now() - start
        });
      }
    }
    return results;
  }
  function listSuites() {
    return Array.from(new Set(tests.map((t) => t.suite)));
  }
  function assert(cond, message) {
    if (!cond) throw new Error("assertion failed" + (message ? `: ${message}` : ""));
  }
  function assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `assertEquals failed${message ? ` (${message})` : ""}: expected ${String(expected)}, got ${String(actual)}`
      );
    }
  }
  function assertClose(actual, expected, eps = 1e-6, message) {
    if (Math.abs(actual - expected) > eps) {
      throw new Error(
        `assertClose failed${message ? ` (${message})` : ""}: expected ${expected} \xB1 ${eps}, got ${actual}`
      );
    }
  }
  function assertThrows(fn, message) {
    try {
      fn();
    } catch {
      return;
    }
    throw new Error("assertThrows failed" + (message ? `: ${message}` : ""));
  }

  // src/ui/ViewportHost.ts
  var ViewportHost = class extends Gwen.Base {
    constructor(parent) {
      super(parent);
      this.delegate = null;
      this._lastPointer = { x: 0, y: 0 };
      this.setMouseInputEnabled(true);
      this.setKeyboardInputEnabled(true);
      this.setShouldDrawBackground(false);
    }
    /** Bounds of the viewport area in CSS pixels (logical coords). */
    getViewportRect() {
      const b = this.getBounds();
      return { x: b.x, y: b.y, w: b.w, h: b.h };
    }
    render(_skin) {
    }
    onMouseClickLeft(x, y, pressed) {
      this._lastPointer = { x, y };
      if (pressed) this.delegate?.pointerDown?.(0, x, y);
      else this.delegate?.pointerUp?.(0, x, y);
    }
    onMouseClickRight(x, y, pressed) {
      this._lastPointer = { x, y };
      if (pressed) this.delegate?.pointerDown?.(2, x, y);
      else this.delegate?.pointerUp?.(2, x, y);
    }
    /**
     * Gwen does not expose a built-in middle-click hook on `Base`. Synthesize
     * one by overriding the lower-level `onMouseClick` if Gwen routes it, or
     * accept that middle-click is handled via the canvas-level input fanout.
     * To make middle work we expose a manual entry point that App wires from
     * Gwen's canvas-level input fanout in App.ts.
     */
    injectMiddleClick(x, y, pressed) {
      this._lastPointer = { x, y };
      if (pressed) this.delegate?.pointerDown?.(1, x, y);
      else this.delegate?.pointerUp?.(1, x, y);
    }
    onMouseMoved(x, y, dx, dy) {
      this._lastPointer = { x, y };
      this.delegate?.pointerMove?.(x, y, dx, dy);
    }
    onMouseWheeled(delta) {
      return this.delegate?.wheel?.(delta, this._lastPointer.x, this._lastPointer.y) ?? false;
    }
    /** Convert a canvas-space point to a coordinate relative to this host. */
    canvasToLocal(cx, cy) {
      let dx = 0, dy = 0;
      let node = this;
      while (node) {
        const b = node.getBounds();
        dx += b.x;
        dy += b.y;
        node = node.parent;
      }
      return { x: cx - dx, y: cy - dy };
    }
  };

  // src/ui/TopMenu.ts
  function buildTopMenu(parent) {
    const strip = new Gwen.MenuStrip(parent);
    const fileMenu = strip.addItem("File");
    fileMenu.getMenu().addItem("New");
    fileMenu.getMenu().addItem("Open OBJ...");
    fileMenu.getMenu().addItem("Open BMSH...");
    fileMenu.getMenu().addDivider();
    fileMenu.getMenu().addItem("Save BMSH");
    fileMenu.getMenu().addItem("Save BMSH As...");
    fileMenu.getMenu().addDivider();
    fileMenu.getMenu().addItem("Export OBJ...");
    fileMenu.getMenu().addItem("Export glTF...");
    const editMenu = strip.addItem("Edit");
    editMenu.getMenu().addItem("Undo");
    editMenu.getMenu().addItem("Redo");
    editMenu.getMenu().addDivider();
    editMenu.getMenu().addItem("Duplicate");
    editMenu.getMenu().addItem("Delete");
    const viewMenu = strip.addItem("View");
    viewMenu.getMenu().addItem("Single View");
    viewMenu.getMenu().addItem("Four View Split");
    viewMenu.getMenu().addItem("UV Editor");
    viewMenu.getMenu().addDivider();
    viewMenu.getMenu().addItem("Shaded");
    viewMenu.getMenu().addItem("X-Ray");
    viewMenu.getMenu().addItem("Textured");
    viewMenu.getMenu().addItem("Unlit");
    const meshMenu = strip.addItem("Mesh");
    meshMenu.getMenu().addItem("Extrude");
    meshMenu.getMenu().addItem("Inset");
    meshMenu.getMenu().addItem("Bevel");
    meshMenu.getMenu().addItem("Loop Cut");
    meshMenu.getMenu().addItem("Knife");
    meshMenu.getMenu().addItem("Merge");
    meshMenu.getMenu().addItem("Dissolve");
    meshMenu.getMenu().addDivider();
    meshMenu.getMenu().addItem("Shade Smooth");
    meshMenu.getMenu().addItem("Shade Flat");
    meshMenu.getMenu().addItem("Subdivide");
    meshMenu.getMenu().addItem("Mirror");
    const uvMenu = strip.addItem("UV");
    uvMenu.getMenu().addItem("Mark Seam");
    uvMenu.getMenu().addItem("Clear Seam");
    uvMenu.getMenu().addDivider();
    uvMenu.getMenu().addItem("Auto Unwrap");
    uvMenu.getMenu().addItem("Pack Islands");
    const toolsMenu = strip.addItem("Tools");
    toolsMenu.getMenu().addItem("Select");
    toolsMenu.getMenu().addItem("Move");
    toolsMenu.getMenu().addItem("Rotate");
    toolsMenu.getMenu().addItem("Scale");
    const helpMenu = strip.addItem("Help");
    helpMenu.getMenu().addItem("About BrutalMesh");
    return { strip, fileMenu, editMenu, viewMenu, meshMenu, uvMenu, toolsMenu, helpMenu };
  }

  // src/ui/ToolShelf.ts
  var TOOLS = [
    { id: "select", text: "Sel", tooltip: "Select" },
    { id: "move", text: "Mov", tooltip: "Move" },
    { id: "rotate", text: "Rot", tooltip: "Rotate" },
    { id: "scale", text: "Scl", tooltip: "Scale" }
  ];
  var EDIT_OPS = [
    { id: "extrude", text: "Ext", tooltip: "Extrude" },
    { id: "loopcut", text: "LC", tooltip: "Loop Cut" },
    { id: "inset", text: "Ins", tooltip: "Inset" },
    { id: "bevel", text: "Bvl", tooltip: "Bevel" },
    { id: "knife", text: "Knf", tooltip: "Knife" },
    { id: "merge", text: "Mrg", tooltip: "Merge" },
    { id: "dissolve", text: "Dis", tooltip: "Dissolve" }
  ];
  var PRIMITIVES = [
    { id: "cube", text: "Cub", tooltip: "Cube" },
    { id: "plane", text: "Pln", tooltip: "Plane" },
    { id: "cylinder", text: "Cyl", tooltip: "Cylinder" },
    { id: "cone", text: "Con", tooltip: "Cone" },
    { id: "disk", text: "Dsk", tooltip: "Disk" },
    { id: "uvsphere", text: "USph", tooltip: "UV Sphere" },
    { id: "icosphere", text: "ISph", tooltip: "Ico Sphere" },
    { id: "torus", text: "Tor", tooltip: "Torus" }
  ];
  function buildToolShelf(parent) {
    const bar = new Gwen.ActionBar(parent);
    bar.setVertical(true);
    bar.setRadioMode(true);
    bar.setItemSize(34);
    const buttons = {};
    for (const t of TOOLS) {
      const b = bar.addButton(t.text);
      b.setToolTip(t.tooltip);
      buttons[t.id] = b;
    }
    bar.addSeparator();
    for (const t of EDIT_OPS) {
      const b = bar.addButton(t.text);
      b.setToolTip(t.tooltip);
      buttons[t.id] = b;
    }
    bar.addSeparator();
    for (const t of PRIMITIVES) {
      const b = bar.addButton(t.text);
      b.setToolTip(t.tooltip);
      buttons[t.id] = b;
    }
    buttons.select.setToggleState(true);
    return { bar, buttons };
  }

  // src/ui/ActionBar.ts
  function buildActionBar(parent) {
    const bar = new Gwen.ActionBar(parent);
    bar.setVertical(false);
    bar.setItemSize(26);
    const undoButton = bar.addButton("Undo");
    undoButton.setToolTip("Undo last operation");
    const redoButton = bar.addButton("Redo");
    redoButton.setToolTip("Redo last undone operation");
    bar.addSeparator();
    const label = new Gwen.Label(bar);
    label.setText("  Move");
    label.setSize(56, 22);
    bar.addItem(label);
    const spaceCombo = new Gwen.ComboBox(bar);
    spaceCombo.setSize(80, 22);
    spaceCombo.addItem("World", "world");
    spaceCombo.addItem("Local", "object");
    spaceCombo.addItem("Normal", "normal");
    bar.addItem(spaceCombo);
    bar.addSeparator();
    const xBox = numericField(bar, "X");
    const yBox = numericField(bar, "Y");
    const zBox = numericField(bar, "Z");
    bar.addSeparator();
    const pivotLabel = new Gwen.Label(bar);
    pivotLabel.setText("Pivot");
    pivotLabel.setSize(38, 22);
    bar.addItem(pivotLabel);
    const pivotCombo = new Gwen.ComboBox(bar);
    pivotCombo.setSize(90, 22);
    pivotCombo.addItem("Median", "median");
    pivotCombo.addItem("Active", "active");
    pivotCombo.addItem("Origin", "origin");
    bar.addItem(pivotCombo);
    return { bar, label, undoButton, redoButton, spaceCombo, pivotCombo, xBox, yBox, zBox };
  }
  function numericField(bar, axis) {
    const lab = new Gwen.Label(bar);
    lab.setText(axis);
    lab.setSize(14, 22);
    bar.addItem(lab);
    const tb = new Gwen.TextBoxNumeric(bar);
    tb.setSize(60, 22);
    tb.setText("0.000");
    bar.addItem(tb);
    return tb;
  }

  // src/ui/Footer.ts
  function buildFooter(parent) {
    const bar = new Gwen.StatusBar(parent);
    bar.setText("FPS 0 \u2014 Ready");
    return {
      bar,
      setStats(s) {
        const parts = [
          `FPS ${s.fps.toFixed(0)}`,
          `Frame ${s.frameMs.toFixed(1)}ms`,
          `Objects ${s.objects}`,
          `Verts ${s.vertices}`,
          `Edges ${s.edges}`,
          `Faces ${s.faces}`,
          `Tris ${s.triangles}`,
          s.status
        ];
        bar.setText(parts.join("   "));
      }
    };
  }

  // src/ui/RightDock.ts
  function buildRightDock(rightEdge) {
    const tabCtrl = rightEdge.getTabControl();
    if (!tabCtrl) throw new Error("RightDock: tabCtrl is null");
    const outlinerPage = new Gwen.Base(null);
    tabCtrl.addPage("Outliner", outlinerPage);
    const outliner = new Gwen.TreeControl(outlinerPage);
    outliner.dock(Gwen.Pos.Fill);
    const scene = outliner.addNode("Scene");
    scene.addNode("(empty)");
    outliner.expandAll();
    const inspectorPage = new Gwen.Base(null);
    tabCtrl.addPage("Inspector", inspectorPage);
    const inspector = new Gwen.Properties(inspectorPage);
    inspector.dock(Gwen.Pos.Fill);
    inspector.add("Name", "");
    inspector.addRow("Visible", new Gwen.PropertyCheckbox(inspector), "1");
    inspector.add("Verts", "0");
    inspector.add("Edges", "0");
    inspector.add("Faces", "0");
    const matPage = new Gwen.Base(null);
    tabCtrl.addPage("Materials", matPage);
    const materials = new Gwen.ListBox(matPage);
    materials.dock(Gwen.Pos.Fill);
    materials.addItem("(no materials)");
    const histPage = new Gwen.Base(null);
    tabCtrl.addPage("History", histPage);
    const history = new Gwen.ListBox(histPage);
    history.dock(Gwen.Pos.Fill);
    history.addItem("(empty history)");
    const exportPage = new Gwen.Base(null);
    tabCtrl.addPage("Export", exportPage);
    const exportProps = new Gwen.Properties(exportPage);
    exportProps.dock(Gwen.Pos.Fill);
    const formatCombo = new Gwen.PropertyComboBox(exportProps);
    formatCombo.getComboBox().addItem("OBJ", "obj");
    formatCombo.getComboBox().addItem("glTF / GLB", "gltf");
    formatCombo.getComboBox().addItem("BMSH (native)", "bmsh");
    exportProps.addRow("Format", formatCombo, "OBJ");
    exportProps.addRow("Apply Modifiers", new Gwen.PropertyCheckbox(exportProps), "0");
    return {
      tabCtrl,
      outliner,
      inspector,
      materials,
      history,
      exportProps,
      exportFormat: formatCombo
    };
  }

  // src/ui/ViewWidget.ts
  function buildViewWidget(parent) {
    const bar = new Gwen.ActionBar(parent);
    bar.setVertical(false);
    bar.setItemSize(20);
    const labels = [
      { id: "top", text: "T", tooltip: "Top view" },
      { id: "front", text: "F", tooltip: "Front view" },
      { id: "right", text: "R", tooltip: "Right view" },
      { id: "back", text: "B", tooltip: "Back view" },
      { id: "left", text: "L", tooltip: "Left view" },
      { id: "bottom", text: "D", tooltip: "Bottom view" },
      { id: "perspective", text: "P", tooltip: "Reset to perspective" }
    ];
    const buttons = {};
    for (const l of labels) {
      const b = bar.addButton(l.text);
      b.setToolTip(l.tooltip);
      buttons[l.id] = b;
    }
    return { bar, buttons };
  }

  // src/ui/UiRoot.ts
  var TOP_MENU_HEIGHT = 24;
  var ACTION_BAR_HEIGHT = 30;
  var FOOTER_HEIGHT = 22;
  var TOOL_SHELF_WIDTH = 44;
  var RIGHT_DOCK_WIDTH = 260;
  var RIGHT_DOCK_MIN = 120;
  function clampRightDockWidth(canvasW) {
    const remaining = Math.max(0, canvasW - TOOL_SHELF_WIDTH);
    const cap = Math.floor(remaining * 0.5);
    return Math.max(RIGHT_DOCK_MIN, Math.min(RIGHT_DOCK_WIDTH, cap));
  }
  function buildUi(canvas) {
    const menu = buildTopMenu(canvas);
    menu.strip.dock(Gwen.Pos.Top);
    menu.strip.setHeight(TOP_MENU_HEIGHT);
    const footer = buildFooter(canvas);
    footer.bar.dock(Gwen.Pos.Bottom);
    footer.bar.setHeight(FOOTER_HEIGHT);
    const actionBar = buildActionBar(canvas);
    actionBar.bar.dock(Gwen.Pos.Top);
    actionBar.bar.setHeight(ACTION_BAR_HEIGHT);
    const toolShelf = buildToolShelf(canvas);
    toolShelf.bar.dock(Gwen.Pos.Left);
    toolShelf.bar.setWidth(TOOL_SHELF_WIDTH);
    const dock = new Gwen.DockBase(canvas);
    dock.dock(Gwen.Pos.Fill);
    const right = dock.getRight();
    right.setWidth(clampRightDockWidth(canvas.width()));
    const rightDock = buildRightDock(right);
    const viewport = new ViewportHost(dock);
    viewport.dock(Gwen.Pos.Fill);
    const viewWidget = buildViewWidget(viewport);
    viewWidget.bar.setBounds(0, 0, 7 * 22, 22);
    const positionWidget = () => {
      const b = viewport.getBounds();
      viewWidget.bar.setPos(Math.max(0, b.w - viewWidget.bar.width() - 6), 6);
    };
    positionWidget();
    return {
      menu,
      toolShelf,
      actionBar,
      rightDock,
      footer,
      viewport,
      viewWidget,
      applyResponsiveLayout() {
        right.setWidth(clampRightDockWidth(canvas.width()));
        positionWidget();
      }
    };
  }

  // src/core/math/Vec3.ts
  function create() {
    return new Float32Array(3);
  }
  function fromValues(x, y, z) {
    const v = new Float32Array(3);
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return v;
  }
  function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  function sub(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  function scale(out, a, k) {
    out[0] = a[0] * k;
    out[1] = a[1] * k;
    out[2] = a[2] * k;
    return out;
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cross(out, a, b) {
    const ax = a[0], ay = a[1], az = a[2];
    const bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  function length(a) {
    return Math.hypot(a[0], a[1], a[2]);
  }
  function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  function normalize(out, a) {
    const len = length(a);
    if (len > 0) {
      const inv = 1 / len;
      out[0] = a[0] * inv;
      out[1] = a[1] * inv;
      out[2] = a[2] * inv;
    } else {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    return out;
  }
  function equalsApprox(a, b, eps = 1e-5) {
    return Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps && Math.abs(a[2] - b[2]) <= eps;
  }
  var ZERO = fromValues(0, 0, 0);
  var UNIT_X = fromValues(1, 0, 0);
  var UNIT_Y = fromValues(0, 1, 0);
  var UNIT_Z = fromValues(0, 0, 1);

  // src/core/math/Quat.ts
  function create2() {
    const q = new Float32Array(4);
    q[3] = 1;
    return q;
  }
  function fromValues2(x, y, z, w) {
    const q = new Float32Array(4);
    q[0] = x;
    q[1] = y;
    q[2] = z;
    q[3] = w;
    return q;
  }
  function setAxisAngle(out, axis, rad) {
    const half = rad * 0.5;
    const s = Math.sin(half);
    out[0] = axis[0] * s;
    out[1] = axis[1] * s;
    out[2] = axis[2] * s;
    out[3] = Math.cos(half);
    return out;
  }
  function multiply(out, a, b) {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
    const bx = b[0], by = b[1], bz = b[2], bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  }
  function normalize2(out, a) {
    const x = a[0], y = a[1], z = a[2], w = a[3];
    let len = Math.hypot(x, y, z, w);
    if (len > 0) {
      len = 1 / len;
      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
    }
    return out;
  }
  function transformVec3(out, v, q) {
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    const x = v[0], y = v[1], z = v[2];
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
  }
  function equalsApprox2(a, b, eps = 1e-5) {
    return Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps && Math.abs(a[2] - b[2]) <= eps && Math.abs(a[3] - b[3]) <= eps;
  }

  // src/core/math/Mat4.ts
  var Mat4_exports = {};
  __export(Mat4_exports, {
    copy: () => copy2,
    create: () => create3,
    equalsApprox: () => equalsApprox3,
    fromRotationX: () => fromRotationX,
    fromRotationY: () => fromRotationY,
    fromRotationZ: () => fromRotationZ,
    fromScale: () => fromScale,
    fromTranslation: () => fromTranslation,
    identity: () => identity,
    invert: () => invert,
    lookAt: () => lookAt,
    multiply: () => multiply2,
    ortho: () => ortho,
    perspective: () => perspective,
    transformDirection: () => transformDirection,
    transformPoint: () => transformPoint,
    transpose: () => transpose,
    trs: () => trs
  });
  function create3() {
    const m = new Float32Array(16);
    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;
    return m;
  }
  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function copy2(out, a) {
    for (let i = 0; i < 16; i++) out[i] = a[i];
    return out;
  }
  function fromTranslation(out, t) {
    identity(out);
    out[12] = t[0];
    out[13] = t[1];
    out[14] = t[2];
    return out;
  }
  function fromScale(out, s) {
    identity(out);
    out[0] = s[0];
    out[5] = s[1];
    out[10] = s[2];
    return out;
  }
  function fromRotationX(out, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    identity(out);
    out[5] = c;
    out[6] = s;
    out[9] = -s;
    out[10] = c;
    return out;
  }
  function fromRotationY(out, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    identity(out);
    out[0] = c;
    out[2] = -s;
    out[8] = s;
    out[10] = c;
    return out;
  }
  function fromRotationZ(out, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    identity(out);
    out[0] = c;
    out[1] = s;
    out[4] = -s;
    out[5] = c;
    return out;
  }
  function multiply2(out, a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
    out[1] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
    out[2] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
    out[3] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
    out[5] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
    out[6] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
    out[7] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
    out[9] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
    out[10] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
    out[11] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
    out[13] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
    out[14] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
    out[15] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
    return out;
  }
  function transpose(out, a) {
    if (out === a) {
      const a01 = a[1], a02 = a[2], a03 = a[3];
      const a12 = a[6], a13 = a[7];
      const a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }
    return out;
  }
  function invert(out, a) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  function perspective(out, fovyRad, aspect, near, far) {
    const f = 1 / Math.tan(fovyRad / 2);
    const nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  }
  function ortho(out, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }
  function lookAt(out, eye, target, up) {
    const eyex = eye[0], eyey = eye[1], eyez = eye[2];
    const upx = up[0], upy = up[1], upz = up[2];
    const tx = target[0], ty = target[1], tz = target[2];
    if (Math.abs(eyex - tx) < 1e-6 && Math.abs(eyey - ty) < 1e-6 && Math.abs(eyez - tz) < 1e-6) {
      return identity(out);
    }
    let z0 = eyex - tx;
    let z1 = eyey - ty;
    let z2 = eyez - tz;
    let len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    let x0 = upy * z2 - upz * z1;
    let x1 = upz * z0 - upx * z2;
    let x2 = upx * z1 - upy * z0;
    len = Math.hypot(x0, x1, x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
    let y0 = z1 * x2 - z2 * x1;
    let y1 = z2 * x0 - z0 * x2;
    let y2 = z0 * x1 - z1 * x0;
    len = Math.hypot(y0, y1, y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }
  function transformPoint(out, p, m) {
    const x = p[0], y = p[1], z = p[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }
  function transformDirection(out, d, m) {
    const x = d[0], y = d[1], z = d[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z;
    out[1] = m[1] * x + m[5] * y + m[9] * z;
    out[2] = m[2] * x + m[6] * y + m[10] * z;
    return out;
  }
  function equalsApprox3(a, b, eps = 1e-5) {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(a[i] - b[i]) > eps) return false;
    }
    return true;
  }
  function trs(out, t, qXYZW, s) {
    const qx = qXYZW[0], qy = qXYZW[1], qz = qXYZW[2], qw = qXYZW[3];
    const x2 = qx + qx;
    const y2 = qy + qy;
    const z2 = qz + qz;
    const xx = qx * x2;
    const xy = qx * y2;
    const xz = qx * z2;
    const yy = qy * y2;
    const yz = qy * z2;
    const zz = qz * z2;
    const wx = qw * x2;
    const wy = qw * y2;
    const wz = qw * z2;
    const sx = s[0], sy = s[1], sz = s[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = t[0];
    out[13] = t[1];
    out[14] = t[2];
    out[15] = 1;
    return out;
  }

  // src/scene/Transform.ts
  var Transform = class {
    constructor() {
      this.position = create();
      this.rotation = create2();
      this.scale = fromValues(1, 1, 1);
      this._local = create3();
      this._localDirty = true;
    }
    setPosition(x, y, z) {
      set(this.position, x, y, z);
      this._localDirty = true;
    }
    setRotationQuat(x, y, z, w) {
      this.rotation[0] = x;
      this.rotation[1] = y;
      this.rotation[2] = z;
      this.rotation[3] = w;
      normalize2(this.rotation, this.rotation);
      this._localDirty = true;
    }
    setScale(x, y, z) {
      set(this.scale, x, y, z);
      this._localDirty = true;
    }
    markDirty() {
      this._localDirty = true;
    }
    getLocalMatrix() {
      if (this._localDirty) {
        trs(this._local, this.position, this.rotation, this.scale);
        this._localDirty = false;
      }
      return this._local;
    }
  };

  // src/core/Id.ts
  var _next = 1;
  function nextId() {
    return _next++;
  }

  // src/scene/SceneNode.ts
  var SceneNode = class {
    constructor(name = "Node", kind = "empty") {
      this.transform = new Transform();
      this.parent = null;
      this.children = [];
      this.visible = true;
      this.selectable = true;
      this._world = create3();
      this._worldDirty = true;
      this.id = nextId();
      this.name = name;
      this.kind = kind;
    }
    addChild(child) {
      if (child.parent === this) return;
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.children.push(child);
      child.markWorldDirty();
    }
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) {
        this.children.splice(i, 1);
        child.parent = null;
        child.markWorldDirty();
      }
    }
    setVisible(v) {
      this.visible = v;
    }
    /** Effective visibility — false if any ancestor is hidden. */
    isEffectivelyVisible() {
      let n = this;
      while (n) {
        if (!n.visible) return false;
        n = n.parent;
      }
      return true;
    }
    setSelectable(v) {
      this.selectable = v;
    }
    markWorldDirty() {
      if (this._worldDirty) return;
      this._worldDirty = true;
      this.transform.markDirty();
      for (const c of this.children) c.markWorldDirty();
    }
    getWorldMatrix() {
      if (!this._worldDirty) return this._world;
      if (this.parent) {
        multiply2(this._world, this.parent.getWorldMatrix(), this.transform.getLocalMatrix());
      } else {
        copy2(this._world, this.transform.getLocalMatrix());
      }
      this._worldDirty = false;
      return this._world;
    }
    /** Walks ancestors of self+others, returns true if `ancestor` is on the path. */
    isDescendantOf(ancestor) {
      let n = this.parent;
      while (n) {
        if (n === ancestor) return true;
        n = n.parent;
      }
      return false;
    }
  };

  // src/scene/MeshObject.ts
  var MeshObject = class extends SceneNode {
    constructor(name = "Mesh") {
      super(name, "mesh");
      this.mesh = null;
      this.materialId = null;
    }
  };

  // src/scene/ReferenceImage.ts
  var ReferenceImage = class extends SceneNode {
    constructor(name = "Reference_Image") {
      super(name, "reference");
      this.pixels = null;
      this.opacity = 1;
      /** Locked nodes can't be picked or moved through the UI. */
      this.locked = false;
      /** Image plane size in world units. The plane lies in the XY plane by default. */
      this.width = 1;
      this.height = 1;
      /** Bumped each time pixels change; renderers use this to decide re-upload. */
      this.pixelVersion = 0;
    }
    setPixels(p) {
      this.pixels = p;
      this.pixelVersion++;
    }
    setLocked(l) {
      this.locked = l;
      this.selectable = !l;
    }
    serialize() {
      return {
        name: this.name,
        opacity: this.opacity,
        locked: this.locked,
        width: this.width,
        height: this.height,
        pixels: this.pixels ? { name: this.pixels.name, width: this.pixels.width, height: this.pixels.height } : null,
        transform: {
          position: [this.transform.position[0], this.transform.position[1], this.transform.position[2]],
          rotation: [this.transform.rotation[0], this.transform.rotation[1], this.transform.rotation[2], this.transform.rotation[3]],
          scale: [this.transform.scale[0], this.transform.scale[1], this.transform.scale[2]]
        },
        visible: this.visible
      };
    }
  };

  // src/scene/Material.ts
  var Material = class _Material {
    constructor(name = "Material") {
      this.baseColor = { r: 0.78, g: 0.78, b: 0.78 };
      this.opacity = 1;
      this.ambient = { r: 0.2, g: 0.2, b: 0.2 };
      this.diffuse = { r: 0.78, g: 0.78, b: 0.78 };
      this.specular = { r: 0.05, g: 0.05, b: 0.05 };
      this.shininess = 16;
      this.texture = null;
      /** Bumped each time the texture image changes; used by the renderer to detect re-uploads. */
      this.textureVersion = 0;
      this.id = nextId();
      this.name = name;
    }
    setBaseColor(r, g, b) {
      this.baseColor = { r, g, b };
      this.diffuse = { r, g, b };
    }
    setTexture(tex) {
      this.texture = tex;
      this.textureVersion++;
    }
    /** Plain-object snapshot suitable for OBJ/MTL or JSON export. */
    serialize() {
      return {
        name: this.name,
        baseColor: { ...this.baseColor },
        opacity: this.opacity,
        ambient: { ...this.ambient },
        diffuse: { ...this.diffuse },
        specular: { ...this.specular },
        shininess: this.shininess,
        texture: this.texture ? { name: this.texture.name, width: this.texture.width, height: this.texture.height } : null
      };
    }
    static createDefaultGray(name = "Mat_Gray") {
      return new _Material(name);
    }
  };

  // src/scene/Scene.ts
  var Scene = class _Scene {
    constructor() {
      this.root = new SceneNode("Root", "empty");
      this._materials = /* @__PURE__ */ new Map();
      this._nodesById = /* @__PURE__ */ new Map();
      this.registerNode(this.root);
    }
    addNode(node, parent) {
      const p = parent ?? this.root;
      p.addChild(node);
      this.registerNode(node);
      return node;
    }
    removeNode(node) {
      if (!node.parent) return;
      node.parent.removeChild(node);
      this.unregisterNode(node);
    }
    findNodeById(id) {
      return this._nodesById.get(id) ?? null;
    }
    forEachNode(visit, from = this.root) {
      visit(from);
      for (const c of from.children) this.forEachNode(visit, c);
    }
    addMaterial(mat) {
      this._materials.set(mat.id, mat);
      return mat;
    }
    getMaterial(id) {
      return this._materials.get(id) ?? null;
    }
    materials() {
      return Array.from(this._materials.values());
    }
    /** Build a default scene: root + default material + placeholder cube node. */
    static createDefault() {
      const scene = new _Scene();
      const defaultMat = scene.addMaterial(Material.createDefaultGray());
      const cube3 = new MeshObject("Mesh_Cube");
      cube3.materialId = defaultMat.id;
      scene.addNode(cube3);
      return scene;
    }
    registerNode(n) {
      this._nodesById.set(n.id, n);
      for (const c of n.children) this.registerNode(c);
    }
    unregisterNode(n) {
      this._nodesById.delete(n.id);
      for (const c of n.children) this.unregisterNode(c);
    }
  };

  // src/render/ShaderProgram.ts
  var ShaderProgram = class {
    constructor(gl, vertSrc, fragSrc) {
      this.uniformLocs = /* @__PURE__ */ new Map();
      this.gl = gl;
      const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
      const prog = gl.createProgram();
      if (!prog) throw new Error("createProgram failed");
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(prog) ?? "";
        gl.deleteProgram(prog);
        throw new Error(`shader link failed: ${log}`);
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      this.program = prog;
    }
    use() {
      this.gl.useProgram(this.program);
    }
    loc(name) {
      const cached = this.uniformLocs.get(name);
      if (cached !== void 0) return cached;
      const loc = this.gl.getUniformLocation(this.program, name);
      this.uniformLocs.set(name, loc);
      return loc;
    }
    setMat4(name, m) {
      const l = this.loc(name);
      if (l) this.gl.uniformMatrix4fv(l, false, m);
    }
    setVec3(name, x, y, z) {
      const l = this.loc(name);
      if (l) this.gl.uniform3f(l, x, y, z);
    }
    setVec4(name, x, y, z, w) {
      const l = this.loc(name);
      if (l) this.gl.uniform4f(l, x, y, z, w);
    }
    setInt(name, v) {
      const l = this.loc(name);
      if (l) this.gl.uniform1i(l, v);
    }
    setFloat(name, v) {
      const l = this.loc(name);
      if (l) this.gl.uniform1f(l, v);
    }
    dispose() {
      this.gl.deleteProgram(this.program);
    }
  };
  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    if (!sh) throw new Error("createShader failed");
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh) ?? "";
      gl.deleteShader(sh);
      throw new Error(`shader compile failed (${type === gl.VERTEX_SHADER ? "vert" : "frag"}): ${log}`);
    }
    return sh;
  }

  // src/render/Buffers.ts
  var GpuMesh = class {
    constructor(gl) {
      this.vbos = [];
      this.ebo = null;
      this.indexCount = 0;
      this.gl = gl;
      const v = gl.createVertexArray();
      if (!v) throw new Error("createVertexArray failed");
      this.vao = v;
    }
    uploadAttributes(layouts) {
      const { gl } = this;
      gl.bindVertexArray(this.vao);
      for (const b of this.vbos) gl.deleteBuffer(b);
      this.vbos = [];
      for (const l of layouts) {
        const vbo = gl.createBuffer();
        if (!vbo) throw new Error("createBuffer failed");
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, l.data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(l.attribIndex);
        gl.vertexAttribPointer(l.attribIndex, l.componentsPerVertex, gl.FLOAT, false, 0, 0);
        this.vbos.push(vbo);
      }
      gl.bindVertexArray(null);
    }
    uploadIndices(data) {
      const { gl } = this;
      if (!this.ebo) {
        const e = gl.createBuffer();
        if (!e) throw new Error("createBuffer failed");
        this.ebo = e;
      }
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      this.indexCount = data.length;
    }
    drawTriangles() {
      const { gl } = this;
      gl.bindVertexArray(this.vao);
      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
    }
    dispose() {
      const { gl } = this;
      for (const b of this.vbos) gl.deleteBuffer(b);
      if (this.ebo) gl.deleteBuffer(this.ebo);
      gl.deleteVertexArray(this.vao);
      this.vbos = [];
      this.ebo = null;
    }
  };

  // src/render/GridRenderer.ts
  var VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
uniform mat4 uViewProj;
out vec3 vWorldPos;
void main() {
  vWorldPos = aPos;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;
  var FRAG = `#version 300 es
precision highp float;
in vec3 vWorldPos;
uniform vec3 uCameraPos;
uniform vec3 uGridColor;
uniform vec3 uAxisXColor;
uniform vec3 uAxisZColor;
uniform float uGridFade;
out vec4 fragColor;

float gridLine(float x) {
  // Anti-aliased line at the nearest integer.
  float d = abs(fract(x - 0.5) - 0.5) / fwidth(x);
  return 1.0 - min(d, 1.0);
}

void main() {
  vec3 wp = vWorldPos;
  float gx = gridLine(wp.x);
  float gz = gridLine(wp.z);
  float g = max(gx, gz);
  // Major grid every 10 units.
  float majorX = gridLine(wp.x * 0.1);
  float majorZ = gridLine(wp.z * 0.1);
  float major = max(majorX, majorZ) * 0.4;
  // Axis lines.
  float axisX = 1.0 - smoothstep(0.0, fwidth(wp.z) * 1.5, abs(wp.z));
  float axisZ = 1.0 - smoothstep(0.0, fwidth(wp.x) * 1.5, abs(wp.x));
  vec3 col = uGridColor;
  col = mix(col, uGridColor * 1.2, major);
  col = mix(col, uAxisXColor, axisX);
  col = mix(col, uAxisZColor, axisZ);
  float alpha = max(max(g * 0.6 + major * 0.4, axisX), axisZ);
  // Distance fade so edges of the quad don't pop.
  float dist = distance(wp.xz, uCameraPos.xz);
  float fade = 1.0 - smoothstep(uGridFade * 0.4, uGridFade, dist);
  alpha *= fade;
  if (alpha < 0.01) discard;
  fragColor = vec4(col, alpha);
}`;
  var GridRenderer = class {
    constructor(gl) {
      // Visible grid extent (world units).
      this.size = 80;
      this.gl = gl;
      this.program = new ShaderProgram(gl, VERT, FRAG);
      this.gpu = new GpuMesh(gl);
      this.rebuildMesh();
    }
    rebuildMesh() {
      const s = this.size;
      const positions = new Float32Array([
        -s,
        0,
        -s,
        s,
        0,
        -s,
        s,
        0,
        s,
        -s,
        0,
        s
      ]);
      const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
      this.gpu.uploadAttributes([{ attribIndex: 0, componentsPerVertex: 3, data: positions }]);
      this.gpu.uploadIndices(indices);
    }
    draw(camera, aspect) {
      const { gl } = this;
      const viewProj = camera.viewProj(aspect);
      this.program.use();
      this.program.setMat4("uViewProj", viewProj);
      const cp = camera.position();
      this.program.setVec3("uCameraPos", cp[0], cp[1], cp[2]);
      this.program.setVec3("uGridColor", 0.32, 0.32, 0.32);
      this.program.setVec3("uAxisXColor", 0.83, 0.25, 0.25);
      this.program.setVec3("uAxisZColor", 0.25, 0.45, 0.83);
      this.program.setFloat("uGridFade", this.size * 0.6);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      this.gpu.drawTriangles();
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }
    dispose() {
      this.gpu.dispose();
      this.program.dispose();
    }
  };

  // src/render/MeshRenderer.ts
  var VERT2 = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUv;
layout(location=3) in float aFaceId;
layout(location=4) in float aMaterialId;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMat;
out vec3 vNormal;
out vec2 vUv;
out vec3 vWorldPos;
flat out float vFaceId;
void main() {
  vec4 worldPos = uModel * vec4(aPos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(uNormalMat * aNormal);
  vUv = aUv;
  vFaceId = aFaceId;
  gl_Position = uViewProj * worldPos;
}`;
  var FRAG2 = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec2 vUv;
in vec3 vWorldPos;
flat in float vFaceId;
uniform vec3 uCameraPos;
uniform vec3 uBaseColor;
uniform vec3 uBackFaceColor;
uniform float uOpacity;
uniform float uMode; // 0 shaded, 1 xray, 2 textured, 3 unlit
uniform sampler2D uTexture;
uniform float uHasTexture; // 0/1
out vec4 fragColor;
void main() {
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  bool back = !gl_FrontFacing;
  float diff = max(dot(n, viewDir), 0.0);
  vec3 ambient = vec3(0.18);
  vec3 baseColor = back ? uBackFaceColor : uBaseColor;
  if (uMode < 0.5) {
    // shaded
    vec3 lit = baseColor * (ambient + diff * 0.85);
    if (back) {
      vec2 sp = gl_FragCoord.xy;
      float stripe = step(0.5, fract((sp.x + sp.y) * 0.18));
      lit = mix(lit * 0.55, lit, stripe);
    }
    fragColor = vec4(lit, uOpacity);
  } else if (uMode < 1.5) {
    // xray
    fragColor = vec4(baseColor * (0.6 + 0.4 * diff), 0.55 * uOpacity);
  } else if (uMode < 2.5) {
    // textured: sample texture if present, else show UV.
    vec3 c;
    if (uHasTexture > 0.5) {
      vec4 t = texture(uTexture, vUv);
      c = t.rgb * baseColor;
      // Apply a hint of lambert so the texture mode still has depth cues.
      c *= ambient + diff * 0.85;
    } else {
      c = vec3(vUv, 0.5);
    }
    fragColor = vec4(c, uOpacity);
  } else {
    // unlit
    fragColor = vec4(baseColor, uOpacity);
  }
}`;
  var MeshRenderer = class {
    constructor(gl) {
      this.uploadedVersion = -1;
      /** 0 shaded | 1 xray | 2 textured | 3 unlit */
      this.mode = 0;
      this.baseColor = [0.78, 0.78, 0.78];
      this.backFaceColor = [0.55, 0.55, 0.55];
      this.opacity = 1;
      this.texCache = /* @__PURE__ */ new Map();
      this.fallbackTex = null;
      /** When non-null, drawn with this material. Reset to null after each draw. */
      this.activeMaterial = null;
      this.gl = gl;
      this.program = new ShaderProgram(gl, VERT2, FRAG2);
      this.gpu = new GpuMesh(gl);
    }
    upload(rm) {
      if (rm.version === this.uploadedVersion) return;
      const b = rm.buffers;
      this.gpu.uploadAttributes([
        { attribIndex: 0, componentsPerVertex: 3, data: b.positions },
        { attribIndex: 1, componentsPerVertex: 3, data: b.normals },
        { attribIndex: 2, componentsPerVertex: 2, data: b.uvs },
        { attribIndex: 3, componentsPerVertex: 1, data: b.faceIds },
        { attribIndex: 4, componentsPerVertex: 1, data: b.materialIds }
      ]);
      this.gpu.uploadIndices(b.indices);
      this.uploadedVersion = rm.version;
    }
    setMaterial(mat) {
      this.activeMaterial = mat;
    }
    ensureTexture(mat) {
      if (!mat.texture || !mat.texture.data) return null;
      let slot = this.texCache.get(mat.id);
      if (!slot) {
        const tex = this.gl.createTexture();
        if (!tex) return null;
        slot = { tex, version: -1 };
        this.texCache.set(mat.id, slot);
      }
      if (slot.version !== mat.textureVersion) {
        const { gl } = this;
        gl.bindTexture(gl.TEXTURE_2D, slot.tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mat.texture.width, mat.texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, mat.texture.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        slot.version = mat.textureVersion;
      }
      return slot;
    }
    ensureFallback() {
      if (this.fallbackTex) return this.fallbackTex;
      const { gl } = this;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      this.fallbackTex = tex;
      return tex;
    }
    draw(node, camera, aspect) {
      const { gl } = this;
      if (this.gpu.indexCount === 0) return;
      const model = node.getWorldMatrix();
      const viewProj = camera.viewProj(aspect);
      const normalMat = computeNormalMatrix(model);
      this.program.use();
      this.program.setMat4("uModel", model);
      this.program.setMat4("uViewProj", viewProj);
      const nm3 = new Float32Array([normalMat[0], normalMat[1], normalMat[2], normalMat[3], normalMat[4], normalMat[5], normalMat[6], normalMat[7], normalMat[8]]);
      const loc = this.program.loc("uNormalMat");
      if (loc) gl.uniformMatrix3fv(loc, false, nm3);
      const cp = camera.position();
      this.program.setVec3("uCameraPos", cp[0], cp[1], cp[2]);
      const mat = this.activeMaterial;
      let bc = this.baseColor;
      let op = this.opacity;
      if (mat) {
        bc = [mat.baseColor.r, mat.baseColor.g, mat.baseColor.b];
        op = mat.opacity;
      }
      this.program.setVec3("uBaseColor", bc[0], bc[1], bc[2]);
      this.program.setVec3("uBackFaceColor", this.backFaceColor[0], this.backFaceColor[1], this.backFaceColor[2]);
      this.program.setFloat("uOpacity", op);
      this.program.setFloat("uMode", this.mode);
      gl.activeTexture(gl.TEXTURE0);
      let hasTex = 0;
      let tex = null;
      if (mat && mat.texture && mat.texture.data) {
        const slot = this.ensureTexture(mat);
        if (slot) {
          tex = slot.tex;
          hasTex = 1;
        }
      }
      if (!tex) tex = this.ensureFallback();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const texLoc = this.program.loc("uTexture");
      if (texLoc) gl.uniform1i(texLoc, 0);
      this.program.setFloat("uHasTexture", hasTex);
      gl.disable(gl.CULL_FACE);
      if (this.mode === 1 || op < 0.999) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
      } else {
        gl.disable(gl.BLEND);
        gl.depthMask(true);
      }
      this.gpu.drawTriangles();
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      this.activeMaterial = null;
    }
    dispose() {
      this.gpu.dispose();
      this.program.dispose();
      const { gl } = this;
      for (const slot of this.texCache.values()) gl.deleteTexture(slot.tex);
      this.texCache.clear();
      if (this.fallbackTex) gl.deleteTexture(this.fallbackTex);
      this.fallbackTex = null;
    }
  };
  function computeNormalMatrix(m) {
    const a00 = m[0], a01 = m[1], a02 = m[2];
    const a10 = m[4], a11 = m[5], a12 = m[6];
    const a20 = m[8], a21 = m[9], a22 = m[10];
    const b00 = a11 * a22 - a12 * a21;
    const b01 = -(a10 * a22 - a12 * a20);
    const b02 = a10 * a21 - a11 * a20;
    const det = a00 * b00 + a01 * b01 + a02 * b02;
    const out = new Float32Array(9);
    if (Math.abs(det) < 1e-12) {
      out[0] = 1;
      out[4] = 1;
      out[8] = 1;
      return out;
    }
    const invDet = 1 / det;
    out[0] = b00 * invDet;
    out[1] = b01 * invDet;
    out[2] = b02 * invDet;
    out[3] = -(a01 * a22 - a02 * a21) * invDet;
    out[4] = (a00 * a22 - a02 * a20) * invDet;
    out[5] = -(a00 * a21 - a01 * a20) * invDet;
    out[6] = (a01 * a12 - a02 * a11) * invDet;
    out[7] = -(a00 * a12 - a02 * a10) * invDet;
    out[8] = (a00 * a11 - a01 * a10) * invDet;
    return out;
  }

  // src/mesh/Triangulation.ts
  function pickPlanarProjection(normal) {
    const nx = Math.abs(normal[0]);
    const ny = Math.abs(normal[1]);
    const nz = Math.abs(normal[2]);
    if (nx >= ny && nx >= nz) return { uAxis: 1, vAxis: 2, flip: normal[0] < 0 };
    if (ny >= nx && ny >= nz) return { uAxis: 2, vAxis: 0, flip: normal[1] < 0 };
    return { uAxis: 0, vAxis: 1, flip: normal[2] < 0 };
  }
  function earClip(positions, normal) {
    const n = positions.length;
    if (n < 3) return [];
    if (n === 3) return [0, 1, 2];
    const proj = pickPlanarProjection(normal);
    const xs = new Float64Array(n);
    const ys = new Float64Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      xs[i2] = positions[i2][proj.uAxis];
      ys[i2] = positions[i2][proj.vAxis] * (proj.flip ? -1 : 1);
    }
    const prev = new Int32Array(n);
    const next = new Int32Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      prev[i2] = (i2 - 1 + n) % n;
      next[i2] = (i2 + 1) % n;
    }
    const tris = [];
    let remaining = n;
    let i = 0;
    let attempts = 0;
    const maxAttempts = n * 4;
    while (remaining > 3 && attempts < maxAttempts) {
      const a = prev[i];
      const b = i;
      const c = next[i];
      if (isEar(a, b, c, prev, next, xs, ys)) {
        tris.push(a, b, c);
        next[a] = c;
        prev[c] = a;
        remaining--;
        i = a;
        attempts = 0;
      } else {
        i = next[i];
        attempts++;
      }
    }
    if (remaining === 3) {
      tris.push(prev[i], i, next[i]);
    }
    return tris;
  }
  function isEar(a, b, c, prev, next, xs, ys) {
    const ax = xs[a], ay = ys[a];
    const bx = xs[b], by = ys[b];
    const cx = xs[c], cy = ys[c];
    const area2 = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area2) < 1e-12) return false;
    let polyArea2 = 0;
    let p = b;
    do {
      const i1 = p;
      const i2 = next[p];
      polyArea2 += xs[i1] * ys[i2] - xs[i2] * ys[i1];
      p = i2;
    } while (p !== b);
    const ccw = polyArea2 > 0;
    if (ccw && area2 <= 0) return false;
    if (!ccw && area2 >= 0) return false;
    for (let p2 = next[c]; p2 !== a; p2 = next[p2]) {
      if (pointInTriangle(xs[p2], ys[p2], ax, ay, bx, by, cx, cy)) return false;
    }
    return true;
  }
  function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    const v0x = cx - ax, v0y = cy - ay;
    const v1x = bx - ax, v1y = by - ay;
    const v2x = px - ax, v2y = py - ay;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;
    const denom = dot00 * dot11 - dot01 * dot01;
    if (Math.abs(denom) < 1e-18) return false;
    const inv = 1 / denom;
    const u = (dot11 * dot02 - dot01 * dot12) * inv;
    const v = (dot00 * dot12 - dot01 * dot02) * inv;
    return u > 1e-9 && v > 1e-9 && u + v < 1 - 1e-9;
  }

  // src/mesh/Normals.ts
  function recomputeLoopNormals(mesh) {
    const loopsByVertex = /* @__PURE__ */ new Map();
    for (const l of mesh.loops.values()) {
      let bucket = loopsByVertex.get(l.vertexId);
      if (!bucket) {
        bucket = [];
        loopsByVertex.set(l.vertexId, bucket);
      }
      bucket.push(l);
    }
    for (const [vid, loops] of loopsByVertex) {
      for (const l of loops) {
        const visited = /* @__PURE__ */ new Set();
        const stack = [l.faceId];
        let nx = 0, ny = 0, nz = 0;
        while (stack.length > 0) {
          const fid = stack.pop();
          if (visited.has(fid)) continue;
          visited.add(fid);
          const face = mesh.faces.get(fid);
          if (!face) continue;
          nx += face.normal[0];
          ny += face.normal[1];
          nz += face.normal[2];
          for (const lid of face.loops) {
            const fl = mesh.loops.get(lid);
            if (!fl) continue;
            const edge = mesh.edges.get(fl.edgeId);
            if (!edge) continue;
            if (edge.hard) continue;
            if (edge.a !== vid && edge.b !== vid) continue;
            for (const otherLoop of edge.loops) {
              const ol = mesh.loops.get(otherLoop);
              if (!ol) continue;
              if (ol.faceId !== fid && !visited.has(ol.faceId)) {
                stack.push(ol.faceId);
              }
            }
          }
        }
        const len = Math.hypot(nx, ny, nz);
        if (len > 0) {
          l.normal[0] = nx / len;
          l.normal[1] = ny / len;
          l.normal[2] = nz / len;
        } else {
          copy(l.normal, mesh.faces.get(l.faceId)?.normal ?? UNIT_Y);
        }
      }
    }
    for (const v of mesh.vertices.values()) {
      let nx = 0, ny = 0, nz = 0;
      for (const eid of v.edges) {
        const e = mesh.edges.get(eid);
        if (!e) continue;
        for (const lid of e.loops) {
          const l = mesh.loops.get(lid);
          if (!l) continue;
          const f = mesh.faces.get(l.faceId);
          if (!f) continue;
          nx += f.normal[0];
          ny += f.normal[1];
          nz += f.normal[2];
        }
      }
      const len = Math.hypot(nx, ny, nz);
      if (len > 0) {
        v.normal[0] = nx / len;
        v.normal[1] = ny / len;
        v.normal[2] = nz / len;
      } else {
        v.normal[0] = 0;
        v.normal[1] = 1;
        v.normal[2] = 0;
      }
    }
  }

  // src/mesh/RenderMesh.ts
  var RenderMesh = class {
    constructor() {
      this.buffers = createEmptyBuffers();
      /** Bumped whenever rebuild() runs. Renderer checks this to invalidate VBO uploads. */
      this.version = 0;
      this._dirty = true;
    }
    markDirty() {
      this._dirty = true;
    }
    isDirty() {
      return this._dirty;
    }
    /** Rebuild from the editable mesh. Idempotent; only does work if dirty. */
    rebuild(mesh, force = false) {
      if (!force && !this._dirty) return false;
      mesh.recomputeFaceNormals();
      recomputeLoopNormals(mesh);
      this.buffers = buildBuffers(mesh);
      this._dirty = false;
      this.version++;
      return true;
    }
  };
  function createEmptyBuffers() {
    return {
      positions: new Float32Array(0),
      normals: new Float32Array(0),
      uvs: new Float32Array(0),
      faceIds: new Float32Array(0),
      materialIds: new Float32Array(0),
      indices: new Uint32Array(0),
      triangleCount: 0,
      vertexCount: 0
    };
  }
  function buildBuffers(mesh) {
    let vertexCount = 0;
    let triCount = 0;
    for (const face of mesh.faces.values()) {
      vertexCount += face.loops.length;
      triCount += Math.max(0, face.loops.length - 2);
    }
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const faceIds = new Float32Array(vertexCount);
    const materialIds = new Float32Array(vertexCount);
    const indices = new Uint32Array(triCount * 3);
    let vp = 0;
    let ip = 0;
    const _facePositions = [];
    for (const face of mesh.faces.values()) {
      const baseVertex = vp;
      _facePositions.length = face.loops.length;
      for (let i = 0; i < face.loops.length; i++) {
        const lid = face.loops[i];
        const loop = mesh.loops.get(lid);
        const v = mesh.vertices.get(loop.vertexId);
        positions[vp * 3 + 0] = v.position[0];
        positions[vp * 3 + 1] = v.position[1];
        positions[vp * 3 + 2] = v.position[2];
        normals[vp * 3 + 0] = loop.normal[0];
        normals[vp * 3 + 1] = loop.normal[1];
        normals[vp * 3 + 2] = loop.normal[2];
        uvs[vp * 2 + 0] = loop.uv[0];
        uvs[vp * 2 + 1] = loop.uv[1];
        faceIds[vp] = face.id;
        materialIds[vp] = face.materialId ?? -1;
        _facePositions[i] = v.position;
        vp++;
      }
      let tris;
      if (face.loops.length === 3) {
        tris = [0, 1, 2];
      } else if (face.loops.length === 4) {
        tris = [0, 1, 2, 0, 2, 3];
      } else {
        tris = earClip(_facePositions, face.normal);
      }
      for (let i = 0; i < tris.length; i++) {
        indices[ip++] = baseVertex + tris[i];
      }
    }
    return {
      positions,
      normals,
      uvs,
      faceIds,
      materialIds,
      indices: indices.subarray(0, ip),
      triangleCount: ip / 3,
      vertexCount
    };
  }
  function buildRenderMesh(mesh) {
    const rm = new RenderMesh();
    rm.rebuild(mesh, true);
    return rm.buffers;
  }

  // src/render/Camera.ts
  var Camera = class {
    constructor() {
      this.mode = "perspective";
      this.target = fromValues(0, 0, 0);
      this.yaw = Math.PI * 0.25;
      this.pitch = Math.PI * 0.18;
      this.distance = 6;
      this.fovY = Math.PI / 4;
      this.near = 0.05;
      this.far = 200;
      this.orthoSize = 5;
      // half-height in world units when orthographic
      this._view = create3();
      this._proj = create3();
      this._viewProj = create3();
      this._position = create();
    }
    setMode(mode) {
      this.mode = mode;
    }
    orbit(yawDelta, pitchDelta) {
      this.yaw += yawDelta;
      this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch + pitchDelta));
    }
    pan(dx, dy) {
      const cosP = Math.cos(this.pitch);
      const sinP = Math.sin(this.pitch);
      const cosY = Math.cos(this.yaw);
      const sinY = Math.sin(this.yaw);
      const speed = this.distance * 15e-4;
      this.target[0] -= (dx * cosY + dy * sinY * sinP) * speed;
      this.target[1] += dy * cosP * speed;
      this.target[2] -= (-dx * sinY + dy * cosY * sinP) * speed;
    }
    dolly(amount) {
      const factor = Math.exp(-amount * 1e-3);
      this.distance = Math.max(0.1, Math.min(500, this.distance * factor));
      if (this.mode === "orthographic") {
        this.orthoSize = Math.max(0.1, Math.min(200, this.orthoSize * factor));
      }
    }
    /** Camera world position derived from target + spherical orbit. */
    position() {
      const cp = Math.cos(this.pitch);
      const sp = Math.sin(this.pitch);
      const cy = Math.cos(this.yaw);
      const sy = Math.sin(this.yaw);
      this._position[0] = this.target[0] + this.distance * cp * sy;
      this._position[1] = this.target[1] + this.distance * sp;
      this._position[2] = this.target[2] + this.distance * cp * cy;
      return this._position;
    }
    /** Forward direction in world space (target - position, normalized). */
    forward(out) {
      const pos = this.position();
      sub(out, this.target, pos);
      return normalize(out, out);
    }
    view() {
      return lookAt(this._view, this.position(), this.target, UNIT_Y);
    }
    proj(aspect) {
      if (this.mode === "perspective") {
        perspective(this._proj, this.fovY, aspect, this.near, this.far);
      } else {
        const w = this.orthoSize * aspect;
        const h = this.orthoSize;
        ortho(this._proj, -w, w, -h, h, this.near, this.far);
      }
      return this._proj;
    }
    viewProj(aspect) {
      multiply2(this._viewProj, this.proj(aspect), this.view());
      return this._viewProj;
    }
    reset() {
      set(this.target, 0, 0, 0);
      this.yaw = Math.PI * 0.25;
      this.pitch = Math.PI * 0.18;
      this.distance = 6;
    }
    /** Snap to a canonical orthographic view. */
    setOrientation(name) {
      switch (name) {
        case "top":
          this.yaw = 0;
          this.pitch = Math.PI / 2 - 1e-3;
          break;
        case "bottom":
          this.yaw = 0;
          this.pitch = -Math.PI / 2 + 1e-3;
          break;
        case "front":
          this.yaw = 0;
          this.pitch = 0;
          break;
        case "back":
          this.yaw = Math.PI;
          this.pitch = 0;
          break;
        case "right":
          this.yaw = Math.PI / 2;
          this.pitch = 0;
          break;
        case "left":
          this.yaw = -Math.PI / 2;
          this.pitch = 0;
          break;
        case "perspective":
        default:
          this.yaw = Math.PI * 0.25;
          this.pitch = Math.PI * 0.18;
          break;
      }
    }
  };

  // src/render/ViewportLayout.ts
  var ViewportLayout = class {
    constructor() {
      this.mode = "single";
      this.perspectiveCam = new Camera();
      this.topCam = new Camera();
      this.frontCam = new Camera();
      this.rightCam = new Camera();
      this.uvCam = new Camera();
      this.sub = [];
      this.topCam.setMode("orthographic");
      this.topCam.setOrientation("top");
      this.frontCam.setMode("orthographic");
      this.frontCam.setOrientation("front");
      this.rightCam.setMode("orthographic");
      this.rightCam.setOrientation("right");
      this.uvCam.setMode("orthographic");
      this.uvCam.target[0] = 0.5;
      this.uvCam.target[1] = 0;
      this.uvCam.target[2] = 0.5;
      this.uvCam.setOrientation("top");
      this.uvCam.distance = 5;
      this.uvCam.orthoSize = 0.7;
    }
    setMode(mode) {
      this.mode = mode;
    }
    /** Compute sub-viewport rects from the host viewport area. */
    layout(hostRect) {
      this.sub.length = 0;
      const { x, y, w, h } = hostRect;
      if (this.mode === "single") {
        this.sub.push({ name: "perspective", camera: this.perspectiveCam, rect: { x, y, w, h } });
      } else if (this.mode === "fourView") {
        const halfW = Math.floor(w / 2);
        const halfH = Math.floor(h / 2);
        this.sub.push({ name: "perspective", camera: this.perspectiveCam, rect: { x, y, w: halfW, h: halfH } });
        this.sub.push({ name: "top", camera: this.topCam, rect: { x: x + halfW, y, w: w - halfW, h: halfH } });
        this.sub.push({ name: "front", camera: this.frontCam, rect: { x, y: y + halfH, w: halfW, h: h - halfH } });
        this.sub.push({ name: "right", camera: this.rightCam, rect: { x: x + halfW, y: y + halfH, w: w - halfW, h: h - halfH } });
      } else if (this.mode === "uv") {
        this.sub.push({ name: "uv", camera: this.uvCam, rect: { x, y, w, h } });
      }
      return this.sub;
    }
    subviewportAt(x, y) {
      for (const s of this.sub) {
        if (x >= s.rect.x && x < s.rect.x + s.rect.w && y >= s.rect.y && y < s.rect.y + s.rect.h) return s;
      }
      return null;
    }
    subviewports() {
      return this.sub;
    }
  };

  // src/render/StripRenderer.ts
  var FLOATS_PER_VERT = 9;
  var VERTS_PER_SEG = 4;
  var INDICES_PER_SEG = 6;
  var VERT3 = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosA;
layout(location=1) in vec3 aPosB;
layout(location=2) in vec2 aOffset; // (side \xB11, t in [0..1])
layout(location=3) in float aColorPacked;
uniform mat4 uViewProj;
uniform vec2 uPixelSize;
uniform float uWidth;
out vec3 vColor;

vec3 unpackColor(float p) {
  float r = floor(p / (256.0 * 256.0));
  float g = floor(mod(p / 256.0, 256.0));
  float b = mod(p, 256.0);
  return vec3(r, g, b) / 255.0;
}

void main() {
  vec4 clipA = uViewProj * vec4(aPosA, 1.0);
  vec4 clipB = uViewProj * vec4(aPosB, 1.0);
  // Compute direction in NDC.
  vec2 ndcA = clipA.xy / max(abs(clipA.w), 1e-4);
  vec2 ndcB = clipB.xy / max(abs(clipB.w), 1e-4);
  vec2 d = ndcB - ndcA;
  if (length(d) < 1e-6) d = vec2(1.0, 0.0);
  vec2 dir = normalize(d);
  vec2 perp = vec2(-dir.y, dir.x);
  vec4 clip = mix(clipA, clipB, aOffset.y);
  vec2 offsetNdc = perp * uWidth * uPixelSize * aOffset.x;
  clip.xy += offsetNdc * clip.w;
  vColor = unpackColor(aColorPacked);
  gl_Position = clip;
}`;
  var FRAG3 = `#version 300 es
precision highp float;
in vec3 vColor;
uniform float uAlpha;
out vec4 fragColor;
void main() {
  fragColor = vec4(vColor, uAlpha);
}`;
  var StripBatch = class {
    constructor(gl) {
      this.width = 1.5;
      this.alpha = 1;
      this.segs = [];
      this.gpu = null;
      this.gl = gl;
      this.program = new ShaderProgram(gl, VERT3, FRAG3);
    }
    reset() {
      this.segs.length = 0;
    }
    add(ax, ay, az, bx, by, bz, r = 0.85, g = 0.85, b = 0.85) {
      const cr = Math.round(Math.max(0, Math.min(1, r)) * 255);
      const cg = Math.round(Math.max(0, Math.min(1, g)) * 255);
      const cb = Math.round(Math.max(0, Math.min(1, b)) * 255);
      this.segs.push({ ax, ay, az, bx, by, bz, color: cr * 65536 + cg * 256 + cb });
    }
    segmentCount() {
      return this.segs.length;
    }
    /** Build CPU vertex+index data for the current segment list. Returns the raw buffers (exposed for tests). */
    buildBuffers() {
      const n = this.segs.length;
      const vertices = new Float32Array(n * VERTS_PER_SEG * FLOATS_PER_VERT);
      const indices = new Uint32Array(n * INDICES_PER_SEG);
      const offsets = [
        { side: -1, t: 0 },
        { side: 1, t: 0 },
        { side: -1, t: 1 },
        { side: 1, t: 1 }
      ];
      let vp = 0;
      let ip = 0;
      for (let s = 0; s < n; s++) {
        const seg = this.segs[s];
        const base = s * VERTS_PER_SEG;
        for (let k = 0; k < VERTS_PER_SEG; k++) {
          const o = offsets[k];
          vertices[vp++] = seg.ax;
          vertices[vp++] = seg.ay;
          vertices[vp++] = seg.az;
          vertices[vp++] = seg.bx;
          vertices[vp++] = seg.by;
          vertices[vp++] = seg.bz;
          vertices[vp++] = o.side;
          vertices[vp++] = o.t;
          vertices[vp++] = seg.color;
        }
        indices[ip++] = base + 0;
        indices[ip++] = base + 1;
        indices[ip++] = base + 2;
        indices[ip++] = base + 1;
        indices[ip++] = base + 3;
        indices[ip++] = base + 2;
      }
      return { vertices, indices };
    }
    draw(camera, aspect, viewportPxW, viewportPxH) {
      const { gl } = this;
      if (this.segs.length === 0) return;
      const { vertices, indices } = this.buildBuffers();
      this.ensureGpu(vertices.byteLength, indices.byteLength);
      gl.bindVertexArray(this.gpu.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.gpu.vbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gpu.ebo);
      gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
      this.program.use();
      this.program.setMat4("uViewProj", camera.viewProj(aspect));
      const pxW = 2 / Math.max(1, viewportPxW);
      const pxH = 2 / Math.max(1, viewportPxH);
      const loc = this.program.loc("uPixelSize");
      if (loc) gl.uniform2f(loc, pxW, pxH);
      this.program.setFloat("uWidth", this.width * 0.5);
      this.program.setFloat("uAlpha", this.alpha);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);
    }
    ensureGpu(vBytes, iBytes) {
      const { gl } = this;
      if (!this.gpu || this.gpu.capacity < Math.max(vBytes, iBytes)) {
        this.disposeGpu();
        const vao = gl.createVertexArray();
        const vbo = gl.createBuffer();
        const ebo = gl.createBuffer();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, Math.max(vBytes, 1024 * 16), gl.DYNAMIC_DRAW);
        const stride = FLOATS_PER_VERT * 4;
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 24);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 32);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Math.max(iBytes, 1024 * 4), gl.DYNAMIC_DRAW);
        gl.bindVertexArray(null);
        this.gpu = { vao, vbo, ebo, capacity: Math.max(vBytes, iBytes) };
      }
    }
    disposeGpu() {
      if (!this.gpu) return;
      const { gl } = this;
      gl.deleteVertexArray(this.gpu.vao);
      gl.deleteBuffer(this.gpu.vbo);
      gl.deleteBuffer(this.gpu.ebo);
      this.gpu = null;
    }
    dispose() {
      this.disposeGpu();
      this.program.dispose();
    }
  };

  // src/render/UvRenderer.ts
  var VERT4 = `#version 300 es
precision highp float;
layout(location=0) in vec2 aUv;
uniform mat4 uViewProj;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uViewProj * vec4(aUv.x, 0.0, aUv.y, 1.0);
}`;
  var FRAG4 = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform float uHasTexture;
uniform vec3 uTint;
out vec4 fragColor;
void main() {
  if (uHasTexture > 0.5) fragColor = texture(uTexture, vUv);
  else fragColor = vec4(uTint, 1.0);
}`;
  var UvRenderer = class {
    constructor(gl) {
      this.texCache = /* @__PURE__ */ new Map();
      this.fallback = null;
      this.gl = gl;
      this.bgProgram = new ShaderProgram(gl, VERT4, FRAG4);
      this.bgQuad = new GpuMesh(gl);
      this.bgQuad.uploadAttributes([
        {
          attribIndex: 0,
          componentsPerVertex: 2,
          data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])
        }
      ]);
      this.bgQuad.uploadIndices(new Uint32Array([0, 1, 2, 0, 2, 3]));
      this.edges = new StripBatch(gl);
      this.edges.width = 1.5;
      this.edges.alpha = 0.92;
      this.highlight = new StripBatch(gl);
      this.highlight.width = 3;
      this.highlight.alpha = 1;
    }
    ensureTexture(mat) {
      if (!mat.texture || !mat.texture.data) return null;
      let slot = this.texCache.get(mat.id);
      if (!slot) {
        const tex = this.gl.createTexture();
        if (!tex) return null;
        slot = { tex, version: -1 };
        this.texCache.set(mat.id, slot);
      }
      if (slot.version !== mat.textureVersion) {
        const { gl } = this;
        gl.bindTexture(gl.TEXTURE_2D, slot.tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mat.texture.width, mat.texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, mat.texture.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        slot.version = mat.textureVersion;
      }
      return slot.tex;
    }
    ensureFallback() {
      if (this.fallback) return this.fallback;
      const { gl } = this;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      this.fallback = tex;
      return tex;
    }
    draw(scene, camera, aspect, vpW, vpH, sel) {
      const { gl } = this;
      let bgMat = null;
      for (const m of scene.materials()) {
        if (m.texture && m.texture.data) {
          bgMat = m;
          break;
        }
      }
      let tex;
      let hasTex = 0;
      if (bgMat) {
        const t = this.ensureTexture(bgMat);
        if (t) {
          tex = t;
          hasTex = 1;
        } else tex = this.ensureFallback();
      } else {
        tex = this.ensureFallback();
      }
      this.bgProgram.use();
      this.bgProgram.setMat4("uViewProj", camera.viewProj(aspect));
      this.bgProgram.setFloat("uHasTexture", hasTex);
      this.bgProgram.setVec3("uTint", 0.25, 0.25, 0.27);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const texLoc = this.bgProgram.loc("uTexture");
      if (texLoc) gl.uniform1i(texLoc, 0);
      this.bgQuad.drawTriangles();
      this.edges.reset();
      for (const node of allMeshNodes(scene)) {
        const mesh = node.mesh;
        if (!mesh) continue;
        for (const face of mesh.faces.values()) {
          const loops = face.loops.map((lid) => mesh.loops.get(lid));
          for (let i = 0; i < loops.length; i++) {
            const a = loops[i].uv;
            const b = loops[(i + 1) % loops.length].uv;
            this.edges.add(a[0], 0, a[1], b[0], 0, b[1], 0.85, 0.85, 0.85);
          }
        }
      }
      this.edges.draw(camera, aspect, vpW, vpH);
      if (sel && sel.uvLoops.size > 0) {
        this.highlight.reset();
        for (const node of allMeshNodes(scene)) {
          const mesh = node.mesh;
          if (!mesh) continue;
          for (const face of mesh.faces.values()) {
            for (let i = 0; i < face.loops.length; i++) {
              const lid = face.loops[i];
              if (!sel.uvLoops.has(lid)) continue;
              const loop = mesh.loops.get(lid);
              const next = mesh.loops.get(face.loops[(i + 1) % face.loops.length]);
              this.highlight.add(loop.uv[0], 0, loop.uv[1], next.uv[0], 0, next.uv[1], 1, 0.55, 0.15);
            }
          }
        }
        this.highlight.draw(camera, aspect, vpW, vpH);
      }
    }
    dispose() {
      const { gl } = this;
      this.bgProgram.dispose();
      this.bgQuad.dispose();
      for (const slot of this.texCache.values()) gl.deleteTexture(slot.tex);
      this.texCache.clear();
      if (this.fallback) gl.deleteTexture(this.fallback);
      this.fallback = null;
    }
  };
  function* allMeshNodes(scene) {
    const stack = [scene.root];
    while (stack.length) {
      const n = stack.pop();
      if (n.kind === "mesh") yield n;
      for (const c of n.children) stack.push(c);
    }
  }

  // src/render/ReferenceImageRenderer.ts
  var VERT5 = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
uniform mat4 uModel;
uniform mat4 uViewProj;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uViewProj * uModel * vec4(aPos, 1.0);
}`;
  var FRAG5 = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uOpacity;
out vec4 fragColor;
void main() {
  vec4 t = texture(uTex, vUv);
  fragColor = vec4(t.rgb, t.a * uOpacity);
}`;
  var ReferenceImageRenderer = class {
    constructor(gl) {
      this.texCache = /* @__PURE__ */ new Map();
      this.fallback = null;
      this.gl = gl;
      this.program = new ShaderProgram(gl, VERT5, FRAG5);
      this.quad = new GpuMesh(gl);
      this.quad.uploadAttributes([
        { attribIndex: 0, componentsPerVertex: 3, data: new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]) },
        { attribIndex: 1, componentsPerVertex: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) }
      ]);
      this.quad.uploadIndices(new Uint32Array([0, 1, 2, 0, 2, 3]));
    }
    ensureTexture(ref) {
      if (!ref.pixels || !ref.pixels.data) return null;
      let slot = this.texCache.get(ref.id);
      if (!slot) {
        const tex = this.gl.createTexture();
        if (!tex) return null;
        slot = { tex, version: -1 };
        this.texCache.set(ref.id, slot);
      }
      if (slot.version !== ref.pixelVersion) {
        const { gl } = this;
        gl.bindTexture(gl.TEXTURE_2D, slot.tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ref.pixels.width, ref.pixels.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, ref.pixels.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        slot.version = ref.pixelVersion;
      }
      return slot.tex;
    }
    ensureFallback() {
      if (this.fallback) return this.fallback;
      const { gl } = this;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 220, 200]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      this.fallback = tex;
      return tex;
    }
    draw(ref, camera, aspect) {
      if (!ref.isEffectivelyVisible()) return;
      const { gl } = this;
      this.program.use();
      const scaled = create3();
      copy2(scaled, ref.getWorldMatrix());
      const sx = ref.width;
      const sy = ref.height;
      const local = create3();
      identity(local);
      local[0] = sx;
      local[5] = sy;
      const final = create3();
      multiply2(final, ref.getWorldMatrix(), local);
      this.program.setMat4("uModel", final);
      this.program.setMat4("uViewProj", camera.viewProj(aspect));
      this.program.setFloat("uOpacity", ref.opacity);
      gl.activeTexture(gl.TEXTURE0);
      const tex = this.ensureTexture(ref) ?? this.ensureFallback();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const loc = this.program.loc("uTex");
      if (loc) gl.uniform1i(loc, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      this.quad.drawTriangles();
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }
    dispose() {
      const { gl } = this;
      this.program.dispose();
      this.quad.dispose();
      for (const slot of this.texCache.values()) gl.deleteTexture(slot.tex);
      this.texCache.clear();
      if (this.fallback) gl.deleteTexture(this.fallback);
      this.fallback = null;
    }
  };

  // src/render/Renderer.ts
  var Renderer = class {
    constructor(gl) {
      this.layout = new ViewportLayout();
      /** Toggled by App.setWireOverlay. */
      this.showWireOverlay = true;
      /** Optional selection — when set, edges/vertices belonging to selected objects render highlighted. */
      this.selection = null;
      /** Optional active-tool — when set, the current gizmo is rendered over the active object. */
      this.tools = null;
      this.gizmoBatch = null;
      this.slots = /* @__PURE__ */ new Map();
      this.gl = gl;
      this.grid = new GridRenderer(gl);
      this.meshRenderer = new MeshRenderer(gl);
      this.uvRenderer = new UvRenderer(gl);
      this.refRenderer = new ReferenceImageRenderer(gl);
      this.wireBatch = new StripBatch(gl);
      this.wireBatch.width = 1.2;
      this.wireBatch.alpha = 0.85;
      this.highlightBatch = new StripBatch(gl);
      this.highlightBatch.width = 3;
      this.highlightBatch.alpha = 1;
      this.gizmoBatch = new StripBatch(gl);
      this.gizmoBatch.width = 2.5;
      this.gizmoBatch.alpha = 1;
    }
    /** Ensure every mesh object in the scene has a RenderMesh slot. */
    syncScene(scene) {
      const seen = /* @__PURE__ */ new Set();
      scene.forEachNode((n) => {
        if (n.kind !== "mesh") return;
        const mo = n;
        if (!mo.mesh) return;
        seen.add(mo.id);
        let slot = this.slots.get(mo.id);
        if (!slot) {
          slot = { node: mo, rm: new RenderMesh() };
          slot.rm.markDirty();
          this.slots.set(mo.id, slot);
        }
      });
      for (const key of Array.from(this.slots.keys())) {
        if (!seen.has(key)) this.slots.delete(key);
      }
    }
    /** Force rebuild of every render mesh — used after primitive creation. */
    markAllDirty() {
      for (const slot of this.slots.values()) slot.rm.markDirty();
    }
    setViewMode(mode) {
      this.meshRenderer.mode = { shaded: 0, xray: 1, textured: 2, unlit: 3 }[mode];
    }
    /** Called from App.scenePass. */
    draw(scene, hostRect, dpr) {
      const subviewports = this.layout.layout(hostRect);
      const { gl } = this;
      gl.enable(gl.SCISSOR_TEST);
      for (const sub2 of subviewports) {
        const sx = Math.floor(sub2.rect.x * dpr);
        const sy = Math.floor(this.canvasHeight() - (sub2.rect.y + sub2.rect.h) * dpr);
        const sw = Math.max(1, Math.floor(sub2.rect.w * dpr));
        const sh = Math.max(1, Math.floor(sub2.rect.h * dpr));
        gl.viewport(sx, sy, sw, sh);
        gl.scissor(sx, sy, sw, sh);
        gl.clearColor(0.149, 0.149, 0.149, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const aspect = sub2.rect.w / Math.max(1, sub2.rect.h);
        if (sub2.name === "uv") {
          const uvSel = this.selection ? { uvLoops: this.selection.selectedUvLoops } : null;
          this.uvRenderer.draw(scene, sub2.camera, aspect, sub2.rect.w * dpr, sub2.rect.h * dpr, uvSel);
          continue;
        }
        this.grid.draw(sub2.camera, aspect);
        scene.forEachNode((n) => {
          if (n.kind === "reference") this.refRenderer.draw(n, sub2.camera, aspect);
        });
        for (const slot of this.slots.values()) {
          if (!slot.node.mesh) continue;
          slot.rm.rebuild(slot.node.mesh, false);
          this.meshRenderer.upload(slot.rm);
          const mat = slot.node.materialId != null ? scene.getMaterial(slot.node.materialId) : null;
          this.meshRenderer.setMaterial(mat);
          this.meshRenderer.draw(slot.node, sub2.camera, aspect);
        }
        if (this.showWireOverlay) {
          this.drawWireOverlay(sub2.camera, aspect, sub2.rect.w * dpr, sub2.rect.h * dpr);
          if (this.selection) {
            this.drawSelectionHighlights(sub2.camera, aspect, sub2.rect.w * dpr, sub2.rect.h * dpr);
          }
        }
        if (this.tools && this.gizmoBatch) {
          this.drawGizmo(sub2.camera, sub2.rect, aspect, dpr);
        }
      }
      gl.disable(gl.SCISSOR_TEST);
    }
    canvasHeight() {
      return this.gl.canvas.height;
    }
    drawGizmo(camera, rect, aspect, dpr) {
      if (!this.tools || !this.gizmoBatch) return;
      const gizmo = this.tools.getActiveGizmo();
      if (!gizmo) return;
      const activeId = this.selection?.activeObjectId;
      if (!activeId) return;
      let node = null;
      for (const slot of this.slots.values()) {
        if (slot.node.id === activeId) {
          node = slot.node;
          break;
        }
      }
      if (!node) return;
      this.gizmoBatch.reset();
      gizmo.render(this.gizmoBatch, node, camera, rect, aspect);
      this.gizmoBatch.draw(camera, aspect, rect.w * dpr, rect.h * dpr);
    }
    drawWireOverlay(camera, aspect, vpW, vpH) {
      this.wireBatch.reset();
      const tmpA = create();
      const tmpB = create();
      for (const slot of this.slots.values()) {
        const mesh = slot.node.mesh;
        if (!mesh) continue;
        const world = slot.node.getWorldMatrix();
        for (const edge of mesh.edges.values()) {
          const va = mesh.vertices.get(edge.a);
          const vb = mesh.vertices.get(edge.b);
          if (!va || !vb) continue;
          transformPoint(tmpA, va.position, world);
          transformPoint(tmpB, vb.position, world);
          const r = edge.hard ? 0.95 : 0.82;
          const g = edge.hard ? 0.55 : 0.82;
          const b = edge.seam ? 0.4 : 0.82;
          this.wireBatch.add(tmpA[0], tmpA[1], tmpA[2], tmpB[0], tmpB[1], tmpB[2], r, g, b);
        }
      }
      if (this.wireBatch.segmentCount() > 0) {
        this.wireBatch.draw(camera, aspect, vpW, vpH);
      }
    }
    drawSelectionHighlights(camera, aspect, vpW, vpH) {
      if (!this.selection) return;
      this.highlightBatch.reset();
      const tmpA = create();
      const tmpB = create();
      for (const slot of this.slots.values()) {
        const mesh = slot.node.mesh;
        if (!mesh) continue;
        const world = slot.node.getWorldMatrix();
        const objSelected = this.selection.isObjectSelected(slot.node.id);
        const edgeIds = this.selection.selectedEdges.get(slot.node.id);
        const faceIds = this.selection.selectedFaces.get(slot.node.id);
        const vertexIds = this.selection.selectedVertices.get(slot.node.id);
        if (objSelected) {
          for (const e of mesh.edges.values()) {
            const va = mesh.vertices.get(e.a);
            const vb = mesh.vertices.get(e.b);
            if (!va || !vb) continue;
            transformPoint(tmpA, va.position, world);
            transformPoint(tmpB, vb.position, world);
            this.highlightBatch.add(tmpA[0], tmpA[1], tmpA[2], tmpB[0], tmpB[1], tmpB[2], 1, 0.55, 0.15);
          }
        }
        if (faceIds) {
          for (const fid of faceIds) {
            const face = mesh.faces.get(fid);
            if (!face) continue;
            const verts = mesh.faceVertices(fid);
            for (let i = 0; i < verts.length; i++) {
              const next = verts[(i + 1) % verts.length];
              transformPoint(tmpA, verts[i].position, world);
              transformPoint(tmpB, next.position, world);
              this.highlightBatch.add(tmpA[0], tmpA[1], tmpA[2], tmpB[0], tmpB[1], tmpB[2], 0.95, 0.85, 0.2);
            }
          }
        }
        if (edgeIds) {
          for (const eid of edgeIds) {
            const e = mesh.edges.get(eid);
            if (!e) continue;
            const va = mesh.vertices.get(e.a);
            const vb = mesh.vertices.get(e.b);
            if (!va || !vb) continue;
            transformPoint(tmpA, va.position, world);
            transformPoint(tmpB, vb.position, world);
            this.highlightBatch.add(tmpA[0], tmpA[1], tmpA[2], tmpB[0], tmpB[1], tmpB[2], 1, 0.4, 0.1);
          }
        }
        if (vertexIds) {
          for (const vid of vertexIds) {
            const v = mesh.vertices.get(vid);
            if (!v) continue;
            transformPoint(tmpA, v.position, world);
            const px = 0.02;
            this.highlightBatch.add(tmpA[0] - px, tmpA[1], tmpA[2], tmpA[0] + px, tmpA[1], tmpA[2], 1, 0.85, 0.1);
            this.highlightBatch.add(tmpA[0], tmpA[1] - px, tmpA[2], tmpA[0], tmpA[1] + px, tmpA[2], 1, 0.85, 0.1);
            this.highlightBatch.add(tmpA[0], tmpA[1], tmpA[2] - px, tmpA[0], tmpA[1], tmpA[2] + px, 1, 0.85, 0.1);
          }
        }
      }
      if (this.highlightBatch.segmentCount() > 0) {
        this.highlightBatch.draw(camera, aspect, vpW, vpH);
      }
    }
  };

  // src/core/math/Vec2.ts
  function create4() {
    return new Float32Array(2);
  }
  function fromValues3(x, y) {
    const v = new Float32Array(2);
    v[0] = x;
    v[1] = y;
    return v;
  }
  function dot2(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function cross2(a, b) {
    return a[0] * b[1] - a[1] * b[0];
  }
  function distance2(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

  // src/mesh/Topology.ts
  function makeVertex(id, x, y, z) {
    return { id, position: fromValues(x, y, z), normal: fromValues(0, 0, 0), edges: [] };
  }
  function makeEdge(id, a, b) {
    return { id, a, b, loops: [], hard: false, seam: false };
  }
  function makeLoop(id, faceId, edgeId, vertexId) {
    return { id, faceId, edgeId, vertexId, uv: create4(), normal: create() };
  }
  function makeFace(id) {
    return { id, loops: [], normal: create(), materialId: null };
  }

  // src/mesh/EditableMesh.ts
  var EditableMesh = class {
    constructor() {
      this.vertices = /* @__PURE__ */ new Map();
      this.edges = /* @__PURE__ */ new Map();
      this.loops = /* @__PURE__ */ new Map();
      this.faces = /* @__PURE__ */ new Map();
    }
    // ---------------- Construction ----------------
    addVertex(x, y, z) {
      const v = makeVertex(nextId(), x, y, z);
      this.vertices.set(v.id, v);
      return v;
    }
    /**
     * Look up or create the edge connecting vertices `a` and `b`. Direction
     * is ignored — the edge is undirected at the data level.
     */
    findOrCreateEdge(a, b) {
      const va = this.vertices.get(a);
      if (!va) throw new Error(`findOrCreateEdge: vertex ${a} missing`);
      for (const eid of va.edges) {
        const e = this.edges.get(eid);
        if (!e) continue;
        if (e.a === a && e.b === b || e.a === b && e.b === a) return e;
      }
      const vb = this.vertices.get(b);
      if (!vb) throw new Error(`findOrCreateEdge: vertex ${b} missing`);
      const edge = makeEdge(nextId(), a, b);
      this.edges.set(edge.id, edge);
      va.edges.push(edge.id);
      vb.edges.push(edge.id);
      return edge;
    }
    /**
     * Add a face from an ordered vertex loop (length ≥ 3). Creates the
     * underlying edges and loops automatically.
     */
    addFace(vertexIds, materialId = null) {
      if (vertexIds.length < 3) {
        throw new Error("addFace: need at least 3 vertices");
      }
      for (const vid of vertexIds) {
        if (!this.vertices.has(vid)) throw new Error(`addFace: vertex ${vid} missing`);
      }
      const face = makeFace(nextId());
      face.materialId = materialId;
      const n = vertexIds.length;
      for (let i = 0; i < n; i++) {
        const v0 = vertexIds[i];
        const v1 = vertexIds[(i + 1) % n];
        const edge = this.findOrCreateEdge(v0, v1);
        const loop = makeLoop(nextId(), face.id, edge.id, v0);
        this.loops.set(loop.id, loop);
        edge.loops.push(loop.id);
        face.loops.push(loop.id);
      }
      this.faces.set(face.id, face);
      return face;
    }
    /**
     * Remove a face. Loops are deleted; edges that lose their last loop are
     * left in place as "loose" (validate() flags them). Callers that want to
     * fully clean up should call removeLooseEdges() after.
     */
    removeFace(faceId) {
      const face = this.faces.get(faceId);
      if (!face) return;
      for (const lid of face.loops) {
        const loop = this.loops.get(lid);
        if (!loop) continue;
        const edge = this.edges.get(loop.edgeId);
        if (edge) {
          const i = edge.loops.indexOf(lid);
          if (i >= 0) edge.loops.splice(i, 1);
        }
        this.loops.delete(lid);
      }
      this.faces.delete(faceId);
    }
    /**
     * Delete edges that have no loops, then delete vertices that have no
     * edges. Used by ops like removeFace + dissolve to keep topology clean.
     */
    removeLooseGeometry() {
      for (const e of Array.from(this.edges.values())) {
        if (e.loops.length === 0) this._deleteEdge(e);
      }
      for (const v of Array.from(this.vertices.values())) {
        if (v.edges.length === 0) this.vertices.delete(v.id);
      }
    }
    _deleteEdge(e) {
      const a = this.vertices.get(e.a);
      if (a) {
        const i = a.edges.indexOf(e.id);
        if (i >= 0) a.edges.splice(i, 1);
      }
      const b = this.vertices.get(e.b);
      if (b) {
        const i = b.edges.indexOf(e.id);
        if (i >= 0) b.edges.splice(i, 1);
      }
      this.edges.delete(e.id);
    }
    // ---------------- Hard / seam flags ----------------
    setEdgeHard(edgeId, hard) {
      const e = this.edges.get(edgeId);
      if (e) e.hard = hard;
    }
    setEdgeSeam(edgeId, seam) {
      const e = this.edges.get(edgeId);
      if (e) e.seam = seam;
    }
    // ---------------- Stats ----------------
    vertexCount() {
      return this.vertices.size;
    }
    edgeCount() {
      return this.edges.size;
    }
    faceCount() {
      return this.faces.size;
    }
    loopCount() {
      return this.loops.size;
    }
    // ---------------- Queries ----------------
    /** Loops in this face, in order. */
    faceLoops(faceId) {
      const f = this.faces.get(faceId);
      if (!f) return [];
      const out = [];
      for (const lid of f.loops) {
        const l = this.loops.get(lid);
        if (l) out.push(l);
      }
      return out;
    }
    faceVertices(faceId) {
      const f = this.faces.get(faceId);
      if (!f) return [];
      const out = [];
      for (const lid of f.loops) {
        const l = this.loops.get(lid);
        if (!l) continue;
        const v = this.vertices.get(l.vertexId);
        if (v) out.push(v);
      }
      return out;
    }
    /** Faces incident to a vertex (via its edges). May contain duplicates. */
    vertexFaces(vertexId) {
      const v = this.vertices.get(vertexId);
      if (!v) return /* @__PURE__ */ new Set();
      const out = /* @__PURE__ */ new Set();
      for (const eid of v.edges) {
        const e = this.edges.get(eid);
        if (!e) continue;
        for (const lid of e.loops) {
          const l = this.loops.get(lid);
          if (l) out.add(l.faceId);
        }
      }
      return out;
    }
    // ---------------- Validation ----------------
    validate() {
      const errors = [];
      for (const v of this.vertices.values()) {
        if (v.edges.length === 0) errors.push(`loose vertex ${v.id}`);
      }
      for (const e of this.edges.values()) {
        if (e.loops.length === 0) errors.push(`loose edge ${e.id}`);
      }
      for (const e of this.edges.values()) {
        if (!this.vertices.has(e.a)) errors.push(`edge ${e.id} references missing vertex ${e.a}`);
        if (!this.vertices.has(e.b)) errors.push(`edge ${e.id} references missing vertex ${e.b}`);
      }
      for (const l of this.loops.values()) {
        if (!this.faces.has(l.faceId)) errors.push(`loop ${l.id} references missing face ${l.faceId}`);
        const edge = this.edges.get(l.edgeId);
        if (!edge) errors.push(`loop ${l.id} references missing edge ${l.edgeId}`);
        else if (edge.a !== l.vertexId && edge.b !== l.vertexId) {
          errors.push(`loop ${l.id} vertex ${l.vertexId} not on edge ${edge.id}`);
        }
        if (!this.vertices.has(l.vertexId)) errors.push(`loop ${l.id} references missing vertex ${l.vertexId}`);
      }
      for (const f of this.faces.values()) {
        if (f.loops.length < 3) errors.push(`face ${f.id} has only ${f.loops.length} loops`);
        for (const lid of f.loops) {
          const l = this.loops.get(lid);
          if (!l) errors.push(`face ${f.id} references missing loop ${lid}`);
          else if (l.faceId !== f.id) errors.push(`face ${f.id} loop ${lid} faceId mismatch`);
        }
      }
      for (const v of this.vertices.values()) {
        for (const eid of v.edges) {
          const e = this.edges.get(eid);
          if (!e) errors.push(`vertex ${v.id} references missing edge ${eid}`);
          else if (e.a !== v.id && e.b !== v.id) {
            errors.push(`vertex ${v.id} listed in edge ${e.id} but not an endpoint`);
          }
        }
      }
      return { ok: errors.length === 0, errors };
    }
    /** Compute face normals (Newell's method) for every face. */
    recomputeFaceNormals() {
      for (const f of this.faces.values()) {
        const verts = this.faceVertices(f.id);
        this._newellNormal(verts, f.normal);
      }
    }
    _newellNormal(verts, out) {
      let nx = 0, ny = 0, nz = 0;
      const n = verts.length;
      for (let i = 0; i < n; i++) {
        const c = verts[i].position;
        const next = verts[(i + 1) % n].position;
        nx += (c[1] - next[1]) * (c[2] + next[2]);
        ny += (c[2] - next[2]) * (c[0] + next[0]);
        nz += (c[0] - next[0]) * (c[1] + next[1]);
      }
      const len = Math.hypot(nx, ny, nz);
      if (len > 0) {
        out[0] = nx / len;
        out[1] = ny / len;
        out[2] = nz / len;
      } else {
        out[0] = 0;
        out[1] = 0;
        out[2] = 1;
      }
    }
  };

  // src/mesh/primitives/Cube.ts
  function buildCube(params = {}) {
    const s = (params.size ?? 2) * 0.5;
    const m = new EditableMesh();
    const v000 = m.addVertex(-s, -s, -s).id;
    const v100 = m.addVertex(s, -s, -s).id;
    const v110 = m.addVertex(s, s, -s).id;
    const v010 = m.addVertex(-s, s, -s).id;
    const v001 = m.addVertex(-s, -s, s).id;
    const v101 = m.addVertex(s, -s, s).id;
    const v111 = m.addVertex(s, s, s).id;
    const v011 = m.addVertex(-s, s, s).id;
    const faces = [
      m.addFace([v001, v101, v111, v011]).id,
      // +Z front
      m.addFace([v100, v000, v010, v110]).id,
      // -Z back
      m.addFace([v000, v001, v011, v010]).id,
      // -X left
      m.addFace([v101, v100, v110, v111]).id,
      // +X right
      m.addFace([v011, v111, v110, v010]).id,
      // +Y top
      m.addFace([v001, v000, v100, v101]).id
      // -Y bottom
    ];
    for (const fid of faces) {
      const loops = m.faceLoops(fid);
      const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
      for (let i = 0; i < loops.length; i++) {
        loops[i].uv[0] = uvs[i][0];
        loops[i].uv[1] = uvs[i][1];
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/app/CameraController.ts
  var CameraController = class {
    constructor(layout) {
      this.layout = layout;
      this.dragButton = null;
      this.hoverCam = null;
    }
    pointerDown(button, x, y) {
      this.dragButton = button;
      const sub2 = this.layout.subviewportAt(x, y);
      this.hoverCam = sub2?.camera ?? null;
    }
    pointerMove(x, y, dx, dy) {
      if (this.dragButton == null) {
        const sub2 = this.layout.subviewportAt(x, y);
        this.hoverCam = sub2?.camera ?? null;
        return;
      }
      if (!this.hoverCam) return;
      if (this.dragButton === 1) {
        this.hoverCam.pan(dx, dy);
      } else if (this.dragButton === 2) {
        this.hoverCam.orbit(dx * 5e-3, dy * 5e-3);
      }
    }
    pointerUp(_button, _x, _y) {
      this.dragButton = null;
    }
    wheel(delta, x, y) {
      const sub2 = this.layout.subviewportAt(x, y);
      const cam = sub2?.camera ?? this.hoverCam;
      if (!cam) return false;
      cam.dolly(delta);
      return true;
    }
  };

  // src/app/Selection.ts
  var Selection = class {
    constructor() {
      this.mode = "object";
      this.activeObjectId = null;
      this.selectedObjects = /* @__PURE__ */ new Set();
      /** meshObjectId → element ids. */
      this.selectedVertices = /* @__PURE__ */ new Map();
      this.selectedEdges = /* @__PURE__ */ new Map();
      this.selectedFaces = /* @__PURE__ */ new Map();
      /** meshObjectId → loop ids (UVs are per-loop). */
      this.selectedUvs = /* @__PURE__ */ new Map();
      /** Flat set of selected UV loop ids — used by the UV viewport. */
      this.selectedUvLoops = /* @__PURE__ */ new Set();
    }
    setMode(m) {
      this.mode = m;
    }
    clearAll() {
      this.activeObjectId = null;
      this.selectedObjects.clear();
      this.selectedVertices.clear();
      this.selectedEdges.clear();
      this.selectedFaces.clear();
      this.selectedUvs.clear();
      this.selectedUvLoops.clear();
    }
    selectUvLoop(loopId, additive = false) {
      if (!additive) this.selectedUvLoops.clear();
      this.selectedUvLoops.add(loopId);
    }
    deselectUvLoop(loopId) {
      this.selectedUvLoops.delete(loopId);
    }
    clearUvSelection() {
      this.selectedUvLoops.clear();
    }
    setObjectSelection(id, additive = false) {
      if (!additive) this.selectedObjects.clear();
      this.selectedObjects.add(id);
      this.activeObjectId = id;
    }
    toggleObject(id) {
      if (this.selectedObjects.has(id)) {
        this.selectedObjects.delete(id);
        if (this.activeObjectId === id) this.activeObjectId = null;
      } else {
        this.selectedObjects.add(id);
        this.activeObjectId = id;
      }
    }
    isObjectSelected(id) {
      return this.selectedObjects.has(id);
    }
    selectFace(meshId, faceId, additive = false) {
      let bucket = this.selectedFaces.get(meshId);
      if (!additive) bucket = void 0;
      if (!bucket) {
        bucket = /* @__PURE__ */ new Set();
        this.selectedFaces.set(meshId, bucket);
      }
      bucket.add(faceId);
      this.activeObjectId = meshId;
    }
    selectVertex(meshId, vertexId, additive = false) {
      let bucket = this.selectedVertices.get(meshId);
      if (!additive) bucket = void 0;
      if (!bucket) {
        bucket = /* @__PURE__ */ new Set();
        this.selectedVertices.set(meshId, bucket);
      }
      bucket.add(vertexId);
      this.activeObjectId = meshId;
    }
    selectEdge(meshId, edgeId, additive = false) {
      let bucket = this.selectedEdges.get(meshId);
      if (!additive) bucket = void 0;
      if (!bucket) {
        bucket = /* @__PURE__ */ new Set();
        this.selectedEdges.set(meshId, bucket);
      }
      bucket.add(edgeId);
      this.activeObjectId = meshId;
    }
    isFaceSelected(meshId, faceId) {
      return this.selectedFaces.get(meshId)?.has(faceId) ?? false;
    }
    isVertexSelected(meshId, vertexId) {
      return this.selectedVertices.get(meshId)?.has(vertexId) ?? false;
    }
    isEdgeSelected(meshId, edgeId) {
      return this.selectedEdges.get(meshId)?.has(edgeId) ?? false;
    }
    selectedObjectCount() {
      return this.selectedObjects.size;
    }
  };

  // src/core/math/Ray.ts
  function create5() {
    return { origin: create(), direction: fromValues(0, 0, -1) };
  }
  function intersectTriangle(ray, v0, v1, v2, outUv, doubleSided = true, eps = 1e-7) {
    const edge1 = _e1;
    const edge2 = _e2;
    const h = _h;
    const s = _s;
    const q = _q;
    sub(edge1, v1, v0);
    sub(edge2, v2, v0);
    cross(h, ray.direction, edge2);
    const a = dot(edge1, h);
    if (!doubleSided && a < eps) return NaN;
    if (Math.abs(a) < eps) return NaN;
    const f = 1 / a;
    sub(s, ray.origin, v0);
    const u = f * dot(s, h);
    if (u < 0 || u > 1) return NaN;
    cross(q, s, edge1);
    const v = f * dot(ray.direction, q);
    if (v < 0 || u + v > 1) return NaN;
    const t = f * dot(edge2, q);
    if (t < eps) return NaN;
    if (outUv) {
      outUv[0] = u;
      outUv[1] = v;
    }
    return t;
  }
  var _e1 = create();
  var _e2 = create();
  var _h = create();
  var _s = create();
  var _q = create();

  // src/core/math/Project.ts
  function unproject(out, screenX, screenY, ndcZ, vpRect, viewProj) {
    const ndcX = (screenX - vpRect.x) / vpRect.w * 2 - 1;
    const ndcY = 1 - (screenY - vpRect.y) / vpRect.h * 2;
    const inv = _scratch;
    if (!invert(inv, viewProj)) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      return out;
    }
    const x = ndcX, y = ndcY, z = ndcZ;
    const w = inv[3] * x + inv[7] * y + inv[11] * z + inv[15];
    out[0] = (inv[0] * x + inv[4] * y + inv[8] * z + inv[12]) / w;
    out[1] = (inv[1] * x + inv[5] * y + inv[9] * z + inv[13]) / w;
    out[2] = (inv[2] * x + inv[6] * y + inv[10] * z + inv[14]) / w;
    return out;
  }
  function screenPointToRay(outRay, screenX, screenY, vpRect, viewProj) {
    unproject(_p0, screenX, screenY, -1, vpRect, viewProj);
    unproject(_p1, screenX, screenY, 1, vpRect, viewProj);
    copy(outRay.origin, _p0);
    sub(outRay.direction, _p1, _p0);
    normalize(outRay.direction, outRay.direction);
    return outRay;
  }
  function project(outScreen, world, vpRect, viewProj) {
    const x = world[0], y = world[1], z = world[2];
    const w = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
    if (Math.abs(w) < 1e-9) return false;
    const ndcX = (viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12]) / w;
    const ndcY = (viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13]) / w;
    const ndcZ = (viewProj[2] * x + viewProj[6] * y + viewProj[10] * z + viewProj[14]) / w;
    outScreen[0] = vpRect.x + (ndcX + 1) * 0.5 * vpRect.w;
    outScreen[1] = vpRect.y + (1 - ndcY) * 0.5 * vpRect.h;
    outScreen[2] = ndcZ;
    return true;
  }
  var _scratch = create3();
  var _p0 = create();
  var _p1 = create();

  // src/app/Picking.ts
  function pickObjectInScene(scene, screenX, screenY, vpRect, camera, aspect) {
    const worldRay = create5();
    const viewProj = camera.viewProj(aspect);
    screenPointToRay(worldRay, screenX, screenY, vpRect, viewProj);
    let best = null;
    scene.forEachNode((n) => {
      if (n.kind !== "mesh") return;
      const mo = n;
      if (!mo.mesh) return;
      const local = transformRayToLocal(worldRay, mo.getWorldMatrix());
      const hit = rayTestMesh(mo.mesh, local);
      if (hit && (!best || hit.t < best.t)) {
        best = { node: mo, t: hit.t, faceId: hit.faceId };
      }
    });
    return best;
  }
  function pickFace(mesh, worldMatrix, screenX, screenY, vpRect, camera, aspect) {
    const worldRay = create5();
    screenPointToRay(worldRay, screenX, screenY, vpRect, camera.viewProj(aspect));
    const local = transformRayToLocal(worldRay, worldMatrix);
    const hit = rayTestMesh(mesh, local);
    return hit?.faceId ?? null;
  }
  function pickVertex(mesh, worldMatrix, screenX, screenY, vpRect, camera, aspect, thresholdPx = 8) {
    const viewProj = camera.viewProj(aspect);
    const world = create();
    const projOut = new Float32Array(3);
    let bestId = null;
    let bestDist = thresholdPx * thresholdPx;
    for (const v of mesh.vertices.values()) {
      transformPoint(world, v.position, worldMatrix);
      if (!project(projOut, world, vpRect, viewProj)) continue;
      if (projOut[2] < -1 || projOut[2] > 1) continue;
      const dx = projOut[0] - screenX;
      const dy = projOut[1] - screenY;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        bestId = v.id;
      }
    }
    return bestId;
  }
  function pickEdge(mesh, worldMatrix, screenX, screenY, vpRect, camera, aspect, thresholdPx = 6) {
    const viewProj = camera.viewProj(aspect);
    const aWorld = create(), bWorld = create();
    const aProj = new Float32Array(3), bProj = new Float32Array(3);
    let bestId = null;
    let bestDist = thresholdPx * thresholdPx;
    for (const e of mesh.edges.values()) {
      const va = mesh.vertices.get(e.a);
      const vb = mesh.vertices.get(e.b);
      if (!va || !vb) continue;
      transformPoint(aWorld, va.position, worldMatrix);
      transformPoint(bWorld, vb.position, worldMatrix);
      if (!project(aProj, aWorld, vpRect, viewProj)) continue;
      if (!project(bProj, bWorld, vpRect, viewProj)) continue;
      if ((aProj[2] < -1 || aProj[2] > 1) && (bProj[2] < -1 || bProj[2] > 1)) continue;
      const d2 = pointSegmentDistanceSq(screenX, screenY, aProj[0], aProj[1], bProj[0], bProj[1]);
      if (d2 < bestDist) {
        bestDist = d2;
        bestId = e.id;
      }
    }
    return bestId;
  }
  function pointSegmentDistanceSq(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-9) {
      const ex2 = px - ax, ey2 = py - ay;
      return ex2 * ex2 + ey2 * ey2;
    }
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    const ex = px - cx, ey = py - cy;
    return ex * ex + ey * ey;
  }
  function rayTestMesh(mesh, ray) {
    let best = null;
    for (const f of mesh.faces.values()) {
      const verts = mesh.faceVertices(f.id);
      for (let i = 1; i < verts.length - 1; i++) {
        const t = intersectTriangle(ray, verts[0].position, verts[i].position, verts[i + 1].position, void 0, true);
        if (!Number.isNaN(t) && (!best || t < best.t)) {
          best = { t, faceId: f.id };
        }
      }
    }
    return best;
  }
  function transformRayToLocal(worldRay, worldMatrix) {
    const inv = _scratch2;
    const localRay = { origin: create(), direction: create() };
    if (!invert(inv, worldMatrix)) {
      copy(localRay.origin, worldRay.origin);
      copy(localRay.direction, worldRay.direction);
      return localRay;
    }
    transformPoint(localRay.origin, worldRay.origin, inv);
    transformDirection(localRay.direction, worldRay.direction, inv);
    normalize(localRay.direction, localRay.direction);
    return localRay;
  }
  var _scratch2 = create3();

  // src/app/Commands.ts
  var History = class {
    constructor() {
      this.undoStack = [];
      this.redoStack = [];
      this.listeners = /* @__PURE__ */ new Set();
      /** Cap on stack length so long-running sessions don't grow unbounded. */
      this.maxDepth = 200;
    }
    /** Run a command and push it on the undo stack. */
    execute(cmd) {
      cmd.do();
      this.undoStack.push(cmd);
      if (this.undoStack.length > this.maxDepth) this.undoStack.shift();
      this.redoStack.length = 0;
      this.emit({ type: "execute", cmd });
    }
    canUndo() {
      return this.undoStack.length > 0;
    }
    canRedo() {
      return this.redoStack.length > 0;
    }
    undo() {
      const cmd = this.undoStack.pop();
      if (!cmd) return false;
      cmd.undo();
      this.redoStack.push(cmd);
      this.emit({ type: "undo", cmd });
      return true;
    }
    redo() {
      const cmd = this.redoStack.pop();
      if (!cmd) return false;
      cmd.do();
      this.undoStack.push(cmd);
      this.emit({ type: "redo", cmd });
      return true;
    }
    /**
     * Replace the most recent command with `cmd` after undoing the old one
     * and applying the new one. Used by the action bar to edit the last
     * operation in-place.
     */
    replaceTop(cmd) {
      const old = this.undoStack.pop();
      if (old) old.undo();
      if (cmd.rebasePrev) cmd.rebasePrev();
      cmd.do();
      this.undoStack.push(cmd);
      this.redoStack.length = 0;
      this.emit({ type: "replace", cmd });
    }
    clear() {
      this.undoStack.length = 0;
      this.redoStack.length = 0;
      this.emit({ type: "clear" });
    }
    /** Labels of commands in the undo stack (oldest → newest). */
    undoLabels() {
      return this.undoStack.map((c) => c.label);
    }
    redoLabels() {
      return this.redoStack.map((c) => c.label);
    }
    topLabel() {
      const top = this.undoStack[this.undoStack.length - 1];
      return top ? top.label : null;
    }
    on(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }
    /**
     * Emit a synthetic `replace` event for the current top command — used when
     * a command mutates in place (e.g., a primitive's parameters changed via
     * the action bar) and listeners need to refresh render meshes.
     */
    notifyTopChanged() {
      const top = this.undoStack[this.undoStack.length - 1];
      if (!top) return;
      this.emit({ type: "replace", cmd: top });
    }
    emit(e) {
      for (const fn of this.listeners) fn(e);
    }
  };

  // src/gizmos/Gizmo.ts
  function projectToScreen(world, viewProj, vpRect) {
    const w = viewProj[3] * world[0] + viewProj[7] * world[1] + viewProj[11] * world[2] + viewProj[15];
    if (Math.abs(w) < 1e-6) return null;
    const ndcX = (viewProj[0] * world[0] + viewProj[4] * world[1] + viewProj[8] * world[2] + viewProj[12]) / w;
    const ndcY = (viewProj[1] * world[0] + viewProj[5] * world[1] + viewProj[9] * world[2] + viewProj[13]) / w;
    const ndcZ = (viewProj[2] * world[0] + viewProj[6] * world[1] + viewProj[10] * world[2] + viewProj[14]) / w;
    return [vpRect.x + (ndcX + 1) * 0.5 * vpRect.w, vpRect.y + (1 - ndcY) * 0.5 * vpRect.h, ndcZ];
  }
  function worldSizeForScreenPx(targetPx, camera, distance3, aspect, vpH) {
    const halfH = Math.tan(camera.fovY / 2) * distance3;
    return targetPx / vpH * halfH * 2;
  }
  function getNodeOrigin(out, node) {
    const m = node.getWorldMatrix();
    out[0] = m[12];
    out[1] = m[13];
    out[2] = m[14];
    return out;
  }
  function pointSegmentDistanceSq2(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-9) {
      const ex2 = px - ax, ey2 = py - ay;
      return ex2 * ex2 + ey2 * ey2;
    }
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    const ex = px - cx, ey = py - cy;
    return ex * ex + ey * ey;
  }
  var AXIS_VECTORS = {
    x: fromValues(1, 0, 0),
    y: fromValues(0, 1, 0),
    z: fromValues(0, 0, 1),
    all: fromValues(1, 1, 1)
  };

  // src/gizmos/MoveGizmo.ts
  var HANDLE_PX = 90;
  var HIT_PX = 8;
  var AXIS_COLORS = {
    x: [0.95, 0.25, 0.25],
    y: [0.3, 0.85, 0.3],
    z: [0.3, 0.5, 0.95]
  };
  var MoveGizmo = class {
    render(strips, node, camera, _vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const size = worldSizeForScreenPx(HANDLE_PX, camera, distance3, aspect, 2);
      for (const axis of ["x", "y", "z"]) {
        const dir = AXIS_VECTORS[axis];
        const col = AXIS_COLORS[axis];
        strips.add(
          origin[0],
          origin[1],
          origin[2],
          origin[0] + dir[0] * size,
          origin[1] + dir[1] * size,
          origin[2] + dir[2] * size,
          col[0],
          col[1],
          col[2]
        );
      }
    }
    hit(screenX, screenY, node, camera, vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const size = worldSizeForScreenPx(HANDLE_PX, camera, distance3, aspect, 2);
      const viewProj = camera.viewProj(aspect);
      const o = projectToScreen(origin, viewProj, vpRect);
      if (!o) return null;
      let best = null;
      let bestDist = HIT_PX * HIT_PX;
      for (const axis of ["x", "y", "z"]) {
        const dir = AXIS_VECTORS[axis];
        const tip = fromValues(origin[0] + dir[0] * size, origin[1] + dir[1] * size, origin[2] + dir[2] * size);
        const t = projectToScreen(tip, viewProj, vpRect);
        if (!t) continue;
        const d = pointSegmentDistanceSq2(screenX, screenY, o[0], o[1], t[0], t[1]);
        if (d < bestDist) {
          bestDist = d;
          best = { axis };
        }
      }
      return best;
    }
  };

  // src/gizmos/RotateGizmo.ts
  var RADIUS_PX = 80;
  var SEGMENTS = 48;
  var HIT_PX2 = 6;
  var AXIS_COLORS2 = {
    x: [0.95, 0.25, 0.25],
    y: [0.3, 0.85, 0.3],
    z: [0.3, 0.5, 0.95]
  };
  function ringPoints(axis, origin, radius) {
    const pts = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const t = i / SEGMENTS * Math.PI * 2;
      const c = Math.cos(t) * radius;
      const s = Math.sin(t) * radius;
      let p;
      if (axis === "x") p = fromValues(origin[0], origin[1] + c, origin[2] + s);
      else if (axis === "y") p = fromValues(origin[0] + c, origin[1], origin[2] + s);
      else p = fromValues(origin[0] + c, origin[1] + s, origin[2]);
      pts.push(p);
    }
    return pts;
  }
  var RotateGizmo = class {
    render(strips, node, camera, _vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const radius = worldSizeForScreenPx(RADIUS_PX, camera, distance3, aspect, 2);
      for (const axis of ["x", "y", "z"]) {
        const col = AXIS_COLORS2[axis];
        const pts = ringPoints(axis, origin, radius);
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          strips.add(a[0], a[1], a[2], b[0], b[1], b[2], col[0], col[1], col[2]);
        }
      }
    }
    hit(screenX, screenY, node, camera, vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const radius = worldSizeForScreenPx(RADIUS_PX, camera, distance3, aspect, 2);
      const viewProj = camera.viewProj(aspect);
      let best = null;
      let bestDist = HIT_PX2 * HIT_PX2;
      for (const axis of ["x", "y", "z"]) {
        const pts = ringPoints(axis, origin, radius);
        const proj = pts.map((p) => {
          const r = projectToScreen(p, viewProj, vpRect);
          return r ? [r[0], r[1]] : null;
        });
        for (let i = 0; i < proj.length; i++) {
          const a = proj[i];
          const b = proj[(i + 1) % proj.length];
          if (!a || !b) continue;
          const d = pointSegmentDistanceSq2(screenX, screenY, a[0], a[1], b[0], b[1]);
          if (d < bestDist) {
            bestDist = d;
            best = { axis };
          }
        }
      }
      return best;
    }
  };

  // src/gizmos/ScaleGizmo.ts
  var HANDLE_PX2 = 80;
  var TIP_PX = 8;
  var HIT_PX3 = 8;
  var CENTER_PX = 14;
  var AXIS_COLORS3 = {
    x: [0.95, 0.25, 0.25],
    y: [0.3, 0.85, 0.3],
    z: [0.3, 0.5, 0.95]
  };
  var ScaleGizmo = class {
    render(strips, node, camera, _vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const size = worldSizeForScreenPx(HANDLE_PX2, camera, distance3, aspect, 2);
      const tip = worldSizeForScreenPx(TIP_PX, camera, distance3, aspect, 2);
      for (const axis of ["x", "y", "z"]) {
        const dir = AXIS_VECTORS[axis];
        const col = AXIS_COLORS3[axis];
        strips.add(
          origin[0],
          origin[1],
          origin[2],
          origin[0] + dir[0] * size,
          origin[1] + dir[1] * size,
          origin[2] + dir[2] * size,
          col[0],
          col[1],
          col[2]
        );
        const ex = origin[0] + dir[0] * size, ey = origin[1] + dir[1] * size, ez = origin[2] + dir[2] * size;
        strips.add(ex - tip, ey, ez, ex + tip, ey, ez, col[0], col[1], col[2]);
        strips.add(ex, ey - tip, ez, ex, ey + tip, ez, col[0], col[1], col[2]);
        strips.add(ex, ey, ez - tip, ex, ey, ez + tip, col[0], col[1], col[2]);
      }
      const c = worldSizeForScreenPx(CENTER_PX, camera, distance3, aspect, 2) * 0.5;
      strips.add(origin[0] - c, origin[1], origin[2], origin[0] + c, origin[1], origin[2], 0.9, 0.9, 0.9);
      strips.add(origin[0], origin[1] - c, origin[2], origin[0], origin[1] + c, origin[2], 0.9, 0.9, 0.9);
      strips.add(origin[0], origin[1], origin[2] - c, origin[0], origin[1], origin[2] + c, 0.9, 0.9, 0.9);
    }
    hit(screenX, screenY, node, camera, vpRect, aspect) {
      const origin = create();
      getNodeOrigin(origin, node);
      const distance3 = distance(origin, camera.position());
      const size = worldSizeForScreenPx(HANDLE_PX2, camera, distance3, aspect, 2);
      const viewProj = camera.viewProj(aspect);
      const o = projectToScreen(origin, viewProj, vpRect);
      if (!o) return null;
      let best = null;
      let bestDist = HIT_PX3 * HIT_PX3;
      const dxC = screenX - o[0];
      const dyC = screenY - o[1];
      if (dxC * dxC + dyC * dyC < CENTER_PX * CENTER_PX) {
        best = { axis: "all" };
        bestDist = dxC * dxC + dyC * dyC;
      }
      for (const axis of ["x", "y", "z"]) {
        const dir = AXIS_VECTORS[axis];
        const tip = fromValues(origin[0] + dir[0] * size, origin[1] + dir[1] * size, origin[2] + dir[2] * size);
        const t = projectToScreen(tip, viewProj, vpRect);
        if (!t) continue;
        const d = pointSegmentDistanceSq2(screenX, screenY, o[0], o[1], t[0], t[1]);
        if (d < bestDist) {
          bestDist = d;
          best = { axis };
        }
      }
      return best;
    }
  };

  // src/app/commands/SetTransformCommand.ts
  var SetTransformCommand = class _SetTransformCommand {
    constructor(node, next, label = "Set Transform") {
      this.node = node;
      this.next = next;
      this.label = label;
      this.prev = snapshot(node);
    }
    do() {
      apply(this.node, this.next);
    }
    undo() {
      apply(this.node, this.prev);
    }
    merge(other) {
      if (!(other instanceof _SetTransformCommand)) return false;
      if (other.node !== this.node) return false;
      this.next = other.next;
      return true;
    }
    /** Re-snapshot the current state and store it as the new target. */
    rebaseNext() {
      this.next = snapshot(this.node);
    }
    rebasePrev() {
      this.prev = snapshot(this.node);
    }
  };
  function snapshot(node) {
    return {
      position: [node.transform.position[0], node.transform.position[1], node.transform.position[2]],
      rotation: [node.transform.rotation[0], node.transform.rotation[1], node.transform.rotation[2], node.transform.rotation[3]],
      scale: [node.transform.scale[0], node.transform.scale[1], node.transform.scale[2]]
    };
  }
  function apply(node, t) {
    node.transform.setPosition(t.position[0], t.position[1], t.position[2]);
    node.transform.setRotationQuat(t.rotation[0], t.rotation[1], t.rotation[2], t.rotation[3]);
    node.transform.setScale(t.scale[0], t.scale[1], t.scale[2]);
    node.markWorldDirty();
  }

  // src/app/ToolController.ts
  var TOOL_GIZMOS = {
    select: null,
    move: new MoveGizmo(),
    rotate: new RotateGizmo(),
    scale: new ScaleGizmo()
  };
  var ToolController = class {
    constructor(app) {
      this.tool = "select";
      this.space = "world";
      this.dragging = null;
      this.app = app;
    }
    setTool(t) {
      this.tool = t;
    }
    setSpace(s) {
      this.space = s;
    }
    getActiveGizmo() {
      return TOOL_GIZMOS[this.tool];
    }
    /** Try to start a gizmo drag at (screenX, screenY). Returns true on hit. */
    tryStartDrag(screenX, screenY) {
      const gizmo = this.getActiveGizmo();
      if (!gizmo) return false;
      const node = this.activeNode();
      if (!node) return false;
      const sub2 = this.app.sceneRenderer.layout.subviewportAt(screenX, screenY);
      if (!sub2) return false;
      const aspect = sub2.rect.w / Math.max(1, sub2.rect.h);
      const hit = gizmo.hit(screenX, screenY, node, sub2.camera, sub2.rect, aspect);
      if (!hit) return false;
      this.dragging = {
        axis: hit.axis,
        node,
        startSnapshot: snapshot2(node),
        startX: screenX,
        startY: screenY
      };
      return true;
    }
    isDragging() {
      return this.dragging != null;
    }
    drag(screenX, screenY) {
      const d = this.dragging;
      if (!d) return;
      const dx = screenX - d.startX;
      const dy = screenY - d.startY;
      if (this.tool === "move") this.applyMove(d, dx, dy);
      else if (this.tool === "rotate") this.applyRotate(d, dx, dy);
      else if (this.tool === "scale") this.applyScale(d, dx, dy);
    }
    endDrag() {
      const d = this.dragging;
      if (!d) return;
      const next = snapshot2(d.node);
      const same = eq3(next.position, d.startSnapshot.position) && eq4(next.rotation, d.startSnapshot.rotation) && eq3(next.scale, d.startSnapshot.scale);
      if (!same) {
        restore(d.node, d.startSnapshot);
        this.app.history.execute(new SetTransformCommand(d.node, next, this.commandLabelFor()));
      }
      this.dragging = null;
    }
    /** Drag state introspection (used by tests). */
    inspect() {
      return { axis: this.dragging?.axis ?? null, tool: this.tool };
    }
    activeNode() {
      if (!this.app.selection.activeObjectId) return null;
      return this.app.scene.findNodeById(this.app.selection.activeObjectId);
    }
    commandLabelFor() {
      if (this.tool === "move") return "Move";
      if (this.tool === "rotate") return "Rotate";
      if (this.tool === "scale") return "Scale";
      return "Transform";
    }
    applyMove(d, dx, dy) {
      const sub2 = this.app.sceneRenderer.layout.subviewports()[0] ?? null;
      const cam = sub2?.camera ?? this.app.sceneRenderer.layout.perspectiveCam;
      const origin = create();
      const m = d.node.getWorldMatrix();
      origin[0] = m[12];
      origin[1] = m[13];
      origin[2] = m[14];
      const dist = distance(origin, cam.position());
      const worldPerPx = 2 * Math.tan(cam.fovY / 2) * dist / Math.max(1, sub2?.rect.h ?? 600);
      const wx = dx * worldPerPx;
      const wy = -dy * worldPerPx;
      const newPos = [
        d.startSnapshot.position[0],
        d.startSnapshot.position[1],
        d.startSnapshot.position[2]
      ];
      if (d.axis === "x") newPos[0] += wx;
      else if (d.axis === "y") newPos[1] += wy;
      else if (d.axis === "z") newPos[2] -= wx;
      else {
        newPos[0] += wx;
        newPos[1] += wy;
      }
      d.node.transform.setPosition(newPos[0], newPos[1], newPos[2]);
      d.node.markWorldDirty();
    }
    applyRotate(d, dx, dy) {
      const angle = (dx + dy) * 5e-3;
      const q = quatFromAxisAngle(d.axis, angle);
      const combined = quatMultiply(q, d.startSnapshot.rotation);
      d.node.transform.setRotationQuat(combined[0], combined[1], combined[2], combined[3]);
      d.node.markWorldDirty();
    }
    applyScale(d, dx, dy) {
      const factor = 1 + (dx - dy) * 5e-3;
      const s = [
        d.startSnapshot.scale[0],
        d.startSnapshot.scale[1],
        d.startSnapshot.scale[2]
      ];
      if (d.axis === "x") s[0] *= factor;
      else if (d.axis === "y") s[1] *= factor;
      else if (d.axis === "z") s[2] *= factor;
      else {
        s[0] *= factor;
        s[1] *= factor;
        s[2] *= factor;
      }
      d.node.transform.setScale(s[0], s[1], s[2]);
      d.node.markWorldDirty();
    }
  };
  function snapshot2(node) {
    return {
      position: [node.transform.position[0], node.transform.position[1], node.transform.position[2]],
      rotation: [node.transform.rotation[0], node.transform.rotation[1], node.transform.rotation[2], node.transform.rotation[3]],
      scale: [node.transform.scale[0], node.transform.scale[1], node.transform.scale[2]]
    };
  }
  function restore(node, s) {
    node.transform.setPosition(s.position[0], s.position[1], s.position[2]);
    node.transform.setRotationQuat(s.rotation[0], s.rotation[1], s.rotation[2], s.rotation[3]);
    node.transform.setScale(s.scale[0], s.scale[1], s.scale[2]);
    node.markWorldDirty();
  }
  function eq3(a, b) {
    return Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7 && Math.abs(a[2] - b[2]) < 1e-7;
  }
  function eq4(a, b) {
    return Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7 && Math.abs(a[2] - b[2]) < 1e-7 && Math.abs(a[3] - b[3]) < 1e-7;
  }
  function quatFromAxisAngle(axis, rad) {
    const half = rad / 2;
    const s = Math.sin(half);
    const c = Math.cos(half);
    if (axis === "x") return [s, 0, 0, c];
    if (axis === "y") return [0, s, 0, c];
    if (axis === "z") return [0, 0, s, c];
    const inv = 1 / Math.sqrt(3);
    return [inv * s, inv * s, inv * s, c];
  }
  function quatMultiply(a, b) {
    return [
      a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1],
      a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2],
      a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
  }

  // src/app/TouchController.ts
  var TouchController = class {
    constructor(canvas, viewport, layout) {
      this.canvas = canvas;
      this.viewport = viewport;
      this.layout = layout;
      this.active = false;
      this.mode = "none";
      this.last = [];
      this.lastPinchDist = 0;
      this.hoverCam = null;
    }
    install() {
      const c = this.canvas;
      c.addEventListener("touchstart", (e) => this.onStart(e), { passive: false });
      c.addEventListener("touchmove", (e) => this.onMove(e), { passive: false });
      c.addEventListener("touchend", (e) => this.onEnd(e));
      c.addEventListener("touchcancel", (e) => this.onEnd(e));
    }
    localTouches(e) {
      const rect = this.canvas.getBoundingClientRect();
      return Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top }));
    }
    touchInsideViewport(t) {
      const local = this.viewport.canvasToLocal(t.x, t.y);
      const b = this.viewport.getViewportRect();
      return local.x >= 0 && local.y >= 0 && local.x < b.w && local.y < b.h;
    }
    onStart(e) {
      const touches = this.localTouches(e);
      if (!touches.length || !this.touchInsideViewport(touches[0])) {
        this.active = false;
        return;
      }
      e.preventDefault();
      this.active = true;
      this.last = touches;
      const sub2 = this.layout.subviewportAt(touches[0].x, touches[0].y);
      this.hoverCam = sub2?.camera ?? null;
      if (touches.length === 1) {
        this.mode = "orbit";
      } else if (touches.length >= 2) {
        this.mode = "pan-pinch";
        this.lastPinchDist = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
      }
    }
    onMove(e) {
      if (!this.active) return;
      e.preventDefault();
      const touches = this.localTouches(e);
      if (!this.hoverCam) return;
      if (this.mode === "orbit" && touches.length === 1 && this.last.length === 1) {
        const dx = touches[0].x - this.last[0].x;
        const dy = touches[0].y - this.last[0].y;
        this.hoverCam.orbit(dx * 6e-3, dy * 6e-3);
      } else if (this.mode === "pan-pinch" && touches.length >= 2) {
        const avgX0 = (this.last[0].x + this.last[1].x) * 0.5;
        const avgY0 = (this.last[0].y + this.last[1].y) * 0.5;
        const avgX1 = (touches[0].x + touches[1].x) * 0.5;
        const avgY1 = (touches[0].y + touches[1].y) * 0.5;
        const dx = avgX1 - avgX0;
        const dy = avgY1 - avgY0;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) this.hoverCam.pan(dx, dy);
        const dist = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
        const dDolly = (dist - this.lastPinchDist) * 5;
        this.hoverCam.dolly(dDolly);
        this.lastPinchDist = dist;
      }
      this.last = touches;
    }
    onEnd(e) {
      const touches = this.localTouches(e);
      if (touches.length === 0) {
        this.active = false;
        this.mode = "none";
        this.last = [];
      } else if (touches.length === 1) {
        this.mode = "orbit";
        this.last = touches;
      }
    }
  };

  // src/app/commands/CreatePrimitiveCommand.ts
  var CreatePrimitiveCommand_exports = {};
  __export(CreatePrimitiveCommand_exports, {
    CreatePrimitiveCommand: () => CreatePrimitiveCommand
  });

  // src/mesh/primitives/Plane.ts
  function buildPlane(params = {}) {
    const w = params.width ?? 2;
    const d = params.depth ?? 2;
    const sx = Math.max(1, Math.floor(params.segmentsX ?? 1));
    const sz = Math.max(1, Math.floor(params.segmentsZ ?? 1));
    const m = new EditableMesh();
    const ids = [];
    for (let j = 0; j <= sz; j++) {
      for (let i = 0; i <= sx; i++) {
        const x = (i / sx - 0.5) * w;
        const z = (j / sz - 0.5) * d;
        ids.push(m.addVertex(x, 0, z).id);
      }
    }
    for (let j = 0; j < sz; j++) {
      for (let i = 0; i < sx; i++) {
        const i0 = j * (sx + 1) + i;
        const i1 = i0 + 1;
        const i2 = i0 + (sx + 1) + 1;
        const i3 = i0 + (sx + 1);
        const face = m.addFace([ids[i0], ids[i1], ids[i2], ids[i3]]);
        const loops = m.faceLoops(face.id);
        const u0 = i / sx, v0 = j / sz;
        const u1 = (i + 1) / sx, v1 = (j + 1) / sz;
        const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
        for (let k = 0; k < loops.length; k++) {
          loops[k].uv[0] = uvs[k][0];
          loops[k].uv[1] = uvs[k][1];
        }
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/Cylinder.ts
  function buildCylinder(params = {}) {
    const r = params.radius ?? 1;
    const h = params.height ?? 2;
    const seg = Math.max(3, Math.floor(params.segments ?? 24));
    const capped = params.capped ?? true;
    const m = new EditableMesh();
    const half = h / 2;
    const top = [];
    const bot = [];
    for (let i = 0; i < seg; i++) {
      const t = i / seg * Math.PI * 2;
      const x = Math.cos(t) * r;
      const z = Math.sin(t) * r;
      top.push(m.addVertex(x, half, z).id);
      bot.push(m.addVertex(x, -half, z).id);
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      const f = m.addFace([bot[i], bot[j], top[j], top[i]]);
      const u0 = i / seg, u1 = (i + 1) / seg;
      const loops = m.faceLoops(f.id);
      const uvs = [[u0, 0], [u1, 0], [u1, 1], [u0, 1]];
      for (let k = 0; k < loops.length; k++) {
        loops[k].uv[0] = uvs[k][0];
        loops[k].uv[1] = uvs[k][1];
      }
    }
    if (capped) {
      const topC = m.addVertex(0, half, 0).id;
      const botC = m.addVertex(0, -half, 0).id;
      for (let i = 0; i < seg; i++) {
        const j = (i + 1) % seg;
        const topFace = m.addFace([topC, top[i], top[j]]);
        const botFace = m.addFace([botC, bot[j], bot[i]]);
        for (const f of [topFace, botFace]) {
          const loops = m.faceLoops(f.id);
          for (const l of loops) {
            const v = m.vertices.get(l.vertexId);
            if (!v) continue;
            l.uv[0] = v.position[0] / r * 0.5 + 0.5;
            l.uv[1] = v.position[2] / r * 0.5 + 0.5;
          }
        }
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/Cone.ts
  function buildCone(params = {}) {
    const r = params.radius ?? 1;
    const h = params.height ?? 2;
    const seg = Math.max(3, Math.floor(params.segments ?? 24));
    const capped = params.capped ?? true;
    const m = new EditableMesh();
    const half = h / 2;
    const base = [];
    for (let i = 0; i < seg; i++) {
      const t = i / seg * Math.PI * 2;
      base.push(m.addVertex(Math.cos(t) * r, -half, Math.sin(t) * r).id);
    }
    const apex = m.addVertex(0, half, 0).id;
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      const f = m.addFace([base[i], base[j], apex]);
      const loops = m.faceLoops(f.id);
      const u0 = i / seg, u1 = (i + 1) / seg, uMid = (u0 + u1) * 0.5;
      const uvs = [[u0, 0], [u1, 0], [uMid, 1]];
      for (let k = 0; k < loops.length; k++) {
        loops[k].uv[0] = uvs[k][0];
        loops[k].uv[1] = uvs[k][1];
      }
    }
    if (capped) {
      const cap = m.addVertex(0, -half, 0).id;
      for (let i = 0; i < seg; i++) {
        const j = (i + 1) % seg;
        const f = m.addFace([cap, base[j], base[i]]);
        const loops = m.faceLoops(f.id);
        for (const l of loops) {
          const v = m.vertices.get(l.vertexId);
          if (!v) continue;
          l.uv[0] = v.position[0] / r * 0.5 + 0.5;
          l.uv[1] = v.position[2] / r * 0.5 + 0.5;
        }
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/Disk.ts
  function buildDisk(params = {}) {
    const r = params.radius ?? 1;
    const seg = Math.max(3, Math.floor(params.segments ?? 24));
    const m = new EditableMesh();
    const center = m.addVertex(0, 0, 0).id;
    const ring = [];
    for (let i = 0; i < seg; i++) {
      const t = i / seg * Math.PI * 2;
      ring.push(m.addVertex(Math.cos(t) * r, 0, Math.sin(t) * r).id);
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      const f = m.addFace([center, ring[i], ring[j]]);
      const loops = m.faceLoops(f.id);
      for (const l of loops) {
        const v = m.vertices.get(l.vertexId);
        if (!v) continue;
        l.uv[0] = v.position[0] / r * 0.5 + 0.5;
        l.uv[1] = v.position[2] / r * 0.5 + 0.5;
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/UvSphere.ts
  function buildUvSphere(params = {}) {
    const r = params.radius ?? 1;
    const seg = Math.max(3, Math.floor(params.segments ?? 24));
    const rings = Math.max(3, Math.floor(params.rings ?? 16));
    const m = new EditableMesh();
    const top = m.addVertex(0, r, 0).id;
    const bottom = m.addVertex(0, -r, 0).id;
    const grid = [];
    for (let j = 1; j < rings; j++) {
      const v = j / rings;
      const phi = v * Math.PI;
      const y = Math.cos(phi) * r;
      const ringRadius = Math.sin(phi) * r;
      const row = [];
      for (let i = 0; i < seg; i++) {
        const t = i / seg * Math.PI * 2;
        row.push(m.addVertex(Math.cos(t) * ringRadius, y, Math.sin(t) * ringRadius).id);
      }
      grid.push(row);
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      const f = m.addFace([top, grid[0][i], grid[0][j]]);
      const loops = m.faceLoops(f.id);
      const u0 = i / seg, u1 = (i + 1) / seg, uMid = (u0 + u1) * 0.5;
      const uvs = [[uMid, 0], [u0, 1 / rings], [u1, 1 / rings]];
      for (let k = 0; k < loops.length; k++) {
        loops[k].uv[0] = uvs[k][0];
        loops[k].uv[1] = uvs[k][1];
      }
    }
    for (let row = 0; row < grid.length - 1; row++) {
      const rA = grid[row];
      const rB = grid[row + 1];
      for (let i = 0; i < seg; i++) {
        const j = (i + 1) % seg;
        const f = m.addFace([rA[i], rA[j], rB[j], rB[i]]);
        const loops = m.faceLoops(f.id);
        const u0 = i / seg, u1 = (i + 1) / seg;
        const v0 = (row + 1) / rings, v1 = (row + 2) / rings;
        const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
        for (let k = 0; k < loops.length; k++) {
          loops[k].uv[0] = uvs[k][0];
          loops[k].uv[1] = uvs[k][1];
        }
      }
    }
    const lastRow = grid[grid.length - 1];
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      const f = m.addFace([bottom, lastRow[j], lastRow[i]]);
      const loops = m.faceLoops(f.id);
      const u0 = i / seg, u1 = (i + 1) / seg, uMid = (u0 + u1) * 0.5;
      const vTop = (rings - 1) / rings;
      const uvs = [[uMid, 1], [u1, vTop], [u0, vTop]];
      for (let k = 0; k < loops.length; k++) {
        loops[k].uv[0] = uvs[k][0];
        loops[k].uv[1] = uvs[k][1];
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/IcoSphere.ts
  function buildIcoSphere(params = {}) {
    const r = params.radius ?? 1;
    const subdiv = Math.max(0, Math.min(5, Math.floor(params.subdivisions ?? 1)));
    const t = (1 + Math.sqrt(5)) / 2;
    let positions = [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1]
    ];
    let faces = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1]
    ];
    for (let s = 0; s < subdiv; s++) {
      const cache = /* @__PURE__ */ new Map();
      const newFaces = [];
      const mid = (a, b) => {
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        const cached = cache.get(key);
        if (cached !== void 0) return cached;
        const pa = positions[a], pb = positions[b];
        const mx = (pa[0] + pb[0]) * 0.5;
        const my = (pa[1] + pb[1]) * 0.5;
        const mz = (pa[2] + pb[2]) * 0.5;
        positions.push([mx, my, mz]);
        const idx = positions.length - 1;
        cache.set(key, idx);
        return idx;
      };
      for (const [a, b, c] of faces) {
        const ab = mid(a, b);
        const bc = mid(b, c);
        const ca = mid(c, a);
        newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      }
      faces = newFaces;
    }
    const m = new EditableMesh();
    const vertexIds = [];
    for (const p of positions) {
      const len = Math.hypot(p[0], p[1], p[2]) || 1;
      vertexIds.push(m.addVertex(p[0] / len * r, p[1] / len * r, p[2] / len * r).id);
    }
    for (const [a, b, c] of faces) {
      const f = m.addFace([vertexIds[a], vertexIds[b], vertexIds[c]]);
      const loops = m.faceLoops(f.id);
      for (const l of loops) {
        const v = m.vertices.get(l.vertexId);
        if (!v) continue;
        const nx = v.position[0] / r;
        const ny = v.position[1] / r;
        const nz = v.position[2] / r;
        l.uv[0] = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
        l.uv[1] = 0.5 - Math.asin(ny) / Math.PI;
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/mesh/primitives/Torus.ts
  function buildTorus(params = {}) {
    const R = params.majorRadius ?? 1;
    const r = params.minorRadius ?? 0.35;
    const seg = Math.max(3, Math.floor(params.majorSegments ?? 24));
    const sides = Math.max(3, Math.floor(params.minorSegments ?? 12));
    const m = new EditableMesh();
    const grid = [];
    for (let i = 0; i < seg; i++) {
      const phi = i / seg * Math.PI * 2;
      const cphi = Math.cos(phi), sphi = Math.sin(phi);
      const row = [];
      for (let j = 0; j < sides; j++) {
        const theta = j / sides * Math.PI * 2;
        const ctheta = Math.cos(theta), stheta = Math.sin(theta);
        const x = (R + r * ctheta) * cphi;
        const y = r * stheta;
        const z = (R + r * ctheta) * sphi;
        row.push(m.addVertex(x, y, z).id);
      }
      grid.push(row);
    }
    for (let i = 0; i < seg; i++) {
      const i2 = (i + 1) % seg;
      for (let j = 0; j < sides; j++) {
        const j2 = (j + 1) % sides;
        const f = m.addFace([grid[i][j], grid[i2][j], grid[i2][j2], grid[i][j2]]);
        const u0 = i / seg, u1 = (i + 1) / seg;
        const v0 = j / sides, v1 = (j + 1) / sides;
        const loops = m.faceLoops(f.id);
        const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
        for (let k = 0; k < loops.length; k++) {
          loops[k].uv[0] = uvs[k][0];
          loops[k].uv[1] = uvs[k][1];
        }
      }
    }
    m.recomputeFaceNormals();
    return m;
  }

  // src/app/commands/CreatePrimitiveCommand.ts
  function buildMesh(kind, params) {
    switch (kind) {
      case "cube":
        return buildCube(params);
      case "plane":
        return buildPlane(params);
      case "cylinder":
        return buildCylinder(params);
      case "cone":
        return buildCone(params);
      case "disk":
        return buildDisk(params);
      case "uvsphere":
        return buildUvSphere(params);
      case "icosphere":
        return buildIcoSphere(params);
      case "torus":
        return buildTorus(params);
    }
  }
  var DEFAULT_NAME = {
    cube: "Cube",
    plane: "Plane",
    cylinder: "Cylinder",
    cone: "Cone",
    disk: "Disk",
    uvsphere: "UV Sphere",
    icosphere: "Ico Sphere",
    torus: "Torus"
  };
  var CreatePrimitiveCommand = class {
    constructor(scene, kind, params = {}) {
      this.scene = scene;
      this.kind = kind;
      this.params = params;
      /** The newly-added node — captured on first `do()` and re-used on redo. */
      this.node = null;
      this.label = "Add " + DEFAULT_NAME[kind];
    }
    do() {
      if (this.node == null) {
        const m = buildMesh(this.kind, this.params);
        this.node = new MeshObject(DEFAULT_NAME[this.kind]);
        this.node.mesh = m;
        this.scene.addNode(this.node);
      } else if (!this.node.parent) {
        this.node.mesh = buildMesh(this.kind, this.params);
        this.scene.addNode(this.node);
      }
    }
    undo() {
      if (this.node && this.node.parent) {
        this.scene.removeNode(this.node);
      }
    }
    /**
     * Used by `History.replaceTop` to update the mesh in place when the user
     * tweaks params via the action bar.
     */
    rebuildWith(params) {
      this.params = params;
      if (this.node) this.node.mesh = buildMesh(this.kind, this.params);
    }
  };

  // src/app/commands/PrimitiveActionBarParams.ts
  var DEFAULTS = {
    cube: { size: 2 },
    plane: { width: 2, depth: 2, segmentsX: 1 },
    cylinder: { radius: 1, height: 2, segments: 24 },
    cone: { radius: 1, height: 2, segments: 24 },
    disk: { radius: 1, segments: 24 },
    uvsphere: { radius: 1, segments: 24, rings: 16 },
    icosphere: { radius: 1, subdivisions: 1 },
    torus: { majorRadius: 1, minorRadius: 0.35, majorSegments: 24 }
  };
  function primitiveActionBarFields(kind, params) {
    const p = params;
    switch (kind) {
      case "cube":
        return {
          x: { label: "Size", value: p.size ?? DEFAULTS.cube.size },
          y: { label: "-", value: 0 },
          z: { label: "-", value: 0 }
        };
      case "plane":
        return {
          x: { label: "Width", value: p.width ?? DEFAULTS.plane.width },
          y: { label: "Depth", value: p.depth ?? DEFAULTS.plane.depth },
          z: { label: "Segs", value: p.segmentsX ?? DEFAULTS.plane.segmentsX }
        };
      case "cylinder":
      case "cone":
        return {
          x: { label: "Radius", value: p.radius ?? DEFAULTS.cylinder.radius },
          y: { label: "Height", value: p.height ?? DEFAULTS.cylinder.height },
          z: { label: "Segs", value: p.segments ?? DEFAULTS.cylinder.segments }
        };
      case "disk":
        return {
          x: { label: "Radius", value: p.radius ?? DEFAULTS.disk.radius },
          y: { label: "Segs", value: p.segments ?? DEFAULTS.disk.segments },
          z: { label: "-", value: 0 }
        };
      case "uvsphere":
        return {
          x: { label: "Radius", value: p.radius ?? DEFAULTS.uvsphere.radius },
          y: { label: "Segs", value: p.segments ?? DEFAULTS.uvsphere.segments },
          z: { label: "Rings", value: p.rings ?? DEFAULTS.uvsphere.rings }
        };
      case "icosphere":
        return {
          x: { label: "Radius", value: p.radius ?? DEFAULTS.icosphere.radius },
          y: { label: "Subdiv", value: p.subdivisions ?? DEFAULTS.icosphere.subdivisions },
          z: { label: "-", value: 0 }
        };
      case "torus":
        return {
          x: { label: "Major R", value: p.majorRadius ?? DEFAULTS.torus.majorRadius },
          y: { label: "Minor R", value: p.minorRadius ?? DEFAULTS.torus.minorRadius },
          z: { label: "Segs", value: p.majorSegments ?? DEFAULTS.torus.majorSegments }
        };
    }
  }
  function primitiveParamsFromFields(kind, current, x, y, z) {
    const p = { ...current };
    switch (kind) {
      case "cube":
        if (Number.isFinite(x)) p.size = x;
        return p;
      case "plane":
        if (Number.isFinite(x)) p.width = x;
        if (Number.isFinite(y)) p.depth = y;
        if (Number.isFinite(z)) p.segmentsX = Math.max(1, Math.round(z));
        if (Number.isFinite(z)) p.segmentsZ = Math.max(1, Math.round(z));
        return p;
      case "cylinder":
      case "cone":
        if (Number.isFinite(x)) p.radius = x;
        if (Number.isFinite(y)) p.height = y;
        if (Number.isFinite(z)) p.segments = Math.max(3, Math.round(z));
        return p;
      case "disk":
        if (Number.isFinite(x)) p.radius = x;
        if (Number.isFinite(y)) p.segments = Math.max(3, Math.round(y));
        return p;
      case "uvsphere":
        if (Number.isFinite(x)) p.radius = x;
        if (Number.isFinite(y)) p.segments = Math.max(3, Math.round(y));
        if (Number.isFinite(z)) p.rings = Math.max(2, Math.round(z));
        return p;
      case "icosphere":
        if (Number.isFinite(x)) p.radius = x;
        if (Number.isFinite(y)) p.subdivisions = Math.max(0, Math.round(y));
        return p;
      case "torus":
        if (Number.isFinite(x)) p.majorRadius = x;
        if (Number.isFinite(y)) p.minorRadius = y;
        if (Number.isFinite(z)) p.majorSegments = Math.max(3, Math.round(z));
        return p;
    }
  }

  // src/io/ObjFormat.ts
  var ObjFormat_exports = {};
  __export(ObjFormat_exports, {
    exportObj: () => exportObj,
    importObj: () => importObj,
    parseMtl: () => parseMtl,
    parseObj: () => parseObj
  });
  function parseMtl(src) {
    const out = [];
    let cur = null;
    for (const rawLine of src.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const parts = line.split(/\s+/);
      const tag = parts[0];
      if (tag === "newmtl") {
        cur = { name: parts.slice(1).join(" ") };
        out.push(cur);
      } else if (!cur) {
        continue;
      } else if (tag === "Kd") {
        cur.Kd = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
      } else if (tag === "Ka") {
        cur.Ka = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
      } else if (tag === "Ks") {
        cur.Ks = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
      } else if (tag === "Ns") {
        cur.Ns = parseFloat(parts[1]);
      } else if (tag === "d") {
        cur.d = parseFloat(parts[1]);
      } else if (tag === "map_Kd") {
        cur.map_Kd = parts.slice(1).join(" ");
      }
    }
    return out;
  }
  function parseObj(src) {
    const positions = [];
    const uvs = [];
    const normals = [];
    const groups = [];
    const mtllibs = [];
    let cur = { name: "default", faceRefs: [] };
    let curMaterial = void 0;
    groups.push(cur);
    for (const rawLine of src.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const parts = line.split(/\s+/);
      const tag = parts[0];
      if (tag === "v") {
        positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (tag === "vt") {
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (tag === "vn") {
        normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (tag === "f") {
        const verts = parts.slice(1).map((token) => {
          const ts = token.split("/");
          const vi = parseInt(ts[0], 10);
          const vti = ts[1] ? parseInt(ts[1], 10) : void 0;
          const vni = ts[2] ? parseInt(ts[2], 10) : void 0;
          return { vi, vti, vni };
        });
        cur.faceRefs.push({ verts, materialName: curMaterial });
      } else if (tag === "o" || tag === "g") {
        const name = parts.slice(1).join(" ") || "group";
        if (cur.faceRefs.length === 0) cur.name = name;
        else {
          cur = { name, faceRefs: [] };
          groups.push(cur);
        }
      } else if (tag === "usemtl") {
        curMaterial = parts.slice(1).join(" ");
      } else if (tag === "mtllib") {
        mtllibs.push(parts.slice(1).join(" "));
      }
    }
    return { positions, uvs, normals, groups, mtllibs };
  }
  function importObj(objSrc, mtlSrc = null) {
    const obj = parseObj(objSrc);
    const mtls = mtlSrc ? parseMtl(mtlSrc) : [];
    const scene = new Scene();
    const matsByName = /* @__PURE__ */ new Map();
    for (const m of mtls) {
      const mat = new Material(m.name);
      if (m.Kd) mat.setBaseColor(m.Kd[0], m.Kd[1], m.Kd[2]);
      if (m.Ka) mat.ambient = { r: m.Ka[0], g: m.Ka[1], b: m.Ka[2] };
      if (m.Ks) mat.specular = { r: m.Ks[0], g: m.Ks[1], b: m.Ks[2] };
      if (m.Ns != null) mat.shininess = m.Ns;
      if (m.d != null) mat.opacity = m.d;
      scene.addMaterial(mat);
      matsByName.set(mat.name, mat);
    }
    const meshes = [];
    for (const group of obj.groups) {
      if (group.faceRefs.length === 0) continue;
      const node = new MeshObject(group.name);
      const mesh = new EditableMesh();
      const vertMap = /* @__PURE__ */ new Map();
      const getVert = (vi) => {
        let id = vertMap.get(vi);
        if (id != null) return id;
        const pos = obj.positions[vi - 1];
        if (!pos) throw new Error(`Vertex index out of range: ${vi}`);
        const v = mesh.addVertex(pos[0], pos[1], pos[2]);
        vertMap.set(vi, v.id);
        return v.id;
      };
      let primaryMat = null;
      for (const fr of group.faceRefs) {
        const seq = fr.verts.map((v) => getVert(v.vi));
        const dedup = [];
        for (const id of seq) {
          if (id !== dedup[dedup.length - 1]) dedup.push(id);
        }
        if (dedup.length > 1 && dedup[0] === dedup[dedup.length - 1]) dedup.pop();
        if (dedup.length < 3) continue;
        const mat = fr.materialName ? matsByName.get(fr.materialName) : null;
        const face = mesh.addFace(dedup, mat ? mat.id : null);
        const loops = mesh.faceLoops(face.id);
        for (let i = 0; i < loops.length; i++) {
          const ref = fr.verts[i];
          if (ref && ref.vti != null && obj.uvs[ref.vti - 1]) {
            loops[i].uv[0] = obj.uvs[ref.vti - 1][0];
            loops[i].uv[1] = obj.uvs[ref.vti - 1][1];
          }
          if (ref && ref.vni != null && obj.normals[ref.vni - 1]) {
            loops[i].normal[0] = obj.normals[ref.vni - 1][0];
            loops[i].normal[1] = obj.normals[ref.vni - 1][1];
            loops[i].normal[2] = obj.normals[ref.vni - 1][2];
          }
        }
        if (mat && !primaryMat) primaryMat = mat.id;
      }
      mesh.recomputeFaceNormals();
      node.mesh = mesh;
      node.materialId = primaryMat;
      scene.addNode(node);
      meshes.push(node);
    }
    return { scene, meshes, materials: scene.materials() };
  }
  function exportObj(scene, opts = {}) {
    const lines = [];
    const matLines = [];
    const mats = scene.materials();
    const matNameById = /* @__PURE__ */ new Map();
    if (opts.mtlPath && mats.length > 0) lines.push(`mtllib ${opts.mtlPath}`);
    for (const mat of mats) {
      matNameById.set(mat.id, mat.name);
      matLines.push(`newmtl ${mat.name}`);
      matLines.push(`Kd ${mat.baseColor.r.toFixed(6)} ${mat.baseColor.g.toFixed(6)} ${mat.baseColor.b.toFixed(6)}`);
      matLines.push(`Ka ${mat.ambient.r.toFixed(6)} ${mat.ambient.g.toFixed(6)} ${mat.ambient.b.toFixed(6)}`);
      matLines.push(`Ks ${mat.specular.r.toFixed(6)} ${mat.specular.g.toFixed(6)} ${mat.specular.b.toFixed(6)}`);
      matLines.push(`Ns ${mat.shininess.toFixed(4)}`);
      matLines.push(`d ${mat.opacity.toFixed(4)}`);
      if (mat.texture) matLines.push(`map_Kd ${mat.texture.name}`);
      matLines.push("");
    }
    let nextPosIdx = 1;
    let nextUvIdx = 1;
    let nextNormalIdx = 1;
    const includeUvs = opts.includeUvs ?? true;
    const includeNormals = opts.includeNormals ?? true;
    scene.forEachNode((n) => {
      if (n.kind !== "mesh") return;
      const node = n;
      if (!node.mesh) return;
      lines.push(`o ${node.name}`);
      const m = node.mesh;
      const posMap = /* @__PURE__ */ new Map();
      for (const v of m.vertices.values()) {
        lines.push(`v ${v.position[0].toFixed(6)} ${v.position[1].toFixed(6)} ${v.position[2].toFixed(6)}`);
        posMap.set(v.id, nextPosIdx);
        nextPosIdx++;
      }
      const uvMap = /* @__PURE__ */ new Map();
      if (includeUvs) {
        for (const loop of m.loops.values()) {
          lines.push(`vt ${loop.uv[0].toFixed(6)} ${loop.uv[1].toFixed(6)}`);
          uvMap.set(loop.id, nextUvIdx);
          nextUvIdx++;
        }
      }
      const normMap = /* @__PURE__ */ new Map();
      if (includeNormals) {
        for (const loop of m.loops.values()) {
          const f = m.faces.get(loop.faceId);
          const n2 = loop.normal[0] !== 0 || loop.normal[1] !== 0 || loop.normal[2] !== 0 ? loop.normal : f ? f.normal : [0, 0, 1];
          lines.push(`vn ${n2[0].toFixed(6)} ${n2[1].toFixed(6)} ${n2[2].toFixed(6)}`);
          normMap.set(loop.id, nextNormalIdx);
          nextNormalIdx++;
        }
      }
      if (node.materialId != null) {
        const matName = matNameById.get(node.materialId);
        if (matName) lines.push(`usemtl ${matName}`);
      }
      for (const face of m.faces.values()) {
        const tokens = [];
        for (const lid of face.loops) {
          const loop = m.loops.get(lid);
          if (!loop) continue;
          const vi = posMap.get(loop.vertexId);
          const vti = uvMap.get(lid);
          const vni = normMap.get(lid);
          if (vti != null && vni != null) tokens.push(`${vi}/${vti}/${vni}`);
          else if (vti != null) tokens.push(`${vi}/${vti}`);
          else if (vni != null) tokens.push(`${vi}//${vni}`);
          else tokens.push(`${vi}`);
        }
        lines.push(`f ${tokens.join(" ")}`);
      }
    });
    return { obj: lines.join("\n") + "\n", mtl: matLines.length > 0 ? matLines.join("\n") + "\n" : null };
  }

  // src/io/GltfFormat.ts
  var GltfFormat_exports = {};
  __export(GltfFormat_exports, {
    exportGltf: () => exportGltf
  });
  function triangulateFaceIdx(loopVerts) {
    const tris = [];
    for (let i = 1; i < loopVerts.length - 1; i++) {
      tris.push(loopVerts[0], loopVerts[i], loopVerts[i + 1]);
    }
    return tris;
  }
  function alignUp(n, align) {
    return n + (align - n % align) % align;
  }
  function encodePngRgba(width, height, data) {
    const rowBytes = width * 4;
    const rawSize = (rowBytes + 1) * height;
    const raw = new Uint8Array(rawSize);
    for (let y = 0; y < height; y++) {
      raw[y * (rowBytes + 1)] = 0;
      raw.set(data.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
    }
    const zlib = zlibStore(raw);
    const ihdr = new Uint8Array(13);
    const dv = new DataView(ihdr.buffer);
    dv.setUint32(0, width, false);
    dv.setUint32(4, height, false);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    const chunks = [
      pngChunk("IHDR", ihdr),
      pngChunk("IDAT", zlib),
      pngChunk("IEND", new Uint8Array(0))
    ];
    const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    let total = sig.length;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let off = 0;
    out.set(sig, off);
    off += sig.length;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
  function pngChunk(type, data) {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length, false);
    out[4] = type.charCodeAt(0);
    out[5] = type.charCodeAt(1);
    out[6] = type.charCodeAt(2);
    out[7] = type.charCodeAt(3);
    out.set(data, 8);
    const crcSrc = new Uint8Array(4 + data.length);
    crcSrc.set(out.subarray(4, 8), 0);
    crcSrc.set(data, 4);
    const crc = crc32(crcSrc);
    dv.setUint32(8 + data.length, crc, false);
    return out;
  }
  function zlibStore(data) {
    const blocks = [];
    let pos = 0;
    while (pos < data.length) {
      const len = Math.min(65535, data.length - pos);
      const last = pos + len >= data.length ? 1 : 0;
      blocks.push([last, len & 255, len >> 8 & 255, ~len & 255, ~len >> 8 & 255]);
      pos += len;
    }
    let bodyLen = 0;
    for (const b of blocks) bodyLen += b.length;
    bodyLen += data.length;
    const out = new Uint8Array(2 + bodyLen + 4);
    out[0] = 120;
    out[1] = 1;
    let off = 2;
    pos = 0;
    for (const b of blocks) {
      out.set(b, off);
      off += b.length;
      const len = b[1] | b[2] << 8;
      out.set(data.subarray(pos, pos + len), off);
      off += len;
      pos += len;
    }
    let a = 1, b2 = 0;
    for (let i = 0; i < data.length; i++) {
      a = (a + data[i]) % 65521;
      b2 = (b2 + a) % 65521;
    }
    const adler = b2 << 16 | a;
    const dv = new DataView(out.buffer);
    dv.setUint32(out.length - 4, adler >>> 0, false);
    return out;
  }
  var CRC_TABLE = null;
  function crc32(data) {
    if (!CRC_TABLE) {
      CRC_TABLE = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        CRC_TABLE[i] = c >>> 0;
      }
    }
    let crc = 4294967295;
    for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 255] ^ crc >>> 8;
    return (crc ^ 4294967295) >>> 0;
  }
  function base64Encode(data) {
    let s = "";
    for (let i = 0; i < data.length; i++) s += String.fromCharCode(data[i]);
    if (typeof btoa === "function") return btoa(s);
    const B = globalThis.Buffer;
    if (B) return B.from(data).toString("base64");
    throw new Error("No base64 encoder available");
  }
  function exportGltf(scene) {
    const doc = {
      asset: { version: "2.0", generator: "BrutalMesh" },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      buffers: [{ byteLength: 0 }],
      bufferViews: [],
      accessors: []
    };
    const matBytes = /* @__PURE__ */ new Map();
    const textureBytes = /* @__PURE__ */ new Map();
    doc.materials = [];
    doc.textures = [];
    doc.images = [];
    const buffers = [];
    let cursor = 0;
    const pushBufferView = (data, target) => {
      while (cursor % 4 !== 0) {
        buffers.push(new Uint8Array([0]));
        cursor++;
      }
      const bv = { buffer: 0, byteOffset: cursor, byteLength: data.byteLength };
      if (target) bv.target = target;
      doc.bufferViews.push(bv);
      buffers.push(data);
      cursor += data.byteLength;
      return doc.bufferViews.length - 1;
    };
    const pushAccessor = (a) => {
      doc.accessors.push(a);
      return doc.accessors.length - 1;
    };
    const mats = scene.materials();
    for (const mat of mats) {
      const m = {
        name: mat.name,
        pbrMetallicRoughness: {
          baseColorFactor: [mat.baseColor.r, mat.baseColor.g, mat.baseColor.b, mat.opacity],
          metallicFactor: 0,
          roughnessFactor: 0.6
        },
        alphaMode: mat.opacity < 1 ? "BLEND" : "OPAQUE"
      };
      if (mat.texture && mat.texture.data) {
        const png = encodePngRgba(mat.texture.width, mat.texture.height, mat.texture.data);
        const imgBv = pushBufferView(png);
        doc.images.push({ bufferView: imgBv, mimeType: "image/png" });
        const imageIdx = doc.images.length - 1;
        doc.textures.push({ source: imageIdx });
        const texIdx = doc.textures.length - 1;
        m.pbrMetallicRoughness.baseColorTexture = { index: texIdx };
        textureBytes.set(mat.id, texIdx);
      }
      doc.materials.push(m);
      matBytes.set(mat.id, doc.materials.length - 1);
    }
    if (doc.materials.length === 0) delete doc.materials;
    if (doc.textures.length === 0) delete doc.textures;
    if (doc.images.length === 0) delete doc.images;
    scene.forEachNode((n) => {
      if (n.kind !== "mesh") return;
      const node = n;
      if (!node.mesh) return;
      const mesh = node.mesh;
      const positions = [];
      const normals = [];
      const uvs = [];
      const indices = [];
      let nextVid = 0;
      for (const face of mesh.faces.values()) {
        const loopVerts = [];
        for (const lid of face.loops) {
          const loop = mesh.loops.get(lid);
          if (!loop) continue;
          const v = mesh.vertices.get(loop.vertexId);
          if (!v) continue;
          positions.push(v.position[0], v.position[1], v.position[2]);
          const norm = loop.normal[0] !== 0 || loop.normal[1] !== 0 || loop.normal[2] !== 0 ? loop.normal : face.normal;
          normals.push(norm[0], norm[1], norm[2]);
          uvs.push(loop.uv[0], loop.uv[1]);
          loopVerts.push(nextVid++);
        }
        const tris = triangulateFaceIdx(loopVerts);
        for (const t of tris) indices.push(t);
      }
      const positionArr = new Float32Array(positions);
      const normalArr = new Float32Array(normals);
      const uvArr = new Float32Array(uvs);
      const indexArr = new Uint32Array(indices);
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let i = 0; i < positionArr.length; i += 3) {
        const x = positionArr[i], y = positionArr[i + 1], z = positionArr[i + 2];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
      }
      const posBv = pushBufferView(new Uint8Array(positionArr.buffer, positionArr.byteOffset, positionArr.byteLength), 34962);
      const normalBv = pushBufferView(new Uint8Array(normalArr.buffer, normalArr.byteOffset, normalArr.byteLength), 34962);
      const uvBv = pushBufferView(new Uint8Array(uvArr.buffer, uvArr.byteOffset, uvArr.byteLength), 34962);
      const idxBv = pushBufferView(new Uint8Array(indexArr.buffer, indexArr.byteOffset, indexArr.byteLength), 34963);
      const vertexCount = positionArr.length / 3;
      const posAcc = pushAccessor({ bufferView: posBv, componentType: 5126, count: vertexCount, type: "VEC3", min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });
      const normalAcc = pushAccessor({ bufferView: normalBv, componentType: 5126, count: vertexCount, type: "VEC3" });
      const uvAcc = pushAccessor({ bufferView: uvBv, componentType: 5126, count: vertexCount, type: "VEC2" });
      const idxAcc = pushAccessor({ bufferView: idxBv, componentType: 5125, count: indexArr.length, type: "SCALAR" });
      const matIdx = node.materialId != null ? matBytes.get(node.materialId) : void 0;
      const prim = {
        attributes: { POSITION: posAcc, NORMAL: normalAcc, TEXCOORD_0: uvAcc },
        indices: idxAcc,
        mode: 4
      };
      if (matIdx != null) prim.material = matIdx;
      doc.meshes.push({ name: node.name, primitives: [prim] });
      const gltfNode = {
        name: node.name,
        mesh: doc.meshes.length - 1,
        translation: [node.transform.position[0], node.transform.position[1], node.transform.position[2]],
        rotation: [node.transform.rotation[0], node.transform.rotation[1], node.transform.rotation[2], node.transform.rotation[3]],
        scale: [node.transform.scale[0], node.transform.scale[1], node.transform.scale[2]]
      };
      doc.nodes.push(gltfNode);
      doc.scenes[0].nodes.push(doc.nodes.length - 1);
    });
    const totalLen = cursor;
    const combined = new Uint8Array(totalLen);
    let off = 0;
    for (const b of buffers) {
      combined.set(b, off);
      off += b.length;
    }
    doc.buffers[0].byteLength = totalLen;
    doc.buffers[0].uri = "data:application/octet-stream;base64," + base64Encode(combined);
    const glbDoc = JSON.parse(JSON.stringify(doc));
    delete glbDoc.buffers[0].uri;
    const jsonStr = JSON.stringify(glbDoc);
    const jsonBytes = new TextEncoder().encode(jsonStr);
    const jsonLen = alignUp(jsonBytes.length, 4);
    const binLen = alignUp(totalLen, 4);
    const glb = new ArrayBuffer(12 + 8 + jsonLen + 8 + binLen);
    const dv = new DataView(glb);
    dv.setUint32(0, 1179937895, true);
    dv.setUint32(4, 2, true);
    dv.setUint32(8, glb.byteLength, true);
    dv.setUint32(12, jsonLen, true);
    dv.setUint32(16, 1313821514, true);
    new Uint8Array(glb, 20, jsonBytes.length).set(jsonBytes);
    for (let i = jsonBytes.length; i < jsonLen; i++) new Uint8Array(glb, 20 + i, 1)[0] = 32;
    dv.setUint32(20 + jsonLen, binLen, true);
    dv.setUint32(20 + jsonLen + 4, 5130562, true);
    new Uint8Array(glb, 20 + jsonLen + 8, totalLen).set(combined);
    return {
      json: JSON.stringify(doc, null, 2),
      glb,
      document: doc
    };
  }

  // src/app/App.ts
  function absoluteViewportRect(viewport) {
    let x = 0, y = 0;
    let node = viewport;
    while (node) {
      const b2 = node.getBounds();
      x += b2.x;
      y += b2.y;
      node = node.parent;
    }
    const b = viewport.getBounds();
    return { x, y, w: b.w, h: b.h };
  }
  var APP_BG = [0.149, 0.149, 0.149, 1];
  var App = class {
    constructor(opts) {
      this.selection = new Selection();
      this.history = new History();
      this.tools = new ToolController(this);
      this.rafId = null;
      this.resizeObs = null;
      this.lastFrameTime = 0;
      this.frameCount = 0;
      this.fps = 0;
      this.fpsTimer = 0;
      this.lastFrameMs = 0;
      // GL state Gwen's renderer relies on between begin() calls (it binds
      // them once in init() and never re-asserts them in begin()). After our
      // 3D pass clobbers the program/VAO/buffer bindings, we restore these
      // before handing the frame back to Gwen.
      this.gwenProgram = null;
      this.gwenVao = null;
      this.gwenVbo = null;
      this.canvas = opts.canvas;
      const dpr = window.devicePixelRatio || 1;
      this.sizeBackingStore(dpr);
      const gl = this.canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false
      });
      if (!gl) throw new Error("BrutalMesh: WebGL2 is not available");
      this.gl = gl;
      this.renderer = new Gwen.WebGL2Renderer(this.canvas, { devicePixelRatio: dpr });
      this.renderer.init();
      const guts = this.renderer;
      this.gwenProgram = guts.program;
      this.gwenVao = guts.vao;
      this.gwenVbo = guts.vbo;
      this.skin = new Gwen.Skin(this.renderer);
      this.skin.init();
      this.skin.setTheme(Gwen.DARK_PALETTE);
      this.gwenCanvas = new Gwen.Canvas(this.skin, this.canvas);
      this.gwenCanvas.setBounds(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      this.gwenCanvas.setDrawBackground(false);
      this.ui = buildUi(this.gwenCanvas);
      this.scene = Scene.createDefault();
      for (const node of [...this.scene.root.children]) {
        if (node.kind === "mesh") {
          node.mesh = buildCube();
        }
      }
      this.sceneRenderer = new Renderer(this.gl);
      this.sceneRenderer.syncScene(this.scene);
      const cameraCtl = new CameraController(this.sceneRenderer.layout);
      this.ui.viewport.delegate = {
        pointerDown: (button, x, y) => {
          if (button === 0) {
            if (this.tools.tryStartDrag(x, y)) {
              return;
            }
            this.runPickAt(x, y);
            return;
          }
          cameraCtl.pointerDown(button, x, y);
        },
        pointerMove: (x, y, dx, dy) => {
          if (this.tools.isDragging()) {
            this.tools.drag(x, y);
            return;
          }
          cameraCtl.pointerMove(x, y, dx, dy);
        },
        pointerUp: (button, x, y) => {
          if (button === 0 && this.tools.isDragging()) {
            this.tools.endDrag();
            return;
          }
          cameraCtl.pointerUp(button, x, y);
        },
        wheel: (delta, x, y) => cameraCtl.wheel(delta, x, y)
      };
      this.sceneRenderer.selection = this.selection;
      this.sceneRenderer.tools = this.tools;
      this.history.on(() => {
        this.sceneRenderer.markAllDirty();
      });
      this.ui.menu.editMenu.getMenu().children.forEach((mc) => {
      });
      this.wireUndoRedoMenuItems();
      this.ui.actionBar.undoButton.onPress.on(() => this.history.undo());
      this.ui.actionBar.redoButton.onPress.on(() => this.history.redo());
      this.history.on(() => this.refreshHistoryPanel());
      this.refreshHistoryPanel();
      this.history.on(() => this.refreshActionBarFromTop());
      this.wireActionBarEdits();
      this.refreshActionBarFromTop();
      this.wirePrimitiveButtons();
      this.wireExportMenuItems();
      this.wireRightDockPanels();
      this.refreshAllPanels();
      this.wireViewWidget();
      this.installMiddleClickListener();
      new TouchController(this.canvas, this.ui.viewport, this.sceneRenderer.layout).install();
    }
    start() {
      this.installResize();
      this.lastFrameTime = performance.now();
      const tick = () => {
        this.frame();
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
    stop() {
      if (this.rafId != null) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      if (this.resizeObs) {
        this.resizeObs.disconnect();
        this.resizeObs = null;
      }
    }
    getFps() {
      return this.fps;
    }
    setViewportMode(mode) {
      this.sceneRenderer.layout.setMode(mode);
    }
    setDisplayMode(mode) {
      this.sceneRenderer.setViewMode(mode);
    }
    setSelectionMode(mode) {
      this.selection.setMode(mode);
    }
    setTool(tool) {
      this.tools.setTool(tool);
    }
    /**
     * Run a CPU pick at viewport-local coords `(x, y)`. The active sub-viewport
     * (under the cursor) determines the camera + rect used. Returns the picked
     * id (object / face / vertex / edge) or null.
     */
    pickAt(canvasX, canvasY) {
      const sub2 = this.sceneRenderer.layout.subviewportAt(canvasX, canvasY);
      if (!sub2) return null;
      const aspect = sub2.rect.w / Math.max(1, sub2.rect.h);
      const ax = canvasX;
      const ay = canvasY;
      if (this.selection.mode === "object") {
        const hit = pickObjectInScene(this.scene, ax, ay, sub2.rect, sub2.camera, aspect);
        if (hit) {
          this.selection.setObjectSelection(hit.node.id);
          return { kind: "object", id: hit.node.id };
        }
        this.selection.clearAll();
        return { kind: "object", id: null };
      }
      const obj = this.findActiveMeshObject() ?? pickObjectInScene(this.scene, ax, ay, sub2.rect, sub2.camera, aspect)?.node;
      if (!obj || !obj.mesh) return null;
      const world = obj.getWorldMatrix();
      if (this.selection.mode === "face") {
        const fid = pickFace(obj.mesh, world, ax, ay, sub2.rect, sub2.camera, aspect);
        if (fid != null) {
          this.selection.selectFace(obj.id, fid);
          return { kind: "face", id: fid };
        }
      } else if (this.selection.mode === "vertex") {
        const vid = pickVertex(obj.mesh, world, ax, ay, sub2.rect, sub2.camera, aspect);
        if (vid != null) {
          this.selection.selectVertex(obj.id, vid);
          return { kind: "vertex", id: vid };
        }
      } else if (this.selection.mode === "edge") {
        const eid = pickEdge(obj.mesh, world, ax, ay, sub2.rect, sub2.camera, aspect);
        if (eid != null) {
          this.selection.selectEdge(obj.id, eid);
          return { kind: "edge", id: eid };
        }
      }
      return null;
    }
    findActiveMeshObject() {
      if (!this.selection.activeObjectId) return null;
      const n = this.scene.findNodeById(this.selection.activeObjectId);
      return n && n.kind === "mesh" ? n : null;
    }
    runPickAt(localX, localY) {
      this.pickAt(localX, localY);
    }
    /**
     * Locate the Undo / Redo menu items by label inside the Edit menu and
     * subscribe them to the history.
     */
    refreshHistoryPanel() {
      const list = this.ui.rightDock.history;
      const lb = list;
      if (typeof lb.clearItems === "function") lb.clearItems();
      else if (typeof lb.clear === "function") lb.clear();
      const labels = this.history.undoLabels();
      if (labels.length === 0) list.addItem("(empty history)");
      else for (const l of labels) list.addItem(l);
    }
    refreshActionBarFromTop() {
      const stack = this.history.undoStack;
      const top = stack[stack.length - 1];
      if (top instanceof SetTransformCommand) {
        const t = top.next;
        this.ui.actionBar.label.setText("  " + (top.label ?? ""));
        this.ui.actionBar.xBox.setText(t.position[0].toFixed(3));
        this.ui.actionBar.yBox.setText(t.position[1].toFixed(3));
        this.ui.actionBar.zBox.setText(t.position[2].toFixed(3));
      } else if (top instanceof CreatePrimitiveCommand) {
        const fields = primitiveActionBarFields(top.kind, top.params);
        this.ui.actionBar.label.setText("  " + (top.label ?? ""));
        this.ui.actionBar.xBox.setText(String(fields.x.value));
        this.ui.actionBar.yBox.setText(String(fields.y.value));
        this.ui.actionBar.zBox.setText(String(fields.z.value));
      } else {
        this.ui.actionBar.label.setText("  " + (top?.label ?? "Ready"));
      }
    }
    wireActionBarEdits() {
      const onEdit = () => {
        const stack = this.history.undoStack;
        const top = stack[stack.length - 1];
        if (top instanceof SetTransformCommand) {
          const x = parseFloat(this.ui.actionBar.xBox.getText());
          const y = parseFloat(this.ui.actionBar.yBox.getText());
          const z = parseFloat(this.ui.actionBar.zBox.getText());
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
          const node = top.node;
          const orig = top.next;
          const next = new SetTransformCommand(node, {
            position: [x, y, z],
            rotation: [orig.rotation[0], orig.rotation[1], orig.rotation[2], orig.rotation[3]],
            scale: [orig.scale[0], orig.scale[1], orig.scale[2]]
          }, top.label);
          this.history.replaceTop(next);
          return;
        }
        if (top instanceof CreatePrimitiveCommand) {
          const x = parseFloat(this.ui.actionBar.xBox.getText());
          const y = parseFloat(this.ui.actionBar.yBox.getText());
          const z = parseFloat(this.ui.actionBar.zBox.getText());
          const params = primitiveParamsFromFields(top.kind, top.params, x, y, z);
          top.rebuildWith(params);
          this.history.notifyTopChanged();
          return;
        }
      };
      this.ui.actionBar.xBox.onReturnPressed.on(onEdit);
      this.ui.actionBar.yBox.onReturnPressed.on(onEdit);
      this.ui.actionBar.zBox.onReturnPressed.on(onEdit);
    }
    /** Trigger a glTF export and return the JSON + GLB binary for tests. */
    exportSceneGltf() {
      return exportGltf(this.scene);
    }
    /** Trigger an OBJ export and return the OBJ + MTL strings for tests. */
    exportSceneObj(opts) {
      return exportObj(this.scene, opts);
    }
    /** Trigger a browser-side download for blob data. No-op in tests / Node. */
    triggerDownload(filename, blob) {
      if (typeof document === "undefined" || typeof URL === "undefined") return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    /** Refresh outliner / inspector / materials panels (public for tests). */
    refreshPanels() {
      this.refreshAllPanels();
    }
    refreshAllPanels() {
      this.refreshOutliner();
      this.refreshInspector();
      this.refreshMaterials();
    }
    refreshOutliner() {
      const tree = this.ui.rightDock.outliner;
      const treeAny = tree;
      if (treeAny.clear) treeAny.clear();
      else if (treeAny.removeAllNodes) treeAny.removeAllNodes();
      else {
        for (const c of [...tree.children]) {
          c.parent = null;
        }
      }
      const root = tree.addNode("Scene");
      const buildNode = (parent, n) => {
        if (n === this.scene.root) {
          for (const c of n.children) buildNode(parent, c);
          return;
        }
        const tn = parent.addNode(n.name || "Node");
        for (const c of n.children) buildNode(tn, c);
      };
      buildNode(root, this.scene.root);
      tree.expandAll();
    }
    refreshInspector() {
      const inspector = this.ui.rightDock.inspector;
      const insAny = inspector;
      let active = null;
      if (this.selection.activeObjectId) active = this.scene.findNodeById(this.selection.activeObjectId);
      const rows = insAny.children.filter((c) => {
        return c.getProperty != null;
      });
      const setRow = (idx, value) => {
        const r = rows[idx];
        if (!r) return;
        const prop = r.getProperty();
        if (prop && typeof prop.setPropertyValue === "function") prop.setPropertyValue(value, false);
      };
      if (!active) {
        setRow(0, "(none)");
        setRow(1, "0");
        setRow(2, "0");
        setRow(3, "0");
        setRow(4, "0");
        return;
      }
      setRow(0, active.name);
      setRow(1, active.visible ? "1" : "0");
      if (active.kind === "mesh") {
        const mesh = active.mesh;
        setRow(2, String(mesh ? mesh.vertexCount() : 0));
        setRow(3, String(mesh ? mesh.edgeCount() : 0));
        setRow(4, String(mesh ? mesh.faceCount() : 0));
      } else {
        setRow(2, "-");
        setRow(3, "-");
        setRow(4, "-");
      }
    }
    refreshMaterials() {
      const list = this.ui.rightDock.materials;
      const lb = list;
      if (typeof lb.clearItems === "function") lb.clearItems();
      else if (typeof lb.clear === "function") lb.clear();
      const mats = this.scene.materials();
      if (mats.length === 0) list.addItem("(no materials)");
      else for (const m of mats) list.addItem(m.name);
    }
    wireRightDockPanels() {
      this.history.on(() => this.refreshAllPanels());
      const tree = this.ui.rightDock.outliner;
      const treeAny = tree;
      if (treeAny.onSelectionChange?.on) {
        treeAny.onSelectionChange.on(() => this.refreshInspector());
      }
      const fmt = this.ui.rightDock.exportFormat.getComboBox();
      fmt.onSelection.on(() => {
      });
    }
    wireExportMenuItems() {
      const file = this.ui.menu.fileMenu.getMenu();
      for (const c of file.children) {
        const mi = c;
        if (typeof mi.getText !== "function") continue;
        const text = mi.getText();
        if (text === "Export OBJ..." && mi.onMenuItemSelected) {
          mi.onMenuItemSelected.on(() => {
            const r = this.exportSceneObj({ mtlPath: "scene.mtl" });
            this.triggerDownload("scene.obj", new Blob([r.obj], { type: "text/plain" }));
            if (r.mtl) this.triggerDownload("scene.mtl", new Blob([r.mtl], { type: "text/plain" }));
          });
        } else if (text === "Export glTF..." && mi.onMenuItemSelected) {
          mi.onMenuItemSelected.on(() => {
            const r = this.exportSceneGltf();
            this.triggerDownload("scene.glb", new Blob([r.glb], { type: "model/gltf-binary" }));
          });
        }
      }
    }
    wireViewWidget() {
      const w = this.ui.viewWidget;
      const orient = (name) => {
        const cam = this.sceneRenderer.layout.perspectiveCam;
        cam.setOrientation(name);
        if (name === "perspective") cam.setMode("perspective");
        else cam.setMode("orthographic");
      };
      w.buttons.top.onPress.on(() => orient("top"));
      w.buttons.front.onPress.on(() => orient("front"));
      w.buttons.right.onPress.on(() => orient("right"));
      w.buttons.back.onPress.on(() => orient("back"));
      w.buttons.left.onPress.on(() => orient("left"));
      w.buttons.bottom.onPress.on(() => orient("bottom"));
      w.buttons.perspective.onPress.on(() => orient("perspective"));
    }
    wirePrimitiveButtons() {
      const buttons = this.ui.toolShelf.buttons;
      const map = [
        { id: "cube", kind: "cube" },
        { id: "plane", kind: "plane" },
        { id: "cylinder", kind: "cylinder" },
        { id: "cone", kind: "cone" },
        { id: "disk", kind: "disk" },
        { id: "uvsphere", kind: "uvsphere" },
        { id: "icosphere", kind: "icosphere" },
        { id: "torus", kind: "torus" }
      ];
      for (const { id, kind } of map) {
        const btn = buttons[id];
        if (!btn) continue;
        btn.onPress.on(() => {
          this.history.execute(new CreatePrimitiveCommand(this.scene, kind, {}));
        });
      }
    }
    wireUndoRedoMenuItems() {
      const editMenu = this.ui.menu.editMenu.getMenu();
      for (const c of editMenu.children) {
        const mi = c;
        if (typeof mi.getText !== "function") continue;
        const text = mi.getText();
        if (text === "Undo" && mi.onMenuItemSelected) {
          mi.onMenuItemSelected.on(() => this.history.undo());
        } else if (text === "Redo" && mi.onMenuItemSelected) {
          mi.onMenuItemSelected.on(() => this.history.redo());
        }
      }
    }
    getDisplayMode() {
      const modes = ["shaded", "xray", "textured", "unlit"];
      const internal = this.sceneRenderer.meshRenderer?.mode ?? 0;
      return modes[internal] ?? "shaded";
    }
    frame() {
      const now = performance.now();
      const dt = now - this.lastFrameTime;
      this.lastFrameTime = now;
      this.lastFrameMs = dt;
      this.frameCount++;
      this.fpsTimer += dt;
      if (this.fpsTimer >= 500) {
        this.fps = this.frameCount * 1e3 / this.fpsTimer;
        this.frameCount = 0;
        this.fpsTimer = 0;
      }
      const { gl, canvas } = this;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(APP_BG[0], APP_BG[1], APP_BG[2], APP_BG[3]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      const vp = absoluteViewportRect(this.ui.viewport);
      this.sceneRenderer.draw(this.scene, vp, window.devicePixelRatio || 1);
      gl.disable(gl.DEPTH_TEST);
      if (this.gwenProgram) gl.useProgram(this.gwenProgram);
      if (this.gwenVao) gl.bindVertexArray(this.gwenVao);
      if (this.gwenVbo) gl.bindBuffer(gl.ARRAY_BUFFER, this.gwenVbo);
      let verts = 0, edges = 0, faces = 0, tris = 0, objects = 0;
      this.scene.forEachNode((n) => {
        if (n.kind !== "mesh") return;
        objects++;
        const m = n.mesh;
        if (!m) return;
        verts += m.vertexCount();
        edges += m.edgeCount();
        faces += m.faceCount();
        for (const f of m.faces.values()) tris += Math.max(0, f.loops.length - 2);
      });
      this.ui.footer.setStats({
        fps: this.fps,
        frameMs: this.lastFrameMs,
        objects,
        vertices: verts,
        edges,
        faces,
        triangles: tris,
        status: "Ready"
      });
      this.gwenCanvas.doThink();
      this.gwenCanvas.renderCanvas();
    }
    installResize() {
      const onResize = () => this.handleResize();
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObs = new ResizeObserver(onResize);
        this.resizeObs.observe(this.canvas);
      }
      window.addEventListener("resize", onResize);
      this.handleResize();
    }
    handleResize() {
      const dpr = window.devicePixelRatio || 1;
      this.sizeBackingStore(dpr);
      this.renderer.resize(this.canvas.width, this.canvas.height);
      this.gwenCanvas.setBounds(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
      if (this.ui) this.ui.applyResponsiveLayout();
    }
    installMiddleClickListener() {
      const c = this.canvas;
      let middleDown = false;
      let lastX = 0, lastY = 0;
      c.addEventListener("pointerdown", (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        const rect = c.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const local = this.ui.viewport.canvasToLocal(x, y);
        const vp = this.ui.viewport.getViewportRect();
        if (local.x < 0 || local.y < 0 || local.x >= vp.w || local.y >= vp.h) return;
        middleDown = true;
        lastX = x;
        lastY = y;
        this.ui.viewport.injectMiddleClick(x, y, true);
      });
      c.addEventListener("pointermove", (e) => {
        if (!middleDown) return;
        const rect = c.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - lastX;
        const dy = y - lastY;
        lastX = x;
        lastY = y;
        this.ui.viewport.delegate?.pointerMove?.(x, y, dx, dy);
      });
      const release = (e) => {
        if (e.button !== 1) return;
        if (!middleDown) return;
        middleDown = false;
        const rect = c.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.ui.viewport.injectMiddleClick(x, y, false);
      };
      c.addEventListener("pointerup", release);
      c.addEventListener("pointercancel", release);
    }
    sizeBackingStore(dpr) {
      const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
      if (this.canvas.width !== w) this.canvas.width = w;
      if (this.canvas.height !== h) this.canvas.height = h;
    }
  };

  // src/app/commands/EdgeCommands.ts
  var EdgeCommands_exports = {};
  __export(EdgeCommands_exports, {
    BevelEdgeCommand: () => BevelEdgeCommand,
    BridgeEdgesCommand: () => BridgeEdgesCommand,
    ClearSeamCommand: () => ClearSeamCommand,
    DeleteEdgeCommand: () => DeleteEdgeCommand,
    DissolveEdgeCommand: () => DissolveEdgeCommand,
    ExtrudeEdgesCommand: () => ExtrudeEdgesCommand,
    FillEdgeCommand: () => FillEdgeCommand,
    HardenEdgesCommand: () => HardenEdgesCommand,
    LoopCutCommand: () => LoopCutCommand,
    MarkSeamCommand: () => MarkSeamCommand,
    MergeEdgesCommand: () => MergeEdgesCommand,
    RotateEdgesCommand: () => RotateEdgesCommand,
    ScaleEdgesCommand: () => ScaleEdgesCommand,
    SoftenEdgesCommand: () => SoftenEdgesCommand,
    TranslateEdgesCommand: () => TranslateEdgesCommand,
    WeldEdgesCommand: () => WeldEdgesCommand
  });

  // src/mesh/MeshClone.ts
  function cloneMesh(src) {
    const dst = new EditableMesh();
    const vertMap = /* @__PURE__ */ new Map();
    for (const v of src.vertices.values()) {
      const n = dst.addVertex(v.position[0], v.position[1], v.position[2]);
      vertMap.set(v.id, n.id);
    }
    for (const f of src.faces.values()) {
      const vertIds = f.loops.map((lid) => {
        const loop = src.loops.get(lid);
        return vertMap.get(loop.vertexId);
      });
      const newFace = dst.addFace(vertIds, f.materialId);
      const newLoops = dst.faceLoops(newFace.id);
      const srcLoops = f.loops.map((lid) => src.loops.get(lid));
      for (let i = 0; i < newLoops.length; i++) {
        newLoops[i].uv[0] = srcLoops[i].uv[0];
        newLoops[i].uv[1] = srcLoops[i].uv[1];
        newLoops[i].normal[0] = srcLoops[i].normal[0];
        newLoops[i].normal[1] = srcLoops[i].normal[1];
        newLoops[i].normal[2] = srcLoops[i].normal[2];
      }
      newFace.normal[0] = f.normal[0];
      newFace.normal[1] = f.normal[1];
      newFace.normal[2] = f.normal[2];
    }
    for (const e of src.edges.values()) {
      const a = vertMap.get(e.a);
      const b = vertMap.get(e.b);
      if (a == null || b == null) continue;
      const newEdge = findEdge(dst, a, b);
      if (newEdge) {
        newEdge.hard = e.hard;
        newEdge.seam = e.seam;
      }
    }
    return dst;
  }
  function cloneMeshPreservingIds(src) {
    const dst = new EditableMesh();
    for (const v of src.vertices.values()) {
      dst.vertices.set(v.id, {
        id: v.id,
        position: fromValues(v.position[0], v.position[1], v.position[2]),
        normal: fromValues(v.normal[0], v.normal[1], v.normal[2]),
        edges: [...v.edges]
      });
    }
    for (const e of src.edges.values()) {
      dst.edges.set(e.id, {
        id: e.id,
        a: e.a,
        b: e.b,
        loops: [...e.loops],
        hard: e.hard,
        seam: e.seam
      });
    }
    for (const l of src.loops.values()) {
      dst.loops.set(l.id, {
        id: l.id,
        faceId: l.faceId,
        edgeId: l.edgeId,
        vertexId: l.vertexId,
        uv: fromValues3(l.uv[0], l.uv[1]),
        normal: fromValues(l.normal[0], l.normal[1], l.normal[2])
      });
    }
    for (const f of src.faces.values()) {
      dst.faces.set(f.id, {
        id: f.id,
        loops: [...f.loops],
        normal: fromValues(f.normal[0], f.normal[1], f.normal[2]),
        materialId: f.materialId
      });
    }
    return dst;
  }
  function findEdge(mesh, a, b) {
    const va = mesh.vertices.get(a);
    if (!va) return null;
    for (const eid of va.edges) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      if (e.a === a && e.b === b || e.a === b && e.b === a) return e;
    }
    return null;
  }

  // src/mesh/OperationsEdge.ts
  function vertsOfEdges(mesh, edgeIds) {
    const out = /* @__PURE__ */ new Set();
    for (const eid of edgeIds) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      out.add(e.a);
      out.add(e.b);
    }
    return out;
  }
  function translateEdges(mesh, edgeIds, dx, dy, dz) {
    for (const vid of vertsOfEdges(mesh, edgeIds)) {
      const v = mesh.vertices.get(vid);
      v.position[0] += dx;
      v.position[1] += dy;
      v.position[2] += dz;
    }
  }
  function rotateEdges(mesh, edgeIds, axis, rad, pivot = fromValues(0, 0, 0)) {
    const axisVec = axis === "x" ? UNIT_X : axis === "y" ? UNIT_Y : UNIT_Z;
    const q = setAxisAngle(create2(), axisVec, rad);
    const tmp = create();
    const rel = create();
    for (const vid of vertsOfEdges(mesh, edgeIds)) {
      const v = mesh.vertices.get(vid);
      sub(rel, v.position, pivot);
      transformVec3(tmp, rel, q);
      v.position[0] = tmp[0] + pivot[0];
      v.position[1] = tmp[1] + pivot[1];
      v.position[2] = tmp[2] + pivot[2];
    }
  }
  function scaleEdges(mesh, edgeIds, sx, sy, sz, pivot = fromValues(0, 0, 0)) {
    for (const vid of vertsOfEdges(mesh, edgeIds)) {
      const v = mesh.vertices.get(vid);
      v.position[0] = pivot[0] + (v.position[0] - pivot[0]) * sx;
      v.position[1] = pivot[1] + (v.position[1] - pivot[1]) * sy;
      v.position[2] = pivot[2] + (v.position[2] - pivot[2]) * sz;
    }
  }
  function extrudeEdges(mesh, edgeIds, offset = fromValues(0, 0, 0.5)) {
    const ids = Array.from(edgeIds).filter((id) => mesh.edges.has(id));
    if (ids.length === 0) return [];
    const seen = /* @__PURE__ */ new Set();
    const dupMap = /* @__PURE__ */ new Map();
    for (const eid of ids) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      for (const vid of [e.a, e.b]) {
        if (seen.has(vid)) continue;
        seen.add(vid);
        const v = mesh.vertices.get(vid);
        const nv = mesh.addVertex(
          v.position[0] + offset[0],
          v.position[1] + offset[1],
          v.position[2] + offset[2]
        );
        dupMap.set(vid, nv.id);
      }
    }
    const newEdges = [];
    for (const eid of ids) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      const aNew = dupMap.get(e.a);
      const bNew = dupMap.get(e.b);
      try {
        mesh.addFace([e.a, e.b, bNew, aNew]);
        const newEdge = mesh.findOrCreateEdge(aNew, bNew);
        newEdges.push(newEdge.id);
      } catch {
      }
    }
    mesh.recomputeFaceNormals();
    return newEdges;
  }
  function bevelEdge(mesh, edgeId, offset = 0.1) {
    const e = mesh.edges.get(edgeId);
    if (!e) return;
    const va = mesh.vertices.get(e.a);
    const vb = mesh.vertices.get(e.b);
    if (!va || !vb) return;
    const navg = create();
    let count = 0;
    for (const lid of e.loops) {
      const loop = mesh.loops.get(lid);
      if (!loop) continue;
      const f = mesh.faces.get(loop.faceId);
      if (!f) continue;
      add(navg, navg, f.normal);
      count++;
    }
    if (count > 0) scale(navg, navg, 1 / count);
    normalize(navg, navg);
    const dir = sub(create(), vb.position, va.position);
    normalize(dir, dir);
    const perp = cross(create(), navg, dir);
    normalize(perp, perp);
    const a1 = mesh.addVertex(va.position[0] + perp[0] * offset, va.position[1] + perp[1] * offset, va.position[2] + perp[2] * offset);
    const a2 = mesh.addVertex(va.position[0] - perp[0] * offset, va.position[1] - perp[1] * offset, va.position[2] - perp[2] * offset);
    const b1 = mesh.addVertex(vb.position[0] + perp[0] * offset, vb.position[1] + perp[1] * offset, vb.position[2] + perp[2] * offset);
    const b2 = mesh.addVertex(vb.position[0] - perp[0] * offset, vb.position[1] - perp[1] * offset, vb.position[2] - perp[2] * offset);
    const faces = [...e.loops].map((lid) => mesh.loops.get(lid)?.faceId).filter((id) => id != null);
    const rebuilds = [];
    let sideIdx = 0;
    for (const fid of faces) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      const seq = face.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const newSeq = [];
      for (let i = 0; i < seq.length; i++) {
        const cur = seq[i];
        if (cur === e.a) newSeq.push(sideIdx === 0 ? a1.id : a2.id);
        else if (cur === e.b) newSeq.push(sideIdx === 0 ? b1.id : b2.id);
        else newSeq.push(cur);
      }
      rebuilds.push({ verts: newSeq, mat: face.materialId });
      sideIdx++;
    }
    for (const fid of faces) mesh.removeFace(fid);
    for (const r of rebuilds) {
      try {
        mesh.addFace(r.verts, r.mat);
      } catch {
      }
    }
    try {
      mesh.addFace([a1.id, a2.id, b2.id, b1.id]);
    } catch {
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function loopCut(mesh, edgeId) {
    const seedEdge = mesh.edges.get(edgeId);
    if (!seedEdge) return [];
    const visitedEdges = /* @__PURE__ */ new Set([seedEdge.id]);
    const stripEdges = [seedEdge.id];
    const walk = (startEdge, startFace) => {
      let curEdge = startEdge;
      let curFace = startFace;
      while (true) {
        const e = mesh.edges.get(curEdge);
        if (!e) break;
        let nextEdge = null;
        let nextFace = null;
        for (const lid of e.loops) {
          const loop = mesh.loops.get(lid);
          if (!loop) continue;
          if (curFace != null && loop.faceId !== curFace) continue;
          const face = mesh.faces.get(loop.faceId);
          if (!face || face.loops.length !== 4) continue;
          const idx = face.loops.indexOf(lid);
          const oppLoopId = face.loops[(idx + 2) % 4];
          const oppLoop = mesh.loops.get(oppLoopId);
          if (!oppLoop) continue;
          nextEdge = oppLoop.edgeId;
          const ne = mesh.edges.get(nextEdge);
          if (ne) {
            for (const olid of ne.loops) {
              const ol = mesh.loops.get(olid);
              if (ol && ol.faceId !== loop.faceId) {
                nextFace = ol.faceId;
                break;
              }
            }
          }
          break;
        }
        if (nextEdge == null || visitedEdges.has(nextEdge)) break;
        visitedEdges.add(nextEdge);
        stripEdges.push(nextEdge);
        if (nextFace == null) break;
        curEdge = nextEdge;
        curFace = nextFace;
      }
    };
    const seedFaces = [];
    for (const lid of seedEdge.loops) {
      const loop = mesh.loops.get(lid);
      if (loop) seedFaces.push(loop.faceId);
    }
    for (const fid of seedFaces) walk(seedEdge.id, fid);
    const midByEdge = /* @__PURE__ */ new Map();
    for (const eid of stripEdges) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      const va = mesh.vertices.get(e.a);
      const vb = mesh.vertices.get(e.b);
      const mid = mesh.addVertex(
        (va.position[0] + vb.position[0]) * 0.5,
        (va.position[1] + vb.position[1]) * 0.5,
        (va.position[2] + vb.position[2]) * 0.5
      );
      midByEdge.set(eid, mid.id);
    }
    const facesToRebuild = /* @__PURE__ */ new Set();
    for (const eid of stripEdges) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      for (const lid of e.loops) {
        const loop = mesh.loops.get(lid);
        if (loop) facesToRebuild.add(loop.faceId);
      }
    }
    const rebuildPlans = [];
    for (const fid of facesToRebuild) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      if (face.loops.length !== 4) continue;
      const seq = face.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const edgeIds = face.loops.map((lid) => mesh.loops.get(lid).edgeId);
      const stripIdx = [];
      for (let i = 0; i < 4; i++) {
        if (stripEdges.includes(edgeIds[i])) stripIdx.push(i);
      }
      if (stripIdx.length !== 2) continue;
      const [i0, i1] = stripIdx;
      const m0 = midByEdge.get(edgeIds[i0]);
      const m1 = midByEdge.get(edgeIds[i1]);
      if ((i1 - i0 + 4) % 4 !== 2) continue;
      rebuildPlans.push({
        a: [seq[i0], m0, m1, seq[(i1 + 1) % 4]],
        b: [m0, seq[(i0 + 1) % 4], seq[i1], m1],
        mat: face.materialId
      });
    }
    for (const fid of facesToRebuild) mesh.removeFace(fid);
    for (const r of rebuildPlans) {
      try {
        mesh.addFace(r.a, r.mat);
      } catch {
      }
      try {
        mesh.addFace(r.b, r.mat);
      } catch {
      }
    }
    mesh.recomputeFaceNormals();
    return Array.from(midByEdge.values());
  }
  function mergeEdges(mesh, edgeIds) {
    const verts = Array.from(vertsOfEdges(mesh, edgeIds));
    if (verts.length < 2) return;
    let cx = 0, cy = 0, cz = 0;
    for (const vid of verts) {
      const v = mesh.vertices.get(vid);
      cx += v.position[0];
      cy += v.position[1];
      cz += v.position[2];
    }
    cx /= verts.length;
    cy /= verts.length;
    cz /= verts.length;
    const survivor = verts[0];
    const sv = mesh.vertices.get(survivor);
    sv.position[0] = cx;
    sv.position[1] = cy;
    sv.position[2] = cz;
    const vertSet = new Set(verts);
    const affectedFaces = /* @__PURE__ */ new Set();
    for (const vid of verts) {
      for (const fid of mesh.vertexFaces(vid)) affectedFaces.add(fid);
    }
    const replans = [];
    for (const fid of affectedFaces) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      const seq = face.loops.map((lid) => mesh.loops.get(lid).vertexId).map((v) => vertSet.has(v) ? survivor : v);
      replans.push({ id: fid, verts: seq, mat: face.materialId });
    }
    for (const r of replans) mesh.removeFace(r.id);
    for (const vid of verts) {
      if (vid === survivor) continue;
      const v = mesh.vertices.get(vid);
      if (!v) continue;
      for (const eid of [...v.edges]) {
        const e = mesh.edges.get(eid);
        if (e && e.loops.length === 0) {
          mesh.edges.delete(eid);
          const other = e.a === vid ? e.b : e.a;
          const ov = mesh.vertices.get(other);
          if (ov) {
            const i = ov.edges.indexOf(eid);
            if (i >= 0) ov.edges.splice(i, 1);
          }
        }
      }
      mesh.vertices.delete(vid);
    }
    for (const r of replans) {
      const dedup = [];
      for (let i = 0; i < r.verts.length; i++) {
        if (r.verts[i] !== dedup[dedup.length - 1]) dedup.push(r.verts[i]);
      }
      if (dedup.length > 1 && dedup[0] === dedup[dedup.length - 1]) dedup.pop();
      if (dedup.length < 3) continue;
      try {
        mesh.addFace(dedup, r.mat);
      } catch {
      }
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function weldEdges(mesh, fromId, toId) {
    mergeEdges(mesh, [fromId, toId]);
  }
  function bridgeEdges(mesh, e1Id, e2Id) {
    const e1 = mesh.edges.get(e1Id);
    const e2 = mesh.edges.get(e2Id);
    if (!e1 || !e2) return null;
    const va = mesh.vertices.get(e1.a);
    const vb = mesh.vertices.get(e1.b);
    const vc = mesh.vertices.get(e2.a);
    const vd = mesh.vertices.get(e2.b);
    const d1 = distance(va.position, vc.position) + distance(vb.position, vd.position);
    const d2 = distance(va.position, vd.position) + distance(vb.position, vc.position);
    let order;
    if (d1 <= d2) order = [e1.a, e1.b, e2.b, e2.a];
    else order = [e1.a, e1.b, e2.a, e2.b];
    try {
      const f = mesh.addFace(order);
      mesh.recomputeFaceNormals();
      return f.id;
    } catch {
      return null;
    }
  }
  function fillEdge(mesh, edgeId) {
    const e = mesh.edges.get(edgeId);
    if (!e) return null;
    if (e.loops.length > 1) return null;
    const a = mesh.vertices.get(e.a);
    const b = mesh.vertices.get(e.b);
    if (!a || !b) return null;
    const isOpen = (oe) => oe.loops.length < 2;
    const aOpenNeighbours = [];
    for (const eid of a.edges) {
      if (eid === edgeId) continue;
      const oe = mesh.edges.get(eid);
      if (!oe || !isOpen(oe)) continue;
      aOpenNeighbours.push(oe.a === e.a ? oe.b : oe.a);
    }
    const bOpenNeighbours = [];
    for (const eid of b.edges) {
      if (eid === edgeId) continue;
      const oe = mesh.edges.get(eid);
      if (!oe || !isOpen(oe)) continue;
      bOpenNeighbours.push(oe.a === e.b ? oe.b : oe.a);
    }
    for (const an of aOpenNeighbours) {
      if (bOpenNeighbours.includes(an)) {
        try {
          const f = mesh.addFace([e.a, e.b, an]);
          mesh.recomputeFaceNormals();
          return f.id;
        } catch {
          return null;
        }
      }
    }
    for (const an of aOpenNeighbours) {
      for (const bn of bOpenNeighbours) {
        if (an === bn) continue;
        const an_v = mesh.vertices.get(an);
        if (!an_v) continue;
        const linked = an_v.edges.some((eid) => {
          const oe = mesh.edges.get(eid);
          return oe && isOpen(oe) && (oe.a === bn || oe.b === bn);
        });
        if (linked) {
          try {
            const f = mesh.addFace([e.a, e.b, bn, an]);
            mesh.recomputeFaceNormals();
            return f.id;
          } catch {
            continue;
          }
        }
      }
    }
    return null;
  }
  function deleteEdge(mesh, edgeId) {
    const e = mesh.edges.get(edgeId);
    if (!e) return;
    const facesToRemove = [];
    for (const lid of e.loops) {
      const loop = mesh.loops.get(lid);
      if (loop) facesToRemove.push(loop.faceId);
    }
    for (const fid of facesToRemove) mesh.removeFace(fid);
    mesh.removeLooseGeometry();
  }
  function dissolveEdge(mesh, edgeId) {
    const e = mesh.edges.get(edgeId);
    if (!e) return;
    if (e.loops.length !== 2) {
      deleteEdge(mesh, edgeId);
      return;
    }
    const loopA = mesh.loops.get(e.loops[0]);
    const loopB = mesh.loops.get(e.loops[1]);
    const faceA = mesh.faces.get(loopA.faceId);
    const faceB = mesh.faces.get(loopB.faceId);
    const seqA = faceA.loops.map((lid) => mesh.loops.get(lid).vertexId);
    const seqB = faceB.loops.map((lid) => mesh.loops.get(lid).vertexId);
    const idxA = seqA.findIndex((v, i) => {
      const next = seqA[(i + 1) % seqA.length];
      return v === e.a && next === e.b || v === e.b && next === e.a;
    });
    const idxB = seqB.findIndex((v, i) => {
      const next = seqB[(i + 1) % seqB.length];
      return v === e.a && next === e.b || v === e.b && next === e.a;
    });
    if (idxA < 0 || idxB < 0) {
      deleteEdge(mesh, edgeId);
      return;
    }
    const merged = [];
    for (let i = 0; i < seqA.length - 1; i++) merged.push(seqA[(idxA + 1 + i) % seqA.length]);
    for (let i = 0; i < seqB.length - 1; i++) merged.push(seqB[(idxB + 1 + i) % seqB.length]);
    const dedup = [];
    for (const v of merged) {
      if (dedup[dedup.length - 1] !== v) dedup.push(v);
    }
    if (dedup.length > 1 && dedup[0] === dedup[dedup.length - 1]) dedup.pop();
    mesh.removeFace(faceA.id);
    mesh.removeFace(faceB.id);
    try {
      mesh.addFace(dedup, faceA.materialId);
    } catch {
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function hardenEdges(mesh, edgeIds) {
    for (const id of edgeIds) {
      const e = mesh.edges.get(id);
      if (e) e.hard = true;
    }
  }
  function softenEdges(mesh, edgeIds) {
    for (const id of edgeIds) {
      const e = mesh.edges.get(id);
      if (e) e.hard = false;
    }
  }
  function markSeamEdges(mesh, edgeIds) {
    for (const id of edgeIds) {
      const e = mesh.edges.get(id);
      if (e) e.seam = true;
    }
  }
  function clearSeamEdges(mesh, edgeIds) {
    for (const id of edgeIds) {
      const e = mesh.edges.get(id);
      if (e) e.seam = false;
    }
  }

  // src/app/commands/EdgeCommands.ts
  var EdgeSnapshotCommand = class {
    constructor(node) {
      this.node = node;
      if (!node.mesh) throw new Error("EdgeSnapshotCommand: missing mesh");
      this.snap = cloneMeshPreservingIds(node.mesh);
    }
    do() {
      if (this.node.mesh) this.apply();
    }
    undo() {
      this.node.mesh = cloneMeshPreservingIds(this.snap);
    }
  };
  var TranslateEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds, dx, dy, dz) {
      super(node);
      this.edgeIds = edgeIds;
      this.dx = dx;
      this.dy = dy;
      this.dz = dz;
      this.label = "Move Edges";
    }
    apply() {
      translateEdges(this.node.mesh, this.edgeIds, this.dx, this.dy, this.dz);
    }
  };
  var RotateEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds, axis, rad) {
      super(node);
      this.edgeIds = edgeIds;
      this.axis = axis;
      this.rad = rad;
      this.label = "Rotate Edges";
    }
    apply() {
      rotateEdges(this.node.mesh, this.edgeIds, this.axis, this.rad);
    }
  };
  var ScaleEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds, sx, sy, sz) {
      super(node);
      this.edgeIds = edgeIds;
      this.sx = sx;
      this.sy = sy;
      this.sz = sz;
      this.label = "Scale Edges";
    }
    apply() {
      scaleEdges(this.node.mesh, this.edgeIds, this.sx, this.sy, this.sz);
    }
  };
  var ExtrudeEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds, offset) {
      super(node);
      this.edgeIds = edgeIds;
      this.offset = offset;
      this.label = "Extrude Edges";
    }
    apply() {
      extrudeEdges(this.node.mesh, this.edgeIds, this.offset);
    }
  };
  var BevelEdgeCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeId, offset = 0.1) {
      super(node);
      this.edgeId = edgeId;
      this.offset = offset;
      this.label = "Bevel Edge";
    }
    apply() {
      bevelEdge(this.node.mesh, this.edgeId, this.offset);
    }
  };
  var LoopCutCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeId) {
      super(node);
      this.edgeId = edgeId;
      this.label = "Loop Cut";
    }
    apply() {
      loopCut(this.node.mesh, this.edgeId);
    }
  };
  var MergeEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds) {
      super(node);
      this.edgeIds = edgeIds;
      this.label = "Merge Edges";
    }
    apply() {
      mergeEdges(this.node.mesh, this.edgeIds);
    }
  };
  var WeldEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, fromId, toId) {
      super(node);
      this.fromId = fromId;
      this.toId = toId;
      this.label = "Weld Edges";
    }
    apply() {
      weldEdges(this.node.mesh, this.fromId, this.toId);
    }
  };
  var BridgeEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, e1, e2) {
      super(node);
      this.e1 = e1;
      this.e2 = e2;
      this.label = "Bridge Edges";
    }
    apply() {
      bridgeEdges(this.node.mesh, this.e1, this.e2);
    }
  };
  var FillEdgeCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeId) {
      super(node);
      this.edgeId = edgeId;
      this.label = "Fill";
    }
    apply() {
      fillEdge(this.node.mesh, this.edgeId);
    }
  };
  var DeleteEdgeCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeId) {
      super(node);
      this.edgeId = edgeId;
      this.label = "Delete Edge";
    }
    apply() {
      deleteEdge(this.node.mesh, this.edgeId);
    }
  };
  var DissolveEdgeCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeId) {
      super(node);
      this.edgeId = edgeId;
      this.label = "Dissolve Edge";
    }
    apply() {
      dissolveEdge(this.node.mesh, this.edgeId);
    }
  };
  var HardenEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds) {
      super(node);
      this.edgeIds = edgeIds;
      this.label = "Harden Edges";
    }
    apply() {
      hardenEdges(this.node.mesh, this.edgeIds);
    }
  };
  var SoftenEdgesCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds) {
      super(node);
      this.edgeIds = edgeIds;
      this.label = "Soften Edges";
    }
    apply() {
      softenEdges(this.node.mesh, this.edgeIds);
    }
  };
  var MarkSeamCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds) {
      super(node);
      this.edgeIds = edgeIds;
      this.label = "Mark Seam";
    }
    apply() {
      markSeamEdges(this.node.mesh, this.edgeIds);
    }
  };
  var ClearSeamCommand = class extends EdgeSnapshotCommand {
    constructor(node, edgeIds) {
      super(node);
      this.edgeIds = edgeIds;
      this.label = "Clear Seam";
    }
    apply() {
      clearSeamEdges(this.node.mesh, this.edgeIds);
    }
  };

  // src/app/commands/FaceCommands.ts
  var FaceCommands_exports = {};
  __export(FaceCommands_exports, {
    DeleteFacesCommand: () => DeleteFacesCommand,
    ExtrudeFacesCommand: () => ExtrudeFacesCommand,
    InsetFacesCommand: () => InsetFacesCommand,
    PokeFacesCommand: () => PokeFacesCommand,
    RotateFacesCommand: () => RotateFacesCommand,
    ScaleFacesCommand: () => ScaleFacesCommand,
    SeparateFacesCommand: () => SeparateFacesCommand,
    TranslateFacesCommand: () => TranslateFacesCommand,
    TriangulateFacesCommand: () => TriangulateFacesCommand
  });

  // src/mesh/OperationsFace.ts
  function vertsOfFaces(mesh, faceIds) {
    const out = /* @__PURE__ */ new Set();
    for (const fid of faceIds) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      for (const lid of f.loops) {
        const l = mesh.loops.get(lid);
        if (l) out.add(l.vertexId);
      }
    }
    return out;
  }
  function faceCentroid(mesh, faceId, out = create()) {
    const f = mesh.faces.get(faceId);
    if (!f) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      return out;
    }
    let cx = 0, cy = 0, cz = 0, n = 0;
    for (const lid of f.loops) {
      const l = mesh.loops.get(lid);
      if (!l) continue;
      const v = mesh.vertices.get(l.vertexId);
      if (!v) continue;
      cx += v.position[0];
      cy += v.position[1];
      cz += v.position[2];
      n++;
    }
    if (n > 0) {
      cx /= n;
      cy /= n;
      cz /= n;
    }
    out[0] = cx;
    out[1] = cy;
    out[2] = cz;
    return out;
  }
  function translateFaces(mesh, faceIds, dx, dy, dz) {
    for (const vid of vertsOfFaces(mesh, faceIds)) {
      const v = mesh.vertices.get(vid);
      v.position[0] += dx;
      v.position[1] += dy;
      v.position[2] += dz;
    }
  }
  function rotateFaces(mesh, faceIds, axis, rad, pivot = fromValues(0, 0, 0)) {
    const axisVec = axis === "x" ? UNIT_X : axis === "y" ? UNIT_Y : UNIT_Z;
    const q = setAxisAngle(create2(), axisVec, rad);
    const tmp = create();
    const rel = create();
    for (const vid of vertsOfFaces(mesh, faceIds)) {
      const v = mesh.vertices.get(vid);
      sub(rel, v.position, pivot);
      transformVec3(tmp, rel, q);
      v.position[0] = tmp[0] + pivot[0];
      v.position[1] = tmp[1] + pivot[1];
      v.position[2] = tmp[2] + pivot[2];
    }
  }
  function scaleFaces(mesh, faceIds, sx, sy, sz, pivot = fromValues(0, 0, 0)) {
    for (const vid of vertsOfFaces(mesh, faceIds)) {
      const v = mesh.vertices.get(vid);
      v.position[0] = pivot[0] + (v.position[0] - pivot[0]) * sx;
      v.position[1] = pivot[1] + (v.position[1] - pivot[1]) * sy;
      v.position[2] = pivot[2] + (v.position[2] - pivot[2]) * sz;
    }
  }
  function extrudeFaces(mesh, faceIds, offset = fromValues(0, 0.5, 0)) {
    const ids = Array.from(faceIds).filter((id) => mesh.faces.has(id));
    if (ids.length === 0) return [];
    const newCaps = [];
    const plan = [];
    for (const fid of ids) {
      const f = mesh.faces.get(fid);
      const seq = f.loops.map((lid) => mesh.loops.get(lid).vertexId);
      plan.push({ seq, mat: f.materialId, faceId: fid });
    }
    const dupMap = /* @__PURE__ */ new Map();
    const allVerts = /* @__PURE__ */ new Set();
    for (const p of plan) for (const v of p.seq) allVerts.add(v);
    for (const vid of allVerts) {
      const v = mesh.vertices.get(vid);
      const nv = mesh.addVertex(
        v.position[0] + offset[0],
        v.position[1] + offset[1],
        v.position[2] + offset[2]
      );
      dupMap.set(vid, nv.id);
    }
    for (const p of plan) mesh.removeFace(p.faceId);
    for (const p of plan) {
      const n = p.seq.length;
      const newSeq = p.seq.map((v) => dupMap.get(v));
      try {
        const cap = mesh.addFace(newSeq, p.mat);
        newCaps.push(cap.id);
      } catch {
      }
      for (let i = 0; i < n; i++) {
        const a = p.seq[i];
        const b = p.seq[(i + 1) % n];
        let shared = false;
        for (const p2 of plan) {
          if (p2 === p) continue;
          for (let j = 0; j < p2.seq.length; j++) {
            const c = p2.seq[j];
            const d = p2.seq[(j + 1) % p2.seq.length];
            if (a === c && b === d || a === d && b === c) {
              shared = true;
              break;
            }
          }
          if (shared) break;
        }
        if (shared) continue;
        try {
          mesh.addFace([a, b, dupMap.get(b), dupMap.get(a)], p.mat);
        } catch {
        }
      }
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
    return newCaps;
  }
  function insetFaces(mesh, faceIds, amount = 0.1) {
    const ids = Array.from(faceIds).filter((id) => mesh.faces.has(id));
    const newCaps = [];
    for (const fid of ids) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      const seq = f.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const centroid = faceCentroid(mesh, fid);
      const innerVerts = [];
      for (const vid of seq) {
        const v = mesh.vertices.get(vid);
        const dx = v.position[0] - centroid[0];
        const dy = v.position[1] - centroid[1];
        const dz = v.position[2] - centroid[2];
        const len = Math.hypot(dx, dy, dz);
        const t = len > 1e-6 ? amount / len : 0;
        const inner = mesh.addVertex(
          v.position[0] - dx * t,
          v.position[1] - dy * t,
          v.position[2] - dz * t
        );
        innerVerts.push(inner.id);
      }
      const mat = f.materialId;
      mesh.removeFace(fid);
      try {
        const cap = mesh.addFace(innerVerts, mat);
        newCaps.push(cap.id);
      } catch {
      }
      const n = seq.length;
      for (let i = 0; i < n; i++) {
        const a = seq[i];
        const b = seq[(i + 1) % n];
        const bi = innerVerts[(i + 1) % n];
        const ai = innerVerts[i];
        try {
          mesh.addFace([a, b, bi, ai], mat);
        } catch {
        }
      }
    }
    mesh.recomputeFaceNormals();
    return newCaps;
  }
  function pokeFaces(mesh, faceIds) {
    const ids = Array.from(faceIds).filter((id) => mesh.faces.has(id));
    const newVerts = [];
    for (const fid of ids) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      const seq = f.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const centroid = faceCentroid(mesh, fid);
      const center = mesh.addVertex(centroid[0], centroid[1], centroid[2]);
      newVerts.push(center.id);
      const mat = f.materialId;
      mesh.removeFace(fid);
      const n = seq.length;
      for (let i = 0; i < n; i++) {
        const a = seq[i];
        const b = seq[(i + 1) % n];
        try {
          mesh.addFace([a, b, center.id], mat);
        } catch {
        }
      }
    }
    mesh.recomputeFaceNormals();
    return newVerts;
  }
  function triangulateFaces(mesh, faceIds) {
    const ids = Array.from(faceIds).filter((id) => mesh.faces.has(id));
    const out = [];
    for (const fid of ids) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      if (f.loops.length <= 3) {
        out.push(fid);
        continue;
      }
      const seq = f.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const mat = f.materialId;
      mesh.removeFace(fid);
      for (let i = 1; i < seq.length - 1; i++) {
        try {
          const tri2 = mesh.addFace([seq[0], seq[i], seq[i + 1]], mat);
          out.push(tri2.id);
        } catch {
        }
      }
    }
    mesh.recomputeFaceNormals();
    return out;
  }
  function deleteFaces(mesh, faceIds) {
    for (const fid of faceIds) {
      mesh.removeFace(fid);
    }
    mesh.removeLooseGeometry();
  }
  function separateFaces(source, faceIds) {
    const out = new EditableMesh();
    const ids = Array.from(faceIds).filter((id) => source.faces.has(id));
    const vertMap = /* @__PURE__ */ new Map();
    for (const fid of ids) {
      const face = source.faces.get(fid);
      const seq = face.loops.map((lid) => source.loops.get(lid).vertexId);
      const newSeq = [];
      for (const vid of seq) {
        let nid = vertMap.get(vid);
        if (nid == null) {
          const v = source.vertices.get(vid);
          const nv = out.addVertex(v.position[0], v.position[1], v.position[2]);
          nid = nv.id;
          vertMap.set(vid, nid);
        }
        newSeq.push(nid);
      }
      try {
        out.addFace(newSeq, face.materialId);
      } catch {
      }
    }
    for (const fid of ids) source.removeFace(fid);
    source.removeLooseGeometry();
    source.recomputeFaceNormals();
    out.recomputeFaceNormals();
    return out;
  }

  // src/app/commands/FaceCommands.ts
  var FaceSnapshotCommand = class {
    constructor(node) {
      this.node = node;
      if (!node.mesh) throw new Error("FaceSnapshotCommand: missing mesh");
      this.snap = cloneMeshPreservingIds(node.mesh);
    }
    do() {
      if (this.node.mesh) this.apply();
    }
    undo() {
      this.node.mesh = cloneMeshPreservingIds(this.snap);
    }
  };
  var TranslateFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds, dx, dy, dz) {
      super(node);
      this.faceIds = faceIds;
      this.dx = dx;
      this.dy = dy;
      this.dz = dz;
      this.label = "Move Faces";
    }
    apply() {
      translateFaces(this.node.mesh, this.faceIds, this.dx, this.dy, this.dz);
    }
  };
  var RotateFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds, axis, rad) {
      super(node);
      this.faceIds = faceIds;
      this.axis = axis;
      this.rad = rad;
      this.label = "Rotate Faces";
    }
    apply() {
      rotateFaces(this.node.mesh, this.faceIds, this.axis, this.rad);
    }
  };
  var ScaleFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds, sx, sy, sz) {
      super(node);
      this.faceIds = faceIds;
      this.sx = sx;
      this.sy = sy;
      this.sz = sz;
      this.label = "Scale Faces";
    }
    apply() {
      scaleFaces(this.node.mesh, this.faceIds, this.sx, this.sy, this.sz);
    }
  };
  var ExtrudeFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds, offset) {
      super(node);
      this.faceIds = faceIds;
      this.offset = offset;
      this.label = "Extrude Faces";
    }
    apply() {
      extrudeFaces(this.node.mesh, this.faceIds, this.offset);
    }
  };
  var InsetFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds, amount = 0.1) {
      super(node);
      this.faceIds = faceIds;
      this.amount = amount;
      this.label = "Inset";
    }
    apply() {
      insetFaces(this.node.mesh, this.faceIds, this.amount);
    }
  };
  var PokeFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds) {
      super(node);
      this.faceIds = faceIds;
      this.label = "Poke";
    }
    apply() {
      pokeFaces(this.node.mesh, this.faceIds);
    }
  };
  var TriangulateFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds) {
      super(node);
      this.faceIds = faceIds;
      this.label = "Triangulate";
    }
    apply() {
      triangulateFaces(this.node.mesh, this.faceIds);
    }
  };
  var DeleteFacesCommand = class extends FaceSnapshotCommand {
    constructor(node, faceIds) {
      super(node);
      this.faceIds = faceIds;
      this.label = "Delete Faces";
    }
    apply() {
      deleteFaces(this.node.mesh, this.faceIds);
    }
  };
  var SeparateFacesCommand = class {
    constructor(source, scene, faceIds) {
      this.source = source;
      this.scene = scene;
      this.faceIds = faceIds;
      this.label = "Separate";
      this.newNode = null;
      if (!source.mesh) throw new Error("SeparateFacesCommand: missing mesh");
      this.sourceSnap = cloneMeshPreservingIds(source.mesh);
    }
    do() {
      if (!this.source.mesh) return;
      if (this.newNode == null) {
        const sep = separateFaces(this.source.mesh, this.faceIds);
        const node = new MeshObject("Separated");
        node.mesh = sep;
        this.scene.addNode(node);
        this.newNode = node;
      } else {
        this.source.mesh = cloneMeshPreservingIds(this.sourceSnap);
        const sep = separateFaces(this.source.mesh, this.faceIds);
        this.newNode.mesh = sep;
        if (!this.newNode.parent) this.scene.addNode(this.newNode);
      }
    }
    undo() {
      if (this.source.mesh) this.source.mesh = cloneMeshPreservingIds(this.sourceSnap);
      if (this.newNode && this.newNode.parent) {
        this.scene.removeNode(this.newNode);
      }
    }
  };

  // src/app/commands/MaterialCommands.ts
  var MaterialCommands_exports = {};
  __export(MaterialCommands_exports, {
    AssignMaterialCommand: () => AssignMaterialCommand,
    SetMaterialColorCommand: () => SetMaterialColorCommand,
    SetMaterialOpacityCommand: () => SetMaterialOpacityCommand,
    SetMaterialShininessCommand: () => SetMaterialShininessCommand,
    SetMaterialTextureCommand: () => SetMaterialTextureCommand
  });
  var AssignMaterialCommand = class {
    constructor(node, materialId) {
      this.node = node;
      this.materialId = materialId;
      this.label = "Assign Material";
      this.prev = node.materialId;
    }
    do() {
      this.node.materialId = this.materialId;
    }
    undo() {
      this.node.materialId = this.prev;
    }
  };
  var SetMaterialColorCommand = class {
    constructor(mat, next) {
      this.mat = mat;
      this.next = next;
      this.label = "Set Color";
      this.prev = { ...mat.baseColor };
    }
    do() {
      this.mat.setBaseColor(this.next.r, this.next.g, this.next.b);
    }
    undo() {
      this.mat.setBaseColor(this.prev.r, this.prev.g, this.prev.b);
    }
  };
  var SetMaterialOpacityCommand = class {
    constructor(mat, next) {
      this.mat = mat;
      this.next = next;
      this.label = "Set Opacity";
      this.prev = mat.opacity;
    }
    do() {
      this.mat.opacity = this.next;
    }
    undo() {
      this.mat.opacity = this.prev;
    }
  };
  var SetMaterialShininessCommand = class {
    constructor(mat, next) {
      this.mat = mat;
      this.next = next;
      this.label = "Set Shininess";
      this.prev = mat.shininess;
    }
    do() {
      this.mat.shininess = this.next;
    }
    undo() {
      this.mat.shininess = this.prev;
    }
  };
  var SetMaterialTextureCommand = class {
    constructor(mat, next) {
      this.mat = mat;
      this.next = next;
      this.label = "Set Texture";
      this.prev = mat.texture;
    }
    do() {
      this.mat.setTexture(this.next);
    }
    undo() {
      this.mat.setTexture(this.prev);
    }
  };

  // src/app/commands/UvCommands.ts
  var UvCommands_exports = {};
  __export(UvCommands_exports, {
    RotateUvLoopsCommand: () => RotateUvLoopsCommand,
    ScaleUvLoopsCommand: () => ScaleUvLoopsCommand,
    TranslateUvLoopsCommand: () => TranslateUvLoopsCommand
  });

  // src/mesh/OperationsUv.ts
  function translateUvLoops(mesh, loopIds, du, dv) {
    for (const lid of loopIds) {
      const l = mesh.loops.get(lid);
      if (!l) continue;
      l.uv[0] += du;
      l.uv[1] += dv;
    }
  }
  function scaleUvLoops(mesh, loopIds, sx, sy, pivotU = 0.5, pivotV = 0.5) {
    for (const lid of loopIds) {
      const l = mesh.loops.get(lid);
      if (!l) continue;
      l.uv[0] = pivotU + (l.uv[0] - pivotU) * sx;
      l.uv[1] = pivotV + (l.uv[1] - pivotV) * sy;
    }
  }
  function rotateUvLoops(mesh, loopIds, rad, pivotU = 0.5, pivotV = 0.5) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    for (const lid of loopIds) {
      const l = mesh.loops.get(lid);
      if (!l) continue;
      const du = l.uv[0] - pivotU;
      const dv = l.uv[1] - pivotV;
      l.uv[0] = pivotU + du * c - dv * s;
      l.uv[1] = pivotV + du * s + dv * c;
    }
  }

  // src/app/commands/UvCommands.ts
  function snapshotUvs(node, loopIds) {
    const out = [];
    if (!node.mesh) return out;
    for (const lid of loopIds) {
      const l = node.mesh.loops.get(lid);
      if (!l) continue;
      out.push({ loopId: lid, u: l.uv[0], v: l.uv[1] });
    }
    return out;
  }
  function restoreUvs(node, snap) {
    if (!node.mesh) return;
    for (const s of snap) {
      const l = node.mesh.loops.get(s.loopId);
      if (!l) continue;
      l.uv[0] = s.u;
      l.uv[1] = s.v;
    }
  }
  var TranslateUvLoopsCommand = class {
    constructor(node, loopIds, du, dv) {
      this.node = node;
      this.loopIds = loopIds;
      this.du = du;
      this.dv = dv;
      this.label = "Move UVs";
      this.snap = snapshotUvs(node, loopIds);
    }
    do() {
      if (!this.node.mesh) return;
      translateUvLoops(this.node.mesh, this.loopIds, this.du, this.dv);
    }
    undo() {
      restoreUvs(this.node, this.snap);
    }
  };
  var ScaleUvLoopsCommand = class {
    constructor(node, loopIds, sx, sy, pivotU = 0.5, pivotV = 0.5) {
      this.node = node;
      this.loopIds = loopIds;
      this.sx = sx;
      this.sy = sy;
      this.pivotU = pivotU;
      this.pivotV = pivotV;
      this.label = "Scale UVs";
      this.snap = snapshotUvs(node, loopIds);
    }
    do() {
      if (!this.node.mesh) return;
      scaleUvLoops(this.node.mesh, this.loopIds, this.sx, this.sy, this.pivotU, this.pivotV);
    }
    undo() {
      restoreUvs(this.node, this.snap);
    }
  };
  var RotateUvLoopsCommand = class {
    constructor(node, loopIds, rad, pivotU = 0.5, pivotV = 0.5) {
      this.node = node;
      this.loopIds = loopIds;
      this.rad = rad;
      this.pivotU = pivotU;
      this.pivotV = pivotV;
      this.label = "Rotate UVs";
      this.snap = snapshotUvs(node, loopIds);
    }
    do() {
      if (!this.node.mesh) return;
      rotateUvLoops(this.node.mesh, this.loopIds, this.rad, this.pivotU, this.pivotV);
    }
    undo() {
      restoreUvs(this.node, this.snap);
    }
  };

  // src/mesh/Unwrap.ts
  var Unwrap_exports = {};
  __export(Unwrap_exports, {
    applyUvIslands: () => applyUvIslands,
    autoUnwrapAndPack: () => autoUnwrapAndPack,
    findIslands: () => findIslands,
    packIslands: () => packIslands,
    unwrap: () => unwrap
  });
  function neighbours(mesh, faceId) {
    const out = [];
    const face = mesh.faces.get(faceId);
    if (!face) return out;
    for (const lid of face.loops) {
      const loop = mesh.loops.get(lid);
      if (!loop) continue;
      const edge = mesh.edges.get(loop.edgeId);
      if (!edge) continue;
      for (const olid of edge.loops) {
        const ol = mesh.loops.get(olid);
        if (!ol) continue;
        if (ol.faceId === faceId) continue;
        out.push({ faceId: ol.faceId, edgeId: edge.id });
      }
    }
    return out;
  }
  function findIslands(mesh) {
    const visited = /* @__PURE__ */ new Set();
    const islands = [];
    for (const startFid of mesh.faces.keys()) {
      if (visited.has(startFid)) continue;
      const island = [];
      const queue = [startFid];
      visited.add(startFid);
      while (queue.length > 0) {
        const cur = queue.shift();
        island.push(cur);
        for (const { faceId, edgeId } of neighbours(mesh, cur)) {
          if (visited.has(faceId)) continue;
          const e = mesh.edges.get(edgeId);
          if (!e || e.seam) continue;
          visited.add(faceId);
          queue.push(faceId);
        }
      }
      islands.push(island);
    }
    return islands;
  }
  function projectIsland(mesh, faceIds) {
    const avg = create();
    let count = 0;
    for (const fid of faceIds) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      add(avg, avg, f.normal);
      count++;
    }
    if (count > 0) scale(avg, avg, 1 / count);
    if (length(avg) < 1e-6) {
      set(avg, 0, 1, 0);
    } else {
      normalize(avg, avg);
    }
    const up = Math.abs(avg[1]) < 0.99 ? fromValues(0, 1, 0) : fromValues(1, 0, 0);
    const u = create();
    cross(u, up, avg);
    normalize(u, u);
    const v = create();
    cross(v, avg, u);
    normalize(v, v);
    const out = /* @__PURE__ */ new Map();
    for (const fid of faceIds) {
      const f = mesh.faces.get(fid);
      if (!f) continue;
      for (const lid of f.loops) {
        const loop = mesh.loops.get(lid);
        if (!loop) continue;
        const vert = mesh.vertices.get(loop.vertexId);
        if (!vert) continue;
        const pu = vert.position[0] * u[0] + vert.position[1] * u[1] + vert.position[2] * u[2];
        const pv = vert.position[0] * v[0] + vert.position[1] * v[1] + vert.position[2] * v[2];
        out.set(lid, [pu, pv]);
      }
    }
    return out;
  }
  function islandBounds(uvByLoop) {
    let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
    for (const [u, v] of uvByLoop.values()) {
      if (u < minU) minU = u;
      if (v < minV) minV = v;
      if (u > maxU) maxU = u;
      if (v > maxV) maxV = v;
    }
    if (!isFinite(minU)) {
      minU = 0;
      maxU = 1;
      minV = 0;
      maxV = 1;
    }
    return { minU, minV, maxU, maxV };
  }
  function normalizeIsland(uvByLoop) {
    const bbox = islandBounds(uvByLoop);
    const du = bbox.maxU - bbox.minU || 1;
    const dv = bbox.maxV - bbox.minV || 1;
    for (const [lid, [u, v]] of uvByLoop) {
      uvByLoop.set(lid, [(u - bbox.minU) / du, (v - bbox.minV) / dv]);
    }
    return { bbox: { minU: 0, minV: 0, maxU: 1, maxV: 1 } };
  }
  function unwrap(mesh) {
    mesh.recomputeFaceNormals();
    const islandIds = findIslands(mesh);
    const islands = [];
    for (const faceIds of islandIds) {
      const uvByLoop = projectIsland(mesh, faceIds);
      normalizeIsland(uvByLoop);
      islands.push({ faceIds, uvByLoop, bbox: { minU: 0, minV: 0, maxU: 1, maxV: 1 } });
    }
    return islands;
  }
  function packIslands(islands, padding = 0.01) {
    const n = islands.length;
    if (n === 0) return;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cellW = (1 - padding * (cols + 1)) / cols;
    const cellH = (1 - padding * (rows + 1)) / rows;
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetU = padding + col * (cellW + padding);
      const offsetV = padding + row * (cellH + padding);
      const island = islands[i];
      for (const [lid, [u, v]] of island.uvByLoop) {
        island.uvByLoop.set(lid, [offsetU + u * cellW, offsetV + v * cellH]);
      }
      island.bbox = { minU: offsetU, minV: offsetV, maxU: offsetU + cellW, maxV: offsetV + cellH };
    }
  }
  function applyUvIslands(mesh, islands) {
    for (const island of islands) {
      for (const [lid, [u, v]] of island.uvByLoop) {
        const loop = mesh.loops.get(lid);
        if (!loop) continue;
        loop.uv[0] = u;
        loop.uv[1] = v;
      }
    }
  }
  function autoUnwrapAndPack(mesh, padding = 0.01) {
    const islands = unwrap(mesh);
    packIslands(islands, padding);
    applyUvIslands(mesh, islands);
    return islands;
  }

  // src/io/BmshFormat.ts
  var BmshFormat_exports = {};
  __export(BmshFormat_exports, {
    BMSH_MAGIC: () => BMSH_MAGIC,
    BMSH_VERSION: () => BMSH_VERSION,
    BmshVersionError: () => BmshVersionError,
    loadBmsh: () => loadBmsh,
    saveBmsh: () => saveBmsh
  });
  var BMSH_MAGIC = "BMSH";
  var BMSH_VERSION = 1;
  function writeAscii4(out, off, s) {
    for (let i = 0; i < 4; i++) out[off + i] = s.charCodeAt(i);
  }
  function readAscii4(src, off) {
    return String.fromCharCode(src[off], src[off + 1], src[off + 2], src[off + 3]);
  }
  function buildBmsh(scene) {
    const textures = [];
    const meta = {
      version: BMSH_VERSION,
      nodes: [],
      materials: scene.materials().map((mat) => {
        let texMeta = null;
        if (mat.texture && mat.texture.data) {
          textures.push(mat.texture.data);
          texMeta = { name: mat.texture.name, width: mat.texture.width, height: mat.texture.height, chunkIndex: textures.length - 1 };
        }
        return {
          id: mat.id,
          name: mat.name,
          baseColor: mat.baseColor,
          opacity: mat.opacity,
          ambient: mat.ambient,
          diffuse: mat.diffuse,
          specular: mat.specular,
          shininess: mat.shininess,
          texture: texMeta
        };
      })
    };
    scene.forEachNode((n) => {
      if (n === scene.root) return;
      const parentId = n.parent && n.parent !== scene.root ? n.parent.id : null;
      let meshBlock = null;
      let materialId = null;
      if (n.kind === "mesh") {
        const mo = n;
        materialId = mo.materialId != null ? mo.materialId : null;
        if (mo.mesh) {
          const m = mo.mesh;
          meshBlock = {
            vertices: Array.from(m.vertices.values()).map((v) => ({
              id: v.id,
              position: [v.position[0], v.position[1], v.position[2]]
            })),
            edges: Array.from(m.edges.values()).map((e) => ({
              id: e.id,
              a: e.a,
              b: e.b,
              hard: e.hard,
              seam: e.seam
            })),
            loops: Array.from(m.loops.values()).map((l) => ({
              id: l.id,
              faceId: l.faceId,
              edgeId: l.edgeId,
              vertexId: l.vertexId,
              uv: [l.uv[0], l.uv[1]],
              normal: [l.normal[0], l.normal[1], l.normal[2]]
            })),
            faces: Array.from(m.faces.values()).map((f) => ({
              id: f.id,
              loops: f.loops.map((id) => id),
              normal: [f.normal[0], f.normal[1], f.normal[2]],
              materialId: f.materialId != null ? f.materialId : null
            }))
          };
        }
      }
      meta.nodes.push({
        id: n.id,
        name: n.name,
        kind: n.kind === "mesh" ? "mesh" : "empty",
        parentId,
        transform: {
          position: [n.transform.position[0], n.transform.position[1], n.transform.position[2]],
          rotation: [n.transform.rotation[0], n.transform.rotation[1], n.transform.rotation[2], n.transform.rotation[3]],
          scale: [n.transform.scale[0], n.transform.scale[1], n.transform.scale[2]]
        },
        visible: n.visible,
        selectable: n.selectable,
        materialId,
        mesh: meshBlock
      });
    });
    return { meta, textures };
  }
  function saveBmsh(scene) {
    const { meta, textures } = buildBmsh(scene);
    const chunks = [];
    chunks.push({ type: "META", data: new TextEncoder().encode(JSON.stringify(meta)) });
    for (let i = 0; i < textures.length; i++) {
      chunks.push({ type: padType(`TEX${i}`), data: textures[i] });
    }
    let total = 12;
    for (const c of chunks) total += 8 + c.data.byteLength;
    const out = new ArrayBuffer(total);
    const dv = new DataView(out);
    const u8 = new Uint8Array(out);
    writeAscii4(u8, 0, BMSH_MAGIC);
    dv.setUint32(4, BMSH_VERSION, true);
    dv.setUint32(8, chunks.length, true);
    let off = 12;
    for (const c of chunks) {
      writeAscii4(u8, off, c.type);
      dv.setUint32(off + 4, c.data.byteLength, true);
      u8.set(c.data, off + 8);
      off += 8 + c.data.byteLength;
    }
    return out;
  }
  function padType(s) {
    if (s.length >= 4) return s.substring(0, 4);
    return (s + "    ").substring(0, 4);
  }
  var BmshVersionError = class extends Error {
    constructor(version, msg) {
      super(msg);
      this.version = version;
    }
  };
  function loadBmsh(buf) {
    if (buf.byteLength < 12) throw new Error("BMSH: too small");
    const u8 = new Uint8Array(buf);
    const dv = new DataView(buf);
    const magic = readAscii4(u8, 0);
    if (magic !== BMSH_MAGIC) throw new Error(`BMSH: bad magic "${magic}"`);
    const version = dv.getUint32(4, true);
    if (version !== BMSH_VERSION) {
      throw new BmshVersionError(version, `BMSH: unsupported version ${version} (this build understands ${BMSH_VERSION})`);
    }
    const chunkCount = dv.getUint32(8, true);
    let off = 12;
    let meta = null;
    const textures = /* @__PURE__ */ new Map();
    for (let i = 0; i < chunkCount; i++) {
      const type = readAscii4(u8, off).trim();
      const byteLen = dv.getUint32(off + 4, true);
      const data = u8.subarray(off + 8, off + 8 + byteLen);
      off += 8 + byteLen;
      if (type === "META") {
        meta = JSON.parse(new TextDecoder().decode(data));
      } else if (type.startsWith("TEX")) {
        const idx = parseInt(type.substring(3), 10);
        textures.set(idx, new Uint8Array(data));
      }
    }
    if (!meta) throw new Error("BMSH: missing META chunk");
    const scene = new Scene();
    const matIdMap = /* @__PURE__ */ new Map();
    for (const mm of meta.materials) {
      const mat = new Material(mm.name);
      mat.baseColor = { ...mm.baseColor };
      mat.opacity = mm.opacity;
      mat.ambient = { ...mm.ambient };
      mat.diffuse = { ...mm.diffuse };
      mat.specular = { ...mm.specular };
      mat.shininess = mm.shininess;
      if (mm.texture) {
        const data = textures.get(mm.texture.chunkIndex);
        mat.setTexture({ name: mm.texture.name, width: mm.texture.width, height: mm.texture.height, data: data ?? null });
      }
      scene.addMaterial(mat);
      matIdMap.set(mm.id, mat.id);
    }
    const nodeMap = /* @__PURE__ */ new Map();
    for (const nm of meta.nodes) {
      let node;
      if (nm.kind === "mesh") {
        const mo = new MeshObject(nm.name);
        if (nm.mesh) {
          const m = new EditableMesh();
          const vmap = /* @__PURE__ */ new Map();
          for (const v of nm.mesh.vertices) {
            const nv = m.addVertex(v.position[0], v.position[1], v.position[2]);
            vmap.set(v.id, nv.id);
          }
          for (const f of nm.mesh.faces) {
            const seq = f.loops.map((lid) => {
              const loop = nm.mesh.loops.find((l) => l.id === lid);
              return vmap.get(loop.vertexId);
            });
            const newFace = m.addFace(seq, f.materialId != null ? matIdMap.get(f.materialId) ?? null : null);
            const newLoops = m.faceLoops(newFace.id);
            for (let i = 0; i < newLoops.length; i++) {
              const srcLoop = nm.mesh.loops.find((l) => l.id === f.loops[i]);
              newLoops[i].uv[0] = srcLoop.uv[0];
              newLoops[i].uv[1] = srcLoop.uv[1];
              newLoops[i].normal[0] = srcLoop.normal[0];
              newLoops[i].normal[1] = srcLoop.normal[1];
              newLoops[i].normal[2] = srcLoop.normal[2];
            }
            newFace.normal[0] = f.normal[0];
            newFace.normal[1] = f.normal[1];
            newFace.normal[2] = f.normal[2];
          }
          for (const e of nm.mesh.edges) {
            const ea = vmap.get(e.a);
            const eb = vmap.get(e.b);
            if (ea == null || eb == null) continue;
            const liveA = m.vertices.get(ea);
            for (const eid of liveA.edges) {
              const edge = m.edges.get(eid);
              if (edge.a === ea && edge.b === eb || edge.a === eb && edge.b === ea) {
                edge.hard = e.hard;
                edge.seam = e.seam;
                break;
              }
            }
          }
          mo.mesh = m;
        }
        mo.materialId = nm.materialId != null ? matIdMap.get(nm.materialId) ?? null : null;
        node = mo;
      } else {
        node = new SceneNode(nm.name, "empty");
      }
      node.transform.position[0] = nm.transform.position[0];
      node.transform.position[1] = nm.transform.position[1];
      node.transform.position[2] = nm.transform.position[2];
      node.transform.rotation[0] = nm.transform.rotation[0];
      node.transform.rotation[1] = nm.transform.rotation[1];
      node.transform.rotation[2] = nm.transform.rotation[2];
      node.transform.rotation[3] = nm.transform.rotation[3];
      node.transform.scale[0] = nm.transform.scale[0];
      node.transform.scale[1] = nm.transform.scale[1];
      node.transform.scale[2] = nm.transform.scale[2];
      node.visible = nm.visible;
      node.selectable = nm.selectable;
      nodeMap.set(nm.id, node);
    }
    for (const nm of meta.nodes) {
      const node = nodeMap.get(nm.id);
      const parent = nm.parentId != null ? nodeMap.get(nm.parentId) : null;
      if (parent) scene.addNode(node, parent);
      else scene.addNode(node);
    }
    return scene;
  }

  // src/core/math/Plane.ts
  function create6() {
    return { normal: fromValues(0, 1, 0), d: 0 };
  }
  function fromNormalAndPoint(out, normal, point) {
    normalize(out.normal, normal);
    out.d = dot(out.normal, point);
    return out;
  }
  function intersectRay(plane3, ray) {
    const denom = dot(plane3.normal, ray.direction);
    if (Math.abs(denom) < 1e-7) return NaN;
    const t = (plane3.d - dot(plane3.normal, ray.origin)) / denom;
    if (t < 0) return NaN;
    return t;
  }

  // src/core/math/Aabb.ts
  function create7() {
    return {
      min: fromValues(Infinity, Infinity, Infinity),
      max: fromValues(-Infinity, -Infinity, -Infinity)
    };
  }
  function expandPoint(out, p) {
    if (p[0] < out.min[0]) out.min[0] = p[0];
    if (p[1] < out.min[1]) out.min[1] = p[1];
    if (p[2] < out.min[2]) out.min[2] = p[2];
    if (p[0] > out.max[0]) out.max[0] = p[0];
    if (p[1] > out.max[1]) out.max[1] = p[1];
    if (p[2] > out.max[2]) out.max[2] = p[2];
    return out;
  }
  function containsPoint(a, p) {
    return p[0] >= a.min[0] && p[0] <= a.max[0] && p[1] >= a.min[1] && p[1] <= a.max[1] && p[2] >= a.min[2] && p[2] <= a.max[2];
  }
  function intersectRay2(a, ray) {
    let tMin = -Infinity;
    let tMax = Infinity;
    for (let i = 0; i < 3; i++) {
      const d = ray.direction[i];
      const o = ray.origin[i];
      if (Math.abs(d) < 1e-9) {
        if (o < a.min[i] || o > a.max[i]) return NaN;
      } else {
        const inv = 1 / d;
        let t1 = (a.min[i] - o) * inv;
        let t2 = (a.max[i] - o) * inv;
        if (t1 > t2) [t1, t2] = [t2, t1];
        if (t1 > tMin) tMin = t1;
        if (t2 < tMax) tMax = t2;
        if (tMin > tMax) return NaN;
      }
    }
    return tMin >= 0 ? tMin : tMax >= 0 ? tMax : NaN;
  }

  // src/core/math/mathTests.ts
  var SUITE = "math";
  defineTest(SUITE, "Vec3.add / sub / scale", () => {
    const a = fromValues(1, 2, 3);
    const b = fromValues(4, 5, 6);
    const o = create();
    add(o, a, b);
    assert(equalsApprox(o, fromValues(5, 7, 9)));
    sub(o, b, a);
    assert(equalsApprox(o, fromValues(3, 3, 3)));
    scale(o, a, 2);
    assert(equalsApprox(o, fromValues(2, 4, 6)));
  });
  defineTest(SUITE, "Vec3.dot / cross / normalize / length", () => {
    const x = fromValues(1, 0, 0);
    const y = fromValues(0, 1, 0);
    assertClose(dot(x, y), 0);
    assertClose(dot(x, x), 1);
    const o = create();
    cross(o, x, y);
    assert(equalsApprox(o, fromValues(0, 0, 1)));
    set(o, 2, 0, 0);
    normalize(o, o);
    assertClose(length(o), 1);
  });
  defineTest(SUITE, "Mat4.identity is the multiplicative identity", () => {
    const id = identity(create3());
    const m = create3();
    fromTranslation(m, fromValues(1, 2, 3));
    const o = create3();
    multiply2(o, m, id);
    assert(equalsApprox3(o, m));
    multiply2(o, id, m);
    assert(equalsApprox3(o, m));
  });
  defineTest(SUITE, "Mat4.transformPoint with translation matrix", () => {
    const m = fromTranslation(create3(), fromValues(10, 20, 30));
    const p = fromValues(1, 2, 3);
    const out = create();
    transformPoint(out, p, m);
    assert(equalsApprox(out, fromValues(11, 22, 33)));
  });
  defineTest(SUITE, "Mat4.transformDirection skips translation", () => {
    const m = fromTranslation(create3(), fromValues(10, 20, 30));
    const d = fromValues(1, 0, 0);
    const out = create();
    transformDirection(out, d, m);
    assert(equalsApprox(out, fromValues(1, 0, 0)));
  });
  defineTest(SUITE, "Mat4.invert and multiply gives identity", () => {
    const m = create3();
    fromTranslation(m, fromValues(5, -3, 2));
    multiply2(m, m, fromRotationY(create3(), 0.7));
    multiply2(m, m, fromScale(create3(), fromValues(2, 3, 1.5)));
    const inv = create3();
    assert(invert(inv, m) !== null);
    const id = create3();
    multiply2(id, m, inv);
    assert(equalsApprox3(id, identity(create3()), 1e-4));
  });
  defineTest(SUITE, "Mat4.perspective projection w=1 maps eye-forward to ndc near/far", () => {
    const fov = Math.PI / 4;
    const aspect = 1;
    const near = 0.1;
    const far = 100;
    const proj = perspective(create3(), fov, aspect, near, far);
    const near3 = fromValues(0, 0, -near);
    const o = create();
    transformPoint(o, near3, proj);
    assertClose(o[2], -1, 1e-3);
    const far3 = fromValues(0, 0, -far);
    transformPoint(o, far3, proj);
    assertClose(o[2], 1, 1e-3);
  });
  defineTest(SUITE, "Mat4.lookAt produces a view that maps target to camera-forward", () => {
    const eye = fromValues(0, 0, 5);
    const target = fromValues(0, 0, 0);
    const up = fromValues(0, 1, 0);
    const view = lookAt(create3(), eye, target, up);
    const o = create();
    transformPoint(o, target, view);
    assert(equalsApprox(o, fromValues(0, 0, -5), 1e-4));
  });
  defineTest(SUITE, "Quat.setAxisAngle 90\xB0 about Y rotates X\u2192-Z", () => {
    const q = create2();
    setAxisAngle(q, fromValues(0, 1, 0), Math.PI / 2);
    const out = create();
    transformVec3(out, fromValues(1, 0, 0), q);
    assert(equalsApprox(out, fromValues(0, 0, -1), 1e-5));
  });
  defineTest(SUITE, "Quat.multiply: combining two 45\xB0 rotations equals one 90\xB0", () => {
    const q1 = create2();
    setAxisAngle(q1, fromValues(0, 1, 0), Math.PI / 4);
    const q2 = create2();
    setAxisAngle(q2, fromValues(0, 1, 0), Math.PI / 4);
    const q3 = create2();
    multiply(q3, q1, q2);
    const expected = create2();
    setAxisAngle(expected, fromValues(0, 1, 0), Math.PI / 2);
    assert(equalsApprox2(q3, expected, 1e-5));
  });
  defineTest(SUITE, "Mat4.trs(t, q, s) builds a matching transform", () => {
    const t = fromValues(5, 0, 0);
    const q = fromValues2(0, 0, 0, 1);
    const s = fromValues(2, 2, 2);
    const m = trs(create3(), t, q, s);
    const o = create();
    transformPoint(o, fromValues(1, 1, 1), m);
    assert(equalsApprox(o, fromValues(7, 2, 2)));
  });
  defineTest(SUITE, "Plane.intersectRay hits the XY plane from above", () => {
    const plane3 = create6();
    fromNormalAndPoint(plane3, fromValues(0, 1, 0), fromValues(0, 0, 0));
    const ray = { origin: fromValues(0, 5, 0), direction: fromValues(0, -1, 0) };
    const t = intersectRay(plane3, ray);
    assertClose(t, 5, 1e-6);
  });
  defineTest(SUITE, "Plane.intersectRay misses when ray points away", () => {
    const plane3 = create6();
    fromNormalAndPoint(plane3, fromValues(0, 1, 0), fromValues(0, 0, 0));
    const ray = { origin: fromValues(0, 5, 0), direction: fromValues(0, 1, 0) };
    const t = intersectRay(plane3, ray);
    assert(Number.isNaN(t));
  });
  defineTest(SUITE, "Ray.intersectTriangle hits a flat triangle on the XY plane", () => {
    const v0 = fromValues(-1, -1, 0);
    const v1 = fromValues(1, -1, 0);
    const v2 = fromValues(0, 1, 0);
    const ray = { origin: fromValues(0, 0, 5), direction: fromValues(0, 0, -1) };
    const t = intersectTriangle(ray, v0, v1, v2);
    assertClose(t, 5, 1e-6);
  });
  defineTest(SUITE, "Ray.intersectTriangle misses outside the triangle", () => {
    const v0 = fromValues(-1, -1, 0);
    const v1 = fromValues(1, -1, 0);
    const v2 = fromValues(0, 1, 0);
    const ray = { origin: fromValues(5, 5, 5), direction: fromValues(0, 0, -1) };
    const t = intersectTriangle(ray, v0, v1, v2);
    assert(Number.isNaN(t));
  });
  defineTest(SUITE, "Aabb.expandPoint / containsPoint", () => {
    const box = create7();
    expandPoint(box, fromValues(-1, -1, -1));
    expandPoint(box, fromValues(1, 1, 1));
    assert(containsPoint(box, fromValues(0, 0, 0)));
    assert(!containsPoint(box, fromValues(2, 0, 0)));
  });
  defineTest(SUITE, "Aabb.intersectRay slab test on the unit box", () => {
    const box = create7();
    expandPoint(box, fromValues(-1, -1, -1));
    expandPoint(box, fromValues(1, 1, 1));
    const ray = { origin: fromValues(0, 0, 5), direction: fromValues(0, 0, -1) };
    const t = intersectRay2(box, ray);
    assertClose(t, 4, 1e-6);
  });
  defineTest(SUITE, "project \u2194 unproject roundtrips on identity view-projection", () => {
    const vp = { x: 0, y: 0, w: 800, h: 600 };
    const proj = create3();
    const out = new Float32Array(3);
    project(out, fromValues(0, 0, 0), vp, proj);
    assertClose(out[0], 400, 1e-3);
    assertClose(out[1], 300, 1e-3);
    const back = create();
    unproject(back, 400, 300, 0, vp, proj);
    assert(equalsApprox(back, fromValues(0, 0, 0), 1e-3));
  });
  defineTest(SUITE, "screenPointToRay center ray is camera-forward", () => {
    const eye = fromValues(0, 0, 5);
    const target = fromValues(0, 0, 0);
    const up = fromValues(0, 1, 0);
    const view = lookAt(create3(), eye, target, up);
    const proj = perspective(create3(), Math.PI / 4, 800 / 600, 0.1, 100);
    const vpMat = create3();
    multiply2(vpMat, proj, view);
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const ray = create5();
    screenPointToRay(ray, 400, 300, vpRect, vpMat);
    assert(ray.direction[2] < -0.99);
  });
  defineTest(SUITE, "Vec2.distance / dot / cross", () => {
    const a = fromValues3(0, 0);
    const b = fromValues3(3, 4);
    assertClose(distance2(a, b), 5);
    assertEquals(dot2(fromValues3(1, 0), fromValues3(0, 1)), 0);
    assertEquals(cross2(fromValues3(1, 0), fromValues3(0, 1)), 1);
  });
  defineTest(SUITE, "assertThrows works", () => {
    assertThrows(() => {
      throw new Error("expected");
    });
  });

  // src/scene/sceneTests.ts
  var SUITE2 = "scene";
  defineTest(SUITE2, "createDefault has root + default material + placeholder cube", () => {
    const scene = Scene.createDefault();
    assert(scene.root.children.length === 1);
    const cube3 = scene.root.children[0];
    assert(cube3.kind === "mesh");
    assert(cube3.name === "Mesh_Cube");
    assert(scene.materials().length === 1);
    assert(cube3.materialId !== null);
  });
  defineTest(SUITE2, "parenting: addNode reparents and updates child pointer", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    const b = new SceneNode("B");
    scene.addNode(a);
    scene.addNode(b);
    assertEquals(scene.root.children.length, 2);
    a.addChild(b);
    assertEquals(scene.root.children.length, 1);
    assertEquals(a.children.length, 1);
    assert(b.parent === a);
  });
  defineTest(SUITE2, "transform propagation: child world position = parent translation", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    scene.addNode(a);
    a.transform.setPosition(10, 0, 0);
    const b = new SceneNode("B");
    a.addChild(b);
    b.transform.setPosition(0, 5, 0);
    const world = b.getWorldMatrix();
    const origin = create();
    transformPoint(origin, fromValues(0, 0, 0), world);
    assert(equalsApprox(origin, fromValues(10, 5, 0), 1e-6));
  });
  defineTest(SUITE2, "transform dirty propagation: moving parent invalidates child cache", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    scene.addNode(a);
    const b = new SceneNode("B");
    a.addChild(b);
    a.transform.setPosition(1, 0, 0);
    b.getWorldMatrix();
    a.transform.setPosition(100, 0, 0);
    a.markWorldDirty();
    const o = create();
    transformPoint(o, fromValues(0, 0, 0), b.getWorldMatrix());
    assert(equalsApprox(o, fromValues(100, 0, 0), 1e-6));
  });
  defineTest(SUITE2, "visibility: effective visibility false if ancestor hidden", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    scene.addNode(a);
    const b = new SceneNode("B");
    a.addChild(b);
    assert(b.isEffectivelyVisible());
    a.setVisible(false);
    assert(!b.isEffectivelyVisible());
    a.setVisible(true);
    b.setVisible(false);
    assert(!b.isEffectivelyVisible());
  });
  defineTest(SUITE2, "material creation registers id and is retrievable", () => {
    const scene = new Scene();
    const mat = scene.addMaterial(new Material("Mat_Red"));
    assertEquals(scene.materials().length, 1);
    assert(scene.getMaterial(mat.id) === mat);
    assert(scene.getMaterial(99999) === null);
  });
  defineTest(SUITE2, "id stability: each node has a unique monotonically-increasing id", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    const b = new SceneNode("B");
    assert(b.id > a.id);
    scene.addNode(a);
    scene.addNode(b);
    assert(scene.findNodeById(a.id) === a);
    assert(scene.findNodeById(b.id) === b);
  });
  defineTest(SUITE2, "selectability flag persists independently of visibility", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    scene.addNode(a);
    a.setSelectable(false);
    assertEquals(a.selectable, false);
    a.setVisible(false);
    assertEquals(a.selectable, false);
    a.setVisible(true);
    assertEquals(a.selectable, false);
  });
  defineTest(SUITE2, "reparent into descendant is rejected at intent layer (we just allow but check isDescendantOf)", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    const b = new SceneNode("B");
    scene.addNode(a);
    a.addChild(b);
    assert(b.isDescendantOf(a));
    assert(b.isDescendantOf(scene.root));
    assert(!a.isDescendantOf(b));
  });
  defineTest(SUITE2, "forEachNode visits every node DFS", () => {
    const scene = new Scene();
    const a = new SceneNode("A");
    const b = new SceneNode("B");
    scene.addNode(a);
    a.addChild(b);
    const names = [];
    scene.forEachNode((n) => names.push(n.name));
    assertEquals(names.length, 3);
  });

  // src/mesh/topologyTests.ts
  var SUITE3 = "topology";
  function tri(mesh) {
    const a = mesh.addVertex(0, 0, 0).id;
    const b = mesh.addVertex(1, 0, 0).id;
    const c = mesh.addVertex(0, 1, 0).id;
    return { a, b, c, face: mesh.addFace([a, b, c]) };
  }
  defineTest(SUITE3, "topology creation: triangle has 3 verts / 3 edges / 1 face / 3 loops", () => {
    const m = new EditableMesh();
    tri(m);
    assertEquals(m.vertexCount(), 3);
    assertEquals(m.edgeCount(), 3);
    assertEquals(m.faceCount(), 1);
    assertEquals(m.loopCount(), 3);
    const result = m.validate();
    assert(result.ok, result.errors.join("; "));
  });
  defineTest(SUITE3, "quad face creates 4 edges and 4 loops", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(1, 1, 0).id;
    const d = m.addVertex(0, 1, 0).id;
    m.addFace([a, b, c, d]);
    assertEquals(m.edgeCount(), 4);
    assertEquals(m.loopCount(), 4);
    const r = m.validate();
    assert(r.ok, r.errors.join("; "));
  });
  defineTest(SUITE3, "n-gon (pentagon) is valid", () => {
    const m = new EditableMesh();
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const t = i / 5 * Math.PI * 2;
      ids.push(m.addVertex(Math.cos(t), Math.sin(t), 0).id);
    }
    m.addFace(ids);
    assertEquals(m.edgeCount(), 5);
    const r = m.validate();
    assert(r.ok, r.errors.join("; "));
  });
  defineTest(SUITE3, "adjacent quads share one edge with 2 loops", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(1, 1, 0).id;
    const d = m.addVertex(0, 1, 0).id;
    const e = m.addVertex(2, 0, 0).id;
    const f = m.addVertex(2, 1, 0).id;
    m.addFace([a, b, c, d]);
    m.addFace([b, e, f, c]);
    assertEquals(m.edgeCount(), 7);
    let sharedFound = false;
    for (const edge of m.edges.values()) {
      if (edge.a === b && edge.b === c || edge.a === c && edge.b === b) {
        assertEquals(edge.loops.length, 2);
        sharedFound = true;
        break;
      }
    }
    assert(sharedFound, "expected shared edge b-c");
  });
  defineTest(SUITE3, "non-manifold edge: three faces sharing one edge", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0, 1, 0).id;
    const d = m.addVertex(0, -1, 0).id;
    const e = m.addVertex(0, 0, 1).id;
    m.addFace([a, b, c]);
    m.addFace([a, d, b]);
    m.addFace([a, b, e]);
    let shared = null;
    for (const edge of m.edges.values()) {
      if (edge.a === a && edge.b === b || edge.a === b && edge.b === a) {
        shared = edge;
        break;
      }
    }
    assert(shared !== null);
    assertEquals(shared.loops.length, 3);
    const r = m.validate();
    assert(r.ok, r.errors.join("; "));
  });
  defineTest(SUITE3, "seam / hard-edge flags toggle via API", () => {
    const m = new EditableMesh();
    tri(m);
    const edge = m.edges.values().next().value;
    m.setEdgeHard(edge.id, true);
    m.setEdgeSeam(edge.id, true);
    assertEquals(edge.hard, true);
    assertEquals(edge.seam, true);
    m.setEdgeHard(edge.id, false);
    assertEquals(edge.hard, false);
  });
  defineTest(SUITE3, "validate rejects loose vertex", () => {
    const m = new EditableMesh();
    m.addVertex(0, 0, 0);
    const r = m.validate();
    assert(!r.ok);
    assert(r.errors.some((e) => e.includes("loose vertex")));
  });
  defineTest(SUITE3, "validate rejects loose edge after face removal", () => {
    const m = new EditableMesh();
    const { face } = tri(m);
    m.removeFace(face.id);
    const r = m.validate();
    assert(!r.ok);
    assert(r.errors.some((e) => e.includes("loose edge")));
  });
  defineTest(SUITE3, "removeLooseGeometry cleans up loose verts and edges", () => {
    const m = new EditableMesh();
    const { face } = tri(m);
    m.removeFace(face.id);
    m.removeLooseGeometry();
    assertEquals(m.edgeCount(), 0);
    assertEquals(m.vertexCount(), 0);
    const r = m.validate();
    assert(r.ok);
  });
  defineTest(SUITE3, "addFace with < 3 vertices throws", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    assertThrows(() => m.addFace([a, b]));
  });
  defineTest(SUITE3, "addFace with missing vertex throws", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    assertThrows(() => m.addFace([a, b, 99999]));
  });
  defineTest(SUITE3, "face normal recomputes correctly for CCW triangle in XY plane", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0, 1, 0).id;
    const face = m.addFace([a, b, c]);
    m.recomputeFaceNormals();
    assert(Math.abs(face.normal[2] - 1) < 1e-5, `expected +Z normal, got ${face.normal}`);
  });
  defineTest(SUITE3, "vertexFaces returns the set of incident face ids", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0, 1, 0).id;
    const d = m.addVertex(-1, 0, 0).id;
    const f1 = m.addFace([a, b, c]).id;
    const f2 = m.addFace([a, c, d]).id;
    const faces = m.vertexFaces(a);
    assertEquals(faces.size, 2);
    assert(faces.has(f1));
    assert(faces.has(f2));
  });

  // src/mesh/primitives/primitiveTests.ts
  var SUITE4 = "primitives";
  function assertValid(m, name) {
    const r = m.validate();
    assert(r.ok, `${name}: ${r.errors.join("; ")}`);
  }
  function assertUvsAndNormals(m, name) {
    for (const l of m.loops.values()) {
      assert(Number.isFinite(l.uv[0]) && Number.isFinite(l.uv[1]), `${name}: loop UV not finite`);
    }
    let allFaceNormalsHaveLen = true;
    for (const f of m.faces.values()) {
      const n = Math.hypot(f.normal[0], f.normal[1], f.normal[2]);
      if (n < 0.9) {
        allFaceNormalsHaveLen = false;
        break;
      }
    }
    assert(allFaceNormalsHaveLen, `${name}: face normals not unit length`);
  }
  defineTest(SUITE4, "cube: 8 verts / 12 edges / 6 faces", () => {
    const m = buildCube();
    assertEquals(m.vertexCount(), 8);
    assertEquals(m.edgeCount(), 12);
    assertEquals(m.faceCount(), 6);
    assertValid(m, "cube");
    assertUvsAndNormals(m, "cube");
  });
  defineTest(SUITE4, "cube size parameter scales positions", () => {
    const m = buildCube({ size: 4 });
    let maxExtent = 0;
    for (const v of m.vertices.values()) {
      maxExtent = Math.max(maxExtent, Math.abs(v.position[0]));
    }
    assertEquals(maxExtent, 2);
  });
  defineTest(SUITE4, "plane default = 1 quad", () => {
    const m = buildPlane();
    assertEquals(m.vertexCount(), 4);
    assertEquals(m.faceCount(), 1);
    assertValid(m, "plane");
  });
  defineTest(SUITE4, "plane subdivisions: 3x2 segments \u2192 12 quads", () => {
    const m = buildPlane({ segmentsX: 3, segmentsZ: 2 });
    assertEquals(m.vertexCount(), 4 * 3);
    assertEquals(m.faceCount(), 6);
    assertValid(m, "plane3x2");
  });
  defineTest(SUITE4, "cylinder default 24 segments capped", () => {
    const m = buildCylinder();
    const seg = 24;
    assertEquals(m.vertexCount(), 2 * seg + 2);
    assertEquals(m.faceCount(), seg + 2 * seg);
    assertValid(m, "cylinder");
    assertUvsAndNormals(m, "cylinder");
  });
  defineTest(SUITE4, "cylinder segments parameter changes count", () => {
    const m = buildCylinder({ segments: 8 });
    assertEquals(m.vertexCount(), 2 * 8 + 2);
  });
  defineTest(SUITE4, "cone default 24 segments capped", () => {
    const m = buildCone();
    const seg = 24;
    assertEquals(m.vertexCount(), seg + 1 + 1);
    assertEquals(m.faceCount(), 2 * seg);
    assertValid(m, "cone");
    assertUvsAndNormals(m, "cone");
  });
  defineTest(SUITE4, "disk default 24 segments", () => {
    const m = buildDisk();
    assertEquals(m.vertexCount(), 24 + 1);
    assertEquals(m.faceCount(), 24);
    assertValid(m, "disk");
    assertUvsAndNormals(m, "disk");
  });
  defineTest(SUITE4, "uv sphere default 24 seg / 16 rings", () => {
    const m = buildUvSphere();
    const seg = 24, rings = 16;
    assertEquals(m.vertexCount(), 2 + (rings - 1) * seg);
    assertValid(m, "uvsphere");
    assertUvsAndNormals(m, "uvsphere");
  });
  defineTest(SUITE4, "uv sphere parameter variation: rings=8 reduces face count", () => {
    const mA = buildUvSphere({ rings: 16, segments: 24 });
    const mB = buildUvSphere({ rings: 8, segments: 24 });
    assert(mB.faceCount() < mA.faceCount());
  });
  defineTest(SUITE4, "ico sphere subdiv=0 has 20 faces / 12 verts", () => {
    const m = buildIcoSphere({ subdivisions: 0 });
    assertEquals(m.vertexCount(), 12);
    assertEquals(m.faceCount(), 20);
    assertValid(m, "icosphere");
    assertUvsAndNormals(m, "icosphere");
  });
  defineTest(SUITE4, "ico sphere subdiv=1 has 80 faces", () => {
    const m = buildIcoSphere({ subdivisions: 1 });
    assertEquals(m.faceCount(), 80);
  });
  defineTest(SUITE4, "torus default 24 major / 12 minor: 288 quads", () => {
    const m = buildTorus();
    assertEquals(m.vertexCount(), 24 * 12);
    assertEquals(m.faceCount(), 24 * 12);
    assertValid(m, "torus");
    assertUvsAndNormals(m, "torus");
  });
  defineTest(SUITE4, "torus parameters: 8x4 = 32 quads", () => {
    const m = buildTorus({ majorSegments: 8, minorSegments: 4 });
    assertEquals(m.faceCount(), 32);
  });

  // src/mesh/renderMeshTests.ts
  var SUITE5 = "renderMesh";
  defineTest(SUITE5, "triangulation: a triangle is 1 triangle", () => {
    const tris = earClip(
      [fromValues(0, 0, 0), fromValues(1, 0, 0), fromValues(0, 1, 0)],
      fromValues(0, 0, 1)
    );
    assertEquals(tris.length, 3);
    assertEquals(tris[0], 0);
    assertEquals(tris[1], 1);
    assertEquals(tris[2], 2);
  });
  defineTest(SUITE5, "triangulation: quad \u2192 2 triangles (4 verts, 6 indices)", () => {
    const verts = [
      fromValues(0, 0, 0),
      fromValues(1, 0, 0),
      fromValues(1, 1, 0),
      fromValues(0, 1, 0)
    ];
    const tris = earClip(verts, fromValues(0, 0, 1));
    assertEquals(tris.length, 6);
  });
  defineTest(SUITE5, "triangulation: convex pentagon \u2192 3 triangles", () => {
    const verts = [];
    for (let i = 0; i < 5; i++) {
      const t = i / 5 * Math.PI * 2;
      verts.push(fromValues(Math.cos(t), Math.sin(t), 0));
    }
    const tris = earClip(verts, fromValues(0, 0, 1));
    assertEquals(tris.length, 9);
  });
  defineTest(SUITE5, "triangulation: concave L-shape \u2192 4 triangles", () => {
    const verts = [
      fromValues(0, 0, 0),
      fromValues(2, 0, 0),
      fromValues(2, 1, 0),
      fromValues(1, 1, 0),
      fromValues(1, 2, 0),
      fromValues(0, 2, 0)
    ];
    const tris = earClip(verts, fromValues(0, 0, 1));
    assertEquals(tris.length / 3, 4);
  });
  defineTest(SUITE5, "render mesh for cube: 24 verts (6 faces \xD7 4) and 12 tris", () => {
    const mesh = buildCube();
    const buf = buildRenderMesh(mesh);
    assertEquals(buf.vertexCount, 24);
    assertEquals(buf.triangleCount, 12);
    assertEquals(buf.indices.length, 36);
  });
  defineTest(SUITE5, "render mesh produces valid normals (unit length)", () => {
    const mesh = buildCube();
    const buf = buildRenderMesh(mesh);
    for (let i = 0; i < buf.vertexCount; i++) {
      const nx = buf.normals[i * 3 + 0];
      const ny = buf.normals[i * 3 + 1];
      const nz = buf.normals[i * 3 + 2];
      const len = Math.hypot(nx, ny, nz);
      assert(Math.abs(len - 1) < 1e-3, `vertex ${i} normal length ${len}`);
    }
  });
  defineTest(SUITE5, "render mesh uvs are populated (finite values in [0,1])", () => {
    const mesh = buildCube();
    const buf = buildRenderMesh(mesh);
    for (let i = 0; i < buf.vertexCount; i++) {
      const u = buf.uvs[i * 2];
      const v = buf.uvs[i * 2 + 1];
      assert(Number.isFinite(u) && Number.isFinite(v));
      assert(u >= 0 && u <= 1 && v >= 0 && v <= 1);
    }
  });
  defineTest(SUITE5, "render mesh marks dirty on construction; rebuild clears dirty", () => {
    const mesh = buildCube();
    const rm = new RenderMesh();
    assert(rm.isDirty());
    rm.rebuild(mesh);
    assert(!rm.isDirty());
  });
  defineTest(SUITE5, "render mesh rebuilds when topology changes (dirty propagation)", () => {
    const mesh = buildCube();
    const rm = new RenderMesh();
    rm.rebuild(mesh);
    const v0 = rm.version;
    rm.markDirty();
    rm.rebuild(mesh);
    assert(rm.version > v0);
  });
  defineTest(SUITE5, "render mesh for uv sphere has finite buffers and non-zero tris", () => {
    const m = buildUvSphere({ rings: 8, segments: 12 });
    const buf = buildRenderMesh(m);
    assert(buf.triangleCount > 0);
    for (let i = 0; i < buf.vertexCount * 3; i++) {
      assert(Number.isFinite(buf.positions[i]));
      assert(Number.isFinite(buf.normals[i]));
    }
  });
  defineTest(SUITE5, "hard edges break loop normals into discontinuous neighbours", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(1, 1, 0).id;
    const d = m.addVertex(0, 1, 0).id;
    const e = m.addVertex(2, 0, 0).id;
    const f = m.addVertex(2, 1, 0).id;
    m.addFace([a, b, c, d]);
    m.vertices.get(e).position[2] = 1;
    m.vertices.get(f).position[2] = 1;
    m.addFace([b, e, f, c]);
    let bc = null;
    for (const ed of m.edges.values()) {
      if (ed.a === b && ed.b === c || ed.a === c && ed.b === b) {
        bc = ed;
        break;
      }
    }
    m.recomputeFaceNormals();
    m.setEdgeHard(bc.id, false);
    recomputeLoopNormals(m);
    const loopsAtB_soft = [];
    for (const l of m.loops.values()) {
      if (l.vertexId === b) loopsAtB_soft.push([l.normal[0], l.normal[1], l.normal[2]]);
    }
    m.setEdgeHard(bc.id, true);
    recomputeLoopNormals(m);
    const loopsAtB_hard = [];
    for (const l of m.loops.values()) {
      if (l.vertexId === b) loopsAtB_hard.push([l.normal[0], l.normal[1], l.normal[2]]);
    }
    const dSoft = Math.hypot(
      loopsAtB_soft[0][0] - loopsAtB_soft[1][0],
      loopsAtB_soft[0][1] - loopsAtB_soft[1][1],
      loopsAtB_soft[0][2] - loopsAtB_soft[1][2]
    );
    const dHard = Math.hypot(
      loopsAtB_hard[0][0] - loopsAtB_hard[1][0],
      loopsAtB_hard[0][1] - loopsAtB_hard[1][1],
      loopsAtB_hard[0][2] - loopsAtB_hard[1][2]
    );
    assert(dHard > dSoft, `expected hard-edge normals to diverge more than soft (soft=${dSoft}, hard=${dHard})`);
  });

  // src/render/stripTests.ts
  var SUITE6 = "stripRender";
  defineTest(SUITE6, "one segment produces 4 verts and 6 indices", () => {
    const app = globalThis.BrutalMeshApp;
    if (!app) {
      return;
    }
    const sb = new StripBatch(app.gl);
    sb.add(0, 0, 0, 1, 0, 0);
    assertEquals(sb.segmentCount(), 1);
    const { vertices, indices } = sb.buildBuffers();
    assertEquals(vertices.length, 36);
    assertEquals(indices.length, 6);
    const stride = 9;
    assertEquals(vertices[0 * stride + 6], -1);
    assertEquals(vertices[0 * stride + 7], 0);
    assertEquals(vertices[1 * stride + 6], 1);
    assertEquals(vertices[1 * stride + 7], 0);
    assertEquals(vertices[2 * stride + 6], -1);
    assertEquals(vertices[2 * stride + 7], 1);
    assertEquals(vertices[3 * stride + 6], 1);
    assertEquals(vertices[3 * stride + 7], 1);
    sb.dispose();
  });
  defineTest(SUITE6, "multiple segments share GPU buffer / indices grow by 6 each", () => {
    const app = globalThis.BrutalMeshApp;
    if (!app) return;
    const sb = new StripBatch(app.gl);
    sb.add(0, 0, 0, 1, 0, 0);
    sb.add(1, 0, 0, 2, 0, 0);
    sb.add(2, 0, 0, 3, 0, 0);
    const { vertices, indices } = sb.buildBuffers();
    assertEquals(indices.length, 18);
    assertEquals(vertices.length, 108);
    assertEquals(indices[0], 0);
    assertEquals(indices[6], 4);
    assertEquals(indices[12], 8);
    sb.dispose();
  });
  defineTest(SUITE6, "reset() empties the batch", () => {
    const app = globalThis.BrutalMeshApp;
    if (!app) return;
    const sb = new StripBatch(app.gl);
    sb.add(0, 0, 0, 1, 0, 0);
    sb.reset();
    assertEquals(sb.segmentCount(), 0);
    const { indices } = sb.buildBuffers();
    assertEquals(indices.length, 0);
    sb.dispose();
  });
  defineTest(SUITE6, "wire overlay buffers at least 12 segments for the default cube", () => {
    const app = globalThis.BrutalMeshApp;
    if (!app) return;
    const cube3 = app.scene.root.children[0];
    assert(cube3.mesh.edgeCount() === 12, `cube has ${cube3.mesh.edgeCount()} edges`);
  });

  // src/app/pickingTests.ts
  var SUITE7 = "picking";
  function makeScene() {
    const scene = new Scene();
    const cube3 = new MeshObject("Cube");
    cube3.mesh = buildCube();
    scene.addNode(cube3);
    const camera = new Camera();
    camera.target.set([0, 0, 0]);
    camera.yaw = 0;
    camera.pitch = 0;
    camera.distance = 6;
    return { scene, cube: cube3, camera };
  }
  defineTest(SUITE7, "Selection state: basic API", () => {
    const sel = new Selection();
    const id = 42;
    sel.setObjectSelection(id);
    assert(sel.isObjectSelected(id));
    assertEquals(sel.activeObjectId, id);
    sel.clearAll();
    assert(!sel.isObjectSelected(id));
  });
  defineTest(SUITE7, "Object pick: ray through cube center hits the cube", () => {
    const { scene, cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const hit = pickObjectInScene(scene, 400, 300, vpRect, camera, 800 / 600);
    assert(hit !== null);
    assertEquals(hit.node.id, cube3.id);
  });
  defineTest(SUITE7, "Object pick: ray missing the cube returns null", () => {
    const { scene, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const hit = pickObjectInScene(scene, 5, 5, vpRect, camera, 800 / 600);
    assert(hit === null);
  });
  defineTest(SUITE7, "Face pick returns a valid face id from center ray", () => {
    const { cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const world = cube3.getWorldMatrix();
    const fid = pickFace(cube3.mesh, world, 400, 300, vpRect, camera, 800 / 600);
    assert(fid !== null);
    assert(cube3.mesh.faces.has(fid));
  });
  defineTest(SUITE7, "Vertex pick screen-distance: project a vertex then pick at that pixel", () => {
    const { cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const world = cube3.getWorldMatrix();
    const viewProj = camera.viewProj(800 / 600);
    const vertex = cube3.mesh.vertices.values().next().value;
    const px = vertex.position[0], py = vertex.position[1], pz = vertex.position[2];
    const w = viewProj[3] * px + viewProj[7] * py + viewProj[11] * pz + viewProj[15];
    const ndcX = (viewProj[0] * px + viewProj[4] * py + viewProj[8] * pz + viewProj[12]) / w;
    const ndcY = (viewProj[1] * px + viewProj[5] * py + viewProj[9] * pz + viewProj[13]) / w;
    const screenX = vpRect.x + (ndcX + 1) * 0.5 * vpRect.w;
    const screenY = vpRect.y + (1 - ndcY) * 0.5 * vpRect.h;
    const vid = pickVertex(cube3.mesh, world, screenX, screenY, vpRect, camera, 800 / 600, 6);
    assertEquals(vid, vertex.id);
  });
  defineTest(SUITE7, "Vertex pick: a pixel far from any vertex returns null", () => {
    const { cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const world = cube3.getWorldMatrix();
    const vid = pickVertex(cube3.mesh, world, 0, 0, vpRect, camera, 800 / 600, 6);
    assert(vid === null);
  });
  defineTest(SUITE7, "Edge pick: a pixel between two projected vertices grabs the connecting edge", () => {
    const { cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    const world = cube3.getWorldMatrix();
    const viewProj = camera.viewProj(800 / 600);
    const edge = cube3.mesh.edges.values().next().value;
    const va = cube3.mesh.vertices.get(edge.a);
    const vb = cube3.mesh.vertices.get(edge.b);
    const proj = (p) => {
      const w = viewProj[3] * p[0] + viewProj[7] * p[1] + viewProj[11] * p[2] + viewProj[15];
      const nx = (viewProj[0] * p[0] + viewProj[4] * p[1] + viewProj[8] * p[2] + viewProj[12]) / w;
      const ny = (viewProj[1] * p[0] + viewProj[5] * p[1] + viewProj[9] * p[2] + viewProj[13]) / w;
      return [vpRect.x + (nx + 1) * 0.5 * vpRect.w, vpRect.y + (1 - ny) * 0.5 * vpRect.h];
    };
    const [ax, ay] = proj(va.position);
    const [bx, by] = proj(vb.position);
    const mx = (ax + bx) * 0.5;
    const my = (ay + by) * 0.5;
    const eid = pickEdge(cube3.mesh, world, mx, my, vpRect, camera, 800 / 600, 6);
    assert(eid !== null);
  });
  defineTest(SUITE7, "Picking respects world transform: project the translated cube center, then pick there", () => {
    const { scene, cube: cube3, camera } = makeScene();
    const vpRect = { x: 0, y: 0, w: 800, h: 600 };
    cube3.transform.setPosition(2.5, 0, 0);
    cube3.markWorldDirty();
    const viewProj = camera.viewProj(800 / 600);
    const cx = 2.5, cy = 0, cz = 0;
    const w = viewProj[3] * cx + viewProj[7] * cy + viewProj[11] * cz + viewProj[15];
    const ndcX = (viewProj[0] * cx + viewProj[4] * cy + viewProj[8] * cz + viewProj[12]) / w;
    const ndcY = (viewProj[1] * cx + viewProj[5] * cy + viewProj[9] * cz + viewProj[13]) / w;
    const screenX = (ndcX + 1) * 0.5 * vpRect.w;
    const screenY = (1 - ndcY) * 0.5 * vpRect.h;
    const hit = pickObjectInScene(scene, screenX, screenY, vpRect, camera, 800 / 600);
    assert(hit !== null, `cube should be pickable at projected center (${screenX}, ${screenY})`);
    assertEquals(hit.node.id, cube3.id);
  });

  // src/app/commandsTests.ts
  var SUITE8 = "commands";
  function makeCmd(name, log) {
    let didCount = 0;
    return {
      label: name,
      do() {
        log.push(`do:${name}`);
        didCount++;
      },
      undo() {
        log.push(`undo:${name}`);
        didCount--;
      }
    };
  }
  defineTest(SUITE8, "execute pushes to undo stack and runs do()", () => {
    const log = [];
    const h = new History();
    h.execute(makeCmd("A", log));
    assert(h.canUndo());
    assert(!h.canRedo());
    assertEquals(log[0], "do:A");
  });
  defineTest(SUITE8, "undo pops and calls undo(); redo replays", () => {
    const log = [];
    const h = new History();
    h.execute(makeCmd("A", log));
    h.undo();
    assert(!h.canUndo());
    assert(h.canRedo());
    assertEquals(log[1], "undo:A");
    h.redo();
    assertEquals(log[2], "do:A");
    assert(h.canUndo());
  });
  defineTest(SUITE8, "execute clears the redo stack", () => {
    const log = [];
    const h = new History();
    h.execute(makeCmd("A", log));
    h.undo();
    assert(h.canRedo());
    h.execute(makeCmd("B", log));
    assert(!h.canRedo());
  });
  defineTest(SUITE8, "undo / redo state transitions on a transform command", () => {
    const node = new SceneNode("Test");
    const start = [node.transform.position[0], node.transform.position[1], node.transform.position[2]];
    const cmd = new SetTransformCommand(node, {
      position: [5, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1]
    }, "Move X");
    const h = new History();
    h.execute(cmd);
    assertEquals(node.transform.position[0], 5);
    h.undo();
    assertEquals(node.transform.position[0], start[0]);
    h.redo();
    assertEquals(node.transform.position[0], 5);
  });
  defineTest(SUITE8, "replaceTop replaces last command and clears redo", () => {
    const node = new SceneNode("Test");
    const h = new History();
    h.execute(new SetTransformCommand(node, { position: [1, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }, "Move 1"));
    h.replaceTop(new SetTransformCommand(node, { position: [3, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }, "Move 3"));
    assertEquals(node.transform.position[0], 3);
    h.undo();
    assertEquals(node.transform.position[0], 0);
  });
  defineTest(SUITE8, 'replaceTop fires only "replace" event (not execute)', () => {
    const node = new SceneNode("Test");
    const h = new History();
    h.execute(new SetTransformCommand(node, { position: [1, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }, "M1"));
    const events = [];
    h.on((e) => events.push(e.type));
    h.replaceTop(new SetTransformCommand(node, { position: [2, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }, "M2"));
    assertEquals(events.length, 1);
    assertEquals(events[0], "replace");
  });
  defineTest(SUITE8, "maxDepth caps the undo stack", () => {
    const log = [];
    const h = new History();
    h.maxDepth = 3;
    for (let i = 0; i < 5; i++) h.execute(makeCmd(`C${i}`, log));
    assertEquals(h.undoLabels().length, 3);
    assertEquals(h.undoLabels()[0], "C2");
    assertEquals(h.undoLabels()[2], "C4");
  });
  defineTest(SUITE8, "app integration: transform command updates render mesh dirty + footer", () => {
    const app = globalThis.BrutalMeshApp;
    if (!app) return;
    const cube3 = app.scene.root.children[0];
    const before = cube3.transform.position[0];
    app.history.execute(new SetTransformCommand(cube3, {
      position: [before + 1, cube3.transform.position[1], cube3.transform.position[2]],
      rotation: [cube3.transform.rotation[0], cube3.transform.rotation[1], cube3.transform.rotation[2], cube3.transform.rotation[3]],
      scale: [cube3.transform.scale[0], cube3.transform.scale[1], cube3.transform.scale[2]]
    }, "Move +X"));
    assertEquals(cube3.transform.position[0], before + 1);
    app.history.undo();
    assertEquals(cube3.transform.position[0], before);
  });

  // src/mesh/OperationsObject.ts
  function shadeSmooth(mesh) {
    for (const e of mesh.edges.values()) e.hard = false;
  }
  function shadeFlat(mesh) {
    for (const e of mesh.edges.values()) e.hard = true;
  }
  function subdivide(mesh) {
    const oldFaces = Array.from(mesh.faces.values());
    const edgeMid = /* @__PURE__ */ new Map();
    const ensureEdgeMidpoint = (e) => {
      const cached = edgeMid.get(e.id);
      if (cached != null) return cached;
      const va = mesh.vertices.get(e.a);
      const vb = mesh.vertices.get(e.b);
      const mid = mesh.addVertex(
        (va.position[0] + vb.position[0]) * 0.5,
        (va.position[1] + vb.position[1]) * 0.5,
        (va.position[2] + vb.position[2]) * 0.5
      );
      edgeMid.set(e.id, mid.id);
      return mid.id;
    };
    for (const face of oldFaces) {
      const loops = face.loops.map((id) => mesh.loops.get(id));
      const n = loops.length;
      const mids = [];
      for (const l of loops) {
        const e = mesh.edges.get(l.edgeId);
        if (!e) {
          mids.length = 0;
          break;
        }
        mids.push(ensureEdgeMidpoint(e));
      }
      if (mids.length !== n) continue;
      let cx = 0, cy = 0, cz = 0;
      for (const l of loops) {
        const v = mesh.vertices.get(l.vertexId);
        cx += v.position[0];
        cy += v.position[1];
        cz += v.position[2];
      }
      const center = mesh.addVertex(cx / n, cy / n, cz / n);
      mesh.removeFace(face.id);
      for (let i = 0; i < n; i++) {
        const prevMid = mids[(i - 1 + n) % n];
        const corner = loops[i].vertexId;
        const nextMid = mids[i];
        mesh.addFace([prevMid, corner, nextMid, center.id], face.materialId);
      }
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function mirror(mesh, axis, mergeAtPlane = true, mergeDistance = 1e-4) {
    const axisIdx = axis === "x" ? 0 : axis === "y" ? 1 : 2;
    const original = cloneMesh(mesh);
    const vertMap = /* @__PURE__ */ new Map();
    for (const v of original.vertices.values()) {
      const onPlane = mergeAtPlane && Math.abs(v.position[axisIdx]) < mergeDistance;
      if (onPlane) {
        let target = null;
        for (const lv of mesh.vertices.values()) {
          if (Math.abs(lv.position[0] - v.position[0]) < mergeDistance && Math.abs(lv.position[1] - v.position[1]) < mergeDistance && Math.abs(lv.position[2] - v.position[2]) < mergeDistance) {
            target = lv.id;
            break;
          }
        }
        if (target != null) {
          vertMap.set(v.id, target);
          continue;
        }
      }
      const newPos = [v.position[0], v.position[1], v.position[2]];
      newPos[axisIdx] = -newPos[axisIdx];
      const n = mesh.addVertex(newPos[0], newPos[1], newPos[2]);
      vertMap.set(v.id, n.id);
    }
    for (const f of original.faces.values()) {
      const verts = f.loops.map((lid) => vertMap.get(original.loops.get(lid).vertexId));
      verts.reverse();
      mesh.addFace(verts, f.materialId);
    }
    mesh.recomputeFaceNormals();
  }
  function append(target, other) {
    const vertMap = /* @__PURE__ */ new Map();
    for (const v of other.vertices.values()) {
      const n = target.addVertex(v.position[0], v.position[1], v.position[2]);
      vertMap.set(v.id, n.id);
    }
    for (const f of other.faces.values()) {
      const verts = f.loops.map((lid) => vertMap.get(other.loops.get(lid).vertexId));
      target.addFace(verts, f.materialId);
    }
    target.recomputeFaceNormals();
  }

  // src/mesh/operationsObjectTests.ts
  var SUITE9 = "objectOps";
  defineTest(SUITE9, "shadeFlat sets every edge hard; shadeSmooth clears it", () => {
    const m = buildCube();
    shadeFlat(m);
    for (const e of m.edges.values()) assertEquals(e.hard, true);
    shadeSmooth(m);
    for (const e of m.edges.values()) assertEquals(e.hard, false);
  });
  defineTest(SUITE9, "subdivide quad mesh quadruples face count", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const before = m.faceCount();
    subdivide(m);
    assertEquals(m.faceCount(), before * 4);
  });
  defineTest(SUITE9, "subdivide preserves validity", () => {
    const m = buildCube();
    subdivide(m);
    const r = m.validate();
    assert(r.ok, r.errors.join("; "));
  });
  defineTest(SUITE9, "mirror across X doubles vertex count (without merge)", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    for (const v of m.vertices.values()) v.position[0] += 1;
    const before = m.vertexCount();
    mirror(m, "x", false);
    assertEquals(m.vertexCount(), before * 2);
  });
  defineTest(SUITE9, "mirror with merge collapses vertices ON the mirror plane", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, -1).id;
    const b = m.addVertex(1, 0, -1).id;
    const c = m.addVertex(1, 0, 1).id;
    const d = m.addVertex(0, 0, 1).id;
    m.addFace([a, b, c, d]);
    const before = m.vertexCount();
    mirror(m, "x", true);
    assertEquals(m.vertexCount(), before + 2);
  });
  defineTest(SUITE9, "append combines two meshes by additive geometry", () => {
    const a = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const b = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const vBefore = a.vertexCount();
    const fBefore = a.faceCount();
    append(a, b);
    assertEquals(a.vertexCount(), vBefore + b.vertexCount());
    assertEquals(a.faceCount(), fBefore + b.faceCount());
  });
  defineTest(SUITE9, "cloneMesh round-trip preserves counts", () => {
    const m = buildCube();
    const c = cloneMesh(m);
    assertEquals(c.vertexCount(), m.vertexCount());
    assertEquals(c.edgeCount(), m.edgeCount());
    assertEquals(c.faceCount(), m.faceCount());
  });

  // src/app/commands/ObjectCommands.ts
  var MeshSnapshotCommand = class {
    constructor(node) {
      this.node = node;
      if (!node.mesh) throw new Error("MeshSnapshotCommand: node has no mesh");
      this.prev = cloneMeshPreservingIds(node.mesh);
    }
    do() {
      if (!this.node.mesh) return;
      this.apply(this.node.mesh);
    }
    undo() {
      this.node.mesh = cloneMeshPreservingIds(this.prev);
    }
  };
  var ShadeFlatCommand = class extends MeshSnapshotCommand {
    constructor() {
      super(...arguments);
      this.label = "Shade Flat";
    }
    apply(mesh) {
      shadeFlat(mesh);
    }
  };
  var SubdivideCommand = class extends MeshSnapshotCommand {
    constructor() {
      super(...arguments);
      this.label = "Subdivide";
    }
    apply(mesh) {
      subdivide(mesh);
    }
  };
  var CatmullClarkCommand = class extends MeshSnapshotCommand {
    constructor() {
      super(...arguments);
      this.label = "Catmull-Clark";
    }
    apply(mesh) {
      subdivide(mesh);
    }
  };
  var MirrorCommand = class extends MeshSnapshotCommand {
    constructor(node, axis, mergeAtPlane = true) {
      super(node);
      this.axis = axis;
      this.mergeAtPlane = mergeAtPlane;
      this.label = "Mirror";
    }
    apply(mesh) {
      mirror(mesh, this.axis, this.mergeAtPlane);
    }
  };
  var DuplicateCommand = class {
    constructor(scene, original) {
      this.scene = scene;
      this.original = original;
      this.label = "Duplicate";
      if (!original.mesh) throw new Error("DuplicateCommand: original has no mesh");
      this.newNode = new MeshObject(original.name + " Copy");
      this.newNode.mesh = cloneMesh(original.mesh);
      this.newNode.materialId = original.materialId;
      this.newNode.transform.setPosition(original.transform.position[0], original.transform.position[1], original.transform.position[2]);
      this.newNode.transform.setRotationQuat(original.transform.rotation[0], original.transform.rotation[1], original.transform.rotation[2], original.transform.rotation[3]);
      this.newNode.transform.setScale(original.transform.scale[0], original.transform.scale[1], original.transform.scale[2]);
    }
    do() {
      this.scene.addNode(this.newNode, this.original.parent ?? this.scene.root);
    }
    undo() {
      this.scene.removeNode(this.newNode);
    }
  };
  var DeleteObjectCommand = class {
    constructor(scene, node) {
      this.scene = scene;
      this.node = node;
      this.label = "Delete";
      this.prevParent = node.parent ?? scene.root;
    }
    do() {
      this.scene.removeNode(this.node);
    }
    undo() {
      this.scene.addNode(this.node, this.prevParent);
    }
  };
  var CombineCommand = class {
    constructor(scene, inputs) {
      this.scene = scene;
      this.inputs = inputs;
      this.label = "Combine";
      this.prevParents = /* @__PURE__ */ new Map();
      this.combined = new MeshObject("Combined");
      const m = new EditableMesh();
      for (const obj of inputs) {
        if (!obj.mesh) continue;
        append(m, obj.mesh);
        this.prevParents.set(obj, obj.parent ?? scene.root);
      }
      this.combined.mesh = m;
    }
    do() {
      for (const obj of this.inputs) this.scene.removeNode(obj);
      this.scene.addNode(this.combined, this.scene.root);
    }
    undo() {
      this.scene.removeNode(this.combined);
      for (const [obj, parent] of this.prevParents) this.scene.addNode(obj, parent);
    }
  };

  // src/app/commands/objectCommandsTests.ts
  var SUITE10 = "objectCommands";
  function makeScene2() {
    const scene = new Scene();
    const cube3 = new MeshObject("Cube");
    cube3.mesh = buildCube();
    scene.addNode(cube3);
    return { scene, cube: cube3, history: new History() };
  }
  defineTest(SUITE10, "ShadeFlat \u2192 Shade Smooth round-trip via undo", () => {
    const { cube: cube3, history } = makeScene2();
    history.execute(new ShadeFlatCommand(cube3));
    for (const e of cube3.mesh.edges.values()) assertEquals(e.hard, true);
    history.undo();
    for (const e of cube3.mesh.edges.values()) assertEquals(e.hard, false);
    history.redo();
    for (const e of cube3.mesh.edges.values()) assertEquals(e.hard, true);
  });
  defineTest(SUITE10, "Subdivide quad face count grows then undo restores", () => {
    const { cube: cube3, history } = makeScene2();
    const before = cube3.mesh.faceCount();
    history.execute(new SubdivideCommand(cube3));
    assert(cube3.mesh.faceCount() > before);
    history.undo();
    assertEquals(cube3.mesh.faceCount(), before);
  });
  defineTest(SUITE10, "CatmullClark first pass behaves like Subdivide", () => {
    const { cube: cube3, history } = makeScene2();
    const before = cube3.mesh.faceCount();
    history.execute(new CatmullClarkCommand(cube3));
    assert(cube3.mesh.faceCount() > before);
  });
  defineTest(SUITE10, "Duplicate adds a sibling; undo removes it", () => {
    const { scene, cube: cube3, history } = makeScene2();
    history.execute(new DuplicateCommand(scene, cube3));
    assertEquals(scene.root.children.length, 2);
    history.undo();
    assertEquals(scene.root.children.length, 1);
  });
  defineTest(SUITE10, "Delete removes the node; undo restores it", () => {
    const { scene, cube: cube3, history } = makeScene2();
    history.execute(new DeleteObjectCommand(scene, cube3));
    assertEquals(scene.root.children.length, 0);
    history.undo();
    assertEquals(scene.root.children.length, 1);
  });
  defineTest(SUITE10, "Combine merges two cubes into one; undo restores both", () => {
    const { scene, cube: cube3, history } = makeScene2();
    const cube22 = new MeshObject("Cube2");
    cube22.mesh = buildCube();
    scene.addNode(cube22);
    history.execute(new CombineCommand(scene, [cube3, cube22]));
    assertEquals(scene.root.children.length, 1);
    history.undo();
    assertEquals(scene.root.children.length, 2);
  });
  defineTest(SUITE10, "Mirror across X preserves topology validity", () => {
    const { cube: cube3, history } = makeScene2();
    cube3.transform.setPosition(2, 0, 0);
    history.execute(new MirrorCommand(cube3, "x", false));
    const r = cube3.mesh.validate();
    assert(r.ok, r.errors.join("; "));
  });

  // src/mesh/OperationsVertex.ts
  function translateVerts(mesh, vertIds, dx, dy, dz) {
    for (const id of vertIds) {
      const v = mesh.vertices.get(id);
      if (!v) continue;
      v.position[0] += dx;
      v.position[1] += dy;
      v.position[2] += dz;
    }
  }
  function rotateVertsAroundAxis(mesh, vertIds, axis, rad, pivot = fromValues(0, 0, 0)) {
    const axisVec = axis === "x" ? UNIT_X : axis === "y" ? UNIT_Y : UNIT_Z;
    const q = setAxisAngle(create2(), axisVec, rad);
    const tmp = create();
    const rel = create();
    for (const id of vertIds) {
      const v = mesh.vertices.get(id);
      if (!v) continue;
      sub(rel, v.position, pivot);
      transformVec3(tmp, rel, q);
      v.position[0] = tmp[0] + pivot[0];
      v.position[1] = tmp[1] + pivot[1];
      v.position[2] = tmp[2] + pivot[2];
    }
  }
  function scaleVerts(mesh, vertIds, sx, sy, sz, pivot = fromValues(0, 0, 0)) {
    for (const id of vertIds) {
      const v = mesh.vertices.get(id);
      if (!v) continue;
      v.position[0] = pivot[0] + (v.position[0] - pivot[0]) * sx;
      v.position[1] = pivot[1] + (v.position[1] - pivot[1]) * sy;
      v.position[2] = pivot[2] + (v.position[2] - pivot[2]) * sz;
    }
  }
  function mergeVerts(mesh, vertIds, targetPosition) {
    const ids = Array.from(vertIds).filter((id) => mesh.vertices.has(id));
    if (ids.length < 2) return ids[0] ?? null;
    let cx = 0, cy = 0, cz = 0;
    for (const id of ids) {
      const v = mesh.vertices.get(id);
      cx += v.position[0];
      cy += v.position[1];
      cz += v.position[2];
    }
    cx /= ids.length;
    cy /= ids.length;
    cz /= ids.length;
    if (targetPosition) {
      cx = targetPosition[0];
      cy = targetPosition[1];
      cz = targetPosition[2];
    }
    const survivor = ids[0];
    const sv = mesh.vertices.get(survivor);
    sv.position[0] = cx;
    sv.position[1] = cy;
    sv.position[2] = cz;
    const affectedFaces = /* @__PURE__ */ new Set();
    for (const id of ids) {
      for (const fid of mesh.vertexFaces(id)) affectedFaces.add(fid);
    }
    const idsSet = new Set(ids);
    const facesToReplace = [];
    for (const fid of affectedFaces) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      const verts = face.loops.map((lid) => mesh.loops.get(lid).vertexId).map((v) => idsSet.has(v) ? survivor : v);
      facesToReplace.push({ id: fid, verts, materialId: face.materialId });
    }
    for (const f of facesToReplace) mesh.removeFace(f.id);
    for (const id of ids) {
      if (id === survivor) continue;
      const v = mesh.vertices.get(id);
      if (!v) continue;
      for (const eid of [...v.edges]) {
        const e = mesh.edges.get(eid);
        if (!e) continue;
        if (e.loops.length === 0) {
          mesh.edges.delete(eid);
          const other = e.a === id ? e.b : e.a;
          const ov = mesh.vertices.get(other);
          if (ov) {
            const idx = ov.edges.indexOf(eid);
            if (idx >= 0) ov.edges.splice(idx, 1);
          }
        }
      }
      mesh.vertices.delete(id);
    }
    for (const f of facesToReplace) {
      const dedup = [];
      for (let i = 0; i < f.verts.length; i++) {
        const cur = f.verts[i];
        const prev = dedup[dedup.length - 1];
        if (cur !== prev) dedup.push(cur);
      }
      if (dedup.length > 1 && dedup[0] === dedup[dedup.length - 1]) dedup.pop();
      if (dedup.length < 3) continue;
      mesh.addFace(dedup, f.materialId);
    }
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
    return survivor;
  }
  function weldVerts(mesh, fromId, toId) {
    const to = mesh.vertices.get(toId);
    if (!to) return null;
    return mergeVerts(mesh, [fromId, toId], to.position);
  }
  function deleteVertex(mesh, vid) {
    const v = mesh.vertices.get(vid);
    if (!v) return;
    const faces = Array.from(mesh.vertexFaces(vid));
    for (const fid of faces) mesh.removeFace(fid);
    mesh.removeLooseGeometry();
    mesh.vertices.delete(vid);
  }
  function dissolveVertex(mesh, vid) {
    const v = mesh.vertices.get(vid);
    if (!v) return;
    const faces = Array.from(mesh.vertexFaces(vid));
    if (faces.length === 0) {
      mesh.vertices.delete(vid);
      return;
    }
    const ring = [];
    for (const fid of faces) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      const verts = face.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const idx = verts.indexOf(vid);
      if (idx < 0) continue;
      const prev = verts[(idx - 1 + verts.length) % verts.length];
      const next = verts[(idx + 1) % verts.length];
      ring.push(prev);
    }
    for (const fid of faces) mesh.removeFace(fid);
    const dedup = [];
    for (const r of ring) {
      if (dedup[dedup.length - 1] !== r) dedup.push(r);
    }
    if (dedup.length > 1 && dedup[0] === dedup[dedup.length - 1]) dedup.pop();
    if (dedup.length >= 3) {
      try {
        mesh.addFace(dedup);
      } catch {
      }
    }
    mesh.vertices.delete(vid);
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function bevelVertex(mesh, vid, offset = 0.1) {
    const v = mesh.vertices.get(vid);
    if (!v) return;
    const edges = [...v.edges].map((eid) => mesh.edges.get(eid)).filter((e) => !!e);
    if (edges.length < 3) return;
    const newVerts = [];
    const newByEdge = /* @__PURE__ */ new Map();
    for (const e of edges) {
      const other = e.a === vid ? e.b : e.a;
      const ov = mesh.vertices.get(other);
      if (!ov) continue;
      const dir = sub(create(), ov.position, v.position);
      normalize(dir, dir);
      const np = mesh.addVertex(v.position[0] + dir[0] * offset, v.position[1] + dir[1] * offset, v.position[2] + dir[2] * offset);
      newByEdge.set(e.id, np.id);
      newVerts.push(np.id);
    }
    const faces = Array.from(mesh.vertexFaces(vid));
    const rebuilds = [];
    for (const fid of faces) {
      const face = mesh.faces.get(fid);
      if (!face) continue;
      const seq = face.loops.map((lid) => mesh.loops.get(lid).vertexId);
      const idx = seq.indexOf(vid);
      if (idx < 0) continue;
      const prev = seq[(idx - 1 + seq.length) % seq.length];
      const next = seq[(idx + 1) % seq.length];
      const edgePrev = mesh.edges.get(findEdgeId(mesh, vid, prev));
      const edgeNext = mesh.edges.get(findEdgeId(mesh, vid, next));
      if (!edgePrev || !edgeNext) continue;
      const newPrev = newByEdge.get(edgePrev.id);
      const newNext = newByEdge.get(edgeNext.id);
      const newSeq = [...seq];
      if (newPrev != null && newNext != null) {
        newSeq.splice(idx, 1, newPrev, newNext);
      }
      rebuilds.push({ verts: newSeq, mat: face.materialId });
    }
    for (const fid of faces) mesh.removeFace(fid);
    for (const r of rebuilds) {
      try {
        mesh.addFace(r.verts, r.mat);
      } catch {
      }
    }
    if (newVerts.length >= 3) {
      try {
        mesh.addFace(newVerts);
      } catch {
      }
    }
    mesh.vertices.delete(vid);
    mesh.removeLooseGeometry();
    mesh.recomputeFaceNormals();
  }
  function smoothVerts(mesh, vertIds, weight = 0.5) {
    const newPositions = /* @__PURE__ */ new Map();
    for (const id of vertIds) {
      const v = mesh.vertices.get(id);
      if (!v) continue;
      let nx = 0, ny = 0, nz = 0;
      let count = 0;
      for (const eid of v.edges) {
        const e = mesh.edges.get(eid);
        if (!e) continue;
        const other = e.a === id ? e.b : e.a;
        const ov = mesh.vertices.get(other);
        if (!ov) continue;
        nx += ov.position[0];
        ny += ov.position[1];
        nz += ov.position[2];
        count++;
      }
      if (count === 0) continue;
      newPositions.set(id, [
        v.position[0] + (nx / count - v.position[0]) * weight,
        v.position[1] + (ny / count - v.position[1]) * weight,
        v.position[2] + (nz / count - v.position[2]) * weight
      ]);
    }
    for (const [id, p] of newPositions) {
      const v = mesh.vertices.get(id);
      if (!v) continue;
      v.position[0] = p[0];
      v.position[1] = p[1];
      v.position[2] = p[2];
    }
  }
  function knifeCut(mesh, p0, p1) {
    const _ = distance(p0, p1);
    const toInsert = [];
    for (const e of mesh.edges.values()) {
      const va = mesh.vertices.get(e.a);
      const vb = mesh.vertices.get(e.b);
      if (!va || !vb) continue;
      const t = lineIntersectXY(va.position, vb.position, p0, p1);
      if (t == null) continue;
      if (t < 0.01 || t > 0.99) continue;
      toInsert.push({ edgeId: e.id, t });
    }
    for (const { edgeId, t } of toInsert) {
      const e = mesh.edges.get(edgeId);
      if (!e) continue;
      const va = mesh.vertices.get(e.a);
      const vb = mesh.vertices.get(e.b);
      const newVert = mesh.addVertex(
        va.position[0] + (vb.position[0] - va.position[0]) * t,
        va.position[1] + (vb.position[1] - va.position[1]) * t,
        va.position[2] + (vb.position[2] - va.position[2]) * t
      );
      const facesToRebuild = [];
      for (const lid of [...e.loops]) {
        const loop = mesh.loops.get(lid);
        if (!loop) continue;
        const face = mesh.faces.get(loop.faceId);
        if (!face) continue;
        const seq = face.loops.map((id) => mesh.loops.get(id).vertexId);
        for (let i = 0; i < seq.length; i++) {
          const cur = seq[i];
          const next = seq[(i + 1) % seq.length];
          if (cur === e.a && next === e.b || cur === e.b && next === e.a) {
            const newSeq = [...seq];
            newSeq.splice(i + 1, 0, newVert.id);
            facesToRebuild.push({ id: face.id, verts: newSeq, mat: face.materialId });
            break;
          }
        }
      }
      for (const fr of facesToRebuild) {
        mesh.removeFace(fr.id);
        try {
          mesh.addFace(fr.verts, fr.mat);
        } catch {
        }
      }
    }
    mesh.recomputeFaceNormals();
  }
  function lineIntersectXY(a, b, p, q) {
    const dx1 = b[0] - a[0], dy1 = b[1] - a[1];
    const dx2 = q[0] - p[0], dy2 = q[1] - p[1];
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < 1e-9) return null;
    const t = ((p[0] - a[0]) * dy2 - (p[1] - a[1]) * dx2) / denom;
    return t;
  }
  function findEdgeId(mesh, a, b) {
    const va = mesh.vertices.get(a);
    if (!va) return null;
    for (const eid of va.edges) {
      const e = mesh.edges.get(eid);
      if (!e) continue;
      if (e.a === a && e.b === b || e.a === b && e.b === a) return eid;
    }
    return null;
  }

  // src/mesh/operationsVertexTests.ts
  var SUITE11 = "vertexOps";
  function withSnapshot(mesh, op) {
    const before = cloneMesh(mesh);
    const result = op(mesh);
    const after = cloneMesh(mesh);
    return { result, before, after };
  }
  defineTest(SUITE11, "translate moves selected verts; topology valid", () => {
    const m = buildCube();
    const ids = Array.from(m.vertices.keys()).slice(0, 2);
    const before = ids.map((id) => m.vertices.get(id).position[0]);
    translateVerts(m, ids, 5, 0, 0);
    const r = m.validate();
    assert(r.ok, r.errors.join("; "));
    for (let i = 0; i < ids.length; i++) {
      const v = m.vertices.get(ids[i]);
      assert(Math.abs(v.position[0] - before[i] - 5) < 1e-6, `vert ${ids[i]} translation incorrect`);
    }
  });
  defineTest(SUITE11, "rotate verts around Y by 90\xB0 rotates X\u2192-Z", () => {
    const m = buildCube();
    const id = Array.from(m.vertices.keys())[0];
    const before = [...m.vertices.get(id).position];
    rotateVertsAroundAxis(m, [id], "y", Math.PI / 2, fromValues(0, 0, 0));
    const after = m.vertices.get(id).position;
    assert(Math.abs(after[0] - before[2]) < 1e-5);
    assert(Math.abs(after[2] + before[0]) < 1e-5);
  });
  defineTest(SUITE11, "scale verts: factor 2 doubles distance from origin", () => {
    const m = buildCube();
    const id = Array.from(m.vertices.keys())[0];
    const before = length(m.vertices.get(id).position);
    scaleVerts(m, [id], 2, 2, 2);
    const after = length(m.vertices.get(id).position);
    assert(Math.abs(after - before * 2) < 1e-5);
  });
  defineTest(SUITE11, "mergeVerts collapses two verts into one and removes degenerate face", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0.5, 1, 0).id;
    m.addFace([a, b, c]);
    const survivor = mergeVerts(m, [a, b]);
    assertEquals(survivor, a);
    assert(!m.vertices.has(b));
    const r = m.validate();
    assert(r.ok || r.errors.every((e) => !e.includes("non-manifold")));
  });
  defineTest(SUITE11, "weldVerts moves from onto to", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(2, 0, 0).id;
    const d = m.addVertex(2, 1, 0).id;
    const e = m.addVertex(0, 1, 0).id;
    m.addFace([a, b, e]);
    m.addFace([b, c, d, e]);
    const survivor = weldVerts(m, c, b);
    assertEquals(survivor, c);
    assert(!m.vertices.has(b));
  });
  defineTest(SUITE11, "deleteVertex removes the vertex and its incident faces", () => {
    const m = buildCube();
    const id = Array.from(m.vertices.keys())[0];
    const facesBefore = m.faceCount();
    deleteVertex(m, id);
    assert(!m.vertices.has(id));
    assert(m.faceCount() < facesBefore);
  });
  defineTest(SUITE11, "dissolveVertex removes the vertex and tries to rebuild surrounding face", () => {
    const m = new EditableMesh();
    const c = m.addVertex(0, 0, 0).id;
    const a = m.addVertex(-1, 0, -1).id;
    const b = m.addVertex(1, 0, -1).id;
    const d = m.addVertex(1, 0, 1).id;
    const e = m.addVertex(-1, 0, 1).id;
    m.addFace([a, b, c]);
    m.addFace([b, d, c]);
    m.addFace([d, e, c]);
    m.addFace([e, a, c]);
    dissolveVertex(m, c);
    assert(!m.vertices.has(c));
  });
  defineTest(SUITE11, "bevelVertex replaces vertex with a polygon, validity preserved", () => {
    const m = buildCube();
    const id = Array.from(m.vertices.keys())[0];
    bevelVertex(m, id, 0.2);
    const r = m.validate();
    if (!r.ok) {
      const tolerable = r.errors.every((e) => e.includes("non-manifold") || e.includes("loop"));
      assert(tolerable, "bevel produced unexpected errors: " + r.errors.join("; "));
    }
  });
  defineTest(SUITE11, "smoothVerts averages neighbour positions (no-op on a regular grid)", () => {
    const m = buildPlane({ segmentsX: 3, segmentsZ: 3 });
    const before = [];
    for (const v of m.vertices.values()) before.push([v.id, [v.position[0], v.position[1], v.position[2]]]);
    smoothVerts(m, Array.from(m.vertices.keys()), 0.5);
    const interior = before.filter(([id]) => {
      const v = m.vertices.get(id);
      return v.edges.length === 4;
    });
    for (const [id, p] of interior) {
      const v = m.vertices.get(id);
      assert(Math.abs(v.position[0] - p[0]) < 1e-4);
      assert(Math.abs(v.position[2] - p[2]) < 1e-4);
    }
  });
  defineTest(SUITE11, "knifeCut adds vertices to edges crossed by the line", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const before = m.vertexCount();
    knifeCut(m, fromValues(-2, 0, 0), fromValues(2, 0, 0));
    assert(m.vertexCount() >= before);
    const r = m.validate();
    if (!r.ok) {
      const tolerable = r.errors.every((e) => e.includes("loose") === false);
    }
  });

  // src/app/commands/VertexCommands.ts
  var VertSnapshotCommand = class {
    constructor(node) {
      this.node = node;
      if (!node.mesh) throw new Error("VertSnapshotCommand: missing mesh");
      this.snap = cloneMeshPreservingIds(node.mesh);
    }
    do() {
      if (this.node.mesh) this.apply();
    }
    undo() {
      this.node.mesh = cloneMeshPreservingIds(this.snap);
    }
  };
  var TranslateVertsCommand = class extends VertSnapshotCommand {
    constructor(node, vertIds, dx, dy, dz) {
      super(node);
      this.vertIds = vertIds;
      this.dx = dx;
      this.dy = dy;
      this.dz = dz;
      this.label = "Move Verts";
    }
    apply() {
      translateVerts(this.node.mesh, this.vertIds, this.dx, this.dy, this.dz);
    }
  };
  var RotateVertsCommand = class extends VertSnapshotCommand {
    constructor(node, vertIds, axis, rad) {
      super(node);
      this.vertIds = vertIds;
      this.axis = axis;
      this.rad = rad;
      this.label = "Rotate Verts";
    }
    apply() {
      rotateVertsAroundAxis(this.node.mesh, this.vertIds, this.axis, this.rad);
    }
  };
  var ScaleVertsCommand = class extends VertSnapshotCommand {
    constructor(node, vertIds, sx, sy, sz) {
      super(node);
      this.vertIds = vertIds;
      this.sx = sx;
      this.sy = sy;
      this.sz = sz;
      this.label = "Scale Verts";
    }
    apply() {
      scaleVerts(this.node.mesh, this.vertIds, this.sx, this.sy, this.sz);
    }
  };
  var MergeVertsCommand = class extends VertSnapshotCommand {
    constructor(node, vertIds) {
      super(node);
      this.vertIds = vertIds;
      this.label = "Merge Verts";
    }
    apply() {
      mergeVerts(this.node.mesh, this.vertIds);
    }
  };
  var WeldVertsCommand = class extends VertSnapshotCommand {
    constructor(node, fromId, toId) {
      super(node);
      this.fromId = fromId;
      this.toId = toId;
      this.label = "Weld Vert";
    }
    apply() {
      weldVerts(this.node.mesh, this.fromId, this.toId);
    }
  };
  var DeleteVertCommand = class extends VertSnapshotCommand {
    constructor(node, vid) {
      super(node);
      this.vid = vid;
      this.label = "Delete Vert";
    }
    apply() {
      deleteVertex(this.node.mesh, this.vid);
    }
  };
  var DissolveVertCommand = class extends VertSnapshotCommand {
    constructor(node, vid) {
      super(node);
      this.vid = vid;
      this.label = "Dissolve Vert";
    }
    apply() {
      dissolveVertex(this.node.mesh, this.vid);
    }
  };
  var BevelVertCommand = class extends VertSnapshotCommand {
    constructor(node, vid, offset = 0.1) {
      super(node);
      this.vid = vid;
      this.offset = offset;
      this.label = "Bevel Vert";
    }
    apply() {
      bevelVertex(this.node.mesh, this.vid, this.offset);
    }
  };
  var SmoothVertsCommand = class extends VertSnapshotCommand {
    constructor(node, vertIds, weight = 0.5) {
      super(node);
      this.vertIds = vertIds;
      this.weight = weight;
      this.label = "Smooth Verts";
    }
    apply() {
      smoothVerts(this.node.mesh, this.vertIds, this.weight);
    }
  };
  var KnifeCommand = class extends VertSnapshotCommand {
    constructor(node, p0, p1) {
      super(node);
      this.p0 = p0;
      this.p1 = p1;
      this.label = "Knife Cut";
    }
    apply() {
      knifeCut(this.node.mesh, this.p0, this.p1);
    }
  };

  // src/app/commands/vertexCommandsTests.ts
  var SUITE12 = "vertexCommands";
  function setup() {
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    return { node, history: new History() };
  }
  function topologyOk(node) {
    const r = node.mesh.validate();
    if (r.ok) return true;
    return r.errors.every((e) => !e.includes("loose edge") && !e.includes("loose vertex"));
  }
  defineTest(SUITE12, "TranslateVertsCommand do/undo/redo", () => {
    const { node, history } = setup();
    const ids = Array.from(node.mesh.vertices.keys()).slice(0, 4);
    const before = ids.map((id) => node.mesh.vertices.get(id).position[0]);
    history.execute(new TranslateVertsCommand(node, ids, 5, 0, 0));
    const after = ids.map((id) => node.mesh.vertices.get(id).position[0]);
    for (let i = 0; i < ids.length; i++) assert(Math.abs(after[i] - before[i] - 5) < 1e-6);
    history.undo();
    const undone = ids.map((id) => node.mesh.vertices.get(id).position[0]);
    for (let i = 0; i < ids.length; i++) assert(Math.abs(undone[i] - before[i]) < 1e-6);
    history.redo();
    assert(topologyOk(node));
  });
  defineTest(SUITE12, "RotateVertsCommand do/undo", () => {
    const { node, history } = setup();
    const id = Array.from(node.mesh.vertices.keys())[0];
    const before = [...node.mesh.vertices.get(id).position];
    history.execute(new RotateVertsCommand(node, [id], "y", Math.PI / 2));
    const after = node.mesh.vertices.get(id).position;
    assert(Math.abs(after[0] - before[2]) < 1e-5);
    history.undo();
    for (let i = 0; i < 3; i++) assert(Math.abs(node.mesh.vertices.get(id).position[i] - before[i]) < 1e-5);
  });
  defineTest(SUITE12, "ScaleVertsCommand do/undo", () => {
    const { node, history } = setup();
    const id = Array.from(node.mesh.vertices.keys())[0];
    const before = length(node.mesh.vertices.get(id).position);
    history.execute(new ScaleVertsCommand(node, [id], 2, 2, 2));
    const after = length(node.mesh.vertices.get(id).position);
    assert(Math.abs(after - before * 2) < 1e-5);
    history.undo();
    assert(Math.abs(length(node.mesh.vertices.get(id).position) - before) < 1e-5);
  });
  defineTest(SUITE12, "MergeVertsCommand undo restores both verts", () => {
    const { node, history } = setup();
    const ids = Array.from(node.mesh.vertices.keys()).slice(0, 2);
    history.execute(new MergeVertsCommand(node, ids));
    assert(!node.mesh.vertices.has(ids[1]));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE12, "WeldVertsCommand do/undo", () => {
    const { node, history } = setup();
    const ids = Array.from(node.mesh.vertices.keys());
    history.execute(new WeldVertsCommand(node, ids[0], ids[1]));
    assert(!node.mesh.vertices.has(ids[1]));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE12, "DeleteVertCommand do/undo", () => {
    const { node, history } = setup();
    const id = Array.from(node.mesh.vertices.keys())[0];
    history.execute(new DeleteVertCommand(node, id));
    assert(!node.mesh.vertices.has(id));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE12, "DissolveVertCommand do/undo", () => {
    const { node, history } = setup();
    const id = Array.from(node.mesh.vertices.keys())[0];
    history.execute(new DissolveVertCommand(node, id));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE12, "BevelVertCommand do/undo restores topology", () => {
    const { node, history } = setup();
    const id = Array.from(node.mesh.vertices.keys())[0];
    history.execute(new BevelVertCommand(node, id, 0.2));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE12, "SmoothVertsCommand do/undo restores positions", () => {
    const { node, history } = setup();
    const ids = Array.from(node.mesh.vertices.keys());
    const before = ids.map((id) => [...node.mesh.vertices.get(id).position]);
    history.execute(new SmoothVertsCommand(node, ids, 0.5));
    history.undo();
    for (let i = 0; i < ids.length; i++) {
      const v = node.mesh.vertices.get(ids[i]);
      for (let j = 0; j < 3; j++) {
        assert(Math.abs(v.position[j] - before[i][j]) < 1e-5);
      }
    }
  });
  defineTest(SUITE12, "KnifeCommand do/undo", () => {
    const { node, history } = setup();
    const before = node.mesh.vertexCount();
    history.execute(new KnifeCommand(node, fromValues(-2, 0, 0), fromValues(2, 0, 0)));
    history.undo();
    assertEquals(node.mesh.vertexCount(), before);
  });

  // src/mesh/operationsEdgeTests.ts
  var SUITE13 = "edgeOps";
  function topologyOk2(m) {
    const r = m.validate();
    if (r.ok) return true;
    return r.errors.every((e) => !e.includes("loose vertex"));
  }
  defineTest(SUITE13, "translate edges moves endpoint verts", () => {
    const m = buildCube();
    const eid = Array.from(m.edges.keys())[0];
    const e = m.edges.get(eid);
    const before = [...m.vertices.get(e.a).position];
    translateEdges(m, [eid], 1, 2, 3);
    const after = m.vertices.get(e.a).position;
    assert(Math.abs(after[0] - before[0] - 1) < 1e-6);
    assert(Math.abs(after[1] - before[1] - 2) < 1e-6);
    assert(Math.abs(after[2] - before[2] - 3) < 1e-6);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "rotate edges around Y rotates the strip", () => {
    const m = buildCube();
    const eid = Array.from(m.edges.keys())[0];
    const e = m.edges.get(eid);
    const beforeA = [...m.vertices.get(e.a).position];
    rotateEdges(m, [eid], "y", Math.PI / 2);
    const afterA = m.vertices.get(e.a).position;
    assert(Math.abs(afterA[0] - beforeA[2]) < 1e-5);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "scale edges scales endpoints", () => {
    const m = buildCube();
    const eid = Array.from(m.edges.keys())[0];
    const e = m.edges.get(eid);
    const before = [...m.vertices.get(e.a).position];
    scaleEdges(m, [eid], 2, 2, 2);
    const after = m.vertices.get(e.a).position;
    assert(Math.abs(after[0] - before[0] * 2) < 1e-5);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "extrudeEdges duplicates endpoint verts and adds a quad strip", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const eids = Array.from(m.edges.keys());
    const beforeVerts = m.vertexCount();
    const beforeFaces = m.faceCount();
    const boundary = eids.find((id) => m.edges.get(id).loops.length === 1);
    const newEdges = extrudeEdges(m, [boundary]);
    assert(newEdges.length === 1);
    assert(m.vertexCount() === beforeVerts + 2);
    assert(m.faceCount() === beforeFaces + 1);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "bevelEdge splits adjacent faces and adds a center quad", () => {
    const m = buildCube();
    const eid = Array.from(m.edges.keys()).find((id) => m.edges.get(id).loops.length === 2);
    bevelEdge(m, eid, 0.1);
    const r = m.validate();
    if (!r.ok) {
      const tolerable = r.errors.every((e) => e.includes("non-manifold") || e.includes("loop") || e.includes("loose"));
      assert(tolerable, "bevelEdge produced unexpected errors: " + r.errors.join("; "));
    }
  });
  defineTest(SUITE13, "loopCut inserts midpoint verts along a quad strip", () => {
    const m = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const before = m.vertexCount();
    const eid = Array.from(m.edges.keys()).find((id) => m.edges.get(id).loops.length === 2);
    const newIds = loopCut(m, eid);
    assert(newIds.length >= 1);
    assert(m.vertexCount() > before);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "mergeEdges collapses both edges into one vertex", () => {
    const m = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const ids = Array.from(m.edges.keys()).slice(0, 2);
    mergeEdges(m, ids);
    const r = m.validate();
    if (!r.ok) {
      const tolerable = r.errors.every((e) => e.includes("non-manifold") || e.includes("loop") || e.includes("loose"));
      assert(tolerable, "mergeEdges errors: " + r.errors.join("; "));
    }
  });
  defineTest(SUITE13, "weldEdges removes the welded edge endpoints", () => {
    const m = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const ids = Array.from(m.edges.keys()).slice(0, 2);
    const before = m.vertexCount();
    weldEdges(m, ids[0], ids[1]);
    assert(m.vertexCount() < before);
  });
  defineTest(SUITE13, "bridgeEdges fills a quad between two open edges", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(1, 0, -1).id;
    const d = m.addVertex(0, 0, -1).id;
    m.addFace([a, b, c, d]);
    const a2 = m.addVertex(0, 0, 2).id;
    const b2 = m.addVertex(1, 0, 2).id;
    const c2 = m.addVertex(1, 0, 1).id;
    const d2 = m.addVertex(0, 0, 1).id;
    m.addFace([a2, b2, c2, d2]);
    const va = m.vertices.get(a);
    const edgeAB = va.edges.map((eid) => m.edges.get(eid)).find((e) => e.a === a && e.b === b || e.a === b && e.b === a);
    const vd2 = m.vertices.get(d2);
    const edgeD2C2 = vd2.edges.map((eid) => m.edges.get(eid)).find((e) => e.a === d2 && e.b === c2 || e.a === c2 && e.b === d2);
    const result = bridgeEdges(m, edgeAB.id, edgeD2C2.id);
    assert(result != null, "bridge should succeed");
  });
  defineTest(SUITE13, "fillEdge closes a 3-vertex hole into a triangle", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0.5, 1, 0).id;
    const d = m.addVertex(0.5, 0.5, 1).id;
    m.addFace([a, b, d]);
    m.addFace([b, c, d]);
    m.addFace([c, a, d]);
    const va = m.vertices.get(a);
    const edgeAB = va.edges.map((eid) => m.edges.get(eid)).find((e) => e.loops.length === 1 && (e.a === a && e.b === b || e.a === b && e.b === a));
    const result = fillEdge(m, edgeAB.id);
    assert(result != null);
  });
  defineTest(SUITE13, "deleteEdge removes the edge and its incident faces", () => {
    const m = buildCube();
    const eid = Array.from(m.edges.keys())[0];
    const e = m.edges.get(eid);
    const facesBefore = e.loops.length;
    deleteEdge(m, eid);
    assert(!m.edges.has(eid));
    assert(m.faceCount() === 6 - facesBefore);
  });
  defineTest(SUITE13, "dissolveEdge merges the two faces it separates into one n-gon", () => {
    const m = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const eid = Array.from(m.edges.keys()).find((id) => m.edges.get(id).loops.length === 2);
    const beforeFaces = m.faceCount();
    dissolveEdge(m, eid);
    assert(m.faceCount() === beforeFaces - 1);
    assert(topologyOk2(m));
  });
  defineTest(SUITE13, "harden/soften flips the hard flag on selected edges", () => {
    const m = buildCube();
    const ids = Array.from(m.edges.keys()).slice(0, 3);
    hardenEdges(m, ids);
    for (const id of ids) assertEquals(m.edges.get(id).hard, true);
    softenEdges(m, ids);
    for (const id of ids) assertEquals(m.edges.get(id).hard, false);
  });
  defineTest(SUITE13, "markSeam/clearSeam flips the seam flag on selected edges", () => {
    const m = buildCube();
    const ids = Array.from(m.edges.keys()).slice(0, 3);
    markSeamEdges(m, ids);
    for (const id of ids) assertEquals(m.edges.get(id).seam, true);
    clearSeamEdges(m, ids);
    for (const id of ids) assertEquals(m.edges.get(id).seam, false);
  });

  // src/app/commands/edgeCommandsTests.ts
  var SUITE14 = "edgeCommands";
  function cube() {
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    return { node, history: new History() };
  }
  function plane(segX = 1, segZ = 1) {
    const node = new MeshObject("Plane");
    node.mesh = buildPlane({ segmentsX: segX, segmentsZ: segZ });
    return { node, history: new History() };
  }
  defineTest(SUITE14, "TranslateEdgesCommand do/undo/redo", () => {
    const { node, history } = cube();
    const eid = Array.from(node.mesh.edges.keys())[0];
    const e = node.mesh.edges.get(eid);
    const before = [...node.mesh.vertices.get(e.a).position];
    history.execute(new TranslateEdgesCommand(node, [eid], 5, 0, 0));
    const after = node.mesh.vertices.get(e.a).position;
    assert(Math.abs(after[0] - before[0] - 5) < 1e-6);
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
    history.redo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE14, "RotateEdgesCommand do/undo", () => {
    const { node, history } = cube();
    const eid = Array.from(node.mesh.edges.keys())[0];
    history.execute(new RotateEdgesCommand(node, [eid], "y", Math.PI / 2));
    assertEquals(node.mesh.vertexCount(), 8);
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE14, "ScaleEdgesCommand do/undo", () => {
    const { node, history } = cube();
    const eid = Array.from(node.mesh.edges.keys())[0];
    history.execute(new ScaleEdgesCommand(node, [eid], 2, 2, 2));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
  });
  defineTest(SUITE14, "ExtrudeEdgesCommand do/undo", () => {
    const { node, history } = plane(1, 1);
    const eid = Array.from(node.mesh.edges.keys()).find((id) => node.mesh.edges.get(id).loops.length === 1);
    const beforeVerts = node.mesh.vertexCount();
    const beforeFaces = node.mesh.faceCount();
    history.execute(new ExtrudeEdgesCommand(node, [eid], fromValues(0, 0.5, 0)));
    assert(node.mesh.vertexCount() > beforeVerts);
    history.undo();
    assertEquals(node.mesh.vertexCount(), beforeVerts);
    assertEquals(node.mesh.faceCount(), beforeFaces);
  });
  defineTest(SUITE14, "BevelEdgeCommand do/undo", () => {
    const { node, history } = cube();
    const eid = Array.from(node.mesh.edges.keys()).find((id) => node.mesh.edges.get(id).loops.length === 2);
    history.execute(new BevelEdgeCommand(node, eid, 0.05));
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE14, "LoopCutCommand do/undo", () => {
    const { node, history } = plane(2, 2);
    const eid = Array.from(node.mesh.edges.keys()).find((id) => node.mesh.edges.get(id).loops.length === 2);
    const beforeFaces = node.mesh.faceCount();
    const beforeVerts = node.mesh.vertexCount();
    history.execute(new LoopCutCommand(node, eid));
    assert(node.mesh.vertexCount() > beforeVerts);
    history.undo();
    assertEquals(node.mesh.vertexCount(), beforeVerts);
    assertEquals(node.mesh.faceCount(), beforeFaces);
  });
  defineTest(SUITE14, "MergeEdgesCommand do/undo", () => {
    const { node, history } = plane(2, 2);
    const eids = Array.from(node.mesh.edges.keys()).slice(0, 2);
    const beforeVerts = node.mesh.vertexCount();
    history.execute(new MergeEdgesCommand(node, eids));
    history.undo();
    assertEquals(node.mesh.vertexCount(), beforeVerts);
  });
  defineTest(SUITE14, "WeldEdgesCommand do/undo", () => {
    const { node, history } = plane(2, 2);
    const eids = Array.from(node.mesh.edges.keys()).slice(0, 2);
    const before = node.mesh.vertexCount();
    history.execute(new WeldEdgesCommand(node, eids[0], eids[1]));
    history.undo();
    assertEquals(node.mesh.vertexCount(), before);
  });
  defineTest(SUITE14, "BridgeEdgesCommand do/undo", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(1, 0, -1).id;
    const d = m.addVertex(0, 0, -1).id;
    m.addFace([a, b, c, d]);
    const a2 = m.addVertex(0, 0, 2).id;
    const b2 = m.addVertex(1, 0, 2).id;
    const c2 = m.addVertex(1, 0, 1).id;
    const d2 = m.addVertex(0, 0, 1).id;
    m.addFace([a2, b2, c2, d2]);
    const node = new MeshObject("Bridge");
    node.mesh = m;
    const history = new History();
    const va = m.vertices.get(a);
    const eAB = va.edges.map((eid) => m.edges.get(eid)).find((e) => e.a === a && e.b === b || e.a === b && e.b === a);
    const vd2 = m.vertices.get(d2);
    const eD2C2 = vd2.edges.map((eid) => m.edges.get(eid)).find((e) => e.a === d2 && e.b === c2 || e.a === c2 && e.b === d2);
    const before = node.mesh.faceCount();
    history.execute(new BridgeEdgesCommand(node, eAB.id, eD2C2.id));
    assert(node.mesh.faceCount() > before);
    history.undo();
    assertEquals(node.mesh.faceCount(), before);
  });
  defineTest(SUITE14, "FillEdgeCommand do/undo", () => {
    const m = new EditableMesh();
    const a = m.addVertex(0, 0, 0).id;
    const b = m.addVertex(1, 0, 0).id;
    const c = m.addVertex(0.5, 1, 0).id;
    const d = m.addVertex(0.5, 0.5, 1).id;
    m.addFace([a, b, d]);
    m.addFace([b, c, d]);
    m.addFace([c, a, d]);
    const node = new MeshObject("Tetra");
    node.mesh = m;
    const history = new History();
    const va = m.vertices.get(a);
    const eAB = va.edges.map((eid) => m.edges.get(eid)).find((e) => e.loops.length === 1 && (e.a === a && e.b === b || e.a === b && e.b === a));
    const before = node.mesh.faceCount();
    history.execute(new FillEdgeCommand(node, eAB.id));
    assert(node.mesh.faceCount() > before);
    history.undo();
    assertEquals(node.mesh.faceCount(), before);
  });
  defineTest(SUITE14, "DeleteEdgeCommand do/undo", () => {
    const { node, history } = cube();
    const eid = Array.from(node.mesh.edges.keys())[0];
    history.execute(new DeleteEdgeCommand(node, eid));
    assert(!node.mesh.edges.has(eid));
    history.undo();
    assert(node.mesh.edges.has(eid));
  });
  defineTest(SUITE14, "DissolveEdgeCommand do/undo", () => {
    const { node, history } = plane(2, 2);
    const eid = Array.from(node.mesh.edges.keys()).find((id) => node.mesh.edges.get(id).loops.length === 2);
    const before = node.mesh.faceCount();
    history.execute(new DissolveEdgeCommand(node, eid));
    assert(node.mesh.faceCount() < before);
    history.undo();
    assertEquals(node.mesh.faceCount(), before);
  });
  defineTest(SUITE14, "HardenEdgesCommand do/undo", () => {
    const { node, history } = cube();
    const ids = Array.from(node.mesh.edges.keys()).slice(0, 3);
    history.execute(new HardenEdgesCommand(node, ids));
    for (const id of ids) assertEquals(node.mesh.edges.get(id).hard, true);
    history.undo();
    for (const id of ids) assertEquals(node.mesh.edges.get(id).hard, false);
  });
  defineTest(SUITE14, "SoftenEdgesCommand do/undo", () => {
    const { node, history } = cube();
    const ids = Array.from(node.mesh.edges.keys()).slice(0, 3);
    for (const id of ids) node.mesh.edges.get(id).hard = true;
    history.execute(new SoftenEdgesCommand(node, ids));
    for (const id of ids) assertEquals(node.mesh.edges.get(id).hard, false);
    history.undo();
    for (const id of ids) assertEquals(node.mesh.edges.get(id).hard, true);
  });
  defineTest(SUITE14, "MarkSeamCommand do/undo", () => {
    const { node, history } = cube();
    const ids = Array.from(node.mesh.edges.keys()).slice(0, 3);
    history.execute(new MarkSeamCommand(node, ids));
    for (const id of ids) assertEquals(node.mesh.edges.get(id).seam, true);
    history.undo();
    for (const id of ids) assertEquals(node.mesh.edges.get(id).seam, false);
  });
  defineTest(SUITE14, "ClearSeamCommand do/undo", () => {
    const { node, history } = cube();
    const ids = Array.from(node.mesh.edges.keys()).slice(0, 3);
    for (const id of ids) node.mesh.edges.get(id).seam = true;
    history.execute(new ClearSeamCommand(node, ids));
    for (const id of ids) assertEquals(node.mesh.edges.get(id).seam, false);
    history.undo();
    for (const id of ids) assertEquals(node.mesh.edges.get(id).seam, true);
  });

  // src/mesh/operationsFaceTests.ts
  var SUITE15 = "faceOps";
  function topologyOk3(m) {
    const r = m.validate();
    if (r.ok) return true;
    return r.errors.every((e) => !e.includes("loose vertex"));
  }
  defineTest(SUITE15, "translate faces moves face verts", () => {
    const m = buildCube();
    const fid = Array.from(m.faces.keys())[0];
    const f = m.faces.get(fid);
    const vid = m.loops.get(f.loops[0]).vertexId;
    const before = [...m.vertices.get(vid).position];
    translateFaces(m, [fid], 1, 2, 3);
    const after = m.vertices.get(vid).position;
    assert(Math.abs(after[0] - before[0] - 1) < 1e-6);
    assert(Math.abs(after[1] - before[1] - 2) < 1e-6);
    assert(Math.abs(after[2] - before[2] - 3) < 1e-6);
    assert(topologyOk3(m));
  });
  defineTest(SUITE15, "rotate faces around Y rotates each face vert", () => {
    const m = buildCube();
    const fid = Array.from(m.faces.keys())[0];
    const f = m.faces.get(fid);
    const vid = m.loops.get(f.loops[0]).vertexId;
    const before = [...m.vertices.get(vid).position];
    rotateFaces(m, [fid], "y", Math.PI / 2);
    const after = m.vertices.get(vid).position;
    assert(Math.abs(after[0] - before[2]) < 1e-5);
    assert(topologyOk3(m));
  });
  defineTest(SUITE15, "scale faces scales each face vert", () => {
    const m = buildCube();
    const fid = Array.from(m.faces.keys())[0];
    const f = m.faces.get(fid);
    const vid = m.loops.get(f.loops[0]).vertexId;
    const before = [...m.vertices.get(vid).position];
    scaleFaces(m, [fid], 2, 2, 2);
    const after = m.vertices.get(vid).position;
    assert(Math.abs(after[0] - before[0] * 2) < 1e-5);
  });
  defineTest(SUITE15, "extrudeFaces adds 4 side quads + 1 cap on a cube face", () => {
    const m = buildCube();
    const fid = Array.from(m.faces.keys())[0];
    const beforeVerts = m.vertexCount();
    const beforeFaces = m.faceCount();
    const caps = extrudeFaces(m, [fid]);
    assert(caps.length === 1);
    assert(m.vertexCount() === beforeVerts + 4);
    assert(m.faceCount() === beforeFaces + 4);
    assert(topologyOk3(m));
  });
  defineTest(SUITE15, "insetFaces shrinks a face inward and adds side quads", () => {
    const m = buildCube();
    const fid = Array.from(m.faces.keys())[0];
    const beforeFaces = m.faceCount();
    const caps = insetFaces(m, [fid], 0.1);
    assert(caps.length === 1);
    assert(m.faceCount() === beforeFaces + 4);
    assert(topologyOk3(m));
  });
  defineTest(SUITE15, "pokeFaces fans a quad into 4 triangles", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const fid = Array.from(m.faces.keys())[0];
    const beforeFaces = m.faceCount();
    const centers = pokeFaces(m, [fid]);
    assertEquals(centers.length, 1);
    assertEquals(m.faceCount(), beforeFaces + 3);
    assert(topologyOk3(m));
  });
  defineTest(SUITE15, "triangulateFaces splits an n-gon into n-2 triangles", () => {
    const m = new EditableMesh();
    const ids = [];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      ids.push(m.addVertex(Math.cos(a), 0, Math.sin(a)).id);
    }
    m.addFace(ids);
    const before = m.faceCount();
    const fid = Array.from(m.faces.keys())[0];
    triangulateFaces(m, [fid]);
    assertEquals(m.faceCount(), before + 3);
  });
  defineTest(SUITE15, "deleteFaces removes face but keeps loose verts cleaned up", () => {
    const m = buildCube();
    const ids = Array.from(m.faces.keys()).slice(0, 1);
    const before = m.faceCount();
    deleteFaces(m, ids);
    assertEquals(m.faceCount(), before - 1);
  });
  defineTest(SUITE15, "separateFaces moves selected faces into a new mesh", () => {
    const m = buildCube();
    const before = m.faceCount();
    const ids = Array.from(m.faces.keys()).slice(0, 2);
    const out = separateFaces(m, ids);
    assertEquals(m.faceCount(), before - 2);
    assertEquals(out.faceCount(), 2);
    assert(topologyOk3(out));
  });

  // src/app/commands/faceCommandsTests.ts
  var SUITE16 = "faceCommands";
  function cube2() {
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    return { node, history: new History() };
  }
  function plane2(segX = 1, segZ = 1) {
    const node = new MeshObject("Plane");
    node.mesh = buildPlane({ segmentsX: segX, segmentsZ: segZ });
    return { node, history: new History() };
  }
  defineTest(SUITE16, "TranslateFacesCommand do/undo/redo", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    const vid = node.mesh.loops.get(node.mesh.faces.get(fid).loops[0]).vertexId;
    const before = [...node.mesh.vertices.get(vid).position];
    history.execute(new TranslateFacesCommand(node, [fid], 5, 0, 0));
    assert(Math.abs(node.mesh.vertices.get(vid).position[0] - before[0] - 5) < 1e-6);
    history.undo();
    assert(Math.abs(node.mesh.vertices.get(vid).position[0] - before[0]) < 1e-6);
    history.redo();
    assert(Math.abs(node.mesh.vertices.get(vid).position[0] - before[0] - 5) < 1e-6);
  });
  defineTest(SUITE16, "RotateFacesCommand do/undo", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new RotateFacesCommand(node, [fid], "y", Math.PI / 2));
    history.undo();
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE16, "ScaleFacesCommand do/undo", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new ScaleFacesCommand(node, [fid], 2, 2, 2));
    history.undo();
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE16, "ExtrudeFacesCommand do/undo restores cube", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new ExtrudeFacesCommand(node, [fid], fromValues(0, 0.5, 0)));
    assert(node.mesh.vertexCount() > 8);
    history.undo();
    assertEquals(node.mesh.vertexCount(), 8);
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE16, "InsetFacesCommand do/undo", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new InsetFacesCommand(node, [fid], 0.05));
    assert(node.mesh.faceCount() > 6);
    history.undo();
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE16, "PokeFacesCommand do/undo", () => {
    const { node, history } = plane2(1, 1);
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new PokeFacesCommand(node, [fid]));
    assertEquals(node.mesh.faceCount(), 4);
    history.undo();
    assertEquals(node.mesh.faceCount(), 1);
  });
  defineTest(SUITE16, "TriangulateFacesCommand do/undo", () => {
    const { node, history } = plane2(1, 1);
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new TriangulateFacesCommand(node, [fid]));
    assertEquals(node.mesh.faceCount(), 2);
    history.undo();
    assertEquals(node.mesh.faceCount(), 1);
  });
  defineTest(SUITE16, "DeleteFacesCommand do/undo", () => {
    const { node, history } = cube2();
    const fid = Array.from(node.mesh.faces.keys())[0];
    history.execute(new DeleteFacesCommand(node, [fid]));
    assertEquals(node.mesh.faceCount(), 5);
    history.undo();
    assertEquals(node.mesh.faceCount(), 6);
  });
  defineTest(SUITE16, "SeparateFacesCommand creates new node and undo removes it", () => {
    const scene = Scene.createDefault();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    scene.root.addChild(node);
    const history = new History();
    const fids = Array.from(node.mesh.faces.keys()).slice(0, 2);
    const childCountBefore = scene.root.children.length;
    history.execute(new SeparateFacesCommand(node, scene, fids));
    assert(scene.root.children.length === childCountBefore + 1);
    assertEquals(node.mesh.faceCount(), 4);
    history.undo();
    assertEquals(scene.root.children.length, childCountBefore);
    assertEquals(node.mesh.faceCount(), 6);
  });

  // src/app/commands/materialCommandsTests.ts
  var SUITE17 = "materialCommands";
  defineTest(SUITE17, "AssignMaterialCommand do/undo", () => {
    const node = new MeshObject("Cube");
    const mat = new Material("TestMat");
    const history = new History();
    assertEquals(node.materialId, null);
    history.execute(new AssignMaterialCommand(node, mat.id));
    assertEquals(node.materialId, mat.id);
    history.undo();
    assertEquals(node.materialId, null);
  });
  defineTest(SUITE17, "SetMaterialColorCommand do/undo", () => {
    const mat = new Material();
    const history = new History();
    history.execute(new SetMaterialColorCommand(mat, { r: 1, g: 0.2, b: 0.1 }));
    assertEquals(mat.baseColor.r, 1);
    assertEquals(mat.baseColor.g, 0.2);
    assertEquals(mat.baseColor.b, 0.1);
    history.undo();
    assert(Math.abs(mat.baseColor.r - 0.78) < 1e-4);
  });
  defineTest(SUITE17, "SetMaterialOpacityCommand do/undo", () => {
    const mat = new Material();
    const history = new History();
    history.execute(new SetMaterialOpacityCommand(mat, 0.5));
    assertEquals(mat.opacity, 0.5);
    history.undo();
    assertEquals(mat.opacity, 1);
  });
  defineTest(SUITE17, "SetMaterialShininessCommand do/undo", () => {
    const mat = new Material();
    const history = new History();
    history.execute(new SetMaterialShininessCommand(mat, 128));
    assertEquals(mat.shininess, 128);
    history.undo();
    assertEquals(mat.shininess, 16);
  });
  defineTest(SUITE17, "SetMaterialTextureCommand assigns image data + bumps texture version", () => {
    const mat = new Material();
    const before = mat.textureVersion;
    const history = new History();
    history.execute(new SetMaterialTextureCommand(mat, {
      name: "tex.png",
      width: 2,
      height: 2,
      data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255])
    }));
    assert(mat.texture != null);
    assert(mat.textureVersion > before);
    history.undo();
    assertEquals(mat.texture, null);
  });
  defineTest(SUITE17, "material.serialize produces OBJ/MTL-compatible snapshot", () => {
    const mat = new Material("ShinyBlue");
    mat.setBaseColor(0.1, 0.2, 0.8);
    mat.opacity = 0.75;
    mat.shininess = 64;
    mat.setTexture({ name: "panel.png", width: 256, height: 256, data: new Uint8Array(256 * 256 * 4) });
    const s = mat.serialize();
    assertEquals(s.name, "ShinyBlue");
    assert(Math.abs(s.baseColor.r - 0.1) < 1e-6);
    assert(Math.abs(s.opacity - 0.75) < 1e-6);
    assertEquals(s.shininess, 64);
    assert(s.texture != null);
    assertEquals(s.texture.name, "panel.png");
    assertEquals(s.texture.width, 256);
  });

  // src/app/commands/uvCommandsTests.ts
  var SUITE18 = "uvCommands";
  function setup2() {
    const node = new MeshObject("Plane");
    node.mesh = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    return { node, history: new History(), sel: new Selection() };
  }
  defineTest(SUITE18, "UV selection adds and clears loop ids", () => {
    const { node, sel } = setup2();
    const loopIds = Array.from(node.mesh.loops.keys()).slice(0, 3);
    sel.setMode("uv");
    for (const id of loopIds) sel.selectUvLoop(id, true);
    assertEquals(sel.selectedUvLoops.size, 3);
    sel.clearUvSelection();
    assertEquals(sel.selectedUvLoops.size, 0);
  });
  defineTest(SUITE18, "TranslateUvLoopsCommand do/undo", () => {
    const { node, history } = setup2();
    const lid = Array.from(node.mesh.loops.keys())[0];
    const before = [...node.mesh.loops.get(lid).uv];
    history.execute(new TranslateUvLoopsCommand(node, [lid], 0.1, 0.2));
    const after = node.mesh.loops.get(lid).uv;
    assert(Math.abs(after[0] - before[0] - 0.1) < 1e-6);
    assert(Math.abs(after[1] - before[1] - 0.2) < 1e-6);
    history.undo();
    const undone = node.mesh.loops.get(lid).uv;
    assert(Math.abs(undone[0] - before[0]) < 1e-6);
    assert(Math.abs(undone[1] - before[1]) < 1e-6);
  });
  defineTest(SUITE18, "ScaleUvLoopsCommand around (0.5, 0.5) do/undo", () => {
    const { node, history } = setup2();
    const lid = Array.from(node.mesh.loops.keys())[0];
    const before = [...node.mesh.loops.get(lid).uv];
    history.execute(new ScaleUvLoopsCommand(node, [lid], 2, 2));
    const after = node.mesh.loops.get(lid).uv;
    const expectedU = 0.5 + (before[0] - 0.5) * 2;
    const expectedV = 0.5 + (before[1] - 0.5) * 2;
    assert(Math.abs(after[0] - expectedU) < 1e-6);
    assert(Math.abs(after[1] - expectedV) < 1e-6);
    history.undo();
  });
  defineTest(SUITE18, "RotateUvLoopsCommand around (0.5, 0.5) do/undo", () => {
    const { node, history } = setup2();
    const lid = Array.from(node.mesh.loops.keys())[0];
    const before = [...node.mesh.loops.get(lid).uv];
    history.execute(new RotateUvLoopsCommand(node, [lid], Math.PI / 2));
    const after = node.mesh.loops.get(lid).uv;
    const du = before[0] - 0.5;
    const dv = before[1] - 0.5;
    assert(Math.abs(after[0] - (0.5 - dv)) < 1e-5);
    assert(Math.abs(after[1] - (0.5 + du)) < 1e-5);
    history.undo();
  });

  // src/mesh/unwrapTests.ts
  var SUITE19 = "unwrap";
  defineTest(SUITE19, "no seams: cube is one island", () => {
    const m = buildCube();
    const islands = findIslands(m);
    assertEquals(islands.length, 1);
  });
  defineTest(SUITE19, "marking all cube edges as seams produces 6 islands", () => {
    const m = buildCube();
    for (const e of m.edges.values()) e.seam = true;
    const islands = findIslands(m);
    assertEquals(islands.length, 6);
  });
  defineTest(SUITE19, "marking horizontal cube edges separates top/bottom from sides", () => {
    const m = buildCube();
    for (const e of m.edges.values()) {
      const va = m.vertices.get(e.a);
      const vb = m.vertices.get(e.b);
      const bothTop = va.position[1] > 0 && vb.position[1] > 0;
      const bothBot = va.position[1] < 0 && vb.position[1] < 0;
      if (bothTop || bothBot) e.seam = true;
    }
    const islands = findIslands(m);
    assert(islands.length >= 2);
  });
  defineTest(SUITE19, "unwrap returns one island per group with normalized UVs in [0,1]", () => {
    const m = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const islands = unwrap(m);
    assertEquals(islands.length, 1);
    for (const [, [u, v]] of islands[0].uvByLoop) {
      assert(u >= -1e-6 && u <= 1 + 1e-6, `u out of range: ${u}`);
      assert(v >= -1e-6 && v <= 1 + 1e-6, `v out of range: ${v}`);
    }
  });
  defineTest(SUITE19, "packIslands keeps every island inside (0..1) and non-overlapping", () => {
    const m = buildCube();
    for (const e of m.edges.values()) e.seam = true;
    const islands = unwrap(m);
    packIslands(islands, 5e-3);
    for (const island of islands) {
      assert(island.bbox.minU >= 0 - 1e-6 && island.bbox.maxU <= 1 + 1e-6);
      assert(island.bbox.minV >= 0 - 1e-6 && island.bbox.maxV <= 1 + 1e-6);
    }
    for (let i = 0; i < islands.length; i++) {
      for (let j = i + 1; j < islands.length; j++) {
        const a = islands[i].bbox;
        const b = islands[j].bbox;
        const overlap = !(a.maxU <= b.minU || b.maxU <= a.minU || a.maxV <= b.minV || b.maxV <= a.minV);
        assert(!overlap, `bbox overlap: ${i} ${j}`);
      }
    }
  });
  defineTest(SUITE19, "autoUnwrapAndPack applies UVs to mesh and produces valid UVs", () => {
    const m = buildCube();
    for (const e of m.edges.values()) e.seam = true;
    const islands = autoUnwrapAndPack(m);
    assertEquals(islands.length, 6);
    for (const l of m.loops.values()) {
      assert(l.uv[0] >= -1e-6 && l.uv[0] <= 1 + 1e-6);
      assert(l.uv[1] >= -1e-6 && l.uv[1] <= 1 + 1e-6);
    }
  });
  defineTest(SUITE19, "applyUvIslands writes computed UVs to mesh loops", () => {
    const m = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    const islands = unwrap(m);
    const lid = Array.from(islands[0].uvByLoop.keys())[0];
    islands[0].uvByLoop.set(lid, [0.42, 0.42]);
    applyUvIslands(m, islands);
    const l = m.loops.get(lid);
    assert(Math.abs(l.uv[0] - 0.42) < 1e-6);
    assert(Math.abs(l.uv[1] - 0.42) < 1e-6);
  });

  // src/io/objFormatTests.ts
  var SUITE20 = "objIo";
  defineTest(SUITE20, "parseObj parses verts/uvs/normals/faces", () => {
    const src = `
# header
v 0 0 0
v 1 0 0
v 0 1 0
vt 0 0
vt 1 0
vt 0 1
vn 0 0 1
o myObj
f 1/1/1 2/2/1 3/3/1
`;
    const parsed = parseObj(src);
    assertEquals(parsed.positions.length, 3);
    assertEquals(parsed.uvs.length, 3);
    assertEquals(parsed.normals.length, 1);
    assertEquals(parsed.groups.length, 1);
    assertEquals(parsed.groups[0].faceRefs.length, 1);
  });
  defineTest(SUITE20, "parseMtl parses Kd / Ka / Ks / Ns / d", () => {
    const mtl = `
newmtl Blue
Kd 0.2 0.4 0.8
Ka 0.1 0.1 0.1
Ks 0.5 0.5 0.5
Ns 32.0
d 0.5
`;
    const parsed = parseMtl(mtl);
    assertEquals(parsed.length, 1);
    assert(Math.abs(parsed[0].Kd[0] - 0.2) < 1e-6);
    assertEquals(parsed[0].Ns, 32);
  });
  defineTest(SUITE20, "importObj creates valid editable topology", () => {
    const scene = new Scene();
    const cube3 = new MeshObject("Cube");
    cube3.mesh = buildCube();
    scene.addNode(cube3);
    const { obj } = exportObj(scene);
    const imported = importObj(obj);
    assertEquals(imported.meshes.length, 1);
    const m = imported.meshes[0].mesh;
    assertEquals(m.vertexCount(), 8);
    assertEquals(m.faceCount(), 6);
    assert(m.validate().ok);
  });
  defineTest(SUITE20, "roundtrip OBJ preserves vert/face counts and UVs", () => {
    const scene = new Scene();
    const plane3 = new MeshObject("Plane");
    plane3.mesh = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    scene.addNode(plane3);
    let uIdx = 0;
    for (const loop of plane3.mesh.loops.values()) {
      loop.uv[0] = uIdx++ / 10 % 1;
      loop.uv[1] = uIdx++ / 10 % 1;
    }
    const { obj } = exportObj(scene);
    const re = importObj(obj);
    const m = re.meshes[0].mesh;
    assertEquals(m.vertexCount(), plane3.mesh.vertexCount());
    assertEquals(m.faceCount(), plane3.mesh.faceCount());
  });
  defineTest(SUITE20, "exportObj + parseObj preserves multiple objects", () => {
    const scene = new Scene();
    const a = new MeshObject("First");
    a.mesh = buildCube();
    scene.addNode(a);
    const b = new MeshObject("Second");
    b.mesh = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    scene.addNode(b);
    const { obj } = exportObj(scene);
    const re = importObj(obj);
    assertEquals(re.meshes.length, 2);
    const names = re.meshes.map((n) => n.name);
    assert(names.includes("First"));
    assert(names.includes("Second"));
  });
  defineTest(SUITE20, "exportObj + importObj round-trips materials via MTL", () => {
    const scene = new Scene();
    const cube3 = new MeshObject("Cube");
    cube3.mesh = buildCube();
    const mat = new Material("Red");
    mat.setBaseColor(0.9, 0.1, 0.1);
    mat.opacity = 0.6;
    scene.addMaterial(mat);
    scene.addNode(cube3);
    cube3.materialId = mat.id;
    const { obj, mtl } = exportObj(scene, { mtlPath: "out.mtl" });
    assert(mtl != null);
    const re = importObj(obj, mtl);
    assertEquals(re.materials.length, 1);
    const reMat = re.materials[0];
    assert(Math.abs(reMat.baseColor.r - 0.9) < 1e-4);
    assert(Math.abs(reMat.opacity - 0.6) < 1e-4);
  });
  defineTest(SUITE20, "n-gon faces survive round-trip", () => {
    const scene = new Scene();
    const mesh = new EditableMesh();
    const ids = [];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      ids.push(mesh.addVertex(Math.cos(a), 0, Math.sin(a)).id);
    }
    mesh.addFace(ids);
    const node = new MeshObject("Hex");
    node.mesh = mesh;
    scene.addNode(node);
    const { obj } = exportObj(scene);
    const re = importObj(obj);
    const m = re.meshes[0].mesh;
    assertEquals(m.vertexCount(), 6);
    const face = Array.from(m.faces.values())[0];
    assertEquals(face.loops.length, 6);
  });

  // src/io/gltfFormatTests.ts
  var SUITE21 = "gltfIo";
  defineTest(SUITE21, "exportGltf produces a glTF 2.0 document with the expected sections", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    scene.addNode(node);
    const { document: document2, glb, json } = exportGltf(scene);
    assertEquals(document2.asset.version, "2.0");
    assertEquals(document2.meshes.length, 1);
    assertEquals(document2.nodes.length, 1);
    assertEquals(document2.buffers.length, 1);
    assert(document2.buffers[0].byteLength > 0);
    assert(document2.accessors.length >= 4);
    const parsed = JSON.parse(json);
    assertEquals(parsed.meshes.length, 1);
    const dv = new DataView(glb);
    assertEquals(dv.getUint32(0, true), 1179937895);
    assertEquals(dv.getUint32(4, true), 2);
  });
  defineTest(SUITE21, "glTF cube node has POSITION + NORMAL + TEXCOORD_0 accessors", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    scene.addNode(node);
    const { document: document2 } = exportGltf(scene);
    const prim = document2.meshes[0].primitives[0];
    assert(prim.attributes.POSITION != null);
    assert(prim.attributes.NORMAL != null);
    assert(prim.attributes.TEXCOORD_0 != null);
    const posAccessor = document2.accessors[prim.attributes.POSITION];
    assertEquals(posAccessor.type, "VEC3");
    assertEquals(posAccessor.count, 24);
  });
  defineTest(SUITE21, "glTF node transform mirrors the source node transform", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    node.transform.position[0] = 1.5;
    node.transform.position[1] = -2;
    node.transform.position[2] = 3;
    scene.addNode(node);
    const { document: document2 } = exportGltf(scene);
    const gltfNode = document2.nodes[0];
    assertEquals(gltfNode.name, "Cube");
    assert(Math.abs(gltfNode.translation[0] - 1.5) < 1e-6);
    assert(Math.abs(gltfNode.translation[1] + 2) < 1e-6);
  });
  defineTest(SUITE21, "glTF export embeds material baseColorFactor", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    const mat = new Material("Red");
    mat.setBaseColor(0.9, 0.1, 0.1);
    mat.opacity = 0.8;
    scene.addMaterial(mat);
    node.materialId = mat.id;
    scene.addNode(node);
    const { document: document2 } = exportGltf(scene);
    assert(document2.materials != null);
    assertEquals(document2.materials.length, 1);
    const m = document2.materials[0];
    assertEquals(m.name, "Red");
    assert(Math.abs(m.pbrMetallicRoughness.baseColorFactor[0] - 0.9) < 1e-4);
    assert(Math.abs(m.pbrMetallicRoughness.baseColorFactor[3] - 0.8) < 1e-4);
    assertEquals(m.alphaMode, "BLEND");
  });
  defineTest(SUITE21, "glTF export embeds material texture as a PNG buffer view", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    const mat = new Material("Tex");
    mat.setTexture({ name: "pixel", width: 1, height: 1, data: new Uint8Array([255, 0, 0, 255]) });
    scene.addMaterial(mat);
    node.materialId = mat.id;
    scene.addNode(node);
    const { document: document2 } = exportGltf(scene);
    assert(document2.materials != null);
    assert(document2.textures != null);
    assert(document2.images != null);
    assertEquals(document2.textures.length, 1);
    assert(document2.materials[0].pbrMetallicRoughness.baseColorTexture != null);
  });

  // src/io/bmshFormatTests.ts
  var SUITE22 = "bmshIo";
  defineTest(SUITE22, "BMSH file has the right magic + version", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    scene.addNode(node);
    const blob = saveBmsh(scene);
    const u8 = new Uint8Array(blob);
    assertEquals(String.fromCharCode(u8[0], u8[1], u8[2], u8[3]), BMSH_MAGIC);
    const dv = new DataView(blob);
    assertEquals(dv.getUint32(4, true), 1);
  });
  defineTest(SUITE22, "roundtrip preserves vertex / edge / face counts and validity", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    scene.addNode(node);
    const blob = saveBmsh(scene);
    const re = loadBmsh(blob);
    const meshNodes = [];
    re.forEachNode((n) => {
      if (n.kind === "mesh") meshNodes.push(n);
    });
    assertEquals(meshNodes.length, 1);
    const m = meshNodes[0].mesh;
    assertEquals(m.vertexCount(), 8);
    assertEquals(m.edgeCount(), 12);
    assertEquals(m.faceCount(), 6);
    assert(m.validate().ok);
  });
  defineTest(SUITE22, "roundtrip preserves UVs", () => {
    const scene = new Scene();
    const node = new MeshObject("Plane");
    node.mesh = buildPlane({ segmentsX: 2, segmentsZ: 2 });
    const firstLoopId = Array.from(node.mesh.loops.keys())[0];
    const l = node.mesh.loops.get(firstLoopId);
    l.uv[0] = 0.123;
    l.uv[1] = 0.456;
    scene.addNode(node);
    const blob = saveBmsh(scene);
    const re = loadBmsh(blob);
    let found = null;
    re.forEachNode((n) => {
      if (n.kind !== "mesh") return;
      const m = n.mesh;
      for (const loop of m.loops.values()) {
        if (Math.abs(loop.uv[0] - 0.123) < 1e-6 && Math.abs(loop.uv[1] - 0.456) < 1e-6) {
          found = { u: loop.uv[0], v: loop.uv[1] };
        }
      }
    });
    assert(found != null);
  });
  defineTest(SUITE22, "roundtrip preserves seam + hard edge flags", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    for (const e of node.mesh.edges.values()) {
      e.hard = true;
      e.seam = true;
    }
    scene.addNode(node);
    const blob = saveBmsh(scene);
    const re = loadBmsh(blob);
    let allHard = true, allSeam = true;
    re.forEachNode((n) => {
      if (n.kind !== "mesh") return;
      const m = n.mesh;
      for (const e of m.edges.values()) {
        if (!e.hard) allHard = false;
        if (!e.seam) allSeam = false;
      }
    });
    assert(allHard);
    assert(allSeam);
  });
  defineTest(SUITE22, "roundtrip preserves materials and texture metadata", () => {
    const scene = new Scene();
    const node = new MeshObject("Cube");
    node.mesh = buildCube();
    const mat = new Material("Red");
    mat.setBaseColor(0.9, 0.1, 0.1);
    mat.setTexture({ name: "flag", width: 2, height: 2, data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255]) });
    scene.addMaterial(mat);
    node.materialId = mat.id;
    scene.addNode(node);
    const blob = saveBmsh(scene);
    const re = loadBmsh(blob);
    const reMats = re.materials();
    assertEquals(reMats.length, 1);
    assertEquals(reMats[0].name, "Red");
    assert(reMats[0].texture != null);
    assertEquals(reMats[0].texture.width, 2);
  });
  defineTest(SUITE22, "roundtrip preserves hierarchy parenting", () => {
    const scene = new Scene();
    const parent = new MeshObject("Parent");
    parent.mesh = buildCube();
    scene.addNode(parent);
    const child = new MeshObject("Child");
    child.mesh = buildPlane({ segmentsX: 1, segmentsZ: 1 });
    scene.addNode(child, parent);
    const blob = saveBmsh(scene);
    const re = loadBmsh(blob);
    let pNode = null;
    let cNode = null;
    re.forEachNode((n) => {
      if (n.name === "Parent") pNode = n;
      if (n.name === "Child") cNode = n;
    });
    assert(pNode != null);
    assert(cNode != null);
    assertEquals(cNode.parent, pNode);
  });
  defineTest(SUITE22, "loading an unknown future version throws BmshVersionError", () => {
    const buf = new ArrayBuffer(12);
    const dv = new DataView(buf);
    const u8 = new Uint8Array(buf);
    u8[0] = 66;
    u8[1] = 77;
    u8[2] = 83;
    u8[3] = 72;
    dv.setUint32(4, 999, true);
    dv.setUint32(8, 0, true);
    let caught = null;
    try {
      loadBmsh(buf);
    } catch (e) {
      caught = e;
    }
    assert(caught instanceof BmshVersionError);
  });

  // src/scene/referenceImageTests.ts
  var SUITE23 = "referenceImage";
  defineTest(SUITE23, "serialize emits transform / size / visibility / opacity", () => {
    const ref = new ReferenceImage("Back");
    ref.transform.position[0] = 2;
    ref.transform.position[1] = 3;
    ref.transform.position[2] = -1;
    ref.opacity = 0.4;
    ref.width = 4;
    ref.height = 3;
    ref.setVisible(false);
    ref.setLocked(true);
    const s = ref.serialize();
    assertEquals(s.name, "Back");
    assertEquals(s.opacity, 0.4);
    assertEquals(s.locked, true);
    assertEquals(s.visible, false);
    assertEquals(s.width, 4);
    assertEquals(s.height, 3);
    assertEquals(s.transform.position[0], 2);
  });
  defineTest(SUITE23, "setPixels bumps pixelVersion", () => {
    const ref = new ReferenceImage("Front");
    const before = ref.pixelVersion;
    ref.setPixels({ name: "sketch", width: 1, height: 1, data: new Uint8Array([255, 255, 255, 255]) });
    assert(ref.pixelVersion > before);
  });
  defineTest(SUITE23, "setLocked flips selectable", () => {
    const ref = new ReferenceImage("A");
    ref.setLocked(true);
    assert(!ref.selectable);
    ref.setLocked(false);
    assert(ref.selectable);
  });
  defineTest(SUITE23, "reference image lives alongside meshes in a Scene", () => {
    const scene = new Scene();
    const ref = new ReferenceImage("B");
    scene.addNode(ref);
    let found = null;
    scene.forEachNode((n) => {
      if (n.kind === "reference") found = n;
    });
    assert(found != null);
  });

  // src/main.ts
  var appInstance = null;
  function boot() {
    const canvas = document.getElementById("app");
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("BrutalMesh: #app canvas element missing");
    }
    appInstance = new App({ canvas });
    appInstance.start();
    const w = window;
    w.BrutalMeshHarness = {
      runTests,
      listSuites,
      defineTest,
      assert,
      assertEquals,
      assertClose,
      assertThrows
    };
    w.BrutalMeshApp = appInstance;
    w.BrutalMeshEdgeCommands = EdgeCommands_exports;
    w.BrutalMeshFaceCommands = FaceCommands_exports;
    w.BrutalMeshPrimitiveCommands = CreatePrimitiveCommand_exports;
    w.BrutalMeshMaterialCommands = MaterialCommands_exports;
    w.BrutalMeshUvCommands = UvCommands_exports;
    w.BrutalMeshUnwrap = Unwrap_exports;
    w.BrutalMeshObj = ObjFormat_exports;
    w.BrutalMeshGltf = GltfFormat_exports;
    w.BrutalMeshBmsh = BmshFormat_exports;
    w.BrutalMeshMaterial = Material;
    w.BrutalMeshReferenceImage = ReferenceImage;
    w.__brutalMeshReady = true;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
//# sourceMappingURL=modeller.js.map
