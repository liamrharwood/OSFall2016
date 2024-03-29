///<reference path="../globals.ts" />
/* ------------
     ProcessManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(rrQuantum, counter, algorithm) {
            if (rrQuantum === void 0) { rrQuantum = 6; }
            if (counter === void 0) { counter = 0; }
            if (algorithm === void 0) { algorithm = "rr"; }
            this.rrQuantum = rrQuantum;
            this.counter = counter;
            this.algorithm = algorithm;
        }
        // This is run every clock pulse to determine if scheduling events need to be done
        Scheduler.prototype.schedule = function () {
            this.counter++;
            switch (this.algorithm) {
                case "rr":
                    this.scheduleRoundRobin(); // only one scheduling algorithm for now
                    break;
                case "fcfs":
                    this.scheduleFCFS();
                    break;
                case "priority":
                    this.schedulePriority();
                    break;
            }
        };
        Scheduler.prototype.scheduleRoundRobin = function () {
            if (this.counter > this.rrQuantum) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
        };
        Scheduler.prototype.scheduleFCFS = function () {
            if (this.counter > A_REALLY_BIG_NUMBER) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
        };
        Scheduler.prototype.schedulePriority = function () {
            // Sort the ready queue by priority (lowest wins)            
            _ProcessManager.readyQueue.q.sort(function (a, b) {
                // If a has higher priority (lower int), a comes first
                if (a.priority < b.priority) {
                    return -1;
                }
                // If b has higher priority (lower int), b comes first
                if (b.priority < a.priority) {
                    return 1;
                }
                return 0;
            });
        };
        // This is executed upon a context switch software interrupt
        Scheduler.prototype.contextSwitch = function () {
            this.switchOutOldProcess();
            var logText = "Context switch: PID " + _CurrentPCB.pid;
            this.counter = 0;
            this.switchInNewProcess();
            logText += " to PID " + _CurrentPCB.pid;
            _Kernel.krnTrace(logText); // Send a message to the log saying what we're switching from/to
        };
        Scheduler.prototype.switchOutOldProcess = function () {
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB); // Put the current process back in ready queue
            if (_ProcessManager.readyQueue.q[0].swapTsb !== "f,f,f") {
                _krnFsDriver.rollOut(_CurrentPCB.pid, _MemoryManager.getCodeFromMemory(_CurrentPCB.baseRegister));
            }
            TSOS.Control.updateProcessDisplay();
        };
        Scheduler.prototype.switchInNewProcess = function () {
            _CurrentPCB = _ProcessManager.readyQueue.dequeue(); // Put the new process in the CPU
            if (_CurrentPCB.swapTsb !== "f,f,f") {
                _krnFsDriver.rollIn(_CurrentPCB.pid);
            }
            _CurrentPCB.processState = _ProcessStates.running;
            _CPU.updateCPU();
            TSOS.Control.updateProcessDisplay();
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
