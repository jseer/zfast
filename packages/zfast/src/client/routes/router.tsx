import React from "react";
import { Router as ReactRouter } from "react-router-dom";
import { History } from "@remix-run/router";

interface IRouterProps {
  basename?: string;
  history: History;
  children?: React.ReactNode;
}
export default function Router({ basename, history, children }: IRouterProps) {
  let [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <ReactRouter
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
      children={children}
    />
  );
}
