///<reference path="../globals.ts" />
/* ------------
     ProcessManager.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = (function () {
        function ProcessManager(residentList, readyQueue) {
            if (residentList === void 0) { residentList = []; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.residentList = residentList;
            this.readyQueue = readyQueue;
        }
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
