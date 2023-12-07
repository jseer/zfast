import fs from "fs";
import crypto from "crypto";
import path from "path";
import { App } from "@zfast/core";
import { Logger } from "@zfast/utils";

function validateKeyAndCerts(
  {
    cert,
    key,
    keyFile,
    crtFile,
  }: {
    cert: Buffer;
    key: Buffer;
    keyFile: string;
    crtFile: string;
  },
  logger: Logger
) {
  let encrypted;
  try {
    encrypted = crypto.publicEncrypt(cert, Buffer.from("test"));
  } catch (err: any) {
    throw new Error(
      `The certificate "${logger.colors.yellow(crtFile)}" is invalid.\n${
        err.message
      }`
    );
  }

  try {
    crypto.privateDecrypt(key, encrypted);
  } catch (err: any) {
    throw new Error(
      `The certificate key "${logger.colors.yellow(keyFile)}" is invalid.\n${
        err.message
      }`
    );
  }
}

// Read file and throw an error if it doesn't exist
function readEnvFile(file: string, type: string, logger: Logger) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${logger.colors.cyan(
        type
      )} in your env, but the file "${logger.colors.yellow(
        file
      )}" can't be found.`
    );
  }
  return fs.readFileSync(file);
}

function getHttpsConfig(logger: Logger, paths: App["paths"]) {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === "true";

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.appRoot, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.appRoot, SSL_KEY_FILE);
    const config = {
      cert: readEnvFile(crtFile, "SSL_CRT_FILE", logger),
      key: readEnvFile(keyFile, "SSL_KEY_FILE", logger),
    };

    validateKeyAndCerts({ ...config, keyFile, crtFile }, logger);
    return config;
  }
  return isHttps;
}

export default getHttpsConfig;
