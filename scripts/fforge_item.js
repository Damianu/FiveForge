/*
    >>> CLASS <<<
*/
class FFItem extends FFElement
{
    get template()
    {
        return "item";
    }
    get subtype()
    {
        return this._data.attributes.itemType.current;
    }

    get cardTemplate()
    {
        return "itemCard";
    }
    calcData()
    {
    }
    getActions(obj)
    {
        let item = this;
        function genDamage(stat, type)
        {
            var dexMod = obj.data.stats.Dex.modifiers["Stat-Bonus"];
            var strMod = obj.data.stats.Str.modifiers["Stat-Bonus"];
            if(dexMod >= 0)
            {
                dexMod = " + "+ dexMod;
            }
            else
            {
                dexMod = " - " + String(dexMod).substr(1);
            }
            if(strMod >= 0)
            {
                strMod = " + "+ strMod;
            }
            else
            {
                strMod = " - " + String(strMod).substr(1);
            }

            var rollText = "";
            if(type == "first")
            {
                rollText = item.getProp("damage")
            }
            else if(type == "second")
            {
                rollText = item.getProp("damage2");
            }

            if(stat == "dex")
            {
                rollText += dexMod + "[Dexterity]"
            }
            else if(stat == "str")
            {
                rollText += strMod + "[Strength]"
            }

            return rollText;
        }
        function genAttack(stat)
        {
            var rollText = "D20";
            var dexMod = obj.data.stats.Dex.modifiers["Stat-Bonus"];
            var strMod = obj.data.stats.Str.modifiers["Stat-Bonus"];
            if(dexMod >= 0)
            {
                dexMod = " + "+ dexMod;
            }
            else
            {
                dexMod = " - " + String(dexMod).substr(1);
            }
            if(strMod >= 0)
            {
                strMod = " + "+ strMod;
            }
            else
            {
                strMod = " - " + String(strMod).substr(1);
            }

            if(stat == "dex")
            {
                rollText += dexMod + "[Dexterity]"
            }
            else if(stat == "str")
            {
                rollText += strMod + "[Strength]"
            }
            if(item.getProp("proficient"))
            {
                rollText += " + " + obj.data.counters.proficiency.current + "[Proficiency]"
            }
            return rollText
        }
        var actions = [];
        if(this.subtype == "Weapon")
        {
            var finesse = this.getProp("finesse")
            var ranged = this.getProp("ranged")
            var versatile = this.getProp("versatile")

            var strAttack = genAttack("str");
            var dexAttack = genAttack("dex");

            if(finesse || ranged)
            {
                var dmg = genDamage("dex","first");
                var dmg2 = genDamage("dex","second");

                var critBonus = "";
                dmg.replace(window.diceRegex,function(dice)
                {
                    critBonus += " + "+dice;
                })

                var critBonus2 = "";
                dmg2.replace(window.diceRegex,function(dice)
                {
                    critBonus2 += " + "+dice;
                })
                var damage2 = this.getProp("damage2");
                var hasAddDamage = 1;
                actions.push({
                    name:"Dex Attack",
                    attack: dexAttack,
                    damage: dmg,
                    damageType: this.getProp("damageType"),
                    critBonus:critBonus,
                });

                if(!(damage2=="0"||damage2==undefined||damage2==""))
                {
                    actions.push({
                        name:"Dex Attack 2",
                        attack: dexAttack,
                        damage: dmg2,
                        damageType: this.getProp("damageType2"),
                        critBonus:critBonus2,
                    });
                }
            }
            if(!ranged)
            {

                var dmg = genDamage("str","first");
                var dmg2 = genDamage("str","second");

                var critBonus = "";
                dmg.replace(window.diceRegex,function(dice)
                {
                    critBonus += " + "+dice;
                })

                var critBonus2 = "";
                dmg2.replace(window.diceRegex,function(dice)
                {
                    critBonus2 += " + "+dice;
                })
                var damage2 = this.getProp("damage2");
                actions.push({
                    name:"Str Attack",
                    attack: strAttack,
                    damage: dmg,
                    damageType: this.getProp("damageType"),
                    critBonus:critBonus,
                });
                if(!(damage2=="0"||damage2==undefined||damage2==""))
                {
                    actions.push({
                        name:"Str Attack 2",
                        attack: strAttack,
                        damage: dmg2,
                        damageType: this.getProp("damageType2"),
                        critBonus:critBonus2,
                    });
                }
            }
        }

        return actions;
    }
    getEditableAttributes()
    {
        return FiveForge.ItemEditableAttributes[this.subtype]
    }
    render(obj)
    {
        var render = super.render(obj);
        var detailDiv = render.find(".iExpandable");
        var actions = this.getActions(obj);
        let item = this;
        if(actions.length > 0)
        {
            var actionDiv = $("<div class='iActions'>").appendTo(detailDiv);
            for(let i =0; i < actions.length; i++)
            {
                let button = $("<button>").appendTo(actionDiv);
                let action = actions[i];
                button.text(action.name);
                button.tooltip({title:action.attack.replace(/ /g, "&nbsp;"),html:true, container: 'body'});
                button.click(function(){

                    var rolls = [];
                    for(var i=0;i<2;i++)
                    {
                        var roll = {};
                        roll.attack = FiveForge.simpleEval(action.attack);
                        roll.damage = FiveForge.simpleEval(action.damage);
                        roll.damageType = action.damageType;
                        roll.critBonus = FiveForge.simpleEval(action.critBonus)
                        var damageBonuses = duplicate(item._data.attributes.damageBonus.current);
                        var attackBonuses = duplicate(item._data.attributes.attackBonus.current);

                        for(var k in obj.data.damageModifiers)
                        {
                            k = obj.data.damageModifiers[k];
                            if(k.enabled)
                            {
                                damageBonuses.push(duplicate(k));
                            }
                        }

                        for(var k=0;k<damageBonuses.length;k++)
                        {
                            damageBonuses[k].value = FiveForge.simpleEval(damageBonuses[k].value);
                        }


                        for(var k in obj.data.attackModifiers)
                        {
                            k = obj.data.attackModifiers[k];
                            if(k.enabled)
                            {
                                attackBonuses.push(duplicate(k));
                            }
                        }

                        for(var k=0;k<attackBonuses.length;k++)
                        {
                            attackBonuses[k].value = FiveForge.simpleEval(attackBonuses[k].value);
                        }


                        roll.damageBonuses = damageBonuses;
                        roll.attackBonuses = attackBonuses;
                        rolls.push(roll);
                    }


                    var uid = getCookie("UserID");
                    runCommand("chatEvent",{
                        ui:"fforge_elementCard",
                        rolls: rolls,
                        itemDescription: item._data.info.notes.current,
                        itemIcon: item._data.info.img.current,
                        itemName: item._data.info.name.current,
                        element: duplicate(item._data),
                        audio:FiveForge.getSound("sword"),
                        person : obj.data.info.name.current,
                        icon : obj.data.info.img.current,
                        user : game.players.data[uid].displayName,
                    })
                });
            }
        }

        return render;
    }
}
/*
    >>> SETUP <<<
*/
FFItem.setupType("Item")
FFItem.registerAttribute("itemType","Item Type", FiveForge.ItemTypes, "Generic")
FFItem.registerAttribute("quantity","Quantity", "number", 1)
FFItem.registerAttribute("weight","Weight", "number", 1)
FFItem.registerAttribute("price","Price", "number")
FFItem.registerAttribute("rarity","Rarity", "text")
FFItem.registerAttribute("baseWeight","Base Weight", "number")
FFItem.registerAttribute("attackBonus","Attack Bonus", "modifierEdit",[])
FFItem.registerAttribute("damageBonus","Damage Bonus", "modifierEdit",[])

