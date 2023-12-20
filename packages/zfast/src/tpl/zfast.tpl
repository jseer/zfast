import { render } from "{{{renderPath}}}";
import PluginContainer from "{{{pluginPath}}}";
import { createHistory } from "./core/history";
import { routes, routeComponents } from "./core/routes";
{{#runtimePlugins}}
import plugin_{{{index}}} from "{{{path}}}";
{{/runtimePlugins}}
{{{ entryImports }}}

{{{entryHeaderCodes}}}

async function bootstrap() {
    const pluginContainer = new PluginContainer({
        plugins: [
            {{#runtimePlugins}}
                plugin_{{{index}}},
            {{/runtimePlugins}}
        ]
    });
    await pluginContainer.run();
    const history = createHistory({
        type: "{{historyType}}"
    });
    const opts = {
        history,
        routes,
        routeComponents,
        basename: "{{{basename}}}",
        pluginContainer,
    }
    await render(opts);
}

bootstrap();

{{{entryFooterCodes}}}
