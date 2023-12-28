import { dev } from "@zfast/webpack";
import { App } from "./app";
import { getCwd } from "@zfast/utils";
import { BaseOpts } from "./types";
import clearConsole from "react-dev-utils/clearConsole";
import openBrowser from "react-dev-utils/openBrowser";

const isInteractive = process.stdout.isTTY;

export interface DevOpts extends BaseOpts {}

export default async function (opts: DevOpts) {
  const cwd = getCwd(opts.root);
  const app = new App({
    cwd,
    configFile: opts.configFile,
    env: "development",
    command: "dev",
  });
  await app.run();
  const { logger, config, paths, hooks, appData: { useTypeScript } } = app;
  const { devServer, urls } = await dev({
    cwd: app.cwd,
    hasJsxRuntime: app.hasJsxRuntime,
    entry: app.getEntry(),
    paths,
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
