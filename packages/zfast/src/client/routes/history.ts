import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from "@remix-run/router";
import { History } from "@remix-run/router";

interface IOpts {
  type: "browser" | "hash" | "memory";
}

let history: History;
function createHistory(opts: IOpts) {
  let historyOpts = opts || { type: "browser " };
  switch (historyOpts.type) {
    case "browser":
      history = createBrowserHistory({ window, v5Compat: true });
      break;
    case "hash":
      history = createHashHistory({ window, v5Compat: true });
      break;
    case "memory":
      history = createMemoryHistory({ v5Compat: true });
      break;
    default:
      throw new Error(`Unsupported history type: ${historyOpts.type}`);
  }
  return history;
}

export { history, createHistory };
