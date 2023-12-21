import { render, PluginContainer } from "zfast";
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
    const opts = {
        historyType: "{{{historyType}}}",
        routes,
        routeComponents,
        basename: "{{{basename}}}",
        pluginContainer,
    }
    await render(opts);
}

bootstrap();

{{{entryFooterCodes}}}
