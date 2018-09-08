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
        if(this.subtype=="Container")
        {
            if(this._data.inventory)
            {
                let weight = 0;
                this._data.attributes.baseWeight.current = Number(this._data.attributes.baseWeight.current) || 0;
                for(let i = 0; i < this._data.inventory.length; i++)
                {
                    let el = new FFElement(this._data.inventory[i])
                    weight += Number(el.attributes.weight.current) * Number(el.attributes.quantity.current) || 0;

                }
                this._data.attributes.weight.current = this._data.attributes.baseWeight.current + weight

            }
            else
            {
                this._data.attributes.weight.current = Number(this._data.attributes.baseWeight.current)
            }
        }
    }
    getActions()
    {
        let item = this;
        function genDamage(stat, type)
        {
            var rollText = "";
            if(type == "first")
            {
                rollText = "@e.attributes.damage"
            }
            else if(type == "second")
            {
                rollText = "@e.attributes.damage2"
            }

            if(stat == "dex")
            {
                rollText += " + @c.stats.Dex.bonus"
            }
            else if(stat == "str")
            {
                rollText += " + @c.stats.Str.bonus"
            }

            return rollText;
        }
        function genAttack(stat)
        {
            var rollText = "D20";

            if(stat == "dex")
            {
                rollText += " + @c.stats.Dex.bonus"
            }
            else if(stat == "str")
            {
                rollText += " + @c.stats.Str.bonus"
            }
            if(item.getProp("proficient"))
            {
                rollText += " + @c.counters.proficiency"
            }
            return rollText
        }
        var actions = [];
        if(this.subtype == "Weapon")
        {
            var finesse = this.getProp("finesse")
            var ranged = this.getProp("ranged")

            var strAttack = genAttack("str");
            var dexAttack = genAttack("dex");

            if(finesse || ranged)
            {
                var dmg = genDamage("dex","first");
                var dmg2 = genDamage("dex","second");

                var damage2 = this.getProp("damage2");

                actions.push({
                    name:"Dex",
                    attack: dexAttack,
                    damage: dmg,
                    damageType: this.getProp("damageType"),
                });

                if(damage2)
                {
                    actions.push({
                        name:"Dex 2",
                        attack: dexAttack,
                        damage: dmg2,
                        damageType: this.getProp("damageType2"),
                    });
                }
            }
            if(!ranged)
            {
                var dmg = genDamage("str","first");
                var dmg2 = genDamage("str","second");

                var damage2 = this.getProp("damage2");
                actions.push({
                    name:"Str",
                    attack: strAttack,
                    damage: dmg,
                    damageType: this.getProp("damageType"),
                });
                if(damage2)
                {
                    actions.push({
                        name:"Str 2",
                        attack: strAttack,
                        damage: dmg2,
                        damageType: this.getProp("damageType2"),
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
    render(obj, scope)
    {
        var render = super.render(obj);
        var detailDiv = render.find(".iExpandable");
        var actionDiv = render.find("#actions");
        actionDiv.attr("id","")
        var actions = this.getActions(obj);
        let item = this;
        if(this.subtype == "Container")
        {
            this._data.inventory = this._data.inventory || [];
            let path = scope.path||"Elements.Item";
            let ind = sync.traverse(obj.data,path).indexOf(this);
            path+="."+ind+".inventory";
            let newScope = {
                path:path,
                type:"Item",
                container:true,
            }
            let inv = sync.render("fforge_elementList")(obj,null,newScope);
            inv.addClass("flex");
            detailDiv.append(inv);
        }
        if(actions.length > 0)
        {
            for(let i =0; i < actions.length; i++)
            {
                let button = $("<button>").appendTo(actionDiv);
                let action = actions[i];
                button.text(action.name);
                button.tooltip({title:action.attack.replace(/ /g, "&nbsp;"),html:true, container: 'body'});
                button.click(function(){
                    let act = FF.buildAction(action, obj, item);
                    var uid = getCookie("UserID");
                    runCommand("chatEvent",{
                        ui:"fforge_elementCard",
                        action: act,
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
/*                button.click(function(){

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
                });*/
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


FiveForge.registerUI("weightBar", function(obj, app, scope){
    if(!obj.data.elements||!obj.data.elements.Item)
    {
        return
    }
    let div = $("<div class='flexrow'>")
    let barOut = $("<div class='flex'>").appendTo(div);

    let maxWeight = obj.data.stats.Str.current * 15;
    let curWeight = 0;
    for(var i = 0;i< obj.data.elements.Item.length; i++)
    {
        curWeight += Number(obj.data.elements.Item[i].attributes.weight.current) * Number(obj.data.elements.Item[i].attributes.quantity.current)
    }
    let perc = Math.floor(curWeight/maxWeight * 100);
    barOut.css({
        "border-radius":"5px",
        "border":"1px solid",
        "position":"relative",
        "background":"white",
    })
    let textDiv = $("<div>"+perc+"% ("+curWeight+" / "+maxWeight+"lb)</div>").appendTo(div);
    textDiv.css({
        "line-height": "10px",
        "font-size": "10px",
        "margin-left": "5px",
    })
    let bar = $("<div>").appendTo(barOut);
    bar.css({
        "position":"absolute",
        "top":0,
        "left":0,
        "width":perc+"%",
        "height":"100%",
        "background":"#333"
    })
    return div;
})