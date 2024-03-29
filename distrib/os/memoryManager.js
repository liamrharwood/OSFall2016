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
            if (userCode.length <= _SegmentSize) {
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
                        this.isFreePartition[i] = false;
                        TSOS.Control.updateMemoryDisplay();
                        break;
                    }
                    // Start swapping if there are no free partitions
                    if (i >= 2) {
                        if (_Disk.isFormatted) {
                            _ProcessManager.residentList.push(pcb);
                            _krnFsDriver.rollOut(pcb.pid, userCode.join(""));
                        }
                        else {
                            _StdOut.putText("No room in memory. Format the disk to enable swapping.");
                            return;
                        }
                    }
                }
                TSOS.Control.updateProcessDisplay();
                _StdOut.putText("Program loaded. PID: " + pcb.pid);
            }
            else {
                _StdOut.putText("Program is too big. Maximum size allowed: " + _SegmentSize + " bytes");
            }
        };
        MemoryManager.prototype.loadProgramFromDisk = function (code, pcb) {
            for (var i = 0; i < this.isFreePartition.length; i++) {
                // Look for free partition
                if (this.isFreePartition[i]) {
                    // Set base and limit registers
                    var base = i * _SegmentSize;
                    var limit = base + _SegmentSize - 1;
                    pcb.baseRegister = base;
                    pcb.limitRegister = limit;
                    var codeArr = code.split("");
                    // Fill partition with user code
                    for (var j = base; j <= limit; j++) {
                        if (codeArr.length > 0) {
                            _Memory.memArr[j] = "" + codeArr.shift() + codeArr.shift();
                        }
                        else {
                            break;
                        }
                    }
                    this.isFreePartition[i] = false;
                    TSOS.Control.updateMemoryDisplay();
                    break;
                }
            }
        };
        MemoryManager.prototype.read = function (pcb, address) {
            // Check memory bounds
            if (address >= 0 && address < _SegmentSize) {
                return _Memory.memArr[pcb.baseRegister + address];
            }
            else {
                _StdOut("Memory access violation. Process terminated. (PID " + pcb.pid + ")");
                _ProcessManager.terminateProcess(pcb);
            }
        };
        MemoryManager.prototype.write = function (pcb, address, value) {
            // Check memory bounds
            if (address >= 0 && address < _SegmentSize) {
                _Memory.memArr[pcb.baseRegister + address] = value;
            }
            else {
                _StdOut.putText("Memory access violation. Process terminated. (PID " + pcb.pid + ")");
                _ProcessManager.terminateProcess(pcb);
            }
        };
        MemoryManager.prototype.deallocateMemory = function (base) {
            // Clear a segment of memory from base register to limit register
            var limit = base + _SegmentSize - 1;
            for (var i = base; i <= limit; i++) {
                _Memory.memArr[i] = "00";
            }
            // Update the list of free partitions to show that one is clear
            this.isFreePartition[base / _SegmentSize] = true;
            TSOS.Control.updateMemoryDisplay();
        };
        MemoryManager.prototype.clearAllMemory = function () {
            for (var i = 0; i < this.isFreePartition.length; i++) {
                this.isFreePartition[i] = true;
            }
            _Memory.clearAll();
        };
        MemoryManager.prototype.getCodeFromMemory = function (base) {
            var limit = base + _SegmentSize - 1;
            var codeStr = "";
            for (var i = base; i <= limit; i++) {
                codeStr += _Memory.memArr[i];
            }
            return codeStr;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
