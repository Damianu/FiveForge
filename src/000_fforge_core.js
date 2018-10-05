//"use strict";

/*
    Locals
*/
let _hookCount = 0;
let templateCache = {}
let _globalActions = [];
/*
    Framework
*/
let MOD_PATH = "/workshop/FiveForge"
const FiveForge = {
    VERSION:"Beta 1.1.28",
    PREFIX:"fforge_",
    IDENTIFIER:"FiveForge",
    CSS_PATH:MOD_PATH+"/css",
    HTML_PATH:MOD_PATH+"/html",
    Compendium: {},
    /*
        UI FUNCTIONS
    */
    getSound(name)
    {
        if(name=="sword")
        {
            var rand = Math.floor((Math.random() * 3) + 1);
            return "fforge_sounds/sword_swing_"+rand+".mp3";
        }
        return "";
    },
    registerUI:function(name,func)
    {
        console.log("register",FiveForge.PREFIX+name);
        return sync.render(FiveForge.PREFIX+name,func)
    },
    registerHTMLUI:function(name, template, func)
    {
        FiveForge.registerUI(name, function(obj, app, scope){
            var data = obj.data || obj;
            var handle = FiveForge.renderTemplate(template, obj, data, app, scope);
            $("body").append(handle);
            func(handle, obj, app, scope);
            return handle;
        })
    },
    renderUI:function(name,obj,app,scope)
    {
        return sync.render(FiveForge.PREFIX+name)(obj,app,scope);
    },
    newApp:function(name,...args)
    {
        console.log(FiveForge.PREFIX+name)
        return sync.newApp(FiveForge.PREFIX+name,...args);
    },
    renderTemplate:function(name, obj, context, app, scope)
    {
        if(context === undefined)
        {
            context = obj.data;
        }
        if(!templateCache[name])
        {
            FiveForge.includeTemplate(name);
            if(!templateCache[name])
            {
                console.log("Invalid template:",name);
                return $("<div>Invalid template ("+name+")!</div>");
            }
        }
        return FiveForge.buildDUI(templateCache[name], obj, context, app, scope);

    },
    includeStyle:function(name)
    {
        let path = FiveForge.CSS_PATH+"/"+name;
        var container = $("#fforge_hiddencontainer");
        let rel = 'rel="stylesheet"';
        if(name.indexOf(".less") >= 0)
        {
            rel = 'rel="stylesheet/less"';
        }
        $('<link '+rel+' type="text/css" href="'+path+'">').appendTo($("head"));
    },
    includeTemplate:function(name)
    {
        $.get({
            url:FiveForge.HTML_PATH+"/"+name+".html",
            async:false,
        })
        .done(function(html) {
            templateCache[name] = html;
            FiveForge.log("Loaded template:"+name);
        })
        .fail(function() {
            FiveForge.log("Failed to load template:"+name);
        });
    },
    /*
        HOOK FUNCTIONS
    */
    addHook:function(name,identifier,func)
    {
        if(func==undefined)
        {
            func = identifier
            identifier = FiveForge.PREFIX+"_"+(_hookCount++);
        }
        hook.add(name,FiveForge.PREFIX+identifier,func);
    },

    /*
        Utils
    */
    log:function(...txt)
    {
        console.log("FiveForge:", ...txt);
    },
    sendCharacterRoll(obj, query, flavor)
    {
        var uid = getCookie("UserID");
        runCommand("chatEvent",
        {
            person : obj.data.info.name.current,
            icon : obj.data.info.img.current,
            flavor : flavor,
            user : game.players.data[uid].displayName,
            ui: "fforge_roll",
            roll: FiveForge.simpleEval(query),
            userID : uid,
            audio: "sounds/dice.mp3",
      })
    },
    simpleEval:function(query)
    {
        var dices = [];
        query = query.replace(window.diceRegex, function(m){
            var res = sync.evalDice(m);
            res.replace(/[0-9]+/g, function(m2){
                var match = /[dD][0-9]+/g.exec(m);
                dices.push({dice:match[0], roll:m2});
                return m2;
            });
            return res  + "["+m+"]";
        });
        var diceOnly = query;

        query = query.replace(/\[.*?\]/g,"");
        var full = sync.eval(query);
        return {diceOnly:diceOnly, total:full, dices:dices}
    },

    registerGlobalAction: function(name, func, debugOnly = true)
    {
        _globalActions.push({
            name: name,
            func: func,
            debugOnly: debugOnly,
        })
    },
    getSelectedCharacters: function()
    {
        let list = [];
        for(var k in boardApi.selections)
        {
            var ent = this.tokenToCharacter(boardApi.selections[k])
            if(ent&&ent.data._t == "c")
            {
                list.push(ent)
            }
        }
        return list;
    },
    tokenToCharacter: function(token)
    {
        var board = getEnt(token.board);
        return game.entities.data[board.data.layers[token.layer].p[token.index].eID];
    },
    isDebugEnabled()
    {
        return FiveForge.Config["debugEnabled"] != false //force boolean return
    },

    addDebugMenu: function(app, actions)
    {
        if(!FiveForge.isDebugEnabled())
        {
            return;
        }
        let icon = $("<span class='glyphicon glyphicon-wrench highlighted'>")
        icon.css({
            "position":"absolute",
            "right":"5px",
            "top":"5px",
        });

        icon.click(function(){
            let actionList = [];
            for(let k in actions)
            {
                actionList.push({name: k, click:actions[k]});
            }
            ui_dropMenu($(this), actionList, {});
        })
        app.css("position","relative");
        app.append(icon);
    },
    wrap:function(obj)
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
        if(data._t == "c")
        {
            return new FFActor(obj || data);
        }
        else if(data._t == "i")
        {
            return new FFElement(data);
        }
    },
    /*
        Events
    */
   init:function()
   {
       const less = {
           env:"development",
           errorReporting:"console",

       }
       var container = $("#fforge_hiddencontainer");

       setTimeout(function(){

            $.getScript( "/scripts/lazy/fforge_compendium_Player.js", function( data, textStatus, jqxhr ) {
                FiveForge.log("Loaded player compendiums.")
                for(var k in FiveForge.Compendium)
                {
                    var datalist = $("<datalist id='fforge_"+k+"'>");
                    for(var e in FiveForge.Compendium[k])
                    {
                        var option = $("<option>").appendTo(datalist);
                        option.val(e);
                    }
                    datalist.appendTo(container);
                }
            })

            if(hasSecurity(getCookie("UserID"), "Assistant Master"))
            {
                $.getScript( "/scripts/lazy/fforge_compendium_Monster.js", function( data, textStatus, jqxhr ) {
                    FiveForge.log("Loaded monster compendium.")
                    FiveForge.lazyLoadDone = true;
                })
                console.log("Updating curVersion!")
                FF.Config["curVersion"] = FF.VERSION;

            }
            else if(FF.Config["curVersion"] != FF.VERSION)
            {
                let validVer = FF.Config["curVersion"];
                console.log(">>>>>>>",validVer)
                let warning = $(`<div>FiveForge version check failed, clear cache and refresh!<br>Your Version:${FF.VERSION}<br>Host Version:${validVer}</div>`);
                warning.css({
                    "position":"fixed",
                    "width":"100%",
                    "text-align":"center",
                    "background":"red",
                    "border":"2px black solid",
                    "top":"0",
                    "z-index":"99999"
                })
                warning.appendTo($("body"));
            }
            hook.call("fforge_Initialized");
            FiveForge.log("Initialized");
            game.debug = FF.Config["debugEnabled"];
        })
   },
}
FiveForge.saveData = (function () {
    let a = document.createElement("a");
    a.style = "display: none";
    return function (data, fileName) {
        let blob = new Blob([data], {type: "octet/stream"});
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

$('<script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/3.7.1/less.min.js" ></script>').appendTo($("head"))

FiveForge.registerHTMLUI("core","manager",function(handle, obj,app,scope) {
    FiveForge.init();
    var buttonMenu = handle.find("#buttons");
    buttonMenu.attr("id", null);
    for(var i =0; i< _globalActions.length; i++)
    {
        let action = _globalActions[i];
        if(action.debugOnly && !FiveForge.isDebugEnabled())
        {
            continue;
        }
        let button = $("<button>").appendTo(buttonMenu);
        button.text(action.name);
        button.click(action.func);
    }
    var icons = $("<div>").appendTo(handle);
/*    for( var k in FiveForge.icons)
    {
        var icon = "/content/FiveForge/icons/"+FiveForge.icons[k];
        if(icon.toLowerCase().indexOf("abstract")<0){continue;}
        var img = $("<img src='"+icon+"'>").appendTo(icons);
        img.css({width:"32px",height:"32px"})
    }*/
});

function checkLoad()
{
    var loading = false;
    for(var k in templateCache)
    {
        if(templateCache[k] == "_LOADING_")
        {
            loading = true;
        }
    }
    if(loading)
    {
        setTimeout(checkLoad, 1000);
        return;
    }
    FiveForge.log("Templates loaded!");

    let currentGame = game.templates.identifier;
    if(currentGame!=FiveForge.IDENTIFIER)
    {
        //return;
    }
    setTimeout(function(){ // Wait for config
        let frame = $("<div>");
        frame.addClass("flex flexcolumn");
        game.locals["FiveForgeCore"] = sync.obj("FiveForgeCore");
    
        let newApp = sync.newApp("fforge_core",game.locals["FiveForgeCore"]).appendTo(frame);
        game.locals["FiveForgeCore"].addApp(newApp);
    
        frame.appendTo("body");
        frame.css({
            "position":"fixed",
            "right":"0",
            "top":"30px",
            "z-index":"1000",
            "background":"white",
            "border":"1px solid",
            "border-top":"none",
        });
        let button = $("<button class='highlight'>FiveForge</button>").appendTo("body");
        button.css({
            "top":"0",
            "right":"0",
            "position":"fixed",
            "color":"white",
            "z-index":"1000",
            "height":"30px",
        })
        button.click(function(){
            frame.toggle();
        });
        button.contextmenu(function(){
            button.hide();
        });
        frame.hide();
    })
}


FiveForge.addHook("Initialize",checkLoad)

//Global styles
FiveForge.includeStyle("fforge_fonts.less");

//Alias
const FF = FiveForge