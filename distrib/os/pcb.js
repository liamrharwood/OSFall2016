///<reference path="../globals.ts" />
/* ------------
     PCB.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, instruction, baseRegister, limitRegister, processState, priority, swapTsb) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = ""; }
            if (baseRegister === void 0) { baseRegister = -1; }
            if (limitRegister === void 0) { limitRegister = -1; }
            if (processState === void 0) { processState = _ProcessStates.new; }
            if (priority === void 0) { priority = 0; }
            if (swapTsb === void 0) { swapTsb = "f,f,f"; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.baseRegister = baseRegister;
            this.limitRegister = limitRegister;
            this.processState = processState;
            this.priority = priority;
            this.swapTsb = swapTsb;
            this.pid = PCB.pidCount;
            PCB.pidCount++; // Keeps running count of PIDs as they're created
        }
        PCB.pidCount = 0;
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
