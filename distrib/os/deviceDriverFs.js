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
            }
        };
        return DeviceDriverFs;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFs = DeviceDriverFs;
})(TSOS || (TSOS = {}));
