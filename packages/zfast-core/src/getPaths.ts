import path from "path";

export default function getPaths(root: string) {
  const resolveApp = (relativePath: string) =>
    path.resolve(root, relativePath);

  return {
    dotenv: resolveApp(".env"),
    appRoot: resolveApp("."),
    appBuild: resolveApp(process.env.BUILD_PATH || "dist"),
    appIndexJs: resolveApp("src/index"),
    appPackageJson: resolveApp("package.json"),
    yarnLockFile: resolveApp('yarn.lock'),
    appSrc: resolveApp("src"),
    appTsConfig: resolveApp("tsconfig.json"),
    appJsConfig: resolveApp("jsconfig.json"),
    appNodeModules: resolveApp("node_modules"),
    appTsBuildInfoFile: resolveApp("node_modules/.cache/tsconfig.tsbuildinfo"),
    appPublic: resolveApp('public'),
  };
}
