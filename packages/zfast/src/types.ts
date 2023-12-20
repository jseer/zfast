import { IPlugin } from "@zfast/core";
import {App} from "./app";

export interface BaseOpts {
  root?: string;
  configFile?: string;
}

export interface IEntryImport {
  source: string;
  specifier?: string;
}

export interface ICodeItem {
  code: string;
}

export interface IConfig {
  basename?: string;
  history?: { type: "browser" | "hash" | "memory" };
  publicPath?: string;
  plugins?: IPlugin<App>[];
}
