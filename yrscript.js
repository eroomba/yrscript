
let yrReserved = {
    "YRTOK_PLUS": "+",
    "YRTOK_MINUS": "-",
    "YRTOK_STAR": "*",
    "YRTOK_SLASH": "/",
    "YRTOK_DOT": ".",
    "YRTOK_COMMA": ",",
    "YRTOK_HASH": "#",
    "YRTOK_BREAK": " "
}
let yrKeywordsDefault = yrKeywordPreset["DEFAULT"].settings;
let yrKeywords = yrKeywordsDefault;

let yrKeywordsDetail = {
    "help": {
        "desc": "Get help",
        "help": "{key} [COMMAND]",
        "label": "Get help"
    },
    "print": {
        "desc": "Print a string",
        "help": "{key} \"[PRINT_STRING]\"",
        "label": "Print string"
    },
    "echo": {
        "desc": "Print last result",
        "help": "{key}",
        "label": "Print last result"
    },
    "skey": {
        "desc": "Set keyword",
        "help": "{key} [OLD_VALUE] [NEW_VALUE]",
        "label": "Sey keyword"
    },
    "pnkeys": {
        "desc": "Print current keywords",
        "help": "{key}",
        "label": "Print current keywords"
    },
    "var": {
        "desc": "Variable declaration",
        "help": "{key} [VARIABLE_NAME] = [VALUE]",
        "label": "Declare a variable"
    },
    "assign": {
        "desc": "Assign value to variable.",
        "help": "[VARIABLE_NAME] {key} [VALUE]",
        "label": "Assign a value"
    },
    "if": {
        "desc": "If statement. Run [CODE_TO_RUN] if [CODE_TO_CHECK] is true (not equal to 0).",
        "help": "{key} [CODE_TO_CHECK] {do-cmd} [CODE_TO_RUN] {end-cmd}",
        "label": "If statement"
    },
    "while": {
        "desc": "While loop. Run [CODE_TO_RUN] until [CODE_TO_CHECK] isn't true (equals 0).\n(It won't loop more times than the [maxloop] setting for safety)",
        "help": "{key} [CODE_TO_CHECK] {do-cmd} [CODE_TO_RUN] {end-cmd}",
        "label": "While statement"
    },
    "do": {
        "desc": "Do command. Run [CODE_TO_RUN] until {end-cmd}.",
        "help": "{key} [CODE_TO_RUN] {end-cmd}",
        "label": "Begin code block"
    },
    "end": {
        "desc": "End a set of commands.",
        "help": "{do-cmd} [CODE_TO_CHECK] {key}",
        "label": "End code block"
    },
    "eq": {
        "desc": "Equal to.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Is equal"
    },
    "neq": {
        "desc": "Not equal to.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Not equal"
    },
    "gt": {
        "desc": "Greater than.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Greater than"
    },
    "lt": {
        "desc": "Less than.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Less than"
    },
    "gteq": {
        "desc": "Greater than or equal to.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Greater than or equal to"
    },
    "lteq": {
        "desc": "Less than or equal to.",
        "help": "[VALUE] {key} [VALUE]",
        "label": "Less than or equal to"
    },
    "eob": {
        "desc": "End the current block of code.",
        "help": "[CODE]{key}",
        "label": "End a statement"
    }

}

let yrKeywordType = {
    "eq": "YRTOK_COMP",
    "neq": "YRTOK_COMP",
    "lt": "YRTOK_COMP",
    "gt": "YRTOK_COMP",
    "lteq": "YRTOK_COMP",
    "gteq": "YRTOK_COMP",
    "assign": "YRTOK_ASSIGN",
    "eob": "YRTOK_EOB"
}

let yrSettingsDefault = {
    "maxloop": 100000
}

let ctxIdx = 0;

function yrKEnc(key) {
    return key.replace(/=/gi,"{{eq}}").replace(/</gi,"{{lt}}").replace(/>/gi,"{{gt}}").replace(/!/gi,"{{bang}}");
}

function yrKDec(key) {
    return key.replace(/{{eq}}/gi,"=").replace(/{{lt}}/gi,"<").replace(/{{gt}}/gi,">").replace(/{{bang}}/gi,"!");
}

