import path from "path";
import { promisify } from "util";
import fs from "fs";
import { build } from "esbuild";
import { createRequire } from "module";
import createDebugger from "./createDebugger";

const promisifiedRealpath = promisify(fs.realpath);
const _require = createRequire(__filename);

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any;
}
interface ILoadConfigFromFile {
  configFile?: string;
  defaultConfigFiles?: string[];
  configRoot?: string;
}

const debug = createDebugger("@zfast/utils:loadConfigFromFile");

const loadConfigFromFile = async <T>({
  configFile,
  defaultConfigFiles,
  configRoot = process.cwd(),
}: ILoadConfigFromFile): Promise<T | null> => {
  let resolvedPath: string | undefined;
  if (configFile) {
    resolvedPath = path.resolve(configFile);
  } else if(defaultConfigFiles) {
    for (const filename of defaultConfigFiles) {
      const filePath = path.resolve(configRoot, filename);
      if (fs.existsSync(filePath)) {
        resolvedPath = filePath;
        break;
      }
    }
  }

  if (!resolvedPath) {
    debug("no config file found.");
    return null;
  }

  const bundled = await bundleConfigFile(resolvedPath);
  const extension = path.extname(resolvedPath);
  const realFileName = await promisifiedRealpath(resolvedPath);
  const loaderExt = extension in _require.extensions ? extension : ".js";
  const defaultLoader = _require.extensions[loaderExt]!;
  _require.extensions[loaderExt] = (module: NodeModule, filename: string) => {
    if (filename === realFileName) {
      (module as NodeModuleWithCompile)._compile(bundled.code, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  delete _require.cache[_require.resolve(resolvedPath)];
  const raw = _require(resolvedPath);
  _require.extensions[loaderExt] = defaultLoader;
  return raw.__esModule ? raw.default : raw;
};

async function bundleConfigFile(
  fileName: string
): Promise<{ code: string; dependencies: string[] }> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    write: false,
    target: ["node18"],
    platform: "node",
    bundle: true,
    format: "cjs",
    metafile: true,
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  };
}

export default loadConfigFromFile;
