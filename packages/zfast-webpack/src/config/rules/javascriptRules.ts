import Config from "webpack-chain";
import type { ApplyOpts } from "..";

export default function addJavascriptRules(
  allRule: Config.Rule,
  opts: ApplyOpts
) {
  const {
    isEnvProduction,
    isEnvDevelopment,
    paths,
    hasJsxRuntime,
    env,
    fastRefresh,
  } = opts;

  allRule
    .oneOf("javascript")
    .test(/\.(js|mjs|jsx|ts|tsx)$/)
    .include.add(paths.appSrc)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use("babel-loader")
    .loader(require.resolve("babel-loader"))
    .options({
      customize: require.resolve("babel-preset-react-app/webpack-overrides"),
      presets: [
        [
          require.resolve("babel-preset-react-app"),
          {
            runtime: hasJsxRuntime ? "automatic" : "classic",
          },
        ],
      ],
      plugins: [fastRefresh && require.resolve("react-refresh/babel")].filter(
        Boolean
      ),
      cacheDirectory: true,
      cacheCompression: false,
      compact: isEnvProduction,
    });
}
