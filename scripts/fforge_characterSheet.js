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
    var forceUpdate = false;
    if(obj.data.damageModifiers == undefined)
    {
        obj.data.damageModifiers = obj.data.damageModifiers || [];
        forceUpdate = true;

    }
    if(obj.data.attackModifiers == undefined)
    {
        obj.data.attackModifiers = obj.data.attackModifiers || [];
        forceUpdate = true;

    }

    if(obj.data.elements === undefined)
    {
        obj.data.elements = {};
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
    console.log(obj);
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