function yrContext(op) {
    this.id = "<ctx" + ctxIdx++ + ">";
    this.stack = new Array();
    this.parent = "";
    this.heap = new Array();

    if (op != undefined && op != null) {
        if (op.id != undefined && op.id != null)
            this.id = op.id;
        if (op.parent != undefined && op.parent != null)
            this.parent = op.parent;
    }
}

function yrEnvironment(op) {
    this.id = "<env>";
    this.memory = null;
    this.keywords = yrKeywords;
    this.settings = yrSettingsDefault;
    this.contexts = {};
    this.contextId = "<envctx>";
    this.currentContext = this.contextId;
    this.setVocab = function() {
        this.keywords = yrKeywords;
    };

    this.contexts[this.contextId] = new yrContext({id: this.contextId});
}

function yrFlipDict(dict) {
    let retDict = {};
    for (key in dict) {
        retDict[dict[key]] = key;
    }
    return retDict;
}

function yrLex(code) {
    let tokens = new Array();
    let digits = "0123456789";
    let fdigits = digits + ".";
    let detectBreakCount = 0;
    let detectAssign = 0;

    let cReserved = yrFlipDict(yrReserved);

    let c = 0;
    while(c < code.length) {
        if (code[c] == yrReserved["YRTOK_HASH"]) {
            c++;
            while (c < code.length && code[c] != '\n') {
                console.log(code[c]);
                c++;
            }
            if (c < code.length && code[c] == '\n') c++;
            if (detectBreakCount > 0) detectBreakCount--;
        }
        else if (digits.indexOf(code[c]) >= 0) {
            let hasDot = false;
            let val = "";
            let type = "YRTOK_DOUBLE";
            while (c < code.length && fdigits.indexOf(code[c])>=0) {
                val += code[c];
                if (code[c] == '.')
                    hasDot = true;
                c++;
            }
            if (!hasDot) {
                tokens.push({"type": "YRTOK_INTEGER", "val": val});
            }
            else {
                tokens.push({"type": "YRTOK_DOUBLE", "val": val});
            }
        }
        else if (code[c] == '\"') {
            let val = "";
            c++;
            while(c < code.length && code[c] != '\"') {
                val += code[c];
                c++;
            }
            c++;

            tokens.push({"type": "YRTOK_STRING", "val": val });
        }
        else if (cReserved[yrKEnc(code[c])] != undefined && cReserved[yrKEnc(code[c])] != null) {
            if (cReserved[yrKEnc(code[c])] == "YRTOK_BREAK" && detectBreakCount > 0) {
                //detectBreakCount--;
                //tokens.push({ "type": cTokens[code[c]], "val": code[c]});
            }
            else if (cReserved[yrKEnc(code[c])] != "YRTOK_BREAK") {
                tokens.push({ "type": cReserved[yrKEnc(code[c])], "val": code[c]});
            }
            c++;
        }
        else if (yrKEnc(code[c]) == yrenv.keywords["eob"]) {
            tokens.push({"type": "YRTOK_EOB", "val": yrKEnc(code[c])});
            c++;
        }
        else if (/^[a-zA-Z]$/.test(code[c]) || "{}()[]=<>!_@".indexOf(code[c])>=0) {
            let val = "";
            let hVal = "";
            let hasVal = false;
            while(!hasVal && c < code.length && (/^[a-zA-Z0-9=<>!]$/.test(code[c]) || "{}()[]<>=!_@^".indexOf(code[c])>=0)) {
                if ("{}()[]".indexOf(code[c])>=0 && !hasVal) {
                    val = code[c] + "";
                    hasVal = true;
                }

                if (!hasVal) {
                    val += code[c]; 
                }
                c++;
            }
            
            let cKeywords = yrFlipDict(yrenv.keywords);

            if (cKeywords[yrKEnc(val)] != undefined && cKeywords[yrKEnc(val)] != null) {
                if (yrKEnc(val) == yrenv.keywords["do"] && detectBreakCount > 0) {
                    detectBreakCount--;
                    tokens.push({ "type": "YRTOK_BREAK", "val": ""});
                }
                let kType = "YRTOK_KEYWORD";
                if (yrKeywordType[cKeywords[yrKEnc(val)]] != undefined)
                    kType = yrKeywordType[cKeywords[yrKEnc(val)]];
                    
                tokens.push({"type": kType, "val": val });
            }
            else if (val == yred.runCmd) {
                tokens.push({"type": "YRTOK_EDITOR", "val": val });
            }
            else {
                tokens.push({"type": "YRTOK_IDENT", "val": val });
            }
            
        }
        else {
            c++;
        }
            
    }
    if (detectBreakCount > 0) {
        tokens.push({ "type": "YRTOK_BREAK", "val": ""});
    }
    tokens.push({ "type": "YRTOK_EOB", "val": ""});

    return tokens;
}

