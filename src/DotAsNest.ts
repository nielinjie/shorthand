import _ from "lodash";
import { info, Log, Rule, warn, Result } from "./Shorthand";
import jp from "./jsonPath";
import { defaultValueHolder } from ".";
import { smartSet } from "./smartSet";

export class DotAsNestRule extends Rule {
  run = (obj: object): Result => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public split: string,
    public valueHolder: string | undefined = defaultValueHolder
  ) {
    super();
  }
}
export function transform(
  keys: string[],
  value: object,
  split: string,
  valueHolder: string | undefined
): Result {
  let re = { ...value };
  //console.log('value :>> ', value);
  let logs: Log[] = [];
  keys.forEach((key) => {
    const v = re[key];
    const path = key.split(split);
    re = _.omit(re, key);
    try {
      re = smartSet(re, path, v, {
        allowOverwrite: valueHolder !== undefined,
        valueHolder,
      });
    } catch (e) {
      logs.push(warn("overwrite disallowed", key));
    }
  });
  return [re, logs];
}
export function applyByRule(obj: object, rule: DotAsNestRule): Result {
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
  rule: DotAsNestRule
): Result {
  const target = jp.value(obj, path);
  if (target && _.isPlainObject(target)) {
    const keys = _.keys(target).filter((key) => key.indexOf(rule.split) > -1);
    //console.log('keys :>> ', keys);
    if (keys.length > 0) {
      const [newTarget, logs] = transform(
        keys,
        target,
        rule.split,
        rule.valueHolder
      );
      if (logs.length > 0) {
        return [obj, logs];
      }
      const newObj = { ...obj };

      jp.value(newObj, jp.stringify(path), newTarget);
      //console.log('newTarget :>> ', newTarget);
      return [
        newObj,
        [info(`applied dot as nest shorting - keys=${keys}`, path.toString())],
      ];
    } else {
      return [
        obj,
        [warn(`no keys found to apply dot as nest shorting`, path.toString())],
      ];
    }
  } else {
    return [obj, [warn("target is not a plain object", path.toString())]];
  }
}

