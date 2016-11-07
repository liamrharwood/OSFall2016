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
        Scheduler.prototype.schedule = function () {
            this.counter++;
            this.scheduleRoundRobin();
        };
        Scheduler.prototype.scheduleRoundRobin = function () {
            if (this.counter > this.rrQuantum) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }
        };
        Scheduler.prototype.contextSwitch = function () {
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB);
            TSOS.Control.updateProcessDisplay();
            this.counter = 0;
            _CurrentPCB = _ProcessManager.readyQueue.dequeue();
            _CurrentPCB.processState = _ProcessStates.running;
            TSOS.Control.updateProcessDisplay();
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