function yrGetVariable(ident) {
    if (yrenv.contexts[yrenv.currentContext].heap[ident] != undefined && yrenv.contexts[yrenv.currentContext].heap[ident] != null) {
        return {
            "type": yrenv.contexts[yrenv.currentContext].heap[ident].type,
            "val": yrenv.contexts[yrenv.currentContext].heap[ident].val
        }
    }
    else {
        yrcn.printn("ERROR: Variable '" + ident + "' not defined.");
        return null;
    }
}

function yrRun(tokens,start,end) {

    let end2 = end < 0 ? tokens.length : end;

    let exitBlock = false;

    let cursorStart = 0;
    let cursorEnd = 0;

    let runEnd = false;
    let runEndStart = 0;

    let r = start;
    cursorStart = r;
    cursorEnd = r-1;
    if (tokens.length>0) {
        while (r < end2 && !exitBlock) {
            let type = tokens[r].type;
            let val = tokens[r].val;
            let type2 = type;
            let val2 = val;
            if (type=="YRTOK_IDENT") {
                let iVal = yrGetVariable(val);
                if (iVal != null) {
                    type2 = iVal.type;
                    val2 = iVal.val;
                }
            }
    
            if ((val2 + "").length == 0) {
                r++;
            }
            else if (type == "YRTOK_EDITOR") {
                yred.process();
                r++;
            }
            else if (type == "YRTOK_EOB") {
                exitBlock = true;
                runEnd = true;
                runEndStart = r+1;
            }
            else if (type == "YRTOK_KEYWORD") {
                if (yrKEnc(val) == yrenv.keywords["help"]) {
                    r++;
                    let hMode = "";
                    if (r < end2 && (tokens[r].type == "YRTOK_IDENT" || tokens[r].type == "YRTOK_KEYWORD" || tokens[r].type == "YRTOK_COMP" || tokens[r].type == "YRTOK_ASSIGN")) {
                        hMode = tokens[r].val;
                        r++;
                    }
    
                    if (hMode.length == 0) {
                        yrcn.printn(genHelp[0]);
                        
                        let kyFlip = yrFlipDict(yrenv.keywords);
    
                        for (hMode in kyFlip) {
                            yrcn.printn(yrKDec(hMode));
                            yrcn.printn(yrKeywordsDetail[kyFlip[hMode]].desc.replace("{do-cmd}",yrKDev(yrenv.keywords["do"])).replace("{end-cmd}",yrKDEc(yrenv.keywords["end"])));
                            yrcn.printn("USAGE: " + yrKeywordsDetail[kyFlip[hMode]].help.replace("{key}",yrKDec(hMode)).replace("{do-cmd}",yrKDev(yrenv.keywords["do"])).replace("{end-cmd}",yrKDec(yrenv.keywords["end"])));
                            yrcn.printn("");
                        }
    
                        yrcn.printn(genHelp[1]);
                    }
                    else {
                        let kyFlip = yrFlipDict(yrenv.keywords);
                        
                        if (kyFlip[hMode] != undefined && kyFlip[hMode] != null) {
                            yrcn.printn("");
                            yrcn.printn(yrKDec(hMode));
                            yrcn.printn(yrKeywordsDetail[kyFlip[hMode]].desc.replace("{do-cmd}",yrKDec(yrenv.keywords["do"])).replace("{end-cmd}",yrKDec(yrenv.keywords["end"])));
                            yrcn.printn("USAGE: " + yrKeywordsDetail[kyFlip[hMode]].help.replace("{key}",yrKDec(hMode)).replace("{do-cmd}",yrKDec(yrenv.keywords["do"])).replace("{end-cmd}",yrKDec(yrenv.keywords["end"])));
                            yrcn.printn("");
                        }
                        else {
                            yrcn.printn("Can't help right now...");
                        }
                    }
                    exitBlock = true;
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["print"]) {
                    let hasPrint = true;
                    let printVal = "";
                    r++;
                    while (r < end2 && hasPrint && (tokens[r].type == "YRTOK_STRING" || tokens[r].type == "YRTOK_DOUBLE" || tokens[r].type == "YRTOK_INTEGER" || tokens[r].type == "YRTOK_IDENT")) {
                        if (tokens[r].type == "YRTOK_STRING" || tokens[r].type == "YRTOK_DOUBLE" || tokens[r].type == "YRTOK_INTEGER") {
                            var pRes = tokens[r].val;
                            printVal += pRes;
                            r++;
                        }
                        else if (tokens[r].type == "YRTOK_IDENT" ) {
                            let vName = tokens[r].val;
                            let v2 = yrGetVariable(vName);
                            if (v2 != null) {
                                printVal += v2.val;
                                r++;
                            }
                            else {
                                yrcn.printn("ERROR: Variable '" + vName + "' not defined.");
                                exitBlock = true;
                                hasPrint = false;
                            }
                        }
                        if (r < end2 && tokens[r].type == "YRTOK_COMMA") {
                            r++;
                        }
                    }
                    if (hasPrint) {
                        yrcn.printn(printVal);
                        yrenv.memory = { "type": "YRTOK_STRING", "val": printVal };
                    }
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["echo"]) {
                    r++;
                    if (yrenv.memory == null)
                        yrcn.printn("<empty>");
                    else
                        yrcn.printn(yrenv.memory.val);
                    
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["skey"]) {
                    let keyword = "";
                    let newKeyword = "";
                    r++;
                    if (r < end2 && (tokens[r].type == "YRTOK_KEYWORD" || tokens[r].type == "YRTOK_COMP" || tokens[r].type == "YRTOK_ASSIGN")) {
                        keyword = tokens[r].val;
                        r++;
                    }
                    else if (r < end2 && tokens[r].type == "YRTOK_EDITOR") {
                        yrcn.printn("ERROR: You cannot reassign the '" + yred.runCmd + "' command.");
                        exitBlock = true;
                    }
                    if (r < end2 && tokens[r].type == "YRTOK_IDENT") {
                        newKeyword = tokens[r].val;
                        r++;
                    }
                    if (newKeyword == yred.runCmd) {
                        yrcn.printn("ERROR: You cannot use the '" + yred.runCmd + "' command.");
                        exitBlock = true;
                    }
                    let kyFlip = yrFlipDict(yrenv.keywords);
                    if (keyword.length > 0 && newKeyword.length > 0 && (kyFlip[yrKEnc(keyword)] != undefined && kyFlip[yrKEnc(keyword)] != null)) {
                        let keyM = kyFlip[yrKEnc(keyword)];
                        let smallVal = false;
                        if (keyM[yrKEnc(newKeyword)] != undefined && keyM[yrKEnc(newKeyword)] != null) {
                            yrcn.printn("ERROR: '" + newKeyword + "' is already a command.");
                            exitBlock = true;
                        }
                        else if (yrenv.contexts[yrenv.currentContext].heap[newKeyword] != undefined) {
                            yrcn.printn("ERROR: '" + newKeyword + "' is a variable name.");
                            exitBlock = true;
                        }
                        else {
                            yrKeywords[yrKEnc(keyM)] = yrKEnc(newKeyword);
                            yrenv.setVocab();
                            yrcn.printn("set '" + keyword + "' to '" + newKeyword + "'");
                            if ("(){}[]".indexOf(newKeyword)>=1) smallVal = true;
                        }

                        if (smallVal && tokens[r].type == "YRTOK_IDENT") {
                            yrcn.printn("WARNING: The characters (){}[] must be alone so '" + tokens[r].val + "' has been skipped.");
                            r++;
                        }
                    }
                    else {
                        yrcn.printn("keyw: '" + keyword + "', newkeyw: '" + newKeyword + "', kenc: '" + yrKEnc(keyword) + "', nkenc: '" + yrKEnc(newKeyword) + "'");
                        yrcn.printn("ERROR: bad set syntax.");
                        exitBlock = true;
                    }
    
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["pnkeys"]) {
                    yrcn.printn("");
                    for (key in yrenv.keywords) {
                        yrcn.printn(yrKeywordsDetail[key].desc + ": " + yrKDec(yrenv.keywords[key]));
                    }
                    yrcn.printn("");
                    r++;
    
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["var"]) {
                    r++;
                    if (r < end2 && tokens[r].type != "YRTOK_IDENT") {
                        yrcn.printn("ERROR: must provide a variable name that is not a command.");
                        exitBlock = true;
                    }
                    else {
                        let vName = tokens[r].val;
                        if (yrenv.keywords[yrKEnc(vName)] != undefined) {
                            yrcn.printn("ERROR: there is already a command named '" + vName + "'.");
                            exitBlock = true;
                        }
                        else {
                            yrenv.contexts[yrenv.currentContext].heap[vName] = "";
                            r++;
                            if (r < end2 && tokens[r].type == "YRTOK_ASSIGN") {
                                r++;
        
                                let setStart = r;
                                let setEnd = r;
    
                                while (r < end2 && tokens[r].type != "YRTOK_EOB") {
                                    r++;
                                    setEnd++;
                                }
                                    
                                yrRun(tokens,setStart, setEnd);
                                yrenv.contexts[yrenv.currentContext].heap[vName] = yrenv.memory;
                            }
                            else {
                                yrcn.printn("ERROR: bad variable assignment.");
                                exitBlock = true;
                            }
                        }
                    }
    
                    cursorStart = r;
                    cursorEnd = r-1;
                }
                else if (yrKEnc(val) == yrenv.keywords["if"]) {
                    let validSyn = true;
                    r++;
                    let chkStart = r;
                    let chkEnd = r;
                    let runStart = r;
                    let runEnd = r;
                    while (r < end2 && !(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["do"])) {
                        chkEnd++;
                        r++;
                    }
                    if (r >= end2) {
                        yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["if"]) + " syntax [1].");
                        exitBlock = true;
                    }
                    else {
                        if (!(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["do"])) {
                            yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["if"]) + " syntax [2].");
                            exitBlock = true;
                        }
                        else {
                            r++;
                            runStart = r;
                            runEnd = r;
                            let inBlock = false;
                            let runLines = new Array();
                            while (r < end2 && !(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["end"])) {
                                if (tokens[r].type == "YRTOK_EOB") {
                                    runLines.push({ "start": runStart, "end": runEnd});
                                    r++;
                                    runStart = r;
                                    runEnd = r;
                                    inBlock = false;
                                }
                                else {
                                    inBlock = true;
                                    runEnd++;
                                    r++;
                                }
                            }
                            if (inBlock) {
                                runLines.push({ "start": runStart, "end": runEnd});
                            }
                            if (r >= end2) {
                                yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["if"]) + " syntax [3].");
                                exitBlock = true;
                            }
                            else {
                                r++;
                                let runIf = false;
                                yrRun(tokens,chkStart,chkEnd);
                                if (yrenv.memory != null) {
                                    if (parseFloat(yrenv.memory.val) != 0)  runIf = true;
                                }
    
                                if (runIf) {
                                    for (let w = 0; w < runLines.length; w++) {
                                        yrRun(tokens,runLines[w].start,runLines[w].end);
                                    }
                                }
                                else
                                    yrcn.print("");
                            }
                        }
                    }
                }
                else if (yrKEnc(val) == yrenv.keywords["while"]) {
                    let validSyn = true;
                    r++;
                    let chkStart = r;
                    let chkEnd = r;
                    let runStart = r;
                    let runEnd = r;
                    while (r < end2 && !(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["do"])) {
                        chkEnd++;
                        r++;
                    }
                    if (r >= end2) {
                        yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["if"]) + " syntax [1].");
                        exitBlock = true;
                    }
                    else {
                        if (!(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["do"])) {
                            yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["while"]) + " syntax [2].");
                            exitBlock = true;
                        }
                        else {
                            r++;
                            runStart = r;
                            runEnd = r;
                            let inBlock = false;
                            let runLines = new Array();
                            while (r < end2 && !(tokens[r].type == "YRTOK_KEYWORD" && yrKEnc(tokens[r].val) == yrenv.keywords["end"])) {
                                if (tokens[r].type == "YRTOK_EOB") {
                                    runLines.push({ "start": runStart, "end": runEnd});
                                    r++;
                                    runStart = r;
                                    runEnd = r;
                                    inBlock = false;
                                }
                                else {
                                    inBlock = true;
                                    runEnd++;
                                    r++;
                                }
                            }
                            if (inBlock) {
                                runLines.push({ "start": runStart, "end": runEnd});
                            }
                            if (r >= end2) {
                                yrcn.printn("ERROR: bad " + yrKDec(yrenv.keywords["while"]) + " syntax [3].");
                                exitBlock = true;
                            }
                            else {
                                r++;
                                let exitWhile = false;
                                let loopCount = 0;
                                while (!exitWhile && loopCount < yrenv.settings.maxloop) {
                                    yrRun(tokens,chkStart,chkEnd);
                                    if (yrenv.memory == null) 
                                        exitWhile = true;
                                    else if (parseFloat(yrenv.memory.val) == 0)  
                                        exitWhile = true;
    
                                    if (!exitWhile) {
                                        for (let w = 0; w < runLines.length; w++) {
                                            yrRun(tokens,runLines[w].start,runLines[w].end);
                                        }
                                    }
    
                                    loopCount++;
                                }

                                if (loopCount >= yrenv.settings.maxloop) {
                                    yrcn.printn("WARNING: exited loop because max loop count (" + yrenv.settings.maxloop + ") was reached.");
                                }
                            }
                        }
                    }
                }
                else {
                    yrcn.printn("ERROR: unknown command.");
                    exitBlock = true;
                    r++;
                }
            }
            else if (type == "YRTOK_COMP") {
                r++;
                if (cursorStart>cursorEnd) {
                    yrcn.printn("ERROR: invalid compare statement [1].");
                    exitBlock = true;
                }
                else {
                    let cmpT = val;
                    yrRun(tokens,cursorStart,cursorEnd);
                    if (yrenv.memory == null || !(yrenv.memory.type == "YRTOK_INTEGER" || yrenv.memory.type == "YRTOK_DOUBLE" || yrenv.memory.type == "YRTOK_STRING")) {
                        yrcn.printn("ERROR: invalid compare statement [2].");
                        exitBlock = true;
                    }
                    else {
                        let lVal = yrenv.memory;
                        let rVal = null;
                        cursorStart = r;
                        cursorEnd = r;
                        while (r < end2 && tokens[r].type != "YRTOK_BREAK") {
                            cursorEnd++;
                            r++;
                        }
                        yrRun(tokens,cursorStart,cursorEnd);
                        if (yrenv.memory == null || !(yrenv.memory.type == "YRTOK_INTEGER" || yrenv.memory.type == "YRTOK_DOUBLE" || yrenv.memory.type == "YRTOK_STRING")) {
                            yrcn.printn("ERROR: invalid compare statement [3].");
                            exitBlock = true;
                        }
                        else {
                            rVal = yrenv.memory;
                            let lVal2 = 0;
                            let rVal2 = 0;
                            if (lVal.type == "YRTOK_INTEGER" || lVal.type == "YRTOK_DOUBLE") lVal2 = parseFloat(lVal.val);
                            else if (lVal.type == "YRTOK_STRING") lVal = lVal.val.length;
                            if (rVal.type == "YRTOK_INTEGER" || rVal.type == "YRTOK_DOUBLE") rVal2 = parseFloat(rVal.val);
                            else if (rVal.type == "YRTOK_STRING") rVal = rVal.val.length;
                            let cRes = 0;
                            if (yrKEnc(cmpT) == yrenv.keywords["eq"] || yrKEnc(cmpT) == yrenv.keywords["gteq"] || yrKEnc(cmpT) == yrenv.keywords["lteq"]) {
                                if (lVal2 == rVal2) cRes = 1;
                            }
                            if (yrKEnc(cmpT) == yrenv.keywords["lt"] || yrKEnc(cmpT) == yrenv.keywords["lteq"]) {
                                if (lVal2 < rVal2) cRes = 1;
                            }
                            if (yrKEnc(cmpT) == yrenv.keywords["gt"] || yrKEnc(cmpT) == yrenv.keywords["gteq"]) {
                                if (lVal2 > rVal2) cRes = 1;
                            }
                            if (yrKEnc(cmpT) == yrenv.keywords["neq"]) {
                                if (lVal2 != rVal2) cRes = 1;
                            }
                            yrenv.memory = { "type": "YRTOK_INTEGER", "val": cRes };
                        }
                    }
                }
                cursorStart = r;
                cursorEnd = r-1;
            }
            else if (type == "YRTOK_IDENT" && r + 1 < end2 && tokens[r+1].type == "YRTOK_ASSIGN") {
                let v2 = yrGetVariable(val);
                r++;
                if (v2 != null) {
    
                    if (r < end2 && tokens[r].type == "YRTOK_ASSIGN") {
                        r++;
        
                        let setStart = r;
                        let setEnd = r;
    
                        while (r < end2 && tokens[r].type != "YRTOK_EOB") {
                            r++;
                            setEnd++;
                        }
                            
                        yrRun(tokens,setStart, setEnd);
                        yrenv.contexts[yrenv.currentContext].heap[val] = yrenv.memory;
                    }
                    else {
                        yrenv.memory = v2;
                        yrcn.print("");
                        cursorStart = r;
                        cursorEnd = r;   
                    }
                }
                else {
                    exitBlock = true;
                }
            }
            else if (type2 == "YRTOK_STRING") {
                yrenv.memory = { "type": type, "val": val };
                yrcn.print("");
                cursorStart = r;
                cursorEnd = r;
                r++;
            }
            else if (type2 == "YRTOK_DOUBLE" || type2 == "YRTOK_INTEGER") {
                let mEval = val2;
                cursorStart = r;
                cursorEnd = r;
                let r2 = r+1;
                if (r2<end2 && (tokens[r2].type == "YRTOK_PLUS" || tokens[r2].type == "YRTOK_MINUS" || tokens[r2].type == "YRTOK_STAR" || tokens[r2].type == "YRTOK_SLASH")) {
                    r++;
                    while(r<end2 && (tokens[r].type == "YRTOK_PLUS" || tokens[r].type == "YRTOK_MINUS" || tokens[r].type == "YRTOK_STAR" || tokens[r].type == "YRTOK_SLASH")) {
                        mEval += tokens[r].val;
                        r++;
                        let type3 = "";
                        let val3 = "";
                        if (r < end2) {
                            type3 = tokens[r].type;
                            val3 = tokens[r].val;
                            if (type3 == "YRTOK_IDENT") {
                                let v3 = yrGetVariable(val3);
                                if (v3 == null) {
                                    exitBlock = true;
                                }
                                else {
                                    type3 = v3.type;
                                    val3 = v3.val;
                                }
                            }
                        }
                        if (type3 == "YRTOK_INTEGER" || type3 == "YRTOK_DOUBLE") {
                            mEval+=val3;
                            r++;
                        }
                    }
                }
                else {
                    r++;
                }
                if ((mEval + "").length > 0) {
                    yrenv.memory = { "type": "YRTOK_DOUBLE", "val": eval(mEval)};
                }
                yrcn.print("");
                cursorEnd = r;
            }
            else {
                yrcn.printn("ERROR: '" + tokens[r].val + "' not valid.");
                exitBlock = true;
            }
        }

        if (runEnd) {
            yrRun(tokens,runEndStart,end);
        }
    }
    
}

