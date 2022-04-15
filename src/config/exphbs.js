import path from "path";
import { create as exphrs } from "express-handlebars";

const helpers = {
    addScript(name, options){
        this._body = this._body||{}
        this._body[name] = options.fn(this);
        return null;
    },
    eachItems(length, className, options){
        const items = [];
        items.push("<ul>");
        for(let i=1; i<=length; i++){
            items.push(options.fn({
                rn: i,
                className: className+"-"+i
            }));
        }
        items.push("</ul>");
        return items.join("\n");
    }
};

const hrs = exphrs({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "../views/layouts/"),
    partialsDir: path.join(__dirname, "../views/partials/"),
    helpers: helpers
});

export default hrs;