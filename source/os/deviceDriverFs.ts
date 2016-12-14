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

        public getNextFile() {
            var mbr = _Disk.read("0,0,0");
            return Utils.tsb(mbr[3], mbr[4], mbr[5]); // Return key for next available file block
        }

        public createFile(filename) {
            var dirTsb = this.getNextDir();
            var fileTsb = this.getNextFile();

            var dirBlock = "1" + fileTsb[0] + fileTsb[2] + fileTsb[4]; // In use, T, S, B

            var nameHex = Utils.stringToHex(filename);
            console.log(nameHex);
            var spaceLeft = _Disk.numBytes - dirBlock.length - nameHex.length;
            dirBlock += nameHex;
            for(var i = 0; i < spaceLeft; i++) {
                dirBlock += "0";
            }

            var fileBlock = "1FFF" + EMPTY_FILE_DATA; // In use, FFF to indicate end of file, empty data

            _Disk.write(dirTsb, dirBlock);
            _Disk.write(fileTsb, fileBlock);

        }

    }
}
