///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverFs.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFs = (function (_super) {
        __extends(DeviceDriverFs, _super);
        function DeviceDriverFs() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.driverEntry = this.krnFsDriverEntry;
            this.isr = this.isrFs;
        }
        DeviceDriverFs.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverFs.prototype.isrFs = function (params) {
            var operation = params[0];
            var filename = params[1];
            switch (operation) {
                case "format":
                    _Disk.initAllTSB();
                    break;
                case "create":
                    this.createFile(filename);
                    break;
            }
        };
        DeviceDriverFs.prototype.getNextDir = function () {
            var mbr = _Disk.read("0,0,0");
            return TSOS.Utils.tsb(mbr[0], mbr[1], mbr[2]); // Return key for next available dir block
        };
        DeviceDriverFs.prototype.getNextFile = function () {
            var mbr = _Disk.read("0,0,0");
            return TSOS.Utils.tsb(mbr[3], mbr[4], mbr[5]); // Return key for next available file block
        };
        DeviceDriverFs.prototype.createFile = function (filename) {
            var dirTsb = this.getNextDir();
            var fileTsb = this.getNextFile();
            var dirBlock = "1" + fileTsb[0] + fileTsb[2] + fileTsb[4]; // In use, T, S, B
            var nameHex = TSOS.Utils.stringToHex(filename);
            console.log(nameHex);
            var spaceLeft = _Disk.numBytes - dirBlock.length - nameHex.length;
            dirBlock += nameHex;
            for (var i = 0; i < spaceLeft; i++) {
                dirBlock += "0";
            }
            var fileBlock = "1FFF" + EMPTY_FILE_DATA; // In use, FFF to indicate end of file, empty data
            _Disk.write(dirTsb, dirBlock);
            _Disk.write(fileTsb, fileBlock);
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
