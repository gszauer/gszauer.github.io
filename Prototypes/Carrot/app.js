var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "node_modules/jszip/dist/jszip.min.js"(exports, module) {
    !(function(e) {
      if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    })(function() {
      return (function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof __require && __require;
              if (!e2 && t) return t(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      })({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
            return 63 & (e3 || 0);
          })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          })(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t2.length; r2++) try {
            t2[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = (function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = (function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                })(s2, (function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                })(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          })(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = (function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          })(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        })() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
            return i.stringifyByChunk(e2, r2, t2);
          } catch (e3) {
            t2 = Math.floor(t2 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
          return t2;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2) return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = (function(e3) {
            for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
            return null;
          })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2) this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
            t2.apply(e2, arguments);
          };
        }
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; ) h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        function K(e2) {
          var t2 = G(e2);
          return t2 === m && (function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          })(e2.state), t2;
        }
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? (function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                    for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                    w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                  } else {
                    for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                    w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t2 || 6 === t2) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t2) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t2) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t2);
        }
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          })(e2, t2), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          })(e2, t2, r2, true);
        }
        r._tr_init = function(e2) {
          q || ((function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
            return o;
          })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), (function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          })(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !(function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : (function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !(function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    })(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

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

// src/editor/file_types.ts
var UNSUPPORTED_FILE_TEXT = "File type not supported";
var UNSUPPORTED_EXTENSIONS = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "bmp",
  "ico",
  "icns",
  "tif",
  "tiff",
  "psd",
  "mp3",
  "wav",
  "ogg",
  "oga",
  "flac",
  "aac",
  "m4a",
  "wma",
  "aiff",
  "mp4",
  "mov",
  "m4v",
  "webm",
  "mkv",
  "avi",
  "wmv",
  "flv",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "tgz",
  "bz2",
  "xz",
  "br",
  "zst",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "ttf",
  "otf",
  "woff",
  "woff2",
  "eot",
  "exe",
  "dll",
  "so",
  "dylib",
  "app",
  "bin",
  "wasm",
  "class",
  "jar",
  "sqlite",
  "sqlite3",
  "db",
  "mdb",
  "accdb",
  "realm",
  "pak",
  "dat",
  "asset",
  "bundle",
  "iso",
  "dmg",
  "img",
  "vhd",
  "vhdx"
]);
function isUnsupportedFilePath(path) {
  const name = basename(path);
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return false;
  return UNSUPPORTED_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
}

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
var AI_CONFIG_STORAGE_KEY = "slug.aiEndpointConfig";
var AI_SYSTEM_PROMPT_STORAGE_KEY = "slug.aiSystemPrompt";
var AI_COMPACT_PROMPT_STORAGE_KEY = "slug.aiCompactPrompt";
var AI_TAG_TOOL_PROMPT_STORAGE_KEY = "slug.aiTagToolPrompt";
var AI_HARMONY_TOOL_PROMPT_STORAGE_KEY = "slug.aiHarmonyToolPrompt";
var PROBE_USER_MESSAGE = "test";
var PROBE_USER_TOKEN_COUNT = 1;
var PROBE_COMPLETION_TOKEN_COUNT = 1;
var DIRTY_TOKEN_REFRESH_MARGIN_PERCENT = 5;
var ESTIMATED_CHAT_MESSAGE_OVERHEAD_TOKENS = 4;
var COMPACTED_SUMMARY_HEADER = "Summary of compacted conversation";
var EDITOR_CONTEXT_MAX_TREE_ENTRIES = 1e3;
var EDITOR_CONTEXT_MAX_SELECTED_TEXT_CHARS = 4e3;
var GREP_MAX_MATCHES = 500;
var GREP_MAX_FILE_BYTES = 8 * 1024 * 1024;
var REMOVED_FILE_GREP_TOOL = String.fromCharCode(102, 114, 101, 112, 70, 105, 108, 101);
var AI_SERVER_CHECK_TIMEOUT_MS = 5e3;
var LM_STUDIO_NATIVE_PROBE_TIMEOUT_MS = 700;
var AI_SETTINGS_DOC_PATH = "/.slug-ai-settings.json";
var AI_SYSTEM_PROMPT_DOC_PATH = "/.slug-system-prompt.md";
var AI_COMPACT_PROMPT_DOC_PATH = "/.slug-compact-prompt.md";
var AI_TAG_TOOL_PROMPT_DOC_PATH = "/.slug-tag-tool-prompt.md";
var AI_HARMONY_TOOL_PROMPT_DOC_PATH = "/.slug-harmony-tool-prompt.md";
var DEFAULT_AI_ENDPOINT_CONFIG = {
  apiBaseUrl: "http://localhost:1234/v1",
  apiKey: "",
  model: "",
  temperature: 0.2,
  maxContextTokens: 0
};
var DEFAULT_AI_RUNTIME_SETTINGS = {
  maxToolCallsPerTurn: 50,
  detectDuplicateToolCalls: true,
  toolCallFormat: "tag",
  thinkingFormat: "auto",
  compactFreePercent: 10
};
var NATIVE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read a text file from the virtual workspace.",
      parameters: { type: "object", properties: { path: { type: "string", description: "Workspace path, for example /README.md." } }, required: ["path"] }
    }
  },
  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Create a new text file, or overwrite an existing text file only after readFile has read its current contents.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Workspace path to write." },
          content: { type: "string", description: "Full file contents." }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "editFile",
      description: "Replace an exact string inside a text file. The file must have been read first with readFile.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Workspace path to edit." },
          oldString: { type: "string", description: "Exact text to replace." },
          newString: { type: "string", description: "Replacement text." }
        },
        required: ["path", "oldString", "newString"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "grep",
      description: "Search all workspace text files for a regular expression.",
      parameters: { type: "object", properties: { pattern: { type: "string", description: "Regular expression pattern." } }, required: ["pattern"] }
    }
  },
  {
    type: "function",
    function: {
      name: "grepFile",
      description: "Search one workspace text file for a regular expression.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Regular expression pattern." },
          path: { type: "string", description: "Workspace path to search." }
        },
        required: ["pattern", "path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "bash",
      description: "Run a supported emulated shell command.",
      parameters: { type: "object", properties: { command: { type: "string", description: "Shell command to run." } }, required: ["command"] }
    }
  },
  {
    type: "function",
    function: {
      name: "compact",
      description: "Compact the current chat conversation.",
      parameters: { type: "object", properties: {} }
    }
  }
];
var LEGACY_DEFAULT_SYSTEM_PROMPT = `You are an AI coding assistant inside a browser code editor.

You can inspect and edit the virtual workspace using tool calls. Keep responses concise, use tools when you need file contents, and prefer precise edits over broad rewrites.

Available tools:
- readFile(path)
- writeFile(path, content)
- editFile(path, oldString, newString)
- grep(pattern)
- grepFile(pattern, path)
- bash(command)
- compact()

Tag tool-call format:
<tool>readFile("/README.md")</tool>

Harmony-style tool-call format:
<|channel|>commentary to=readFile <|message|>{"path":"/README.md"}<|call|>

After each tool result, continue until the task is done or you need the user.`;
var DEFAULT_SYSTEM_PROMPT = `You are an AI coding assistant inside a browser code editor.

You can inspect and edit the virtual workspace using tool calls when tools are available. Keep responses concise, use tools when you need file contents, and prefer precise edits over broad rewrites.`;
var TOOL_LIST_PROMPT = `Available tools:
- readFile(path)
- writeFile(path, content)
- editFile(path, oldString, newString)
- grep(pattern)
- grepFile(pattern, path)
- bash(command)
- compact()`;
var BASH_EMULATION_PROMPT = `The bash(command) tool is a browser-emulated shell over the virtual workspace, not a real OS shell.
Supported bash commands:
- pwd
- ls [-R] [path]
- cat <file...>
- mkdir <dir...>
- rmdir <dir...>
- rm [-r|-rf|-fr] <path...>
- cp <source> <dest>
- mv <source> <dest>
- touch <file...>
- echo <text...>

Bash limitations:
- Shell operators are not supported: pipes, redirects, command chaining, backgrounding, backticks, and $() substitution are rejected.
- Do not use shell redirects to create files. Use writeFile("/path.txt", "content") instead of echo "content" > path.txt.
- chmod and executable bits are not supported.
- Use grep(pattern) or grepFile(pattern, path) instead of shell grep.
- cp copies files only.
- For sample/demo content, prefer text-friendly extensions such as .txt, .md, .ts, .js, .json, .html, .css, .lua, .py, .c, .cpp, or .h. Avoid fake .png, .pdf, .zip, and other binary-looking files unless the user explicitly asks for them.`;
var DEFAULT_NATIVE_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

${BASH_EMULATION_PROMPT}

Primary tool protocol: use the OpenAI Chat Completions native tool_calls interface. The request already provides the tool schemas, so native tool_calls are the executable tool-call form for this conversation.

Do not write tool calls as plain JSON, tag syntax, Harmony text syntax, markdown, reasoning, analysis, or explanatory text.

Before modifying an existing file with writeFile or editFile, read it first with readFile. Creating a new file does not require readFile.

If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var DEFAULT_TAG_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

${BASH_EMULATION_PROMPT}

Tool calls are executable only when they are emitted in assistant message content. Never put tool calls or tool-call syntax inside reasoning, thinking, analysis, markdown fences, or explanatory text.

Before modifying an existing file with writeFile or editFile, read it first with readFile. Creating a new file does not require readFile.

Use only this tag tool-call format when invoking tools:
<tool>readFile("/README.md")</tool>

If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var DEFAULT_HARMONY_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

${BASH_EMULATION_PROMPT}

Tool calls are executable only when they are emitted in assistant message content/commentary. Never put tool calls or tool-call syntax inside reasoning, thinking, analysis, markdown fences, or explanatory text.

Before modifying an existing file with writeFile or editFile, read it first with readFile. Creating a new file does not require readFile.

Use only this harmony-style tool-call format when invoking tools:
<|channel|>commentary to=writeFile <|message|>{"path":"/notes.txt","content":"hello\\n"}<|call|>

The final token of every harmony tool call must be <|call|>. If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var PRE_BASH_DEFAULT_TAG_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

Tool calls are executable only when they are emitted in assistant message content. Never put tool calls or tool-call syntax inside reasoning, thinking, analysis, markdown fences, or explanatory text.

Before modifying an existing file with writeFile or editFile, read it first with readFile. Creating a new file does not require readFile.

Use only this tag tool-call format when invoking tools:
<tool>readFile("/README.md")</tool>

If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var PRE_BASH_DEFAULT_HARMONY_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

Tool calls are executable only when they are emitted in assistant message content/commentary. Never put tool calls or tool-call syntax inside reasoning, thinking, analysis, markdown fences, or explanatory text.

Before modifying an existing file with writeFile or editFile, read it first with readFile. Creating a new file does not require readFile.

Use only this harmony-style tool-call format when invoking tools:
<|channel|>commentary to=writeFile <|message|>{"path":"/notes.txt","content":"hello\\n"}<|call|>

The final token of every harmony tool call must be <|call|>. If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var LEGACY_DEFAULT_TAG_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

Use only this tag tool-call format when invoking tools:
<tool>readFile("/README.md")</tool>

If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var LEGACY_DEFAULT_HARMONY_TOOL_PROMPT = `${TOOL_LIST_PROMPT}

Use only this harmony-style tool-call format when invoking tools:
<|channel|>commentary to=writeFile <|message|>{"path":"/notes.txt","content":"hello\\n"}<|call|>

The final token of every harmony tool call must be <|call|>. If the user asks to make or create a new file without naming it, choose a short root-level file name and simple starter content, then call writeFile.

After each tool result, continue until the task is done or you need the user.`;
var DEFAULT_COMPACT_PROMPT = `Compact the provided coding-agent conversation aggressively.

Preserve only the user's intent, hard constraints, important decisions, files changed or inspected, current state, errors, test results, and unresolved next steps.

Omit tool-call syntax, repeated output, and low-value chatter. Write concise continuation context.`;
function loadAiEndpointConfig() {
  return normalizeAiEndpointConfig(readJsonLocalStorage(AI_CONFIG_STORAGE_KEY));
}
function saveAiEndpointConfig(config) {
  const normalized = normalizeAiEndpointConfig(config);
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(normalized, null, 2));
  return normalized;
}
function resolveAiContextTokens(config = loadAiEndpointConfig()) {
  const normalized = normalizeAiEndpointConfig(config);
  return normalized.maxContextTokens || bestKnownContextLength(normalized.model);
}
function loadAiSystemPrompt() {
  const stored = localStorage.getItem(AI_SYSTEM_PROMPT_STORAGE_KEY);
  if (!stored || stored === LEGACY_DEFAULT_SYSTEM_PROMPT) return DEFAULT_SYSTEM_PROMPT;
  return sanitizeSystemPrompt(stored);
}
function saveAiSystemPrompt(text) {
  localStorage.setItem(AI_SYSTEM_PROMPT_STORAGE_KEY, text);
}
function loadAiCompactPrompt() {
  return localStorage.getItem(AI_COMPACT_PROMPT_STORAGE_KEY) ?? DEFAULT_COMPACT_PROMPT;
}
function saveAiCompactPrompt(text) {
  localStorage.setItem(AI_COMPACT_PROMPT_STORAGE_KEY, text);
}
function loadAiTagToolPrompt() {
  const stored = localStorage.getItem(AI_TAG_TOOL_PROMPT_STORAGE_KEY);
  return !stored || stored === LEGACY_DEFAULT_TAG_TOOL_PROMPT || stored === PRE_BASH_DEFAULT_TAG_TOOL_PROMPT ? DEFAULT_TAG_TOOL_PROMPT : sanitizeToolPrompt(stored);
}
function saveAiTagToolPrompt(text) {
  localStorage.setItem(AI_TAG_TOOL_PROMPT_STORAGE_KEY, text);
}
function loadAiHarmonyToolPrompt() {
  const stored = localStorage.getItem(AI_HARMONY_TOOL_PROMPT_STORAGE_KEY);
  return !stored || stored === LEGACY_DEFAULT_HARMONY_TOOL_PROMPT || stored === PRE_BASH_DEFAULT_HARMONY_TOOL_PROMPT ? DEFAULT_HARMONY_TOOL_PROMPT : sanitizeToolPrompt(stored);
}
function saveAiHarmonyToolPrompt(text) {
  localStorage.setItem(AI_HARMONY_TOOL_PROMPT_STORAGE_KEY, text);
}
function resetAiPromptStorage() {
  localStorage.removeItem(AI_SYSTEM_PROMPT_STORAGE_KEY);
  localStorage.removeItem(AI_COMPACT_PROMPT_STORAGE_KEY);
  localStorage.removeItem(AI_TAG_TOOL_PROMPT_STORAGE_KEY);
  localStorage.removeItem(AI_HARMONY_TOOL_PROMPT_STORAGE_KEY);
}
async function checkOpenAICompatibleServer(config = loadAiEndpointConfig()) {
  const normalized = normalizeAiEndpointConfig(config);
  const requestConfig = withResolvedApiBaseUrl(normalized);
  const headers = authHeaders(normalized);
  const modelsUrl = `${requestConfig.apiBaseUrl}/models`;
  try {
    const response = await fetchWithTimeout(modelsUrl, { headers }, AI_SERVER_CHECK_TIMEOUT_MS);
    if (!response.ok) {
      const detail = await responseErrorDetail(response);
      const suffix = detail ? `: ${detail}` : "";
      return { ok: false, baseUrl: requestConfig.apiBaseUrl, message: `${modelsUrl} returned HTTP ${response.status}${suffix}`, models: [] };
    }
    const data = await response.json();
    const models = (Array.isArray(data.data) ? data.data : []).map(modelInfoFromUnknown).filter((model) => Boolean(model?.id));
    const merged = shouldProbeLmStudioNativeModels(requestConfig.apiBaseUrl) ? await mergeLmStudioNativeModels(requestConfig, headers, models) : sortModelInfo(models);
    return {
      ok: true,
      baseUrl: requestConfig.apiBaseUrl,
      message: `Connected to ${requestConfig.apiBaseUrl}. Found ${merged.length} model${merged.length === 1 ? "" : "s"}.`,
      models: merged
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      baseUrl: requestConfig.apiBaseUrl,
      message: `Could not reach ${modelsUrl}: ${detail}. Check the host, port, server status, and browser/CORS access.`,
      models: []
    };
  }
}
async function probeOpenAICompatibleModels(config = loadAiEndpointConfig()) {
  const result = await checkOpenAICompatibleServer(config);
  return { models: result.models, error: result.ok ? void 0 : result.message, baseUrl: result.baseUrl };
}
var ChatHarness = class {
  constructor(vfs) {
    this.vfs = vfs;
  }
  vfs;
  messages = [];
  abortController = null;
  readVersions = /* @__PURE__ */ new Map();
  tokenCounter = {
    key: "",
    calibrated: false,
    dirty: true,
    basePromptTokens: 0,
    promptTokens: 0,
    lastPromptTokens: 0,
    lastCompletionTokens: 0,
    lastTotalTokens: 0,
    source: "none"
  };
  get running() {
    return this.abortController !== null;
  }
  cancel() {
    this.abortController?.abort();
  }
  tokenUsage() {
    const { key: _key, ...usage } = this.tokenCounter;
    return { ...usage };
  }
  exportJsonl() {
    const messages = this.visibleMessages();
    if (messages.length === 0) return "";
    return `${messages.map((msg) => JSON.stringify({
      id: msg.id,
      at: new Date(msg.at).toISOString(),
      role: msg.role,
      name: msg.name,
      ok: msg.ok,
      text: msg.text
    })).join("\n")}
`;
  }
  debugApiJsonl(runtime, editorContext) {
    const normalizedRuntime = normalizeRuntimeSettings(runtime);
    const messages = this.apiMessages(
      normalizedRuntime,
      [],
      shouldUseNativeTools(loadAiEndpointConfig(), normalizedRuntime),
      editorContext ? formatEditorContext(editorContext) : null
    );
    return `${messages.map((msg, index) => JSON.stringify({
      index,
      ...msg
    })).join("\n")}
`;
  }
  visibleMessages() {
    const visible = [];
    for (const msg of this.messages) {
      if (msg.internal) continue;
      const text = msg.displayText ?? msg.text;
      if (msg.role === "assistant" && !text.trim()) continue;
      visible.push(text === msg.text ? msg : { ...msg, text });
    }
    return visible;
  }
  clear() {
    this.messages.splice(0, this.messages.length);
    this.readVersions.clear();
    this.resetTokenCounterState();
  }
  async compact(runtimeSettings, options = {}) {
    if (this.running) return { ok: false, output: "Chat is busy." };
    const config = loadAiEndpointConfig();
    const runtime = normalizeRuntimeSettings(runtimeSettings);
    if (!config.model) {
      const output = "No model is configured yet. Use Settings > AI to edit the OpenAI-compatible endpoint settings, or probe LM Studio models.";
      this.push({ role: "system", text: output, ok: false }, options.onUpdate);
      await this.persist();
      return { ok: false, output };
    }
    const readyConfig = await this.ensureContextTokensKnown(config, options.onUpdate);
    if (!readyConfig) {
      const output = "Max context tokens are unknown. Set Settings > AI > Max Context Tokens, or probe LM Studio max tokens before starting the assistant.";
      this.push({ role: "system", text: output }, options.onUpdate);
      await this.persist();
      return { ok: false, output };
    }
    const controller = new AbortController();
    this.abortController = controller;
    try {
      this.resetTokenCounterIfNeeded(readyConfig, runtime);
      return await this.compactConversation(readyConfig, runtime, controller.signal, options);
    } catch (error) {
      const output = `Compaction failed: ${error instanceof Error ? error.message : String(error)}`;
      this.push({ role: "system", text: output }, options.onUpdate);
      return { ok: false, output };
    } finally {
      this.abortController = null;
      await this.persist();
      options.onUpdate?.();
    }
  }
  async send(input, activeDoc, openDocs, options) {
    const userInput = input.trim();
    if (!userInput || this.running) return;
    const config = loadAiEndpointConfig();
    const runtime = normalizeRuntimeSettings(options.runtime);
    const context = {
      selectedText: activeDoc?.selectedText() ?? "",
      openPaths: openDocs.map((doc) => doc.path ?? "(untitled)")
    };
    if (activeDoc?.path) context.activePath = activeDoc.path;
    const editorContext = options.editorContext ? formatEditorContext({ ...context, ...options.editorContext }) : null;
    this.push({ role: "user", text: userInput }, options.onUpdate);
    const controller = new AbortController();
    this.abortController = controller;
    const openByPath = new Map(openDocs.filter((doc) => doc.path).map((doc) => [normalizePath(doc.path), doc]));
    try {
      if (!config.model) {
        this.push({
          role: "system",
          text: "No model is configured yet. Use Settings > AI to edit the OpenAI-compatible endpoint settings, or probe LM Studio models.",
          ok: false
        }, options.onUpdate);
        return;
      }
      const readyConfig = await this.ensureContextTokensKnown(config, options.onUpdate);
      if (!readyConfig) {
        this.push({
          role: "system",
          text: "Max context tokens are unknown. Set Settings > AI > Max Context Tokens, or probe LM Studio max tokens before starting the assistant."
        }, options.onUpdate);
        return;
      }
      this.resetTokenCounterIfNeeded(readyConfig, runtime);
      const tokenCounterWasCalibrated = this.tokenCounter.calibrated;
      await this.ensureTokenCounterCalibrated(readyConfig, runtime, controller.signal, editorContext);
      if (tokenCounterWasCalibrated) this.markTokenCounterDirtyForLocalMessage(userInput, runtime);
      let toolCalls = 0;
      let allowedToolCalls = runtime.maxToolCallsPerTurn;
      let allowUnlimitedToolCalls = false;
      let stopToolCalls = false;
      let lastFingerprint = "";
      let hiddenToolCallRepairs = 0;
      let pendingRepairPrompt = null;
      const ensureToolCallsAllowed = async () => {
        if (allowUnlimitedToolCalls || toolCalls < allowedToolCalls) return true;
        const decision = await options.onToolCallLimit?.(runtime.maxToolCallsPerTurn, toolCalls) ?? "stop";
        if (decision === "allowAll") {
          allowUnlimitedToolCalls = true;
          this.push({ role: "system", text: "Max tool calls reached; allowing unlimited tool calls for this turn." }, options.onUpdate);
          return true;
        }
        if (decision === "allowMore") {
          allowedToolCalls += runtime.maxToolCallsPerTurn;
          this.push({ role: "system", text: `Max tool calls reached; allowing ${runtime.maxToolCallsPerTurn} more for this turn.` }, options.onUpdate);
          return true;
        }
        this.push({ role: "system", text: "Max tool calls reached; stopped tool calls for this turn." }, options.onUpdate);
        return false;
      };
      while (!controller.signal.aborted) {
        if (!await ensureToolCallsAllowed()) break;
        const result = await this.complete(readyConfig, runtime, controller.signal, options.onUpdate, pendingRepairPrompt, editorContext);
        pendingRepairPrompt = null;
        const extractedThinking = extractThinkingFromText(result.text, runtime.thinkingFormat);
        const thinking = [result.thinking, extractedThinking.thinking].filter(Boolean).join("\n\n");
        const assistantText = extractedThinking.text;
        if (thinking) {
          if (result.streamedThinkingMessage) {
            result.streamedThinkingMessage.text = thinking;
            options.onUpdate?.();
          } else {
            this.push({ role: "thinking", text: thinking }, options.onUpdate);
          }
        }
        const parsedCalls = runtime.toolCallFormat === "none" ? [] : result.toolCalls.length > 0 ? result.toolCalls : parseTextToolCalls(result.text, runtime.toolCallFormat);
        if (parsedCalls.length === 0) {
          const hiddenToolCall = runtime.toolCallFormat !== "none" && thinkingSuggestsToolCall(thinking, runtime.toolCallFormat);
          if (!assistantText.trim() && hiddenToolCall) {
            this.observeCompletionUsage(result);
            if (!completionResultHasUsage(result) && result.text) this.markTokenCounterDirtyForLocalMessage(result.text, runtime);
            if (hiddenToolCallRepairs >= 2) {
              this.push({ role: "system", ok: false, text: "The model kept writing tool calls inside hidden thinking. Hidden thinking is not executable, so no tool was run." }, options.onUpdate);
              await this.maybeAutoCompactAfterModelResponse(readyConfig, runtime, controller.signal, options, editorContext);
              break;
            }
            const repairPrompt = hiddenToolCallRepairPrompt(runtime.toolCallFormat);
            this.push({ role: "system", ok: false, text: "The model wrote a tool call inside thinking. Hidden thinking is not executable, so no tool was run; asking the model to resend the call as assistant content." }, options.onUpdate);
            pendingRepairPrompt = repairPrompt;
            this.markTokenCounterDirtyForLocalMessage(repairPrompt, runtime);
            hiddenToolCallRepairs++;
            continue;
          }
          const stripTools = runtime.toolCallFormat !== "none";
          if (result.streamedMessage) this.updateAssistantDisplayMessage(result.streamedMessage, assistantText, options.onUpdate, stripTools);
          else this.pushAssistantMessageForDisplay(assistantText || "(empty response)", options.onUpdate, stripTools);
          this.observeCompletionUsage(result);
          if (!completionResultHasUsage(result) && result.text) this.markTokenCounterDirtyForLocalMessage(result.text, runtime);
          if (!result.text) this.markTokenCounterDirtyForLocalMessage("(empty response)", runtime);
          await this.maybeAutoCompactAfterModelResponse(readyConfig, runtime, controller.signal, options, editorContext);
          break;
        }
        const visibleText = assistantText.trim();
        if (visibleText && !result.streamedMessage) {
          this.pushAssistantMessageForDisplay(visibleText, options.onUpdate, true);
        } else if (result.streamedMessage) {
          this.updateAssistantDisplayMessage(result.streamedMessage, visibleText, options.onUpdate, true);
        }
        this.observeCompletionUsage(result);
        if (!completionResultHasUsage(result) && result.text) this.markTokenCounterDirtyForLocalMessage(result.text, runtime);
        for (let callIndex = 0; callIndex < parsedCalls.length; callIndex++) {
          const call = parsedCalls[callIndex];
          if (!await ensureToolCallsAllowed()) {
            stopToolCalls = true;
            break;
          }
          const fingerprint = `${call.name}:${JSON.stringify(call.args)}`;
          if (runtime.detectDuplicateToolCalls && fingerprint === lastFingerprint) {
            const decision = await options.onDuplicateToolCall?.({ name: call.name, args: call.args, raw: call.raw }) ?? "break";
            if (decision === "break") {
              const output = "Duplicate tool call detected; ending turn.";
              this.push({ role: "tool_result", name: call.name, ok: false, text: output }, options.onUpdate);
              if (!call.nativeId) {
                const formattedResult = formatToolResult(output, runtime.toolCallFormat);
                this.push({ role: "user", text: formattedResult, internal: true });
                this.markTokenCounterDirtyForLocalMessage(formattedResult, runtime);
              }
              return;
            }
            this.push({ role: "system", text: `Duplicate tool call allowed: ${call.name}` }, options.onUpdate);
            this.markTokenCounterDirtyForLocalMessage(`Duplicate tool call allowed: ${call.name}`, runtime);
          }
          lastFingerprint = fingerprint;
          this.push({
            role: "tool_call",
            name: call.name,
            text: call.raw,
            nativeToolCallId: call.nativeId,
            nativeToolArguments: call.nativeArguments
          }, options.onUpdate);
          const toolResult = await this.runTool(call, openByPath, readyConfig, runtime, controller.signal, {
            onUpdate: options.onUpdate,
            onWorkspaceChange: options.onWorkspaceChange
          });
          this.push({
            role: "tool_result",
            name: call.name,
            ok: toolResult.ok,
            text: toolResult.output,
            nativeToolCallId: call.nativeId
          }, options.onUpdate);
          if (call.nativeId) {
            this.markTokenCounterDirtyForLocalMessage(toolResult.output, runtime);
          } else {
            const formattedResult = formatToolResult(toolResult.output, runtime.toolCallFormat);
            this.messages.push({ id: uid("msg"), role: "user", text: formattedResult, at: Date.now(), ok: toolResult.ok, internal: true });
            this.markTokenCounterDirtyForLocalMessage(formattedResult, runtime);
          }
          toolCalls++;
          if (!toolResult.ok) {
            this.skipRemainingNativeToolCallsAfterFailure(parsedCalls.slice(callIndex + 1), runtime, options.onUpdate);
            break;
          }
        }
        if (stopToolCalls) break;
      }
    } catch (error) {
      if (controller.signal.aborted) {
        this.push({ role: "system", text: "Turn canceled." }, options.onUpdate);
      } else {
        this.push({ role: "system", text: `Request failed: ${error instanceof Error ? error.message : String(error)}` }, options.onUpdate);
      }
    } finally {
      this.abortController = null;
      await this.persist();
      options.onUpdate?.();
    }
  }
  skipRemainingNativeToolCallsAfterFailure(calls, runtime, onUpdate) {
    for (const call of calls) {
      if (!call.nativeId) continue;
      const output = "Skipped because a previous tool call in the same assistant response failed.";
      this.push({
        role: "tool_call",
        name: call.name,
        text: call.raw,
        nativeToolCallId: call.nativeId,
        nativeToolArguments: call.nativeArguments
      }, onUpdate);
      this.push({
        role: "tool_result",
        name: call.name,
        ok: false,
        text: output,
        nativeToolCallId: call.nativeId
      }, onUpdate);
      this.markTokenCounterDirtyForLocalMessage(output, runtime);
    }
  }
  async persist() {
    await this.vfs.writeFile("/.slug-chat.json", JSON.stringify(this.messages, null, 2), "application/json");
  }
  push(seed, onUpdate) {
    const msg = { id: uid("msg"), at: Date.now(), ...seed };
    this.messages.push(msg);
    onUpdate?.();
    return msg;
  }
  pushAssistantMessageForDisplay(text, onUpdate, stripTools = true) {
    const displayText = (stripTools ? stripToolCallSyntax(text) : text).trim();
    return this.push({
      role: "assistant",
      text,
      displayText,
      internal: !displayText
    }, onUpdate);
  }
  updateAssistantDisplayMessage(message, text, onUpdate, stripTools = true) {
    const displayText = (stripTools ? stripToolCallSyntax(text) : text).trim();
    message.text = text;
    message.displayText = displayText;
    message.internal = !displayText;
    onUpdate?.();
  }
  async complete(config, runtime, signal, onUpdate, extraUserMessage, editorContext) {
    const nativeTools = shouldUseNativeTools(config, runtime);
    const tools = nativeTools ? NATIVE_TOOL_DEFINITIONS : [];
    const body = {
      model: config.model,
      messages: this.apiMessages(runtime, extraUserMessage ? [{ role: "user", content: extraUserMessage }] : [], nativeTools, editorContext),
      temperature: config.temperature,
      stream: true
    };
    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = "auto";
    }
    const response = await fetch(`${resolvedApiBaseUrl(config)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(config)
      },
      body: JSON.stringify(body),
      signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (response.body && contentType.toLowerCase().includes("text/event-stream")) {
      return this.readStreamingCompletion(response, onUpdate);
    }
    const data = await response.json();
    return completionResultFromJson(data);
  }
  async readStreamingCompletion(response, onUpdate) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const streamedToolCalls = /* @__PURE__ */ new Map();
    let buffer = "";
    let text = "";
    let thinking = "";
    let usage = emptyUsage();
    let streamedMessage;
    let streamedThinkingMessage;
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !readerDone });
      let event;
      while ((event = takeSseEvent()) !== null) {
        const payload = sseDataPayload(event);
        if (!payload) continue;
        if (payload === "[DONE]") {
          done = true;
          break;
        }
        const chunk = parseJsonObject(payload);
        if (!chunk) continue;
        const nextUsage = usageFromApi(chunk.usage);
        if (nextUsage.totalTokens > 0 || nextUsage.promptTokens > 0 || nextUsage.completionTokens > 0) usage = nextUsage;
        const choices = chunk.choices;
        if (!Array.isArray(choices)) continue;
        for (const choice of choices) {
          if (!choice || typeof choice !== "object") continue;
          const delta = choice.delta;
          if (!delta || typeof delta !== "object") continue;
          const content = streamDeltaText(delta, "content");
          const reasoning = streamDeltaText(delta, "reasoning_content") || streamDeltaText(delta, "reasoning");
          if (reasoning) {
            thinking += reasoning;
            if (!streamedThinkingMessage) {
              streamedThinkingMessage = this.push({ role: "thinking", text: reasoning }, onUpdate);
            } else {
              streamedThinkingMessage.text += reasoning;
              onUpdate?.();
            }
          }
          if (content) {
            text += content;
            if (!streamedMessage) {
              streamedMessage = this.push({ role: "assistant", text: content }, onUpdate);
            } else {
              streamedMessage.text += content;
              onUpdate?.();
            }
          }
          appendStreamToolCallDeltas(delta.tool_calls, streamedToolCalls);
        }
      }
      if (readerDone) break;
    }
    return {
      text,
      thinking,
      toolCalls: parseStreamedToolCalls(streamedToolCalls),
      usageTotal: usage.totalTokens,
      usagePrompt: usage.promptTokens,
      usageCompletion: usage.completionTokens,
      streamedMessage,
      streamedThinkingMessage
    };
    function takeSseEvent() {
      const lf = buffer.indexOf("\n\n");
      const crlf = buffer.indexOf("\r\n\r\n");
      const indexes = [
        lf >= 0 ? { index: lf, length: 2 } : null,
        crlf >= 0 ? { index: crlf, length: 4 } : null
      ].filter((item) => Boolean(item));
      if (indexes.length === 0) return null;
      indexes.sort((a, b) => a.index - b.index);
      const boundary = indexes[0];
      const event = buffer.slice(0, boundary.index);
      buffer = buffer.slice(boundary.index + boundary.length);
      return event;
    }
  }
  apiMessages(runtime, extraMessages = [], nativeTools = false, editorContext) {
    const messages = [
      { role: "system", content: composeAiSystemPrompt(runtime.toolCallFormat, nativeTools) }
    ];
    if (editorContext) messages.push({ role: "user", content: editorContext });
    for (const msg of this.messages) {
      if (isHiddenToolRepairMessage(msg)) continue;
      if (msg.role === "system") {
        if (isCompactedSummaryMessage(msg)) messages.push({ role: "user", content: msg.text });
        continue;
      }
      if (msg.role === "assistant") messages.push({ role: "assistant", content: msg.text });
      else if (msg.role === "tool_call") {
        if (nativeTools && msg.nativeToolCallId) {
          messages.push({
            role: "assistant",
            content: "",
            tool_calls: [{
              id: msg.nativeToolCallId,
              type: "function",
              function: { name: msg.name ?? "", arguments: msg.nativeToolArguments ?? "{}" }
            }]
          });
        } else {
          messages.push({ role: "assistant", content: msg.text });
        }
      } else if (msg.role === "tool_result") {
        if (nativeTools && msg.nativeToolCallId) {
          messages.push({ role: "tool", tool_call_id: msg.nativeToolCallId, content: msg.text });
        } else if (msg.nativeToolCallId) {
          messages.push({ role: "user", content: formatToolResult(msg.text, runtime.toolCallFormat) });
        }
      } else if (msg.role === "thinking") continue;
      else messages.push({ role: "user", content: msg.text });
    }
    messages.push(...extraMessages);
    return messages;
  }
  async maybeAutoCompactAfterModelResponse(config, runtime, signal, options, editorContext) {
    const maxTokens = resolveAiContextTokens(config);
    if (maxTokens <= 0) return;
    let used = this.tokenCounter.promptTokens || this.estimateCurrentPromptTokens(runtime, editorContext);
    let freePercent = Math.max(0, (maxTokens - used) / maxTokens * 100);
    if (this.tokenCounter.dirty && freePercent < runtime.compactFreePercent + DIRTY_TOKEN_REFRESH_MARGIN_PERCENT) {
      used = await this.refreshCurrentPromptTokens(config, runtime, signal, editorContext) || used;
      freePercent = Math.max(0, (maxTokens - used) / maxTokens * 100);
    }
    if (freePercent >= runtime.compactFreePercent) return;
    await this.compactConversation(config, runtime, signal, options);
  }
  async ensureTokenCounterCalibrated(config, runtime, signal, editorContext) {
    if (this.tokenCounter.calibrated) return;
    const nativeTools = shouldUseNativeTools(config, runtime);
    const tools = nativeTools ? NATIVE_TOOL_DEFINITIONS : [];
    const probeMessages = this.apiMessagesWithLatestUserReplaced(runtime, PROBE_USER_MESSAGE, nativeTools, editorContext);
    const usage = await this.probeTokenUsage(config, probeMessages, signal, tools);
    const basePromptTokens = basePromptTokensFromProbeUsage(usage);
    if (basePromptTokens > 0) {
      this.tokenCounter.basePromptTokens = basePromptTokens;
      this.tokenCounter.promptTokens = Math.max(basePromptTokens, this.estimateCurrentPromptTokens(runtime, editorContext));
      this.tokenCounter.calibrated = true;
      this.tokenCounter.dirty = true;
      this.tokenCounter.lastPromptTokens = usage.promptTokens;
      this.tokenCounter.lastCompletionTokens = usage.completionTokens || PROBE_COMPLETION_TOKEN_COUNT;
      this.tokenCounter.lastTotalTokens = usage.totalTokens;
      this.tokenCounter.source = "probe";
      return;
    }
    this.tokenCounter.promptTokens = this.estimateCurrentPromptTokens(runtime, editorContext);
    this.tokenCounter.dirty = true;
    this.tokenCounter.source = "estimate";
  }
  async refreshCurrentPromptTokens(config, runtime, signal, editorContext) {
    const nativeTools = shouldUseNativeTools(config, runtime);
    const usage = await this.probeTokenUsage(config, this.apiMessages(runtime, [], nativeTools, editorContext), signal, nativeTools ? NATIVE_TOOL_DEFINITIONS : []);
    const promptTokens = promptTokensFromRefreshUsage(usage);
    if (promptTokens <= 0) return 0;
    this.tokenCounter.promptTokens = promptTokens;
    this.tokenCounter.dirty = false;
    this.tokenCounter.lastPromptTokens = usage.promptTokens || promptTokens;
    this.tokenCounter.lastCompletionTokens = usage.completionTokens || PROBE_COMPLETION_TOKEN_COUNT;
    this.tokenCounter.lastTotalTokens = usage.totalTokens;
    this.tokenCounter.source = "refresh";
    return promptTokens;
  }
  async ensureContextTokensKnown(config, onUpdate) {
    if (resolveAiContextTokens(config) > 0) return config;
    const result = await probeOpenAICompatibleModels(config);
    const match = result.models.find((model) => model.id === config.model);
    if (!match?.contextLength) return null;
    const updated = saveAiEndpointConfig({ ...config, maxContextTokens: match.contextLength });
    this.push({ role: "system", text: `Detected ${match.contextLength} max context tokens for ${config.model}.` }, onUpdate);
    return updated;
  }
  async probeTokenUsage(config, messages, signal, tools = []) {
    try {
      const body = {
        model: config.model,
        max_tokens: 1,
        stream: false,
        messages
      };
      if (tools.length > 0) {
        body.tools = tools;
        body.tool_choice = "auto";
      }
      const response = await fetch(`${resolvedApiBaseUrl(config)}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(config)
        },
        body: JSON.stringify(body),
        signal
      });
      if (!response.ok) return emptyUsage();
      const data = await response.json();
      return usageFromApi(data.usage);
    } catch {
      return emptyUsage();
    }
  }
  apiMessagesWithLatestUserReplaced(runtime, replacement, nativeTools = false, editorContext) {
    const messages = this.apiMessages(runtime, [], nativeTools, editorContext).map((msg) => ({ ...msg }));
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        messages[i].content = replacement;
        return messages;
      }
    }
    messages.push({ role: "user", content: replacement });
    return messages;
  }
  observeCompletionUsage(result) {
    const promptTokens = result.usagePrompt;
    const completionTokens = result.usageCompletion || Math.max(0, result.usageTotal - result.usagePrompt);
    const currentTokens = result.usageTotal || (promptTokens > 0 && completionTokens > 0 ? promptTokens + completionTokens : promptTokens);
    if (currentTokens <= 0) return;
    this.tokenCounter.promptTokens = currentTokens;
    this.tokenCounter.lastPromptTokens = promptTokens;
    this.tokenCounter.lastCompletionTokens = completionTokens;
    this.tokenCounter.lastTotalTokens = result.usageTotal;
    this.tokenCounter.dirty = result.usageTotal <= 0;
    this.tokenCounter.source = "usage";
  }
  markTokenCounterDirtyForLocalMessage(text, runtime) {
    if (this.tokenCounter.promptTokens > 0) {
      this.tokenCounter.promptTokens += estimateMessageTokens(text);
    } else {
      this.tokenCounter.promptTokens = this.estimateCurrentPromptTokens(runtime);
    }
    this.tokenCounter.dirty = true;
    if (this.tokenCounter.source === "none") this.tokenCounter.source = "estimate";
  }
  estimateCurrentPromptTokens(runtime, editorContext) {
    return estimateTokens(this.apiMessages(runtime, [], false, editorContext).map((msg) => msg.content).join("\n"));
  }
  resetTokenCounterIfNeeded(config, runtime) {
    const key = tokenCounterKey(config, runtime);
    if (this.tokenCounter.key === key) return;
    this.resetTokenCounterState(key);
  }
  resetTokenCounterState(key = "") {
    this.tokenCounter = {
      key,
      calibrated: false,
      dirty: true,
      basePromptTokens: 0,
      promptTokens: 0,
      lastPromptTokens: 0,
      lastCompletionTokens: 0,
      lastTotalTokens: 0,
      source: "none"
    };
  }
  async compactConversation(config, runtime, signal, options) {
    const messages = this.compactionMessages();
    if (messages.length <= 2) return { ok: true, output: "Nothing to compact." };
    options.onCompactStart?.();
    try {
      const response = await fetch(`${resolvedApiBaseUrl(config)}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(config)
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0,
          max_tokens: 700,
          stream: false,
          messages
        }),
        signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim();
      if (!summary) throw new Error("empty summary");
      this.messages.splice(0, this.messages.length, {
        id: uid("msg"),
        role: "system",
        text: `${COMPACTED_SUMMARY_HEADER}

${summary}`,
        at: Date.now()
      });
      this.tokenCounter.promptTokens = this.estimateCurrentPromptTokens(runtime);
      this.tokenCounter.dirty = true;
      this.tokenCounter.source = "estimate";
      options.onUpdate?.();
      return { ok: true, output: "Conversation compacted." };
    } catch (error) {
      const output = `Compaction failed: ${error instanceof Error ? error.message : String(error)}`;
      this.push({ role: "system", text: output }, options.onUpdate);
      return { ok: false, output };
    } finally {
      options.onCompactEnd?.();
    }
  }
  compactionMessages() {
    const messages = [
      { role: "system", content: loadAiCompactPrompt() }
    ];
    for (const msg of this.messages) {
      if (msg.internal) continue;
      if (msg.role === "system" && !isCompactedSummaryMessage(msg)) continue;
      if (msg.role === "thinking" || msg.role === "tool_call" || msg.role === "tool_result") continue;
      const content = stripToolCallSyntax(msg.text).trim();
      if (content) messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content });
    }
    messages.push({ role: "user", content: "compact / summarize this chat" });
    return messages;
  }
  async runTool(call, openByPath, config, runtime, signal, options) {
    const name = call.name.replace(/^functions\./, "");
    if (name === "readFile") return this.toolReadFile(call.args);
    if (name === "writeFile") return this.toolWriteFile(call.args, openByPath, options.onWorkspaceChange);
    if (name === "editFile") return this.toolEditFile(call.args, openByPath, options.onWorkspaceChange);
    if (name === "grep") return this.toolGrep(call.args);
    if (name === "grepFile" || name === "grepIn") return this.toolGrepFile(call.args);
    if (name === "bash") return this.toolBash(call.args, openByPath, options.onWorkspaceChange);
    if (name === "compact") return this.compactConversation(config, runtime, signal, { onUpdate: options.onUpdate });
    return { ok: false, output: `Unknown tool: ${call.name}` };
  }
  async toolReadFile(args) {
    const path = normalizeToolPath(argString(args, 0, "path"));
    if (!path) return { ok: false, output: "readFile: missing path" };
    if (isUnsupportedFilePath(path)) return { ok: false, output: "File type not supported" };
    try {
      const text = await this.vfs.readText(path);
      await this.markFileObserved(path);
      return { ok: true, output: text };
    } catch {
      return { ok: false, output: `readFile: not found: ${path}` };
    }
  }
  async toolWriteFile(args, openByPath, onWorkspaceChange) {
    const path = normalizeToolPath(argString(args, 0, "path"));
    const content = argString(args, 1, "content");
    if (!path) return { ok: false, output: "writeFile: missing path" };
    if (content === void 0) return { ok: false, output: "writeFile: missing content" };
    const guard = await this.requireFreshReadBeforeExistingWrite(path, "writeFile");
    if (guard) return guard;
    await this.vfs.writeFile(path, content, "text/plain");
    if (onWorkspaceChange) await notifyWorkspaceChange(onWorkspaceChange, { type: "write", path, text: content });
    else syncOpenDocument(openByPath.get(path), content);
    return { ok: true, output: `Wrote ${path}` };
  }
  async toolEditFile(args, openByPath, onWorkspaceChange) {
    const path = normalizeToolPath(argString(args, 0, "path"));
    const oldString = argString(args, 1, "oldString");
    const newString = argString(args, 2, "newString") ?? "";
    if (!path || oldString === void 0) return { ok: false, output: "editFile: usage editFile(path, oldString, newString)" };
    const guard = await this.requireFreshReadBeforeExistingWrite(path, "editFile");
    if (guard) return guard;
    let content;
    try {
      content = await this.vfs.readText(path);
    } catch {
      return { ok: false, output: `editFile: not found: ${path}` };
    }
    if (!oldString) return { ok: false, output: "editFile: oldString must not be empty" };
    const first = content.indexOf(oldString);
    if (first < 0) return { ok: false, output: "editFile: oldString not found" };
    if (content.indexOf(oldString, first + oldString.length) >= 0) return { ok: false, output: "editFile: oldString is not unique" };
    const updated = content.slice(0, first) + newString + content.slice(first + oldString.length);
    await this.vfs.writeFile(path, updated, "text/plain");
    if (onWorkspaceChange) await notifyWorkspaceChange(onWorkspaceChange, { type: "write", path, text: updated });
    else syncOpenDocument(openByPath.get(path), updated);
    return { ok: true, output: `Edited ${path}` };
  }
  async requireFreshReadBeforeExistingWrite(path, toolName) {
    const node = await this.vfs.stat(path);
    if (!node) return null;
    if (node.kind !== "file") return { ok: false, output: `${toolName}: not a file: ${path}` };
    if (this.readVersions.get(path) === observedFileVersion(node)) return null;
    return { ok: false, output: `${toolName}: call readFile first before modifying existing file: ${path}` };
  }
  async markFileObserved(path) {
    const node = await this.vfs.stat(path);
    if (node?.kind === "file") this.readVersions.set(path, observedFileVersion(node));
    else this.readVersions.delete(path);
  }
  async toolGrep(args) {
    const pattern = argString(args, 0, "pattern");
    if (!pattern) return { ok: false, output: "grep: missing pattern" };
    return this.grepIn("/", pattern);
  }
  async toolGrepFile(args) {
    let pattern = argString(args, 0, "pattern");
    let path = argString(args, 1, "path");
    if (pattern?.startsWith("/") && path && !path.startsWith("/")) [pattern, path] = [path, pattern];
    if (!pattern || !path) return { ok: false, output: "grepFile: usage grepFile(pattern, path)" };
    return this.grepIn(path, pattern);
  }
  async grepIn(path, pattern) {
    let regex;
    try {
      regex = new RegExp(pattern);
    } catch (error) {
      return { ok: false, output: `grep: invalid regex: ${error instanceof Error ? error.message : String(error)}` };
    }
    const matcher = makeGrepMatcher(pattern, regex);
    const matches = [];
    const stats = { skippedLarge: 0, skippedBinary: 0 };
    const root = normalizeToolPath(path) || "/";
    const node = await this.vfs.stat(root);
    if (!node) return { ok: false, output: `grep: not found: ${root}` };
    if (node.kind === "file") {
      await this.grepFilePath(root, node, matcher, matches, stats);
    } else {
      const files = await this.vfs.listAllFiles();
      for (const file of files) {
        if (matches.length >= GREP_MAX_MATCHES) break;
        if (root !== "/" && !isSameOrDescendantPath(file.path, root)) continue;
        await this.grepFilePath(file.path, file, matcher, matches, stats);
      }
    }
    const notes = [];
    if (matches.length >= GREP_MAX_MATCHES) notes.push(`[grep truncated at ${GREP_MAX_MATCHES} matches]`);
    if (stats.skippedLarge > 0) notes.push(`[grep skipped ${stats.skippedLarge} file${stats.skippedLarge === 1 ? "" : "s"} larger than ${GREP_MAX_FILE_BYTES / (1024 * 1024)} MiB]`);
    if (stats.skippedBinary > 0) notes.push(`[grep skipped ${stats.skippedBinary} unsupported or binary file${stats.skippedBinary === 1 ? "" : "s"}]`);
    return { ok: true, output: [matches.length ? matches.join("\n") : "(no matches)", ...notes].join("\n") };
  }
  async grepFilePath(path, node, matcher, matches, stats) {
    if (matches.length >= GREP_MAX_MATCHES || isHiddenSearchPath(path)) return;
    if (isUnsupportedFilePath(path) || node.encoding === "binary") {
      stats.skippedBinary++;
      return;
    }
    if (node.size > GREP_MAX_FILE_BYTES) {
      stats.skippedLarge++;
      return;
    }
    let text = "";
    try {
      text = await this.vfs.readText(path);
    } catch {
      return;
    }
    const lines = text.split("\n");
    for (let i = 0; i < lines.length && matches.length < GREP_MAX_MATCHES; i++) {
      if (!matcher.test(lines[i])) continue;
      const line = lines[i].length > 200 ? `${lines[i].slice(0, 200)}...` : lines[i];
      matches.push(`${path}:${i + 1}: ${line}`);
    }
  }
  async toolBash(args, openByPath, onWorkspaceChange) {
    const command = argString(args, 0, "command");
    if (!command) return { ok: false, output: "bash: missing command" };
    if (/[|;><&`]|\$\(/.test(command)) return { ok: false, output: "bash: shell operators are not supported in the browser; use writeFile(path, content) to create or populate files" };
    const argv = tokenizeShell(command);
    if (argv.length === 0) return { ok: true, output: "" };
    const cmd = argv[0];
    if (cmd === "pwd") return { ok: true, output: "/\n" };
    if (cmd === "ls") return this.bashLs(argv);
    if (cmd === "cat") return this.bashCat(argv);
    if (cmd === "mkdir") return this.bashMkdir(argv, onWorkspaceChange);
    if (cmd === "rmdir") return this.bashRmdir(argv, onWorkspaceChange);
    if (cmd === "rm") return this.bashRm(argv, openByPath, onWorkspaceChange);
    if (cmd === "cp") return this.bashCp(argv, openByPath, onWorkspaceChange);
    if (cmd === "mv") return this.bashMv(argv, openByPath, onWorkspaceChange);
    if (cmd === "touch") return this.bashTouch(argv, openByPath, onWorkspaceChange);
    if (cmd === "echo") return { ok: true, output: `${argv.slice(1).join(" ")}
` };
    return { ok: false, output: `bash: unsupported browser command: ${cmd}` };
  }
  async bashLs(argv) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set(["-R"]));
    if (parsed.error) return { ok: false, output: `ls: ${parsed.error}` };
    if (parsed.operands.length > 1) return { ok: false, output: "ls: usage ls [-R] [path]" };
    const target = normalizeToolPath(parsed.operands[0] ?? "/") || "/";
    const node = await this.vfs.stat(target);
    if (!node) return { ok: false, output: `ls: ${target}: No such file or directory` };
    if (node.kind === "file") return { ok: true, output: `${basename(target)}
` };
    if (parsed.flags.has("-R")) return { ok: true, output: await this.recursiveLs(target) };
    const rows = await this.visibleDirRows(target);
    return { ok: true, output: rows.map(formatLsNode).join("\n") + (rows.length ? "\n" : "") };
  }
  async bashCat(argv) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set());
    if (parsed.error) return { ok: false, output: `cat: ${parsed.error}` };
    const paths = parsed.operands.map(normalizeToolPath).filter((path) => Boolean(path));
    if (paths.length === 0) return { ok: false, output: "cat: missing file" };
    const out = [];
    for (const path of paths) {
      try {
        out.push(await this.vfs.readText(path));
      } catch {
        return { ok: false, output: `cat: ${path}: No such file` };
      }
      await this.markFileObserved(path);
    }
    return { ok: true, output: out.join("") };
  }
  async bashMkdir(argv, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set(["-p"]));
    if (parsed.error) return { ok: false, output: `mkdir: ${parsed.error}` };
    const dirs = parsed.operands;
    if (dirs.length === 0) return { ok: false, output: "mkdir: missing operand" };
    let created = 0;
    for (const dir of dirs) {
      const path = normalizeToolPath(dir) || "/";
      if (path === "/") continue;
      await this.vfs.mkdir(path);
      await notifyWorkspaceChange(onWorkspaceChange, { type: "mkdir", path });
      created++;
    }
    return { ok: true, output: `Created ${created} director${created === 1 ? "y" : "ies"}` };
  }
  async bashRmdir(argv, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set());
    if (parsed.error) return { ok: false, output: `rmdir: ${parsed.error}` };
    const dirs = parsed.operands;
    if (dirs.length === 0) return { ok: false, output: "rmdir: missing operand" };
    let removed = 0;
    for (const dir of dirs) {
      const path = normalizeToolPath(dir) || "/";
      if (path === "/") return { ok: false, output: "rmdir: refusing to remove /" };
      try {
        await this.vfs.remove(path, { recursive: false });
        await notifyWorkspaceChange(onWorkspaceChange, { type: "remove", path, recursive: false });
        removed++;
      } catch (error) {
        return { ok: false, output: `rmdir: ${error instanceof Error ? error.message : String(error)}` };
      }
    }
    return { ok: true, output: `Removed ${removed} director${removed === 1 ? "y" : "ies"}` };
  }
  async bashRm(argv, openByPath, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set(["-r", "-R", "-f", "-rf", "-fr", "-Rf", "-fR"]));
    if (parsed.error) return { ok: false, output: `rm: ${parsed.error}` };
    const recursive = parsed.flags.has("-r") || parsed.flags.has("-R") || parsed.flags.has("-rf") || parsed.flags.has("-fr") || parsed.flags.has("-Rf") || parsed.flags.has("-fR");
    const force = parsed.flags.has("-f") || parsed.flags.has("-rf") || parsed.flags.has("-fr") || parsed.flags.has("-Rf") || parsed.flags.has("-fR");
    const targets = parsed.operands;
    if (targets.length === 0) return { ok: false, output: "rm: missing operand" };
    const expanded = await this.expandBashPathPatterns(targets);
    if (expanded.length === 0) {
      return { ok: force, output: force ? "rm: removed 0 paths (no matches)" : `rm: cannot remove '${targets[0]}': No such file or directory` };
    }
    let removed = 0;
    for (const path of expanded) {
      if (path === "/") return { ok: false, output: "rm: refusing to remove /" };
      const node = await this.vfs.stat(path);
      if (!node) {
        if (force) continue;
        return { ok: false, output: `rm: cannot remove '${path}': No such file or directory` };
      }
      try {
        await this.vfs.remove(path, { recursive });
      } catch (error) {
        return { ok: false, output: `rm: ${error instanceof Error ? error.message : String(error)}` };
      }
      deleteOpenPathsUnder(openByPath, path, recursive);
      await notifyWorkspaceChange(onWorkspaceChange, { type: "remove", path, recursive });
      removed++;
    }
    return { ok: true, output: `Removed ${removed} path${removed === 1 ? "" : "s"}` };
  }
  async bashCp(argv, openByPath, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set());
    if (parsed.error) return { ok: false, output: `cp: ${parsed.error}` };
    const [sourceArg, destArg] = parsed.operands;
    const source = normalizeToolPath(sourceArg);
    const dest = normalizeToolPath(destArg);
    if (!source || !dest) return { ok: false, output: "cp: usage cp source dest" };
    const node = await this.vfs.stat(source);
    if (!node || node.kind !== "file") return { ok: false, output: `cp: not a file: ${source}` };
    const guard = await this.requireFreshReadBeforeExistingWrite(dest, "cp");
    if (guard) return guard;
    const data = await this.vfs.readFile(source);
    await this.vfs.writeFile(dest, data, node.mime ?? "text/plain");
    const text = await readWorkspaceTextIfSupported(this.vfs, dest);
    if (onWorkspaceChange) await notifyWorkspaceChange(onWorkspaceChange, { type: "write", path: dest, text });
    else if (text !== void 0) syncOpenDocument(openByPath.get(dest), text);
    return { ok: true, output: `Copied ${source} to ${dest}` };
  }
  async bashMv(argv, openByPath, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set());
    if (parsed.error) return { ok: false, output: `mv: ${parsed.error}` };
    const [sourceArg, destArg] = parsed.operands;
    const source = normalizeToolPath(sourceArg);
    const dest = normalizeToolPath(destArg);
    if (!source || !dest) return { ok: false, output: "mv: usage mv source dest" };
    const remappedOpenDocs = openPathRemaps(openByPath, source, dest);
    await this.vfs.rename(source, dest);
    await notifyWorkspaceChange(onWorkspaceChange, { type: "rename", oldPath: source, newPath: dest });
    for (const item of remappedOpenDocs) {
      openByPath.delete(item.oldPath);
      if (!onWorkspaceChange) item.doc.path = item.newPath;
      openByPath.set(item.newPath, item.doc);
    }
    return { ok: true, output: `Moved ${source} to ${dest}` };
  }
  async bashTouch(argv, openByPath, onWorkspaceChange) {
    const parsed = parseBashFlags(argv.slice(1), /* @__PURE__ */ new Set());
    if (parsed.error) return { ok: false, output: `touch: ${parsed.error}` };
    const targets = parsed.operands;
    if (targets.length === 0) return { ok: false, output: "touch: missing file operand" };
    for (const target of targets) {
      const path = normalizeToolPath(target) || "";
      if (!path) continue;
      const existing = await this.vfs.stat(path);
      if (existing?.kind === "file") {
        const guard = await this.requireFreshReadBeforeExistingWrite(path, "touch");
        if (guard) return guard;
      }
      const text = existing?.kind === "file" ? await this.vfs.readText(path) : "";
      await this.vfs.writeFile(path, text, "text/plain");
      if (onWorkspaceChange) await notifyWorkspaceChange(onWorkspaceChange, { type: "write", path, text });
      else syncOpenDocument(openByPath.get(path), text);
    }
    return { ok: true, output: `Touched ${targets.length} file${targets.length === 1 ? "" : "s"}` };
  }
  async recursiveLs(path) {
    const rows = await this.visibleDirRows(path);
    const out = [`${path}:`, ...rows.map(formatLsNode)];
    for (const row of rows.filter((item) => item.kind === "dir")) {
      out.push("", await this.recursiveLs(row.path));
    }
    return `${out.join("\n")}
`;
  }
  async visibleDirRows(path) {
    return (await this.vfs.listDir(path)).filter((child) => child.path !== normalizePath(path) && !child.name.startsWith("."));
  }
  async expandBashPathPatterns(patterns) {
    const expanded = [];
    for (const pattern of patterns) {
      if (hasShellGlob(pattern)) expanded.push(...await expandSimpleGlob(this.vfs, pattern));
      else expanded.push(normalizeToolPath(pattern));
    }
    return uniquePaths(expanded.filter(Boolean));
  }
};
async function notifyWorkspaceChange(handler, change) {
  if (!handler) return;
  await handler(change);
}
function parseBashFlags(args, allowedFlags) {
  const flags = /* @__PURE__ */ new Set();
  const operands = [];
  let parsingFlags = true;
  for (const arg of args) {
    if (parsingFlags && arg === "--") {
      parsingFlags = false;
      continue;
    }
    if (parsingFlags && arg.startsWith("-") && arg !== "-") {
      if (!allowedFlags.has(arg)) return { flags, operands, error: `unsupported browser flag: ${arg}` };
      flags.add(arg);
      continue;
    }
    parsingFlags = false;
    operands.push(arg);
  }
  return { flags, operands };
}
function formatLsNode(node) {
  return `${node.name}${node.kind === "dir" ? "/" : ""}`;
}
function hasShellGlob(pattern) {
  return /[*?[]/.test(pattern);
}
async function expandSimpleGlob(vfs, pattern) {
  const normalized = normalizeToolPath(pattern);
  const parent = dirname(normalized);
  const namePattern = basename(normalized);
  if (hasShellGlob(parent)) return [];
  const parentNode = await vfs.stat(parent);
  if (!parentNode || parentNode.kind !== "dir") return [];
  const matcher = globMatcher(namePattern);
  const includeHidden = namePattern.startsWith(".");
  const rows = await vfs.listDir(parent);
  return rows.filter((node) => node.path !== parent && (includeHidden || !node.name.startsWith(".")) && matcher.test(node.name)).map((node) => node.path).sort((a, b) => a.localeCompare(b));
}
function globMatcher(pattern) {
  let source = "^";
  for (const char of pattern) {
    if (char === "*") source += ".*";
    else if (char === "?") source += ".";
    else source += char.replace(/[\\^$+?.()|{}[\]]/g, "\\$&");
  }
  source += "$";
  return new RegExp(source);
}
function uniquePaths(paths) {
  return [...new Set(paths.map(normalizePath))].sort((a, b) => b.length - a.length || a.localeCompare(b));
}
async function readWorkspaceTextIfSupported(vfs, path) {
  if (isUnsupportedFilePath(path)) return void 0;
  try {
    return await vfs.readText(path);
  } catch {
    return void 0;
  }
}
function openPathRemaps(openByPath, oldPath, newPath) {
  const oldNormalized = normalizePath(oldPath);
  const newNormalized = normalizePath(newPath);
  const result = [];
  for (const [path, doc] of openByPath) {
    if (!isSameOrDescendantPath(path, oldNormalized)) continue;
    result.push({
      oldPath: path,
      newPath: path === oldNormalized ? newNormalized : joinPath(newNormalized, path.slice(oldNormalized.length + 1)),
      doc
    });
  }
  return result;
}
function deleteOpenPathsUnder(openByPath, path, recursive) {
  const normalized = normalizePath(path);
  for (const key of [...openByPath.keys()]) {
    if (key === normalized || recursive && isSameOrDescendantPath(key, normalized)) openByPath.delete(key);
  }
}
function isSameOrDescendantPath(path, parent) {
  const normalizedPath = normalizePath(path);
  const normalizedParent = normalizePath(parent);
  return normalizedPath === normalizedParent || normalizedParent !== "/" && normalizedPath.startsWith(`${normalizedParent}/`);
}
function isHiddenSearchPath(path) {
  return normalizePath(path).split("/").some((segment) => segment.startsWith("."));
}
function makeGrepMatcher(pattern, regex) {
  if (!/[\\^$.*+?()[\]{}|]/.test(pattern)) {
    return { test: (line) => line.includes(pattern) };
  }
  return {
    test: (line) => {
      regex.lastIndex = 0;
      return regex.test(line);
    }
  };
}
function observedFileVersion(node) {
  return `${node.id}:${node.contentId ?? ""}:${node.size}:${node.mtime}`;
}
function normalizeAiEndpointConfig(value) {
  const raw = typeof value === "object" && value ? value : {};
  const maxContextTokens = numericSetting(raw.maxContextTokens);
  return {
    apiBaseUrl: typeof raw.apiBaseUrl === "string" ? raw.apiBaseUrl : DEFAULT_AI_ENDPOINT_CONFIG.apiBaseUrl,
    apiKey: typeof raw.apiKey === "string" ? raw.apiKey : "",
    model: typeof raw.model === "string" ? raw.model : "",
    temperature: Number.isFinite(raw.temperature) ? Number(raw.temperature) : DEFAULT_AI_ENDPOINT_CONFIG.temperature,
    maxContextTokens: Number.isFinite(maxContextTokens) ? Math.max(0, Math.trunc(maxContextTokens)) : 0
  };
}
function withResolvedApiBaseUrl(config) {
  return { ...config, apiBaseUrl: resolvedApiBaseUrl(config) };
}
function resolvedApiBaseUrl(config) {
  return normalizeBaseUrl(config.apiBaseUrl);
}
function normalizeRuntimeSettings(value) {
  return {
    maxToolCallsPerTurn: Number.isFinite(value.maxToolCallsPerTurn) ? Math.max(1, Math.trunc(Number(value.maxToolCallsPerTurn))) : DEFAULT_AI_RUNTIME_SETTINGS.maxToolCallsPerTurn,
    detectDuplicateToolCalls: typeof value.detectDuplicateToolCalls === "boolean" ? value.detectDuplicateToolCalls : DEFAULT_AI_RUNTIME_SETTINGS.detectDuplicateToolCalls,
    toolCallFormat: value.toolCallFormat === "harmony" || value.toolCallFormat === "none" ? value.toolCallFormat : "tag",
    thinkingFormat: "auto",
    compactFreePercent: Number.isFinite(value.compactFreePercent) ? Math.max(1, Math.min(95, Math.trunc(Number(value.compactFreePercent)))) : DEFAULT_AI_RUNTIME_SETTINGS.compactFreePercent
  };
}
function normalizeBaseUrl(raw) {
  let url = String(raw || "").trim() || DEFAULT_AI_ENDPOINT_CONFIG.apiBaseUrl;
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  url = url.replace(/\/+$/, "");
  try {
    const parsed = new URL(url);
    if (!parsed.port && shouldUseLmStudioDefaultPort(parsed.hostname)) parsed.port = "1234";
    url = parsed.toString().replace(/\/+$/, "");
  } catch {
  }
  if (!/\/(?:api\/)?v\d+$/i.test(url)) url += "/v1";
  return url;
}
function shouldUseLmStudioDefaultPort(hostname) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "::1" || host.endsWith(".local") || isPrivateIpv4(host);
}
function isPrivateIpv4(host) {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [a, b] = octets;
  return a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
}
function numericSetting(value) {
  if (Number.isFinite(value)) return Number(value);
  if (typeof value === "string" && value.trim()) return Number(value.trim());
  return Number.NaN;
}
function authHeaders(config) {
  return config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
}
function readJsonLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function responseErrorDetail(response) {
  try {
    const text = await response.text();
    return text.trim().replace(/\s+/g, " ").slice(0, 240);
  } catch {
    return "";
  }
}
async function fetchWithTimeout(input, init, timeoutMs) {
  const controller = new AbortController();
  let timeout = 0;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = window.setTimeout(() => {
      controller.abort();
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([fetch(input, { ...init, signal: controller.signal }), timeoutPromise]);
  } finally {
    window.clearTimeout(timeout);
  }
}
async function mergeLmStudioNativeModels(config, headers, models) {
  const result = [...models];
  const base = config.apiBaseUrl.replace(/\/(?:api\/)?v\d+$/i, "");
  for (const nativeBase of [`${base}/api/v1`, `${base}/api/v0`]) {
    try {
      const response = await fetchWithTimeout(`${nativeBase}/models`, { headers }, LM_STUDIO_NATIVE_PROBE_TIMEOUT_MS);
      if (!response.ok) continue;
      const data = await response.json();
      for (const raw of Array.isArray(data.data) ? data.data : []) {
        const model = modelInfoFromUnknown(raw);
        if (!model) continue;
        const existing = result.find((item) => item.id === model.id);
        if (existing) existing.contextLength ||= model.contextLength;
        else result.push(model);
      }
    } catch {
    }
  }
  return sortModelInfo(result);
}
function shouldProbeLmStudioNativeModels(apiBaseUrl) {
  try {
    const host = new URL(apiBaseUrl).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}
function sortModelInfo(models) {
  return [...models].sort((a, b) => a.id.localeCompare(b.id));
}
function modelInfoFromUnknown(raw) {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw;
  const id = typeof obj.id === "string" ? obj.id : "";
  if (!id) return null;
  return { id, contextLength: contextLengthFromObject(obj) };
}
function contextLengthFromObject(obj) {
  for (const key of ["loaded_context_length", "max_context_length", "context_length", "max_model_len", "context_window", "n_ctx"]) {
    const value = obj[key];
    if (Number.isFinite(value)) return Math.max(0, Math.trunc(Number(value)));
  }
  return 0;
}
function bestKnownContextLength(model) {
  return builtinContextLength(model);
}
function builtinContextLength(model) {
  if (!model) return 0;
  if (/gpt-4o|gpt-5|gpt-4\.1/i.test(model)) return 128e3;
  if (/llama-3\.1|qwen|deepseek|mistral-large/i.test(model)) return 131072;
  return 0;
}
function tokenCounterKey(config, runtime) {
  const nativeTools = shouldUseNativeTools(config, runtime);
  return [
    resolvedApiBaseUrl(config),
    config.model,
    runtime.toolCallFormat,
    runtime.thinkingFormat,
    nativeTools ? "native-tools" : "text-tools",
    composeAiSystemPrompt(runtime.toolCallFormat, nativeTools)
  ].join("\n");
}
function composeAiSystemPrompt(format, nativeTools = false) {
  const systemPrompt = loadAiSystemPrompt().trimEnd();
  let toolPrompt = "";
  if (nativeTools) toolPrompt = DEFAULT_NATIVE_TOOL_PROMPT;
  else if (format === "tag") toolPrompt = loadAiTagToolPrompt().trim();
  else if (format === "harmony") toolPrompt = loadAiHarmonyToolPrompt().trim();
  return toolPrompt ? `${systemPrompt}

${toolPrompt}` : systemPrompt;
}
function shouldUseNativeTools(config, runtime) {
  if (runtime.toolCallFormat === "none") return false;
  const model = config.model.trim().toLowerCase();
  if (!model) return false;
  return /(?:^|[\/:_-])(?:gpt-oss|gpt-[45][a-z0-9._-]*|o[1345][a-z0-9._-]*)(?:$|[\/:_-])/i.test(model);
}
function sanitizeSystemPrompt(prompt) {
  const trimmed = prompt.trim();
  const toolBlockStart = legacyToolBlockStart(trimmed);
  if (toolBlockStart < 0) return trimmed;
  const cleaned = trimmed.slice(0, toolBlockStart).trim();
  return cleaned || DEFAULT_SYSTEM_PROMPT;
}
function sanitizeToolPrompt(prompt) {
  const removedToolLine = new RegExp(`^\\s*-\\s*${REMOVED_FILE_GREP_TOOL}\\b`);
  return prompt.split("\n").filter((line) => !removedToolLine.test(line)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function legacyToolBlockStart(prompt) {
  const markers = [
    "Available tools:",
    "Tag tool-call format:",
    "Harmony-style tool-call format:",
    "Use only this tag tool-call format",
    "Use only this harmony-style tool-call format"
  ];
  let start = -1;
  for (const marker of markers) {
    const index = prompt.indexOf(marker);
    if (index >= 0 && (start < 0 || index < start)) start = index;
  }
  return start;
}
function isCompactedSummaryMessage(msg) {
  return msg.role === "system" && msg.text.startsWith(COMPACTED_SUMMARY_HEADER);
}
function isHiddenToolRepairMessage(msg) {
  return msg.internal === true && msg.role === "user" && msg.text.startsWith("Your previous response put a tool call inside hidden reasoning/thinking.");
}
function usageFromApi(usage) {
  return {
    totalTokens: Math.max(0, Number(usage?.total_tokens ?? 0)),
    promptTokens: Math.max(0, Number(usage?.prompt_tokens ?? 0)),
    completionTokens: Math.max(0, Number(usage?.completion_tokens ?? 0))
  };
}
function completionResultFromJson(data) {
  const message = data.choices?.[0]?.message;
  const usage = usageFromApi(data.usage);
  return {
    text: message?.content ?? "",
    thinking: providerReasoningText(message),
    toolCalls: parseNativeToolCalls(message?.tool_calls),
    usageTotal: usage.totalTokens,
    usagePrompt: usage.promptTokens,
    usageCompletion: usage.completionTokens
  };
}
function completionResultHasUsage(result) {
  return result.usageTotal > 0 || result.usagePrompt > 0 || result.usageCompletion > 0;
}
function sseDataPayload(event) {
  const lines = event.replace(/\r\n/g, "\n").split("\n");
  const data = [];
  for (const line of lines) {
    if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  return data.join("\n").trim();
}
function parseJsonObject(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
function providerReasoningText(message) {
  if (typeof message?.reasoning_content === "string") return message.reasoning_content;
  return typeof message?.reasoning === "string" ? message.reasoning : "";
}
function streamDeltaText(delta, key) {
  const value = delta[key];
  return typeof value === "string" ? value : "";
}
function emptyUsage() {
  return { totalTokens: 0, promptTokens: 0, completionTokens: 0 };
}
function basePromptTokensFromProbeUsage(usage) {
  if (usage.totalTokens > 0) {
    const completion = usage.completionTokens || PROBE_COMPLETION_TOKEN_COUNT;
    return Math.max(0, usage.totalTokens - completion - PROBE_USER_TOKEN_COUNT);
  }
  if (usage.promptTokens > 0) return Math.max(0, usage.promptTokens - PROBE_USER_TOKEN_COUNT);
  return 0;
}
function promptTokensFromRefreshUsage(usage) {
  if (usage.promptTokens > 0) return usage.promptTokens;
  if (usage.totalTokens > 0) return Math.max(0, usage.totalTokens - (usage.completionTokens || PROBE_COMPLETION_TOKEN_COUNT));
  return 0;
}
function parseNativeToolCalls(raw) {
  if (!Array.isArray(raw)) return [];
  const result = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item;
    const fn = record.function;
    const name = typeof fn?.name === "string" ? fn.name : "";
    if (!name) continue;
    const nativeArguments = nativeArgumentsText(fn?.arguments);
    const args = parseJsonArgs(nativeArguments);
    result.push({
      name,
      args,
      raw: nativeToolCallText(name, args),
      nativeId: typeof record.id === "string" && record.id ? record.id : uid("call"),
      nativeArguments
    });
  }
  return result;
}
function appendStreamToolCallDeltas(raw, parts) {
  if (!Array.isArray(raw)) return;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item;
    const index = typeof record.index === "number" && Number.isFinite(record.index) ? record.index : parts.size;
    const part = parts.get(index) ?? { id: "", name: "", argumentsText: "" };
    if (typeof record.id === "string" && record.id) part.id = record.id;
    if (typeof record.function?.name === "string") part.name += record.function.name;
    if (typeof record.function?.arguments === "string") part.argumentsText += record.function.arguments;
    parts.set(index, part);
  }
}
function parseStreamedToolCalls(parts) {
  const result = [];
  for (const [, part] of [...parts.entries()].sort((a, b) => a[0] - b[0])) {
    if (!part.name) continue;
    const args = parseJsonArgs(part.argumentsText || "{}");
    result.push({
      name: part.name,
      args,
      raw: nativeToolCallText(part.name, args),
      nativeId: part.id || uid("call"),
      nativeArguments: part.argumentsText || "{}"
    });
  }
  return result;
}
function nativeArgumentsText(value) {
  if (typeof value === "string") return value || "{}";
  if (value === void 0 || value === null) return "{}";
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}
function nativeToolCallText(name, args) {
  return `<tool>${name}(${args.map((arg) => JSON.stringify(arg)).join(", ")})</tool>`;
}
function parseTextToolCalls(text, format) {
  if (format === "none") return [];
  return format === "harmony" ? parseHarmonyToolCalls(text) : parseTagToolCalls(text);
}
function thinkingSuggestsToolCall(text, format) {
  if (!text.trim() || format === "none") return false;
  if (format === "tag") return /<tool\b|<\/tool>|(?:readFile|writeFile|editFile|grep|grepFile|bash|compact)\s*\(/i.test(text);
  return /(?:<\|channel\|>\s*)?commentary\s+to\s*=\s*(?:functions\.)?(?:readFile|writeFile|editFile|grep|grepFile|bash|compact)\b|<\|call\|>|<\|message\|>/i.test(text);
}
function hiddenToolCallRepairPrompt(format) {
  if (format === "harmony") {
    return 'Your previous response put a tool call inside hidden reasoning/thinking. Hidden reasoning is not executable. If you need a tool, resend only the executable harmony tool call in assistant content/commentary now. Do not explain, do not use markdown, and do not put the call in analysis/reasoning. The format is: <|channel|>commentary to=readFile <|message|>{"path":"/README.md"}<|call|>';
  }
  return 'Your previous response put a tool call inside hidden reasoning/thinking. Hidden reasoning is not executable. If you need a tool, resend only the executable tag tool call in assistant content now. Do not explain, do not use markdown, and do not put the call in thinking. The format is: <tool>readFile("/README.md")</tool>';
}
function parseTagToolCalls(text) {
  const calls = [];
  const regex = /<tool>([\s\S]*?)<\/tool>/g;
  for (const match of text.matchAll(regex)) {
    const inner = match[1]?.trim() ?? "";
    const paren = inner.indexOf("(");
    const close = inner.lastIndexOf(")");
    if (paren <= 0 || close < paren) continue;
    const name = inner.slice(0, paren).trim();
    calls.push({ name, args: parseCallArgs(inner.slice(paren + 1, close)), raw: match[0] });
  }
  return calls;
}
function parseHarmonyToolCalls(text) {
  const calls = [];
  const regex = /<\|channel\|>\s*commentary(?:\s+to\s*=\s*([^\s<|]+))?[\s\S]*?<\|message\|>([\s\S]*?)(?=<\|call\|>|<\|end\|>|<\|start\|>|<\|channel\|>|$)/g;
  for (const match of text.matchAll(regex)) {
    const name = (match[1] ?? "").replace(/^functions\./, "");
    if (!name) continue;
    const rawArgs = match[2]?.trim() ?? "{}";
    calls.push({ name, args: parseJsonArgs(rawArgs), raw: match[0] });
  }
  return calls;
}
function extractThinkingFromText(text, format) {
  if (!text || format === "none") return { text, thinking: "" };
  if (format === "tag") return extractTagThinking(text);
  if (format === "harmony") return extractHarmonyThinking(text);
  const harmony = extractHarmonyThinking(text);
  const tagged = extractTagThinking(harmony.text);
  return {
    text: tagged.text,
    thinking: [harmony.thinking, tagged.thinking].filter(Boolean).join("\n\n")
  };
}
function extractTagThinking(text) {
  const thinking = [];
  const stripped = text.replace(/<think(?:ing)?\b[^>]*>([\s\S]*?)<\/think(?:ing)?>/gi, (_match, body) => {
    const trimmed = String(body).trim();
    if (trimmed) thinking.push(trimmed);
    return "";
  });
  return { text: stripped.trim(), thinking: thinking.join("\n\n") };
}
function extractHarmonyThinking(text) {
  const thinking = [];
  const final = [];
  let sawHarmonyMessage = false;
  const withoutAnalysisOrFinal = text.replace(/(?:<\|start\|>\s*assistant\s*)?<\|channel\|>\s*(analysis|final)\b[\s\S]*?<\|message\|>([\s\S]*?)(?:<\|end\|>|(?=<\|start\|>|<\|channel\|>|$))/gi, (_match, channel, body) => {
    sawHarmonyMessage = true;
    const trimmed = String(body).trim();
    if (trimmed) {
      if (String(channel).toLowerCase() === "analysis") thinking.push(trimmed);
      else final.push(trimmed);
    }
    return "";
  });
  if (final.length > 0) return { text: final.join("\n\n"), thinking: thinking.join("\n\n") };
  return {
    text: sawHarmonyMessage ? withoutAnalysisOrFinal.trim() : text,
    thinking: thinking.join("\n\n")
  };
}
function stripToolCallSyntax(text) {
  return text.replace(/<tool>[\s\S]*?<\/tool>/g, "").replace(/<\|channel\|>\s*commentary\s+to=[^\s<|]+[\s\S]*?<\|message\|>[\s\S]*?(?:<\|call\|>|<\|end\|>|$)/g, "").trim();
}
function parseJsonArgs(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
    return [parsed];
  } catch {
    return [raw];
  }
}
function parseCallArgs(src) {
  const args = [];
  let i = 0;
  const skipWs = () => {
    while (i < src.length && /\s/.test(src[i])) i++;
  };
  while (i < src.length) {
    skipWs();
    const quote = src[i];
    if (quote === '"' || quote === "'" || quote === "`") {
      i++;
      let out = "";
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < src.length) {
          const next = src[++i];
          out += next === "n" ? "\n" : next === "t" ? "	" : next === "r" ? "\r" : next;
          i++;
        } else {
          out += src[i++];
        }
      }
      if (src[i] === quote) i++;
      args.push(out);
    } else {
      let token = "";
      while (i < src.length && src[i] !== ",") token += src[i++];
      const trimmed = token.trim();
      if (trimmed === "true") args.push(true);
      else if (trimmed === "false") args.push(false);
      else if (trimmed === "null") args.push(null);
      else if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) args.push(Number(trimmed));
      else if (trimmed) args.push(trimmed);
    }
    skipWs();
    if (src[i] === ",") i++;
  }
  return args;
}
function formatToolResult(output, format) {
  if (format === "harmony") return `<|channel|>commentary <|message|>${output}<|end|>`;
  if (format === "none") return `Tool result:
${output}`;
  return `<result>${output}</result>`;
}
function formatEditorContext(context) {
  const fileTreePaths = uniqueStrings(context.fileTreePaths ?? []);
  const shownTree = fileTreePaths.slice(0, EDITOR_CONTEXT_MAX_TREE_ENTRIES);
  const openNames = uniqueStrings(context.openFileNames ?? context.openPaths.map((path) => path === "(untitled)" ? path : basename(path)));
  const selectedText = truncateContextText(context.selectedText.trim(), EDITOR_CONTEXT_MAX_SELECTED_TEXT_CHARS);
  const lines = [
    "<editor-context>",
    "Current editor state. File contents are not included unless explicitly selected. Use readFile before relying on or modifying existing file contents.",
    "",
    "File tree:",
    ...formatContextList(shownTree),
    ...fileTreePaths.length > shownTree.length ? [`[file tree truncated: showing ${shownTree.length} of ${fileTreePaths.length} entries]`] : [],
    "",
    "Open files:",
    ...formatContextList(openNames),
    "",
    `Selected in file tree: ${context.selectedFileTreePath || "(none)"}`,
    `Active file: ${context.activePath || "(none)"}`
  ];
  if (selectedText) {
    lines.push("", `Active editor selection${context.activePath ? ` from ${context.activePath}` : ""}:`, selectedText);
  } else {
    lines.push("", "Active editor selection: (none)");
  }
  lines.push("</editor-context>");
  return lines.join("\n");
}
function formatContextList(items) {
  return items.length ? items.map((item) => `- ${item}`) : ["- (none)"];
}
function uniqueStrings(items) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    const value = item.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}
function truncateContextText(text, maxChars) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}
[selection truncated: ${text.length - maxChars} more characters]`;
}
function argString(args, index, key) {
  const direct = args[index];
  if (typeof direct === "string") return direct;
  if (typeof direct === "number" || typeof direct === "boolean") return String(direct);
  const first = args[0];
  if (key && first && typeof first === "object" && !Array.isArray(first)) {
    const value = first[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }
  return void 0;
}
function normalizeToolPath(path) {
  if (!path) return "";
  return normalizePath(path.startsWith("/") ? path : `/${path}`);
}
function syncOpenDocument(doc, text) {
  if (!doc || doc.readOnly) return;
  doc.selectAll();
  doc.replaceSelection(text, "agent");
  doc.markSaved();
}
function tokenizeShell(cmd) {
  const tokens = [];
  let cur = "";
  let single = false;
  let dbl = false;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (ch === "'" && !dbl) {
      single = !single;
      continue;
    }
    if (ch === '"' && !single) {
      dbl = !dbl;
      continue;
    }
    if (ch === "\\" && dbl && i + 1 < cmd.length) {
      cur += cmd[++i];
      continue;
    }
    if (/\s/.test(ch) && !single && !dbl) {
      if (cur) tokens.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
function estimateMessageTokens(text) {
  return estimateTokens(text) + ESTIMATED_CHAT_MESSAGE_OVERHEAD_TOKENS;
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
  readOnly = false;
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
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
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
  clear() {
    this.docsById.clear();
    this.docsByPath.clear();
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
    const doc = isUnsupportedFilePath(normalized) ? new TextDocument(normalized, UNSUPPORTED_FILE_TEXT) : new TextDocument(normalized, await this.vfs.readText(normalized));
    doc.readOnly = isUnsupportedFilePath(normalized);
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
  createVirtual(path, text) {
    const normalized = normalizePath(path);
    const existing = this.docsByPath.get(normalized);
    if (existing) {
      existing.selectAll();
      existing.replaceSelection(text, "virtual");
      existing.path = normalized;
      existing.syntaxId = syntaxFromPath(normalized);
      existing.readOnly = false;
      existing.markSaved();
      return existing;
    }
    const doc = new TextDocument(normalized, text);
    doc.markSaved();
    this.docsById.set(doc.id, doc);
    this.docsByPath.set(normalized, doc);
    return doc;
  }
  async save(doc) {
    if (doc.readOnly) {
      doc.markSaved();
      return;
    }
    if (!doc.path) {
      doc.path = `/untitled-${Date.now().toString(36)}.txt`;
      this.docsByPath.set(doc.path, doc);
    }
    await this.vfs.writeFile(doc.path, doc.getText(), "text/plain");
    doc.markSaved();
  }
  async saveAs(doc, path) {
    const normalized = normalizePath(path);
    if (doc.path && doc.path !== normalized) this.docsByPath.delete(doc.path);
    doc.path = normalized;
    doc.syntaxId = syntaxFromPath(normalized);
    doc.readOnly = isUnsupportedFilePath(normalized);
    this.docsByPath.set(normalized, doc);
    if (!doc.readOnly) await this.vfs.writeFile(normalized, doc.getText(), "text/plain");
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
    doc.readOnly = isUnsupportedFilePath(newNormalized);
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
  remove(id) {
    const doc = this.docsById.get(id);
    if (!doc) return void 0;
    this.docsById.delete(id);
    if (doc.path) this.docsByPath.delete(normalizePath(doc.path));
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
async function importFileList(vfs, files, onProgress) {
  const progress = { files: 0, dirs: 0, bytes: 0, currentPath: "/" };
  for (const file of Array.from(files)) {
    const relative = file.webkitRelativePath || file.name;
    await importFile(vfs, file, normalizePath(`/${relative}`), progress, onProgress);
  }
  return progress;
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
    if (!this.isFocused()) this.textarea.focus({ preventScroll: true });
    this.resetTextareaSentinel();
  }
  refocus(caretRect) {
    if (!this.activeTarget) return;
    if (caretRect) this.placeNearCaret(caretRect);
    if (!this.isFocused()) {
      this.textarea.focus({ preventScroll: true });
      this.resetTextareaSentinel();
    }
  }
  blur() {
    this.activeTarget = null;
    this.textarea.blur();
  }
  isFocused() {
    return document.activeElement === this.textarea;
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
    this.textarea.addEventListener("contextmenu", (event) => event.preventDefault());
    this.textarea.addEventListener("selectstart", (event) => event.preventDefault());
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
        if (target.kind !== "editor") {
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
  visualViewportCanvasResizeEnabled = true;
  visualViewportCanvasResizeDeferredUntil = 0;
  visualViewportCanvasResizeDeferredTimer = 0;
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
    if (this.visualViewportCanvasResizeDeferredTimer) window.clearTimeout(this.visualViewportCanvasResizeDeferredTimer);
    this.visualViewportCanvasResizeDeferredTimer = 0;
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
  setVisualViewportCanvasResizeEnabled(enabled) {
    if (this.visualViewportCanvasResizeEnabled === enabled) return;
    this.visualViewportCanvasResizeEnabled = enabled;
    this.update();
  }
  deferVisualViewportCanvasResize(ms) {
    const duration = Math.max(0, ms);
    if (duration <= 0) return;
    const until = performance.now() + duration;
    this.visualViewportCanvasResizeDeferredUntil = Math.max(this.visualViewportCanvasResizeDeferredUntil, until);
    if (this.visualViewportCanvasResizeDeferredTimer) window.clearTimeout(this.visualViewportCanvasResizeDeferredTimer);
    this.visualViewportCanvasResizeDeferredTimer = window.setTimeout(() => {
      this.visualViewportCanvasResizeDeferredTimer = 0;
      this.update();
    }, Math.max(16, Math.ceil(this.visualViewportCanvasResizeDeferredUntil - performance.now()) + 16));
    this.update();
  }
  isVisualViewportCanvasResizeDeferred() {
    return performance.now() < this.visualViewportCanvasResizeDeferredUntil;
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
    if (!this.visualViewportCanvasResizeEnabled) return;
    if (this.isVisualViewportCanvasResizeDeferred()) return;
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
var BASE_UI_FONT_SIZE = 13;
var BASE_UI_SMALL_FONT_SIZE = BASE_UI_FONT_SIZE - 2;
var BASE_CODE_FONT_SIZE = 14;
var BASE_TITLE_FONT_SIZE = 18;
var BASE_MINI_FONT_SIZE = 8;
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
    const emojiIndex = this.fonts.findIndex((item) => item.name.includes("NotoEmoji"));
    const monaspaceIndex = this.fonts.findIndex((item) => item.name.includes("MonaspaceNeon"));
    this.emojiFontIndex = emojiIndex >= 0 ? emojiIndex : 0;
    this.monaspaceFontIndex = monaspaceIndex >= 0 ? monaspaceIndex : 0;
    this.preferredFontIndex = {
      ui: 0,
      uiSmall: 0,
      code: 0,
      title: 0,
      mini: 0,
      gutter: this.monaspaceFontIndex
    };
    this.fontMetrics = {
      ui: this.makeFontMetrics(BASE_UI_FONT_SIZE),
      uiSmall: this.makeFontMetrics(BASE_UI_SMALL_FONT_SIZE),
      code: this.makeFontMetrics(BASE_CODE_FONT_SIZE),
      title: this.makeFontMetrics(BASE_TITLE_FONT_SIZE),
      mini: this.makeFontMetrics(BASE_MINI_FONT_SIZE),
      gutter: this.makeFontMetrics(BASE_CODE_FONT_SIZE, this.preferredFontIndex.gutter)
    };
    this.slugProgram = createProgram(gl, SLUG_VS, SLUG_FS);
    this.solidProgram = createProgram(gl, SOLID_VS, SOLID_FS);
    this.floatBuffer = mustBuffer(gl);
    this.glyphBuffer = mustBuffer(gl);
    this.solidBuffer = mustBuffer(gl);
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
  solidProgram;
  floatBuffer;
  glyphBuffer;
  solidBuffer;
  curveTexture;
  bandTexture;
  commands = [];
  clipStack = [];
  glyphMetrics = /* @__PURE__ */ new Map();
  emojiFontIndex;
  monaspaceFontIndex;
  preferredFontIndex;
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
  resolveCodePoint(codePoint, font = "ui") {
    const match = this.findFontGlyph(codePoint, font);
    return { font: this.fonts[match.fontIndex].name, glyphId: match.glyphId };
  }
  setViewport(viewport) {
    this.viewport = viewport;
  }
  configureText(codeFontSizePx, uiScalePercent, useMonospacedCodeFont = false) {
    const uiScale = Math.max(0.01, uiScalePercent / 100);
    this.preferredFontIndex.code = useMonospacedCodeFont ? this.monaspaceFontIndex : 0;
    this.fontMetrics.ui = this.makeFontMetrics(BASE_UI_FONT_SIZE * uiScale);
    this.fontMetrics.uiSmall = this.makeFontMetrics(BASE_UI_SMALL_FONT_SIZE * uiScale);
    this.fontMetrics.title = this.makeFontMetrics(BASE_TITLE_FONT_SIZE * uiScale);
    this.fontMetrics.mini = this.makeFontMetrics(BASE_MINI_FONT_SIZE * uiScale);
    this.fontMetrics.code = this.makeFontMetrics(Math.max(1, codeFontSizePx), this.preferredFontIndex.code);
    this.fontMetrics.gutter = this.makeFontMetrics(Math.max(1, codeFontSizePx), this.preferredFontIndex.gutter);
    this.glyphMetrics.clear();
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
    let boundProgram = null;
    for (const command of this.commands) {
      if (command.clip) this.applyScissor(command.clip);
      else gl.disable(gl.SCISSOR_TEST);
      if (command.type === "line" || command.type === "solidPolygon") {
        if (boundProgram !== "solid") {
          this.bindSolidProgram();
          boundProgram = "solid";
        }
        if (command.type === "line") this.drawLineCommand(command);
        else this.drawSolidPolygonCommand(command);
        continue;
      }
      if (boundProgram !== "slug") {
        this.bindSlugProgram();
        boundProgram = "slug";
      }
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
  solidPolygon(points, color) {
    if (points.length < 3 || color[3] <= 0) return;
    this.commands.push({ type: "solidPolygon", points: points.map((point) => ({ ...point })), color, clip: this.currentClip() });
  }
  line(a, b, width, color) {
    if (width <= 0 || color[3] <= 0) return;
    if (a.x === b.x && a.y === b.y) return;
    this.commands.push({ type: "line", a: { ...a }, b: { ...b }, width, color, clip: this.currentClip() });
  }
  text(text, x, y, color, font = "ui") {
    if (!text || color[3] <= 0) return 0;
    this.commands.push({ type: "text", text, x, y, color, font, clip: this.currentClip() });
    return this.measureText(text, font);
  }
  measureText(text, font = "ui") {
    let width = 0;
    for (const char of text) width += char === "	" ? this.defaultTabAdvance(font) : this.advanceForCodePoint(char.codePointAt(0) ?? 0, font);
    return width;
  }
  visualTextBounds(text, font = "ui") {
    const metrics = this.fontMetrics[font];
    let penX = 0;
    let xMin = Number.POSITIVE_INFINITY;
    let yMin = Number.POSITIVE_INFINITY;
    let xMax = Number.NEGATIVE_INFINITY;
    let yMax = Number.NEGATIVE_INFINITY;
    for (const char of text) {
      if (char === "	") {
        penX += this.defaultTabAdvance(font);
        continue;
      }
      const glyph = this.glyphForCodePoint(char.codePointAt(0) ?? 0, font);
      if (glyph.curves.length > 0) {
        xMin = Math.min(xMin, penX + glyph.xMin * metrics.sizePx);
        xMax = Math.max(xMax, penX + glyph.xMax * metrics.sizePx);
        yMin = Math.min(yMin, metrics.ascentPx - glyph.yMax * metrics.sizePx);
        yMax = Math.max(yMax, metrics.ascentPx - glyph.yMin * metrics.sizePx);
      }
      penX += this.advanceForGlyph(glyph, font);
    }
    if (!Number.isFinite(xMin)) return { x: 0, y: 0, w: this.measureText(text, font), h: this.lineHeight(font) };
    return { x: xMin, y: yMin, w: Math.max(0, xMax - xMin), h: Math.max(0, yMax - yMin) };
  }
  lineHeight(font = "ui") {
    return this.fontMetrics[font].lineHeightPx;
  }
  monoAdvance(font = "code") {
    return this.fontMetrics[font].monoAdvancePx;
  }
  makeFontMetrics(sizePx, fontIndex = 0) {
    const font = this.fonts[fontIndex]?.font ?? this.primaryFont;
    const scale = sizePx / font.unitsPerEm;
    const ascentPx = font.ascender * scale;
    const descentPx = -font.descender * scale;
    const lineHeightPx = Math.ceil((font.ascender - font.descender + font.lineGap) * scale);
    const monoAdvancePx = font.outlineForCodePoint("M".codePointAt(0)).advanceWidth * scale;
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
      } else if (command.type === "text") {
        for (const char of command.text) {
          if (char === "	") continue;
          const glyph = this.glyphForCodePoint(char.codePointAt(0) ?? 0, command.font);
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
  bindSolidProgram() {
    const gl = this.gl;
    gl.useProgram(this.solidProgram);
    gl.uniform2f(gl.getUniformLocation(this.solidProgram, "uViewport"), this.viewport.cssWidth, this.viewport.cssHeight);
  }
  drawTextCommand(command, frame) {
    const metrics = this.fontMetrics[command.font];
    const baseline = command.y + metrics.ascentPx;
    let penX = command.x;
    for (const char of command.text) {
      if (char === "	") {
        penX += this.defaultTabAdvance(command.font);
        continue;
      }
      const glyph = this.glyphForCodePoint(char.codePointAt(0) ?? 0, command.font);
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
  drawLineCommand(command) {
    const points = screenLineQuad(command.a, command.b, command.width);
    const floatData = new Float32Array([
      points[0].x,
      points[0].y,
      ...command.color,
      points[1].x,
      points[1].y,
      ...command.color,
      points[2].x,
      points[2].y,
      ...command.color,
      points[0].x,
      points[0].y,
      ...command.color,
      points[2].x,
      points[2].y,
      ...command.color,
      points[3].x,
      points[3].y,
      ...command.color
    ]);
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.solidBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floatData, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 24, 8);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  drawSolidPolygonCommand(command) {
    const triangleCount = command.points.length - 2;
    if (triangleCount <= 0) return;
    const floatData = new Float32Array(triangleCount * 3 * 6);
    let offset = 0;
    const pushVertex = (point) => {
      floatData[offset++] = point.x;
      floatData[offset++] = point.y;
      floatData[offset++] = command.color[0];
      floatData[offset++] = command.color[1];
      floatData[offset++] = command.color[2];
      floatData[offset++] = command.color[3];
    };
    const origin = command.points[0];
    for (let i = 1; i < command.points.length - 1; i++) {
      pushVertex(origin);
      pushVertex(command.points[i]);
      pushVertex(command.points[i + 1]);
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.solidBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floatData, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 24, 8);
    gl.drawArrays(gl.TRIANGLES, 0, triangleCount * 3);
  }
  glyphForCodePoint(codePoint, font) {
    const match = this.findFontGlyph(codePoint, font);
    const cacheKey = `${match.fontIndex}:${match.glyphId}`;
    const cached = this.glyphMetrics.get(cacheKey);
    if (cached) return cached;
    const outline = this.fonts[match.fontIndex].font.outlineForGlyph(match.glyphId);
    const glyph = this.makeGlyphMetrics(match.fontIndex, outline);
    this.glyphMetrics.set(cacheKey, glyph);
    return glyph;
  }
  findFontGlyph(codePoint, font) {
    for (const i of this.fontOrderFor(font)) {
      const glyphId = this.fonts[i]?.font.glyphIdForCodePoint(codePoint) ?? 0;
      if (glyphId > 0) return { fontIndex: i, glyphId };
    }
    return { fontIndex: this.preferredFontIndex[font] ?? 0, glyphId: 0 };
  }
  fontOrderFor(font) {
    const preferred = this.preferredFontIndex[font] ?? 0;
    const ordered = font === "code" && preferred === this.monaspaceFontIndex ? [preferred, this.emojiFontIndex, 0] : [preferred, 0, this.emojiFontIndex, this.monaspaceFontIndex];
    for (let i = 0; i < this.fonts.length; i++) ordered.push(i);
    return [...new Set(ordered.filter((index) => index >= 0 && index < this.fonts.length))];
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
        ["uiSmall", advanceWidth * this.fontMetrics.uiSmall.sizePx],
        ["code", advanceWidth * this.fontMetrics.code.sizePx],
        ["title", advanceWidth * this.fontMetrics.title.sizePx],
        ["mini", advanceWidth * this.fontMetrics.mini.sizePx],
        ["gutter", advanceWidth * this.fontMetrics.gutter.sizePx]
      ])
    };
  }
  advanceForCodePoint(codePoint, font) {
    return this.advanceForGlyph(this.glyphForCodePoint(codePoint, font), font);
  }
  advanceForGlyph(glyph, font) {
    return glyph.advancePxByFont.get(font) ?? this.fontMetrics[font].monoAdvancePx;
  }
  defaultTabAdvance(font) {
    return this.advanceForCodePoint(" ".codePointAt(0), font) * 4;
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
function screenLineQuad(a, b, width) {
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
var SOLID_VS = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 2) in vec4 aColor;
uniform vec2 uViewport;
out vec4 vColor;
void main() {
  vec2 p = aPosition / uViewport * 2.0 - 1.0;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  vColor = aColor;
}`;
var SOLID_FS = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 outColor;
void main() {
  outColor = vec4(vColor.rgb * vColor.a, vColor.a);
}`;

// src/renderer/theme.ts
var darkTheme = {
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
var lightTheme = {
  background: [0.82, 0.84, 0.87, 1],
  panel: [0.73, 0.76, 0.8, 1],
  panel2: [0.86, 0.88, 0.91, 1],
  activity: [0.66, 0.7, 0.75, 1],
  activityActive: [0.55, 0.64, 0.74, 1],
  divider: [0.48, 0.53, 0.6, 1],
  text: [0.08, 0.1, 0.13, 1],
  textDim: [0.28, 0.32, 0.38, 1],
  accent: [0.08, 0.34, 0.68, 1],
  accent2: [0.13, 0.43, 0.19, 1],
  warning: [0.58, 0.32, 0.04, 1],
  error: [0.64, 0.1, 0.13, 1],
  selection: [0.38, 0.58, 0.82, 0.66],
  caret: [0.08, 0.1, 0.14, 1],
  lineHighlight: [0.75, 0.79, 0.84, 1],
  keyword: [0.35, 0.12, 0.62, 1],
  string: [0.18, 0.36, 0.06, 1],
  number: [0.52, 0.25, 0.04, 1],
  comment: [0.34, 0.38, 0.44, 1],
  operator: [0.18, 0.21, 0.27, 1],
  function: [0.03, 0.28, 0.58, 1],
  type: [0.02, 0.38, 0.35, 1]
};
var themes = {
  dark: darkTheme,
  light: lightTheme
};
var theme = { ...darkTheme };
function applyTheme(name) {
  Object.assign(theme, themes[name]);
}

// src/app/mini_buffer.ts
var MAX_MINI_BUFFER_UNDO = 200;
var MiniBuffer = class {
  text = "";
  cursor = 0;
  anchor = 0;
  scrollX = 0;
  undoStack = [];
  redoStack = [];
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
    const before = this.snapshot();
    const [a, b] = this.ordered();
    this.text = this.text.slice(0, a) + text + this.text.slice(b);
    this.cursor = a + text.length;
    this.anchor = this.cursor;
    this.recordEdit(before);
  }
  deleteBackward() {
    if (this.hasSelection()) {
      this.replaceSelection("");
      return;
    }
    if (this.cursor === 0) return;
    const before = this.snapshot();
    this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
    this.cursor--;
    this.anchor = this.cursor;
    this.recordEdit(before);
  }
  deleteForward() {
    if (this.hasSelection()) {
      this.replaceSelection("");
      return;
    }
    if (this.cursor >= this.text.length) return;
    const before = this.snapshot();
    this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1);
    this.recordEdit(before);
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
  undo() {
    const previous = this.undoStack.pop();
    if (!previous) return;
    this.redoStack.push(this.snapshot());
    this.restore(previous);
  }
  redo() {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push(this.snapshot());
    this.restore(next);
  }
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }
  clearUndoHistory() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
  ordered() {
    return this.anchor <= this.cursor ? [this.anchor, this.cursor] : [this.cursor, this.anchor];
  }
  snapshot() {
    return { text: this.text, cursor: this.cursor, anchor: this.anchor };
  }
  restore(snapshot) {
    this.text = snapshot.text;
    this.cursor = Math.min(snapshot.cursor, this.text.length);
    this.anchor = Math.min(snapshot.anchor, this.text.length);
  }
  recordEdit(before) {
    if (before.text === this.text && before.cursor === this.cursor && before.anchor === this.anchor) return;
    this.undoStack.push(before);
    if (this.undoStack.length > MAX_MINI_BUFFER_UNDO) this.undoStack.shift();
    this.redoStack.length = 0;
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
var import_jszip = __toESM(require_jszip_min(), 1);
var DOCK_SPLITTER_GAP = 1;
var DOCK_SPLITTER_HIT_SIZE = 9;
var DOCK_MIN_PANEL_SIZE = 140;
var DOCK_EDGE_TARGET_RATIO = 0.33;
var DOCK_CENTER_TARGET_RATIO = 0.34;
var EDITOR_SCROLLBAR_SIZE = 12;
var EDITOR_SCROLLBAR_THUMB_MIN = 24;
var EDITOR_GUTTER_MIN_DIGITS = 3;
var EDITOR_GUTTER_PAD_LEFT = 10;
var EDITOR_GUTTER_PAD_RIGHT = 12;
var EDITOR_TEXT_PAD_X = 8;
var EDITOR_TEXT_TRAILING_PAD_X = 20;
var PANEL_HEADER_H = 32;
var TAB_MIN_W = 128;
var TAB_MAX_W = 240;
var TAB_GAP = 1;
var TAB_OVERFLOW_BUTTON_W = 32;
var TAB_AUTOSCROLL_EDGE_W = 34;
var CONTEXT_MENU_WIDTH = 136;
var CONTEXT_MENU_ROW_H = 28;
var CONTEXT_MENU_SEPARATOR_H = 9;
var CONTEXT_MENU_PAD = 4;
var MODAL_WIDTH = 420;
var MODAL_BUTTON_H = 30;
var MODAL_BUTTON_GAP = 8;
var TAB_DRAG_THRESHOLD = 6;
var TOUCH_SCROLL_THRESHOLD = 10;
var TOUCH_DOUBLE_TAP_MS = 420;
var TOUCH_DOUBLE_TAP_DISTANCE = 28;
var TOUCH_LONG_PRESS_MS = 540;
var TOUCH_KEYBOARD_STABILIZE_MS = 900;
var SELECTION_HANDLE_TOUCH_SIZE = 26;
var SELECTION_HANDLE_AUTOSCROLL_EDGE = 42;
var SELECTION_HANDLE_AUTOSCROLL_MAX_STEP = 18;
var CARET_BLINK_HALF_MS = 530;
var HIGHLIGHT_OPTIONS = [
  { id: "plain", label: "Plain" },
  { id: "javascript", label: "JavaScript" },
  { id: "cpp", label: "C/C++" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "lua", label: "Lua" },
  { id: "python", label: "Python" }
];
var SETTINGS_TAB_ID = "settings";
var SETTINGS_TAB_LABEL = "Settings";
var SETTINGS_STORAGE_KEY = "slug.settings";
var SESSION_STORAGE_KEY = "slug.session";
var DEFAULT_SETTINGS = {
  theme: "dark",
  fontSize: 14,
  uiScale: 100,
  monospacedFont: false,
  tabSpaces: 4,
  useTabStops: true,
  showWhitespace: false,
  showThinking: true,
  renameOnDoubleClick: true,
  showLineNumbers: true,
  rememberOpenFiles: true,
  aiProvider: "openai",
  aiModelManual: false,
  aiMaxToolCalls: DEFAULT_AI_RUNTIME_SETTINGS.maxToolCallsPerTurn,
  aiDetectDuplicateToolCalls: DEFAULT_AI_RUNTIME_SETTINGS.detectDuplicateToolCalls,
  aiToolCallFormat: DEFAULT_AI_RUNTIME_SETTINGS.toolCallFormat,
  aiCompactFreePercent: DEFAULT_AI_RUNTIME_SETTINGS.compactFreePercent,
  aiInsertEditorContext: true
};
var EditorApp = class {
  constructor(canvas, vfs, fontSources) {
    this.canvas = canvas;
    this.vfs = vfs;
    this.viewport = new ViewportService(canvas);
    this.viewport.start();
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 is required");
    this.renderer = new WebglRenderer(canvas, this.viewport.get(), fontSources);
    this.applySettings();
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
  projectReplaceBuffer = new MiniBuffer();
  chatDraft = new TextDocument(void 0, "");
  renameBuffer = new MiniBuffer();
  settingsTextBuffers = {
    aiBaseUrl: new MiniBuffer(),
    aiApiKey: new MiniBuffer(),
    aiModel: new MiniBuffer(),
    aiMaxContextTokens: new MiniBuffer()
  };
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
  tabScrollStates = /* @__PURE__ */ new Map();
  pendingTabRevealIds = /* @__PURE__ */ new Set();
  documentWidthCache = /* @__PURE__ */ new Map();
  lineWidthCache = /* @__PURE__ */ new Map();
  highlightCache = /* @__PURE__ */ new Map();
  chatLineCache = /* @__PURE__ */ new Map();
  statusText = "Ready";
  hits = [];
  raf = 0;
  selecting = false;
  resizingSidebar = false;
  dockResize = null;
  scrollbarDrag = null;
  hoveredScrollbar = null;
  settingsScrollY = 0;
  settingsScrollbarDrag = null;
  hoveredSettingsScrollbar = null;
  filesScrollY = 0;
  searchScrollY = 0;
  chatScrollY = 0;
  chatInputScrollY = 0;
  aiModels = [];
  aiConnectionStatus = { state: "idle", message: "" };
  aiEndpointFieldState = null;
  sidebarScrollbarDrag = null;
  hoveredSidebarScrollbar = null;
  chatScrollbarDrag = null;
  hoveredChatScrollbar = null;
  hoveredActivityButton = null;
  hoveredButton = null;
  selectedFileTreePath = null;
  hoveredFileTreePath = null;
  contextMenu = null;
  contextMenuHover = null;
  modal = null;
  modalHover = null;
  renamePath = null;
  renameSelecting = false;
  searchSelecting = false;
  chatInputSelecting = false;
  textFieldSelecting = null;
  searchReplaceExpanded = false;
  findStates = /* @__PURE__ */ new Map();
  inactiveFindBuffer = new MiniBuffer();
  inactiveFindReplaceBuffer = new MiniBuffer();
  caretBlinkEpoch = performance.now();
  caretBlinkTimer = 0;
  pendingTabDrag = null;
  tabDrag = null;
  dockPreview = null;
  tabInsertionPreview = null;
  lastTabDragPoint = null;
  tabDragAutoscrollTimer = 0;
  lastTouchTap = null;
  touchLongPress = null;
  touchLongPressTimer = 0;
  touchScroll = null;
  deferredTouchHit = null;
  pendingTouchKeyboardFocus = null;
  pendingTouchDoubleTap = null;
  touchKeyboardStabilizeUntil = 0;
  touchKeyboardStabilizeTimer = 0;
  selectionHandleDrag = null;
  selectionHandleAutoscrollFrame = 0;
  editorRect = { x: 0, y: 0, w: 0, h: 0 };
  settingsExpanded = /* @__PURE__ */ new Set(["visual", "interface", "ai"]);
  settings = loadSettings();
  activeSettingsNumber = null;
  settingsNumberBuffer = new MiniBuffer();
  settingsNumberSelecting = false;
  activeSettingsText = null;
  settingsHitClip = null;
  settingsViewportRect = null;
  focusedSettingsInputRect = null;
  pendingFocusedInputReveal = false;
  localClipboard = "";
  systemClipboardOverlay = null;
  systemClipboardViewportCleanup = null;
  pendingCloseQueue = [];
  pendingDownloadDirtyQueue = [];
  downloadInProgress = false;
  uploadInput = null;
  systemFileUploadOverlay = null;
  systemFileUploadViewportCleanup = null;
  uploadTargetFolder = "/";
  untitledCounter = 1;
  untitledLabels = /* @__PURE__ */ new Map();
  untitledPreferredNames = /* @__PURE__ */ new Map();
  fileDragActive = false;
  fileDragLabel = "Drop to upload";
  async start() {
    localStorage.removeItem("slug.aiHelperPrompts");
    await this.refreshFiles();
    await this.restoreEditorSession();
    this.draw();
    this.scheduleDraw();
  }
  activeDoc() {
    return this.activeDocId && !this.isSettingsTab(this.activeDocId) ? this.docs.get(this.activeDocId) : void 0;
  }
  activeFindState(create = true) {
    const doc = this.activeDoc();
    return doc ? this.findStateForDoc(doc.id, create) : null;
  }
  findStateForDoc(docId, create = true) {
    if (!docId || this.isSettingsTab(docId)) return null;
    let state = this.findStates.get(docId);
    if (!state && create) {
      state = { open: false, replaceExpanded: false, findBuffer: new MiniBuffer(), replaceBuffer: new MiniBuffer() };
      this.findStates.set(docId, state);
    }
    return state ?? null;
  }
  isSettingsTab(id) {
    return id === SETTINGS_TAB_ID;
  }
  tabLabel(id) {
    if (this.isSettingsTab(id)) return SETTINGS_TAB_LABEL;
    const doc = this.docs.get(id);
    return doc ? this.documentLabel(doc) : "(untitled)";
  }
  documentLabel(doc) {
    if (doc.path && this.isAiSpecialPath(doc.path)) return this.aiSpecialLabel(doc.path);
    return doc.path ?? this.untitledLabels.get(doc.id) ?? "Untitled";
  }
  isAiSpecialPath(path) {
    const normalized = path ? normalizePath(path) : "";
    return normalized === AI_SETTINGS_DOC_PATH || normalized === AI_SYSTEM_PROMPT_DOC_PATH || normalized === AI_TAG_TOOL_PROMPT_DOC_PATH || normalized === AI_HARMONY_TOOL_PROMPT_DOC_PATH || normalized === AI_COMPACT_PROMPT_DOC_PATH;
  }
  isAiSpecialDoc(doc) {
    return Boolean(doc?.path && this.isAiSpecialPath(doc.path));
  }
  aiSpecialLabel(path) {
    const normalized = normalizePath(path);
    if (normalized === AI_SETTINGS_DOC_PATH) return "AI Settings";
    if (normalized === AI_SYSTEM_PROMPT_DOC_PATH) return "System Prompt";
    if (normalized === AI_TAG_TOOL_PROMPT_DOC_PATH) return "Tag Tool Prompt";
    if (normalized === AI_HARMONY_TOOL_PROMPT_DOC_PATH) return "Harmony Tool Prompt";
    if (normalized === AI_COMPACT_PROMPT_DOC_PATH) return "Compact Prompt";
    return "AI Document";
  }
  async refreshFiles() {
    this.treeNodes = await this.listTreeNodes("/");
    this.files = this.treeNodes.filter((node) => node.kind === "file");
    this.syncFileTreeFolders();
    this.syncFileTreeSelection();
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
  async openFile(path, options = {}) {
    const doc = await this.docs.open(path);
    const existing = this.groupContaining(doc.id);
    const group = existing ?? this.activeGroup();
    if (!group.tabs.includes(doc.id)) group.tabs.push(doc.id);
    group.activeDocId = doc.id;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.revealTabInGroup(group, doc.id);
    this.selectFileTreePath(doc.path ?? null);
    this.syncOpenTabs();
    this.statusText = doc.readOnly ? "File type not supported" : `Opened ${path}`;
    if (options.focus !== false && !this.renamePath) this.focusEditor();
    else if (options.focus === false) this.input.blur();
    this.scheduleDraw();
  }
  openUntitledDocument(groupId = this.activeGroupId, options = {}) {
    const group = this.groupById(groupId);
    const doc = this.docs.createUntitled(options.text ?? "");
    doc.readOnly = Boolean(options.readOnly);
    this.untitledLabels.set(doc.id, options.label || `Untitled-${this.untitledCounter++}`);
    if (options.preferredName) {
      this.untitledPreferredNames.set(doc.id, options.preferredName);
      doc.syntaxId = syntaxFromPath(options.preferredName);
    }
    if (options.dirty && !doc.readOnly) doc.revision = doc.savedRevision + 1;
    group.tabs.push(doc.id);
    group.activeDocId = doc.id;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.revealTabInGroup(group, doc.id);
    this.syncOpenTabs();
    this.statusText = doc.readOnly ? "File type not supported" : `Opened ${this.documentLabel(doc)}`;
    this.focusEditor();
    this.scheduleDraw();
    return doc;
  }
  openSettingsTab() {
    this.sidebarMode = "settings";
    this.sidebarWidth = this.sidebarWidth > 0 ? this.sidebarWidth : this.lastSidebarWidth || 280;
    this.input.blur();
    this.scheduleDraw();
  }
  openAiSettingsDocument() {
    this.openVirtualAiDocument(AI_SETTINGS_DOC_PATH, JSON.stringify(loadAiEndpointConfig(), null, 2));
  }
  openSystemPromptDocument() {
    this.openVirtualAiDocument(AI_SYSTEM_PROMPT_DOC_PATH, loadAiSystemPrompt());
  }
  openTagToolPromptDocument() {
    this.openVirtualAiDocument(AI_TAG_TOOL_PROMPT_DOC_PATH, loadAiTagToolPrompt());
  }
  openHarmonyToolPromptDocument() {
    this.openVirtualAiDocument(AI_HARMONY_TOOL_PROMPT_DOC_PATH, loadAiHarmonyToolPrompt());
  }
  openCompactPromptDocument() {
    this.openVirtualAiDocument(AI_COMPACT_PROMPT_DOC_PATH, loadAiCompactPrompt());
  }
  openVirtualAiDocument(path, text) {
    const doc = this.docs.getByPath(path) ?? this.docs.createVirtual(path, text);
    const existing = this.groupContaining(doc.id);
    const group = existing ?? this.activeGroup();
    if (!group.tabs.includes(doc.id)) group.tabs.push(doc.id);
    group.activeDocId = doc.id;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.revealTabInGroup(group, doc.id);
    this.syncOpenTabs();
    this.statusText = `Opened ${this.aiSpecialLabel(path)}`;
    this.focusEditor();
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
  saveAndApplySettings() {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    localStorage.setItem("slug.aiProvider", this.settings.aiProvider);
    this.applySettings();
    if (this.settings.rememberOpenFiles) this.persistEditorSession();
    else this.clearPersistedEditorSession();
    this.scheduleDraw();
  }
  applySettings() {
    applyTheme(this.settings.theme);
    localStorage.setItem("slug.aiProvider", this.settings.aiProvider);
    this.renderer.configureText(this.settings.fontSize, this.settings.uiScale, this.settings.monospacedFont);
    this.documentWidthCache.clear();
    this.lineWidthCache.clear();
    this.highlightCache.clear();
  }
  ui(value) {
    return value * this.settings.uiScale / 100;
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
    const activeLabel = this.activeDocId ? this.tabLabel(this.activeDocId) : void 0;
    const findState = this.activeFindState(false);
    return {
      activePath: this.activeDoc() ? this.documentLabel(this.activeDoc()) : this.isSettingsTab(this.activeDocId) ? SETTINGS_TAB_LABEL : void 0,
      activeText: this.activeDoc()?.getText(),
      activeSyntaxId: this.activeDoc()?.syntaxId,
      selectedText: this.activeDoc()?.selectedText() ?? "",
      openTabs: this.openTabs.map((id) => this.tabLabel(id)),
      activeTab: activeLabel,
      sidebarMode: this.sidebarMode,
      sidebarVisible: this.sidebarWidth > 0,
      statusText: this.statusText,
      fileDragActive: this.fileDragActive,
      fileDragLabel: this.fileDragLabel,
      filesScrollY: this.filesScrollY,
      searchScrollY: this.searchScrollY,
      settings: { ...this.settings },
      settingsActivityTarget: this.hits.find((hit) => hit.type === "settingsActivity")?.rect ?? null,
      downloadActivityTarget: this.hits.find((hit) => hit.type === "downloadActivity")?.rect ?? null,
      settingsNumberText: this.settingsNumberBuffer.text,
      settingsNumberSelectedText: this.settingsNumberBuffer.selectedText(),
      settingsTextSelectedText: this.activeSettingsText ? this.settingsTextBuffers[this.activeSettingsText].selectedText() : "",
      activeSettingsNumber: this.activeSettingsNumber,
      settingsScrollY: this.settingsScrollY,
      settingsTargets: this.hits.filter((hit) => hit.type === "settingsHeader" || hit.type === "settingsCheckbox" || hit.type === "settingsDropdown" || hit.type === "settingsNumber" || hit.type === "settingsButton" || hit.type === "textField" && isSettingTextField(hit.field)).map((hit) => ({ type: hit.type, key: "key" in hit ? hit.key : "id" in hit ? hit.id : "action" in hit ? hit.action : hit.field, rect: hit.rect, enabled: "enabled" in hit ? hit.enabled : true })),
      searchQuery: this.searchBuffer.text,
      searchScrollX: this.searchBuffer.scrollX,
      projectReplaceText: this.projectReplaceBuffer.text,
      searchReplaceExpanded: this.searchReplaceExpanded,
      searchSelectedText: this.searchBuffer.selectedText(),
      searchInputRect: this.searchInputRect(),
      projectReplaceInputRect: this.textFieldRect("projectReplace"),
      searchTargets: this.hits.filter((hit) => hit.type === "textField" || hit.type === "searchReplaceToggle" || hit.type === "searchRefresh" || hit.type === "searchReplaceAll").filter((hit) => hit.type !== "textField" || hit.field === "search" || hit.field === "projectReplace").map((hit) => ({ type: hit.type, key: "field" in hit ? hit.field : hit.type, rect: hit.rect, enabled: "enabled" in hit ? hit.enabled : true })),
      searchCaretVisible: this.isSearchCaretVisible(),
      searchResults: this.searchResults,
      searchResultTargets: this.hits.filter((hit) => hit.type === "searchResult").map((hit) => ({ path: hit.path, line: hit.line, rect: hit.rect })),
      findOpen: Boolean(findState?.open),
      findReplaceExpanded: Boolean(findState?.replaceExpanded),
      findQuery: findState?.findBuffer.text ?? "",
      findReplaceText: findState?.replaceBuffer.text ?? "",
      findSelectedText: findState?.findBuffer.selectedText() ?? "",
      findReplaceSelectedText: findState?.replaceBuffer.selectedText() ?? "",
      findTargets: this.hits.filter((hit) => hit.type === "textField" || hit.type === "findToggle" || hit.type === "findPrevious" || hit.type === "findNext" || hit.type === "findClose" || hit.type === "findReplace" || hit.type === "findReplaceAll").filter((hit) => hit.type !== "textField" || hit.field === "find" || hit.field === "findReplace").map((hit) => ({ type: hit.type, key: "field" in hit ? hit.field : hit.type, rect: hit.rect, enabled: "enabled" in hit ? hit.enabled : true })),
      chatMessages: this.chat.visibleMessages(),
      chatDisplayedMessages: this.chatDisplayMessages(),
      chatTokenUsage: this.chat.tokenUsage(),
      chatRootTarget: this.hits.find((hit) => hit.type === "chatRoot")?.rect ?? null,
      chatBubbleTargets: this.hits.filter((hit) => hit.type === "chatBubble").map((hit) => {
        const msg = this.chatDisplayMessages().find((candidate) => candidate.id === hit.messageId);
        return { id: hit.messageId, role: msg?.role ?? "", text: msg?.text ?? "", rect: hit.rect };
      }),
      activeInputKind: this.input.activeTarget?.kind ?? null,
      chatDraft: this.chatDraft.getText(),
      chatScrollY: this.chatScrollY,
      chatInputScrollY: this.chatInputScrollY,
      chatInputRect: this.hits.find((hit) => hit.type === "chatInput")?.rect ?? null,
      chatSendTarget: this.hits.find((hit) => hit.type === "chatSend") ?? null,
      chatShowThinking: this.settings.showThinking,
      chatShowThinkingTarget: this.hits.find((hit) => hit.type === "chatShowThinking")?.rect ?? null,
      chatRunning: this.chat.running,
      chatScrollbars: this.hits.filter((hit) => hit.type === "chatScrollbar").map((hit) => ({ panel: hit.panel, rect: hit.rect, trackRect: hit.trackRect, thumbRect: hit.thumbRect })),
      touchKeyboardStabilizing: this.isTouchKeyboardStabilizing(),
      visualViewportResizeDeferred: this.viewport.isVisualViewportCanvasResizeDeferred(),
      aiEndpointConfig: loadAiEndpointConfig(),
      aiModels: this.aiModels,
      aiConnectionStatus: { ...this.aiConnectionStatus },
      aiEndpointFieldState: this.aiEndpointFieldState,
      renamePath: this.renamePath,
      renameText: this.renameBuffer.text,
      renameSelectedText: this.renameBuffer.selectedText(),
      renameScrollX: this.renameBuffer.scrollX,
      renameInputRect: this.renameInputRect(),
      renameInvalid: this.renamePath ? !isValidFileName(this.renameBuffer.text.trim()) : false,
      renameInvalidCharacters: invalidFileNameCharacterRanges(this.renameBuffer.text).map((range) => ({ ...range, text: this.renameBuffer.text.slice(range.start, range.end) })),
      caretBlinkOn: this.isCaretBlinkOn(),
      renameCaretVisible: this.isRenameCaretVisible(),
      sidebarWidth: this.sidebarWidth,
      selectedFileTreePath: this.fileTreeSelectedPath(),
      hoveredFileTreePath: this.hoveredFileTreePath,
      fileTargets: this.hits.filter((hit) => hit.type === "file").map((hit) => ({ path: hit.path, rect: hit.rect })),
      folderTargets: this.hits.filter((hit) => hit.type === "folder").map((hit) => ({ path: hit.path, expanded: hit.expanded, rect: hit.rect })),
      filesRootTarget: this.hits.find((hit) => hit.type === "filesRoot")?.rect ?? null,
      tabTargets: this.tabHitState("tab"),
      tabCloseTargets: this.tabHitState("tabClose"),
      tabOverflowTargets: this.hits.filter((hit) => hit.type === "tabOverflow").map((hit) => ({ groupId: hit.groupId, rect: hit.rect })),
      editorGutterTargets: this.hits.filter((hit) => hit.type === "editorGutter").map((hit) => ({ groupId: hit.groupId, path: this.docs.get(hit.docId)?.path ?? "(untitled)", rect: hit.rect })),
      tabBarTargets: this.hits.filter((hit) => hit.type === "tabBar").map((hit) => ({ groupId: hit.groupId, rect: hit.rect })),
      editorGroups: this.groups.map((group) => {
        const doc = group.activeDocId ? this.docs.get(group.activeDocId) : void 0;
        return {
          id: group.id,
          activePath: doc?.path ?? (this.isSettingsTab(group.activeDocId) ? SETTINGS_TAB_LABEL : null),
          tabs: group.tabs.map((id) => this.tabLabel(id)),
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
      mobileSelectionHandles: this.hits.filter((hit) => hit.type === "selectionHandle" || hit.type === "textSelectionHandle").map((hit) => hit.type === "selectionHandle" ? { edge: hit.edge, groupId: hit.groupId, path: this.docs.get(hit.docId)?.path ?? "(untitled)", target: "editor", rect: hit.rect } : { edge: hit.edge, groupId: "", path: this.textSelectionTargetLabel(hit.target), target: hit.target.type, rect: hit.rect }),
      dockPreview: this.dockPreview,
      tabInsertionPreview: this.tabInsertionPreview,
      dragGhost: this.tabDrag ? this.dragGhostRect() : null,
      dockOverlayTargets: this.tabDrag ? this.allDockTargets().map((target) => ({ groupId: target.groupId, zone: target.zone, polygon: target.polygon, previewRect: target.previewRect })) : [],
      statusWhitespaceTarget: this.hits.find((hit) => hit.type === "statusWhitespace")?.rect ?? null,
      statusHighlightTarget: this.hits.find((hit) => hit.type === "statusHighlight")?.rect ?? null,
      settingsRootTarget: this.hits.find((hit) => hit.type === "settingsRoot")?.rect ?? null,
      sidebarResizeTarget: this.hits.find((hit) => hit.type === "sidebarResize")?.rect ?? null,
      dockSplitters: this.hits.filter((hit) => hit.type === "dockResize").map((hit) => ({ splitId: hit.splitId, index: hit.index, direction: hit.direction, rect: hit.rect })),
      editorScrollbars: this.hits.filter((hit) => hit.type === "editorScrollbar").map((hit) => ({ axis: hit.axis, groupId: hit.groupId, path: this.docs.get(hit.docId)?.path ?? "(untitled)", rect: hit.rect, trackRect: hit.trackRect, thumbRect: hit.thumbRect })),
      settingsScrollbar: this.hits.find((hit) => hit.type === "settingsScrollbar") ?? null,
      sidebarScrollbars: this.hits.filter((hit) => hit.type === "sidebarScrollbar").map((hit) => ({ panel: hit.panel, rect: hit.rect, trackRect: hit.trackRect, thumbRect: hit.thumbRect })),
      hoveredScrollbar: this.hoveredScrollbar ? { axis: this.hoveredScrollbar.axis, groupId: this.hoveredScrollbar.groupId, path: this.docs.get(this.hoveredScrollbar.docId)?.path ?? "(untitled)", overThumb: this.hoveredScrollbar.overThumb } : null,
      contextMenu: this.contextMenu ? { scope: this.contextMenu.scope, rect: this.contextMenu.rect, items: this.contextMenu.items.filter(isContextMenuItem).map((item) => ({ command: item.command, label: item.label, rect: item.rect, enabled: item.enabled })) } : null,
      modal: this.modal ? {
        kind: this.modal.kind,
        title: this.modal.title,
        message: this.modal.message,
        detail: this.modal.detail,
        progress: this.modal.kind === "zipProgress" ? this.modal.progress : null,
        pending: this.modal.pending,
        buttons: this.modal.buttons.map((button) => ({ action: button.action, label: button.label, rect: button.rect, enabled: button.enabled }))
      } : null,
      renderer: this.renderer.diagnostics(),
      canvas: { width: this.canvas.width, height: this.canvas.height, cssWidth: this.viewport.get().cssWidth, cssHeight: this.viewport.get().cssHeight }
    };
  }
  installEvents() {
    this.viewport.onChange(() => {
      this.requestFocusedInputReveal();
      this.scheduleDraw();
    });
    this.vfs.watch(() => {
      void this.refreshFiles().then(() => this.scheduleDraw());
    });
    this.canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    this.canvas.addEventListener("pointerleave", () => this.clearScrollbarHover());
    this.canvas.addEventListener("click", (event) => this.onClick(event));
    this.canvas.addEventListener("selectstart", (event) => event.preventDefault());
    this.canvas.addEventListener("dragstart", (event) => event.preventDefault());
    this.canvas.addEventListener("contextmenu", (event) => this.onContextMenu(event));
    this.canvas.addEventListener("dblclick", (event) => this.onDoubleClick(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("pointercancel", (event) => this.onPointerCancel(event));
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
      const tabGroup = this.tabGroupAtPoint(point);
      if (tabGroup && this.scrollTabGroupFromWheel(tabGroup, event, point)) {
        event.preventDefault();
        this.closeContextMenuForScroll();
        return;
      }
      const chatRegion = this.chatScrollRegionForPoint(point);
      if (chatRegion) {
        event.preventDefault();
        this.closeContextMenuForScroll();
        const deltaY2 = this.normalizedWheelDelta(event.deltaY, event.deltaMode, chatRegion.viewport);
        this.setChatPanelScrollY(chatRegion.panel, this.chatPanelScrollY(chatRegion.panel) + deltaY2, chatRegion.viewport);
        this.scheduleDraw();
        return;
      }
      const sidebarRegion = this.sidebarScrollRegionForPoint(point);
      if (sidebarRegion) {
        event.preventDefault();
        this.closeContextMenuForScroll();
        const deltaY2 = this.normalizedWheelDelta(event.deltaY, event.deltaMode, sidebarRegion.viewport);
        this.scrollSidebarPanel(sidebarRegion.panel, deltaY2, sidebarRegion.viewport);
        return;
      }
      const group = this.editorGroupAt(point.x, point.y);
      if (group && this.isSettingsTab(group.activeDocId)) {
        event.preventDefault();
        this.closeContextMenuForScroll();
        const deltaY2 = this.normalizedWheelDelta(event.deltaY, event.deltaMode, group.editorRect);
        this.settingsScrollY = clamp(this.settingsScrollY + deltaY2, 0, this.maxSettingsScrollY(group.editorRect));
        this.scheduleDraw();
        return;
      }
      const doc = group?.activeDocId ? this.docs.get(group.activeDocId) : void 0;
      if (!group || !doc) return;
      event.preventDefault();
      this.closeContextMenuForScroll();
      const scroll = this.scrollForDoc(doc.id);
      const deltaY = this.normalizedWheelDelta(event.deltaY, event.deltaMode, group.editorRect);
      const deltaX = this.normalizedWheelDelta(event.deltaX, event.deltaMode, group.editorRect) + (event.shiftKey ? deltaY : 0);
      if (!event.shiftKey) scroll.y = clamp(scroll.y + deltaY, 0, this.maxScrollY(doc, group.editorRect));
      scroll.x = clamp(scroll.x + deltaX, 0, this.maxScrollX(doc, group.editorRect));
      this.persistEditorSession();
      this.scheduleDraw();
    }, { passive: false });
    this.canvas.addEventListener("dragenter", (event) => {
      event.preventDefault();
      if (this.modal) {
        if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
        return;
      }
      this.updateFileDragState(event.dataTransfer);
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    this.canvas.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (this.modal) {
        this.clearFileDragState();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
        return;
      }
      this.updateFileDragState(event.dataTransfer);
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    this.canvas.addEventListener("dragleave", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) return;
      this.clearFileDragState();
    });
    this.canvas.addEventListener("drop", (event) => {
      event.preventDefault();
      this.clearFileDragState();
      if (this.modal) return;
      if (!event.dataTransfer) return;
      void this.handleFileDrop(event.dataTransfer);
    });
  }
  ensureUploadInput() {
    if (this.uploadInput) return this.uploadInput;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.style.position = "fixed";
    input.style.left = "-1000px";
    input.style.top = "0";
    input.style.width = "1px";
    input.style.height = "1px";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    input.setAttribute("aria-hidden", "true");
    input.addEventListener("change", () => {
      const files = input.files ? Array.from(input.files) : [];
      const target = this.uploadTargetFolder;
      input.value = "";
      if (files.length === 0) return;
      void this.uploadFilesToFolder(files, target);
    });
    document.body.appendChild(input);
    this.uploadInput = input;
    return input;
  }
  updateFileDragState(dataTransfer) {
    if (!dataTransfer || !dataTransferContainsFiles(dataTransfer)) return;
    const files = Array.from(dataTransfer.files ?? []);
    const zip = files.find(isZipFile);
    const label = zip ? "Drop to import workspace zip" : "Drop to open in memory";
    if (this.fileDragActive && this.fileDragLabel === label) return;
    this.fileDragActive = true;
    this.fileDragLabel = label;
    this.scheduleDraw();
  }
  clearFileDragState() {
    if (!this.fileDragActive) return;
    this.fileDragActive = false;
    this.fileDragLabel = "Drop to upload";
    this.scheduleDraw();
  }
  async handleFileDrop(dataTransfer) {
    const files = Array.from(dataTransfer.files ?? []);
    if (files.length === 0) return;
    const zip = files.find(isZipFile);
    if (zip) {
      this.openZipImportModal(zip);
      return;
    }
    for (const file of files) await this.openDroppedFileInMemory(file);
    this.statusText = files.length === 1 ? `Opened ${files[0].name} in memory` : `Opened ${files.length} files in memory`;
    this.scheduleDraw();
  }
  async openDroppedFileInMemory(file) {
    const unsupported = isUnsupportedFilePath(file.name);
    const text = unsupported ? UNSUPPORTED_FILE_TEXT : await file.text();
    this.openUntitledDocument(this.activeGroupId, {
      label: file.name || void 0,
      preferredName: file.name || void 0,
      text,
      dirty: !unsupported,
      readOnly: unsupported
    });
  }
  onPointerDown(event) {
    const point = this.viewport.pointerToCanvasCss(event);
    const hit = this.hitAt(point.x, point.y);
    if (event.pointerType === "touch" && !this.isTouchKeyboardHit(hit)) {
      this.pendingTouchKeyboardFocus = null;
      this.pendingTouchDoubleTap = null;
    }
    if ((hit?.type === "selectionHandle" || hit?.type === "textSelectionHandle") && event.pointerType === "touch") {
      event.preventDefault();
      if (hit.type === "selectionHandle") this.startSelectionHandleDrag(hit, event.pointerId, point);
      else this.startTextSelectionHandleDrag(hit, event.pointerId, point);
      return;
    }
    if (this.activeSettingsNumber && event.pointerType === "touch" && hit?.type !== "settingsNumber" && this.handleActiveSettingsNumberTouchDoubleTap(event, point)) return;
    const switchingToTextInput = Boolean(hit && this.isTouchKeyboardHit(hit));
    if (this.activeSettingsNumber && hit?.type !== "settingsNumber") this.commitSettingsNumberInput(!switchingToTextInput);
    if (this.activeSettingsText && !(hit?.type === "textField" && hit.field === this.activeSettingsText)) this.commitSettingsTextInput(!switchingToTextInput);
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
    if (hit && this.handleTouchDoubleTap(event, point, hit)) return;
    const touchScroll = this.makeTouchScrollState(event, point, hit);
    if (!hit && !touchScroll) return;
    if (!this.shouldAllowNativeTouchFocus(event, hit)) event.preventDefault();
    this.queueTouchKeyboardFocus(event, hit);
    if (this.isContextMenuPointer(event)) return;
    this.touchScroll = touchScroll;
    if (touchScroll) this.capturePointer(event.pointerId);
    if (event.pointerType === "touch" && hit && this.isTouchKeyboardHit(hit)) this.startTouchLongPress(event.pointerId, point, hit);
    if (!hit) return;
    if (touchScroll && this.shouldDeferTouchHit(hit)) {
      this.deferredTouchHit = { hit, point: { ...point } };
      return;
    }
    this.updateScrollbarHover(hit, point);
    if (hit.type === "activity") {
      this.toggleActivityMode(hit.mode, event.pointerType !== "touch");
      this.draw();
    } else if (hit.type === "downloadActivity") {
      void this.requestWorkspaceDownload();
    } else if (hit.type === "settingsActivity") {
      this.toggleActivityMode("settings", event.pointerType !== "touch");
    } else if (hit.type === "sidebarResize") {
      this.resizingSidebar = true;
      this.canvas.style.cursor = "col-resize";
    } else if (hit.type === "dockResize") {
      this.startDockResize(hit, point);
    } else if (hit.type === "editorScrollbar") {
      this.startScrollbarDrag(hit, point);
    } else if (hit.type === "settingsScrollbar") {
      this.startSettingsScrollbarDrag(hit, point);
    } else if (hit.type === "sidebarScrollbar") {
      this.startSidebarScrollbarDrag(hit, point);
    } else if (hit.type === "chatScrollbar") {
      this.startChatScrollbarDrag(hit, point);
    } else if (hit.type === "folder") {
      this.selectFileTreePath(hit.path);
      this.toggleFolder(hit.path);
    } else if (hit.type === "filesRoot") {
      if (event.pointerType === "touch") this.input.blur();
      else this.focusEditor();
    } else if (hit.type === "file") {
      this.selectFileTreePath(hit.path);
      if (event.detail >= 2 && this.settings.renameOnDoubleClick) this.startRename(hit.path, hit.rect);
      else void this.openFile(hit.path, { focus: event.pointerType !== "touch" });
    } else if (hit.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      this.setRenameCursorFromPoint(point.x, hit.rect, false);
      this.renameSelecting = true;
    } else if (hit.type === "tabClose") {
      void this.requestCloseTab(hit.docId);
    } else if (hit.type === "tabOverflow") {
      this.openTabOverflowMenu(hit.groupId, hit.rect);
    } else if (hit.type === "tab") {
      if (event.button === 1) {
        void this.requestCloseTab(hit.docId);
        return;
      }
      this.activateTabInGroup(this.groupById(hit.groupId), hit.docId, event.pointerType !== "touch");
      this.pendingTabDrag = { docId: hit.docId, groupId: hit.groupId, startPoint: { ...point } };
      this.scheduleDraw();
    } else if (hit.type === "textField") {
      this.focusTextField(hit.field, hit.rect);
      this.setTextFieldCursorFromPoint(hit.field, point.x, hit.rect, false);
      this.textFieldSelecting = hit.field;
    } else if (hit.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      this.setSearchCursorFromPoint(point.x, hit.rect, false);
      this.searchSelecting = true;
    } else if (hit.type === "searchResult") {
      const focus = event.pointerType !== "touch";
      void this.openFile(hit.path, { focus }).then(() => {
        const doc = this.activeDoc();
        if (doc) doc.setSelection({ line: hit.line, col: 0 });
        if (focus) this.revealEditorCaret();
        else if (doc) {
          this.ensureCaretVisible(doc, this.activeEditorRect());
          this.scheduleDraw();
        }
      });
    } else if (hit.type === "chatInput") {
      this.focusMiniTarget("chat", hit.rect, event.pointerType === "touch");
      this.setChatInputCursorFromPoint(point, hit.rect, false);
      this.chatInputSelecting = true;
    } else if (hit.type === "chatSend") {
      if (hit.enabled) void this.runChatSendControl();
    } else if (hit.type === "chatShowThinking") {
      this.toggleChatShowThinking();
    } else if (hit.type === "settingsHeader") {
      this.toggleSettingsHeader(hit.id);
    } else if (hit.type === "settingsCheckbox") {
      this.toggleSettingsCheckbox(hit.key);
    } else if (hit.type === "settingsDropdown") {
      this.openSettingsDropdown(hit.rect, hit.key);
    } else if (hit.type === "statusWhitespace") {
      this.toggleStatusWhitespace();
    } else if (hit.type === "statusHighlight") {
      this.openHighlightDropdown(hit);
    } else if (hit.type === "settingsNumber") {
      this.focusSettingsNumber(hit.key, hit.rect);
      this.setSettingsNumberCursorFromPoint(point.x, hit.rect, false);
      this.settingsNumberSelecting = true;
    } else if (hit.type === "settingsButton") {
      if (hit.enabled) void this.runSettingsButton(hit.action);
    } else if (hit.type === "searchReplaceToggle") {
      this.searchReplaceExpanded = !this.searchReplaceExpanded;
      this.scheduleDraw();
    } else if (hit.type === "searchRefresh") {
      void this.runSearch();
    } else if (hit.type === "searchReplaceAll") {
      if (hit.enabled) void this.replaceAllInWorkspace();
    } else if (hit.type === "findToggle") {
      const state = this.activeFindState(false);
      if (state) state.replaceExpanded = !state.replaceExpanded;
      this.scheduleDraw();
    } else if (hit.type === "findPrevious") {
      if (hit.enabled) this.selectDocumentFindMatch(-1);
    } else if (hit.type === "findNext") {
      if (hit.enabled) this.selectDocumentFindMatch(1);
    } else if (hit.type === "findClose") {
      this.closeFindWidget();
    } else if (hit.type === "findReplace") {
      if (hit.enabled) this.replaceCurrentFindMatch();
    } else if (hit.type === "findReplaceAll") {
      if (hit.enabled) this.replaceAllInActiveDocument();
    } else if (hit.type === "editorGutter") {
      const group = this.groupById(hit.groupId);
      const doc = this.docs.get(hit.docId);
      if (!doc) return;
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      group.activeDocId = doc.id;
      this.selectActiveDocumentInFileTree();
      doc.setSelection(this.positionFromPointInEditor(doc, group.editorRect, point.x, point.y));
      this.focusEditor();
      this.resetCaretBlink();
      this.persistEditorSession();
    } else if (hit.type === "editor") {
      this.activeGroupId = hit.groupId;
      this.activeDocId = this.groupById(hit.groupId).activeDocId;
      const doc = this.activeDoc();
      if (!doc) return;
      this.selectActiveDocumentInFileTree();
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
      this.persistEditorSession();
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
    if (this.selectionHandleDrag?.pointerId === event.pointerId) {
      event.preventDefault();
      this.updateSelectionHandleDrag(point);
      return;
    }
    this.cancelTouchLongPressIfMoved(event.pointerId, point);
    if (this.touchScroll && this.touchScroll.pointerId === event.pointerId) {
      event.preventDefault();
      this.updateTouchScroll(point);
      return;
    }
    if (this.renameSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "fileRenameInput" ? hit.rect : this.renameInputRect();
      if (rect) this.setRenameCursorFromPoint(point.x, rect, true);
      return;
    }
    if (this.textFieldSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "textField" && hit.field === this.textFieldSelecting ? hit.rect : this.textFieldRect(this.textFieldSelecting);
      if (rect) this.setTextFieldCursorFromPoint(this.textFieldSelecting, point.x, rect, true);
      return;
    }
    if (this.searchSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "searchInput" ? hit.rect : this.searchInputRect();
      if (rect) this.setSearchCursorFromPoint(point.x, rect, true);
      return;
    }
    if (this.chatInputSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "chatInput" ? hit.rect : this.chatInputRectForFocus();
      if (rect) this.setChatInputCursorFromPoint(point, rect, true);
      return;
    }
    if (this.settingsNumberSelecting) {
      event.preventDefault();
      const hit = this.hitAt(point.x, point.y);
      const rect = hit?.type === "settingsNumber" ? hit.rect : this.settingsNumberInputRect();
      if (rect) this.setSettingsNumberCursorFromPoint(point.x, rect, true);
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
      this.sidebarWidth = this.clampSidebarWidth(point.x - this.ui(48));
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
    if (this.settingsScrollbarDrag) {
      event.preventDefault();
      this.dragSettingsScrollbar(point);
      this.canvas.style.cursor = "";
      return;
    }
    if (this.sidebarScrollbarDrag) {
      event.preventDefault();
      this.dragSidebarScrollbar(point);
      this.canvas.style.cursor = "";
      return;
    }
    if (this.chatScrollbarDrag) {
      event.preventDefault();
      this.dragChatScrollbar(point);
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
    this.updateActivityButtonHover(hover);
    this.updateButtonHover(hover);
    this.updateFileTreeHover(hover);
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
    const touchScrollWasActive = this.touchScroll?.pointerId === event.pointerId && this.touchScroll.active;
    const deferredTouchHit = this.touchScroll?.pointerId === event.pointerId ? this.deferredTouchHit : null;
    const pendingTouchDoubleTap = this.pendingTouchDoubleTap?.pointerId === event.pointerId ? this.pendingTouchDoubleTap : null;
    if (this.touchScroll?.pointerId === event.pointerId) this.touchScroll = null;
    this.cancelTouchLongPress(event.pointerId);
    if (this.selectionHandleDrag?.pointerId === event.pointerId) this.stopSelectionHandleDrag();
    if (deferredTouchHit) this.deferredTouchHit = null;
    if (touchScrollWasActive || pendingTouchDoubleTap) event.preventDefault();
    const completedDockResize = Boolean(this.dockResize);
    if (this.tabDrag) {
      this.tabDrag.pointer = point;
      this.updateDockPreview(point);
      this.applyTabDrop();
    }
    this.selecting = false;
    this.resizingSidebar = false;
    this.dockResize = null;
    this.scrollbarDrag = null;
    this.settingsScrollbarDrag = null;
    this.sidebarScrollbarDrag = null;
    this.chatScrollbarDrag = null;
    this.renameSelecting = false;
    this.searchSelecting = false;
    this.chatInputSelecting = false;
    this.textFieldSelecting = null;
    this.settingsNumberSelecting = false;
    this.pendingTabDrag = null;
    this.tabDrag = null;
    this.dockPreview = null;
    this.tabInsertionPreview = null;
    this.lastTabDragPoint = null;
    this.stopTabDragAutoscroll();
    if (completedDockResize) this.persistEditorSession();
    if (touchScrollWasActive) {
      this.pendingTouchKeyboardFocus = null;
      if (pendingTouchDoubleTap) this.pendingTouchDoubleTap = null;
    } else if (pendingTouchDoubleTap) {
      this.pendingTouchDoubleTap = null;
      this.deferredTouchHit = null;
      this.finishTouchTextDoubleTap(pendingTouchDoubleTap);
      this.runPendingTouchKeyboardFocus(event.pointerId);
    } else {
      if (deferredTouchHit) this.runDeferredTouchHit(deferredTouchHit);
      this.runPendingTouchKeyboardFocus(event.pointerId);
    }
    const hover = this.hitAt(point.x, point.y);
    this.updateScrollbarHover(hover, point);
    this.updateActivityButtonHover(hover);
    this.updateButtonHover(hover);
    this.updateFileTreeHover(hover);
    this.canvas.style.cursor = this.cursorForHit(hover);
    this.draw();
  }
  onPointerCancel(event) {
    if (this.touchScroll?.pointerId === event.pointerId) this.touchScroll = null;
    if (this.pendingTouchKeyboardFocus?.pointerId === event.pointerId) this.pendingTouchKeyboardFocus = null;
    if (this.pendingTouchDoubleTap?.pointerId === event.pointerId) this.pendingTouchDoubleTap = null;
    this.cancelTouchLongPress(event.pointerId);
    if (this.selectionHandleDrag?.pointerId === event.pointerId) this.stopSelectionHandleDrag();
    this.deferredTouchHit = null;
    this.selecting = false;
    this.resizingSidebar = false;
    this.dockResize = null;
    this.scrollbarDrag = null;
    this.settingsScrollbarDrag = null;
    this.sidebarScrollbarDrag = null;
    this.chatScrollbarDrag = null;
    this.renameSelecting = false;
    this.searchSelecting = false;
    this.chatInputSelecting = false;
    this.textFieldSelecting = null;
    this.settingsNumberSelecting = false;
    this.pendingTabDrag = null;
    this.tabDrag = null;
    this.dockPreview = null;
    this.tabInsertionPreview = null;
    this.lastTabDragPoint = null;
    this.hoveredButton = null;
    this.hoveredFileTreePath = null;
    this.stopTabDragAutoscroll();
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  onContextMenu(event) {
    event.preventDefault();
    if (this.modal) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit?.type === "contextMenu") return;
    if (hit?.type === "tab" || hit?.type === "tabClose") {
      this.openTabContextMenu(point, hit.groupId, hit.docId);
      return;
    }
    if (hit?.type === "tabBar") {
      this.openTabBarContextMenu(point, hit.groupId);
      return;
    }
    if (hit?.type === "tabOverflow") {
      this.openTabOverflowMenu(hit.groupId, hit.rect);
      return;
    }
    if (hit?.type === "editorGutter") {
      this.openGutterContextMenu(point, hit.groupId, hit.docId);
      return;
    }
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
    if (hit?.type === "chatInput") {
      this.focusMiniTarget("chat", hit.rect);
      if (!this.pointHitsChatInputSelection(point, hit.rect)) this.setChatInputCursorFromPoint(point, hit.rect, false);
      this.openChatInputContextMenu(point);
      return;
    }
    if (hit?.type === "chatBubble") {
      this.openChatBubbleContextMenu(point, hit.messageId);
      return;
    }
    if (hit?.type === "textField") {
      this.focusTextField(hit.field, hit.rect);
      if (!this.pointHitsTextFieldSelection(hit.field, point.x, hit.rect)) this.setTextFieldCursorFromPoint(hit.field, point.x, hit.rect, false);
      this.openTextFieldContextMenu(point, hit.field);
      return;
    }
    if (hit?.type === "settingsNumber") {
      this.focusSettingsNumber(hit.key, hit.rect);
      if (!this.pointHitsSettingsNumberSelection(point.x, hit.rect)) this.setSettingsNumberCursorFromPoint(point.x, hit.rect, false);
      this.openSettingsNumberTextContextMenu(point, hit.key);
      return;
    }
    if (hit?.type === "file") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.selectFileTreePath(hit.path);
      this.openFileContextMenu(point, hit.path);
      return;
    }
    if (hit?.type === "folder") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.selectFileTreePath(hit.path);
      this.openFolderContextMenu(point, hit.path);
      return;
    }
    if (hit?.type === "filesRoot") {
      if (this.renamePath) void this.commitRename();
      this.openRootContextMenu(point);
      return;
    }
    if (hit?.type === "settingsRoot") {
      this.openSettingsRootContextMenu(point);
      return;
    }
    if (hit?.type === "chatRoot") {
      this.openChatRootContextMenu(point);
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
    this.selectActiveDocumentInFileTree();
    if (!this.pointHitsSelection(doc, group.editorRect, point)) {
      doc.setSelection(this.positionFromPoint(point.x, point.y));
    }
    this.openEditorContextMenu(point, group, doc);
    this.focusEditor();
  }
  onClick(event) {
    if (this.pendingTouchKeyboardFocus) {
      event.preventDefault();
      this.runPendingTouchKeyboardFocus(void 0, true);
      return;
    }
    if (event.detail < 3 || this.modal || this.contextMenu || this.isMobileContextMode()) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit?.type === "fileRenameInput") {
      event.preventDefault();
      this.focusRename(hit.rect);
      this.renameBuffer.selectAll();
      this.renameSelecting = false;
      this.resetCaretBlink();
      return;
    }
    if (hit?.type === "searchInput") {
      event.preventDefault();
      this.focusMiniTarget("search", hit.rect);
      this.searchBuffer.selectAll();
      this.searchSelecting = false;
      this.resetCaretBlink();
      return;
    }
    if (hit?.type === "chatInput") {
      event.preventDefault();
      this.focusMiniTarget("chat", hit.rect);
      this.chatDraft.selectAll();
      this.chatInputSelecting = false;
      this.resetCaretBlink();
      return;
    }
    if (hit?.type === "textField") {
      event.preventDefault();
      this.focusTextField(hit.field, hit.rect);
      this.bufferForTextField(hit.field).selectAll();
      this.textFieldSelecting = null;
      this.resetCaretBlink();
      return;
    }
    if (hit?.type === "settingsNumber") {
      event.preventDefault();
      this.focusSettingsNumber(hit.key, hit.rect);
      this.settingsNumberBuffer.selectAll();
      this.settingsNumberSelecting = false;
      this.resetCaretBlink();
      return;
    }
    if (hit?.type !== "editor") return;
    event.preventDefault();
    const group = this.groupById(hit.groupId);
    const docId = group.activeDocId;
    const doc = docId ? this.docs.get(docId) : void 0;
    if (!doc) return;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.selectActiveDocumentInFileTree();
    this.selecting = false;
    this.selectEditorLineFromPoint(doc, group.editorRect, point);
    this.focusEditor();
    this.persistEditorSession();
  }
  onDoubleClick(event) {
    event.preventDefault();
    if (this.modal) return;
    if (this.contextMenu && this.isMobileContextMode()) return;
    const rect = this.canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit = this.hitAt(point.x, point.y);
    if (hit && this.isMobileContextMode()) {
      if (hit.type === "chatInput") {
        this.focusMiniTarget("chat", hit.rect, true);
        this.selectChatInputWordFromPoint(point, hit.rect);
        return;
      }
      this.openContextMenuForHit(point, hit, true);
      return;
    }
    if (hit?.type === "fileRenameInput") {
      this.focusRename(hit.rect);
      this.selectRenameWordFromPoint(point.x, hit.rect);
    } else if (hit?.type === "searchInput") {
      this.focusMiniTarget("search", hit.rect);
      this.selectSearchWordFromPoint(point.x, hit.rect);
    } else if (hit?.type === "chatInput") {
      this.focusMiniTarget("chat", hit.rect);
      this.selectChatInputWordFromPoint(point, hit.rect);
    } else if (hit?.type === "textField") {
      this.focusTextField(hit.field, hit.rect);
      this.selectTextFieldWordFromPoint(hit.field, point.x, hit.rect);
    } else if (hit?.type === "settingsNumber") {
      this.focusSettingsNumber(hit.key, hit.rect);
      this.selectSettingsNumberWordFromPoint(point.x, hit.rect);
    } else if (hit?.type === "file") {
      if (this.settings.renameOnDoubleClick) this.startRename(hit.path, hit.rect);
    } else if (hit?.type === "tabBar") {
      this.openUntitledDocument(hit.groupId);
    } else if (hit?.type === "editor") {
      const group = this.groupById(hit.groupId);
      const docId = group.activeDocId;
      const doc = docId ? this.docs.get(docId) : void 0;
      if (!doc) return;
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      this.selectActiveDocumentInFileTree();
      this.selectEditorWordFromPoint(doc, group.editorRect, point);
      this.focusEditor();
      this.persistEditorSession();
    }
  }
  focusEditor() {
    const doc = this.activeDoc();
    if (!doc) return;
    this.input.focusEditor(this.editorTarget(), this.caretRect(doc));
    this.resetCaretBlink();
    this.requestFocusedInputReveal();
  }
  revealEditorCaret() {
    const doc = this.activeDoc();
    if (!doc) return;
    this.ensureCaretVisible(doc, this.activeEditorRect());
    this.focusEditor();
  }
  focusMiniTarget(kind, rect, stabilizeTouchKeyboard = false) {
    if (stabilizeTouchKeyboard) this.beginTouchKeyboardStabilization();
    this.input.focusEditor(this.miniTarget(kind), kind === "chat" ? this.chatInputCaretRect(rect) : rect);
    this.resetCaretBlink();
    this.requestFocusedInputReveal();
  }
  focusTextField(field, rect) {
    if (isSettingTextField(field)) {
      if (this.activeSettingsText !== field) this.syncSettingsTextBufferFromConfig(field);
      this.activeSettingsText = field;
    } else if (this.activeSettingsText) {
      this.commitSettingsTextInput(false);
    }
    this.input.focusEditor(this.textFieldTarget(field), rect);
    this.resetCaretBlink();
    this.requestFocusedInputReveal();
  }
  focusActivityMode(mode, focus = true) {
    if (!focus) {
      this.input.blur();
      return;
    }
    const vp = this.viewport.get();
    const sidebarX = this.ui(48);
    if (mode === "search") {
      this.focusMiniTarget("search", { x: sidebarX + this.ui(10), y: this.ui(40), w: this.sidebarWidth - this.ui(20), h: this.ui(28) });
    } else if (mode === "chat") {
      this.focusMiniTarget("chat", this.chatInputRectForSidebar({ x: sidebarX, y: 0, w: this.sidebarWidth, h: vp.cssHeight - this.ui(24) }));
    } else if (mode === "settings") {
      this.input.blur();
    } else {
      this.focusEditor();
    }
  }
  toggleActivityMode(mode, focus = true) {
    if (this.sidebarWidth > 0 && this.sidebarMode === mode) {
      this.lastSidebarWidth = this.sidebarWidth;
      this.sidebarWidth = 0;
      this.statusText = "Sidebar hidden";
      if (focus) this.focusEditor();
      else this.input.blur();
      return;
    }
    this.sidebarMode = mode;
    this.sidebarWidth = this.lastSidebarWidth || 280;
    this.statusText = `${mode[0].toUpperCase()}${mode.slice(1)} panel`;
    this.focusActivityMode(mode, focus);
  }
  requestFocusedInputReveal() {
    if (!this.input.activeTarget && !this.activeSettingsNumber && !this.activeSettingsText && !this.renamePath) return;
    this.pendingFocusedInputReveal = true;
  }
  applyPendingFocusedInputReveal() {
    if (!this.pendingFocusedInputReveal) return;
    this.pendingFocusedInputReveal = false;
    if (this.revealFocusedInputInScrollArea()) this.scheduleDraw();
  }
  revealFocusedInputInScrollArea() {
    if (this.isTouchKeyboardStabilizing()) return false;
    let changed = false;
    const activeKind = this.input.activeTarget?.kind ?? null;
    if (activeKind === "editor") {
      const doc = this.activeDoc();
      const group = doc ? this.groupContaining(doc.id) : null;
      if (doc && group) {
        const scroll = this.scrollForDoc(doc.id);
        const beforeX = scroll.x;
        const beforeY = scroll.y;
        this.ensureCaretVisible(doc, group.editorRect);
        changed ||= Math.abs(scroll.x - beforeX) > 0.5 || Math.abs(scroll.y - beforeY) > 0.5;
      }
    } else if (activeKind === "chat") {
      const before = this.chatInputScrollY;
      const inputRect = this.chatInputRectForFocus();
      this.ensureChatInputCaretVisible(inputRect);
      this.input.refocus(this.chatInputCaretRect(inputRect));
      changed ||= Math.abs(this.chatInputScrollY - before) > 0.5;
    }
    if (this.activeSettingsNumber || this.activeSettingsText) changed ||= this.ensureFocusedSettingsInputVisible();
    return changed;
  }
  beginTouchKeyboardStabilization() {
    const until = performance.now() + TOUCH_KEYBOARD_STABILIZE_MS;
    this.touchKeyboardStabilizeUntil = Math.max(this.touchKeyboardStabilizeUntil, until);
    this.viewport.deferVisualViewportCanvasResize(TOUCH_KEYBOARD_STABILIZE_MS);
    if (this.touchKeyboardStabilizeTimer) window.clearTimeout(this.touchKeyboardStabilizeTimer);
    this.touchKeyboardStabilizeTimer = window.setTimeout(() => {
      this.touchKeyboardStabilizeTimer = 0;
      this.requestFocusedInputReveal();
      this.scheduleDraw();
    }, Math.max(16, Math.ceil(this.touchKeyboardStabilizeUntil - performance.now()) + 16));
  }
  isTouchKeyboardStabilizing() {
    return performance.now() < this.touchKeyboardStabilizeUntil;
  }
  ensureFocusedSettingsInputVisible() {
    const viewport = this.settingsViewportRect;
    const input = this.focusedSettingsInputRect;
    if (!viewport || !input) return false;
    const margin = Math.min(this.ui(10), Math.max(0, (viewport.h - input.h) / 2));
    const top = viewport.y + margin;
    const bottom = viewport.y + viewport.h - margin;
    let next = this.settingsScrollY;
    if (input.y < top) next -= top - input.y;
    else if (input.y + input.h > bottom) next += input.y + input.h - bottom;
    next = clamp(next, 0, this.maxSettingsScrollY(viewport));
    if (Math.abs(next - this.settingsScrollY) <= 0.5) return false;
    this.settingsScrollY = next;
    return true;
  }
  hitAt(x, y) {
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const hit = this.hits[i];
      if ((hit.type === "selectionHandle" || hit.type === "textSelectionHandle") && rectContains(hit.rect, x, y)) return hit;
    }
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
    const nextSettings = hit?.type === "settingsScrollbar" ? { overThumb: rectContains(hit.thumbRect, point.x, point.y) } : null;
    const nextSidebar = hit?.type === "sidebarScrollbar" ? { panel: hit.panel, overThumb: rectContains(hit.thumbRect, point.x, point.y) } : null;
    const nextChat = hit?.type === "chatScrollbar" ? { panel: hit.panel, overThumb: rectContains(hit.thumbRect, point.x, point.y) } : null;
    const changed = this.hoveredScrollbar?.axis !== next?.axis || this.hoveredScrollbar?.groupId !== next?.groupId || this.hoveredScrollbar?.docId !== next?.docId || this.hoveredScrollbar?.overThumb !== next?.overThumb || this.hoveredSettingsScrollbar?.overThumb !== nextSettings?.overThumb || this.hoveredSidebarScrollbar?.panel !== nextSidebar?.panel || this.hoveredSidebarScrollbar?.overThumb !== nextSidebar?.overThumb || this.hoveredChatScrollbar?.panel !== nextChat?.panel || this.hoveredChatScrollbar?.overThumb !== nextChat?.overThumb;
    if (!changed) return;
    this.hoveredScrollbar = next;
    this.hoveredSettingsScrollbar = nextSettings;
    this.hoveredSidebarScrollbar = nextSidebar;
    this.hoveredChatScrollbar = nextChat;
    this.scheduleDraw();
  }
  clearScrollbarHover() {
    if (!this.hoveredScrollbar && !this.hoveredSettingsScrollbar && !this.hoveredSidebarScrollbar && !this.hoveredChatScrollbar && !this.hoveredActivityButton && !this.hoveredButton && !this.hoveredFileTreePath || this.scrollbarDrag || this.settingsScrollbarDrag || this.sidebarScrollbarDrag || this.chatScrollbarDrag) return;
    this.hoveredScrollbar = null;
    this.hoveredSettingsScrollbar = null;
    this.hoveredSidebarScrollbar = null;
    this.hoveredChatScrollbar = null;
    this.hoveredActivityButton = null;
    this.hoveredButton = null;
    this.hoveredFileTreePath = null;
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  updateActivityButtonHover(hit) {
    const next = hit?.type === "activity" ? hit.mode : hit?.type === "downloadActivity" ? "download" : hit?.type === "settingsActivity" ? "settings" : null;
    if (this.hoveredActivityButton === next) return;
    this.hoveredActivityButton = next;
    this.scheduleDraw();
  }
  updateButtonHover(hit) {
    const next = this.buttonHoverKeyForHit(hit);
    if (this.hoveredButton === next) return;
    this.hoveredButton = next;
    this.scheduleDraw();
  }
  updateFileTreeHover(hit) {
    const next = hit?.type === "file" || hit?.type === "folder" ? normalizePath(hit.path) : null;
    if (this.hoveredFileTreePath === next) return;
    this.hoveredFileTreePath = next;
    this.scheduleDraw();
  }
  buttonHoverKeyForHit(hit) {
    if (!hit) return null;
    if (hit.type === "tabClose") return this.buttonHoverKey("tabClose", hit.groupId, hit.docId);
    if (hit.type === "tabOverflow") return this.buttonHoverKey("tabOverflow", hit.groupId);
    if (hit.type === "statusWhitespace") return this.buttonHoverKey("statusWhitespace");
    if (hit.type === "statusHighlight") return this.buttonHoverKey("statusHighlight", hit.groupId, hit.docId);
    if (hit.type === "searchReplaceToggle") return this.buttonHoverKey("searchReplaceToggle");
    if (hit.type === "searchRefresh") return this.buttonHoverKey("searchRefresh");
    if (hit.type === "searchReplaceAll") return hit.enabled ? this.buttonHoverKey("searchReplaceAll") : null;
    if (hit.type === "findToggle") return this.buttonHoverKey("findToggle");
    if (hit.type === "findPrevious") return hit.enabled ? this.buttonHoverKey("findPrevious") : null;
    if (hit.type === "findNext") return hit.enabled ? this.buttonHoverKey("findNext") : null;
    if (hit.type === "findClose") return this.buttonHoverKey("findClose");
    if (hit.type === "findReplace") return hit.enabled ? this.buttonHoverKey("findReplace") : null;
    if (hit.type === "findReplaceAll") return hit.enabled ? this.buttonHoverKey("findReplaceAll") : null;
    if (hit.type === "chatSend") return hit.enabled ? this.buttonHoverKey("chatSend") : null;
    if (hit.type === "chatShowThinking") return this.buttonHoverKey("chatShowThinking");
    if (hit.type === "settingsButton") return hit.enabled ? this.buttonHoverKey("settingsButton", hit.action) : null;
    if (hit.type === "settingsCheckbox") return this.buttonHoverKey("settingsCheckbox", hit.key);
    if (hit.type === "settingsDropdown") return this.buttonHoverKey("settingsDropdown", hit.key);
    return null;
  }
  buttonHoverKey(type, ...parts) {
    return [type, ...parts].join(":");
  }
  isButtonHovered(type, ...parts) {
    return this.hoveredButton === this.buttonHoverKey(type, ...parts);
  }
  isContextMenuPointer(event) {
    return event.button === 2 || event.button === 0 && event.ctrlKey;
  }
  isMobileContextMode() {
    return navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches;
  }
  isMobileSelectionMode() {
    return navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  }
  shouldAllowNativeTouchFocus(event, hit) {
    return event.pointerType === "touch" && this.isTouchKeyboardHit(hit);
  }
  isTouchKeyboardHit(hit) {
    return Boolean(hit && (hit.type === "editor" || hit.type === "fileRenameInput" || hit.type === "searchInput" || hit.type === "chatInput" || hit.type === "textField" || hit.type === "settingsNumber"));
  }
  queueTouchKeyboardFocus(event, hit) {
    if (event.pointerType !== "touch") return;
    if (!this.isTouchKeyboardHit(hit)) {
      this.pendingTouchKeyboardFocus = null;
      return;
    }
    this.beginTouchKeyboardStabilization();
    this.pendingTouchKeyboardFocus = { pointerId: event.pointerId, hit, expiresAt: performance.now() + 800 };
  }
  runPendingTouchKeyboardFocus(pointerId, clear = false) {
    const pending = this.pendingTouchKeyboardFocus;
    if (!pending) return false;
    if (pointerId !== void 0 && pending.pointerId !== pointerId) return false;
    if (performance.now() > pending.expiresAt) {
      this.pendingTouchKeyboardFocus = null;
      return false;
    }
    this.beginTouchKeyboardStabilization();
    if (!(this.input.isFocused() && this.touchKeyboardHitMatchesActiveInput(pending.hit))) this.refocusTouchKeyboardHit(pending.hit);
    if (clear) this.pendingTouchKeyboardFocus = null;
    return true;
  }
  refocusTouchKeyboardHit(hit) {
    if (!this.isTouchKeyboardHit(hit)) return;
    this.beginTouchKeyboardStabilization();
    if (hit.type === "editor") {
      const doc = this.activeDoc();
      this.input.refocus(doc ? this.caretRect(doc) : hit.rect);
      return;
    }
    if (hit.type === "chatInput") {
      const inputRect = this.chatInputRectForFocus();
      this.input.refocus(this.chatInputCaretRect(inputRect));
      return;
    }
    this.input.refocus(hit.rect);
  }
  touchKeyboardHitMatchesActiveInput(hit) {
    const kind = this.input.activeTarget?.kind ?? null;
    if (hit.type === "editor") return kind === "editor";
    if (hit.type === "searchInput") return kind === "search";
    if (hit.type === "chatInput") return kind === "chat";
    if (hit.type === "fileRenameInput") return kind === "command" && this.renamePath === hit.path;
    if (hit.type === "settingsNumber") return kind === "command" && this.activeSettingsNumber === hit.key;
    return kind === hit.field;
  }
  startTouchLongPress(pointerId, point, hit) {
    let press = null;
    if (hit.type === "editor") {
      const group = this.groupById(hit.groupId);
      const docId = group.activeDocId;
      const doc = docId ? this.docs.get(docId) : void 0;
      if (!doc || doc.readOnly) return;
      press = { type: "editor", pointerId, groupId: group.id, docId: doc.id, point: { ...point } };
    } else {
      const target = this.textSelectionTargetFromTouchHit(hit);
      if (!target) return;
      press = { type: "text", pointerId, target, inputRect: { ...hit.rect }, point: { ...point } };
    }
    this.cancelTouchLongPress();
    this.touchLongPress = press;
    this.touchLongPressTimer = window.setTimeout(() => this.completeTouchLongPress(pointerId), TOUCH_LONG_PRESS_MS);
  }
  textSelectionTargetFromTouchHit(hit) {
    if (hit.type === "fileRenameInput") return { type: "rename", path: hit.path };
    if (hit.type === "searchInput") return { type: "textField", field: "search" };
    if (hit.type === "chatInput") return { type: "chatInput" };
    if (hit.type === "textField") return { type: "textField", field: hit.field };
    if (hit.type === "settingsNumber") return { type: "settingsNumber", key: hit.key };
    return null;
  }
  completeTouchLongPress(pointerId) {
    const press = this.touchLongPress;
    if (!press || press.pointerId !== pointerId) return;
    if (this.pendingTouchDoubleTap?.pointerId === pointerId) this.pendingTouchDoubleTap = null;
    this.cancelTouchLongPress(pointerId);
    if (press.type === "text") {
      this.completeTextTouchLongPress(press);
      return;
    }
    const group = this.groupById(press.groupId);
    const doc = this.docs.get(press.docId);
    if (!doc || group.activeDocId !== doc.id || doc.readOnly) return;
    this.touchScroll = null;
    this.deferredTouchHit = null;
    this.selecting = false;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.selectActiveDocumentInFileTree();
    this.selectEditorWordFromPoint(doc, group.editorRect, press.point);
    this.focusEditor();
    this.persistEditorSession();
    this.scheduleDraw();
  }
  completeTextTouchLongPress(press) {
    this.touchScroll = null;
    this.deferredTouchHit = null;
    this.selecting = false;
    this.renameSelecting = false;
    this.searchSelecting = false;
    this.chatInputSelecting = false;
    this.textFieldSelecting = null;
    this.settingsNumberSelecting = false;
    this.focusTextSelectionHandleTarget(press.target, press.inputRect);
    if (press.target.type === "rename") this.selectRenameWordFromPoint(press.point.x, press.inputRect);
    else if (press.target.type === "textField") this.selectTextFieldWordFromPoint(press.target.field, press.point.x, press.inputRect);
    else if (press.target.type === "settingsNumber") this.selectSettingsNumberWordFromPoint(press.point.x, press.inputRect);
    else this.selectChatInputWordFromPoint(press.point, press.inputRect);
    this.scheduleDraw();
  }
  cancelTouchLongPress(pointerId) {
    if (pointerId !== void 0 && this.touchLongPress?.pointerId !== pointerId) return;
    if (this.touchLongPressTimer) window.clearTimeout(this.touchLongPressTimer);
    this.touchLongPressTimer = 0;
    this.touchLongPress = null;
  }
  cancelTouchLongPressIfMoved(pointerId, point) {
    const press = this.touchLongPress;
    const pendingTap = this.pendingTouchDoubleTap;
    if (pendingTap?.pointerId === pointerId && Math.hypot(point.x - pendingTap.point.x, point.y - pendingTap.point.y) >= this.ui(TOUCH_SCROLL_THRESHOLD)) this.pendingTouchDoubleTap = null;
    if (!press || press.pointerId !== pointerId) return;
    if (Math.hypot(point.x - press.point.x, point.y - press.point.y) >= this.ui(TOUCH_SCROLL_THRESHOLD)) this.cancelTouchLongPress(pointerId);
  }
  startSelectionHandleDrag(hit, pointerId, point) {
    const group = this.groupById(hit.groupId);
    const doc = this.docs.get(hit.docId);
    if (!doc || !doc.hasSelection()) return;
    const ordered = doc.getOrderedSelection();
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    group.activeDocId = doc.id;
    this.selectActiveDocumentInFileTree();
    this.selectionHandleDrag = {
      type: "editor",
      pointerId,
      groupId: group.id,
      docId: doc.id,
      edge: hit.edge,
      fixed: hit.edge === "start" ? { ...ordered.end } : { ...ordered.start },
      point: { ...point }
    };
    this.touchScroll = null;
    this.deferredTouchHit = null;
    this.selecting = false;
    this.capturePointer(pointerId);
    this.startSelectionHandleAutoscroll();
  }
  startTextSelectionHandleDrag(hit, pointerId, point) {
    if (hit.target.type === "chatInput") {
      if (!this.chatDraft.hasSelection()) return;
      const ordered = this.chatDraft.getOrderedSelection();
      this.selectionHandleDrag = {
        type: "chatInput",
        pointerId,
        inputRect: hit.inputRect,
        edge: hit.edge,
        fixed: hit.edge === "start" ? { ...ordered.end } : { ...ordered.start },
        point: { ...point }
      };
    } else {
      const buffer = this.bufferForTextSelectionHandleTarget(hit.target);
      if (!buffer.hasSelection()) return;
      this.focusTextSelectionHandleTarget(hit.target, hit.inputRect);
      const start = Math.min(buffer.anchor, buffer.cursor);
      const end = Math.max(buffer.anchor, buffer.cursor);
      this.selectionHandleDrag = {
        type: "mini",
        pointerId,
        target: hit.target,
        inputRect: hit.inputRect,
        edge: hit.edge,
        fixed: hit.edge === "start" ? end : start,
        point: { ...point }
      };
    }
    this.touchScroll = null;
    this.deferredTouchHit = null;
    this.selecting = false;
    this.renameSelecting = false;
    this.searchSelecting = false;
    this.chatInputSelecting = false;
    this.textFieldSelecting = null;
    this.settingsNumberSelecting = false;
    this.capturePointer(pointerId);
    this.startSelectionHandleAutoscroll();
  }
  updateSelectionHandleDrag(point) {
    const drag = this.selectionHandleDrag;
    if (!drag) return;
    drag.point = { ...point };
    if (drag.type === "mini") {
      this.updateMiniSelectionHandleDrag(drag);
      return;
    }
    if (drag.type === "chatInput") {
      this.updateChatInputSelectionHandleDrag(drag);
      return;
    }
    const group = this.groupById(drag.groupId);
    const doc = this.docs.get(drag.docId);
    if (!doc) return;
    this.applySelectionHandleAutoscroll(drag, group, doc);
    const pos = this.positionFromPointInEditor(doc, group.editorRect, point.x, point.y);
    doc.setSelection(drag.fixed, pos);
    this.resetCaretBlink();
    this.persistEditorSession();
    this.scheduleDraw();
  }
  updateMiniSelectionHandleDrag(drag) {
    const buffer = this.bufferForTextSelectionHandleTarget(drag.target);
    this.applyMiniSelectionHandleAutoscroll(drag, buffer);
    const col = this.miniBufferColumnFromPoint(buffer, drag.inputRect, this.textSelectionHandlePadX(drag.target), drag.point.x);
    buffer.anchor = drag.fixed;
    buffer.cursor = col;
    this.revealMiniBufferCaret(buffer, drag.inputRect, this.textSelectionHandlePadX(drag.target));
    this.resetCaretBlink();
    this.scheduleDraw();
  }
  updateChatInputSelectionHandleDrag(drag) {
    this.applyChatInputSelectionHandleAutoscroll(drag);
    const pos = this.chatInputPositionFromPoint(drag.point, drag.inputRect);
    this.chatDraft.setSelection(drag.fixed, pos);
    this.ensureChatInputCaretVisible(drag.inputRect);
    this.resetCaretBlink();
    this.scheduleDraw();
  }
  startSelectionHandleAutoscroll() {
    if (this.selectionHandleAutoscrollFrame) return;
    const tick = () => {
      this.selectionHandleAutoscrollFrame = 0;
      const drag = this.selectionHandleDrag;
      if (!drag) return;
      this.updateSelectionHandleDrag(drag.point);
      this.selectionHandleAutoscrollFrame = window.requestAnimationFrame(tick);
    };
    this.selectionHandleAutoscrollFrame = window.requestAnimationFrame(tick);
  }
  stopSelectionHandleDrag() {
    this.selectionHandleDrag = null;
    if (this.selectionHandleAutoscrollFrame) window.cancelAnimationFrame(this.selectionHandleAutoscrollFrame);
    this.selectionHandleAutoscrollFrame = 0;
    this.persistEditorSession();
  }
  applySelectionHandleAutoscroll(drag, group, doc) {
    const scroll = this.scrollForDoc(doc.id);
    const rect = group.editorRect;
    const edge = this.ui(SELECTION_HANDLE_AUTOSCROLL_EDGE);
    const maxStep = this.ui(SELECTION_HANDLE_AUTOSCROLL_MAX_STEP);
    let dx = 0;
    let dy = 0;
    if (drag.point.y < rect.y + edge) dy = -maxStep * (1 - Math.max(0, drag.point.y - rect.y) / edge);
    else if (drag.point.y > rect.y + rect.h - edge) dy = maxStep * (1 - Math.max(0, rect.y + rect.h - drag.point.y) / edge);
    if (drag.point.x < rect.x + edge) dx = -maxStep * (1 - Math.max(0, drag.point.x - rect.x) / edge);
    else if (drag.point.x > rect.x + rect.w - edge) dx = maxStep * (1 - Math.max(0, rect.x + rect.w - drag.point.x) / edge);
    if (dx === 0 && dy === 0) return;
    scroll.x = clamp(scroll.x + dx, 0, this.maxScrollX(doc, rect));
    scroll.y = clamp(scroll.y + dy, 0, this.maxScrollY(doc, rect));
  }
  applyMiniSelectionHandleAutoscroll(drag, buffer) {
    const content = this.miniBufferContentRect(drag.inputRect, this.textSelectionHandlePadX(drag.target));
    const maxScroll = Math.max(0, this.renderer.measureText(buffer.text, "ui") - content.w);
    if (maxScroll <= 0) return;
    const edge = this.ui(SELECTION_HANDLE_AUTOSCROLL_EDGE);
    const maxStep = this.ui(SELECTION_HANDLE_AUTOSCROLL_MAX_STEP);
    let dx = 0;
    if (drag.point.x < content.x + edge) dx = -maxStep * (1 - Math.max(0, drag.point.x - content.x) / edge);
    else if (drag.point.x > content.x + content.w - edge) dx = maxStep * (1 - Math.max(0, content.x + content.w - drag.point.x) / edge);
    if (dx === 0) return;
    buffer.scrollX = clamp(buffer.scrollX + dx, 0, maxScroll);
  }
  applyChatInputSelectionHandleAutoscroll(drag) {
    const metrics = this.chatInputMetrics(drag.inputRect);
    const edge = this.ui(SELECTION_HANDLE_AUTOSCROLL_EDGE);
    const maxStep = this.ui(SELECTION_HANDLE_AUTOSCROLL_MAX_STEP);
    let dy = 0;
    if (drag.point.y < metrics.content.y + edge) dy = -maxStep * (1 - Math.max(0, drag.point.y - metrics.content.y) / edge);
    else if (drag.point.y > metrics.content.y + metrics.content.h - edge) dy = maxStep * (1 - Math.max(0, metrics.content.y + metrics.content.h - drag.point.y) / edge);
    if (dy === 0) return;
    this.chatInputScrollY = clamp(this.chatInputScrollY + dy, 0, Math.max(0, metrics.contentHeight - metrics.viewport.h));
  }
  makeTouchScrollState(event, point, hit) {
    if (event.pointerType !== "touch") return null;
    if (hit?.type === "editorScrollbar" || hit?.type === "settingsScrollbar" || hit?.type === "sidebarScrollbar" || hit?.type === "chatScrollbar") return null;
    if (hit?.type === "chatTranscript" || hit?.type === "chatInput" || hit?.type === "chatBubble") {
      const panel = hit.type === "chatInput" ? "chatInput" : "chatTranscript";
      const rect = hit.type === "chatBubble" ? hit.viewportRect : hit.rect;
      const maxScroll = this.maxChatScrollY(panel, rect);
      if (maxScroll > 0) {
        return {
          type: "chat",
          pointerId: event.pointerId,
          panel,
          rect: { ...rect },
          startPoint: { ...point },
          startScrollY: this.chatPanelScrollY(panel),
          active: false
        };
      }
    }
    const sidebarRegion = this.sidebarScrollRegionForPoint(point);
    if (sidebarRegion) {
      const maxScroll = this.maxSidebarScrollY(sidebarRegion.panel, sidebarRegion.viewport);
      if (maxScroll > 0) {
        return {
          type: "sidebar",
          pointerId: event.pointerId,
          panel: sidebarRegion.panel,
          rect: { ...sidebarRegion.viewport },
          startPoint: { ...point },
          startScrollY: this.sidebarScrollY(sidebarRegion.panel),
          active: false
        };
      }
    }
    if (hit?.type === "editor" || hit?.type === "editorGutter") {
      const group2 = this.groupById(hit.groupId);
      const docId = group2.activeDocId;
      const doc = docId ? this.docs.get(docId) : void 0;
      if (!doc) return null;
      if (this.maxScrollX(doc, group2.editorRect) <= 0 && this.maxScrollY(doc, group2.editorRect) <= 0) return null;
      return {
        type: "editor",
        pointerId: event.pointerId,
        groupId: group2.id,
        docId: doc.id,
        rect: { ...group2.editorRect },
        startPoint: { ...point },
        startScroll: { ...this.scrollForDoc(doc.id) },
        originalSelection: cloneSelectionState(doc.selection),
        active: false
      };
    }
    const group = this.editorGroupAt(point.x, point.y);
    if (!group || !this.isSettingsTab(group.activeDocId)) return null;
    if (this.maxSettingsScrollY(group.editorRect) <= 0) return null;
    return {
      type: "settings",
      pointerId: event.pointerId,
      groupId: group.id,
      rect: { ...group.editorRect },
      startPoint: { ...point },
      startScrollY: this.settingsScrollY,
      active: false
    };
  }
  updateTouchScroll(point) {
    const scroll = this.touchScroll;
    if (!scroll) return;
    const dx = point.x - scroll.startPoint.x;
    const dy = point.y - scroll.startPoint.y;
    if (!scroll.active) {
      if (Math.hypot(dx, dy) < this.ui(TOUCH_SCROLL_THRESHOLD)) return;
      scroll.active = true;
      this.cancelTouchLongPress(scroll.pointerId);
      this.lastTouchTap = null;
      this.pendingTouchDoubleTap = null;
      this.deferredTouchHit = null;
      this.selecting = false;
      this.renameSelecting = false;
      this.searchSelecting = false;
      this.textFieldSelecting = null;
      this.settingsNumberSelecting = false;
      this.closeContextMenuForScroll();
      if (scroll.type === "editor") {
        const doc2 = this.docs.get(scroll.docId);
        if (doc2) doc2.selection = cloneSelectionState(scroll.originalSelection);
      }
    }
    if (scroll.type === "settings") {
      const group2 = this.groupById(scroll.groupId);
      this.settingsScrollY = clamp(scroll.startScrollY - dy, 0, this.maxSettingsScrollY(group2.editorRect));
      this.scheduleDraw();
      return;
    }
    if (scroll.type === "sidebar") {
      this.setSidebarScrollY(scroll.panel, scroll.startScrollY - dy, scroll.rect);
      this.scheduleDraw();
      return;
    }
    if (scroll.type === "chat") {
      this.setChatPanelScrollY(scroll.panel, scroll.startScrollY - dy, scroll.rect);
      this.scheduleDraw();
      return;
    }
    const group = this.groupById(scroll.groupId);
    const doc = this.docs.get(scroll.docId);
    if (!doc) return;
    const docScroll = this.scrollForDoc(doc.id);
    docScroll.x = clamp(scroll.startScroll.x - dx, 0, this.maxScrollX(doc, group.editorRect));
    docScroll.y = clamp(scroll.startScroll.y - dy, 0, this.maxScrollY(doc, group.editorRect));
    this.persistEditorSession();
    this.scheduleDraw();
  }
  capturePointer(pointerId) {
    try {
      this.canvas.setPointerCapture(pointerId);
    } catch {
    }
  }
  shouldDeferTouchHit(hit) {
    return hit.type === "settingsHeader" || hit.type === "settingsCheckbox" || hit.type === "settingsDropdown" || hit.type === "statusWhitespace" || hit.type === "chatShowThinking" || hit.type === "statusHighlight" || hit.type === "settingsButton" || hit.type === "folder" || hit.type === "file" || hit.type === "filesRoot" || hit.type === "editorGutter" || hit.type === "searchResult";
  }
  runDeferredTouchHit(deferred) {
    const { hit, point } = deferred;
    if (hit.type === "settingsHeader") {
      this.toggleSettingsHeader(hit.id);
    } else if (hit.type === "settingsCheckbox") {
      this.toggleSettingsCheckbox(hit.key);
    } else if (hit.type === "settingsDropdown") {
      this.openSettingsDropdown(hit.rect, hit.key);
    } else if (hit.type === "statusWhitespace") {
      this.toggleStatusWhitespace();
    } else if (hit.type === "chatShowThinking") {
      this.toggleChatShowThinking();
    } else if (hit.type === "statusHighlight") {
      this.openHighlightDropdown(hit);
    } else if (hit.type === "editorGutter") {
      const group = this.groupById(hit.groupId);
      const doc = this.docs.get(hit.docId);
      if (!doc) return;
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      group.activeDocId = doc.id;
      this.selectActiveDocumentInFileTree();
      doc.setSelection(this.positionFromPointInEditor(doc, group.editorRect, point.x, point.y));
      this.selecting = true;
      this.focusEditor();
      this.resetCaretBlink();
      this.persistEditorSession();
    } else if (hit.type === "settingsNumber") {
      this.focusSettingsNumber(hit.key, hit.rect);
      this.setSettingsNumberCursorFromPoint(point.x, hit.rect, false);
    } else if (hit.type === "textField") {
      this.focusTextField(hit.field, hit.rect);
      this.setTextFieldCursorFromPoint(hit.field, point.x, hit.rect, false);
    } else if (hit.type === "settingsButton") {
      if (hit.enabled) void this.runSettingsButton(hit.action);
    } else if (hit.type === "folder") {
      this.selectFileTreePath(hit.path);
      this.toggleFolder(hit.path);
    } else if (hit.type === "file") {
      this.selectFileTreePath(hit.path);
      void this.openFile(hit.path, { focus: false });
    } else if (hit.type === "filesRoot") {
      this.input.blur();
    } else if (hit.type === "searchResult") {
      void this.openFile(hit.path, { focus: false }).then(() => {
        const doc = this.activeDoc();
        if (doc) doc.setSelection({ line: hit.line, col: 0 });
        if (doc) {
          this.ensureCaretVisible(doc, this.activeEditorRect());
          this.scheduleDraw();
        }
      });
    }
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
    if (this.isTouchKeyboardHit(hit)) {
      this.pendingTouchDoubleTap = { pointerId: event.pointerId, hit, point: { ...point }, key };
      return false;
    }
    event.preventDefault();
    this.pendingTouchKeyboardFocus = null;
    this.openContextMenuForHit(point, hit, true);
    return true;
  }
  handleActiveSettingsNumberTouchDoubleTap(event, point) {
    const key = this.activeSettingsNumber;
    const last = this.lastTouchTap;
    if (!key || !last || last.key !== `settingsNumber:${key}`) return false;
    const now = performance.now();
    if (now - last.time > TOUCH_DOUBLE_TAP_MS) return false;
    this.lastTouchTap = null;
    event.preventDefault();
    this.focusSettingsNumber(key, this.settingsNumberInputRect(key) ?? { x: point.x, y: point.y, w: this.ui(72), h: this.ui(24) });
    this.settingsNumberBuffer.selectAll();
    this.openSettingsNumberTextContextMenu(point, key);
    return true;
  }
  finishTouchTextDoubleTap(tap) {
    if (tap.hit.type === "chatInput") {
      this.focusMiniTarget("chat", tap.hit.rect, true);
      this.selectChatInputWordFromPoint(tap.point, tap.hit.rect);
      this.chatInputSelecting = false;
      this.scheduleDraw();
      return;
    }
    this.openContextMenuForHit(tap.point, tap.hit, true);
  }
  doubleTapKey(hit) {
    if (hit.type === "file") return `file:${hit.path}`;
    if (hit.type === "folder") return `folder:${hit.path}`;
    if (hit.type === "filesRoot") return "filesRoot";
    if (hit.type === "settingsRoot") return "settingsRoot";
    if (hit.type === "chatRoot") return "chatRoot";
    if (hit.type === "chatBubble") return `chatBubble:${hit.messageId}`;
    if (hit.type === "fileRenameInput") return `rename:${hit.path}`;
    if (hit.type === "searchInput") return "searchInput";
    if (hit.type === "chatInput") return "chatInput";
    if (hit.type === "textField") return `textField:${hit.field}`;
    if (hit.type === "settingsNumber") return `settingsNumber:${hit.key}`;
    if (hit.type === "editor") return `editor:${hit.groupId}`;
    if (hit.type === "editorGutter") return `editorGutter:${hit.groupId}:${hit.docId}`;
    if (hit.type === "tab" || hit.type === "tabClose") return `tab:${hit.groupId}:${hit.docId}`;
    if (hit.type === "tabBar") return `tabBar:${hit.groupId}`;
    if (hit.type === "tabOverflow") return `tabOverflow:${hit.groupId}`;
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
    if (hit.type === "chatInput") {
      this.focusMiniTarget("chat", hit.rect);
      if (selectTextFirst) this.selectChatInputWordFromPoint(point, hit.rect);
      else if (!this.pointHitsChatInputSelection(point, hit.rect)) this.setChatInputCursorFromPoint(point, hit.rect, false);
      this.openChatInputContextMenu(point);
      return true;
    }
    if (hit.type === "textField") {
      this.focusTextField(hit.field, hit.rect);
      if (selectTextFirst) this.selectTextFieldWordFromPoint(hit.field, point.x, hit.rect);
      else if (!this.pointHitsTextFieldSelection(hit.field, point.x, hit.rect)) this.setTextFieldCursorFromPoint(hit.field, point.x, hit.rect, false);
      this.openTextFieldContextMenu(point, hit.field);
      return true;
    }
    if (hit.type === "settingsNumber") {
      this.focusSettingsNumber(hit.key, hit.rect);
      if (selectTextFirst) this.selectSettingsNumberWordFromPoint(point.x, hit.rect);
      else if (!this.pointHitsSettingsNumberSelection(point.x, hit.rect)) this.setSettingsNumberCursorFromPoint(point.x, hit.rect, false);
      this.openSettingsNumberTextContextMenu(point, hit.key);
      return true;
    }
    if (hit.type === "file") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.selectFileTreePath(hit.path);
      this.openFileContextMenu(point, hit.path);
      return true;
    }
    if (hit.type === "folder") {
      if (this.renamePath && this.renamePath !== hit.path) void this.commitRename();
      this.selectFileTreePath(hit.path);
      this.openFolderContextMenu(point, hit.path);
      return true;
    }
    if (hit.type === "filesRoot") {
      if (this.renamePath) void this.commitRename();
      this.openRootContextMenu(point);
      return true;
    }
    if (hit.type === "settingsRoot") {
      this.openSettingsRootContextMenu(point);
      return true;
    }
    if (hit.type === "chatRoot") {
      this.openChatRootContextMenu(point);
      return true;
    }
    if (hit.type === "chatBubble") {
      this.openChatBubbleContextMenu(point, hit.messageId);
      return true;
    }
    if (hit.type === "tab" || hit.type === "tabClose") {
      this.openTabContextMenu(point, hit.groupId, hit.docId);
      return true;
    }
    if (hit.type === "tabBar") {
      this.openTabBarContextMenu(point, hit.groupId);
      return true;
    }
    if (hit.type === "tabOverflow") {
      this.openTabOverflowMenu(hit.groupId, hit.rect);
      return true;
    }
    if (hit.type === "editorGutter") {
      this.openGutterContextMenu(point, hit.groupId, hit.docId);
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
      this.selectActiveDocumentInFileTree();
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
  closeContextMenuForScroll() {
    if (!this.contextMenu) return;
    this.contextMenu = null;
    this.contextMenuHover = null;
  }
  closeContextMenuForTextInput() {
    if (!this.contextMenu) return;
    this.contextMenu = null;
    this.contextMenuHover = null;
  }
  openEditorContextMenu(point, group, doc) {
    const selected = doc.hasSelection();
    const editable = !doc.readOnly;
    this.contextMenu = this.makeContextMenu(point, { type: "editor", groupId: group.id, docId: doc.id }, [
      { command: "cut", label: "Cut", enabled: selected && editable },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: editable },
      ...this.mobileSystemClipboardEntries(selected, editable),
      ...this.undoRedoContextEntries(doc.canUndo() && editable, doc.canRedo() && editable)
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openGutterContextMenu(point, groupId, docId) {
    this.contextMenu = this.makeContextMenu(point, { type: "gutter", groupId, docId }, [
      { command: "toggleLineNumbers", label: this.settings.showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openTabContextMenu(point, groupId, docId) {
    const group = this.groupById(groupId);
    const entries = [
      { command: "save", label: "Save", enabled: !this.isSettingsTab(docId) && !this.docs.get(docId)?.readOnly },
      { separator: true },
      { command: "close", label: "Close", enabled: true },
      { command: "closeOthers", label: "Close Others", enabled: group.tabs.some((id) => id !== docId) },
      { separator: true },
      this.isSettingsTab(docId) ? { command: "resetSettings", label: "Reset Settings", enabled: true } : { command: "findInFile", label: "Find in File", enabled: true }
    ];
    this.contextMenu = this.makeContextMenu(point, { type: "tab", groupId, docId }, entries);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openTabBarContextMenu(point, groupId) {
    const group = this.groupById(groupId);
    this.contextMenu = this.makeContextMenu(point, { type: "tabBar", groupId }, [
      { command: "newFile", label: "New File", enabled: true },
      { command: "uploadFile", label: "Upload File", enabled: true },
      { command: "closeAll", label: "Close All", enabled: group.tabs.length > 0 }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openTabOverflowMenu(groupId, buttonRect) {
    const group = this.groupById(groupId);
    const tabRect = { x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: this.ui(32) };
    const layout = this.tabLayoutForGroup(group, tabRect);
    const visibleStart = layout.scroll;
    const visibleEnd = layout.scroll + layout.stripRect.w;
    const hidden = layout.items.filter((item) => item.start < visibleStart || item.end > visibleEnd);
    const entries = (hidden.length ? hidden : layout.items).map((item) => ({
      command: tabOverflowCommand(item.docId),
      label: item.label,
      enabled: true
    }));
    const width = Math.min(this.ui(320), Math.max(this.ui(190), ...entries.map((entry) => "separator" in entry ? 0 : this.renderer.measureText(entry.label, "ui") + this.ui(28))));
    this.contextMenu = this.makeContextMenu(
      { x: buttonRect.x, y: buttonRect.y + buttonRect.h },
      { type: "tabOverflow", groupId },
      entries,
      { x: buttonRect.x + buttonRect.w - width, y: buttonRect.y + buttonRect.h, w: width }
    );
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
      { command: "createFolder", label: "Create Folder", enabled: true },
      { command: "uploadFile", label: "Upload File", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openRootContextMenu(point) {
    this.contextMenu = this.makeContextMenu(point, { type: "root", path: "/" }, [
      { command: "createFile", label: "Create File", enabled: true },
      { command: "createFolder", label: "Create Folder", enabled: true },
      { command: "uploadFile", label: "Upload File", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openSettingsRootContextMenu(point) {
    this.contextMenu = this.makeContextMenu(point, { type: "settingsRoot" }, [
      { command: "resetSettings", label: "Reset Settings", enabled: true }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openChatRootContextMenu(point) {
    this.contextMenu = this.makeContextMenu(point, { type: "chatRoot" }, [
      { command: "exportChat", label: "Export Chat", enabled: this.chat.visibleMessages().length > 0 },
      { command: "debugChat", label: "Debug Chat", enabled: this.chat.visibleMessages().length > 0 },
      { command: "clearChat", label: "Clear Chat", enabled: this.chat.messages.length > 0 && !this.chat.running },
      { command: "compactChat", label: "Compact", enabled: this.chat.messages.length > 0 && !this.chat.running }
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openChatBubbleContextMenu(point, messageId) {
    const hasBubble = Boolean(this.chatDisplayMessages().find((msg) => msg.id === messageId));
    const hasChat = this.chatDisplayMessages().length > 0;
    const entries = [
      { command: "copyBubble", label: "Copy Bubble", enabled: hasBubble },
      { command: "copyChat", label: "Copy Chat", enabled: hasChat },
      { command: "clearChat", label: "Clear Chat", enabled: this.chat.messages.length > 0 && !this.chat.running }
    ];
    if (isMobileWebKit()) {
      entries.push(
        { separator: true },
        { command: "systemCopyBubble", label: "System Copy Bubble", enabled: hasBubble },
        { command: "systemCopyChat", label: "System Copy Chat", enabled: hasChat }
      );
    }
    this.contextMenu = this.makeContextMenu(point, { type: "chatBubble", messageId }, entries, { w: this.ui(isMobileWebKit() ? 188 : 144) });
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openRenameTextContextMenu(point, path) {
    const selected = this.renameBuffer.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "rename", path }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true },
      ...this.mobileSystemClipboardEntries(selected),
      ...this.undoRedoContextEntries(this.renameBuffer.canUndo(), this.renameBuffer.canRedo())
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openSearchTextContextMenu(point) {
    const selected = this.searchBuffer.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "search" }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true },
      ...this.mobileSystemClipboardEntries(selected),
      ...this.undoRedoContextEntries(this.searchBuffer.canUndo(), this.searchBuffer.canRedo())
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openChatInputContextMenu(point) {
    const selected = this.chatDraft.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "chatInput" }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true },
      ...this.mobileSystemClipboardEntries(selected),
      ...this.undoRedoContextEntries(this.chatDraft.canUndo(), this.chatDraft.canRedo())
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openTextFieldContextMenu(point, field) {
    const buffer = this.bufferForTextField(field);
    const selected = buffer.hasSelection();
    const scope = field === "search" ? { type: "search" } : { type: "textField", field };
    this.contextMenu = this.makeContextMenu(point, scope, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true },
      ...this.mobileSystemClipboardEntries(selected),
      ...this.undoRedoContextEntries(buffer.canUndo(), buffer.canRedo())
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  openSettingsNumberTextContextMenu(point, key) {
    const selected = this.settingsNumberBuffer.hasSelection();
    this.contextMenu = this.makeContextMenu(point, { type: "settingsNumber", key }, [
      { command: "cut", label: "Cut", enabled: selected },
      { command: "copy", label: "Copy", enabled: selected },
      { command: "paste", label: "Paste", enabled: true },
      ...this.mobileSystemClipboardEntries(selected),
      ...this.undoRedoContextEntries(this.settingsNumberBuffer.canUndo(), this.settingsNumberBuffer.canRedo())
    ]);
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  mobileSystemClipboardEntries(selected, pasteEnabled = true) {
    return isMobileWebKit() ? [
      { separator: true },
      { command: "systemCopy", label: "System Copy", enabled: selected },
      { command: "systemPaste", label: "System Paste", enabled: pasteEnabled }
    ] : [];
  }
  undoRedoContextEntries(canUndo, canRedo) {
    if (!canUndo && !canRedo) return [];
    const entries = [{ separator: true }];
    if (canUndo) entries.push({ command: "undo", label: "Undo", enabled: true });
    if (canRedo) entries.push({ command: "redo", label: "Redo", enabled: true });
    return entries;
  }
  makeContextMenu(point, scope, entries, layout = {}) {
    const vp = this.viewport.get();
    const pad = this.ui(CONTEXT_MENU_PAD);
    const width = layout.w ?? this.ui(CONTEXT_MENU_WIDTH);
    const rowH = this.ui(CONTEXT_MENU_ROW_H);
    const separatorH = this.ui(CONTEXT_MENU_SEPARATOR_H);
    const menuH = pad * 2 + entries.reduce((sum, entry) => sum + ("separator" in entry ? separatorH : rowH), 0);
    const x = clamp(layout.x ?? point.x, 0, Math.max(0, vp.cssWidth - width - 1));
    const y = clamp(layout.y ?? point.y, 0, Math.max(0, vp.cssHeight - menuH - 1));
    const rect = { x, y, w: width, h: menuH };
    const items = [];
    let rowY = y + pad;
    for (const entry of entries) {
      if ("separator" in entry) {
        items.push({ kind: "separator", rect: { x: x + pad + this.ui(8), y: rowY + Math.floor(separatorH / 2), w: width - pad * 2 - this.ui(16), h: 1 } });
        rowY += separatorH;
      } else {
        items.push({
          kind: "item",
          ...entry,
          rect: { x: x + pad, y: rowY, w: width - pad * 2, h: rowH }
        });
        rowY += rowH;
      }
    }
    return { scope, rect, items };
  }
  openModal(modal) {
    this.contextMenu = null;
    this.contextMenuHover = null;
    this.revokeDownloadReadyModal();
    this.modal = modal;
    this.modalHover = null;
    this.input.blur();
    this.scheduleDraw();
  }
  closeModal() {
    if (!this.modal) return;
    this.revokeDownloadReadyModal();
    this.modal = null;
    this.modalHover = null;
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  async openDirtyCloseModal(doc) {
    const label = this.documentLabel(doc);
    const savePath = doc.path ? void 0 : await this.savePathForUntitledDocument(doc);
    this.openModal({
      kind: "dirtyClose",
      title: "Save before closing?",
      message: `${label} has unsaved changes.`,
      detail: savePath ? `Save will create ${savePath} in the root folder.` : "Save your changes before closing this tab?",
      docId: doc.id,
      savePath,
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
  async openDirtyDownloadModal(doc) {
    const label = this.documentLabel(doc);
    const savePath = doc.path ? void 0 : await this.savePathForUntitledDocument(doc);
    this.openModal({
      kind: "dirtyDownload",
      title: "Save before downloading?",
      message: `${label} has unsaved changes.`,
      detail: savePath ? `Save will create ${savePath} in the root folder. Choose Don't Save to omit this memory-only file from the zip.` : "Saved files are included in the zip. Choose Don't Save to export the last saved version.",
      docId: doc.id,
      savePath,
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
  openZipProgressModal(message, detail, progress) {
    this.openModal({
      kind: "zipProgress",
      title: "Preparing download",
      message,
      detail,
      progress,
      defaultAction: "cancel",
      cancelAction: "cancel",
      pending: true,
      buttons: []
    });
  }
  openCompactingModal() {
    this.openModal({
      kind: "compactProgress",
      title: "Compacting conversation",
      message: "Summarizing the chat history.",
      detail: "The editor will continue when compaction is done.",
      defaultAction: "cancel",
      cancelAction: "cancel",
      pending: true,
      buttons: []
    });
  }
  closeCompactingModal() {
    if (this.modal?.kind !== "compactProgress") return;
    this.modal = null;
    this.modalHover = null;
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  openDownloadReadyModal(url, filename, fileCount, byteLength) {
    this.openModal({
      kind: "downloadReady",
      title: "Download ready",
      message: `${filename} is ready.`,
      detail: `${fileCount} file${fileCount === 1 ? "" : "s"} \u2022 ${formatBytes(byteLength)}`,
      url,
      filename,
      defaultAction: "download",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("download", "Download", "primary"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  openToolCallLimitModal(limit, used) {
    return new Promise((resolve) => {
      this.openModal({
        kind: "toolCallLimit",
        title: "Max tool calls reached",
        message: `This turn has used ${used} tool call${used === 1 ? "" : "s"}.`,
        detail: `The per-turn limit is ${limit}. Choose whether this turn can keep using tools.`,
        limit,
        used,
        resolve,
        defaultAction: "allowMore",
        cancelAction: "stopToolCalls",
        pending: false,
        buttons: [
          modalButton("allowMore", `Allow ${limit} more`, "primary"),
          modalButton("allowAll", "Allow all", "secondary"),
          modalButton("stopToolCalls", "Stop tool calls", "danger")
        ]
      });
    });
  }
  openDuplicateToolCallModal(call) {
    return new Promise((resolve) => {
      this.openModal({
        kind: "duplicateToolCall",
        title: "Duplicate tool call detected",
        message: `The assistant requested ${call.name} with the same arguments twice in a row.`,
        detail: `Arguments: ${formatToolArgsForModal(call.args)}`,
        call,
        resolve,
        defaultAction: "breakDuplicateTool",
        cancelAction: "breakDuplicateTool",
        pending: false,
        buttons: [
          modalButton("allowDuplicateTool", "Allow", "primary"),
          modalButton("breakDuplicateTool", "Break", "danger")
        ]
      });
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
  openClearFileSystemModal() {
    this.openModal({
      kind: "clearFileSystem",
      title: "Clear file system?",
      message: "Delete every file and folder in this workspace?",
      detail: "This closes all open tabs and removes the IndexedDB file tree. This cannot be undone.",
      defaultAction: "delete",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("delete", "Clear", "danger"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  openClearChatModal() {
    this.openModal({
      kind: "clearChat",
      title: "Clear chat?",
      message: "Remove every message from the current chat?",
      detail: "This clears the visible conversation and the agent context for future turns.",
      defaultAction: "clearChat",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("clearChat", "Clear", "danger"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  openZipImportModal(file) {
    this.openModal({
      kind: "zipImport",
      title: "Import workspace zip?",
      message: `${file.name} is a zip file.`,
      detail: "Replace clears the current project before importing. Append adds the zip contents to the current project.",
      file,
      defaultAction: "append",
      cancelAction: "cancel",
      pending: false,
      buttons: [
        modalButton("replace", "Replace", "danger"),
        modalButton("append", "Append", "primary"),
        modalButton("cancel", "Cancel", "secondary")
      ]
    });
  }
  async runModalAction(action) {
    const modal = this.modal;
    const button = modal?.buttons.find((candidate) => candidate.action === action);
    if (!modal || !button?.enabled || modal.pending) return;
    if (modal.kind === "downloadReady" && action === "download") {
      this.startBrowserDownload(modal);
      return;
    }
    if (modal.kind === "toolCallLimit") {
      this.runToolCallLimitModalAction(modal, action);
      return;
    }
    if (modal.kind === "duplicateToolCall") {
      this.runDuplicateToolCallModalAction(modal, action);
      return;
    }
    if (modal.kind === "dirtyDownload" && action === "cancel") {
      modal.pending = true;
      this.scheduleDraw();
      try {
        await this.runDirtyDownloadModalAction(modal, "discard");
      } catch (error) {
        if (this.modal !== modal) throw error;
        modal.pending = false;
        this.statusText = error instanceof Error ? error.message : "Operation failed";
        this.scheduleDraw();
      }
      return;
    }
    if (action === "cancel") {
      this.pendingCloseQueue = [];
      this.pendingDownloadDirtyQueue = [];
      this.downloadInProgress = false;
      this.statusText = "Canceled";
      this.closeModal();
      return;
    }
    modal.pending = true;
    this.scheduleDraw();
    try {
      if (modal.kind === "dirtyClose") await this.runDirtyCloseModalAction(modal, action);
      else if (modal.kind === "dirtyDownload") await this.runDirtyDownloadModalAction(modal, action);
      else if (modal.kind === "deleteFolder") await this.runDeleteFolderModalAction(modal, action);
      else if (modal.kind === "clearFileSystem") await this.runClearFileSystemModalAction(modal, action);
      else if (modal.kind === "clearChat") await this.runClearChatModalAction(modal, action);
      else if (modal.kind === "zipImport") await this.runZipImportModalAction(modal, action);
    } catch (error) {
      if (this.modal !== modal) throw error;
      modal.pending = false;
      this.statusText = error instanceof Error ? error.message : "Operation failed";
      this.scheduleDraw();
    }
  }
  runToolCallLimitModalAction(modal, action) {
    const decision = action === "allowAll" ? "allowAll" : action === "allowMore" ? "allowMore" : "stop";
    modal.resolve(decision);
    this.statusText = decision === "allowAll" ? "Tool calls unlimited for this turn" : decision === "allowMore" ? `Allowed ${modal.limit} more tool calls` : "Tool calls stopped";
    this.closeModal();
  }
  runDuplicateToolCallModalAction(modal, action) {
    const decision = action === "allowDuplicateTool" ? "allow" : "break";
    modal.resolve(decision);
    this.statusText = decision === "allow" ? `Allowed duplicate ${modal.call.name}` : `Broke duplicate ${modal.call.name}`;
    this.closeModal();
  }
  async runDirtyCloseModalAction(modal, action) {
    const doc = this.docs.get(modal.docId);
    if (!doc) {
      this.closeModal();
      return;
    }
    if (action !== "save" && action !== "discard") return;
    if (action === "save") await this.saveDocument(doc, modal.savePath);
    const path = doc.path;
    const label = path ?? this.documentLabel(doc);
    this.modal = null;
    this.modalHover = null;
    this.closeTab(doc.id);
    if (action === "discard") {
      if (path) this.docs.removePath(path);
      else this.forgetUntitledDocument(doc.id);
    }
    this.statusText = action === "save" ? `Saved and closed ${path ?? label}` : `Closed ${label} without saving`;
    if (this.pendingCloseQueue.length > 0) {
      await this.closeNextPendingTab();
      return;
    }
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.scheduleDraw();
  }
  async runDirtyDownloadModalAction(modal, action) {
    const doc = this.docs.get(modal.docId);
    if (!doc) {
      this.modal = null;
      this.modalHover = null;
      await this.openNextDownloadDirtyModal();
      return;
    }
    if (action !== "save" && action !== "discard") return;
    if (action === "save") await this.saveDocument(doc, modal.savePath);
    this.modal = null;
    this.modalHover = null;
    this.statusText = action === "save" ? `Saved ${doc.path ?? this.documentLabel(doc)}` : `Skipped ${doc.path ?? this.documentLabel(doc)}`;
    await this.openNextDownloadDirtyModal();
  }
  async runDeleteFolderModalAction(modal, action) {
    if (action !== "delete") return;
    await this.deleteFolderNow(modal.path);
    if (this.modal === modal) {
      this.modal = null;
      this.modalHover = null;
      if (this.activeDoc()) this.focusEditor();
      else this.input.blur();
      this.scheduleDraw();
    }
  }
  async runClearFileSystemModalAction(modal, action) {
    if (action !== "delete") return;
    await this.clearFileSystemNow();
    if (this.modal === modal) {
      this.modal = null;
      this.modalHover = null;
      this.input.blur();
      this.scheduleDraw();
    }
  }
  async runClearChatModalAction(modal, action) {
    if (action !== "clearChat" || this.chat.running) return;
    await this.clearChatNow();
    if (this.modal === modal) {
      this.modal = null;
      this.modalHover = null;
      if (this.activeDoc()) this.focusEditor();
      else this.input.blur();
      this.scheduleDraw();
    }
  }
  async runZipImportModalAction(modal, action) {
    if (action !== "replace" && action !== "append") return;
    const mode = action;
    const file = modal.file;
    this.modal = null;
    this.modalHover = null;
    await this.importWorkspaceZip(file, mode);
  }
  startRename(path, rect) {
    this.closeContextMenu();
    this.renamePath = normalizePath(path);
    this.selectFileTreePath(this.renamePath);
    const name = basename(path);
    const selectedEnd = fileStemSelectionEnd(name);
    this.renameBuffer.text = name;
    this.renameBuffer.anchor = 0;
    this.renameBuffer.cursor = selectedEnd;
    this.renameBuffer.scrollX = 0;
    this.renameBuffer.clearUndoHistory();
    this.statusText = `Renaming ${path}`;
    this.draw();
    this.focusRename(rect ?? this.renameInputRect() ?? void 0);
    this.scheduleDraw();
  }
  primeRenameKeyboardForTouch() {
    if (!isIOSDevice() && !this.isMobileContextMode()) return;
    this.beginTouchKeyboardStabilization();
    this.input.focusEditor(this.renameTarget(), this.renameInputRect() ?? { x: this.ui(56), y: this.ui(40), w: Math.max(this.ui(80), this.sidebarWidth - this.ui(20)), h: this.ui(24) });
    this.resetCaretBlink();
  }
  focusRename(rect) {
    this.input.focusEditor(this.renameTarget(), rect ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 24 });
    this.resetCaretBlink();
    this.requestFocusedInputReveal();
  }
  cancelRename() {
    if (!this.renamePath) return;
    this.renamePath = null;
    this.renameSelecting = false;
    this.renameBuffer.text = "";
    this.renameBuffer.cursor = 0;
    this.renameBuffer.anchor = 0;
    this.renameBuffer.scrollX = 0;
    this.statusText = "Rename canceled";
    this.focusEditor();
    this.scheduleDraw();
  }
  async commitRename() {
    const oldPath = this.renamePath;
    if (!oldPath) return false;
    const name = this.renameBuffer.text.trim();
    if (!isValidFileName(name)) {
      this.statusText = invalidFileNameCharacterRanges(this.renameBuffer.text).length ? "File name contains invalid characters" : "File name is not valid";
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
    this.remapFileTreeSelection(oldPath, newPath);
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
    const offset = x - (rect.x + this.ui(5)) + this.renameBuffer.scrollX;
    const col = this.columnFromTextOffset(this.renameBuffer.text, offset, "ui");
    this.renameBuffer.cursor = col;
    if (!extend) this.renameBuffer.anchor = col;
    this.revealMiniBufferCaret(this.renameBuffer, rect, this.ui(5));
    this.resetCaretBlink();
  }
  selectRenameWordFromPoint(x, rect) {
    const offset = x - (rect.x + this.ui(5)) + this.renameBuffer.scrollX;
    const text = this.renameBuffer.text;
    if (!text) return;
    const col = this.columnFromTextOffset(text, offset, "ui");
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
    this.revealMiniBufferCaret(this.renameBuffer, rect, this.ui(5));
    this.resetCaretBlink();
  }
  pointHitsRenameSelection(x, rect) {
    if (!this.renameBuffer.hasSelection()) return false;
    const start = Math.min(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const end = Math.max(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const textX = rect.x + this.ui(5) - this.renameBuffer.scrollX;
    const startX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  renameInputRect() {
    return this.hits.find((hit) => hit.type === "fileRenameInput")?.rect ?? null;
  }
  setSearchCursorFromPoint(x, rect, extend) {
    const offset = x - (rect.x + this.ui(8)) + this.searchBuffer.scrollX;
    const col = this.columnFromTextOffset(this.searchBuffer.text, offset, "ui");
    this.searchBuffer.cursor = col;
    if (!extend) this.searchBuffer.anchor = col;
    this.revealMiniBufferCaret(this.searchBuffer, rect, this.ui(8));
    this.resetCaretBlink();
  }
  selectSearchWordFromPoint(x, rect) {
    const offset = x - (rect.x + this.ui(8)) + this.searchBuffer.scrollX;
    const text = this.searchBuffer.text;
    if (!text) return;
    const col = this.columnFromTextOffset(text, offset, "ui");
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
    this.revealMiniBufferCaret(this.searchBuffer, rect, this.ui(8));
    this.resetCaretBlink();
  }
  pointHitsSearchSelection(x, rect) {
    if (!this.searchBuffer.hasSelection()) return false;
    const start = Math.min(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const end = Math.max(this.searchBuffer.anchor, this.searchBuffer.cursor);
    const textX = rect.x + this.ui(8) - this.searchBuffer.scrollX;
    const startX = textX + this.renderer.measureText(this.searchBuffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(this.searchBuffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  searchInputRect() {
    return this.textFieldRect("search") ?? this.hits.find((hit) => hit.type === "searchInput")?.rect ?? null;
  }
  setChatInputCursorFromPoint(point, rect, extend) {
    const doc = this.chatDraft;
    const position = this.chatInputPositionFromPoint(point, rect);
    doc.setSelection(extend ? doc.selection.anchor : position, position);
    this.ensureChatInputCaretVisible(rect);
    this.resetCaretBlink();
  }
  selectChatInputWordFromPoint(point, rect) {
    const doc = this.chatDraft;
    const position = this.chatInputPositionFromPoint(point, rect);
    const lineIndex = position.line;
    const line = doc.lines[lineIndex] ?? "";
    if (!line) {
      doc.setSelection({ line: lineIndex, col: 0 });
      this.resetCaretBlink();
      return;
    }
    const col = position.col;
    let index = clamp(col, 0, Math.max(0, line.length - 1));
    if (!isWordChar(line.charAt(index)) && col > 0 && isWordChar(line.charAt(col - 1))) index = col - 1;
    let start = index;
    let end = index + 1;
    if (isWordChar(line.charAt(index))) {
      while (start > 0 && isWordChar(line.charAt(start - 1))) start--;
      while (end < line.length && isWordChar(line.charAt(end))) end++;
    }
    doc.setSelection({ line: lineIndex, col: start }, { line: lineIndex, col: end });
    this.ensureChatInputCaretVisible(rect);
    this.resetCaretBlink();
  }
  pointHitsChatInputSelection(point, rect) {
    const doc = this.chatDraft;
    if (!doc.hasSelection()) return false;
    const metrics = this.chatInputMetrics(rect);
    const content = metrics.content;
    const lineH = this.renderer.lineHeight("ui");
    const visualIndex = clamp(Math.floor((point.y - content.y + this.chatInputScrollY) / lineH), 0, metrics.visualLines.length - 1);
    const visualLine = metrics.visualLines[visualIndex];
    const line = visualLine.line;
    const ordered = doc.getOrderedSelection();
    if (line < ordered.start.line || line > ordered.end.line) return false;
    const text = doc.lines[line] ?? "";
    const start = Math.max(visualLine.start, ordered.start.line === line ? ordered.start.col : 0);
    const end = Math.min(visualLine.end, ordered.end.line === line ? ordered.end.col : text.length);
    if (end <= start) return false;
    const sx = content.x + this.renderer.measureText(text.slice(visualLine.start, start), "ui");
    const ex = content.x + this.renderer.measureText(text.slice(visualLine.start, end), "ui");
    return point.x >= sx && point.x <= Math.max(sx + 2, ex);
  }
  ensureChatInputCaretVisible(rect) {
    const metrics = this.chatInputMetrics(rect);
    const content = metrics.content;
    const lineH = this.renderer.lineHeight("ui");
    const visual = this.chatInputVisualPositionForDocPosition(this.chatDraft.selection.head, metrics.visualLines);
    const caretTop = visual.index * lineH;
    const caretBottom = caretTop + lineH;
    const margin = Math.min(lineH, Math.max(0, content.h / 3));
    let scroll = this.chatInputScrollY;
    if (caretTop < scroll + margin) scroll = caretTop - margin;
    else if (caretBottom > scroll + content.h - margin) scroll = caretBottom - content.h + margin;
    this.chatInputScrollY = clamp(scroll, 0, Math.max(0, metrics.contentHeight - metrics.viewport.h));
  }
  chatInputCaretRect(input) {
    return this.chatInputPositionRect(input, this.chatDraft.selection.head);
  }
  chatInputPositionRect(input, pos) {
    const metrics = this.chatInputMetrics(input);
    const content = metrics.content;
    const lineH = this.renderer.lineHeight("ui");
    const clamped = this.chatDraft.clampPosition(pos);
    const line = this.chatDraft.lines[clamped.line] ?? "";
    const visual = this.chatInputVisualPositionForDocPosition(clamped, metrics.visualLines);
    const x = content.x + this.renderer.measureText(line.slice(visual.line.start, clamped.col), "ui");
    const y = content.y + visual.index * lineH - this.chatInputScrollY + this.ui(2);
    return { x, y, w: 1.5, h: lineH };
  }
  chatInputPositionFromPoint(point, rect) {
    const metrics = this.chatInputMetrics(rect);
    const content = metrics.content;
    const lineH = this.renderer.lineHeight("ui");
    const visualIndex = clamp(Math.floor((point.y - content.y + this.chatInputScrollY) / lineH), 0, metrics.visualLines.length - 1);
    const visualLine = metrics.visualLines[visualIndex];
    const col = visualLine.start + this.columnFromTextOffset(visualLine.text, point.x - content.x, "ui");
    return this.chatDraft.clampPosition({ line: visualLine.line, col: clamp(col, visualLine.start, visualLine.end) });
  }
  bufferForTextField(field) {
    if (field === "search") return this.searchBuffer;
    if (field === "projectReplace") return this.projectReplaceBuffer;
    if (isSettingTextField(field)) return this.settingsTextBuffers[field];
    const findState = this.activeFindState();
    if (field === "find") return findState?.findBuffer ?? this.inactiveFindBuffer;
    return findState?.replaceBuffer ?? this.inactiveFindReplaceBuffer;
  }
  afterTextFieldChanged(field) {
    if (isSettingTextField(field)) {
      if (field === "aiBaseUrl" || field === "aiApiKey") this.markAiEndpointEdited();
      this.scheduleDraw();
      return;
    }
    if (field === "search") {
      void this.runSearch();
      return;
    }
    if (field === "find") {
      this.selectDocumentFindMatch(1, true);
    }
  }
  markAiEndpointEdited() {
    if (this.aiConnectionStatus.state === "idle" && !this.aiEndpointFieldState) return;
    this.aiConnectionStatus = { state: "idle", message: "Server settings changed. Check server again." };
    this.aiEndpointFieldState = null;
  }
  syncSettingsTextBufferFromConfig(field) {
    const config = loadAiEndpointConfig();
    const buffer = this.settingsTextBuffers[field];
    if (field === "aiBaseUrl") buffer.text = config.apiBaseUrl;
    else if (field === "aiApiKey") buffer.text = config.apiKey;
    else if (field === "aiModel") buffer.text = config.model;
    else buffer.text = config.maxContextTokens ? String(config.maxContextTokens) : "";
    buffer.cursor = buffer.text.length;
    buffer.anchor = buffer.cursor;
    buffer.scrollX = 0;
    buffer.clearUndoHistory();
  }
  setTextFieldCursorFromPoint(field, x, rect, extend) {
    const buffer = this.bufferForTextField(field);
    const offset = x - (rect.x + this.ui(8)) + buffer.scrollX;
    const col = this.columnFromTextOffset(buffer.text, offset, "ui");
    buffer.cursor = col;
    if (!extend) buffer.anchor = col;
    this.revealMiniBufferCaret(buffer, rect, this.ui(8));
    this.resetCaretBlink();
  }
  selectTextFieldWordFromPoint(field, x, rect) {
    const buffer = this.bufferForTextField(field);
    const offset = x - (rect.x + this.ui(8)) + buffer.scrollX;
    const text = buffer.text;
    if (!text) return;
    const col = this.columnFromTextOffset(text, offset, "ui");
    let index = clamp(col, 0, Math.max(0, text.length - 1));
    if (!isWordChar(text.charAt(index)) && col > 0 && isWordChar(text.charAt(col - 1))) index = col - 1;
    let start = index;
    let end = index + 1;
    if (isWordChar(text.charAt(index))) {
      while (start > 0 && isWordChar(text.charAt(start - 1))) start--;
      while (end < text.length && isWordChar(text.charAt(end))) end++;
    }
    buffer.anchor = start;
    buffer.cursor = end;
    this.revealMiniBufferCaret(buffer, rect, this.ui(8));
    this.resetCaretBlink();
  }
  pointHitsTextFieldSelection(field, x, rect) {
    const buffer = this.bufferForTextField(field);
    if (!buffer.hasSelection()) return false;
    const start = Math.min(buffer.anchor, buffer.cursor);
    const end = Math.max(buffer.anchor, buffer.cursor);
    const textX = rect.x + this.ui(8) - buffer.scrollX;
    const startX = textX + this.renderer.measureText(buffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(buffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  textFieldRect(field) {
    return this.hits.find((hit) => hit.type === "textField" && hit.field === field)?.rect ?? null;
  }
  bufferForTextSelectionHandleTarget(target) {
    if (target.type === "rename") return this.renameBuffer;
    if (target.type === "settingsNumber") return this.settingsNumberBuffer;
    return this.bufferForTextField(target.field);
  }
  focusTextSelectionHandleTarget(target, rect) {
    if (target.type === "rename") {
      this.focusRename(rect);
    } else if (target.type === "settingsNumber") {
      this.focusSettingsNumber(target.key, rect);
    } else if (target.type === "chatInput") {
      this.focusMiniTarget("chat", rect, true);
    } else {
      this.focusTextField(target.field, rect);
    }
  }
  textSelectionHandlePadX(target) {
    return target.type === "rename" ? this.ui(5) : this.ui(8);
  }
  textSelectionTargetLabel(target) {
    if (target.type === "rename") return target.path;
    if (target.type === "textField") return target.field;
    if (target.type === "settingsNumber") return target.key;
    return "chatInput";
  }
  isTextSelectionHandleTargetActive(target) {
    if (target.type === "rename") return this.renamePath === target.path;
    if (target.type === "settingsNumber") return this.activeSettingsNumber === target.key;
    if (target.type === "chatInput") return this.input.activeTarget?.kind === "chat";
    return this.input.activeTarget?.kind === target.field;
  }
  miniBufferColumnFromPoint(buffer, input, padX, x) {
    const offset = x - (input.x + padX) + buffer.scrollX;
    return this.columnFromTextOffset(buffer.text, offset, "ui");
  }
  miniBufferContentRect(input, padX) {
    return { x: input.x + padX, y: input.y, w: Math.max(1, input.w - padX * 2), h: input.h };
  }
  clampMiniBufferScroll(buffer, input, padX) {
    const content = this.miniBufferContentRect(input, padX);
    const maxScroll = Math.max(0, this.renderer.measureText(buffer.text, "ui") - content.w);
    buffer.scrollX = clamp(buffer.scrollX, 0, maxScroll);
  }
  revealMiniBufferCaret(buffer, input, padX) {
    const content = this.miniBufferContentRect(input, padX);
    const caretX = this.renderer.measureText(buffer.text.slice(0, buffer.cursor), "ui");
    const maxScroll = Math.max(0, this.renderer.measureText(buffer.text, "ui") - content.w);
    const margin = Math.min(this.ui(24), Math.max(0, content.w / 3));
    let scroll = buffer.scrollX;
    if (caretX < scroll + margin) scroll = caretX - margin;
    else if (caretX > scroll + content.w - margin) scroll = caretX - content.w + margin;
    buffer.scrollX = clamp(scroll, 0, maxScroll);
  }
  isTextFieldCaretVisible(field) {
    return this.input.activeTarget?.kind === field && (this.input.composing || this.isCaretBlinkOn());
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
  fileTreeSelectedPath() {
    const activePath = this.activeDoc()?.path;
    return this.selectedFileTreePath ?? (activePath && !this.isAiSpecialPath(activePath) ? activePath : null);
  }
  selectFileTreePath(path) {
    const next = path ? normalizePath(path) : null;
    if (this.selectedFileTreePath === next) return;
    this.selectedFileTreePath = next;
    this.scheduleDraw();
  }
  selectActiveDocumentInFileTree() {
    const path = this.activeDoc()?.path;
    if (path && !this.isAiSpecialPath(path)) this.selectFileTreePath(path);
  }
  syncFileTreeSelection() {
    const paths = new Set(this.treeNodes.map((node) => normalizePath(node.path)));
    if (this.selectedFileTreePath && !paths.has(this.selectedFileTreePath)) this.selectedFileTreePath = null;
    if (this.hoveredFileTreePath && !paths.has(this.hoveredFileTreePath)) this.hoveredFileTreePath = null;
  }
  remapFileTreeSelection(oldPath, newPath) {
    this.selectedFileTreePath = remapSelectedTreePath(this.selectedFileTreePath, oldPath, newPath);
    this.hoveredFileTreePath = remapSelectedTreePath(this.hoveredFileTreePath, oldPath, newPath);
  }
  clearFileTreeSelectionUnder(path) {
    if (this.selectedFileTreePath && isSameOrDescendant(this.selectedFileTreePath, path)) this.selectedFileTreePath = null;
    if (this.hoveredFileTreePath && isSameOrDescendant(this.hoveredFileTreePath, path)) this.hoveredFileTreePath = null;
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
  async saveDocument(doc, path = doc.path) {
    if (this.isAiSpecialDoc(doc)) {
      this.saveAiSpecialDocument(doc);
      return doc.path ?? this.documentLabel(doc);
    }
    if (doc.readOnly) {
      doc.markSaved();
      this.statusText = "File type not supported";
      this.scheduleDraw();
      return doc.path ?? this.documentLabel(doc);
    }
    const wasUntitled = !doc.path;
    const target = path ?? await this.savePathForUntitledDocument(doc);
    if (doc.path) await this.docs.save(doc);
    else await this.docs.saveAs(doc, target);
    if (wasUntitled) {
      this.untitledLabels.delete(doc.id);
      this.untitledPreferredNames.delete(doc.id);
      await this.refreshFiles();
    }
    this.scheduleDraw();
    return doc.path ?? target;
  }
  saveAiSpecialDocument(doc) {
    if (!doc.path) return false;
    const path = normalizePath(doc.path);
    const text = doc.getText();
    try {
      if (path === AI_SETTINGS_DOC_PATH) {
        const parsed = JSON.parse(text);
        saveAiEndpointConfig(parsed);
      } else if (path === AI_SYSTEM_PROMPT_DOC_PATH) {
        saveAiSystemPrompt(text);
      } else if (path === AI_TAG_TOOL_PROMPT_DOC_PATH) {
        saveAiTagToolPrompt(text);
      } else if (path === AI_HARMONY_TOOL_PROMPT_DOC_PATH) {
        saveAiHarmonyToolPrompt(text);
      } else if (path === AI_COMPACT_PROMPT_DOC_PATH) {
        saveAiCompactPrompt(text);
      } else {
        return false;
      }
      doc.markSaved();
      this.statusText = `Saved ${this.aiSpecialLabel(path)}`;
      this.scheduleDraw();
      return true;
    } catch (error) {
      this.statusText = `AI settings JSON is invalid: ${error instanceof Error ? error.message : String(error)}`;
      this.scheduleDraw();
      return false;
    }
  }
  afterDocumentMutated(doc) {
    if (!doc) return;
    this.scheduleDraw();
  }
  async savePathForUntitledDocument(doc) {
    const preferred = this.untitledPreferredNames.get(doc.id);
    if (preferred && isValidFileName(preferred)) {
      const candidate = joinPath("/", preferred);
      if (!await this.vfs.stat(candidate)) return candidate;
    }
    return this.nextCreatedPath("/", "file");
  }
  forgetUntitledDocument(docId) {
    this.untitledLabels.delete(docId);
    this.untitledPreferredNames.delete(docId);
    this.clearDocumentCaches(docId);
    this.docs.remove(docId);
  }
  async requestCloseTab(docId) {
    if (this.isSettingsTab(docId)) {
      this.closeTab(docId);
      return;
    }
    const doc = this.docs.get(docId);
    if (!doc) return;
    if (doc.dirty) {
      await this.openDirtyCloseModal(doc);
      return;
    }
    this.closeTab(docId);
    if (!doc.path) this.forgetUntitledDocument(doc.id);
  }
  async requestCloseTabs(docIds) {
    this.pendingCloseQueue = [...new Set(docIds)];
    await this.closeNextPendingTab();
  }
  async closeNextPendingTab() {
    while (this.pendingCloseQueue.length > 0) {
      const docId = this.pendingCloseQueue.shift();
      if (this.isSettingsTab(docId)) {
        if (this.groupContaining(docId)) this.closeTab(docId);
        continue;
      }
      const doc = this.docs.get(docId);
      if (!doc || !this.groupContaining(docId)) continue;
      if (doc.dirty) {
        await this.openDirtyCloseModal(doc);
        return;
      }
      this.closeTab(docId);
      if (!doc.path) this.forgetUntitledDocument(doc.id);
    }
  }
  async requestWorkspaceDownload() {
    if (this.downloadInProgress || this.modal) return;
    if (this.renamePath && !await this.commitRename()) return;
    this.pendingDownloadDirtyQueue = this.docs.all().filter((doc) => doc.dirty && !this.isAiSpecialDoc(doc)).map((doc) => doc.id);
    if (this.pendingDownloadDirtyQueue.length > 0) {
      await this.openNextDownloadDirtyModal();
      return;
    }
    await this.prepareWorkspaceDownload();
  }
  async openNextDownloadDirtyModal() {
    while (this.pendingDownloadDirtyQueue.length > 0) {
      const docId = this.pendingDownloadDirtyQueue.shift();
      const doc = this.docs.get(docId);
      if (!doc?.dirty) continue;
      await this.openDirtyDownloadModal(doc);
      return;
    }
    await this.prepareWorkspaceDownload();
  }
  async prepareWorkspaceDownload() {
    if (this.downloadInProgress) return;
    this.downloadInProgress = true;
    this.statusText = "Preparing download";
    this.openZipProgressModal("Reading workspace files...", "Starting", 0);
    await nextFrame();
    try {
      const zip = new import_jszip.default();
      const entries = await this.collectZipEntries("/");
      const files = entries.filter((entry) => entry.node.kind === "file");
      let readCount = 0;
      for (const entry of entries) {
        if (entry.node.kind === "dir") {
          zip.folder(entry.zipPath);
          continue;
        }
        readCount++;
        this.updateZipProgress("Reading workspace files...", `${readCount} of ${files.length}: ${entry.zipPath}`, files.length ? readCount / files.length * 0.72 : 0.72);
        const data = await this.vfs.readFile(entry.node.path);
        zip.file(entry.zipPath, data, { binary: true, date: new Date(entry.node.mtime) });
        if (readCount === files.length || readCount % 8 === 0) await nextFrame();
      }
      this.updateZipProgress("Compressing workspace...", "0%", 0.74);
      let lastProgressUpdate = 0;
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        platform: "UNIX"
      }, (metadata) => {
        const now = performance.now();
        if (metadata.percent < 100 && now - lastProgressUpdate < 80) return;
        lastProgressUpdate = now;
        this.updateZipProgress("Compressing workspace...", `${Math.round(metadata.percent)}%`, 0.74 + metadata.percent / 100 * 0.26);
      });
      const filename = `workspace-${downloadTimestamp()}.zip`;
      const url = URL.createObjectURL(blob);
      this.downloadInProgress = false;
      this.statusText = "Download ready";
      this.openDownloadReadyModal(url, filename, files.length, blob.size);
    } catch (error) {
      this.downloadInProgress = false;
      this.pendingDownloadDirtyQueue = [];
      this.closeModal();
      this.statusText = error instanceof Error ? error.message : "Could not prepare download";
      this.scheduleDraw();
    }
  }
  async collectZipEntries(path) {
    const entries = [];
    const children = await this.vfs.listDir(path);
    for (const node of children) {
      if (node.path === "/" || node.path.startsWith("/.slug-")) continue;
      const zipPath = node.path.slice(1);
      entries.push({ node, zipPath: node.kind === "dir" ? `${zipPath}/` : zipPath });
      if (node.kind === "dir") entries.push(...await this.collectZipEntries(node.path));
    }
    return entries;
  }
  updateZipProgress(message, detail, progress) {
    const modal = this.modal;
    if (modal?.kind === "zipProgress") {
      modal.message = message;
      modal.detail = detail;
      modal.progress = clamp(progress, 0, 1);
    }
    this.statusText = `${message} ${Math.round(clamp(progress, 0, 1) * 100)}%`;
    this.scheduleDraw();
  }
  async importWorkspaceZip(file, mode) {
    try {
      this.statusText = "Reading workspace zip...";
      this.scheduleDraw();
      await nextFrame();
      const entries = await this.loadZipWorkspaceEntries(file);
      if (mode === "replace") {
        this.statusText = "Replacing workspace...";
        this.scheduleDraw();
        await this.clearWorkspaceContents();
        this.resetEditorSession();
      } else {
        this.statusText = "Importing workspace...";
        this.scheduleDraw();
      }
      const result = await this.writeZipEntriesToWorkspace(entries);
      await this.refreshFiles();
      if (mode === "replace") this.input.blur();
      this.statusText = `${mode === "replace" ? "Replaced" : "Imported"} ${result.files} file${result.files === 1 ? "" : "s"} from ${file.name}`;
      this.scheduleDraw();
    } catch (error) {
      this.statusText = error instanceof Error ? error.message : "Could not import zip";
      this.scheduleDraw();
    }
  }
  async clearWorkspaceContents() {
    await this.vfs.remove("/", { recursive: true });
    await this.vfs.mkdir("/");
    this.expandedFolders.clear();
    this.knownFolders.clear();
  }
  resetEditorSession() {
    this.clearPersistedEditorSession();
    this.docs.clear();
    const group = makeGroup("group-main");
    this.groups = [group];
    this.dockRoot = { type: "leaf", group };
    this.activeGroupId = group.id;
    this.activeDocId = null;
    this.openTabs = [];
    this.scrollStates.clear();
    this.tabScrollStates.clear();
    this.pendingTabRevealIds.clear();
    this.documentWidthCache.clear();
    this.lineWidthCache.clear();
    this.highlightCache.clear();
    this.findStates.clear();
    this.untitledLabels.clear();
    this.untitledPreferredNames.clear();
    this.filesScrollY = 0;
    this.searchScrollY = 0;
    this.pendingCloseQueue = [];
    this.pendingDownloadDirtyQueue = [];
  }
  async loadZipWorkspaceEntries(file) {
    const zip = await import_jszip.default.loadAsync(await file.arrayBuffer());
    return Object.values(zip.files).map((entry) => ({ entry, path: pathForZipEntry(entry.name) })).filter((item) => Boolean(item.path));
  }
  async writeZipEntriesToWorkspace(entries) {
    let files = 0;
    let dirs = 0;
    let bytes = 0;
    for (const { entry, path } of entries) {
      if (entry.dir) {
        await this.vfs.mkdir(path);
        dirs++;
        continue;
      }
      const data = await entry.async("uint8array");
      await this.vfs.writeFile(path, data, guessMime2(path));
      files++;
      bytes += data.byteLength;
      if (files % 8 === 0) {
        this.statusText = `Imported ${files} file${files === 1 ? "" : "s"}...`;
        this.scheduleDraw();
        await nextFrame();
      }
    }
    return { files, dirs, bytes };
  }
  startBrowserDownload(modal) {
    const anchor = document.createElement("a");
    anchor.href = modal.url;
    anchor.download = modal.filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    const url = modal.url;
    this.modal = null;
    this.modalHover = null;
    this.statusText = `Downloaded ${modal.filename}`;
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
    this.scheduleDraw();
  }
  exportChatToDisk() {
    const filename = `chat-${downloadTimestamp()}.jsonl`;
    const blob = new Blob([this.chat.exportJsonl()], { type: "application/x-ndjson;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    this.statusText = `Exported ${filename}`;
    window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
    this.scheduleDraw();
  }
  debugChatToUntitled() {
    const text = this.chat.debugApiJsonl(this.aiRuntimeSettings(), this.settings.aiInsertEditorContext ? this.editorContextBundle() : null);
    const filename = `chat-debug-${downloadTimestamp()}.jsonl`;
    this.openUntitledDocument(this.activeGroupId, {
      label: "Debug Chat",
      text,
      preferredName: filename,
      dirty: true
    });
    this.statusText = "Opened chat debug JSONL";
    this.scheduleDraw();
  }
  chatTranscriptText(messages = this.chatDisplayMessages()) {
    return messages.map((msg) => {
      const label = msg.name ? `${this.chatRoleLabel(msg.role)}: ${msg.name}` : this.chatRoleLabel(msg.role);
      return `${label}
${msg.text}`;
    }).join("\n\n");
  }
  revokeDownloadReadyModal() {
    if (this.modal?.kind === "downloadReady") URL.revokeObjectURL(this.modal.url);
  }
  closeTab(docId) {
    const group = this.groupContaining(docId);
    if (!group) return;
    const label = this.tabLabel(docId);
    const index = group.tabs.indexOf(docId);
    group.tabs.splice(index, 1);
    this.findStates.delete(docId);
    if (group.activeDocId === docId) {
      group.activeDocId = group.tabs[index] ?? group.tabs[index - 1] ?? null;
    }
    this.pruneDockTree();
    if (this.activeDocId === docId) {
      const nextGroup = this.groups.find((item) => item.activeDocId) ?? this.groups[0];
      this.activeGroupId = nextGroup.id;
      this.activeDocId = nextGroup.activeDocId;
      if (this.activeDoc()) this.focusEditor();
      else this.input.blur();
    }
    this.syncOpenTabs();
    this.statusText = `Closed ${label}`;
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
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.syncOpenTabs();
    this.statusText = `Moving ${this.tabLabel(docId)}`;
    this.draw();
  }
  clampSidebarWidth(width) {
    const vp = this.viewport.get();
    const activityW = this.ui(48);
    const min = Math.min(this.ui(220), Math.max(this.ui(160), vp.cssWidth - activityW - this.ui(180)));
    const max = Math.max(min, Math.min(this.ui(560), vp.cssWidth - activityW - this.ui(180)));
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
  clearDocumentCaches(docId) {
    this.documentWidthCache.delete(docId);
    for (const key of [...this.lineWidthCache.keys()]) {
      if (key.startsWith(`${docId}:`)) this.lineWidthCache.delete(key);
    }
    for (const key of [...this.highlightCache.keys()]) {
      if (key.startsWith(`${docId}:`)) this.highlightCache.delete(key);
    }
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
    const scrollbarSize = this.editorScrollbarSize();
    return {
      x: rect.x,
      y: rect.y,
      w: Math.max(1, rect.w - (overflow.vertical ? scrollbarSize : 0)),
      h: Math.max(1, rect.h - (overflow.horizontal ? scrollbarSize : 0))
    };
  }
  editorScrollbarSize() {
    return this.ui(EDITOR_SCROLLBAR_SIZE);
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
    if (!this.settings.showLineNumbers) return 0;
    const digits = Math.max(EDITOR_GUTTER_MIN_DIGITS, String(Math.max(1, doc.lineCount())).length);
    return Math.ceil(this.renderer.measureText("9".repeat(digits), "gutter") + EDITOR_GUTTER_PAD_LEFT + EDITOR_GUTTER_PAD_RIGHT);
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
    const layoutKey = this.codeLayoutKey();
    const cached = this.documentWidthCache.get(doc.id);
    if (cached && cached.revision === doc.revision && cached.layoutKey === layoutKey) return cached.width;
    let maxLineWidth = 0;
    for (let lineIndex = 0; lineIndex < doc.lines.length; lineIndex++) {
      maxLineWidth = Math.max(maxLineWidth, this.lineWidthForDocLine(doc, lineIndex, layoutKey));
    }
    const width = maxLineWidth + EDITOR_TEXT_TRAILING_PAD_X;
    this.documentWidthCache.set(doc.id, { revision: doc.revision, layoutKey, width });
    return width;
  }
  lineWidthForDocLine(doc, lineIndex, layoutKey = this.codeLayoutKey()) {
    const text = doc.lines[lineIndex] ?? "";
    const key = `${doc.id}:${lineIndex}`;
    const hasNewlineMarker = this.settings.showWhitespace && lineIndex < doc.lineCount() - 1;
    const cacheText = hasNewlineMarker ? `${text}
` : text;
    const cached = this.lineWidthCache.get(key);
    if (cached && cached.layoutKey === layoutKey && cached.text === cacheText) return cached.width;
    const newlineMarkerWidth = hasNewlineMarker ? this.renderer.measureText("\\n", "code") : 0;
    const width = this.measureCodeText(text) + newlineMarkerWidth;
    this.lineWidthCache.set(key, { layoutKey, text: cacheText, width });
    if (this.lineWidthCache.size > 2e4) {
      const first = this.lineWidthCache.keys().next().value;
      if (first) this.lineWidthCache.delete(first);
    }
    return width;
  }
  codeLayoutKey() {
    return `${this.settings.fontSize}:${this.settings.monospacedFont ? 1 : 0}:${this.codeTabSpaces()}:${this.settings.useTabStops ? 1 : 0}:${this.settings.showWhitespace ? 1 : 0}`;
  }
  codeTabSpaces() {
    return clamp(Math.trunc(this.settings.tabSpaces), 1, 32);
  }
  editorIndentString() {
    return this.settings.useTabStops ? "	" : " ".repeat(this.codeTabSpaces());
  }
  codeTabWidthPx() {
    return Math.max(1, this.renderer.measureText(" ", "code") * this.codeTabSpaces());
  }
  codeAdvanceForText(text, startOffset = 0) {
    let offset = startOffset;
    for (const char of text) offset += this.codeAdvanceForChar(char, offset);
    return offset - startOffset;
  }
  codeAdvanceForChar(char, currentOffset) {
    if (char !== "	") return this.renderer.measureText(char, "code");
    const tabWidth = this.codeTabWidthPx();
    if (!this.settings.useTabStops) return tabWidth;
    return Math.max(1, Math.ceil((currentOffset + 1e-4) / tabWidth) * tabWidth - currentOffset);
  }
  measureCodeText(text) {
    return this.codeAdvanceForText(text, 0);
  }
  measureCodePrefix(text, col) {
    return this.measureCodeText(text.slice(0, col));
  }
  drawVisibleCodeText(text, baseX, y, color, startOffset, visibleStart, visibleEnd) {
    let offset = startOffset;
    let run = "";
    let runStartOffset = offset;
    const flush = () => {
      if (!run) return;
      this.renderer.text(run, baseX + runStartOffset, y, color, "code");
      run = "";
    };
    for (const char of text) {
      const advance = this.codeAdvanceForChar(char, offset);
      const nextOffset = offset + advance;
      if (nextOffset > visibleStart && offset < visibleEnd && char !== "	") {
        if (!run) runStartOffset = offset;
        run += char;
      } else {
        flush();
      }
      offset = nextOffset;
      if (offset > visibleEnd) {
        flush();
        return { endOffset: offset, clippedRight: true };
      }
    }
    flush();
    return { endOffset: offset, clippedRight: false };
  }
  drawWhitespaceForLine(text, lineIndex, lineCount, baseX, y, lineH, visibleStart, visibleEnd) {
    if (!this.settings.showWhitespace) return;
    const color = this.whitespaceMarkerColor();
    let offset = 0;
    for (const char of text) {
      const advance = this.codeAdvanceForChar(char, offset);
      const nextOffset = offset + advance;
      if (nextOffset > visibleStart && offset < visibleEnd) {
        if (char === " ") this.drawSpaceMarker(baseX + offset, baseX + nextOffset, y, lineH, color);
        else if (char === "	") this.drawTabMarker(baseX + offset, baseX + nextOffset, y, lineH, color);
      }
      offset = nextOffset;
      if (offset > visibleEnd) break;
    }
    if (lineIndex < lineCount - 1) {
      const markerWidth = this.renderer.measureText("\\n", "code");
      if (offset + markerWidth > visibleStart && offset < visibleEnd) this.renderer.text("\\n", baseX + offset, y + this.whitespaceNewlineYOffset(), color, "code");
    }
  }
  drawSpaceMarker(startX, endX, y, lineH, color) {
    const dotSize = Math.max(1.25, Math.min(2.25, this.renderer.lineHeight("code") * 0.11));
    const cx = (startX + endX) * 0.5;
    const cy = y + lineH * 0.66;
    this.renderer.rect({ x: cx - dotSize * 0.5, y: cy - dotSize * 0.5, w: dotSize, h: dotSize }, color);
  }
  whitespaceNewlineYOffset() {
    return this.ui(4);
  }
  drawTabMarker(startX, endX, y, lineH, color) {
    const pad = Math.max(2, Math.min(6, this.renderer.monoAdvance("code") * 0.22));
    const x0 = startX + pad;
    const x1 = endX - pad;
    if (x1 - x0 < 4) return;
    const lineWidth = Math.max(1, Math.min(1.5, this.renderer.lineHeight("code") * 0.08));
    const midY = y + lineH * 0.56;
    const head = Math.min(6, Math.max(3, (x1 - x0) * 0.32));
    this.renderer.line({ x: x0, y: midY }, { x: x1, y: midY }, lineWidth, color);
    this.renderer.line({ x: x1, y: midY }, { x: x1 - head, y: midY - head * 0.55 }, lineWidth, color);
    this.renderer.line({ x: x1, y: midY }, { x: x1 - head, y: midY + head * 0.55 }, lineWidth, color);
  }
  whitespaceMarkerColor() {
    return [theme.textDim[0], theme.textDim[1], theme.textDim[2], this.settings.theme === "light" ? 0.56 : 0.46];
  }
  tokensForLine(doc, lineIndex) {
    const text = doc.lines[lineIndex] ?? "";
    const key = `${doc.id}:${lineIndex}`;
    const cached = this.highlightCache.get(key);
    if (cached && cached.syntaxId === doc.syntaxId && cached.text === text) return cached.tokens;
    const tokens = this.highlighter.tokenizeLine(text, doc.syntaxId);
    this.highlightCache.set(key, { syntaxId: doc.syntaxId, text, tokens });
    if (this.highlightCache.size > 5e3) {
      const first = this.highlightCache.keys().next().value;
      if (first) this.highlightCache.delete(first);
    }
    return tokens;
  }
  normalizedWheelDelta(value, mode, rect) {
    if (mode === WheelEvent.DOM_DELTA_LINE) return value * this.renderer.lineHeight("code");
    if (mode === WheelEvent.DOM_DELTA_PAGE) return value * rect.h;
    return value;
  }
  tabRectForGroup(group) {
    return { x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: this.ui(32) };
  }
  tabGroupAtPoint(point) {
    return this.groups.find((group) => rectContains(this.tabRectForGroup(group), point.x, point.y));
  }
  setTabGroupScroll(group, value, layout = this.tabLayoutForGroup(group, this.tabRectForGroup(group))) {
    const current = this.tabScrollStates.get(group.id) ?? 0;
    const next = clamp(value, 0, layout.maxScroll);
    if (Math.abs(next - current) < 0.5) return false;
    this.tabScrollStates.set(group.id, next);
    return true;
  }
  scrollTabGroupFromWheel(group, event, point) {
    const layout = this.tabLayoutForGroup(group, this.tabRectForGroup(group));
    if (layout.maxScroll <= 0 || !rectContains(layout.stripRect, point.x, point.y)) return false;
    const primaryDelta = Math.abs(event.deltaX) > 0 ? event.deltaX : event.deltaY;
    const delta = this.normalizedWheelDelta(primaryDelta, event.deltaMode, layout.stripRect);
    this.setTabGroupScroll(group, layout.scroll + delta, layout);
    this.scheduleDraw();
    return true;
  }
  sidebarScrollRegionForPoint(point) {
    if (this.sidebarWidth <= 0) return null;
    const vp = this.viewport.get();
    const sidebarRect = { x: this.ui(48), y: 0, w: this.sidebarWidth, h: Math.max(0, vp.cssHeight - this.ui(24)) };
    if (!rectContains(sidebarRect, point.x, point.y)) return null;
    const body = this.sidebarPanelBodyRect(sidebarRect);
    if (this.sidebarMode === "files") return rectContains(body, point.x, point.y) ? { panel: "files", viewport: body } : null;
    if (this.sidebarMode === "settings") return rectContains(body, point.x, point.y) ? { panel: "settings", viewport: body } : null;
    if (this.sidebarMode !== "search") return null;
    const viewport = this.searchResultsViewport(body);
    return rectContains(viewport, point.x, point.y) ? { panel: "search", viewport } : null;
  }
  chatScrollRegionForPoint(point) {
    if (this.sidebarWidth <= 0 || this.sidebarMode !== "chat") return null;
    const hit = this.hitAt(point.x, point.y);
    if (hit?.type === "chatTranscript") return { panel: "chatTranscript", viewport: hit.rect };
    if (hit?.type === "chatInput") return { panel: "chatInput", viewport: hit.rect };
    if (hit?.type === "chatScrollbar") return { panel: hit.panel, viewport: hit.viewportRect };
    return null;
  }
  sidebarPanelBodyRect(rect) {
    const headerH = this.ui(PANEL_HEADER_H);
    return { x: rect.x, y: rect.y + headerH, w: rect.w, h: Math.max(0, rect.h - headerH) };
  }
  searchResultsViewport(body) {
    const controlsH = this.ui(8) + this.ui(28) + this.ui(14) + (this.searchReplaceExpanded ? this.ui(42) : 0);
    return { x: body.x, y: body.y + controlsH, w: body.w, h: Math.max(0, body.h - controlsH) };
  }
  chatPanelScrollY(panel) {
    return panel === "chatInput" ? this.chatInputScrollY : this.chatScrollY;
  }
  setChatPanelScrollY(panel, value, viewport) {
    const next = clamp(value, 0, this.maxChatScrollY(panel, viewport));
    if (panel === "chatInput") this.chatInputScrollY = next;
    else this.chatScrollY = next;
  }
  maxChatScrollY(panel, viewport) {
    const contentHeight = panel === "chatInput" ? this.chatInputMetrics(viewport).contentHeight : this.chatTranscriptContentHeight(Math.max(1, viewport.w - this.ui(12)));
    return Math.max(0, contentHeight - viewport.h);
  }
  fileTreeVisibleRowCount(entries = this.fileTreeEntries()) {
    let count = 0;
    for (const entry of entries) {
      count++;
      if (entry.type === "dir" && this.expandedFolders.has(entry.path)) count += this.fileTreeVisibleRowCount(entry.children);
    }
    return count;
  }
  fileTreeContentHeight() {
    const rowH = this.ui(22);
    const rowGap = this.ui(2);
    return this.ui(16) + this.fileTreeVisibleRowCount() * (rowH + rowGap);
  }
  searchResultsContentHeight() {
    return this.searchResults.length * this.ui(42);
  }
  maxSidebarScrollY(panel, viewport) {
    const contentHeight = panel === "files" ? this.fileTreeContentHeight() : panel === "settings" ? this.settingsContentHeight() : this.searchResultsContentHeight();
    return Math.max(0, contentHeight - viewport.h);
  }
  sidebarScrollY(panel) {
    return panel === "files" ? this.filesScrollY : panel === "settings" ? this.settingsScrollY : this.searchScrollY;
  }
  setSidebarScrollY(panel, value, viewport) {
    const next = clamp(value, 0, this.maxSidebarScrollY(panel, viewport));
    if (panel === "files") this.filesScrollY = next;
    else if (panel === "settings") this.settingsScrollY = next;
    else this.searchScrollY = next;
  }
  scrollSidebarPanel(panel, deltaY, viewport) {
    this.setSidebarScrollY(panel, this.sidebarScrollY(panel) + deltaY, viewport);
    this.scheduleDraw();
  }
  settingsViewportHeight(rect) {
    return Math.max(1, rect.h);
  }
  settingsContentHeight() {
    let y = this.ui(8);
    y += this.ui(30);
    if (this.settingsExpanded.has("visual")) y += this.ui(34) * 6;
    y += this.ui(6);
    y += this.ui(30);
    if (this.settingsExpanded.has("interface")) y += this.ui(34) * 4;
    y += this.ui(6);
    y += this.ui(30);
    if (this.settingsExpanded.has("ai")) y += this.ui(54) * 2 + this.ui(46) + this.ui(34) * 13;
    y += this.ui(6);
    y += this.ui(30);
    if (this.settingsExpanded.has("danger")) y += this.ui(34) * 2;
    return y + this.ui(32);
  }
  maxSettingsScrollY(rect) {
    return Math.max(0, this.settingsContentHeight() - this.settingsViewportHeight(rect));
  }
  clampScrollForDoc(doc, rect) {
    const scroll = this.scrollForDoc(doc.id);
    scroll.y = clamp(scroll.y, 0, this.maxScrollY(doc, rect));
    scroll.x = clamp(scroll.x, 0, this.maxScrollX(doc, rect));
    return scroll;
  }
  ensureCaretVisible(doc, rect) {
    if (rect.w <= 0 || rect.h <= 0) return;
    const scroll = this.scrollForDoc(doc.id);
    const contentRect = this.editorContentRect(doc, rect);
    const lineH = this.renderer.lineHeight("code");
    const caretTop = doc.selection.head.line * lineH;
    const caretBottom = caretTop + lineH;
    const verticalMargin = Math.min(lineH * 2, Math.max(0, (contentRect.h - lineH) / 2));
    if (caretTop < scroll.y + verticalMargin) {
      scroll.y = caretTop - verticalMargin;
    } else if (caretBottom > scroll.y + contentRect.h - verticalMargin) {
      scroll.y = caretBottom - contentRect.h + verticalMargin;
    }
    const line = doc.lines[doc.selection.head.line] ?? "";
    const caretX = this.measureCodePrefix(line, doc.selection.head.col);
    const visibleTextWidth = this.visibleTextWidth(doc, contentRect);
    const horizontalMargin = Math.min(48, Math.max(0, (visibleTextWidth - 2) / 3));
    if (caretX < scroll.x + horizontalMargin) {
      scroll.x = caretX - horizontalMargin;
    } else if (caretX + 2 > scroll.x + visibleTextWidth - horizontalMargin) {
      scroll.x = caretX + 2 - visibleTextWidth + horizontalMargin;
    }
    scroll.y = clamp(scroll.y, 0, this.maxScrollY(doc, rect));
    scroll.x = clamp(scroll.x, 0, this.maxScrollX(doc, rect));
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
    this.persistEditorSession();
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
  startSettingsScrollbarDrag(hit, point) {
    this.hoveredSettingsScrollbar = { overThumb: rectContains(hit.thumbRect, point.x, point.y) };
    if (!rectContains(hit.thumbRect, point.x, point.y)) this.scrollSettingsFromScrollbarPoint(hit.viewportRect, hit.trackRect, hit.thumbRect, point);
    this.settingsScrollbarDrag = {
      startPoint: point.y,
      startScroll: this.settingsScrollY,
      viewportRect: { ...hit.viewportRect },
      trackRect: { ...hit.trackRect },
      thumbRect: { ...hit.thumbRect }
    };
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  dragSettingsScrollbar(point) {
    const drag = this.settingsScrollbarDrag;
    if (!drag) return;
    const maxScroll = this.maxSettingsScrollY(drag.viewportRect);
    const thumbTravel = Math.max(1, drag.trackRect.h - drag.thumbRect.h);
    const delta = (point.y - drag.startPoint) / thumbTravel * maxScroll;
    this.settingsScrollY = clamp(drag.startScroll + delta, 0, maxScroll);
    this.scheduleDraw();
  }
  scrollSettingsFromScrollbarPoint(editorRect, trackRect, thumbRect, point) {
    const maxScroll = this.maxSettingsScrollY(editorRect);
    if (maxScroll <= 0) return;
    const thumbTravel = Math.max(1, trackRect.h - thumbRect.h);
    const thumbTop = clamp(point.y - thumbRect.h / 2, trackRect.y, trackRect.y + thumbTravel);
    this.settingsScrollY = (thumbTop - trackRect.y) / thumbTravel * maxScroll;
  }
  startSidebarScrollbarDrag(hit, point) {
    this.hoveredSidebarScrollbar = { panel: hit.panel, overThumb: rectContains(hit.thumbRect, point.x, point.y) };
    if (!rectContains(hit.thumbRect, point.x, point.y)) this.scrollSidebarFromScrollbarPoint(hit.panel, hit.viewportRect, hit.contentHeight, hit.trackRect, hit.thumbRect, point);
    this.sidebarScrollbarDrag = {
      panel: hit.panel,
      startPoint: point.y,
      startScroll: this.sidebarScrollY(hit.panel),
      trackRect: { ...hit.trackRect },
      thumbRect: { ...hit.thumbRect },
      viewportRect: { ...hit.viewportRect },
      contentHeight: hit.contentHeight
    };
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  dragSidebarScrollbar(point) {
    const drag = this.sidebarScrollbarDrag;
    if (!drag) return;
    const maxScroll = Math.max(0, drag.contentHeight - drag.viewportRect.h);
    const thumbTravel = Math.max(1, drag.trackRect.h - drag.thumbRect.h);
    const delta = (point.y - drag.startPoint) / thumbTravel * maxScroll;
    this.setSidebarScrollY(drag.panel, drag.startScroll + delta, drag.viewportRect);
    this.scheduleDraw();
  }
  scrollSidebarFromScrollbarPoint(panel, viewport, contentHeight, trackRect, thumbRect, point) {
    const maxScroll = Math.max(0, contentHeight - viewport.h);
    if (maxScroll <= 0) return;
    const thumbTravel = Math.max(1, trackRect.h - thumbRect.h);
    const thumbTop = clamp(point.y - thumbRect.h / 2, trackRect.y, trackRect.y + thumbTravel);
    this.setSidebarScrollY(panel, (thumbTop - trackRect.y) / thumbTravel * maxScroll, viewport);
  }
  startChatScrollbarDrag(hit, point) {
    this.hoveredChatScrollbar = { panel: hit.panel, overThumb: rectContains(hit.thumbRect, point.x, point.y) };
    if (!rectContains(hit.thumbRect, point.x, point.y)) this.scrollChatFromScrollbarPoint(hit.panel, hit.viewportRect, hit.contentHeight, hit.trackRect, hit.thumbRect, point);
    this.chatScrollbarDrag = {
      panel: hit.panel,
      startPoint: point.y,
      startScroll: this.chatPanelScrollY(hit.panel),
      trackRect: { ...hit.trackRect },
      thumbRect: { ...hit.thumbRect },
      viewportRect: { ...hit.viewportRect },
      contentHeight: hit.contentHeight
    };
    this.canvas.style.cursor = "";
    this.scheduleDraw();
  }
  dragChatScrollbar(point) {
    const drag = this.chatScrollbarDrag;
    if (!drag) return;
    const maxScroll = Math.max(0, drag.contentHeight - drag.viewportRect.h);
    const thumbTravel = Math.max(1, drag.trackRect.h - drag.thumbRect.h);
    const delta = (point.y - drag.startPoint) / thumbTravel * maxScroll;
    this.setChatPanelScrollY(drag.panel, drag.startScroll + delta, drag.viewportRect);
    this.scheduleDraw();
  }
  scrollChatFromScrollbarPoint(panel, viewport, contentHeight, trackRect, thumbRect, point) {
    const maxScroll = Math.max(0, contentHeight - viewport.h);
    if (maxScroll <= 0) return;
    const thumbTravel = Math.max(1, trackRect.h - thumbRect.h);
    const thumbTop = clamp(point.y - thumbRect.h / 2, trackRect.y, trackRect.y + thumbTravel);
    this.setChatPanelScrollY(panel, (thumbTop - trackRect.y) / thumbTravel * maxScroll, viewport);
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
    if (this.updateTabInsertionPreview(point)) {
      this.dockPreview = null;
      this.canvas.style.cursor = "";
      this.scheduleDraw();
      return;
    }
    this.tabInsertionPreview = null;
    this.lastTabDragPoint = null;
    this.stopTabDragAutoscroll();
    const preview = this.resolveDockPreview(point);
    this.dockPreview = preview;
    this.scheduleDraw();
    this.canvas.style.cursor = preview ? "" : "not-allowed";
  }
  updateTabInsertionPreview(point) {
    const group = this.tabGroupAtPoint(point);
    if (!group) return false;
    this.lastTabDragPoint = { ...point };
    let layout = this.tabLayoutForGroup(group, this.tabRectForGroup(group));
    if (this.scrollTabGroupDuringDrag(group, layout, point)) {
      this.scheduleTabDragAutoscroll();
      layout = this.tabLayoutForGroup(group, this.tabRectForGroup(group));
    } else {
      this.stopTabDragAutoscroll();
    }
    const index = this.tabInsertionIndexForLayout(layout, point.x);
    this.tabInsertionPreview = { groupId: group.id, index, rect: this.tabInsertionLineRect(layout, index) };
    return true;
  }
  scheduleTabDragAutoscroll() {
    if (this.tabDragAutoscrollTimer) return;
    this.tabDragAutoscrollTimer = window.setTimeout(() => {
      this.tabDragAutoscrollTimer = 0;
      if (!this.tabDrag || !this.lastTabDragPoint) return;
      if (this.updateTabInsertionPreview(this.lastTabDragPoint)) this.scheduleDraw();
    }, 45);
  }
  stopTabDragAutoscroll() {
    if (!this.tabDragAutoscrollTimer) return;
    window.clearTimeout(this.tabDragAutoscrollTimer);
    this.tabDragAutoscrollTimer = 0;
  }
  scrollTabGroupDuringDrag(group, layout, point) {
    if (layout.maxScroll <= 0 || !rectContains(layout.stripRect, point.x, point.y)) return false;
    const edge = Math.min(this.ui(TAB_AUTOSCROLL_EDGE_W), layout.stripRect.w / 3);
    const leftAmount = layout.stripRect.x + edge - point.x;
    const rightAmount = point.x - (layout.stripRect.x + layout.stripRect.w - edge);
    const step = this.ui(26);
    if (leftAmount > 0) return this.setTabGroupScroll(group, layout.scroll - step * clamp(leftAmount / edge, 0.25, 1), layout);
    if (rightAmount > 0) return this.setTabGroupScroll(group, layout.scroll + step * clamp(rightAmount / edge, 0.25, 1), layout);
    return false;
  }
  tabInsertionIndexForLayout(layout, x) {
    const contentX = clamp(x - layout.stripRect.x + layout.scroll, 0, Math.max(0, layout.totalWidth));
    for (let i = 0; i < layout.items.length; i++) {
      const item = layout.items[i];
      if (contentX < item.start + item.width / 2) return i;
    }
    return layout.items.length;
  }
  tabInsertionLineRect(layout, index) {
    const gap = this.ui(TAB_GAP);
    const previous = layout.items[index - 1];
    const next = layout.items[index];
    const contentX = next ? next.start : previous ? previous.end + gap : 0;
    const x = clamp(layout.stripRect.x + contentX - layout.scroll, layout.stripRect.x + 1, layout.stripRect.x + layout.stripRect.w - 1);
    return {
      x: x - this.ui(1),
      y: layout.stripRect.y + this.ui(3),
      w: Math.max(2, this.ui(2)),
      h: Math.max(4, layout.stripRect.h - this.ui(6))
    };
  }
  resolveDockPreview(point) {
    const targets = this.allDockTargets();
    const centerTarget = targets.find((item) => item.zone === "center" && pointInPolygon(point, item.polygon));
    const target = centerTarget ?? targets.find((item) => item.zone !== "center" && pointInPolygon(point, item.polygon));
    return target ? { groupId: target.groupId, zone: target.zone, rect: target.previewRect, polygon: target.polygon } : null;
  }
  applyTabDrop() {
    const drag = this.tabDrag;
    const preview = this.dockPreview;
    if (!drag) return;
    if (this.tabInsertionPreview) {
      this.dropDraggedTabIntoGroup(drag.docId, this.tabInsertionPreview.groupId, this.tabInsertionPreview.index);
      return;
    }
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
      this.selectActiveDocumentInFileTree();
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
    this.selectActiveDocumentInFileTree();
    this.syncOpenTabs();
    this.statusText = `Docked ${preview.zone}`;
  }
  dropDraggedTabIntoGroup(docId, groupId, index) {
    const group = this.groups.find((item) => item.id === groupId);
    if (!group) {
      this.restoreDraggedTab();
      return;
    }
    const existing = group.tabs.indexOf(docId);
    if (existing >= 0) group.tabs.splice(existing, 1);
    const target = clamp(index, 0, group.tabs.length);
    group.tabs.splice(target, 0, docId);
    group.activeDocId = docId;
    this.activeGroupId = group.id;
    this.activeDocId = docId;
    this.selectActiveDocumentInFileTree();
    this.syncOpenTabs();
    this.revealTabInGroup(group, docId);
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.statusText = "Moved tab";
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
    if (this.activeDoc()) this.focusEditor();
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
  activateTabInGroup(group, docId, focus = true) {
    group.activeDocId = docId;
    this.activeGroupId = group.id;
    this.activeDocId = docId;
    this.revealTabInGroup(group, docId);
    this.selectActiveDocumentInFileTree();
    if (focus && this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.persistEditorSession();
  }
  syncOpenTabs(persist = true) {
    this.groups = collectDockGroups(this.dockRoot);
    this.openTabs = this.groups.flatMap((group) => group.tabs);
    if (persist) this.persistEditorSession();
  }
  persistEditorSession() {
    try {
      this.clearLegacyPersistedEditorSessions();
      if (!this.settings.rememberOpenFiles) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }
      const session = this.makePersistedSession();
      if (!session) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
    }
  }
  clearPersistedEditorSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      this.clearLegacyPersistedEditorSessions();
    } catch {
    }
  }
  clearLegacyPersistedEditorSessions() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`${SESSION_STORAGE_KEY}:`)) localStorage.removeItem(key);
    }
  }
  makePersistedSession() {
    const dockRoot = persistDockNode(this.dockRoot, (docId) => {
      const doc = this.docs.get(docId);
      return doc?.path && !this.isAiSpecialPath(doc.path) ? normalizePath(doc.path) : null;
    });
    if (!dockRoot || persistedDockPathCount(dockRoot) === 0) return null;
    const scrollStates = {};
    for (const doc of this.docs.all()) {
      if (!doc.path || this.isAiSpecialPath(doc.path) || !this.groupContaining(doc.id)) continue;
      const scroll = this.scrollStates.get(doc.id);
      if (scroll) scrollStates[normalizePath(doc.path)] = { x: scroll.x, y: scroll.y };
    }
    const activeDoc = this.activeDoc();
    return {
      version: 1,
      activePath: activeDoc?.path ? normalizePath(activeDoc.path) : null,
      activeGroupId: this.activeGroupId,
      sidebarMode: this.sidebarMode,
      sidebarWidth: this.sidebarWidth,
      lastSidebarWidth: this.lastSidebarWidth,
      dockRoot,
      scrollStates
    };
  }
  async restoreEditorSession() {
    if (!this.settings.rememberOpenFiles) {
      this.clearPersistedEditorSession();
      return;
    }
    let session = null;
    try {
      this.clearLegacyPersistedEditorSessions();
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      session = raw ? normalizePersistedSession(JSON.parse(raw)) : null;
    } catch {
      session = null;
    }
    if (!session) return;
    const paths = [...new Set(persistedDockPaths(session.dockRoot))];
    const pathToDocId = /* @__PURE__ */ new Map();
    for (const path of paths) {
      const node = await this.vfs.stat(path);
      if (!node || node.kind !== "file") continue;
      const doc = await this.docs.open(path);
      pathToDocId.set(path, doc.id);
    }
    const restoredRoot = restorePersistedDockNode(session.dockRoot, pathToDocId);
    if (!restoredRoot || restoredDockTabCount(restoredRoot) === 0) {
      this.clearPersistedEditorSession();
      return;
    }
    this.dockRoot = restoredRoot;
    this.groups = collectDockGroups(this.dockRoot);
    this.activeGroupId = this.groups.find((group) => group.id === session.activeGroupId)?.id ?? this.groups[0].id;
    const activeDocId = session.activePath ? pathToDocId.get(session.activePath) ?? null : null;
    if (activeDocId) {
      const group = this.groupContaining(activeDocId);
      if (group) {
        group.activeDocId = activeDocId;
        this.activeGroupId = group.id;
        this.activeDocId = activeDocId;
      }
    }
    if (!this.activeDocId) {
      const group = this.groups.find((item) => item.activeDocId) ?? this.groups[0];
      this.activeGroupId = group.id;
      this.activeDocId = group.activeDocId;
    }
    this.sidebarMode = session.sidebarMode;
    this.sidebarWidth = Math.max(0, session.sidebarWidth);
    this.lastSidebarWidth = Math.max(0, session.lastSidebarWidth || this.lastSidebarWidth);
    this.scrollStates.clear();
    this.tabScrollStates.clear();
    this.pendingTabRevealIds.clear();
    for (const [path, scroll] of Object.entries(session.scrollStates ?? {})) {
      const docId = pathToDocId.get(path);
      if (docId) this.scrollStates.set(docId, { x: Math.max(0, scroll.x), y: Math.max(0, scroll.y) });
    }
    this.syncOpenTabs(false);
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    this.statusText = "Restored workspace";
    this.persistEditorSession();
  }
  blockReadOnlyEdit(doc) {
    if (!doc?.readOnly) return false;
    this.statusText = "File type not supported";
    this.scheduleDraw();
    return true;
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
        this.closeContextMenuForTextInput();
        const doc = this.activeDoc();
        if (this.blockReadOnlyEdit(doc)) return;
        doc?.replaceSelection(text);
        this.afterDocumentMutated(doc);
        this.revealEditorCaret();
      },
      deleteSelectionOrBackward: (unit = "char") => {
        this.closeContextMenuForTextInput();
        const doc = this.activeDoc();
        if (this.blockReadOnlyEdit(doc)) return;
        doc?.deleteBackward(unit);
        this.afterDocumentMutated(doc);
        this.revealEditorCaret();
      },
      deleteForward: (unit = "char") => {
        this.closeContextMenuForTextInput();
        const doc = this.activeDoc();
        if (this.blockReadOnlyEdit(doc)) return;
        doc?.deleteForward(unit);
        this.afterDocumentMutated(doc);
        this.revealEditorCaret();
      },
      moveCursor: (command, extend) => {
        this.activeDoc()?.move(command, extend);
        this.revealEditorCaret();
      },
      runShortcut: (command) => this.runEditorShortcut(command),
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        this.closeContextMenuForTextInput();
        const doc = this.activeDoc();
        if (text && !this.blockReadOnlyEdit(doc)) {
          doc?.replaceSelection(text, "composition");
          this.afterDocumentMutated(doc);
        }
        this.revealEditorCaret();
      }
    };
  }
  miniTarget(kind) {
    if (kind === "chat") return this.chatInputTarget();
    const buffer = this.searchBuffer;
    return {
      kind,
      getSelectedText: () => buffer.selectedText(),
      replaceSelection: (text) => {
        this.closeContextMenuForTextInput();
        buffer.replaceSelection(text.replaceAll("\n", " "));
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        this.closeContextMenuForTextInput();
        buffer.deleteBackward();
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      deleteForward: () => {
        this.closeContextMenuForTextInput();
        buffer.deleteForward();
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        buffer.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
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
        this.closeContextMenuForTextInput();
        buffer.replaceSelection(text);
        if (kind === "search") void this.runSearch();
        this.resetCaretBlink();
      }
    };
  }
  chatInputTarget() {
    const doc = this.chatDraft;
    return {
      kind: "chat",
      getSelectedText: () => doc.selectedText(),
      replaceSelection: (text) => {
        this.closeContextMenuForTextInput();
        doc.replaceSelection(text);
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: (unit) => {
        this.closeContextMenuForTextInput();
        doc.deleteBackward(unit);
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.resetCaretBlink();
      },
      deleteForward: (unit) => {
        this.closeContextMenuForTextInput();
        doc.deleteForward(unit);
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        doc.move(command, extend);
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
        if (command === "Enter") {
          void this.sendChat();
          return true;
        }
        if (command === "Shift+Enter") {
          this.closeContextMenuForTextInput();
          doc.replaceSelection("\n");
          this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
          this.resetCaretBlink();
          return true;
        }
        if (command === "Mod+Enter") {
          void this.sendChat();
          return true;
        }
        if (command === "Mod+A") {
          doc.selectAll();
          this.resetCaretBlink();
          return true;
        }
        return this.runGlobalShortcut(command);
      },
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        this.closeContextMenuForTextInput();
        doc.replaceSelection(text);
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.resetCaretBlink();
      }
    };
  }
  textFieldTarget(field) {
    const buffer = this.bufferForTextField(field);
    return {
      kind: field,
      getSelectedText: () => buffer.selectedText(),
      replaceSelection: (text) => {
        this.closeContextMenuForTextInput();
        buffer.replaceSelection(this.sanitizeTextFieldInput(field, text));
        this.afterTextFieldChanged(field);
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        this.closeContextMenuForTextInput();
        buffer.deleteBackward();
        this.afterTextFieldChanged(field);
        this.resetCaretBlink();
      },
      deleteForward: () => {
        this.closeContextMenuForTextInput();
        buffer.deleteForward();
        this.afterTextFieldChanged(field);
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        buffer.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
        if (command === "Enter") {
          if (isSettingTextField(field)) this.commitSettingsTextInput();
          else if (field === "find") this.selectDocumentFindMatch(1);
          else if (field === "findReplace") this.replaceCurrentFindMatch();
          else if (field === "projectReplace") void this.replaceAllInWorkspace();
          else void this.runSearch();
          this.resetCaretBlink();
          return true;
        }
        if (command === "Escape") {
          if (isSettingTextField(field)) this.cancelSettingsTextInput();
          else if (field === "find" || field === "findReplace") this.closeFindWidget();
          else this.focusEditor();
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
        this.closeContextMenuForTextInput();
        buffer.replaceSelection(this.sanitizeTextFieldInput(field, text));
        this.afterTextFieldChanged(field);
        this.resetCaretBlink();
      }
    };
  }
  sanitizeTextFieldInput(field, text) {
    const singleLine = sanitizeSingleLineInput(text);
    return field === "aiMaxContextTokens" ? singleLine.replace(/\D+/g, "") : singleLine;
  }
  renameTarget() {
    const buffer = this.renameBuffer;
    return {
      kind: "command",
      getSelectedText: () => buffer.selectedText(),
      replaceSelection: (text) => {
        this.closeContextMenuForTextInput();
        buffer.replaceSelection(text.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " "));
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        this.closeContextMenuForTextInput();
        buffer.deleteBackward();
        this.resetCaretBlink();
      },
      deleteForward: () => {
        this.closeContextMenuForTextInput();
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
        this.closeContextMenuForTextInput();
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
    if (command === "Mod+C") {
      const text = doc.selectedText();
      if (!text) return false;
      this.copyTextToClipboard(text);
      return true;
    }
    if (doc.readOnly) {
      this.statusText = "File type not supported";
      this.scheduleDraw();
      return true;
    }
    if (command === "Tab") {
      doc.indentSelectedLines(this.editorIndentString());
      this.afterDocumentMutated(doc);
      this.revealEditorCaret();
      return true;
    }
    if (command === "Shift+Tab") {
      doc.unindentSelectedLines(this.codeTabSpaces());
      this.afterDocumentMutated(doc);
      this.revealEditorCaret();
      return true;
    }
    if (command === "Mod+Z") {
      doc.undo();
      this.afterDocumentMutated(doc);
      this.revealEditorCaret();
      return true;
    }
    if (command === "Mod+Shift+Z" || command === "Mod+Y") {
      doc.redo();
      this.afterDocumentMutated(doc);
      this.revealEditorCaret();
      return true;
    }
    if (command === "Mod+X") {
      const text = doc.selectedText();
      if (!text) return false;
      this.copyTextToClipboard(text);
      doc.replaceSelection("", "cut");
      this.afterDocumentMutated(doc);
      this.revealEditorCaret();
      return true;
    }
    return false;
  }
  async runContextMenuCommand(command) {
    const menu = this.contextMenu;
    const item = menu?.items.find((candidate) => isContextMenuItem(candidate) && candidate.command === command);
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
    if (menu.scope.type === "tab") {
      await this.runTabContextMenuCommand(menu.scope.groupId, menu.scope.docId, command);
      return;
    }
    if (menu.scope.type === "tabBar") {
      await this.runTabBarContextMenuCommand(menu.scope.groupId, command);
      return;
    }
    if (menu.scope.type === "tabOverflow") {
      this.runTabOverflowContextMenuCommand(menu.scope.groupId, command);
      return;
    }
    if (menu.scope.type === "highlightDropdown") {
      this.runHighlightDropdownCommand(menu.scope.groupId, menu.scope.docId, command);
      return;
    }
    if (menu.scope.type === "gutter") {
      this.runGutterContextMenuCommand(menu.scope.groupId, menu.scope.docId, command);
      return;
    }
    if (menu.scope.type === "settingsRoot") {
      if (command === "resetSettings") this.resetSettings();
      this.closeContextMenu();
      return;
    }
    if (menu.scope.type === "chatRoot") {
      await this.runChatRootContextMenuCommand(command);
      return;
    }
    if (menu.scope.type === "chatBubble") {
      await this.runChatBubbleContextMenuCommand(menu.scope.messageId, command);
      return;
    }
    if (menu.scope.type === "settingsDropdown") {
      this.runSettingsDropdownCommand(menu.scope.key, command);
      return;
    }
    if (menu.scope.type === "settingsNumber") {
      await this.runSettingsNumberContextMenuCommand(menu.scope.key, command);
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
    if (menu.scope.type === "chatInput") {
      await this.runChatInputContextMenuCommand(command);
      return;
    }
    if (menu.scope.type === "textField") {
      await this.runTextFieldContextMenuCommand(menu.scope.field, command);
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
    this.selectActiveDocumentInFileTree();
    if (command === "undo" || command === "redo") {
      if (doc.readOnly) {
        this.statusText = "File type not supported";
        this.scheduleDraw();
        return;
      }
      if (command === "undo" && doc.canUndo()) {
        doc.undo();
        this.afterDocumentMutated(doc);
        this.revealEditorCaret();
        this.statusText = "Undid edit";
      } else if (command === "redo" && doc.canRedo()) {
        doc.redo();
        this.afterDocumentMutated(doc);
        this.revealEditorCaret();
        this.statusText = "Redid edit";
      } else {
        this.focusEditor();
      }
      this.scheduleDraw();
      return;
    }
    if (command === "systemCopy") {
      const text = doc.selectedText();
      if (text) this.openSystemCopyDialog(text, () => this.focusEditor());
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      if (doc.readOnly) {
        this.statusText = "File type not supported";
        this.scheduleDraw();
        return;
      }
      this.openSystemPasteDialog((text) => {
        doc.replaceSelection(text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"), "paste");
        this.afterDocumentMutated(doc);
        this.statusText = "Pasted";
        this.revealEditorCaret();
        this.scheduleDraw();
      }, () => this.focusEditor());
      return;
    }
    let changedDocument = false;
    if (command === "copy" || command === "cut") {
      const text = doc.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          if (doc.readOnly) {
            this.statusText = "File type not supported";
            this.scheduleDraw();
            return;
          }
          doc.replaceSelection("", "cut");
          this.afterDocumentMutated(doc);
          this.statusText = "Cut selection";
          changedDocument = true;
        } else {
          this.statusText = "Copied selection";
        }
      }
    } else {
      this.focusEditor();
      const text = await this.readTextFromClipboard();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else if (doc.readOnly) {
        this.statusText = "File type not supported";
      } else {
        doc.replaceSelection(text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"), "paste");
        this.afterDocumentMutated(doc);
        this.statusText = "Pasted";
        changedDocument = true;
      }
    }
    if (changedDocument) this.revealEditorCaret();
    else this.focusEditor();
    this.scheduleDraw();
  }
  async runRenameContextMenuCommand(command) {
    if (!isEditorContextMenuCommand(command)) return;
    if (command === "undo" || command === "redo") {
      if (command === "undo" && this.renameBuffer.canUndo()) {
        this.renameBuffer.undo();
        this.statusText = "Undid edit";
      } else if (command === "redo" && this.renameBuffer.canRedo()) {
        this.renameBuffer.redo();
        this.statusText = "Redid edit";
      }
      this.focusRename(this.renameInputRect() ?? void 0);
      this.resetCaretBlink();
      return;
    }
    if (command === "systemCopy") {
      const text = this.renameBuffer.selectedText();
      if (text) this.openSystemCopyDialog(text, () => this.focusRename(this.renameInputRect() ?? void 0));
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      this.openSystemPasteDialog((text) => {
        this.renameBuffer.replaceSelection(sanitizeSingleLineInput(text));
        this.statusText = "Pasted";
        this.focusRename(this.renameInputRect() ?? void 0);
        this.resetCaretBlink();
      }, () => this.focusRename(this.renameInputRect() ?? void 0));
      return;
    }
    if (command === "copy" || command === "cut") {
      const text = this.renameBuffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          this.renameBuffer.replaceSelection("");
          this.statusText = "Cut file name text";
        } else {
          this.statusText = "Copied file name text";
        }
      }
    } else {
      this.focusRename(this.renameInputRect() ?? void 0);
      const text = await this.readTextFromClipboard();
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
    if (command === "undo" || command === "redo") {
      if (command === "undo" && this.searchBuffer.canUndo()) {
        this.searchBuffer.undo();
        this.statusText = "Undid edit";
      } else if (command === "redo" && this.searchBuffer.canRedo()) {
        this.searchBuffer.redo();
        this.statusText = "Redid edit";
      }
      void this.runSearch();
      this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 });
      this.resetCaretBlink();
      return;
    }
    if (command === "systemCopy") {
      const text = this.searchBuffer.selectedText();
      if (text) this.openSystemCopyDialog(text, () => this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 }));
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      this.openSystemPasteDialog((text) => {
        this.searchBuffer.replaceSelection(sanitizeSingleLineInput(text));
        void this.runSearch();
        this.statusText = "Pasted";
        this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 });
      }, () => this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 }));
      return;
    }
    if (command === "copy" || command === "cut") {
      const text = this.searchBuffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          this.searchBuffer.replaceSelection("");
          void this.runSearch();
          this.statusText = "Cut search text";
        } else {
          this.statusText = "Copied search text";
        }
      }
    } else {
      this.focusMiniTarget("search", this.searchInputRect() ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 });
      const text = await this.readTextFromClipboard();
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
  async runChatInputContextMenuCommand(command) {
    if (!isEditorContextMenuCommand(command)) return;
    const restore = () => this.focusMiniTarget("chat", this.chatInputRectForFocus());
    if (command === "undo" || command === "redo") {
      if (command === "undo" && this.chatDraft.canUndo()) {
        this.chatDraft.undo();
        this.statusText = "Undid edit";
      } else if (command === "redo" && this.chatDraft.canRedo()) {
        this.chatDraft.redo();
        this.statusText = "Redid edit";
      }
      this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
      restore();
      this.resetCaretBlink();
      return;
    }
    if (command === "systemCopy") {
      const text = this.chatDraft.selectedText();
      if (text) this.openSystemCopyDialog(text, restore);
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      this.openSystemPasteDialog((text) => {
        this.chatDraft.replaceSelection(text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"));
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.statusText = "Pasted";
        restore();
      }, restore);
      return;
    }
    if (command === "copy" || command === "cut") {
      const text = this.chatDraft.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          this.chatDraft.replaceSelection("");
          this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
          this.statusText = "Cut chat text";
        } else {
          this.statusText = "Copied chat text";
        }
      }
    } else {
      restore();
      const text = await this.readTextFromClipboard();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        this.chatDraft.replaceSelection(text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"));
        this.ensureChatInputCaretVisible(this.chatInputRectForFocus());
        this.statusText = "Pasted";
      }
    }
    restore();
    this.resetCaretBlink();
  }
  async runChatRootContextMenuCommand(command) {
    if (command === "exportChat") {
      this.exportChatToDisk();
      return;
    }
    if (command === "debugChat") {
      this.debugChatToUntitled();
      return;
    }
    if (command === "clearChat") {
      if (this.chat.running) return;
      this.openClearChatModal();
      return;
    }
    if (command === "compactChat") {
      if (this.chat.running) return;
      this.statusText = "Compacting chat";
      const result = await this.chat.compact(this.aiRuntimeSettings(), {
        onUpdate: () => this.scheduleDraw(),
        onCompactStart: () => this.openCompactingModal(),
        onCompactEnd: () => this.closeCompactingModal()
      });
      this.chatScrollY = Number.MAX_SAFE_INTEGER;
      this.statusText = result.output;
      this.scheduleDraw();
    }
  }
  async runChatBubbleContextMenuCommand(messageId, command) {
    const message = this.chatDisplayMessages().find((msg) => msg.id === messageId);
    const chatText = this.chatTranscriptText();
    const restore = () => this.input.blur();
    if (command === "copyBubble") {
      if (!message) {
        this.statusText = "Chat bubble not found";
      } else {
        this.copyTextToClipboard(message.text);
        this.statusText = "Copied chat bubble";
      }
      this.scheduleDraw();
      return;
    }
    if (command === "copyChat") {
      if (!chatText) {
        this.statusText = "Chat empty";
      } else {
        this.copyTextToClipboard(chatText);
        this.statusText = "Copied chat";
      }
      this.scheduleDraw();
      return;
    }
    if (command === "systemCopyBubble") {
      if (message) this.openSystemCopyDialog(message.text, restore);
      else this.statusText = "Chat bubble not found";
      this.scheduleDraw();
      return;
    }
    if (command === "systemCopyChat") {
      if (chatText) this.openSystemCopyDialog(chatText, restore);
      else this.statusText = "Chat empty";
      this.scheduleDraw();
      return;
    }
    if (command === "clearChat") {
      if (!this.chat.running) this.openClearChatModal();
      return;
    }
  }
  async runTextFieldContextMenuCommand(field, command) {
    if (field === "search") {
      await this.runSearchContextMenuCommand(command);
      return;
    }
    if (!isEditorContextMenuCommand(command)) return;
    const buffer = this.bufferForTextField(field);
    const fallback = { x: this.ui(56), y: this.ui(40), w: Math.max(this.ui(80), this.sidebarWidth - this.ui(20)), h: this.ui(28) };
    const restore = () => this.focusTextField(field, this.textFieldRect(field) ?? fallback);
    if (command === "undo" || command === "redo") {
      if (command === "undo" && buffer.canUndo()) {
        buffer.undo();
        this.statusText = "Undid edit";
      } else if (command === "redo" && buffer.canRedo()) {
        buffer.redo();
        this.statusText = "Redid edit";
      }
      this.afterTextFieldChanged(field);
      restore();
      this.resetCaretBlink();
      return;
    }
    if (command === "systemCopy") {
      const text = buffer.selectedText();
      if (text) this.openSystemCopyDialog(text, restore);
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      this.openSystemPasteDialog((text) => {
        buffer.replaceSelection(this.sanitizeTextFieldInput(field, text));
        this.afterTextFieldChanged(field);
        this.statusText = "Pasted";
        restore();
        this.resetCaretBlink();
      }, restore);
      return;
    }
    if (command === "copy" || command === "cut") {
      const text = buffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          buffer.replaceSelection("");
          this.afterTextFieldChanged(field);
          this.statusText = "Cut text";
        } else {
          this.statusText = "Copied text";
        }
      }
    } else {
      restore();
      const text = await this.readTextFromClipboard();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        buffer.replaceSelection(this.sanitizeTextFieldInput(field, text));
        this.afterTextFieldChanged(field);
        this.statusText = "Pasted";
      }
    }
    restore();
    this.resetCaretBlink();
  }
  async runTabContextMenuCommand(groupId, docId, command) {
    if (!isTabContextMenuCommand(command)) return;
    const group = this.groupById(groupId);
    if (!group.tabs.includes(docId)) return;
    if (command === "save") {
      if (this.isSettingsTab(docId)) return;
      const doc = this.docs.get(docId);
      if (!doc) return;
      if (doc.readOnly) {
        this.statusText = "File type not supported";
        this.scheduleDraw();
        return;
      }
      await this.saveDocument(doc);
      this.statusText = `Saved ${doc.path}`;
      this.scheduleDraw();
      return;
    }
    if (command === "findInFile") {
      if (this.isSettingsTab(docId)) return;
      group.activeDocId = docId;
      this.activeGroupId = group.id;
      this.activeDocId = docId;
      this.selectActiveDocumentInFileTree();
      this.openFindWidget();
      return;
    }
    if (command === "resetSettings") {
      if (!this.isSettingsTab(docId)) return;
      group.activeDocId = docId;
      this.activeGroupId = group.id;
      this.activeDocId = docId;
      this.resetSettings();
      return;
    }
    if (command === "close") {
      await this.requestCloseTab(docId);
      return;
    }
    group.activeDocId = docId;
    this.activeGroupId = group.id;
    this.activeDocId = docId;
    this.selectActiveDocumentInFileTree();
    if (this.activeDoc()) this.focusEditor();
    else this.input.blur();
    const others = group.tabs.filter((id) => id !== docId);
    await this.requestCloseTabs(others);
  }
  async runTabBarContextMenuCommand(groupId, command) {
    if (!isTabBarContextMenuCommand(command)) return;
    const group = this.groupById(groupId);
    if (command === "newFile") {
      this.openUntitledDocument(group.id);
      return;
    }
    if (command === "uploadFile") {
      this.requestFileUpload("/");
      return;
    }
    await this.requestCloseTabs(group.tabs);
  }
  runTabOverflowContextMenuCommand(groupId, command) {
    const docId = tabOverflowCommandDocId(command);
    if (!docId) return;
    const group = this.groupById(groupId);
    if (!group.tabs.includes(docId)) return;
    this.activateTabInGroup(group, docId);
    this.statusText = `Opened ${this.tabLabel(docId)}`;
    this.scheduleDraw();
  }
  openHighlightDropdown(hit) {
    const doc = this.docs.get(hit.docId);
    if (!doc) return;
    const entries = HIGHLIGHT_OPTIONS.map((option) => ({
      command: highlightCommand(option.id),
      label: `${doc.syntaxId === option.id ? "\u2714\uFE0F " : ""}${option.label}`,
      enabled: true
    }));
    const pad = this.ui(CONTEXT_MENU_PAD);
    const menuH = pad * 2 + entries.length * this.ui(CONTEXT_MENU_ROW_H);
    const menuW = Math.max(this.ui(150), ...entries.map((entry) => this.renderer.measureText(entry.label, "ui") + this.ui(34)));
    const menuX = hit.rect.x + hit.rect.w - menuW;
    this.contextMenu = this.makeContextMenu(
      { x: menuX, y: hit.rect.y - menuH },
      { type: "highlightDropdown", groupId: hit.groupId, docId: hit.docId },
      entries,
      { x: menuX, y: hit.rect.y - menuH, w: menuW }
    );
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  runHighlightDropdownCommand(groupId, docId, command) {
    const syntaxId = highlightCommandSyntaxId(command);
    if (!syntaxId) return;
    const doc = this.docs.get(docId);
    const group = this.groupById(groupId);
    if (!doc || !group.tabs.includes(doc.id)) return;
    doc.syntaxId = syntaxId;
    group.activeDocId = doc.id;
    this.activeGroupId = group.id;
    this.activeDocId = doc.id;
    this.selectActiveDocumentInFileTree();
    this.statusText = `Highlight ${this.highlightLabel(syntaxId)}`;
    this.contextMenu = null;
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  runGutterContextMenuCommand(groupId, docId, command) {
    if (command !== "toggleLineNumbers") return;
    const group = this.groupById(groupId);
    const doc = this.docs.get(docId);
    if (doc && group.tabs.includes(doc.id)) {
      this.activeGroupId = group.id;
      this.activeDocId = doc.id;
      group.activeDocId = doc.id;
      this.selectActiveDocumentInFileTree();
    }
    this.settings.showLineNumbers = !this.settings.showLineNumbers;
    this.statusText = this.settings.showLineNumbers ? "Line numbers shown" : "Line numbers hidden";
    this.saveAndApplySettings();
  }
  openSettingsDropdown(rect, key) {
    const currentConfig = loadAiEndpointConfig();
    let entries;
    if (key === "theme") {
      entries = [
        { command: "themeDark", label: "Dark", enabled: true },
        { command: "themeLight", label: "Light", enabled: true }
      ];
    } else if (key === "aiToolCallFormat") {
      entries = [
        { command: "aiToolFormatNone", label: "None", enabled: true },
        { command: "aiToolFormatTag", label: "Tag", enabled: true },
        { command: "aiToolFormatHarmony", label: "Harmony", enabled: true }
      ];
    } else if (key === "aiModel") {
      const models = [...this.aiModels];
      if (currentConfig.model && !models.some((model) => model.id === currentConfig.model)) models.unshift({ id: currentConfig.model, contextLength: currentConfig.maxContextTokens });
      entries = models.length ? models.map((model) => ({
        command: aiModelCommand(model.id),
        label: `${model.id}${model.contextLength ? ` (${Math.round(model.contextLength / 1e3)}k)` : ""}`,
        enabled: true
      })) : [{ command: aiModelCommand(""), label: "No models probed", enabled: false }];
    } else {
      entries = [
        { command: "aiProviderLocal", label: "Local", enabled: true },
        { command: "aiProviderOpenAI", label: "OpenAI", enabled: true }
      ];
    }
    const menuW = key === "aiModel" ? Math.min(
      Math.max(rect.w, ...entries.map((entry) => "separator" in entry ? 0 : this.renderer.measureText(entry.label, "ui") + this.ui(34))),
      Math.max(rect.w, this.viewport.get().cssWidth - this.ui(24))
    ) : rect.w;
    this.contextMenu = this.makeContextMenu({ x: rect.x, y: rect.y + rect.h }, { type: "settingsDropdown", key }, entries, { x: rect.x, y: rect.y + rect.h, w: menuW });
    this.contextMenuHover = null;
    this.scheduleDraw();
  }
  runSettingsDropdownCommand(key, command) {
    if (!isSettingContextMenuCommand(command)) return;
    if (key === "theme") {
      if (command === "themeDark") this.settings.theme = "dark";
      else if (command === "themeLight") this.settings.theme = "light";
    } else if (key === "aiProvider") {
      if (command === "aiProviderLocal") this.settings.aiProvider = "local";
      else if (command === "aiProviderOpenAI") this.settings.aiProvider = "openai";
    } else if (key === "aiToolCallFormat") {
      if (command === "aiToolFormatNone") this.settings.aiToolCallFormat = "none";
      else if (command === "aiToolFormatTag") this.settings.aiToolCallFormat = "tag";
      else if (command === "aiToolFormatHarmony") this.settings.aiToolCallFormat = "harmony";
    } else if (key === "aiModel") {
      const modelId = aiModelCommandValue(command);
      if (modelId !== null) {
        const selected = this.aiModels.find((model) => model.id === modelId);
        const config = loadAiEndpointConfig();
        const detectedContextTokens = selected?.contextLength || resolveAiContextTokens({ ...config, model: modelId, maxContextTokens: 0 });
        saveAiEndpointConfig({
          ...config,
          model: modelId,
          maxContextTokens: detectedContextTokens || config.maxContextTokens
        });
        this.statusText = modelId ? `AI model ${modelId}` : "AI model unchanged";
      }
    }
    this.saveAndApplySettings();
  }
  async runSettingsNumberContextMenuCommand(key, command) {
    if (!isEditorContextMenuCommand(command)) return;
    const restore = () => this.focusSettingsNumber(key, this.settingsNumberInputRect(key) ?? { x: 56, y: 40, w: Math.max(80, this.sidebarWidth - 20), h: 28 });
    if (command === "undo" || command === "redo") {
      if (command === "undo" && this.settingsNumberBuffer.canUndo()) {
        this.settingsNumberBuffer.undo();
        this.statusText = "Undid edit";
      } else if (command === "redo" && this.settingsNumberBuffer.canRedo()) {
        this.settingsNumberBuffer.redo();
        this.statusText = "Redid edit";
      }
      this.applySettingsNumberFromBuffer();
      restore();
      this.resetCaretBlink();
      return;
    }
    if (command === "systemCopy") {
      const text = this.settingsNumberBuffer.selectedText();
      if (text) this.openSystemCopyDialog(text, restore);
      else this.statusText = "No selection";
      this.scheduleDraw();
      return;
    }
    if (command === "systemPaste") {
      this.openSystemPasteDialog((text) => {
        this.settingsNumberBuffer.replaceSelection(text.replace(/\D+/g, ""));
        this.applySettingsNumberFromBuffer();
        this.statusText = "Pasted";
        restore();
        this.resetCaretBlink();
      }, restore);
      return;
    }
    if (command === "copy" || command === "cut") {
      const text = this.settingsNumberBuffer.selectedText();
      if (!text) {
        this.statusText = "No selection";
      } else {
        this.copyTextToClipboard(text);
        if (command === "cut") {
          this.settingsNumberBuffer.replaceSelection("");
          this.applySettingsNumberFromBuffer();
          this.statusText = "Cut setting value";
        } else {
          this.statusText = "Copied setting value";
        }
      }
    } else {
      restore();
      const text = await this.readTextFromClipboard();
      if (text === null) {
        this.statusText = "Clipboard paste unavailable";
      } else if (!text) {
        this.statusText = "Clipboard empty";
      } else {
        this.settingsNumberBuffer.replaceSelection(text.replace(/\D+/g, ""));
        this.applySettingsNumberFromBuffer();
        this.statusText = "Pasted";
      }
    }
    restore();
    this.resetCaretBlink();
  }
  toggleSettingsHeader(id) {
    if (this.settingsExpanded.has(id)) this.settingsExpanded.delete(id);
    else this.settingsExpanded.add(id);
    this.scheduleDraw();
  }
  toggleSettingsCheckbox(key) {
    this.settings[key] = !this.settings[key];
    if (key === "aiModelManual") this.syncSettingsTextBufferFromConfig("aiModel");
    this.saveAndApplySettings();
  }
  focusSettingsNumber(key, rect) {
    const wasActive = this.activeSettingsNumber === key;
    this.activeSettingsNumber = key;
    if (!wasActive) {
      this.settingsNumberBuffer.text = String(this.settings[key]);
      this.settingsNumberBuffer.cursor = this.settingsNumberBuffer.text.length;
      this.settingsNumberBuffer.anchor = this.settingsNumberBuffer.cursor;
      this.settingsNumberBuffer.scrollX = 0;
      this.settingsNumberBuffer.clearUndoHistory();
    }
    this.input.focusEditor(this.settingsNumberTarget(), rect);
    this.resetCaretBlink();
    this.requestFocusedInputReveal();
  }
  settingsNumberTarget() {
    return {
      kind: "command",
      getSelectedText: () => this.settingsNumberBuffer.selectedText(),
      replaceSelection: (text) => {
        this.closeContextMenuForTextInput();
        this.settingsNumberBuffer.replaceSelection(text.replace(/\D+/g, ""));
        this.applySettingsNumberFromBuffer();
        this.resetCaretBlink();
      },
      deleteSelectionOrBackward: () => {
        this.closeContextMenuForTextInput();
        this.settingsNumberBuffer.deleteBackward();
        this.applySettingsNumberFromBuffer();
        this.resetCaretBlink();
      },
      deleteForward: () => {
        this.closeContextMenuForTextInput();
        this.settingsNumberBuffer.deleteForward();
        this.applySettingsNumberFromBuffer();
        this.resetCaretBlink();
      },
      moveCursor: (command, extend) => {
        this.settingsNumberBuffer.move(command, extend);
        this.resetCaretBlink();
      },
      runShortcut: (command) => {
        if (command === "Enter") {
          this.commitSettingsNumberInput();
          return true;
        }
        if (command === "Escape") {
          this.cancelSettingsNumberInput();
          return true;
        }
        if (command === "Mod+A") {
          this.settingsNumberBuffer.selectAll();
          this.resetCaretBlink();
          return true;
        }
        return false;
      },
      onCompositionPreview: () => this.resetCaretBlink(),
      onCompositionCommit: (text) => {
        this.closeContextMenuForTextInput();
        this.settingsNumberBuffer.replaceSelection(text.replace(/\D+/g, ""));
        this.applySettingsNumberFromBuffer();
        this.resetCaretBlink();
      }
    };
  }
  applySettingsNumberFromBuffer() {
    const key = this.activeSettingsNumber;
    if (!key) return;
    const value = Number.parseInt(this.settingsNumberBuffer.text, 10);
    if (!Number.isFinite(value)) return;
    if (key === "fontSize") this.settings[key] = Math.max(1, value);
    else if (key === "tabSpaces") this.settings[key] = clamp(Math.trunc(value), 1, 32);
    else if (key === "aiMaxToolCalls") this.settings[key] = clamp(Math.trunc(value), 1, 200);
    else if (key === "aiCompactFreePercent") this.settings[key] = clamp(Math.trunc(value), 1, 95);
    else this.settings[key] = clamp(Math.trunc(value), 1, 400);
    this.saveAndApplySettings();
  }
  commitSettingsNumberInput(blur = true) {
    const key = this.activeSettingsNumber;
    if (!key) return;
    this.applySettingsNumberFromBuffer();
    this.settingsNumberBuffer.text = String(this.settings[key]);
    this.settingsNumberBuffer.cursor = this.settingsNumberBuffer.text.length;
    this.settingsNumberBuffer.anchor = this.settingsNumberBuffer.cursor;
    this.settingsNumberBuffer.scrollX = 0;
    this.settingsNumberBuffer.clearUndoHistory();
    this.activeSettingsNumber = null;
    this.settingsNumberSelecting = false;
    if (blur) this.input.blur();
    this.scheduleDraw();
  }
  cancelSettingsNumberInput() {
    this.activeSettingsNumber = null;
    this.settingsNumberSelecting = false;
    this.input.blur();
    this.scheduleDraw();
  }
  commitSettingsTextInput(blur = true) {
    const key = this.activeSettingsText;
    if (!key) return;
    this.applySettingsTextFromBuffer(key);
    this.activeSettingsText = null;
    this.textFieldSelecting = null;
    if (blur) this.input.blur();
    this.scheduleDraw();
  }
  cancelSettingsTextInput() {
    const key = this.activeSettingsText;
    if (key) this.syncSettingsTextBufferFromConfig(key);
    this.activeSettingsText = null;
    this.textFieldSelecting = null;
    this.input.blur();
    this.scheduleDraw();
  }
  applySettingsTextFromBuffer(key) {
    const config = loadAiEndpointConfig();
    const buffer = this.settingsTextBuffers[key];
    if (key === "aiBaseUrl") {
      const next = saveAiEndpointConfig({ ...config, apiBaseUrl: buffer.text });
      this.aiModels = [];
      buffer.text = next.apiBaseUrl;
      this.markAiEndpointEdited();
      this.statusText = "AI base URL updated";
    } else if (key === "aiApiKey") {
      saveAiEndpointConfig({ ...config, apiKey: buffer.text.trim() });
      buffer.text = buffer.text.trim();
      this.markAiEndpointEdited();
      this.statusText = "AI API key updated";
    } else if (key === "aiModel") {
      const model = buffer.text.trim();
      saveAiEndpointConfig({ ...config, model });
      buffer.text = model;
      this.statusText = model ? `AI model ${model}` : "AI model cleared";
    } else {
      const value = Number.parseInt(buffer.text, 10);
      const maxContextTokens = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
      saveAiEndpointConfig({ ...config, maxContextTokens });
      buffer.text = maxContextTokens ? String(maxContextTokens) : "";
      this.statusText = maxContextTokens ? "AI max context tokens updated" : "AI max context tokens set to auto-detect";
    }
    buffer.cursor = buffer.text.length;
    buffer.anchor = buffer.cursor;
    buffer.scrollX = 0;
  }
  setSettingsNumberCursorFromPoint(x, rect, extend) {
    const offset = x - (rect.x + this.ui(8)) + this.settingsNumberBuffer.scrollX;
    const col = this.columnFromTextOffset(this.settingsNumberBuffer.text, offset, "ui");
    this.settingsNumberBuffer.cursor = col;
    if (!extend) this.settingsNumberBuffer.anchor = col;
    this.revealMiniBufferCaret(this.settingsNumberBuffer, rect, this.ui(8));
    this.resetCaretBlink();
  }
  selectSettingsNumberWordFromPoint(_x, _rect) {
    this.settingsNumberBuffer.selectAll();
    this.resetCaretBlink();
  }
  pointHitsSettingsNumberSelection(x, rect) {
    if (!this.settingsNumberBuffer.hasSelection()) return false;
    if (x >= rect.x && x <= rect.x + rect.w) return true;
    const start = Math.min(this.settingsNumberBuffer.anchor, this.settingsNumberBuffer.cursor);
    const end = Math.max(this.settingsNumberBuffer.anchor, this.settingsNumberBuffer.cursor);
    const textX = rect.x + this.ui(8) - this.settingsNumberBuffer.scrollX;
    const startX = textX + this.renderer.measureText(this.settingsNumberBuffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(this.settingsNumberBuffer.text.slice(0, end), "ui");
    return x >= startX && x <= Math.max(startX + 2, endX);
  }
  settingsNumberInputRect(key = this.activeSettingsNumber) {
    return this.hits.find((hit) => hit.type === "settingsNumber" && hit.key === key)?.rect ?? null;
  }
  isSettingsNumberCaretVisible(key) {
    return this.activeSettingsNumber === key && (this.input.composing || this.isCaretBlinkOn());
  }
  async runSettingsButton(action) {
    if (action === "resetAll") {
      this.resetSettings();
      return;
    }
    if (action === "editSystemPrompt") {
      this.openSystemPromptDocument();
      return;
    }
    if (action === "editTagToolPrompt") {
      this.openTagToolPromptDocument();
      return;
    }
    if (action === "editHarmonyToolPrompt") {
      this.openHarmonyToolPromptDocument();
      return;
    }
    if (action === "editCompactPrompt") {
      this.openCompactPromptDocument();
      return;
    }
    if (action === "checkAiServer") {
      await this.checkAiServer();
      return;
    }
    if (action === "probeLmStudioModels") {
      await this.probeLmStudioModels();
      return;
    }
    if (action === "probeLmStudioMaxTokens") {
      await this.probeLmStudioMaxTokens();
      return;
    }
    this.openClearFileSystemModal();
  }
  async checkAiServer() {
    this.setAiConnectionStatus("checking", "Checking AI server...", null);
    const result = await checkOpenAICompatibleServer(loadAiEndpointConfig());
    this.applyAiServerCheckResult(result);
  }
  async probeLmStudioModels() {
    this.setAiConnectionStatus("checking", "Probing LM Studio models...", null);
    const config = loadAiEndpointConfig();
    const result = await checkOpenAICompatibleServer(config);
    if (!result.ok) {
      this.applyAiServerCheckResult(result);
      return;
    }
    this.aiModels = result.models;
    if (result.models.length > 0) {
      let selected = config.model ? result.models.find((model) => model.id === config.model) : void 0;
      if (!selected && result.models.length === 1) selected = result.models[0];
      if (selected) {
        saveAiEndpointConfig({
          ...config,
          model: selected.id,
          maxContextTokens: selected.contextLength || config.maxContextTokens
        });
      }
    }
    this.setAiConnectionStatus("ok", `Found ${result.models.length} model${result.models.length === 1 ? "" : "s"} at ${result.baseUrl}.`, "ok", result.baseUrl);
  }
  async probeLmStudioMaxTokens() {
    this.setAiConnectionStatus("checking", "Probing LM Studio max tokens...", null);
    const config = loadAiEndpointConfig();
    if (!config.model) {
      this.setAiConnectionStatus("error", "Pick a model first.");
      return;
    }
    const result = await checkOpenAICompatibleServer(config);
    if (!result.ok) {
      this.applyAiServerCheckResult(result);
      return;
    }
    if (result.models.length > 0) this.aiModels = result.models;
    const match = result.models.find((model) => model.id === config.model);
    const maxContextTokens = match?.contextLength || resolveAiContextTokens({ ...config, maxContextTokens: 0 });
    if (!maxContextTokens) {
      this.setAiConnectionStatus("ok", `Connected to ${result.baseUrl}, but no max context tokens were reported for ${config.model}.`, "ok", result.baseUrl);
      return;
    }
    saveAiEndpointConfig({ ...config, maxContextTokens });
    this.syncSettingsTextBufferFromConfig("aiMaxContextTokens");
    this.setAiConnectionStatus("ok", `Max context: ${maxContextTokens} tokens for ${config.model}.`, "ok", result.baseUrl);
  }
  applyAiServerCheckResult(result) {
    if (result.ok) {
      this.aiModels = result.models;
      this.setAiConnectionStatus("ok", result.message, "ok", result.baseUrl);
      return;
    }
    this.setAiConnectionStatus("error", result.message, "error", result.baseUrl);
  }
  setAiConnectionStatus(state, message, endpointFieldState, baseUrl) {
    this.aiConnectionStatus = {
      state,
      message,
      baseUrl,
      checkedAt: state === "idle" || state === "checking" ? void 0 : Date.now()
    };
    if (endpointFieldState !== void 0) this.aiEndpointFieldState = endpointFieldState;
    this.statusText = message;
    this.scheduleDraw();
  }
  resetSettings() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.aiModels = [];
    this.aiConnectionStatus = { state: "idle", message: "" };
    this.aiEndpointFieldState = null;
    saveAiEndpointConfig(DEFAULT_AI_ENDPOINT_CONFIG);
    resetAiPromptStorage();
    this.syncAllSettingsTextBuffersFromConfig();
    this.reloadOpenAiSpecialDocuments();
    this.settingsScrollY = 0;
    this.resetSettingsExpansion();
    this.saveAndApplySettings();
    this.statusText = "Settings reset";
  }
  syncAllSettingsTextBuffersFromConfig() {
    this.syncSettingsTextBufferFromConfig("aiBaseUrl");
    this.syncSettingsTextBufferFromConfig("aiApiKey");
    this.syncSettingsTextBufferFromConfig("aiModel");
    this.syncSettingsTextBufferFromConfig("aiMaxContextTokens");
  }
  reloadOpenAiSpecialDocuments() {
    this.replaceOpenAiDocument(AI_SETTINGS_DOC_PATH, JSON.stringify(loadAiEndpointConfig(), null, 2));
    this.replaceOpenAiDocument(AI_SYSTEM_PROMPT_DOC_PATH, loadAiSystemPrompt());
    this.replaceOpenAiDocument(AI_TAG_TOOL_PROMPT_DOC_PATH, loadAiTagToolPrompt());
    this.replaceOpenAiDocument(AI_HARMONY_TOOL_PROMPT_DOC_PATH, loadAiHarmonyToolPrompt());
    this.replaceOpenAiDocument(AI_COMPACT_PROMPT_DOC_PATH, loadAiCompactPrompt());
  }
  replaceOpenAiDocument(path, text) {
    const doc = this.docs.getByPath(path);
    if (!doc) return;
    doc.selectAll();
    doc.replaceSelection(text, "virtual");
    doc.setSelection({ line: 0, col: 0 });
    doc.markSaved();
  }
  resetSettingsExpansion() {
    this.settingsExpanded.clear();
    this.settingsExpanded.add("visual");
    this.settingsExpanded.add("interface");
    this.settingsExpanded.add("ai");
  }
  async clearFileSystemNow() {
    await this.vfs.resetToEmpty();
    this.clearPersistedEditorSession();
    this.docs.clear();
    const group = makeGroup("group-main");
    this.groups = [group];
    this.dockRoot = { type: "leaf", group };
    this.activeGroupId = group.id;
    this.activeDocId = null;
    this.openTabs = [];
    this.scrollStates.clear();
    this.tabScrollStates.clear();
    this.pendingTabRevealIds.clear();
    this.documentWidthCache.clear();
    this.lineWidthCache.clear();
    this.highlightCache.clear();
    this.findStates.clear();
    this.untitledLabels.clear();
    this.untitledPreferredNames.clear();
    this.selectedFileTreePath = null;
    this.expandedFolders.clear();
    this.knownFolders.clear();
    this.filesScrollY = 0;
    this.searchScrollY = 0;
    this.pendingCloseQueue = [];
    this.pendingDownloadDirtyQueue = [];
    await this.refreshFiles();
    this.input.blur();
    this.statusText = "File system cleared";
  }
  async clearChatNow() {
    this.chat.clear();
    await this.chat.persist();
    this.chatScrollY = 0;
    this.chatInputScrollY = 0;
    this.statusText = "Chat cleared";
  }
  copyTextToClipboard(text) {
    this.localClipboard = text;
    void copyText(text);
  }
  async readTextFromClipboard() {
    if (isMobileWebKit()) return this.localClipboard;
    const text = await readClipboardText();
    if (text === null) return this.localClipboard || null;
    if (text) this.localClipboard = text;
    return text || this.localClipboard;
  }
  openSystemCopyDialog(text, restoreFocus) {
    this.localClipboard = text;
    this.openSystemClipboardDialog({
      title: "System Copy",
      message: "Direct clipboard access on iOS is not available from this WebGL editor. Use the text field below with the system text menu to copy.",
      value: text,
      okLabel: "OK",
      selectText: true,
      restoreFocus,
      onOk: (value) => {
        this.localClipboard = value;
        this.statusText = "System copy text shown";
        this.scheduleDraw();
      }
    });
  }
  openSystemPasteDialog(onPaste, restoreFocus) {
    this.openSystemClipboardDialog({
      title: "System Paste",
      message: "Direct clipboard access on iOS is not available from this WebGL editor. Paste into the text field below, then tap OK.",
      value: "",
      okLabel: "OK",
      selectText: false,
      restoreFocus,
      onOk: (value) => {
        if (!value) {
          this.statusText = "Clipboard empty";
          this.scheduleDraw();
          return;
        }
        this.localClipboard = value;
        onPaste(value);
      }
    });
  }
  openSystemClipboardDialog(options) {
    this.closeSystemClipboardDialog();
    this.closeSystemFileUploadDialog();
    this.viewport.setVisualViewportCanvasResizeEnabled(false);
    this.input.blur();
    const overlay = document.createElement("div");
    overlay.className = "system-clipboard-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    this.applySystemClipboardTheme(overlay);
    const dialog = document.createElement("div");
    dialog.className = "system-clipboard-dialog";
    const title = document.createElement("h2");
    title.textContent = options.title;
    const message = document.createElement("p");
    message.textContent = options.message;
    const textarea = document.createElement("textarea");
    textarea.className = "system-clipboard-field";
    textarea.value = options.value;
    textarea.autocapitalize = "off";
    textarea.autocomplete = "off";
    textarea.spellcheck = false;
    textarea.setAttribute("autocorrect", "off");
    const actions = document.createElement("div");
    actions.className = "system-clipboard-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "system-clipboard-button secondary";
    cancel.textContent = "Cancel";
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "system-clipboard-button primary";
    ok.textContent = options.okLabel;
    actions.append(cancel, ok);
    dialog.append(title, message, textarea, actions);
    overlay.append(dialog);
    document.body.append(overlay);
    this.systemClipboardOverlay = overlay;
    this.systemClipboardViewportCleanup = this.installSystemClipboardViewportSync(overlay);
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      this.closeSystemClipboardDialog();
      options.restoreFocus();
      this.scheduleDraw();
    };
    cancel.addEventListener("click", close);
    ok.addEventListener("click", () => {
      const value = textarea.value;
      close();
      options.onOk(value);
    });
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) close();
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    });
    window.setTimeout(() => {
      textarea.focus({ preventScroll: true });
      if (options.selectText) textarea.select();
    });
  }
  applySystemClipboardTheme(overlay) {
    overlay.style.setProperty("--system-clipboard-overlay-bg", colorToCss(this.settings.theme === "light" ? theme.text : theme.background, 0.48));
    overlay.style.setProperty("--system-clipboard-panel", colorToCss(theme.panel2, 0.99));
    overlay.style.setProperty("--system-clipboard-field-bg", colorToCss(theme.background));
    overlay.style.setProperty("--system-clipboard-divider", colorToCss(theme.divider));
    overlay.style.setProperty("--system-clipboard-text", colorToCss(theme.text));
    overlay.style.setProperty("--system-clipboard-text-dim", colorToCss(theme.textDim));
    overlay.style.setProperty("--system-clipboard-accent", colorToCss(theme.accent));
    overlay.style.setProperty("--system-clipboard-secondary", colorToCss(theme.activityActive));
    overlay.style.setProperty("--system-clipboard-button-text", colorToCss(this.settings.theme === "light" ? theme.panel2 : theme.text));
  }
  installSystemClipboardViewportSync(overlay) {
    const sync = () => {
      const vv = window.visualViewport;
      const left = vv?.offsetLeft ?? 0;
      const top = vv?.offsetTop ?? 0;
      const width = vv?.width ?? window.innerWidth;
      const height = vv?.height ?? window.innerHeight;
      overlay.style.left = `${left}px`;
      overlay.style.top = `${top}px`;
      overlay.style.width = `${Math.max(1, width)}px`;
      overlay.style.height = `${Math.max(1, height)}px`;
      overlay.style.setProperty("--system-clipboard-width", `${Math.max(1, width)}px`);
      overlay.style.setProperty("--system-clipboard-height", `${Math.max(1, height)}px`);
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      this.viewport.setVisualViewportCanvasResizeEnabled(true);
    };
  }
  closeSystemClipboardDialog() {
    this.systemClipboardOverlay?.remove();
    this.systemClipboardOverlay = null;
    this.systemClipboardViewportCleanup?.();
    this.systemClipboardViewportCleanup = null;
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
      this.primeRenameKeyboardForTouch();
      await this.createFileInFolder(path);
      return;
    }
    if (command === "createFolder") {
      this.primeRenameKeyboardForTouch();
      await this.createFolderInFolder(path);
      return;
    }
    this.requestFileUpload(path);
  }
  async runRootContextMenuCommand(command) {
    if (command === "createFile") {
      this.primeRenameKeyboardForTouch();
      await this.createFileInFolder("/");
    } else if (command === "createFolder") {
      this.primeRenameKeyboardForTouch();
      await this.createFolderInFolder("/");
    } else if (command === "uploadFile") {
      this.requestFileUpload("/");
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
    this.clearFileTreeSelectionUnder(target);
    const doc = this.docs.getByPath(target);
    if (doc) this.closeTab(doc.id);
    await this.vfs.remove(target);
    this.docs.removePath(target);
    await this.refreshFiles();
    this.syncOpenTabs();
    this.statusText = `Deleted ${target}`;
    if (this.activeDoc()) this.focusEditor();
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
    this.clearFileTreeSelectionUnder(target);
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
    if (this.activeDoc()) this.focusEditor();
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
    this.selectFileTreePath(path);
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
    this.selectFileTreePath(path);
    this.startRename(path);
  }
  requestFileUpload(folderPath) {
    this.uploadTargetFolder = normalizePath(folderPath);
    if (isIOSDevice()) {
      this.openSystemFileUploadDialog(this.uploadTargetFolder);
      return;
    }
    const input = this.ensureUploadInput();
    input.value = "";
    input.click();
  }
  openSystemFileUploadDialog(folderPath) {
    this.closeSystemFileUploadDialog();
    this.closeSystemClipboardDialog();
    this.viewport.setVisualViewportCanvasResizeEnabled(false);
    this.input.blur();
    const targetFolder = normalizePath(folderPath);
    const overlay = document.createElement("div");
    overlay.className = "system-clipboard-overlay system-file-upload-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    this.applySystemClipboardTheme(overlay);
    const dialog = document.createElement("div");
    dialog.className = "system-clipboard-dialog system-file-upload-dialog";
    const title = document.createElement("h2");
    title.textContent = "Upload File";
    const message = document.createElement("p");
    message.textContent = targetFolder === "/" ? "Choose one or more files to upload to the workspace root, then tap OK." : `Choose one or more files to upload to ${targetFolder}, then tap OK.`;
    const input = document.createElement("input");
    input.className = "system-file-upload-field";
    input.type = "file";
    input.multiple = true;
    const status = document.createElement("p");
    status.className = "system-file-upload-status";
    status.textContent = "No files selected";
    const actions = document.createElement("div");
    actions.className = "system-clipboard-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "system-clipboard-button secondary";
    cancel.textContent = "Cancel";
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "system-clipboard-button primary";
    ok.textContent = "OK";
    ok.disabled = true;
    actions.append(cancel, ok);
    dialog.append(title, message, input, status, actions);
    overlay.append(dialog);
    document.body.append(overlay);
    this.systemFileUploadOverlay = overlay;
    this.systemFileUploadViewportCleanup = this.installSystemFileUploadViewportSync(overlay);
    const close = () => {
      this.closeSystemFileUploadDialog();
      this.scheduleDraw();
    };
    input.addEventListener("change", () => {
      const count = input.files?.length ?? 0;
      ok.disabled = count === 0;
      status.textContent = count === 0 ? "No files selected" : count === 1 ? input.files[0].name : `${count} files selected`;
    });
    cancel.addEventListener("click", close);
    ok.addEventListener("click", () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length === 0) {
        status.textContent = "Choose at least one file before tapping OK.";
        ok.disabled = true;
        return;
      }
      close();
      void this.uploadFilesToFolder(files, targetFolder);
    });
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) event.preventDefault();
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    });
  }
  closeSystemFileUploadDialog() {
    this.systemFileUploadOverlay?.remove();
    this.systemFileUploadOverlay = null;
    this.systemFileUploadViewportCleanup?.();
    this.systemFileUploadViewportCleanup = null;
  }
  installSystemFileUploadViewportSync(overlay) {
    const cleanup = this.installSystemClipboardViewportSync(overlay);
    return () => cleanup();
  }
  async uploadFilesToFolder(files, folderPath) {
    const parent = normalizePath(folderPath);
    const written = [];
    for (const file of files) {
      const target = await this.nextUploadPath(parent, file.name);
      await this.vfs.writeFile(target, new Uint8Array(await file.arrayBuffer()), file.type || guessMime2(target));
      written.push(target);
    }
    if (written.length === 0) return;
    this.expandedFolders.add(parent);
    await this.refreshFiles();
    this.statusText = written.length === 1 ? `Uploaded ${written[0]}` : `Uploaded ${written.length} files`;
    this.scheduleDraw();
  }
  async nextUploadPath(folderPath, fileName) {
    const name = sanitizeUploadedFileName(fileName);
    const candidate = joinPath(folderPath, name);
    if (!await this.vfs.stat(candidate)) return candidate;
    const dot = name.lastIndexOf(".");
    const hasExtension = dot > 0;
    const stem = hasExtension ? name.slice(0, dot) : name;
    const ext = hasExtension ? name.slice(dot) : "";
    for (let index = 2; index < 1e3; index++) {
      const next = joinPath(folderPath, `${stem} ${index}${ext}`);
      if (!await this.vfs.stat(next)) return next;
    }
    return joinPath(folderPath, `${stem}-${shortHexName()}${ext}`);
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
    if (command === "Mod+F") {
      this.openFindWidget();
      return true;
    }
    if (command === "Mod+S") {
      const doc = this.activeDoc();
      if (doc?.readOnly) {
        this.statusText = "File type not supported";
        this.scheduleDraw();
        return true;
      }
      if (doc) void this.saveDocument(doc).then((path) => {
        this.statusText = `Saved ${path}`;
        this.scheduleDraw();
      });
      return true;
    }
    if (command === "Mod+Shift+F") {
      this.sidebarMode = "search";
      if (this.sidebarWidth === 0) this.sidebarWidth = this.lastSidebarWidth || 280;
      this.focusMiniTarget("search", { x: this.ui(56), y: this.ui(48), w: this.ui(220), h: this.ui(24) });
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
      this.focusMiniTarget("chat", this.chatInputRectForFocus());
      return true;
    }
    return false;
  }
  async runSearch() {
    const query = this.searchBuffer.text.trim();
    if (!query) {
      this.searchResults = [];
      this.searchScrollY = 0;
      this.scheduleDraw();
      return;
    }
    const files = await this.vfs.listAllFiles();
    const results = [];
    for (const file of files) {
      if (file.encoding === "binary" || file.path.startsWith("/.slug-") || isUnsupportedFilePath(file.path)) continue;
      const text = this.docs.getByPath(file.path)?.getText() ?? await this.vfs.readText(file.path);
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
    this.searchScrollY = 0;
    this.statusText = `${results.length} results`;
    this.scheduleDraw();
  }
  async replaceAllInWorkspace() {
    const query = this.searchBuffer.text;
    if (!query) {
      this.statusText = "No search query";
      this.scheduleDraw();
      return;
    }
    const replacement = this.projectReplaceBuffer.text;
    const files = await this.vfs.listAllFiles();
    const targetGroup = this.activeGroup();
    let fileCount = 0;
    let replacementCount = 0;
    let firstChangedDocId = null;
    for (const file of files) {
      if (file.encoding === "binary" || file.path.startsWith("/.slug-") || isUnsupportedFilePath(file.path)) continue;
      const openDoc = this.docs.getByPath(file.path);
      if (openDoc?.readOnly) continue;
      const sourceText = openDoc?.getText() ?? await this.vfs.readText(file.path);
      const replaced = replaceAllPlainText(sourceText, query, replacement);
      if (replaced.text === sourceText) continue;
      const doc = openDoc ?? await this.docs.open(file.path);
      fileCount++;
      replacementCount += replaced.count;
      doc.selectAll();
      doc.replaceSelection(replaced.text, "replaceAll");
      if (!this.groupContaining(doc.id)) {
        targetGroup.tabs.push(doc.id);
        if (!targetGroup.activeDocId) {
          targetGroup.activeDocId = doc.id;
          this.activeGroupId = targetGroup.id;
          this.activeDocId = doc.id;
        }
      }
      firstChangedDocId ??= doc.id;
    }
    if (!this.activeDocId && firstChangedDocId) {
      targetGroup.activeDocId = firstChangedDocId;
      this.activeGroupId = targetGroup.id;
      this.activeDocId = firstChangedDocId;
    }
    this.syncOpenTabs();
    await this.runSearch();
    this.statusText = `Replaced ${replacementCount} match${replacementCount === 1 ? "" : "es"} in ${fileCount} unsaved file${fileCount === 1 ? "" : "s"}`;
    this.scheduleDraw();
  }
  openFindWidget() {
    const doc = this.activeDoc();
    if (!doc) return;
    const state = this.findStateForDoc(doc.id);
    if (!state) return;
    state.open = true;
    const selection = doc.selectedText();
    if (selection && !selection.includes("\n")) {
      state.findBuffer.text = selection;
      state.findBuffer.cursor = selection.length;
      state.findBuffer.anchor = state.findBuffer.cursor;
    }
    const rect = this.textFieldRect("find") ?? this.findFieldFallbackRect();
    this.focusTextField("find", rect);
    if (state.findBuffer.text) this.selectDocumentFindMatch(1, true);
    this.scheduleDraw();
  }
  closeFindWidget() {
    const state = this.activeFindState(false);
    if (state) state.open = false;
    this.textFieldSelecting = null;
    this.focusEditor();
    this.scheduleDraw();
  }
  selectDocumentFindMatch(direction, fromCurrent = false) {
    const doc = this.activeDoc();
    const query = this.activeFindState(false)?.findBuffer.text ?? "";
    const matches = doc ? this.documentFindMatches(doc, query) : [];
    if (!doc || matches.length === 0) {
      this.statusText = query ? "No matches" : "Find";
      this.scheduleDraw();
      return;
    }
    const head = this.offsetForPosition(doc, doc.selection.head);
    const ordered = doc.getOrderedSelection();
    const selectionStart = this.offsetForPosition(doc, ordered.start);
    const selectionEnd = this.offsetForPosition(doc, ordered.end);
    let current = matches.findIndex((match2) => match2.start === selectionStart && match2.end === selectionEnd);
    if (current < 0) {
      current = direction > 0 ? matches.findIndex((match2) => match2.start >= head) : findLastIndex(matches, (match2) => match2.end <= head);
      if (current < 0) current = direction > 0 ? 0 : matches.length - 1;
    } else if (!fromCurrent) {
      current = (current + direction + matches.length) % matches.length;
    }
    const match = matches[current];
    doc.setSelection(this.positionForOffset(doc, match.start), this.positionForOffset(doc, match.end));
    this.ensureCaretVisible(doc, this.activeEditorRect());
    this.statusText = `${current + 1} of ${matches.length}`;
    this.scheduleDraw();
  }
  replaceCurrentFindMatch() {
    const doc = this.activeDoc();
    const state = this.activeFindState(false);
    const query = state?.findBuffer.text ?? "";
    if (!doc || !query) return;
    if (doc.readOnly) {
      this.statusText = "File type not supported";
      this.scheduleDraw();
      return;
    }
    const selected = doc.selectedText();
    if (!textEqualsFindQuery(selected, query)) {
      this.selectDocumentFindMatch(1);
      return;
    }
    doc.replaceSelection(state?.replaceBuffer.text ?? "", "replace");
    this.selectDocumentFindMatch(1, true);
    this.revealEditorCaret();
  }
  replaceAllInActiveDocument() {
    const doc = this.activeDoc();
    const state = this.activeFindState(false);
    const query = state?.findBuffer.text ?? "";
    if (!doc || !query) return;
    if (doc.readOnly) {
      this.statusText = "File type not supported";
      this.scheduleDraw();
      return;
    }
    const replaced = replaceAllPlainText(doc.getText(), query, state?.replaceBuffer.text ?? "");
    if (replaced.count === 0) {
      this.statusText = "No matches";
      this.scheduleDraw();
      return;
    }
    doc.selectAll();
    doc.replaceSelection(replaced.text, "replaceAll");
    this.statusText = `Replaced ${replaced.count} match${replaced.count === 1 ? "" : "es"}`;
    this.selectDocumentFindMatch(1, true);
    this.revealEditorCaret();
  }
  documentFindMatches(doc, query) {
    if (!query) return [];
    const text = doc.getText();
    const haystack = text.toLowerCase();
    const needle = query.toLowerCase();
    const matches = [];
    let index = 0;
    while (index <= haystack.length) {
      const found = haystack.indexOf(needle, index);
      if (found < 0) break;
      matches.push({ start: found, end: found + query.length });
      index = found + Math.max(1, query.length);
    }
    return matches;
  }
  offsetForPosition(doc, pos) {
    let offset = 0;
    for (let line = 0; line < pos.line; line++) offset += doc.lines[line].length + 1;
    return offset + pos.col;
  }
  positionForOffset(doc, offset) {
    let remaining = clamp(offset, 0, doc.getText().length);
    for (let line = 0; line < doc.lines.length; line++) {
      const text = doc.lines[line];
      if (remaining <= text.length) return { line, col: remaining };
      remaining -= text.length + 1;
    }
    const last = doc.lines.length - 1;
    return { line: last, col: doc.lines[last].length };
  }
  findFieldFallbackRect() {
    const rect = this.activeEditorRect();
    return { x: rect.x + Math.max(12, rect.w - this.ui(380)), y: rect.y + this.ui(10), w: this.ui(170), h: this.ui(28) };
  }
  aiRuntimeSettings() {
    return {
      maxToolCallsPerTurn: this.settings.aiMaxToolCalls,
      detectDuplicateToolCalls: this.settings.aiDetectDuplicateToolCalls,
      toolCallFormat: this.settings.aiToolCallFormat,
      thinkingFormat: "auto",
      compactFreePercent: this.settings.aiCompactFreePercent
    };
  }
  editorContextBundle() {
    const activeDoc = this.activeDoc();
    const activePath = activeDoc?.path && !this.isAiSpecialPath(activeDoc.path) ? normalizePath(activeDoc.path) : void 0;
    const openDocs = this.docs.all().filter((doc) => !this.isAiSpecialDoc(doc));
    const context = {
      selectedText: activeDoc && !this.isAiSpecialDoc(activeDoc) ? activeDoc.selectedText() : "",
      openPaths: openDocs.map((doc) => doc.path ? normalizePath(doc.path) : this.untitledLabels.get(doc.id) ?? "Untitled"),
      openFileNames: openDocs.map((doc) => doc.path ? basename(doc.path) : this.untitledLabels.get(doc.id) ?? "Untitled"),
      fileTreePaths: this.treeNodes.map((node) => `${normalizePath(node.path)}${node.kind === "dir" ? "/" : ""}`),
      selectedFileTreePath: this.fileTreeSelectedPath() ?? void 0
    };
    if (activePath) context.activePath = activePath;
    return context;
  }
  async handleAiWorkspaceChange(change) {
    if (change.type === "write") {
      const path = normalizePath(change.path);
      this.expandFileTreeAncestors(path);
      let text = change.text;
      const doc = this.docs.getByPath(path);
      if (doc && !doc.readOnly && text === void 0 && !isUnsupportedFilePath(path)) {
        try {
          text = await this.vfs.readText(path);
        } catch {
          text = void 0;
        }
      }
      this.syncOpenDocumentFromWorkspace(path, text);
      await this.refreshFiles();
      this.syncOpenTabs();
      this.scheduleDraw();
      return;
    }
    if (change.type === "mkdir") {
      const path = normalizePath(change.path);
      this.expandFileTreeAncestors(path, true);
      await this.refreshFiles();
      this.scheduleDraw();
      return;
    }
    if (change.type === "remove") {
      const path = normalizePath(change.path);
      if (this.renamePath && this.workspaceRemoveAffectsPath(this.renamePath, path, change.recursive)) this.cancelRename();
      this.clearFileTreeSelectionUnder(path);
      const docs = this.docs.all().filter((doc) => doc.path && this.workspaceRemoveAffectsPath(doc.path, path, change.recursive));
      for (const doc of docs) {
        this.closeTab(doc.id);
        if (doc.path) this.docs.removePath(doc.path);
        this.clearDocumentCaches(doc.id);
      }
      if (path === "/" && change.recursive) {
        this.docs.clear();
        this.resetEditorSession();
      }
      this.removeFolderExpansion(path);
      await this.refreshFiles();
      this.syncOpenTabs();
      if (this.activeDoc()) this.focusEditor();
      else this.input.blur();
      this.scheduleDraw();
      return;
    }
    const oldPath = normalizePath(change.oldPath);
    const newPath = normalizePath(change.newPath);
    if (this.renamePath && isSameOrDescendant(this.renamePath, oldPath)) this.cancelRename();
    const node = await this.vfs.stat(newPath);
    if (node?.kind === "dir") {
      for (const doc of this.docs.all()) {
        if (!doc.path || !isSameOrDescendant(doc.path, oldPath)) continue;
        const nextPath = doc.path === oldPath ? newPath : joinPath(newPath, doc.path.slice(oldPath.length + 1));
        const renamed = this.docs.renamePath(doc.path, nextPath);
        if (renamed) this.clearDocumentCaches(renamed.id);
      }
      this.remapFolderExpansion(oldPath, newPath);
    } else {
      const renamed = this.docs.renamePath(oldPath, newPath);
      if (renamed) this.clearDocumentCaches(renamed.id);
    }
    this.remapFileTreeSelection(oldPath, newPath);
    this.expandFileTreeAncestors(newPath, node?.kind === "dir");
    await this.refreshFiles();
    this.syncOpenTabs();
    this.scheduleDraw();
  }
  syncOpenDocumentFromWorkspace(path, text) {
    const doc = this.docs.getByPath(path);
    if (!doc || doc.readOnly || text === void 0) return;
    if (doc.getText() !== text) {
      doc.selectAll();
      doc.replaceSelection(text, "agent");
    }
    doc.markSaved();
    this.clearDocumentCaches(doc.id);
    const group = this.groupContaining(doc.id);
    if (group) this.ensureCaretVisible(doc, group.editorRect);
  }
  expandFileTreeAncestors(path, includeSelf = false) {
    let current = includeSelf ? normalizePath(path) : dirname(path);
    while (true) {
      this.expandedFolders.add(current);
      if (current === "/") break;
      current = dirname(current);
    }
  }
  workspaceRemoveAffectsPath(path, removedPath, recursive) {
    const normalizedPath = normalizePath(path);
    const normalizedRemoved = normalizePath(removedPath);
    if (normalizedRemoved === "/") return recursive || normalizedPath === "/";
    return normalizedPath === normalizedRemoved || recursive && isSameOrDescendant(normalizedPath, normalizedRemoved);
  }
  async sendChat() {
    if (this.chat.running) return;
    const text = this.chatDraft.getText().trim();
    if (!text) return;
    this.chatDraft.selectAll();
    this.chatDraft.replaceSelection("");
    this.chatDraft.markSaved();
    this.chatInputScrollY = 0;
    this.chatScrollY = Number.MAX_SAFE_INTEGER;
    this.statusText = "Sending chat turn";
    await this.chat.send(text, this.activeDoc(), this.docs.all(), {
      runtime: this.aiRuntimeSettings(),
      editorContext: this.settings.aiInsertEditorContext ? this.editorContextBundle() : null,
      onUpdate: () => this.scheduleDraw(),
      onCompactStart: () => this.openCompactingModal(),
      onCompactEnd: () => this.closeCompactingModal(),
      onToolCallLimit: (limit, used) => this.openToolCallLimitModal(limit, used),
      onDuplicateToolCall: (call) => this.openDuplicateToolCallModal(call),
      onWorkspaceChange: (change) => this.handleAiWorkspaceChange(change)
    });
    this.chatScrollY = Number.MAX_SAFE_INTEGER;
    const latest = this.chat.visibleMessages().at(-1);
    this.statusText = latest?.role === "system" && latest.text === "Turn canceled." ? "Chat turn canceled" : "Chat turn complete";
    this.scheduleDraw();
  }
  runChatSendControl() {
    if (this.chat.running) {
      this.statusText = "Stopping chat turn";
      this.chat.cancel();
      this.scheduleDraw();
      return;
    }
    void this.sendChat();
  }
  draw() {
    this.viewport.resizeCanvas(this.renderer.gl);
    this.renderer.setViewport(this.viewport.get());
    this.renderer.beginFrame();
    this.hits.length = 0;
    this.settingsViewportRect = null;
    this.focusedSettingsInputRect = null;
    const vp = this.viewport.get();
    const activityW = this.ui(48);
    const statusH = this.ui(24);
    const sidebarW = this.sidebarWidth;
    const mainX = activityW + sidebarW;
    this.renderer.rect({ x: 0, y: 0, w: vp.cssWidth, h: vp.cssHeight }, theme.background);
    this.drawActivityBar({ x: 0, y: 0, w: activityW, h: vp.cssHeight - statusH });
    if (sidebarW > 0) this.drawSidebar({ x: activityW, y: 0, w: sidebarW, h: vp.cssHeight - statusH });
    this.drawEditorArea({ x: mainX, y: 0, w: vp.cssWidth - mainX, h: vp.cssHeight - statusH });
    if (sidebarW > 0) this.drawSidebarSplitter({ x: activityW + sidebarW - this.ui(3), y: 0, w: this.ui(6), h: vp.cssHeight - statusH });
    this.drawStatus({ x: 0, y: vp.cssHeight - statusH, w: vp.cssWidth, h: statusH });
    this.applyPendingFocusedInputReveal();
    if (this.fileDragActive) this.drawFileDropOverlay({ x: 0, y: 0, w: vp.cssWidth, h: vp.cssHeight });
    if (this.contextMenu) this.drawContextMenu();
    if (this.modal) this.drawModal();
    this.renderer.endFrame();
    this.scheduleCaretBlinkFrame();
  }
  drawFileDropOverlay(rect) {
    this.renderer.rect(rect, [theme.accent[0], theme.accent[1], theme.accent[2], 0.18]);
    const inset = this.ui(14);
    this.drawRectOutline({ x: rect.x + inset, y: rect.y + inset, w: rect.w - inset * 2, h: rect.h - inset * 2 }, theme.accent);
  }
  drawActivityBar(rect) {
    this.renderer.rect(rect, theme.activity);
    const items = [
      { mode: "files", label: "\u{1F4C2}", y: rect.y + this.ui(6) },
      { mode: "search", label: "\u{1F50D}", y: rect.y + this.ui(56) },
      { mode: "chat", label: "\u{1F4AC}", y: rect.y + this.ui(106) }
    ];
    for (const item of items) {
      const r = { x: rect.x + this.ui(6), y: item.y, w: rect.w - this.ui(12), h: this.ui(36) };
      const active = this.sidebarWidth > 0 && this.sidebarMode === item.mode;
      if (active) this.renderer.rect(r, theme.activityActive);
      else if (this.hoveredActivityButton === item.mode) this.renderer.rect(r, activityHoverColor());
      this.drawCenteredText(item.label, r, this.buttonTextColor(true, this.hoveredActivityButton === item.mode), "title");
      this.hits.push({ type: "activity", mode: item.mode, rect: r });
    }
    const settingsRect = { x: rect.x + this.ui(6), y: rect.y + rect.h - this.ui(46), w: rect.w - this.ui(12), h: this.ui(36) };
    const downloadRect = { x: rect.x + this.ui(6), y: settingsRect.y - this.ui(46), w: rect.w - this.ui(12), h: this.ui(36) };
    if (this.hoveredActivityButton === "download") this.renderer.rect(downloadRect, activityHoverColor());
    this.drawCenteredText("\u{1F4E5}", downloadRect, this.buttonTextColor(!this.downloadInProgress, this.hoveredActivityButton === "download"), "title");
    this.hits.push({ type: "downloadActivity", rect: downloadRect });
    const settingsActive = this.sidebarWidth > 0 && this.sidebarMode === "settings";
    if (settingsActive) this.renderer.rect(settingsRect, theme.activityActive);
    else if (this.hoveredActivityButton === "settings") this.renderer.rect(settingsRect, activityHoverColor());
    this.drawCenteredText("\u2699\uFE0F", settingsRect, this.buttonTextColor(true, this.hoveredActivityButton === "settings"), "title");
    this.hits.push({ type: "settingsActivity", rect: settingsRect });
  }
  drawSidebar(rect) {
    this.renderer.rect(rect, theme.panel);
    if (this.sidebarMode === "files") this.drawFilesPanel(rect);
    else if (this.sidebarMode === "search") this.drawSearchPanel(rect);
    else if (this.sidebarMode === "settings") this.drawSettingsPanel(rect);
    else this.drawChatPanel(rect);
  }
  drawSidebarSplitter(rect) {
    this.renderer.rect({ x: rect.x + this.ui(2), y: rect.y, w: 1, h: rect.h }, this.resizingSidebar ? theme.accent : theme.divider);
    this.hits.push({ type: "sidebarResize", rect });
  }
  drawPanelHeader(rect, title) {
    const headerH = this.ui(PANEL_HEADER_H);
    const header = { x: rect.x, y: rect.y, w: rect.w, h: headerH };
    this.renderer.rect(header, theme.panel2);
    this.renderer.rect({ x: header.x, y: header.y + header.h - 1, w: header.w, h: 1 }, theme.divider);
    this.renderer.text(title, header.x + this.ui(12), header.y + this.ui(9), theme.textDim, "ui");
    return this.sidebarPanelBodyRect(rect);
  }
  drawFilesPanel(rect) {
    const body = this.drawPanelHeader(rect, "FILES");
    const maxScroll = this.maxSidebarScrollY("files", body);
    this.filesScrollY = clamp(this.filesScrollY, 0, maxScroll);
    const hasScrollbar = maxScroll > 0;
    const contentBody = hasScrollbar ? { ...body, w: Math.max(0, body.w - this.editorScrollbarSize()) } : body;
    this.hits.push({ type: "filesRoot", rect: body });
    this.hits.push({ type: "filesRoot", rect: { x: rect.x, y: rect.y, w: rect.w, h: this.ui(PANEL_HEADER_H) } });
    this.renderer.pushClip(body);
    this.drawFileTreeEntries(this.fileTreeEntries(), contentBody, body.y + this.ui(8) - this.filesScrollY, 0, body);
    this.renderer.popClip();
    if (hasScrollbar) this.drawSidebarScrollbar("files", body, this.fileTreeContentHeight(), this.filesScrollY);
  }
  drawFileTreeEntries(entries, body, y, depth, clip) {
    const indent = this.ui(14);
    const rowH = this.ui(22);
    const rowGap = this.ui(2);
    for (const entry of entries) {
      if (y > clip.y + clip.h) break;
      const row = { x: body.x + this.ui(4), y, w: body.w - this.ui(8), h: rowH };
      const contentX = row.x + this.ui(6) + depth * indent;
      const visibleRow = intersectRect(row, clip);
      if (entry.type === "dir") {
        const expanded = this.expandedFolders.has(entry.path);
        if (visibleRow) {
          const selected = entry.path === this.fileTreeSelectedPath();
          const hovered = entry.path === this.hoveredFileTreePath;
          if (selected) this.renderer.rect(row, theme.panel2);
          else if (hovered) this.renderer.rect(row, this.hoverControlColor(theme.panel));
          const textColor = selected || hovered ? this.buttonTextColor(true, hovered) : theme.text;
          this.renderer.text(expanded ? "v" : ">", contentX, row.y + this.ui(4), selected || hovered ? textColor : theme.textDim, "ui");
          this.hits.push({ type: "folder", path: entry.path, expanded, rect: visibleRow });
          if (entry.path === this.renamePath) {
            this.drawFileRenameRow(entry.path, { x: contentX + this.ui(14), y: row.y, w: Math.max(this.ui(40), body.x + body.w - contentX - this.ui(14)), h: row.h }, clip);
          } else {
            this.drawClippedText(entry.name, { x: contentX + this.ui(14), y: row.y, w: Math.max(0, body.x + body.w - contentX - this.ui(14)), h: row.h }, row.y + this.ui(4), textColor, "ui");
          }
        }
        y += rowH + rowGap;
        if (expanded) y = this.drawFileTreeEntries(entry.children, body, y, depth + 1, clip);
        continue;
      }
      if (visibleRow) {
        const selected = entry.path === this.fileTreeSelectedPath();
        const hovered = entry.path === this.hoveredFileTreePath;
        if (selected) this.renderer.rect(row, theme.panel2);
        else if (hovered) this.renderer.rect(row, this.hoverControlColor(theme.panel));
        const textColor = selected || hovered ? this.buttonTextColor(true, hovered) : theme.text;
        this.hits.push({ type: "file", path: entry.path, rect: visibleRow });
        if (entry.path === this.renamePath) {
          this.drawFileRenameRow(entry.path, { x: contentX - this.ui(4), y: row.y, w: Math.max(this.ui(40), body.x + body.w - contentX), h: row.h }, clip);
        } else {
          this.drawClippedText(entry.name, { x: contentX, y: row.y, w: Math.max(0, body.x + body.w - contentX), h: row.h }, row.y + this.ui(4), textColor, "ui");
        }
      }
      y += rowH + rowGap;
    }
    return y;
  }
  drawFileRenameRow(path, row, hitClip) {
    const input = { x: row.x + this.ui(4), y: row.y + 1, w: row.w - this.ui(8), h: row.h - 2 };
    const invalidRanges = invalidFileNameCharacterRanges(this.renameBuffer.text);
    const invalid = !isValidFileName(this.renameBuffer.text.trim());
    const border = invalid ? theme.error : theme.accent;
    this.renderer.rect(input, theme.activity);
    this.drawRectOutline(input, border);
    const padX = this.ui(5);
    this.revealMiniBufferCaret(this.renameBuffer, input, padX);
    const content = this.miniBufferContentRect(input, padX);
    const textX = content.x - this.renameBuffer.scrollX;
    const textY = input.y + this.ui(3);
    const selectionStart = Math.min(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const selectionEnd = Math.max(this.renameBuffer.anchor, this.renameBuffer.cursor);
    const beforeSelection = this.renameBuffer.text.slice(0, selectionStart);
    const selected = this.renameBuffer.text.slice(selectionStart, selectionEnd);
    this.renderer.pushClip(content);
    if (selectionEnd > selectionStart) {
      const sx = textX + this.renderer.measureText(beforeSelection, "ui");
      const sw = Math.max(2, this.renderer.measureText(selected, "ui"));
      this.renderer.rect({ x: sx, y: input.y + this.ui(2), w: sw, h: input.h - this.ui(4) }, theme.selection);
    }
    if (this.renameBuffer.text) this.drawTextWithInvalidCharacterHighlights(this.renameBuffer.text, invalidRanges, textX, textY);
    else this.renderer.text("file name", textX, textY, theme.textDim, "ui");
    if (this.isRenameCaretVisible()) {
      const caretX = textX + this.renderer.measureText(this.renameBuffer.text.slice(0, this.renameBuffer.cursor), "ui");
      this.renderer.rect({ x: caretX, y: input.y + this.ui(3), w: 1.5, h: input.h - this.ui(6) }, theme.caret);
    }
    this.renderer.popClip();
    const hitRect = hitClip ? intersectRect(input, hitClip) : input;
    if (hitRect) this.hits.push({ type: "fileRenameInput", path, rect: hitRect });
    this.drawMiniBufferSelectionHandles({ type: "rename", path }, this.renameBuffer, input, padX, hitClip);
  }
  drawTextWithInvalidCharacterHighlights(text, invalidRanges, x, y) {
    if (invalidRanges.length === 0) {
      this.renderer.text(text, x, y, theme.text, "ui");
      return;
    }
    let cursor = 0;
    let drawX = x;
    for (const range of invalidRanges) {
      if (range.start > cursor) {
        const chunk = text.slice(cursor, range.start);
        drawX += this.renderer.text(chunk, drawX, y, theme.text, "ui");
      }
      const invalid = text.slice(range.start, range.end);
      drawX += this.renderer.text(invalid, drawX, y, theme.error, "ui");
      cursor = range.end;
    }
    if (cursor < text.length) this.renderer.text(text.slice(cursor), drawX, y, theme.text, "ui");
  }
  drawSettingsPanel(rect) {
    const body = this.drawPanelHeader(rect, "SETTINGS");
    this.hits.push({ type: "settingsRoot", rect: { x: rect.x, y: rect.y, w: rect.w, h: this.ui(PANEL_HEADER_H) } });
    this.drawSettingsContent(body);
  }
  drawSearchPanel(rect) {
    const body = this.drawPanelHeader(rect, "SEARCH");
    const toggle = { x: body.x + this.ui(10), y: body.y + this.ui(8), w: this.ui(28), h: this.ui(28) };
    const refresh = { x: body.x + body.w - this.ui(10) - this.ui(28), y: toggle.y, w: this.ui(28), h: this.ui(28) };
    const input = { x: toggle.x + toggle.w + this.ui(6), y: toggle.y, w: Math.max(this.ui(60), refresh.x - toggle.x - toggle.w - this.ui(12)), h: toggle.h };
    this.drawIconButton(toggle, this.searchReplaceExpanded ? "v" : ">", true, "ui", this.isButtonHovered("searchReplaceToggle"));
    this.hits.push({ type: "searchReplaceToggle", rect: toggle });
    this.drawSearchInput(input);
    this.drawIconButton(refresh, "\u{1F50E}", true, "ui", this.isButtonHovered("searchRefresh"));
    this.hits.push({ type: "searchRefresh", rect: refresh });
    let y = input.y + this.ui(42);
    if (this.searchReplaceExpanded) {
      const buttonW = this.ui(94);
      const replaceInput = { x: toggle.x, y, w: Math.max(this.ui(60), body.w - this.ui(20) - buttonW - this.ui(8)), h: input.h };
      const button = { x: replaceInput.x + replaceInput.w + this.ui(8), y, w: buttonW, h: input.h };
      this.drawTextFieldInput("projectReplace", replaceInput, "replace");
      this.drawButton(button, "Replace All", Boolean(this.searchBuffer.text), this.isButtonHovered("searchReplaceAll"));
      this.hits.push({ type: "searchReplaceAll", rect: button, enabled: Boolean(this.searchBuffer.text) });
      y += this.ui(42);
    }
    const resultsViewport = this.searchResultsViewport(body);
    const maxScroll = this.maxSidebarScrollY("search", resultsViewport);
    this.searchScrollY = clamp(this.searchScrollY, 0, maxScroll);
    const hasScrollbar = maxScroll > 0;
    const resultsBody = hasScrollbar ? { ...resultsViewport, w: Math.max(0, resultsViewport.w - this.editorScrollbarSize()) } : resultsViewport;
    this.renderer.pushClip(resultsViewport);
    y = resultsViewport.y - this.searchScrollY;
    for (const result of this.searchResults) {
      if (y > resultsViewport.y + resultsViewport.h) break;
      const row = { x: resultsBody.x + this.ui(8), y, w: resultsBody.w - this.ui(16), h: this.ui(38) };
      const visibleRow = intersectRect(row, resultsViewport);
      if (visibleRow) {
        this.drawClippedText(`${result.path}:${result.line + 1}`, { x: row.x + this.ui(4), y: row.y, w: Math.max(0, row.w - this.ui(8)), h: this.ui(18) }, row.y + this.ui(2), theme.accent, "ui");
        this.drawClippedText(result.text.trim().slice(0, 80), { x: row.x + this.ui(4), y: row.y + this.ui(18), w: Math.max(0, row.w - this.ui(8)), h: this.ui(18) }, row.y + this.ui(18), theme.textDim, "ui");
        this.hits.push({ type: "searchResult", path: result.path, line: result.line, rect: visibleRow });
      }
      y += this.ui(42);
    }
    this.renderer.popClip();
    if (hasScrollbar) this.drawSidebarScrollbar("search", resultsViewport, this.searchResultsContentHeight(), this.searchScrollY);
  }
  drawSearchInput(input) {
    this.drawTextFieldInput("search", input, "type to search");
  }
  drawTextFieldInput(field, input, placeholder, pushHit = true) {
    const buffer = this.bufferForTextField(field);
    const active = this.input.activeTarget?.kind === field;
    const border = this.textFieldBorderColor(field, active);
    this.renderer.rect(input, active ? theme.activity : theme.panel2);
    this.drawRectOutline(input, border);
    const padX = this.ui(8);
    if (active) this.revealMiniBufferCaret(buffer, input, padX);
    else this.clampMiniBufferScroll(buffer, input, padX);
    const content = this.miniBufferContentRect(input, padX);
    const textX = content.x - buffer.scrollX;
    const textY = input.y + this.ui(7);
    const selectionStart = Math.min(buffer.anchor, buffer.cursor);
    const selectionEnd = Math.max(buffer.anchor, buffer.cursor);
    const beforeSelection = buffer.text.slice(0, selectionStart);
    const selected = buffer.text.slice(selectionStart, selectionEnd);
    this.renderer.pushClip(content);
    if (selectionEnd > selectionStart) {
      const sx = textX + this.renderer.measureText(beforeSelection, "ui");
      const sw = Math.max(2, this.renderer.measureText(selected, "ui"));
      this.renderer.rect({ x: sx, y: input.y + this.ui(3), w: sw, h: input.h - this.ui(6) }, theme.selection);
    }
    this.renderer.text(buffer.text || placeholder, textX, textY, buffer.text ? theme.text : theme.textDim, "ui");
    if (this.isTextFieldCaretVisible(field)) {
      const caretX = textX + this.renderer.measureText(buffer.text.slice(0, buffer.cursor), "ui");
      this.renderer.rect({ x: caretX, y: input.y + this.ui(5), w: 1.5, h: input.h - this.ui(10) }, theme.caret);
    }
    this.renderer.popClip();
    if (pushHit) this.hits.push({ type: "textField", field, rect: input });
    this.drawMiniBufferSelectionHandles({ type: "textField", field }, buffer, input, padX);
  }
  textFieldBorderColor(field, active) {
    if (active) return theme.accent;
    if ((field === "aiBaseUrl" || field === "aiApiKey") && this.aiEndpointFieldState) {
      return this.aiEndpointFieldState === "ok" ? theme.accent2 : theme.error;
    }
    return theme.divider;
  }
  drawIconButton(rect, label, enabled, font = "ui", hovered = false) {
    this.renderer.rect(rect, this.buttonFill(enabled, hovered));
    this.drawRectOutline(rect, theme.divider);
    this.drawCenteredText(label, rect, this.buttonTextColor(enabled, hovered), font);
  }
  drawButton(rect, label, enabled, hovered = false) {
    this.renderer.rect(rect, this.buttonFill(enabled, hovered));
    this.drawRectOutline(rect, enabled ? theme.divider : theme.panel);
    this.drawCenteredText(label, rect, this.buttonTextColor(enabled, hovered), "ui");
  }
  buttonFill(enabled, hovered, base = theme.activityActive) {
    if (!enabled) return theme.panel2;
    return hovered ? this.hoverControlColor(base) : base;
  }
  buttonTextColor(enabled, hovered) {
    if (!enabled) return theme.textDim;
    if (!hovered) return theme.text;
    return this.settings.theme === "light" ? [0.02, 0.03, 0.04, 1] : [0.98, 0.99, 1, 1];
  }
  hoverControlColor(base) {
    const amount = this.settings.theme === "light" ? -0.07 : 0.08;
    return [
      clamp(base[0] + amount, 0, 1),
      clamp(base[1] + amount, 0, 1),
      clamp(base[2] + amount, 0, 1),
      base[3]
    ];
  }
  drawChatPanel(rect) {
    const body = this.drawPanelHeader(rect, "CHAT");
    this.hits.push({ type: "chatRoot", rect: { x: rect.x, y: rect.y, w: rect.w, h: this.ui(PANEL_HEADER_H) } });
    const layout = this.chatPanelLayoutFromBody(body);
    this.drawChatTranscript(layout.transcript);
    this.drawChatInput(layout.input);
    const label = this.chat.running ? "Stop" : "Send";
    const enabled = this.chat.running || Boolean(this.chatDraft.getText().trim());
    this.drawButton(layout.send, label, enabled, this.isButtonHovered("chatSend"));
    this.hits.push({ type: "chatSend", rect: layout.send, enabled, label });
    this.drawChatShowThinkingControl(layout.showThinking);
  }
  chatPanelLayoutFromBody(body) {
    const pad = this.ui(10);
    const gap = this.ui(8);
    const sendH = this.ui(30);
    const inputH = this.chatInputPreferredHeight();
    const rowX = body.x + pad;
    const rowW = Math.max(1, body.w - pad * 2);
    const rowY = body.y + Math.max(pad, body.h - pad - sendH);
    const labelW = this.renderer.measureText("Show thinking", "ui");
    const boxSize = this.ui(12);
    const preferredThinkingW = Math.max(this.ui(104), boxSize + labelW + this.ui(14));
    const thinkingW = Math.min(preferredThinkingW, Math.max(this.ui(74), rowW - this.ui(64) - gap));
    const sendW = Math.max(1, rowW - thinkingW - gap);
    const showThinking = { x: rowX, y: rowY, w: thinkingW, h: sendH };
    const send = { x: showThinking.x + showThinking.w + gap, y: rowY, w: sendW, h: sendH };
    const input = {
      x: body.x + pad,
      y: Math.max(body.y + pad, send.y - gap - inputH),
      w: Math.max(1, body.w - pad * 2),
      h: Math.max(this.ui(48), send.y - gap - Math.max(body.y + pad, send.y - gap - inputH))
    };
    const transcript = {
      x: body.x + pad,
      y: body.y + pad,
      w: Math.max(1, body.w - pad * 2),
      h: Math.max(1, input.y - body.y - pad - gap)
    };
    return { transcript, input, send, showThinking };
  }
  drawChatShowThinkingControl(rect) {
    const hovered = this.isButtonHovered("chatShowThinking");
    if (hovered) this.renderer.rect(rect, this.hoverControlColor(theme.activity));
    const boxSize = this.ui(12);
    const box = { x: rect.x + this.ui(3), y: rect.y + (rect.h - boxSize) / 2, w: boxSize, h: boxSize };
    this.renderer.rect(box, this.settings.showThinking ? theme.activityActive : theme.panel2);
    this.drawRectOutline(box, theme.divider);
    if (this.settings.showThinking) this.drawCenteredText("\u2714\uFE0F", box, this.buttonTextColor(true, hovered), "mini");
    const textY = rect.y + (rect.h - this.renderer.lineHeight("ui")) / 2;
    this.drawClippedText("Show thinking", { x: box.x + box.w + this.ui(5), y: rect.y, w: Math.max(0, rect.x + rect.w - box.x - box.w - this.ui(5)), h: rect.h }, textY, hovered ? this.buttonTextColor(true, true) : theme.textDim, "ui");
    this.hits.push({ type: "chatShowThinking", rect });
  }
  chatInputPreferredHeight() {
    return this.renderer.lineHeight("ui") * 4 + this.ui(14);
  }
  chatInputRectForSidebar(sidebarRect) {
    return this.chatPanelLayoutFromBody(this.sidebarPanelBodyRect(sidebarRect)).input;
  }
  chatInputRectForFocus() {
    const hit = this.hits.find((candidate) => candidate.type === "chatInput");
    if (hit) return hit.rect;
    const vp = this.viewport.get();
    return this.chatInputRectForSidebar({ x: this.ui(48), y: 0, w: Math.max(this.ui(160), this.sidebarWidth || this.lastSidebarWidth), h: vp.cssHeight - this.ui(24) });
  }
  chatDisplayMessages() {
    const messages = this.chat.visibleMessages();
    return this.settings.showThinking ? messages : messages.filter((msg) => msg.role !== "thinking");
  }
  drawChatTranscript(viewport) {
    const scrollbarSize = this.editorScrollbarSize();
    const messages = this.chatDisplayMessages();
    this.pruneChatLineCache(messages);
    let contentWidth = viewport.w;
    let contentHeight = this.chatTranscriptContentHeight(contentWidth, messages);
    const hasScrollbar = contentHeight > viewport.h;
    if (hasScrollbar) {
      contentWidth = Math.max(1, viewport.w - scrollbarSize);
      contentHeight = this.chatTranscriptContentHeight(contentWidth, messages);
    }
    this.chatScrollY = clamp(this.chatScrollY, 0, Math.max(0, contentHeight - viewport.h));
    const content = { x: viewport.x, y: viewport.y, w: contentWidth, h: viewport.h };
    this.hits.push({ type: "chatTranscript", rect: viewport });
    this.renderer.pushClip(content);
    let y = viewport.y + this.ui(4) - this.chatScrollY;
    const lineH = this.renderer.lineHeight("ui");
    const bubblePad = this.ui(8);
    const gap = this.ui(8);
    const contentBottom = content.y + content.h;
    for (const msg of messages) {
      const lines = this.chatMessageLinesCached(msg, Math.max(1, content.w - bubblePad * 2));
      const bubbleH = this.ui(26) + lines.length * lineH + bubblePad;
      if (y >= contentBottom) break;
      if (y + bubbleH <= content.y) {
        y += bubbleH + gap;
        continue;
      }
      const bubble = { x: content.x + this.ui(2), y, w: Math.max(1, content.w - this.ui(4)), h: bubbleH };
      const visibleBubble = intersectRect(bubble, content);
      if (visibleBubble) {
        this.hits.push({ type: "chatBubble", messageId: msg.id, rect: visibleBubble, viewportRect: viewport });
        const colors = this.chatRoleColors(msg.role, msg.ok);
        this.renderer.rect(visibleBubble, colors.fill);
        this.drawRectOutlineClipped(bubble, content, colors.outline);
        const label = msg.name ? `${this.chatRoleLabel(msg.role)}: ${msg.name}` : this.chatRoleLabel(msg.role);
        const labelY = bubble.y + this.ui(7);
        const stickyHeaderH = lineH + this.ui(10);
        let textClipTop = content.y;
        if (labelY + lineH >= content.y && labelY <= contentBottom) {
          this.renderer.text(label, bubble.x + bubblePad, labelY, colors.label, "ui");
        } else if (bubble.y < content.y && bubble.y + bubble.h > content.y + stickyHeaderH) {
          const header = intersectRect({ x: bubble.x, y: content.y, w: bubble.w, h: stickyHeaderH }, content);
          if (header) {
            this.renderer.rect(header, colors.fill);
            this.renderer.rect({ x: header.x, y: header.y + header.h - 1, w: header.w, h: 1 }, colors.outline);
            this.renderer.text(label, bubble.x + bubblePad, content.y + this.ui(5), colors.label, "ui");
            textClipTop = header.y + header.h;
          }
        }
        const textStartY = bubble.y + this.ui(25);
        const firstLineOffset = (textClipTop - textStartY) / lineH;
        const firstLine = Math.max(0, textClipTop > content.y ? Math.ceil(firstLineOffset) : Math.floor(firstLineOffset));
        const lastLine = Math.min(lines.length, Math.ceil((contentBottom - textStartY) / lineH) + 1);
        for (let i = firstLine; i < lastLine; i++) {
          this.renderer.text(lines[i], bubble.x + bubblePad, textStartY + i * lineH, colors.text, "ui");
        }
      }
      y += bubbleH + gap;
    }
    this.renderer.popClip();
    if (hasScrollbar) this.drawChatScrollbar("chatTranscript", viewport, contentHeight, this.chatScrollY);
  }
  drawChatInput(input) {
    const active = this.input.activeTarget?.kind === "chat";
    const metrics = this.chatInputMetrics(input);
    const { content, contentHeight, hasScrollbar, viewport, visualLines } = metrics;
    this.chatInputScrollY = clamp(this.chatInputScrollY, 0, Math.max(0, contentHeight - viewport.h));
    this.renderer.rect(input, active ? theme.activity : theme.panel2);
    this.drawRectOutline(input, active ? theme.accent : theme.divider);
    const lineH = this.renderer.lineHeight("ui");
    const doc = this.chatDraft;
    const selection = doc.getOrderedSelection();
    this.renderer.pushClip(content);
    if (!doc.getText()) {
      this.renderer.text("ask about the workspace", content.x, content.y + this.ui(7), theme.textDim, "ui");
    }
    const firstLine = Math.max(0, Math.floor(this.chatInputScrollY / lineH));
    const visibleLines = Math.ceil(content.h / lineH) + 2;
    for (let i = 0; i < visibleLines; i++) {
      const visualIndex = firstLine + i;
      const visualLine = visualLines[visualIndex];
      if (!visualLine) break;
      const y = content.y + visualIndex * lineH - this.chatInputScrollY + this.ui(4);
      this.drawChatInputSelectionForLine(visualLine, content.x, y, lineH, selection);
      if (visualLine.text) this.renderer.text(visualLine.text, content.x, y, theme.text, "ui");
    }
    if (active && (this.input.composing || this.isCaretBlinkOn())) {
      const caret = this.chatInputCaretRect(input);
      this.renderer.rect(caret, theme.caret);
      if (this.input.composing && this.input.compositionText) this.renderer.text(this.input.compositionText, caret.x + 2, caret.y, theme.warning, "ui");
    }
    this.renderer.popClip();
    this.hits.push({ type: "chatInput", rect: input });
    this.drawChatInputSelectionHandles(input, content);
    if (hasScrollbar) this.drawChatScrollbar("chatInput", input, contentHeight, this.chatInputScrollY);
  }
  drawChatInputSelectionForLine(visualLine, x, y, lineH, selection) {
    const lineIndex = visualLine.line;
    if (selection.start.line > lineIndex || selection.end.line < lineIndex) return;
    const line = this.chatDraft.lines[lineIndex] ?? "";
    const start = Math.max(visualLine.start, selection.start.line === lineIndex ? selection.start.col : 0);
    const end = Math.min(visualLine.end, selection.end.line === lineIndex ? selection.end.col : line.length);
    if (end <= start) return;
    const startX = x + this.renderer.measureText(line.slice(visualLine.start, start), "ui");
    const endX = x + this.renderer.measureText(line.slice(visualLine.start, end), "ui");
    this.renderer.rect({ x: startX, y: y - this.ui(2), w: Math.max(2, endX - startX), h: lineH }, theme.selection);
  }
  chatInputContentRect(input) {
    const pad = this.ui(8);
    return { x: input.x + pad, y: input.y + this.ui(3), w: Math.max(1, input.w - pad * 2), h: Math.max(1, input.h - this.ui(6)) };
  }
  chatInputMetrics(input) {
    const scrollbarSize = this.editorScrollbarSize();
    let viewport = input;
    let content = this.chatInputContentRect(viewport);
    let visualLines = this.chatInputVisualLines(content.w);
    let contentHeight = this.chatInputContentHeightForVisualLines(visualLines);
    const hasScrollbar = contentHeight > input.h;
    if (hasScrollbar) {
      viewport = { ...input, w: Math.max(1, input.w - scrollbarSize) };
      content = this.chatInputContentRect(viewport);
      visualLines = this.chatInputVisualLines(content.w);
      contentHeight = this.chatInputContentHeightForVisualLines(visualLines);
    }
    return { viewport, content, visualLines, contentHeight, hasScrollbar };
  }
  chatInputVisualLines(width) {
    const result = [];
    for (let line = 0; line < this.chatDraft.lineCount(); line++) {
      result.push(...this.wrapChatInputLine(line, width));
    }
    return result.length ? result : [{ line: 0, start: 0, end: 0, text: "" }];
  }
  wrapChatInputLine(lineIndex, width) {
    const text = this.chatDraft.lines[lineIndex] ?? "";
    if (!text) return [{ line: lineIndex, start: 0, end: 0, text: "" }];
    const result = [];
    const maxWidth = Math.max(1, width);
    let start = 0;
    while (start < text.length) {
      let end = start;
      let x = 0;
      let lastBreak = -1;
      while (end < text.length) {
        const codePoint = text.codePointAt(end) ?? 0;
        const char = String.fromCodePoint(codePoint);
        const next = end + char.length;
        const advance = this.renderer.measureText(char, "ui");
        if (x + advance > maxWidth && end > start) {
          if (lastBreak > start) end = lastBreak;
          break;
        }
        x += advance;
        end = next;
        if (/\s/.test(char)) lastBreak = next;
      }
      if (end <= start) {
        const codePoint = text.codePointAt(start) ?? 0;
        end = start + String.fromCodePoint(codePoint).length;
      }
      result.push({ line: lineIndex, start, end, text: text.slice(start, end) });
      start = end;
    }
    return result;
  }
  chatInputContentHeightForVisualLines(visualLines) {
    return Math.max(1, visualLines.length * this.renderer.lineHeight("ui") + this.ui(8));
  }
  chatInputContentHeight() {
    const input = this.chatInputRectForFocus();
    return this.chatInputMetrics(input).contentHeight;
  }
  chatInputVisualPositionForDocPosition(pos, visualLines) {
    const clamped = this.chatDraft.clampPosition(pos);
    let fallbackIndex = 0;
    for (let i = 0; i < visualLines.length; i++) {
      const line = visualLines[i];
      if (line.line !== clamped.line) continue;
      fallbackIndex = i;
      if (line.start === line.end && clamped.col === line.start) return { index: i, line };
      if (clamped.col >= line.start && clamped.col < line.end) return { index: i, line };
    }
    for (let i = visualLines.length - 1; i >= 0; i--) {
      const line = visualLines[i];
      if (line.line === clamped.line && clamped.col === line.end) return { index: i, line };
    }
    return { index: fallbackIndex, line: visualLines[fallbackIndex] ?? { line: clamped.line, start: 0, end: 0, text: "" } };
  }
  chatTranscriptContentHeight(width, messages = this.chatDisplayMessages()) {
    const lineH = this.renderer.lineHeight("ui");
    const bubblePad = this.ui(8);
    const gap = this.ui(8);
    let h = this.ui(4);
    for (const msg of messages) {
      const lines = this.chatMessageLinesCached(msg, Math.max(1, width - this.ui(4) - bubblePad * 2));
      h += this.ui(26) + lines.length * lineH + bubblePad + gap;
    }
    return Math.max(1, h);
  }
  chatMessageLinesCached(msg, width) {
    const widthKey = Math.round(width * 100) / 100;
    const text = msg.text;
    const first = text.length > 0 ? text.charCodeAt(0) : 0;
    const last = text.length > 0 ? text.charCodeAt(text.length - 1) : 0;
    const key = `${widthKey}:${this.settings.uiScale}:${this.renderer.lineHeight("ui")}:${text.length}:${first}:${last}`;
    const cached = this.chatLineCache.get(msg.id);
    if (cached?.key === key) return cached.lines;
    const lines = this.chatMessageLines(text, width);
    this.chatLineCache.set(msg.id, { key, lines });
    return lines;
  }
  pruneChatLineCache(messages) {
    if (this.chatLineCache.size <= messages.length + 8) return;
    const ids = new Set(messages.map((msg) => msg.id));
    for (const id of this.chatLineCache.keys()) {
      if (!ids.has(id)) this.chatLineCache.delete(id);
    }
  }
  chatMessageLines(text, width) {
    const lines = [];
    for (const rawLine of text.split("\n")) {
      const wrapped = this.wrapTextForWidth(rawLine || " ", width, "ui");
      lines.push(...wrapped);
    }
    return lines.length ? lines : [""];
  }
  chatRoleLabel(role) {
    if (role === "tool_call") return "TOOL CALL";
    if (role === "tool_result") return "TOOL RESULT";
    return role.toUpperCase();
  }
  chatRoleColors(role, ok) {
    if (role === "user") return { fill: [theme.accent[0], theme.accent[1], theme.accent[2], 0.2], outline: [theme.accent[0], theme.accent[1], theme.accent[2], 0.45], label: theme.accent, text: theme.text };
    if (role === "system") {
      if (ok === false) return { fill: [theme.error[0], theme.error[1], theme.error[2], 0.14], outline: [theme.error[0], theme.error[1], theme.error[2], 0.4], label: theme.error, text: theme.text };
      return { fill: [theme.activityActive[0], theme.activityActive[1], theme.activityActive[2], 0.72], outline: theme.divider, label: theme.textDim, text: theme.textDim };
    }
    if (role === "thinking") return { fill: [theme.keyword[0], theme.keyword[1], theme.keyword[2], 0.15], outline: [theme.keyword[0], theme.keyword[1], theme.keyword[2], 0.42], label: theme.keyword, text: theme.textDim };
    if (role === "tool_call") return { fill: [theme.number[0], theme.number[1], theme.number[2], 0.16], outline: [theme.number[0], theme.number[1], theme.number[2], 0.4], label: theme.number, text: theme.text };
    if (role === "tool_result") {
      const accent = ok === false ? theme.error : theme.string;
      return { fill: [accent[0], accent[1], accent[2], 0.14], outline: [accent[0], accent[1], accent[2], 0.4], label: accent, text: theme.text };
    }
    return { fill: theme.panel2, outline: theme.divider, label: theme.textDim, text: theme.text };
  }
  drawChatScrollbar(panel, viewport, contentHeight, scrollY) {
    const size = this.editorScrollbarSize();
    const trackRect = { x: viewport.x + viewport.w - size, y: viewport.y, w: size, h: viewport.h };
    const active = this.chatScrollbarDrag?.panel === panel;
    const hovered = this.hoveredChatScrollbar?.panel === panel;
    this.renderer.rect(trackRect, hovered || active ? [theme.activity[0], theme.activity[1], theme.activity[2], 0.9] : [theme.activity[0], theme.activity[1], theme.activity[2], 0.82]);
    const maxScroll = Math.max(0, contentHeight - viewport.h);
    const thumbRect = this.chatScrollbarThumb(viewport, trackRect, contentHeight, scrollY, maxScroll);
    const thumbColor = active ? [0.34, 0.41, 0.5, 1] : hovered ? [0.28, 0.31, 0.36, 1] : theme.activityActive;
    this.renderer.rect(thumbRect, thumbColor);
    this.hits.push({ type: "chatScrollbar", panel, rect: trackRect, trackRect, thumbRect, viewportRect: viewport, contentHeight });
  }
  chatScrollbarThumb(viewport, trackRect, contentHeight, scrollY, maxScroll) {
    const thumbH = clamp(viewport.h / Math.max(1, contentHeight) * trackRect.h, Math.min(trackRect.h, this.ui(EDITOR_SCROLLBAR_THUMB_MIN)), trackRect.h);
    const thumbTravel = Math.max(1, trackRect.h - thumbH);
    return { x: trackRect.x + this.ui(3), y: trackRect.y + (maxScroll > 0 ? scrollY / maxScroll * thumbTravel : 0), w: Math.max(this.ui(3), trackRect.w - this.ui(6)), h: thumbH };
  }
  drawEditorArea(rect) {
    this.renderer.rect(rect, theme.background);
    this.editorRect = rect;
    this.layoutDockNode(this.dockRoot, rect);
    if (this.tabDrag) {
      this.drawDockOverlay();
      if (this.tabInsertionPreview) this.drawTabInsertionPreview();
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
    const tabH = this.ui(32);
    this.drawTabs(group, { x: rect.x, y: rect.y, w: rect.w, h: tabH });
    group.editorRect = { x: rect.x, y: rect.y + tabH, w: rect.w, h: rect.h - tabH };
    if (this.isSettingsTab(group.activeDocId)) {
      this.drawSettingsView(group);
      return;
    }
    this.hits.push({ type: "editor", groupId: group.id, rect: group.editorRect });
    const doc = group.activeDocId ? this.docs.get(group.activeDocId) : void 0;
    if (!doc) {
      return;
    }
    this.drawDocument(doc, group.editorRect, this.isDocumentCaretVisible(group, doc.id), group.id);
    if (this.findStateForDoc(doc.id, false)?.open && this.isActiveDocumentInGroup(group, doc.id)) this.drawFindWidget(group.editorRect);
  }
  validTabIds(group) {
    return group.tabs.filter((docId) => this.isSettingsTab(docId) || Boolean(this.docs.get(docId)));
  }
  tabWidthForLabel(label) {
    return Math.min(this.ui(TAB_MAX_W), Math.max(this.ui(TAB_MIN_W), this.renderer.measureText(label, "ui") + this.ui(52)));
  }
  tabLayoutForGroup(group, rect) {
    const ids = this.validTabIds(group);
    const gap = this.ui(TAB_GAP);
    const items = [];
    let cursor = 0;
    for (const docId of ids) {
      const doc = this.docs.get(docId);
      const label = this.tabLabel(docId) + (doc?.dirty ? "*" : "");
      const width = this.tabWidthForLabel(label);
      items.push({ docId, label, width, start: cursor, end: cursor + width });
      cursor += width + gap;
    }
    const totalWidth = items.length ? Math.max(0, cursor - gap) : 0;
    const overflow = totalWidth > rect.w;
    const buttonW = this.ui(TAB_OVERFLOW_BUTTON_W);
    const overflowButtonRect = overflow ? { x: rect.x + rect.w - buttonW, y: rect.y, w: buttonW, h: rect.h } : null;
    const stripRect = overflow ? { x: rect.x, y: rect.y, w: Math.max(0, rect.w - buttonW), h: rect.h } : { ...rect };
    const maxScroll = Math.max(0, totalWidth - stripRect.w);
    const scroll = clamp(this.tabScrollStates.get(group.id) ?? 0, 0, maxScroll);
    this.tabScrollStates.set(group.id, scroll);
    return { items, stripRect, overflowButtonRect, scroll, maxScroll, totalWidth };
  }
  revealTabInGroup(group, docId) {
    if (group.frameRect.w <= 0) {
      this.pendingTabRevealIds.add(docId);
      return;
    }
    const layout = this.tabLayoutForGroup(group, { x: group.frameRect.x, y: group.frameRect.y, w: group.frameRect.w, h: this.ui(32) });
    const item = layout.items.find((candidate) => candidate.docId === docId);
    if (!item) return;
    const pad = Math.min(this.ui(16), layout.stripRect.w / 4);
    let scroll = layout.scroll;
    if (item.start < scroll + pad) scroll = item.start - pad;
    else if (item.end > scroll + layout.stripRect.w - pad) scroll = item.end - layout.stripRect.w + pad;
    this.tabScrollStates.set(group.id, clamp(scroll, 0, layout.maxScroll));
    this.pendingTabRevealIds.delete(docId);
  }
  drawTabs(group, rect) {
    this.renderer.rect(rect, theme.panel);
    let layout = this.tabLayoutForGroup(group, rect);
    if (group.activeDocId && this.pendingTabRevealIds.has(group.activeDocId)) {
      this.revealTabInGroup(group, group.activeDocId);
      layout = this.tabLayoutForGroup(group, rect);
    }
    this.renderer.pushClip(layout.stripRect);
    for (const item of layout.items) {
      const docId = item.docId;
      const doc = this.docs.get(docId);
      const x = layout.stripRect.x + item.start - layout.scroll;
      const tab = { x, y: rect.y, w: item.width, h: rect.h };
      if (tab.x + tab.w <= layout.stripRect.x || tab.x >= layout.stripRect.x + layout.stripRect.w) continue;
      if (docId === group.activeDocId) this.renderer.rect(tab, theme.panel2);
      const closeSize = this.ui(18);
      const close = { x: tab.x + tab.w - this.ui(26), y: tab.y + (tab.h - closeSize) / 2, w: closeSize, h: closeSize };
      this.drawClippedText(item.label, { x: tab.x + this.ui(10), y: tab.y, w: Math.max(0, close.x - tab.x - this.ui(18)), h: tab.h }, rect.y + this.ui(9), theme.text, "ui", "right");
      const closeHovered = this.isButtonHovered("tabClose", group.id, docId);
      const closeBase = docId === group.activeDocId ? theme.activityActive : theme.activity;
      this.renderer.rect(close, closeHovered ? this.hoverControlColor(closeBase) : closeBase);
      this.drawCenteredText("\u274C", close, this.buttonTextColor(true, closeHovered), "mini");
      const visibleTab = intersectRect(tab, layout.stripRect);
      const visibleClose = intersectRect(close, layout.stripRect);
      if (visibleTab) this.hits.push({ type: "tab", docId, groupId: group.id, rect: visibleTab });
      if (visibleClose) this.hits.push({ type: "tabClose", docId, groupId: group.id, rect: visibleClose });
    }
    this.renderer.popClip();
    if (layout.overflowButtonRect) {
      const active = this.contextMenu?.scope.type === "tabOverflow" && this.contextMenu.scope.groupId === group.id;
      const hovered = this.isButtonHovered("tabOverflow", group.id);
      const base = active ? theme.activityActive : theme.activity;
      this.renderer.rect(layout.overflowButtonRect, hovered ? this.hoverControlColor(base) : base);
      this.drawRectOutline(layout.overflowButtonRect, theme.divider);
      this.drawCenteredText("\u25BE", layout.overflowButtonRect, this.buttonTextColor(true, hovered), "title");
      this.hits.push({ type: "tabOverflow", groupId: group.id, rect: layout.overflowButtonRect });
    } else {
      this.tabScrollStates.set(group.id, 0);
    }
    const last = layout.items.at(-1);
    const blankX = last ? layout.stripRect.x + last.end - layout.scroll + this.ui(TAB_GAP) : layout.stripRect.x;
    if (blankX < layout.stripRect.x + layout.stripRect.w) {
      this.hits.push({ type: "tabBar", groupId: group.id, rect: { x: Math.max(blankX, layout.stripRect.x), y: rect.y, w: layout.stripRect.x + layout.stripRect.w - Math.max(blankX, layout.stripRect.x), h: rect.h } });
    }
  }
  drawDraggedTabGhost() {
    if (!this.tabDrag) return;
    const doc = this.docs.get(this.tabDrag.docId);
    const label = this.tabLabel(this.tabDrag.docId) + (doc?.dirty ? "*" : "");
    const ghost = this.dragGhostRect();
    this.renderer.rect(ghost, [theme.panel2[0], theme.panel2[1], theme.panel2[2], 0.94]);
    this.renderer.rect({ x: ghost.x, y: ghost.y, w: ghost.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: ghost.x, y: ghost.y + ghost.h - 1, w: ghost.w, h: 1 }, theme.accent);
    this.renderer.rect({ x: ghost.x, y: ghost.y, w: 1, h: ghost.h }, theme.accent);
    this.renderer.rect({ x: ghost.x + ghost.w - 1, y: ghost.y, w: 1, h: ghost.h }, theme.accent);
    this.drawClippedText(label, { x: ghost.x + this.ui(10), y: ghost.y, w: Math.max(0, ghost.w - this.ui(20)), h: ghost.h }, ghost.y + this.ui(9), theme.text, "ui", "right");
  }
  dragGhostRect() {
    const drag = this.tabDrag;
    if (!drag) return { x: 0, y: 0, w: 0, h: 0 };
    const doc = this.docs.get(drag.docId);
    const label = this.tabLabel(drag.docId) + (doc?.dirty ? "*" : "");
    const width = Math.min(this.ui(240), Math.max(this.ui(128), this.renderer.measureText(label, "ui") + this.ui(52)));
    const vp = this.viewport.get();
    return {
      x: clamp(drag.pointer.x - this.ui(18), 0, Math.max(0, vp.cssWidth - width)),
      y: clamp(drag.pointer.y - this.ui(16), 0, Math.max(0, vp.cssHeight - this.ui(56))),
      w: width,
      h: this.ui(32)
    };
  }
  drawDockOverlay() {
    const targets = this.allDockTargets();
    for (const target of targets) {
      const active = this.dockPreview?.groupId === target.groupId && this.dockPreview.zone === target.zone;
      const fill = active ? [theme.accent[0], theme.accent[1], theme.accent[2], 0.34] : [theme.accent[0], theme.accent[1], theme.accent[2], 0.13];
      this.renderer.solidPolygon(target.polygon, fill);
    }
    for (const group of this.groups) {
      const center = this.dockTargetShapes(group).find((target) => target.zone === "center");
      if (!center) continue;
      this.renderer.rect(center.previewRect, [theme.background[0], theme.background[1], theme.background[2], 0.28]);
      this.drawDockRectOutline(center.previewRect, theme.accent);
      this.drawDockGuideLines(group, center.previewRect);
    }
  }
  drawTabInsertionPreview() {
    const preview = this.tabInsertionPreview;
    if (!preview) return;
    this.renderer.rect(preview.rect, theme.accent);
  }
  drawDockGuideLines(group, center) {
    const outer = group.editorRect;
    const color = [theme.accent[0], theme.accent[1], theme.accent[2], 0.78];
    this.drawDockRectOutline(outer, color);
    const lineWidth = Math.max(1, this.ui(1.5));
    this.renderer.line({ x: outer.x, y: outer.y }, { x: center.x, y: center.y }, lineWidth, color);
    this.renderer.line({ x: outer.x + outer.w, y: outer.y }, { x: center.x + center.w, y: center.y }, lineWidth, color);
    this.renderer.line({ x: outer.x + outer.w, y: outer.y + outer.h }, { x: center.x + center.w, y: center.y + center.h }, lineWidth, color);
    this.renderer.line({ x: outer.x, y: outer.y + outer.h }, { x: center.x, y: center.y + center.h }, lineWidth, color);
  }
  drawDockRectOutline(rect, color) {
    const width = Math.max(1, this.ui(1));
    const half = width / 2;
    this.renderer.line({ x: rect.x, y: rect.y + half }, { x: rect.x + rect.w, y: rect.y + half }, width, color);
    this.renderer.line({ x: rect.x, y: rect.y + rect.h - half }, { x: rect.x + rect.w, y: rect.y + rect.h - half }, width, color);
    this.renderer.line({ x: rect.x + half, y: rect.y }, { x: rect.x + half, y: rect.y + rect.h }, width, color);
    this.renderer.line({ x: rect.x + rect.w - half, y: rect.y }, { x: rect.x + rect.w - half, y: rect.y + rect.h }, width, color);
  }
  drawSettingsView(group) {
    const rect = group.editorRect;
    this.renderer.rect(rect, theme.background);
    this.drawSettingsContent(rect);
  }
  drawSettingsContent(rect) {
    const maxScroll = this.maxSettingsScrollY(rect);
    this.settingsScrollY = clamp(this.settingsScrollY, 0, maxScroll);
    const scrollbarSize = this.editorScrollbarSize();
    const scrollViewport = {
      x: rect.x,
      y: rect.y,
      w: Math.max(1, rect.w - (maxScroll > 0 ? scrollbarSize : 0)),
      h: rect.h
    };
    this.settingsViewportRect = scrollViewport;
    this.focusedSettingsInputRect = null;
    const pad = this.ui(10);
    const content = {
      x: scrollViewport.x + pad,
      y: scrollViewport.y + this.ui(8) - this.settingsScrollY,
      w: Math.max(0, scrollViewport.w - pad * 2),
      h: this.settingsViewportHeight(rect)
    };
    this.renderer.pushClip(scrollViewport);
    this.settingsHitClip = scrollViewport;
    let y = content.y;
    y = this.drawSettingsHeader("visual", "Visual", content, y, 0);
    if (this.settingsExpanded.has("visual")) {
      y = this.drawSettingsDropdownRow(content, y, 1, "Theme", this.settings.theme === "dark" ? "Dark" : "Light", "theme");
      y = this.drawSettingsNumberRow(content, y, 1, "Font Size", "fontSize", "px");
      y = this.drawSettingsNumberRow(content, y, 1, "UI Scale", "uiScale", "%");
      y = this.drawSettingsNumberRow(content, y, 1, "Tab Spaces", "tabSpaces", "");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Use Tab Stops", "useTabStops");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Monospaced Font", "monospacedFont");
    }
    y += this.ui(6);
    y = this.drawSettingsHeader("interface", "Interface", content, y, 0);
    if (this.settingsExpanded.has("interface")) {
      y = this.drawSettingsCheckboxRow(content, y, 1, "Rename On Double Click", "renameOnDoubleClick");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Show Line Numbers", "showLineNumbers");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Show White Space", "showWhitespace");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Remember Open Files", "rememberOpenFiles");
    }
    y += this.ui(6);
    y = this.drawSettingsHeader("ai", "AI", content, y, 0);
    if (this.settingsExpanded.has("ai")) {
      const endpointConfig = loadAiEndpointConfig();
      y = this.drawSettingsTextRow(content, y, 1, "API Base URL", "aiBaseUrl", endpointConfig.apiBaseUrl, "http://localhost:1234/v1");
      y = this.drawSettingsTextRow(content, y, 1, "API Key", "aiApiKey", endpointConfig.apiKey, "(optional)");
      y = this.drawSettingsButtonRow(content, y, 1, "Check Server", "checkAiServer", {
        buttonLabel: this.aiConnectionStatus.state === "checking" ? "Checking..." : "Check",
        enabled: this.aiConnectionStatus.state !== "checking"
      });
      y = this.drawSettingsStatusRow(content, y, 1);
      y = this.drawSettingsModelRows(content, y, 1, endpointConfig.model || "Select Model");
      y = this.drawSettingsInlineTextRow(content, y, 1, "Max Context Tokens", "aiMaxContextTokens", endpointConfig.maxContextTokens ? String(endpointConfig.maxContextTokens) : "", "auto-detect");
      y = this.drawSettingsButtonRow(content, y, 1, "Probe LM Studio Max Tokens", "probeLmStudioMaxTokens", { buttonLabel: "Probe" });
      y = this.drawSettingsButtonRow(content, y, 1, "System Prompt", "editSystemPrompt", { buttonLabel: "Edit" });
      y = this.drawSettingsToolPromptRow(content, y, 1);
      y = this.drawSettingsButtonRow(content, y, 1, "Compact Prompt", "editCompactPrompt", { buttonLabel: "Edit" });
      y = this.drawSettingsDropdownRow(content, y, 1, "Tool Call Format", this.aiToolCallFormatLabel(), "aiToolCallFormat");
      y = this.drawSettingsNumberRow(content, y, 1, "Max Tool Calls Per Turn", "aiMaxToolCalls", "");
      y = this.drawSettingsNumberRow(content, y, 1, "Compact Free", "aiCompactFreePercent", "%");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Detect Duplicate Tool Calls", "aiDetectDuplicateToolCalls");
      y = this.drawSettingsCheckboxRow(content, y, 1, "Insert Editor Context", "aiInsertEditorContext");
    }
    y += this.ui(6);
    y = this.drawSettingsHeader("danger", "Danger", content, y, 0);
    if (this.settingsExpanded.has("danger")) {
      y = this.drawSettingsButtonRow(content, y, 1, "Reset Settings", "resetAll", { buttonLabel: "Reset" });
      y = this.drawSettingsButtonRow(content, y, 1, "Clear File System", "clearFileSystem", { danger: true });
    }
    this.settingsHitClip = null;
    this.renderer.popClip();
    if (maxScroll > 0) this.drawSettingsScrollbar(rect, scrollViewport, maxScroll);
  }
  drawSettingsHeader(id, label, content, y, depth) {
    const indent = this.ui(20) * depth;
    const row = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(30) };
    this.renderer.rect(row, depth === 0 ? theme.panel : theme.panel2);
    this.renderer.rect({ x: row.x, y: row.y + row.h - 1, w: row.w, h: 1 }, theme.divider);
    this.renderer.text(this.settingsExpanded.has(id) ? "v" : ">", row.x + this.ui(8), row.y + this.ui(8), theme.textDim, "ui");
    this.renderer.text(label, row.x + this.ui(26), row.y + this.ui(8), theme.text, "ui");
    this.pushSettingsHit({ type: "settingsHeader", id, rect: row });
    return y + row.h;
  }
  drawSettingsRow(content, y, depth, label) {
    const indent = this.ui(20) * depth;
    const row = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(34) };
    const controlW = Math.min(this.ui(220), Math.max(this.ui(128), row.w * 0.36));
    const control = { x: row.x + row.w - controlW, y: row.y + this.ui(5), w: controlW, h: row.h - this.ui(10) };
    this.drawClippedText(label, { x: row.x + this.ui(8), y: row.y, w: Math.max(0, control.x - row.x - this.ui(16)), h: row.h }, row.y + this.ui(9), theme.textDim, "ui");
    return { row, control };
  }
  drawSettingsLabelRow(content, y, depth, label, value) {
    const { row, control } = this.drawSettingsRow(content, y, depth, label);
    this.drawClippedText(value, { x: control.x + this.ui(8), y: control.y, w: Math.max(0, control.w - this.ui(8)), h: control.h }, row.y + this.ui(9), theme.text, "ui", "right");
    return y + row.h;
  }
  drawSettingsTextRow(content, y, depth, label, key, value, placeholder) {
    const indent = this.ui(20) * depth;
    const row = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(54) };
    const input = { x: row.x + this.ui(8), y: row.y + this.ui(23), w: Math.max(this.ui(80), row.w - this.ui(16)), h: this.ui(26) };
    if (this.activeSettingsText !== key) {
      const buffer = this.settingsTextBuffers[key];
      buffer.text = value;
      buffer.cursor = Math.min(buffer.cursor, buffer.text.length);
      buffer.anchor = Math.min(buffer.anchor, buffer.text.length);
      this.clampMiniBufferScroll(buffer, input, this.ui(8));
      buffer.clearUndoHistory();
    }
    this.renderer.text(label, row.x + this.ui(8), row.y + this.ui(5), theme.textDim, "ui");
    if (this.activeSettingsText === key) this.focusedSettingsInputRect = input;
    this.drawTextFieldInput(key, input, placeholder, false);
    this.pushSettingsHit({ type: "textField", field: key, rect: input });
    return y + row.h;
  }
  drawSettingsInlineTextRow(content, y, depth, label, key, value, placeholder) {
    const { row, control } = this.drawSettingsRow(content, y, depth, label);
    const active = this.activeSettingsText === key;
    const buffer = this.settingsTextBuffers[key];
    if (!active) {
      buffer.text = value;
      buffer.cursor = Math.min(buffer.cursor, buffer.text.length);
      buffer.anchor = Math.min(buffer.anchor, buffer.text.length);
      this.clampMiniBufferScroll(buffer, control, this.ui(8));
      buffer.clearUndoHistory();
    }
    if (active) this.focusedSettingsInputRect = control;
    this.drawTextFieldInput(key, control, placeholder, false);
    this.pushSettingsHit({ type: "textField", field: key, rect: control });
    return y + row.h;
  }
  drawSettingsModelRows(content, y, depth, value) {
    const indent = this.ui(20) * depth;
    const labelRow = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(34) };
    const checkboxLabel = "Manual";
    const boxSize = this.ui(16);
    const checkboxLabelW = this.renderer.measureText(checkboxLabel, "ui");
    const checkboxRect = {
      x: labelRow.x + labelRow.w - checkboxLabelW - boxSize - this.ui(18),
      y: labelRow.y,
      w: checkboxLabelW + boxSize + this.ui(18),
      h: labelRow.h
    };
    const box = { x: checkboxRect.x + this.ui(2), y: labelRow.y + (labelRow.h - boxSize) / 2, w: boxSize, h: boxSize };
    const hoveredCheckbox = this.isButtonHovered("settingsCheckbox", "aiModelManual");
    const checkboxBase = this.settings.aiModelManual ? theme.activityActive : theme.panel2;
    this.drawClippedText("Model", { x: labelRow.x + this.ui(8), y: labelRow.y, w: Math.max(0, checkboxRect.x - labelRow.x - this.ui(16)), h: labelRow.h }, labelRow.y + this.ui(9), theme.textDim, "ui");
    this.renderer.rect(box, hoveredCheckbox ? this.hoverControlColor(checkboxBase) : checkboxBase);
    this.drawRectOutline(box, theme.divider);
    if (this.settings.aiModelManual) this.drawCenteredText("\u2714\uFE0F", box, this.buttonTextColor(true, hoveredCheckbox), "ui");
    this.drawClippedText(checkboxLabel, { x: box.x + box.w + this.ui(8), y: labelRow.y, w: checkboxLabelW + this.ui(2), h: labelRow.h }, labelRow.y + this.ui(9), this.buttonTextColor(true, hoveredCheckbox), "ui");
    this.pushSettingsHit({ type: "settingsCheckbox", key: "aiModelManual", rect: checkboxRect });
    const controlRow = { x: labelRow.x, y: labelRow.y + labelRow.h, w: labelRow.w, h: this.ui(34) };
    const controlY = controlRow.y + this.ui(5);
    const controlH = controlRow.h - this.ui(10);
    if (this.settings.aiModelManual) {
      const input = { x: controlRow.x + this.ui(8), y: controlY, w: Math.max(this.ui(80), controlRow.w - this.ui(16)), h: controlH };
      const buffer = this.settingsTextBuffers.aiModel;
      if (this.activeSettingsText !== "aiModel") {
        buffer.text = value === "Select Model" ? "" : value;
        buffer.cursor = Math.min(buffer.cursor, buffer.text.length);
        buffer.anchor = Math.min(buffer.anchor, buffer.text.length);
        this.clampMiniBufferScroll(buffer, input, this.ui(8));
        buffer.clearUndoHistory();
      }
      if (this.activeSettingsText === "aiModel") this.focusedSettingsInputRect = input;
      this.drawTextFieldInput("aiModel", input, "model name", false);
      this.pushSettingsHit({ type: "textField", field: "aiModel", rect: input });
    } else {
      const gap = this.ui(6);
      const buttonW = this.ui(76);
      const button = { x: controlRow.x + controlRow.w - buttonW - this.ui(8), y: controlY, w: buttonW, h: controlH };
      const dropdown = { x: controlRow.x + this.ui(8), y: controlY, w: Math.max(this.ui(80), button.x - controlRow.x - this.ui(8) - gap), h: controlH };
      const hoveredDropdown = this.isButtonHovered("settingsDropdown", "aiModel");
      this.renderer.rect(dropdown, hoveredDropdown ? this.hoverControlColor(theme.panel2) : theme.panel2);
      this.drawRectOutline(dropdown, theme.divider);
      this.drawClippedText(value, { x: dropdown.x + this.ui(8), y: dropdown.y, w: Math.max(0, dropdown.w - this.ui(30)), h: dropdown.h }, dropdown.y + this.ui(6), this.buttonTextColor(true, hoveredDropdown), "ui", "right");
      this.renderer.text("v", dropdown.x + dropdown.w - this.ui(16), dropdown.y + this.ui(6), hoveredDropdown ? this.buttonTextColor(true, true) : theme.textDim, "ui");
      this.pushSettingsHit({ type: "settingsDropdown", key: "aiModel", rect: dropdown });
      const hoveredButton = this.isButtonHovered("settingsButton", "probeLmStudioModels");
      this.renderer.rect(button, hoveredButton ? this.hoverControlColor(theme.activityActive) : theme.activityActive);
      this.drawRectOutline(button, theme.divider);
      this.drawCenteredText("Probe", button, this.buttonTextColor(true, hoveredButton), "ui");
      this.pushSettingsHit({ type: "settingsButton", action: "probeLmStudioModels", rect: button, enabled: true });
    }
    return controlRow.y + controlRow.h;
  }
  drawSettingsToolPromptRow(content, y, depth) {
    const { row, control } = this.drawSettingsRow(content, y, depth, "Tool Prompt");
    const gap = this.ui(6);
    const tagW = Math.min(Math.max(this.ui(42), this.renderer.measureText("Tag", "ui") + this.ui(22)), Math.max(this.ui(1), control.w - gap - this.ui(76)));
    const harmonyW = Math.max(this.ui(76), control.w - tagW - gap);
    const tag = { x: control.x, y: control.y, w: tagW, h: control.h };
    const harmony = { x: tag.x + tag.w + gap, y: control.y, w: harmonyW, h: control.h };
    const tagHovered = this.isButtonHovered("settingsButton", "editTagToolPrompt");
    const harmonyHovered = this.isButtonHovered("settingsButton", "editHarmonyToolPrompt");
    this.renderer.rect(tag, tagHovered ? this.hoverControlColor(theme.activityActive) : theme.activityActive);
    this.drawRectOutline(tag, theme.divider);
    this.drawCenteredText("Tag", tag, this.buttonTextColor(true, tagHovered), "ui");
    this.renderer.rect(harmony, harmonyHovered ? this.hoverControlColor(theme.activityActive) : theme.activityActive);
    this.drawRectOutline(harmony, theme.divider);
    this.drawCenteredText("Harmony", harmony, this.buttonTextColor(true, harmonyHovered), "ui");
    this.pushSettingsHit({ type: "settingsButton", action: "editTagToolPrompt", rect: tag, enabled: true });
    this.pushSettingsHit({ type: "settingsButton", action: "editHarmonyToolPrompt", rect: harmony, enabled: true });
    return y + row.h;
  }
  aiToolCallFormatLabel() {
    if (this.settings.aiToolCallFormat === "none") return "None";
    if (this.settings.aiToolCallFormat === "harmony") return "Harmony";
    return "Tag";
  }
  drawSettingsDropdownRow(content, y, depth, label, value, key) {
    const { row, control } = this.drawSettingsRow(content, y, depth, label);
    const hovered = this.isButtonHovered("settingsDropdown", key);
    this.renderer.rect(control, hovered ? this.hoverControlColor(theme.panel2) : theme.panel2);
    this.drawRectOutline(control, theme.divider);
    this.drawClippedText(value, { x: control.x + this.ui(8), y: control.y, w: Math.max(0, control.w - this.ui(30)), h: control.h }, control.y + this.ui(6), this.buttonTextColor(true, hovered), "ui", "right");
    this.renderer.text("v", control.x + control.w - this.ui(16), control.y + this.ui(6), hovered ? this.buttonTextColor(true, true) : theme.textDim, "ui");
    this.pushSettingsHit({ type: "settingsDropdown", key, rect: control });
    return y + row.h;
  }
  drawSettingsNumberRow(content, y, depth, label, key, unit) {
    const { row, control } = this.drawSettingsRow(content, y, depth, label);
    const unitW = unit ? this.renderer.measureText(unit, "ui") + this.ui(14) : 0;
    const input = { x: control.x, y: control.y, w: Math.max(this.ui(60), control.w - unitW), h: control.h };
    const active = this.activeSettingsNumber === key;
    if (active) this.focusedSettingsInputRect = input;
    this.renderer.rect(input, active ? theme.activity : theme.panel2);
    this.drawRectOutline(input, active ? theme.accent : theme.divider);
    const text = active ? this.settingsNumberBuffer.text : String(this.settings[key]);
    const padX = this.ui(8);
    if (active) this.revealMiniBufferCaret(this.settingsNumberBuffer, input, padX);
    else this.clampMiniBufferScroll(this.settingsNumberBuffer, input, padX);
    const inputContent = this.miniBufferContentRect(input, padX);
    const textX = active ? inputContent.x - this.settingsNumberBuffer.scrollX : inputContent.x;
    const textY = input.y + this.ui(6);
    this.renderer.pushClip(inputContent);
    if (active && this.settingsNumberBuffer.hasSelection()) {
      const selectionStart = Math.min(this.settingsNumberBuffer.anchor, this.settingsNumberBuffer.cursor);
      const selectionEnd = Math.max(this.settingsNumberBuffer.anchor, this.settingsNumberBuffer.cursor);
      const beforeSelection = text.slice(0, selectionStart);
      const selected = text.slice(selectionStart, selectionEnd);
      const sx = textX + this.renderer.measureText(beforeSelection, "ui");
      const sw = Math.max(2, this.renderer.measureText(selected, "ui"));
      this.renderer.rect({ x: sx, y: input.y + this.ui(3), w: sw, h: input.h - this.ui(6) }, theme.selection);
    }
    this.renderer.text(text || "0", textX, textY, text ? theme.text : theme.textDim, "ui");
    if (this.isSettingsNumberCaretVisible(key)) {
      const caretX = textX + this.renderer.measureText(text.slice(0, this.settingsNumberBuffer.cursor), "ui");
      this.renderer.rect({ x: caretX, y: input.y + this.ui(4), w: 1.5, h: input.h - this.ui(8) }, theme.caret);
    }
    this.renderer.popClip();
    if (unit) this.renderer.text(unit, input.x + input.w + this.ui(8), row.y + this.ui(9), theme.textDim, "ui");
    this.pushSettingsHit({ type: "settingsNumber", key, rect: input });
    if (active) this.drawMiniBufferSelectionHandles({ type: "settingsNumber", key }, this.settingsNumberBuffer, input, padX);
    return y + row.h;
  }
  drawSettingsCheckboxRow(content, y, depth, label, key) {
    const indent = this.ui(20) * depth;
    const row = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(34) };
    const size = this.ui(16);
    const box = { x: row.x + row.w - size - this.ui(8), y: row.y + (row.h - size) / 2, w: size, h: size };
    const hovered = this.isButtonHovered("settingsCheckbox", key);
    const base = this.settings[key] ? theme.activityActive : theme.panel2;
    this.drawClippedText(label, { x: row.x + this.ui(8), y: row.y, w: Math.max(0, box.x - row.x - this.ui(16)), h: row.h }, row.y + this.ui(9), theme.textDim, "ui");
    this.renderer.rect(box, hovered ? this.hoverControlColor(base) : base);
    this.drawRectOutline(box, theme.divider);
    if (this.settings[key]) this.drawCenteredText("\u2714\uFE0F", box, this.buttonTextColor(true, hovered), "ui");
    this.pushSettingsHit({ type: "settingsCheckbox", key, rect: row });
    return y + row.h;
  }
  drawSettingsButtonRow(content, y, depth, label, action, options = {}) {
    const buttonLabel = options.buttonLabel ?? label;
    const enabled = options.enabled ?? true;
    const { row, control } = this.drawSettingsRow(content, y, depth, label);
    const button = { x: control.x, y: control.y, w: Math.max(this.ui(128), Math.min(this.ui(190), control.w)), h: control.h };
    const hovered = enabled && this.isButtonHovered("settingsButton", action);
    const base = options.danger ? theme.error : theme.activityActive;
    this.renderer.rect(button, enabled ? hovered ? this.hoverControlColor(base) : base : theme.panel2);
    this.drawRectOutline(button, options.danger && enabled ? theme.error : theme.divider);
    this.drawCenteredText(buttonLabel, button, this.buttonTextColor(enabled, hovered), "ui");
    this.pushSettingsHit({ type: "settingsButton", action, rect: button, enabled });
    return y + row.h;
  }
  drawSettingsStatusRow(content, y, depth) {
    const indent = this.ui(20) * depth;
    const row = { x: content.x + indent, y, w: Math.max(this.ui(120), content.w - indent), h: this.ui(46) };
    const box = { x: row.x + this.ui(8), y: row.y + this.ui(3), w: Math.max(0, row.w - this.ui(16)), h: row.h - this.ui(6) };
    const state = this.aiConnectionStatus.state;
    const message = this.aiConnectionStatus.message || "Server not checked.";
    const color = this.aiConnectionStatusColor(state);
    this.renderer.rect(box, [theme.panel2[0], theme.panel2[1], theme.panel2[2], state === "idle" ? 0.58 : 0.86]);
    this.drawRectOutline(box, state === "idle" ? theme.divider : color);
    const lines = this.wrapTextForWidth(message, Math.max(1, box.w - this.ui(16)), "ui").slice(0, 2);
    const lineH = this.renderer.lineHeight("ui");
    for (let i = 0; i < lines.length; i++) {
      this.drawClippedText(lines[i], { x: box.x + this.ui(8), y: box.y + this.ui(4) + i * lineH, w: Math.max(0, box.w - this.ui(16)), h: lineH }, box.y + this.ui(5) + i * lineH, state === "idle" ? theme.textDim : color, "ui");
    }
    return y + row.h;
  }
  aiConnectionStatusColor(state) {
    if (state === "ok") return theme.accent2;
    if (state === "error") return theme.error;
    if (state === "checking") return theme.warning;
    return theme.textDim;
  }
  pushSettingsHit(hit) {
    if (!this.settingsHitClip || rectIntersects(hit.rect, this.settingsHitClip)) this.hits.push(hit);
  }
  drawSettingsScrollbar(rect, viewportRect, maxScroll) {
    const size = this.editorScrollbarSize();
    const trackRect = { x: rect.x + rect.w - size, y: rect.y, w: size, h: rect.h };
    const active = Boolean(this.settingsScrollbarDrag);
    const hovered = Boolean(this.hoveredSettingsScrollbar);
    this.renderer.rect(trackRect, hovered || active ? [theme.activity[0], theme.activity[1], theme.activity[2], 0.9] : [theme.activity[0], theme.activity[1], theme.activity[2], 0.82]);
    const thumbRect = this.settingsScrollbarThumb(rect, trackRect, this.settingsScrollY, maxScroll);
    const thumbColor = active ? [0.34, 0.41, 0.5, 1] : hovered ? [0.28, 0.31, 0.36, 1] : theme.activityActive;
    this.renderer.rect(thumbRect, thumbColor);
    this.hits.push({ type: "settingsScrollbar", rect: trackRect, trackRect, thumbRect, viewportRect });
  }
  settingsScrollbarThumb(rect, trackRect, scrollY, maxScroll) {
    const contentHeight = this.settingsContentHeight();
    const thumbH = clamp(this.settingsViewportHeight(rect) / contentHeight * trackRect.h, Math.min(trackRect.h, this.ui(EDITOR_SCROLLBAR_THUMB_MIN)), trackRect.h);
    const thumbTravel = Math.max(1, trackRect.h - thumbH);
    return { x: trackRect.x + this.ui(3), y: trackRect.y + scrollY / maxScroll * thumbTravel, w: Math.max(this.ui(3), trackRect.w - this.ui(6)), h: thumbH };
  }
  drawSidebarScrollbar(panel, viewport, contentHeight, scrollY) {
    const size = this.editorScrollbarSize();
    const trackRect = { x: viewport.x + viewport.w - size, y: viewport.y, w: size, h: viewport.h };
    const active = this.sidebarScrollbarDrag?.panel === panel;
    const hovered = this.hoveredSidebarScrollbar?.panel === panel;
    this.renderer.rect(trackRect, hovered || active ? [theme.activity[0], theme.activity[1], theme.activity[2], 0.9] : [theme.activity[0], theme.activity[1], theme.activity[2], 0.82]);
    const maxScroll = Math.max(0, contentHeight - viewport.h);
    const thumbRect = this.sidebarScrollbarThumb(viewport, trackRect, contentHeight, scrollY, maxScroll);
    const thumbColor = active ? [0.34, 0.41, 0.5, 1] : hovered ? [0.28, 0.31, 0.36, 1] : theme.activityActive;
    this.renderer.rect(thumbRect, thumbColor);
    this.hits.push({ type: "sidebarScrollbar", panel, rect: trackRect, trackRect, thumbRect, viewportRect: viewport, contentHeight });
  }
  sidebarScrollbarThumb(viewport, trackRect, contentHeight, scrollY, maxScroll) {
    const thumbH = clamp(viewport.h / Math.max(1, contentHeight) * trackRect.h, Math.min(trackRect.h, this.ui(EDITOR_SCROLLBAR_THUMB_MIN)), trackRect.h);
    const thumbTravel = Math.max(1, trackRect.h - thumbH);
    return { x: trackRect.x + this.ui(3), y: trackRect.y + (maxScroll > 0 ? scrollY / maxScroll * thumbTravel : 0), w: Math.max(this.ui(3), trackRect.w - this.ui(6)), h: thumbH };
  }
  drawRectOutline(rect, color) {
    this.renderer.rect({ x: rect.x, y: rect.y, w: rect.w, h: 1 }, color);
    this.renderer.rect({ x: rect.x, y: rect.y + rect.h - 1, w: rect.w, h: 1 }, color);
    this.renderer.rect({ x: rect.x, y: rect.y, w: 1, h: rect.h }, color);
    this.renderer.rect({ x: rect.x + rect.w - 1, y: rect.y, w: 1, h: rect.h }, color);
  }
  drawRectOutlineClipped(rect, clip, color) {
    for (const edge of [
      { x: rect.x, y: rect.y, w: rect.w, h: 1 },
      { x: rect.x, y: rect.y + rect.h - 1, w: rect.w, h: 1 },
      { x: rect.x, y: rect.y, w: 1, h: rect.h },
      { x: rect.x + rect.w - 1, y: rect.y, w: 1, h: rect.h }
    ]) {
      const visible = intersectRect(edge, clip);
      if (visible) this.renderer.rect(visible, color);
    }
  }
  drawFindWidget(editorRect) {
    const state = this.activeFindState(false);
    if (!state) return;
    const expanded = state.replaceExpanded;
    const panelW = Math.min(this.ui(560), Math.max(this.ui(360), editorRect.w - this.ui(32)));
    const rowH = this.ui(28);
    const panelH = expanded ? this.ui(78) : this.ui(42);
    const panel = {
      x: editorRect.x + editorRect.w - panelW - this.ui(12),
      y: editorRect.y + this.ui(10),
      w: panelW,
      h: panelH
    };
    this.renderer.rect(panel, [theme.panel2[0], theme.panel2[1], theme.panel2[2], 0.98]);
    this.drawRectOutline(panel, theme.divider);
    const toggle = { x: panel.x + this.ui(8), y: panel.y + this.ui(7), w: rowH, h: rowH };
    const close = { x: panel.x + panel.w - this.ui(36), y: toggle.y, w: rowH, h: rowH };
    const next = { x: close.x - this.ui(34), y: toggle.y, w: rowH, h: rowH };
    const previous = { x: next.x - this.ui(34), y: toggle.y, w: rowH, h: rowH };
    const input = { x: toggle.x + toggle.w + this.ui(6), y: toggle.y, w: Math.max(this.ui(80), previous.x - toggle.x - toggle.w - this.ui(12)), h: rowH };
    const hasQuery = Boolean(state.findBuffer.text);
    this.drawIconButton(toggle, expanded ? "v" : ">", true, "ui", this.isButtonHovered("findToggle"));
    this.hits.push({ type: "findToggle", rect: toggle });
    this.drawTextFieldInput("find", input, "find");
    this.drawIconButton(previous, "\u{1F53A}", hasQuery, "ui", this.isButtonHovered("findPrevious"));
    this.drawIconButton(next, "\u{1F53B}", hasQuery, "ui", this.isButtonHovered("findNext"));
    this.drawIconButton(close, "\u2716", true, "uiSmall", this.isButtonHovered("findClose"));
    this.hits.push({ type: "findPrevious", rect: previous, enabled: hasQuery });
    this.hits.push({ type: "findNext", rect: next, enabled: hasQuery });
    this.hits.push({ type: "findClose", rect: close });
    if (!expanded) return;
    const replaceY = panel.y + this.ui(43);
    const replaceAllW = this.ui(34);
    const replaceW = this.ui(68);
    const replaceAll = { x: panel.x + panel.w - this.ui(8) - replaceAllW, y: replaceY, w: replaceAllW, h: rowH };
    const replace = { x: replaceAll.x - this.ui(8) - replaceW, y: replaceY, w: replaceW, h: rowH };
    const replaceInput = { x: input.x, y: replaceY, w: Math.max(this.ui(80), replace.x - input.x - this.ui(8)), h: rowH };
    this.drawTextFieldInput("findReplace", replaceInput, "replace");
    this.drawButton(replace, "Replace", hasQuery, this.isButtonHovered("findReplace"));
    this.drawButton(replaceAll, "All", hasQuery, this.isButtonHovered("findReplaceAll"));
    this.hits.push({ type: "findReplace", rect: replace, enabled: hasQuery });
    this.hits.push({ type: "findReplaceAll", rect: replaceAll, enabled: hasQuery });
  }
  drawDocument(doc, rect, showCaret, groupId) {
    const scroll = this.clampScrollForDoc(doc, rect);
    const contentRect = this.editorContentRect(doc, rect);
    this.renderer.pushClip(contentRect);
    const gutterW = this.gutterWidthForDoc(doc);
    const gutterRect = { x: contentRect.x, y: contentRect.y, w: gutterW, h: contentRect.h };
    const gutterHitRect = { x: contentRect.x, y: contentRect.y, w: gutterW > 0 ? gutterW : Math.max(1, this.ui(EDITOR_TEXT_PAD_X)), h: contentRect.h };
    const textClipRect = { x: contentRect.x + gutterW, y: contentRect.y, w: Math.max(0, contentRect.w - gutterW), h: contentRect.h };
    const textX = this.editorTextX(doc, contentRect) - scroll.x;
    const lineH = this.renderer.lineHeight("code");
    if (gutterW > 0) this.renderer.rect(gutterRect, theme.panel);
    const firstLine = Math.max(0, Math.floor(scroll.y / lineH));
    const lineCount = Math.ceil(contentRect.h / lineH) + 2;
    const selection = doc.getOrderedSelection();
    for (let i = 0; i < lineCount; i++) {
      const lineIndex = firstLine + i;
      if (lineIndex >= doc.lineCount()) break;
      const y = contentRect.y + i * lineH - scroll.y % lineH;
      if (lineIndex === doc.selection.head.line) this.renderer.rect({ x: contentRect.x + gutterW, y, w: contentRect.w - gutterW, h: lineH }, theme.lineHighlight);
      if (gutterW > 0) {
        const lineNumber = String(lineIndex + 1);
        this.renderer.pushClip(gutterRect);
        this.renderer.text(lineNumber, contentRect.x + gutterW - EDITOR_GUTTER_PAD_RIGHT - this.renderer.measureText(lineNumber, "gutter"), y + 3, theme.textDim, "gutter");
        this.renderer.popClip();
      }
      this.renderer.pushClip(textClipRect);
      this.drawSelectionForLine(doc, lineIndex, textX, y, lineH, selection);
      let offset = 0;
      const visibleStart = Math.max(0, textClipRect.x - textX);
      const visibleEnd = Math.max(visibleStart, textClipRect.x + textClipRect.w - textX);
      for (const token of this.tokensForLine(doc, lineIndex)) {
        if (offset > visibleEnd) break;
        const result = this.drawVisibleCodeText(token.text, textX, y + 3, tokenColor(token.type), offset, visibleStart, visibleEnd);
        offset = result.endOffset;
        if (result.clippedRight) break;
      }
      this.drawWhitespaceForLine(doc.lines[lineIndex] ?? "", lineIndex, doc.lineCount(), textX, y, lineH, visibleStart, visibleEnd);
      this.renderer.popClip();
    }
    const caret = this.caretRect(doc, rect);
    const drawCaret = showCaret && (this.input.composing || this.isCaretBlinkOn());
    this.renderer.pushClip(textClipRect);
    if (drawCaret) this.renderer.rect(caret, theme.caret);
    if (drawCaret && this.input.composing && this.input.compositionText) {
      this.renderer.text(this.input.compositionText, caret.x + 2, caret.y, theme.warning, "code");
      this.renderer.rect({ x: caret.x + 2, y: caret.y + lineH - 3, w: this.measureCodeText(this.input.compositionText), h: 1 }, theme.warning);
    }
    this.renderer.popClip();
    this.drawMobileSelectionHandles(doc, rect, contentRect);
    this.hits.push({ type: "editorGutter", groupId, docId: doc.id, rect: gutterHitRect });
    this.renderer.popClip();
    this.drawEditorScrollbars(doc, rect);
  }
  drawEditorScrollbars(doc, rect) {
    const overflow = this.editorOverflow(doc, rect);
    if (overflow.vertical) this.drawEditorScrollbar(doc, rect, "vertical", overflow);
    if (overflow.horizontal) this.drawEditorScrollbar(doc, rect, "horizontal", overflow);
    if (overflow.vertical && overflow.horizontal) {
      const size = this.editorScrollbarSize();
      this.renderer.rect({ x: rect.x + rect.w - size, y: rect.y + rect.h - size, w: size, h: size }, [theme.activity[0], theme.activity[1], theme.activity[2], 0.88]);
    }
  }
  drawEditorScrollbar(doc, rect, axis, overflow) {
    const groupId = this.groupContaining(doc.id)?.id ?? this.activeGroupId;
    const contentRect = this.editorContentRectForOverflow(rect, overflow);
    const size = this.editorScrollbarSize();
    const trackRect = axis === "vertical" ? { x: contentRect.x + contentRect.w, y: contentRect.y, w: size, h: contentRect.h } : { x: contentRect.x, y: contentRect.y + contentRect.h, w: contentRect.w, h: size };
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
    const thumbH = clamp(this.editorContentRect(doc, rect).h / contentHeight * trackRect.h, Math.min(trackRect.h, this.ui(EDITOR_SCROLLBAR_THUMB_MIN)), trackRect.h);
    const thumbTravel = Math.max(1, trackRect.h - thumbH);
    return { x: trackRect.x + this.ui(3), y: trackRect.y + scrollY / maxScroll * thumbTravel, w: Math.max(this.ui(3), trackRect.w - this.ui(6)), h: thumbH };
  }
  horizontalScrollbarThumb(doc, rect, trackRect, scrollX, maxScroll) {
    const contentRect = this.editorContentRect(doc, rect);
    const visibleTextWidth = this.visibleTextWidth(doc, contentRect);
    const contentWidth = visibleTextWidth + maxScroll;
    const thumbW = clamp(visibleTextWidth / contentWidth * trackRect.w, Math.min(trackRect.w, this.ui(EDITOR_SCROLLBAR_THUMB_MIN)), trackRect.w);
    const thumbTravel = Math.max(1, trackRect.w - thumbW);
    return { x: trackRect.x + scrollX / maxScroll * thumbTravel, y: trackRect.y + this.ui(3), w: thumbW, h: Math.max(this.ui(3), trackRect.h - this.ui(6)) };
  }
  drawSelectionForLine(doc, line, x, y, lineH, selection) {
    if (!doc.hasSelection() || line < selection.start.line || line > selection.end.line) return;
    const start = line === selection.start.line ? selection.start.col : 0;
    const end = line === selection.end.line ? selection.end.col : doc.lines[line].length;
    if (end <= start) return;
    const text = doc.lines[line];
    const startX = x + this.measureCodePrefix(text, start);
    const endX = x + this.measureCodePrefix(text, end);
    this.renderer.rect({ x: startX, y, w: Math.max(2, endX - startX), h: lineH }, theme.selection);
  }
  drawMobileSelectionHandles(doc, editorRect, contentRect) {
    if (!this.isMobileSelectionMode() || !doc.hasSelection() || doc.readOnly) return;
    const group = this.groupContaining(doc.id);
    if (!group || !this.isActiveDocumentInGroup(group, doc.id)) return;
    const ordered = doc.getOrderedSelection();
    this.drawMobileSelectionHandle("start", doc, group.id, editorRect, contentRect, ordered.start);
    this.drawMobileSelectionHandle("end", doc, group.id, editorRect, contentRect, ordered.end);
  }
  drawMobileSelectionHandle(edge, doc, groupId, editorRect, contentRect, pos) {
    const caret = this.positionRectForDoc(doc, editorRect, pos);
    const hit = this.drawMobileSelectionHandleGlyph(caret, contentRect);
    if (!hit) return;
    this.hits.push({ type: "selectionHandle", edge, groupId, docId: doc.id, rect: hit });
  }
  drawMiniBufferSelectionHandles(target, buffer, input, padX, clip) {
    if (!this.isMobileSelectionMode() || !buffer.hasSelection() || !this.isTextSelectionHandleTargetActive(target)) return;
    const start = Math.min(buffer.anchor, buffer.cursor);
    const end = Math.max(buffer.anchor, buffer.cursor);
    const content = this.miniBufferContentRect(input, padX);
    const textX = content.x - buffer.scrollX;
    const y = input.y + this.ui(3);
    const h = Math.max(1, input.h - this.ui(6));
    const handleClip = clip ? intersectRect(clip, { x: content.x, y: input.y, w: content.w, h: input.h }) : { x: content.x, y: input.y, w: content.w, h: input.h };
    if (!handleClip) return;
    const startX = textX + this.renderer.measureText(buffer.text.slice(0, start), "ui");
    const endX = textX + this.renderer.measureText(buffer.text.slice(0, end), "ui");
    this.drawTextSelectionHandle("start", target, input, { x: startX, y, w: 1.5, h }, handleClip);
    this.drawTextSelectionHandle("end", target, input, { x: endX, y, w: 1.5, h }, handleClip);
  }
  drawChatInputSelectionHandles(input, contentRect) {
    if (!this.isMobileSelectionMode() || !this.chatDraft.hasSelection() || !this.isTextSelectionHandleTargetActive({ type: "chatInput" })) return;
    const ordered = this.chatDraft.getOrderedSelection();
    this.drawTextSelectionHandle("start", { type: "chatInput" }, input, this.chatInputPositionRect(input, ordered.start), contentRect);
    this.drawTextSelectionHandle("end", { type: "chatInput" }, input, this.chatInputPositionRect(input, ordered.end), contentRect);
  }
  drawTextSelectionHandle(edge, target, inputRect, caret, clipRect) {
    const hit = this.drawMobileSelectionHandleGlyph(caret, clipRect);
    if (!hit) return;
    const clippedHit = this.settingsHitClip ? intersectRect(hit, this.settingsHitClip) : hit;
    if (!clippedHit) return;
    this.hits.push({ type: "textSelectionHandle", edge, target, inputRect, rect: clippedHit });
  }
  drawMobileSelectionHandleGlyph(caret, contentRect) {
    if (caret.y + caret.h < contentRect.y || caret.y > contentRect.y + contentRect.h) return null;
    const color = theme.accent;
    const stemW = Math.max(2, this.ui(2));
    const knob = Math.max(8, this.ui(10));
    const x = clamp(caret.x, contentRect.x, contentRect.x + contentRect.w);
    const visualY = clamp(caret.y, contentRect.y, contentRect.y + contentRect.h);
    const visualH = Math.max(0, Math.min(caret.h, contentRect.y + contentRect.h - visualY));
    this.renderer.rect({ x: x - stemW / 2, y: visualY, w: stemW, h: visualH }, color);
    const cy = clamp(caret.y + caret.h + knob * 0.5, contentRect.y + knob / 2, contentRect.y + contentRect.h - knob / 2);
    this.renderer.solidPolygon(octagonPoints(x, cy, knob / 2), color);
    const hitSize = this.ui(SELECTION_HANDLE_TOUCH_SIZE);
    return { x: x - hitSize / 2, y: cy - hitSize / 2, w: hitSize, h: hitSize };
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
    const startX = x + this.measureCodePrefix(text, start);
    const endX = x + this.measureCodePrefix(text, end);
    return point.x >= startX && point.x <= Math.max(startX + 2, endX);
  }
  selectEditorWordFromPoint(doc, editorRect, point) {
    const lineH = this.renderer.lineHeight("code");
    const contentRect = this.editorContentRect(doc, editorRect);
    const scroll = this.scrollForDoc(doc.id);
    const line = clamp(Math.floor((point.y - contentRect.y + scroll.y) / lineH), 0, doc.lineCount() - 1);
    const textX = this.editorTextX(doc, contentRect);
    const col = this.columnFromCodeTextOffset(doc.lines[line], point.x - textX + scroll.x);
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
    const pad = this.ui(8);
    const gap = this.ui(10);
    const controlH = Math.min(this.ui(20), Math.max(0, rect.h - this.ui(4)));
    const y = rect.y + (rect.h - controlH) / 2;
    const textY = rect.y + (rect.h - this.renderer.lineHeight("ui")) / 2;
    let x = rect.x + rect.w - pad;
    const syntaxLabel = this.highlightLabel(doc?.syntaxId ?? "plain");
    const highlightLabel = "Highlight";
    const arrow = "\u25B4";
    const arrowW = this.renderer.measureText(arrow, "ui");
    const valueW = this.renderer.measureText(syntaxLabel, "ui") + arrowW + this.ui(18);
    const labelW = this.renderer.measureText(highlightLabel, "ui") + this.ui(6);
    const highlightValue = { x: x - valueW, y, w: valueW, h: controlH };
    const highlightLabelX = highlightValue.x - labelW;
    const highlightHovered = doc ? this.isButtonHovered("statusHighlight", this.activeGroupId, doc.id) : false;
    const highlightActive = this.contextMenu?.scope.type === "highlightDropdown" && this.contextMenu.scope.docId === doc?.id;
    this.renderer.text(highlightLabel, highlightLabelX, textY, doc ? theme.textDim : [theme.textDim[0], theme.textDim[1], theme.textDim[2], 0.55], "ui");
    if (highlightHovered || highlightActive) {
      this.renderer.rect(highlightValue, this.hoverControlColor(highlightActive ? theme.activityActive : theme.activity));
      if (highlightActive) this.drawRectOutline(highlightValue, theme.divider);
    }
    const highlightTextColor = doc ? this.buttonTextColor(true, highlightHovered || highlightActive) : theme.textDim;
    this.renderer.text(syntaxLabel, highlightValue.x + this.ui(5), textY, highlightTextColor, "ui");
    this.renderer.text(arrow, highlightValue.x + highlightValue.w - arrowW - this.ui(5), textY, highlightTextColor, "ui");
    if (doc) this.hits.push({ type: "statusHighlight", groupId: this.activeGroupId, docId: doc.id, rect: highlightValue });
    x = highlightLabelX - gap;
    const checkboxText = "Show whitespace";
    const checkboxTextW = this.renderer.measureText(checkboxText, "ui");
    const boxSize = this.ui(12);
    const checkboxW = boxSize + checkboxTextW + this.ui(11);
    const checkbox = { x: x - checkboxW, y, w: checkboxW, h: controlH };
    const checkboxHovered = this.isButtonHovered("statusWhitespace");
    if (checkboxHovered) this.renderer.rect(checkbox, this.hoverControlColor(theme.activity));
    const box = { x: checkbox.x + this.ui(3), y: rect.y + (rect.h - boxSize) / 2, w: boxSize, h: boxSize };
    this.renderer.rect(box, this.settings.showWhitespace ? theme.activityActive : theme.panel2);
    this.drawRectOutline(box, theme.divider);
    if (this.settings.showWhitespace) this.drawCenteredText("\u2714\uFE0F", box, this.buttonTextColor(true, checkboxHovered), "mini");
    this.renderer.text(checkboxText, box.x + box.w + this.ui(5), textY, checkboxHovered ? this.buttonTextColor(true, true) : theme.textDim, "ui");
    this.hits.push({ type: "statusWhitespace", rect: checkbox });
    x = checkbox.x - gap;
    const lineText = this.statusLineColumnText(doc);
    const lineW = this.renderer.measureText(lineText, "ui");
    this.renderer.text(lineText, x - lineW, textY, theme.textDim, "ui");
  }
  statusLineColumnText(doc) {
    return doc ? `Ln ${doc.selection.head.line + 1}, Col ${doc.selection.head.col + 1}` : "Ln -, Col -";
  }
  highlightLabel(syntaxId) {
    return HIGHLIGHT_OPTIONS.find((option) => option.id === syntaxId)?.label ?? syntaxId;
  }
  toggleStatusWhitespace() {
    this.settings.showWhitespace = !this.settings.showWhitespace;
    this.statusText = this.settings.showWhitespace ? "Show whitespace" : "Hide whitespace";
    this.saveAndApplySettings();
  }
  toggleChatShowThinking() {
    this.settings.showThinking = !this.settings.showThinking;
    this.statusText = this.settings.showThinking ? "Show thinking" : "Hide thinking";
    this.saveAndApplySettings();
  }
  drawCenteredText(text, rect, color, font) {
    const bounds = this.renderer.visualTextBounds(text, font);
    const x = rect.x + rect.w / 2 - (bounds.x + bounds.w / 2);
    const y = rect.y + rect.h / 2 - (bounds.y + bounds.h / 2);
    this.renderer.text(text, x, y, color, font);
  }
  drawClippedText(text, rect, y, color, font, overflowAlign = "left") {
    if (rect.w <= 0 || rect.h <= 0 || !text) return;
    const textW = this.renderer.measureText(text, font);
    const x = overflowAlign === "right" && textW > rect.w ? rect.x + rect.w - textW : rect.x;
    this.renderer.pushClip(rect);
    this.renderer.text(text, x, y, color, font);
    this.renderer.popClip();
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
      if (!isContextMenuItem(item)) {
        this.renderer.rect(item.rect, theme.divider);
        continue;
      }
      if (item.enabled && this.contextMenuHover === item.command) this.renderer.rect(item.rect, theme.activityActive);
      this.drawClippedText(item.label, { x: item.rect.x + this.ui(12), y: item.rect.y, w: Math.max(0, item.rect.w - this.ui(20)), h: item.rect.h }, item.rect.y + this.ui(7), item.enabled ? theme.text : theme.textDim, "ui", "right");
      this.hits.push({ type: "contextMenu", command: item.command, rect: item.rect, enabled: item.enabled });
    }
  }
  drawModal() {
    const modal = this.modal;
    if (!modal) return;
    const vp = this.viewport.get();
    const buttonH = this.ui(MODAL_BUTTON_H);
    const buttonGap = this.ui(MODAL_BUTTON_GAP);
    const dialogW = Math.min(this.ui(MODAL_WIDTH), Math.max(this.ui(260), vp.cssWidth - this.ui(32)));
    const contentW = dialogW - this.ui(40);
    const messageLines = this.wrapTextForWidth(modal.message, contentW, "ui");
    const detailLines = this.wrapTextForWidth(modal.detail, contentW, "ui");
    const lineH = this.ui(18);
    const textH = messageLines.length * lineH + detailLines.length * lineH;
    const progressH = modal.kind === "zipProgress" ? this.ui(26) : 0;
    const dialogH = Math.max(this.ui(168), this.ui(92) + textH + progressH + buttonH);
    const dialog = {
      x: Math.max(this.ui(12), (vp.cssWidth - dialogW) / 2),
      y: Math.max(this.ui(12), (vp.cssHeight - dialogH) / 2),
      w: dialogW,
      h: dialogH
    };
    this.renderer.rect({ x: 0, y: 0, w: vp.cssWidth, h: vp.cssHeight }, [0, 0, 0, 0.48]);
    this.renderer.rect(dialog, [theme.panel2[0], theme.panel2[1], theme.panel2[2], 0.99]);
    this.renderer.rect({ x: dialog.x, y: dialog.y, w: dialog.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: dialog.x, y: dialog.y + dialog.h - 1, w: dialog.w, h: 1 }, theme.divider);
    this.renderer.rect({ x: dialog.x, y: dialog.y, w: 1, h: dialog.h }, theme.divider);
    this.renderer.rect({ x: dialog.x + dialog.w - 1, y: dialog.y, w: 1, h: dialog.h }, theme.divider);
    this.renderer.text(modal.title, dialog.x + this.ui(20), dialog.y + this.ui(18), theme.text, "title");
    let y = dialog.y + this.ui(52);
    for (const line of messageLines) {
      this.renderer.text(line, dialog.x + this.ui(20), y, theme.text, "ui");
      y += lineH;
    }
    y += this.ui(4);
    for (const line of detailLines) {
      this.renderer.text(line, dialog.x + this.ui(20), y, theme.textDim, "ui");
      y += lineH;
    }
    if (modal.kind === "zipProgress") {
      y += this.ui(6);
      const track = { x: dialog.x + this.ui(20), y, w: contentW, h: this.ui(8) };
      this.renderer.rect(track, theme.activity);
      this.renderer.rect({ x: track.x, y: track.y, w: Math.max(1, track.w * clamp(modal.progress, 0, 1)), h: track.h }, theme.accent);
      this.drawRectOutline(track, theme.divider);
      y += this.ui(20);
    }
    const buttonsW = modal.buttons.reduce((sum, button) => sum + this.modalButtonWidth(button), 0) + buttonGap * Math.max(0, modal.buttons.length - 1);
    let x = dialog.x + dialog.w - this.ui(20) - buttonsW;
    const buttonY = dialog.y + dialog.h - buttonH - this.ui(20);
    for (const button of modal.buttons) {
      const w = this.modalButtonWidth(button);
      button.rect = { x, y: buttonY, w, h: buttonH };
      const enabled = button.enabled && !modal.pending;
      const hovered = enabled && this.modalHover === button.action;
      this.renderer.rect(button.rect, this.modalButtonColor(button.variant, hovered, enabled));
      this.drawCenteredText(button.label, button.rect, enabled ? theme.text : theme.textDim, "ui");
      this.hits.push({ type: "modalButton", action: button.action, rect: button.rect, enabled });
      x += w + buttonGap;
    }
  }
  modalButtonWidth(button) {
    return Math.max(this.ui(82), this.renderer.measureText(button.label, "ui") + this.ui(24));
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
      if (this.renderer.measureText(word, font) > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(...this.breakWordForWidth(word, width, font));
        continue;
      }
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
  breakWordForWidth(word, width, font) {
    const chunks = [];
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk && this.renderer.measureText(next, font) > width) {
        chunks.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks.length ? chunks : [word];
  }
  caretRect(doc, editorRect = this.activeEditorRect()) {
    return this.positionRectForDoc(doc, editorRect, doc.selection.head);
  }
  positionRectForDoc(doc, editorRect, pos) {
    const contentRect = this.editorContentRect(doc, editorRect);
    const lineH = this.renderer.lineHeight("code");
    const clamped = doc.clampPosition(pos);
    const line = doc.lines[clamped.line] ?? "";
    const prefixWidth = this.measureCodePrefix(line, clamped.col);
    const scroll = this.scrollForDoc(doc.id);
    return {
      x: this.editorTextX(doc, contentRect) + prefixWidth - scroll.x,
      y: contentRect.y + clamped.line * lineH - scroll.y,
      w: 2,
      h: lineH
    };
  }
  positionFromPoint(x, y) {
    const doc = this.activeDoc();
    if (!doc) return { line: 0, col: 0 };
    return this.positionFromPointInEditor(doc, this.activeEditorRect(), x, y);
  }
  positionFromPointInEditor(doc, editorRect, x, y) {
    const lineH = this.renderer.lineHeight("code");
    const contentRect = this.editorContentRect(doc, editorRect);
    const scroll = this.scrollForDoc(doc.id);
    const line = clamp(Math.floor((y - contentRect.y + scroll.y) / lineH), 0, doc.lineCount() - 1);
    const textX = this.editorTextX(doc, contentRect);
    const col = this.columnFromCodeTextOffset(doc.lines[line], x - textX + scroll.x);
    return { line, col };
  }
  columnFromTextOffset(text, offset, font = "code") {
    if (offset <= 0) return 0;
    let x = 0;
    let col = 0;
    for (const char of text) {
      const advance = this.renderer.measureText(char, font);
      if (offset < x + advance / 2) return col;
      x += advance;
      col += char.length;
    }
    return text.length;
  }
  columnFromCodeTextOffset(text, offset) {
    if (offset <= 0) return 0;
    let x = 0;
    let col = 0;
    for (const char of text) {
      const advance = this.codeAdvanceForChar(char, x);
      if (offset < x + advance / 2) return col;
      x += advance;
      col += char.length;
    }
    return text.length;
  }
  tabHitState(type) {
    return this.hits.filter((hit) => hit.type === type).map((hit) => ({ path: this.tabLabel(hit.docId), rect: hit.rect }));
  }
  activeEditorRect() {
    return this.activeGroup().editorRect;
  }
  isActiveDocumentInGroup(group, docId) {
    return group.id === this.activeGroupId && group.activeDocId === docId && this.activeDocId === docId;
  }
  isDocumentCaretVisible(group, docId) {
    const doc = this.docs.get(docId);
    return !doc?.readOnly && this.input.activeTarget?.kind === "editor" && !this.renamePath && this.isActiveDocumentInGroup(group, docId);
  }
  hasBlinkingCaretOwner() {
    const kind = this.input.activeTarget?.kind;
    return Boolean(this.renamePath || this.activeSettingsNumber || kind === "search" || kind === "chat" || kind === "projectReplace" || kind === "find" || kind === "findReplace" || kind === "editor" && this.activeDocId);
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
    const outer = group.editorRect;
    if (outer.w <= 20 || outer.h <= 20) return [];
    const centerW = outer.w * DOCK_CENTER_TARGET_RATIO;
    const centerH = outer.h * DOCK_CENTER_TARGET_RATIO;
    const center = {
      x: outer.x + outer.w * DOCK_EDGE_TARGET_RATIO,
      y: outer.y + outer.h * DOCK_EDGE_TARGET_RATIO,
      w: centerW,
      h: centerH
    };
    const leftW = outer.w * DOCK_EDGE_TARGET_RATIO;
    const rightX = outer.x + outer.w * (DOCK_EDGE_TARGET_RATIO + DOCK_CENTER_TARGET_RATIO);
    const rightW = outer.x + outer.w - rightX;
    const topH = outer.h * DOCK_EDGE_TARGET_RATIO;
    const bottomY = outer.y + outer.h * (DOCK_EDGE_TARGET_RATIO + DOCK_CENTER_TARGET_RATIO);
    const bottomH = outer.y + outer.h - bottomY;
    const outerTL = { x: outer.x, y: outer.y };
    const outerTR = { x: outer.x + outer.w, y: outer.y };
    const outerBR = { x: outer.x + outer.w, y: outer.y + outer.h };
    const outerBL = { x: outer.x, y: outer.y + outer.h };
    const centerTL = { x: center.x, y: center.y };
    const centerTR = { x: center.x + center.w, y: center.y };
    const centerBR = { x: center.x + center.w, y: center.y + center.h };
    const centerBL = { x: center.x, y: center.y + center.h };
    return [
      { groupId: group.id, zone: "top", polygon: [outerTL, outerTR, centerTR, centerTL], previewRect: { x: outer.x, y: outer.y, w: outer.w, h: topH } },
      { groupId: group.id, zone: "right", polygon: [centerTR, outerTR, outerBR, centerBR], previewRect: { x: rightX, y: outer.y, w: rightW, h: outer.h } },
      { groupId: group.id, zone: "bottom", polygon: [centerBL, centerBR, outerBR, outerBL], previewRect: { x: outer.x, y: bottomY, w: outer.w, h: bottomH } },
      { groupId: group.id, zone: "left", polygon: [outerTL, centerTL, centerBL, outerBL], previewRect: { x: outer.x, y: outer.y, w: leftW, h: outer.h } },
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
function colorToCss(color, alpha = color[3]) {
  const r = Math.round(clamp(color[0], 0, 1) * 255);
  const g = Math.round(clamp(color[1], 0, 1) * 255);
  const b = Math.round(clamp(color[2], 0, 1) * 255);
  return `rgb(${r} ${g} ${b} / ${Math.round(clamp(alpha, 0, 1) * 1e3) / 10}%)`;
}
function isEditorContextMenuCommand(command) {
  return command === "cut" || command === "copy" || command === "paste" || command === "systemCopy" || command === "systemPaste" || command === "undo" || command === "redo";
}
function isTabContextMenuCommand(command) {
  return command === "save" || command === "findInFile" || command === "close" || command === "closeOthers" || command === "resetSettings";
}
function isTabBarContextMenuCommand(command) {
  return command === "newFile" || command === "uploadFile" || command === "closeAll";
}
function tabOverflowCommand(docId) {
  return `selectTab:${docId}`;
}
function tabOverflowCommandDocId(command) {
  return command.startsWith("selectTab:") ? command.slice("selectTab:".length) : null;
}
function highlightCommand(syntaxId) {
  return `highlight:${syntaxId}`;
}
function highlightCommandSyntaxId(command) {
  if (!command.startsWith("highlight:")) return null;
  const syntaxId = command.slice("highlight:".length);
  return HIGHLIGHT_OPTIONS.some((option) => option.id === syntaxId) ? syntaxId : null;
}
function isSettingContextMenuCommand(command) {
  return command === "themeDark" || command === "themeLight" || command === "aiProviderLocal" || command === "aiProviderOpenAI" || command === "aiToolFormatNone" || command === "aiToolFormatTag" || command === "aiToolFormatHarmony" || command.startsWith("aiModel:");
}
function isSettingTextField(field) {
  return field === "aiBaseUrl" || field === "aiApiKey" || field === "aiModel" || field === "aiMaxContextTokens";
}
function aiModelCommand(modelId) {
  return `aiModel:${encodeURIComponent(modelId)}`;
}
function aiModelCommandValue(command) {
  if (!command.startsWith("aiModel:")) return null;
  try {
    return decodeURIComponent(command.slice("aiModel:".length));
  } catch {
    return command.slice("aiModel:".length);
  }
}
function isContextMenuItem(entry) {
  return entry.kind === "item";
}
function cloneSelectionState(selection) {
  return {
    anchor: { line: selection.anchor.line, col: selection.anchor.col },
    head: { line: selection.head.line, col: selection.head.col }
  };
}
function isMobileWebKit() {
  return (navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches) && /AppleWebKit/i.test(navigator.userAgent);
}
function isIOSDevice() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
function isFileContextMenuCommand(command) {
  return command === "rename" || command === "duplicate" || command === "delete";
}
function isFolderContextMenuCommand(command) {
  return command === "rename" || command === "delete" || command === "createFile" || command === "createFolder" || command === "uploadFile";
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function normalizeSettings(value) {
  const fontSize = Number(value?.fontSize);
  const uiScale = Number(value?.uiScale);
  const tabSpaces = Number(value?.tabSpaces);
  const aiMaxToolCalls = Number(value?.aiMaxToolCalls);
  const aiCompactFreePercent = Number(value?.aiCompactFreePercent);
  return {
    theme: value?.theme === "light" ? "light" : "dark",
    fontSize: Number.isFinite(fontSize) ? Math.max(1, fontSize) : DEFAULT_SETTINGS.fontSize,
    uiScale: Number.isFinite(uiScale) ? clamp(Math.trunc(uiScale), 1, 400) : DEFAULT_SETTINGS.uiScale,
    monospacedFont: typeof value?.monospacedFont === "boolean" ? value.monospacedFont : DEFAULT_SETTINGS.monospacedFont,
    tabSpaces: Number.isFinite(tabSpaces) ? clamp(Math.trunc(tabSpaces), 1, 32) : DEFAULT_SETTINGS.tabSpaces,
    useTabStops: typeof value?.useTabStops === "boolean" ? value.useTabStops : DEFAULT_SETTINGS.useTabStops,
    showWhitespace: typeof value?.showWhitespace === "boolean" ? value.showWhitespace : DEFAULT_SETTINGS.showWhitespace,
    showThinking: typeof value?.showThinking === "boolean" ? value.showThinking : DEFAULT_SETTINGS.showThinking,
    renameOnDoubleClick: typeof value?.renameOnDoubleClick === "boolean" ? value.renameOnDoubleClick : DEFAULT_SETTINGS.renameOnDoubleClick,
    showLineNumbers: typeof value?.showLineNumbers === "boolean" ? value.showLineNumbers : DEFAULT_SETTINGS.showLineNumbers,
    rememberOpenFiles: typeof value?.rememberOpenFiles === "boolean" ? value.rememberOpenFiles : DEFAULT_SETTINGS.rememberOpenFiles,
    aiProvider: value?.aiProvider === "local" ? "local" : "openai",
    aiModelManual: typeof value?.aiModelManual === "boolean" ? value.aiModelManual : DEFAULT_SETTINGS.aiModelManual,
    aiMaxToolCalls: Number.isFinite(aiMaxToolCalls) ? clamp(Math.trunc(aiMaxToolCalls), 1, 200) : DEFAULT_SETTINGS.aiMaxToolCalls,
    aiDetectDuplicateToolCalls: typeof value?.aiDetectDuplicateToolCalls === "boolean" ? value.aiDetectDuplicateToolCalls : DEFAULT_SETTINGS.aiDetectDuplicateToolCalls,
    aiToolCallFormat: value?.aiToolCallFormat === "harmony" || value?.aiToolCallFormat === "none" ? value.aiToolCallFormat : "tag",
    aiCompactFreePercent: Number.isFinite(aiCompactFreePercent) ? clamp(Math.trunc(aiCompactFreePercent), 1, 95) : DEFAULT_SETTINGS.aiCompactFreePercent,
    aiInsertEditorContext: typeof value?.aiInsertEditorContext === "boolean" ? value.aiInsertEditorContext : DEFAULT_SETTINGS.aiInsertEditorContext
  };
}
function modalButton(action, label, variant) {
  return { action, label, variant, rect: { x: 0, y: 0, w: 0, h: 0 }, enabled: true };
}
function formatToolArgsForModal(args) {
  let text;
  try {
    text = JSON.stringify(args);
  } catch {
    text = String(args);
  }
  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 1024 / 102.4) / 10} MB`;
}
function downloadTimestamp(date = /* @__PURE__ */ new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function dataTransferContainsFiles(dataTransfer) {
  return Array.from(dataTransfer.types ?? []).includes("Files") || (dataTransfer.files?.length ?? 0) > 0;
}
function isZipFile(file) {
  return /\.zip$/i.test(file.name) || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}
function pathForZipEntry(name) {
  const normalized = normalizePath(`/${name}`);
  if (normalized === "/" || normalized.startsWith("/.slug-")) return null;
  const parts = normalized.split("/").filter(Boolean);
  if (parts.includes("__MACOSX") || parts.some((part) => part === ".DS_Store")) return null;
  return normalized;
}
function guessMime2(path) {
  return path.match(/\.(ts|tsx|js|jsx|json|md|txt|css|html|lua|cpp|c|h|hpp|rs|py|go|java|cs)$/i) ? "text/plain" : "application/octet-stream";
}
function isValidFileName(name) {
  return name.length > 0 && name !== "." && name !== ".." && invalidFileNameCharacterRanges(name).length === 0;
}
function invalidFileNameCharacterRanges(name) {
  const ranges = [];
  for (let index = 0; index < name.length; ) {
    const codePoint = name.codePointAt(index);
    if (codePoint === void 0) break;
    const char = String.fromCodePoint(codePoint);
    const end = index + char.length;
    if (isInvalidFileNameCharacter(char, codePoint)) ranges.push({ start: index, end });
    index = end;
  }
  return ranges;
}
function isInvalidFileNameCharacter(char, codePoint) {
  return codePoint < 32 || codePoint === 127 || /[<>:"/\\|?*]/.test(char);
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
function findLastIndex(items, predicate) {
  for (let index = items.length - 1; index >= 0; index--) {
    if (predicate(items[index])) return index;
  }
  return -1;
}
function textEqualsFindQuery(text, query) {
  return text.length === query.length && text.toLowerCase() === query.toLowerCase();
}
function replaceAllPlainText(text, query, replacement) {
  if (!query) return { text, count: 0 };
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  const parts = [];
  let count = 0;
  let cursor = 0;
  while (cursor <= text.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found < 0) break;
    parts.push(text.slice(cursor, found), replacement);
    cursor = found + query.length;
    count++;
  }
  if (count === 0) return { text, count };
  parts.push(text.slice(cursor));
  return { text: parts.join(""), count };
}
function sanitizeSingleLineInput(text) {
  return text.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " ");
}
function sanitizeUploadedFileName(name) {
  const leaf = name.replaceAll("\\", "/").split("/").filter(Boolean).pop() ?? "";
  let sanitized = leaf.trim().replace(new RegExp('[\\x00-\\x1f\\x7f<>:"/\\\\|?*]', "g"), "_");
  if (!isValidFileName(sanitized)) sanitized = `upload-${shortHexName()}`;
  return sanitized;
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
function remapSelectedTreePath(path, oldPath, newPath) {
  if (!path || !isSameOrDescendant(path, oldPath)) return path;
  return path === normalizePath(oldPath) ? normalizePath(newPath) : joinPath(newPath, path.slice(normalizePath(oldPath).length + 1));
}
function shortHexName() {
  if (crypto.getRandomValues) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.floor(Math.random() * 4294967295).toString(16).padStart(8, "0");
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
function persistDockNode(node, docPathForId) {
  if (node.type === "leaf") {
    const paths = node.group.tabs.map(docPathForId).filter((path) => Boolean(path));
    if (paths.length === 0) return null;
    const activePath = node.group.activeDocId ? docPathForId(node.group.activeDocId) : null;
    return { type: "leaf", group: { id: node.group.id, paths, activePath: activePath && paths.includes(activePath) ? activePath : paths[0] } };
  }
  const children = [];
  const weights = [];
  const sourceWeights = normalizeWeightsForCount(node.weights, node.children.length);
  for (let i = 0; i < node.children.length; i++) {
    const child = persistDockNode(node.children[i], docPathForId);
    if (!child) continue;
    children.push(child);
    weights.push(sourceWeights[i]);
  }
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { type: "split", id: node.id, direction: node.direction, children, weights: normalizeWeightsForCount(weights, children.length) };
}
function persistedDockPathCount(node) {
  if (node.type === "leaf") return node.group.paths.length;
  return node.children.reduce((sum, child) => sum + persistedDockPathCount(child), 0);
}
function persistedDockPaths(node) {
  if (node.type === "leaf") return node.group.paths;
  return node.children.flatMap((child) => persistedDockPaths(child));
}
function restorePersistedDockNode(node, pathToDocId) {
  if (node.type === "leaf") {
    const tabs = node.group.paths.map((path) => pathToDocId.get(path)).filter((id) => Boolean(id));
    if (tabs.length === 0) return null;
    const activeDocId = node.group.activePath ? pathToDocId.get(node.group.activePath) ?? null : null;
    return {
      type: "leaf",
      group: {
        id: node.group.id || `group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        tabs,
        activeDocId: activeDocId && tabs.includes(activeDocId) ? activeDocId : tabs[0],
        frameRect: { x: 0, y: 0, w: 0, h: 0 },
        editorRect: { x: 0, y: 32, w: 0, h: 0 }
      }
    };
  }
  const children = [];
  const weights = [];
  const sourceWeights = normalizeWeightsForCount(node.weights, node.children.length);
  for (let i = 0; i < node.children.length; i++) {
    const child = restorePersistedDockNode(node.children[i], pathToDocId);
    if (!child) continue;
    children.push(child);
    weights.push(sourceWeights[i]);
  }
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { type: "split", id: node.id || `split-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, direction: node.direction, children, weights: normalizeWeightsForCount(weights, children.length) };
}
function restoredDockTabCount(node) {
  if (node.type === "leaf") return node.group.tabs.length;
  return node.children.reduce((sum, child) => sum + restoredDockTabCount(child), 0);
}
function normalizePersistedSession(value) {
  if (!value || typeof value !== "object") return null;
  const raw = value;
  const dockRoot = normalizePersistedDockNode(raw.dockRoot);
  if (!dockRoot) return null;
  return {
    version: 1,
    activePath: typeof raw.activePath === "string" ? normalizePath(raw.activePath) : null,
    activeGroupId: typeof raw.activeGroupId === "string" ? raw.activeGroupId : null,
    sidebarMode: raw.sidebarMode === "search" || raw.sidebarMode === "chat" || raw.sidebarMode === "settings" ? raw.sidebarMode : "files",
    sidebarWidth: Number.isFinite(raw.sidebarWidth) ? Math.max(0, Number(raw.sidebarWidth)) : 280,
    lastSidebarWidth: Number.isFinite(raw.lastSidebarWidth) ? Math.max(0, Number(raw.lastSidebarWidth)) : 280,
    dockRoot,
    scrollStates: normalizePersistedScrollStates(raw.scrollStates)
  };
}
function normalizePersistedDockNode(value) {
  if (!value || typeof value !== "object") return null;
  const raw = value;
  if (raw.type === "leaf") {
    const group = raw.group;
    if (!group || !Array.isArray(group.paths)) return null;
    const paths = [...new Set(group.paths.filter((path) => typeof path === "string").map((path) => normalizePath(path)))];
    if (paths.length === 0) return null;
    const activePath = typeof group.activePath === "string" ? normalizePath(group.activePath) : null;
    return { type: "leaf", group: { id: typeof group.id === "string" ? group.id : "", paths, activePath: activePath && paths.includes(activePath) ? activePath : paths[0] } };
  }
  if (raw.type !== "split" || raw.direction !== "row" && raw.direction !== "column" || !Array.isArray(raw.children)) return null;
  const children = raw.children.map((child) => normalizePersistedDockNode(child)).filter((child) => Boolean(child));
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return {
    type: "split",
    id: typeof raw.id === "string" ? raw.id : "",
    direction: raw.direction,
    children,
    weights: normalizeWeightsForCount(Array.isArray(raw.weights) ? raw.weights : [], children.length)
  };
}
function normalizePersistedScrollStates(value) {
  if (!value || typeof value !== "object") return {};
  const result = {};
  for (const [path, scroll] of Object.entries(value)) {
    if (!scroll || typeof scroll !== "object") continue;
    result[normalizePath(path)] = {
      x: Number.isFinite(scroll.x) ? Math.max(0, Number(scroll.x)) : 0,
      y: Number.isFinite(scroll.y) ? Math.max(0, Number(scroll.y)) : 0
    };
  }
  return result;
}
function rectIntersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function intersectRect(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= x || bottom <= y) return null;
  return { x, y, w: right - x, h: bottom - y };
}
function activityHoverColor() {
  return [theme.activityActive[0], theme.activityActive[1], theme.activityActive[2], 0.58];
}
function rectPoints(rect) {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h }
  ];
}
function octagonPoints(cx, cy, radius) {
  const inset = radius * 0.42;
  return [
    { x: cx - inset, y: cy - radius },
    { x: cx + inset, y: cy - radius },
    { x: cx + radius, y: cy - inset },
    { x: cx + radius, y: cy + inset },
    { x: cx + inset, y: cy + radius },
    { x: cx - inset, y: cy + radius },
    { x: cx - radius, y: cy + inset },
    { x: cx - radius, y: cy - inset }
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
  area.style.fontSize = "16px";
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
var DEFAULT_WORKSPACE_ID = "default";
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
      const existing = await requestToPromise(workspaces.get(DEFAULT_WORKSPACE_ID));
      if (existing) return existing.id;
      const now = Date.now();
      const workspace = {
        id: DEFAULT_WORKSPACE_ID,
        name: "Browser Workspace",
        createdAt: now,
        updatedAt: now,
        rootPath: "/",
        source: "empty"
      };
      workspaces.put(workspace);
      const nodes = tx.objectStore("nodes");
      const contents = tx.objectStore("contents");
      const root = {
        id: uid("node"),
        workspaceId: DEFAULT_WORKSPACE_ID,
        path: "/",
        parentPath: "/",
        name: "/",
        kind: "dir",
        size: 0,
        mtime: now
      };
      nodes.put(root);
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
  async resetToEmpty() {
    await this.db.tx(["workspaces", "nodes", "contents"], "readwrite", async (tx) => {
      const workspaces = tx.objectStore("workspaces");
      const nodes = tx.objectStore("nodes");
      const contents = tx.objectStore("contents");
      const now = Date.now();
      const workspace = await requestToPromise(workspaces.get(this.workspaceId));
      workspaces.put({
        id: this.workspaceId,
        name: workspace?.name ?? "Browser Workspace",
        createdAt: workspace?.createdAt ?? now,
        updatedAt: now,
        rootPath: "/",
        source: "empty"
      });
      const workspaceNodes = await cursorToArray(nodes.index("byWorkspace").openCursor(IDBKeyRange.only(this.workspaceId)));
      for (const node of workspaceNodes) nodes.delete([this.workspaceId, node.path]);
      const workspaceContents = (await cursorToArray(contents.openCursor())).filter((content) => content.workspaceId === this.workspaceId);
      for (const content of workspaceContents) contents.delete(content.contentId);
      nodes.put({
        id: uid("node"),
        workspaceId: this.workspaceId,
        path: "/",
        parentPath: "/",
        name: "/",
        kind: "dir",
        size: 0,
        mtime: now
      });
    });
    this.emit({ type: "remove", path: "/" });
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
  registerServiceWorker();
}
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  document.body.textContent = `Failed to start carrot.code: ${message}`;
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
    { name: "NotoEmoji-Regular.ttf", buffer: await loadFont("NotoEmoji-Regular.ttf") },
    { name: "MonaspaceNeon-Regular.ttf", buffer: await loadFont("MonaspaceNeon-Regular.ttf") }
  ];
}
async function loadFont(fileName) {
  const response = await fetch(`./${fileName}`);
  if (!response.ok) throw new Error(`Could not load ${fileName}: ${response.status}`);
  return response.arrayBuffer();
}
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;
  const register = () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("carrot.code service worker registration failed", error);
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
//# sourceMappingURL=app.js.map
