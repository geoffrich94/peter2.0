const path = require("path");

module.exports = {
  entry: "./main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: "glslify-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json", ".glsl"],
  },
  devServer: {
    contentBase: "./dist",
  },
};
