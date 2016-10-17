///<reference path="../globals.ts" />

/* ------------
     Memory.ts
     ------------ */

module TSOS {

    export class Memory {

        constructor(public size: number = _MemorySize,
        	        public memArr = []) {

        }

        public init(): void {
        	for(var i = 0; i < this.size; i++) {
        		this.memArr[i] = "00";
        	}
        	Control.updateMemoryDisplay();
        }

    }
}
