import { normalizePath } from "@zfast/utils";
import { IEntryImport } from "../types";

export function mapImports(imports: IEntryImport[]) {
  return imports.map((item) => {
    const { source, specifier } = item;
    if (specifier) {
      return `import ${specifier} from '${normalizePath(source)}';`;
    } else {
      return `import '${normalizePath(source)}';`;
    }
  });
}
