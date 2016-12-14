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
        DeviceDriverFs.prototype.changeNextDir = function () {
            var mbr = _Disk.read("0,0,0");
            var mbrArr = mbr.split("");
            var found = false;
            for (var tsb in _Disk.storage) {
                // If a block is not in use, and not the MBR, and it's in the first track
                if (_Disk.read(tsb)[0] === "0" && tsb !== "0,0,0" && tsb[0] === "0") {
                    mbrArr[0] = tsb[0];
                    mbrArr[1] = tsb[2];
                    mbrArr[2] = tsb[4];
                    // Write it to the MBR
                    _Disk.write("0,0,0", mbrArr.join(""));
                    found = true;
                    break;
                }
            }
            // If not found, there's no dir blocks left (Use fff to denote this)
            if (!found) {
                mbrArr[0] = "f";
                mbrArr[1] = "f";
                mbrArr[2] = "f";
                _Disk.write("0,0,0", mbrArr.join(""));
            }
        };
        DeviceDriverFs.prototype.getNextFile = function () {
            var mbr = _Disk.read("0,0,0");
            return TSOS.Utils.tsb(mbr[3], mbr[4], mbr[5]); // Return key for next available file block
        };
        DeviceDriverFs.prototype.changeNextFile = function () {
            var mbr = _Disk.read("0,0,0");
            var mbrArr = mbr.split("");
            var found = false;
            for (var tsb in _Disk.storage) {
                // If a block is not in use and not in the first track
                if (_Disk.read(tsb)[0] === "0" && parseInt(tsb[0]) > 0) {
                    mbrArr[3] = tsb[0];
                    mbrArr[4] = tsb[2];
                    mbrArr[5] = tsb[4];
                    // Write it to the MBR
                    _Disk.write("0,0,0", mbrArr.join(""));
                    found = true;
                    break;
                }
            }
            // If not found, there's no dir blocks left (Use fff to denote this)
            if (!found) {
                mbrArr[3] = "f";
                mbrArr[4] = "f";
                mbrArr[5] = "f";
                _Disk.write("0,0,0", mbrArr.join(""));
            }
        };
        DeviceDriverFs.prototype.createFile = function (filename) {
            var dirTsb = this.getNextDir();
            var fileTsb = this.getNextFile();
            var dirBlock = "1" + fileTsb[0] + fileTsb[2] + fileTsb[4]; // In use, T, S, B
            var nameHex = TSOS.Utils.stringToHex(filename); // Get hex for name string
            var spaceLeft = _Disk.numBytes - dirBlock.length - nameHex.length; // Find how much space is left after name
            if (spaceLeft >= 0) {
                dirBlock += nameHex;
                for (var i = 0; i < spaceLeft; i++) {
                    dirBlock += "0";
                }
                var fileBlock = "1fff" + EMPTY_FILE_DATA; // In use, fff to indicate end of file, empty data
                _Disk.write(dirTsb, dirBlock);
                _Disk.write(fileTsb, fileBlock);
                this.changeNextDir();
                this.changeNextFile();
                _StdOut.putText("File created successfully.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else {
                _StdOut.putText("Filename is too long.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
