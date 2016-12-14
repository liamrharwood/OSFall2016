///<reference path="../globals.ts" />
/* ------------
     Disk.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk(numTracks, numSectors, numBlocks, numBytes) {
            if (numTracks === void 0) { numTracks = 4; }
            if (numSectors === void 0) { numSectors = 8; }
            if (numBlocks === void 0) { numBlocks = 8; }
            if (numBytes === void 0) { numBytes = 64; }
            this.numTracks = numTracks;
            this.numSectors = numSectors;
            this.numBlocks = numBlocks;
            this.numBytes = numBytes;
            this.storage = sessionStorage;
            if (this.storage.length > 0) {
                this.isFormatted = true;
            }
            else {
                this.isFormatted = false;
            }
        }
        Disk.prototype.initAllTSB = function () {
            this.storage.clear();
            for (var t = 0; t < this.numTracks; t++) {
                for (var s = 0; s < this.numSectors; s++) {
                    for (var b = 0; b < this.numBlocks; b++) {
                        var bytes = "";
                        if (t === 0 && s === 0 && b === 0) {
                            bytes += "001100"; // Set first available dir entry and file entry (0,0,1 and 1,0,0) for MBR
                            for (var i = 0; i < this.numBytes - 6; i++)
                                bytes += 0; // set rest to 0
                        }
                        else {
                            for (var i = 0; i < this.numBytes; i++)
                                bytes += 0;
                        }
                        this.storage.setItem(TSOS.Utils.tsb(t, s, b), bytes); // Set everything to 0
                    }
                }
            }
            this.isFormatted = true;
            TSOS.Control.updateDiskDisplay();
        };
        Disk.prototype.write = function (tsb, bytes) {
            this.storage.setItem(tsb, bytes);
            TSOS.Control.updateDiskDisplay();
        };
        Disk.prototype.read = function (tsb) {
            return this.storage.getItem(tsb);
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
