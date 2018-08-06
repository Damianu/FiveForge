/*
    >>> CLASS <<<
*/
class FFSpell extends FFElement
{
    get template()
    {
        return "spell"
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
/*
    >>> SETUP <<<
*/
FFSpell.setupType("Spell");
FFSpell.registerAttribute("classes","Classes","text")
FFSpell.registerAttribute("level","Level",FiveForge.SpellLevels, 1)
FFSpell.registerAttribute("components","Components","text","V, S, M")
FFSpell.registerAttribute("materials","Materials","text","spider web")
