///<reference path="../globals.ts" />

/* ------------
     MemoryManager.ts
     ------------ */

module TSOS {

    export class MemoryManager {

        constructor(public isFreePartition : boolean[] = [true, true, true]) {

        }

        public loadProgram(userCode : string[], pcb : TSOS.PCB): void {
            if(userCode.length <= _SegmentSize) {
            	for(var i=0; i < this.isFreePartition.length; i++) {
                    // Look for free partition
            		if(this.isFreePartition[i]) {
                        // Set base and limit registers
                        var base = i * _SegmentSize;
                        var limit = base + _SegmentSize - 1;
                        pcb.baseRegister = base;
                        pcb.limitRegister = limit;

                        // Fill partition with user code
                        for(var j=base; j <= limit; j++) {
                            if(userCode.length > 0) {
                                _Memory.memArr[j] = userCode.shift();
                            }
                            else {
                                break;
                            }
                        }
                        _ProcessManager.residentList.push(pcb);
                        Control.updateProcessDisplay();
                        _StdOut.putText("Program loaded. PID: " + pcb.pid);

                        this.isFreePartition[i] = false;
                        Control.updateMemoryDisplay();
                        break;
                    }

                    // Give error if there are no free partitions
                    if(i >= 2) {
                        _StdOut.putText("There are no free memory partitions.");
                    }
            	}
            } else {
                _StdOut.putText("Program is too big. Maximum size allowed: " + _SegmentSize + " bytes");
            }
        }

        public read(address : number): string {
            return _Memory.memArr[address];
        }

        public write(address : number, value: string): void {
            _Memory.memArr[address] = value;
        }

        public clearAllMemory(): void {
            _Memory.clearAll();
        }
    }
}
