import { AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesWaterfallHook, Hook } from "kooh";
import { IPluginContainerHooks } from "../types";

interface IPluginContainerOpts {
  plugins: Function[];
}

export interface IClientPluginContext<
  H extends { [key: string]: Hook } = {}
> {
  hooks: PluginContainer["hooks"] & H;
  registerHooks: PluginContainer["registerHooks"];
  registerHook: PluginContainer["registerHook"];
}
export class PluginContainer {
  hooks: IPluginContainerHooks;
  plugins: Readonly<IPluginContainerOpts["plugins"]>;
  constructor(opts: IPluginContainerOpts) {
    this.plugins = Object.freeze(opts.plugins);
    this.hooks = new Proxy<PluginContainer["hooks"]>(
      {
        routes: new AsyncSeriesHook(),
        routesWithComponents: new AsyncSeriesHook(),
        container: new AsyncSeriesWaterfallHook(),
        loadingComponent: new AsyncSeriesWaterfallHook(),
        enhancedRender: new AsyncSeriesWaterfallHook(),
        rootId: new AsyncSeriesBailHook(),
      },
      {
        set() {
          throw new Error("must be use registerHook api");
        },
      }
    );
  }

  async run() {
    await Promise.all(
      this.plugins.map((plugin) => {
        plugin(PluginContainer.createContext(this));
      })
    );
  }

  registerHooks<H extends { [key: string]: Hook }>(hooks: H) {
    for (const name in hooks) {
      this.registerHook(name, hooks[name]);
    }
  }

  registerHook<H extends Hook>(name: string, hook: H) {
    if (this.hooks.hasOwnProperty(name)) {
      throw new Error(`${name} hook already exists`);
    }
    Object.assign(this.hooks, { [name]: hook });
  }

  static createContext(container: PluginContainer): IClientPluginContext {
    return {
      hooks: container.hooks,
      registerHooks: container.registerHooks.bind(this),
      registerHook: container.registerHook.bind(this),
    };
  }
}
