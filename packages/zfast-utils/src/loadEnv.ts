import fs from "fs";
import path from "path";

interface EnvOpts {
  envFile: string;
  env?: string;
  suffix?: string[];
  cwd?: string;
}
export default function loadEnv(opts: EnvOpts) {
  const dotenvFiles = getDotEnvFiles(opts);
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

export function getDotEnvFiles(opts: EnvOpts) {
  const { envFile, env, suffix, cwd } = opts;
  let dotenvFiles = [envFile, env && `${envFile}.${env}`].filter(Boolean);
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
  if (cwd) {
    dotenvFiles = dotenvFiles.map((file) => path.join(cwd, file!));
  }
  return dotenvFiles.reverse();
}
