let yrKeywordPreset = {
    "DEFAULT": {
        "description": "Default",
        "settings": {
            "help": "help",
            "print": "print",
            "echo": "echo",
            "skey": "setkey",
            "pnkeys": "printkeys",
            "var": "set",
            "assign": "to",
            "if": "if",
            "while": "while",
            "do": "do",
            "end": "end",
            "eq": "eq",
            "neq": "neq",
            "lt": "lt",
            "gt": "gt",
            "lteq": "lteq",
            "gteq": "gteq",
            "eob": "\;"
        }
    },
    "CJS": {
        "description": "C/JS-like",
        "settings": {
            "help": "help",
            "print": "print",
            "echo": "echo",
            "skey": "setkey",
            "pnkeys": "printky",
            "var": "var",
            "if": "if",
            "while": "while",
            "do": "{",
            "end": "}",
            "eq": "{{eq}}{{eq}}",
            "neq": "{{bang}}{{eq}}",
            "lt": "{{lt}}",
            "gt": "{{gt}}",
            "lteq": "{{lt}}{{eq}}",
            "gteq": "{{gt}}{{eq}}",
            "assign": "{{eq}}",
            "eob": "\;"
        }
    },
    "BASIC": {
        "description": "BASIC-like",
        "settings": {
            "help": "HELP",
            "print": "ECHO",
            "echo": "",
            "skey": "SETKEY",
            "pnkeys": "SHOWKEYS",
            "var": "SET",
            "if": "IF",
            "while": "WHILE",
            "do": "DO",
            "end": "END",
            "eq": "{{eq}}",
            "neq": "NOT{{eq}}",
            "lt": "{{lt}}",
            "gt": "{{gt}}",
            "lteq": "{{lt}}{{eq}}",
            "gteq": "{{gt}}{{eq}}",
            "assign": "GETS",
            "eob": "\;"
        }
    },
};

