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

    if(game.debug)
    {
        let handle = sheet;
        let debugPrint = $("<button>Debug > Console</button>");
        debugPrint.appendTo(handle);
        debugPrint.css({
            "position":"absolute",
            "right":0,
            "top":0,
        })
        handle.css("position","relative");
        debugPrint.click(function(){FiveForge.log(obj.data)})
    }
    var forceUpdate = false;

    var data = obj.data;
    if(data._fillWith)
    {
        $.extend(data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
        delete data["_fillWith"]
        setTimeout(function(){
            sheet.replaceWith(FiveForge.renderUI("monsterSheet", obj, app, scope));
            console.log("Compendium hack :(")
        },0)
        forceUpdate = true;
    }

    if(obj.data._version!=game.templates.FiveForge.VERSION)
    {
        var cp = duplicate(obj.data);
        $.extend(true, obj.data, game.templates.actors["Character"], cp);
        obj.data._version = game.templates.FiveForge.VERSION;
        console.log("Updated data on character "+obj.data.info.name.current)
        forceUpdate = true;
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
        obj.sync("updateAsset");
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


FiveForge.registerHTMLUI("monsterSheet", "monsterSheet", function(sheet, obj,app,scope)
{
    if(game.debug)
    {
        let handle = sheet;
        let debugPrint = $("<button>Debug > Console</button>");
        debugPrint.appendTo(handle);
        debugPrint.css({
            "position":"absolute",
            "right":0,
            "top":0,
        })
        handle.css("position","relative");
        debugPrint.click(function(){FiveForge.log(obj.data)})
    }

    var forceUpdate = false;

    var data = obj.data;
    if(data._fillWith)
    {
        let flags = data._flags;
        $.extend(data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
        data._flags = flags;
        delete data["_fillWith"]
        setTimeout(function(){
            sheet.replaceWith(FiveForge.renderUI("monsterSheet", obj, app, scope));
            console.log("Compendium hack :(")
        },0)
        forceUpdate = true;
    }


    if(obj.data._version!=game.templates.FiveForge.VERSION)
    {
        var cp = duplicate(obj.data);
        $.extend(true, obj.data, game.templates.actors["Character"], cp);
        obj.data._version = game.templates.FiveForge.VERSION;
        console.log("Updated data on character "+obj.data.info.name.current)
        forceUpdate = true;
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
        obj.sync("updateAsset");
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