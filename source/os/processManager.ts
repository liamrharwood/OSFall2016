///<reference path="../globals.ts" />

/* ------------
     ProcessManager.ts
     ------------ */

module TSOS {

    export class ProcessManager {

        constructor(public residentList : TSOS.PCB[] = [],
                    public readyQueue : TSOS.Queue = new TSOS.Queue()) {

        }

        public runProcess(pcb : TSOS.PCB) : void {
            _CurrentPCB = pcb;
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        }

        public terminateProcess(pcb : TSOS.PCB) : void {
            // Clear memory segment and remove PCB from resident list        
            _MemoryManager.deallocateMemory(pcb.baseRegister);
            _ProcessManager.removeFromResident(pcb.pid);

            if(this.readyQueue.isEmpty()) { // If there's nothing to execute, stop executing
                _CPU.isExecuting = false;
            } else if(_CurrentPCB.pid === pcb.pid){ // If we just terminated the current process, switch in a new one
                _Scheduler.switchInNewProcess(); // We don't want a full context switch here, there's nothing being put back in the ready queue
            }
            
        }

        public runAll() : void {
            // Fill the ready queue with new processes
            for (var i=0; i < this.residentList.length; i++) {
                var pcb = this.residentList[i];
                if (pcb.processState === _ProcessStates.new) {
                    pcb.processState = _ProcessStates.ready;
                    this.readyQueue.enqueue(pcb);
                }
            }
            // Let the CPU know what's going on, and begin execution
            _CurrentPCB = this.readyQueue.dequeue();
            _CPU.updateCPU();
            _CPU.isExecuting = true;
        }

        public getPCB(pid : number) {
            // Find the pcb with specified pid
            for(var i=0; i < this.residentList.length; i++) {
                if(this.residentList[i].pid === pid) {
                    return this.residentList[i];
                }
            }
            // If pid doesn't exist...
            return null;
        }

        public removeFromResident(pid : number) {
            // Find the pcb with specified pid
            for(var i=0; i < this.residentList.length; i++) {
                if(this.residentList[i].pid === pid) {
                    this.residentList.splice(i, 1);
                    Control.updateProcessDisplay();
                    break;
                }
            }
        }
    }
}