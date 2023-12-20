import { normalizePath } from "@zfast/utils";
import { IEntryImport } from "../types";

export function imports2Str(imports: IEntryImport[]) {
  return imports.map((item) => {
    const { source, specifier } = item;
    if (specifier) {
      return `import ${specifier} from '${normalizePath(source)}';`;
    } else {
      return `import '${normalizePath(source)}';`;
    }
  });
}
