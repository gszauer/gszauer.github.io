/*
extern "C" float MathSin(float x);
extern "C" float MathCos(float x);
extern "C" float MathTan(float x);
extern "C" float MathSqrt(float x);
extern "C" float MathRandom();
*/
class GameMath {
    constructor(wasmImportObject) {
        if (!wasmImportObject.hasOwnProperty("env")) {
            wasmImportObject.env = {};
        }
        let self = this;

        wasmImportObject.env["MathSin"] = function(x) {
            return Math.sin(x);
        };

        wasmImportObject.env["MathCos"] = function(x) {
            return Math.cos(x);
        };

        wasmImportObject.env["MathTan"] = function(x) {
            return Math.tan(x);
        };

        wasmImportObject.env["MathSqrt"] = function(x) {
            return Math.sqrt(x);
        };

        wasmImportObject.env["MathRandom"] = function() {
            return Math.random();
        };
    }
}