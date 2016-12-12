///<reference path="../globals.ts" />

/* ------------
     Disk.ts
     ------------ */

module TSOS {

    export class Disk {

        public storage;

        constructor(public numTracks : number = 4,
                    public numSectors : number = 8,
                    public numBlocks : number = 8) {
            this.storage = sessionStorage; // Use HTML5 session storage for disk
        }

        public initAllTSB() {
            for(var t = 0; t < this.numTracks; t++) {
                for(var s = 0; s < this.numSectors; s++) {
                    for(var b = 0; b < this.numTracks; b++) {
                        this.storage[t][s][b] = "";
                    }
                }
            }
        }

    }
}
