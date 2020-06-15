const WebpackPwaManifest = require("webpack-pwa-manifest");
const { join } = require("path");

const config = {
	entry: join(__dirname + "/client-src/index.js"),
	output: {
		path: join(__dirname + "/public/dist"),
		filename: "app-bundle.js"
	},
	mode: "development",
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"]
					}
				}
			}
		]
	},
	plugins: [
		new WebpackPwaManifest({
			filename: "manifest.webmanifest",
			inject: false,
			fingerprints: false,
			name: "Budget Tracker",
			short_name: "Tracker",
			description: "Track budget and expenses on the go.",
			theme_color: "#9b59b6",
			background_color: "#192a51",
			start_url: "/",
			display: "standalone",
			publicPath: "/dist",
			icons: [
				{
					destination: "icons",
					src: join(__dirname + "/client-src/icons/icon-512x512.png"),
					sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
				}
			]
		})
	]
};
module.exports = config;
