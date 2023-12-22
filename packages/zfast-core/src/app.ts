import { loadConfigFromFile, loadEnv, createLogger } from "@zfast/utils";
import fs from "fs";
import path from "path";
import { AsyncSeriesWaterfallHook, Hook } from "kooh";
import { Plugin, normalizePlugin, IPlugin } from "./plugin";
import { merge } from "lodash";

export interface AppOpts {
  name: string;
  cwd: string;
  env: string;
  command: string;
  defaultConfigFiles?: string[];
  configFile?: string;
  plugins?: IPlugin<any>[];
}

export interface IPaths {
  dotenv: string;
  appRoot: string;
  appBuild: string;
  appEntry: string;
  appPackageJson: string;
  yarnLockFile: string;
  appSrc: string;
  appTsConfig: string;
  appJsConfig: string;
  appNodeModules: string;
  appTsBuildInfoFile: string;
  appPublic: string;
  appTemp: string;
  [key: string]: string;
}
export interface IHooks {
  config: AsyncSeriesWaterfallHook<[Record<string, any>]>;
  paths: AsyncSeriesWaterfallHook<[IPaths]>;
  [key: string]: Hook;
}

export class App {
  name: string;
  cwd: string;
  env: string;
  opts: AppOpts;
  userConfig: Record<string, any>;
  defaultConfig: Record<string, any> = {};
  config: {
    [key: string]: any;
  } = {};
  paths: IPaths;
  pkg: Record<string, any>;
  logger: ReturnType<typeof createLogger>;
  hooks: IHooks;
  useTypeScript: boolean;
  constructor(opts: AppOpts) {
    this.name = opts.name;
    this.cwd = opts.cwd;
    this.env = opts.env;
    process.env.NODE_ENV = this.env;
    this.opts = opts;
    loadEnv({
      cwd: this.cwd,
      envFile: ".env",
      env: this.env,
      suffix: ["local"],
    });
    this.paths = this.getPaths(fs.realpathSync(this.cwd));
    this.logger = createLogger({ tag: this.opts.command });
    this.pkg = require(this.paths.appPackageJson);
    this.userConfig = this.getUserConfig();
    this.useTypeScript = fs.existsSync(this.paths.appTsConfig);
    this.hooks = {
      config: new AsyncSeriesWaterfallHook(),
      paths: new AsyncSeriesWaterfallHook(),
    };
  }

  getUserConfig() {
    return (
      loadConfigFromFile({
        defaultConfigFiles: this.opts.defaultConfigFiles,
        configRoot: this.cwd,
        configFile: this.opts.configFile,
      }) || {}
    );
  }

  getConfig() {
    return this.userConfig;
  }

  getPaths(root: string) {
    const resolveApp = (relativePath: string) =>
      path.resolve(root, relativePath);
    return {
      dotenv: resolveApp(".env"),
      appRoot: resolveApp("."),
      appBuild: resolveApp(process.env.BUILD_PATH || "dist"),
      appEntry: resolveApp("src/index"),
      appPackageJson: resolveApp("package.json"),
      yarnLockFile: resolveApp("yarn.lock"),
      appSrc: resolveApp("src"),
      appTsConfig: resolveApp("tsconfig.json"),
      appJsConfig: resolveApp("jsconfig.json"),
      appNodeModules: resolveApp("node_modules"),
      appTsBuildInfoFile: resolveApp(
        "node_modules/.cache/tsconfig.tsbuildinfo"
      ),
      appPublic: resolveApp("public"),
      appTemp: resolveApp(`src/.${this.name}`),
    };
  }

  async init() {
    if (fs.existsSync(this.paths.appTemp)) {
      fs.rmSync(this.paths.appTemp, { force: true, recursive: true });
    }
    const plugins = (this.opts.plugins || []).concat(
      this.userConfig.plugins || []
    );
    await this.initPlugins(plugins);
    this.paths = await this.hooks.paths.call(this.paths);
    this.config = merge(
      {},
      this.defaultConfig,
      await this.hooks.config.call(this.userConfig)
    );
  }

  async initPlugins(plugins: IPlugin<any>[]) {
    let i = -1;
    while (++i < plugins.length) {
      const pluginInfo = await normalizePlugin<any>(plugins[i], this.cwd);
      const context = Plugin.createContext<any>(this, pluginInfo);
      const ret = await pluginInfo.plugin(context);
      if (ret?.plugins) {
        await this.initPlugins(ret.plugins);
      }
    }
  }
}
