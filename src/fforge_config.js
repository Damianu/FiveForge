let defaultCFG = {
    "debugEnabled":"0",
}


let configID = undefined;
FF.Config = {
    get(_, name)
    {
        return getEnt(configID).data.cfg[name]
    },
    set(_, name, val)
    {
        let ent = getEnt(configID)
        ent.data.cfg[name] = val;
        FF.log(`CFG: ${name} = ${val}`)
        ent.sync("updateAsset");
        hook.call("fforge_OnConfigChange", name, val)
        return true;
    }
}
FF.addHook("Initialize",function(){
    FF.log("Looking for config..")
    for(let k in game.entities.data)
    {
        let ent = game.entities.data[k].data;
        if(ent._t == "fforge_config")
        {
            configID = k;
        }
    }
    if(configID === undefined)
    {
        var data = {
            info: {
                name:{
                    current:"FiveForge's Config"
                },
                notes: {current: ""},
                img : { current: ""},
            },
            cfg:defaultCFG,
            _t: "fforge_config",
        }
        runCommand("createEntity", data)
        FF.log("Config not found, creating config entity.");
        for(let k in game.entities.data)
        {
            let ent = game.entities.data[k].data;
            if(ent._t == "fforge_config")
            {
                configID = k;
            }
        }
        FF.log("Config ID:" + configID)
    }
    else
    {
        FF.log("Config found, entity ID:" + configID);
    }
})
FF.Config = new Proxy(FF.Config, FF.Config);