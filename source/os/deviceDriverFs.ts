///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFs.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFs extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnFsDriverEntry;
            this.isr = this.isrFs;
        }

        public krnFsDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public isrFs(params) {
            var operation = params[0];
            var filename = params[1];

            switch(operation) {
                case "format":
                    _Disk.initAllTSB();
                    break;
                case "create":
                    this.createFile(filename);
                    break;

            }
        }

        public getNextDir() {
            var mbr = _Disk.read("0,0,0");
            return Utils.tsb(mbr[0], mbr[1], mbr[2]); // Return key for next available dir block
        }

        public changeNextDir() {
            var mbr = _Disk.read("0,0,0");
            var mbrArr = mbr.split("");
            
            var found = false;
            for(var tsb in _Disk.storage) {
                // If a block is not in use, and not the MBR, and it's in the first track
                if(_Disk.read(tsb)[0] === "0" && tsb !== "0,0,0" && tsb[0] === "0") {
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
            if(!found) {
                mbrArr[0] = "f";
                mbrArr[1] = "f";
                mbrArr[2] = "f";
                _Disk.write("0,0,0", mbrArr.join(""));
            }

        }

        public getNextFile() {
            var mbr = _Disk.read("0,0,0");
            return Utils.tsb(mbr[3], mbr[4], mbr[5]); // Return key for next available file block
        }

        public changeNextFile() {
            var mbr = _Disk.read("0,0,0");
            var mbrArr = mbr.split("");
            
            var found = false;
            for(var tsb in _Disk.storage) {
                // If a block is not in use and not in the first track
                if(_Disk.read(tsb)[0] === "0" && parseInt(tsb[0]) > 0) {
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
            if(!found) {
                mbrArr[3] = "f";
                mbrArr[4] = "f";
                mbrArr[5] = "f";
                _Disk.write("0,0,0", mbrArr.join(""));
            }
        }

        public createFile(filename) {
            var dirTsb = this.getNextDir();
            var fileTsb = this.getNextFile();

            var dirBlock = "1" + fileTsb[0] + fileTsb[2] + fileTsb[4]; // In use, T, S, B

            var nameHex = Utils.stringToHex(filename); // Get hex for name string
            var spaceLeft = _Disk.numBytes - dirBlock.length - nameHex.length; // Find how much space is left after name

            if(spaceLeft >= 0) {
                dirBlock += nameHex;
                for(var i = 0; i < spaceLeft; i++) {
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
            } else {
                _StdOut.putText("Filename is too long.");
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }

            

        }

    }
}
