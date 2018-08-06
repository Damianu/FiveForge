"use strict";
class FFEntity
{
    construct(obj)
    {
        this.obj = obj;
        this._data = obj.data;
        return new Proxy(this, this)
    }
    get(_, prop)
    {
        var p = this[prop];
        if(p===undefined)
        {
            return this.obj[prop];
        }
        return p;
    }
    set(_, prop, val)
    {
        var p = this[prop];
        if(p===undefined)
        {
            this.obj[prop] = val;;
            return;
        }
        this[prop] = val;
    }

    get data()
    {
        this.calcData();
        return this._data;
    }
    calcData()
    {
    }
    getElements(type)
    {
        var elements = [];
        var raw = this.data.elements[type];
        for(var i=0;i<raw.length;i++)
        {
            elements.push(FiveForge.createElement(raw[i]));
        }
        return this.data.elements[type];
    }
    removeElement(elem)
    {
        var type = elem._type;
        this.data.elements = this.data.elements || {};
        this.data.elements[type] = this.data.elements[type] || [];
        this.data.elements[type].splice(this.data.elements[type].indexOf(elem),1);
    }
    addElement(elem)
    {
        var type = elem._type;
        this.data.elements = this.data.elements || {};
        this.data.elements[type] = this.data.elements[type] || [];
        this.data.elements[type].push(elem);
    }
}