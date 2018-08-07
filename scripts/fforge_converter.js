/*
    fforge_converter.js

    Contains converter used for FiveForge's compendium.
*/


FiveForge.registerGlobalAction("(Dev) XML Importer", function(){

    var app = FiveForge.renderUI("xmlConverter");
    var pop = ui_popOut({
        target : $("body"),
        align : "top",
        title: "(Dev) XML Importer",
        style : {"width" : "400px", "height" : "200px"}
      },  app);

});
/*
    Util Functions

*/

var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
            blob = new Blob([data], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function countKeys(obj)
{
    let c = 0;
    for(let k in obj)
    {
        ++c;
    }
    return c;
}

function xmlToJson(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (!Array.isArray(obj[nodeName])) {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}


function fileDrop(element, callback)
{
    var files = [];

    element.bind('dragover dragleave', function(event) {
        event.stopPropagation()
        event.preventDefault()
    })

    // Catch drop event
    element.bind('drop', function(event) {
        // Stop default browser actions
        event.stopPropagation()
        event.preventDefault()

        // Get all files that are dropped
        files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files

        // Convert uploaded file to data URL and pass trought callback
        if (callback) {
            var reader = new FileReader()
            reader.onload = function(event) {
                callback(event.target.result)
            }
            reader.readAsText(files[0])
        }
        return false
    })

}

/*
    Item Parser
*/

/*
    Trait Parser
*/

let parseTraits = function(json)
{
    let elements = {};
    let rawElements = []
    /*
    Merge
    */
   console.log(json)
    for(let k in json.race)
    {
        k = json.race[k];
        rawElements = rawElements.concat(k.trait);
    }

    for(let k in json.race)
    {
        k = json.race[k];
        for(let j in k.trait)
        {
            j = k.trait[j];
            j.source = k.name
        }
        rawElements = rawElements.concat(k.trait);
    }
    for(let k in json.class)
    {
        k = json.class[k];
        for(let j in k.autolevel)
        {
            j = k.autolevel[j];
            if(!Array.isArray(j.feature))
            {
                j.feature = [j.feature];
            }
            for(let t in j.feature)
            {
                t = j.feature[t];
                if(!t){continue;}

                t.source = k.name
            }
            rawElements = rawElements.concat(j.feature);
        }
    }
    rawElements = rawElements.filter(x=> x!= undefined);
    /*
        Parse
    */
    for(let raw in rawElements)
    {
        raw = rawElements[raw];
        if(!Array.isArray(raw.text))
        {
            raw.text = [raw.text];
        }
        raw.text =  raw.text.join("<br>");
        raw.text = raw.text.replace(/Source:.+/g, ""); //Strip source, because traits repeat in many placees but are otherwise the same
        if(raw.name.indexOf("Ability Score Improvement")>=0)
        {
            continue;
        }
        let element = new FFElement({_type:"Trait"});
        element.info.name.current = raw.name;
        element.info.notes.current = raw.text;

        element.attributes.source.current = raw.source;

        if( elements[element.info.name.current]) //Conflicting names
        {
            let element2 = elements[element.info.name.current]
            let desc1 = element.info.notes.current;
            let desc2 = element2.info.notes.current;
            if(desc1 != desc2) //Check if descriptions differ
            {
                delete elements[element.info.name.current];

                element.info.name.current += "(" + raw.source + ")"; //Append source after name
                element2.info.name.current += "(" + element2.attributes.source.current + ")"; //Append source after name


                elements[element.info.name.current] = element;
                elements[element2.info.name.current] = element2;
            }

        }
        else
        {
            elements[element.info.name.current] = element;
        }
    }
    console.log(elements);
    return elements;
}

/*
    Converter UI

*/

FiveForge.registerUI("xmlConverter", function(obj, app, scope)
{
    scope = scope || {};
    let div = $("<div class='flex flexcolumn'>");
    let dropZone = $("<div class='flex lpadding'>Drop XML files here!</div>").appendTo(div);
    let buttons = $("<div class='flexrow'>").appendTo(div);

    let outputLog = "";
    function createConverter(name, func, json)
    {
        let button = $("<button class='flex'>"+name+"</button>").appendTo(buttons);
        let output = func(json);
        outputLog += "<br><b>"+name+" Elements</b>: "+ countKeys(output);
        output = 'FiveForge.Compendium[`'+name+'`] = ' + JSON.stringify(output);
        dropZone.html(outputLog);
        button.click(function(){
            saveData(output,"fforge_compendium_"+name+".js");
        });
    }


    fileDrop(dropZone,function(text){
        var json = xmlToJson(jQuery.parseXML(text)).compendium;
        dropZone.text(scope.outputText);
        createConverter("Trait", parseTraits, json)
    });


    return div;
});