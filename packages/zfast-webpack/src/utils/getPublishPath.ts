import getPublicUrlOrPath from "react-dev-utils/getPublicUrlOrPath";
import { Env } from "../constants";

function getPublicPath(env: Env, homepage: string, publicPath?: string) {
  return getPublicUrlOrPath(
    env === Env.development,
    homepage,
    process.env.PUBLIC_URL || publicPath
  );
}

export default getPublicPath;
