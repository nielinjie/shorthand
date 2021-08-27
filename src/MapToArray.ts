import _ from "lodash";
import { info, Log, warn, Rule } from "./Shorthand";
import jp from "jsonpath";
type StringKeyValueMap<T> = { [key: string]: T };

export class MapToArrayRule extends Rule {
  run = (obj: object): [object, Log[]] => {
    return applyByRule(obj, this);
  };
  constructor(public applyIn: string, public keyOfItem: string) {super();}
}
export function transform(
  valueMap: StringKeyValueMap<any>,
  rule: MapToArrayRule
): any[] {
  return _(valueMap)
    .keys()
    .map((key: string) => ({ ...valueMap[key], [rule.keyOfItem]: key }))
    .value();
}
export function applyByRule(obj: any, rule: MapToArrayRule): [object, Log[]] {
  const paths = jp.paths(obj, rule.applyIn);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    //   console.log("path",path)
    //   console.log(re)
    const forOne = applyByRuleForOneNode(re, path, rule);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  obj: object,
  path: string[],
  rule: MapToArrayRule
): [object, Log[]] {
  const target = jp.value(obj, path);
  if (target && _.isObject(target)) {
    const newTarget = transform(target, rule);
    const newObj = { ...obj };
    jp.value(newObj, jp.stringify(path), newTarget);
    return [newObj, [info(`${path.toString()} is applied map to array`)]];
  } else {
    return [obj, [warn("target is not an object", rule.applyIn)]];
  }
}
