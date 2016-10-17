///<reference path="../globals.ts" />

/* ------------
     MemoryManager.ts
     ------------ */

module TSOS {

    export class MemoryManager {

        constructor() {

        }

        public init(): void {
        }

        public loadUserCode(userCode : string[]): void {
        	for(var i=0; i < userCode.length; i++) {
        		_Memory.memArr[i] = userCode[i];
        	}
        	Control.updateMemoryDisplay();
        } 
    }
}