function yrEditor(edID) {
    this.ed = document.getElementById(edID);
    this.runCmd = "editor";
    this.header = "# Editor\n# Enter code directly here and type '" + this.runCmd + "' in the console to run it.\n# The hash symbol (#) denotes a comment\n\n";
    this.process = function() {
        let codePre = this.ed.value;
        codePre = codePre.replace(/\r\n/gi, "\n");
        let lines = codePre.split(/\n/gi);
        let code = "";
        for (let l = 0; l < lines.length; l++) {
            if (lines[l].length > 0 && lines[l][0] != '#') {
                let codePre2 = lines[l].split(/#/gi);
                code += codePre2[0];
                if (codePre2[0][codePre2.length - 1] != ';')
                    code += ";";
            }
        }

        let tok = yrLex(code);
        yrRun(tok,0,-1);
    };
    this.export = function() {
        let setKeysCode = "";
        for (key in yrenv.keywords) {
            if (key != "eob")
                if (yrKeywordPreset["DEFAULT"].settings[key] != yrenv.keywords[key])
                    setKeysCode += yrKeywordPreset["DEFAULT"].settings["skey"]+ " " + yrKDec(yrKeywordPreset["DEFAULT"].settings[key]) + " " + yrKDec(yrenv.keywords[key]) + ";\n";
        }
        if (setKeysCode.length > 0) {
            setKeysCode = "# Code to set keywords to current values\n# that should only be run from default settings\n" + setKeysCode + "\n";
        }

        let codeOut = setKeysCode + this.ed.value.replace("# Enter code directly here and type 'editor' in the console to run it.\n","");
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(codeOut));
        element.setAttribute('download', "code.yrs");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
    this.fileSelect = function() {
        let element = document.createElement('input');
        element.setAttribute("type", "file");
        element.setAttribute("id","upload");
        element.setAttribute("accept", ".txt,.yrs,text/text");
        element.setAttribute("name","codeImport");
        element.style.display = 'none';
        document.body.appendChild(element);

        document.getElementById( 'upload' ).addEventListener( 'change', yred.import, false );

        element.click();

        //document.body.removeChild(element);
    };
    this.import = function(evt) {
        let fl_files = evt.target.files; // JS FileList object

        // use the 1st file from the list
        let fl_file = fl_files[0];

        let reader = new FileReader(); // built in API

        let display_file = ( e ) => { // set the contents of the <textarea>
            yred.ed.innerHTML = e.target.result;
        };

        let on_reader_load = ( fl ) => {
            console.info( '. file reader load', fl );
            return display_file; // a function
        };

        // Closure to capture the file information.
        reader.onload = on_reader_load(fl_file);

        // Read the file as text.
        reader.readAsText(fl_file);
        
        document.body.removeChild(document.getElementById("upload"));
    };
    this.init = function() {
        this.ed.innerHTML = this.header;
    };
    this.keyCap = function(event) {
        let val = this.ed.value;

        return true;
    };
}

function yrConsole(cnID) {
    this.cn = document.getElementById(cnID);
    this.prompt = "yr > ";
    this.atLine = 0;
    this.lines = new Array();
    this.init = function() {
        this.cn.value = "Enter 'help' to get started.\n";
        this.ready();
    };
    this.printwln = function(msg, nL) {
        this.cn.value += msg;
        if (nL) this.cn.value += "\n";
        this.cn.scrollTop = this.cn.scrollHeight;
    };
    this.printn = function(msg) {
        this.printwln(msg,true);
    };
    this.print = function(msg) {
        this.printwln(msg,false);
    };
    this.ready = function() {
        this.cn.value += "yr > ";
    };
    this.process = function() {
        let cVal = this.cn.value;
        let cValLn = cVal.split("\n");
        let activeLine = cValLn[cValLn.length - 1];
        activeLine = activeLine.substring(this.prompt.length);
        activeLine = activeLine.replace(/(^\s*(?!.+)\r+\n+)|(\s+\r+\n+(?!.+)$)/g, "");
        this.lines.push(activeLine);

        let tok = yrLex(activeLine);
        this.atLine = this.lines[this.lines.length - 1];
        yrcn.printn("");
        yrRun(tok,0,-1);

        this.ready();
    };
    this.keyCap = function(key) {
        let cVal = this.cn.value;
        let cValLn = cVal.split("\n");
        switch (key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'Backspace':
                if (cValLn[cValLn.length - 1].length == this.prompt.length) return false;
                break;
            case 'Enter':
                this.process();
                return false;
                break;
        }
        return true;
    };
}

var yrenv;
var yrcn ;
var yred;

document.addEventListener("DOMContentLoaded", function() {
    yrenv = new yrEnvironment({});
    yrcn = new yrConsole("console");
    yred = new yrEditor("editor");

    yrcn.cn.addEventListener("keydown", function(e) {
        this.setSelectionRange(this.value.length,this.value.length);
        if (!yrcn.keyCap(e.key)) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    yrcn.init();
    yred.init();
});

let genHelp = ['\n---------------------------------\n\nyrScript lets you rename keywords however you like!\n \
\nHere are your current commands and how to use them:\n',
'You can enter normal math syntax, i.e. 1 + 2 * 3 - 4 / 5\n\
You can also combine values with a comma, i.e. \"Ham\",\" and \",\"cheese.\"\n\n---------------------------------\n'];