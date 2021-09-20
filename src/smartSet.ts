import _ from "lodash";
import assert from "assert";
export function smartSet(
  obj: any,
  path: string | string[],
  value: any,
  option: { allowOverwrite: boolean; valueHolder?: string }
): object {
  const { allowOverwrite, valueHolder } = option;
  const pathArray: string[] = typeof path === "string" ? path.split(".") : path;
  const longestPath = findLongestMatchPath(obj, pathArray);
  //   console.log('longestPath :>> ', longestPath);
  const theClosestValue = smartGet(obj, longestPath);
  assert(theClosestValue !== undefined);

  if (_.isPlainObject(theClosestValue)) {
    const re = { ...obj };
    _.set(re, path, value);
    return re;
  } else {
    const re = { ...obj };
    if (allowOverwrite) {
      if (_.isArray(theClosestValue)) {
        _.set(re, longestPath, {});
      }
      _.set(re, [...(longestPath ?? []), valueHolder ?? "_$"], theClosestValue);
      _.set(re, pathArray, value);
    } else {
      throw new Error("disallow overwrite - " + longestPath?.toString());
    }
    return re;
  }
  return obj;
}
export function smartGet(obj: any, path: string | string[] | undefined): any {
  if (path === undefined) {
    return obj;
  } else {
    if (
      _.isArray(path) &&
      (path.length === 0 || (path.length === 1 && path[0] === ""))
    ) {
      return obj;
    } else if (_.isString(path) && path === "") {
      return obj;
    } else {
      return _.get(obj, path);
    }
  }
}
export function findLongestMatchPath(
  obj: object,
  path: string[]
): string[] | undefined {
  for (let i = path.length; i > 0; i--) {
    const part = _(path).slice(0, i).value();
    if (_(obj).get(part) !== undefined) {
      return part;
    }
  }
  return [""];
}
