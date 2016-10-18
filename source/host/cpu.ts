///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public instruction: string = "") {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            Control.updateCPUDisplay();
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            Control.updateCPUDisplay();
            Control.updatePCBDisplay();
            Control.updateMemoryDisplay();

            // Execute instructions
            this.executeProgram(_CurrentPCB);
            // Stop after one instruction if Single Stepping
            if(_SingleStepMode) 
                this.isExecuting = false;
        }

        public executeProgram(pcb: TSOS.PCB) {
            this.instruction = _Memory.memArr[this.PC];

            switch (this.instruction) {
                case 'A9':
                    this.loadAccFromConstant();
                    break;
                case 'AD':
                    this.loadAccFromMemory();
                    break;
                case '8D':
                    this.storeAccInMemory();
                    break;
                case '6D':
                    this.addWithCarry();
                    break;
                case 'A2':
                    this.loadXWithConstant();
                    break;
                case 'AE':
                    this.loadXFromMemory();
                    break;
                case 'A0':
                    this.loadYWithConstant();
                    break;
                case 'AC':
                    this.loadYFromMemory();
                    break;
                case 'EC':
                    this.compareByteToX();
                    break;
                case 'D0':
                    this.branch();
                    break;
                case 'EE':
                    this.incrementByte();
                    break;
                case 'FF':
                    this.sysCall();
                    break;
                case 'EA':
                    this.PC++;
                    break;
                case '00':
                    this.breakProgram();
                    break;
                default:
                    _StdOut.putText("ERROR: Invalid op code.");

            }

            this.updatePCB(pcb);
        }


        //
        // OP CODE FUNCTIONS
        // (Can get messy due to converting between base 10 and base 16, and between strings and numbers.)
        //


        public loadAccFromConstant() {
            this.PC++;
            this.Acc = parseInt(_MemoryManager.read(this.PC), 16);
            this.PC++;
        }

        public loadAccFromMemory() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            this.Acc = parseInt(_MemoryManager.read(address), 16);
            this.PC++;
        }

        public storeAccInMemory() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            var val: string = this.Acc.toString(16).toUpperCase();
            if(val.length < 2) 
                val = "0" + val; // Format hex for display
            _MemoryManager.write(address, val);
            this.PC++;            
        }

        public addWithCarry() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            this.Acc += parseInt(_MemoryManager.read(address), 16);
            this.PC++;
        }

        public loadXWithConstant() {
            this.PC++;
            this.Xreg = parseInt(_MemoryManager.read(this.PC), 16);
            this.PC++;
        }

        public loadXFromMemory() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            this.Xreg = parseInt(_MemoryManager.read(address), 16);
            this.PC++;
        }

        public loadYWithConstant() {
            this.PC++;
            this.Yreg = parseInt(_MemoryManager.read(this.PC), 16);
            this.PC++;
        }

        public loadYFromMemory() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            this.Yreg = parseInt(_MemoryManager.read(address), 16);
            this.PC++;
        }

        public compareByteToX() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            if(parseInt(_MemoryManager.read(address), 16) === this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.PC++;            
        }

        public branch() {
            this.PC++;
            if (this.Zflag === 0) {
                var numBytes = parseInt(_MemoryManager.read(this.PC), 16);
                this.PC++;
                var newPC = this.PC + numBytes;
                if(newPC > _SegmentSize) {
                    // If the program tries to branch outside the allotted segment, 
                    // loop back to the beginning and branch the difference from the beginning again
                    // (THIS IS HOW LOOPS WORK :D)
                    this.PC = newPC - _SegmentSize;
                } else {
                    this.PC = newPC;
                }
            } else {
                this.PC++;
            }
        }

        public incrementByte() {
            this.PC++;
            var addrString: string = _MemoryManager.read(this.PC);
            this.PC++;
            addrString = _MemoryManager.read(this.PC) + addrString;
            var address: number = parseInt(addrString, 16);
            var val: number = parseInt(_MemoryManager.read(address), 16);
            val++;
            var hex: string = val.toString().toUpperCase();
            if(hex.length < 2) 
                hex = "0" + hex; // Format hex for display
            _MemoryManager.write(address, hex);
            this.PC++; 
        }

        public sysCall() {
            this.PC++;
            if(this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            } else if(this. Xreg === 2) {
                var address: number = this.Yreg;
                var str: string = "";
                var code: number = parseInt(_MemoryManager.read(address), 16);
                while(code !== 0) {
                    str += String.fromCharCode(code);
                    address++;
                    code = parseInt(_MemoryManager.read(address), 16);
                }
                _StdOut.putText(str);
            }
        }

        public breakProgram() {
            this.PC++;
            this.isExecuting = false;
        }

        public updatePCB(pcb: TSOS.PCB) {
            pcb.instruction = this.instruction;
            pcb.Acc = this.Acc;
            pcb.PC = this.PC;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.Zflag = this.Zflag;
        }


    }
}
