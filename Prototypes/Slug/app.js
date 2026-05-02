// src/shared/types.ts
function rectContains(rect, x, y) {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function uid(prefix) {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}_${Date.now().toString(36)}_${random[0].toString(36)}${random[1].toString(36)}`;
}
var AppError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
};

// src/assistant/chat.ts
var LocalAssistantTransport = class {
  async send(input, context, onDelta, signal) {
    const lines = [
      `I received: ${input.trim() || "(empty message)"}`,
      context.activePath ? `Active file: ${context.activePath}` : "No active file.",
      context.selectedText ? `Selection length: ${context.selectedText.length} characters.` : "No selected text.",
      "I can inspect files, search the virtual workspace, and propose edits once you ask for a concrete change."
    ];
    for (const part of lines.join("\n").match(/.{1,24}|\n/g) ?? []) {
      if (signal.aborted) return;
      onDelta(part);
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  }
};
var OpenAIResponsesTransport = class {
  constructor(apiKey, model = "gpt-5.5") {
    this.apiKey = apiKey;
    this.model = model;
  }
  apiKey;
  model;
  async send(input, context, onDelta, signal) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        instructions: "You are an assistant inside a browser code editor. Be concise and refer to provided context.",
        input: [{
          role: "user",
          content: [{
            type: "input_text",
            text: `${input}

Context:
${JSON.stringify(context, null, 2)}`
          }]
        }],
        stream: true,
        store: false
      }),
      signal
    });
    if (!response.ok || !response.body) throw new Error(`OpenAI request failed: ${response.status}`);
    await parseResponsesStream(response.body, onDelta, signal);
  }
};
var ChatHarness = class {
  constructor(vfs) {
    this.vfs = vfs;
  }
  vfs;
  messages = [
    {
      id: uid("msg"),
      role: "system",
      text: "Chat is running locally by default. Configure an OpenAI key in localStorage as slug.openaiKey to use Responses API transport.",
      at: Date.now()
    }
  ];
  abortController = null;
  get running() {
    return this.abortController !== null;
  }
  cancel() {
    this.abortController?.abort();
  }
  async send(input, activeDoc, openDocs) {
    if (!input.trim() || this.running) return;
    const context = {
      selectedText: activeDoc?.selectedText() ?? "",
      openPaths: openDocs.map((doc) => doc.path ?? "(untitled)")
    };
    if (activeDoc?.path) context.activePath = activeDoc.path;
    this.messages.push({ id: uid("msg"), role: "user", text: input, at: Date.now() });
    const assistant = { id: uid("msg"), role: "assistant", text: "", at: Date.now() };
    this.messages.push(assistant);
    const key = localStorage.getItem("slug.openaiKey")?.trim();
    const transport = key ? new OpenAIResponsesTransport(key) : new LocalAssistantTransport();
    const controller = new AbortController();
    this.abortController = controller;
    try {
      await transport.send(input, context, (text) => {
        assistant.text += text;
      }, controller.signal);
    } catch (error) {
      assistant.text += `
Request failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      this.abortController = null;
      await this.persist();
    }
  }
  async persist() {
    await this.vfs.writeFile("/.slug-chat.json", JSON.stringify(this.messages, null, 2), "application/json");
  }
};
async function parseResponsesStream(stream, onDelta, signal) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const data = raw.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
      if (!data || data === "[DONE]") continue;
      const parsed = JSON.parse(data);
      if (parsed.type === "response.output_text.delta" && typeof parsed.delta === "string") onDelta(parsed.delta);
      else if (parsed.type === "response.completed") return;
      else if (typeof parsed.text === "string") onDelta(parsed.text);
    }
  }
}

// src/vfs/path.ts
function normalizePath(input) {
  const parts = [];
  const raw = input.replaceAll("\\", "/").split("/");
  for (const part of raw) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return `/${parts.join("/")}`;
}
function dirname(path) {
  const p = normalizePath(path);
  if (p === "/") return "/";
  const idx = p.lastIndexOf("/");
  return idx <= 0 ? "/" : p.slice(0, idx);
}
function basename(path) {
  const p = normalizePath(path);
  if (p === "/") return "/";
  return p.slice(p.lastIndexOf("/") + 1);
}
function joinPath(...parts) {
  return normalizePath(parts.join("/"));
}
function comparePath(a, b) {
  return a.localeCompare(b, void 0, { sensitivity: "base" });
}

// src/editor/document.ts
var UNDO_MERGE_TIMEOUT_MS = 300;
var MAX_UNDO_COMMANDS = 1e4;
var TextDocument = class {
  id;
  path;
  lines;
  revision = 0;
  savedRevision = 0;
  syntaxId = "plain";
  selection = { anchor: { line: 0, col: 0 }, head: { line: 0, col: 0 } };
  undoStack = [];
  redoStack = [];
  undoGroup = 1;
  lastEditKind = null;
  constructor(path, text) {
    this.id = uid("doc");
    this.path = path;
    this.lines = splitText(text);
    this.syntaxId = syntaxFromPath(path);
  }
  get dirty() {
    return this.revision !== this.savedRevision;
  }
  getText() {
    return this.lines.join("\n");
  }
  markSaved() {
    this.savedRevision = this.revision;
  }
  setSelection(anchor, head = anchor) {
    this.selection = { anchor: this.clampPosition(anchor), head: this.clampPosition(head) };
  }
  getOrderedSelection() {
    return comparePosition(this.selection.anchor, this.selection.head) <= 0 ? { start: this.selection.anchor, end: this.selection.head } : { start: this.selection.head, end: this.selection.anchor };
  }
  hasSelection() {
    return comparePosition(this.selection.anchor, this.selection.head) !== 0;
  }
  selectedText() {
    if (!this.hasSelection()) return "";
    const { start, end } = this.getOrderedSelection();
    if (start.line === end.line) {
      return this.lines[start.line].slice(start.col, end.col);
    }
    const parts = [this.lines[start.line].slice(start.col)];
    for (let line = start.line + 1; line < end.line; line++) parts.push(this.lines[line]);
    parts.push(this.lines[end.line].slice(0, end.col));
    return parts.join("\n");
  }
  replaceSelection(text, _label = "insert") {
    const time = performance.now();
    const group = this.nextUndoGroup(editKindForInsert(text), time, this.undoStack);
    this.redoStack.length = 0;
    const { start, end } = this.getOrderedSelection();
    let pos = start;
    if (comparePosition(start, end) !== 0) {
      this.rawRemove(start, end, this.undoStack, time, group);
      pos = start;
    }
    if (text) pos = this.rawInsert(pos, text, this.undoStack, time, group);
    this.setSelection(pos);
  }
  deleteBackward(unit = "char") {
    if (this.hasSelection()) {
      this.replaceSelection("", "delete");
      return;
    }
    const pos = this.selection.head;
    if (pos.line === 0 && pos.col === 0) return;
    let start;
    if (unit === "line") {
      start = { line: pos.line, col: 0 };
    } else if (unit === "word") {
      start = this.wordBoundaryBackward(pos);
    } else if (pos.col > 0) {
      start = { line: pos.line, col: previousCodePointCol(this.lines[pos.line], pos.col) };
    } else {
      start = { line: pos.line - 1, col: this.lines[pos.line - 1].length };
    }
    const time = performance.now();
    const group = this.nextUndoGroup("delete", time, this.undoStack);
    this.redoStack.length = 0;
    this.rawRemove(start, pos, this.undoStack, time, group);
    this.setSelection(start);
  }
  deleteForward(unit = "char") {
    if (this.hasSelection()) {
      this.replaceSelection("", "delete");
      return;
    }
    const pos = this.selection.head;
    const lastLine = this.lines.length - 1;
    if (pos.line === lastLine && pos.col === this.lines[lastLine].length) return;
    let end;
    if (unit === "line") {
      end = { line: pos.line, col: this.lines[pos.line].length };
    } else if (unit === "word") {
      end = this.wordBoundaryForward(pos);
    } else if (pos.col < this.lines[pos.line].length) {
      end = { line: pos.line, col: nextCodePointCol(this.lines[pos.line], pos.col) };
    } else {
      end = { line: pos.line + 1, col: 0 };
    }
    const time = performance.now();
    const group = this.nextUndoGroup("delete", time, this.undoStack);
    this.redoStack.length = 0;
    this.rawRemove(pos, end, this.undoStack, time, group);
    this.setSelection(pos);
  }
  move(command, extend = false) {
    const current = this.selection.head;
    const next = this.resolveMove(current, command);
    this.selection = extend ? { anchor: this.selection.anchor, head: next } : { anchor: next, head: next };
  }
  selectAll() {
    const endLine = this.lines.length - 1;
    this.setSelection({ line: 0, col: 0 }, { line: endLine, col: this.lines[endLine].length });
  }
  indentSelectedLines(indent = "  ") {
    if (!this.hasSelection()) {
      this.replaceSelection(indent, "indent");
      return;
    }
    this.redoStack.length = 0;
    const time = performance.now();
    const group = this.nextUndoGroup("delimiter", time, this.undoStack);
    const range = this.selectedLineRange();
    const selection = cloneSelection(this.selection);
    for (let line = range.start; line <= range.end; line++) this.rawInsert({ line, col: 0 }, indent, this.undoStack, time, group);
    this.selection = selection;
    this.selection = {
      anchor: adjustPositionByLinePrefix(this.selection.anchor, range.start, range.end, indent.length),
      head: adjustPositionByLinePrefix(this.selection.head, range.start, range.end, indent.length)
    };
  }
  unindentSelectedLines(indentWidth = 2) {
    const range = this.hasSelection() ? this.selectedLineRange() : { start: this.selection.head.line, end: this.selection.head.line };
    const removals = /* @__PURE__ */ new Map();
    for (let line = range.start; line <= range.end; line++) {
      const text = this.lines[line];
      const count = text.startsWith("	") ? 1 : Math.min(indentWidth, leadingSpaces(text));
      if (count > 0) removals.set(line, count);
    }
    if (removals.size === 0) return;
    this.redoStack.length = 0;
    const time = performance.now();
    const group = this.nextUndoGroup("delimiter", time, this.undoStack);
    const selection = cloneSelection(this.selection);
    for (const [line, count] of removals) this.rawRemove({ line, col: 0 }, { line, col: count }, this.undoStack, time, group);
    this.selection = selection;
    this.selection = {
      anchor: adjustPositionByLineRemovals(this.selection.anchor, removals),
      head: adjustPositionByLineRemovals(this.selection.head, removals)
    };
  }
  undo() {
    this.popUndo(this.undoStack, this.redoStack);
  }
  redo() {
    this.popUndo(this.redoStack, this.undoStack);
  }
  lineCount() {
    return this.lines.length;
  }
  clampPosition(pos) {
    const line = clamp(Math.trunc(pos.line), 0, this.lines.length - 1);
    const col = clamp(Math.trunc(pos.col), 0, this.lines[line].length);
    return { line, col };
  }
  resolveMove(pos, command) {
    switch (command) {
      case "left":
        return pos.col > 0 ? { line: pos.line, col: previousCodePointCol(this.lines[pos.line], pos.col) } : this.clampPosition({ line: pos.line - 1, col: Number.MAX_SAFE_INTEGER });
      case "right":
        return pos.col < this.lines[pos.line].length ? { line: pos.line, col: nextCodePointCol(this.lines[pos.line], pos.col) } : this.clampPosition({ line: pos.line + 1, col: 0 });
      case "up":
        return this.clampPosition({ line: pos.line - 1, col: pos.col });
      case "down":
        return this.clampPosition({ line: pos.line + 1, col: pos.col });
      case "lineStart":
        return { line: pos.line, col: 0 };
      case "lineEnd":
        return { line: pos.line, col: this.lines[pos.line].length };
      case "docStart":
        return { line: 0, col: 0 };
      case "docEnd": {
        const line = this.lines.length - 1;
        return { line, col: this.lines[line].length };
      }
      case "wordLeft":
        return this.wordBoundaryBackward(pos);
      case "wordRight":
        return this.wordBoundaryForward(pos);
    }
  }
  selectedLineRange() {
    const ordered = this.getOrderedSelection();
    const end = ordered.end.col === 0 && ordered.end.line > ordered.start.line ? ordered.end.line - 1 : ordered.end.line;
    return { start: ordered.start.line, end };
  }
  wordBoundaryBackward(pos) {
    if (pos.col === 0) return this.clampPosition({ line: pos.line - 1, col: Number.MAX_SAFE_INTEGER });
    const line = this.lines[pos.line];
    let col = pos.col;
    while (col > 0 && /\s/.test(line.charAt(col - 1))) col--;
    while (col > 0 && /\w/.test(line.charAt(col - 1))) col--;
    return { line: pos.line, col };
  }
  wordBoundaryForward(pos) {
    const line = this.lines[pos.line];
    if (pos.col >= line.length) return this.clampPosition({ line: pos.line + 1, col: 0 });
    let col = pos.col;
    while (col < line.length && /\s/.test(line.charAt(col))) col++;
    while (col < line.length && /\w/.test(line.charAt(col))) col++;
    return { line: pos.line, col };
  }
  rawInsert(pos, text, undoStack, time, group) {
    pos = this.clampPosition(pos);
    const before = this.lines[pos.line].slice(0, pos.col);
    const after = this.lines[pos.line].slice(pos.col);
    const insertLines = splitText(text);
    let end;
    if (insertLines.length === 1) {
      this.lines.splice(pos.line, 1, before + insertLines[0] + after);
      end = { line: pos.line, col: before.length + insertLines[0].length };
    } else {
      const first = before + insertLines[0];
      const last = insertLines[insertLines.length - 1] + after;
      const middle = insertLines.slice(1, -1);
      this.lines.splice(pos.line, 1, first, ...middle, last);
      end = { line: pos.line + insertLines.length - 1, col: insertLines[insertLines.length - 1].length };
    }
    if (undoStack) {
      this.pushUndoCommand(undoStack, { type: "selection", time, group, selection: cloneSelection(this.selection) });
      this.pushUndoCommand(undoStack, { type: "remove", time, group, start: { ...pos }, end: { ...end } });
    }
    this.setSelection(end);
    this.bump();
    return end;
  }
  rawRemove(start, end, undoStack, time, group) {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    if (comparePosition(start, end) > 0) [start, end] = [end, start];
    if (comparePosition(start, end) === 0) return start;
    const text = this.textInRange(start, end);
    if (undoStack) {
      this.pushUndoCommand(undoStack, { type: "selection", time, group, selection: cloneSelection(this.selection) });
      this.pushUndoCommand(undoStack, { type: "insert", time, group, pos: { ...start }, text });
    }
    const before = this.lines[start.line].slice(0, start.col);
    const after = this.lines[end.line].slice(end.col);
    this.lines.splice(start.line, end.line - start.line + 1, before + after);
    if (this.lines.length === 0) this.lines.push("");
    this.setSelection(start);
    this.bump();
    return start;
  }
  textInRange(start, end) {
    if (start.line === end.line) return this.lines[start.line].slice(start.col, end.col);
    const parts = [this.lines[start.line].slice(start.col)];
    for (let line = start.line + 1; line < end.line; line++) parts.push(this.lines[line]);
    parts.push(this.lines[end.line].slice(0, end.col));
    return parts.join("\n");
  }
  nextUndoGroup(kind, time, stack) {
    const previous = stack[stack.length - 1];
    const previousKind = this.lastEditKind;
    const merge = previous && previousKind === kind && kind !== "delimiter" && Math.abs(time - previous.time) < UNDO_MERGE_TIMEOUT_MS;
    if (!merge) this.undoGroup++;
    this.lastEditKind = kind;
    return this.undoGroup;
  }
  popUndo(source, target) {
    let cmd = source.pop();
    if (!cmd) return;
    this.lastEditKind = null;
    while (cmd) {
      this.applyUndoCommand(cmd, target);
      const next = source[source.length - 1];
      if (!next || next.group !== cmd.group) break;
      cmd = source.pop();
    }
  }
  applyUndoCommand(cmd, target) {
    if (cmd.type === "selection") {
      this.selection = cloneSelection(cmd.selection);
      return;
    }
    if (cmd.type === "insert") {
      this.rawInsert(cmd.pos, cmd.text, target, cmd.time, cmd.group);
      return;
    }
    this.rawRemove(cmd.start, cmd.end, target, cmd.time, cmd.group);
  }
  pushUndoCommand(stack, command) {
    stack.push(command);
    while (stack.length > MAX_UNDO_COMMANDS) stack.shift();
  }
  bump() {
    this.revision++;
  }
};
function splitText(text) {
  const normalized = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  return normalized.split("\n");
}
function comparePosition(a, b) {
  if (a.line !== b.line) return a.line - b.line;
  return a.col - b.col;
}
function cloneSelection(selection) {
  return {
    anchor: { ...selection.anchor },
    head: { ...selection.head }
  };
}
function leadingSpaces(text) {
  let count = 0;
  while (count < text.length && text.charAt(count) === " ") count++;
  return count;
}
function adjustPositionByLinePrefix(pos, startLine, endLine, width) {
  if (pos.line < startLine || pos.line > endLine) return { ...pos };
  return { line: pos.line, col: pos.col + width };
}
function adjustPositionByLineRemovals(pos, removals) {
  const count = removals.get(pos.line);
  if (!count) return { ...pos };
  return { line: pos.line, col: Math.max(0, pos.col - count) };
}
function editKindForInsert(text) {
  if (text === " ") return "space";
  if (text.length !== 1 || /\s/.test(text)) return "delimiter";
  return "word";
}
function previousCodePointCol(line, col) {
  if (col <= 0) return 0;
  const code = line.charCodeAt(col - 1);
  return code >= 56320 && code <= 57343 ? Math.max(0, col - 2) : col - 1;
}
function nextCodePointCol(line, col) {
  if (col >= line.length) return line.length;
  const code = line.charCodeAt(col);
  return code >= 55296 && code <= 56319 ? Math.min(line.length, col + 2) : col + 1;
}
function syntaxFromPath(path) {
  if (!path) return "plain";
  if (path.match(/\.(ts|tsx|js|jsx|mjs)$/i)) return "javascript";
  if (path.match(/\.(c|cpp|cc|h|hpp)$/i)) return "cpp";
  if (path.match(/\.json$/i)) return "json";
  if (path.match(/\.md$/i)) return "markdown";
  if (path.match(/\.lua$/i)) return "lua";
  if (path.match(/\.py$/i)) return "python";
  return "plain";
}

// src/editor/document_store.ts
var DocumentStore = class {
  constructor(vfs) {
    this.vfs = vfs;
  }
  vfs;
  docsById = /* @__PURE__ */ new Map();
  docsByPath = /* @__PURE__ */ new Map();
  all() {
    return [...this.docsById.values()];
  }
  get(id) {
    return this.docsById.get(id);
  }
  getByPath(path) {
    return this.docsByPath.get(normalizePath(path));
  }
  async open(path) {
    const normalized = normalizePath(path);
    const existing = this.docsByPath.get(normalized);
    if (existing) return existing;
    const doc = new TextDocument(normalized, await this.vfs.readText(normalized));
    doc.markSaved();
    this.docsById.set(doc.id, doc);
    this.docsByPath.set(normalized, doc);
    return doc;
  }
  createUntitled(text = "") {
    const doc = new TextDocument(void 0, text);
    this.docsById.set(doc.id, doc);
    return doc;
  }
  async save(doc) {
    if (!doc.path) {
      doc.path = `/untitled-${Date.now().toString(36)}.txt`;
      this.docsByPath.set(doc.path, doc);
    }
    await this.vfs.writeFile(doc.path, doc.getText(), "text/plain");
    doc.markSaved();
  }
  renamePath(oldPath, newPath) {
    const oldNormalized = normalizePath(oldPath);
    const newNormalized = normalizePath(newPath);
    const doc = this.docsByPath.get(oldNormalized);
    if (!doc) return void 0;
    this.docsByPath.delete(oldNormalized);
    doc.path = newNormalized;
    doc.syntaxId = syntaxFromPath(newNormalized);
    this.docsByPath.set(newNormalized, doc);
    return doc;
  }
  removePath(path) {
    const normalized = normalizePath(path);
    const doc = this.docsByPath.get(normalized);
    if (!doc) return void 0;
    this.docsByPath.delete(normalized);
    this.docsById.delete(doc.id);
    return doc;
  }
};

