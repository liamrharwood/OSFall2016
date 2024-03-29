///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public commandHistory = [],
                    public historyIndex = 0,
                    public lastXCoords = []) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // Put the executed command in the command history (if it wasn't just used)
                    if(this.buffer != "") {
                        if(this.commandHistory[this.commandHistory.length-1] != this.buffer){
                            this.commandHistory.push(this.buffer);
                        }
                        this.historyIndex = this.commandHistory.length;
                    }
                    // ... and reset our buffer.
                    this.buffer = "";
                    this.lastXCoords = [];
                } else if (chr === String.fromCharCode(8)) { // Backspace key
                    this.backspace();
                } else if(chr === String.fromCharCode(9)) { // Tab key
                    // Get list of shell commands
                    var commands = [];
                    for(var i=0; i < _OsShell.commandList.length; i++) {
                        commands.push(_OsShell.commandList[i].command);
                    }
                    // Find best autocomplete candidate
                    var complete = this.autoComplete(this.buffer, commands);
                    if (complete) {
                        // Print it and update the buffer
                        this.putText(complete);
                        this.buffer += complete;
                    }
                } else if(chr === 'up') {
                    // Move up through the command history
                    if(this.historyIndex > 0) this.historyIndex--;
                    if (this.buffer != "") this.clearConsole();
                    var command = this.commandHistory[this.historyIndex];
                    if(command) {
                        this.lastXCoords = [];
                        this.putText(command);
                        this.buffer = command; 
                    }
                } else if(chr === 'down') {
                    // Move down through the command history
                    if(this.historyIndex < this.commandHistory.length-1) this.historyIndex++; 
                    if (this.buffer != "") this.clearConsole();
                    var command = this.commandHistory[this.historyIndex];
                    if(command) {
                        this.lastXCoords = [];
                        this.putText(command);
                        this.buffer = command;
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public autoComplete(text, data) {
            var candidates = [];
            // Filter data to find only strings that start with existing value
            for (var i=0; i < data.length; i++) {
              if (data[i].indexOf(text) == 0 && data[i].length > text.length)
                candidates.push(data[i]);
            }

            if (candidates.length > 0) {
              // Some candidates for autocompletion are found
              // If only one candidate, return the rest of the command
              if (candidates.length == 1) {
                  return candidates[0].slice(text.length, candidates[0].length);
              } else {
                  // If multiple candidates are found, find longest common substring to find best candidate
                  var index = text.length; 
                  var j;
                  var ch; 
                  var memo;
                  do {
                      memo = null;
                      for(j=0; j < candidates.length; j++) {
                          ch = candidates[j].charAt(index);
                          if(!ch) break;
                          if(!memo) memo = ch;
                          else if(ch != memo) break;
                      }
                  } while (j == candidates.length && index++);
                  // Return the rest of the command based on best candidate
                  return candidates[0].slice(text.length, index);
              }
            }
        }

        public backspace() {
            
            // Offsets for moving back and up
            var offsetX = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.slice(-1));
            var offsetY = _DefaultFontSize + 
                          _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                          _FontHeightMargin;

            // If too far left, go back up one line
            if(this.currentXPosition <= 0) {
                // Move to the ending X Coord of the line above
                this.currentXPosition = this.lastXCoords.pop();
                this.currentYPosition -= offsetY;
                // Clear last character
                _DrawingContext.clearRect(this.currentXPosition-offsetX, this.currentYPosition-offsetY+5, offsetX, offsetY+10);
                this.currentXPosition -= offsetX;
            } else {
                _DrawingContext.clearRect(this.currentXPosition-offsetX, this.currentYPosition-offsetY+5, offsetX, offsetY+10);
                this.currentXPosition -= offsetX;
            }
              
            // Update buffer
            this.buffer = this.buffer.slice(0, -1);            
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {    

                // Put each character individually
                for(var i=0; i < text.length; i++) {
                    
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    // If too far right, wrap the line
                    if(this.currentXPosition + offset > 500) {
                        // Store the ending X Coord of the line
                        this.lastXCoords.push(this.currentXPosition);
                        this.advanceLine();
                        // Draw the character
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                        this.currentXPosition += offset;
                    } else {
                        // Draw the character
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                        this.currentXPosition += offset;
                    }
                                           
                }
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var offset = _DefaultFontSize + 
                         _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                         _FontHeightMargin;
            this.currentYPosition += offset;

            // Scrolls CLI once text reaches the bottom
            if(this.currentYPosition > _Canvas.height) {
                var imageData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.putImageData(imageData, 0, -1 * offset);
                this.currentYPosition -= offset;
            }
        }

        public clearConsole(): void {
            // To clear all input, backspace until the buffer is empty
            while(this.buffer != ""){
                this.backspace();
            }
        }
    }
 }
