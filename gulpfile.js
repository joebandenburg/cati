var gulp = require("gulp");
var gutil = require("gulp-util");
var babel = require("gulp-babel");
var merge = require("merge-stream");
var spawn = require("child_process").spawn;
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackDevConfig = require("./webpack.config");
var webpackProdConfig = require("./webpack.prod.config");
var mocha = require("gulp-mocha");
var eslint = require("gulp-eslint");
require("babel/register");

var server;

process.env.NODE_ENV = process.env.NODE_ENV || "development";
var isProduction = process.env.NODE_ENV === "production";
var webpackConfig = isProduction ? webpackProdConfig : webpackDevConfig;

gulp.task("lint", function() {
    return gulp.src(["client/**/*.js", "server/**/*.js", "test/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task("test-server", function() {
    return gulp.src("test/server/**/*.js", {read: false})
        .pipe(mocha({
            reporter: "spec",
            require: []
        }));
});

gulp.task("copy-assets", function() {
    return gulp.src("static/**/*")
        .pipe(gulp.dest("dist/public"));
});

gulp.task("copy-server-assets", function() {
    return gulp.src("server/**/*.json")
        .pipe(gulp.dest("dist/server"));
});

gulp.task("bundle", function(callback) {
    webpack(webpackConfig, function(err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("transpile", function() {
    merge(gulp.src("server/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist/server")),
        gulp.src("index.js")
        .pipe(babel())
        .pipe(gulp.dest("dist")));
});

gulp.task("server", ["test-server", "copy-server-assets", "transpile"], function() {
    if (server) server.kill();
    server = spawn("node", ["dist/index.js"], {stdio: "inherit"});
});

gulp.task("default", ["lint", "test-server", "bundle-vendor", "transpile", "copy-assets", "copy-server-assets", "bundle"]);

gulp.task("watch", ["server", "copy-assets"], function() {
    gulp.watch(["index.js", "server/**/*"], ["server"]);
    gulp.watch("test/server/**/*", ["test-server"]);
    var compiler = webpack(webpackConfig);
    new WebpackDevServer(compiler, webpackConfig.devServer).listen(webpackConfig.devServer.port, "localhost");
});
