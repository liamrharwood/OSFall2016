///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            // oneup
            sc = new TSOS.ShellCommand(this.shellOneup, "oneup", "<number> - Always tries to one-up you.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the task bar status.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "- Blow it all to kingdom come.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "[priority]- Loads user program.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Runs the specified process.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- Runs all programs in memory.");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Sets the Round Robin quantum in clock ticks.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Displays the PIDs of all active processes.");
            this.commandList[this.commandList.length] = sc;
            // kill <pid> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills an active process.");
            this.commandList[this.commandList.length] = sc;
            // format - formats the disk
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Formats the disk");
            this.commandList[this.commandList.length] = sc;
            // create <filename> - creates a new file
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<filename> - Creates a new file.");
            this.commandList[this.commandList.length] = sc;
            // write <filename> "data" - writes data to a file
            sc = new TSOS.ShellCommand(this.shellWrite, "write", '<filename> "data" - Writes data to an existing file.');
            this.commandList[this.commandList.length] = sc;
            // read <filename> - reads data from a file
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - Reads data from a file.");
            this.commandList[this.commandList.length] = sc;
            // delete <filename> - deletes an existing file
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - Deletes an existing file.");
            this.commandList[this.commandList.length] = sc;
            // ls - lists all the files in the directory
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- Lists all the files in the directory.");
            this.commandList[this.commandList.length] = sc;
            // getschedule - display the current scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellGetschedule, "getschedule", "- Displays the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // setschedule - set the current scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellSetschedule, "setschedule", "[rr, fcfs, priority] - Sets the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays information on the current OS version.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown stops the virtual OS but leaves the underlying hardware running.");
                        break;
                    case "man":
                        _StdOut.putText("That's this command! How meta.");
                        break;
                    case "cls":
                        _StdOut.putText("CLS clears the screen and resets the cursor position.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns the OS trace on or off (trace <on | off>).");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 does a rot13 obfuscation on a string argument.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the prompt for the OS.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays your current location.");
                        break;
                    case "oneup":
                        _StdOut.putText("Oneup will always try and outdo you.");
                        break;
                    case "status":
                        _StdOut.putText("Status sets the status message.");
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD simulates trapping a kernel error.");
                        break;
                    case "load":
                        _StdOut.putText("Load loads a user program into memory.");
                        break;
                    case "run":
                        _StdOut.putText("Run runs the process specified by PID.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clearmem clears all memory partitions.");
                        break;
                    case "runall":
                        _StdOut.putText("Runall runs all processes in memory.");
                        break;
                    case "quantum":
                        _StdOut.putText("Quantum sets the Round Robin quantum in clock ticks.");
                        break;
                    case "ps":
                        _StdOut.putText("Ps displays the PIDs of all active processes.");
                        break;
                    case "kill":
                        _StdOut.putText("Kill kills an active process.");
                        break;
                    case "format":
                        _StdOut.putText("Format formats the hard disk.");
                        break;
                    case "create":
                        _StdOut.putText("Create creates a file.");
                        break;
                    case "write":
                        _StdOut.putText("Write writes data to a file.");
                        break;
                    case "read":
                        _StdOut.putText("Read displays data from a file.");
                        break;
                    case "delete":
                        _StdOut.putText("Delete deletes a file.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Getschedule displays the current scheduling algorithm.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Setschedule sets the current scheduling algorithm.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var date = TSOS.Utils.getDateTime();
            _StdOut.putText("Today is: " + date.month + "/" + date.day + "/" + date.year);
        };
        Shell.prototype.shellWhereami = function (args) {
            _StdOut.putText("Cyberspace, man. You're in your element.");
        };
        Shell.prototype.shellOneup = function (args) {
            if (args.length > 0) {
                var oneup = Number(args[0]) + 1;
                _StdOut.putText(String(oneup));
                _StdOut.advanceLine();
                _StdOut.putText("Beat that!");
            }
            else {
                _StdOut.putText("You didn't put anything! Too easy.");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                _SystemStatus = "";
                for (var i = 0; i < args.length; i++) {
                    if (i !== 0)
                        _SystemStatus += " ";
                    _SystemStatus += args[i];
                }
                _StdOut.putText("Status set to: '" + _SystemStatus + "'.");
            }
            else {
                _StdOut.putText("Please specify a status.");
            }
        };
        Shell.prototype.shellBsod = function (args) {
            _Kernel.krnTrapError("SELF DESTRUCT");
        };
        Shell.prototype.shellLoad = function (args) {
            // Get typed-in code
            var userCode = document.getElementById("taProgramInput").value;
            // Split individual op codes
            var codeArr = userCode.split(" ");
            // Regex for op code
            var regexp = /[A-F0-9][A-F0-9]\s*|\s+/g;
            var isValid = true;
            for (var i = 0; i < codeArr.length; i++) {
                // Get rid of pesky newlines
                codeArr[i].replace(/\n|\r/g, "");
                var matches = codeArr[i].match(regexp);
                // If there's a valid op code...
                if (matches) {
                    if (matches.length != 1) {
                        isValid = false;
                    }
                }
                else {
                    isValid = false; // No valid op code, not valid
                }
            }
            if (isValid) {
                var pcb = new TSOS.PCB();
                if (args.length > 0)
                    pcb.priority = args[0];
                _MemoryManager.loadProgram(codeArr, pcb);
            }
            else {
                _StdOut.putText("Invalid program input.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                var pcb = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb) {
                    _ProcessManager.runProcess(pcb);
                }
                else {
                    _StdOut.putText("Specified PID does not exist.");
                }
            }
            else {
                _StdOut.putText("Please specify a PID.");
            }
        };
        Shell.prototype.shellRunall = function (args) {
            if (_ProcessManager.residentList.length > 0) {
                _ProcessManager.runAll();
            }
            else {
                _StdOut.putText("There are no loaded programs");
            }
        };
        Shell.prototype.shellClearmem = function (args) {
            _MemoryManager.clearAllMemory();
            _StdOut.putText("Memory cleared.");
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                var quantum = parseInt(args[0]);
                _Scheduler.rrQuantum = quantum;
                _StdOut.putText("Round Robin quantum set to " + quantum + " clock ticks.");
            }
            else {
                _StdOut.putText("Please specify a quantum.");
            }
        };
        Shell.prototype.shellPs = function (args) {
            if (_CPU.isExecuting) {
                var displayTxt = "The PIDs of currently running processes are: ";
                displayTxt += _CurrentPCB.pid;
                for (var i = 0; i < _ProcessManager.readyQueue.getSize(); i++) {
                    displayTxt += ", ";
                    displayTxt += _ProcessManager.readyQueue.q[i].pid;
                }
                _StdOut.putText(displayTxt);
            }
            else {
                _StdOut.putText("No processes are currently running.");
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var pcb = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb) {
                    _ProcessManager.terminateProcess(pcb);
                }
                else {
                    _StdOut.putText("Specified PID does not exist.");
                }
            }
            else {
                _StdOut.putText("Please specify a PID.");
            }
        };
        Shell.prototype.shellFormat = function (args) {
            var params = ["format"];
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            _StdOut.putText("Disk formatted successfully.");
        };
        Shell.prototype.shellCreate = function (args) {
            if (args.length > 0) {
                var filename = args[0];
                var params = ["create", filename];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText("Please specify a filename.");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            if (args.length < 1) {
                _StdOut.putText("Please specify a filename.");
            }
            else if (args.length === 1) {
                _StdOut.putText("Please specify the data to write.");
            }
            else {
                var firstWord = args[1];
                var lastWord = args[args.length - 1];
                if (firstWord[0] === '"' && lastWord[lastWord.length - 1] === '"') {
                    var filename = args[0];
                    var data = "";
                    for (var i = 1; i < args.length; i++) {
                        if (i !== 1)
                            data += " ";
                        data += args[i];
                    }
                    data = data.substring(1, data.length - 1); // Get rid of quotes
                    var params = ["write", filename, data];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                }
                else {
                    _StdOut.putText("Please surrond the data with quotation marks.");
                }
            }
        };
        Shell.prototype.shellRead = function (args) {
            if (args.length > 0) {
                var filename = args[0];
                var params = ["read", filename];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText("Please specify a filename.");
            }
        };
        Shell.prototype.shellDelete = function (args) {
            if (args.length > 0) {
                var filename = args[0];
                var params = ["delete", filename];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText("Please specify a filename.");
            }
        };
        Shell.prototype.shellLs = function (args) {
            var params = ["ls"];
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
        };
        Shell.prototype.shellGetschedule = function (args) {
            switch (_Scheduler.algorithm) {
                case "rr":
                    _StdOut.putText("Round Robin (quantum=" + _Scheduler.rrQuantum + ")");
                    break;
                case "fcfs":
                    _StdOut.putText("First Come First Served");
                    break;
                case "priority":
                    _StdOut.putText("Nonpreemptive Priority");
                    break;
            }
        };
        Shell.prototype.shellSetschedule = function (args) {
            if (args.length > 0) {
                if (args[0] === "rr" || args[0] === "fcfs" || args[0] === "priority") {
                    _Scheduler.algorithm = args[0];
                }
                else {
                    _StdOut.putText("Please specify an algorithm: [rr, fcfs, priority].");
                }
            }
            else {
                _StdOut.putText("Please specify an algorithm: [rr, fcfs, priority].");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
