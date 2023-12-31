import { AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesWaterfallHook } from "kooh";
import { RouteObject } from "react-router-dom";
import { IRoute } from "../types";

export type RouteComponentsById = Record<string, any>;

export interface IRouteWithId extends Omit<IRoute, "children" | "wrappers"> {
  element?: number;
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
  rootId: AsyncSeriesBailHook<[], string>;
}
