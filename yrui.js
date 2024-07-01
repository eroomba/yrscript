function yrHTMLEnc(value) {
    return value.replace("{{","----").replace("}}","-__-");
}

function yrHTMLDec(value) {
    return value.replace("----","{{").replace("-__-","}}");
}

function yrOpenSettings() {
    
    if (document.getElementById("settings-bg") == undefined) {
        var div = document.createElement('div');
        div.innerHTML = "";
        div.id = "settings-bg";
        document.body.appendChild(div);
    }
    document.getElementById("settings-bg").style.display = "block";

    var sHTML = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">";

    let kyFlip = yrFlipDict(yrenv.keywords);

    sHTML += "<tr><td colspan=\"2\" class=\"preset-select\">";
    sHTML += "Load&nbsp;Preset:&nbsp;<select id=\"yrPresetSelect\" onchange=\"yrLoadPreset()\">";
    sHTML += "<option value=\"\" selected>Select a preset</option>";
    for (key in yrKeywordPreset) {
        sHTML += "<option value=\"" + key + "\">" + yrKeywordPreset[key].description + "</option>";
    }
    sHTML += "</select>"
    sHTML += "</td></tr>";
    sHTML += "</td></tr>";

    for (key in yrenv.keywords) {
        sHTML += "<tr>";
        sHTML += "<td>" + yrKeywordsDetail[key].label  + "</td>";
        sHTML += "<td><input type=\"text\" class=\"settings-val\" id=\"set-val-" + key + "\" style=\"width: 10em;\" value=\"" + yrKDec(yrenv.keywords[key]) + "\" onkeydown=\"yrCheckKeywordInput(event,this);\" /></td>";
        sHTML += "</tr>";
    }

    sHTML += "<tr><td colspan=\"2\" class=\"buttons\">";
    sHTML += "<div id=\"save-error\" style=\"display: none;\"></div>";
    sHTML += "<a class=\"button\" href=\"javascript: yrSaveSettings();\">save</a>";
    sHTML += "<a class=\"button\" href=\"javascript: yrCloseSettings();\">cancel</a>";
    sHTML += "</td></tr>";
    sHTML += "</table>";

    document.getElementById("settings-body").innerHTML = sHTML;

    let sett = document.getElementById("settings");
    sett.style.display = "block";
}

function yrCheckKeywordInput(event, elem) {
    document.getElementById("yrPresetSelect").selectedIndex = 0;
    let tVal = elem.value;
    if (tVal.length == 1 && "(){}[]".indexOf(tVal) >= 0 && event.key != 'Backspace') {
        event.preventDefault();
        event.stopPropagation();
        this.value = tVal[0];
    }
}

function yrCloseSettings() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("settings-bg").style.display = "none";
}

function yrSaveSettings() {
    document.getElementById("save-error").style.display = "none";
    document.getElementById("save-error").innerHTML = "";
    let validChange = true;
    let update = document.querySelectorAll(".settings-val");
    let newVals = {};
    let newValsChk = "";
    for (keyC in yrenv.keywords) {
        newVals[keyC] = yrenv.keywords[keyC];
    }
    update.forEach(function(item) {
        item.classList.remove("err");
        let tID = item.id;
        let tKey = tID.replace("set-val-","");
        let tVal = yrKEnc(item.value);
        if (newValsChk.indexOf("{{" + tVal + "}}")>=0) {
            validChange = false;
            item.classList.add("err");
        }
        else {
            newVals[tKey] = tVal;
            newValsChk += "{{" + tVal + "}}";
        }
    });

    if (!validChange) {
        document.getElementById("save-error").innerHTML = "Cannot repeat values.";
        document.getElementById("save-error").style.display = "block";
    }
    else {
        yrenv.keywords = newVals;
        yrCloseSettings();
    }
}

function yrLoadPreset() {
    let preset = document.getElementById("yrPresetSelect").options[document.getElementById("yrPresetSelect").selectedIndex].value;
    if (yrKeywordPreset[preset] != undefined && yrKeywordPreset[preset] != null && yrKeywordPreset[preset].settings != undefined && yrKeywordPreset[preset].settings != null) {
        for (key in yrKeywordPreset[preset].settings) {
            document.getElementById("set-val-" + key).value = yrKDec(yrKeywordPreset[preset].settings[key]);
        }
    }
}
