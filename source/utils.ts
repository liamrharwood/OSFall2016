/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static getDateTime() {
            // Get today's date
            var date = new Date();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var year = date.getFullYear();

            var hour = date.getHours();
            var ampm = "am";
            if (hour >= 12) { 
                hour -= 12;
                ampm = "pm";
            }
            var minute = date.getMinutes();

            return {
                month: month,
                day: day,
                year: year,
                hour: hour,
                minute: minute,
                ampm: ampm
            };
        }

        public static tsb(t, s, b) {
            return t + "," + s + "," + b;
        }

        public static stringToHex(str) {
            var result = "";
            for(var i = 0; i < str.length; i++) {
                result += str.charCodeAt(i).toString(16);
            }    
            return result;
        }

        public static hexToString(hex) {
            var result = "";
            for(var i=0; i < hex.length; i += 2) {
                if(hex[i] === "0" && hex[i+1] === "0")
                    break;
                var code = parseInt(hex.substr(i, 2), 16);
                result += String.fromCharCode(code);
            }
            return result;
        }

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
    }
}
