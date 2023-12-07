import Config from "webpack-chain";
import type { ApplyOpts } from "..";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ModuleNotFoundPlugin from "react-dev-utils/ModuleNotFoundPlugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import BundleAnalyzerPlugin from "webpack-bundle-analyzer";
import CopyPlugin from "copy-webpack-plugin";
import ProgressBarPlugin from "progress-bar-webpack-plugin";
import webpack from "webpack";
import fs from "fs";
import FastRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";

export default function addPlugins(config: Config, opts: ApplyOpts) {
  const { isEnvProduction, env, isEnvDevelopment, paths, fastRefresh, publicPath } =
    opts;
  config
    .plugin("ModuleNotFoundPlugin")
    .use(ModuleNotFoundPlugin, [paths.appRoot]);
  config.plugin("DefinePlugin").use(webpack.DefinePlugin, [env.stringified]);
  if (isEnvDevelopment) {
    config.plugin("CaseSensitivePathsPlugin").use(CaseSensitivePathsPlugin);
  }
  if (isEnvProduction) {
    config.plugin("mini-css-extract-plugin").use(MiniCssExtractPlugin, [
      {
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
      },
    ]);
  }
  config.plugin("WebpackManifestPlugin").use(WebpackManifestPlugin, [
    {
      fileName: "asset-manifest.json",
      publicPath,
      generate: (seed: any, files: any[], entrypoints: any) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);
        const entrypointFiles = entrypoints.main.filter(
          (fileName: string) => !fileName.endsWith(".map")
        );

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles,
        };
      },
    },
  ] as any);
  config.plugin("IgnorePlugin").use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    },
  ]);

  if (process.env.ANALYZE) {
    config.plugin("webpack-bundle-analyzer").use(BundleAnalyzerPlugin, [
      {
        analyzerMode: "server",
        analyzerPort: process.env.ANALYZE_PORT || 8888,
        openAnalyzer: false,
        logLevel: "info",
        defaultSizes: "parsed",
      },
    ]);
  }
  config.plugin("progress-bar-webpack-plugin").use(ProgressBarPlugin);

  config.plugin("CopyPlugin").use(CopyPlugin, [
    {
      patterns: [
        fs.existsSync(paths.appPublic) &&
          fs.readdirSync(paths.appPublic).length && {
            from: paths.appPublic,
            info: { minimized: true },
          },
      ],
    },
  ] as any);
  if (fastRefresh) {
    config
      .plugin("fastRefresh")
      .after("hmr")
      .use(FastRefreshPlugin, [{ overlay: false }]);
  }
}
