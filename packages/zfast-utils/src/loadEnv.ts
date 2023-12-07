import fs from "fs";

interface EnvOpts {
  envFile: string;
  env?: string;
  suffix?: string[];
}
export default function loadEnv(opts: EnvOpts) {
  const { envFile, env, suffix } = opts;
  const dotenvFiles = getDotEnvFiles(envFile, env, suffix);
  dotenvFiles.forEach((file) => {
    if (fs.existsSync(file!)) {
      require("dotenv-expand")(
        require("dotenv").config({
          path: file,
        })
      );
    }
  });
}

export function getDotEnvFiles(
  envFile: EnvOpts["envFile"],
  env: EnvOpts["env"],
  suffix: EnvOpts["suffix"]
) {
  const dotenvFiles = [envFile, env && `${envFile}.${env}`].filter(Boolean);
  if (suffix) {
    let i = -1,
      j = -1,
      len = dotenvFiles.length,
      sLen = suffix.length;
    while (++i < len) {
      const file = dotenvFiles[i];
      while (++j < sLen) {
        dotenvFiles.push(`${file}.${suffix[j]}`);
      }
    }
  }
  return dotenvFiles.reverse();
}
