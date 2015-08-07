var webpack = require("webpack");
var path = require("path");

module.exports = {
    target: "web",
    cache: true,
    entry: {
        app: ["webpack-dev-server/client/", "webpack/hot/dev-server", path.join(__dirname, "client", "client.js")],
        vendor: ["react", "react-router", "material-ui", "socket.io-client", "lodash", "core-js", "whatwg-fetch", "react-tap-event-plugin"]
    },
    output: {
        path: path.join(__dirname, "dist"),
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    debug: true,
    devtool: "cheap-module-eval-source-map",
    devServer: {
        historyApiFallback: true,
        hot: true,
        port: 9090,
        proxy: {
            "*": "http://localhost:8080"
        }
    }
};
