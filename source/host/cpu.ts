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
            Control.updateMemoryDisplay();
            this.executeProgram(_CurrentPCB);
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
                    
                    break;
                default:
                    _StdOut.putText("");

            }
        }

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
            var val: string = this.Acc.toString(16);
            if(val.length < 2) val = "0" + val;
            _MemoryManager.write(address, val);
            this.PC++;            
        }

        public addWithCarry() {

        }

        public loadXWithConstant() {

        }

        public loadXFromMemory() {

        }

        public loadYWithConstant() {

        }

        public loadYFromMemory() {

        }

        public compareByteToX() {

        }

        public branch() {

        }

        public incrementByte() {

        }

        public sysCall() {

        }


    }
}
