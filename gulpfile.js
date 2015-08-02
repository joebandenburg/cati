var gulp = require("gulp");
var babel = require("gulp-babel");
var merge = require("merge-stream");
var spawn = require("child_process").spawn;
var browserify = require("browserify");
var watchify = require("watchify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var assign = require("lodash").assign;
var uglify = require("gulp-uglify");
var envify = require("envify");
var babelify = require("babelify");
var resolve = require("resolve");
var server;

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = process.env.NODE_ENV === "production";

var browersifyOpts = {
    entries: ["client/client.js"],
    transform: [babelify, envify],
    debug: true
};
browersifyOpts = assign({}, watchify.args, browersifyOpts);

var bify = browserify(browersifyOpts)
    .external("react")
    .external("react-router")
    .external("material-ui")
    .external("socket.io-client")
    .external("lodash");

gulp.task("copy-assets", function() {
    return gulp.src("static/**/*")
        .pipe(gulp.dest("dist/public"));
});

gulp.task("copy-server-assets", function() {
    return gulp.src("server/**/*.json")
        .pipe(gulp.dest("dist/server"));
});

gulp.task("bundle-vendor", function() {
    var p = browserify({
            transform: [babelify, envify],
            debug: !isProduction
        })
        .require(resolve.sync("react/addons"), { expose: "react" })
        .require(resolve.sync("react-router"), { expose: "react-router" })
        .require(resolve.sync("material-ui"), { expose: "material-ui" })
        .require(resolve.sync("socket.io-client"), { expose: "socket.io-client" })
        .require(resolve.sync("lodash"), { expose: "lodash" })
        .add("client/vendor.js")
        .transform(envify, { global: true })
        .bundle()
        .pipe(source("lib.js"));
    if (isProduction) {
        p = p.pipe(buffer())
            .pipe(uglify());
    }
    return p.pipe(gulp.dest("dist/public"));
});

gulp.task("bundle", function() {
    return bify
        .bundle()
        .on("error", console.log.bind(console, "Browserify Error"))
        .pipe(source("app.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest("dist/public"));
});

gulp.task("transpile", function() {
    merge(gulp.src("server/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist/server")),
        gulp.src("index.js")
        .pipe(babel())
        .pipe(gulp.dest("dist")));
});

gulp.task("server", ["copy-server-assets", "transpile"], function() {
    if (server) server.kill();
    server = spawn("node", ["dist/index.js"], {stdio: "inherit"});
});

gulp.task("default", ["bundle-vendor", "transpile", "copy-assets", "copy-server-assets", "bundle"]);

gulp.task("watch", ["server", "copy-assets"], function() {
    gulp.watch(["index.js", "server/**/*"], ["server"]);
    gulp.watch("static/**/*", ["copy-assets"]);
    var w = watchify(bify);
    w.on("update", function() {
            w.bundle()
                .on("error", console.log.bind(console, "Browserify Error"))
                .pipe(source("app.js"))
                .pipe(gulp.dest("dist/public"));
        })
        .on("log", console.log.bind(console))
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulp.dest("dist/public"));
});
