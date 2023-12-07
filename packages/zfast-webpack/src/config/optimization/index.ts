import { ApplyOpts } from "..";
import Config from "webpack-chain";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export default function addOptimization(config: Config, opts: ApplyOpts) {
  const { isEnvProduction } = opts;
  config.optimization
    .minimize(isEnvProduction)
    .minimizer("js-minimizer")
    .use(TerserPlugin, [
      {
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      },
    ] as any);

  config.optimization.minimizer(`css-minimizer`).use(CssMinimizerPlugin);
}
