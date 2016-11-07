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
            _CPU.PC = 0;
            _CPU.isExecuting = true;
        }

        public getPCB(pid : number) {
            for(var i=0; i < this.residentList.length; i++) {
                if(this.residentList[i].pid === pid) {
                    return this.residentList[i];
                }
            }
            // If pid doesn't exist...
            return null;
        }

        public removeFromResident(pid : number) {
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