/*
    fforge_converter.js

    Contains converter used for FiveForge's compendium.
*/


FiveForge.registerGlobalAction("(Dev) XML Importer", function(){

    var app = FiveForge.renderUI("xmlConverter");
    var pop = ui_popOut({
        target : $("body"),
        align : "top",
        title: "(Dev) XML Importer",
        style : {"width" : "400px", "height" : "200px"}
      },  app);

});
/*
    Util Functions

*/

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

function countKeys(obj)
{
    let c = 0;
    for(let k in obj)
    {
        ++c;
    }
    return c;
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


function fileDrop(element, callback)
{
    var files = [];

    element.bind('dragover dragleave', function(event) {
        event.stopPropagation()
        event.preventDefault()
    })

    // Catch drop event
    element.bind('drop', function(event) {
        // Stop default browser actions
        event.stopPropagation()
        event.preventDefault()

        // Get all files that are dropped
        files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files

        // Convert uploaded file to data URL and pass trought callback
        if (callback) {
            var reader = new FileReader()
            reader.onload = function(event) {
                callback(event.target.result)
            }
            reader.readAsText(files[0])
        }
        return false
    })

}

function removeMultiBreaks(text)
{
    return text.replace(/<br>(\s*<br>)+/g,"<br>")
    .replace(/^<br>/,"")
    .replace(/<br>$/,"");
}
function boldColon(text)
{
    return text
    .replace(/(<br>[a-zA-Z0-9\s]+):/g,"<b>$1:</b>") //After linebreak
    .replace(/^([a-zA-Z0-9\s]+):/g,"<b>$1:</b>") //First line
}

function parseNotes(text)
{
    text = boldColon(text);
    text = removeMultiBreaks(text);
    return text;
}

/*
    Item Parser
*/

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
var DamageMap = {
    "P": "Piercing",
    "B": "Bludgeoning",
    "S": "Slashing",
}
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
    "R": "ranged",
    "L": "light",
    "T": "thrown",
    "F": "finesse",
    "V": "versatile",
    "A": "ammunition",
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


let parseItems = function(json)
{
    let elements = {};
    let rawElements = json.item;
    for(let raw in rawElements)
    {
        raw = rawElements[raw];
        if(!Array.isArray(raw.text))
        {
            raw.text = [raw.text];
        }
        raw.text =  raw.text.join("<br>")+"<br>";
        let element = new FFElement({_type:"Item"});
        
        element.info.name.current = raw.name;
        element.info.notes.current = parseNotes(raw.text);

        element.attributes.price.current = raw.value;
        element.attributes.quantity.current = 1;
        element.attributes.weight.current = raw.weight;
        element.attributes.itemType.current = TypeMap[raw.type];
        element.attributes.rarity.current = raw.detail;

        var ico = findIcon(raw.name);
        if(ico)
        {
            element.info.img = genProp("Image","content/5Extended/icons/"+ico+".svg");
        }
        else
        {
            console.log("Icon not found:"+raw.name);
            element.info.img = genProp("Image","content/5Extended/icons/swap-bag.svg");
        }


        if (raw.property) {
            var tags = raw.property.split(",");
            for (var tag in tags) {
                tag = tags[tag].trim();
                itemtag = PropertyMap[tag]
                if (itemtag) {
                    element.attributes[itemtag].current = 1;
                } else {
                    console.log("Unknown property '" + tag + "' on item" + raw.name);
                }
            }
        }
        if(raw.type=="R")
        {
            element.attributes.ranged.current = 1;
        }

        if(raw.dmg1!=undefined)
        {
            element.attributes.range.current = raw.range || "5 ft.";
            element.attributes.damage.current = raw.dmg1;
            element.attributes.damage2.current = raw.dmg2;

            if (raw.dmgType) {
                var dmgs = raw.dmgType.split(",");
                element.attributes.damageType.current = DamageMap[dmgs[0]];
                if(dmgs.length > 1)
                {
                    element.attributes.damageType2.current = DamageMap[dmgs[2]];
                }

            }
        }

        raw.modifier = raw.modifier||"";
        if(!Array.isArray(raw.modifier))
        {
            raw.modifier = [raw.modifier]
        }
        for(var k=0;k<raw.modifier.length;k++)
        {
            var mod = raw.modifier[k].toLowerCase();
            if(mod.indexOf("melee attacks") >=0)
            {
                element.attributes.attackBonus.current.push(
                {
                    name:mod,
                    value:mod.replace("melee attacks",""),
                    enabled:1,
                })
            }
            if(mod.indexOf("ranged attacks") >=0)
            {
                element.attributes.attackBonus.current.push(
                {
                    name:mod,
                    value:mod.replace("ranged attacks",""),
                    enabled:1,
                })
            }


            if(mod.indexOf("melee damage") >=0)
            {
                element.attributes.damageBonus.current.push(
                {
                    name:mod,
                    value:mod.replace("melee damage",""),
                    enabled:1,
                })

            }
            if(mod.indexOf("ranged damage") >=0)
            {
                element.attributes.damageBonus.current.push(
                {
                    name:mod,
                    value:mod.replace("ranged damage",""),
                    enabled:1,
                })
            }
        }

        elements[element.info.name.current] = element;
    }
    return elements;
}
/*
    Trait Parser
*/

let parseTraits = function(json)
{
    let elements = {};
    let rawElements = []
    /*
    Merge
    */
   console.log(json)
    for(let k in json.race)
    {
        k = json.race[k];
        rawElements = rawElements.concat(k.trait);
    }

    for(let k in json.race)
    {
        k = json.race[k];
        for(let j in k.trait)
        {
            j = k.trait[j];
            j.source = k.name
        }
        rawElements = rawElements.concat(k.trait);
    }
    for(let k in json.class)
    {
        k = json.class[k];
        for(let j in k.autolevel)
        {
            j = k.autolevel[j];
            if(!Array.isArray(j.feature))
            {
                j.feature = [j.feature];
            }
            for(let t in j.feature)
            {
                t = j.feature[t];
                if(!t){continue;}

                t.source = k.name
            }
            rawElements = rawElements.concat(j.feature);
        }
    }
    rawElements = rawElements.filter(x=> x!= undefined);
    /*
        Parse
    */
    for(let raw in rawElements)
    {
        raw = rawElements[raw];
        if(!Array.isArray(raw.text))
        {
            raw.text = [raw.text];
        }
        raw.text =  raw.text.join("<br>");
        raw.text = raw.text.replace(/Source:.+/g, ""); //Strip source, because traits repeat in many placees but are otherwise the same
        if(raw.name.indexOf("Ability Score Improvement")>=0)
        {
            continue;
        }
        let element = new FFElement({_type:"Trait"});
        element.info.name.current = raw.name;
        element.info.notes.current = parseNotes(raw.text);

        element.attributes.source.current = raw.source;

        if( elements[element.info.name.current]) //Conflicting names
        {
            let element2 = elements[element.info.name.current]
            let desc1 = element.info.notes.current;
            let desc2 = element2.info.notes.current;
            if(desc1 != desc2) //Check if descriptions differ
            {
                delete elements[element.info.name.current];

                element.info.name.current += "(" + raw.source + ")"; //Append source after name
                element2.info.name.current += "(" + element2.attributes.source.current + ")"; //Append source after name


                elements[element.info.name.current] = element;
                elements[element2.info.name.current] = element2;
            }

        }
        else
        {
            elements[element.info.name.current] = element;
        }
    }
    console.log(elements);
    return elements;
}
/*
    Spell Parser

*/
let schoolMap = 
{
    "A": "Abjuration",
    "C": "Conjuration",
    "D": "Divination",
    "EN": "Enchantment",
    "EV": "Evocation",
    "I": "Illusion",
    "N": "Necromancy",
    "T": "Transmutation",
}

let parseSpells = function(json)
{
    let elements = {};
    let rawElements = json.spell;
    for(let raw in rawElements)
    {
        raw = rawElements[raw];
        if(!Array.isArray(raw.text))
        {
            raw.text = [raw.text];
        }
        raw.text =  raw.text.join("<br>")+"<br>";
        let element = new FFElement({_type:"Spell"});

        element.info.name.current = raw.name;
        element.info.notes.current = parseNotes(raw.text);


        raw.components = raw.components.replace(/\(.+\)/g,function(m){
            raw.materials = /\((.+)\)/.exec(m)[1];
            return "";
        })

        element.attributes.level.current = raw.level;
        element.attributes.school.current = schoolMap[raw.school];
        element.attributes.materials.current = raw.materials;
        element.attributes.components.current = raw.components;
        element.attributes.duration.current = raw.duration;
        element.attributes.range.current = raw.range;
        element.attributes.time.current = raw.time;
        element.attributes.classes.current = raw.classes;
        element.attributes.ritual.current = (raw.ritual == "YES");
        element.attributes.spellType.current = "Cast"
        if(raw.roll)
        {
            if(!Array.isArray(raw.roll))
            {
                raw.roll = [raw.roll]
            }

            let hasRoll = false;
            for(let i = 0; i < raw.roll.length; i++)
            {
                let roll = raw.roll[i];
                if(roll.indexOf("SPELL") >= 0)
                {
                    element.attributes.spellType.current = "Attack + Damage"
                }
                else
                {
                    hasRoll = true;
                    element.attributes.damage.current.push({
                        enabled:1,
                        name: roll,
                        value: roll,
                    })
                }

            }
            if(element.attributes.spellType.current == "Cast" && hasRoll)
            {
                element.attributes.spellType.current = "Damage Only"
            }

            raw.text.replace(/([a-zA-Z]+) saving throw/g, function(_, m){
                element.attributes.spellType.current =  "Attack + Save + Damage"
                element.attributes.saveAbility.current = m;
            });

        }
        if(raw.text.indexOf("Higher Levels") >= 0)
        {
            raw.text.replace(/damage increase[s]* by ([^\s]+) for each slot/g, function(_, m){
                element.attributes.damage.current.push({
                    enabled:1,
                    name: "Per level",
                    value: m,
                })
            });
        }

        elements[element.info.name.current] = element;
    }
    return elements;
}


/*
    Converter UI

*/

FiveForge.registerUI("xmlConverter", function(obj, app, scope)
{
    scope = scope || {};
    let div = $("<div class='flex flexcolumn'>");
    let dropZone = $("<div class='flex lpadding'>Drop XML files here!</div>").appendTo(div);
    let buttons = $("<div class='flexrow'>").appendTo(div);

    let outputLog = "";
    function createConverter(name, func, json)
    {
        let button = $("<button class='flex'>"+name+"</button>").appendTo(buttons);
        let output = func(json);
        outputLog += "<br><b>"+name+" Elements</b>: "+ countKeys(output);
        output = 'FiveForge.Compendium[`'+name+'`] = ' + JSON.stringify(output);
        dropZone.html(outputLog);
        button.click(function(){
            saveData(output,"fforge_compendium_"+name+".js");
        });
    }


    fileDrop(dropZone,function(text){
        var json = xmlToJson(jQuery.parseXML(text)).compendium;
        dropZone.text(scope.outputText);
        createConverter("Trait", parseTraits, json)
        createConverter("Item", parseItems, json)
        createConverter("Spell", parseSpells, json)
    });


    return div;
});