import crypto from "crypto";
import HtmlWebpackPlugin from "html-webpack-plugin";
import InlineChunkHtmlPlugin from "react-dev-utils/InlineChunkHtmlPlugin";
import path, { dirname } from "path";
import { IPlugin } from "@zfast/core";
import App from "../app";

const hook: IPlugin<App> = ({ hooks, paths }) => {
  hooks.chainWebpack.add(async (config, { env }) => {
    // html
    const isEnvProduction = env === "production";
    config.plugin("html-webpack-plugin").use(HtmlWebpackPlugin, [
      Object.assign(
        {},
        {
          inject: true,
          template: path.resolve(__dirname, "../tpl/index.html"),
        },
        isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined
      ),
    ]);
    config
      .plugin("InlineChunkHtmlPlugin")
      .use(InlineChunkHtmlPlugin, [
        HtmlWebpackPlugin,
        [/runtime-.+[.]js/],
      ] as any);

    // alias
    config.resolve.alias.merge({
      zfast: "@@/exports",
      "@": paths.appSrc,
      "@@": paths.appTemp,
      react: dirname(require.resolve("react/package.json")),
      "react-dom": dirname(require.resolve("react-dom/package.json")),
      "react-router-dom": dirname(
        require.resolve("react-router-dom/package.json")
      ),
      "@remix-run/router": dirname(
        require.resolve("@remix-run/router/package.json")
      ),
    });

    // codeSplitting
    const FRAMEWORK_BUNDLES = [
      "react-dom",
      "react",
      "history",
      "react-router",
      "@remix-run/router",
      "react-router-dom",
      "scheduler",
    ];
    // config.optimization.splitChunks({
    //   cacheGroups: {
    //     default: false,
    //     defaultVendors: false,
    //     vendors: {
    //       name: "vendors",
    //       chunks: "all",
    //       test: new RegExp(
    //         `[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(`|`)})[\\\\/]`
    //       ),
    //       priority: 40,
    //       enforce: true,
    //     },
    //     shared: {
    //       name(_module: any, chunks: any) {
    //         const cryptoName = crypto
    //           .createHash("sha1")
    //           .update(
    //             chunks.reduce((acc: any, chunk: any) => {
    //               return acc + chunk.name;
    //             }, "")
    //           )
    //           .digest("base64")
    //           .replace(/\//g, "")
    //           .replace(/\+/g, "-")
    //           .replace(/=/g, "_");
    //         return `shared-${cryptoName}`;
    //       },
    //       priority: 10,
    //       minChunks: 2,
    //       reuseExistingChunk: true,
    //       chunks: "async",
    //     },
    //   },
    // });
  });
};

export default hook;