import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes/router";
import { RouteObject, useRoutes } from "react-router-dom";
import { History } from "@remix-run/router";
import PluginContainer from "../plugin";
import { AppContext } from "./context";

interface IRenderOpts {
  basename: string;
  history: History;
  routes: RouteObject[];
  routeComponents: Record<string, React.FC>;
  pluginContainer: PluginContainer;
}

async function render(opts: IRenderOpts) {
  const { basename, history, routes, pluginContainer } = opts;
  const [renderRoutes, loading] = await Promise.all([
    pluginContainer.hooks.call("routes", routes),
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

  const [container, rootId] = await Promise.all([
    pluginContainer.hooks.call("container", <App />),
    pluginContainer.hooks.call("renderContainerId", "root"),
  ]);
  const root = ReactDOM.createRoot(
    document.getElementById(rootId) as HTMLElement
  );
  root.render(
    <AppContext.Provider value={{}}>{container}</AppContext.Provider>
  );
}

export { render };
