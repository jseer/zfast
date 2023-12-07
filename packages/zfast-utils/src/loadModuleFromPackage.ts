import path from "path";
import fs from "fs";
import createDebugger from "./createDebugger";

const debug = createDebugger("@zfast/utils:loadModuleFromPackage");

const loadModuleFromPackage = (cwd: string, name: string, p: string) => {
  const target = path.resolve(cwd, `./node_modules/${name}`);
  try {
    return require.resolve(p, {
      paths: [fs.existsSync(target) ? fs.realpathSync(target) : target],
    });
  } catch (error) {
    debug(error);
    return "";
  }
};

export default loadModuleFromPackage;
