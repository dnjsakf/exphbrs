import path from "path";
import dotenv from "dotenv";
import process from "process";
import express from "express";
import session from "express-session";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import morgan from "morgan";
import flash from "connect-flash/lib/flash";
import methodOverride from "method-override";
import compression from "compression";

import passport from "./src/config/passport";
import hrs from "./src/config/exphbs";
import { logger, stream } from "./src/config/logging";

import { mainRouter, authRouter } from "./src/routes";

dotenv.config({
    path: ".env.real"
});

const app = express();

// Set variables
app.set("port", parseInt(process.env.EXPRESS_PORT||3000));

// Set compression, .gzip
app.use(compression());

// Set view
app.engine(".hbs", hrs.engine);
app.set("view engine", ".hbs"); // views ext
app.set('views', path.join(__dirname, "src/views/routes"));
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
    secret: process.env.EXPRESS_COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
}));
app.use(cookieParser());
app.use(flash()); // 휘발성 메시지 처리
app.use(methodOverride()); // RESTful PUT/DELETE 등 처리

// Set statics
app.use("public", express.static(path.join(__dirname, "src/public")));
app.use("/bootstrap", express.static(path.join(__dirname,"node_modules/bootstrap/dist")));
app.use("/axios", express.static(path.join(__dirname,"node_modules/axios/dist")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Set passport
app.use(passport.initialize());
app.use(passport.session());

// Set Routes
app.use("/", mainRouter);
app.use("/auth", authRouter);

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
app.listen(app.get("port"), ()=>{
    logger.info(`port: ${app.get("port")}`);
});
