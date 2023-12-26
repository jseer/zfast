import fs from "fs";
import {
  App as AppCore,
  AppOpts as AppCoreOpts,
  IPaths,
  IHooks,
} from "@zfast/core";
import path, { isAbsolute, join } from "path";
import { normalizePath, writeTplFile, babelTsToJs } from "@zfast/utils";
import convertFileToRoutes from "./utils/convertFileToRoutes";
import { AsyncSeriesHook, AsyncParallelConcatHook } from "kooh";
import defaultConfig from "./utils/defaultConfig";
import type Config from "webpack-chain";
import { Env as WebpackEnv, webpack } from "@zfast/webpack";
import { mapImports } from "./utils/mapImports";
import { IAppExports, ICodeItem, IConfig, IEntryImport, IRoute } from "./types";
import { mapCodes } from "./utils/mapCodes";
import { DEFAULT_CONFIG_FILES } from "./constants";
import { IRouteWithId } from "./client/types";
import { mapExports } from "./utils/mapExports";
import plugins from "./plugins";

export class App extends AppCore {
  hasJsxRuntime: boolean;
  paths!: IPaths & { appPages: string; appRuntimePluginPath: string };
  hooks!: IHooks & {
    chainWebpack: AsyncSeriesHook<
      [Config, { env: WebpackEnv; webpack: typeof webpack }]
    >;
    runtimePluginPaths: AsyncParallelConcatHook<[], string>;
    entryImports: AsyncParallelConcatHook<[], IEntryImport>;
    entryFooterCodes: AsyncParallelConcatHook<[], ICodeItem>;
    entryHeaderCodes: AsyncParallelConcatHook<[], ICodeItem>;
    appExports: AsyncParallelConcatHook<[], IAppExports>;
  };
  config!: IConfig;
  constructor(props: Omit<AppCoreOpts, "name">) {
    super({
      ...props,
      name: "zfast",
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      plugins,
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
      chainWebpack: new AsyncSeriesHook(),
      runtimePluginPaths: new AsyncParallelConcatHook(),
      entryImports: new AsyncParallelConcatHook(),
      entryHeaderCodes: new AsyncParallelConcatHook(),
      entryFooterCodes: new AsyncParallelConcatHook(),
      exportsCodes: new AsyncParallelConcatHook(),
      appExports: new AsyncParallelConcatHook(),
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
    return path.join(
      this.paths.appTemp,
      `${p}${this.useTypeScript ? ".ts" : ".js"}${x}`
    );
  }
  getTplInputPath(p: string) {
    return path.resolve(__dirname, "tpl", p);
  }

  async getFileRoutes() {
    const pagesPath = this.paths.appPages;
    const routes = this.config.routes
      ? this.config.routes
      : (
          await convertFileToRoutes({
            baseDir: pagesPath,
            allowEmptyRoutes: false,
          })
        ).routes;
    const routeComponents: string[] = ["{"];
    function createPath(component: string) {
      return normalizePath(
        isAbsolute(component) || component.startsWith("@/")
          ? component
          : join(pagesPath, component)
      );
    }
    let componentId = 0;
    const imports: string[] = [];
    const wrapperMap: Map<string, number> = new Map();
    function visitRoutes(routes: IRoute[]) {
      routes.forEach((route) => {
        const { component, path, children, wrappers } = route;
        if (component) {
          const id = componentId++;
          const chunkName =
            "p_" + path.replace(/\//g, "_").replace(/\$|:/g, "$");
          routeComponents.push(
            `${id}: React.lazy(() => import(/* webpackChunkName: "${chunkName}" */"${createPath(
              component
            )}")),`
          );
          (route as IRouteWithId).element = id;
          delete route.component;
        }
        if (wrappers) {
          const wrapperIds: number[] = [];
          (route as IRouteWithId).wrapperIds = wrapperIds;
          wrappers.forEach((wrapper, index) => {
            const p = createPath(wrapper);
            const cacheId = wrapperMap.get(p);
            if (cacheId) {
              wrapperIds[index] = cacheId;
              return;
            }
            const id = componentId++;
            wrapperIds[index] = id;
            imports.push(`import Wrapper_${id} from "${p}";`);
            routeComponents.push(`${id}: Wrapper_${id},`);
            wrapperMap.set(p, id);
          });
          delete route.wrappers;
        }
        if (children) {
          visitRoutes(children);
        }
      });
    }
    visitRoutes(routes);
    routeComponents.push("}");
    return {
      routes: JSON.stringify(routes),
      routeComponents: routeComponents.join("\n"),
      imports: imports.join("\n"),
    };
  }

  async transformContent(content: string) {
    return this.useTypeScript
      ? content
      : ((await babelTsToJs(content))?.code as string);
  }
  async writeTmpFiles() {
    await Promise.all([
      (async () => {
        await writeTplFile({
          outputPath: this.getTmpOutputPath("core/exports"),
          tplPath: this.getTplInputPath("exports.tpl"),
          transform: this.transformContent.bind(this),
          context: {
            appExports: mapExports(await this.hooks.appExports.call()).join(
              "\n"
            ),
          },
        });
      })(),
      (async () => {
        const appRuntimePluginPath = fs.existsSync(
          this.paths.appRuntimePluginPath
        )
          ? this.paths.appRuntimePluginPath
          : "";
        const [
          runtimePluginPaths,
          entryImports,
          entryHeaderCodes,
          entryFooterCodes,
        ] = await Promise.all([
          this.hooks.runtimePluginPaths.call(),
          this.hooks.entryImports.call(),
          this.hooks.entryHeaderCodes.call(),
          this.hooks.entryFooterCodes.call(),
        ]);
        if (appRuntimePluginPath) {
          runtimePluginPaths.push(appRuntimePluginPath);
        }
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
            entryImports: mapImports(entryImports).join("\n"),
            entryFooterCodes: mapCodes(entryFooterCodes).join("\n"),
            entryHeaderCodes: mapCodes(entryHeaderCodes).join("\n"),
          },
        });
      })(),
      (async () => {
        const { routes, routeComponents, imports } = await this.getFileRoutes();
        await writeTplFile({
          outputPath: this.getTmpOutputPath("core/routes"),
          tplPath: this.getTplInputPath("routes.tpl"),
          transform: this.transformContent.bind(this),
          context: {
            routes,
            routeComponents,
            imports,
          },
        });
      })(),
    ]);
  }
}
