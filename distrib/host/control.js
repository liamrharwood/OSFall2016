///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="../os/canvastext.ts" />
/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            this.updateHostTaskBar();
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        Control.updateCPUDisplay = function () {
            var tableHTML = "<tr>";
            tableHTML += "<td>" + _CPU.instruction + "</td>";
            tableHTML += "<td>" + _CPU.PC + "</td>";
            tableHTML += "<td>" + _CPU.Acc + "</td>";
            tableHTML += "<td>" + _CPU.Xreg + "</td>";
            tableHTML += "<td>" + _CPU.Yreg + "</td>";
            tableHTML += "<td>" + _CPU.Zflag + "</td>";
            tableHTML += "</tr>";
            document.getElementById("CPUTableInfo").innerHTML = tableHTML;
        };
        Control.updateMemoryDisplay = function () {
            var tableHTML = "";
            for (var i = 0; i < _MemorySize / 8; i++) {
                var rowNumber = i * 8;
                var rowAddress = rowNumber.toString(16).toUpperCase(); // Get hex address values
                while (rowAddress.length < 3) {
                    rowAddress = "0" + rowAddress;
                }
                tableHTML += "<tr><td>0x" + rowAddress + "</td>";
                for (var j = 0; j < 8; j++) {
                    tableHTML += "<td";
                    if (_CPU.PC === i * 8 + j)
                        tableHTML += ' style="background-color: green;"';
                    tableHTML += ">" + _Memory.memArr[i * 8 + j] + "</td>";
                }
                tableHTML += "</tr>";
            }
            document.getElementById("memoryTable").innerHTML = tableHTML;
        };
        Control.updateHostTaskBar = function () {
            var date = TSOS.Utils.getDateTime();
            document.getElementById("divTaskBar").innerHTML = "Status: " + _SystemStatus + "  ---  " + date.month + "/"
                + date.day + "/"
                + date.year + " "
                + date.hour + ":"
                + date.minute + " "
                + date.ampm;
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStepMode").disabled = false;
            document.getElementById("btnStep").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            document.getElementById("display").style.border = "2px solid green";
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new TSOS.Memory();
            _Memory.init();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?   
            document.getElementById("display").style.border = "2px solid red";
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostBtnSingleStep_toggle = function (btn) {
            _SingleStepMode = !_SingleStepMode;
            if (_SingleStepMode) {
                btn.value = "Single Step Mode: On";
                btn.style = "background-color: green;";
                document.getElementById("btnStep").disabled = false;
            }
            else {
                btn.value = "Single Step Mode: Off";
                btn.style = "background-color: red;";
                document.getElementById("btnStep").disabled = true;
            }
        };
        Control.hostBtnStep_click = function (btn) {
            if (_SingleStepMode)
                _CPU.isExecuting = true;
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
