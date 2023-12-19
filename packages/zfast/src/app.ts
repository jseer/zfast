import fs from "fs";
import {
  App as AppCore,
  AppOpts as AppCoreOpts,
  IPaths,
  IHooks,
} from "@zfast/core";
import path from "path";
import {
  normalizePath,
  writeTplFile,
  babelTsToJs,
  object2TplStr,
} from "@zfast/utils";
import convertFileToRoutes from "./utils/convertFileToRoutes";
import { AsyncSeriesHook, AsyncSeriesWaterfallHook } from "tapable";
import defaultConfig from "./utils/defaultConfig";
import type Config from "webpack-chain";
import { Env as WebpackEnv, webpack } from "@zfast/webpack";

class App extends AppCore {
  hasJsxRuntime: boolean;
  paths!: IPaths & { appPages: string; appRuntimePluginPath: string };
  hooks!: IHooks & {
    chainWebpack: AsyncSeriesHook<
      [Config, { env: WebpackEnv; webpack: typeof webpack }]
    >;
    runtimePluginPaths: AsyncSeriesWaterfallHook<[string[]]>;
  };
  constructor(props: Omit<AppCoreOpts, "name">) {
    super({
      ...props,
      name: "zfast",
    });
    this.hasJsxRuntime = (() => {
      if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
        return false;
      }
      try {
        require.resolve("react/jsx-runtime");
        return true;
      } catch (e) {
        return false;
      }
    })();
    this.defaultConfig = defaultConfig;
    this.hooks = {
      ...this.hooks,
      chainWebpack: new AsyncSeriesHook(["memo", "opts"]),
      runtimePluginPaths: new AsyncSeriesWaterfallHook(["paths"]),
    };
  }

  getEntry() {
    return {
      main: this.paths.appEntry,
    };
  }

  getPaths(root: string) {
    const paths = super.getPaths(root);
    return {
      ...paths,
      appPages: path.resolve(paths.appSrc, "pages"),
      appEntry: path.resolve(paths.appTemp, "zfast"),
      appRuntimePluginPath: path.resolve(paths.appSrc, "plugin"),
    };
  }

  async init() {
    await super.init();
    await this.writeTmpFiles();
  }

  getTmpOutputPath(p: string, x: string = "") {
    const useTypeScript = fs.existsSync(this.paths.appTsConfig);
    return path.join(
      this.paths.appTemp,
      `${p}${useTypeScript ? ".ts" : ".js"}${x}`
    );
  }
  getTplInputPath(p: string) {
    return path.resolve(__dirname, "tpl", p);
  }

  async getFileRoutes() {
    const pagesPath = this.paths.appPages;
    const fileRoutes = this.config.routes
      ? this.config.routes
      : (
          await convertFileToRoutes({
            baseDir: pagesPath,
            allowEmptyRoutes: false,
          })
        ).routes;
    const routes = object2TplStr(fileRoutes, {
      filter(key, item, obj) {
        return key === "isDir" || key === "id" || (obj.isDir && key === "file");
      },
      transform(key, file, route) {
        if (key === "file") {
          const p =
            path.isAbsolute(file) || file.startsWith("@/")
              ? file
              : path.join(pagesPath, file);
          const chunkName = "p_" + route.id.replace(/\//g, "_");
          return `'element': React.lazy(() => import(/* webpackChunkName: "${chunkName}" */'${normalizePath(
            p
          )}'))`;
        }
      },
    });
    return {
      routes,
    };
  }

  async transformContent(content: string) {
    const useTypeScript = fs.existsSync(this.paths.appTsConfig);
    return useTypeScript
      ? content
      : ((await babelTsToJs(content))?.code as string);
  }

  async writeTmpFiles() {
    await Promise.all([
      writeTplFile({
        outputPath: this.getTmpOutputPath("core/history"),
        tplPath: this.getTplInputPath("history.tpl"),
        transform: this.transformContent.bind(this),
      }),
      writeTplFile({
        outputPath: this.getTmpOutputPath("core/exports"),
        tplPath: this.getTplInputPath("exports.tpl"),
        transform: this.transformContent.bind(this),
      }),
      (async () => {
        const appRuntimePluginPath = fs.existsSync(
          this.paths.appRuntimePluginPath
        )
          ? this.paths.appRuntimePluginPath
          : null;
        const runtimePluginPaths = await this.hooks.runtimePluginPaths.promise(
          [appRuntimePluginPath].filter(Boolean) as string[]
        );
        await writeTplFile({
          outputPath: this.getTmpOutputPath("zfast"),
          tplPath: this.getTplInputPath("zfast.tpl"),
          transform: this.transformContent.bind(this),
          context: {
            renderPath: path.join(path.dirname(__filename), "client/render"),
            pluginPath: path.join(path.dirname(__filename), "client/plugin"),
            basename: this.config.basename || "/",
            historyType: this.config.history?.type || "browser",
            runtimePlugins: runtimePluginPaths.map((path, index) => ({
              index,
              path,
            })),
          },
        });
      })(),
      (async () => {
        const { routes } = await this.getFileRoutes();
        await writeTplFile({
          outputPath: this.getTmpOutputPath("core/routes"),
          tplPath: this.getTplInputPath("routes.tpl"),
          transform: this.transformContent.bind(this),
          context: {
            routes,
          },
        });
      })(),
    ]);
  }
}

export default App;
