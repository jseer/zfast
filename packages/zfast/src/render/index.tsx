import React, { useMemo, Suspense } from "react";
import ReactDOM from "react-dom/client";
import Router from "../routes/router";
import { RouteObject, useRoutes } from "react-router-dom";

function render(opts: any) {
  const { basename, history, routes, routeComponents } = opts;
  function Routes() {
    const transformRoutes = (routes: any) => {
      const routeArr: RouteObject[] = [];
      routes.forEach((item: any) => {
        const Comp = routeComponents[item.id];
        const route: RouteObject = {
          path: item.path,
        };
        if (Comp) {
          route.element = <Comp/>;
        }
        if (item.children) {
          route.children = transformRoutes(item.children);
        }
        routeArr.push(route);
      });
      return routeArr;
    };
    const routeArr = useMemo(() => {
      return transformRoutes(routes);
    }, [routeComponents, routes]);
    return useRoutes(routeArr);
  }
  function App() {
    return (
      <Suspense fallback={<div>loading ...</div>}>
        <Router basename={basename} history={history}>
          <Routes />
        </Router>
      </Suspense>
    );
  }
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(<App />);
}

export { render };
