import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import Router from "../routes/router";
import { RouteObject, useRoutes } from "react-router-dom";
import { PluginContainer } from "../pluginContainer";
import { AppContext } from "./context";
import { RouteComponentsById, IRouteWithId } from "../types";
import { createHistory } from "../routes/history";

interface IRenderOpts {
  basename: string;
  historyType: "browser" | "hash" | "memory";
  routes: IRouteWithId[];
  routeComponents: RouteComponentsById;
  pluginContainer: PluginContainer;
}

async function render(opts: IRenderOpts) {
  const { basename, historyType, pluginContainer, routes, routeComponents } =
    opts;
  const history = createHistory({
    type: historyType,
  });
  await pluginContainer.hooks.routesWithComponents.call({
    routes,
    routeComponents,
  });

  const transformRoutes = (routes: IRenderOpts["routes"]) => {
    const routeArr: RouteObject[] = [];
    routes.forEach((item) => {
      const route: RouteObject = {
        path: item.path,
      };
      let element;
      if (item.id) {
        element = routeComponents[item.id];
      }
      if (item.wrapperIds) {
        let i = item.wrapperIds.length;
        while (--i > -1) {
          const wrapper = routeComponents[item.wrapperIds[i]];
          element = React.createElement(wrapper, null, element);
        }
      }
      if (element) {
        route.element = element;
      }
      if (item.children) {
        route.children = transformRoutes(item.children);
      }
      routeArr.push(route);
    });
    return routeArr;
  };
  const renderRoutes = transformRoutes(routes);
  const [, loading] = await Promise.all([
    pluginContainer.hooks.routes.call(renderRoutes),
    pluginContainer.hooks.loadingComponent.call(<div>loading ...</div>),
  ]);
  function Routes() {
    return useRoutes(renderRoutes);
  }
  function App() {
    return (
      <Suspense fallback={loading}>
        <Router basename={basename} history={history}>
          <Routes />
        </Router>
      </Suspense>
    );
  }

  const container = await pluginContainer.hooks.container.call(<App />);
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  const enhancedRender = await pluginContainer.hooks.enhancedRender.call(
    async () =>
      root.render(
        <AppContext.Provider
          value={{
            basename,
            history,
          }}
        >
          {container}
        </AppContext.Provider>
      )
  );
  await enhancedRender();
}

export { render, AppContext };
