///<reference path="../globals.ts" />
/* ------------
     MemoryManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.init = function () {
        };
        MemoryManager.prototype.loadUserCode = function (userCode) {
            for (var i = 0; i < userCode.length; i++) {
                _Memory.memArr[i] = userCode[i];
            }
            TSOS.Control.updateMemoryDisplay();
        };
        MemoryManager.prototype.read = function (address) {
            return _Memory.memArr[address];
        };
        MemoryManager.prototype.write = function (address, value) {
            _Memory.memArr[address] = value;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
