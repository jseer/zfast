import {
  isObject,
  isArray,
  isString,
  isNumber,
  isNull,
  isUndefined,
} from "./utils";

interface IObject2TplStrOpts {
  filter?(key: string | number | undefined, value: any, obj: any): boolean;
  transform?(
    key: string | number | undefined,
    value: any,
    obj: any
  ): string | void;
}

export function object2TplStr(obj: any, opts: IObject2TplStrOpts = {}) {
  const { filter, transform } = opts;
  let str = "";
  if (isObject(obj)) {
    str += "{";
    for (let key in obj) {
      if (filter && filter(key, obj[key], obj)) continue;
      str +=
        (transform && transform(key, obj[key], obj)) ||
        `'${key}':` + object2TplStr(obj[key], opts);
      str += ",";
    }
    str += "}";
  } else if (isArray(obj)) {
    str += "[";
    obj.forEach((item: any, index: number) => {
      if (filter && filter(index, item, obj)) return;
      str +=
        (transform && transform(index, item, obj)) || object2TplStr(item, opts);
      str += ",";
    });
    str += "]";
  } else {
    if (transform) {
      str += transform(undefined, obj, obj);
    } else {
      if (isNull(obj) || isUndefined(obj)) {
        str += `${obj}`;
      } else {
        str += obj.toString();
      }
    }
  }
  return str;
}
