///<reference path="../globals.ts" />
/* ------------
     Memory.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(size, memArr) {
            if (size === void 0) { size = _MemorySize; }
            if (memArr === void 0) { memArr = []; }
            this.size = size;
            this.memArr = memArr;
        }
        Memory.prototype.init = function () {
            this.clearAll();
            TSOS.Control.updateMemoryDisplay();
        };
        Memory.prototype.clearAll = function () {
            for (var i = 0; i < this.size; i++) {
                this.memArr[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
