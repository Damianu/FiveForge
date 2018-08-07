FiveForge.createElementEditor = function(data, callback)
{
    game.locals["fforge_elementEditor"] = game.locals["fforge_elementEditor"] || sync.obj("fforge_elementEditor");
    game.locals["fforge_elementEditor"].data = new FFElement(duplicate(data));
    game.locals["fforge_elementEditor"].callback = callback;

    var newApp = FiveForge.newApp("elementEditor");
    game.locals["fforge_elementEditor"].addApp(newApp);

    var pop = ui_popOut({
        target : $("body"),
        align : "top",
        id : "edit-item",
        maximize : true,
        minimize : true,
        title: "Element Editor: "+data._type,
        style : {"width" : "500px", "height" : "700px"}
      }, newApp);
    game.locals["fforge_elementEditor"].popout = pop;
    game.locals["fforge_elementEditor"].update();
    pop.resizable();
}
var EditFields = {
    number: function(target, obj)
    {
        var select = $('<input class="flex" type="number" />');
        select.val(target.current);
        select.change(function()
        {
            target.current = select.val();
            obj.sync("updateAsset");
        });
        return select;
    },
    text: function(target, obj)
    {
        var select = $('<input class="flex" type="text" />');
        select.val(target.current);
        select.change(function()
        {
            target.current = select.val();
            obj.sync("updateAsset");
        });
        return select;
    },
    checkbox: function(target, obj)
    {
        var select = $('<input type="checkbox" />');
        select.prop("checked",target.current == 1);
        select.change(function()
        {
            target.current = select.prop("checked")?1:0;
            obj.sync("updateAsset");
        });
        return select;
    },
    modifierEdit: function(target, obj)
    {
        return sync.render("fforge_modifierEdit")(obj, null, {target:target.current, autoEnabled:true})
    }
}


FiveForge.registerHTMLUI("elementEditor", "elementEditor", function(handle, obj,app,scope)
{
    let properties = handle.find(".eProperties");
    let data = new FFElement(obj.data);
    let checkboxes = [];
    var attrs = data.getEditableAttributes()
    for(var k in attrs)
    {
        if(!attrs[k]){continue;}
        let prop = data.attributes[k];
        //console.log("Prop > ",prop, "K>",k);
        if(prop.editType == "checkbox")
        {
            checkboxes.push(prop);
            continue;
        }
        let propDiv = $("<div class='flexrow eProperty'>").appendTo(properties);
        let propName = $("<div class='flex ePropertyName'>"+prop.name+"</div>").appendTo(propDiv);
        let propValue = $("<div class='flex flexrow ePropertyValue'></div>").appendTo(propDiv);
        if(prop.editType instanceof Array)
        {
            let select = $("<select class='flex'>").appendTo(propValue);
            for(var i = 0; i< prop.editType.length; i++)
            {
                var option = $("<option>").appendTo(select);
                option.val(prop.editType[i]).text(prop.editType[i])
            }
            select.val(prop.current);
            select.change(function()
            {
                prop.current = select.val();
                obj.sync("updateAsset");
            });
        }
        else if(prop.editType instanceof Object)
        {
            let select = $("<select class='flex'>").appendTo(propValue);
            for(var k in prop.editType)
            {
                var option = $("<option>").appendTo(select);
                option.val(k).text(prop.editType[k])
            }
            select.val(prop.current);
            select.change(function()
            {
                prop.current = select.val();
                obj.sync("updateAsset");
            });
        }
        else if( prop.editType == "hidden")
        {
            propDiv.remove();
            continue;
        }
        else
        {
            EditFields[prop.editType||"text"](prop, obj).appendTo(propValue);
        }
    }
    if(checkboxes.length > 0)
    {
        var checks = $("<div class='flexrow flexwrap' style='justify-content:space-around'>").appendTo(properties);
        for(var i = 0; i < checkboxes.length; i++)
        {
            var prop = checkboxes[i];
            let propDiv = $("<div class='flexrow eProperty2' style='max-width:50%'>").appendTo(checks);
            let propName = $("<div class='flex ePropertyName'>"+prop.name+"</div>").appendTo(propDiv);
            let propValue = $("<div class='flexrow'></div>").appendTo(propDiv);
            EditFields[prop.editType](prop, obj).appendTo(propValue);
        }
    }
    handle.find(".eTabButton").click(function() {
        var tab = $(this).data("tab");

        app.attr("selected-tab",tab);

        handle.find(".eTabButton").removeClass("tabSelected");
        $(this).addClass("tabSelected");
        handle.find(".eTab").each(function(){
            if($(this).data("tab") == tab)
            {
                $(this).addClass("tabSelected");
            }
            else
            {
                $(this).removeClass("tabSelected");
            } 
        })
    })
    handle.find(".eTabButton").each(function(){
        var tab = $(this).data("tab");
        if(tab ==  app.attr("selected-tab"))
        {
            $(this).click();
        }
    })
    handle.find(".eTagAdd").click(function(){
        var name = handle.find(".eTagAddInput").val();
        if(name&&name.length > 0)
        {
            obj.data.tags[name] = true;
            obj.sync("updateAsset");
        }
    })
    var confirm = handle.find("#confirm");
    confirm.click(function(){
        obj.popout.remove();
        obj.callback(data._data);
    })
})

FiveForge.registerUI("modifierEdit",function(obj,app,scope){
    var path = scope.path||"damageModifiers"
    var target = scope.target || sync.traverse(obj.data, path);
    var modifiers = target

    var list = $("<div class='flex flexcolumn' style='padding-bottom:5px'>");
    for(let i=0;i<modifiers.length;i++)
    {
        let mod = modifiers[i];
        var bonus = $("<div class='flexrow'>").appendTo(list);
        var toggle = $("<input type='checkbox'>").appendTo(bonus);
        toggle.attr("checked",mod.enabled?true:undefined);
        var name = $("<input class='line'>").appendTo(bonus);
        name.val(mod.name);
        var value = $("<input class='line'>").appendTo(bonus);
        value.val(mod.value);
        var remove = $("<span class='glyphicon glyphicon-remove'>").appendTo(bonus);
        remove.css(
            {
                "display":"block",
                "width":"10%",
                "height": "21px",
                "line-height": "21px",
                "cursor":"pointer",
            }
        )
        name.change(function(){
            mod.name = $(this).val();
            obj.sync("updateAsset");
        })
        value.change(function(){
            mod.value = $(this).val();
            obj.sync("updateAsset");
        })
        remove.click(function(){
            modifiers.splice(i, 1);
            obj.sync("updateAsset");
        })
        toggle.click(function(){
            mod.enabled = $(this).prop("checked");
            obj.sync("updateAsset");
        })
        toggle.css("width","10%");
        if(!scope.autoEnabled)
        {
            name.css("width","45%");
        }
        value.css({"width":"30%","margin-left":"5px","text-align":"center"});
        bonus.css("margin-top","2px");
        if(scope.autoEnabled)
        {
            toggle.remove();
        }
    }
    var add = $("<span class='glyphicon glyphicon-plus'>").appendTo(list);
    add.click(function(){
        modifiers.push({
            name:"",
            value:"",
            enabled:scope.autoEnabled?1:0,
        })
        obj.sync("updateAsset");
    })
    add.css({"margin-top":"5px","cursor":"pointer"});
    return list;
})

sync.render("ui_renderItemv22",function(obj, app, scope){
    console.log(obj,app,scope);
});