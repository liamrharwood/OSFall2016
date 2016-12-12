///<reference path="../globals.ts" />
/* ------------
     Disk.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Disk = (function () {
        function Disk(numTracks, numSectors, numBlocks) {
            if (numTracks === void 0) { numTracks = 4; }
            if (numSectors === void 0) { numSectors = 8; }
            if (numBlocks === void 0) { numBlocks = 8; }
            this.numTracks = numTracks;
            this.numSectors = numSectors;
            this.numBlocks = numBlocks;
            this.storage = sessionStorage;
        }
        Disk.prototype.initAllTSB = function () {
            this.storage.clear();
            for (var t = 0; t < this.numTracks; t++) {
                for (var s = 0; s < this.numSectors; s++) {
                    for (var b = 0; b < this.numBlocks; b++) {
                        this.storage.setItem(TSOS.Utils.tsb(t, s, b), "");
                    }
                }
            }
            console.log(sessionStorage);
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
