import Config from "webpack-chain";
import { Env } from "./constants";
import webpack from "webpack";
import { App } from "@zfast/core";
import type { AsyncSeriesHook } from "kooh";

export interface BaseOpts {
  cwd: string;
  entry: Record<string, string | string[]>;
  hasJsxRuntime?: boolean;
  pkg: App["pkg"];
  logger: App["logger"];
  publicPath?: string;
  hooks?: {
    chainWebpack: AsyncSeriesHook<
      [Config, { env: Env; webpack: typeof webpack }]
    >;
  };
  useTypeScript?: boolean;
}

export interface BuildOpts extends BaseOpts {
  watch?: boolean;
  paths: {
    appBuild: string;
    appSrc: string;
    appTsConfig: string;
    appPublic: string;
    appJsConfig: string;
    appRoot: string;
  };
}

export interface DevOpts extends BaseOpts {
  fastRefresh?: boolean;
  paths: {
    appBuild: string;
    appSrc: string;
    appTsConfig: string;
    appRoot: string;
    appPublic: string;
    appPackageJson: string;
    yarnLockFile: string;
    appJsConfig: string;
  };
}

export type ConfigOpts = BaseOpts & {
  fastRefresh?: DevOpts["fastRefresh"];
  paths: {
    appBuild: string;
    appSrc: string;
    appTsConfig: string;
    appPublic: string;
    appJsConfig: string;
    appRoot: string;
  };
  env: Env;
  publicPath: string;
};

export { webpack };