// src/editor/highlighter.ts
var commonRules = [
  { type: "comment", pattern: /^\/\/.*/ },
  { type: "comment", pattern: /^#.*/ },
  { type: "string", pattern: /^"([^"\\]|\\.)*"/ },
  { type: "string", pattern: /^'([^'\\]|\\.)*'/ },
  { type: "string", pattern: /^`([^`\\]|\\.)*`/ },
  { type: "number", pattern: /^\b\d+(?:\.\d+)?\b/ },
  { type: "operator", pattern: /^[+\-*/%=!<>:&|^~.,;()[\]{}]+/ }
];
var keywords = /* @__PURE__ */ new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "def",
  "default",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "local",
  "nil",
  "null",
  "public",
  "private",
  "return",
  "static",
  "struct",
  "switch",
  "then",
  "true",
  "try",
  "type",
  "var",
  "void",
  "while",
  "yield"
]);
var typeWords = /* @__PURE__ */ new Set(["string", "number", "boolean", "object", "Promise", "Array", "Record", "void"]);
var Highlighter = class {
  tokenizeLine(text, syntaxId) {
    if (syntaxId === "markdown") return tokenizeMarkdown(text);
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      const rest = text.slice(i);
      if (/^\s+/.test(rest)) {
        const match = rest.match(/^\s+/)[0];
        tokens.push({ type: "normal", text: match });
        i += match.length;
        continue;
      }
      const rule = commonRules.find((candidate) => candidate.pattern.test(rest));
      if (rule) {
        const match = rest.match(rule.pattern)[0];
        tokens.push({ type: rule.type, text: match });
        i += match.length;
        continue;
      }
      const word = rest.match(/^[A-Za-z_$][A-Za-z0-9_$]*/)?.[0];
      if (word) {
        const nextChar = text.charAt(i + word.length);
        const type = keywords.has(word) ? "keyword" : typeWords.has(word) ? "type" : nextChar === "(" ? "function" : "normal";
        tokens.push({ type, text: word });
        i += word.length;
        continue;
      }
      tokens.push({ type: "normal", text: rest.charAt(0) });
      i++;
    }
    return mergeTokens(tokens);
  }
};
function tokenizeMarkdown(text) {
  if (/^\s*#/.test(text)) return [{ type: "keyword", text }];
  if (/^\s*[-*]\s/.test(text)) return [{ type: "operator", text: text.match(/^\s*[-*]\s/)[0] }, { type: "normal", text: text.replace(/^\s*[-*]\s/, "") }];
  return mergeTokens([{ type: "normal", text }]);
}
function mergeTokens(tokens) {
  const result = [];
  for (const token of tokens) {
    const last = result[result.length - 1];
    if (last && last.type === token.type) last.text += token.text;
    else result.push({ ...token });
  }
  return result;
}

// src/platform/drag_drop.ts
async function importDataTransfer(vfs, items, onProgress) {
  const progress = { files: 0, dirs: 0, bytes: 0, currentPath: "/" };
  for (const item of Array.from(items)) {
    if (item.kind !== "file") continue;
    if (item.getAsFileSystemHandle) {
      const handle = await item.getAsFileSystemHandle();
      await importHandle(vfs, handle, "/", progress, onProgress);
      continue;
    }
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      await importEntry(vfs, entry, "/", progress, onProgress);
      continue;
    }
    const file = item.getAsFile();
    if (file) await importFile(vfs, file, joinPath("/", file.name), progress, onProgress);
  }
  return progress;
}
async function importFileList(vfs, files, onProgress) {
  const progress = { files: 0, dirs: 0, bytes: 0, currentPath: "/" };
  for (const file of Array.from(files)) {
    const relative = file.webkitRelativePath || file.name;
    await importFile(vfs, file, normalizePath(`/${relative}`), progress, onProgress);
  }
  return progress;
}
async function importHandle(vfs, handle, base, progress, onProgress) {
  const path = joinPath(base, handle.name);
  if (handle.kind === "directory") {
    await vfs.mkdir(path);
    progress.dirs++;
    progress.currentPath = path;
    onProgress?.({ ...progress });
    const directory = handle;
    for await (const child of directory.values()) {
      await importHandle(vfs, child, path, progress, onProgress);
    }
  } else {
    const file = await handle.getFile();
    await importFile(vfs, file, path, progress, onProgress);
  }
}
async function importEntry(vfs, entry, base, progress, onProgress) {
  const path = joinPath(base, entry.name);
  if (entry.isDirectory && entry.createReader) {
    await vfs.mkdir(path);
    progress.dirs++;
    progress.currentPath = path;
    onProgress?.({ ...progress });
    const reader = entry.createReader();
    while (true) {
      const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
      if (entries.length === 0) break;
      for (const child of entries) await importEntry(vfs, child, path, progress, onProgress);
    }
  } else if (entry.isFile && entry.file) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    await importFile(vfs, file, path, progress, onProgress);
  }
}
async function importFile(vfs, file, path, progress, onProgress) {
  await vfs.writeFile(path, new Uint8Array(await file.arrayBuffer()), file.type || guessMime(path));
  progress.files++;
  progress.bytes += file.size;
  progress.currentPath = path;
  onProgress?.({ ...progress });
}
function guessMime(path) {
  return path.match(/\.(ts|js|json|md|txt|css|html|lua|cpp|c|h|hpp)$/i) ? "text/plain" : "application/octet-stream";
}

// src/platform/input_bridge.ts
var InputBridge = class {
  constructor(root) {
    this.root = root;
    this.textarea = document.createElement("textarea");
    this.textarea.className = "input-bridge";
    this.textarea.autocapitalize = "off";
    this.textarea.autocomplete = "off";
    this.textarea.spellcheck = false;
    this.textarea.inputMode = "text";
    this.textarea.setAttribute("autocorrect", "off");
    this.root.appendChild(this.textarea);
    this.resetTextareaSentinel();
    this.install();
  }
  root;
  textarea;
  activeTarget = null;
  composing = false;
  compositionText = "";
  focusEditor(target, caretRect) {
    this.activeTarget = target;
    if (caretRect) this.placeNearCaret(caretRect);
    this.textarea.focus({ preventScroll: true });
    this.resetTextareaSentinel();
  }
  blur() {
    this.activeTarget = null;
    this.textarea.blur();
  }
  syncSelectionForClipboard(text) {
    if (this.composing) return;
    this.textarea.focus({ preventScroll: true });
    if (!text) {
      this.resetTextareaSentinel();
      return;
    }
    this.textarea.value = text;
    this.textarea.setSelectionRange(0, text.length);
  }
  resetTextareaSentinel() {
    this.textarea.value = "\n";
    this.textarea.setSelectionRange(1, 1);
  }
  install() {
    this.textarea.addEventListener("keydown", (event) => this.onKeyDown(event));
    this.textarea.addEventListener("beforeinput", (event) => this.onBeforeInput(event));
    this.textarea.addEventListener("input", () => this.onInput());
    this.textarea.addEventListener("copy", (event) => this.onCopy(event));
    this.textarea.addEventListener("cut", (event) => this.onCut(event));
    this.textarea.addEventListener("paste", (event) => this.onPaste(event));
    this.textarea.addEventListener("compositionstart", () => {
      this.composing = true;
      this.compositionText = "";
    });
    this.textarea.addEventListener("compositionupdate", (event) => {
      this.compositionText = event.data;
      this.activeTarget?.onCompositionPreview(event.data);
    });
    this.textarea.addEventListener("compositionend", (event) => {
      this.composing = false;
      this.compositionText = "";
      this.activeTarget?.onCompositionCommit(event.data);
      this.resetTextareaSentinel();
    });
  }
  onKeyDown(event) {
    const target = this.activeTarget;
    if (!target || event.isComposing) return;
    const shortcut = shortcutFromEvent(event);
    if (target.runShortcut(shortcut)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const shift = event.shiftKey;
    const mod = isCommandModifier(event);
    const alt = event.altKey;
    const motion = keyToMotion(event.key, mod, alt);
    if (motion) {
      target.moveCursor(motion, shift);
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onBeforeInput(event) {
    const target = this.activeTarget;
    if (!target || this.composing) return;
    switch (event.inputType) {
      case "insertText":
        target.replaceSelection(event.data ?? "");
        break;
      case "insertLineBreak":
      case "insertParagraph":
        if (target.kind === "chat" || target.kind === "search") {
          target.runShortcut("Enter");
        } else {
          target.replaceSelection("\n");
        }
        break;
      case "deleteContentBackward":
        target.deleteSelectionOrBackward("char");
        break;
      case "deleteContentForward":
        target.deleteForward("char");
        break;
      case "deleteWordBackward":
        target.deleteSelectionOrBackward("word");
        break;
      case "deleteWordForward":
        target.deleteForward("word");
        break;
      case "historyUndo":
        target.runShortcut("Mod+Z");
        break;
      case "historyRedo":
        target.runShortcut("Mod+Shift+Z");
        break;
      case "insertFromPaste": {
        const text = normalizePastedText(event.dataTransfer?.getData("text/plain") ?? event.data ?? "");
        if (!text) return;
        target.replaceSelection(text);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
    this.resetTextareaSentinel();
  }
  onInput() {
    const target = this.activeTarget;
    if (!target || this.composing) {
      this.resetTextareaSentinel();
      return;
    }
    const text = normalizePastedText(textareaInsertedText(this.textarea.value));
    if (text) target.replaceSelection(text);
    this.resetTextareaSentinel();
  }
  onCopy(event) {
    const text = this.activeTarget?.getSelectedText() ?? "";
    if (!text) return;
    if (event.clipboardData) {
      event.clipboardData.setData("text/plain", text);
      event.preventDefault();
    }
    this.syncSelectionForClipboard(text);
  }
  onCut(event) {
    const text = this.activeTarget?.getSelectedText() ?? "";
    if (!text || !this.activeTarget) return;
    if (event.clipboardData) {
      event.clipboardData.setData("text/plain", text);
      event.preventDefault();
    }
    this.activeTarget.replaceSelection("");
    this.resetTextareaSentinel();
  }
  onPaste(event) {
    const text = normalizePastedText(event.clipboardData?.getData("text/plain") ?? "");
    if (!text || !this.activeTarget) return;
    this.activeTarget.replaceSelection(text);
    event.preventDefault();
    this.resetTextareaSentinel();
  }
  placeNearCaret(rect) {
    const vv = window.visualViewport;
    const offsetLeft = vv?.offsetLeft ?? 0;
    const offsetTop = vv?.offsetTop ?? 0;
    this.textarea.style.left = `${Math.max(0, rect.x - offsetLeft)}px`;
    this.textarea.style.top = `${Math.max(0, rect.y - offsetTop)}px`;
  }
};
function normalizePastedText(text) {
  return text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}
function textareaInsertedText(value) {
  if (value === "\n") return "";
  if (value.startsWith("\n")) return value.slice(1);
  return value;
}
function shortcutFromEvent(event) {
  const parts = [];
  const mod = isCommandModifier(event);
  if (mod) parts.push("Mod");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  parts.push(normalizeKey(event.key));
  return parts.join("+");
}
function keyToMotion(key, mod, alt) {
  if (key === "ArrowLeft") return mod || alt ? "wordLeft" : "left";
  if (key === "ArrowRight") return mod || alt ? "wordRight" : "right";
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "Home") return "lineStart";
  if (key === "End") return "lineEnd";
  return null;
}
function normalizeKey(key) {
  if (key === " ") return "Space";
  if (key.length === 1) return key.toUpperCase();
  return key;
}
function isCommandModifier(event) {
  return event.metaKey || event.ctrlKey;
}

// src/platform/viewport.ts
var ViewportService = class {
  constructor(canvas) {
    this.canvas = canvas;
  }
  canvas;
  listeners = /* @__PURE__ */ new Set();
  current = null;
  resizeObserver = null;
  start() {
    this.resizeObserver = new ResizeObserver(() => this.update());
    this.resizeObserver.observe(this.canvas);
    window.addEventListener("resize", this.update);
    window.visualViewport?.addEventListener("resize", this.update);
    window.visualViewport?.addEventListener("scroll", this.update);
    this.update();
  }
  stop() {
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.update);
    window.visualViewport?.removeEventListener("resize", this.update);
    window.visualViewport?.removeEventListener("scroll", this.update);
  }
  get() {
    if (!this.current) this.current = this.compute();
    return this.current;
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  resizeCanvas(gl) {
    this.applyVisualViewportSize();
    const info = this.compute();
    const changed = this.canvas.width !== info.deviceWidth || this.canvas.height !== info.deviceHeight;
    if (changed) {
      this.canvas.width = info.deviceWidth;
      this.canvas.height = info.deviceHeight;
      gl.viewport(0, 0, info.deviceWidth, info.deviceHeight);
    }
    this.current = info;
    return changed;
  }
  pointerToCanvasCss(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  snapCss(value) {
    const dpr = this.get().dpr;
    return Math.round(value * dpr) / dpr;
  }
  update = () => {
    this.applyVisualViewportSize();
    this.current = this.compute();
    for (const listener of this.listeners) listener(this.current);
  };
  applyVisualViewportSize() {
    const vv = window.visualViewport;
    if (!vv) {
      this.canvas.style.width = "";
      this.canvas.style.height = "";
      return;
    }
    this.canvas.style.width = `${Math.max(1, vv.width)}px`;
    this.canvas.style.height = `${Math.max(1, vv.height)}px`;
  }
  compute() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vv = window.visualViewport;
    return {
      cssWidth: Math.max(1, rect.width),
      cssHeight: Math.max(1, rect.height),
      deviceWidth: Math.max(1, Math.round(rect.width * dpr)),
      deviceHeight: Math.max(1, Math.round(rect.height * dpr)),
      dpr,
      visualWidth: vv?.width ?? window.innerWidth,
      visualHeight: vv?.height ?? window.innerHeight,
      visualOffsetLeft: vv?.offsetLeft ?? 0,
      visualOffsetTop: vv?.offsetTop ?? 0
    };
  }
};

// src/renderer/truetype.ts
var ARG_1_AND_2_ARE_WORDS = 1;
var ARGS_ARE_XY_VALUES = 2;
var WE_HAVE_A_SCALE = 8;
var MORE_COMPONENTS = 32;
var WE_HAVE_AN_X_AND_Y_SCALE = 64;
var WE_HAVE_A_TWO_BY_TWO = 128;
var WE_HAVE_INSTRUCTIONS = 256;
var TrueTypeFont = class {
  unitsPerEm;
  ascender;
  descender;
  lineGap;
  glyphCount;
  view;
  tables = /* @__PURE__ */ new Map();
  glyphOffsets = [];
  advanceWidths = [];
  leftSideBearings = [];
  cmapSubtables = [];
  glyphCache = /* @__PURE__ */ new Map();
  glyphsInProgress = /* @__PURE__ */ new Set();
  constructor(buffer) {
    this.view = new DataView(buffer);
    this.readTableDirectory();
    const head = this.requireTable("head");
    this.unitsPerEm = this.u16(head.offset + 18);
    const indexToLocFormat = this.i16(head.offset + 50);
    const maxp = this.requireTable("maxp");
    this.glyphCount = this.u16(maxp.offset + 4);
    const hhea = this.requireTable("hhea");
    this.ascender = this.i16(hhea.offset + 4);
    this.descender = this.i16(hhea.offset + 6);
    this.lineGap = this.i16(hhea.offset + 8);
    const hMetricCount = this.u16(hhea.offset + 34);
    this.readHorizontalMetrics(hMetricCount);
    this.readGlyphLocations(indexToLocFormat);
    this.readCmapSubtables();
  }
  glyphIdForCodePoint(codePoint) {
    for (const subtable of this.cmapSubtables) {
      const glyphId = subtable.format === 12 ? this.glyphIdFromFormat12(subtable, codePoint) : this.glyphIdFromFormat4(subtable, codePoint);
      if (glyphId > 0) return glyphId;
    }
    return 0;
  }
  outlineForCodePoint(codePoint) {
    return this.outlineForGlyph(this.glyphIdForCodePoint(codePoint));
  }
  outlineForGlyph(glyphId) {
    const normalizedGlyphId = glyphId >= 0 && glyphId < this.glyphCount ? glyphId : 0;
    const cached = this.glyphCache.get(normalizedGlyphId);
    if (cached) return cached;
    if (this.glyphsInProgress.has(normalizedGlyphId)) throw new Error(`Recursive composite glyph: ${normalizedGlyphId}`);
    this.glyphsInProgress.add(normalizedGlyphId);
    const outline = this.parseGlyph(normalizedGlyphId);
    this.glyphsInProgress.delete(normalizedGlyphId);
    this.glyphCache.set(normalizedGlyphId, outline);
    return outline;
  }
  readTableDirectory() {
    const tableCount = this.u16(4);
    for (let i = 0; i < tableCount; i++) {
      const offset = 12 + i * 16;
      const tag = this.tag(offset);
      this.tables.set(tag, { offset: this.u32(offset + 8), length: this.u32(offset + 12) });
    }
  }
  readHorizontalMetrics(hMetricCount) {
    const hmtx = this.requireTable("hmtx");
    let lastAdvance = 0;
    for (let i = 0; i < this.glyphCount; i++) {
      if (i < hMetricCount) {
        const offset = hmtx.offset + i * 4;
        lastAdvance = this.u16(offset);
        this.advanceWidths[i] = lastAdvance;
        this.leftSideBearings[i] = this.i16(offset + 2);
      } else {
        const offset = hmtx.offset + hMetricCount * 4 + (i - hMetricCount) * 2;
        this.advanceWidths[i] = lastAdvance;
        this.leftSideBearings[i] = this.i16(offset);
      }
    }
  }
  readGlyphLocations(indexToLocFormat) {
    const loca = this.requireTable("loca");
    for (let i = 0; i <= this.glyphCount; i++) {
      this.glyphOffsets[i] = indexToLocFormat === 0 ? this.u16(loca.offset + i * 2) * 2 : this.u32(loca.offset + i * 4);
    }
  }
  readCmapSubtables() {
    const cmap = this.requireTable("cmap");
    const count = this.u16(cmap.offset + 2);
    const candidates = [];
    for (let i = 0; i < count; i++) {
      const record = cmap.offset + 4 + i * 8;
      const offset = cmap.offset + this.u32(record + 4);
      candidates.push({ platform: this.u16(record), encoding: this.u16(record + 2), offset, format: this.u16(offset) });
    }
    candidates.sort((a, b) => cmapPriority(b) - cmapPriority(a));
    for (const candidate of candidates) {
      if (candidate.format === 12) this.cmapSubtables.push(this.readFormat12(candidate.offset));
      else if (candidate.format === 4) this.cmapSubtables.push(this.readFormat4(candidate.offset));
    }
    if (this.cmapSubtables.length === 0) throw new Error("TrueType font has no supported cmap subtable");
  }
  readFormat4(offset) {
    const length = this.u16(offset + 2);
    const segCount = this.u16(offset + 6) / 2;
    const endCodeOffset = offset + 14;
    const startCodeOffset = endCodeOffset + segCount * 2 + 2;
    const idDeltaOffset = startCodeOffset + segCount * 2;
    const idRangeOffsetStart = idDeltaOffset + segCount * 2;
    const endCodes = [];
    const startCodes = [];
    const idDeltas = [];
    const idRangeOffsets = [];
    for (let i = 0; i < segCount; i++) {
      endCodes.push(this.u16(endCodeOffset + i * 2));
      startCodes.push(this.u16(startCodeOffset + i * 2));
      idDeltas.push(this.i16(idDeltaOffset + i * 2));
      idRangeOffsets.push(this.u16(idRangeOffsetStart + i * 2));
    }
    return { format: 4, segCount, endCodes, startCodes, idDeltas, idRangeOffsets, idRangeOffsetStart, subtableOffset: offset, length };
  }
  readFormat12(offset) {
    const groupCount = this.u32(offset + 12);
    const groups = [];
    for (let i = 0; i < groupCount; i++) {
      const groupOffset = offset + 16 + i * 12;
      groups.push({ start: this.u32(groupOffset), end: this.u32(groupOffset + 4), startGlyph: this.u32(groupOffset + 8) });
    }
    return { format: 12, groups };
  }
  glyphIdFromFormat12(subtable, codePoint) {
    let lo = 0;
    let hi = subtable.groups.length - 1;
    while (lo <= hi) {
      const mid = lo + hi >> 1;
      const group = subtable.groups[mid];
      if (codePoint < group.start) hi = mid - 1;
      else if (codePoint > group.end) lo = mid + 1;
      else return group.startGlyph + codePoint - group.start;
    }
    return 0;
  }
  glyphIdFromFormat4(subtable, codePoint) {
    if (codePoint > 65535) return 0;
    for (let i = 0; i < subtable.segCount; i++) {
      if (codePoint > subtable.endCodes[i]) continue;
      if (codePoint < subtable.startCodes[i]) return 0;
      const rangeOffset = subtable.idRangeOffsets[i];
      const delta = subtable.idDeltas[i];
      if (rangeOffset === 0) return codePoint + delta & 65535;
      const glyphOffset = subtable.idRangeOffsetStart + i * 2 + rangeOffset + (codePoint - subtable.startCodes[i]) * 2;
      if (glyphOffset < subtable.subtableOffset || glyphOffset + 2 > subtable.subtableOffset + subtable.length) return 0;
      const rawGlyph = this.u16(glyphOffset);
      return rawGlyph === 0 ? 0 : rawGlyph + delta & 65535;
    }
    return 0;
  }
  parseGlyph(glyphId) {
    const glyf = this.requireTable("glyf");
    const start = glyf.offset + this.glyphOffsets[glyphId];
    const end = glyf.offset + this.glyphOffsets[glyphId + 1];
    const advanceWidth = this.advanceWidths[glyphId] ?? this.advanceWidths[0] ?? this.unitsPerEm;
    const leftSideBearing = this.leftSideBearings[glyphId] ?? 0;
    if (start >= end) {
      return { glyphId, advanceWidth, leftSideBearing, xMin: 0, yMin: 0, xMax: 0, yMax: 0, curves: [] };
    }
    const contourCount = this.i16(start);
    const xMin = this.i16(start + 2);
    const yMin = this.i16(start + 4);
    const xMax = this.i16(start + 6);
    const yMax = this.i16(start + 8);
    const curves = contourCount >= 0 ? this.parseSimpleGlyph(start + 10, contourCount) : this.parseCompositeGlyph(start + 10);
    return { glyphId, advanceWidth, leftSideBearing, xMin, yMin, xMax, yMax, curves };
  }
  parseSimpleGlyph(offset, contourCount) {
    if (contourCount === 0) return [];
    const endPts = [];
    for (let i = 0; i < contourCount; i++) endPts.push(this.u16(offset + i * 2));
    const instructionLength = this.u16(offset + contourCount * 2);
    let cursor = offset + contourCount * 2 + 2 + instructionLength;
    const pointCount = endPts[endPts.length - 1] + 1;
    const flags = [];
    while (flags.length < pointCount) {
      const flag = this.u8(cursor++);
      flags.push(flag);
      if (flag & 8) {
        const repeat = this.u8(cursor++);
        for (let i = 0; i < repeat; i++) flags.push(flag);
      }
    }
    const xs = [];
    let x = 0;
    for (let i = 0; i < pointCount; i++) {
      const flag = flags[i];
      let dx = 0;
      if (flag & 2) dx = this.u8(cursor++) * (flag & 16 ? 1 : -1);
      else if (!(flag & 16)) {
        dx = this.i16(cursor);
        cursor += 2;
      }
      x += dx;
      xs.push(x);
    }
    const ys = [];
    let y = 0;
    for (let i = 0; i < pointCount; i++) {
      const flag = flags[i];
      let dy = 0;
      if (flag & 4) dy = this.u8(cursor++) * (flag & 32 ? 1 : -1);
      else if (!(flag & 32)) {
        dy = this.i16(cursor);
        cursor += 2;
      }
      y += dy;
      ys.push(y);
    }
    const curves = [];
    let startPoint = 0;
    for (const endPoint of endPts) {
      const contour = [];
      for (let i = startPoint; i <= endPoint; i++) contour.push({ x: xs[i], y: ys[i], on: Boolean(flags[i] & 1) });
      curves.push(...contourToQuadraticCurves(contour));
      startPoint = endPoint + 1;
    }
    return curves;
  }
  parseCompositeGlyph(offset) {
    const curves = [];
    let cursor = offset;
    let flags = MORE_COMPONENTS;
    while (flags & MORE_COMPONENTS) {
      flags = this.u16(cursor);
      cursor += 2;
      const componentGlyphId = this.u16(cursor);
      cursor += 2;
      let arg1 = 0;
      let arg2 = 0;
      if (flags & ARG_1_AND_2_ARE_WORDS) {
        arg1 = this.i16(cursor);
        arg2 = this.i16(cursor + 2);
        cursor += 4;
      } else {
        arg1 = this.i8(cursor);
        arg2 = this.i8(cursor + 1);
        cursor += 2;
      }
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      if (flags & WE_HAVE_A_SCALE) {
        a = d = this.f2dot14(cursor);
        cursor += 2;
      } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
        a = this.f2dot14(cursor);
        d = this.f2dot14(cursor + 2);
        cursor += 4;
      } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
        a = this.f2dot14(cursor);
        b = this.f2dot14(cursor + 2);
        c = this.f2dot14(cursor + 4);
        d = this.f2dot14(cursor + 6);
        cursor += 8;
      }
      const dx = flags & ARGS_ARE_XY_VALUES ? arg1 : 0;
      const dy = flags & ARGS_ARE_XY_VALUES ? arg2 : 0;
      const component = this.outlineForGlyph(componentGlyphId);
      for (const curve of component.curves) curves.push(transformCurve(curve, a, b, c, d, dx, dy));
    }
    if (flags & WE_HAVE_INSTRUCTIONS) {
      const instructionLength = this.u16(cursor);
      cursor += 2 + instructionLength;
    }
    return curves;
  }
  requireTable(tag) {
    const table = this.tables.get(tag);
    if (!table) throw new Error(`TrueType font is missing required ${tag} table`);
    return table;
  }
  tag(offset) {
    return String.fromCharCode(this.u8(offset), this.u8(offset + 1), this.u8(offset + 2), this.u8(offset + 3));
  }
  u8(offset) {
    return this.view.getUint8(offset);
  }
  i8(offset) {
    return this.view.getInt8(offset);
  }
  u16(offset) {
    return this.view.getUint16(offset, false);
  }
  i16(offset) {
    return this.view.getInt16(offset, false);
  }
  u32(offset) {
    return this.view.getUint32(offset, false);
  }
  f2dot14(offset) {
    return this.i16(offset) / 16384;
  }
};
function contourToQuadraticCurves(contour) {
  if (contour.length === 0) return [];
  const curves = [];
  const last = contour[contour.length - 1];
  const first = contour[0];
  let current;
  let index;
  if (first.on) {
    current = first;
    index = 1;
  } else if (last.on) {
    current = last;
    index = 0;
  } else {
    current = midpoint(last, first);
    index = 0;
  }
  let processed = 0;
  while (processed < contour.length) {
    const point = contour[index % contour.length];
    if (point.on) {
      pushLine(curves, current, point);
      current = point;
      index++;
      processed++;
      continue;
    }
    const next = contour[(index + 1) % contour.length];
    if (next.on) {
      curves.push({ x1: current.x, y1: current.y, x2: point.x, y2: point.y, x3: next.x, y3: next.y });
      current = next;
      index += 2;
      processed += 2;
    } else {
      const implicit = midpoint(point, next);
      curves.push({ x1: current.x, y1: current.y, x2: point.x, y2: point.y, x3: implicit.x, y3: implicit.y });
      current = implicit;
      index++;
      processed++;
    }
  }
  if (current.x !== (first.on ? first.x : last.on ? last.x : midpoint(last, first).x) || current.y !== (first.on ? first.y : last.on ? last.y : midpoint(last, first).y)) {
    const start = first.on ? first : last.on ? last : midpoint(last, first);
    pushLine(curves, current, start);
  }
  return curves.filter((curve) => curve.x1 !== curve.x3 || curve.y1 !== curve.y3 || curve.x1 !== curve.x2 || curve.y1 !== curve.y2);
}
function pushLine(curves, from, to) {
  if (from.x === to.x && from.y === to.y) return;
  curves.push({ x1: from.x, y1: from.y, x2: (from.x + to.x) / 2, y2: (from.y + to.y) / 2, x3: to.x, y3: to.y });
}
function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true };
}
function transformCurve(curve, a, b, c, d, dx, dy) {
  const p1 = transformPoint(curve.x1, curve.y1, a, b, c, d, dx, dy);
  const p2 = transformPoint(curve.x2, curve.y2, a, b, c, d, dx, dy);
  const p3 = transformPoint(curve.x3, curve.y3, a, b, c, d, dx, dy);
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x3: p3.x, y3: p3.y };
}
function transformPoint(x, y, a, b, c, d, dx, dy) {
  return { x: a * x + c * y + dx, y: b * x + d * y + dy };
}
function cmapPriority(candidate) {
  let score = candidate.format === 12 ? 100 : candidate.format === 4 ? 50 : 0;
  if (candidate.platform === 3 && candidate.encoding === 10) score += 30;
  if (candidate.platform === 3 && candidate.encoding === 1) score += 20;
  if (candidate.platform === 0) score += 10;
  return score;
}

// src/renderer/webgl_renderer.ts
var CURVE_TEXTURE_WIDTH = 4096;
var BAND_TEXTURE_WIDTH = 4096;
var MAX_BAND_CURVES = 768;
var UI_SHAPE_MARGIN_PX = 1;
var WebglRenderer = class {
  constructor(canvas, initialViewport, fontSources) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) throw new Error("WebGL2 is required");
    if (fontSources.length === 0) throw new Error("At least one TTF font is required");
    this.gl = gl;
    this.viewport = initialViewport;
    this.fonts = fontSources.map((source) => ({ name: source.name, font: new TrueTypeFont(source.buffer) }));
    this.primaryFont = this.fonts[0].font;
    this.fontMetrics = {
      ui: this.makeFontMetrics(13),
      code: this.makeFontMetrics(14),
      title: this.makeFontMetrics(18)
    };
    this.slugProgram = createProgram(gl, SLUG_VS, SLUG_FS);
    this.floatBuffer = mustBuffer(gl);
    this.glyphBuffer = mustBuffer(gl);
    this.curveTexture = mustTexture(gl);
    this.bandTexture = mustTexture(gl);
    configureFloatTexture(gl, this.curveTexture);
    configureIntegerTexture(gl, this.bandTexture);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }
  canvas;
  gl;
  backend = "slug-ttf";
  viewport;
  fonts;
  primaryFont;
  slugProgram;
  floatBuffer;
  glyphBuffer;
  curveTexture;
  bandTexture;
  commands = [];
  clipStack = [];
  glyphMetrics = /* @__PURE__ */ new Map();
  fontMetrics;
  diagnostics() {
    return {
      backend: this.backend,
      font: this.fonts[0].name,
      unitsPerEm: this.primaryFont.unitsPerEm,
      glyphCount: this.primaryFont.glyphCount,
      fonts: this.fonts.map((item) => ({ name: item.name, unitsPerEm: item.font.unitsPerEm, glyphCount: item.font.glyphCount }))
    };
  }
  resolveCodePoint(codePoint) {
    const match = this.findFontGlyph(codePoint);
    return { font: this.fonts[match.fontIndex].name, glyphId: match.glyphId };
  }
  setViewport(viewport) {
    this.viewport = viewport;
  }
  beginFrame() {
    this.commands.length = 0;
    this.clipStack.length = 0;
  }
  endFrame() {
    const gl = this.gl;
    const frame = this.buildFrameSlugData();
    gl.viewport(0, 0, this.viewport.deviceWidth, this.viewport.deviceHeight);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0.12, 0.13, 0.15, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.bindSlugProgram();
    for (const command of this.commands) {
      if (command.clip) this.applyScissor(command.clip);
      else gl.disable(gl.SCISSOR_TEST);
      if (command.type === "rect") this.drawPackedShape(frame.shapes.get(rectKey(command.rect)), command.color, screenShapeTransform(command.rect));
      else if (command.type === "polygon") this.drawPackedShape(frame.shapes.get(polygonKey(command.points)), command.color, screenShapeTransform(boundsForPoints(command.points)));
      else this.drawTextCommand(command, frame);
    }
    gl.disable(gl.SCISSOR_TEST);
  }
  pushClip(rect) {
    const top = this.clipStack[this.clipStack.length - 1];
    if (!top) {
      this.clipStack.push({ ...rect });
      return;
    }
    const x = Math.max(top.x, rect.x);
    const y = Math.max(top.y, rect.y);
    const x2 = Math.min(top.x + top.w, rect.x + rect.w);
    const y2 = Math.min(top.y + top.h, rect.y + rect.h);
    this.clipStack.push({ x, y, w: Math.max(0, x2 - x), h: Math.max(0, y2 - y) });
  }
  popClip() {
    this.clipStack.pop();
  }
  rect(rect, color) {
    if (rect.w <= 0 || rect.h <= 0 || color[3] <= 0) return;
    this.commands.push({ type: "rect", rect: { ...rect }, color, clip: this.currentClip() });
  }
  polygon(points, color) {
    if (points.length < 3 || color[3] <= 0) return;
    this.commands.push({ type: "polygon", points: points.map((point) => ({ ...point })), color, clip: this.currentClip() });
  }
  text(text, x, y, color, font = "ui") {
    if (!text || color[3] <= 0) return 0;
    this.commands.push({ type: "text", text, x, y, color, font, clip: this.currentClip() });
    return this.measureText(text, font);
  }
  measureText(text, font = "ui") {
    let width = 0;
    for (const char of text) width += this.advanceForCodePoint(char.codePointAt(0) ?? 0, font);
    return width;
  }
  lineHeight(font = "ui") {
    return this.fontMetrics[font].lineHeightPx;
  }
  monoAdvance(font = "code") {
    return this.fontMetrics[font].monoAdvancePx;
  }
  makeFontMetrics(sizePx) {
    const scale = sizePx / this.primaryFont.unitsPerEm;
    const ascentPx = this.primaryFont.ascender * scale;
    const descentPx = -this.primaryFont.descender * scale;
    const lineHeightPx = Math.ceil((this.primaryFont.ascender - this.primaryFont.descender + this.primaryFont.lineGap) * scale);
    const monoAdvancePx = this.primaryFont.outlineForCodePoint("M".codePointAt(0)).advanceWidth * scale;
    return { sizePx, ascentPx, descentPx, lineHeightPx, monoAdvancePx };
  }
  currentClip() {
    const rect = this.clipStack[this.clipStack.length - 1];
    return rect ? { ...rect } : null;
  }
  applyScissor(rect) {
    const gl = this.gl;
    const dpr = this.viewport.dpr;
    const x = Math.max(0, Math.floor(rect.x * dpr));
    const y = Math.max(0, Math.floor((this.viewport.cssHeight - rect.y - rect.h) * dpr));
    const w = Math.max(0, Math.ceil(rect.w * dpr));
    const h = Math.max(0, Math.ceil(rect.h * dpr));
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, w, h);
  }
  buildFrameSlugData() {
    const shapes = /* @__PURE__ */ new Map();
    for (const command of this.commands) {
      if (command.type === "rect") {
        const shape = rectShape(command.rect);
        shapes.set(shape.key, shape);
      } else if (command.type === "polygon") {
        const shape = polygonShape(command.points);
        shapes.set(shape.key, shape);
      } else {
        for (const char of command.text) {
          const glyph = this.glyphForCodePoint(char.codePointAt(0) ?? 0);
          if (glyph.curves.length > 0) shapes.set(glyph.key, glyph);
        }
      }
    }
    return this.packShapes([...shapes.values()]);
  }
  packShapes(shapes) {
    const packed = /* @__PURE__ */ new Map();
    const curveTexels = [];
    const bandTexels = [];
    for (const shape of shapes) {
      if (shape.curves.length === 0) continue;
      const curveBounds = [];
      for (const curve of shape.curves) {
        const startIndex = appendCurveTexel(curveTexels, curve);
        curveBounds.push({
          minX: Math.min(curve.x1, curve.x2, curve.x3),
          minY: Math.min(curve.y1, curve.y2, curve.y3),
          maxX: Math.max(curve.x1, curve.x2, curve.x3),
          maxY: Math.max(curve.y1, curve.y2, curve.y3),
          sortX: Math.max(curve.x1, curve.x2, curve.x3),
          sortY: Math.max(curve.y1, curve.y2, curve.y3),
          locX: startIndex % CURVE_TEXTURE_WIDTH,
          locY: Math.floor(startIndex / CURVE_TEXTURE_WIDTH)
        });
      }
      const width = Math.max(1 / 1024, shape.xMax - shape.xMin);
      const height = Math.max(1 / 1024, shape.yMax - shape.yMin);
      const horizontal = buildLimitedBands(shape.key, curveBounds, bandCountForShape(shape.curves.length, height), shape.yMin, shape.yMax, "horizontal");
      const vertical = buildLimitedBands(shape.key, curveBounds, bandCountForShape(shape.curves.length, width), shape.xMin, shape.xMax, "vertical");
      const horizontalBandCount = horizontal.bands.length;
      const verticalBandCount = vertical.bands.length;
      const bandStart = bandTexels.length / 4;
      const headerCount = horizontalBandCount + verticalBandCount;
      for (let i = 0; i < headerCount; i++) pushBandTexel(bandTexels, 0, 0);
      writeBandHeadersAndLists(bandTexels, bandStart, horizontal.bands, 0);
      writeBandHeadersAndLists(bandTexels, bandStart, vertical.bands, horizontalBandCount);
      packed.set(shape.key, {
        key: shape.key,
        xMin: shape.xMin,
        yMin: shape.yMin,
        xMax: shape.xMax,
        yMax: shape.yMax,
        bandX: bandStart % BAND_TEXTURE_WIDTH,
        bandY: Math.floor(bandStart / BAND_TEXTURE_WIDTH),
        maxBandX: verticalBandCount - 1,
        maxBandY: horizontalBandCount - 1,
        bandScaleX: verticalBandCount / width,
        bandScaleY: horizontalBandCount / height,
        bandOffsetX: -shape.xMin * verticalBandCount / width,
        bandOffsetY: -shape.yMin * horizontalBandCount / height
      });
    }
    this.uploadCurveTexture(curveTexels);
    this.uploadBandTexture(bandTexels);
    return { shapes: packed };
  }
  uploadCurveTexture(texels) {
    const gl = this.gl;
    const texelCount = Math.max(1, texels.length / 4);
    const height = Math.max(1, Math.ceil(texelCount / CURVE_TEXTURE_WIDTH));
    const data = new Float32Array(CURVE_TEXTURE_WIDTH * height * 4);
    data.set(texels);
    gl.bindTexture(gl.TEXTURE_2D, this.curveTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, CURVE_TEXTURE_WIDTH, height, 0, gl.RGBA, gl.FLOAT, data);
  }
  uploadBandTexture(texels) {
    const gl = this.gl;
    const texelCount = Math.max(1, texels.length / 4);
    const height = Math.max(1, Math.ceil(texelCount / BAND_TEXTURE_WIDTH));
    const data = new Uint32Array(BAND_TEXTURE_WIDTH * height * 4);
    data.set(texels);
    gl.bindTexture(gl.TEXTURE_2D, this.bandTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, BAND_TEXTURE_WIDTH, height, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, data);
  }
  bindSlugProgram() {
    const gl = this.gl;
    gl.useProgram(this.slugProgram);
    gl.uniform2f(gl.getUniformLocation(this.slugProgram, "uViewport"), this.viewport.cssWidth, this.viewport.cssHeight);
    gl.uniform1i(gl.getUniformLocation(this.slugProgram, "uCurveTexture"), 0);
    gl.uniform1i(gl.getUniformLocation(this.slugProgram, "uBandTexture"), 1);
    gl.uniform1i(gl.getUniformLocation(this.slugProgram, "uCurveTextureWidth"), CURVE_TEXTURE_WIDTH);
    gl.uniform1i(gl.getUniformLocation(this.slugProgram, "uBandTextureWidth"), BAND_TEXTURE_WIDTH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.curveTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bandTexture);
  }
  drawTextCommand(command, frame) {
    const metrics = this.fontMetrics[command.font];
    const baseline = command.y + metrics.ascentPx;
    let penX = command.x;
    for (const char of command.text) {
      const glyph = this.glyphForCodePoint(char.codePointAt(0) ?? 0);
      const packed = frame.shapes.get(glyph.key);
      if (packed) this.drawPackedShape(packed, command.color, fontGlyphTransform(penX, baseline, metrics.sizePx), 1 / metrics.sizePx);
      penX += this.advanceForGlyph(glyph, command.font);
    }
  }
  drawPackedShape(shape, color, transform, pixelMargin = UI_SHAPE_MARGIN_PX) {
    if (!shape || color[3] <= 0) return;
    const marginX = Math.max(pixelMargin, (shape.xMax - shape.xMin) * 2e-3);
    const marginY = Math.max(pixelMargin, (shape.yMax - shape.yMin) * 2e-3);
    const x0 = shape.xMin - marginX;
    const x1 = shape.xMax + marginX;
    const y0 = shape.yMin - marginY;
    const y1 = shape.yMax + marginY;
    const p00 = transform(x0, y0);
    const p10 = transform(x1, y0);
    const p11 = transform(x1, y1);
    const p01 = transform(x0, y1);
    const floatData = new Float32Array([
      p00.x,
      p00.y,
      x0,
      y0,
      ...color,
      p10.x,
      p10.y,
      x1,
      y0,
      ...color,
      p11.x,
      p11.y,
      x1,
      y1,
      ...color,
      p00.x,
      p00.y,
      x0,
      y0,
      ...color,
      p11.x,
      p11.y,
      x1,
      y1,
      ...color,
      p01.x,
      p01.y,
      x0,
      y1,
      ...color
    ]);
    const glyphData = new Uint32Array(6 * 4);
    for (let i = 0; i < 6; i++) {
      glyphData[i * 4] = shape.bandX;
      glyphData[i * 4 + 1] = shape.bandY;
      glyphData[i * 4 + 2] = shape.maxBandX;
      glyphData[i * 4 + 3] = shape.maxBandY;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floatBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floatData, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, glyphData, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribIPointer(3, 4, gl.UNSIGNED_INT, 16, 0);
    gl.uniform4f(gl.getUniformLocation(this.slugProgram, "uBandTransform"), shape.bandScaleX, shape.bandScaleY, shape.bandOffsetX, shape.bandOffsetY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  glyphForCodePoint(codePoint) {
    const match = this.findFontGlyph(codePoint);
    const cacheKey = `${match.fontIndex}:${match.glyphId}`;
    const cached = this.glyphMetrics.get(cacheKey);
    if (cached) return cached;
    const outline = this.fonts[match.fontIndex].font.outlineForGlyph(match.glyphId);
    const glyph = this.makeGlyphMetrics(match.fontIndex, outline);
    this.glyphMetrics.set(cacheKey, glyph);
    return glyph;
  }
  findFontGlyph(codePoint) {
    for (let i = 0; i < this.fonts.length; i++) {
      const glyphId = this.fonts[i].font.glyphIdForCodePoint(codePoint);
      if (glyphId > 0) return { fontIndex: i, glyphId };
    }
    return { fontIndex: 0, glyphId: 0 };
  }
  makeGlyphMetrics(fontIndex, outline) {
    const font = this.fonts[fontIndex].font;
    const units = font.unitsPerEm;
    const curves = outline.curves.map((curve) => ({
      x1: curve.x1 / units,
      y1: curve.y1 / units,
      x2: curve.x2 / units,
      y2: curve.y2 / units,
      x3: curve.x3 / units,
      y3: curve.y3 / units
    }));
    const advanceWidth = outline.advanceWidth / units;
    return {
      key: `glyph:${fontIndex}:${outline.glyphId}`,
      fontIndex,
      glyphId: outline.glyphId,
      curves,
      xMin: outline.xMin / units,
      yMin: outline.yMin / units,
      xMax: outline.xMax / units,
      yMax: outline.yMax / units,
      advancePxByFont: /* @__PURE__ */ new Map([
        ["ui", advanceWidth * this.fontMetrics.ui.sizePx],
        ["code", advanceWidth * this.fontMetrics.code.sizePx],
        ["title", advanceWidth * this.fontMetrics.title.sizePx]
      ])
    };
  }
  advanceForCodePoint(codePoint, font) {
    return this.advanceForGlyph(this.glyphForCodePoint(codePoint), font);
  }
  advanceForGlyph(glyph, font) {
    return glyph.advancePxByFont.get(font) ?? this.fontMetrics[font].monoAdvancePx;
  }
};
function rectShape(rect) {
  const curves = [];
  const p0 = { x: rect.x, y: rect.y };
  const p1 = { x: rect.x + rect.w, y: rect.y };
  const p2 = { x: rect.x + rect.w, y: rect.y + rect.h };
  const p3 = { x: rect.x, y: rect.y + rect.h };
  pushLine(curves, p0, p1);
  pushLine(curves, p1, p2);
  pushLine(curves, p2, p3);
  pushLine(curves, p3, p0);
  return { key: rectKey(rect), curves, xMin: rect.x, yMin: rect.y, xMax: rect.x + rect.w, yMax: rect.y + rect.h };
}
function polygonShape(points) {
  const curves = [];
  for (let i = 0; i < points.length; i++) pushLine(curves, points[i], points[(i + 1) % points.length]);
  const bounds = boundsForPoints(points);
  return { key: polygonKey(points), curves, xMin: bounds.x, yMin: bounds.y, xMax: bounds.x + bounds.w, yMax: bounds.y + bounds.h };
}
function rectKey(rect) {
  return `rect:${roundKey(rect.x)},${roundKey(rect.y)},${roundKey(rect.w)},${roundKey(rect.h)}`;
}
function polygonKey(points) {
  return `poly:${points.map((point) => `${roundKey(point.x)},${roundKey(point.y)}`).join(";")}`;
}
function roundKey(value) {
  return Math.round(value * 100) / 100 + "";
}
function boundsForPoints(points) {
  let xMin = Number.POSITIVE_INFINITY;
  let yMin = Number.POSITIVE_INFINITY;
  let xMax = Number.NEGATIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    xMin = Math.min(xMin, point.x);
    yMin = Math.min(yMin, point.y);
    xMax = Math.max(xMax, point.x);
    yMax = Math.max(yMax, point.y);
  }
  return { x: xMin, y: yMin, w: Math.max(1 / 1024, xMax - xMin), h: Math.max(1 / 1024, yMax - yMin) };
}
function screenShapeTransform(_bounds) {
  return (x, y) => ({ x, y });
}
function fontGlyphTransform(penX, baseline, sizePx) {
  return (x, y) => ({ x: penX + x * sizePx, y: baseline - y * sizePx });
}
function appendCurveTexel(texels, curve) {
  if (texels.length / 4 % CURVE_TEXTURE_WIDTH === CURVE_TEXTURE_WIDTH - 1) {
    texels.push(0, 0, 0, 0);
  }
  const index = texels.length / 4;
  texels.push(curve.x1, curve.y1, curve.x2, curve.y2, curve.x3, curve.y3, 0, 0);
  return index;
}
function pushBandTexel(texels, x, y) {
  texels.push(x, y, 0, 0);
}
function bandCountForShape(curveCount, span) {
  if (curveCount <= 6 || span <= 1 / 1024) return 1;
  return Math.max(1, Math.min(24, Math.ceil(Math.sqrt(curveCount))));
}
function buildBands(curves, count, min, max, axis) {
  const span = Math.max(1 / 1024, max - min);
  const result = [];
  const epsilon = span / 1024;
  for (let i = 0; i < count; i++) {
    const bandMin = min + span * i / count - epsilon;
    const bandMax = min + span * (i + 1) / count + epsilon;
    const band = curves.filter((curve) => axis === "horizontal" ? curve.maxY >= bandMin && curve.minY <= bandMax : curve.maxX >= bandMin && curve.minX <= bandMax);
    band.sort((a, b) => axis === "horizontal" ? b.sortX - a.sortX : b.sortY - a.sortY);
    result.push(band);
  }
  return result;
}
function buildLimitedBands(shapeKey, curves, initialCount, min, max, axis) {
  let count = initialCount;
  for (; ; ) {
    const bands = buildBands(curves, count, min, max, axis);
    const maxBandCurves = bands.reduce((maxCount, band) => Math.max(maxCount, band.length), 0);
    if (maxBandCurves <= MAX_BAND_CURVES) return { bands };
    if (count >= 256) throw new Error(`Slug ${axis} band for ${shapeKey} contains ${maxBandCurves} curves; shader limit is ${MAX_BAND_CURVES}`);
    count = Math.min(256, count * 2);
  }
}
function writeBandHeadersAndLists(texels, bandStart, bands, headerOffset) {
  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];
    const listOffset = texels.length / 4 - bandStart;
    const headerIndex = (bandStart + headerOffset + i) * 4;
    texels[headerIndex] = band.length;
    texels[headerIndex + 1] = listOffset;
    for (const curve of band) pushBandTexel(texels, curve.locX, curve.locY);
  }
}
function configureFloatTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
function configureIntegerTexture(gl, texture) {
  configureFloatTexture(gl, texture);
}
function mustBuffer(gl) {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Could not create WebGL buffer");
  return buffer;
}
function mustTexture(gl) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Could not create WebGL texture");
  return texture;
}
function createProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create WebGL program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.bindAttribLocation(program, 1, "aRenderCoord");
  gl.bindAttribLocation(program, 2, "aColor");
  gl.bindAttribLocation(program, 3, "aGlyph");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "WebGL program link failed");
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "WebGL shader compile failed");
  return shader;
}
var SLUG_VS = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aRenderCoord;
layout(location = 2) in vec4 aColor;
layout(location = 3) in uvec4 aGlyph;
uniform vec2 uViewport;
uniform vec4 uBandTransform;
out vec2 vRenderCoord;
out vec4 vColor;
flat out uvec4 vGlyph;
flat out vec4 vBandTransform;
void main() {
  vec2 p = aPosition / uViewport * 2.0 - 1.0;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  vRenderCoord = aRenderCoord;
  vColor = aColor;
  vGlyph = aGlyph;
  vBandTransform = uBandTransform;
}`;
var SLUG_FS = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
uniform sampler2D uCurveTexture;
uniform usampler2D uBandTexture;
uniform int uCurveTextureWidth;
uniform int uBandTextureWidth;
in vec2 vRenderCoord;
in vec4 vColor;
flat in uvec4 vGlyph;
flat in vec4 vBandTransform;
out vec4 outColor;

