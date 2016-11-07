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
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB);
            Control.updateProcessDisplay();

            this.counter = 0;

            _CurrentPCB = _ProcessManager.readyQueue.dequeue();
            _CurrentPCB.processState = _ProcessStates.running;
            Control.updateProcessDisplay();
        }
    }
}