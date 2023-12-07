import { BaseOpts } from "@zfast/webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import InlineChunkHtmlPlugin from "react-dev-utils/InlineChunkHtmlPlugin";
import path from "path";

const chainWebpack: BaseOpts["chainWebpack"] = (config, { env }) => {
  const isEnvProduction = env === "production";
  config.plugin("html-webpack-plugin").use(HtmlWebpackPlugin, [
    Object.assign(
      {},
      {
        inject: true,
        template: path.resolve(__dirname, "../../tpl/index.html"),
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
};

export default chainWebpack;