uint calcRootCode(float y1, float y2, float y3) {
  uint i1 = floatBitsToUint(y1) >> 31u;
  uint i2 = floatBitsToUint(y2) >> 30u;
  uint i3 = floatBitsToUint(y3) >> 29u;
  uint shift = (i2 & 2u) | (i1 & ~2u);
  shift = (i3 & 4u) | (shift & ~4u);
  return (0x2E74u >> shift) & 0x0101u;
}

vec2 solveHorizPoly(vec4 p12, vec2 p3) {
  vec2 a = p12.xy - p12.zw * 2.0 + p3;
  vec2 b = p12.xy - p12.zw;
  float d = sqrt(max(b.y * b.y - a.y * p12.y, 0.0));
  float t1 = (b.y - d) / a.y;
  float t2 = (b.y + d) / a.y;
  if (abs(a.y) < 1.0 / 65536.0) {
    float t = p12.y * (0.5 / b.y);
    t1 = t;
    t2 = t;
  }
  return vec2((a.x * t1 - b.x * 2.0) * t1 + p12.x, (a.x * t2 - b.x * 2.0) * t2 + p12.x);
}

vec2 solveVertPoly(vec4 p12, vec2 p3) {
  vec2 a = p12.xy - p12.zw * 2.0 + p3;
  vec2 b = p12.xy - p12.zw;
  float d = sqrt(max(b.x * b.x - a.x * p12.x, 0.0));
  float t1 = (b.x - d) / a.x;
  float t2 = (b.x + d) / a.x;
  if (abs(a.x) < 1.0 / 65536.0) {
    float t = p12.x * (0.5 / b.x);
    t1 = t;
    t2 = t;
  }
  return vec2((a.y * t1 - b.y * 2.0) * t1 + p12.y, (a.y * t2 - b.y * 2.0) * t2 + p12.y);
}

ivec2 offsetLoc(ivec2 base, uint offset, int width) {
  int x = base.x + int(offset);
  return ivec2(x % width, base.y + x / width);
}

float calcCoverage(float xcov, float ycov, float xwgt, float ywgt) {
  float coverage = max(abs(xcov * xwgt + ycov * ywgt) / max(xwgt + ywgt, 1.0 / 65536.0), min(abs(xcov), abs(ycov)));
  return clamp(coverage, 0.0, 1.0);
}

