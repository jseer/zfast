import { loadConfigFromFile, loadEnv, createLogger } from "@zfast/utils";
import getPaths from "./getPaths";
import fs from "fs";

export interface AppOpts {
  cwd: string;
  env: string;
  command: string;
  defaultConfigFiles?: string[];
  configFile?: string;
}

export class App {
  cwd: string;
  env: string;
  opts: AppOpts;
  userConfig: Record<string, any> = {};
  paths: ReturnType<typeof getPaths>;
  pkg: Record<string, any> = {};
  logger: ReturnType<typeof createLogger>;
  constructor(opts: AppOpts) {
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
    this.userConfig = this.getUserConfig();
    this.pkg = require(this.paths.appPackageJson);
    this.init();
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

  getPaths(root: string) {
    return getPaths(root);
  }

  init() {

  }
}
