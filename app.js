import process from "process";
import path from "path";
import express from "express";
import session from "express-session";
import { create as exphrs } from "express-handlebars";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import flash from "connect-flash/lib/flash";
import methodOverride from "method-override";
import dotenv from "dotenv";
import { logger, stream } from "./config/logging";
import {
    mainRouter
} from "./routes";
import createError from "http-errors";

dotenv.config();

const DIRNAME = path.resolve();
const PORT = process.env.EXPRESS_PORT||3000;

const app = express();
const hrs = exphrs({
    extname: "hbs", // layout ext
    defaultLayout: "main",
    layoutsDir: path.join(DIRNAME, "views/layouts/"),
    partialsDir: path.join(DIRNAME, "/views/partials/"),
    helpers : {
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
    }
});

// Set View
app.engine(".hbs", hrs.engine);
app.set("view engine", ".hbs"); // views ext
app.set('views', path.join(DIRNAME, "views/routes"));
app.enable('view cache');

// Set bodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set logging
app.use(morgan('combined', { stream }));
// app.use(morgan("dev"));

// Set session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
}));
app.use(cookieParser());
app.use(flash()); // 휘발성 메시지 처리
app.use(methodOverride()); // RESTful PUT/DELETE 등 처리

// Set statics
app.use(express.static(path.join(DIRNAME, "public")));
app.use("/bootstrap", express.static(path.join(DIRNAME,"/node_modules/bootstrap/dist")));
app.use(favicon(path.join(DIRNAME, "public", "favicon.ico")));

// Set Routes
app.use("/", mainRouter);

// Error Handler
app.use((req, res, next)=>{
    next(createError(404, "Not Found"));
});
app.use((err, req, res)=>{
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

// Run Server
app.listen(PORT, ()=>{
    logger.info(`port: ${PORT}`);
});
