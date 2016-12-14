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
            var data = params[2];
            switch (operation) {
                case "format":
                    _Disk.initAllTSB();
                    break;
                case "create":
                    this.createFile(filename);
                    break;
                case "ls":
                    this.listFiles();
                    break;
                case "write":
                    this.writeFile(filename, data);
                    break;
                case "delete":
                    this.deleteFile(filename);
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
            return TSOS.Utils.tsb(mbr[3], mbr[4], mbr[5]); // Return TSB for next available file block
        };
        DeviceDriverFs.prototype.changeNextFile = function () {
            var mbr = _Disk.read("0,0,0");
            var mbrArr = mbr.split("");
            var found = false;
            for (var tsb in _Disk.storage) {
                // If a block is not in use and not in the first track
                if (_Disk.read(tsb)[0] === "0" && parseInt(tsb[0]) > 0) {
                    // console.log("TSB " + tsb + " has a " + _Disk.read(tsb)[0]);
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
        DeviceDriverFs.prototype.fileExists = function (filename) {
            for (var tsb in _Disk.storage) {
                // If the block is in use and in the first track
                if (_Disk.read(tsb)[0] === "1" && tsb[0] === "0") {
                    var data = _Disk.read(tsb).substring(4);
                    var existingName = TSOS.Utils.hexToString(data);
                    if (filename === existingName) {
                        return tsb;
                    }
                }
            }
            return undefined;
        };
        DeviceDriverFs.prototype.createFile = function (filename) {
            var dirTsb = this.getNextDir();
            var fileTsb = this.getNextFile();
            if (dirTsb === "f,f,f" || fileTsb === "f,f,f") {
                _StdOut.putText("There is no room on disk. Please delete something.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else if (this.fileExists(filename)) {
                _StdOut.putText("A file with that name already exists.");
                _StdOut.advanceLine();
                _StdOut.putText("Please choose a different name.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else {
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
            }
        };
        DeviceDriverFs.prototype.deleteFile = function (filename) {
            var dirTsb = this.fileExists(filename);
            if (dirTsb) {
                var dirBlock = _Disk.read(dirTsb);
                var fileTsb = TSOS.Utils.tsb(dirBlock[1], dirBlock[2], dirBlock[3]); // Find first file block
                _Disk.write(dirTsb, "0000" + EMPTY_FILE_DATA);
                do {
                    var fileBlock = _Disk.read(fileTsb);
                    _Disk.write(fileTsb, "0000" + EMPTY_FILE_DATA);
                    fileTsb = TSOS.Utils.tsb(fileBlock[1], fileBlock[2], fileBlock[3]);
                } while (fileTsb !== "f,f,f");
                this.changeNextDir();
                this.changeNextFile();
                _StdOut.putText("File deleted.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else {
                _StdOut.putText("File " + filename + " does not exist.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        };
        // This function does not delete directory entry (for overwriting)
        DeviceDriverFs.prototype.deleteFileData = function (filename) {
            var dirTsb = this.fileExists(filename);
            var dirBlock = _Disk.read(dirTsb);
            var fileTsb = TSOS.Utils.tsb(dirBlock[1], dirBlock[2], dirBlock[3]); // Find first file block
            var isFirst = true;
            do {
                var fileBlock = _Disk.read(fileTsb);
                if (isFirst) {
                    _Disk.write(fileTsb, "1fff" + EMPTY_FILE_DATA);
                    isFirst = false;
                }
                else {
                    _Disk.write(fileTsb, "0000" + EMPTY_FILE_DATA);
                }
                fileTsb = TSOS.Utils.tsb(fileBlock[1], fileBlock[2], fileBlock[3]);
            } while (fileTsb !== "f,f,f");
            this.changeNextFile();
        };
        DeviceDriverFs.prototype.writeFile = function (filename, data) {
            var dirTsb = this.fileExists(filename); // Get directory block
            if (dirTsb) {
                this.deleteFileData(filename); // Overwrite by deleting data first (but not completely deleting)
                var dirBlock = _Disk.read(dirTsb);
                data = TSOS.Utils.stringToHex(data);
                var fileTsb = TSOS.Utils.tsb(dirBlock[1], dirBlock[2], dirBlock[3]); // Find first file block
                var nextTsb = "";
                var blockSize = _Disk.numBytes - 4; // Data size per block
                while (data.length > 0) {
                    var dataToWrite = data.substring(0, blockSize);
                    data = data.substring(blockSize); // Remove the data that will be written
                    if (data.length > 0) {
                        var formatted = this.getNextFile();
                        if (formatted === "f,f,f") {
                            nextTsb = "fff";
                            _StdOut.putText("No more room on disk, file partially written.");
                            _StdOut.advanceLine();
                            data = "";
                        }
                        else {
                            nextTsb = formatted[0] + formatted[2] + formatted[4];
                        } // Get the digits of the next available block
                    }
                    else {
                        nextTsb = "fff"; // If the file is ending, put "fff" for EOF
                    }
                    var block = "1" + nextTsb + dataToWrite + EMPTY_FILE_DATA.substring(dataToWrite.length); // Create block (In use bit, pointer, and data)
                    // console.log("fileTsb: " + fileTsb + " nextTsb: " + nextTsb);
                    // console.log("Writing to: " + fileTsb);
                    _Disk.write(fileTsb, block); // Write it
                    this.changeNextFile(); // Update MBR with next available block
                    fileTsb = TSOS.Utils.tsb(nextTsb[0], nextTsb[1], nextTsb[2]); // Pointer for next block
                }
                _StdOut.putText("File write completed.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
            else {
                _StdOut.putText("File " + filename + " does not exist.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        };
        DeviceDriverFs.prototype.listFiles = function () {
            var noFiles = true;
            for (var tsb in _Disk.storage) {
                // If the block is in use and in the first track
                if (_Disk.read(tsb)[0] === "1" && tsb[0] === "0") {
                    var data = _Disk.read(tsb).substring(4);
                    _StdOut.putText(TSOS.Utils.hexToString(data));
                    _StdOut.advanceLine();
                    noFiles = false;
                }
            }
            if (noFiles) {
                _StdOut.putText("There are no files on disk.");
                _StdOut.advanceLine();
            }
            _OsShell.putPrompt();
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
