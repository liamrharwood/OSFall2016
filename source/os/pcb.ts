///<reference path="../globals.ts" />

/* ------------
     PCB.ts
     ------------ */

module TSOS {

    export class PCB {

    	public static pidCount: number = 0 ;
    	public pid: number;

        constructor() {
        	this.pid = PCB.pidCount;
        	PCB.pidCount++;
        }


    }
}
