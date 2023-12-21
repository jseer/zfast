import fs from "fs";
import {
  Urls,
  choosePort,
  prepareProxy,
  createCompiler,
  prepareUrls,
} from "react-dev-utils/WebpackDevServerUtils";
import { DevOpts } from "./typing";
import { createDebugger } from "@zfast/utils";
import { getConfig } from "./config";
import { Env } from "./constants";
import getPublicPath from "./utils/getPublishPath";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import createDevServerConfig from "./dev/webpackDevServer.config";

export async function dev(opts: DevOpts): Promise<{
  devServer: WebpackDevServer;
  urls: Urls;
}> {
  const debug = createDebugger("@zfast/webpack:dev");
  const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const protocol = process.env.HTTPS === "true" ? "https" : "http";
  const HOST = process.env.HOST || "0.0.0.0";
  const port = await choosePort(HOST, DEFAULT_PORT);
  if (port == null) {
    debug("port is null");
    return Promise.reject("cancel to found port");
  }
  const { paths, logger, publicPath: userPublicPath, pkg, fastRefresh, hooks, useTypeScript } = opts;
  const publicPath = getPublicPath(
    Env.production,
    pkg.homepage,
    userPublicPath
  );
  const appName = require(paths.appPackageJson).name;
  const urls = prepareUrls(protocol, HOST, port);
  const useYarn = fs.existsSync(paths.yarnLockFile);

  const config = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    hooks,
    entry: opts.entry,
    paths,
    hasJsxRuntime: opts.hasJsxRuntime,
    pkg,
    logger,
    publicPath,
    fastRefresh,
  });
  // let compiler: webpack.Compiler;
  // try {
  //   compiler = webpack(config);
  // } catch (err: any) {
  //   logger.error("Failed to compile.");
  //   console.log();
  //   logger.error(err.message || err);
  //   console.log();
  //   process.exit(1);
  // }
  const compiler = createCompiler({
    appName,
    config,
    urls,
    useYarn,
    useTypeScript,
    webpack,
  } as any);
  const proxySetting = pkg.proxy;
  const proxyConfig = prepareProxy(proxySetting, paths.appPublic, publicPath);
  const serverConfig = {
    ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig, {
      paths,
      publicPath,
      logger,
      fastRefresh,
    }),
    host: HOST,
    port,
  };
  const devServer = new WebpackDevServer(serverConfig, compiler as any);
  return { devServer, urls };
}
