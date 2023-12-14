import { render } from "{{{renderPath}}}";
import { createHistory } from "./core/history";
import { routes, routeComponents } from "./core/routes";

const history = createHistory({
    type: "{{historyType}}"
});
const opts = {
    history,
    routes,
    basename: "{{{basename}}}",
    routeComponents,
}

render(opts);