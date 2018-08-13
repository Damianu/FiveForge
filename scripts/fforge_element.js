"use strict";


FiveForge.DamageTypes = [
    "Acid",
    "Bludgeoning",
    "Cold",
    "Fire",
    "Force",
    "Lightning",
    "Necrotic",
    "Piercing",
    "Poison",
    "Psychic",
    "Radiant",
    "Slashing",
    "Thunder",
]
FiveForge.ItemTypes = [
    "Generic",
    "Weapon",
    "Armor",
    "Container",
    "Spellcasting",
]
FiveForge.ItemEditableAttributes = {}
FiveForge.ElementTemplates = {}


class FFElement
{
    constructor(data)
    {
        if(data)
        {
            if(data._fillWith)
            {
                $.extend(data, FiveForge.Compendium[data._fillWith][data.info.name.current]);
                delete data["_fillWith"]
            }
            if(data instanceof FFElement)
            {
                return data;
            }
            if(FFElement.types[data._type] === undefined)
            {
                data._type = "Item";
            }
            var type = FFElement.types[data._type]
            var element = new type();
            for(var k in data.attributes)
            {
                data.attributes[k].editType = undefined;
            }
            element._data = $.extend(true, {}, type.dataTemplate, data);
            //console.log(element._data);
            return new Proxy(element, element);
        }
    }
    get (target, prop) {
        var p = this[prop]
        if(p!==undefined)
        {
            return p;
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
        this._data[prop] = val;
        return true;
    }
    getProp(name)
    {
        //console.log(name);
        return this._data.attributes[name].current;
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

    renderCard(obj)
    {
        return FiveForge.renderTemplate("elements/"+this.cardTemplate, obj, obj)
    }
    render(obj)
    {
        return FiveForge.renderTemplate("elements/"+this.template, obj, this._data)
    }
    getEditableAttributes()
    {
        return this.attributes;
    }

    static setupType(name, t)
    {
        t = t || this;
        FFElement.types = FFElement.types || {}
        FiveForge.Compendium[name] = FiveForge.Compendium[name] || {};
        FFElement.types[name] = t;
        t._class = name;
        t.dataTemplate = {
            _t: "i",
            _type: name,
            info:
            {
                name:{
                    name:"Name",
                    current:"Name",
                    editType:"text",
                },
                notes:
                {
                    name:"Notes",
                    current:"",
                    editType:"longText"
                },
                img:
                {
                    name:"Icon",
                    current:"/content/FiveForge/icons/swap-bag.svg",
                    editType:"iconPicker",
                }
            },
            attributes:
            {
            },
            tags:
            {
            }
        }
    }
    static registerAttribute(name, fancyName, type, def)
    {
        this.dataTemplate.attributes[name] =
        {
            name: fancyName,
            editType: type,
            current: def,
        }
    }
}
FFElement.prototype.toJSON = function()
{
    return this._data;
}




FiveForge.registerUI("elementCard", function(obj,app,scope)
{
    let elem = new FFElement(obj.element);
    return elem.renderCard(obj)
//    var element = new FFElement(obj.element);
});

FiveForge.registerUI("elementList", function(obj,app,scope)
{
    var div = $("<div class='flexcolumn'>");
    var list = $("<div class='flexcolumn'>").appendTo(div);
    if(scope.container)
    {
        list.css({
            "min-height":"20px",
        })
    }
    scope.type = scope.type || "Item";
    scope.path = scope.path || "elements."+scope.type;
    let elements = sync.traverse(obj.data, scope.path);
    for(var i = 0; i<elements.length;i++)
    {
        let e = elements[i];
        e._type = e._type || "Item";
        e = new FFElement(e);
        elements[i] = e;
        e.expanded = e.expanded||{name:"",current:0}
        var render = e.render(obj, scope);
        list.append(render);
        render.data("element", e);
        render.find(".editElement").first().click(function(){
            FiveForge.createElementEditor(e, function(newData){
                e._data = newData;
                obj.sync("updateAsset");
            })
        });
        render.find(".removeElement").first().click(function(){
            elements.splice(elements.indexOf(e),1)
            obj.sync("updateAsset");
        });
        render.addClass("fforge_elementData");
    }
    if(!scope.container)
    {
        var spacer = $("<div class='flex' style='margin-top:15px'>").appendTo(div)
        var addDiv = $("<div class='flexrow'>").appendTo(div)
        var addName = $("<input class='flex' list= 'fforge_"+scope.type+"'>").appendTo(addDiv)
        var addButton = $("<button class='cAddElement'>+"+scope.type+"</button>").appendTo(addDiv);
        addButton.click(function(){
            var name = addName.val();
            var compItem = FiveForge.Compendium[scope.type][name]||{};
            compItem._type = scope.type;
            var item = new FFElement(compItem);
            item.info.name.current = name;
            elements.push(item);
            obj.sync("updateAsset");
        });
    }
    let className = "elementList_"+scope.type+"_"+obj.id();
    list.addClass(className);
    list.sortable({
        handle: ".handle",
        connectWith:"."+className,
        appendTo: document.body,
        "helper": "clone",
        //containment:list,
        update:function()
        {
            var newElements = [];
            list.children().each(function(){
                newElements.push($(this).data("element"));
            });
            elements.length = 0;
            $.merge(elements,newElements);
            if(scope.container)
            {

            }
            else
            {
                setTimeout(function(){
                    obj.sync("updateAsset");
                })
            }
        }
      });
    return div;
});