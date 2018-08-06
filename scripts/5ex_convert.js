var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
            blob = new Blob([data], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
var itemToIcon = {
    "sword of":"piercing-sword",
    "armor":"armor-vest",
    "crossbow":"crossbow",
    "bow":"high-shot",
    "warhammer":"thor-hammer",
    "necklace":"pearl-necklace",
    "greatsword":"croc-sword",
    "dagger":"plain-dagger",
    "shortsword":"stiletto",
    "sling bullets":"stone-stack",
    "sling":"slingshot",
    "backpack":"backpack",
    "alchemy":"bubbling-flask",
    "flask":"fizzing-flask",
    "cannon":"cannon-shot",
    "wand":"crystal-wand",
    "hat":"pointy-hat",
    "gauntlet":"gauntlet",
    "glove":"gloves",
    "gem":"gems",
    "eye":"eyeball",
    "bottle":"square-bottle",
    "potion":"drink-me",
    "cloak":"cloak",
    "cape":"cape",
    "robe":"robe",
    "pouch":"swap-bag",
    "horn":"hunting-horn",
    "quiver":"quiver",
    "arrow":"quiver",
    "amulet":"necklace",
    "needle":"needle-drill",
    "blowgun":"lead-pipe",
    "flute":"flute",
    "bucket":"empty-wood-bucket",
    "book":"book",
    "spellbook":"spell-book",
    "tome of":"book-cover",
    "clothes":"t-shirt",
    "crystal ball":"crystal-ball",
    "orb":"crystal-ball",
    "crown":"crown",
    "manual":"bookmarklet",
    "cube":"cube",
    "stone":"rune-stone",
    "ointment":"covered-jar",
    "mask":"architect-mask",
    "key":"key",
    "mirror":"mirror-mirror",
    "perfume":"perfume-bottle",
    "periapt":"prayer-beads",
    "piwafwi":"cloak-dagger",
    "ring":"ring",
    "rod":"lunar-wand",
    "scroll":"scroll-unfurled",
    "staff":"wizard-staff",
    "bag":"bindle",
    "brace":"bracers",
    "broom":"broom",
    "candle":"candle-light",
    "carpet":"rolled-cloth",
    "die":"dice-twenty-faces-twenty",
    "dice":"dice-twenty-faces-twenty",
    "claw":"claw-string",
    "deck":"card-burn",
    'whistle':"whistle",
    'helm':"visored-helm",
    "hand":"hand",
    "horseshoe":"horseshoe",
    "pigments":"palette",
    "stone":"stone-tablet",
    "boots":"boots",
    "wing":"curly-wing",
    'rune':"rune-stone",
    "throne":"stone-throne",
    "snatchel":"knapsack",
    "poison":"poison-bottle",
    "nail":"nails",
    "piton":"nails",
    "club":"wood-club",
    "shovel":"spade",
    "spyglass":"spyglass",
    "flail":"flail",
    "spear":"stone-spear",
    "greataxe":"battle-axe",
    "halberd":"halberd",
    "pipes of the sewers":"flute",
    "pole of angling":"fishing-pole",
    "pole of collapsing":"bo",
    "portable hole":"folded-paper",
    "pot of awakening":"amphora",
    "feather token":"feather",
    "rope of climbing":"rope-coil",
    "rope of entanglement":"lasso",
    "rope of mending":"knot",
    "ruby of":"rupee",
    "saddle of the cavalier":"saddle",
    "scarab of protection":"scarab-beetle",
    "slippers of spider climbing":"sticky-boot",
    "sovereign glue":"spill",
    "sphere of annihilation":"extraction-orb",
    "talisman of pure good":"necklace",
    "talisman of the sphere":"pearl-necklace",
    "talisman of ultimate evil":"tribal-pendant",
    "talking doll":"sensuousness",
    "tankard of sobriety":"beer-stein",
    "universal solvent":"square-bottle",
    "weird tank":"oil-drum",
    "well of":"well",
    "wind fan":"paper-windmill",
    "alchemist's ":"hand-bag",
    "arcane ":"newspaper",

//    "copper":"two-coins",
}

function findIcon(name)
{
    name = name.toLowerCase();
    for(var k in itemToIcon)
    {
        if(name.indexOf(k)>-1)
        {
            return itemToIcon[k];
        }
    }
}
function decodeHTMLEnts(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}

function nowildWestOnLinebreaks(text)
{
    text = decodeHTMLEnts(text)
    text = text.replace(/\-/g,'\u2212'); // Replace - with proper minus
    return text.replace(/([^),.]) ([^(])/g,"$1"+'\u00A0'+"$2");//swap spaces to nbsp if they arent after ) or . or , or before (
}

function parseNotesText(text) {
    text = decodeHTMLEnts(text)
    var out = text.replace(/^(.*:)/g, "<b>$1</b>");
    //  console.log(text,"=>",out);
    return out
}

function xmlToJson(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (!Array.isArray(obj[nodeName])) {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}
$.fn.extend({
    filedrop: function(options) {
        var defaults = {
            callback: null
        }
        options = $.extend(defaults, options)
        return this.each(function() {
            var files = []
            var $this = $(this)

            // Stop default browser actions
            $this.bind('dragover dragleave', function(event) {
                event.stopPropagation()
                event.preventDefault()
            })

            // Catch drop event
            $this.bind('drop', function(event) {
                // Stop default browser actions
                event.stopPropagation()
                event.preventDefault()

                // Get all files that are dropped
                files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files

                // Convert uploaded file to data URL and pass trought callback
                if (options.callback) {
                    var reader = new FileReader()
                    reader.onload = function(event) {
                        options.callback(event.target.result)
                    }
                    reader.readAsText(files[0])
                }
                return false
            })
        })
    }
})

//TODO ADD REACTIONS FOR MONSTERS
_SPELL_LIST = {}
sync.render("xmlImport", function(obj, app, scope) {

    var window = $("<div>");
    window.addClass("flexcolumn flex middle")
    var dropZone = $("<div>").appendTo(window);
    dropZone.css("align-items", "center");
    dropZone.addClass("flexrow");
    dropZoneText = $("<p>").appendTo(dropZone)
    dropZoneText.addClass("flex");
    dropZoneText.append("Drop .xml file in there");

    dropZone.addClass("flex");
    var mapData;
    var wallsOut;
    dropZone.filedrop({
        callback: function(text) {
            try {
                scope.data = xmlToJson(jQuery.parseXML(text));
                dropZoneText.html("Loaded!");
            } catch (e) {
                console.error(e);
                dropZone.html("<b> Failed to import, make sure you are dropping correct .xml file!</b>");
            }
        }
    })
    var buttons = $("<div>").appendTo(window);
    buttons.addClass("flexrow");

    var importButton = $("<button>").appendTo(buttons)
    importButton.addClass("flex highlight")
    importButton.css("color", "white");
    importButton.append("Import");
    importButton.click(function() {
/*        console.log("Building spell list..");
//        var spls = game.locals["workshop"].data["5E Compendium.json"].data.content["Spells"].data
        var i = 0;
        for(var k in spls)
        {
            k = spls[k]
            _SPELL_LIST[k.info.name.current.toLowerCase()] = k;
            i++;
        }
        console.log("Done, "+i+" spells!")
*/
        var itemData = {};
        convert_I(game, scope.data, "items", itemData, scope)
//        convert_S(game, scope.data, "spells", content2, scope)
//        convert_C(game, scope.data, "Monsters", content, scope)
//        pack.data.content = content
        dropZoneText.html("Imported " + scope.actorCount + " actors, " + scope.itemCount + " items, " + scope.spellCount + " spells<br>Overriden " + scope.actorCountOV + " actors, " + scope.itemCountOV + " items, " + scope.spellCountOV + " spells");
        var txt = JSON.stringify(itemData);
        txt = "FiveForge.Compendium[`Item`] = "+txt;
        console.log(itemData);
        var items = saveData(txt,"5ex_items.js");
    });
    var importButton = $("<button>").appendTo(buttons)
    importButton.addClass("flex highlight")
    importButton.css("color", "white");
    importButton.append("Save");
    importButton.click(function() {
        var pack = game.locals["workshop"].data[select.val()]
        dropZoneText.html("Saved!");
        runCommand("updateTemplate", duplicate(game.templates));
        runCommand("savePack", {
            key: select.val(),
            data: JSON.stringify(pack.data, 2, 2)
        });
    });


    return window;
});
game.components.push({
    "name": "XML Importer2",
    ui: "xmlImport",
    w: 30,
    h: 20,
    basic: "Allows to import xml files into compendium. DNDApp format.",
    author: "D.ツ"
});;
function genProp(name, current)
{
    if(current == undefined)
    {
        return undefined;
    }
    return {name:name,current:current};
}
var DamageMap = {
    "P": "Piercing",
    "B": "Bludgeoning",
    "S": "Slashing",
}
/*
var TypeMap = {
    "$":"Valuable",
    "G":"General",
    "A":"Ammunition",
    "R":"Ranged",
    "M":"Melee",
    "S":"Shield",
    "HA":"Heavy Armor",
    "LA":"Light Armor",
    "MA":"Medium Armor",
    "P":"Potion",
    "WD":"Wand",
    "RD":"Rod",
    "ST":"Staff",
    "SC":"Scroll",
    "W":"Artifact",
    "RG":"Ring",
}*/

var TypeMap = {
    "$":"Generic",
    "G":"Generic",
    "A":"Generic",
    "R":"Weapon",
    "M":"Weapon",
    "S":"Shield",
    "HA":"Armor",
    "LA":"Armor",
    "MA":"Armor",
    "P":"Generic",
    "WD":"Spellcasting",
    "RD":"Spellcasting",
    "ST":"Spellcasting",
    "SC":"Spellcasting",
    "W":"Generic",
    "RG":"Generic",
}
var PropertyMap = {
    "2H": "twohanded",
    "LD": "loading",
    "H": "heavy",
    "R": "range",
    "L": "light",
    "T": "thrown",
    "F": "finesse",
    "V": "versatile",
    "A": "ammunition",
}

function convert_I(game, DATA, name, content, scope) {
    scope.itemCount = 0;
    scope.itemCountOV = 0;
    scope.proficiencies = {};
    var DataList = content
    for (var i in DATA.compendium.item) {
        i = DATA.compendium.item[i];
        var item = duplicate(FiveForge.ElementTemplates["Item"]);

        DataList[i.name] = item;
        if (Array.isArray(i.text)) {
            for (var k in i.text) {
                var t = i.text[k];
                i.text[k] = parseNotesText(t);
            }
            i.text = i.text.join('<br>');
        }
        item.info.name.current = i.name;
        item.attributes.price.current = i.value;
        item.attributes.quantity.current = 1;
        item.attributes.weight.current = i.weight;
        item.attributes.itemType.current = TypeMap[i.type];
        item.attributes.rarity.current = i.rarity;


        i.text = /^(?:<br>)*(.+)/g.exec(i.text)[1];
        item.info.notes.current =  i.text

        if(TypeMap[i.type]==undefined)
        {
            console.log("Unknown type '"+i.type+"' on "+i.name);
            console.log(TypeMap);
        }

        var ico = findIcon(i.name);
        if(ico)
        {
            item.info.img = genProp("Image","content/5Extended/icons/"+ico+".svg");
        }
        else
        {
            console.log("Icon not found:"+i.name);
            item.info.img = genProp("Image","content/5Extended/icons/swap-bag.svg");
        }



        if (i.property) {
            var tags = i.property.split(",");
            for (var tag in tags) {
                tag = tags[tag].trim();
                itemtag = PropertyMap[tag]
                if (itemtag) {
                    console.log(itemtag);
                    item.attributes[itemtag].current = 1;
                } else {
                    console.log("Unknown property '" + tag + "' on item" + i.name);
                }
            }
        }

        if(i.dmg1!=undefined)
        {
            item.attributes.range.current = i.range;
            item.attributes.damage.current = i.dmg1;
            item.attributes.damage2.current = i.dmg2;

            if (i.dmgType) {
                var dmgs = i.dmgType.split(",");
                item.attributes.damageType.current = DamageMap[dmgs[0]];
                if(dmgs.length > 1)
                {
                    item.attributes.damageType2.current = DamageMap[dmgs[2]];
                }

            }
        }

        i.modifier = i.modifier||"";
        if(!Array.isArray(i.modifier))
        {
            i.modifier = [i.modifier]
        }
        for(var k=0;k<i.modifier.length;k++)
        {
            var mod = i.modifier[k].toLowerCase();
            if(mod.indexOf("melee attacks") >=0)
            {
                item.attributes.hitBonus.current = mod.replace("melee attacks","");
            }
            if(mod.indexOf("ranged attacks") >=0)
            {
                item.attributes.hitBonus.current = mod.replace("ranged attacks","");
            }


            if(mod.indexOf("melee damage") >=0)
            {
                item.attributes.damage.current += mod.replace("melee damage","");
                if(item.attributes.damage2.current)
                {
                    item.attributes.damage2.current += mod.replace("melee damage","");
                }
            }
            if(mod.indexOf("ranged damage") >=0)
            {
                item.attributes.damage.current += mod.replace("ranged damage","");
                if(item.attributes.damage2.current)
                {
                    item.attributes.damage2.current += mod.replace("ranged damage","");
                }            }
        }


        /*
        if (i.type == "HA") {
            item.tags.armor = true
            item.tags["Heavy Armor"] = true
            item._calc = [{
                cond: "@i.tags.equipped",
                eq: i.ac,
                target: "counters.ac"
            }]
        } else if (i.type == "LA") {
            item.tags.armor = true
            item.tags["Light Armor"] = true
            item._calc = [{
                cond: "@i.tags.equipped",
                eq: "#:Dex+" + i.ac,
                target: "counters.ac"
            }]
        } else if (i.type == "MA") {
            item.tags.armor = true
            item.tags["Medium Armor"] = true
            item._calc = [{
                cond: "@i.tags.equipped",
                eq: "#:Dex+(" + i.ac + ")|2",
                target: "counters.ac"
            }]
        } else if (i.type == "R") {
            item.tags["ranged"] = true
        } else if (i.type == "M") {
            item.tags["melee"] = true
        } else if (i.type == "S") {
            item.equip = {}
            item.tags["shield"] = true
            item.equip.armor = genProp("Shield Bonus", i.ac);
        }


*/
    }
}

function convert_S(game, DATA, name, content, scope) {
    scope.spellCount = 0;
    scope.spellCountOV = 0;

    var DataList = game.templates["5Extended"].spells
    var schoolMap = {
        "A": "Abjuration",
        "C": "Conjuration",
        "D": "Divination",
        "EN": "Enchantment",
        "EV": "Evocation",
        "I": "Illusion",
        "N": "Necromancy",
        "T": "Transmutation",
    }
    for (var i in DATA.compendium.spell) {
        i = DATA.compendium.spell[i];
        var item = duplicate(game.templates.item)

        if (Array.isArray(i.text)) {
            for (var k in i.text) {
                var source = /^Source:(.+)/.exec(i.text[k]);
                if (source) {
                    item.info.source.current = source[1]
                    i.text.splice(k, 1);
                } else {
                    i.text[k] = parseNotesText(i.text[k]);
                }
            }
            i.text = i.text.join('<br>');
        }
        i.school = schoolMap[i.school];

        item.info.name.current = i.name;
        item.info.quantity.current = 1;
        item.info.notes.current = "<div>" + i.text.replace(/D/g, "<b></b>D<b></b>").replace(/d/g, "<b></b>d<b></b>") + "</div>";
        item.spell.range.current = i.range
        item.spell.time.current = i.time;
        item.spell.level.current = i.level;
        item.spell.duration.current = i.duration;
        item.spell.classes.current = i.classes
        item.spell.school.current = i.school
        if (i.components) {
            var comps = /([^\(]+)(?:\((.+)\))?/g.exec(i.components)
            if (!comps) {
                console.log(i.components);
            }
            item.spell.comps.current = comps[1].trim();
            item.spell.required.current = comps[2];

        }


        item.tags.spell = true;
        if (i.ritual) {
            item.tags.ritual = true
        }
        if (i.school) {
            item.tags[i.school] = true
        }
        item._a = {
            "Cast": {
                hot: false,
                choices: {},
                eventData: {
                    data: "0",
                    msg: "Casts @i.info.name",
                }
            }
        }
        var castFound = "Cast";
        if (!i.roll) {
            i.roll = "Cast"
        }
        if(i.text.indexOf("spell attack")>0)
        {
            if(!i.roll)
            {
                i.roll = [];
            }
            else if (!Array.isArray(i.roll)) {
                i.roll = [i.roll];
            }
            i.roll.unshift("D20 + SPELL + PROF")
        }
        if (i.roll) {
            if (!Array.isArray(i.roll)) {
                i.roll = [i.roll];
            }
            var statMap = {
                "SPELL": "@c.counters.spellAbility",
                "PROF": "@c.stats.proficiency",
                "STR": "@c.stats.Str",
                "DEX": "@c.stats.Dex",
                "CON": "@c.stats.Con",
                "INT": "@c.stats.Int",
                "WIS": "@c.stats.Wis",
                "CHA": "@c.stats.Cha",
                "Cast": "0",
            }
            for (var r in i.roll) {
                var r = i.roll[r];
                var name = r;
                if (name.indexOf("Cast") >= 0 || name.indexOf("SPELL") >= 0) {
                    item._a["Cast"] = undefined;
                    castFound = name;
                }
                for (var s in statMap) {
                    r = r.replace(s, statMap[s]);
                }
                console.log("Adding "+name+" for "+i.name+" - "+r);
                var act = {
                    hot: false,
                    choices: {},
                    eventData: {
                        data: r,
                        msg: "Casts @i.info.name",
                    }
                }
                item._a[name] = act;
            }
            if (castFound) {
                item._a[castFound].eventData.ui = "spell_action"
                item._a[castFound].eventData.var = {
                    name: "@i.info.name",
                    notes: "@i.info.notes",
                    school: "@i.spell.school",
                    level: "@i.spell.level",
                    classes: "@i.spell.classes",
                    required: "@i.spell.required",
                    comps: "@i.spell.comps",
                    ritual: "@i.tags.ritual",
                    saveDC: "@c.counters.proficiency+8+@c.counters.spellAbility",
                    duration: "@i.spell.duration",
                    source: "@i.info.source",
                }
            }
        }
        var found = 0;
        for (var i in DataList) {
            var item2 = DataList[i];
            if (item2.info.name.current == item.info.name.current) {
                DataList[i] = item;
                found = true;
                scope.spellCountOV++;
            }
        }
        if (!found) {
            scope.spellCount++;
            DataList.push(item);
        }
    }
}

function convert_C(game, DATA, name, content, scope) {
    scope.actorCount = 0;
    scope.actorCountOV = 0;
    if (!content[name]) {
        return;
    }
    var DataList = content[name]
    DataList._t = "c"
    DataList = DataList.data
    for (var m in DATA.compendium.monster) {
        m = DATA.compendium.monster[m];

        var item = duplicate(game.templates.character)
        item.info.name.current = m.name
        item.info.size.current = m.size
        item.info.race.current = m.type
        item.info.source.current = "";
        item.info.alignment.current = m.alignment
        var pxSize = {
            "t": 1 / 2,
            "s": 1,
            "m": 1,
            "l": 2,
            "h": 3,
            "g": 4
        }
        item.info.img.modifiers = {
            w: pxSize[m.size.toLowerCase()] * 64,
            h: pxSize[m.size.toLowerCase()] * 64,
        }
        var token_name = m.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")
        if (TOKEN_MAP[token_name]) {
            item.info.img.current = "/content/5Extended/monster_tokens/" + TOKEN_MAP[token_name]
        } else {
            //console.log("Token missing for " + m.name, " - ", token_name);
        }
        item.info.notes.current = ""
        if (m.languages) {
            item.info.notes.current += "<b>Languages:</b> " + m.languages + "<br>"
        }
        if (m.senses) {
            item.info.notes.current += "<b>Senses:</b> " + m.senses + "<br>"
        }
        if (m.immune) {
            item.info.notes.current += "<b>Damage immunities:</b> " + m.immune + "<br>"
        }
        if (m.conditionImmune) {
            item.info.notes.current += "<b>Condition immunities:</b> " + m.conditionImmune + "<br>"
        }
        if (m.resist) {
            item.info.notes.current += "<b>Damage resistance:</b> " + m.resist + "<br>"
        }
        if (m.vulnerable) {
            item.info.notes.current += "<b>Vulnerabilities:</b> " + m.vulnerable + "<br>"
        }

        item.stats.Str.current = m.str
        item.stats.Dex.current = m.dex
        item.stats.Con.current = m.con
        item.stats.Int.current = m.int
        item.stats.Wis.current = m.wis
        item.stats.Cha.current = m.cha
        item.counters.ac.current = /^([0-9]+)/.exec(m.ac)[1]

        var hp = /^([0-9]+)(?: \((.+)\))?/.exec(m.hp)
        //console.log(m.hp,hp,hp[1])
        item.counters.hp.current = hp[1]
        item.counters.hp.max = hp[1]
        item.counters.hit.current = hp[2]
        m.speed = m.speed.replace(/([^,]) /g, "$1&nbsp;")
        item.counters.speed.current = m.speed
        item.info.cr.current = m.cr
        if (m.skill) {
            item.skills.acr.current = m.skill.indexOf("Acrobatics") > -1 ? 1 : 0
            item.skills.ani.current = m.skill.indexOf("Animal") > -1 ? 1 : 0
            item.skills.arc.current = m.skill.indexOf("Arcana") > -1 ? 1 : 0
            item.skills.ath.current = m.skill.indexOf("Athletics") > -1 ? 1 : 0
            item.skills.his.current = m.skill.indexOf("History") > -1 ? 1 : 0
            item.skills.ins.current = m.skill.indexOf("Insight") > -1 ? 1 : 0
            item.skills.int.current = m.skill.indexOf("Intimidation") > -1 ? 1 : 0
            item.skills.inv.current = m.skill.indexOf("Investigation") > -1 ? 1 : 0
            item.skills.nat.current = m.skill.indexOf("Nature") > -1 ? 1 : 0
            item.skills.per.current = m.skill.indexOf("Perception") > -1 ? 1 : 0
            item.skills.pfm.current = m.skill.indexOf("Performance") > -1 ? 1 : 0
            item.skills.prs.current = m.skill.indexOf("Persuasion") > -1 ? 1 : 0
            item.skills.rel.current = m.skill.indexOf("Religion") > -1 ? 1 : 0
            item.skills.sle.current = m.skill.indexOf("Sleight") > -1 ? 1 : 0
            item.skills.ste.current = m.skill.indexOf("Stealth") > -1 ? 1 : 0
            item.skills.sur.current = m.skill.indexOf("Survival") > -1 ? 1 : 0
        }


        if (m.save) {
            item.counters.svStr.current = m.save.indexOf("Str") > -1 ? 1 : 0
            item.counters.svDex.current = m.save.indexOf("Dex") > -1 ? 1 : 0
            item.counters.svCon.current = m.save.indexOf("Con") > -1 ? 1 : 0
            item.counters.svInt.current = m.save.indexOf("Int") > -1 ? 1 : 0
            item.counters.svWis.current = m.save.indexOf("Wis") > -1 ? 1 : 0
            item.counters.svCha.current = m.save.indexOf("Cha") > -1 ? 1 : 0
        }
        if (!Array.isArray(m.action)) {
            m.action = m.action ? [m.action] : []
        }
        var talents = [];

        if (m.trait) {
            if (!Array.isArray(m.trait)) {
                m.trait = [m.trait]
            }
            for (var k in m.trait) {
                i = m.trait[k];
                if (i.name == "Spellcasting") {
                    i.text = i.text[0];

                    var nameToVal = {
                        "strength":"#:Str",
                        "dexterity":"#:Dex",
                        "constitution":"#:Con",
                        "intelligence":"#:Int",
                        "wisdom":"#:Wis",
                        "charisma":"#:Cha",
                        "0":"None",
                    }
                    var spellab = /ability is ([a-zA-Z]+)/.exec(i.text);
                    if(!spellab)
                    {
                        spellab = /uses ([a-zA-Z]+)/.exec(i.text);
                    }
                    if(!spellab)
                    {
                        console.log(i.text);
                    }
                    spellab = spellab[1].toLowerCase();
                    item.counters.spellAbility.current = nameToVal[spellab]
                    if(!nameToVal[spellab])
                    {
                        console.log(i.text,spellab);
                    }
                    i.text = i.text.replace(/[^.]+ has .+ spells .+:/,"");
                }
                if (i.name == "Source") {
                    item.info.source.current = Array.isArray(i.text) ? i.text.join(',') : i.text;
                    i.type="skip";
                    continue;
                }
                i.type = "npc_trait"
            }
            talents = talents.concat(m.trait)
        }
        if (m.legendary) {
            if (!Array.isArray(m.legendary)) {
                m.legendary = [m.legendary]
            }
            for (var i in m.legendary) {
                i = m.legendary[i];
                i.type= "npc_legendary"
            }
            talents = talents.concat(m.legendary)
        }
        if (m.reaction) {
            if (!Array.isArray(m.reaction)) {
                m.reaction = [m.reaction]
            }
            for (var i in m.reaction) {
                i = m.reaction[i];
                i.type="npc_reaction"
                i.name = "Reaction: " + i.name
            }
            talents = talents.concat(m.reaction)
        }
        if (m.action) {
            if (!Array.isArray(m.action)) {
                m.action = [m.action]
            }
            for (var i in m.action) {
                i = m.action[i];
                i.type="npc_action"
            }
            talents = talents.concat(m.action)
        }

        item.talents = [];
        item._a = {};
        for(var k in talents)
        {
            var t = talents[k];
            if(t.type=="skip")
            {
                continue;
            }
            if(!Array.isArray(t.text))
            {
                t.text = [t.text];
            }
            for(var i =0;i<t.text.length;i++)
            {
                t.text[i] = parseNotesText(t.text[i]);
            }
            t.text = t.text.join('<br>');
            var talent = {
                name:t.name,
                current:t.text,
                type:t.type,
                expanded:true,
            }

            if (t.attack) {
                if (!Array.isArray(t.attack)) {
                    t.attack = [t.attack];
                }
                for (var a in t.attack) {
                    var action = {
                        hot: 1,
                        _npc_action: true,
                        description: t.text,
                        choices: {},
                        eventData: {
                            data: "@_action_data",
                            msg: "@_action_msg",
                        }
                    }

                    a = t.attack[a];
                    var attack = /^(.*)\|(.*)\|(.*)$/.exec(a)
                    if (!attack) {
                        attack = a.split("|");
                    }
                    var name = attack[1];
                    if(name)
                    {
                        name = name.replace(t.name.replace(/\(.+\)/g,"").trim(),"");
                    }
                    if (!name) {
                        name = t.name;
                    } else if (name != "" && name != t.name) {
                        name = t.name + " (" + name + ")";
                    }
                    name = nowildWestOnLinebreaks(name);
                    var hit = "d20 + " + attack[2]
                    var dmg = attack[3]
                    if (attack[2]) {
                        action.choices["ATK"] = {
                            "_action_msg": "Rolled attack for " + name,
                            "_action_data": hit,
                            "_npc_action_type": "attack"
                        }
                    } else {}
                    if (attack[3]) {
                        action.choices["DMG"] = {
                            "_action_msg": "Rolled damage for " + name,
                            "_action_data": dmg,
                            "_npc_action_type": "damage"
                        }
                    }
                    item._a[name] = action
                }
            }

            item.talents.push(talent);
        }
        /*
        if (m.action) {
            item._a = {}
            for (var i in m.action) {
                i = m.action[i];
                if (i.name == "Source") {
                    continue;
                }
                if (Array.isArray(i.text)) {
                    for (var k in i.text) {
                        i.text[k] = parseNotesText(i.text[k]);
                    }
                    i.text = i.text.join('<br>');
                }

                var action = {
                    hot: !(i.trait || i.legendary),
                    _npc_action: true,
                    _no_roll: !i.attack || i.attack.length <= 0,
                    legendary: i.legendary,
                    trait: i.trait,
                    description: i.text,
                    choices: {},
                    eventData: {
                        data: "@_action_data",
                        msg: "@_action_msg",
                    }
                }
                if (i.attack) {
                    if (!Array.isArray(i.attack)) {
                        i.attack = [i.attack];
                    }
                    for (var a in i.attack) {
                        a = i.attack[a];
                        var attack = /^(.*)\|(.*)\|(.*)$/.exec(a)
                        if (!attack) {
                            console.log(a);
                            attack = a.split("|");
                        }
                        var name = attack[1];
                        if (!name) {
                            name = i.name;
                        } else if (name != "" && name != i.name) {
                            name = i.name + " (" + name + ")";
                        }
                        var hit = "d20 + " + attack[2]
                        var dmg = attack[3]
                        if (attack[2]) {
                            action.choices[name + "_attack"] = {
                                "_action_msg": "Rolled attack for " + name,
                                "_action_data": hit,
                                "_npc_action_type": "attack"
                            }
                        } else {}
                        if (attack[3]) {
                            action.choices[name + "_damage"] = {
                                "_action_msg": "Rolled damage for " + name,
                                "_action_data": dmg,
                                "_npc_action_type": "damage"
                            }
                        }
                    }
                }
                item._a[i.name] = action
            }
        }*/
        item.info.notes.current = "<div>" + item.info.notes.current + "</div>"
        try {
            item.counters.proficiency.current = Math.floor(eval(m.cr) / 4 + 2)
        } catch (e) {
            console.log(m, m.cr);
        }

        if(m.spells)
        {
            item.spellbook = [];
            m.spells = m.spells.replace(/\./g,",");
            m.spells = m.spells.replace(/\’/g,"'");
            m.slots = m.slots.split(",");
            for(var k in m.slots)
            {
                var slot = m.slots[k];
                slot = slot.trim();
                if(slot==""){slot = 0}
                m.slots[k] = slot;
            }
            item.counters["1st"].current = m.slots[0];
            item.counters["1st"].max = m.slots[0];
            
            item.counters["2nd"].current = m.slots[1];
            item.counters["2nd"].max = m.slots[1];
            
            item.counters["3rd"].current = m.slots[2];
            item.counters["3rd"].max = m.slots[2];

            item.counters["4th"].current = m.slots[3];
            item.counters["4th"].max = m.slots[3];

            item.counters["5th"].current = m.slots[4];
            item.counters["5th"].max = m.slots[4];

            item.counters["6th"].current = m.slots[5];
            item.counters["6th"].max = m.slots[5];

            item.counters["7th"].current = m.slots[6];
            item.counters["7th"].max = m.slots[6];

            item.counters["8th"].current = m.slots[7];
            item.counters["8th"].max = m.slots[7];

            item.counters["9th"].current = m.slots[8];
            item.counters["9th"].max = m.slots[8];

            m.spells = m.spells.split(",");
            for(var k in m.spells)
            {
                var spell = m.spells[k].trim().toLowerCase();
                if(spell ==""||!spell){
                    continue;
                }
                if(_SPELL_LIST[spell])
                {
                    item.spellbook.push(duplicate(_SPELL_LIST[spell]));
                }
                else{
                    console.log("SPELL MISSING!!!!"+spell);
                    throw Error("MISSING KURWA");
                }
            }
        }

        item._d = NPC_SHEET;
        var found = 0;
        for (var i in DataList) {
            var item2 = DataList[i];
            if (item2.info.name.current == item.info.name.current) {
                DataList[i] = item;
                //            item.info.img = item2.info.img;
                found = true;
                scope.actorCountOV++;

            }
        }
        if (!found) {
            scope.actorCount++;
            DataList.push(item);
        }

    }
}