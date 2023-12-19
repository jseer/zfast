export function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isArray(arr: any) {
  return Array.isArray(arr);
}

export function isNumber(n: any) {
  return typeof n === "number";
}

export function isString(str: string) {
  return typeof str === "string";
}

export function isUndefined(str: any) {
  return str === undefined;
}

export function isNull(str: any) {
  return str === null;
}
