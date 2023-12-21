import Config from "webpack-chain";
import { Env } from "../constants";
import path from "path";
import { createHash } from "crypto";
import getClientEnvironment from "./env";
import fs from "fs";
import addRules from "./rules";
import addPlugins from "./plugins";
import webpack from "webpack";
import { ConfigOpts } from "../typing";

export interface ApplyOpts {
  isEnvDevelopment: boolean;
  isEnvProduction: boolean;
  shouldUseSourceMap: boolean;
  env: ReturnType<typeof getClientEnvironment>;
  paths: ConfigOpts["paths"];
  hasJsxRuntime: ConfigOpts["hasJsxRuntime"];
  cwd: ConfigOpts["cwd"];
  publicPath: ConfigOpts["publicPath"];
  fastRefresh: ConfigOpts["fastRefresh"];
}

const createEnvironmentHash = (env: Record<string, string>) => {
  const hash = createHash("md5");
  hash.update(JSON.stringify(env));
  return hash.digest("hex");
};

export async function getConfig(opts: ConfigOpts) {
  const { paths, hooks, useTypeScript } = opts;
  const config = new Config();
  const isEnvDevelopment = opts.env === Env.development;
  const isEnvProduction = opts.env === Env.production;
  const env = getClientEnvironment(opts.publicPath.slice(0, -1));
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

  config.stats("errors-warnings");
  config.mode(isEnvProduction ? "production" : "development");
  config.bail(isEnvProduction);
  config.set("performance", false);
  config.devtool(
    isEnvProduction
      ? shouldUseSourceMap
        ? "source-map"
        : false
      : isEnvDevelopment && "cheap-module-source-map"
  );

  Object.keys(opts.entry).forEach((key) => {
    const entry = config.entry(key);
    const item = opts.entry[key];
    if (Array.isArray(item)) {
      entry.merge(item);
    } else {
      entry.add(item);
    }
  });

  config.output
    .path(paths.appBuild)
    .pathinfo(isEnvDevelopment)
    .filename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/bundle.js"
    )
    .chunkFilename(
      isEnvProduction
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js"
    )
    .set("assetModuleFilename", `static/media/[name].[hash][ext]`)
    .publicPath(opts.publicPath)
    .devtoolModuleFilenameTemplate(
      isEnvProduction
        ? (info: { absoluteResourcePath: string }) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, "/")
        : isEnvDevelopment &&
            ((info: { absoluteResourcePath: string }) =>
              path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"))
    );

  config.cache({
    type: "filesystem",
    version: createEnvironmentHash({
      env: opts.env,
      version: require("../../package.json").version,
    }),
    cacheDirectory: path.resolve(opts.cwd, "node_modules/.cache/webpack"),
    store: "pack",
    buildDependencies: {
      defaultWebpack: ["webpack/lib/"],
      config: [__filename],
      tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
        fs.existsSync(f)
      ),
    },
  });
  config.set("infrastructureLogging", {
    level: "error", // todo
  });

  config.resolve.modules
    .add("node_modules")
    .end()
    .extensions.merge(
      [
        "web.mjs",
        "mjs",
        "web.js",
        "js",
        "web.ts",
        "ts",
        "web.tsx",
        "tsx",
        "json",
        "web.jsx",
        "jsx",
      ]
        .map((ext) => `.${ext}`)
        .filter((ext) => useTypeScript || !ext.includes("ts"))
    )
    .end()
    .alias.merge({})
    .end();

  const applyOpts = {
    isEnvDevelopment,
    isEnvProduction,
    shouldUseSourceMap,
    env,
    cwd: opts.cwd,
    paths,
    hasJsxRuntime: opts.hasJsxRuntime,
    publicPath: opts.publicPath,
    fastRefresh: opts.fastRefresh,
  };
  addRules(config, applyOpts);
  // react-refresh

  addPlugins(config, applyOpts);

  if (hooks?.chainWebpack) {
    await hooks.chainWebpack.call(config, {
      env: opts.env,
      webpack,
    });
  }

  const webpackConfig = config.toConfig();
  // fs.writeFileSync(path.resolve(opts.cwd, '.webpack-config.json'), JSON.stringify(webpackConfig, null, 4))
  return webpackConfig;
}
