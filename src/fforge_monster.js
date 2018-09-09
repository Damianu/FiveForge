/*
    >>> CLASS <<<
*/
class FFMonster extends FFActor
{
    get template()
    {
        return "monster";
    }
    render(app, ...args)
    {
        let r = super.render(app, ...args);
        let setimg = r.find("#set-image");
        let obj = this._obj;
        let data = this._data;
        setimg.click(function(){
            var imgList = sync.render("ui_filePicker")(this._obj, app, {
                filter : "img",
                change : function(ev, ui, val){
                    data.info.img.current = val;
                    obj.sync("updateAsset");
                    layout.coverlay("icons-picker");
                }
              });
              var pop = ui_popOut({
                target : app,
                prompt : true,
                id : "icons-picker",
                align : "top",
                style : {"width" : assetTypes["filePicker"].width, "height" : assetTypes["filePicker"].height}
            }, imgList);
        })
        setimg.attr("id","")
        return r;
    }
}

FFMonster.setupType("Monster");