import { dev } from "@zfast/webpack";
import App from "./app";
import getCwd from "./utils/getCwd";
import { DEFAULT_CONFIG_FILES } from "./constants";
import chainWebpack from "./utils/chainWebpack";
import { BaseOpts } from "./types";
import clearConsole from "react-dev-utils/clearConsole";
import openBrowser from "react-dev-utils/openBrowser";

const isInteractive = process.stdout.isTTY;

export interface DevOpts extends BaseOpts {}

export default async function (opts: DevOpts) {
  const cwd = getCwd(opts.root);
  const app = new App({
    cwd,
    defaultConfigFiles: DEFAULT_CONFIG_FILES,
    configFile: opts.configFile,
    env: "development",
    command: "dev",
  });
  const { devServer, urls } = await dev({
    cwd: app.cwd,
    hasJsxRuntime: app.hasJsxRuntime,
    entry: app.getEntry(),
    paths: app.paths,
    pkg: app.pkg,
    chainWebpack,
    logger: app.logger,
    publicPath: app.userConfig.publicPath,
    fastRefresh: app.userConfig.fastRefresh,
  });
  devServer.startCallback(() => {
    if (isInteractive) {
      clearConsole();
    }
    app.logger.colors.cyan("Starting the development server...\n");
    openBrowser(urls.localUrlForBrowser);
  });
  ["SIGINT", "SIGTERM"].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close();
      process.exit();
    });
  });
}
