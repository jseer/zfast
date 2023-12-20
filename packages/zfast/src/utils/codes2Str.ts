import { ICodeItem } from "../types";

export function codes2Str(codes: ICodeItem[]) {
  return codes.map((item) => item.code);
}
