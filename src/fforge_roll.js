FF.registerUI("roll", function(obj,app,scope)
{
    scope = scope || {}
    if(!scope.roll)
    {
        scope.roll = obj.roll;
    }
    var render =  FF.renderTemplate("roll", obj, {}, app, scope)
    var result = render.find("#result");
    result.attr("id","");

    var die = scope.roll.dices[0];
    if(die.dice.substr(1)==die.roll)
    {
        result.addClass("roll_crit");
    }
    else if(die.roll == 1)
    {
        result.addClass("roll_critfail");
    }

    return render;
});