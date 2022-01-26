import _ from "lodash";

export let pathSplit = ".";
export let pathRootName = "$";
export const parentName = "^";
export {default as jsonPath} from './jsonPath'
export function toLodashPath(jsonPath: string[]): string {
  if (_.head(jsonPath) === pathRootName)
    return _.tail(jsonPath).join(pathSplit);
  return jsonPath.join(pathSplit);
}

export function relative(base: string, full: string): string {
  const baseArray = base.split(pathSplit);
  const fullArray = full.split(pathSplit);
  if (startWith(baseArray, fullArray)) {
    return fullArray.slice(baseArray.length).join(pathSplit);
  } else {
    throw new Error("not start with base");
  }
}
export function startWith(small: string[], big: string[]): boolean {
  if (small.length > big.length) return false;
  return _.isEqual(big.slice(undefined, small.length), small);
}
export function last(path: string): string {
  const pathArray = path.split(pathSplit);
  return _.last(pathArray);
}
export function join(
  base: string,
  relative: string,
  ...more: string[]
): string {
  if (more.length > 0) {
    return _.reduce([base, relative, ...more], (a, b) => join(a, b));
  }
  const baseArray = base.split(pathSplit);
  const relativeArray = relative.split(pathSplit);
  const pn = parentNumber(relativeArray);
  //   console.log("pn :>> ", pn);
  if (pn === 0) {
    const fullArray = [...baseArray, ...relativeArray];

    return fullArray.filter((_) => _.trim() !== "").join(pathSplit);
  } else {
    const fullArray = [
      ...baseArray.slice(undefined, baseArray.length - pn),
      ...relativeArray.slice(pn),
    ];
    return fullArray.filter((_) => _.trim() !== "").join(pathSplit);
  }
}
export function insertF(relative: string): (base: string) => string {
  return (base: string) => join(base, "^", relative, last(base));
}
export function joinF(relative: string): (base: string) => string {
  return (base: string) => join(base, relative);
}
export function offset(path: string, num: number = -1): string {
  const pathArray = path.split(pathSplit);
  const re = pathArray.slice(undefined, pathArray.length + num);
  return re.join(pathSplit);
}
function parentNumber(relativeArray: string[]): number {
  if (!supportR(  relativeArray)) throw new Error("not supported relative format");
  return _.filter(relativeArray, (x: string) => x === parentName).length;
}
export function isSupportedRelative(relative: string): boolean {
  const relativeArray = relative.split(pathSplit);
  return supportR(relativeArray);
}
function supportR(relativeArray: string[]): boolean {
  const indexesOfParent = _.indexOf(relativeArray, parentName);
  if (indexesOfParent === -1) return true;
  if (indexesOfParent === 0) return supportR(relativeArray.slice(1));
  return false;
}
