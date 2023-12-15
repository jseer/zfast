import { getConfig } from "./config";
import { Env } from "./constants";
import webpack from "webpack";
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
import FileSizeReporter, {
  OpaqueFileSizes,
} from "react-dev-utils/FileSizeReporter";
import { BuildOpts } from "./typing";
import getPublicPath from "./utils/getPublishPath";

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;

export async function build(opts: BuildOpts): Promise<{
  stats?: webpack.Stats;
  previousFileSizes: OpaqueFileSizes;
  warnings: string[];
  config: webpack.Configuration;
  closeWatching?: webpack.Watching["close"];
}> {
  const { paths, logger, publicPath: userPublicPath, pkg, hooks } = opts;
  const config = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    paths,
    hasJsxRuntime: opts.hasJsxRuntime,
    pkg,
    logger,
    publicPath: getPublicPath(Env.production, pkg.homepage, userPublicPath),
    hooks,
  });
  const previousFileSizes = await measureFileSizesBeforeBuild(paths.appBuild);
  logger.info("Creating an optimized production build...");
  const compiler = webpack(config);
  return new Promise(async (resolve, reject) => {
    let closeWatching: webpack.Watching["close"];
    async function handler(err: any, stats?: webpack.Stats) {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
          errMessage +=
            "\nCompileError: Begins at CSS selector " +
            err["postcssNode"].selector;
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        } as any);
      } else {
        messages = formatWebpackMessages(
          stats?.toJson({ all: false, warnings: true, errors: true }) as any
        );
      }
      if (messages.errors.length) {
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join("\n\n")));
      }
      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
        config,
        closeWatching,
      };
      return resolve(resolveArgs);
    }

    if (opts.watch) {
      const watching = compiler.watch(config.watchOptions || {}, handler);
      closeWatching = watching.close.bind(watching);
    } else {
      compiler.run(handler);
    }
  });
}
