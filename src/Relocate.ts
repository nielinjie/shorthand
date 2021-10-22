import { info, Log, Result, Rule, warn } from "./Shorthand";
import jp from "./jsonPath";
import _ from "lodash";
import { smartSet } from "./smartSet";
import { defaultValueHolder } from ".";
import { toLodashPath } from "./objectPath";

export class RelocateRule extends Rule {
  run = (obj: object): Result => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public fromKey: string,
    public to: string | ((from: string) => string),
    public valueHolder: string | undefined = defaultValueHolder
  ) {
    super();
  }
}
export function applyByRule(obj: any, rule: RelocateRule): Result {
  const paths = jp.paths(obj, rule.applyTo);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    const forOne = applyByRuleForOneNode(re, path, rule);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  obj: object,
  path: string[],
  rule: RelocateRule
): Result {
  const target = jp.value(obj, path);
  if (target && _.isPlainObject(target)) {
    //   console.log('target :>> ', target);
    const [newTarget, logs] = transform(target, rule);
    let newObj = { ...obj };
    if (logs.length > 0) {
      return [obj, logs];
    }
    if (jp.stringify(path) === "$") {
      newObj = newTarget;
    } else {
      jp.value(newObj, jp.stringify(path), newTarget);
    }
    return [newObj, [info(`${path.toString()} is applied map to array`)]];
  } else {
    return [obj, [warn("target is not an object", path.toString())]];
  }
}
export function transform(obj: object, rule: RelocateRule): Result {
//   console.log("obj :>> ", obj);
  const willRelocateKeys = jp.paths(obj, rule.fromKey);
//   console.log("willRelocateKeys :>> ", willRelocateKeys);
  let newObj = { ...obj };
  let logs = [];
  willRelocateKeys.forEach((rJsonKey) => {
    const rKey = toLodashPath(rJsonKey);
    const oldValue = _(newObj).get(rKey);
    newObj = _.omit(newObj, rKey);
    let newPath;
    if (_.isString(rule.to)) {
      newPath = rule.to;
    } else if (_.isFunction(rule.to)) {
      newPath = (rule.to as Function)(rKey);
    }
    newObj = _.omit(newObj, rKey);
    // console.log("newPath :>> ", newPath);
    // console.log("newObj :>> ", newObj);
    // console.log("oldValue :>> ", oldValue);
    newObj = smartSet(newObj, newPath, oldValue, {
      //   allowOverwrite: rule.valueHolder !== undefined,
      allowOverwrite: true,
      //   valueHolder: rule.valueHolder,
      valueHolder: "_$",
    });
    // console.log("newObj :>> ", newObj);
  });
  return [newObj, logs];
}
