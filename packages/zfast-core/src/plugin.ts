import { isAbsolute } from "path";
import { resolveAsync, loadConfigFromFile } from "@zfast/utils";
import { App } from "./app";
import assert from "assert";
import { Hook } from "kooh";

export interface IPluginFn<T extends App, O extends Record<string, any> = {}> {
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
  registerHook: Plugin["registerHook"];
  registerHooks: Plugin["registerHooks"];
}

const PLUGIN_INFO = Symbol("#PLUGIN_INFO");
export class Plugin {
  app: App;
  path?: IPluginInfo<App>["path"];
  plugin: IPluginInfo<App>["plugin"];
  opts?: IPluginInfo<App>["opts"];
  constructor(app: App, pluginInfo: IPluginInfo<App>) {
    this.app = app;
    this.path = pluginInfo.path;
    this.plugin = pluginInfo.plugin;
    this.opts = pluginInfo.opts;
  }

  apply() {
    return this.plugin(this.createContext(), this.opts);
  }

  registerHooks<H extends { [key: string]: Hook }>(hooks: H) {
    for (const name in hooks) {
      this.registerHook(name, hooks[name]);
    }
  }

  registerHook<H extends Hook>(name: string, hook: H) {
    if (this.app.hooks.hasOwnProperty(name)) {
      throw new Error(`${name} hook already exists`);
    }
    Object.assign(this.app.hooks, { [name]: hook });
  }

  createContext(): IPluginContext<App> {
    const app = this.app;
    return {
      // todo:
      hooks: new Proxy<App["hooks"]>(app.hooks, {
        set() {
          throw new Error("must be use registerHook api");
        },
      }),
      paths: app.paths,
      logger: app.logger,
      cwd: app.cwd,
      env: app.env,
      pkg: app.pkg,
      registerHook: this.registerHook.bind(this),
      registerHooks: this.registerHooks.bind(this),
    };
  }
}