FFItem.registerAttribute("damageType","Damage Type", FiveForge.DamageTypes, "Slashing")
FFItem.registerAttribute("damageType2","Damage Type 2", FiveForge.DamageTypes, "Slashing")

FFItem.registerAttribute("damage","Damage", "text")
FFItem.registerAttribute("damage2","Damage 2", "text")
FFItem.registerAttribute("range","Range", "text", "5 ft.")

FFItem.registerAttribute("ammunition","Ammunition", "checkbox")
FFItem.registerAttribute("finesse","Finesse", "checkbox")
FFItem.registerAttribute("heavy","Heavy", "checkbox")
FFItem.registerAttribute("light","Light", "checkbox")
FFItem.registerAttribute("loading","Loading", "checkbox")
FFItem.registerAttribute("ranged","Ranged", "checkbox")
FFItem.registerAttribute("reach","Reach", "checkbox")

FFItem.registerAttribute("thrown","Thrown", "checkbox")
FFItem.registerAttribute("twohanded","Two-Handed", "checkbox")
FFItem.registerAttribute("versatile","Versatile", "checkbox")
FFItem.registerAttribute("proficient","Proficient", "checkbox")


FFItem.registerAttribute("armor","Armor", "number")
FFItem.registerAttribute("armorType","Armor Type", ["Shield", "Light", "Medium", "Heavy"])
FFItem.registerAttribute("equipped","Equipped", "checkbox")

/*
    >>> TEMPLATE <<<
*/

FiveForge.ItemEditableAttributes["Generic"] = {
    itemType: true,
    quantity: true,
    weight: true,
    price:true,
    rarity:true,
}

FiveForge.ItemEditableAttributes["Weapon"] = {};
$.extend(true, FiveForge.ItemEditableAttributes["Weapon"], FiveForge.ItemEditableAttributes["Generic"], {
    damageType:true, damage:true, damageType2:true, damage2:true, range:true, ammunition:true,damageBonus:true,attackBonus:true,
    finesse:true, heavy:true, light:true, loading:true, ranged:true, reach:true, thrown:true,twohanded:true,versatile:true,proficient:true
});


FiveForge.ItemEditableAttributes["Container"] = {};
$.extend(true, FiveForge.ItemEditableAttributes["Container"], FiveForge.ItemEditableAttributes["Generic"], {
    weight:0,
    baseWeight:true,
});

FiveForge.ItemEditableAttributes["Armor"] = {};
$.extend(true, FiveForge.ItemEditableAttributes["Armor"], FiveForge.ItemEditableAttributes["Generic"], {
    armor:true,
    armorType:true,
    equipped:true,
});