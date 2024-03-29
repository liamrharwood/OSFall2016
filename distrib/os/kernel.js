///<reference path="../globals.ts" />
///<reference path="queue.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize the memory manager.
            _MemoryManager = new TSOS.MemoryManager();
            // Initialize the process manager.
            _ProcessManager = new TSOS.ProcessManager();
            // Initialize the CPU scheduler
            _Scheduler = new TSOS.Scheduler();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load the File System Device Driver
            this.krnTrace("Loading the file system device driver.");
            _krnFsDriver = new TSOS.DeviceDriverFs(); // Construct it.
            _krnFsDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnFsDriver.status);
            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) {
                _CPU.cycle();
                _Scheduler.schedule();
            }
            else {
                this.krnTrace("Idle");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case FILE_SYSTEM_IRQ:
                    _krnFsDriver.isr(params);
                    break;
                case CONTEXT_SWITCH_IRQ:
                    _Scheduler.contextSwitch();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            if (msg === "...Protocolo Sombra v2 iniciado...") {
                // {{{{{{ QUIEN ES SOMBRA }}}}}}
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.fillStyle = "magenta";
                _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.fillStyle = "black";
                _DrawingContext.font = "bold 16px Courier New";
                _DrawingContext.fillText("                      :PB@Bk:", 10, 100);
                _DrawingContext.fillText("                  ,jB@@B@B@B@BBL.", 10, 115);
                _DrawingContext.fillText("               7G@B@B@BMMMMMB@B@B@Nr", 10, 130);
                _DrawingContext.fillText("           :kB@B@@@MMOMOMOMOMMMM@B@B@B1,", 10, 145);
                _DrawingContext.fillText("       :5@B@B@B@BBMMOMOMOMOMOMOMM@@@B@B@BBu.", 10, 160);
                _DrawingContext.fillText("    70@@@B@B@B@BXBBOMOMOMOMOMOMMBMPB@B@B@B@B@Nr", 10, 175);
                _DrawingContext.fillText("  G@@@BJ iB@B@@  OBMOMOMOMOMOMOM@2  B@B@B. EB@B@S", 10, 190);
                _DrawingContext.fillText("  @@BM@GJBU.  iSuB@OMOMOMOMOMOMM@OU1:  .kBLM@M@B@", 10, 205);
                _DrawingContext.fillText("  B@MMB@B       7@BBMMOMOMOMOMOBB@:       B@BMM@B", 10, 220);
                _DrawingContext.fillText("  @@@B@B         7@@@MMOMOMOMM@B@:         @@B@B@", 10, 235);
                _DrawingContext.fillText("  @@OLB.          BNB@MMOMOMM@BEB          rBjM@B", 10, 250);
                _DrawingContext.fillText("  @@  @           M  OBOMOMM@q  M          .@  @@", 10, 265);
                _DrawingContext.fillText("  @@OvB           B:u@MMOMOMMBJiB          .BvM@B", 10, 280);
                _DrawingContext.fillText("  @B@B@J         0@B@MMOMOMOMB@B@u         q@@@B@", 10, 295);
                _DrawingContext.fillText("  B@MBB@v       G@@BMMMMMMMMMMMBB@5       F@BMM@B", 10, 310);
                _DrawingContext.fillText("  @BBM@BPNi   LMEB@OMMMM@B@MMOMM@BZM7   rEqB@MBB@", 10, 325);
                _DrawingContext.fillText("  B@@@BM  B@B@B  qBMOMB@B@B@BMOMBL  B@B@B  @B@B@M", 10, 340);
                _DrawingContext.fillText("   J@@@@PB@B@B@B7G@OMBB.   ,@MMM@qLB@B@@@BqB@BBv", 10, 355);
                _DrawingContext.fillText("      iGB@,i0@M@B@MMO@E  :  M@OMM@@@B@Pii@@N:", 10, 370);
                _DrawingContext.fillText("         .   B@M@B@MMM@B@B@B@MMM@@@M@B", 10, 385);
                _DrawingContext.fillText("             @B@B.i@MBB@B@B@@BM@::B@B@", 10, 400);
                _DrawingContext.fillText("             B@@@ .B@B.:@B@ :B@B  @B@O", 10, 415);
                _DrawingContext.fillText("               :0 r@B@  B@@ .@B@: P:", 10, 430);
                _DrawingContext.fillText("                   vMB :@B@ :BO7", 10, 445);
                _DrawingContext.fillText("                       ,B@B", 10, 460);
                _SystemStatus = "PROTOCOLO SOMBRA";
                _OsShell.promptStr = "";
                document.getElementById("display").style.border = "2px solid red";
                this.krnShutdown();
            }
            else {
                // BSOD
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.fillStyle = "blue";
                _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.fillStyle = "white";
                _DrawingContext.font = "30px Courier New";
                _DrawingContext.fillText(">>> CRITICAL SYSTEM ERROR", 20, 100);
                _DrawingContext.font = "16px Courier New";
                _DrawingContext.fillText(">>> 4c 61 73 63 69 61 74 65 20", 20, 250);
                _DrawingContext.fillText(">>> 6f 67 6e 65 20 73 70 65 72", 20, 265);
                _DrawingContext.fillText(">>> 61 6e 7a 61 2c 20 76 6f 69", 20, 280);
                _DrawingContext.fillText(">>> 20 63 68 27 69 6e 74 72 61", 20, 295);
                _DrawingContext.fillText(">>> 74 65 ERROR ERROR ERROR ERROR", 20, 310);
                _SystemStatus = "OFFLINE";
                _OsShell.promptStr = "";
                document.getElementById("display").style.border = "2px solid red";
                this.krnShutdown();
            }
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
