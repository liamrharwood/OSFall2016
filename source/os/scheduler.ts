///<reference path="../globals.ts" />

/* ------------
     ProcessManager.ts
     ------------ */

module TSOS {

    export class Scheduler {

        constructor(public rrQuantum : number = 6,
                    public counter : number = 0,
                    public algorithm : string = "rr") {

        }
        
        // This is run every clock pulse to determine if scheduling events need to be done
        public schedule() : void {
            this.counter++;
            this.scheduleRoundRobin(); // only one scheduling algorithm for now
        }

        public scheduleRoundRobin() : void {
            if(this.counter > this.rrQuantum) { // Time for new process!
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
        }

        // This is executed upon a context switch software interrupt
        public contextSwitch() : void {
            this.switchOutOldProcess();
            var logText = "Context switch: PID " + _CurrentPCB.pid;

            this.counter = 0;


            this.switchInNewProcess();
            logText += " to PID " + _CurrentPCB.pid;

            _Kernel.krnTrace(logText); // Send a message to the log saying what we're switching from/to
        }

        public switchOutOldProcess() {
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB); // Put the current process back in ready queue
            Control.updateProcessDisplay();
        }

        public switchInNewProcess() {
            _CurrentPCB = _ProcessManager.readyQueue.dequeue(); // Put the new process in the CPU
            _CurrentPCB.processState = _ProcessStates.running;
            _CPU.updateCPU();
            Control.updateProcessDisplay();
        }
    }
}