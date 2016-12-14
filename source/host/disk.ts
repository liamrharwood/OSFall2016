///<reference path="../globals.ts" />

/* ------------
     Disk.ts
     ------------ */

module TSOS {

    export class Disk {

        public storage;

        constructor(public numTracks : number = 4,
                    public numSectors : number = 8,
                    public numBlocks : number = 8,
                    public numBytes : number = 64) {
            this.storage = sessionStorage;
        }

        public initAllTSB() {
            this.storage.clear();
            for(var t = 0; t < this.numTracks; t++) {
                for(var s = 0; s < this.numSectors; s++) {
                    for(var b = 0; b < this.numBlocks; b++) {
                        var bytes = "";
                        if(t === 0 && s === 0 && b === 0) {
                            bytes += "001100"; // Set first available dir entry and file entry (0,0,1 and 1,0,0) for MBR
                            for(var i = 0; i < this.numBytes - 6; i++)
                                bytes += 0; // set rest to 0
                        } else {
                            for(var i = 0; i < this.numBytes; i++)
                                bytes += 0;
                        }
                        this.storage.setItem(Utils.tsb(t,s,b), bytes); // Set everything to 0
                    }
                }
            }
            Control.updateDiskDisplay();
        }

        public write(tsb, bytes) {
            this.storage.setItem(tsb, bytes);
            Control.updateDiskDisplay();
        }

        public read(tsb) {
            return this.storage.getItem(tsb);
        }

    }
}
