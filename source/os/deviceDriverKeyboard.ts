///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)                     ||   // enter
                        (keyCode == 8 )                     ||   // backspace
                        (keyCode == 9 )) {                       // tab key
                if(isShifted) {
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
            } else if(((keyCode >= 186) && (keyCode <= 192)) || // punctuation keys
                      ((keyCode >= 219) && (keyCode <= 222)))  {
                switch (keyCode) {
                    case 186:
                        keyCode = 59; // ;
                        if(isShifted) keyCode = 58; // :
                        break;
                    case 187:
                        keyCode = 61; // =
                        if(isShifted) keyCode = 43; // +
                        break;
                    case 188:
                        keyCode = 44; // ,
                        if(isShifted) keyCode = 60; // <
                        break;
                    case 189:
                        keyCode = 45; // -
                        if(isShifted) keyCode = 95; // _
                        break;
                    case 190:
                        keyCode = 46; // .
                        if(isShifted) keyCode = 62; // >
                        break;
                    case 191:
                        keyCode = 47; // /
                        if(isShifted) keyCode = 63; // ?
                        break;
                    case 192:
                        keyCode = 96; // `
                        if(isShifted) keyCode = 126; // ~
                        break;
                    case 219:
                        keyCode = 91; // [
                        if(isShifted) keyCode = 123; // {
                        break;
                    case 220:
                        keyCode = 92; // \
                        if(isShifted) keyCode = 124; // |
                        break;
                    case 221:
                        keyCode = 93; // ]
                        if(isShifted) keyCode = 125; // }
                        break;
                    case 222:
                        keyCode = 39; // '
                        if(isShifted) keyCode = 34; // "
                        break;
                    
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 38 || // up arrow
                       keyCode == 40) { // down arrow
                if (keyCode == 38)
                    _KernelInputQueue.enqueue('up');
                else 
                    _KernelInputQueue.enqueue('down');
            }
        }
    }
}
