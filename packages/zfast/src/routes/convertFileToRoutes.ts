import { lstat, exists, readdir, Stats } from "fs-extra";
import { resolve, relative } from "path";
import { normalizePath } from "@zfast/utils";

const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".js", ".jsx"];

interface IRoute {
  id: string;
  file: string;
  path: string;
  isDir?: boolean;
  children?: IRoute[];
}
interface IOpts {
  baseDir: string;
  prefix?: string;
  extensions?: string[];
  allowEmptyRoutes?: boolean;
  transformRoute?: (route: IRoute) => any;
  exclude?(file: string, stat: Stats): boolean;
}

async function convertFileToRoutes(opts: IOpts) {
  const {
    baseDir,
    prefix = "",
    extensions = DEFAULT_EXTENSIONS,
    allowEmptyRoutes = true,
    transformRoute,
    exclude,
  } = opts;
  const routesIdMap = new Map<string, IRoute>();
  const routesPathMap = new Map<string, IRoute>();
  function setRoute(
    {
      id,
      file,
      isDir,
      children,
    }: {
      id: string;
      file: string;
      isDir?: boolean;
      children?: IRoute[];
    },
    routes: IRoute[]
  ) {
    const path = createPath(id, prefix);
    if (routesPathMap.get(path)) {
      return;
    }
    let route = {
      id,
      file,
      path,
    };
    if (isDir) {
      Object.assign(route, { isDir, children });
    }
    if (transformRoute) {
      route = transformRoute(route);
    }
    routes.push(route);
    routesIdMap.set(id, route);
    routesPathMap.set(path, route);
  }

  async function convert(target: string) {
    const routes: IRoute[] = [];
    if ((await exists(target)) && (await lstat(target)).isDirectory()) {
      for (let filename of await readdir(target)) {
        let file = resolve(target, filename);
        let stat = await lstat(file);
        if (exclude && exclude(file, stat)) continue;
        const relativeId = relative(baseDir, file);
        if (stat.isDirectory()) {
          const children = await convert(file);
          if (!children.length && !allowEmptyRoutes) continue;
          const id = createId(relativeId);
          setRoute(
            {
              id,
              file,
              isDir: true,
              children,
            },
            routes
          );
        } else if (stat.isFile()) {
          const ext = findExtension(extensions, file);
          if (ext) {
            const id = createId(
              relativeId.slice(0, relativeId.length - ext.length)
            );
            setRoute({ id, file }, routes);
          }
        }
      }
    }
    return routes;
  }
  const routes = await convert(baseDir);
  return { routes, routesIdMap, routesPathMap };
}

function createId(p: string) {
  return normalizePath(p);
}

function findExtension(extensions: string[], file: string) {
  let ext: string = "";
  extensions.some((item) => {
    if (file.endsWith(item)) {
      ext = item;
      return true;
    }
  });
  return ext;
}

function createPath(id: string, prefix?: string) {
  const path = ("/" + id)
    .replace(/^\$$/, "*")
    .replace(/(\/|\.)\$$/, "/*")
    .replace(/\/\$/g, "/:")
    .replace(/\./g, "/")
    .replace(/\/(index|README)$/, "");
  return path && prefix ? prefix + path : prefix || path || "/";
}

export default convertFileToRoutes;