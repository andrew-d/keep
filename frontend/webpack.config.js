var path = require('path'),
    webpack = require('webpack');

var env = ["NODE_ENV", "NODE_DEBUG"].reduce(function(accum, k) {
    accum[k] = JSON.stringify(process.env[k] || "");
    return accum;
}, {});


module.exports = {
    // Main file that includes everything else
    entry: "./src/Bootstrap.jsx",
    target: "web",
    debug: true,
    cache: true,
    watch: false,       // We're watching in Gulp

    output: {
        path: path.join(__dirname, "dist", "assets"),
        publicPath: "/assets/",

        filename: "bundle.js",
        chunkFilename: "[chunkhash].js"
    },

    devtool: "source-map",

    module: {
        loaders: [
            { test: /\.css/, loader: "style-loader!css-loader" },

            // Inline images <10K
            { test: /\.gif/, loader: "url-loader?limit=10000&minetype=image/gif" },
            { test: /\.jpg/, loader: "url-loader?limit=10000&minetype=image/jpg" },
            { test: /\.png/, loader: "url-loader?limit=10000&minetype=image/png" },

            // Process JSX with some ES6 features
            { test: /\.jsx$/, loader: "jsx-loader?harmony" },
            { test: /\.json$/, loader: "json" },
        ],

        noParse: /\.min\.(css|js)/,
    },

    resolve: {
        // Where to resolve from.
        modulesDirectories: ["node_modules", "bower_components"],

        // Extensions that require('filename') will try, in order.
        extensions: ['', '.js', '.json', '.jsx'],
    },

    plugins: [
        // Should be first
        new webpack.ResolverPlugin(
            // Read the "main" field from any bower.json
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
        ),

        // Insert environment variables into 'process.env'
        new webpack.DefinePlugin({
            "process.env": env,
        }),
    ],
};
