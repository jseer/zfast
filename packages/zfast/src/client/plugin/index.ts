import { AsyncSeriesWaterfallHook } from "kooh";
import { IPluginContainerHooks } from "../render/type";

interface IPluginContainerOpts {
  plugins: Function[];
}

class PluginContainer {
  hooks: IPluginContainerHooks;
  plugins: Readonly<IPluginContainerOpts["plugins"]>;
  constructor(opts: IPluginContainerOpts) {
    this.plugins = Object.freeze(opts.plugins);
    this.hooks = {
      routes: new AsyncSeriesWaterfallHook(),
      routesWithComponents: new AsyncSeriesWaterfallHook(),
      container: new AsyncSeriesWaterfallHook(),
      loadingComponent: new AsyncSeriesWaterfallHook(),
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

export default PluginContainer;
