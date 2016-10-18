///<reference path="../globals.ts" />
/* ------------
     PCB.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, instruction) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (instruction === void 0) { instruction = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.instruction = instruction;
            this.pid = PCB.pidCount;
            PCB.pidCount++; // Keeps running count of PIDs as they're created
        }
        PCB.pidCount = 0;
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
