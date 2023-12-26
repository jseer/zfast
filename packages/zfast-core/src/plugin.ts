import { isAbsolute } from "path";
import { resolveAsync, loadConfigFromFile } from "@zfast/utils";
import { App } from "./app";
import assert from "assert";

interface IPluginFn<T extends App, O extends Record<string, any> = {}> {
  (context: IPluginContext<T>, opts?: O): void | {
    plugins: IPlugin<T>[];
  };
}
export type IPlugin<T extends App, O extends Record<string, any> = {}> =
  | string
  | IPluginFn<T, O>
  | [IPluginFn<T, O>, O];
interface IPluginInfo<T extends App> {
  plugin: IPluginFn<T>;
  path?: string;
  opts?: Record<string, any>;
}
export async function normalizePlugin<T extends App>(
  plugin: IPlugin<T>,
  cwd: string
): Promise<IPluginInfo<T>> {
  if (typeof plugin === "string") {
    let resolved;
    try {
      resolved = isAbsolute(plugin)
        ? plugin
        : await resolveAsync(plugin, {
            basedir: cwd,
            extensions: [".tsx", ".ts", ".mjs", ".jsx", ".js"],
          });
    } catch (e: any) {
      e.name = `Invalid plugin ${plugin}, can not be resolved.`;
      throw e;
    }
    const ret = await loadConfigFromFile<IPlugin<T>>({
      configFile: resolved as string,
    });
    assert(
      typeof ret === "function",
      `load ${plugin}(${resolved}) is not a function`
    );
    return { plugin: ret, path: resolved as string };
  } else if (typeof plugin === "function") {
    return { plugin };
  } else if (Array.isArray(plugin)) {
    const res = await normalizePlugin(plugin[0], cwd);
    return {
      plugin: res.plugin,
      opts: plugin[1],
      path: res.path,
    };
  }
  throw new Error(`The plugin type(${typeof plugin}) is not supported`);
}

export interface IPluginContext<T extends App> {
  hooks: T["hooks"];
  paths: T["paths"];
  logger: T["logger"];
  cwd: T["cwd"];
  env: T["env"];
  pkg: T["pkg"];
}

export class Plugin {
  app: App;
  constructor(app: App) {
    this.app = app;
  }
  static createContext<T extends App>(
    app: T,
    pluginInfo: IPluginInfo<T>
  ): IPluginContext<T> {
    const plugin = new Plugin(app);
    const hooks: any = {};
    for (let key in app.hooks) {
      // @ts-ignore
      hooks[key] = app.hooks[key].withOptions({
        pluginInfo: {
          path: pluginInfo.path,
        },
      });
    }
    return {
      hooks,
      paths: app.paths,
      logger: app.logger,
      cwd: app.cwd,
      env: app.env,
      pkg: app.pkg,
    };
  }
}
