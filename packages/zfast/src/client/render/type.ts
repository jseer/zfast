import { AsyncSeriesWaterfallHook, Hook } from "kooh";
import { RouteObject } from "react-router-dom";

export type RouteComponentsById = Record<string, any>;

export interface IRoute {
  id: string;
  path: string;
  children?: IRoute[];
}

export interface IPluginContainerHooks {
  routes: AsyncSeriesWaterfallHook<[RouteObject[]]>;
  routesWithComponents: AsyncSeriesWaterfallHook<
    [
      {
        routes: IRoute[];
        routeComponents: RouteComponentsById;
      }
    ]
  >;
  container: AsyncSeriesWaterfallHook<[React.ReactNode]>;
  loadingComponent: AsyncSeriesWaterfallHook<[React.ReactNode]>;
  [key: string]: Hook<Function>;
}
