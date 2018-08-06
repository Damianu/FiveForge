var typeToColor =  {
    "Valuable":"#f1c40f",//Sunflower 
    "General":"#2c3e50",//Midnight blue
    "Ammunition":"#bdc3c7", //Silver
    "Ranged":"#e74c3c",//Alizarin
    "Melee":"#c0392b",//Pomegranate
    "Shield":"#3498db",//Peterriver
    "Heavy Armor":"#2980b9",//Belizehole
    "Light Armor":"#2980b9",//Belizehole
    "Medium Armor":"#2980b9",//Belizehole
    "Potion":"#9b59b6",//Amethyst
    "Wand":"#16a085",//Greensea
    "Rod":"#2ecc71",//Emerald
    "Staff":"#27ae60",//Nephiritis
    "Scroll":"#95a5a6",//Concrete
    "Artifact":"#8e44ad",//Wisteria
    "Ring":"#f39c12",//Orange
    "Container":"#7f8c8d",//Asbestos
}
sync.render("5ex_inventory", function(obj, app, scope) {
    var saveButton = $("<button class='highlight'>Save!</button>")
    saveButton.css("color","white");
    saveButton.click(function(){
        obj.sync("updateAsset");
    });
    saveButton.hide();
    if(!scope.saveButton)
    {
        scope.saveButton = saveButton;
    }
    if(!scope.inventory)
    {
        scope.inventory = obj.data.inventory;
    }
    var div = $("<div>");
    div.addClass("flex flexcolumn");
    var itemList = $("<div class='flex flexcolumn inventory'>").appendTo(div);
    itemList.css("overflow-y","auto");
    itemList.sortable(
        {
            connectWith:".inventory",
            handle: ".handle",
            appendTo: "body",
            helper:"clone",
            update: function( event, ui ) {
                var newItems = [];
                itemList.children().each(function(){
                    newItems.push($(this).data("item"));
                    $(this).data("inv",scope.inventory);
                    $(this).data("obj",obj);
                });
                scope.inventory.splice(0,scope.inventory.length)
                var weight = 0;
                for(var k in newItems)
                {
                    var it = newItems[k];
                    weight += Number(it.info.weight.current);
                    scope.inventory.push(newItems[k]);
                }
                if(scope.container)
                {
                    scope.container.info.weight.current = weight;
                    scope.weightText.text( weight+" lb");
                }
                scope.saveButton.show();
           }
        }
    );
    itemList.scroll(function()
    {
        app.attr("inv-scroll",itemList.scrollTop());
    });
    for(var k in scope.inventory)
    {
        let item = scope.inventory[k];
        let itemDiv = $("<div class='spadding white outline smooth flexcolumn'>").appendTo(itemList);
        itemDiv.data("item",item);
        itemDiv.data("inv",scope.inventory);
        itemDiv.data("obj",obj);
        itemDiv.css({
            "position":"relative",
            "padding-left":"17px",
            "flex-shrink":"0",
        })
        let itemInfo = $("<div class='flex flexrow'>").appendTo(itemDiv);
        itemInfo.css({
            "align-items":"center",
        })
        let handle=$("<div class='handle'>").appendTo(itemDiv);
        handle.css({
            "width":"10px",
            "position":"absolute",
            "left":"0",
            "top":"0",
            "bottom":"0",
            "background":"#000",
        })
        handle.css("background",typeToColor[item.info.type.current]);

        let img = $("<img>").appendTo(itemInfo);
        img.css({
            "width":"24px",
            "height":"24px",
            "pointer-events":"none",
        })
        img.attr("src",item.info.img.current);
        let name = $("<span class='flex'>").appendTo(itemInfo);
        name.append(item.info.name.current);
        name.css({
            "line-height":"24px",
            "font-size":"16px",
            "margin-left":"2px",
        })
        let quantity = $("<span>").appendTo(itemInfo);
        let x = $("<span>&nbsp;x&nbsp;</span>").appendTo(itemInfo);
        let weight =  $("<span class='5ex_weight'>").appendTo(itemInfo);
        let sendToChat = genIcon("comment").appendTo(itemInfo);
        sendToChat.css("margin-left","5px");


        let edit = genIcon("edit").appendTo(itemInfo);
        edit.css("margin-left","5px");
        let remove = genIcon("trash").appendTo(itemInfo);
        remove.click(function()
        {
            var item = itemDiv.data("item");
            var inv = itemDiv.data("inv");
            var obj = itemDiv.data("obj");
            inv.splice(inv.indexOf(item),1);
            obj.sync("updateAsset");
        });
        edit.click(function(ev)
        {
            var item = itemDiv.data("item");
            var inv = itemDiv.data("inv");
            var obj = itemDiv.data("obj");



            var frame = $("<div>");
            frame.addClass("flex flexcolumn");
            game.locals["5ex_editItem"] = game.locals["5ex_editItem"] || sync.obj("5ex_editItem");
            game.locals["5ex_editItem"].data = duplicate(item);

            var newApp = sync.newApp("5ex_itemEditor").appendTo(frame);
            game.locals["5ex_editItem"].addApp(newApp);

            var pop = ui_popOut({
              target : $(this),
              align : "top",
              id : "edit-item",
              maximize : true,
              minimize : true,
              style : {"width" : "500px", "height" : "720px"}
            }, frame);
            pop.resizable();
            ev.stopPropagation();

        });
        remove.css("margin-left","5px");
        quantity.text(item.info.quantity.current);
        weight.append("<b>"+(item.info.weight.current||0)+"</b> lb");
        weight.css(
            {
                width:"64px",
                "padding-right":"5px",
            }
        )
        quantity.css(
            {
                "font-weight":"bold",
                "text-align":"right",
                width:"20px",
            }
        )
        let actionList =  $("<div class='flex flexrow actionlist'>").appendTo(itemDiv)
        actionList.addClass("subtitle spadding");
        actionList.css({
            "min-height":"20px",
        })
        let actions = false;
        for(var k in item._a)
        {
            actions = true;
            if(item._a[k].choices)
            {
                for(let c in item._a[k].choices)
                {
                    let act = $("<button>").appendTo(actionList);
                    act.text(k+" ("+c+")");
                }
                continue;
            }
            let act = $("<button>").appendTo(actionList);
            act.text(k);
        }

        if(actions||(item.info.type&&item.info.type.current=="Container"))
        {
            itemDiv.click(function(){
                item.expanded = !item.expanded;
                $(this).find('.actionlist').toggle();
            })
            itemDiv.css("cursor","pointer");
            if(item.expanded)
            {
                actionList.show();
            }
            else
            {
                actionList.hide();
            }
        }
        else
        {
            actionList.remove();
        }
        if(item.info.type&&item.info.type.current=="Container")
        {
            if(!scope.container){
                quantity.remove();
                x.remove();
                actionList.css("background","#CCC");
                item.inventory = item.inventory||[];
                var inv = sync.render("5ex_inventory")(obj, app, {
                    container:item,
                    inventory: item.inventory,
                    saveButton:scope.saveButton,
                    weightText:weight,
                });
                inv.appendTo(actionList);
            }
            actionList.click(function(ev)
            {
                ev.stopPropagation();
            });
        }

        itemDiv.contextmenu(function(ev){
            let actions = []
            actions.push({
                name:"Split stack",
                click:function(){}
            })
            actions.push({
                name:"Drop to chat",
                click:function(){}
            })
            actions.push({
                name:"Send to chat",
                click:function(){}
            })


            ui_dropMenu($(this), actions, {id : "item-menu"});
            ev.stopPropagation();
        });
    }


    let itemDataList = $("<datalist id ='5ex_items'>").appendTo(div);

    if(!scope.container)
    {
        let bottomBar = $("<div>").appendTo(div);
        bottomBar.addClass("flexrow flexmiddle");

        bottomBar.append(saveButton);

        let newItemName = $("<input list='5ex_items' class='flex'>").appendTo(bottomBar);
        let addButton = genIcon("plus").appendTo(bottomBar)
        addButton.css({
            "width":"32px",
        })
        addButton.click(function()
        {
            let name = newItemName.val();
            let item;
            if(ex.Items[name])
            {
                item = ex.createItem(name)
            }
            else
            {
                item.info.name.current = name;
                item.info.img.current = "content/5Extended/icons/swap-bag.svg";
                item.info.quantity.current = 1;
                item.info.type = {
                    name:"Type",
                    current:"Container",
                }
            }
            scope.inventory.push(item);
            obj.sync("updateAsset");
        });
        setTimeout(function()
        {
            itemList.scrollTop(app.attr("inv-scroll"));
        },1);
    }
    else
    {
        div.css("min-height","40px");
    }
    return div;
});
