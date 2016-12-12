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
            this.storage = sessionStorage; // Use HTML5 session storage for disk
        }
        Disk.prototype.initAllTSB = function () {
            for (var t = 0; t < this.numTracks; t++) {
                for (var s = 0; s < this.numSectors; s++) {
                    for (var b = 0; b < this.numTracks; b++) {
                        this.storage[t][s][b] = "";
                    }
                }
            }
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
