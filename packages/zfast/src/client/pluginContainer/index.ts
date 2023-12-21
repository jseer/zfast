import { AsyncSeriesHook, AsyncSeriesWaterfallHook } from "kooh";
import { IPluginContainerHooks } from "../types";

interface IPluginContainerOpts {
  plugins: Function[];
}

export class PluginContainer {
  hooks: IPluginContainerHooks;
  plugins: Readonly<IPluginContainerOpts["plugins"]>;
  constructor(opts: IPluginContainerOpts) {
    this.plugins = Object.freeze(opts.plugins);
    this.hooks = {
      routes: new AsyncSeriesHook(),
      routesWithComponents: new AsyncSeriesHook(),
      container: new AsyncSeriesWaterfallHook(),
      loadingComponent: new AsyncSeriesWaterfallHook(),
      enhancedRender: new AsyncSeriesWaterfallHook(),
    };
  }

  async run() {
    await Promise.all(
      this.plugins.map((plugin) => {
        plugin(this);
      })
    );
  }
}
