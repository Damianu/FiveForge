SBPMacro = (function () {
    var _MODULE_EXPORTS = {};
    var i = 1; // 0 should be invalid because it matches null etc
    const TokenType = {

        GROUP: i++, //Retokenizes contents and keeps ()
        GROUP_DONTKEEP: i++, //Retokenizes content but doesnt keep ()
        ASSIGN: i++,
        CMD: i++,
        MATH: i++,

        ENDLINE: i++,
    }
    _MODULE_EXPORTS.TokenType = TokenType;


    const InstructionType = {

        ASSIGN: i++,
        ENDASSIGN: i++, //Its not really used as assign takes only 2 args(name and val), inserted only for debug

        CALLCMD: i++,
        ENDCALL: i++,

        STARTGROUP: i++,
        ENDGROUP: i++,

        ADD: i++,
        SUB: i++,
        MULT: i++,
        DIV: i++,
        POW: i++,
        GT: i++, //Greater than
        LT: i++, //Less than
        GOE: i++, //Greater or Equal
        LOE: i++, //Less or equal
        EQ: i++, //Equal
        AND: i++,
        OR: i++,
        ENDMATH: i++, //Its not really used as math always take next 2 args, inserted only for debug
    }
    _MODULE_EXPORTS.InstructionType = InstructionType;

    const DataType = {
        VARIABLE: i++,
        STRING: i++,
        NUMBER: i++,
    }
    _MODULE_EXPORTS.DataType = DataType;

    function getKeyFromObject(obj, val) {
        for (var k in obj) {
            if (obj[k] == val) {
                return k;
            }
        }
        return null;
    }

    function isType(t) {
        return getKeyFromObject(DataType, t) == true
    }

    function isLineEnding(char) {
        return char === false || char === undefined || char === null || char == ";" || char === "\0";
    }

    function isQuote(char) {
        return char === "\"" || char === "'";
    }

    var Tokenizer = new function () {
        this.pos = 0;
        this.line = 0;
        this.linepos = 0;
        this.tokens = [];
        this.result = null;
        this.addToken = function (token, data, expression) {
            if (expression != undefined) {
                throw new Error("get rid of that");
            }
            if (!getKeyFromObject(TokenType, token) && !getKeyFromObject(DataType, token)) {
                throw this.exception("Unknown token:" + token);
            }
            if (!data || data.length < 0) {
                throw this.exception("Trying to add empty token, bad regex?");
            }
            this.tokens[this.tokens.length] = [token, data, expression == true];
        }
        // Eats pattern if it matches and returns it, sets character to one AFTER pattern
        this.nextPattern = function (pattern) {
            if (typeof (pattern) == "string" || !pattern.sticky) {
                throw new Error("Use regex with sticky flag!");
            }

            var str = this.data.substring(0, this.data.indexOf(";"));
            var result = str.match(pattern);
            if (result) {
                this.data = this.data.substring(result[0].length)
                this.linepos += result[0].length;
                this.pos += result[0].length;
                this.character = this.data[0];
                this.result = result;
                return result;
            }
            this.result = null;
            return false;
        }
        this.nextChar = function () //Eats current char and pops new one
        {
            if (this.data.length > 0) {
                this.pos++;
                this.linepos++;
                this.data = this.data.substring(1);
                this.character = this.data[0];
                return this.character;
            }
            return false
        }

        this.skipSpaces = function () // eats all the spaces, DONT use nextChar after it
        {
            var found = false;
            var char = this.character;
            while (!isLineEnding(char) && char == " ") {
                char = this.nextChar();
                found = true;
            }
            this.pos--;
            this.linepos--;
            return found;
        }

        this.exception = function (text) {
            var error = new Error("TokenizerException: L:" + this.line + "C:" + this.linepos + " " + text);
            console.log("Lexed ", this.tokens, this.data);
            return error
        }
        this.tokenize = function (source, line, linepos) {
            this.pos = 0;
            this.line = line || 0;
            this.linepos = linepos || 0;
            this.data = source;
            this.data.replace("\r", ""); // Get rid of carriage returns
            this.data.replace("\t", "  "); //Tab to 2 spaces
            this.data = this.data.trim(); // Get rid of spaces
            this.data = this.data + ";"; // Make sure there's ; at the end
            this.character = this.data[0];
            this.tokens = [];
            //                    console.log("Lexing ", this.data);
            for (i = 1; this.data.length > 0 && i > 0; ++i) {
                if (i > 100) {
                    throw "Infinite loop?";
                }
                this.skipSpaces();
                var char = this.character;
                if (isLineEnding(char)) {
                    this.addToken(TokenType.ENDLINE, ";");
                    this.nextChar();
                    this.linepos = 0;
                    this.line++;
                    continue;
                } else if (char == "$") {
                    this.nextChar();
                    if (!this.nextPattern(/[a-zA-Z_][a-zA-Z0-9_]*/y)) //Name
                    {
                        throw this.exception("Expected variable name");
                    }
                    this.addToken(TokenType.ASSIGN, this.result[0]);
                    this.skipSpaces();
                    if (!this.nextPattern(/\=\s*(.+)/y)) //Value
                    {
                        throw this.exception("Unknown assignment");
                    }
                    this.addToken(TokenType.GROUP, this.result[1]); //Treat rest as group so it gets its own scope
                    continue; //Skip line ending, we already covered it
                } else if (this.nextPattern(/\/([a-zA-Z_][a-zA-Z0-9_]*)/y)) //Cmd
                {
                    this.addToken(TokenType.CMD, this.result[1]);
                    if (!this.nextPattern(/\s*(.+)/y)) //Value
                    {
                        throw this.exception("Unknown arguments");
                    }
                    this.addToken(TokenType.GROUP_DONTKEEP, this.result[1]); //Treat rest as group so it will be pushed as data instead of values
                    continue; //Skip line ending, we already covered it
                } else if (isQuote(char)) // Quotes
                {
                    var found = false;
                    var quote = this.character; // Quote we are looking for
                    var char = this.nextChar();
                    var token = "";
                    while (!isLineEnding(char)) {
                        if (char === "\\") {
                            token += char;
                            char = this.nextChar();
                            token += char;
                            char = this.nextChar();
                            continue;
                        }
                        if (char === quote) {
                            break;
                        }

                        token += char;
                        char = this.nextChar();
                    }
                    if (isLineEnding(char)) {
                        throw this.exception("Unfinished string");
                    }
                    this.nextChar(); //eat ending quote
                    this.addToken(DataType.STRING, token);

                } else if (char === "(") //Brackets(groups)
                {
                    var found = false;
                    var char = this.character;
                    var sum = 0;
                    var token = "";
                    while (!isLineEnding(char)) {
                        if (char == "(") {
                            sum = sum + 1
                        } else if (char == ")") {
                            sum = sum - 1
                        }
                        if (sum == 0) {
                            break;
                        }
                        char = this.nextChar();
                        token += char;
                    }
                    if (sum != 0) {
                        throw this.exception("Unmathed ()!");
                    }
                    token = token.substring(0, token.length - 1);
                    this.nextChar();

                    this.addToken(TokenType.GROUP, token);
                } else if (this.nextPattern(/([0-9]+d[0-9]+[\S]*)/y)) //Rolls
                {
                    this.addToken(TokenType.GROUP_DONTKEEP, '/roll ' + '"' + this.result[1] + '"');
                } else if (this.nextPattern(/[0-9%.]+/y)) //Numbers
                {
                    this.addToken(DataType.NUMBER, this.result[0]);
                } else if (this.nextPattern(/@([a-zA-Z_.][a-zA-Z0-9_.]*)/y)) //Variables
                {
                    this.addToken(DataType.VARIABLE, this.result[1]);
                } else if (char === "+" || char === "-" || char === "*" || char == "/" || char == "^" || char == ">" || char == "<" || char == "&" || char == "|" || char == "=") //Math
                {
                    this.nextChar();
                    if (char == "=") {
                        if (this.character == char) // Double ==
                        {
                            char = char + this.character;
                            this.nextChar();
                        } else {
                            throw this.exception("Assignment operator can be only used after $var");
                        }
                    } else if ((char == "&" || char == "|") && this.character == char) // Double & |
                    {
                        char = char + this.character;
                        this.nextChar();
                    } else if ((char == ">" || char == "<") && this.character == "=") // >= <=
                    {
                        char = char + this.character;
                        this.nextChar();
                    }
                    // Inject token before previous one so 2+2 is +,2,2
                    var prevToken = this.tokens.pop(); // Get previous token
                    this.addToken(TokenType.MATH, char); // Insert our operand
                    this.tokens.push(prevToken); // Insert back old one
                } else {
                    this.skipSpaces();
                    if (!isLineEnding(this.character)) {
                        console.log(source);
                        throw this.exception("Expected line ending, got " + this.character);
                    }

                }
            }
            //console.log("Lexed ", this.tokens);
            return this.tokens;
        }
    }
    _MODULE_EXPORTS.Tokenizer = Tokenizer;

    var Parser = function () {
        this.stack = []
        this.action = null;
        this.targets = null;
        this.pos = 0;
        this.tokens = [];
        this.token = null;
        this.exception = function (txt) {
            return new Error("Parser exception: " + txt);
        }
        this.push = function (action) {
            this.stack.push(action);
        }
        this.pushToken = function () {
            var token = this.token[0];
            var tokenval = this.token[1];
            if (token == TokenType.GROUP || token == TokenType.GROUP_DONTKEEP) {
                var tokens = Tokenizer.tokenize(tokenval);
                var p = new Parser();
                var inscope = p.parseScope(tokens);
                this.stack = this.stack.concat(inscope);

                return;
            }
            this.stack.push(tokenval);
        }
        this.nextToken = function () {
            this.pos++;
            if (this.pos < this.tokens.length) {
                this.token = this.tokens[this.pos];
                return this.token;
            }
            this.token = null;
            return false;
        }
        this.parseScope = function (tokens) {
            this.pos = 0;
            this.tokens = tokens.slice();
            this.stack = [];
            this.token = this.tokens[0];

            var token = this.token
            var _tmp = 0;
            while (this.token) {
                if (_tmp < 0 || _tmp > 1000) {
                    throw "Infinity loop in parser?"
                }
                _tmp++;

                token = this.token;
                if (token[0] == TokenType.GROUP) {
                    this.push(InstructionType.STARTGROUP);
                    this.pushToken();
                    this.nextToken();
                    this.push(InstructionType.ENDGROUP);
                } else if (token[0] == TokenType.GROUP_DONTKEEP) {
                    this.pushToken();
                    this.nextToken();
                } else if (token[0] == TokenType.ASSIGN) {
                    this.push(InstructionType.ASSIGN);
                    //Name
                    this.pushToken();
                    this.nextToken();
                    //Value
                    this.pushToken();
                    this.nextToken();
                } else if (token[0] === TokenType.CMD) {
                    this.push(InstructionType.CALLCMD);
                    //Name
                    this.pushToken();
                    //Variables
                    this.nextToken();
                    var t = this.token[0]; // type of the token
                    if (t === TokenType.GROUP_DONTKEEP) {
                        this.pushToken();
                    } else if (t !== TokenType.ENDLINE) { //if its ENDLINE it simply has no arguments
                        throw this.exception("Arguments to cmd have to be dontkeep group!")
                    }
                    this.nextToken(); //Eat that group

                    this.push(InstructionType.ENDCALL);
                } else if (token[0] === DataType.STRING) {
                    this.push(DataType.STRING);
                    this.pushToken();
                    this.nextToken();
                } else if (token[0] === DataType.NUMBER) {
                    this.push(DataType.NUMBER);
                    this.pushToken();
                    this.nextToken();
                } else if (token[0] === DataType.VARIABLE) {
                    this.push(DataType.VARIABLE);
                    this.pushToken();
                    this.nextToken();
                } else if (token[0] === TokenType.MATH) {
                    var op = this.token[1];
                    if (op === "+") {
                        this.push(InstructionType.ADD);
                    } else if (op === "-") {
                        this.push(InstructionType.SUB);
                    } else if (op === "*") {
                        this.push(InstructionType.MULT);
                    } else if (op === "/") {
                        this.push(InstructionType.DIV);
                    } else if (op === "^") {
                        this.push(InstructionType.POW);
                    } else if (op === ">") {
                        this.push(InstructionType.GT);
                    } else if (op === ">=") {
                        this.push(InstructionType.GOE);
                    } else if (op === "<") {
                        this.push(InstructionType.LT);
                    } else if (op === "<=") {
                        this.push(InstructionType.LOE);
                    } else if (op === "==") {
                        this.push(InstructionType.EQ);
                    } else if (op === "&&") {
                        this.push(InstructionType.AND);
                    } else if (op === "||") {
                        this.push(InstructionType.OR);
                    } else {
                        throw this.exception("Unknown math operand: " + op + (">" == op));
                    }
                    this.nextToken();
                } else if (token[0] === TokenType.ENDLINE) // Dont do anything, its only used for blocks
                {
                    this.nextToken();
                } else if (token[0] === TokenType.STARTGROUP) {
                    this.push(InstructionType.STARTGROUP)
                    this.nextToken();
                } else if (token[0] === TokenType.ENDGROUP) {
                    this.push(InstructionType.ENDGROUP)
                    this.nextToken();
                } else {
                    throw this.exception("This token shouldnt be there: " + getKeyFromObject(TokenType, token[0]));
                }
            }
            return this.stack;
        }
    }
    _MODULE_EXPORTS.Parser = Parser;

    var Transpiler = function () {
        this.stack = {};
        this._CMDS = [];
        this.transpile = function (op) {
            var stack = this.stack;
            var _CMDS = this._CMDS;
            switch (op) {
                //*Blocks*//
                case InstructionType.STARTGROUP:
                    var inner = "";
                    var o = stack.shift();
                    while (o != InstructionType.ENDGROUP) {
                        inner += this.transpile(o);
                        o = stack.shift();
                    }
                    return "(" + inner + ")";
                case InstructionType.CALLCMD:
                    var cmdname = stack.shift();
                    var o = stack.shift();
                    var args = [];
                    while (o != InstructionType.ENDCALL) {
                        args.push(this.transpile(o));
                        o = stack.shift();
                    }
                    out = "sandbox_" + cmdname + " (";
                    _CMDS.push(cmdname);
                    for (k in args) {
                        out += args[k] + ",";
                    }
                    out = out.substring(0, out.length - 1) + ")";
                    return out;
                    //*MATH*//
                case InstructionType.ADD:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " + " + two
                case InstructionType.SUB:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " - " + two
                case InstructionType.MULT:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " * " + two
                case InstructionType.DIV:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " / " + two
                case InstructionType.POW:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " ^ " + two
                case InstructionType.GT:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " > " + two
                case InstructionType.LT:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " < " + two
                case InstructionType.GOE:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " >= " + two
                case InstructionType.LOE:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " <= " + two
                case InstructionType.EQ:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " == " + two
                case InstructionType.AND:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " && " + two
                case InstructionType.OR:
                    var one = this.transpile(stack.shift());
                    var two = this.transpile(stack.shift());
                    return one + " || " + two
                default:
                    throw "Unknown op " + op;

                    //*END OF MATH*//
                    //*Data Types*//
                case DataType.VARIABLE:
                    var str = stack.shift().toString();
                    str = str.replace("\\", "\\\\");
                    str = str.replace("`", "");
                    var steps = str.split(".");
                    str = ""
                    for(var i = 0;i<steps.length;i++)
                    {
                        str += "[`"+steps[i]+"`]";
                    }
                    return "_VARIABLES"+str;
                case DataType.STRING:
                    return "`" + stack.shift().toString() + "`";
                case DataType.NUMBER:
                    return Number(stack.shift());
                    //*End of Data Types*//


                case InstructionType.ASSIGN:
                    var varname = stack.shift();
                    var o = stack.shift();
                    var val = this.transpile(o);
                    return "_VARIABLES[`" + varname + "`] = " + val;
            }
        }

        this.run = function (stack) {
            this.stack = stack;
            var transpiled = "var _VARIABLES = __ARG_VAR||{};\n"
            var op = stack.shift();
            while (op) {
                var code = this.transpile(op) + ";\n";;
                if (stack.length <= 0) {
                    code = "return " + code;
                }
                transpiled += code;
                op = stack.shift();
            }

            var cmdHeader = "";
            var processed = [];
            for (k in this._CMDS) {
                var v = this._CMDS[k];
                if (processed.indexOf(v) >= 0) {
                    continue;
                }
                processed.push(v);
                cmdHeader += "var sandbox_" + v + " = sandboxCMDS." + v + ";\n";
            }
            transpiled = cmdHeader + transpiled;
            return transpiled;
        }
    }
    _MODULE_EXPORTS.Transpiler = Transpiler;


    var sandboxFrame = document.createElement('iframe');
    sandboxFrame.src = "about:blank";
    sandboxFrame.style.cssText = "display:none;";
    document.body.appendChild(sandboxFrame);
    function SandboxedFunc(code) {
        var F = sandboxFrame.contentWindow.Function,
            args = Object.keys(sandboxFrame.contentWindow).join();
        return F("__ARG_VAR", "sandboxCMDS", args, code);
    }

    var TranspileMacro = function(source)
    {
        var tokenizer = Tokenizer;
        var parser = new Parser();
        var transpiler = new Transpiler();

        var tokens = tokenizer.tokenize(source);

        var stack = parser.parseScope(tokens);
        var jsCode = transpiler.run(stack);
        return SandboxedFunc(jsCode);
    }
    _MODULE_EXPORTS.TranspileMacro = TranspileMacro;
    return _MODULE_EXPORTS
}());