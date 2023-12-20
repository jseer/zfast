import { IHookTypes, Hooks } from "kooh";

interface IPluginContainerOpts {
  plugins: Function[];
}

type BaseHooks =
  | "routes"
  | "routesWithComponents"
  | "container"
  | "loadingComponent";

class PluginContainer<T extends string = BaseHooks> {
  hooks: Hooks<BaseHooks | T>;
  plugins: Readonly<IPluginContainerOpts["plugins"]>;
  constructor(opts: IPluginContainerOpts) {
    this.plugins = Object.freeze(opts.plugins);
    this.hooks = new Hooks({
      routes: IHookTypes.asyncSeriesWaterfall,
      routesWithComponents: IHookTypes.asyncSeriesWaterfall,
      container: IHookTypes.asyncSeriesWaterfall,
      loadingComponent: IHookTypes.asyncSeriesWaterfall,
    });
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
