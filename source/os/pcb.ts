///<reference path="../globals.ts" />

/* ------------
     PCB.ts
     ------------ */

module TSOS {

    export class PCB {

    	public static pidCount: number = 0 ;
    	public pid: number;

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public instruction: string = "",
                    public baseRegister : number = -1,
                    public limitRegister : number = -1,
                    public processState : string = _ProcessStates.new,
                    public priority : number = 0,
                    public swapTsb : string = "f,f,f") { // "f,f,f" indicate the program is in memory
        	this.pid = PCB.pidCount;
        	PCB.pidCount++; // Keeps running count of PIDs as they're created
        }


    }
}
