import Config from "webpack-chain";
import type { ApplyOpts } from "..";
import getCSSModuleLocalIdent from "react-dev-utils/getCSSModuleLocalIdent";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default function addAssetRules(allRule: Config.Rule, opts: ApplyOpts) {
  const {
    isEnvDevelopment,
    isEnvProduction,
    shouldUseSourceMap,
    paths,
    publicPath,
  } = opts;
  const cssRules = [
    { name: "css", test: /\.css(\?.*)?$/ },
    {
      name: "less",
      test: /\.less(\?.*)?$/,
      loader: require.resolve("less-loader"),
      loaderOptions: {
        implementation: require.resolve("less"),
        lessOptions: {
          modifyVars: {},
          javascriptEnabled: true,
        },
      },
    },
    {
      name: "sass",
      test: /\.(sass|scss)(\?.*)?$/,
      loader: require.resolve("sass-loader"),
      loaderOptions: {},
    },
  ];
  for (const { name, loader, loaderOptions, test } of cssRules) {
    const r = allRule.oneOf(name).test(test);
    const autoModulesRules = [
      {
        rule: r.oneOf("css-modules").resourceQuery(/modules/),
        isModules: true,
      },
      { rule: r.oneOf("css").set("sideEffects", true), isModules: false },
    ];
    for (let { rule, isModules } of autoModulesRules) {
      rule
        .when(
          isEnvProduction,
          (rule) => {
            return rule
              .use("mini-css-extract-plugin")
              .loader(MiniCssExtractPlugin.loader)
              .options(
                publicPath.startsWith(".")
                  ? {
                      publicPath: "../../",
                    }
                  : {}
              );
          },
          (rule) => {
            return rule
              .use("style-loader")
              .loader(require.resolve("style-loader"));
          }
        )
        .use("css-loader")
        .loader(require.resolve("css-loader"))
        .options({
          importLoaders: 1,
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          modules: isModules
            ? {
                mode: "local",
                getLocalIdent: getCSSModuleLocalIdent,
              }
            : {
                mode: "icss",
              },
        })
        .end()
        .use("post-loader")
        .loader(require.resolve("postcss-loader"))
        .options({
          postcssOptions: {
            ident: "postcss",
            config: false,
            plugins: [
              require.resolve("postcss-flexbugs-fixes"),
              [
                require.resolve("postcss-preset-env"),
                {
                  autoprefixer: {
                    flexbox: "no-2009",
                  },
                  stage: 3,
                },
              ],
              require.resolve("postcss-normalize"),
            ],
          },
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        });

      if (loader) {
        if (name === "sass") {
          rule
            .use("resolve-url-loader")
            .loader(require.resolve("resolve-url-loader"))
            .options({
              sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
              root: paths.appSrc,
            });
        }
        rule
          .use(loader)
          .loader(typeof loader === "string" ? require.resolve(loader) : loader)
          .options(loaderOptions || {});
      }
    }
  }
}
