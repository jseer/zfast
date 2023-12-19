import { IHookTypes, Hooks } from "kooh";

interface IPluginContainerOpts {
  plugins: Function[];
}

type BaseHooks =
  | "routes"
  | "renderContainerId"
  | "container"
  | "loadingComponent";

class PluginContainer<T extends string = BaseHooks> {
  hooks: Hooks<BaseHooks | T>;
  plugins: Readonly<IPluginContainerOpts["plugins"]>;
  constructor(opts: IPluginContainerOpts) {
    this.plugins = Object.freeze(opts.plugins);
    this.hooks = new Hooks({
      routes: IHookTypes.asyncSeriesWaterfall,
      renderContainerId: IHookTypes.asyncSeriesWaterfall,
      container: IHookTypes.asyncSeriesWaterfall,
      loadingComponent: IHookTypes.asyncSeriesWaterfall,
    });
  }

  async run() {
    return this.plugins.reduce((promise, plugin) => {
      return promise.then((o) => plugin(o));
    }, Promise.resolve(this));
  }
}

export default PluginContainer;
