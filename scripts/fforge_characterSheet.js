FiveForge.Abilities = {
    "Str":"Strength",
    "Dex":"Dexterity",
    "Con":"Constitution",
    "Int":"Int",
    "Wis":"Wisdom",
    "Cha":"Charisma",
}

//TODO: move it to actorSheet

FiveForge.registerUI("characterSheet", function(obj,app,scope)
{
    return new FFActor(obj).render(app,scope);
});


FiveForge.registerUI("monsterSheet", function(obj,app,scope)
{
    return new FFActor(obj).render(app,scope);
});