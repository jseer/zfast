import Config from "webpack-chain";
import type { ApplyOpts } from "..";

export default function addAssetRules(allRule: Config.Rule, opts: ApplyOpts) {
  const { isEnvDevelopment, isEnvProduction } = opts;
  const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
  );
  allRule
    .oneOf("avif")
    .test(/\.avif$/)
    .set("type", "asset")
    .set("mimetype", "image/avif")
    .parser({
      dataUrlCondition: {
        maxSize: imageInlineSizeLimit,
      },
    })
    .end();

  allRule
    .oneOf("image")
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
    .set("type", "asset")
    .parser({
      dataUrlCondition: {
        maxSize: imageInlineSizeLimit,
      },
    });
  allRule
    .oneOf("svg")
    .test(/\.svg$/)
    .use("svg-loader")
    .loader(require.resolve("@svgr/webpack"))
    .options({
      prettier: false,
      svgo: false,
      svgoConfig: {
        plugins: [{ removeViewBox: false }],
      },
      titleProp: true,
      ref: true,
    })
    .loader(require.resolve("file-loader"))
    .options({
      options: {
        name: "static/media/[name].[hash].[ext]",
      },
    })
    .end()
    .set("issuer", {
      and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
    })
    .end();
}
