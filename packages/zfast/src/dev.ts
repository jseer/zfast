import { dev } from "@zfast/webpack";
import { App } from "./app";
import { getCwd } from "@zfast/utils";
import { BaseOpts } from "./types";
import clearConsole from "react-dev-utils/clearConsole";
import openBrowser from "react-dev-utils/openBrowser";

const isInteractive = process.stdout.isTTY;

export interface DevOpts extends BaseOpts {}

export default async function (opts: DevOpts) {
  const app = await new App({
    cwd: opts.root,
    configFile: opts.configFile,
    env: "development",
    command: "dev",
  }).run();
  const {
    logger,
    config,
    paths,
    hooks,
    appData: { useTypeScript },
    cwd,
    hasJsxRuntime,
  } = app;
  const { devServer, urls } = await dev({
    cwd,
    hasJsxRuntime,
    entry: await app.getEntry(),
    paths: {
      appBuild: paths.appBuild,
      appSrc: paths.appSrc,
      appTsConfig: paths.appTsConfig,
      appRoot: paths.appRoot,
      appPublic: paths.appPublic,
      appPackageJson: paths.appPackageJson,
      yarnLockFile: paths.yarnLockFile,
      appJsConfig: paths.appJsConfig,
    },
    pkg: app.pkg,
    logger: app.logger,
    publicPath: config.publicPath,
    fastRefresh: config.fastRefresh,
    hooks: {
      chainWebpack: hooks.chainWebpack,
    },
    useTypeScript,
  });
  devServer.startCallback(() => {
    if (isInteractive) {
      clearConsole();
    }
    logger.colors.cyan("Starting the development server...\n");
    openBrowser(urls.localUrlForBrowser);
  });
  ["SIGINT", "SIGTERM"].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close();
      process.exit();
    });
  });
}
