const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

const devCertsPath = path.join(require("os").homedir(), ".office-addin-dev-certs");

module.exports = {
  entry: {
    taskpane: "./src/taskpane/taskpane.js",
    commands: "./src/commands/commands.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "taskpane.html",
      template: "./src/taskpane/taskpane.html",
      chunks: ["taskpane"],
    }),
    new HtmlWebpackPlugin({
      filename: "commands.html",
      template: "./src/commands/commands.html",
      chunks: ["commands"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "assets", to: "assets" },
        { from: "manifest.xml", to: "manifest.xml" },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    server: {
      type: "https",
      options: fs.existsSync(path.join(devCertsPath, "localhost.key"))
        ? {
            key: fs.readFileSync(path.join(devCertsPath, "localhost.key")),
            cert: fs.readFileSync(path.join(devCertsPath, "localhost.crt")),
            ca: fs.readFileSync(path.join(devCertsPath, "ca.crt")),
          }
        : {},
    },
    port: 3000,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
};
