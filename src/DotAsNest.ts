import _ from "lodash";
import { info, Log, Rule, warn,  } from "./Shorthand";
import jp from "jsonpath";

export class DotAsNestRule extends Rule {
  run = (obj: object): [object, Log[]] => {
    return applyByRule(obj, this);
  };
  constructor(public applyTo: string, public split: string) {super();}
}
export function transform(keys: string[], value: object,split:string): object {
  let re = { ...value };
  keys.forEach((key) => {
    const v = re[key];
    re = _(re).omit(key) .value()
    re=_(re).set(key.split(split), v).value();
  });
  return re;
}
export function applyByRule(obj: object, rule: DotAsNestRule): [object, Log[]] {
  const paths = jp.paths(obj, rule.applyTo);
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
  rule: DotAsNestRule
): [object, Log[]] {
  const target = jp.value(obj, path);
  if (target && _.isObject(target)) {
    const keys = _.keys(target).filter((key) => key.indexOf(rule.split) > -1);
    if (keys.length > 0) {
      const newTarget = transform(keys, target,rule.split);
      const newObj = { ...obj };
      jp.value(newObj, jp.stringify(path), newTarget);
      return [
        newObj,
        [info(`applied dot as nest shorting - keys=${keys}`, path.toString())],
      ];
    } else {
      return [
        obj,
        [warn(`no keys found to apply dot as nest shorting`, rule.applyTo)],
      ];
    }
  } else {
    return [obj, [warn("target is not a object")]];
  }
}