float slugRender() {
  vec2 emsPerPixel = max(fwidth(vRenderCoord), vec2(1.0 / 65536.0));
  vec2 pixelsPerEm = 1.0 / emsPerPixel;
  ivec2 bandMax = ivec2(int(vGlyph.z), int(vGlyph.w & 255u));
  ivec2 bandIndex = clamp(ivec2(vRenderCoord * vBandTransform.xy + vBandTransform.zw), ivec2(0), bandMax);
  ivec2 glyphLoc = ivec2(vGlyph.xy);

  float xcov = 0.0;
  float xwgt = 0.0;
  uvec4 hbandData = texelFetch(uBandTexture, offsetLoc(glyphLoc, uint(bandIndex.y), uBandTextureWidth), 0);
  ivec2 hbandLoc = offsetLoc(glyphLoc, hbandData.y, uBandTextureWidth);
  for (int curveIndex = 0; curveIndex < ${MAX_BAND_CURVES}; curveIndex++) {
    if (curveIndex >= int(hbandData.x)) break;
    uvec4 curveLocData = texelFetch(uBandTexture, offsetLoc(hbandLoc, uint(curveIndex), uBandTextureWidth), 0);
    ivec2 curveLoc = ivec2(curveLocData.xy);
    vec4 p12 = texelFetch(uCurveTexture, curveLoc, 0) - vec4(vRenderCoord, vRenderCoord);
    vec2 p3 = texelFetch(uCurveTexture, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy - vRenderCoord;
    if (max(max(p12.x, p12.z), p3.x) * pixelsPerEm.x < -0.5) break;
    uint code = calcRootCode(p12.y, p12.w, p3.y);
    if (code != 0u) {
      vec2 r = solveHorizPoly(p12, p3) * pixelsPerEm.x;
      if ((code & 1u) != 0u) {
        xcov += clamp(r.x + 0.5, 0.0, 1.0);
        xwgt = max(xwgt, clamp(1.0 - abs(r.x) * 2.0, 0.0, 1.0));
      }
      if (code > 1u) {
        xcov -= clamp(r.y + 0.5, 0.0, 1.0);
        xwgt = max(xwgt, clamp(1.0 - abs(r.y) * 2.0, 0.0, 1.0));
      }
    }
  }

  float ycov = 0.0;
  float ywgt = 0.0;
  uint verticalHeaderOffset = uint(bandMax.y + 1 + bandIndex.x);
  uvec4 vbandData = texelFetch(uBandTexture, offsetLoc(glyphLoc, verticalHeaderOffset, uBandTextureWidth), 0);
  ivec2 vbandLoc = offsetLoc(glyphLoc, vbandData.y, uBandTextureWidth);
  for (int curveIndex = 0; curveIndex < ${MAX_BAND_CURVES}; curveIndex++) {
    if (curveIndex >= int(vbandData.x)) break;
    uvec4 curveLocData = texelFetch(uBandTexture, offsetLoc(vbandLoc, uint(curveIndex), uBandTextureWidth), 0);
    ivec2 curveLoc = ivec2(curveLocData.xy);
    vec4 p12 = texelFetch(uCurveTexture, curveLoc, 0) - vec4(vRenderCoord, vRenderCoord);
    vec2 p3 = texelFetch(uCurveTexture, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy - vRenderCoord;
    if (max(max(p12.y, p12.w), p3.y) * pixelsPerEm.y < -0.5) break;
    uint code = calcRootCode(p12.x, p12.z, p3.x);
    if (code != 0u) {
      vec2 r = solveVertPoly(p12, p3) * pixelsPerEm.y;
      if ((code & 1u) != 0u) {
        ycov -= clamp(r.x + 0.5, 0.0, 1.0);
        ywgt = max(ywgt, clamp(1.0 - abs(r.x) * 2.0, 0.0, 1.0));
      }
      if (code > 1u) {
        ycov += clamp(r.y + 0.5, 0.0, 1.0);
        ywgt = max(ywgt, clamp(1.0 - abs(r.y) * 2.0, 0.0, 1.0));
      }
    }
  }
  return calcCoverage(xcov, ycov, xwgt, ywgt);
}

void main() {
  float coverage = slugRender();
  vec4 premul = vec4(vColor.rgb * vColor.a, vColor.a);
  outColor = premul * coverage;
}`;

// src/renderer/theme.ts
var theme = {
  background: [0.12, 0.13, 0.15, 1],
  panel: [0.15, 0.16, 0.18, 1],
  panel2: [0.18, 0.19, 0.22, 1],
  activity: [0.1, 0.11, 0.13, 1],
  activityActive: [0.22, 0.26, 0.31, 1],
  divider: [0.24, 0.25, 0.28, 1],
  text: [0.84, 0.86, 0.9, 1],
  textDim: [0.54, 0.58, 0.64, 1],
  accent: [0.31, 0.57, 0.91, 1],
  accent2: [0.46, 0.76, 0.47, 1],
  warning: [0.95, 0.68, 0.28, 1],
  error: [0.93, 0.35, 0.38, 1],
  selection: [0.22, 0.39, 0.65, 0.78],
  caret: [0.95, 0.95, 0.95, 1],
  lineHighlight: [0.18, 0.2, 0.23, 1],
  keyword: [0.76, 0.52, 0.95, 1],
  string: [0.67, 0.82, 0.54, 1],
  number: [0.93, 0.7, 0.47, 1],
  comment: [0.45, 0.5, 0.56, 1],
  operator: [0.74, 0.78, 0.85, 1],
  function: [0.53, 0.72, 0.95, 1],
  type: [0.48, 0.83, 0.75, 1]
};

// src/app/mini_buffer.ts
var MiniBuffer = class {
  text = "";
  cursor = 0;
  anchor = 0;
  constructor(text = "") {
    this.text = text;
    this.cursor = text.length;
    this.anchor = this.cursor;
  }
  hasSelection() {
    return this.cursor !== this.anchor;
  }
  selectedText() {
    const [a, b] = this.ordered();
    return this.text.slice(a, b);
  }
  replaceSelection(text) {
    const [a, b] = this.ordered();
    this.text = this.text.slice(0, a) + text + this.text.slice(b);
    this.cursor = a + text.length;
    this.anchor = this.cursor;
  }
  deleteBackward() {
    if (this.hasSelection()) {
      this.replaceSelection("");
      return;
    }
    if (this.cursor === 0) return;
    this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
    this.cursor--;
    this.anchor = this.cursor;
  }
  deleteForward() {
    if (this.hasSelection()) {
      this.replaceSelection("");
      return;
    }
    if (this.cursor >= this.text.length) return;
    this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1);
  }
  move(command, extend = false) {
    let next = this.cursor;
    if (command === "left") next = Math.max(0, this.cursor - 1);
    else if (command === "right") next = Math.min(this.text.length, this.cursor + 1);
    else if (command === "lineStart" || command === "docStart") next = 0;
    else if (command === "lineEnd" || command === "docEnd") next = this.text.length;
    else if (command === "wordLeft") next = wordLeft(this.text, this.cursor);
    else if (command === "wordRight") next = wordRight(this.text, this.cursor);
    this.cursor = next;
    if (!extend) this.anchor = this.cursor;
  }
  selectAll() {
    this.anchor = 0;
    this.cursor = this.text.length;
  }
  ordered() {
    return this.anchor <= this.cursor ? [this.anchor, this.cursor] : [this.cursor, this.anchor];
  }
};
function wordLeft(text, cursor) {
  let i = cursor;
  while (i > 0 && /\s/.test(text.charAt(i - 1))) i--;
  while (i > 0 && /\w/.test(text.charAt(i - 1))) i--;
  return i;
}
function wordRight(text, cursor) {
  let i = cursor;
  while (i < text.length && /\s/.test(text.charAt(i))) i++;
  while (i < text.length && /\w/.test(text.charAt(i))) i++;
  return i;
}

// src/app/editor_app.ts
var DOCK_SPLITTER_GAP = 1;
var DOCK_SPLITTER_HIT_SIZE = 9;
var DOCK_MIN_PANEL_SIZE = 140;
var EDITOR_SCROLLBAR_SIZE = 12;
var EDITOR_SCROLLBAR_THUMB_MIN = 24;
var EDITOR_GUTTER_MIN_DIGITS = 3;
var EDITOR_GUTTER_PAD_LEFT = 10;
var EDITOR_GUTTER_PAD_RIGHT = 12;
var EDITOR_TEXT_PAD_X = 8;
var EDITOR_TEXT_TRAILING_PAD_X = 20;
var PANEL_HEADER_H = 32;
var CONTEXT_MENU_WIDTH = 136;
var CONTEXT_MENU_ROW_H = 28;
var CONTEXT_MENU_PAD = 4;
var MODAL_WIDTH = 420;
var MODAL_BUTTON_H = 30;
var MODAL_BUTTON_GAP = 8;
var TAB_DRAG_THRESHOLD = 6;
var TOUCH_DOUBLE_TAP_MS = 420;
var TOUCH_DOUBLE_TAP_DISTANCE = 28;
var CARET_BLINK_HALF_MS = 530;
var EditorApp = class {
  constructor(canvas, vfs, fontSources) {
    this.canvas = canvas;
    this.vfs = vfs;
    this.viewport = new ViewportService(canvas);
    this.viewport.start();
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 is required");
    this.renderer = new WebglRenderer(canvas, this.viewport.get(), fontSources);
    this.docs = new DocumentStore(vfs);
    this.input = new InputBridge(document.body);
    this.chat = new ChatHarness(vfs);
    this.installEvents();
  }
  canvas;
  vfs;
  input;
  viewport;
  renderer;
  docs;
  highlighter = new Highlighter();
  chat;
  searchBuffer = new MiniBuffer();
  chatBuffer = new MiniBuffer();
  renameBuffer = new MiniBuffer();
  sidebarMode = "files";
  sidebarWidth = 280;
  lastSidebarWidth = 280;
  files = [];
  treeNodes = [];
  expandedFolders = /* @__PURE__ */ new Set();
  knownFolders = /* @__PURE__ */ new Set();
  searchResults = [];
  openTabs = [];
  activeDocId = null;
  activeGroupId = "group-main";
  groups = [makeGroup("group-main")];
  dockRoot = { type: "leaf", group: this.groups[0] };
  scrollStates = /* @__PURE__ */ new Map();
  statusText = "Ready";
  hits = [];
  raf = 0;
  selecting = false;
  resizingSidebar = false;
  dockResize = null;
  scrollbarDrag = null;
  hoveredScrollbar = null;
  contextMenu = null;
  contextMenuHover = null;
  modal = null;
  modalHover = null;
  renamePath = null;
  renameSelecting = false;
  searchSelecting = false;
  caretBlinkEpoch = performance.now();
  caretBlinkTimer = 0;
  pendingTabDrag = null;
  tabDrag = null;
  dockPreview = null;
  lastTouchTap = null;
  editorRect = { x: 0, y: 0, w: 0, h: 0 };
  async start() {
    await this.refreshFiles();
    const first = this.files.find((file) => file.path === "/README.md") ?? this.files[0];
    if (first) await this.openFile(first.path);
    this.draw();
    this.scheduleDraw();
  }
  activeDoc() {
    return this.activeDocId ? this.docs.get(this.activeDocId) : void 0;
  }
  async refreshFiles() {
    this.treeNodes = await this.listTreeNodes("/");
    this.files = this.treeNodes.filter((node) => node.kind === "file");
    this.syncFileTreeFolders();
  }
  async listTreeNodes(path) {
    const children = (await this.vfs.listDir(path)).filter((node) => node.path !== "/" && !node.path.startsWith("/.slug-"));
    const result = [];
    for (const node of children) {
      result.push(node);
      if (node.kind === "dir") result.push(...await this.listTreeNodes(node.path));
    }
    return result;
  }
  async openFile(path) {
    const doc = await this.docs.open(path);
    const existing = this.groupContaining(doc.id);
    const group = existing ?? this.activeGroup();
    if (!group.tabs.includes(doc.id)) group.tabs.push(doc.id);
    group.activeDocId = doc.id;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.syncOpenTabs();
    this.statusText = `Opened ${path}`;
    if (!this.renamePath) this.focusEditor();
    this.scheduleDraw();
  }
  scheduleDraw() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }
  resetCaretBlink() {
    this.caretBlinkEpoch = performance.now();
    if (this.caretBlinkTimer) {
      window.clearTimeout(this.caretBlinkTimer);
      this.caretBlinkTimer = 0;
    }
    this.syncInputBridgeSelection();
    this.scheduleDraw();
  }
  syncInputBridgeSelection() {
    const target = this.input.activeTarget;
    if (!target || this.input.composing) return;
    this.input.syncSelectionForClipboard(target.getSelectedText());
  }
  isCaretBlinkOn() {
    return Math.floor((performance.now() - this.caretBlinkEpoch) / CARET_BLINK_HALF_MS) % 2 === 0;
  }
  scheduleCaretBlinkFrame() {
    if (!this.hasBlinkingCaretOwner() || this.caretBlinkTimer) return;
    const elapsed = performance.now() - this.caretBlinkEpoch;
    const wait = CARET_BLINK_HALF_MS - elapsed % CARET_BLINK_HALF_MS;
    this.caretBlinkTimer = window.setTimeout(() => {
      this.caretBlinkTimer = 0;
      this.scheduleDraw();
    }, Math.max(16, wait + 1));
  }
  getStateForTests() {
    return {
      activePath: this.activeDoc()?.path,
      activeText: this.activeDoc()?.getText(),
      selectedText: this.activeDoc()?.selectedText() ?? "",
      openTabs: this.openTabs.map((id) => this.docs.get(id)?.path ?? "(untitled)"),
      sidebarMode: this.sidebarMode,
      sidebarVisible: this.sidebarWidth > 0,
      searchQuery: this.searchBuffer.text,
      searchSelectedText: this.searchBuffer.selectedText(),
      searchInputRect: this.searchInputRect(),
      searchCaretVisible: this.isSearchCaretVisible(),
      searchResults: this.searchResults,
      chatMessages: this.chat.messages,
      activeInputKind: this.input.activeTarget?.kind ?? null,
      chatDraft: this.chatBuffer.text,
      renamePath: this.renamePath,
      renameText: this.renameBuffer.text,
      renameSelectedText: this.renameBuffer.selectedText(),
      renameInputRect: this.renameInputRect(),
      caretBlinkOn: this.isCaretBlinkOn(),
      renameCaretVisible: this.isRenameCaretVisible(),
      sidebarWidth: this.sidebarWidth,
      fileTargets: this.hits.filter((hit) => hit.type === "file").map((hit) => ({ path: hit.path, rect: hit.rect })),
      folderTargets: this.hits.filter((hit) => hit.type === "folder").map((hit) => ({ path: hit.path, expanded: hit.expanded, rect: hit.rect })),
      filesRootTarget: this.hits.find((hit) => hit.type === "filesRoot")?.rect ?? null,
      tabTargets: this.tabHitState("tab"),
      tabCloseTargets: this.tabHitState("tabClose"),
      editorGroups: this.groups.map((group) => {
        const doc = group.activeDocId ? this.docs.get(group.activeDocId) : void 0;
        return {
          id: group.id,
          activePath: doc?.path ?? null,
          tabs: group.tabs.map((id) => this.docs.get(id)?.path ?? "(untitled)"),
          cursor: doc?.selection.head ?? null,
          caretVisible: doc ? this.isDocumentCaretVisible(group, doc.id) : false,
          scrollX: doc ? this.scrollForDoc(doc.id).x : 0,
          scrollY: doc ? this.scrollForDoc(doc.id).y : 0,
          gutterWidth: doc ? this.gutterWidthForDoc(doc) : 0,
          frameRect: group.frameRect,
          editorRect: group.editorRect
        };
      }),
      visibleCarets: this.groups.flatMap((group) => {
        const doc = group.activeDocId ? this.docs.get(group.activeDocId) : void 0;
        if (!doc || !this.isDocumentCaretVisible(group, doc.id)) return [];
        return [{ groupId: group.id, path: doc.path ?? "(untitled)", cursor: doc.selection.head, rect: this.caretRect(doc, group.editorRect) }];
      }),
      dockPreview: this.dockPreview,
      dragGhost: this.tabDrag ? this.dragGhostRect() : null,
      dockOverlayTargets: this.tabDrag ? this.allDockTargets().map((target) => ({ groupId: target.groupId, zone: target.zone, polygon: target.polygon, previewRect: target.previewRect })) : [],
      sidebarResizeTarget: this.hits.find((hit) => hit.type === "sidebarResize")?.rect ?? null,
      dockSplitters: this.hits.filter((hit) => hit.type === "dockResize").map((hit) => ({ splitId: hit.splitId, index: hit.index, direction: hit.direction, rect: hit.rect })),
      editorScrollbars: this.hits.filter((hit) => hit.type === "editorScrollbar").map((hit) => ({ axis: hit.axis, groupId: hit.groupId, path: this.docs.get(hit.docId)?.path ?? "(untitled)", rect: hit.rect, trackRect: hit.trackRect, thumbRect: hit.thumbRect })),
      hoveredScrollbar: this.hoveredScrollbar ? { axis: this.hoveredScrollbar.axis, groupId: this.hoveredScrollbar.groupId, path: this.docs.get(this.hoveredScrollbar.docId)?.path ?? "(untitled)", overThumb: this.hoveredScrollbar.overThumb } : null,
      contextMenu: this.contextMenu ? { scope: this.contextMenu.scope, rect: this.contextMenu.rect, items: this.contextMenu.items.map((item) => ({ command: item.command, label: item.label, rect: item.rect, enabled: item.enabled })) } : null,
      modal: this.modal ? {
        kind: this.modal.kind,
        title: this.modal.title,
        message: this.modal.message,
        detail: this.modal.detail,
        pending: this.modal.pending,
        buttons: this.modal.buttons.map((button) => ({ action: button.action, label: button.label, rect: button.rect, enabled: button.enabled }))
      } : null,
      renderer: this.renderer.diagnostics(),
      canvas: { width: this.canvas.width, height: this.canvas.height, cssWidth: this.viewport.get().cssWidth, cssHeight: this.viewport.get().cssHeight }
    };
  }
  installEvents() {
    this.viewport.onChange(() => this.scheduleDraw());
    this.vfs.watch(() => {
      void this.refreshFiles().then(() => this.scheduleDraw());
    });
    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    this.canvas.addEventListener("pointerleave", () => this.clearScrollbarHover());
    this.canvas.addEventListener("click", (event) => this.onClick(event));
    this.canvas.addEventListener("contextmenu", (event) => this.onContextMenu(event));
    this.canvas.addEventListener("dblclick", (event) => this.onDoubleClick(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("keydown", (event) => {
      if (this.modal) {
        const action = event.key === "Escape" ? this.modal.cancelAction : event.key === "Enter" ? this.modal.defaultAction : null;
        if (action) void this.runModalAction(action);
        if (action || event.key === "Tab") {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (event.key !== "Escape" || !this.contextMenu) return;
      event.preventDefault();
      this.closeContextMenu();
    });
    this.canvas.addEventListener("wheel", (event) => {
      if (this.modal) {
        event.preventDefault();
        return;
      }
      const canvasRect = this.canvas.getBoundingClientRect();
      const point = { x: event.clientX - canvasRect.left, y: event.clientY - canvasRect.top };
      const group = this.editorGroupAt(point.x, point.y);
      const doc = group?.activeDocId ? this.docs.get(group.activeDocId) : void 0;
      if (!group || !doc) return;
      event.preventDefault();
      const scroll = this.scrollForDoc(doc.id);
      const deltaY = this.normalizedWheelDelta(event.deltaY, event.deltaMode, group.editorRect);
      const deltaX = this.normalizedWheelDelta(event.deltaX, event.deltaMode, group.editorRect) + (event.shiftKey ? deltaY : 0);
      if (!event.shiftKey) scroll.y = clamp(scroll.y + deltaY, 0, this.maxScrollY(doc, group.editorRect));
      scroll.x = clamp(scroll.x + deltaX, 0, this.maxScrollX(doc, group.editorRect));
      this.scheduleDraw();
    }, { passive: false });
    this.canvas.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (this.modal) {
        if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
        return;
      }
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    this.canvas.addEventListener("drop", (event) => {
      event.preventDefault();
      if (this.modal) return;
      if (!event.dataTransfer) return;
      void importDataTransfer(this.vfs, event.dataTransfer.items, (progress) => {
        this.statusText = `Imported ${progress.files} files`;
        this.scheduleDraw();
      }).then(() => this.refreshFiles()).then(() => this.scheduleDraw());
    });
  }
  onPointerDown(event) {
    const point = this.viewport.pointerToCanvasCss(event);
    const hit = this.hitAt(point.x, point.y);
    if (this.modal) {
      event.preventDefault();
      if (hit?.type === "modalButton" && hit.enabled) void this.runModalAction(hit.action);
      return;
    }
    if (this.contextMenu) {
      event.preventDefault();
      if (hit?.type === "contextMenu") {
        if (hit.enabled) void this.runContextMenuCommand(hit.command);
        return;
      }
      this.closeContextMenu();
      return;
    }
    if (this.renamePath && hit?.type !== "fileRenameInput") {
      event.preventDefault();
      void this.commitRename();
      return;
    }
    if (!hit) return;
    if (this.handleTouchDoubleTap(event, point, hit)) return;
    event.preventDefault();
    if (this.isContextMenuPointer(event)) return;
    this.updateScrollbarHover(hit, point);
    if (hit.type === "activity") {
      this.toggleActivityMode(hit.mode);
      this.draw();
    } else if (hit.type === "sidebarResize") {
      this.resizingSidebar = true;
      this.canvas.style.cursor = "col-resize";
    } else if (hit.type === "dockResize") {
      this.startDockResize(hit, point);
    } else if (hit.type === "editorScrollbar") {
      this.startScrollbarDrag(hit, point);
    } else if (hit.type === "folder") {
      this.toggleFolder(hit.path);
    } else if (hit.type === "filesRoot") {
      this.focusEditor();
    } else if (hit.type === "file") {
      if (event.detail >= 2) this.startRename(hit.path, hit.rect);
      else void this.openFile(hit.path);
    } else if (hit.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      this.setRenameCursorFromPoint(point.x, hit.rect, false);
      this.renameSelecting = true;
    } else if (hit.type === "tabClose") {
      void this.requestCloseTab(hit.docId);
    } else if (hit.type === "tab") {
      if (event.button === 1) {
        void this.requestCloseTab(hit.docId);
        return;
      }
      this.activeGroupId = hit.groupId;
      this.activeDocId = hit.docId;
      this.groupById(hit.groupId).activeDocId = hit.docId;
      this.pendingTabDrag = { docId: hit.docId, groupId: hit.groupId, startPoint: { ...point } };
      this.focusEditor();
      this.scheduleDraw();
    } else if (hit.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      this.setSearchCursorFromPoint(point.x, hit.rect, false);
      this.searchSelecting = true;
    } else if (hit.type === "searchResult") {
      void this.openFile(hit.path).then(() => {
        const doc = this.activeDoc();
        if (doc) doc.setSelection({ line: hit.line, col: 0 });
        this.resetCaretBlink();
      });
    } else if (hit.type === "chatInput") {
      this.focusMiniTarget("chat", hit.rect);
    } else if (hit.type === "editor") {
      this.activeGroupId = hit.groupId;
      this.activeDocId = this.groupById(hit.groupId).activeDocId;
      const doc = this.activeDoc();
      if (!doc) return;
      if (!this.isMobileContextMode() && event.detail >= 3) {
        this.selecting = false;
        this.selectEditorLineFromPoint(doc, hit.rect, point);
        this.focusEditor();
        return;
      }
      const pos = this.positionFromPoint(point.x, point.y);
      doc.setSelection(pos);
      this.selecting = true;
      this.focusEditor();
      this.resetCaretBlink();
    }
  }
  onPointerMove(event) {
    const point = this.viewport.pointerToCanvasCss(event);
    if (this.modal) {
      event.preventDefault();
      const hover2 = this.hitAt(point.x, point.y);
      this.updateModalHover(hover2);
      this.canvas.style.cursor = "";
      return;
    }
    if (this.renameSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "fileRenameInput" ? hit.rect : this.renameInputRect();
      if (rect) this.setRenameCursorFromPoint(point.x, rect, true);
      return;
    }
    if (this.searchSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "searchInput" ? hit.rect : this.searchInputRect();
      if (rect) this.setSearchCursorFromPoint(point.x, rect, true);
      return;
    }
    if (this.pendingTabDrag) {
      const distance = Math.hypot(point.x - this.pendingTabDrag.startPoint.x, point.y - this.pendingTabDrag.startPoint.y);
      if (distance < TAB_DRAG_THRESHOLD) return;
      event.preventDefault();
      const pending = this.pendingTabDrag;
      this.pendingTabDrag = null;
      this.startTabDrag(pending.docId, pending.groupId, pending.startPoint);
      if (this.tabDrag) {
        this.tabDrag.pointer = point;
        this.updateDockPreview(point);
      }
      return;
    }
    if (this.resizingSidebar) {
      event.preventDefault();
      this.sidebarWidth = this.clampSidebarWidth(point.x - 48);
      this.statusText = `Sidebar ${Math.round(this.sidebarWidth)}px`;
      this.scheduleDraw();
      return;
    }
    if (this.scrollbarDrag) {
      event.preventDefault();
      this.dragScrollbar(point);
      this.canvas.style.cursor = "";
      return;
    }
    if (this.dockResize) {
      event.preventDefault();
      this.resizeDockSplit(point);
      return;
    }
    if (this.tabDrag) {
      event.preventDefault();
      this.tabDrag.pointer = point;
      this.updateDockPreview(point);
      return;
    }
    const hover = this.hitAt(point.x, point.y);
    this.updateContextMenuHover(hover);
    this.updateScrollbarHover(hover, point);
    this.canvas.style.cursor = this.cursorForHit(hover);
    if (!this.selecting) return;
    const doc = this.activeDoc();
    if (!doc) return;
    const pos = this.positionFromPoint(point.x, point.y);
    doc.setSelection(doc.selection.anchor, pos);
    this.resetCaretBlink();
  }
  onPointerUp(event) {
    const point = this.viewport.pointerToCanvasCss(event);
    if (this.modal) {
      const hover2 = this.hitAt(point.x, point.y);
      this.updateModalHover(hover2);
      this.canvas.style.cursor = "";
      return;
    }
    if (this.tabDrag) {
      this.tabDrag.pointer = point;
      this.updateDockPreview(point);
      this.applyTabDrop();
    }
    this.selecting = false;
    this.resizingSidebar = false;
    this.dockResize = null;
    this.scrollbarDrag = null;
    this.renameSelecting = false;
    this.searchSelecting = false;
    this.pendingTabDrag = null;
    this.tabDrag = null;
    this.dockPreview = null;
    const hover = this.hitAt(point.x, point.y);
    this.updateScrollbarHover(hover, point);
    this.canvas.style.cursor = this.cursorForHit(hover);
    this.draw();
  }
  onContextMenu(event) {
    event.preventDefault();
    if (this.modal) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit?.type === "contextMenu") return;
    if (hit?.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      if (!this.pointHitsRenameSelection(point.x, hit.rect)) this.setRenameCursorFromPoint(point.x, hit.rect, false);
      this.openRenameTextContextMenu(point, hit.path);
      return;
    }
    if (hit?.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      if (!this.pointHitsSearchSelection(point.x, hit.rect)) this.setSearchCursorFromPoint(point.x, hit.rect, false);
      this.openSearchTextContextMenu(point);
      return;
    }
    if (hit?.type === "file") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.openFileContextMenu(point, hit.path);
      return;
    }
    if (hit?.type === "folder") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.openFolderContextMenu(point, hit.path);
      return;
    }
    if (hit?.type === "filesRoot") {
      if (this.renamePath) void this.commitRename();
      this.openRootContextMenu(point);
      return;
    }
    if (!hit || hit.type !== "editor") {
      this.closeContextMenu();
      return;
    }
    const group = this.groupById(hit.groupId);
    const docId = group.activeDocId;
    const doc = docId ? this.docs.get(docId) : void 0;
    if (!doc) {
      this.closeContextMenu();
      return;
    }
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    if (!this.pointHitsSelection(doc, group.editorRect, point)) {
      doc.setSelection(this.positionFromPoint(point.x, point.y));
    }
    this.openEditorContextMenu(point, group, doc);
    this.focusEditor();
  }
  onClick(event) {
    if (event.detail < 3 || this.modal || this.contextMenu || this.isMobileContextMode()) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit?.type !== "editor") return;
    event.preventDefault();
    const group = this.groupById(hit.groupId);
    const docId = group.activeDocId;
    const doc = docId ? this.docs.get(docId) : void 0;
    if (!doc) return;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.selecting = false;
    this.selectEditorLineFromPoint(doc, group.editorRect, point);
    this.focusEditor();
  }
  onDoubleClick(event) {
    event.preventDefault();
    if (this.modal) return;
    if (this.contextMenu && this.isMobileContextMode()) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit && this.isMobileContextMode()) {
      this.openContextMenuForHit(point, hit, true);
      return;
    }
    if (hit?.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      this.selectRenameWordFromPoint(point.x, hit.rect);
    } else if (hit?.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      this.selectSearchWordFromPoint(point.x, hit.rect);
    } else if (hit?.type === "file") {
      this.startRename(hit.path, hit.rect);
    } else if (hit?.type === "editor") {
      const group = this.groupById(hit.groupId);
      const docId = group.activeDocId;
      const doc = docId ? this.docs.get(docId) : void 0;
      if (!doc) return;
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      this.selectEditorWordFromPoint(doc, group.editorRect, point);
      this.focusEditor();
    }
  }
  focusEditor() {
    const doc = this.activeDoc();
    if (!doc) return;
    this.input.focusEditor(this.editorTarget(), this.caretRect(doc));
    this.resetCaretBlink();
  }
  focusMiniTarget(kind, rect) {
    this.input.focusEditor(this.miniTarget(kind), rect);
    this.resetCaretBlink();
  }
  focusActivityMode(mode) {
    const vp = this.viewport.get();
    const sidebarX = 48;
    if (mode === "search") {
      this.focusMiniTarget("search", { x: sidebarX + 10, y: 40, w: this.sidebarWidth - 20, h: 28 });
    } else if (mode === "chat") {
      this.focusMiniTarget("chat", { x: sidebarX + 10, y: vp.cssHeight - 70, w: this.sidebarWidth - 20, h: 38 });
    } else {
      this.focusEditor();
    }
  }
  toggleActivityMode(mode) {
    if (this.sidebarWidth > 0 && this.sidebarMode === mode) {
      this.lastSidebarWidth = this.sidebarWidth;
      this.sidebarWidth = 0;
      this.statusText = "Sidebar hidden";
      this.focusEditor();
      return;
    }
    this.sidebarMode = mode;
    this.sidebarWidth = this.lastSidebarWidth || 280;
    this.statusText = `${mode[0].toUpperCase()}${mode.slice(1)} panel`;
    this.focusActivityMode(mode);
  }
  hitAt(x, y) {
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const hit = this.hits[i];
      if (rectContains(hit.rect, x, y)) return hit;
    }
    return void 0;
  }
  cursorForHit(hit) {
    if (!hit) return "";
    if (hit.type === "sidebarResize") return "col-resize";
    if (hit.type === "dockResize") return hit.direction === "row" ? "col-resize" : "row-resize";
    return "";
  }
  updateScrollbarHover(hit, point) {
    const next = hit?.type === "editorScrollbar" ? { axis: hit.axis, groupId: hit.groupId, docId: hit.docId, overThumb: rectContains(hit.thumbRect, point.x, point.y) } : null;
    const changed = this.hoveredScrollbar?.axis !== next?.axis || this.hoveredScrollbar?.groupId !== next?.groupId || this.hoveredScrollbar?.docId !== next?.docId || this.hoveredScrollbar?.overThumb !== next?.overThumb;
    if (!changed) return;
    this.hoveredScrollbar = next;
    this.scheduleDraw();
  }
  clearScrollbarHover() {
    if (!this.hoveredScrollbar || this.scrollbarDrag) return;
    this.hoveredScrollbar = null;
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  isContextMenuPointer(event) {
    return event.button === 2 || event.button === 0 && event.ctrlKey;
  }
  isMobileContextMode() {
    return navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches;
  }
  handleTouchDoubleTap(event, point, hit) {
    if (event.pointerType !== "touch") return false;
    const key = this.doubleTapKey(hit);
    if (!key) {
      this.lastTouchTap = null;
      return false;
    }
    const now = performance.now();
    const last = this.lastTouchTap;
    this.lastTouchTap = { time: now, point: { ...point }, key };
    if (!last || last.key !== key) return false;
    if (now - last.time > TOUCH_DOUBLE_TAP_MS) return false;
    if (Math.hypot(point.x - last.point.x, point.y - last.point.y) > TOUCH_DOUBLE_TAP_DISTANCE) return false;
    this.lastTouchTap = null;
    event.preventDefault();
    this.openContextMenuForHit(point, hit, true);
    return true;
  }
  doubleTapKey(hit) {
    if (hit.type === "file") return `file:${hit.path}`;
    if (hit.type === "folder") return `folder:${hit.path}`;
    if (hit.type === "filesRoot") return "filesRoot";
    if (hit.type === "fileRenameInput") return `rename:${hit.path}`;
    if (hit.type === "searchInput") return "searchInput";
    if (hit.type === "editor") return `editor:${hit.groupId}`;
    return null;
  }
  openContextMenuForHit(point, hit, selectTextFirst = false) {
    if (hit.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      if (selectTextFirst) this.selectRenameWordFromPoint(point.x, hit.rect);
      else if (!this.pointHitsRenameSelection(point.x, hit.rect)) this.setRenameCursorFromPoint(point.x, hit.rect, false);
      this.openRenameTextContextMenu(point, hit.path);
      return true;
    }
    if (hit.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      if (selectTextFirst) this.selectSearchWordFromPoint(point.x, hit.rect);
      else if (!this.pointHitsSearchSelection(point.x, hit.rect)) this.setSearchCursorFromPoint(point.x, hit.rect, false);
      this.openSearchTextContextMenu(point);
      return true;
    }
    if (hit.type === "file") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.openFileContextMenu(point, hit.path);
      return true;
    }
    if (hit.type === "folder") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.openFolderContextMenu(point, hit.path);
      return true;
    }
    if (hit.type === "filesRoot") {
      if (this.renamePath) void this.commitRename();
      this.openRootContextMenu(point);
      return true;
    }
    if (hit.type === "editor") {
      const group = this.groupById(hit.groupId);
      const docId = group.activeDocId;
      const doc = docId ? this.docs.get(docId) : void 0;
      if (!doc) {
        this.closeContextMenu();
        return false;
      }
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      group.activeDocId = doc.id;
      if (selectTextFirst) this.selectEditorWordFromPoint(doc, group.editorRect, point);
      else if (!this.pointHitsSelection(doc, group.editorRect, point)) doc.setSelection(this.positionFromPoint(point.x, point.y));
      this.openEditorContextMenu(point, group, doc);
      this.focusEditor();
      return true;
    }
    return false;
  }
  updateContextMenuHover(hit) {
    const next = hit?.type === "contextMenu" && hit.enabled ? hit.command : null;
    if (this.contextMenuHover === next) return;
    this.contextMenuHover = next;
    if (this.contextMenu) this.scheduleDraw();
  }
  updateModalHover(hit) {
    const next = hit?.type === "modalButton" && hit.enabled ? hit.action : null;
    if (this.modalHover === next) return;
    this.modalHover = next;
    if (this.modal) this.scheduleDraw();
  }
  closeContextMenu() {
    if (!this.contextMenu) return;
    this.contextMenu = null;
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openEditorContextMenu(point, group, doc) {
    const selected = doc.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "editor", groupId: group.id, docId: doc.id }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openFileContextMenu(point, path) {
    this.contextMenu = this.makeContextMenu(point, { type: "file", path }, [
      { command: "rename", label: "Rename", enabled: true },
      { command: "duplicate", label: "Duplicate", enabled: true },
      { command: "delete", label: "Delete", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openFolderContextMenu(point, path) {
    this.contextMenu = this.makeContextMenu(point, { type: "folder", path }, [
      { command: "rename", label: "Rename", enabled: true },
      { command: "delete", label: "Delete", enabled: true },
      { command: "createFile", label: "Create File", enabled: true },
      { command: "createFolder", label: "Create Folder", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openRootContextMenu(point) {
    this.contextMenu = this.makeContextMenu(point, { type: "root", path: "/" }, [
      { command: "createFile", label: "Create File", enabled: true },
      { command: "createFolder", label: "Create Folder", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openRenameTextContextMenu(point, path) {
    const selected = this.renameBuffer.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "rename", path }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openSearchTextContextMenu(point) {
    const selected = this.searchBuffer.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "search" }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  makeContextMenu(point, scope, entries) {
    const vp = this.viewport.get();
    const menuH = CONTEXT_MENU_PAD * 2 + CONTEXT_MENU_ROW_H * entries.length;
    const x = clamp(point.x, 0, Math.max(0, vp.cssWidth - CONTEXT_MENU_WIDTH - 1));
    const y = clamp(point.y, 0, Math.max(0, vp.cssHeight - menuH - 1));
    const rect = { x, y, w: CONTEXT_MENU_WIDTH, h: menuH };
    const items = entries.map((entry, index) => ({
      ...entry,
      rect: {
        x: x + CONTEXT_MENU_PAD,
        y: y + CONTEXT_MENU_PAD + CONTEXT_MENU_ROW_H * index,
        w: CONTEXT_MENU_WIDTH - CONTEXT_MENU_PAD * 2,
        h: CONTEXT_MENU_ROW_H
      }
    }));
    return { scope, rect, items };
  }
  openModal(modal) {
    this.contextMenu = null;
    this.contextMenuHover = null;
    this.modal = modal;
    this.modalHover = null;
    this.input.blur();
    this.scheduleDraw();
  }
  closeModal() {
    if (!this.modal) return;
    this.modal = null;
    this.modalHover = null;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  openDirtyCloseModal(doc) {
    const label = doc.path ?? "(untitled)";
    this.openModal({
      kind: "dirtyClose",
      title: "Save before closing?",
      message: `${label} has unsaved changes.`,
      detail: "Save your changes before closing this tab?",
      docId: doc.id,
      defaultAction: "save",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("save", "Save", "primary"),
        modalButton("discard", "Don't Save", "secondary"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  openDeleteFolderModal(path, itemCount) {
    this.openModal({
      kind: "deleteFolder",
      title: "Delete non-empty folder?",
      message: `Delete ${path} and all contents?`,
      detail: `${itemCount} item${itemCount === 1 ? "" : "s"} will be deleted. Open files inside this folder will be closed.`,
      path,
      defaultAction: "delete",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("delete", "Delete", "danger"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  async runModalAction(action) {
    const modal = this.modal;
    const button = modal?.buttons.find((candidate) => candidate.action === action);
    if (!modal || !button?.enabled || modal.pending) return;
    if (action === "cancel") {
      this.statusText = "Canceled";
      this.closeModal();
      return;
    }
    modal.pending = true;
    this.scheduleDraw();
    try {
      if (modal.kind === "dirtyClose") await this.runDirtyCloseModalAction(modal, action);
      else await this.runDeleteFolderModalAction(modal, action);
    } catch (error) {
      if (this.modal !== modal) throw error;
      modal.pending = false;
      this.statusText = error instanceof Error ? error.message : "Operation failed";
      this.scheduleDraw();
    }
  }
  async runDirtyCloseModalAction(modal, action) {
    const doc = this.docs.get(modal.docId);
    if (!doc) {
      this.closeModal();
      return;
    }
    if (action !== "save" && action !== "discard") return;
    if (action === "save") await this.docs.save(doc);
    const path = doc.path;
    this.modal = null;
    this.modalHover = null;
    this.closeTab(doc.id);
    if (action === "discard" && path) this.docs.removePath(path);
    this.statusText = action === "save" ? `Saved and closed ${path ?? "tab"}` : `Closed ${path ?? "tab"} without saving`;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  async runDeleteFolderModalAction(modal, action) {
    if (action !== "delete") return;
    await this.deleteFolderNow(modal.path);
    if (this.modal === modal) {
      this.modal = null;
      this.modalHover = null;
      if (this.activeDocId) this.focusEditor();
      else this.input.blur();
      this.scheduleDraw();
    }
  }
  startRename(path, rect) {
    this.closeContextMenu();
    this.renamePath = normalizePath(path);
    const name = basename(path);
    const selectedEnd = fileStemSelectionEnd(name);
    this.renameBuffer.text = name;
    this.renameBuffer.anchor = 0;
    this.renameBuffer.cursor = selectedEnd;
    this.statusText = `Renaming ${path}`;
    this.focusRename(rect);
    this.scheduleDraw();
  }
  focusRename(rect) {
    this.input.focusEditor(this.renameTarget(), rect ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 24 });
    this.resetCaretBlink();
  }
  cancelRename() {
    if (!this.renamePath) return;
    this.renamePath = null;
    this.renameSelecting = false;
    this.renameBuffer.text = "";
    this.renameBuffer.cursor = 0;
    this.renameBuffer.anchor = 0;
    this.statusText = "Rename canceled";
    this.focusEditor();
    this.scheduleDraw();
  }
  async commitRename() {
    const oldPath = this.renamePath;
    if (!oldPath) return false;
    const name = this.renameBuffer.text.trim();
    if (!isValidFileName(name)) {
      this.statusText = "File name is not valid";
      this.focusRename();
      return false;
    }
    const newPath = joinPath(dirname(oldPath), name);
    if (newPath === oldPath) {
      this.renamePath = null;
      this.renameSelecting = false;
      this.focusEditor();
      this.scheduleDraw();
      return true;
    }
    if (await this.vfs.stat(newPath)) {
      this.statusText = `File exists: ${newPath}`;
      this.focusRename();
      return false;
    }
    const node = await this.vfs.stat(oldPath);
    await this.vfs.rename(oldPath, newPath);
    if (node?.kind === "dir") {
      for (const doc of this.docs.all()) {
        if (!doc.path || !isSameOrDescendant(doc.path, oldPath)) continue;
        const nextPath = doc.path === oldPath ? newPath : joinPath(newPath, doc.path.slice(oldPath.length + 1));
        this.docs.renamePath(doc.path, nextPath);
      }
      this.remapFolderExpansion(oldPath, newPath);
    } else {
      this.docs.renamePath(oldPath, newPath);
    }
    this.renamePath = null;
    this.renameSelecting = false;
    await this.refreshFiles();
    this.syncOpenTabs();
    this.statusText = `Renamed ${oldPath} to ${newPath}`;
    this.focusEditor();
    this.contextMenuHover = null;
    this.scheduleDraw();
    return true;
  }
  setRenameCursorFromPoint(x, rect, extend) {
    const offset = x - (rect.x + 5);
    const col = this.columnFromTextOffset(this.renameBuffer.text, offset);
    this.renameBuffer.cursor = col;
    if (!extend) this.renameBuffer.anchor = col;
    this.resetCaretBlink();
  }
  selectRenameWordFromPoint(x, rect) {
    const offset = x - (rect.x + 5);
    const text = this.renameBuffer.text;
    if (!text) return;
    const col = this.columnFromTextOffset(text, offset);
    let index = clamp(col, 0, Math.max(0, text.length - 1));
    if (!isWordChar(text.charAt(index)) && col > 0 && isWordChar(text.charAt(col - 1))) index = col - 1;
    let start = index;
    let end = index + 1;
    if (isWordChar(text.charAt(index))) {
      while (start > 0 && isWordChar(text.charAt(start - 1))) start--;
      while (end < text.length && isWordChar(text.charAt(end))) end++;
    }
    this.renameBuffer.anchor = start;
    this.renameBuffer.cursor = end;
    this.resetCaretBlink();
  }
  pointHitsRenameSelection(x, rect) {
    if (!this.renameBuffer.hasSelection()) return false;
    const start = Math.min(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const end = Math.max(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const textX = rect.x + 5;
    const startX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  renameInputRect() {
    return this.hits.find((hit) => hit.type === "fileRenameInput")?.rect ?? null;
  }
  setSearchCursorFromPoint(x, rect, extend) {
    const offset = x - (rect.x + 8);
    const col = this.columnFromTextOffset(this.searchBuffer.text, offset);
    this.searchBuffer.cursor = col;
    if (!extend) this.searchBuffer.anchor = col;
    this.resetCaretBlink();
  }
  selectSearchWordFromPoint(x, rect) {
    const offset = x - (rect.x + 8);
    const text = this.searchBuffer.text;
    if (!text) return;
    const col = this.columnFromTextOffset(text, offset);
    let index = clamp(col, 0, Math.max(0, text.length - 1));
    if (!isWordChar(text.charAt(index)) && col > 0 && isWordChar(text.charAt(col - 1))) index = col - 1;
    let start = index;
    let end = index + 1;
    if (isWordChar(text.charAt(index))) {
      while (start > 0 && isWordChar(text.charAt(start - 1))) start--;
      while (end < text.length && isWordChar(text.charAt(end))) end++;
    }
    this.searchBuffer.anchor = start;
    this.searchBuffer.cursor = end;
    this.resetCaretBlink();
  }
  pointHitsSearchSelection(x, rect) {
    if (!this.searchBuffer.hasSelection()) return false;
    const start = Math.min(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const end = Math.max(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const textX = rect.x + 8;
    const startX = textX + this.renderer.measureText(this.searchBuffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(this.searchBuffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  searchInputRect() {
    return this.hits.find((hit) => hit.type === "searchInput")?.rect ?? null;
  }
  toggleFolder(path) {
    if (this.expandedFolders.has(path)) this.expandedFolders.delete(path);
    else this.expandedFolders.add(path);
    this.statusText = `${this.expandedFolders.has(path) ? "Expanded" : "Collapsed"} ${path}`;
    this.scheduleDraw();
  }
  syncFileTreeFolders() {
    const next = /* @__PURE__ */ new Set();
    for (const node of this.treeNodes) {
      if (node.kind !== "dir") continue;
      const path = normalizePath(node.path);
      next.add(path);
      if (!this.knownFolders.has(path)) this.expandedFolders.add(path);
    }
    for (const path of [...this.expandedFolders]) {
      if (!next.has(path)) this.expandedFolders.delete(path);
    }
    this.knownFolders.clear();
    for (const path of next) this.knownFolders.add(path);
  }
  remapFolderExpansion(oldPath, newPath) {
    const remapped = /* @__PURE__ */ new Map();
    for (const path of this.expandedFolders) {
      if (isSameOrDescendant(path, oldPath)) remapped.set(path, path === oldPath ? newPath : joinPath(newPath, path.slice(oldPath.length + 1)));
    }
    for (const [oldFolder, newFolder] of remapped) {
      this.expandedFolders.delete(oldFolder);
      this.expandedFolders.add(newFolder);
    }
  }
  removeFolderExpansion(path) {
    for (const folder of [...this.expandedFolders]) {
      if (isSameOrDescendant(folder, path)) this.expandedFolders.delete(folder);
    }
    this.knownFolders.delete(path);
  }
  fileTreeEntries() {
    const root = { type: "dir", path: "/", name: "", children: [] };
    const dirs = /* @__PURE__ */ new Map([["/", root]]);
    for (const node of this.treeNodes) {
      const path = normalizePath(node.path);
      const parts = path.split("/").filter(Boolean);
      let parent = root;
      let dirPath = "";
      const dirDepth = node.kind === "dir" ? parts.length : parts.length - 1;
      for (let i = 0; i < dirDepth; i++) {
        dirPath = `${dirPath}/${parts[i]}`;
        let dir = dirs.get(dirPath);
        if (!dir) {
          dir = { type: "dir", path: dirPath, name: parts[i], children: [] };
          dirs.set(dirPath, dir);
          parent.children.push(dir);
        }
        parent = dir;
      }
      if (node.kind === "file") parent.children.push({ type: "file", path, name: parts[parts.length - 1] ?? path });
    }
    sortFileTree(root.children);
    return root.children;
  }
  async requestCloseTab(docId) {
    const doc = this.docs.get(docId);
    if (!doc) return;
    if (doc.dirty) {
      this.openDirtyCloseModal(doc);
      return;
    }
    this.closeTab(docId);
  }
  closeTab(docId) {
    const group = this.groupContaining(docId);
    if (!group) return;
    const index = group.tabs.indexOf(docId);
    group.tabs.splice(index, 1);
    if (group.activeDocId === docId) {
      group.activeDocId = group.tabs[index] ?? group.tabs[index - 1] ?? null;
    }
    this.pruneDockTree();
    if (this.activeDocId === docId) {
      const nextGroup = this.groups.find((item) => item.activeDocId) ?? this.groups[0];
      this.activeGroupId = nextGroup.id;
      this.activeDocId = nextGroup.activeDocId;
      if (this.activeDocId) this.focusEditor();
      else this.input.blur();
    }
    this.syncOpenTabs();
    const doc = this.docs.get(docId);
    this.statusText = `Closed ${doc?.path ?? "tab"}`;
    this.scheduleDraw();
  }
  startTabDrag(docId, sourceGroupId, pointer) {
    const source = this.groupById(sourceGroupId);
    const sourceIndex = source.tabs.indexOf(docId);
    if (sourceIndex < 0) return;
    this.tabDrag = {
      docId,
      sourceGroupId,
      sourceIndex,
      restoreRoot: cloneDockNode(this.dockRoot),
      restoreActiveGroupId: this.activeGroupId,
      restoreActiveDocId: this.activeDocId,
      pointer: { ...pointer }
    };
    this.removeDocFromGroups(docId);
    const nextGroup = this.groups.find((group) => group.activeDocId) ?? this.groups[0];
    this.activeGroupId = nextGroup.id;
    this.activeDocId = nextGroup.activeDocId;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
    this.syncOpenTabs();
    this.statusText = `Moving ${this.docs.get(docId)?.path ?? "tab"}`;
    this.draw();
  }
  reorderDraggedTab(x, groupId) {
    if (!this.tabDrag) return;
    const group = this.groupById(groupId);
    if (group.id !== this.tabDrag.sourceGroupId) return;
    const current = group.tabs.indexOf(this.tabDrag.docId);
    if (current < 0) return;
    const tabs = this.hits.filter((hit) => hit.type === "tab" && hit.groupId === groupId);
    let target = tabs.length;
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      if (x < tab.rect.x + tab.rect.w / 2) {
        target = i;
        break;
      }
    }
    target = clamp(target, 0, group.tabs.length - 1);
    if (target === current) return;
    const [docId] = group.tabs.splice(current, 1);
    if (!docId) return;
    group.tabs.splice(target, 0, docId);
    this.syncOpenTabs();
    this.statusText = "Reordered tabs";
    this.draw();
  }
  clampSidebarWidth(width) {
    const vp = this.viewport.get();
    const min = Math.min(220, Math.max(160, vp.cssWidth - 48 - 180));
    const max = Math.max(min, Math.min(560, vp.cssWidth - 48 - 180));
    const next = clamp(width, min, max);
    this.lastSidebarWidth = next;
    return next;
  }
  scrollForDoc(docId) {
    let state = this.scrollStates.get(docId);
    if (!state) {
      state = { x: 0, y: 0 };
      this.scrollStates.set(docId, state);
    }
    return state;
  }
  editorGroupAt(x, y) {
    return this.groups.find((group) => rectContains(group.editorRect, x, y));
  }
  maxScrollY(doc, rect) {
    return Math.max(0, this.documentContentHeight(doc) - this.editorContentRect(doc, rect).h);
  }
  maxScrollX(doc, rect) {
    const contentRect = this.editorContentRect(doc, rect);
    return Math.max(0, this.documentContentWidth(doc) - this.visibleTextWidth(doc, contentRect));
  }
  editorContentRect(doc, rect) {
    return this.editorContentRectForOverflow(rect, this.editorOverflow(doc, rect));
  }
  editorContentRectForOverflow(rect, overflow) {
    return {
      x: rect.x,
      y: rect.y,
      w: Math.max(1, rect.w - (overflow.vertical ? EDITOR_SCROLLBAR_SIZE : 0)),
      h: Math.max(1, rect.h - (overflow.horizontal ? EDITOR_SCROLLBAR_SIZE : 0))
    };
  }
  editorOverflow(doc, rect) {
    let overflow = { vertical: false, horizontal: false };
    for (let i = 0; i < 4; i++) {
      const contentRect = this.editorContentRectForOverflow(rect, overflow);
      const next = {
        vertical: this.documentContentHeight(doc) > contentRect.h,
        horizontal: this.documentContentWidth(doc) > this.visibleTextWidth(doc, contentRect)
      };
      if (next.vertical === overflow.vertical && next.horizontal === overflow.horizontal) return next;
      overflow = next;
    }
    return overflow;
  }
  gutterWidthForDoc(doc) {
    const digits = Math.max(EDITOR_GUTTER_MIN_DIGITS, String(Math.max(1, doc.lineCount())).length);
    return Math.ceil(this.renderer.measureText("9".repeat(digits), "code") + EDITOR_GUTTER_PAD_LEFT + EDITOR_GUTTER_PAD_RIGHT);
  }
  editorTextX(doc, contentRect) {
    return contentRect.x + this.gutterWidthForDoc(doc) + EDITOR_TEXT_PAD_X;
  }
  visibleTextWidth(doc, contentRect) {
    return Math.max(1, contentRect.w - this.gutterWidthForDoc(doc) - EDITOR_TEXT_PAD_X * 2);
  }
  documentContentHeight(doc) {
    return doc.lineCount() * this.renderer.lineHeight("code");
  }
  documentContentWidth(doc) {
    let maxLineWidth = 0;
    for (const line of doc.lines) maxLineWidth = Math.max(maxLineWidth, this.renderer.measureText(line, "code"));
    return maxLineWidth + EDITOR_TEXT_TRAILING_PAD_X;
  }
  normalizedWheelDelta(value, mode, rect) {
    if (mode === WheelEvent.DOM_DELTA_LINE) return value * this.renderer.lineHeight("code");
    if (mode === WheelEvent.DOM_DELTA_PAGE) return value * rect.h;
    return value;
  }
  clampScrollForDoc(doc, rect) {
    const scroll = this.scrollForDoc(doc.id);
    scroll.y = clamp(scroll.y, 0, this.maxScrollY(doc, rect));
    scroll.x = clamp(scroll.x, 0, this.maxScrollX(doc, rect));
    return scroll;
  }
  startScrollbarDrag(hit, point) {
    const group = this.groupById(hit.groupId);
    const doc = this.docs.get(hit.docId);
    if (!doc) return;
    this.hoveredScrollbar = { axis: hit.axis, groupId: hit.groupId, docId: hit.docId, overThumb: rectContains(hit.thumbRect, point.x, point.y) };
    if (!rectContains(hit.thumbRect, point.x, point.y)) this.scrollDocumentFromScrollbarPoint(doc, group.editorRect, hit.axis, hit.trackRect, hit.thumbRect, point);
    const scroll = this.scrollForDoc(hit.docId);
    this.scrollbarDrag = {
      axis: hit.axis,
      groupId: hit.groupId,
      docId: hit.docId,
      startPoint: hit.axis === "vertical" ? point.y : point.x,
      startScroll: hit.axis === "vertical" ? scroll.y : scroll.x,
      trackRect: { ...hit.trackRect },
      thumbRect: { ...hit.thumbRect }
    };
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  dragScrollbar(point) {
    const drag = this.scrollbarDrag;
    if (!drag) return;
    const group = this.groupById(drag.groupId);
    const doc = this.docs.get(drag.docId);
    if (!doc) return;
    const maxScroll = drag.axis === "vertical" ? this.maxScrollY(doc, group.editorRect) : this.maxScrollX(doc, group.editorRect);
    const thumbTravel = Math.max(1, drag.axis === "vertical" ? drag.trackRect.h - drag.thumbRect.h : drag.trackRect.w - drag.thumbRect.w);
    const currentPoint = drag.axis === "vertical" ? point.y : point.x;
    const delta = (currentPoint - drag.startPoint) / thumbTravel * maxScroll;
    const scroll = this.scrollForDoc(doc.id);
    if (drag.axis === "vertical") scroll.y = clamp(drag.startScroll + delta, 0, maxScroll);
    else scroll.x = clamp(drag.startScroll + delta, 0, maxScroll);
    this.scheduleDraw();
  }
  scrollDocumentFromScrollbarPoint(doc, editorRect, axis, trackRect, thumbRect, point) {
    const maxScroll = axis === "vertical" ? this.maxScrollY(doc, editorRect) : this.maxScrollX(doc, editorRect);
    if (maxScroll <= 0) return;
    const scroll = this.scrollForDoc(doc.id);
    if (axis === "vertical") {
      const thumbTravel2 = Math.max(1, trackRect.h - thumbRect.h);
      const thumbTop = clamp(point.y - thumbRect.h / 2, trackRect.y, trackRect.y + thumbTravel2);
      scroll.y = (thumbTop - trackRect.y) / thumbTravel2 * maxScroll;
      return;
    }
    const thumbTravel = Math.max(1, trackRect.w - thumbRect.w);
    const thumbLeft = clamp(point.x - thumbRect.w / 2, trackRect.x, trackRect.x + thumbTravel);
    scroll.x = (thumbLeft - trackRect.x) / thumbTravel * maxScroll;
  }
  startDockResize(hit, point) {
    const split = findDockSplitNode(this.dockRoot, hit.splitId);
    if (!split) return;
    const weights = normalizeSplitWeights(split);
    this.dockResize = {
      splitId: hit.splitId,
      index: hit.index,
      direction: hit.direction,
      startPoint: hit.direction === "row" ? point.x : point.y,
      startWeights: [...weights],
      splitRect: { ...hit.splitRect }
    };
    this.canvas.style.cursor = hit.direction === "row" ? "col-resize" : "row-resize";
    this.statusText = "Resizing dock";
  }
  resizeDockSplit(point) {
    const resize = this.dockResize;
    if (!resize) return;
    const split = findDockSplitNode(this.dockRoot, resize.splitId);
    if (!split || split.direction !== resize.direction || resize.index < 0 || resize.index >= split.children.length - 1) return;
    const axisSize = Math.max(1, (resize.direction === "row" ? resize.splitRect.w : resize.splitRect.h) - DOCK_SPLITTER_GAP * (split.children.length - 1));
    const weights = normalizeWeightsForCount(resize.startWeights, split.children.length);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    const pxPerWeight = axisSize / totalWeight;
    const deltaPx = (resize.direction === "row" ? point.x : point.y) - resize.startPoint;
    const deltaWeight = deltaPx / pxPerWeight;
    const first = weights[resize.index];
    const second = weights[resize.index + 1];
    const pairWeight = first + second;
    const pairPx = pairWeight * pxPerWeight;
    const minPx = Math.max(0.5, Math.min(DOCK_MIN_PANEL_SIZE, pairPx / 2 - 1));
    const minWeight = Math.max(1e-3, minPx / pxPerWeight);
    const nextFirst = clamp(first + deltaWeight, minWeight, pairWeight - minWeight);
    weights[resize.index] = nextFirst;
    weights[resize.index + 1] = pairWeight - nextFirst;
    split.weights = weights;
    this.statusText = `${resize.direction === "row" ? "Width" : "Height"} ${Math.round(nextFirst * pxPerWeight)}px`;
    this.scheduleDraw();
  }
  updateDockPreview(point) {
    if (!this.tabDrag) return;
    const preview = this.resolveDockPreview(point);
    this.dockPreview = preview;
    if (preview?.zone === "center" && this.isSourceTabStripPoint(preview.groupId, point)) {
      this.reorderDraggedTab(point.x, preview.groupId);
      this.scheduleDraw();
    } else {
      this.scheduleDraw();
    }
    this.canvas.style.cursor = preview ? "" : "not-allowed";
  }
  isSourceTabStripPoint(groupId, point) {
    if (groupId !== this.tabDrag?.sourceGroupId) return false;
    const group = this.groupById(groupId);
    return rectContains({ x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: 34 }, point.x, point.y);
  }
  resolveDockPreview(point) {
    const stripGroup = this.groups.find((group) => rectContains({ x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: 34 }, point.x, point.y));
    if (stripGroup && stripGroup.id === this.tabDrag?.sourceGroupId) {
      const center = this.dockTargetShapes(stripGroup).find((target2) => target2.zone === "center");
      if (center) return { groupId: center.groupId, zone: "center", rect: center.previewRect, polygon: center.polygon };
    }
    const targets = this.allDockTargets();
    const centerTarget = targets.find((item) => item.zone === "center" && pointInPolygon(point, item.polygon));
    const target = centerTarget ?? targets.find((item) => item.zone !== "center" && pointInPolygon(point, item.polygon));
    return target ? { groupId: target.groupId, zone: target.zone, rect: target.previewRect, polygon: target.polygon } : null;
  }
  applyTabDrop() {
    const drag = this.tabDrag;
    const preview = this.dockPreview;
    if (!drag) return;
    if (!preview) {
      this.restoreDraggedTab();
      return;
    }
    if (preview.zone === "center") {
      const group2 = this.groups.find((item) => item.id === preview.groupId);
      if (!group2) {
        this.restoreDraggedTab();
        return;
      }
      if (!group2.tabs.includes(drag.docId)) group2.tabs.push(drag.docId);
      group2.activeDocId = drag.docId;
      this.activeGroupId = group2.id;
      this.activeDocId = drag.docId;
      this.syncOpenTabs();
      return;
    }
    const target = this.groups.find((group2) => group2.id === preview.groupId);
    if (!target) {
      this.restoreDraggedTab();
      return;
    }
    const direction = preview.zone === "left" || preview.zone === "right" ? "row" : "column";
    const group = makeGroup(`group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
    group.tabs.push(drag.docId);
    group.activeDocId = drag.docId;
    const draggedNode = { type: "leaf", group };
    const targetNode = { type: "leaf", group: target };
    const replacement = makeDockSplit(direction, preview.zone === "left" || preview.zone === "top" ? [draggedNode, targetNode] : [targetNode, draggedNode]);
    this.dockRoot = replaceLeafNode(this.dockRoot, target.id, replacement) ?? this.dockRoot;
    this.pruneDockTree();
    this.activeGroupId = group.id;
    this.activeDocId = drag.docId;
    this.syncOpenTabs();
    this.statusText = `Docked ${preview.zone}`;
  }
  restoreDraggedTab() {
    const drag = this.tabDrag;
    if (!drag) return;
    this.dockRoot = cloneDockNode(drag.restoreRoot);
    this.groups = collectDockGroups(this.dockRoot);
    this.activeGroupId = drag.restoreActiveGroupId;
    this.activeDocId = drag.restoreActiveDocId;
    this.syncOpenTabs();
    this.statusText = `Move canceled`;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
  }
  removeDocFromGroups(docId, prune = true) {
    for (const group of this.groups) {
      const index = group.tabs.indexOf(docId);
      if (index < 0) continue;
      group.tabs.splice(index, 1);
      if (group.activeDocId === docId) group.activeDocId = group.tabs[index] ?? group.tabs[index - 1] ?? null;
    }
    if (prune) this.pruneDockTree();
  }
  activeGroup() {
    return this.groupById(this.activeGroupId);
  }
  groupById(id) {
    return this.groups.find((group) => group.id === id) ?? this.groups[0];
  }
  groupContaining(docId) {
    return this.groups.find((group) => group.tabs.includes(docId));
  }
  syncOpenTabs() {
    this.groups = collectDockGroups(this.dockRoot);
    this.openTabs = this.groups.flatMap((group) => group.tabs);
  }
  pruneDockTree() {
    this.dockRoot = pruneDockNode(this.dockRoot) ?? { type: "leaf", group: makeGroup("group-main") };
    this.groups = collectDockGroups(this.dockRoot);
    if (!this.groups.find((group) => group.id === this.activeGroupId)) this.activeGroupId = this.groups[0].id;
    if (this.activeDocId && !this.groupContaining(this.activeDocId)) {
      const group = this.activeGroup();
      this.activeDocId = group.activeDocId;
    }
  }
  editorTarget() {
    return {
      kind: "editor",
      getSelectedText: () => this.activeDoc()?.selectedText() ?? "",
      replaceSelection: (text) => {
        this.activeDoc()?.replaceSelection(text);
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: (unit = "char") => {
        this.activeDoc()?.deleteBackward(unit);
        this.resetCaretBlink();
      },
      deleteForward: (unit = "char") => {
        this.activeDoc()?.deleteForward(unit);
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        this.activeDoc()?.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => this.runEditorShortcut(command),
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        if (text) this.activeDoc()?.replaceSelection(text, "composition");
        this.resetCaretBlink();
      }
    };
  }
  miniTarget(kind) {
    const buffer = kind === "search" ? this.searchBuffer : this.chatBuffer;
    return {
      kind,
      getSelectedText: () => buffer.selectedText(),
      replaceSelection: (text) => {
        buffer.replaceSelection(text.replaceAll("\n", " "));
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        buffer.deleteBackward();
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      deleteForward: () => {
        buffer.deleteForward();
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        buffer.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
        if (command === "Enter" && kind === "chat") {
          void this.sendChat();
          return true;
        }
        if (command === "Enter" && kind === "search") {
          void this.runSearch();
          this.resetCaretBlink();
          return true;
        }
        if (command === "Mod+A") {
          buffer.selectAll();
          this.resetCaretBlink();
          return true;
        }
        return this.runGlobalShortcut(command);
      },
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        buffer.replaceSelection(text);
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      }
    };
  }
  renameTarget() {
    const buffer = this.renameBuffer;
    return {
      kind: "command",
      getSelectedText: () => buffer.selectedText(),
      replaceSelection: (text) => {
        buffer.replaceSelection(text.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " "));
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        buffer.deleteBackward();
        this.resetCaretBlink();
      },
      deleteForward: () => {
        buffer.deleteForward();
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        buffer.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
        if (command === "Enter") {
          void this.commitRename();
          return true;
        }
        if (command === "Escape") {
          this.cancelRename();
          return true;
        }
        if (command === "Mod+A") {
          buffer.selectAll();
          this.resetCaretBlink();
          return true;
        }
        return false;
      },
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        buffer.replaceSelection(text.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " "));
        this.resetCaretBlink();
      }
    };
  }
  runEditorShortcut(command) {
    const doc = this.activeDoc();
    if (!doc) return false;
    if (this.runGlobalShortcut(command)) return true;
    if (command === "Mod+A") {
      doc.selectAll();
      this.resetCaretBlink();
      return true;
    }
    if (command === "Tab") {
      doc.indentSelectedLines();
      this.resetCaretBlink();
      return true;
    }
    if (command === "Shift+Tab") {
      doc.unindentSelectedLines();
      this.resetCaretBlink();
      return true;
    }
    if (command === "Mod+Z") {
      doc.undo();
      this.resetCaretBlink();
      return true;
    }
    if (command === "Mod+Shift+Z" || command === "Mod+Y") {
      doc.redo();
      this.resetCaretBlink();
      return true;
    }
    if (command === "Mod+C") {
      void copyText(doc.selectedText());
      return doc.hasSelection();
    }
    if (command === "Mod+X") {
      const text = doc.selectedText();
      if (!text) return false;
      void copyText(text);
      doc.replaceSelection("", "cut");
      this.resetCaretBlink();
      return true;
    }
    return false;
  }
  async runContextMenuCommand(command) {
    const menu = this.contextMenu;
    const item = menu?.items.find((candidate) => candidate.command === command);
    if (!menu || !item?.enabled) return;
    this.contextMenu = null;
    this.contextMenuHover = null;
    if (menu.scope.type === "file") {
      await this.runFileContextMenuCommand(menu.scope.path, command);
      this.scheduleDraw();
      return;
    }
    if (menu.scope.type === "folder") {
      await this.runFolderContextMenuCommand(menu.scope.path, command);
      this.scheduleDraw();
      return;
    }
    if (menu.scope.type === "root") {
      await this.runRootContextMenuCommand(command);
      this.scheduleDraw();
      return;
    }
    if (menu.scope.type === "rename") {
      await this.runRenameContextMenuCommand(command);
      return;
    }
    if (menu.scope.type === "search") {
      await this.runSearchContextMenuCommand(command);
      return;
    }
    if (!isEditorContextMenuCommand(command)) return;
    const group = this.groupById(menu.scope.groupId);
    const doc = this.docs.get(menu.scope.docId);
    if (!doc) {
      this.closeContextMenu();
      return;
    }
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    group.activeDocId = doc.id;
    if (command === "copy" || command === "cut") {
      const text = doc.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        await copyText(text);
        if (command === "cut") {
          doc.replaceSelection("", "cut");
          this.statusText = "Cut selection";
        } else {
          this.statusText = "Copied selection";
        }
      }
    } else {
      const text = await readClipboardText();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        doc.replaceSelection(text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"), "paste");
        this.statusText = "Pasted";
      }
    }
    this.focusEditor();
    this.scheduleDraw();
  }
  async runRenameContextMenuCommand(command) {
    if (!isEditorContextMenuCommand(command)) return;
    if (command === "copy" || command === "cut") {
      const text = this.renameBuffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        await copyText(text);
        if (command === "cut") {
          this.renameBuffer.replaceSelection("");
          this.statusText = "Cut file name text";
        } else {
          this.statusText = "Copied file name text";
        }
      }
    } else {
      const text = await readClipboardText();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        this.renameBuffer.replaceSelection(sanitizeSingleLineInput(text));
        this.statusText = "Pasted";
      }
    }
    this.focusRename(this.renameInputRect() ?? void 0);
    this.resetCaretBlink();
  }
  async runSearchContextMenuCommand(command) {
    if (!isEditorContextMenuCommand(command)) return;
    if (command === "copy" || command === "cut") {
      const text = this.searchBuffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        await copyText(text);
        if (command === "cut") {
          this.searchBuffer.replaceSelection("");
          void this.runSearch();
          this.statusText = "Cut search text";
        } else {
          this.statusText = "Copied search text";
        }
      }
    } else {
      const text = await readClipboardText();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        this.searchBuffer.replaceSelection(sanitizeSingleLineInput(text));
        void this.runSearch();
        this.statusText = "Pasted";
      }
    }
    this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 });
  }
  async runFileContextMenuCommand(path, command) {
    if (!isFileContextMenuCommand(command)) return;
    if (command === "rename") {
      this.startRename(path);
      return;
    }
    if (command === "duplicate") {
      await this.duplicateFile(path);
      return;
    }
    await this.deleteFile(path);
  }
  async runFolderContextMenuCommand(path, command) {
    if (!isFolderContextMenuCommand(command)) return;
    if (command === "rename") {
      this.startRename(path);
      return;
    }
    if (command === "delete") {
      await this.requestDeleteFolder(path);
      return;
    }
    if (command === "createFile") {
      await this.createFileInFolder(path);
      return;
    }
    await this.createFolderInFolder(path);
  }
  async runRootContextMenuCommand(command) {
    if (command === "createFile") {
      await this.createFileInFolder("/");
    } else if (command === "createFolder") {
      await this.createFolderInFolder("/");
    }
  }
  async duplicateFile(path) {
    const source = normalizePath(path);
    const node = await this.vfs.stat(source);
    if (!node || node.kind !== "file") {
      this.statusText = `File not found: ${source}`;
      return;
    }
    const copyPath = await this.nextDuplicatePath(source);
    const data = await this.vfs.readFile(source);
    await this.vfs.writeFile(copyPath, data, node.mime ?? "application/octet-stream");
    await this.refreshFiles();
    this.statusText = `Duplicated ${copyPath}`;
    this.scheduleDraw();
  }
  async deleteFile(path) {
    const target = normalizePath(path);
    if (this.renamePath === target) this.cancelRename();
    const doc = this.docs.getByPath(target);
    if (doc) this.closeTab(doc.id);
    await this.vfs.remove(target);
    this.docs.removePath(target);
    await this.refreshFiles();
    this.syncOpenTabs();
    this.statusText = `Deleted ${target}`;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  async requestDeleteFolder(path) {
    const target = normalizePath(path);
    if (target === "/") return;
    const node = await this.vfs.stat(target);
    if (!node || node.kind !== "dir") {
      this.statusText = `Folder not found: ${target}`;
      this.scheduleDraw();
      return;
    }
    const children = await this.vfs.listDir(target);
    if (children.length > 0) {
      this.openDeleteFolderModal(target, children.length);
      return;
    }
    await this.deleteFolderNow(target);
  }
  async deleteFolderNow(path) {
    const target = normalizePath(path);
    if (target === "/") return;
    if (this.renamePath && isSameOrDescendant(this.renamePath, target)) this.cancelRename();
    const docs = this.docs.all().filter((doc) => doc.path && isSameOrDescendant(doc.path, target));
    for (const doc of docs) {
      this.closeTab(doc.id);
      if (doc.path) this.docs.removePath(doc.path);
    }
    await this.vfs.remove(target, { recursive: true });
    this.removeFolderExpansion(target);
    await this.refreshFiles();
    this.syncOpenTabs();
    this.statusText = `Deleted ${target}`;
    if (this.activeDocId) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  async createFileInFolder(folderPath) {
    const parent = normalizePath(folderPath);
    const path = await this.nextCreatedPath(parent, "file");
    await this.vfs.writeFile(path, "", "text/plain");
    this.expandedFolders.add(parent);
    await this.refreshFiles();
    this.statusText = `Created ${path}`;
    this.startRename(path);
  }
  async createFolderInFolder(folderPath) {
    const parent = normalizePath(folderPath);
    const path = await this.nextCreatedPath(parent, "folder");
    await this.vfs.mkdir(path);
    this.expandedFolders.add(parent);
    this.expandedFolders.add(path);
    await this.refreshFiles();
    this.statusText = `Created ${path}`;
    this.startRename(path);
  }
  async nextCreatedPath(folderPath, kind) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const name = kind === "file" ? `${shortHexName()}.txt` : shortHexName();
      const candidate = joinPath(folderPath, name);
      if (!await this.vfs.stat(candidate)) return candidate;
    }
    return joinPath(folderPath, `${Date.now().toString(36)}${kind === "file" ? ".txt" : ""}`);
  }
  async nextDuplicatePath(path) {
    const dir = dirname(path);
    const name = basename(path);
    const dot = name.lastIndexOf(".");
    const hasExtension = dot > 0;
    const stem = hasExtension ? name.slice(0, dot) : name;
    const ext = hasExtension ? name.slice(dot) : "";
    for (let index = 1; index < 1e3; index++) {
      const suffix = index === 1 ? " copy" : ` copy ${index}`;
      const candidate = joinPath(dir, `${stem}${suffix}${ext}`);
      if (!await this.vfs.stat(candidate)) return candidate;
    }
    return joinPath(dir, `${stem} copy ${Date.now().toString(36)}${ext}`);
  }
  runGlobalShortcut(command) {
    if (command === "Mod+S") {
      const doc = this.activeDoc();
      if (doc) void this.docs.save(doc).then(() => {
        this.statusText = `Saved ${doc.path}`;
        this.scheduleDraw();
      });
      return true;
    }
    if (command === "Mod+Shift+F") {
      this.sidebarMode = "search";
      if (this.sidebarWidth === 0) this.sidebarWidth = this.lastSidebarWidth || 280;
      this.focusMiniTarget("search", { x: 56, y: 48, w: 220, h: 24 });
      return true;
    }
    if (command === "Mod+B") {
      if (this.sidebarWidth > 0) {
        this.lastSidebarWidth = this.sidebarWidth;
        this.sidebarWidth = 0;
      } else {
        this.sidebarWidth = this.lastSidebarWidth || 280;
      }
      this.scheduleDraw();
      return true;
    }
    if (command === "Mod+`") {
      this.sidebarMode = "chat";
      if (this.sidebarWidth === 0) this.sidebarWidth = this.lastSidebarWidth || 280;
      this.focusMiniTarget("chat", { x: 56, y: this.viewport.get().cssHeight - 70, w: 220, h: 28 });
      return true;
    }
    return false;
  }
  async runSearch() {
    const query = this.searchBuffer.text.trim();
    if (!query) {
      this.searchResults = [];
      this.scheduleDraw();
      return;
    }
    const files = await this.vfs.listAllFiles();
    const results = [];
    for (const file of files) {
      if (file.encoding === "binary" || file.path.startsWith("/.slug-")) continue;
      const text = await this.vfs.readText(file.path);
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: file.path, line: i, text: lines[i] });
          if (results.length >= 200) break;
        }
      }
      if (results.length >= 200) break;
    }
    this.searchResults = results;
    this.statusText = `${results.length} results`;
    this.scheduleDraw();
  }
  async sendChat() {
    const text = this.chatBuffer.text.trim();
    if (!text) return;
    this.chatBuffer.text = "";
    this.chatBuffer.cursor = 0;
    this.chatBuffer.anchor = 0;
    await this.chat.send(text, this.activeDoc(), this.docs.all());
    this.scheduleDraw();
  }
  draw() {
    this.viewport.resizeCanvas(this.renderer.gl);
    this.renderer.setViewport(this.viewport.get());
    this.renderer.beginFrame();
    this.hits.length = 0;
    const vp = this.viewport.get();
    const activityW = 48;
    const statusH = 24;
    const sidebarW = this.sidebarWidth;
    const mainX = activityW + sidebarW;
    this.renderer.rect({ x: 0, y: 0, w: vp.cssWidth, h: vp.cssHeight }, theme.background);
    this.drawActivityBar({ x: 0, y: 0, w: activityW, h: vp.cssHeight - statusH });
    if (sidebarW > 0) this.drawSidebar({ x: activityW, y: 0, w: sidebarW, h: vp.cssHeight - statusH });
    this.drawEditorArea({ x: mainX, y: 0, w: vp.cssWidth - mainX, h: vp.cssHeight - statusH });
    if (sidebarW > 0) this.drawSidebarSplitter({ x: activityW + sidebarW - 3, y: 0, w: 6, h: vp.cssHeight - statusH });
    this.drawStatus({ x: 0, y: vp.cssHeight - statusH, w: vp.cssWidth, h: statusH });
    if (this.contextMenu) this.drawContextMenu();
    if (this.modal) this.drawModal();
    this.renderer.endFrame();
    this.scheduleCaretBlinkFrame();
  }
  drawActivityBar(rect) {
    this.renderer.rect(rect, theme.activity);
    const items = [
      { mode: "files", label: "F", y: 20 },
      { mode: "search", label: "S", y: 70 },
      { mode: "chat", label: "C", y: 120 }
    ];
    for (const item of items) {
      const r = { x: rect.x + 6, y: item.y, w: rect.w - 12, h: 36 };
      if (this.sidebarWidth > 0 && this.sidebarMode === item.mode) this.renderer.rect(r, theme.activityActive);
      this.renderer.text(item.label, r.x + 13, r.y + 9, theme.text, "title");
      this.hits.push({ type: "activity", mode: item.mode, rect: r });
    }
  }
  drawSidebar(rect) {
    this.renderer.rect(rect, theme.panel);
    if (this.sidebarMode === "files") this.drawFilesPanel(rect);
    else if (this.sidebarMode === "search") this.drawSearchPanel(rect);
    else this.drawChatPanel(rect);
  }
  drawSidebarSplitter(rect) {
    this.renderer.rect({ x: rect.x + 2, y: rect.y, w: 1, h: rect.h }, this.resizingSidebar ? theme.accent : theme.divider);
    this.hits.push({ type: "sidebarResize", rect });
  }
  drawPanelHeader(rect, title) {
    const header = { x: rect.x, y: rect.y, w: rect.w, h: PANEL_HEADER_H };
    this.renderer.rect(header, theme.panel2);
    this.renderer.rect({ x: header.x, y: header.y + header.h - 1, w: header.w, h: 1 }, theme.divider);
    this.renderer.text(title, header.x + 12, header.y + 9, theme.textDim, "ui");
    return { x: rect.x, y: rect.y + PANEL_HEADER_H, w: rect.w, h: Math.max(0, rect.h - PANEL_HEADER_H) };
  }
  drawFilesPanel(rect) {
    const body = this.drawPanelHeader(rect, "FILES");
    this.hits.push({ type: "filesRoot", rect: body });
    this.hits.push({ type: "filesRoot", rect: { x: rect.x, y: rect.y, w: rect.w, h: PANEL_HEADER_H } });
    this.drawFileTreeEntries(this.fileTreeEntries(), body, body.y + 8, 0);
  }
  drawFileTreeEntries(entries, body, y, depth) {
    const indent = 14;
    for (const entry of entries) {
      if (y > body.y + body.h - 20) break;
      const row = { x: body.x + 4, y, w: body.w - 8, h: 22 };
      const contentX = row.x + 6 + depth * indent;
      if (entry.type === "dir") {
        const expanded = this.expandedFolders.has(entry.path);
        this.renderer.text(expanded ? "v" : ">", contentX, row.y + 4, theme.textDim, "ui");
        this.hits.push({ type: "folder", path: entry.path, expanded, rect: row });
        if (entry.path === this.renamePath) {
          this.drawFileRenameRow(entry.path, { x: contentX + 14, y: row.y, w: Math.max(40, body.x + body.w - contentX - 14), h: row.h });
        } else {
          this.renderer.text(entry.name, contentX + 14, row.y + 4, theme.text, "ui");
        }
        y += 24;
        if (expanded) y = this.drawFileTreeEntries(entry.children, body, y, depth + 1);
        continue;
      }
      if (entry.path === this.activeDoc()?.path) this.renderer.rect(row, theme.panel2);
      this.hits.push({ type: "file", path: entry.path, rect: row });
      if (entry.path === this.renamePath) {
        this.drawFileRenameRow(entry.path, { x: contentX - 4, y: row.y, w: Math.max(40, body.x + body.w - contentX), h: row.h });
      } else {
        this.renderer.text(entry.name, contentX, row.y + 4, theme.text, "ui");
      }
      y += 24;
    }
    return y;
  }
  drawFileRenameRow(path, row) {
    const input = { x: row.x + 4, y: row.y + 1, w: row.w - 8, h: row.h - 2 };
    this.renderer.rect(input, theme.activity);
    this.renderer.rect({ x: input.x, y: input.y, w: input.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: input.x, y: input.y + input.h - 1, w: input.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: input.x, y: input.y, w: 1, h: input.h }, theme.accent);
    this.renderer.rect({ x: input.x + input.w - 1, y: input.y, w: 1, h: input.h }, theme.accent);
    const textX = input.x + 5;
    const textY = input.y + 3;
    const selectionStart = Math.min(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const selectionEnd = Math.max(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const beforeSelection = this.renameBuffer.text.slice(0, selectionStart);
    const selected = this.renameBuffer.text.slice(selectionStart, selectionEnd);
    if (selectionEnd > selectionStart) {
      const sx = textX + this.renderer.measureText(beforeSelection, "ui");
      const sw = Math.max(2, this.renderer.measureText(selected, "ui"));
      this.renderer.rect({ x: sx, y: input.y + 2, w: sw, h: input.h - 4 }, theme.selection);
    }
    this.renderer.text(this.renameBuffer.text || "file name", textX, textY, this.renameBuffer.text ? theme.text : theme.textDim, "ui");
    if (this.isRenameCaretVisible()) {
      const caretX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, this.renameBuffer.cursor), "ui");
      this.renderer.rect({ x: caretX, y: input.y + 3, w: 1.5, h: input.h - 6 }, theme.caret);
    }
    this.hits.push({ type: "fileRenameInput", path, rect: input });
  }
  drawSearchPanel(rect) {
    const body = this.drawPanelHeader(rect, "SEARCH");
    const input = { x: body.x + 10, y: body.y + 8, w: body.w - 20, h: 28 };
    this.drawSearchInput(input);
    let y = input.y + 42;
    for (const result of this.searchResults) {
      const row = { x: body.x + 8, y, w: body.w - 16, h: 38 };
      this.renderer.text(`${result.path}:${result.line + 1}`, row.x + 4, row.y + 2, theme.accent, "ui");
      this.renderer.text(result.text.trim().slice(0, 32), row.x + 4, row.y + 18, theme.textDim, "ui");
      this.hits.push({ type: "searchResult", path: result.path, line: result.line, rect: row });
      y += 42;
      if (y > body.y + body.h - 20) break;
    }
  }
  drawSearchInput(input) {
    const active = this.input.activeTarget?.kind === "search";
    const border = active ? theme.accent : theme.divider;
    this.renderer.rect(input, active ? theme.activity : theme.panel2);
    this.renderer.rect({ x: input.x, y: input.y, w: input.w, h: 1 }, border);
    this.renderer.rect({ x: input.x, y: input.y + input.h - 1, w: input.w, h: 1 }, border);
    this.renderer.rect({ x: input.x, y: input.y, w: 1, h: input.h }, border);
    this.renderer.rect({ x: input.x + input.w - 1, y: input.y, w: 1, h: input.h }, border);
    const textX = input.x + 8;
    const textY = input.y + 7;
    const selectionStart = Math.min(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const selectionEnd = Math.max(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const beforeSelection = this.searchBuffer.text.slice(0, selectionStart);
    const selected = this.searchBuffer.text.slice(selectionStart, selectionEnd);
    if (selectionEnd > selectionStart) {
      const sx = textX + this.renderer.measureText(beforeSelection, "ui");
      const sw = Math.max(2, this.renderer.measureText(selected, "ui"));
      this.renderer.rect({ x: sx, y: input.y + 3, w: sw, h: input.h - 6 }, theme.selection);
    }
    this.renderer.text(this.searchBuffer.text || "type to search", textX, textY, this.searchBuffer.text ? theme.text : theme.textDim, "ui");
    if (this.isSearchCaretVisible()) {
      const caretX = textX + this.renderer.measureText(this.searchBuffer.text.slice(0, this.searchBuffer.cursor), "ui");
      this.renderer.rect({ x: caretX, y: input.y + 5, w: 1.5, h: input.h - 10 }, theme.caret);
    }
    this.hits.push({ type: "searchInput", rect: input });
  }
  drawChatPanel(rect) {
    const body = this.drawPanelHeader(rect, "CHAT");
    const inputH = 56;
    const transcript = { x: body.x + 8, y: body.y + 8, w: body.w - 16, h: body.h - inputH - 20 };
    this.renderer.pushClip(transcript);
    let y = transcript.y + 4;
    for (const msg of this.chat.messages.slice(-12)) {
      const color = msg.role === "user" ? theme.accent : msg.role === "system" ? theme.textDim : theme.text;
      this.renderer.text(`${msg.role}:`, transcript.x + 4, y, color, "ui");
      y += 16;
      for (const line of wrapText(msg.text, 34)) {
        this.renderer.text(line, transcript.x + 8, y, theme.text, "ui");
        y += 16;
      }
      y += 6;
    }
    this.renderer.popClip();
    const input = { x: body.x + 10, y: body.y + body.h - inputH + 10, w: body.w - 20, h: inputH - 18 };
    this.renderer.rect(input, theme.panel2);
    this.renderer.text(this.chatBuffer.text || "ask about the workspace", input.x + 8, input.y + 9, this.chatBuffer.text ? theme.text : theme.textDim, "ui");
    this.hits.push({ type: "chatInput", rect: input });
  }
  drawEditorArea(rect) {
    this.renderer.rect(rect, theme.background);
    this.editorRect = rect;
    this.layoutDockNode(this.dockRoot, rect);
    if (this.tabDrag) {
      this.drawDockOverlay();
      this.drawDraggedTabGhost();
    }
  }
  layoutDockNode(node, rect) {
    if (node.type === "leaf") {
      this.drawEditorGroup(node.group, rect);
      return;
    }
    const gap = DOCK_SPLITTER_GAP;
    const count = Math.max(1, node.children.length);
    const weights = normalizeSplitWeights(node);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    const splitters = [];
    if (node.direction === "row") {
      const usableWidth = Math.max(1, rect.w - gap * (count - 1));
      let x = rect.x;
      for (let i = 0; i < node.children.length; i++) {
        const w = i === node.children.length - 1 ? Math.max(1, rect.x + rect.w - x) : Math.max(1, usableWidth * weights[i] / totalWeight);
        this.layoutDockNode(node.children[i], { x, y: rect.y, w, h: rect.h });
        if (i < node.children.length - 1) {
          const divider = { x: x + w, y: rect.y, w: gap, h: rect.h };
          splitters.push({
            index: i,
            divider,
            hit: { x: divider.x - (DOCK_SPLITTER_HIT_SIZE - gap) / 2, y: rect.y, w: DOCK_SPLITTER_HIT_SIZE, h: rect.h }
          });
        }
        x += w + gap;
      }
      this.drawDockSplitters(node, rect, splitters);
      return;
    }
    const usableHeight = Math.max(1, rect.h - gap * (count - 1));
    let y = rect.y;
    for (let i = 0; i < node.children.length; i++) {
      const h = i === node.children.length - 1 ? Math.max(1, rect.y + rect.h - y) : Math.max(1, usableHeight * weights[i] / totalWeight);
      this.layoutDockNode(node.children[i], { x: rect.x, y, w: rect.w, h });
      if (i < node.children.length - 1) {
        const divider = { x: rect.x, y: y + h, w: rect.w, h: gap };
        splitters.push({
          index: i,
          divider,
          hit: { x: rect.x, y: divider.y - (DOCK_SPLITTER_HIT_SIZE - gap) / 2, w: rect.w, h: DOCK_SPLITTER_HIT_SIZE }
        });
      }
      y += h + gap;
    }
    this.drawDockSplitters(node, rect, splitters);
  }
  drawDockSplitters(node, splitRect, splitters) {
    for (const splitter of splitters) {
      const active = this.dockResize?.splitId === node.id && this.dockResize.index === splitter.index;
      this.renderer.rect(splitter.divider, active ? theme.accent : theme.divider);
      this.hits.push({ type: "dockResize", splitId: node.id, index: splitter.index, direction: node.direction, rect: splitter.hit, splitRect: { ...splitRect } });
    }
  }
  drawEditorGroup(group, rect) {
    group.frameRect = { ...rect };
    const tabH = 32;
    this.drawTabs(group, { x: rect.x, y: rect.y, w: rect.w, h: tabH });
    group.editorRect = { x: rect.x, y: rect.y + tabH, w: rect.w, h: rect.h - tabH };
    this.hits.push({ type: "editor", groupId: group.id, rect: group.editorRect });
    const doc = group.activeDocId ? this.docs.get(group.activeDocId) : void 0;
    if (!doc) {
      this.renderer.text("Open a file from the sidebar", rect.x + 30, rect.y + 70, theme.textDim, "title");
      return;
    }
    this.drawDocument(doc, group.editorRect, this.isDocumentCaretVisible(group, doc.id));
  }
  drawTabs(group, rect) {
    this.renderer.rect(rect, theme.panel);
    let x = rect.x;
    for (const docId of group.tabs) {
      const doc = this.docs.get(docId);
      if (!doc) continue;
      const w = Math.min(240, Math.max(128, this.renderer.measureText(doc.path ?? "(untitled)", "ui") + 52));
      const tab = { x, y: rect.y, w, h: rect.h };
      if (doc.id === group.activeDocId) this.renderer.rect(tab, theme.panel2);
      const close = { x: tab.x + tab.w - 26, y: tab.y + 7, w: 18, h: 18 };
      this.renderer.text((doc.path ?? "(untitled)") + (doc.dirty ? "*" : ""), x + 10, rect.y + 9, theme.text, "ui");
      this.renderer.rect(close, doc.id === group.activeDocId ? theme.activityActive : theme.activity);
      this.renderer.text("x", close.x + 5, close.y + 2, theme.text, "ui");
      this.hits.push({ type: "tab", docId, groupId: group.id, rect: tab });
      this.hits.push({ type: "tabClose", docId, groupId: group.id, rect: close });
      x += w + 1;
      if (x > rect.x + rect.w) break;
    }
  }
  drawDraggedTabGhost() {
    if (!this.tabDrag) return;
    const doc = this.docs.get(this.tabDrag.docId);
    const label = (doc?.path ?? "(untitled)") + (doc?.dirty ? "*" : "");
    const ghost = this.dragGhostRect();
    this.renderer.rect(ghost, [theme.panel2[0], theme.panel2[1], theme.panel2[2], 0.94]);
    this.renderer.rect({ x: ghost.x, y: ghost.y, w: ghost.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: ghost.x, y: ghost.y + ghost.h - 1, w: ghost.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: ghost.x, y: ghost.y, w: 1, h: ghost.h }, theme.accent);
    this.renderer.rect({ x: ghost.x + ghost.w - 1, y: ghost.y, w: 1, h: ghost.h }, theme.accent);
    this.renderer.text(label, ghost.x + 10, ghost.y + 9, theme.text, "ui");
  }
  dragGhostRect() {
    const drag = this.tabDrag;
    if (!drag) return { x: 0, y: 0, w: 0, h: 0 };
    const doc = this.docs.get(drag.docId);
    const label = (doc?.path ?? "(untitled)") + (doc?.dirty ? "*" : "");
    const width = Math.min(240, Math.max(128, this.renderer.measureText(label, "ui") + 52));
    const vp = this.viewport.get();
    return {
      x: clamp(drag.pointer.x - 18, 0, Math.max(0, vp.cssWidth - width)),
      y: clamp(drag.pointer.y - 16, 0, Math.max(0, vp.cssHeight - 56)),
      w: width,
      h: 32
    };
  }
  drawDockOverlay() {
    const targets = this.allDockTargets();
    for (const target of targets) {
      const active = this.dockPreview?.groupId === target.groupId && this.dockPreview.zone === target.zone;
      const fill = active ? [theme.accent[0], theme.accent[1], theme.accent[2], 0.34] : [theme.accent[0], theme.accent[1], theme.accent[2], 0.13];
      this.renderer.polygon(target.polygon, fill);
    }
    for (const group of this.groups) {
      const center = this.dockTargetShapes(group).find((target) => target.zone === "center");
      if (!center) continue;
      this.renderer.rect(center.previewRect, [theme.background[0], theme.background[1], theme.background[2], 0.28]);
      this.renderer.rect({ x: center.previewRect.x, y: center.previewRect.y, w: center.previewRect.w, h: 1 }, theme.accent);
      this.renderer.rect({ x: center.previewRect.x, y: center.previewRect.y + center.previewRect.h - 1, w: center.previewRect.w, h: 1 }, theme.accent);
      this.renderer.rect({ x: center.previewRect.x, y: center.previewRect.y, w: 1, h: center.previewRect.h }, theme.accent);
      this.renderer.rect({ x: center.previewRect.x + center.previewRect.w - 1, y: center.previewRect.y, w: 1, h: center.previewRect.h }, theme.accent);
      this.drawDockGuideLines(group, center.previewRect);
    }
  }
  drawDockGuideLines(group, center) {
    const outer = insetRect(group.frameRect, 10);
    const color = [theme.accent[0], theme.accent[1], theme.accent[2], 0.78];
    this.renderer.rect({ x: outer.x, y: outer.y, w: outer.w, h: 1 }, color);
    this.renderer.rect({ x: outer.x, y: outer.y + outer.h - 1, w: outer.w, h: 1 }, color);
    this.renderer.rect({ x: outer.x, y: outer.y, w: 1, h: outer.h }, color);
    this.renderer.rect({ x: outer.x + outer.w - 1, y: outer.y, w: 1, h: outer.h }, color);
    this.renderer.polygon(lineQuad({ x: outer.x, y: outer.y }, { x: center.x, y: center.y }, 1.5), color);
    this.renderer.polygon(lineQuad({ x: outer.x + outer.w, y: outer.y }, { x: center.x + center.w, y: center.y }, 1.5), color);
    this.renderer.polygon(lineQuad({ x: outer.x + outer.w, y: outer.y + outer.h }, { x: center.x + center.w, y: center.y + center.h }, 1.5), color);
    this.renderer.polygon(lineQuad({ x: outer.x, y: outer.y + outer.h }, { x: center.x, y: center.y + center.h }, 1.5), color);
  }
  drawDocument(doc, rect, showCaret) {
    const scroll = this.clampScrollForDoc(doc, rect);
    const contentRect = this.editorContentRect(doc, rect);
    this.renderer.pushClip(contentRect);
    const gutterW = this.gutterWidthForDoc(doc);
    const textX = this.editorTextX(doc, contentRect) - scroll.x;
    const lineH = this.renderer.lineHeight("code");
    this.renderer.rect({ x: contentRect.x, y: contentRect.y, w: gutterW, h: contentRect.h }, theme.panel);
    const firstLine = Math.max(0, Math.floor(scroll.y / lineH));
    const lineCount = Math.ceil(contentRect.h / lineH) + 2;
    const selection = doc.getOrderedSelection();
    for (let i = 0; i < lineCount; i++) {
      const lineIndex = firstLine + i;
      if (lineIndex >= doc.lineCount()) break;
      const y = contentRect.y + i * lineH - scroll.y % lineH;
      if (lineIndex === doc.selection.head.line) this.renderer.rect({ x: contentRect.x + gutterW, y, w: contentRect.w - gutterW, h: lineH }, theme.lineHighlight);
      const lineNumber = String(lineIndex + 1);
      this.renderer.text(lineNumber, contentRect.x + gutterW - EDITOR_GUTTER_PAD_RIGHT - this.renderer.measureText(lineNumber, "code"), y + 3, theme.textDim, "code");
      this.drawSelectionForLine(doc, lineIndex, textX, y, lineH, selection);
      let x = textX;
      for (const token of this.highlighter.tokenizeLine(doc.lines[lineIndex], doc.syntaxId)) {
        x += this.renderer.text(token.text, x, y + 3, tokenColor(token.type), "code");
      }
    }
    const caret = this.caretRect(doc, rect);
    const drawCaret = showCaret && (this.input.composing || this.isCaretBlinkOn());
    if (drawCaret) this.renderer.rect(caret, theme.caret);
    if (drawCaret && this.input.composing && this.input.compositionText) {
      this.renderer.text(this.input.compositionText, caret.x + 2, caret.y, theme.warning, "code");
      this.renderer.rect({ x: caret.x + 2, y: caret.y + lineH - 3, w: this.renderer.measureText(this.input.compositionText, "code"), h: 1 }, theme.warning);
    }
    this.renderer.popClip();
    this.drawEditorScrollbars(doc, rect);
  }
  drawEditorScrollbars(doc, rect) {
    const overflow = this.editorOverflow(doc, rect);
    if (overflow.vertical) this.drawEditorScrollbar(doc, rect, "vertical", overflow);
    if (overflow.horizontal) this.drawEditorScrollbar(doc, rect, "horizontal", overflow);
    if (overflow.vertical && overflow.horizontal) {
      this.renderer.rect({ x: rect.x + rect.w - EDITOR_SCROLLBAR_SIZE, y: rect.y + rect.h - EDITOR_SCROLLBAR_SIZE, w: EDITOR_SCROLLBAR_SIZE, h: EDITOR_SCROLLBAR_SIZE }, [theme.activity[0], theme.activity[1], theme.activity[2], 0.88]);
    }
  }
  drawEditorScrollbar(doc, rect, axis, overflow) {
    const groupId = this.groupContaining(doc.id)?.id ?? this.activeGroupId;
    const contentRect = this.editorContentRectForOverflow(rect, overflow);
    const trackRect = axis === "vertical" ? { x: contentRect.x + contentRect.w, y: contentRect.y, w: EDITOR_SCROLLBAR_SIZE, h: contentRect.h } : { x: contentRect.x, y: contentRect.y + contentRect.h, w: contentRect.w, h: EDITOR_SCROLLBAR_SIZE };
    const active = this.scrollbarDrag?.axis === axis && this.scrollbarDrag.groupId === groupId && this.scrollbarDrag.docId === doc.id;
    const hovered = this.hoveredScrollbar?.axis === axis && this.hoveredScrollbar.groupId === groupId && this.hoveredScrollbar.docId === doc.id;
    this.renderer.rect(trackRect, hovered || active ? [theme.activity[0], theme.activity[1], theme.activity[2], 0.9] : [theme.activity[0], theme.activity[1], theme.activity[2], 0.82]);
    const maxScroll = axis === "vertical" ? this.maxScrollY(doc, rect) : this.maxScrollX(doc, rect);
    if (maxScroll <= 0) return;
    const scroll = this.clampScrollForDoc(doc, rect);
    const thumbRect = axis === "vertical" ? this.verticalScrollbarThumb(doc, rect, trackRect, scroll.y, maxScroll) : this.horizontalScrollbarThumb(doc, rect, trackRect, scroll.x, maxScroll);
    const thumbColor = active ? [0.34, 0.41, 0.5, 1] : hovered ? [0.28, 0.31, 0.36, 1] : theme.activityActive;
    this.renderer.rect(thumbRect, thumbColor);
    this.hits.push({ type: "editorScrollbar", axis, groupId, docId: doc.id, rect: trackRect, trackRect, thumbRect });
  }
  verticalScrollbarThumb(doc, rect, trackRect, scrollY, maxScroll) {
    const contentHeight = this.documentContentHeight(doc);
    const thumbH = clamp(this.editorContentRect(doc, rect).h / contentHeight * trackRect.h, Math.min(trackRect.h, EDITOR_SCROLLBAR_THUMB_MIN), trackRect.h);
    const thumbTravel = Math.max(1, trackRect.h - thumbH);
    return { x: trackRect.x + 3, y: trackRect.y + scrollY / maxScroll * thumbTravel, w: Math.max(3, trackRect.w - 6), h: thumbH };
  }
  horizontalScrollbarThumb(doc, rect, trackRect, scrollX, maxScroll) {
    const contentRect = this.editorContentRect(doc, rect);
    const visibleTextWidth = this.visibleTextWidth(doc, contentRect);
    const contentWidth = visibleTextWidth + maxScroll;
    const thumbW = clamp(visibleTextWidth / contentWidth * trackRect.w, Math.min(trackRect.w, EDITOR_SCROLLBAR_THUMB_MIN), trackRect.w);
    const thumbTravel = Math.max(1, trackRect.w - thumbW);
    return { x: trackRect.x + scrollX / maxScroll * thumbTravel, y: trackRect.y + 3, w: thumbW, h: Math.max(3, trackRect.h - 6) };
  }
  drawSelectionForLine(doc, line, x, y, lineH, selection) {
    if (!doc.hasSelection() || line < selection.start.line || line > selection.end.line) return;
    const start = line === selection.start.line ? selection.start.col : 0;
    const end = line === selection.end.line ? selection.end.col : doc.lines[line].length;
    if (end <= start) return;
    const text = doc.lines[line];
    const startX = x + this.renderer.measureText(text.slice(0, start), "code");
    const endX = x + this.renderer.measureText(text.slice(0, end), "code");
    this.renderer.rect({ x: startX, y, w: Math.max(2, endX - startX), h: lineH }, theme.selection);
  }
  pointHitsSelection(doc, editorRect, point) {
    if (!doc.hasSelection()) return false;
    const contentRect = this.editorContentRect(doc, editorRect);
    if (!rectContains(contentRect, point.x, point.y)) return false;
    const selection = doc.getOrderedSelection();
    const lineH = this.renderer.lineHeight("code");
    const scroll = this.scrollForDoc(doc.id);
    const line = Math.floor((point.y - contentRect.y + scroll.y) / lineH);
    if (line < selection.start.line || line > selection.end.line || line < 0 || line >= doc.lineCount()) return false;
    const lineY = contentRect.y + line * lineH - scroll.y;
    if (point.y < lineY || point.y > lineY + lineH) return false;
    const text = doc.lines[line] ?? "";
    const start = line === selection.start.line ? selection.start.col : 0;
    const end = line === selection.end.line ? selection.end.col : text.length;
    if (end <= start) return false;
    const x = this.editorTextX(doc, contentRect) - scroll.x;
    const startX = x + this.renderer.measureText(text.slice(0, start), "code");
    const endX = x + this.renderer.measureText(text.slice(0, end), "code");
    return point.x >= startX && point.x <= Math.max(startX + 2, endX);
  }
  selectEditorWordFromPoint(doc, editorRect, point) {
    const lineH = this.renderer.lineHeight("code");
    const contentRect = this.editorContentRect(doc, editorRect);
    const scroll = this.scrollForDoc(doc.id);
    const line = clamp(Math.floor((point.y - contentRect.y + scroll.y) / lineH), 0, doc.lineCount() - 1);
    const textX = this.editorTextX(doc, contentRect);
    const col = this.columnFromTextOffset(doc.lines[line], point.x - textX + scroll.x);
    const range = wordRangeAt(doc.lines[line], col);
    doc.setSelection({ line, col: range.start }, { line, col: range.end });
    this.resetCaretBlink();
  }
  selectEditorLineFromPoint(doc, editorRect, point) {
    const lineH = this.renderer.lineHeight("code");
    const contentRect = this.editorContentRect(doc, editorRect);
    const scroll = this.scrollForDoc(doc.id);
    const line = clamp(Math.floor((point.y - contentRect.y + scroll.y) / lineH), 0, doc.lineCount() - 1);
    doc.setSelection({ line, col: 0 }, { line, col: doc.lines[line].length });
    this.resetCaretBlink();
  }
  drawStatus(rect) {
    this.renderer.rect(rect, theme.activity);
    const doc = this.activeDoc();
    const left = doc ? `${doc.path ?? "(untitled)"}  Ln ${doc.selection.head.line + 1}, Col ${doc.selection.head.col + 1}` : "No document";
    this.renderer.text(left, rect.x + 8, rect.y + 5, theme.textDim, "ui");
    this.renderer.text(this.statusText, rect.x + rect.w - Math.min(420, this.renderer.measureText(this.statusText, "ui") + 12), rect.y + 5, theme.textDim, "ui");
  }
  drawContextMenu() {
    const menu = this.contextMenu;
    if (!menu) return;
    this.renderer.rect(menu.rect, [theme.activity[0], theme.activity[1], theme.activity[2], 0.98]);
    this.renderer.rect({ x: menu.rect.x, y: menu.rect.y, w: menu.rect.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: menu.rect.x, y: menu.rect.y + menu.rect.h - 1, w: menu.rect.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: menu.rect.x, y: menu.rect.y, w: 1, h: menu.rect.h }, theme.divider);
    this.renderer.rect({ x: menu.rect.x + menu.rect.w - 1, y: menu.rect.y, w: 1, h: menu.rect.h }, theme.divider);
    for (const item of menu.items) {
      if (item.enabled && this.contextMenuHover === item.command) this.renderer.rect(item.rect, theme.activityActive);
      this.renderer.text(item.label, item.rect.x + 12, item.rect.y + 7, item.enabled ? theme.text : theme.textDim, "ui");
      this.hits.push({ type: "contextMenu", command: item.command, rect: item.rect, enabled: item.enabled });
    }
  }
  drawModal() {
    const modal = this.modal;
    if (!modal) return;
    const vp = this.viewport.get();
    const dialogW = Math.min(MODAL_WIDTH, Math.max(260, vp.cssWidth - 32));
    const contentW = dialogW - 40;
    const messageLines = this.wrapTextForWidth(modal.message, contentW, "ui");
    const detailLines = this.wrapTextForWidth(modal.detail, contentW, "ui");
    const textH = messageLines.length * 18 + detailLines.length * 18;
    const dialogH = Math.max(168, 92 + textH + MODAL_BUTTON_H);
    const dialog = {
      x: Math.max(12, (vp.cssWidth - dialogW) / 2),
      y: Math.max(12, (vp.cssHeight - dialogH) / 2),
      w: dialogW,
      h: dialogH
    };
    this.renderer.rect({ x: 0, y: 0, w: vp.cssWidth, h: vp.cssHeight }, [0, 0, 0, 0.48]);
    this.renderer.rect(dialog, [theme.panel2[0], theme.panel2[1], theme.panel2[2], 0.99]);
    this.renderer.rect({ x: dialog.x, y: dialog.y, w: dialog.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: dialog.x, y: dialog.y + dialog.h - 1, w: dialog.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: dialog.x, y: dialog.y, w: 1, h: dialog.h }, theme.divider);
    this.renderer.rect({ x: dialog.x + dialog.w - 1, y: dialog.y, w: 1, h: dialog.h }, theme.divider);
    this.renderer.text(modal.title, dialog.x + 20, dialog.y + 18, theme.text, "title");
    let y = dialog.y + 52;
    for (const line of messageLines) {
      this.renderer.text(line, dialog.x + 20, y, theme.text, "ui");
      y += 18;
    }
    y += 4;
    for (const line of detailLines) {
      this.renderer.text(line, dialog.x + 20, y, theme.textDim, "ui");
      y += 18;
    }
    const buttonsW = modal.buttons.reduce((sum, button) => sum + this.modalButtonWidth(button), 0) + MODAL_BUTTON_GAP * Math.max(0, modal.buttons.length - 1);
    let x = dialog.x + dialog.w - 20 - buttonsW;
    const buttonY = dialog.y + dialog.h - MODAL_BUTTON_H - 20;
    for (const button of modal.buttons) {
      const w = this.modalButtonWidth(button);
      button.rect = { x, y: buttonY, w, h: MODAL_BUTTON_H };
      const enabled = button.enabled && !modal.pending;
      const hovered = enabled && this.modalHover === button.action;
      this.renderer.rect(button.rect, this.modalButtonColor(button.variant, hovered, enabled));
      this.renderer.text(button.label, button.rect.x + 12, button.rect.y + 8, enabled ? theme.text : theme.textDim, "ui");
      this.hits.push({ type: "modalButton", action: button.action, rect: button.rect, enabled });
      x += w + MODAL_BUTTON_GAP;
    }
  }
  modalButtonWidth(button) {
    return Math.max(82, this.renderer.measureText(button.label, "ui") + 24);
  }
  modalButtonColor(variant, hovered, enabled) {
    const base = variant === "danger" ? theme.error : variant === "primary" ? theme.accent : theme.activityActive;
    const alpha = enabled ? 1 : 0.55;
    if (!hovered) return [base[0], base[1], base[2], alpha];
    return [Math.min(1, base[0] + 0.08), Math.min(1, base[1] + 0.08), Math.min(1, base[2] + 0.08), alpha];
  }
  wrapTextForWidth(text, width, font) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (!line || this.renderer.measureText(next, font) <= width) {
        line = next;
        continue;
      }
      lines.push(line);
      line = word;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }
  caretRect(doc, editorRect = this.activeEditorRect()) {
    const contentRect = this.editorContentRect(doc, editorRect);
    const lineH = this.renderer.lineHeight("code");
    const line = doc.lines[doc.selection.head.line] ?? "";
    const prefixWidth = this.renderer.measureText(line.slice(0, doc.selection.head.col), "code");
    const scroll = this.scrollForDoc(doc.id);
    return {
      x: this.editorTextX(doc, contentRect) + prefixWidth - scroll.x,
      y: contentRect.y + doc.selection.head.line * lineH - scroll.y,
      w: 2,
      h: lineH
    };
  }
  positionFromPoint(x, y) {
    const doc = this.activeDoc();
    if (!doc) return { line: 0, col: 0 };
    const lineH = this.renderer.lineHeight("code");
    const editorRect = this.activeEditorRect();
    const contentRect = this.editorContentRect(doc, editorRect);
    const scroll = this.scrollForDoc(doc.id);
    const line = clamp(Math.floor((y - contentRect.y + scroll.y) / lineH), 0, doc.lineCount() - 1);
    const textX = this.editorTextX(doc, contentRect);
    const col = this.columnFromTextOffset(doc.lines[line], x - textX + scroll.x);
    return { line, col };
  }
  columnFromTextOffset(text, offset) {
    if (offset <= 0) return 0;
    let x = 0;
    let col = 0;
    for (const char of text) {
      const advance = this.renderer.measureText(char, "code");
      if (offset < x + advance / 2) return col;
      x += advance;
      col += char.length;
    }
    return text.length;
  }
  tabHitState(type) {
    return this.hits.filter((hit) => hit.type === type).map((hit) => ({ path: this.docs.get(hit.docId)?.path ?? "(untitled)", rect: hit.rect }));
  }
  activeEditorRect() {
    return this.activeGroup().editorRect;
  }
  isActiveDocumentInGroup(group, docId) {
    return group.id === this.activeGroupId && group.activeDocId === docId && this.activeDocId === docId;
  }
  isDocumentCaretVisible(group, docId) {
    return this.input.activeTarget?.kind === "editor" && !this.renamePath && this.isActiveDocumentInGroup(group, docId);
  }
  hasBlinkingCaretOwner() {
    const kind = this.input.activeTarget?.kind;
    return Boolean(this.renamePath || kind === "search" || kind === "editor" && this.activeDocId);
  }
  isRenameCaretVisible() {
    return Boolean(this.renamePath && (this.input.composing || this.isCaretBlinkOn()));
  }
  isSearchCaretVisible() {
    return this.input.activeTarget?.kind === "search" && (this.input.composing || this.isCaretBlinkOn());
  }
  allDockTargets() {
    return this.groups.flatMap((group) => this.dockTargetShapes(group));
  }
  dockTargetShapes(group) {
    const outer = insetRect(group.frameRect, 10);
    if (outer.w <= 20 || outer.h <= 20) return [];
    const centerSize = Math.min(150, Math.max(78, Math.min(outer.w, outer.h) * 0.34));
    const center = {
      x: outer.x + (outer.w - centerSize) / 2,
      y: outer.y + (outer.h - centerSize) / 2,
      w: centerSize,
      h: centerSize
    };
    const outerTL = { x: outer.x, y: outer.y };
    const outerTR = { x: outer.x + outer.w, y: outer.y };
    const outerBR = { x: outer.x + outer.w, y: outer.y + outer.h };
    const outerBL = { x: outer.x, y: outer.y + outer.h };
    const centerTL = { x: center.x, y: center.y };
    const centerTR = { x: center.x + center.w, y: center.y };
    const centerBR = { x: center.x + center.w, y: center.y + center.h };
    const centerBL = { x: center.x, y: center.y + center.h };
    return [
      { groupId: group.id, zone: "top", polygon: [outerTL, outerTR, centerTR, centerTL], previewRect: { x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: group.frameRect.h * 0.5 } },
      { groupId: group.id, zone: "right", polygon: [centerTR, outerTR, outerBR, centerBR], previewRect: { x: group.frameRect.x + group.frameRect.w * 0.5, y: group.frameRect.y, w: group.frameRect.w * 0.5, h: group.frameRect.h } },
      { groupId: group.id, zone: "bottom", polygon: [centerBL, centerBR, outerBR, outerBL], previewRect: { x: group.frameRect.x, y: group.frameRect.y + group.frameRect.h * 0.5, w: group.frameRect.w, h: group.frameRect.h * 0.5 } },
      { groupId: group.id, zone: "left", polygon: [outerTL, centerTL, centerBL, outerBL], previewRect: { x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w * 0.5, h: group.frameRect.h } },
      { groupId: group.id, zone: "center", polygon: rectPoints(center), previewRect: center }
    ];
  }
};
function tokenColor(type) {
  if (type === "normal") return theme.text;
  if (type === "keyword") return theme.keyword;
  if (type === "string") return theme.string;
  if (type === "number") return theme.number;
  if (type === "comment") return theme.comment;
  if (type === "operator") return theme.operator;
  if (type === "function") return theme.function;
  return theme.type;
}
function isEditorContextMenuCommand(command) {
  return command === "cut" || command === "copy" || command === "paste";
}
function isFileContextMenuCommand(command) {
  return command === "rename" || command === "duplicate" || command === "delete";
}
function isFolderContextMenuCommand(command) {
  return command === "rename" || command === "delete" || command === "createFile" || command === "createFolder";
}
function modalButton(action, label, variant) {
  return { action, label, variant, rect: { x: 0, y: 0, w: 0, h: 0 }, enabled: true };
}
function isValidFileName(name) {
  return name.length > 0 && name !== "." && name !== ".." && !/[\\/]/.test(name) && !name.includes("\0");
}
function isWordChar(char) {
  return /[A-Za-z0-9_]/.test(char);
}
function wordRangeAt(text, col) {
  if (!text) return { start: 0, end: 0 };
  let index = clamp(col, 0, Math.max(0, text.length - 1));
  if (!isWordChar(text.charAt(index)) && col > 0 && isWordChar(text.charAt(col - 1))) index = col - 1;
  let start = index;
  let end = index + 1;
  if (isWordChar(text.charAt(index))) {
    while (start > 0 && isWordChar(text.charAt(start - 1))) start--;
    while (end < text.length && isWordChar(text.charAt(end))) end++;
  }
  return { start, end };
}
function sanitizeSingleLineInput(text) {
  return text.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " ");
}
function fileStemSelectionEnd(name) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? dot : name.length;
}
function isSameOrDescendant(path, root) {
  const normalizedPath = normalizePath(path);
  const normalizedRoot = normalizePath(root);
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
}
function shortHexName() {
  if (crypto.getRandomValues) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.floor(Math.random() * 4294967295).toString(16).padStart(8, "0");
}
function wrapText(text, width) {
  const lines = [];
  for (const rawLine of text.split("\n")) {
    let line = rawLine;
    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = line.slice(width);
    }
    lines.push(line);
  }
  return lines;
}
function sortFileTree(entries) {
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
  });
  for (const entry of entries) {
    if (entry.type === "dir") sortFileTree(entry.children);
  }
}
function makeGroup(id) {
  return {
    id,
    tabs: [],
    activeDocId: null,
    frameRect: { x: 0, y: 0, w: 0, h: 0 },
    editorRect: { x: 0, y: 32, w: 0, h: 0 }
  };
}
function collectDockGroups(node) {
  if (node.type === "leaf") return [node.group];
  return node.children.flatMap((child) => collectDockGroups(child));
}
function makeDockSplit(direction, children, weights = children.map(() => 1)) {
  return {
    type: "split",
    id: `split-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    direction,
    children,
    weights: normalizeWeightsForCount(weights, children.length)
  };
}
function findDockSplitNode(node, id) {
  if (node.type === "leaf") return null;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findDockSplitNode(child, id);
    if (found) return found;
  }
  return null;
}
function normalizeSplitWeights(node) {
  node.weights = normalizeWeightsForCount(node.weights, node.children.length);
  return node.weights;
}
function normalizeWeightsForCount(weights, count) {
  const normalized = weights.slice(0, count).map((weight) => Number.isFinite(weight) && weight > 0 ? weight : 1);
  while (normalized.length < count) normalized.push(1);
  return normalized;
}
function cloneDockNode(node) {
  if (node.type === "leaf") {
    return {
      type: "leaf",
      group: {
        id: node.group.id,
        tabs: [...node.group.tabs],
        activeDocId: node.group.activeDocId,
        frameRect: { ...node.group.frameRect },
        editorRect: { ...node.group.editorRect }
      }
    };
  }
  return { type: "split", id: node.id, direction: node.direction, children: node.children.map((child) => cloneDockNode(child)), weights: normalizeWeightsForCount(node.weights, node.children.length) };
}
function replaceLeafNode(node, groupId, replacement) {
  if (node.type === "leaf") return node.group.id === groupId ? replacement : null;
  const children = node.children.map((child) => replaceLeafNode(child, groupId, replacement) ?? child);
  return { ...node, children, weights: normalizeWeightsForCount(node.weights, children.length) };
}
function pruneDockNode(node) {
  if (node.type === "leaf") return node.group.tabs.length === 0 ? null : node;
  const sourceWeights = normalizeWeightsForCount(node.weights, node.children.length);
  const children = [];
  const weights = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = pruneDockNode(node.children[i]);
    if (!child) continue;
    children.push(child);
    weights.push(sourceWeights[i]);
  }
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { ...node, children, weights: normalizeWeightsForCount(weights, children.length) };
}
function insetRect(rect, amount) {
  const inset = Math.min(amount, rect.w / 4, rect.h / 4);
  return { x: rect.x + inset, y: rect.y + inset, w: Math.max(1, rect.w - inset * 2), h: Math.max(1, rect.h - inset * 2) };
}
function rectPoints(rect) {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h }
  ];
}
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses = a.y > point.y !== b.y > point.y;
    if (crosses) {
      const x = (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
      if (point.x < x) inside = !inside;
    }
  }
  return inside;
}
function lineQuad(a, b, width) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const px = -dy / length * (width / 2);
  const py = dx / length * (width / 2);
  return [
    { x: a.x + px, y: a.y + py },
    { x: b.x + px, y: b.y + py },
    { x: b.x - px, y: b.y - py },
    { x: a.x - px, y: a.y - py }
  ];
}
async function copyText(text) {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  area.style.width = "2px";
  area.style.height = "24px";
  area.style.opacity = "0.01";
  area.style.zIndex = "10000";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, text.length);
  document.execCommand("copy");
  area.remove();
}
async function readClipboardText() {
  if (!navigator.clipboard || !window.isSecureContext) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}
async function importFilesForTests(app, files) {
  await importFileList(app.vfs, files);
  await app.refreshFiles();
  app.scheduleDraw();
}

// src/platform/indexed_db.ts
var DB_NAME = "slug-editor";
var DB_VERSION = 1;
var IndexedDbConnection = class {
  constructor(dbName = DB_NAME) {
    this.dbName = dbName;
  }
  dbName;
  dbPromise = null;
  open() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }
        if (!db.objectStoreNames.contains("workspaces")) {
          db.createObjectStore("workspaces", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("nodes")) {
          const nodes = db.createObjectStore("nodes", { keyPath: ["workspaceId", "path"] });
          nodes.createIndex("byWorkspace", "workspaceId", { unique: false });
          nodes.createIndex("byParent", ["workspaceId", "parentPath"], { unique: false });
        }
        if (!db.objectStoreNames.contains("contents")) {
          db.createObjectStore("contents", { keyPath: "contentId" });
        }
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", { keyPath: "docId" });
        }
        if (!db.objectStoreNames.contains("layout")) {
          db.createObjectStore("layout", { keyPath: "workspaceId" });
        }
        if (!db.objectStoreNames.contains("chatThreads")) {
          db.createObjectStore("chatThreads", { keyPath: "threadId" });
        }
        if (!db.objectStoreNames.contains("chatItems")) {
          db.createObjectStore("chatItems", { keyPath: ["threadId", "index"] });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new AppError("indexed_db_open", request.error?.message ?? "Could not open IndexedDB"));
    });
    return this.dbPromise;
  }
  async tx(stores, mode, fn) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let settled = false;
      const finish = (value) => {
        settled = true;
        resolve(value);
      };
      tx.onerror = () => reject(new AppError("indexed_db_tx", tx.error?.message ?? "IndexedDB transaction failed"));
      tx.onabort = () => reject(new AppError("indexed_db_abort", tx.error?.message ?? "IndexedDB transaction aborted"));
      tx.oncomplete = () => {
        if (!settled) resolve(void 0);
      };
      Promise.resolve(fn(tx)).then(finish, reject);
    });
  }
};
function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new AppError("indexed_db_request", request.error?.message ?? "IndexedDB request failed"));
  });
}
function cursorToArray(request) {
  return new Promise((resolve, reject) => {
    const result = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(result);
        return;
      }
      result.push(cursor.value);
      cursor.continue();
    };
    request.onerror = () => reject(new AppError("indexed_db_cursor", request.error?.message ?? "IndexedDB cursor failed"));
  });
}

// src/platform/indexed_vfs.ts
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8", { fatal: false });
var IndexedVfs = class _IndexedVfs {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
  }
  db;
  workspaceId;
  listeners = /* @__PURE__ */ new Set();
  static async openDefault(db = new IndexedDbConnection()) {
    const workspaceId = await db.tx(["workspaces", "nodes", "contents"], "readwrite", async (tx) => {
      const workspaces = tx.objectStore("workspaces");
      const existing = await requestToPromise(workspaces.get("default"));
      if (existing) return existing.id;
      const now = Date.now();
      const workspace = {
        id: "default",
        name: "Browser Workspace",
        createdAt: now,
        updatedAt: now,
        rootPath: "/",
        source: "sample"
      };
      workspaces.put(workspace);
      const nodes = tx.objectStore("nodes");
      const contents = tx.objectStore("contents");
      const root = {
        id: uid("node"),
        workspaceId: "default",
        path: "/",
        parentPath: "/",
        name: "/",
        kind: "dir",
        size: 0,
        mtime: now
      };
      nodes.put(root);
      const samples = /* @__PURE__ */ new Map([
        ["/README.md", "# Slug Editor\n\nThis workspace is stored in IndexedDB.\n\n- Open files from the left sidebar.\n- Edit text in the WebGL2 editor.\n- Use Search to scan files.\n- Use Chat for local assistant turns.\n"],
        ["/src/main.ts", "export function greet(name: string): string {\n  return `hello ${name}`;\n}\n\nconsole.log(greet('Slug'));\n"],
        ["/notes/shortcuts.txt", "Ctrl/Cmd+C copy\nCtrl/Cmd+X cut\nCtrl/Cmd+V paste\nCtrl/Cmd+S save\nCtrl/Cmd+Shift+F project search\n"]
      ]);
      for (const [path, text] of samples) {
        await putFileRecords(nodes, contents, "default", path, text, "text/plain");
      }
      return workspace.id;
    });
    return new _IndexedVfs(db, workspaceId);
  }
  watch(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  async listDir(path) {
    const parent = normalizePath(path);
    return this.db.tx(["nodes"], "readonly", async (tx) => {
      const index = tx.objectStore("nodes").index("byParent");
      const rows = await cursorToArray(index.openCursor(IDBKeyRange.only([this.workspaceId, parent])));
      return rows.sort(sortNodes);
    });
  }
  async listAllFiles() {
    return this.db.tx(["nodes"], "readonly", async (tx) => {
      const index = tx.objectStore("nodes").index("byWorkspace");
      const rows = await cursorToArray(index.openCursor(IDBKeyRange.only(this.workspaceId)));
      return rows.filter((node) => node.kind === "file").sort((a, b) => comparePath(a.path, b.path));
    });
  }
  async stat(path) {
    const p = normalizePath(path);
    return this.db.tx(["nodes"], "readonly", async (tx) => {
      const node = await requestToPromise(tx.objectStore("nodes").get([this.workspaceId, p]));
      return node ?? null;
    });
  }
  async readFile(path) {
    const p = normalizePath(path);
    return this.db.tx(["nodes", "contents"], "readonly", async (tx) => {
      const node = await requestToPromise(tx.objectStore("nodes").get([this.workspaceId, p]));
      if (!node || node.kind !== "file" || !node.contentId) throw new AppError("not_found", `File not found: ${p}`);
      const content = await requestToPromise(tx.objectStore("contents").get(node.contentId));
      if (!content) throw new AppError("not_found", `Content missing for: ${p}`);
      return new Uint8Array(content.data.slice(0));
    });
  }
  async readText(path) {
    return textDecoder.decode(await this.readFile(path));
  }
  async writeFile(path, data, mime = "text/plain") {
    const p = normalizePath(path);
    await this.db.tx(["nodes", "contents"], "readwrite", async (tx) => {
      await ensureDirRecords(tx.objectStore("nodes"), this.workspaceId, dirname(p));
      await putFileRecords(tx.objectStore("nodes"), tx.objectStore("contents"), this.workspaceId, p, data, mime);
    });
    this.emit({ type: "write", path: p });
  }
  async mkdir(path) {
    const p = normalizePath(path);
    await this.db.tx(["nodes"], "readwrite", async (tx) => {
      await ensureDirRecords(tx.objectStore("nodes"), this.workspaceId, p);
    });
    this.emit({ type: "mkdir", path: p });
  }
  async remove(path, opts) {
    const p = normalizePath(path);
    await this.db.tx(["nodes", "contents"], "readwrite", async (tx) => {
      const nodes = tx.objectStore("nodes");
      const contents = tx.objectStore("contents");
      const node = await requestToPromise(nodes.get([this.workspaceId, p]));
      if (!node) return;
      if (node.kind === "dir") {
        const descendants = await this.getDescendants(nodes, p);
        if (descendants.length > 0 && !opts?.recursive) {
          throw new AppError("not_empty", `Directory is not empty: ${p}`);
        }
        for (const child of descendants) {
          if (child.contentId) contents.delete(child.contentId);
          nodes.delete([this.workspaceId, child.path]);
        }
      }
      if (node.contentId) contents.delete(node.contentId);
      nodes.delete([this.workspaceId, p]);
    });
    this.emit({ type: "remove", path: p });
  }
  async rename(oldPath, newPath) {
    const oldP = normalizePath(oldPath);
    const newP = normalizePath(newPath);
    await this.db.tx(["nodes", "contents"], "readwrite", async (tx) => {
      const nodes = tx.objectStore("nodes");
      const contents = tx.objectStore("contents");
      const node = await requestToPromise(nodes.get([this.workspaceId, oldP]));
      if (!node) throw new AppError("not_found", `Path not found: ${oldP}`);
      const existing = await requestToPromise(nodes.get([this.workspaceId, newP]));
      if (existing) throw new AppError("exists", `Path already exists: ${newP}`);
      if (node.kind === "file") {
        if (node.contentId) {
          const content = await requestToPromise(contents.get(node.contentId));
          if (!content) throw new AppError("not_found", `Content missing for: ${oldP}`);
        }
        nodes.put({ ...node, path: newP, parentPath: dirname(newP), name: basename(newP), mtime: Date.now() });
        nodes.delete([this.workspaceId, oldP]);
        return;
      }
      const descendants = await this.getDescendants(nodes, oldP);
      const now = Date.now();
      for (const item of [node, ...descendants]) {
        const nextPath = item.path === oldP ? newP : normalizePath(`${newP}/${item.path.slice(oldP.length + 1)}`);
        nodes.put({ ...item, path: nextPath, parentPath: dirname(nextPath), name: basename(nextPath), mtime: now });
      }
      for (const item of [node, ...descendants]) nodes.delete([this.workspaceId, item.path]);
    });
    this.emit({ type: "rename", oldPath: oldP, newPath: newP });
  }
  async getDescendants(nodes, dir) {
    const all = await cursorToArray(nodes.index("byWorkspace").openCursor(IDBKeyRange.only(this.workspaceId)));
    const prefix = dir === "/" ? "/" : `${dir}/`;
    return all.filter((node) => node.path !== dir && node.path.startsWith(prefix));
  }
  emit(event) {
    for (const listener of this.listeners) listener(event);
  }
};
async function ensureDirRecords(nodes, workspaceId, path) {
  const p = normalizePath(path);
  if (p === "/") {
    const root = await requestToPromise(nodes.get([workspaceId, "/"]));
    if (!root) {
      nodes.put({ id: uid("node"), workspaceId, path: "/", parentPath: "/", name: "/", kind: "dir", size: 0, mtime: Date.now() });
    }
    return;
  }
  await ensureDirRecords(nodes, workspaceId, dirname(p));
  const existing = await requestToPromise(nodes.get([workspaceId, p]));
  if (!existing) {
    nodes.put({ id: uid("node"), workspaceId, path: p, parentPath: dirname(p), name: basename(p), kind: "dir", size: 0, mtime: Date.now() });
  }
}
async function putFileRecords(nodes, contents, workspaceId, path, data, mime) {
  const p = normalizePath(path);
  await ensureDirRecords(nodes, workspaceId, dirname(p));
  const bytes = typeof data === "string" ? textEncoder.encode(data) : data;
  const contentId = uid("content");
  const dataBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(dataBuffer).set(bytes);
  const content = {
    contentId,
    workspaceId,
    data: dataBuffer,
    size: bytes.byteLength
  };
  contents.put(content);
  const node = {
    id: uid("node"),
    workspaceId,
    path: p,
    parentPath: dirname(p),
    name: basename(p),
    kind: "file",
    size: bytes.byteLength,
    mtime: Date.now(),
    contentId,
    mime,
    encoding: mime.startsWith("text/") || p.match(/\.(ts|js|json|md|txt|css|html|lua|cpp|c|h|hpp)$/i) ? "utf-8" : "binary"
  };
  nodes.put(node);
}
function sortNodes(a, b) {
  if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
  return comparePath(a.name, b.name);
}

// src/main.ts
async function main() {
  const canvas = document.getElementById("editor-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Missing editor canvas");
  const fontSources = await loadFonts();
  const dbName = workspaceDatabaseName();
  const vfs = await IndexedVfs.openDefault(new IndexedDbConnection(dbName));
  const app = new EditorApp(canvas, vfs, fontSources);
  await app.start();
  window.__slugApp = app;
  window.__slugImportFiles = (files) => importFilesForTests(app, files);
}
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  document.body.textContent = `Failed to start Slug Editor: ${message}`;
});
function workspaceDatabaseName() {
  const value = new URL(window.location.href).searchParams.get("db");
  if (!value) return "slug-editor";
  const slug = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return slug ? `slug-editor-${slug}` : "slug-editor";
}
async function loadFonts() {
  return [
    { name: "Inter-Regular.ttf", buffer: await loadFont("Inter-Regular.ttf") },
    { name: "NotoEmoji-Regular.ttf", buffer: await loadFont("NotoEmoji-Regular.ttf") }
  ];
}
async function loadFont(fileName) {
  const response = await fetch(`./${fileName}`);
  if (!response.ok) throw new Error(`Could not load ${fileName}: ${response.status}`);
  return response.arrayBuffer();
}
//# sourceMappingURL=app.js.map
