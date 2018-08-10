/*
    >>> CLASS <<<
*/
class FFMonsterTrait extends FFElement
{
    get template()
    {
        return "monsterTrait"
    }
    render(obj)
    {
        let render = super.render(obj);
        let actionsRow = render.find("#actions");
        actionsRow.attr("id","");
        for(let i = 0; i < this._data.attributes.attacks.current.length; i++)
        {
            let action = this._data.attributes.attacks.current[i];
            let button = $("<button>"+action.name+"</button>");
            button.click(function(){
                FiveForge.sendCharacterRoll(obj, action.value, "Attack for " + action.name)
            })
            button.appendTo(actionsRow);
        }

        for(let i = 0; i < this._data.attributes.damages.current.length; i++)
        {
            let action = this._data.attributes.damages.current[i];
            let button = $("<button class='highlight' style='color:white'>"+action.name+"</button>");
            button.click(function(){
                FiveForge.sendCharacterRoll(obj, action.value, "Damage for " + action.name)
            })
            button.appendTo(actionsRow);
        }

        return render;
    }
}
/*
    >>> SETUP <<<
*/
FFMonsterTrait.setupType("MonsterTrait");
FFMonsterTrait.registerAttribute("reaction","Reaction","checkbox", "0")
FFMonsterTrait.registerAttribute("legendary","Legendary","checkbox", "0")

FFMonsterTrait.registerAttribute("attacks","Attacks","modifierEdit", [])
FFMonsterTrait.registerAttribute("damages","Damages","modifierEdit", [])