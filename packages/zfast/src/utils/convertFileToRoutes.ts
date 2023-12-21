import { lstat, exists, readdir, Stats } from "fs-extra";
import { resolve, relative } from "path";
import { normalizePath } from "@zfast/utils";
import { IRoute } from "../types";

const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".js", ".jsx"];

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
  function setRoute(
    routeMeta: Omit<IRoute, "path"> & { id: string },
    routes: IRoute[]
  ) {
    const { id, component, children } = routeMeta;
    const path = createPath(id, prefix);
    let route: IRoute = {
      path,
    };
    if (children) {
      route.children = children;
    }
    if (component) {
      route.component = component;
    }
    if (transformRoute) {
      route = transformRoute(route);
    }
    routes.push(route);
    routesIdMap.set(id, route);
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
            setRoute({ id, component: file }, routes);
          }
        }
      }
    }
    return routes;
  }
  const routes = await convert(baseDir);
  return { routes, routesIdMap };
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
