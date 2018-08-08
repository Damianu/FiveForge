

function generateCompendium()
{
    var Categories = {};
    for(let name in FiveForge.Compendium)
    {
        let category  = {}
        let c = FiveForge.Compendium[name];
        let item = c[Object.keys(c)[0]];

        Categories[name] = category;
        category._t = item._t;
        let items = [];
        for(let k in c)
        {
            items.push(duplicate(c[k]))
        }
        category.data = items;
    }
    var Compendium = {
        info : {
            name:{
                name:"Name",
                current:"FiveForge",
            },
            img: {
                name: "Art",
                current: "/content/5Extended/logo.jpg"
              },
              notes: {
                name: "Notes",
                current: ""
              },
              mode: {
                name: "Mode",
                current: ""
            }
        },

        content: Categories
    }
    FiveForge.saveData(JSON.stringify(Compendium, null, 0),"FiveForge.json");
}
FiveForge.registerGlobalAction("(Dev) Generate Compendium", generateCompendium);