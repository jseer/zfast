import Config from "webpack-chain";
import { Env } from "./constants";
import webpack from "webpack";
import { App } from "@zfast/core";
import type { AsyncSeriesHook } from "kooh";

export interface BaseOpts {
  cwd: string;
  entry: Record<string, string | string[]>;
  hasJsxRuntime?: boolean;
  paths: App["paths"];
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
}

export interface DevOpts extends BaseOpts {
  fastRefresh?: boolean;
}

export type ConfigOpts = Omit<BuildOpts, "watch"> &
  DevOpts & {
    env: Env;
    publicPath: string;
  };

export { webpack };
