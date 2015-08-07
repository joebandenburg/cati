var webpack = require("webpack");
var path = require("path");

module.exports = {
    target: "web",
    entry: {
        app: path.join(__dirname, "client", "client.js"),
        vendor: ["react", "react-router", "material-ui", "socket.io-client", "lodash", "core-js", "whatwg-fetch", "react-tap-event-plugin"]
    },
    output: {
        path: path.join(__dirname, "static"),
        publicPath: "http://localhost:9090/",
        filename: "[name].js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loaders: ["react-hot", "babel"] }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            compress: {
                warnings: false
            }
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new webpack.NoErrorsPlugin()
    ],
    debug: false,
    minimize: true
};
