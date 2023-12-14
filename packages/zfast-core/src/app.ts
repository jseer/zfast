import { loadConfigFromFile, loadEnv, createLogger } from "@zfast/utils";
import fs from "fs";
import path from "path";

export interface AppOpts {
  name: string;
  cwd: string;
  env: string;
  command: string;
  defaultConfigFiles?: string[];
  configFile?: string;
}

export class App {
  name: string;
  cwd: string;
  env: string;
  opts: AppOpts;
  userConfig: Record<string, any> = {};
  config: Record<string, any> = {};
  paths: ReturnType<typeof this.getPaths>;
  pkg: Record<string, any> = {};
  logger: ReturnType<typeof createLogger>;
  constructor(opts: AppOpts) {
    this.name = opts.name;
    this.cwd = opts.cwd;
    this.env = opts.env;
    process.env.NODE_ENV = this.env;
    this.opts = opts;
    this.logger = createLogger({ tag: this.opts.command });
    loadEnv({
      envFile: ".env",
      env: this.env,
      suffix: ["local"],
    });
    this.paths = this.getPaths(fs.realpathSync(this.cwd));
    this.pkg = require(this.paths.appPackageJson);
    this.userConfig = this.getUserConfig();
    this.config = this.getConfig();
  }

  getUserConfig() {
    return (
      loadConfigFromFile({
        defaultConfigFiles: this.opts.defaultConfigFiles,
        configRoot: this.cwd,
        configFile: this.opts.configFile,
      }) || {}
    );
  }
  
  getConfig() {
    return this.userConfig;
  }

  getPaths(root: string) {
    const resolveApp = (relativePath: string) => path.resolve(root, relativePath);
    return {
      dotenv: resolveApp(".env"),
      appRoot: resolveApp("."),
      appBuild: resolveApp(process.env.BUILD_PATH || "dist"),
      appEntry: resolveApp("src/index"),
      appPackageJson: resolveApp("package.json"),
      yarnLockFile: resolveApp("yarn.lock"),
      appSrc: resolveApp("src"),
      appTsConfig: resolveApp("tsconfig.json"),
      appJsConfig: resolveApp("jsconfig.json"),
      appNodeModules: resolveApp("node_modules"),
      appTsBuildInfoFile: resolveApp("node_modules/.cache/tsconfig.tsbuildinfo"),
      appPublic: resolveApp("public"),
      appTemp: resolveApp(`src/.${this.name}`),
    };
  }

  async init() {
    if (fs.existsSync(this.paths.appTemp)) {
      fs.rmSync(this.paths.appTemp, { force: true, recursive: true });
    }
    await this.initPlugins();
  }

  async initPlugins() {}
}
