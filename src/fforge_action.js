/*
    Data Format:

    {
        roll:"", //Roll, like Strength Check
        attack:"", // Attack, like attack for Sword
        damage:"", // Damage
        save:"", // Save, like Dex save for fireball
    }

    Roll gets nothing added
    Attack gets attack bonuses added
    Damage gets damage bonuses added

    At least one of those has to be present for valid action

    Save is ran after player presses "Save" button on his selected/impersonated character.

    Character is accessed via @c (It's selected/impersonated character on save)
    Element is accessed via @e

    Example Return Format:
    {
        roll/attack/damage/save:{
            tooltip:"2d20 + 2[Strength] + 3[Proficiency]",
            resultTooltip:"(1 + 1)[2d20] + 2[Strength] + 3[Proficiency]",
            result: 7,
            dices:[
                {
                    type:"d20",
                    rolled:1,
                },
                {
                    type:"d20",
                    rolled:1,
                },

            ],
            bonuses:[]//Same format nested
        }
    }

*/
let _process = function(query, context)
{
    let dices = [];
    query = query.replace(/@([0-9a-zA-Z._]+)/g, function(_, m){
        var ret = sync.traverse(context, m).current||sync.traverse(context, m)
        ret += `[${sync.traverse(context, m).name}]`;
        return ret;
    })
    let tooltip = query;

    let diceOnly = query.replace(window.diceRegex, function(m){
        var res = sync.evalDice(m);
        res.replace(/[0-9]+/g, function(m2){
            var match = /[dD][0-9]+/g.exec(m);
            dices.push({type:match[0], rolled:m2});
            return m2;
        });
        return res  + "["+m+"]";
    });

    query = query.replace(/\[.*?\]/g,"");
    let full = sync.eval(query, context);
    return {tooltip:tooltip, resultTooltip:diceOnly, result:full, dices:dices}
}
FF.buildAction = function(data, character, element)
{
    let context = {}
    let result = {}
    if(character.data)
    {
        context.c = character.data;
    }
    else{
        context.c = character;
    }

    if(element)
    {
        if(element.data)
        {
            context.e = element.data;
        }
        else
        {
            context.e = element;
        }
    }

    if(data.roll)
    {
        result.roll = _process(data.roll, context);
    }

    if(data.attack)
    {
        result.roll = _process(data.roll, context);
    }

    if(data.damage)
    {
        result.roll = _process(data.roll, context);
    }

    if(data.save)
    {
        result.roll = _process(data.roll, context);
    }


    return result;
}

//TODO: Add bonuses