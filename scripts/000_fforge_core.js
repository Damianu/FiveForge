"use strict";

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
    VERSION:"indev",
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
            var handle = FiveForge.renderTemplate(template, obj, data, app);
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
    renderTemplate:function(name, obj, context, app)
    {
        if(context === undefined)
        {
            context = obj.data;
        }
        if(!templateCache[name])
        {
            console.log("Invalid template:",name);
            return $("<div>Invalid template ("+name+")!</div>");
        }
        return FiveForge.buildDUI(templateCache[name], obj, context, app);

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
        templateCache[name] = "_LOADING_";
        $.get(FiveForge.HTML_PATH+"/"+name+".html")
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
    log:function(txt)
    {
        console.log("FiveForge:",txt);
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

        FiveForge.log("Initialized");
    },
    registerGlobalAction: function(name, func)
    {
        _globalActions.push({
            name: name,
            func: func,
        })
    }
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
    frame.hide();
}


FiveForge.addHook("Initialize",checkLoad)

/*
    Templates
*/

FiveForge.includeTemplate("manager");
FiveForge.includeTemplate("characterSheet");
FiveForge.includeTemplate("elementEditor");
FiveForge.includeTemplate("roll");
FiveForge.includeTemplate("installer");

//Elements
FiveForge.includeTemplate("elements/item");
FiveForge.includeTemplate("elements/trait");
FiveForge.includeTemplate("elements/spell");

FiveForge.includeTemplate("elements/itemCard");
FiveForge.includeTemplate("elements/spellCard");

//Global styles
FiveForge.includeStyle("fforge_fonts.less");
