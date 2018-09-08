/*
 * getStyleObject Plugin for jQuery JavaScript Library
 * From: http://upshots.org/?p=112
 */

function d_eval(m, context)
{
    return sync.eval(m, context)
}
(function($){
    $.fn.getStyleObject = function(){
        var dom = this.get(0);
        var style;
        var returns = {};
        if(window.getComputedStyle){
            var camelize = function(a,b){
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for(var i = 0, l = style.length; i < l; i++){
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                returns[camel] = val;
            };
            return returns;
        };
        if(style = dom.currentStyle){
            for(var prop in style){
                returns[prop] = style[prop];
            };
            return returns;
        };
        return this.css();
    }
})(jQuery);

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
function preprocess(str)
{
    return str.replace(/dui_([a-zA-Z]+)/g,"data-d$1");
}

function buildEvent(obj, app, scope, context, main)
{
    /*
        Execute Action
        Executes action with specified name and choice(optional)
    */
    var funcArray = [];
    main.children("executeaction").each(function(){
        var action = $(this).data("dname");
        var choice = $(this).data("dchoice");
        action = dFramework.getAction(obj,action);
        funcArray.push(function(){
            if(choice)
            {
                dFramework.executeActionChoice(action,choice,obj);
            }
            else
            {
                dFramework.executeAction(action,obj);
            }
        });
    });
    main.children("setAttr").each(function(){
        var name = $(this).data("dname");
        var val = $(this).data("dvalue");
        var tgtval = $(this).data("dtgtval")||"current";
        funcArray.push(function(){
            sync.traverse(context,name)[tgtval] = val;
            obj.sync("updateAsset");
        });
    });
    main.children("deleteAttr").each(function(){
        var name = $(this).data("dname");
        var tgtval = $(this).data("dtgtval")||"current";
        funcArray.push(function(){
            delete sync.traverse(context,name)[tgtval];
            obj.sync("updateAsset");
        });
    });
    main.children("roll").each(function(){
        let roll = $(this).data("droll");
        let flavor = $(this).data("dflavor");
        funcArray.push(function(){
            FiveForge.sendCharacterRoll(obj, roll, flavor);
        });
    });
    return funcArray;
}
function processEvents(obj, app, scope, context, main)
{
    /*
        DCond
        Removes element if evaluated condition isnt met.
    */
    main.find("[data-dcond]").each(function(){
        var cond = $(this).data("dcond");
        if(!d_eval(cond,context))
        {
            $(this).remove();
        }
    })
    /*
        Click
        Transforms parent into clickable object
    */
    main.find("click").each(function(){

        var element = $(this);
        var parent = element.parent();
        parent.css("cursor","pointer");
        parent.css("user-select","none");
        var funcTable = buildEvent(obj, app, scope, context, element)
        parent.click(function()
        {
            for(var i = 0;i<funcTable.length;i++)
            {
                funcTable[i]();
            }
        });
        element.remove();
    });

    /*
        UI
        Creates UI element
    */
    main.find("ui").each(function(){
        var element = $(this);
        var newScope = {}
        element.children("scope").each(function()
        {
            if($(this).data("dpass"))
            {
                newScope[$(this).data('dname')] = sync.traverse(context, $(this).data("dpass"));
            }
            else
            {
                newScope[$(this).data('dname')] = $(this).data("dvalue");
            }
        })


        var newElement = sync.render(element.data("dname"))(obj, app, newScope);
        if(!newElement)
        {
            newElement = $("<div> No app :( </div>")
        }
        newElement.attr("class", element.attr("class"))
        newElement.attr("id", element.attr("id"))
        newElement.attr("style", element.attr("style"))
        newElement.attr("data-dscroll", element.attr("data-dscroll"))
        element.replaceWith(newElement)
    });

    /*
        DEdit
        Makes this element editable field
    */
    main.find("[data-dedit]").each(function(){
        var el = $(this);
        var tgt = el.data("dedit");
        var val = sync.traverse(context,tgt)
        var tgtval = el.data("deditval")||"current";
        if(!el.is("input"))
        {
            el.html(val[tgtval]);
            if(el.html().trim().replace("\n","")=="")
            {
                el.css({
                    "min-width":"1em",
                    "min-height":"1em",
                    "display":"inline-block",
                    "border-bottom":"1px solid",
                })

            }
        }
        else
        {
            if(el.attr("type")=="checkbox")
            {
                el.prop("checked",val[tgtval]);
            }
            el.val(val[tgtval]);
        }

    })
}
var _classCounter = 1;
var _cssCache = {};
var dui_style = $("<div style='display:none' id='dui_style'>");
$("body").append(dui_style);
//$('<script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/3.7.1/less.min.js" ></script>').appendTo($("head"))

function processHTML(obj, app, scope, context, html,main)
{
    html = preprocess(html);
    html = html.replace(/src/g,"_temp_src");

    main.html(html);
    var style = main.find("style");
    _classCounter

    var mainClass = "";
    if(style.length > 0)
    {
        var css = main.find("style").text();
        if(_cssCache[css])
        {
            mainClass = _cssCache[css];
        }
        else
        {
            var numb = _classCounter++;
            var id = "dui_style_"+(numb);
            _cssCache[css] = id; 
            css = "."+id+" {" + css + "}";


            less.render(css)
            .then(function(output) {
                dui_style.append("<style>"+output.css+"</style>");
            },
          function(error){
              main.html("Failed to parse css! <b>"+error+"</b>");
          });

            mainClass = id;
        }
        style.remove();
    }

    /*
        Loop
        Gets replaced with elements of array specified as lookup, replaces %key% with index of current element.
    */
    main.find("loop").each(function(){
        var element = $(this);
        var parent = element.parent();

        var entryHTML = element.html();

        var key = $(this).data("dkey")
        var keyonly = $(this).data("dkeyonly")
        var count = $(this).data("dcount");
        var target = $(this).data("dlookup")
        var target_scope = $(this).data("dlookupscope")
        var newElements = [];
        if(count)
        {
            var start = $(this).data("dstart")||0;
            element.html("");
            for(var i=start;i<(start+count);i++)
            {
                var re = new RegExp(escapeRegExp("%"+key+"%"), "g");
                var newHTML = entryHTML.replace(re,i);
                var newElement = $(newHTML)
                newElements.push(newElement);
                newHTML = newElement.html();
                processHTML(obj, app, scope, context, newHTML,newElement);
            }

        }
        else if(target)
        {
            var loopin = sync.traverse(context,target);
            element.html("");
            for(k in loopin)
            {
                var re = new RegExp(escapeRegExp("%"+key+"%"), "g");
                var newHTML = entryHTML.replace(re,target+"."+k);

                re = new RegExp(escapeRegExp("%"+keyonly+"%"), "g");
                newHTML = newHTML.replace(re,k);


                var newElement = $(newHTML);
                newElements.push(newElement);
                newHTML = newElement.html();
                processHTML(obj, app, scope, context, newHTML,newElement);
            }
        }
        else if(target_scope)
        {
            var loopin = sync.traverse(scope,target_scope);
            element.html("");
            for(k in loopin)
            {
                var re = new RegExp(escapeRegExp("%"+key+"%"), "g");
                var newHTML = entryHTML.replace(re,target_scope+"."+k);

                re = new RegExp(escapeRegExp("%"+keyonly+"%"), "g");
                newHTML = newHTML.replace(re,k);


                var newElement = $(newHTML);
                newElements.push(newElement);
                newHTML = newElement.html();
                processHTML(obj, app, scope, context, newHTML,newElement);
            }
        }
        element.replaceWith(newElements);
    });
    html = main.html();
    html = html.replace(/traverse{([^}]+)}/g,function(off,m) {return sync.traverse(context,m);})
    html = html.replace(/scope{([^}]+)}/g,function(off,m) {return sync.traverse(scope,m);})
    html = html.replace(/eval{([^}]+)}/g,function(off,m) {return d_eval(m,context);})
    html = html.replace(/_temp_src/g,"src");
    main.html(html);

    return mainClass;
}

