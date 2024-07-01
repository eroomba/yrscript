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

    for (key in yrenv.keywords) {
        sHTML += "<tr>";
        sHTML += "<td>" + yrKeywordsDetail[key].label  + "</td>";
        sHTML += "<td><input type=\"text\" class=\"settings-val\" data-id=\"" + key + "\" style=\"width: 10em;\" value=\"" + yrKDec(yrenv.keywords[key]) + "\" /></td>";
        sHTML += "</tr>";
    }

    sHTML += "<tr><td colspan=\"2\" class=\"buttons\"><a href=\"javascript: yrCloseSettings();\">cancel</a></td></tr>";
    sHTML += "</table>";

    document.getElementById("settings-body").innerHTML = sHTML;

    let sett = document.getElementById("settings");
    sett.style.display = "block";
}

function yrCloseSettings() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("settings-bg").style.display = "none";
}