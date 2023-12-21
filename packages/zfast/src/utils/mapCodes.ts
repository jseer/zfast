import { ICodeItem } from "../types";

export function mapCodes(codes: ICodeItem[]) {
  return codes.map((item) => item.code + ";");
}