var scrolls = {};
var heights = {};
FiveForge.buildDUI = function(html, obj, context, app, scope)
{
    var main = $("<div>");
    main.css("position","relative");
    main.addClass("flex flexrow");
    var scope = scope || {}
    var mainClass = processHTML(obj, app, scope, context, html,main);
    processEvents(obj, app, scope, context, main)
    main.on('click', '[data-dedit]', function(){
        var el = $(this);
        el.attr('contenteditable','true');
        var tgt = el.data("dedit");
        var val = sync.traverse(context,tgt)
        var tgtval = el.data("deditval")||"current";

        let mathMode = false;
        if(_down[16])
        {
            let _oldBorder = el.css("border");
            mathMode = true;
            el.css("border", "1px dashed red")
            el.one('blur', function() {
                el.css("border",_oldBorder);
            })
        }


        if(el.is("input"))
        {
            el.change(function(){
                if(el.attr("type")=="checkbox")
                {
                    val[tgtval] = el.prop("checked")?1:0;
                    obj.sync("updateAsset")
                }
                else
                {
                    if(mathMode)
                    {
                        val[tgtval] = sync.eval(el.val(), context)

                    }
                    else
                    {
                        val[tgtval] = el.val();
                    }
                    obj.sync("updateAsset")
                }
            });
        }
        else
        {
            var save = function(){
                el.attr('contenteditable','false');
                let newVal = el.html();
                if(mathMode)
                {
                    val[tgtval] = sync.eval(newVal, context)
                }
                else
                {
                    val[tgtval] = newVal;
                }
                obj.sync("updateAsset")
            };
            el.keydown(function (ev) {
                if (ev.keyCode == 13) {
                    save();
                    ev.preventDefault();
                    ev.stopPropagation();
                }
              });
            el.one('blur', save).focus();
        }
    });
    main.find("[data-dtooltip]").each(function(){
        var text = $(this).data("dtooltip");
        if($(this).data("dtooltip_nowrap"))
        {
            text = text.replace(/ /g,"&nbsp;");
        }
        $(this).tooltip({title:text,html:true,container: 'body'});
    })
    main.find("[data-dscroll]").each(function(){
        var uid = obj._uid;
        let elem = $(this);
        if(uid)
        {
            let id = $(this).data("dscroll")
            scrolls[uid] = scrolls[uid] || {};
            elem.attr("_lastScrollTop",scrolls[uid][id])
            $(this).scroll(function(){
                scrolls[uid][id] = $(this).scrollTop();
            })
        }
    })
    main.find("[data-dresizable]").each(function(){
        $(this).resizable({"handles":$(this).data("dresizable")});
    })
    main.find("[data-dkeepheight]").each(function(){
        var uid = obj._uid;
        let elem = $(this);
        if(uid)
        {
            let id = $(this).data("dkeepheight")
            heights[uid] = heights[uid] || {};
            $(this).height(heights[uid][id]);
            $(this).resize(function(){
                heights[uid][id] = $(this).height();
            })
        }
    })
    main.addClass(mainClass);
    return main;
}
