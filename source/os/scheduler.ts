///<reference path="../globals.ts" />

/* ------------
     ProcessManager.ts
     ------------ */

module TSOS {

    export class Scheduler {

        constructor(public rrQuantum : number = 6,
                    public counter : number = 0) {

        }
        
        public schedule() : void {
            this.counter++;
            this.scheduleRoundRobin();
        }

        public scheduleRoundRobin() : void {
            if(this.counter > this.rrQuantum) {
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }
        }

        public contextSwitch() : void {
            this.switchOutOldProcess();
            var logText = "Context switch: PID " + _CurrentPCB.pid;

            this.counter = 0;


            this.switchInNewProcess();
            logText += " to PID " + _CurrentPCB.pid;

            _Kernel.krnTrace(logText);
        }

        public switchOutOldProcess() {
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB);
            Control.updateProcessDisplay();
        }

        public switchInNewProcess() {
            _CurrentPCB = _ProcessManager.readyQueue.dequeue();
            _CurrentPCB.processState = _ProcessStates.running;
            _CPU.updateCPU();
            Control.updateProcessDisplay();
        }
    }
}