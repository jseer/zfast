import { isAbsolute, join } from "path";

export function getCwd(root?: string) {
  const cwd = process.cwd();
  const appRoot = root || process.env.APP_ROOT;
  if (appRoot) {
    return isAbsolute(appRoot) ? appRoot : join(cwd, appRoot);
  }
  return cwd;
}
