///<reference path="../globals.ts" />
/* ------------
     ProcessManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = (function () {
        function ProcessManager(residentList, readyQueue) {
            if (residentList === void 0) { residentList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.residentList = residentList;
            this.readyQueue = readyQueue;
        }
        ProcessManager.prototype.runProcess = function (pcb) {
            _CurrentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            _MemoryManager.deallocateMemory(pcb.baseRegister);
            _ProcessManager.removeFromResident(pcb.pid);
            if (this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
            }
            else if (_CurrentPCB.pid === pcb.pid) {
                _Scheduler.switchInNewProcess();
            }
        };
        ProcessManager.prototype.runAll = function () {
            for (var i = 0; i < this.residentList.length; i++) {
                var pcb = this.residentList[i];
                if (pcb.processState === _ProcessStates.new) {
                    pcb.processState = _ProcessStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }
            _CurrentPCB = this.readyQueue.dequeue();
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        };
        ProcessManager.prototype.getPCB = function (pid) {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    return this.residentList[i];
                }
            }
            // If pid doesn't exist...
            return null;
        };
        ProcessManager.prototype.removeFromResident = function (pid) {
            for (var i = 0; i < this.residentList.length; i++) {
                if (this.residentList[i].pid === pid) {
                    this.residentList.splice(i, 1);
                    TSOS.Control.updateProcessDisplay();
                    break;
                }
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
