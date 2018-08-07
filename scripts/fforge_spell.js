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

FiveForge.SpellTypes = [
    "Cast", //Illusion
    "Attack + Damage", //Firebolt
    "Damage Only", //Sleep
    "Attack + Save + Damage", // Fireball
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
