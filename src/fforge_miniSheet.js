FiveForge.registerHTMLUI("miniSheet", "miniSheet",function(handle, obj, app, scope)
{
    var actions = handle.find("#actions");
    actions.attr("id","");
    let traits = obj.data.elements.MonsterTrait;
    for(let i = 0; i< traits.length; i++)
    {
        let trait = traits[i];
        let attacks = trait.attributes.attacks.current;
        let damages = trait.attributes.damages.current;
        for(let i = 0; i< attacks.length; i++)
        {
            let action = attacks[i];
            let button = $("<button>"+action.name+"</button>").appendTo(actions);
            button.click(function(){
                FiveForge.sendCharacterRoll(obj, action.value, "Attack for " + action.name)
            })
            button.tooltip({title:action.value.replace(/ /g, "&nbsp;"),html:true, container: 'body'});
        }
        for(let i = 0; i< damages.length; i++)
        {
            let action = damages[i];
            let button = $("<button class='highlight' style='color:white'>"+action.name+"</button>");
            button.click(function(){
                FiveForge.sendCharacterRoll(obj, action.value, "Damage for " + action.name)
            })
            button.tooltip({title:action.value.replace(/ /g, "&nbsp;"),html:true, container: 'body'});
            button.appendTo(actions);
        }
    }
})


FiveForge.addHook("Initialize",function(){
    let div = $("<div class='flex flexcolumn'>")
    let curChar = undefined;
    let prevChar = undefined;
    
    let pop = ui_popOut({
        target : $("body"),
        align : "left center",
        id : "selection-sheet",
        maximize : true,
        minimize : true,
        title: "{title}",
        style : {"width" : "500px", "height" : "300px"}
      }, div);
      pop.resizable();
    function updateSelectionSheet()
    {
        let selected = FiveForge.getSelectedCharacters();
        if(selected.length == 1)
        {
            prevChar = curChar;
            curChar = selected[0];
            pop.show();
        }
        else
        {
            pop.hide();
        }
        if(curChar != prevChar)
        {
            div.html("");
            pop.find("text > b").text(curChar.data.info.name.current);
            let render = FiveForge.newApp("miniSheet")
            curChar.addApp(render)
            render.removeClass("flexcolumn application")
            div.append(render);
        }
        setTimeout(updateSelectionSheet, 500)
    
    }
    updateSelectionSheet()
    
})
