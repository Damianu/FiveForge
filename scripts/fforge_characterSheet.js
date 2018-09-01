FiveForge.Abilities = {
    "Str":"Strength",
    "Dex":"Dexterity",
    "Con":"Constitution",
    "Int":"Int",
    "Wis":"Wisdom",
    "Cha":"Charisma",
}
FiveForge.registerHTMLUI("characterSheet", "characterSheet", function(sheet, obj,app,scope)
{

    var data = obj.data;
    FF.addDebugMenu(sheet, {
        "OBJ > Console": function(){
            FiveForge.log(obj)
        },
        "Force Update": function(){
            obj.data._version = "FORCE_UPDATE";
            obj.sync("updateAsset")
        },
    })

    var forceUpdate = false;

    if(data._fillWith)
    {
        $.extend(true, data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
        delete data["_fillWith"]
        setTimeout(function(){
            sheet.replaceWith(FiveForge.renderUI("characterSheet", obj, app, scope));
            console.log("Compendium hack :(")
        },0)
        forceUpdate = true;
    }

    if(obj.data._version == "NEW_CHARACTER")
    {
        obj.data._version = game.templates.FiveForge.VERSION;
    }
    if(obj.data._version!=game.templates.FiveForge.VERSION)
    {
        var cp = duplicate(obj.data);
        $.extend(true, obj.data, game.templates.actors["Character"], cp);
        obj.data._version = game.templates.FiveForge.VERSION;
        console.log("Updated data on character "+obj.data.info.name.current)
        sheet.replaceWith($("<div>Character updated, please reopen the sheet</div>"));
        obj.sync("updateAsset");
        return $("<div>Working..</div>");
    }

    for(var k in FFElement.types)
    {
        if(obj.data.elements[k]===undefined)
        {
            obj.data.elements[k]=[];
            forceUpdate = true;
        }
    }
    if(forceUpdate)
    {
        console.log("Enhanced, updating");
        setTimeout(function(){
            sheet.replaceWith(FiveForge.renderUI("characterSheet", obj, app, scope));
            obj.sync("updateAsset");
        },0)
        return $("<div>Working..</div>");
    }
    if(!app.attr("sizeFixed"))
    {
        setTimeout(function(){
            app.parent().parent().parent().height("950px");
            app.parent().parent().parent().width("800px");
        });
        app.attr("sizeFixed",true)
    }
    var selectAbility = sheet.find("#spellAbilitySelect")
    selectAbility.attr("id",null);
    for(var val in FiveForge.Abilities)
    {
        let name = FiveForge.Abilities[val];
        var option = $("<option>");
        option.val(val).text(name)
        option.appendTo(selectAbility);
    }
    selectAbility.val(obj.data.info.spellcastingAbility.current)
    selectAbility.change(function(){
        obj.data.info.spellcastingAbility.current = selectAbility.val();;
        obj.sync("updateAsset");
    })
});


FiveForge.registerHTMLUI("monsterSheet", "monsterSheet", function(sheet, obj,app,scope)
{
    var data = obj.data;
    FF.addDebugMenu(sheet, {
        "OBJ > Console": function(){
            FiveForge.log(obj)
        },
        "Force Update": function(){
            obj.data._version = "FORCE_UPDATE";
            obj.sync("updateAsset")
        },
    })
    var forceUpdate = false;

    if(data._fillWith)
    {
        let flags = data._flags;
        $.extend(true, data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
        data._flags = flags;
        delete data["_fillWith"]
        forceUpdate = true;
    }

    if(obj.data._version == "NEW_CHARACTER")
    {
        obj.data._version = game.templates.FiveForge.VERSION;
    }
    if(obj.data._version!=game.templates.FiveForge.VERSION)
    {
        var cp = duplicate(obj.data);
        $.extend(true, obj.data, game.templates.actors["Monster"], cp);
        obj.data._version = game.templates.FiveForge.VERSION;
        console.log("Updated data on character "+obj.data.info.name.current)
        sheet.replaceWith($("<div>Character updated, please reopen the sheet</div>"));
        obj.sync("updateAsset");
        return $("<div>Working..</div>");
    }

    for(var k in FFElement.types)
    {
        if(obj.data.elements[k]===undefined)
        {
            obj.data.elements[k]=[];
            forceUpdate = true;
        }
    }
    if(forceUpdate)
    {
        console.log("Enhanced, updating");
        setTimeout(function(){
            sheet.replaceWith(FiveForge.renderUI("monsterSheet", obj, app, scope));
            obj.sync("updateAsset");
        },0)
        return $("<div>Working..</div>");
    }
    if(!app.attr("sizeFixed"))
    {
        setTimeout(function(){
            app.parent().parent().parent().height("950px");
            app.parent().parent().parent().width("850px");
        });
        app.attr("sizeFixed",true)
    }
    var selectAbility = sheet.find("#spellAbilitySelect")
    selectAbility.attr("id",null);
    for(var val in FiveForge.Abilities)
    {
        let name = FiveForge.Abilities[val];
        var option = $("<option>");
        option.val(val).text(name)
        option.appendTo(selectAbility);
    }
    selectAbility.val(obj.data.info.spellcastingAbility.current)
    selectAbility.change(function(){
        obj.data.info.spellcastingAbility.current = selectAbility.val();;
        obj.sync("updateAsset");
    })
});