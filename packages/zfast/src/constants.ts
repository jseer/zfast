export const DEFAULT_CONFIG_FILES = ["zfast.config.ts", "zfast.config.js"];

export enum Env {
  development = "development",
  production = "production",
}

export const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
export const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;