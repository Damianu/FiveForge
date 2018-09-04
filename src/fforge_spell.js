/*
    >>> CLASS <<<
*/
class FFSpell extends FFElement
{
    get template()
    {
        return "spell"
    }
    get cardTemplate()
    {
        return "spellCard";
    }
    getActions(obj)
    {
        let actions = [];
        var attack = {
            name:"Cast",
            roll: "",
        }
        var prof = obj.data.counters.proficiency.current;
        var spellAb = obj.data.info.spellcastingAbility.current;
        var statBonus = obj.data.stats[spellAb].bonus;

        if(this._data.attributes.spellType.current.indexOf("Attack") >= 0)
        {
            attack.roll = "d20 + " + statBonus + "["+spellAb+"] + " + prof + "[Proficiency]";
        }
        actions.push(attack);
        let damages = this._data.attributes.damage.current;
        for(let i = 0; i< damages.length; i++)
        {
            let damage = damages[i];
            actions.push({
                name: damage.name,
                roll: damage.value,
            })
        }
        return actions;
    }
    render(obj)
    {
        let render = super.render(obj);
        let detailDiv = render.find(".iExpandable");
        let actions = this.getActions(obj);
        let spell = this;
        if(actions.length > 0)
        {
            let actionDiv = $("<div class='iActions'>").appendTo(detailDiv);
            for(let i =0; i < actions.length; i++)
            {
                let button = $("<button>").appendTo(actionDiv);
                let action = actions[i];
                button.text(action.name);
                button.tooltip({title:action.roll, container: 'body'});
                var uid = getCookie("UserID");
                let spellData =  duplicate(spell._data);
                spellData.attributes.classes.current = (spellData.attributes.classes.current || "").replace(/,/g,",<br>");
                button.click(function(){
                    if(action.name == "Cast")
                    {
                        let rolls = false;
                        if(action.roll)
                        {
                            rolls = [];
                            for(let i=0; i < 2; i++)
                            {
                                rolls.push(FiveForge.simpleEval(action.roll));
                            }
                        }
                            runCommand("chatEvent",{
                                ui:"fforge_elementCard",
                                rolls: rolls,
                                element: spellData,
                                person : obj.data.info.name.current,
                                icon : obj.data.info.img.current,
                                user : game.players.data[uid].displayName,
                            })
                    }
                    else
                    {
                        FiveForge.sendCharacterRoll(obj, action.roll, "Rolls damage for " + spellData.info.name.current);
                    }
                })
            }
        }
        return render;
    }
}
FiveForge.SpellLevels = {}
FiveForge.SpellLevels[0] = "Cantrip";
FiveForge.SpellLevels[1] = "1";
FiveForge.SpellLevels[2] = "2";
FiveForge.SpellLevels[3] = "3";
FiveForge.SpellLevels[4] = "4";
FiveForge.SpellLevels[5] = "5";
FiveForge.SpellLevels[6] = "6";
FiveForge.SpellLevels[7] = "7";
FiveForge.SpellLevels[8] = "8";
FiveForge.SpellLevels[9] = "9";
FiveForge.SpellLevels[10] = "10";

FiveForge.SpellTypes = [
    "Cast", //Illusion
    "Attack + Damage", //Firebolt
    "Damage Only", //Sleep
    "Save + Damage", // Fireball
]

FiveForge.SpellSchools = [
    "Abjuration",
    "Enchantment",
    "Conjuration",
    "Illusion",
    "Transmutation",
    "Divination",
    "Necromancy",
    "Evocation",
]

/*
    >>> SETUP <<<
*/
FFSpell.setupType("Spell");
FFSpell.registerAttribute("spellType","Type",FiveForge.SpellTypes, "Cast")
FFSpell.registerAttribute("school","School",FiveForge.SpellSchools, "Abjuration")
FFSpell.registerAttribute("level","Level",FiveForge.SpellLevels, 1)
FFSpell.registerAttribute("components","Components","text","")
FFSpell.registerAttribute("materials","Materials","text","")
FFSpell.registerAttribute("classes","Classes","text")
FFSpell.registerAttribute("time","Cast Time","text", "1 action")
FFSpell.registerAttribute("duration","Duration","text", "")
FFSpell.registerAttribute("range","Range","text", "0")
FFSpell.registerAttribute("saveAbility","Save Ability","text", "Dexterity")
FFSpell.registerAttribute("damage","Damage","modifierEdit", [])


FFSpell.registerAttribute("ritual","Ritual","checkbox", "0")
FFSpell.registerAttribute("prepared","Prepared","checkbox", "0")

