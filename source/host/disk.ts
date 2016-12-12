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
            this.storage = sessionStorage;
        }

        public initAllTSB() {
            this.storage.clear();
            for(var t = 0; t < this.numTracks; t++) {
                for(var s = 0; s < this.numSectors; s++) {
                    for(var b = 0; b < this.numBlocks; b++) {
                        this.storage.setItem(Utils.tsb(t,s,b), "");
                    }
                }
            }
            console.log(sessionStorage);
        }

    }
}
