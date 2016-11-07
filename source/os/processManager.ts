///<reference path="../globals.ts" />

/* ------------
     ProcessManager.ts
     ------------ */

module TSOS {

    export class ProcessManager {

        constructor(public residentList : TSOS.PCB[] = [],
                    public readyQueue : TSOS.Queue = new TSOS.Queue()) {

        }

    }
}