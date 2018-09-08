/*
    Data Format:

    {
        roll:"", //Roll, like Strength Check
        attack:"", // Attack, like attack for Sword
        damage:"", // Damage
        damageType:"",//Damage type
        save:"", // Save, like Dex save for fireball
    }

    Roll gets nothing added
    Attack gets attack bonuses added
    Damage gets damage bonuses added

    At least one of those has to be present for valid action

    Save is ran on player's selected/impersonated character after he presses "Save" button

    Character is accessed via @c (It's selected/impersonated character on save)
    Element is accessed via @e

    Example Return Format:
    {
        roll/attack/damage/save:{
            tooltip:"2d20 + 2[Strength] + 3[Proficiency]",
            resultTooltip:"(1 + 1)[2d20] + 2[Strength] + 3[Proficiency]",
            result: 7,
            dice:[
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
    let dice = [];
    query = query.replace(/@([0-9a-zA-Z._]+)/g, function(_, m){
        let trav = sync.traverse(context, m);
        let pathUp = m.replace(/(.+)\..+$/g, "$1"); //Get everything until last dot
        let oneUp = sync.traverse(context, pathUp);

        var ret = trav.current||trav;
        if(trav.name)
        {
            ret += `[${trav.name}]`;
        }
        else if(oneUp)
        {
            ret += `[${oneUp.name}]`;
        }
        return ret;
    })
    query = query.replace(/\+ *\-/g, "-") // replace +- to -
    let tooltip = query;

    let diceOnly = query.replace(window.diceRegex, function(m){
        var res = sync.evalDice(m);
        res.replace(/[0-9]+/g, function(m2){
            var match = /[dD][0-9]+/g.exec(m);
            dice.push({type:match[0], rolled:m2});
            return m2;
        });
        return res  + "["+m+"]";
    });

    query = diceOnly.replace(/\[.*?\]/g,"");
    let full = sync.eval(query, context);
    return {tooltip:tooltip, resultTooltip:diceOnly, result:full, dice:dice, bonuses:[], color:"inhereit"}
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
    let crit = false;
    if(data.attack)
    {
        result.attack = _process(data.attack, context);
        if(result.attack.dice.length > 0)
        {
            if(result.attack.dice[0].rolled == 20)
            {
                crit = true;
            }
        }

        var attackBonuses = character.data.attackModifiers.concat(element.attributes.attackBonus.current);
        for(let i = 0; i < attackBonuses.length; i++)
        {
            let bonus = attackBonuses[i];
            if(bonus.enabled)
            {
                let b = _process(bonus.value, context);
                b.tooltip += `<br>[${bonus.name}]`;
                b.resultTooltip += `<br>[${bonus.name}]`;
                result.attack.bonuses.push(b);
            }
        }

    }

    if(data.damage)
    {
        result.damage = _process(data.damage, context);
        if(crit)
        {
            let critBonus = ""
            result.damage.tooltip.replace(window.diceRegex, function(d){
                critBonus += ` + ${d}`;
            })
            if(critBonus)
            {
                let res = _process(critBonus, context);
                res.tooltip+= "<br>[CRITICAL BONUS]"
                res.resultTooltip+= "<br>[CRITICAL BONUS]"
                res.color = "green"
                result.damage.bonuses.push(res);
            }
        }
        var damageBonuses = character.data.damageModifiers.concat(element.attributes.damageBonus.current);
        result.damageBonuses = [];
        for(let i = 0; i < damageBonuses.length; i++)
        {
            let bonus = damageBonuses[i];
            if(bonus.enabled)
            {
                let b = _process(bonus.value, context);
                b.subtext = bonus.name;
                if(crit)
                {
                    let critBonus = ""
                    b.tooltip.replace(window.diceRegex, function(d){
                        critBonus += ` + ${d}`;
                    })
                    if(critBonus)
                    {
                        let res = _process(critBonus, context);
                        res.tooltip+= "<br>[CRITICAL BONUS]"
                        res.resultTooltip+= "<br>[CRITICAL BONUS]"
                        res.color = "green"
                        b.bonuses.push(res);
                    }
                }
                result.damageBonuses.push(b);
            }
        }

    }

    if(data.save)
    {
        result.save = _process(data.save, context);
    }

    result.damageType = data.damageType;

    return result;
}

//TODO: Add bonuses