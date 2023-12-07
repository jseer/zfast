import Config from "webpack-chain";
import { Env } from "./constants";
import webpack from "webpack";
import { App } from "@zfast/core";

export interface BaseOpts {
  chainWebpack?: {
    (memo: Config, opts: { env: Env; webpack: typeof webpack }): void;
  };
  cwd: string;
  entry: Record<string, string | string[]>;
  hasJsxRuntime?: boolean;
  paths: App["paths"];
  pkg: App["pkg"];
  logger: App["logger"];
  publicPath?: string;
}

export interface BuildOpts extends BaseOpts {
  watch?: boolean;
}

export interface DevOpts extends BaseOpts {
  fastRefresh?: boolean;
}

export type ConfigOpts = Omit<BuildOpts, "watch"> & DevOpts & {
  env: Env;
  publicPath: string;
};
