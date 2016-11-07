///<reference path="../globals.ts" />
/* ------------
     MemoryManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(isFreePartition) {
            if (isFreePartition === void 0) { isFreePartition = [true, true, true]; }
            this.isFreePartition = isFreePartition;
        }
        MemoryManager.prototype.loadProgram = function (userCode, pcb) {
            for (var i = 0; i < this.isFreePartition.length; i++) {
                // Look for free partition
                if (this.isFreePartition[i]) {
                    // Set base and limit registers
                    var base = i * _SegmentSize;
                    var limit = base + _SegmentSize - 1;
                    pcb.baseRegister = base;
                    pcb.limitRegister = limit;
                    // Fill partition with user code
                    for (var j = base; j <= limit; j++) {
                        if (userCode.length > 0) {
                            _Memory.memArr[j] = userCode.shift();
                        }
                        else {
                            break;
                        }
                    }
                    _ProcessManager.residentList.push(pcb);
                    TSOS.Control.updateProcessDisplay();
                    _StdOut.putText("Program loaded. PID: " + pcb.pid);
                    this.isFreePartition[i] = false;
                    TSOS.Control.updateMemoryDisplay();
                    break;
                }
                // Give error if there are no free partitions
                if (i >= 2) {
                    _StdOut.putText("There are no free memory partitions.");
                }
            }
        };
        MemoryManager.prototype.read = function (address) {
            return _Memory.memArr[address];
        };
        MemoryManager.prototype.write = function (address, value) {
            _Memory.memArr[address] = value;
        };
        MemoryManager.prototype.clearAllMemory = function () {
            _Memory.clearAll();
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
