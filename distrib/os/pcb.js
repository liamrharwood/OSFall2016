///<reference path="../globals.ts" />
/* ------------
     PCB.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB() {
            this.pid = PCB.pidCount;
            PCB.pidCount++;
        }
        PCB.pidCount = 0;
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
