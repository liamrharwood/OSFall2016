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
            switch(this.algorithm) {
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
        }

        public scheduleRoundRobin() : void {
            if(this.counter > this.rrQuantum) { // Time for new process!
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
        }

        public scheduleFCFS() : void {
            if(this.counter > A_REALLY_BIG_NUMBER) { // Fakin' it 
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0)); // Create an interrupt for context switch
            }
        }

        public schedulePriority() : void {
            // Sort the ready queue by priority (lowest wins)            
            _ProcessManager.readyQueue.q.sort(function(a, b) {
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
            //console.log("Switch out PID: " + _CurrentPCB.pid);
            _CurrentPCB.processState = _ProcessStates.ready;
            _ProcessManager.readyQueue.enqueue(_CurrentPCB); // Put the current process back in ready queue
            if(_ProcessManager.readyQueue.q[0].swapTsb !== "f,f,f") {
                _krnFsDriver.rollOut(_CurrentPCB.pid, _MemoryManager.getCodeFromMemory(_CurrentPCB.baseRegister));
            }
            Control.updateProcessDisplay();
        }

        public switchInNewProcess() {
            _CurrentPCB = _ProcessManager.readyQueue.dequeue(); // Put the new process in the CPU
            //console.log("Switch in PID: " + _CurrentPCB.pid);
            if(_CurrentPCB.swapTsb !== "f,f,f") {
                _krnFsDriver.rollIn(_CurrentPCB.pid);
            }
            _CurrentPCB.processState = _ProcessStates.running;
            _CPU.updateCPU();
            Control.updateProcessDisplay();
      
        }
    }
}