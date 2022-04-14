require("dotenv").config();

const process = require("process");
const path = require("path");
const express = require("express");
const session = require("express-session");
const exphrs = require("express-handlebars");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const { logger, stream } = require("./config/logging");
const indexRouter = require("./routes/index");

const DIRNAME = path.resolve();
const PORT = process.env.EXPRESS_PORT||3000;

const app = express();
const hrs = exphrs.create({
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
app.set('views', path.join(DIRNAME, "views"));
app.enable('view cache');

// Error Handler
// app.use((req, res, next)=>{
//     const err = new Error("Not Found");
//     err.status = 404;
//     next(err);
// });
// app.use((err, req, res)=>{
//     res.locals.message = err.message;
//     res.locals.error = req.app.get("env") === "development" ? err : {};
//     res.status(err.status || 500);
//     res.render("error");
// });

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
app.use("/", indexRouter);

// Run Server
app.listen(PORT, ()=>{
    logger.info(`port: ${PORT}`);
});