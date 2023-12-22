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
    useTypeScript,
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
      presets: [
        (isEnvProduction || isEnvDevelopment) && [
          require.resolve("@babel/preset-env"),
          {
            useBuiltIns: "entry",
            corejs: 3,
            exclude: ["transform-typeof-symbol"],
          },
        ],
        [
          require.resolve("@babel/preset-react"),
          {
            development: isEnvDevelopment,
            ...(hasJsxRuntime ? {} : { useBuiltIns: true }),
            runtime: hasJsxRuntime ? "automatic" : "classic",
          },
        ],
        require.resolve("@babel/preset-typescript"),
      ].filter(Boolean),
      plugins: [
        useTypeScript && [
          require.resolve("@babel/plugin-proposal-decorators"),
          false,
        ],
        [
          require("@babel/plugin-transform-class-properties").default,
          {
            loose: true,
          },
        ],
        [
          require("@babel/plugin-transform-private-methods").default,
          {
            loose: true,
          },
        ],
        [
          require("@babel/plugin-transform-private-property-in-object").default,
          {
            loose: true,
          },
        ],
        fastRefresh && require.resolve("react-refresh/babel"),
      ].filter(Boolean),
      overrides: [
        useTypeScript && {
          test: /\.tsx?$/,
          plugins: [
            [
              require.resolve("@babel/plugin-proposal-decorators"),
              { legacy: true },
            ],
          ],
        },
      ].filter(Boolean),
      cacheDirectory: true,
      cacheCompression: false,
      compact: isEnvProduction,
    });
}
