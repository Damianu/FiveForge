"use strict";

class FFActor
{
    constructor(obj)
    {
        if(obj)
        {
            let data;
            if(obj.data)
            {
                data = obj.data;
            }
            else
            {
                data = obj;
                obj = undefined;
            }
            if(data)
            {
                if(data._fillWith)
                {
                    $.extend(data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
                    delete data["_fillWith"]
                }
                if(data instanceof FFActor)
                {
                    return data;
                }
                if(FFActor.types[data._type] === undefined)
                {
                    data._type = "Character";
                }
                var type = FFActor.types[data._type]
                var actor = new type();
                actor._data = data;
                actor._obj = obj;
                let cp = duplicate(data);
                $.extend(true, actor._data, game.templates.actors[data._type], cp);
                actor.setup();
                return new Proxy(actor, actor);
            }
        }
    }

    setup()
    {

    }

    get (target, prop) {
        var p = this[prop]
        if(p!==undefined)
        {
            return p;
        }
        else
        {
            p = this._obj[prop];
            if(p!==undefined)
            {
                return p;
            }
        }
        this.calcData();
        return this._data[prop];
    }
    set (target, prop, val) {
        if(this[prop]!==undefined)
        {
            this[prop] = val;
            return true;
        }
        else if(this._obj[prop]!==undefined)
        {
            this._obj[prop] = val;
            return true;
        }
        this._data[prop] = val;
        return true;
    }
    calcData()
    {

    }
    get template()
    {
        return "invalid";
    }
    get cardTemplate()
    {
        return "invalid";
    }


    get type()
    {
        return this._data._type;
    }

    render(app, scope)
    {
        let data = this._data;
        let obj = this._obj;

        if(data._fillWith)
        {
            let flags = data._flags;
            $.extend(true, data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
            data._flags = flags;
            delete data["_fillWith"]
        }

        if(data._version == "NEW_CHARACTER")
        {
            data._version = game.templates.FiveForge.VERSION;
        }
        if(data._version!=game.templates.FiveForge.VERSION)
        {
            var cp = duplicate(data);
            $.extend(true, data, game.templates.actors["Monster"], cp);
            data._version = game.templates.FiveForge.VERSION;
            console.log("Updated data on character "+data.info.name.current)
            obj.sync("updateAsset");
            return $("<div>Working..</div>");
        }
        for(var k in FFElement.types)
        {
            if(obj.data.elements[k]===undefined)
            {
                obj.data.elements[k]=[];
            }
        }
        if(!app.attr("sizeFixed"))
        {
            setTimeout(function(){
                app.parent().parent().parent().height("950px");
                app.parent().parent().parent().width("850px");
            });
            app.attr("sizeFixed",true)
        }
        if(this._obj.data !== this._data)
        {
            console.log("DESYNC in FFActor! This should NOT happen.")
            return $("<div> Critical desync </div>");
        }
        let sheet = FiveForge.renderTemplate("actors/"+this.template, this._obj, this._data, app);
        FF.addDebugMenu(sheet, {
            "OBJ > Console": function(){
                FiveForge.log(obj)
            },
            "Force Update": function(){
                obj.data._version = "FORCE_UPDATE";
                obj.sync("updateAsset")
            },
        })

        var selectAbility = sheet.find("#spellAbilitySelect")
        selectAbility.attr("id",null);
        for(var val in FiveForge.Abilities)
        {
            let name = FiveForge.Abilities[val];
            var option = $("<option>");
            option.val(val).text(name)
            option.appendTo(selectAbility);
        }
        selectAbility.val(obj.data.info.spellcastingAbility.current)
        selectAbility.change(function(){
            obj.data.info.spellcastingAbility.current = selectAbility.val();;
            obj.sync("updateAsset");
        })
        return sheet;
    }

    static setupType(name, t)
    {
        t = t || this;
        FFActor.types = FFActor.types || {}
        FiveForge.Compendium[name] = FiveForge.Compendium[name] || {};
        FFActor.types[name] = t;
        t._class = name;
    }
}
FFActor.prototype.toJSON = function()
{
    return this._data;
}