import WebpackDevServer from "webpack-dev-server";
import evalSourceMapMiddleware from "react-dev-utils/evalSourceMapMiddleware";
import ignoredFiles from "react-dev-utils/ignoredFiles";
import redirectServedPath from "react-dev-utils/redirectServedPathMiddleware";
import { Urls } from "react-dev-utils/WebpackDevServerUtils";
import { App } from "@zfast/core";
import getHttpsConfig from "./getHttpsConfig";
import { Logger } from "@zfast/utils";

const host = process.env.HOST || "0.0.0.0";
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

export default function (
  proxy: WebpackDevServer.ProxyConfigArray,
  allowedHost: string | undefined,
  {
    paths,
    publicPath,
    logger,
    fastRefresh,
  }: { paths: App["paths"]; publicPath: string; logger: Logger; fastRefresh?: boolean }
) : WebpackDevServer.Configuration {
  const disableFirewall =
    !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === "true";
  return {
    allowedHosts: disableFirewall || !allowedHost ? "all" : [allowedHost],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
    compress: true,
    static: {
      directory: paths.appPublic,
      publicPath: [publicPath],
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    client: {
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      publicPath: publicPath.slice(0, -1),
    },

    https: getHttpsConfig(logger, paths),
    host,
    historyApiFallback: {
      disableDotRule: true,
      index: publicPath,
    },
    proxy,
    hot: fastRefresh,
    onBeforeSetupMiddleware(devServer: any) {
      devServer.app.use(evalSourceMapMiddleware(devServer));
    },
    onAfterSetupMiddleware(devServer: any) {
      devServer.app.use(redirectServedPath(publicPath));
    },
  };
}
