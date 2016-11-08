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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, instruction) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (instruction === void 0) { instruction = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instruction = instruction;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            TSOS.Control.updateCPUDisplay();
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            TSOS.Control.updateCPUDisplay();
            TSOS.Control.updateProcessDisplay();
            TSOS.Control.updateMemoryDisplay();
            // Execute instructions
            this.executeProgram(_CurrentPCB);
            // Stop after one instruction if Single Stepping
            if (_SingleStepMode)
                this.isExecuting = false;
        };
        Cpu.prototype.executeProgram = function (pcb) {
            this.instruction = _MemoryManager.read(pcb, this.PC);
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
                    _ProcessManager.terminateProcess(pcb);
            }
            this.updatePCB(pcb);
        };
        //
        // OP CODE FUNCTIONS
        // (Can get messy due to converting between base 10 and base 16, and between strings and numbers.)
        //
        Cpu.prototype.loadAccFromConstant = function () {
            this.PC++;
            this.Acc = parseInt(_MemoryManager.read(_CurrentPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadAccFromMemory = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            this.Acc = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
            this.PC++;
        };
        Cpu.prototype.storeAccInMemory = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            var val = this.Acc.toString(16).toUpperCase();
            if (val.length < 2)
                val = "0" + val; // Format hex for display
            _MemoryManager.write(_CurrentPCB, address, val);
            this.PC++;
        };
        Cpu.prototype.addWithCarry = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            this.Acc += parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
            this.PC++;
        };
        Cpu.prototype.loadXWithConstant = function () {
            this.PC++;
            this.Xreg = parseInt(_MemoryManager.read(_CurrentPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadXFromMemory = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            this.Xreg = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
            this.PC++;
        };
        Cpu.prototype.loadYWithConstant = function () {
            this.PC++;
            this.Yreg = parseInt(_MemoryManager.read(_CurrentPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadYFromMemory = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            this.Yreg = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
            this.PC++;
        };
        Cpu.prototype.compareByteToX = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            if (parseInt(_MemoryManager.read(_CurrentPCB, address), 16) === this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.PC++;
        };
        Cpu.prototype.branch = function () {
            this.PC++;
            if (this.Zflag === 0) {
                var numBytes = parseInt(_MemoryManager.read(_CurrentPCB, this.PC), 16);
                this.PC++;
                var newPC = this.PC + numBytes;
                if (newPC > _SegmentSize - 1) {
                    // If the program tries to branch outside the allotted segment, 
                    // loop back to the beginning and branch the difference from the beginning again
                    // (THIS IS HOW LOOPS WORK :D)
                    this.PC = newPC - _SegmentSize;
                }
                else {
                    this.PC = newPC;
                }
            }
            else {
                this.PC++;
            }
        };
        Cpu.prototype.incrementByte = function () {
            this.PC++;
            var addrString = _MemoryManager.read(_CurrentPCB, this.PC);
            this.PC++;
            addrString = _MemoryManager.read(_CurrentPCB, this.PC) + addrString;
            var address = parseInt(addrString, 16);
            var val = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
            val++;
            var hex = val.toString().toUpperCase();
            if (hex.length < 2)
                hex = "0" + hex; // Format hex for display
            _MemoryManager.write(_CurrentPCB, address, hex);
            this.PC++;
        };
        Cpu.prototype.sysCall = function () {
            console.log("sysCall");
            this.PC++;
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var address = this.Yreg;
                var str = "";
                var code = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
                while (code !== 0) {
                    str += String.fromCharCode(code);
                    address++;
                    code = parseInt(_MemoryManager.read(_CurrentPCB, address), 16);
                }
                console.log(str);
                _StdOut.putText(str);
            }
        };
        Cpu.prototype.breakProgram = function () {
            this.PC++;
            _ProcessManager.terminateProcess(_CurrentPCB);
        };
        Cpu.prototype.updatePCB = function (pcb) {
            pcb.instruction = this.instruction;
            pcb.Acc = this.Acc;
            pcb.PC = this.PC;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.Zflag = this.Zflag;
        };
        Cpu.prototype.updateCPU = function () {
            this.instruction = _CurrentPCB.instruction;
            this.Acc = _CurrentPCB.Acc;
            this.PC = _CurrentPCB.PC;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
