import { AsyncSeriesHook, AsyncSeriesWaterfallHook, Hook } from "kooh";
import { RouteObject } from "react-router-dom";
import { IRoute } from "../types";

export type RouteComponentsById = Record<string, any>;

export interface IRouteWithId extends Omit<IRoute, "children" | "wrappers"> {
  id?: number;
  children?: IRouteWithId[];
  wrapperIds?: number[];
}

export interface IPluginContainerHooks {
  routes: AsyncSeriesHook<[RouteObject[]]>;
  routesWithComponents: AsyncSeriesHook<{
    routes: IRouteWithId[];
    routeComponents: RouteComponentsById;
  }>;
  container: AsyncSeriesWaterfallHook<React.ReactNode>;
  loadingComponent: AsyncSeriesWaterfallHook<React.ReactNode>;
  enhancedRender: AsyncSeriesWaterfallHook<() => Promise<void>>;
  [key: string]: Hook<Function>;
}
