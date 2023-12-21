import { IPlugin } from "@zfast/core";
import { App } from "./app";

export interface BaseOpts {
  root?: string;
  configFile?: string;
}

export interface IEntryImport {
  source: string;
  specifier?: string;
}

export interface IAppExports {
  source: string;
  specifier?: string;
}

export interface ICodeItem {
  code: string;
}

export interface IRoute {
  component?: string;
  wrappers?: string[];
  path: string;
  children?: IRoute[];
}

export interface IConfig {
  basename?: string;
  history?: { type: "browser" | "hash" | "memory" };
  publicPath?: string;
  fastRefresh?: boolean;
  routes?: IRoute[];
  plugins?: IPlugin<App>[];
}
