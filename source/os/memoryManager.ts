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

                    // Start swapping if there are no free partitions
                    if(i >= 2) {
                        _ProcessManager.residentList.push(pcb);
                        _krnFsDriver.rollOut(pcb.pid, userCode.join(""));
                    }
            	}
            } else {
                _StdOut.putText("Program is too big. Maximum size allowed: " + _SegmentSize + " bytes");
            }
        }

        public loadProgramFromDisk(code : string, pcb : TSOS.PCB): void {
            for(var i=0; i < this.isFreePartition.length; i++) {
                    // Look for free partition
                    if(this.isFreePartition[i]) {
                        // Set base and limit registers
                        var base = i * _SegmentSize;
                        var limit = base + _SegmentSize - 1;
                        pcb.baseRegister = base;
                        pcb.limitRegister = limit;

                        var codeArr = code.split("");

                        // Fill partition with user code
                        for(var j=base; j <= limit; j++) {
                            if(codeArr.length > 0) {
                                _Memory.memArr[j] = "" + codeArr.shift() + codeArr.shift();
                            }
                            else {
                                break;
                            }
                        }

                        this.isFreePartition[i] = false;
                        Control.updateMemoryDisplay();
                        break;
                    }
                }
        }

        public read(pcb : TSOS.PCB, address : number): string {
            // Check memory bounds
            if(address >= 0 && address < _SegmentSize) {
                return _Memory.memArr[pcb.baseRegister + address];
            } else {
                _StdOut("Memory access violation. Process terminated. (PID " + pcb.pid + ")");
                _ProcessManager.terminateProcess(pcb);
            }
        }

        public write(pcb : TSOS.PCB, address : number, value: string): void {
            // Check memory bounds
            if(address >= 0 && address < _SegmentSize) {
                _Memory.memArr[pcb.baseRegister + address] = value;
            } else {
                _StdOut.putText("Memory access violation. Process terminated. (PID " + pcb.pid + ")");
                _ProcessManager.terminateProcess(pcb);
            }
        }

        public deallocateMemory(base : number) {
            // Clear a segment of memory from base register to limit register
            var limit = base + _SegmentSize - 1;
            for(var i=base; i <= limit; i++) {
                _Memory.memArr[i] = "00";
            }

            // Update the list of free partitions to show that one is clear
            this.isFreePartition[base / _SegmentSize] = true;

            Control.updateMemoryDisplay();
        }

        public clearAllMemory(): void {
            for(var i=0; i < this.isFreePartition.length; i++) {
                this.isFreePartition[i] = true;
            }
            _Memory.clearAll();
        }

        public getCodeFromMemory(base : number) {
            var limit = base + _SegmentSize - 1;
            var codeStr = "";
            for(var i=base; i <= limit; i++) {
                codeStr += _Memory.memArr[i];
            }
            return codeStr;
        }

    }
}
