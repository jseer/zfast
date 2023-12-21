import { normalizePath } from "@zfast/utils";
import { IAppExports } from "../types";

export function mapExports(exports: IAppExports[]) {
  return exports.map((item) => {
    const { source, specifier } = item;
    if (specifier) {
      return `export ${specifier} from '${normalizePath(source)}';`;
    } else {
      return `export * from '${normalizePath(source)}';`;
    }
  });
}
