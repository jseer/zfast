import { build } from "@zfast/webpack";
import { App } from "./app";
import getCwd from "./utils/getCwd";
import fs from "fs-extra";
import {
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
} from "./constants";
import FileSizeReporter from "react-dev-utils/FileSizeReporter";
import printBuildError from "react-dev-utils/printBuildError";
import { BaseOpts } from "./types";

const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

export interface BuildOpts extends BaseOpts {}
export default async function (opts: BuildOpts) {
  const cwd = getCwd(opts.root);
  const app = new App({
    cwd,
    configFile: opts.configFile,
    env: "production",
    command: "build",
  });
  await app.init();

  const { paths, config, logger, hooks } = app;
  try {
    await fs.remove(paths.appBuild);
    const { stats, previousFileSizes, warnings } = await build({
      cwd: app.cwd,
      hasJsxRuntime: app.hasJsxRuntime,
      entry: app.getEntry(),
      paths: app.paths,
      pkg: app.pkg,
      logger,
      publicPath: config.publicPath,
      hooks: {
        chainWebpack: hooks.chainWebpack,
      },
    });
    if (warnings.length) {
      logger.warn("Compiled with warnings.\n");
      console.log(warnings.join("\n\n"));
    } else {
      logger.success("Compiled successfully.\n");
    }

    logger.info("File sizes after gzip:\n");
    printFileSizesAfterBuild(
      // @ts-ignore
      stats,
      previousFileSizes,
      paths.appBuild,
      WARN_AFTER_BUNDLE_GZIP_SIZE,
      WARN_AFTER_CHUNK_GZIP_SIZE
    );
    console.log();
  } catch (err: any) {
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
    if (tscCompileOnError) {
      logger.warn(
        "Compiled with the following type errors (you may want to check these before deploying your app):\n"
      );
      printBuildError(err);
    } else {
      logger.error("Failed to compile.\n");
      printBuildError(err);
      process.exit(1);
    }
  }
}
