import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes/router";
import { RouteObject, useRoutes } from "react-router-dom";
import { History } from "@remix-run/router";
import PluginContainer from "../plugin";
import { AppContext } from "./context";
import { RouteComponentsById, IRoute } from "./type";

export { RouteComponentsById, IRoute };

interface IRenderOpts {
  basename: string;
  history: History;
  routes: IRoute[];
  routeComponents: RouteComponentsById;
  pluginContainer: PluginContainer;
}

async function render(opts: IRenderOpts) {
  const { basename, history, pluginContainer } = opts;

  const { routes, routeComponents } = await pluginContainer.hooks.call(
    "routesWithComponents",
    {
      routes: opts.routes,
      routeComponents: opts.routeComponents,
    }
  );

  const transformRoutes = (routes: IRenderOpts["routes"]) => {
    const routeArr: RouteObject[] = [];
    routes.forEach((item: any) => {
      const Comp = routeComponents[item.id];
      const route: RouteObject = {
        path: item.path,
      };
      if (Comp) {
        route.element = <Comp />;
      }
      if (item.children) {
        route.children = transformRoutes(item.children);
      }
      routeArr.push(route);
    });
    return routeArr;
  };
  const [renderRoutes, loading] = await Promise.all([
    pluginContainer.hooks.call("routes", transformRoutes(routes)),
    pluginContainer.hooks.call("loadingComponent", <div>loading ...</div>),
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

  const container = await pluginContainer.hooks.call("container", <App />);
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <AppContext.Provider value={{}}>{container}</AppContext.Provider>
  );
}

export { render };
