FF.registerHTMLUI("roll", "roll", function(handle, obj, app, scope){
    let roll = scope.roll;
    let dice = handle.find("#dice");
    dice.attr("id","");
    if(scope.noBackground)
    {
        dice.removeClass("diceBackground")
    }
    if(roll.dice.length > 0)
    {
        if(roll.dice[0].rolled == roll.dice[0].type.substr(1))
        {
            dice.addClass("roll_crit");
        }
        else if(roll.dice[0].rolled == 1)
        {
            dice.addClass("roll_critfail");
        }
    }
});
FF.registerUI("actionResult", function(obj,app,scope)
{
    scope = scope || {}
    if(!scope.action)
    {
        scope.action = obj.action;
    }
    let div = $("<div>");
    let action = scope.action;
    if(action.attack)
    {
        let dice = FF.renderUI("roll", obj, app, {roll: action.attack, subtext:"Attack"})
        dice.removeClass("flex")
        dice.addClass("flexcenter")
        dice.css("border-bottom","1px solid rgba(0,0,0,0.05)")
        dice.appendTo(div);
    }
    if(action.damage)
    {
        let dice = FF.renderUI("roll", obj, app, {roll: action.damage, noBackground: true, subtext:action.damageType})
        dice.removeClass("flex")
        dice.addClass("flexcenter")
        dice.appendTo(div);
    }
    if(action.damageBonuses&&action.damageBonuses.length > 0)
    {
        for(let i = 0; i < action.damageBonuses.length; i++)
        {
            let bonus = action.damageBonuses[i];

            let dice = FF.renderUI("roll", obj, app, {roll: bonus, noBackground: true, subtext:bonus.subtext})
            dice.removeClass("flex")
            dice.addClass("flexcenter")
            dice.appendTo(div);
        }
    }
    //div.append($("<div>"+JSON.stringify(scope.action, null, 2).replace(/\n/g,"<br>").replace(/ /g,"&nbsp;")+"</div>"))

    return div;
});