///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) ||
                (keyCode == 32) ||
                (keyCode == 13)) {
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            keyCode = 41; // )
                            break;
                        case 49:
                            keyCode = 33; // !
                            break;
                        case 50:
                            keyCode = 64; // @
                            break;
                        case 51:
                            keyCode = 35; // #
                            break;
                        case 52:
                            keyCode = 36; // $
                            break;
                        case 53:
                            keyCode = 37; // %
                            break;
                        case 54:
                            keyCode = 94; // ^
                            break;
                        case 55:
                            keyCode = 38; // &
                            break;
                        case 56:
                            keyCode = 42; // *
                            break;
                        case 57:
                            keyCode = 40; // (
                            break;
                    }
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) ||
                ((keyCode >= 219) && (keyCode <= 222))) {
                switch (keyCode) {
                    case 186:
                        keyCode = 59; // ;
                        if (isShifted)
                            keyCode = 58; // :
                        break;
                    case 187:
                        keyCode = 61; // =
                        if (isShifted)
                            keyCode = 43; // +
                        break;
                    case 188:
                        keyCode = 44; // ,
                        if (isShifted)
                            keyCode = 60; // <
                        break;
                    case 189:
                        keyCode = 45; // -
                        if (isShifted)
                            keyCode = 95; // _
                        break;
                    case 190:
                        keyCode = 46; // .
                        if (isShifted)
                            keyCode = 62; // >
                        break;
                    case 191:
                        keyCode = 47; // /
                        if (isShifted)
                            keyCode = 63; // ?
                        break;
                    case 192:
                        keyCode = 96; // `
                        if (isShifted)
                            keyCode = 126; // ~
                        break;
                    case 219:
                        keyCode = 91; // [
                        if (isShifted)
                            keyCode = 123; // {
                        break;
                    case 220:
                        keyCode = 92; // \
                        if (isShifted)
                            keyCode = 124; // |
                        break;
                    case 221:
                        keyCode = 93; // ]
                        if (isShifted)
                            keyCode = 125; // }
                        break;
                    case 222:
                        keyCode = 39; // '
                        if (isShifted)
                            keyCode = 34; // "
                        break;
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
