///<reference path="../globals.ts" />
/* ------------
     ProcessManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(rrQuantum, counter) {
            if (rrQuantum === void 0) { rrQuantum = 6; }
            if (counter === void 0) { counter = 0; }
            this.rrQuantum = rrQuantum;
            this.counter = counter;
        }
        // This is run every clock pulse to determine if scheduling events need to be done
        Scheduler.prototype.schedule = function () {
            this.counter++;
            this.scheduleRoundRobin(); // only one scheduling algorithm for now
        };
        Scheduler.prototype.scheduleRoundRobin = function () {
            if (this.counter > this.rrQuantum) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
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
            TSOS.Control.updateProcessDisplay();
        };
        Scheduler.prototype.switchInNewProcess = function () {
            _CurrentPCB = _ProcessManager.readyQueue.dequeue(); // Put the new process in the CPU
            _CurrentPCB.processState = _ProcessStates.running;
            _CPU.updateCPU();
            TSOS.Control.updateProcessDisplay();
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
