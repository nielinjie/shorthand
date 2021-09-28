import _ from "lodash";
import { info, Log, warn, Rule, Result } from "./Shorthand";
import jp from "./jsonPath";

import { defaultValueHolder } from ".";
type StringKeyValueMap<T> = { [key: string]: T };

export class MapToArrayRule extends Rule {
  run = (obj: object): Result => {
    return applyByRule(obj, this);
  };
  constructor(
    public applyTo: string,
    public keyPropertyName: string,
    public indexPropertyName: string | undefined = undefined,
    public valueHolder: string | undefined = defaultValueHolder
  ) {
    super();
  }
}
export function transform(
  valueMap: StringKeyValueMap<any>,
  rule: MapToArrayRule,
  valueHolder: string | undefined
): [any[], Log[]] {
  try {
    const re = _(valueMap)
      .keys()
      .map((key: string, index: number) => {
        const value = valueMap[key];
        if (_.isPlainObject(value)) {
          return {
            ...value,
            [rule.keyPropertyName]: key,
            ...(rule.indexPropertyName
              ? { [rule.indexPropertyName]: index }
              : {}),
          };
        } else {
          return {
            [rule.keyPropertyName]: key,
            ...(rule.indexPropertyName
              ? { [rule.indexPropertyName]: index }
              : {}),
            [valueHolder!]: value,
          };
        }
      })
      .value();
    return [re, []];
  } catch (err) {
    return [[], [warn(`MapToArrayRule: ${err}`)]];
  }
}
export function applyByRule(obj: any, rule: MapToArrayRule): Result {
  const paths = jp.paths(obj, rule.applyTo);
  let re = obj;
  let logs: Log[] = [];
  paths.forEach((path) => {
    const forOne = applyByRuleForOneNode(re, path, rule, rule.valueHolder);
    re = forOne[0];
    logs = [...logs, ...forOne[1]];
  });
  return [re, logs];
}
export function applyByRuleForOneNode(
  obj: object,
  path: string[],
  rule: MapToArrayRule,
  valueHolder: string | undefined
): Result {
  const target = jp.value(obj, path);
  if (target && _.isPlainObject(target)) {
    // console.log(target);
    // console.log(_.isObject(target))
    const [newTarget, logs] = transform(target, rule, valueHolder);
    const newObj = { ...obj };
    if (logs.length > 0) {
      return [obj, logs];
    }
    jp.value(newObj, jp.stringify(path), newTarget);
    return [newObj, [info(`${path.toString()} is applied map to array`)]];
  } else {
    return [obj, [warn("target is not an object", path.toString())]];
  }
}
