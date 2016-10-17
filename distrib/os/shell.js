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
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user code.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Runs the specified process.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
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
                        _StdOut.putText("Load checks to see if user code is valid.");
                        break;
                    case "run":
                        _StdOut.putText("Run runs the process specified by PID.");
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
                _MemoryManager.clearAllMemory();
                _MemoryManager.loadUserCode(codeArr);
                var pcb = new TSOS.PCB();
                _CurrentPCB = pcb;
                _StdOut.putText("Program loaded. PID: " + pcb.pid);
            }
            else {
                _StdOut.putText("Invalid program input.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                if (_CurrentPCB.pid === parseInt(args[0])) {
                    _CPU.isExecuting = true;
                }
                else {
                    _StdOut.putText("Specified PID does not exist.");
                }
            }
            else {
                _StdOut.putText("Please specify a PID.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
